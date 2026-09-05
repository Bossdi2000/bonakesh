import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const sb = createClient(url, key)

async function main() {
  // Try a few known tables to see what exists
  for (const table of ["admins", "products", "shops", "transactions", "activity_logs"]) {
    const { data, error } = await sb.from(table).select("id").limit(1)
    if (error) {
      console.log(`${table}: ERROR ${error.message}`)
    } else {
      console.log(`${table}: OK (${data.length} row)`)
    }
  }
}

main().catch((e) => console.log("FAIL", e.message))
