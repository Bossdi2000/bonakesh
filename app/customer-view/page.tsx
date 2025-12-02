import CheckoutLiveView from "../../components/dashboard/checkout-live-view"

export default function CustomerViewPage({ searchParams }: { searchParams: { admin?: string } }) {
  const adminId = searchParams.admin || ""
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0b0c]">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Customer View</h1>
        <p className="text-neutral-600 dark:text-white/70 mb-6">Live checkout feed for display.</p>
        <CheckoutLiveView adminId={adminId} />
      </div>
    </div>
  )
}
