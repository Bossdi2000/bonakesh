"use client"
import React, { useEffect } from "react"

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

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get("print") === "1") {
        const trigger = () => setTimeout(() => window.print(), 300)
        if (document.readyState === "complete") {
          trigger()
        } else {
          window.addEventListener("load", trigger, { once: true })
        }
      }
    } catch {}
  }, [])

  // Customer Copy (top, wide A4 style)
  const CustomerCopy = (
    <div className="bg-white text-black p-8 border border-blue-700 receipt-container" style={{ minHeight: "100%", width: '100%', maxWidth: 'none' }}>
      <div className="text-[13px] uppercase tracking-wider mb-2 text-right">Customer Copy</div>
      <div className="pb-4 mb-4 border-b-2 border-blue-700">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-blue-700">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-wide text-blue-700">MARSHALL ETHEL NIG. LTD.</div>
              <div className="text-[13px] leading-4 bg-red-700 text-white px-2 py-1 rounded">Dealers on Electronics/Electrical such as: Fridge, TV sets, Plasma, CDs, VCDs, Air conditioners, Generating Sets, Electric Wires, Accessories fittings, etc.</div>
            </div>
          </div>
          <div className="text-center w-full sm:w-auto mt-2 sm:mt-0">
            <div className="block px-2 py-1 rounded-full border border-red-700 text-red-700 font-bold text-[12px] leading-tight max-w-full break-words">CASH/CREDIT SALES INVOICE</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[13px] branch-grid">
          <div>
            <div className="font-bold text-blue-700">HEAD OFFICE</div>
            <div>No. 10 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">08069818905</div>
          </div>
          <div className="text-center">
            <div className="font-bold">Hisense, Panasonic, Haier Thermocool, Firman, LG, Samsung</div>
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-blue-700">BRANCH OFFICE</div>
            <div>No. 9 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">09122430843, 08130087873</div>
          </div>
        </div>
      </div>

      <div className="border border-blue-300 rounded-lg bg-blue-50/50 p-4 mb-6 text-base w-full max-w-2xl mx-auto">
        <div className="mb-2 flex flex-wrap gap-6">
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Customer Name:</span> <span className="font-medium">{customerName || "-"}</span></div>
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Phone:</span> <span className="font-medium">{customerPhone || "-"}</span></div>
        </div>
        <div className="mb-2 flex flex-wrap gap-6">
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Address:</span> <span className="font-medium">{customerAddress || "-"}</span></div>
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Date:</span> <span className="font-medium">{dateStr}</span></div>
        </div>
        <div className="mb-1"><span className="font-bold text-blue-900">Time:</span> <span className="font-medium">{timeStr}</span></div>
        <div className="mt-2 text-[14px]"><span className="font-bold text-blue-900">Handled By:</span> <span className="font-medium">{admin?.full_name || user?.email}</span></div>
      </div>

      <div className="mb-6">
        <table className="w-full text-base border border-blue-700" style={{ borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="text-left py-2 px-2 border-r border-blue-700">Item</th>
              <th className="text-right py-2 px-2 border-r border-blue-700">Qty</th>
              <th className="text-right py-2 px-2 border-r border-blue-700">Price</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-blue-700">
                <td className="py-2 px-2 border-r border-blue-700 break-words">{item.name}</td>
                <td className="text-right py-2 px-2 border-r border-blue-700 num">{item.quantity}</td>
                <td className="text-right py-2 px-2 border-r border-blue-700 num wrap-num">₦{item.price_per_unit.toLocaleString("en-NG")}</td>
                <td className="text-right py-2 px-2 num wrap-num">₦{item.total_price.toLocaleString("en-NG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-blue-700 pt-4 mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total Amount</span>
          <span className="num wrap-num">₦{totalAmount.toLocaleString("en-NG")}</span>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="font-semibold">Payment</span>
          <span className="uppercase">{transaction.payment_method}</span>
        </div>
      </div>

      <div className="border-t border-blue-700 pt-4 mt-4">
        <div className="text-[11px] text-blue-900 mb-3">
          <div className="font-semibold">Goods tested and certified to be in good condition cannot be returned or replaced with effect from the day of purchase.</div>
          <div className="mt-1">Comment:</div>
          <div className="mt-1">NOTE: No warranty on TV Screen.</div>
          <div className="mt-1">Warranty is strictly on REPAIRS by the company not replacement or changing.</div>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-[11px] text-blue-700">
            <div className="font-semibold">Customer's Sign: _______________________</div>
            <div>Thanks for your patronage</div>
            <div>Keep this receipt for your records</div>
          </div>
          <div className="relative w-40 h-28 receipt-stamp">
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
                <text x="100" y="108" textAnchor="middle" fill="#7a1632" fontSize="10">Owner's Sign: _______________________</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )

  // Shop Owner Copy (below, wide A4 style)
  const ShopOwnerCopy = (
    <div className="bg-white text-black p-8 border border-blue-700 receipt-container mt-8" style={{ minHeight: "100%", width: '100%', maxWidth: 'none' }}>
      <div className="text-[13px] uppercase tracking-wider mb-2 text-right">Shop Owner Copy</div>
      <div className="border border-blue-300 rounded-lg bg-blue-50/50 p-4 mb-6 text-base w-full max-w-2xl mx-auto">
        <div className="mb-2 flex flex-wrap gap-6">
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Customer Name:</span> <span className="font-medium">{customerName || "-"}</span></div>
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Phone:</span> <span className="font-medium">{customerPhone || "-"}</span></div>
        </div>
        <div className="mb-2 flex flex-wrap gap-6">
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Address:</span> <span className="font-medium">{customerAddress || "-"}</span></div>
          <div className="mb-1 min-w-[180px]"><span className="font-bold text-blue-900">Date:</span> <span className="font-medium">{dateStr}</span></div>
        </div>
      </div>
      <hr className="border-t-2 border-blue-700 mb-4" />
      <div className="mb-4">
        <table className="w-full text-base border border-blue-700" style={{ borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="text-left py-2 px-2 border-r border-blue-700">Item</th>
              <th className="text-right py-2 px-2 border-r border-blue-700">Qty</th>
              <th className="text-right py-2 px-2 border-r border-blue-700">Price</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-blue-700">
                <td className="py-2 px-2 border-r border-blue-700 break-words">{item.name}</td>
                <td className="text-right py-2 px-2 border-r border-blue-700 num">{item.quantity}</td>
                <td className="text-right py-2 px-2 border-r border-blue-700 num wrap-num">₦{item.price_per_unit.toLocaleString("en-NG")}</td>
                <td className="text-right py-2 px-2 num wrap-num">₦{item.total_price.toLocaleString("en-NG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <div className="font-semibold">Shop Owner's Signature: _______________________</div>
        <div className="font-semibold">Total: ₦{totalAmount.toLocaleString("en-NG")}</div>
      </div>
    </div>
  )

  return (
    <div ref={ref} className="bg-white text-black p-3 sm:p-4 w-full mx-auto receipt-print" style={{ minHeight: "100vh", maxWidth: 'none' }}>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { background: #fff; }
          .receipt-print { max-width: 100% !important; padding: 0 !important; display: block; width: 100%; }
          .receipt-copy { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .receipt-container { max-width: none; width: 100%; }
          .receipt-stamp svg { width: 100%; height: auto; }
          .no-break { page-break-inside: avoid; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          th, td { word-break: break-word; }
          .num { font-variant-numeric: tabular-nums; }
          .wrap-num { white-space: normal; word-break: break-word; overflow-wrap: anywhere; }
          .branch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="receipt-copy no-break">{CustomerCopy}</div>
      <div className="receipt-copy no-break">{ShopOwnerCopy}</div>
    </div>
  )
})

Receipt.displayName = "Receipt"

export default Receipt
