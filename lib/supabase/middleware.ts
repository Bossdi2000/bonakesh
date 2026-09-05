import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip Supabase auth and proceed.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith("/dashboard")

  // Fast auth check WITHOUT a network round-trip: Supabase stores its session
  // in `sb-<ref>-auth-token` cookies. If none are present the visitor is signed
  // out — redirect straight away instead of paying a ~0.5s getUser() call.
  const hasSessionCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"))

  if (isProtected && !hasSessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Session cookie present: let the request through. The dashboard page itself
  // (requireAdmin) validates the token with getUser() and refreshes it when
  // needed, so we don't duplicate that network call on every navigation.
  return supabaseResponse
}
