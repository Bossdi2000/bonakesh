type AnySupabase = {
  from: (table: string) => any
}

/**
 * Returns the sequential receipt number for a transaction (1, 2, 3, ...).
 *
 * The app has no dedicated receipt_no column, so the number is derived from the
 * transaction's position in creation order. Ties on created_at are broken by id,
 * matching the deterministic order of `order("created_at").order("id")`.
 */
export async function getReceiptNumber(supabase: AnySupabase, transactionId: string): Promise<string> {
  if (!transactionId) return ""
  try {
    const { data: tx } = await supabase
      .from("transactions")
      .select("id, created_at")
      .eq("id", transactionId)
      .maybeSingle()
    if (!tx?.created_at) return ""

    const { count: earlier } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .lt("created_at", tx.created_at)

    const { count: tied } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("created_at", tx.created_at)
      .lte("id", tx.id)

    const n = Number(earlier || 0) + Number(tied || 0)
    return n > 0 ? String(n) : ""
  } catch {
    return ""
  }
}
