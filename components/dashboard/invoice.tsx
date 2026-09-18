"use client"
import { forwardRef, useEffect, useMemo } from "react"

/* ------------------------------------------------------------------ */
/*  MARSHALL ETHEL NIG. LTD. - TRADITIONAL CASH/CREDIT SALES INVOICE  */
/*  A4 portrait (210mm x 297mm) - faithful to the printed reference.   */
/* ------------------------------------------------------------------ */

const RED = "#c00000"
const BLUE = "#1a3f95"
const INK = "#111111"
const LINE = "#111111"
const STRIPE = "rgba(192, 0, 0, 0.08)"
const ROW_H = "6.3mm"
const BIZ_ROW_H = "4mm"

/* Amount in words (Naira) */
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`
}

/* Covers a full 0-999 group; twoDigits only understands 0-99, which is why
   3-digit groups (e.g. 100,000 -> hundreds group "100") rendered as undefined. */
function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n)
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  return `${ONES[hundreds]} Hundred${rest ? " and " + twoDigits(rest) : ""}`
}

export function amountInWords(amount: number): string {
  if (amount == null || isNaN(amount)) return "Zero Naira"
  const n = Math.round(amount)
  if (n === 0) return "Zero Naira"
  let words = ""
  const billions = Math.floor(n / 1_000_000_000)
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1_000)
  const rest = n % 1_000
  if (billions) words += threeDigits(billions) + " Billion "
  if (millions) words += threeDigits(millions) + " Million "
  if (thousands) words += threeDigits(thousands) + " Thousand "
  if (rest) words += threeDigits(rest)
  return words.trim() + " Naira"
}

const fmt = (n: any) => (n == null ? "" : Number(n).toLocaleString("en-NG"))

/* ------------------------------------------------------------------ */
/*  Brand logos row (small, between the office columns)                */
/* ------------------------------------------------------------------ */
const BRANDS = [
  { name: "LG", src: "/lg-logo.jpg" },
  { name: "SAMSUNG", src: "/samsung-logo.jpg" },
  { name: "SCANFROST", src: "/scanfrost.png" },
  { name: "POLYSTAR", src: "" },
  { name: "MAXI", src: "" },
  { name: "NEXUS", src: "/nexus.png" },
  { name: "BINATONE", src: "/binatone.png" },
  { name: "HISENSE", src: "/hisense-logo.jpg" },
]

function BrandBox({ name, src }: { name: string; src: string }) {
  return (
    <div
      style={{
        width: "12.5mm",
        height: "6mm",
        border: "0.35mm solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      ) : (
        <span style={{ fontSize: "5pt", fontWeight: 700, color: "#000", textAlign: "center", lineHeight: 1 }}>{name}</span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface InvoiceLine {
  qty?: number
  description: string
  mn?: string
  sn?: string
  rate?: number
}

interface InvoiceProps {
  invoiceNo: string | number
  date: Date | string
  customer?: { name?: string; address?: string; phone?: string }
  items: InvoiceLine[]
  deposit?: number
  total?: number
  showBusinessCopy?: boolean
  businessCopyNo?: string | number
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ invoiceNo, date, customer = {}, items = [], deposit = 0, total, showBusinessCopy = true, businessCopyNo }, ref) => {
    const d = useMemo(() => (date ? new Date(date) : new Date()), [date])
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = String(d.getFullYear())

    const rows = items.map((it) => ({
      qty: it.qty ?? 0,
      description: it.description,
      mn: it.mn || "",
      sn: it.sn || "",
      rate: it.rate ?? 0,
      amount: (it.qty ?? 0) * (it.rate ?? 0),
    }))
    const sum = rows.reduce((s, r) => s + r.amount, 0)
    const totalAmount = total != null ? total : sum
    const words = amountInWords(totalAmount)
    const balance = totalAmount - (deposit || 0)

    // Table has 1 header + 9 body rows (1 data + 8 empty) as in the reference
    const BODY_ROWS = 9
    const displayRows: any[] = [...rows]
    while (displayRows.length < BODY_ROWS) displayRows.push(null)

    useEffect(() => {
      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get("print") === "1") {
          const trigger = () => setTimeout(() => window.print(), 300)
          if (document.readyState === "complete") trigger()
          else window.addEventListener("load", trigger, { once: true })
        }
      } catch {}
    }, [])

    const cellStyle: React.CSSProperties = { border: `0.3mm solid ${LINE}`, padding: "1.4mm 1.8mm", fontSize: "8pt" }
    const headerStyle: React.CSSProperties = { border: `0.3mm solid ${LINE}`, padding: "1.4mm 1.8mm", fontSize: "8pt", fontWeight: 700, textAlign: "center" }

    /* The company/business copy is a condensed duplicate; tighter rows keep
       both copies on a single A4 sheet. */
    const bizCellStyle: React.CSSProperties = { border: `0.3mm solid ${LINE}`, padding: "0.4mm 1.5mm", fontSize: "7pt" }
    const bizHeaderStyle: React.CSSProperties = { ...bizCellStyle, fontWeight: 700, textAlign: "center" }

    return (
      <div
        ref={ref}
        className="me-invoice"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
          overflow: "hidden",
          pageBreakInside: "avoid",
          breakInside: "avoid",
          margin: "0 auto",
          background: "#fff",
          color: INK,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "8.5pt",
          lineHeight: 1.25,
          boxSizing: "border-box",
          padding: "3mm 5mm",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @page { size: A4 portrait; margin: 0; }
          html, body { margin: 0; padding: 0; }
          @media print {
            html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; width: 210mm !important; }
            body * { visibility: hidden; }
            .me-invoice, .me-invoice * { visibility: visible; }
            .me-invoice, .me-invoice * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .me-invoice {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              overflow: hidden !important;
              margin: 0 !important;
              box-shadow: none !important;
              padding: 3mm 5mm !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
            }
            .no-print { display: none !important; }
          }
          .me-invoice * { box-sizing: border-box; }
          /* Column tints and brand colors must survive the print pipeline
             (browsers drop backgrounds/colors in print unless told otherwise). */
          .me-invoice, .me-invoice * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        `}</style>

        {/* ============================ MAIN INVOICE ============================ */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

          {/* ---- Header: logo + company name ---- */}
          <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
            <div
              style={{
                width: "15mm",
                height: "15mm",
                border: "0.5mm solid #000",
                overflow: "hidden",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <img src="/logo.jpg" alt="Marshall Ethel Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: "24pt", fontWeight: 900, color: BLUE, letterSpacing: "0.5px", whiteSpace: "nowrap", WebkitTextStroke: "0.4px " + BLUE, marginBottom: "0.5mm" }}>
                MARSHALL ETHEL NIG. LTD.
              </div>
              <div
                style={{
                  margin: "1mm auto 0 auto",
                  maxWidth: "170mm",
                  border: "0.4mm solid " + RED,
                  color: "#000",
                  fontSize: "6.8pt",
                  lineHeight: 1.25,
                  padding: "1mm 2mm",
                  textAlign: "center",
                }}
              >
                Dealers on Televisions, Freezers, Fridge, Air Conditioners, Generators, Speakers, Electric Wires,
                Accessories fittings, Fans, Washing Machines, Gas cookers, Microwaves, etc
              </div>
            </div>
            <div style={{ width: "15mm", flexShrink: 0 }} />
          </div>

          {/* ---- Office columns + small brand logos between ---- */}
          <div style={{ display: "flex", marginTop: "2mm", alignItems: "center" }}>
            <div style={{ fontSize: "7.4pt", lineHeight: 1.1, flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: RED, fontSize: "8pt" }}>HEAD OFFICE:</div>
              <div>No. 10 Oko Road</div>
              <div>Ekwulobia, Aguata L.G.A</div>
              <div>Anambra State</div>
              <div style={{ fontWeight: 700, color: RED }}>08069818905</div>
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.8mm", flexWrap: "nowrap", padding: "0 4mm" }}>
              {BRANDS.map((b) => (
                <BrandBox key={b.name} name={b.name} src={b.src} />
              ))}
            </div>

            <div style={{ fontSize: "7.4pt", lineHeight: 1.1, textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: RED, fontSize: "8pt" }}>BRANCH OFFICE:</div>
              <div>No. 9 Oko Road</div>
              <div>Ekwulobia,</div>
              <div>Aguata L.G.A</div>
              <div>Anambra State</div>
              <div style={{ fontWeight: 700, color: RED }}>08130087873, 09122430843</div>
            </div>
          </div>

          {/* ---- blue divider ---- */}
          <div style={{ marginTop: "2mm", borderTop: "0.7mm solid " + BLUE, width: "100%" }} />

          {/* ---- customer + invoice no + date boxes ---- */}
          <div style={{ display: "flex", marginTop: "2.5mm", gap: "3mm", alignItems: "flex-end" }}>
            <div style={{ flex: 1, fontSize: "8.5pt" }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: "1mm" }}>
                <span style={{ fontWeight: 700, marginRight: "2.5mm" }}>Name:</span>
                <span style={{ borderBottom: "0.35mm solid " + LINE, flex: 1, padding: "0 1mm" }}>{customer.name || ""}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: "1mm" }}>
                <span style={{ fontWeight: 700, marginRight: "2.5mm" }}>Address:</span>
                <span style={{ borderBottom: "0.35mm solid " + LINE, flex: 1, padding: "0 1mm" }}>{customer.address || ""}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, marginRight: "2.5mm" }}>Phone:</span>
                <span style={{ borderBottom: "0.35mm solid " + LINE, flex: 1, padding: "0 1mm" }}>{customer.phone || ""}</span>
              </div>
            </div>

            <div style={{ width: "62mm", flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: "10pt", fontWeight: 700, color: RED, marginBottom: "1.5mm" }}>
                No. {invoiceNo}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1.5mm" }}>
                {[
                  { label: "Day", value: day },
                  { label: "Month", value: month },
                  { label: "Year", value: year },
                ].map((b) => (
                  <div key={b.label} style={{ textAlign: "center", width: "17mm" }}>
                    <div style={{ fontSize: "7pt", fontWeight: 700 }}>{b.label}</div>
                    <div
                      style={{
                        border: "0.35mm solid " + LINE,
                        height: "7.5mm",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9.5pt",
                        fontWeight: 700,
                      }}
                    >
                      {b.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- product table (header + 9 rows, AMOUNT has N/K sub-header) ---- */}
          <div style={{ marginTop: "1.5mm" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "36%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...headerStyle }}>QTY</th>
                  <th rowSpan={2} style={{ ...headerStyle, background: STRIPE }}>DESCRIPTION</th>
                  <th rowSpan={2} style={{ ...headerStyle }}>MN</th>
                  <th rowSpan={2} style={{ ...headerStyle, background: STRIPE }}>SN</th>
                  <th rowSpan={2} style={{ ...headerStyle }}>RATE</th>
                  <th style={{ ...headerStyle }}>AMOUNT</th>
                </tr>
                <tr>
                  <th style={{ ...headerStyle, padding: "0.8mm 1.5mm", background: STRIPE }}>
                    <span>N</span>&nbsp;&nbsp;<span>K</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r: any, i: number) => (
                  <tr key={i} style={{ height: ROW_H }}>
                    <td style={{ ...cellStyle, textAlign: "center" }}>{r ? r.qty : ""}</td>
                    <td style={{ ...cellStyle, textAlign: "left", background: STRIPE }}>{r ? r.description : ""}</td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>{r ? r.mn : ""}</td>
                    <td style={{ ...cellStyle, textAlign: "center", background: STRIPE }}>{r ? r.sn : ""}</td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>{r ? fmt(r.rate) : ""}</td>
                    <td style={{ ...cellStyle, textAlign: "right", background: STRIPE }}>{r ? fmt(r.amount) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- terms (left) + payment boxes (right) on the same row ---- */}
          <div style={{ display: "flex", marginTop: "1.5mm", gap: "4mm", alignItems: "stretch" }}>
            <div style={{ flex: 1, fontSize: "7.2pt", paddingTop: "1mm" }}>
              Goods tested and certified to be in good condition cannot be returned or replaced with effect from the
              day of purchase.
            </div>

            <div style={{ width: "46mm", flexShrink: 0 }}>
              <div style={{ border: "0.35mm solid " + LINE, marginBottom: "1.2mm", display: "flex", minHeight: "7mm" }}>
                <div style={{ width: "24mm", borderRight: "0.35mm solid " + LINE, padding: "1mm 1.5mm", fontWeight: 700, fontSize: "7.8pt" }}>
                  TOTAL Amt.
                </div>
                <div style={{ flex: 1, padding: "1mm 1.5mm", textAlign: "right", fontWeight: 700, fontSize: "8.2pt" }}>
                  {fmt(totalAmount)}
                </div>
              </div>
              <div style={{ border: "0.35mm solid " + LINE, marginBottom: "1.2mm", display: "flex", minHeight: "7mm" }}>
                <div style={{ width: "24mm", borderRight: "0.35mm solid " + LINE, padding: "1mm 1.5mm", fontWeight: 700, fontSize: "7.8pt" }}>
                  Deposit.
                </div>
                <div style={{ flex: 1, padding: "1mm 1.5mm", textAlign: "right", fontSize: "8.2pt" }}>
                  {deposit ? fmt(deposit) : ""}
                </div>
              </div>
              <div style={{ border: "0.35mm solid " + LINE, display: "flex", minHeight: "7mm" }}>
                <div style={{ width: "24mm", borderRight: "0.35mm solid " + LINE, padding: "1mm 1.5mm", fontWeight: 700, fontSize: "7.8pt" }}>
                  Bal.
                </div>
                <div style={{ flex: 1, padding: "1mm 1.5mm", textAlign: "right", fontSize: "8.2pt" }}>
                  {deposit ? fmt(balance) : ""}
                </div>
              </div>
            </div>
          </div>

          {/* ---- comment box (left only) ---- */}
          <div style={{ border: "0.35mm solid " + LINE, marginTop: "1.5mm", padding: "1mm 2mm", fontSize: "7.2pt", width: "70%" }}>
            <div><b>Comment:</b></div>
            <div style={{ marginTop: "0.5mm" }}><b>NOTE:</b> No warranty on TV Screen. (No warranty on Generators)</div>
            <div>Warranty is strictly on REPAIRS by the company not replacement or changing.</div>
          </div>

          {/* ---- value in words ---- */}
          <div style={{ display: "flex", alignItems: "baseline", marginTop: "1.5mm", fontSize: "8.2pt", gap: "2mm" }}>
            <span style={{ fontWeight: 700 }}>Value in words:</span>
            <span style={{ borderBottom: "0.35mm solid " + LINE, flex: 1, padding: "0 1mm" }}>{words}</span>
            <span style={{ fontWeight: 700 }}>Kobo</span>
          </div>

          {/* ---- signatures ---- */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10mm", alignItems: "flex-start" }}>
            <div style={{ width: "78mm", textAlign: "center" }}>
              <div style={{ borderTop: "0.35mm solid " + LINE, marginBottom: "0.8mm", height: "1mm" }} />
              <div style={{ fontSize: "8pt", fontWeight: 700 }}>Customer's Sign</div>
            </div>
            <div style={{ width: "78mm", textAlign: "center" }}>
              <div style={{ borderTop: "0.35mm solid " + LINE, marginBottom: "0.8mm", height: "1mm" }} />
              <div style={{ fontSize: "8pt", fontWeight: 700 }}>Manager's Sign</div>
              <div style={{ fontSize: "7pt" }}>For: MARSHALL ETHEL NIG. LTD.</div>
            </div>
          </div>

          {/* ---- thanks + perforation ---- */}
          <div style={{ marginTop: "auto", paddingTop: "1.5mm" }}>
            <div style={{ textAlign: "center", fontSize: "7.6pt", fontStyle: "italic", marginBottom: "1mm" }}>
              Thanks for your patronage
            </div>
            <div className="no-print" style={{ textAlign: "center", fontSize: "6.5pt", color: "#666", borderTop: "0.2mm dashed #333", paddingTop: "0.6mm" }}>
              <span style={{ fontWeight: 700 }}>CUT HERE - BUSINESS COPY</span>
            </div>
          </div>
        </div>

        {/* ============================ BUSINESS COPY ============================ */}
        {showBusinessCopy && (
          <div style={{ marginTop: "0.5mm", borderTop: "0.2mm dashed #333", paddingTop: "0.5mm" }}>
            <div style={{ fontSize: "12pt", fontWeight: 900, color: BLUE, textAlign: "center" }}>
              MARSHALL ETHEL NIG. LTD. - BUSINESS COPY
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "1mm", fontSize: "7.6pt" }}>
              <div>
                <b>Receipt No:</b> {businessCopyNo ?? invoiceNo}&nbsp;&nbsp;|&nbsp;&nbsp;<b>Date:</b> {day}/{month}/{year}
              </div>
              <div style={{ fontWeight: 700, color: BLUE, fontSize: "10.5pt" }}>₦{fmt(totalAmount)}</div>
            </div>

            <div style={{ marginTop: "0.6mm", fontSize: "7.6pt", lineHeight: 1.15 }}>
              <div><b>Customer:</b> {customer.name || ""}</div>
              <div><b>Phone:</b> {customer.phone || ""}</div>
              <div><b>Address:</b> {customer.address || ""}</div>
            </div>

            {/* duplicate table - same 6 columns, data row only (no empty rows) */}
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", marginTop: "1mm" }}>
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "36%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ ...bizHeaderStyle }}>QTY</th>
                  <th rowSpan={2} style={{ ...bizHeaderStyle, background: STRIPE }}>DESCRIPTION</th>
                  <th rowSpan={2} style={{ ...bizHeaderStyle }}>MN</th>
                  <th rowSpan={2} style={{ ...bizHeaderStyle, background: STRIPE }}>SN</th>
                  <th rowSpan={2} style={{ ...bizHeaderStyle }}>RATE</th>
                  <th style={{ ...bizHeaderStyle }}>AMOUNT</th>
                </tr>
                <tr>
                  <th style={{ ...bizHeaderStyle, padding: "0.5mm 1.5mm", background: STRIPE }}>
                    <span>N</span>&nbsp;&nbsp;<span>K</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ height: BIZ_ROW_H }}>
                    <td style={{ ...bizCellStyle, textAlign: "center" }}>{r.qty}</td>
                    <td style={{ ...bizCellStyle, textAlign: "left", background: STRIPE }}>{r.description}</td>
                    <td style={{ ...bizCellStyle, textAlign: "center" }}>{r.mn}</td>
                    <td style={{ ...bizCellStyle, textAlign: "center", background: STRIPE }}>{r.sn}</td>
                    <td style={{ ...bizCellStyle, textAlign: "right" }}>{fmt(r.rate)}</td>
                    <td style={{ ...bizCellStyle, textAlign: "right", background: STRIPE }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8mm" }}>
              <div style={{ width: "62mm", textAlign: "center" }}>
                <div style={{ borderTop: "0.35mm solid " + LINE, height: "1mm", marginBottom: "0.8mm" }} />
                <div style={{ fontSize: "8pt", fontWeight: 700 }}>Manager's Sign</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

Invoice.displayName = "Invoice"
export default Invoice
