import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const service = createServiceClient()

  let query = service
    .from("activity_log")
    .select("*, admins(id, full_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  if (category === "checkouts") {
    query = query.eq("entity_type", "transaction")
  } else if (category === "inventory") {
    query = query.eq("entity_type", "product")
  } else if (category === "auth") {
    query = query.or("action_type.ilike.%login%,action_type.eq.logout")
  }

  if (q) {
    // Search in various fields
    // Note: searching inside JSONB with ilike is possible with ->> operator
    const sanitized = q.replace(/[%_]/g, "") // basic sanitization
    const orConditions = [
      `action_type.ilike.%${sanitized}%`,
      `entity_type.ilike.%${sanitized}%`,
      `details->>customer_name.ilike.%${sanitized}%`,
      `details->>customer_phone.ilike.%${sanitized}%`,
      `details->>search_text.ilike.%${sanitized}%`,
      `entity_id.eq.${sanitized}`, // exact match for ID
    ]
    
    // For products, we might want to check if the query matches a product name in the details->items array
    // But searching inside a JSON array of objects with ilike is hard in PostgREST.
    // However, for new records, search_text covers it.
    
    query = query.or(orConditions.join(","))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
