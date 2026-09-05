import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

// Called after a successful username+password sign-in.
// For store managers: validates the submitted one-time code, marks it used,
// and confirms the account role. Super admins skip straight through.
export async function POST(req: Request) {
  try {
    const { code } = await req.json().catch(() => ({}))

    const supabaseServer = await createServerClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceClient()
    const { data: admin, error: adminErr } = await service
      .from("admins")
      .select("id, role, status")
      .eq("id", user.id)
      .maybeSingle()
    if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 })
    if (!admin) return NextResponse.json({ error: "Account not found" }, { status: 404 })
    if (admin.status !== "active") return NextResponse.json({ error: "Account suspended" }, { status: 403 })

    // Super admin logs in with just username + password.
    if (admin.role === "super_admin") {
      return NextResponse.json({ ok: true, role: "super_admin" })
    }

    // Store manager must supply a valid, unused token code.
    const submitted = String(code || "").trim().toUpperCase().replace(/\s+/g, "")
    if (!submitted) {
      return NextResponse.json({ error: "Token code is required" }, { status: 400 })
    }

    const { data: tokenRow, error: codeErr } = await service
      .from("admin_token_codes")
      .select("id, code")
      .eq("admin_id", admin.id)
      .eq("code", submitted)
      .is("used_at", null)
      .maybeSingle()
    if (codeErr) return NextResponse.json({ error: codeErr.message }, { status: 500 })
    if (!tokenRow) {
      return NextResponse.json({ error: "Invalid or already-used token code" }, { status: 403 })
    }

    // Consume the code.
    const { error: useErr } = await service
      .from("admin_token_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id)
    if (useErr) return NextResponse.json({ error: useErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, role: "store_manager" })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
