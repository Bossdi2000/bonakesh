import React from "react"

interface ReceiptProps {
  transaction: any
  items: any[]
  admin: any
  user: any
  customerName?: string
  customerAddress?: string
  customerPhone?: string
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, items, admin, user, customerName, customerAddress, customerPhone }, ref) => {
  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)
  const txDate = new Date(transaction.transaction_date)
  const dateStr = txDate.toLocaleDateString()
  const timeStr = txDate.toLocaleTimeString()

  const Copy = (label: string) => (
    <div className="bg-white text-black p-4 sm:p-6 border border-black receipt-container" style={{ minHeight: "100%" }}>
      <div className="text-[11px] uppercase tracking-wider mb-2 text-right">{label}</div>
      <div className="pb-4 mb-4 border-b-2 border-black">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-black">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wide">MARSHALL ETHEL NIG. LTD.</div>
              <div className="text-[11px] leading-4">Dealers on Electrical/Electronics such as: Cable fittings, Accessories, Fridge, TV sets, Plasma, VCDs, Air Conditioners, Generating Sets, etc.</div>
            </div>
          </div>
          <div className="text-center w-full sm:w-auto mt-2 sm:mt-0">
            <div className="block px-2 py-1 rounded-full border border-red-700 text-red-700 font-bold text-[10px] leading-tight max-w-full break-words">CASH/CREDIT SALES INVOICE</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] branch-grid">
          <div>
            <div className="font-bold">HEAD OFFICE</div>
            <div>Hall No. 10 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">08082838408</div>
          </div>
          <div className="text-center">
            <div className="font-bold">Co626565</div>
          </div>
          <div className="sm:text-right">
            <div className="font-bold">BRANCH OFFICE</div>
            <div>No. 9 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">08069818905</div>
          </div>
        </div>
      </div>

      <div className="border-b border-black pb-3 mb-4 text-sm">
        <div className="grid grid-cols-3 gap-2 text-[12px]">
          <div className="col-span-1">
            <div><span className="font-semibold">Date:</span> {dateStr}</div>
            <div><span className="font-semibold">Time:</span> {timeStr}</div>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div><span className="font-semibold">Name:</span> {customerName || "-"}</div>
              <div><span className="font-semibold">Customer Phone:</span> {customerPhone || "-"}</div>
              <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {customerAddress || "-"}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[12px]"><span className="font-semibold">Handled By:</span> {admin?.full_name || user?.email}</div>
      </div>

      <div className="mb-6">
        <table className="w-full text-sm">
          <colgroup>
            <col style={{ width: "52%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-2 break-words">{item.name}</td>
                <td className="text-right py-2 num">{item.quantity}</td>
                <td className="text-right py-2 num wrap-num">₦{item.price_per_unit.toLocaleString("en-NG")}</td>
                <td className="text-right py-2 num wrap-num">₦{item.total_price.toLocaleString("en-NG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black pt-4 mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount</span>
          <span className="num wrap-num">₦{totalAmount.toLocaleString("en-NG")}</span>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="font-semibold">Payment</span>
          <span className="uppercase">{transaction.payment_method}</span>
        </div>
      </div>

      <div className="border-t border-black pt-4 mt-4">
        <div className="flex items-end justify-between">
          <div className="text-[11px] text-gray-700">
            <div>Thanks for your patronage</div>
            <div>Keep this receipt for your records</div>
          </div>
          <div className="relative w-40 h-28">
            <svg viewBox="0 0 200 140" className="w-full h-full">
              <defs>
                <path id="topArc" d="M20,70 A80,55 0 0,1 180,70" />
                <path id="bottomArc" d="M180,70 A80,55 0 0,1 20,70" />
              </defs>
              <ellipse cx="100" cy="70" rx="85" ry="60" fill="none" stroke="#7a1632" strokeWidth="4" />
              <ellipse cx="100" cy="70" rx="75" ry="50" fill="none" stroke="#7a1632" strokeWidth="2" />
              <text fill="#7a1632" fontSize="12" fontWeight="700" letterSpacing="1">
                <textPath href="#topArc" startOffset="5%">MARSHALL ETHEL NIG. LTD.</textPath>
              </text>
              <text fill="#7a1632" fontSize="12" fontWeight="700" letterSpacing="1">
                <textPath href="#bottomArc" startOffset="10%">CONFIRMED CHECKOUT</textPath>
              </text>
              <g>
                <text x="100" y="68" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="800">PAID</text>
                <text x="100" y="88" textAnchor="middle" fill="#374151" fontSize="11">{dateStr}</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div ref={ref} className="bg-white text-black p-3 sm:p-4 max-w-5xl mx-auto receipt-print" style={{ minHeight: "100vh" }}>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { background: #fff; }
          .receipt-print { max-width: 100% !important; padding: 0 !important; display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
          .receipt-copy { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .receipt-container { max-width: 90mm; }
          .receipt-stamp svg { width: 100%; height: auto; }
          .no-break { page-break-inside: avoid; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          th, td { word-break: break-word; }
          .num { font-variant-numeric: tabular-nums; }
          .wrap-num { white-space: normal; word-break: break-word; overflow-wrap: anywhere; }
          .branch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="receipt-copy no-break">{Copy("Customer Copy")}</div>
        <div className="sm:border-l sm:border-dashed sm:border-black sm:pl-3 receipt-copy no-break">{Copy("Shop Owner Copy")}</div>
      </div>
    </div>
  )
})

Receipt.displayName = "Receipt"

export default Receipt
