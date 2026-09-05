import { createServiceClient } from "@/lib/supabase/service"
import HistoryContent from "@/components/dashboard/history-content"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function HistoryPage() {
  const { user, admin } = await requireSuperAdmin()

  const service = createServiceClient()
  const { data: rawLogs } = await service
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  const adminIds = Array.from(new Set((rawLogs || []).map((l: any) => l.admin_id)))
  let adminsMap: Record<string, any> = {}
  if (adminIds.length > 0) {
    const { data: adminsList } = await service
      .from("admins")
      .select("id, full_name")
      .in("id", adminIds)
    for (const a of adminsList || []) adminsMap[a.id as string] = a
  }

  const logsRaw = (rawLogs || []).map((l: any) => ({ ...l, admins: adminsMap[l.admin_id] || null }))
  const relatedSet = new Set(["product_restocked", "product_updated"])
  const grouped: any[] = []
  for (const log of logsRaw) {
    const last = grouped[grouped.length - 1]
    if (
      last &&
      last.entity_type === log.entity_type &&
      last.entity_id === log.entity_id &&
      relatedSet.has(String(last.action_type)) &&
      relatedSet.has(String(log.action_type))
    ) {
      const t1 = new Date(last.created_at).getTime()
      const t2 = new Date(log.created_at).getTime()
      if (Math.abs(t1 - t2) <= 10 * 60 * 1000) {
        last.grouped = Array.isArray(last.grouped) ? [...last.grouped, log] : [log]
        continue
      }
    }
    grouped.push(log)
  }

  return <HistoryContent admin={admin} logs={grouped} user={user} />
}
