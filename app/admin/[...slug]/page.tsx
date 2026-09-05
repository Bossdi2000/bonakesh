import { redirect } from "next/navigation"

export default async function AdminCatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const segments = Array.isArray(slug) ? slug : []
  if (segments.length === 0) {
    redirect("/auth/login")
  }

  // Map /admin/* to /dashboard/* with special case for leading 'dashboard'
  if (segments[0] === "dashboard") {
    const rest = segments.slice(1)
    const target = rest.length > 0 ? `/dashboard/${rest.join("/")}` : "/dashboard"
    redirect(target)
  } else {
    redirect(`/dashboard/${segments.join("/")}`)
  }
}