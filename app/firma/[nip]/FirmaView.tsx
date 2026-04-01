"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft, Download, Printer, Share2, Lock,
  ExternalLink, MapPin, Users, Briefcase, CircleDollarSign,
  AlertTriangle, FileText,
} from "lucide-react"

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

// ─── Utilities ────────────────────────────────────────────────────────────────

function toTitleCase(s: string | null | undefined): string {
  if (!s) return ""
  return s.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase())
}

function toProperCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bZ\b/g, "z")
    .replace(/\bW\b/g, "w")
    .replace(/\bI\b/g, "i")
    .replace(/\bOraz\b/g, "oraz")
}

function toSentenceCase(s: string | null | undefined): string {
  if (!s) return ""
  const lower = s.toLowerCase()
  const first = lower.charAt(0).toUpperCase() + lower.slice(1)
  return first.replace(/\b\p{L}(?:\.\p{L})+\./gu, m => m.toUpperCase())
}

function formatDate(s: string | null | undefined): string {
  if (!s) return ""
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
}

function formatAddress(s: string | null | undefined): string {
  if (!s) return ""
  let r = s.toLowerCase().replace(/\s+\//g, "/")
  r = r.replace(/,\s*[\p{L}\s-]+?,\s*(\d{2}-\d{3})/u, ", $1")
  r = r.replace(/\bul\.\s+(\p{L})/gu, (_, l) => "ul. " + l.toUpperCase())
  r = r.replace(/(\d{2}-\d{3}\s+)(\p{L})/gu, (_, code, l) => code + l.toUpperCase())
  r = r.replace(/^(\p{L})/u, l => l.toUpperCase())
  return r
}

function formatPersonName(name: string): string {
  if (!name) return ""
  if (name.includes("*")) return name
  return toTitleCase(name)
}

function parseSharePercent(shares: string): number {
  const pct = shares.match(/(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return parseFloat(pct[1].replace(",", "."))
  const num = shares.match(/(\d+)/)
  return num ? parseFloat(num[1]) : 0
}

function maskPhone(p: string): string {
  const d = p.replace(/\D/g, "")
  if (d.length >= 9) return `+48 ${d.slice(-9, -6)} *** ***`
  return "+48 *** *** ***"
}

function maskEmail(e: string): string {
  const [local, domain] = e.split("@")
  const ml = (local?.[0] ?? "k") + "***"
  const dp = domain?.split(".") ?? ["firma", "pl"]
  const md = (dp[0]?.[0] ?? "f") + "***." + dp.slice(1).join(".")
  return `${ml}@${md}`
}

function maskWebsite(w: string): string {
  const clean = w.replace(/^https?:\/\//, "").replace(/^www\./, "")
  return "www." + (clean[0] ?? "f") + "***"
}

function getStatusBadge(statusKrs: string): { label: string; cls: string } {
  const s = (statusKrs || "").toLowerCase()
  if (s.includes("aktywn"))   return { label: "Aktywny",   cls: "bg-green-50 text-green-700" }
  if (s.includes("wykres"))   return { label: statusKrs,   cls: "bg-red-50 text-red-700" }
  if (s.includes("likwidacj")) return { label: statusKrs, cls: "bg-amber-50 text-amber-700" }
  return { label: statusKrs || "Nieznany", cls: "bg-gray-100 text-gray-500" }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_LABELS: Record<Tab, string> = {
  podstawowe: "Podstawowe",
  finanse: "Finanse",
  ryzyko: "Ryzyko",
  aktywnosc: "Aktywność",
  dotacje: "Dotacje UE",
}

const PRO_TABS: Tab[] = ["finanse", "ryzyko", "aktywnosc", "dotacje"]

const PRO_DESCRIPTIONS: Partial<Record<Tab, string>> = {
  finanse: "Sprawozdania finansowe, wyniki, zadłużenie",
  ryzyko: "Scoring kredytowy, powiązania, alerty",
  aktywnosc: "Historia zmian, ogłoszenia, przetargi",
  dotacje: "Dotacje UE i krajowe, projekty unijne",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map(n => n.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "")[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="bg-blue-50 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium shrink-0">
      {initials || "?"}
    </div>
  )
}

function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span className={`text-xs rounded-full px-3 py-0.5 font-medium ${cls}`}>
      {children}
    </span>
  )
}

function SectionCard({
  title,
  badge,
  children,
  className,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden ${className ?? ""}`}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  )
}

function FieldRow({ label, value, children }: {
  label: string
  value?: string | null
  children?: React.ReactNode
}) {
  if (!value && !children) return null
  return (
    <div className="flex gap-4 px-5 py-3">
      <span className="text-xs uppercase tracking-widest text-gray-400 w-36 shrink-0 pt-0.5 leading-5">
        {label}
      </span>
      <span className="text-sm text-gray-900 leading-5">{children ?? value}</span>
    </div>
  )
}

function PersonList({ people }: { people: Rep[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {people.map((p, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3">
          <InitialsAvatar name={p.name} />
          <div>
            <p className="text-sm text-gray-900">{formatPersonName(p.name)}</p>
            {p.fn && (
              <p className="text-xs text-gray-400 mt-0.5">{toSentenceCase(p.fn)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ShareholdersChart({ shareholders }: { shareholders: Shareholder[] }) {
  const values = shareholders.map(s => parseSharePercent(s.shares))
  const total = values.reduce((a, b) => a + b, 0)
  const maxVal = Math.max(...values)
  return (
    <div className="px-5 pt-4 pb-3 border-b border-gray-100">
      {shareholders.map((s, i) => {
        const pct = total > 0 ? (values[i] / total) * 100 : 100 / shareholders.length
        const isLargest = values[i] !== 0 && values[i] === maxVal
        return (
          <div key={i} className="mb-4 last:mb-0">
            <div className="flex justify-between mb-1.5 text-xs">
              <span className="text-gray-600">{formatPersonName(s.name)}</span>
              <span className="text-gray-400">
                {values[i] > 0 ? `${values[i]}%` : `${Math.round(pct)}%`}
              </span>
            </div>
            <div className="bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${isLargest ? "bg-gray-900" : "bg-gray-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BtnOutline({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3.5 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer ${className ?? ""}`}
    >
      {children}
    </button>
  )
}

function BtnBlack({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gray-900 text-white rounded-lg px-3.5 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer ${className ?? ""}`}
    >
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FirmaView(props: FirmaViewProps) {
  const [tab, setTab] = useState<Tab>("podstawowe")

  const {
    nip, name, regon, krs, statusKrs, legalForm, source, rejestr,
    registrationDate, capital, currency, address, contact,
    representationMethod, representatives, prokurenci, radaNadzorcza,
    shareholders, pkdCodes, krsLink, ownerName,
    restrukturyzacja, financialReports,
  } = props

  const statusBadge = getStatusBadge(statusKrs)
  const year = registrationDate ? new Date(registrationDate).getFullYear() : null
  const capitalFormatted = capital
    ? `${Number(capital).toLocaleString("pl-PL")} ${currency || "PLN"}`
    : null
  const mapQuery = encodeURIComponent(
    address.full || `${address.street}, ${address.postalCode} ${address.city}`
  )
  const hasContact = contact.phone || contact.email || contact.website
  const primaryPkd = pkdCodes.find(p => p.isPrimary)
  const shareholderCount =
    shareholders.length > 0 ? String(shareholders.length) : ownerName ? formatPersonName(ownerName) : "—"

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* ── Header ── */}
      <header className="border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-gray-900 tracking-tight">nipgo</span>
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
        </Link>
        <div className="flex gap-2">
          <BtnOutline>Zaloguj się</BtnOutline>
          <BtnBlack>Rejestracja</BtnBlack>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 pt-6 pb-16">
        {/* ── Back nav ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-400 mb-5 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={14} />
          Powrót do wyników
        </Link>

        {/* ── Restrukturyzacja / upadłość alert ── */}
        {restrukturyzacja && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {toSentenceCase(
                  restrukturyzacja?.typ ||
                  restrukturyzacja?.rodzaj ||
                  restrukturyzacja?.typPostepowania ||
                  "Postępowanie restrukturyzacyjne / upadłościowe"
                )}
              </p>
              {Array.isArray(restrukturyzacja?.likwidatorzy) &&
                restrukturyzacja.likwidatorzy.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-amber-700 font-medium mb-1">Likwidatorzy:</p>
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

        {/* ── Company header ── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge cls={statusBadge.cls}>{statusBadge.label}</Badge>
            {legalForm && (
              <Badge cls="bg-gray-100 text-gray-500">{toSentenceCase(legalForm)}</Badge>
            )}
            {rejestr === "P" && (
              <Badge cls="bg-gray-100 text-gray-500">KRS</Badge>
            )}
          </div>

          <h1 className="text-2xl font-medium tracking-tight text-gray-900 mb-3 leading-snug">
            {toProperCase(name)}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400 mb-5">
            <span>NIP: <span className="text-gray-900">{nip}</span></span>
            {krs && <span>KRS: <span className="text-gray-900">{krs}</span></span>}
            {regon && <span>REGON: <span className="text-gray-900">{regon}</span></span>}
            {year && <span>od <span className="text-gray-900">{year}</span></span>}
          </div>

          <div className="flex gap-2">
            <BtnOutline><Download size={14} />Eksportuj</BtnOutline>
            <BtnBlack>Obserwuj</BtnBlack>
          </div>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-4 border border-gray-200 rounded-xl overflow-hidden mb-6">
          {[
            {
              label: "Kapitał zakładowy",
              value: capitalFormatted ?? "—",
              icon: <CircleDollarSign size={16} className="text-gray-400" />,
            },
            {
              label: "Siedziba",
              value: toSentenceCase(address.city) || "—",
              icon: <MapPin size={16} className="text-gray-400" />,
            },
            {
              label: "Wspólnicy",
              value: shareholderCount,
              icon: <Users size={16} className="text-gray-400" />,
            },
            {
              label: "PKD główne",
              value: primaryPkd?.code ?? "—",
              icon: <Briefcase size={16} className="text-gray-400" />,
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className={`p-4 bg-white ${i < 3 ? "border-r border-gray-200" : ""}`}
            >
              <div className="mb-2">{kpi.icon}</div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
              <p className="text-base font-medium text-gray-900 tracking-tight">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 flex mb-6 overflow-x-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => {
            const isPro = PRO_TABS.includes(t)
            const isActive = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm whitespace-nowrap flex items-center gap-2 border-b-2 -mb-px transition-colors shrink-0 ${
                  isActive
                    ? "border-gray-900 font-medium text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {TAB_LABELS[t]}
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isPro ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"
                  }`}
                >
                  {isPro ? "Pro" : "free"}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Tab: Podstawowe ── */}
        {tab === "podstawowe" && (
          <div className="flex gap-6 items-start">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              {/* Dane rejestrowe */}
              <SectionCard title="Dane rejestrowe">
                <div className="divide-y divide-gray-100">
                  <FieldRow label="Pełna nazwa" value={toSentenceCase(name)} />
                  <FieldRow label="Forma prawna" value={toSentenceCase(legalForm)} />
                  <FieldRow label="Data rejestracji" value={formatDate(registrationDate) || null} />
                  <FieldRow label="Adres siedziby" value={formatAddress(address.full) || null} />
                  <FieldRow label="Numer KRS" value={krs || null} />
                  <FieldRow label="REGON" value={regon || null} />
                  <FieldRow label="Kapitał zakładowy" value={capitalFormatted} />
                  <FieldRow label="Właściciel" value={ownerName ? formatPersonName(ownerName) : null} />
                </div>
              </SectionCard>

              {/* Kontakt — paywall */}
              {hasContact && (
                <SectionCard title="Kontakt" className="relative">
                  <div className="divide-y divide-gray-100 blur-sm pointer-events-none select-none">
                    {contact.phone && <FieldRow label="Telefon" value={maskPhone(contact.phone)} />}
                    {contact.email && <FieldRow label="E-mail" value={maskEmail(contact.email)} />}
                    {contact.website && <FieldRow label="Strona www" value={maskWebsite(contact.website)} />}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl">
                    <div className="text-center">
                      <Lock size={18} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 mb-3">Dane kontaktowe</p>
                      <button className="bg-gray-900 text-white text-xs rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer">
                        Odblokuj za 49 zł/mies.
                      </button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Zarząd */}
              {representatives.length > 0 && (
                <SectionCard title="Zarząd">
                  <PersonList people={representatives} />
                  {representationMethod && (
                    <div className="px-5 py-4 border-t border-gray-100">
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                        Sposób reprezentacji
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                        {toSentenceCase(representationMethod)}
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Prokurenci */}
              {prokurenci.length > 0 && (
                <SectionCard title="Prokurenci">
                  <PersonList people={prokurenci} />
                </SectionCard>
              )}

              {/* Rada nadzorcza */}
              {radaNadzorcza.length > 0 && (
                <SectionCard title="Rada nadzorcza">
                  <PersonList people={radaNadzorcza} />
                </SectionCard>
              )}

              {/* Wspólnicy */}
              {shareholders.length > 0 && (
                <SectionCard title="Wspólnicy">
                  <ShareholdersChart shareholders={shareholders} />
                  <div className="divide-y divide-gray-100">
                    {shareholders.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <InitialsAvatar name={s.name} />
                        <p className="flex-1 text-sm text-gray-900">{formatPersonName(s.name)}</p>
                        <span className="text-xs text-gray-400">{toSentenceCase(s.shares)}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Sposób reprezentacji (standalone gdy brak zarządu) */}
              {representationMethod && representatives.length === 0 && (
                <SectionCard title="Sposób reprezentacji">
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                      {toSentenceCase(representationMethod)}
                    </p>
                  </div>
                </SectionCard>
              )}

              {/* PKD */}
              {pkdCodes.length > 0 && (
                <SectionCard title="Przedmiot działalności (PKD)">
                  <div className="divide-y divide-gray-100">
                    {pkdCodes.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-3">
                        <span className={`font-mono text-xs text-gray-500 shrink-0 pt-0.5 w-16 ${p.isPrimary ? "font-semibold" : ""}`}>
                          {p.code}
                        </span>
                        <span className="text-xs text-gray-600 flex-1 leading-5">
                          {toSentenceCase(p.description)}
                        </span>
                        {p.isPrimary && (
                          <span className="shrink-0 bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            przeważająca
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Right column — sticky sidebar */}
            <aside className="w-72 shrink-0 sticky top-4 space-y-3">
              {/* Mapa */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=14`}
                    className="w-full h-full border-0 block"
                    title="Lokalizacja firmy"
                    loading="lazy"
                  />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-[11px] text-gray-800 flex items-center gap-1 no-underline hover:bg-white transition-colors"
                  >
                    <ExternalLink size={10} />
                    Otwórz mapę
                  </a>
                </div>
              </div>

              {/* Akcje */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
                  Akcje
                </h2>
                <div className="flex flex-col gap-2">
                  <BtnOutline className="w-full justify-start">
                    <Printer size={14} />Drukuj / PDF
                  </BtnOutline>
                  <BtnOutline className="w-full justify-start">
                    <Share2 size={14} />Udostępnij
                  </BtnOutline>
                  <BtnBlack className="w-full">Obserwuj</BtnBlack>
                  {krsLink && (
                    <a
                      href={krsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3.5 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors w-full"
                    >
                      <ExternalLink size={14} />Wpis w {source}
                    </a>
                  )}
                </div>
              </div>

              {/* Sprawozdania finansowe — paywall */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden relative">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                    Sprawozdania finansowe
                  </h2>
                </div>
                <div className="blur-sm pointer-events-none select-none divide-y divide-gray-100">
                  {(financialReports.length > 0 ? financialReports.slice(0, 3) : [1, 2, 3]).map(
                    (r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-5 py-3">
                        <FileText size={13} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-900 flex-1">
                          {typeof r === "object"
                            ? r.rok || r.dataZlozenia || r.rokObrotowy || `Rok ${2024 - i}`
                            : `Rok ${2024 - i}`}
                        </span>
                        <Download size={12} className="text-gray-400 shrink-0" />
                      </div>
                    )
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Lock size={18} className="text-gray-400 mx-auto mb-2" />
                    <button className="bg-gray-900 text-white text-xs rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer">
                      Odblokuj za 49 zł/mies.
                    </button>
                  </div>
                </div>
              </div>

              {/* Pro CTA */}
              <div className="bg-gray-900 rounded-xl p-5 text-white">
                <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest mb-1">
                  Plan Pro
                </p>
                <p className="text-sm font-medium mb-4 leading-snug">
                  Pełny dostęp do danych finansowych, ryzyka i aktywności
                </p>
                <button className="w-full bg-white text-gray-900 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                  Odblokuj za 49 zł/mies.
                </button>
              </div>

              {/* Ad slot */}
              <div className="ad-slot min-h-[250px] border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-xs text-gray-300">Reklama</p>
              </div>
            </aside>
          </div>
        )}

        {/* ── Pro tabs — paywall overlay ── */}
        {PRO_TABS.includes(tab) && (
          <div className="relative min-h-80 border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 blur-sm pointer-events-none select-none">
              {[60, 80, 70, 50, 65].map((w, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded mb-3"
                  style={{ height: i === 0 ? 20 : 14, width: `${w}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm">
              <div className="text-center">
                <Lock size={24} className="text-gray-400 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-900 mb-1 tracking-tight">
                  Dostępne w planie Pro
                </p>
                <p className="text-sm text-gray-400 mb-5">{PRO_DESCRIPTIONS[tab]}</p>
                <BtnBlack>Odblokuj za 49 zł/mies.</BtnBlack>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer note ── */}
      <footer className="border-t border-gray-200 py-5">
        <p className="text-center text-[11px] text-gray-300 max-w-[1100px] mx-auto px-6">
          Dane pochodzą z{" "}
          {source === "KRS"
            ? "Krajowego Rejestru Sądowego"
            : "Centralnej Ewidencji i Informacji o Działalności Gospodarczej"}
          . Informacje mają charakter poglądowy.
        </p>
      </footer>
    </div>
  )
}
