import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const newPassword = process.argv[2]
  if (!newPassword) {
    console.log("Usage: node scripts/reset-password.mjs <newpassword>")
    process.exit(1)
  }
  const { data, error } = await sb.auth.admin.updateUserById("d6ae17b3-3e9c-4f9e-b9ba-7bf4935b49dd", {
    password: newPassword,
  })
  if (error) {
    console.log("ERROR:", error.message)
    process.exit(1)
  }
  console.log("Password updated for:", data.user.email)
}

main()
