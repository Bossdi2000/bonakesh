import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load .env.local explicitly (Next.js uses .env.local for local dev)
dotenv.config({ path: ".env.local" })

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith("--")) {
      const key = a.slice(2)
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true"
      out[key] = val
    }
  }
  return out
}

async function main() {
  const { username, password, full_name, role = "super_admin" } = parseArgs()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing env: ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local")
    process.exit(1)
  }

  if (!username || !password || !full_name) {
    console.error("Usage: node scripts/create_admin.mjs --username <u> --password <p> --full_name \"Full Name\" [--role super_admin|store_manager]")
    process.exit(1)
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  // Check if admin already exists
  const { data: existing, error: checkError } = await supabase
    .from("admins")
    .select("id, username")
    .eq("username", username)
    .limit(1)

  if (checkError) {
    console.error("Error checking existing admin:", checkError.message)
    process.exit(1)
  }

  if (existing && existing.length > 0) {
    console.log(`Admin already exists for username '${username}' (id=${existing[0].id}). Skipping.`)
    process.exit(0)
  }

  const tempEmail = `${username}@dev.local`
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: tempEmail,
    password,
    email_confirm: true,
    user_metadata: { username, full_name },
  })

  if (authError) {
    console.error("Error creating auth user:", authError.message)
    process.exit(1)
  }

  const userId = authData?.user?.id
  if (!userId) {
    console.error("User creation failed: no id returned")
    process.exit(1)
  }

  const { error: profileError } = await supabase.from("admins").insert({
    id: userId,
    username,
    full_name,
    role,
    status: "active",
  })

  if (profileError) {
    console.error("Error inserting admins profile:", profileError.message)
    process.exit(1)
  }

  console.log("Admin created:", { id: userId, username, full_name, role })
}

main().catch((e) => {
  console.error("Unexpected error:", e)
  process.exit(1)
})