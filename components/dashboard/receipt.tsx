
"use client"
import React, { useEffect } from "react"

// Helper for image fallback
const SafeImg = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    onError={e => {
      (e.target as HTMLImageElement).src = "/placeholder-logo.png";
    }}
  />
)

interface ReceiptProps {
  transaction: any
  items: any[]
  admin: any
  user: any
  customerName?: string
  customerAddress?: string
  customerPhone?: string
  adminName?: string
}


const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, items, admin, user, customerName, customerAddress, customerPhone, adminName }, ref) => {
  // Minimal validation: require transaction and at least one item
  if (!transaction || !items || items.length === 0) {
    return (
      <div className="text-red-700 font-bold p-8 text-center">Missing receipt data. Please ensure the transaction has items and try again.</div>
    )
  }
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

  const count = items.length
  const density = count > 26 ? "ultra" : count > 20 ? "compressed" : count > 14 ? "compact" : "normal"
  const tableFontSize = density === "ultra" ? 8.25 : density === "compressed" ? 8.75 : density === "compact" ? 9.5 : 10
  const cellPadY = density === "ultra" ? 0.5 : density === "compressed" ? 0.75 : 1
  const headerPadY = density === "ultra" ? 0.5 : density === "compressed" ? 0.75 : 1
  const stampW = density === "ultra" ? 120 : density === "compressed" ? 140 : 160
  const stampH = density === "ultra" ? 80 : density === "compressed" ? 96 : 112

  // Customer Copy (top, wide A4 style)
  const CustomerCopy = (
    <div className="bg-white text-black p-4 border border-blue-700 receipt-container" style={{ minHeight: "100%", width: '100%', maxWidth: 'none' }}>
      <div className="text-[13px] uppercase tracking-wider mb-2 text-right">Customer Copy</div>
      <div className="pb-3 mb-3 border-b-2 border-blue-700">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-blue-700">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-wide text-blue-700">MARSHALL ETHEL NIG. LTD.</div>
              <div className="text-[10px] leading-4 bg-red-700 text-white px-2 py-1 rounded">Dealers on Electronics/Electrical such as: Fridge, TV sets, Plasma, CDs, VCDs, Air conditioners, Generating Sets, Electric Wires, Accessories fittings, etc.</div>
            </div>
          </div>
          <div className="text-center w-full sm:w-auto mt-2 sm:mt-0">
            <div className="block px-2 py-1 rounded-full border border-red-700 text-red-700 font-bold text-[11px] leading-tight max-w-full break-words">CASH/CREDIT SALES INVOICE</div>
          </div>
        </div>
        {/* Company logos row */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-1">
          <SafeImg src="/lg-logo.jpg" alt="LG" className="h-5 w-auto object-contain" />
          <SafeImg src="/pe-logo.jpg" alt="PE" className="h-5 w-auto object-contain" />
          <SafeImg src="/htcool-logo.jpg" alt="Haier Thermocool" className="h-5 w-auto object-contain" />
          <SafeImg src="/samsung-logo.jpg" alt="Samsung" className="h-5 w-auto object-contain" />
          <SafeImg src="/panasonic-logo.jpg" alt="Panasonic" className="h-5 w-auto object-contain" />
          <SafeImg src="/hisense-logo.jpg" alt="Hisense" className="h-5 w-auto object-contain" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] branch-grid">
          <div>
            <div className="font-bold text-blue-700">HEAD OFFICE</div>
            <div>No. 10 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">08069818905</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-blue-700">BRANCH OFFICE</div>
            <div>No. 9 Oko Road</div>
            <div>Ekwulobia, Aguata L.G.A</div>
            <div className="font-bold break-words">09122430843, 08130087873</div>
          </div>
        </div>
      </div>

      {/* Responsive grid for customer/transaction details */}
      <div className="border border-blue-200 rounded bg-blue-50/50 p-2 mb-2 text-[10px] w-full grid grid-cols-1 md:grid-cols-2 gap-2 page-keep details-grid">
        <div className="min-w-[180px]">
          <div className="mb-1"><span className="font-bold text-blue-900">Customer Name:</span> <span className="font-medium">{customerName || "-"}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Phone:</span> <span className="font-medium">{customerPhone || "-"}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Address:</span> <span className="font-medium">{customerAddress || "-"}</span></div>
        </div>
        <div className="min-w-[180px] md:text-right">
          <div className="mb-1"><span className="font-bold text-blue-900">Date:</span> <span className="font-medium">{dateStr}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Time:</span> <span className="font-medium">{timeStr}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Handled By:</span> <span className="font-medium">{adminName || admin?.full_name || user?.email || "-"}</span></div>
        </div>
      </div>

      <div className="mb-4">
        <table className="w-full text-[10px] border border-blue-700 receipt-table" style={{ borderCollapse: 'collapse', fontSize: tableFontSize }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>SN</th>
              <th className="px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>MN</th>
              <th className="text-left px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Item</th>
              <th className="text-right px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Qty</th>
              <th className="text-right px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Price</th>
              <th className="text-right px-1" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-blue-700">
                <td className="px-1 border-r border-blue-700 text-center small-num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.serial_no || ''}</td>
                <td className="px-1 border-r border-blue-700 text-center small-num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.model_no || ''}</td>
                <td className="px-1 border-r border-blue-700 no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.name}</td>
                <td className="text-right px-1 border-r border-blue-700 num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.quantity}</td>
                <td className="text-right px-1 border-r border-blue-700 num no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>₦{item.price_per_unit.toLocaleString("en-NG")}</td>
                <td className="text-right px-1 num no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>₦{item.total_price.toLocaleString("en-NG")}</td>
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
        <div className="text-[10px] text-blue-900 mb-3">
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
          <div className="relative receipt-stamp" style={{ width: `${stampW}px`, height: `${stampH}px` }}>
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
    <div className="bg-white text-black p-4 border border-blue-700 receipt-container mt-4" style={{ minHeight: "100%", width: '100%', maxWidth: 'none' }}>
      <div className="text-[13px] uppercase tracking-wider mb-2 text-right">Shop Owner Copy</div>
      <div className="border border-blue-200 rounded bg-blue-50/50 p-2 mb-2 text-[10px] w-full grid grid-cols-1 md:grid-cols-2 gap-2 page-keep details-grid">
        <div className="min-w-[180px]">
          <div className="mb-1"><span className="font-bold text-blue-900">Customer Name:</span> <span className="font-medium">{customerName}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Phone:</span> <span className="font-medium">{customerPhone}</span></div>
          <div className="mb-1"><span className="font-bold text-blue-900">Address:</span> <span className="font-medium">{customerAddress}</span></div>
        </div>
      </div>
      <hr className="border-t-2 border-blue-700 mb-3" />
      <div className="mb-4">
        <table className="w-full text-[10px] border border-blue-700 receipt-table" style={{ borderCollapse: 'collapse', fontSize: tableFontSize }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>SN</th>
              <th className="px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>MN</th>
              <th className="text-left px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Item</th>
              <th className="text-right px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Qty</th>
              <th className="text-right px-1 border-r border-blue-700" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Price</th>
              <th className="text-right px-1" style={{ paddingTop: headerPadY, paddingBottom: headerPadY }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-blue-700">
                <td className="px-1 border-r border-blue-700 text-center small-num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.serial_no || ''}</td>
                <td className="px-1 border-r border-blue-700 text-center small-num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.model_no || ''}</td>
                <td className="px-1 border-r border-blue-700 no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.name}</td>
                <td className="text-right px-1 border-r border-blue-700 num" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>{item.quantity}</td>
                <td className="text-right px-1 border-r border-blue-700 num no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>₦{item.price_per_unit.toLocaleString("en-NG")}</td>
                <td className="text-right px-1 num no-wrap-ellipsis" style={{ paddingTop: cellPadY, paddingBottom: cellPadY }}>₦{item.total_price.toLocaleString("en-NG")}</td>
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
    <div ref={ref} className={`bg-white text-black p-3 sm:p-4 w-full mx-auto receipt-print density-${density}`} style={{ minHeight: "auto", maxWidth: 'none' }}>
      <style>{`
        @page { size: A4; margin: 8mm; }
        @media print {
          html, body { background: #fff; }
          .receipt-print { max-width: 100% !important; padding: 0 !important; display: block; width: 100%; }
          .receipt-copy { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .receipt-container { max-width: none; width: 100%; }
          .receipt-stamp svg { width: 100%; height: auto; }
          .no-break { page-break-inside: avoid; }
          .page-keep { page-break-inside: avoid; }
          .receipt-print { font-size: 10px; line-height: 1.25; }
          .density-compact .receipt-table { font-size: 9.5px; }
          .density-compressed .receipt-table { font-size: 8.75px; }
          .density-ultra { transform: scale(0.96); transform-origin: top left; }
          .details-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; column-gap: 8px; align-items: start; }
          table { border-collapse: collapse; table-layout: fixed; width: 100%; }
          table, tr, td, th { page-break-inside: avoid; }
          th, td { word-break: break-word; }
          .num { font-variant-numeric: tabular-nums; white-space: nowrap; }
          .no-wrap-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .small-num { font-size: 8.5px; word-break: break-all; }
          .branch-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; align-items: start; }
          .print\\:text-[10px] { font-size: 10px !important; }
          .receipt-copy { page-break-inside: avoid; }
          hr { page-break-after: avoid; margin-top: 8px; margin-bottom: 8px; }
        }
      `}</style>
      <div className="receipt-copy no-break">{CustomerCopy}</div>
      <hr className="my-3 border-t-2 border-blue-700" />
      <div className="receipt-copy no-break">{ShopOwnerCopy}</div>
    </div>
  )
})

Receipt.displayName = "Receipt"

export default Receipt
