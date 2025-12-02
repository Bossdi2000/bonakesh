import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) redirect("/auth/login")

  const service = createServiceClient()
  const { data: log } = await service
    .from("activity_log")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (!log) redirect("/dashboard/history")

  const { data: admin } = await service
    .from("admins")
    .select("id, full_name")
    .eq("id", log.admin_id)
    .maybeSingle()

  return (
    <div className="p-6">
      <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-white">Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-neutral-700 dark:text-white/80">
          <div><span>ID:</span> {log.id}</div>
          <div><span>Action:</span> {String(log.action_type).replace("_"," ")}</div>
          <div><span>Entity:</span> {log.entity_type} • {log.entity_id}</div>
          <div><span>By:</span> {admin?.full_name || log.admin_id}</div>
          <div><span>At:</span> {new Date(log.created_at).toLocaleString()}</div>
          <div className="mt-2">
            <span>Details:</span>
            <pre className="mt-1 whitespace-pre-wrap break-words bg-[#7a1632]/5 dark:bg-white/5 p-3 rounded text-neutral-900 dark:text-white text-xs">{JSON.stringify(log.details || {}, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
