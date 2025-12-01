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
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-300">
          <div><span className="text-slate-400">ID:</span> {log.id}</div>
          <div><span className="text-slate-400">Action:</span> {String(log.action_type).replace("_"," ")}</div>
          <div><span className="text-slate-400">Entity:</span> {log.entity_type} • {log.entity_id}</div>
          <div><span className="text-slate-400">By:</span> {admin?.full_name || log.admin_id}</div>
          <div><span className="text-slate-400">At:</span> {new Date(log.created_at).toLocaleString()}</div>
          <div className="mt-2">
            <span className="text-slate-400">Details:</span>
            <pre className="mt-1 whitespace-pre-wrap break-words bg-slate-700/50 p-3 rounded text-white text-xs">{JSON.stringify(log.details || {}, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}