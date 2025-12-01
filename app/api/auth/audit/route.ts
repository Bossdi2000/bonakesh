import { NextResponse } from "next/server"
import { createClient } from "../../../../lib/supabase/server"
import { createServiceClient } from "../../../../lib/supabase/service"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await req.json()
    const type = String(body?.type || "").toLowerCase()
    const username = String(body?.username || "").trim()
    const reason = String(body?.reason || "").trim()

    const service = createServiceClient()

    const details: Record<string, any> = {}
    if (username) details.username = username
    if (reason) details.reason = reason

    let action = type
    if (action !== "login_success" && action !== "login_failure" && action !== "logout") {
      action = "unknown_auth_event"
    }

    await service.from("activity_log").insert({
      admin_id: user?.id || null,
      action_type: action,
      entity_type: "auth",
      entity_id: user?.id || username || null,
      details,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}