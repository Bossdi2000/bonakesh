import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: Request) {
  return await updateSession(request as any)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
