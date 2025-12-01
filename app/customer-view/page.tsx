import CheckoutLiveView from "../../components/dashboard/checkout-live-view"

export default function CustomerViewPage({ searchParams }: { searchParams: { admin?: string } }) {
  const adminId = searchParams.admin || ""
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Customer View</h1>
        <p className="text-slate-400 mb-6">Live checkout feed for display.</p>
        <CheckoutLiveView adminId={adminId} />
      </div>
    </div>
  )
}