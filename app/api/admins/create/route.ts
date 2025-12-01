import { NextResponse } from "next/server"
import { createClient as createServerClient } from "../../../../lib/supabase/server"
import { createServiceClient } from "../../../../lib/supabase/service"

export async function POST(req: Request) {
  try {
    const { username, password, full_name, role } = await req.json()

    if (!username || !password || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabaseServer = await createServerClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const service = createServiceClient()
    const { data: currentAdmin, error: roleError } = await service
      .from("admins")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tempEmail = `${username}@devI.local`
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: tempEmail,
      password,
      email_confirm: true,
      user_metadata: { username, full_name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    const { error: profileError } = await service.from("admins").insert({
      id: userId,
      username,
      full_name,
      role: role || "store_manager",
      status: "active",
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "admin_created",
      entity_type: "admin",
      entity_id: userId,
      details: { username, full_name, role: role || "store_manager" },
    })

    return NextResponse.json(
      { id: userId, username, full_name, role: role || "store_manager" },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}