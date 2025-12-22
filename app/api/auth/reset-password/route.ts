import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(req: Request) {
    try {
        const { username, fullName, newPassword } = await req.json()

        if (!username || !fullName || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        const service = createServiceClient()
        const uname = String(username).trim()

        // Check possible email formats
        const candidates = [`${uname}@dev.local`, `${uname}@devI.local`]
        let targetUser = null

        // Find the auth user
        for (const email of candidates) {
            // We can't use getUserByEmail without service role, which we have.
            // But listUsers is safer/easier if getUserByEmail isn't exposed directly on admin client in some versions.
            // Actually, admin.listUsers with filter is good.
            const { data, error } = await service.auth.admin.listUsers()
            if (data?.users) {
                const found = data.users.find(u => u.email === email)
                if (found) {
                    targetUser = found
                    break
                }
            }
        }

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Verify Full Name in admins table
        const { data: adminProfile, error: profileError } = await service
            .from("admins")
            .select("full_name")
            .eq("id", targetUser.id)
            .single()

        if (profileError || !adminProfile) {
            return NextResponse.json({ error: "Profile verification failed" }, { status: 404 })
        }

        // Simple case-insensitive match or exact match?
        // User requested "checks if username is a match with full name". 
        // Assuming they mean verifying the provided full name matches the record.
        const dbName = String(adminProfile.full_name || "").toLowerCase().trim()
        const inputName = String(fullName).toLowerCase().trim()

        if (dbName !== inputName && !dbName.includes(inputName) && !inputName.includes(dbName)) {
            // Being slightly lenient: if exact match fails, strict containment check
            return NextResponse.json({ error: "Identity verification failed (Name mismatch)" }, { status: 400 })
        }

        // Update password
        const { error: updateError } = await service.auth.admin.updateUserById(targetUser.id, {
            password: String(newPassword)
        })

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error("Reset error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
