"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Download,
  Printer,
  Share2,
  Lock,
  ExternalLink,
  MapPin,
  Users,
  Briefcase,
  CircleDollarSign,
  AlertTriangle,
  FileText,
  Flag,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "podstawowe" | "finanse" | "ryzyko" | "aktywnosc" | "dotacje"

interface Rep { name: string; fn: string }
interface Shareholder { name: string; shares: string }
interface PkdCode { code: string; description: string; isPrimary: boolean }

export interface FirmaViewProps {
  nip: string
  name: string
  regon: string
  krs: string
  statusKrs: string
  status: "active" | "inactive"
  legalForm: string
  source: "KRS" | "CEIDG"
  rejestr: string
  registrationDate: string
  capital: string
  currency: string
  address: {
    street: string
    city: string
    postalCode: string
    voivodeship: string
    county: string
    commune: string
    full: string
  }
  contact: { phone: string; email: string; website: string }
  representationMethod: string
  representatives: Rep[]
  prokurenci: Rep[]
  radaNadzorcza: Rep[]
  shareholders: Shareholder[]
  pkdCodes: PkdCode[]
  krsLink: string
  ownerName: string
  restrukturyzacja: any
  financialReports: any[]
}

// ─── Formatters ───────────────────────────────────────────────────────────────

// Per brief: capitalize first letter of each word (split/map)
function formatCompanyName(name: string): string {
  if (!name) return ""
  return name
    .toLowerCase()
    .split(" ")
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

// First letter of first word capitalized only
function sentenceCase(s: string | null | undefined): string {
  if (!s) return ""
  const l = s.toLowerCase()
  return l.charAt(0).toUpperCase() + l.slice(1)
}

// DD.MM.YYYY
function fmtDate(s: string | null | undefined): string {
  if (!s) return ""
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
}

// "5 000 PLN"
function fmtCapital(amount: string, currency: string): string {
  const n = Number(amount)
  if (!amount || isNaN(n)) return ""
  return `${n.toLocaleString("pl-PL")} ${currency || "PLN"}`
}

// Fix common address formatting artifacts
function fmtAddress(s: string | null | undefined): string {
  if (!s) return ""
  let r = s.toLowerCase().replace(/\s+\//g, "/")
  r = r.replace(/,\s*[\p{L}\s-]+?,\s*(\d{2}-\d{3})/u, ", $1")
  r = r.replace(/\bul\.\s+(\p{L})/gu, (_, l) => "ul. " + l.toUpperCase())
  r = r.replace(/(\d{2}-\d{3}\s+)(\p{L})/gu, (_, code, l) => code + l.toUpperCase())
  return r.replace(/^(\p{L})/u, l => l.toUpperCase())
}

// Names with * are already masked — show as-is; others get title-case
function fmtPerson(name: string): string {
  if (!name) return ""
  if (name.includes("*")) return name
  return name
    .toLowerCase()
    .replace(/\b\p{L}/gu, c => c.toUpperCase())
}

// Parse "50%" or "50 udziałów" → number
function parsePct(s: string): number {
  const pct = s.match(/(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return parseFloat(pct[1].replace(",", "."))
  const num = s.match(/(\d+)/)
  return num ? parseFloat(num[1]) : 0
}

function maskPhone(p: string): string {
  const d = p.replace(/\D/g, "")
  return d.length >= 9 ? `+48 ${d.slice(-9, -6)} *** ***` : "+48 *** *** ***"
}

function maskEmail(e: string): string {
  const [local = "", domain = ""] = e.split("@")
  const parts = domain.split(".")
  return `${local[0] ?? "k"}***@${parts[0]?.[0] ?? "f"}***.${parts.slice(1).join(".")}`
}

function maskWebsite(w: string): string {
  const clean = w.replace(/^https?:\/\//, "").replace(/^www\./, "")
  return `www.${clean[0] ?? "f"}***`
}

// ─── Status badge ──────────────────────────────────────────────────────────────

function resolveStatus(statusKrs: string): { label: string; cls: string } {
  const s = (statusKrs || "").toLowerCase()
  if (s.includes("aktywn"))    return { label: "Aktywny",   cls: "bg-blue-50 text-blue-700" }
  if (s.includes("wykres"))    return { label: statusKrs,   cls: "bg-red-50 text-red-700" }
  if (s.includes("likwidacj")) return { label: statusKrs,   cls: "bg-amber-50 text-amber-700" }
  return { label: statusKrs || "Nieznany", cls: "bg-gray-100 text-gray-500" }
}

// ─── Tabs config ─────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; pro: boolean }[] = [
  { key: "podstawowe", label: "Podstawowe", pro: false },
  { key: "finanse",    label: "Finanse",    pro: true  },
  { key: "ryzyko",     label: "Ryzyko",     pro: true  },
  { key: "aktywnosc",  label: "Aktywność",  pro: true  },
  { key: "dotacje",    label: "Dotacje UE", pro: true  },
]

const PRO_DESC: Partial<Record<Tab, string>> = {
  finanse:   "Sprawozdania finansowe, wyniki, zadłużenie",
  ryzyko:    "Scoring kredytowy, powiązania, alerty",
  aktywnosc: "Historia zmian, ogłoszenia, przetargi",
  dotacje:   "Dotacje UE i krajowe, projekty unijne",
}

// ─── Tiny components ─────────────────────────────────────────────────────────

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-block text-xs font-medium rounded-full px-3 py-0.5 ${cls}`}>
      {label}
    </span>
  )
}

// Avatar with initials — bg-blue-50 text-blue-600 rounded-full w-8 h-8 per brief
function Avatar({ name }: { name: string }) {
  const cleaned = name.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g, "")
  const initials = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("")
  return (
    <span className="bg-blue-50 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold shrink-0 select-none">
      {initials || "?"}
    </span>
  )
}

// Card wrapper — rounded-xl border border-[#e5e7eb] bg-white
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-[#e5e7eb] overflow-hidden mb-4 ${className}`}>
      {children}
    </div>
  )
}

// Card title row — always p-5, border-b
function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
      <h2 className="text-xs font-medium uppercase tracking-widest text-gray-400">{title}</h2>
      {action}
    </div>
  )
}

// Single label/value field row
function Field({
  label,
  value,
  children,
}: {
  label: string
  value?: string | null
  children?: React.ReactNode
}) {
  const content = children ?? value
  if (!content && content !== 0) return null
  return (
    <div className="flex gap-6 px-5 py-3 border-b border-[#e5e7eb] last:border-0">
      <dt className="text-xs font-medium uppercase tracking-widest text-gray-400 w-36 shrink-0 leading-5 pt-px">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 leading-5 min-w-0">{content}</dd>
    </div>
  )
}

// Person row with avatar
function PersonRow({ rep }: { rep: Rep }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e5e7eb] last:border-0">
      <Avatar name={rep.name} />
      <div className="min-w-0">
        <p className="text-sm text-gray-900 truncate">{fmtPerson(rep.name)}</p>
        {rep.fn && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{sentenceCase(rep.fn)}</p>
        )}
      </div>
    </div>
  )
}

// Sidebar section wrapper — p-5 per brief
function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
      <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  )
}

// Outline button
function Btn({
  children,
  href,
  variant = "outline",
  className = "",
  onClick,
}: {
  children: React.ReactNode
  href?: string
  variant?: "outline" | "solid"
  className?: string
  onClick?: () => void
}) {
  const base = "inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
  const styles =
    variant === "solid"
      ? "bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
      : "border border-[#e5e7eb] bg-white text-gray-700 hover:bg-gray-50 px-4 py-2"

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles} ${className}`}>
        {children}
      </a>
    )
  }
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FirmaView(props: FirmaViewProps) {
  const [tab, setTab] = useState<Tab>("podstawowe")

  const {
    nip, name, regon, krs, statusKrs, legalForm, source, rejestr,
    registrationDate, capital, currency,
    address, contact,
    representationMethod,
    representatives, prokurenci, radaNadzorcza,
    shareholders, pkdCodes,
    krsLink, ownerName,
    restrukturyzacja, financialReports,
  } = props

  // Derived values
  const statusBadge    = resolveStatus(statusKrs)
  const year           = registrationDate ? new Date(registrationDate).getFullYear() : null
  const capitalFmt     = capital ? fmtCapital(capital, currency) : null
  const mapQ           = encodeURIComponent(address.full || `${address.street}, ${address.postalCode} ${address.city}`)
  const primaryPkd     = pkdCodes.find(p => p.isPrimary)
  const hasContact     = contact.phone || contact.email || contact.website
  const shareholderVal = shareholders.length > 0
    ? String(shareholders.length)
    : ownerName ? fmtPerson(ownerName) : "—"

  // Shareholders bar chart data
  const shareVals  = shareholders.map(s => parsePct(s.shares))
  const shareTotal = shareVals.reduce((a, b) => a + b, 0)
  const maxShare   = Math.max(...shareVals, 0)

  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900">

      {/* ══ Navbar ══════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-[#e5e7eb] h-14 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-[17px] font-bold tracking-tight text-gray-900">nipgo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        </Link>
        <div className="flex items-center gap-2">
          <Btn variant="outline">Zaloguj się</Btn>
          <Btn variant="solid">Rejestracja</Btn>
        </div>
      </header>

      {/* ══ Page body ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1100px] mx-auto px-6 pt-5 pb-20">

        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-5"
        >
          <ChevronLeft size={13} strokeWidth={2} />
          Powrót do wyników
        </Link>

        {/* ── Restrukturyzacja / upadłość ─────────────────────────────────── */}
        {restrukturyzacja && typeof restrukturyzacja === 'object' && Object.keys(restrukturyzacja).length > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {sentenceCase(
                  restrukturyzacja.typ ||
                  restrukturyzacja.rodzaj ||
                  restrukturyzacja.typPostepowania ||
                  "Postępowanie restrukturyzacyjne / upadłościowe"
                )}
              </p>
              {Array.isArray(restrukturyzacja.likwidatorzy) &&
                restrukturyzacja.likwidatorzy.length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-semibold text-amber-700">Likwidatorzy:</p>
                    {restrukturyzacja.likwidatorzy.map((l: any, i: number) => (
                      <p key={i} className="text-xs text-amber-700">
                        {typeof l === "string"
                          ? l
                          : `${l.imie || ""} ${l.nazwisko || ""}`.trim() || l.nazwa || ""}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* ── Company hero ─────────────────────────────────────────────────── */}
        <div className="mb-7">
          {/* Status + forma + rejestr badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge label={statusBadge.label} cls={statusBadge.cls} />
            {legalForm && (
              <Badge label={sentenceCase(legalForm)} cls="bg-gray-100 text-gray-500" />
            )}
            {rejestr === "P" && (
              <Badge label="KRS" cls="bg-gray-100 text-gray-500" />
            )}
          </div>

          {/* Company name — brief: split(' ').map(capitalize).join(' ') */}
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-gray-900 mb-3">
            {name}
          </h1>

          {/* IDs row */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
            <span className="text-xs text-gray-400">
              NIP <span className="ml-0.5 font-medium text-gray-700">{nip}</span>
            </span>
            {krs && (
              <span className="text-xs text-gray-400">
                KRS <span className="ml-0.5 font-medium text-gray-700">{krs}</span>
              </span>
            )}
            {regon && (
              <span className="text-xs text-gray-400">
                REGON <span className="ml-0.5 font-medium text-gray-700">{regon}</span>
              </span>
            )}
            {year && (
              <span className="text-xs text-gray-400">
                od <span className="ml-0.5 font-medium text-gray-700">{year}</span>
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2">
            <Btn variant="outline"><Download size={14} />Eksportuj</Btn>
            <Btn variant="solid">Obserwuj</Btn>
          </div>
        </div>

        {/* ── KPI strip ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 rounded-xl border border-[#e5e7eb] bg-white overflow-hidden mb-6">
          {([
            { icon: <CircleDollarSign size={17} className="text-gray-400" />, label: "Kapitał zakładowy", value: capitalFmt ?? "—" },
            { icon: <MapPin           size={17} className="text-gray-400" />, label: "Siedziba",           value: sentenceCase(address.city) || "—" },
            { icon: <Users            size={17} className="text-gray-400" />, label: "Wspólnicy",          value: shareholderVal },
            { icon: <Briefcase        size={17} className="text-gray-400" />, label: "PKD główne",         value: primaryPkd ? `${primaryPkd.code} — ${(primaryPkd.description || "").toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3).join(" ")}` : "—" },
          ] as const).map((kpi, i) => (
            <div key={i} className={`p-5 ${i < 3 ? "border-r border-[#e5e7eb]" : ""}`}>
              <div className="mb-3">{kpi.icon}</div>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
              <p className="text-[17px] font-semibold text-gray-900 tracking-tight">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-[#e5e7eb] mb-6 overflow-x-auto bg-white rounded-t-xl -mx-0">
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  "flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap",
                  active
                    ? "border-blue-600 font-medium text-blue-600"
                    : "border-transparent font-normal text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {t.label}
                <span className={`rounded text-[10px] font-semibold px-1.5 py-px ${t.pro ? "bg-violet-50 text-violet-600" : "bg-green-50 text-green-600"}`}>
                  {t.pro ? "PRO" : "free"}
                </span>
              </button>
            )
          })}
        </div>

        {/* ══ Tab: Podstawowe ═════════════════════════════════════════════════ */}
        {tab === "podstawowe" && (
          <div className="flex gap-6 items-start">

            {/* ── Left column ────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Dane rejestrowe */}
              <Card>
                <CardHeader title="Dane rejestrowe" />
                <dl>
                  <Field label="Pełna nazwa"        value={name} />
                  <Field label="Forma prawna"        value={sentenceCase(legalForm)} />
                  <Field label="Data rejestracji"    value={fmtDate(registrationDate) || null} />
                  <Field label="Adres siedziby"      value={fmtAddress(address.full) || null} />
                  {address.voivodeship && (
                    <Field label="Województwo"       value={sentenceCase(address.voivodeship)} />
                  )}
                  <Field label="Numer KRS"           value={krs || null} />
                  <Field label="REGON"               value={regon || null} />
                  <Field label="NIP"                 value={nip} />
                  <Field label="Kapitał zakładowy"   value={capitalFmt} />
                  {ownerName && (
                    <Field label="Właściciel"        value={fmtPerson(ownerName)} />
                  )}
                </dl>
              </Card>

              {/* Kontakt — paywall */}
              {hasContact && (
                <Card className="relative">
                  <CardHeader title="Kontakt" />
                  {/* blurred preview */}
                  <dl className="blur-[2px] pointer-events-none select-none">
                    {contact.email   && <Field label="E-mail"     value={maskEmail(contact.email)} />}
                    {contact.website && <Field label="Strona www"  value={maskWebsite(contact.website)} />}
                    {contact.phone   && <Field label="Telefon"     value={maskPhone(contact.phone)} />}
                  </dl>
                  {/* overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
                    <Lock size={16} className="text-gray-400 mb-2" />
                    <p className="text-xs font-semibold text-gray-700 mb-1">Dane kontaktowe</p>
                    <p className="text-xs text-gray-500 mb-3">Dostępne w planie Pro</p>
                    <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                      Odblokuj za 49 zł/mies.
                    </button>
                  </div>
                </Card>
              )}

              {/* Zarząd */}
              {representatives.length > 0 && (
                <Card>
                  <CardHeader title="Zarząd" />
                  {representatives.map((r, i) => <PersonRow key={i} rep={r} />)}
                  {representationMethod && (
                    <div className="px-5 pt-4 pb-5 border-t border-[#e5e7eb]">
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                        Sposób reprezentacji
                      </p>
                      <p className="rounded-lg bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-700">
                        {sentenceCase(representationMethod)}
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Prokurenci */}
              {prokurenci.length > 0 && (
                <Card>
                  <CardHeader title="Prokurenci" />
                  {prokurenci.map((p, i) => <PersonRow key={i} rep={p} />)}
                </Card>
              )}

              {/* Rada nadzorcza */}
              {radaNadzorcza.length > 0 && (
                <Card>
                  <CardHeader title="Rada nadzorcza" />
                  {radaNadzorcza.map((r, i) => <PersonRow key={i} rep={r} />)}
                </Card>
              )}

              {/* Wspólnicy */}
              {shareholders.length > 0 && (
                <Card>
                  <CardHeader title="Wspólnicy" />

                  {/* Bar chart */}
                  <div className="px-5 pt-5 pb-4 border-b border-[#e5e7eb] space-y-4">
                    {shareholders.map((s, i) => {
                      const pct = shareTotal > 0
                        ? (shareVals[i] / shareTotal) * 100
                        : 100 / shareholders.length
                      const isTop = shareVals[i] !== 0 && shareVals[i] === maxShare
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-700 truncate max-w-[75%]">{fmtPerson(s.name)}</span>
                            <span className="text-gray-400 shrink-0 ml-2">
                              {shareVals[i] > 0 ? `${shareVals[i]}%` : `${Math.round(pct)}%`}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div
                              className={`h-1.5 rounded-full ${isTop ? "bg-gray-800" : "bg-gray-300"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* List */}
                  {shareholders.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e5e7eb] last:border-0">
                      <Avatar name={s.name} />
                      <p className="flex-1 text-sm text-gray-900 min-w-0 truncate">{fmtPerson(s.name)}</p>
                      {s.shares && (
                        <span className="text-xs text-gray-400 shrink-0">{sentenceCase(s.shares)}</span>
                      )}
                    </div>
                  ))}
                </Card>
              )}

              {/* Sposób reprezentacji — standalone (gdy brak zarządu) */}
              {representationMethod && representatives.length === 0 && (
                <Card>
                  <CardHeader title="Sposób reprezentacji" />
                  <div className="px-5 py-5">
                    <p className="rounded-lg bg-gray-50 p-3.5 text-sm leading-relaxed text-gray-700">
                      {sentenceCase(representationMethod)}
                    </p>
                  </div>
                </Card>
              )}

              {/* PKD */}
              {pkdCodes.length > 0 && (
                <Card>
                  <CardHeader title="Przedmiot działalności (PKD)" />
                  {pkdCodes.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-[#e5e7eb] last:border-0">
                      {/* kod PKD — font-mono text-xs text-gray-500 per brief */}
                      <span className={`font-mono text-xs text-gray-500 shrink-0 w-14 pt-0.5 ${p.isPrimary ? "font-bold" : ""}`}>
                        {p.code}
                      </span>
                      <p className="flex-1 text-xs text-gray-600 leading-relaxed min-w-0">
                        {sentenceCase(p.description)}
                      </p>
                      {p.isPrimary && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          przeważająca
                        </span>
                      )}
                    </div>
                  ))}
                </Card>
              )}

            </div>{/* /left column */}

            {/* ── Sticky sidebar (w-72) ───────────────────────────────────── */}
            <aside className="w-72 shrink-0 sticky top-4 space-y-4 self-start">

              {/* Mapa */}
              <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=14`}
                    className="w-full h-full border-0 block"
                    title="Lokalizacja firmy"
                    loading="lazy"
                  />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[11px] text-gray-600 hover:bg-white transition-colors"
                  >
                    <ExternalLink size={10} />
                    Otwórz mapę
                  </a>
                </div>
                {(address.full || address.street) && (
                  <div className="px-4 py-3 border-t border-[#e5e7eb]">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {fmtAddress(address.full) || `${address.street}, ${address.postalCode} ${address.city}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Akcje */}
              <SideCard title="Akcje">
                <div className="space-y-2">
                  <Btn variant="outline" className="w-full justify-start">
                    <Printer size={14} className="text-gray-400" /> Drukuj / PDF
                  </Btn>
                  <Btn variant="outline" className="w-full justify-start">
                    <Share2 size={14} className="text-gray-400" /> Udostępnij
                  </Btn>
                  <Btn variant="solid" className="w-full justify-center">
                    Obserwuj
                  </Btn>
                  <Btn variant="outline" className="w-full justify-start">
                    <Flag size={14} className="text-gray-400" /> Zgłoś błąd
                  </Btn>
                  {krsLink && (
                    <Btn href={krsLink} variant="outline" className="w-full justify-start">
                      <ExternalLink size={14} className="text-gray-400" /> Wpis w {source}
                    </Btn>
                  )}
                </div>
              </SideCard>

              {/* Sprawozdania finansowe — paywall */}
              <div className="relative rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e7eb]">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-gray-400">
                    Sprawozdania finansowe
                  </h3>
                </div>
                {/* blurred rows */}
                <div className="blur-[4px] pointer-events-none select-none">
                  {(financialReports.length > 0
                    ? financialReports.slice(0, 3)
                    : [{ rok: "2024" }, { rok: "2023" }, { rok: "2022" }]
                  ).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 px-5 py-3 border-b border-[#e5e7eb] last:border-0">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <span className="flex-1 text-sm text-gray-900">
                        Rok {r.rok || r.dataZlozenia || r.rokObrotowy || 2024 - i}
                      </span>
                      <Download size={13} className="text-gray-400 shrink-0" />
                    </div>
                  ))}
                </div>
                {/* overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[3px]">
                  <Lock size={18} className="text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400 mb-3">Dostępne w planie Pro</p>
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                    Odblokuj za 49 zł/mies.
                  </button>
                </div>
              </div>

              {/* Pro CTA */}
              <div className="rounded-xl bg-blue-600 p-5 text-white">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  Plan Pro
                </p>
                <p className="mb-4 text-sm font-medium leading-snug">
                  Finanse, ryzyko, powiązania i dotacje UE w jednym miejscu
                </p>
                <button className="w-full cursor-pointer rounded-lg bg-white py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
                  Odblokuj za 49 zł/mies.
                </button>
              </div>

              {/* Ad slot */}
              <div className="ad-slot min-h-[250px] rounded-xl border border-dashed border-[#e5e7eb] flex items-center justify-center">
                <p className="text-xs text-gray-300 select-none">Reklama</p>
              </div>

            </aside>{/* /sidebar */}
          </div>
        )}{/* /tab podstawowe */}

        {/* ══ Pro tabs — paywall overlay ══════════════════════════════════════ */}
        {tab !== "podstawowe" && (
          <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            {/* skeleton behind blur */}
            <div className="space-y-3 p-8 blur-sm pointer-events-none select-none">
              {[68, 82, 55, 74, 44].map((w, i) => (
                <div key={i} className="rounded bg-gray-100" style={{ height: i === 0 ? 22 : 14, width: `${w}%` }} />
              ))}
            </div>
            {/* overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[3px]">
              <Lock size={26} className="text-gray-300 mb-3" />
              <p className="text-[17px] font-semibold tracking-tight text-gray-900 mb-1">
                Dostępne w planie Pro
              </p>
              <p className="text-sm text-gray-400 mb-6">{PRO_DESC[tab]}</p>
              <button className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Odblokuj za 49 zł/mies.
              </button>
            </div>
          </div>
        )}

      </div>{/* /page body */}

      {/* ══ Footer ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#e5e7eb] py-6">
        <p className="mx-auto max-w-[1100px] px-6 text-center text-[11px] text-gray-300">
          Dane z{" "}
          {source === "KRS"
            ? "Krajowego Rejestru Sądowego"
            : "Centralnej Ewidencji i Informacji o Działalności Gospodarczej"}
          . Informacje mają charakter poglądowy.
        </p>
      </footer>

    </div>
  )
}
