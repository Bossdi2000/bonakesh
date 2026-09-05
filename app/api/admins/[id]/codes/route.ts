import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

// Returns the remaining (unused) token codes for an admin account.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabaseServer = await createServerClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceClient()
    const { data: currentAdmin } = await service
      .from("admins")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle()
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: codes, error } = await service
      .from("admin_token_codes")
      .select("code, used_at, created_at")
      .eq("admin_id", id)
      .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ codes: codes || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
