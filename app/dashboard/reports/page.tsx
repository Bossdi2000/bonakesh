import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ReportsContent from "@/components/dashboard/reports-content"
import { getAdminByUserIdServiceRole, getAdminsByIdsServiceRole } from "@/lib/admins/server"
import { getAllAdminsServiceRole } from "@/lib/admins/get-all"

type SearchParams = { period?: string; start?: string; end?: string; method?: string; admin?: string }

function getRange(sp: SearchParams) {
  const period = (sp.period || "monthly").toLowerCase()
  const now = new Date()
  let start: Date
  let end: Date
  if (period === "weekly") {
    // last 7 days
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    start = new Date(end)
    start.setDate(end.getDate() - 7)
  } else if (period === "yearly") {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear() + 1, 0, 1)
  } else if (period === "custom" && sp.start && sp.end) {
    start = new Date(sp.start)
    end = new Date(sp.end)
    // make end exclusive by adding 1 day
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  } else {
    // monthly default
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }
  return { period, start, end }
}

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  let { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).single()
  if (!admin) {
    admin = await getAdminByUserIdServiceRole(user.id)
    if (!admin) {
      redirect("/auth/error")
    }
  }

  if (admin.role !== "super_admin") {
    redirect("/dashboard")
  }

  const { period, start, end } = getRange(searchParams || {})
  const methodFilter = (searchParams?.method || "").toLowerCase()
  const adminFilter = String(searchParams?.admin || "").trim()

  const { data: products } = await supabase.from("products").select("id,name,buying_price")

  let txQuery = supabase
    .from("transactions")
    .select("id,admin_id,total_amount,payment_method,transaction_date")
    .gte("transaction_date", start.toISOString())
    .lt("transaction_date", end.toISOString())
    .order("transaction_date", { ascending: false })
  if (methodFilter) txQuery = txQuery.eq("payment_method", methodFilter)
  if (adminFilter) txQuery = txQuery.eq("admin_id", adminFilter)
  const { data: transactions } = await txQuery

  const txIds = Array.from(new Set((transactions || []).map((t: any) => t.id)))

  const { data: items } = await supabase
    .from("transaction_items")
    .select("transaction_id,product_id,quantity,price_per_unit")
    .in("transaction_id", txIds.length > 0 ? txIds : ["00000000-0000-0000-0000-000000000000"]) // safe fallback

  const buyingPriceMap: Record<string, number> = {}
  const productNameMap: Record<string, string> = {}
  for (const p of products || []) {
    buyingPriceMap[p.id as string] = Number(p.buying_price) || 0
    productNameMap[p.id as string] = p.name as string
  }

  const totalSalesCount = (transactions || []).length
  const totalSalesValue = (transactions || []).reduce((sum, t: any) => sum + Number(t.total_amount), 0)
  const totalBuyingCost = (items || []).reduce((sum, it: any) => {
    const bp = buyingPriceMap[it.product_id as string] || 0
    return sum + bp * Number(it.quantity)
  }, 0)
  const grossProfit = totalSalesValue - totalBuyingCost

  // Top-selling products by quantity
  const quantityByProduct: Record<string, number> = {}
  const revenueByProduct: Record<string, number> = {}
  for (const it of items || []) {
    quantityByProduct[it.product_id as string] = (quantityByProduct[it.product_id as string] || 0) + Number(it.quantity)
    revenueByProduct[it.product_id as string] = (revenueByProduct[it.product_id as string] || 0) + Number(it.price_per_unit) * Number(it.quantity)
  }
  const topProducts = Object.keys(quantityByProduct)
    .map((pid) => ({ id: pid, name: productNameMap[pid] || pid, quantity: quantityByProduct[pid], revenue: revenueByProduct[pid] || 0 }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Most active admin
  const txCountByAdmin: Record<string, number> = {}
  for (const t of transactions || []) {
    txCountByAdmin[t.admin_id as string] = (txCountByAdmin[t.admin_id as string] || 0) + 1
  }
  const adminIds = Object.keys(txCountByAdmin)
  let adminsMap: Record<string, any> = {}
  if (adminIds.length > 0) {
    adminsMap = await getAdminsByIdsServiceRole(adminIds)
  }
  const adminRank = adminIds
    .map((id) => ({ id, name: adminsMap[id]?.full_name || "Unknown", count: txCountByAdmin[id] }))
    .sort((a, b) => b.count - a.count)
  const mostActiveAdmin = adminRank[0] || null

  // Salaries deducted (based on Paid staff), scaled to period
  const { data: staff } = await supabase
    .from("staff")
    .select("id,monthly_salary,employment_status,payment_status")
    .eq("employment_status", "active")
    .eq("payment_status", "paid")

  const days = daysBetween(start, end)
  let salariesDeducted = 0
  const periodLower = period.toLowerCase()
  if (periodLower === "monthly") {
    salariesDeducted = (staff || []).reduce((sum, s: any) => sum + Number(s.monthly_salary || 0), 0)
  } else if (periodLower === "yearly") {
    salariesDeducted = (staff || []).reduce((sum, s: any) => sum + 12 * Number(s.monthly_salary || 0), 0)
  } else if (periodLower === "weekly") {
    salariesDeducted = (staff || []).reduce((sum, s: any) => sum + (Number(s.monthly_salary || 0) / 4.345), 0)
  } else {
    // custom: approximate daily rate from monthly_salary over 30 days
    salariesDeducted = (staff || []).reduce((sum, s: any) => sum + (Number(s.monthly_salary || 0) / 30) * days, 0)
  }

  const netProfit = grossProfit - salariesDeducted

  function txSumInRange(s: Date, e: Date) {
    let q = supabase
      .from("transactions")
      .select("id,total_amount")
      .gte("transaction_date", s.toISOString())
      .lt("transaction_date", e.toISOString())
    if (methodFilter) q = q.eq("payment_method", methodFilter)
    if (adminFilter) q = q.eq("admin_id", adminFilter)
    return q
  }

  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const tomorrowStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)
  const yesterdayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1)

  const now = new Date()
  const weekDay = now.getDay() === 0 ? 7 : now.getDay()
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekDay - 1))
  const nextWeekStart = new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() + 7)
  const lastWeekStart = new Date(thisWeekStart.getFullYear(), thisWeekStart.getMonth(), thisWeekStart.getDate() - 7)

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisYearStart = new Date(now.getFullYear(), 0, 1)
  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1)
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)

  const [{ data: txToday }, { data: txYesterday }, { data: txThisWeek }, { data: txLastWeek }, { data: txThisMonth }, { data: txLastMonth }, { data: txThisYear }, { data: txLastYear }] = await Promise.all([
    txSumInRange(todayStart, tomorrowStart),
    txSumInRange(yesterdayStart, todayStart),
    txSumInRange(thisWeekStart, nextWeekStart),
    txSumInRange(lastWeekStart, thisWeekStart),
    txSumInRange(thisMonthStart, nextMonthStart),
    txSumInRange(lastMonthStart, thisMonthStart),
    txSumInRange(thisYearStart, nextYearStart),
    txSumInRange(lastYearStart, thisYearStart),
  ])

  function agg(rows: any[] | null | undefined) {
    const list = rows || []
    return {
      count: list.length,
      value: list.reduce((s, r: any) => s + Number(r.total_amount || 0), 0),
    }
  }

  const compare = {
    day: { prev: agg(txYesterday), curr: agg(txToday) },
    week: { prev: agg(txLastWeek), curr: agg(txThisWeek) },
    month: { prev: agg(txLastMonth), curr: agg(txThisMonth) },
    year: { prev: agg(txLastYear), curr: agg(txThisYear) },
  }

  const report = {
    period,
    range: { start: start.toISOString(), end: end.toISOString() },
    totals: {
      salesCount: totalSalesCount,
      salesValue: totalSalesValue,
      buyingCost: totalBuyingCost,
      grossProfit,
      salariesDeducted,
      netProfit,
    },
    topProducts,
    adminRank,
    mostActiveAdmin,
    compare,
  }

  let { data: adminsList } = await supabase
    .from("admins")
    .select("id, full_name")
    .order("full_name", { ascending: true })
  if (!adminsList || adminsList.length === 0) {
    const all = await getAllAdminsServiceRole()
    adminsList = (all || []).map((a: any) => ({ id: a.id, full_name: a.full_name }))
  }

  return <ReportsContent admin={admin} user={user} report={report} admins={adminsList || []} />
}