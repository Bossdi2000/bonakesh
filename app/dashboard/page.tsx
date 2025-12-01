import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardContent from "@/components/dashboard/dashboard-content"
import { getAdminByUserIdServiceRole, getAdminsByIdsServiceRole } from "@/lib/admins/server"

export default async function DashboardPage() {
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
    // Fallback to service role query in case RLS/policies prevent reading
    admin = await getAdminByUserIdServiceRole(user.id)
    if (!admin) {
      redirect("/auth/error")
    }
  }

  if (admin.role !== "super_admin") {
    redirect("/dashboard/checkout")
  }

  // Products for stock and profit calculations
  const { data: products } = await supabase
    .from("products")
    .select("id,name,buying_price,selling_price,quantity")

  // Staff salaries
  const { data: staff } = await supabase
    .from("staff")
    .select("id,monthly_salary,employment_status,payment_status")

  // Transactions overview
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id,admin_id,total_amount,payment_method,transaction_date")
    .order("transaction_date", { ascending: false })

  const totalStockValue = (products || []).reduce(
    (sum, p: any) => sum + Number(p.selling_price) * Number(p.quantity),
    0,
  )
  const totalBoughtPrice = (products || []).reduce(
    (sum, p: any) => sum + Number(p.buying_price) * Number(p.quantity),
    0,
  )
  const totalExpectedProfit = totalStockValue - totalBoughtPrice
  const totalSellingPrice = (transactions || []).reduce((sum, t: any) => sum + Number(t.total_amount), 0)
  const totalTransactions = (transactions || []).length
  const totalStaffSalaries = (staff || []).reduce(
    (sum, s: any) => sum + (s.employment_status === "active" ? Number(s.monthly_salary) : 0),
    0,
  )
  const paidSalaries = (staff || []).filter((s: any) => s.payment_status === "paid").length

  // Monthly gross profit (sales − cost of goods sold) and net profit (minus salaries)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const { data: monthTx } = await supabase
    .from("transactions")
    .select("id,total_amount")
    .gte("transaction_date", monthStart.toISOString())
    .lt("transaction_date", monthEnd.toISOString())

  const monthRevenue = (monthTx || []).reduce((sum, t: any) => sum + Number(t.total_amount), 0)
  const monthTxIds = Array.from(new Set((monthTx || []).map((t: any) => t.id)))

  const { data: monthItems } = await supabase
    .from("transaction_items")
    .select("product_id,quantity,transaction_id")
    .in("transaction_id", monthTxIds.length > 0 ? monthTxIds : ["00000000-0000-0000-0000-000000000000"])

  const buyingPriceMap: Record<string, number> = {}
  for (const p of products || []) {
    buyingPriceMap[p.id as string] = Number(p.buying_price) || 0
  }
  const monthCost = (monthItems || []).reduce((sum, it: any) => {
    const bp = buyingPriceMap[it.product_id as string] || 0
    return sum + bp * Number(it.quantity)
  }, 0)

  const monthlyGrossProfit = monthRevenue - monthCost
  const monthlyNetProfit = monthlyGrossProfit - totalStaffSalaries

  // Recent transactions detail list (last 10)
  const recentTx = (transactions || []).slice(0, 10)
  const recentIds = recentTx.map((t: any) => t.id)
  const adminIds = Array.from(new Set(recentTx.map((t: any) => t.admin_id)))

  let adminsMap: Record<string, any> = {}
  if (adminIds.length > 0) {
    adminsMap = await getAdminsByIdsServiceRole(adminIds)
  }

  const { data: txItems } = await supabase
    .from("transaction_items")
    .select("transaction_id,product_id,quantity,price_per_unit")
    .in("transaction_id", recentIds.length > 0 ? recentIds : ["00000000-0000-0000-0000-000000000000"]) // safe fallback

  const productIds = Array.from(new Set((txItems || []).map((it: any) => it.product_id)))
  const { data: productNames } = await supabase
    .from("products")
    .select("id,name")
    .in("id", productIds.length > 0 ? productIds : ["00000000-0000-0000-0000-000000000000"]) // safe fallback

  const productNameMap: Record<string, string> = {}
  for (const p of productNames || []) {
    productNameMap[p.id as string] = p.name as string
  }

  const itemsByTx: Record<string, any[]> = {}
  for (const it of txItems || []) {
    const arr = itemsByTx[it.transaction_id] || []
    arr.push(it)
    itemsByTx[it.transaction_id] = arr
  }

  const recentTransactions = recentTx.map((t: any) => {
    const items = (itemsByTx[t.id] || []).map((it: any) => {
      const name = productNameMap[it.product_id] || "Unknown"
      return `${name} x${it.quantity}`
    })
    const adminName = adminsMap[t.admin_id]?.full_name || "Unknown"
    return {
      id: t.id,
      date: t.transaction_date,
      productsSold: items,
      totalPrice: Number(t.total_amount),
      adminName,
      paymentType: t.payment_method,
    }
  })

  const stats = {
    totalStockValue,
    totalBoughtPrice,
    totalSellingPrice,
    totalExpectedProfit,
    totalTransactions,
    totalStaffSalaries,
    paidSalaries,
    monthlyGrossProfit,
    monthlyNetProfit,
  }

  return (
    <DashboardContent
      user={user}
      admin={admin}
      stats={stats}
      recentTransactions={recentTransactions}
    />
  )
}
