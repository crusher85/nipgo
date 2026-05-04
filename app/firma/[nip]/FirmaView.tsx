"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"
import { useT } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import {
  ChevronLeft, Download, Bell, BellOff, Lock, ExternalLink,
  MapPin, Users, Briefcase, CircleDollarSign,
  AlertTriangle, Share2, Printer,
  Flag, TrendingUp, Shield, Globe,
  Building2, Calendar, User, Zap, Sparkles, Search, Check,
} from "lucide-react"

type Tab = "podstawowe" | "finanse" | "ryzyko" | "sygnaly" | "dotacje"
interface Rep { name: string; fn: string }
interface Shareholder { name: string; shares: string }
interface PkdCode { code: string; description: string; isPrimary: boolean }

export interface FirmaViewProps {
  nip: string; name: string; regon: string; krs: string; statusKrs: string; statusDodatkowy: string
  status: "active" | "inactive"; legalForm: string; formaWlasnosci: string; source: "KRS" | "CEIDG"
  rejestr: string; registrationDate: string; dataZawieszenia: string; dataWznowienia: string; dataZakonczenia: string
  capital: string; currency: string; ostatnieSprRok: number | null; celDzialania: string
  address: { street: string; city: string; postalCode: string; voivodeship: string; county: string; commune: string; full: string }
  contact: { phone: string; phoneMobile: string; email: string; website: string; facebook: string; googleRating: number | null }
  representationMethod: string; representatives: Rep[]; prokurenci: Rep[]; radaNadzorcza: Rep[]
  shareholders: Shareholder[]; pkdCodes: PkdCode[]; krsLink: string; ownerName: string
  ownerGender: 'M' | 'F' | null; ownerCitizenship: string | null; organRejestrowy: string; liczbaPracownikow: string
  flagaRyzyka: boolean; flagaAktywaDotacja: boolean; czyNieruchomoscWlasna: boolean; sumaPomocyEur: number | null
  oddzialy: string[]; historiaPrzeksztalcen: string[]; restrukturyzacja: any; financialReports: any[]
  vatStatus: string | null; vatRisk: boolean; accountNumbers: string[]
  zakazyInfo?: string | null; uprawieniaInfo?: string | null
  wspolnoscMajatkowa: boolean | null; adresDoreczenia: string | null
  kontekst?: { pkd_count_miasto: number | null; pkd_count_woj: number | null; kapital_percentyl: number | null; wiek_percentyl: number | null } | null
}

function sc(s: string | null | undefined): string {
  if (!s) return ""; const l = s.toLowerCase(); return l.charAt(0).toUpperCase() + l.slice(1)
}
function fmtCompanyName(name: string): string {
  if (!name) return ""
  const titled = name.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase())
  return titled.replace(/Spółka Z Ograniczoną Odpowiedzialnością/gi, "Spółka z ograniczoną odpowiedzialnością")
    .replace(/\bSp\.\s*Z\s*O\.O\./gi, "sp. z o.o.").replace(/\bS\.A\./gi, "S.A.")
    .replace(/\bSp\.J\./gi, "sp.j.").replace(/\bSp\.K\./gi, "sp.k.")
}
function fmtDate(s: string | null | undefined): string {
  if (!s) return ""; const d = new Date(s); if (isNaN(d.getTime())) return s
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
}
function fmtCapital(amount: string, currency: string): string {
  const n = Number(amount); if (!amount || isNaN(n)) return ""
  return `${n.toLocaleString("pl-PL")} ${currency || "PLN"}`
}
function fmtPerson(name: string): string {
  if (!name) return ""; if (name.includes("*")) return name
  return name.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase())
}
function fmtShares(shares: string): string {
  if (!shares) return ""
  return shares.replace(/udziałów o łącznej wartości/gi, "udz. /").replace(/udziału o łącznej wartości/gi, "udz. /")
    .replace(/,00\s*ZŁ/gi, " zł").replace(/,00\s*zł/gi, " zł").replace(/\s+/g, " ").trim()
}
function formatRegon(r: string): string { return r && r.endsWith("00000") ? r.slice(0, 9) : r }
function parsePct(s: string): number {
  const pct = s.match(/(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return parseFloat(pct[1].replace(",", "."))
  const num = s.match(/(\d+)/); return num ? parseFloat(num[1]) : 0
}
function formatAge(dateStr: string | null | undefined): { label: string; color: string; bg: string } | null {
  if (!dateStr) return null; const reg = new Date(dateStr); if (isNaN(reg.getTime())) return null
  const days = Math.floor((Date.now() - reg.getTime()) / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30.44); const years = Math.floor(days / 365.25)
  let label: string
  if (days < 30) label = `${days} dni`
  else if (months < 12) label = `${months} mies.`
  else if (years === 1) label = `1 rok`
  else if (years < 5) label = `${years} lata`
  else label = `${years} lat`
  let color: string, bg: string
  if (days < 365) { color = "#f59e0b"; bg = "#fffbeb" }
  else if (years < 3) { color = "#f97316"; bg = "#fff7ed" }
  else if (years < 10) { color = "#2563eb"; bg = "#eff6ff" }
  else { color = "#16a34a"; bg = "#f0fdf4" }
  return { label, color, bg }
}
function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return ""
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}
function countryCodeToName(code: string | null | undefined): string {
  if (!code) return ""
  const names: Record<string, string> = {
    PL: "Polska", DE: "Niemcy", UA: "Ukraina", BY: "Białoruś", RU: "Rosja",
    VN: "Wietnam", CN: "Chiny", IN: "Indie", GB: "Wielka Brytania", FR: "Francja",
    IT: "Włochy", NL: "Holandia", CZ: "Czechy", SK: "Słowacja", RO: "Rumunia",
  }
  return names[code.toUpperCase()] || code
}
function resolveVatStatus(vatStatus: string | null): { label: string; color: string } {
  if (!vatStatus) return { label: "Brak danych", color: "#9ca3af" }
  const s = vatStatus.toLowerCase()
  if (s.includes("czynny")) return { label: "Czynny", color: "#22c55e" }
  if (s.includes("zwolni")) return { label: vatStatus, color: "#f59e0b" }
  if (s.includes("wyrejestr") || s.includes("wykres")) return { label: vatStatus, color: "#ef4444" }
  return { label: vatStatus, color: "#6b7280" }
}
function resolveStatus(statusKrs: string): { label: string; color: string } {
  const s = (statusKrs || "").toLowerCase()
  if (s.includes("aktywn")) return { label: "Aktywny", color: "#22c55e" }
  if (s.includes("wykres")) return { label: statusKrs, color: "#ef4444" }
  if (s.includes("likwidacj")) return { label: statusKrs, color: "#f59e0b" }
  if (s.includes("zawiesz")) return { label: "Zawieszona", color: "#f59e0b" }
  return { label: statusKrs || "Nieznany", color: "#6b7280" }
}
function getInitials(name: string): string {
  return name.replace(/[*]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
}
function formatIban(account: string): string {
  const digits = account.replace(/\D/g, "")
  if (digits.length === 26) {
    return `PL ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)} ${digits.slice(10, 14)} ${digits.slice(14, 18)} ${digits.slice(18, 22)} ${digits.slice(22, 26)}`
  }
  return account
}

function pkdToSektor(code: string): string {
  const prefix = code.replace(/\./g, "").slice(0, 2)
  const map: Record<string, string> = {
    "01": "gospodarstw rolnych", "10": "firm spożywczych", "11": "browarów i wytwórni",
    "14": "firm odzieżowych", "16": "tartaków i stolarni", "20": "firm chemicznych",
    "22": "firm z branży tworzyw", "25": "firm metalowych", "28": "producentów maszyn",
    "33": "serwisów technicznych", "35": "firm energetycznych", "38": "firm recyklingowych",
    "41": "firm budowlanych", "42": "firm inżynieryjnych", "43": "firm remontowych",
    "45": "firm motoryzacyjnych", "46": "hurtowni", "47": "sklepów detalicznych",
    "49": "firm transportowych", "52": "firm logistycznych", "55": "hoteli",
    "56": "restauracji i gastronomii", "58": "wydawnictw", "61": "operatorów telco",
    "62": "firm IT", "63": "firm technologicznych", "64": "instytucji finansowych",
    "68": "firm nieruchomości", "69": "kancelarii prawnych", "70": "firm doradczych",
    "71": "biur projektowych", "72": "instytutów badawczych", "73": "agencji reklamowych",
    "74": "firm kreatywnych", "77": "firm wynajmu", "78": "agencji pracy",
    "79": "biur podróży", "80": "firm ochroniarskich", "81": "firm sprzątających",
    "82": "biur obsługi firm", "85": "szkół i placówek edukacyjnych",
    "86": "placówek medycznych", "87": "domów opieki", "90": "firm kulturalnych",
    "93": "obiektów sportowych", "96": "salonów i usług osobistych",
  }
  return map[prefix] || "firm tej branży"
}

function makeS(dark: boolean) {
  const card = dark ? "#111111" : "#ffffff"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const borderLight = dark ? "#161616" : "#f3f4f6"
  const text = dark ? "#f5f5f5" : "#111"
  const textMuted = dark ? "#555" : "#9ca3af"
  const textValue = dark ? "#e5e5e5" : "#111827"
  const btnOutlineBg = dark ? "transparent" : "#fff"
  const btnOutlineBorder = dark ? "#2a2a2a" : "#e5e7eb"
  const btnOutlineColor = dark ? "#aaa" : "#374151"
  return {
    card: { background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 } as React.CSSProperties,
    cardHeader: { padding: "14px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" } as React.CSSProperties,
    label: { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: textMuted, fontWeight: 600 } as React.CSSProperties,
    fieldRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 20px", borderBottom: `1px solid ${borderLight}`, gap: 16 } as React.CSSProperties,
    fieldLabel: { fontSize: 12, color: textMuted, letterSpacing: "0.05em", textTransform: "uppercase" as const, minWidth: 140, flexShrink: 0 } as React.CSSProperties,
    fieldValue: { fontSize: 14, color: textValue, textAlign: "right" as const } as React.CSSProperties,
    btnOutline: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, border: `1px solid ${btnOutlineBorder}`, borderRadius: 10, background: btnOutlineBg, color: btnOutlineColor, cursor: "pointer" } as React.CSSProperties,
    btnPrimary: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", cursor: "pointer" } as React.CSSProperties,
    avatar: { width: 36, height: 36, borderRadius: "50%", background: dark ? "#1a2444" : "#eff6ff", border: `1px solid ${dark ? "#2a3a6a" : "#bfdbfe"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: dark ? "#6b8cff" : "#2563eb", flexShrink: 0 } as React.CSSProperties,
    border, borderLight, text, textMuted, textValue,
  }
}

function Field({ label, value, children, S }: { label: string; value?: string | null; children?: React.ReactNode; S: ReturnType<typeof makeS> }) {
  const content = children ?? value
  if (!content && content !== 0) return null
  return (
    <div style={S.fieldRow}>
      <span style={S.fieldLabel}>{label}</span>
      <span style={S.fieldValue}>{content}</span>
    </div>
  )
}

function PersonRow({ rep, S }: { rep: Rep; S: ReturnType<typeof makeS> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${S.borderLight}` }}>
      <div style={S.avatar}>{getInitials(rep.name) || "?"}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, color: S.textValue, margin: 0 }}>{fmtPerson(rep.name)}</p>
        {rep.fn && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>{rep.fn}</p>}
      </div>
    </div>
  )
}

function ProBadge({ dark }: { dark: boolean }) {
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", background: dark ? "#1a1060" : "#ede9fe", color: dark ? "#7c6fff" : "#7c3aed", padding: "2px 7px", borderRadius: 4, marginLeft: 6, textTransform: "uppercase" as const }}>PRO</span>
}
function FreeBadge({ dark }: { dark: boolean }) {
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", background: dark ? "#0d2218" : "#dcfce7", color: dark ? "#22c55e" : "#16a34a", padding: "2px 7px", borderRadius: 4, marginLeft: 6, textTransform: "uppercase" as const }}>free</span>
}

function ProPaywall({ dark, S, desc }: { dark: boolean; S: ReturnType<typeof makeS>; desc: string }) {
  return (
    <div style={{ position: "relative", minHeight: 360, borderRadius: 16, overflow: "hidden", border: `1px solid ${dark ? "#1a1a1a" : "#e8eaed"}`, background: dark ? "#0d0d0d" : "#f9fafb" }}>
      <div style={{ padding: 32, filter: "blur(2px)", pointerEvents: "none", userSelect: "none" }}>
        {[60, 80, 50, 70, 40].map((w, i) => <div key={i} style={{ height: i === 0 ? 20 : 12, width: `${w}%`, background: dark ? "#1a1a1a" : "#e5e7eb", borderRadius: 4, marginBottom: 16 }} />)}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", zIndex: 10 }}>
        <Lock size={24} color={dark ? "#222" : "#d1d5db"} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 20, fontWeight: 400, letterSpacing: "-0.02em", color: dark ? "#fff" : "#111", marginBottom: 8 }}>Dostępne w planie Pro</p>
        <p style={{ fontSize: 13, color: S.textMuted, marginBottom: 28, textAlign: "center", maxWidth: 320 }}>{desc}</p>
        <Link href="/cennik" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", textDecoration: "none" }}>
          Odblokuj za 119 zł/mies.
        </Link>
      </div>
    </div>
  )
}

function KontekstRow({ kontekst, city, voivodeship, pkdCode, dark, S, isPro }: {
  kontekst: FirmaViewProps['kontekst']
  city: string; voivodeship: string; pkdCode: string
  dark: boolean; S: ReturnType<typeof makeS>; isPro: boolean
}) {
  const cityName = sc(city) || "mieście"
  const vojName = sc(voivodeship) || "województwie"
  const pkdShort = pkdCode?.split(/[\s—]/)[0] || ""
  const countMiasto = kontekst?.pkd_count_miasto ?? null
  const countWoj = kontekst?.pkd_count_woj ?? null

  const searchMiasto = `/search?pkd=${pkdShort}&miasto=${encodeURIComponent(city)}`
  const searchWoj = `/search?pkd=${pkdShort}&wojewodztwo=${encodeURIComponent(voivodeship)}`

  if (countMiasto === null && countWoj === null) return null

  function getComment(n: number): { text: string; color: string } {
    if (n === 1) return { text: "Jedyna firma tej branży", color: "#16a34a" }
    if (n <= 5) return { text: "Bardzo mała konkurencja", color: "#16a34a" }
    if (n <= 20) return { text: "Niszowy rynek", color: "#f59e0b" }
    return { text: "Konkurencyjny rynek", color: "#ef4444" }
  }

  const statCards = [
    countMiasto !== null ? { count: countMiasto, label: `podobne firmy w ${cityName}`, comment: getComment(countMiasto), url: searchMiasto } : null,
    countWoj !== null ? { count: countWoj, label: `podobne firmy w woj. ${vojName}`, comment: null, url: searchWoj } : null,
  ].filter(Boolean) as any[]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
      <div style={{ background: dark ? "#0d0d0d" : "#fff", border: `1px solid ${dark ? "#1a1a1a" : "#e8eaed"}`, borderRadius: 14, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 32, fontWeight: 300, letterSpacing: "-0.04em", color: dark ? "#fff" : "#111", margin: 0, lineHeight: 1 }}>
              {card.count.toLocaleString("pl-PL")}
            </p>
            <p style={{ fontSize: 12, color: dark ? "#888" : "#6b7280", margin: 0, lineHeight: 1.4 }}>{card.label}</p>
            {card.comment && (
              <p style={{ fontSize: 11, fontWeight: 600, color: card.comment.color, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: card.comment.color, display: "inline-block" }} />
                {card.comment.text}
              </p>
            )}
            <Link href={card.url} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#2563eb", marginTop: "auto", textDecoration: "none" }}>
              <Search size={11} /> Zobacz firmy →
            </Link>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", background: dark ? "#0d0d0d" : "#fff", border: `1px solid ${dark ? "#1a1a1a" : "#e8eaed"}`, borderRadius: 14, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: S.textMuted, fontWeight: 600, margin: 0 }}>Opis AI</p>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", background: dark ? "#1a1060" : "#ede9fe", color: dark ? "#7c6fff" : "#7c3aed", padding: "2px 7px", borderRadius: 4, textTransform: "uppercase" as const }}>PRO</span>
        </div>
        <div style={{ filter: isPro ? "none" : "blur(3px)", pointerEvents: isPro ? "auto" : "none" }}>
          <p style={{ fontSize: 13, color: dark ? "#555" : "#d1d5db", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
            Firma działa w branży marketingu i reklamy, specjalizując się w obsłudze klientów B2B...
          </p>
        </div>
        {!isPro && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(3px)", borderRadius: 14, gap: 8, zIndex: 10 }}>
            <Sparkles size={18} color="#7c3aed" />
            <p style={{ fontSize: 13, fontWeight: 500, color: dark ? "#aaa" : "#374151", margin: 0, textAlign: "center" }}>Opisy AI w planie Pro</p>
            <Link href="/cennik" style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Odblokuj za 119 zł/mies.</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export function FirmaView(props: FirmaViewProps) {
  const t = useT()
  const [tab, setTab] = useState<Tab>("podstawowe")
  const [userPlan, setUserPlan] = useState<string>("free")
  const [userId, setUserId] = useState<string | null>(null)
  const [isMonitored, setIsMonitored] = useState(false)
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [monitorToast, setMonitorToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [crmLoading, setCrmLoading] = useState(false)
  const [crmAdded, setCrmAdded] = useState(false)
  const { theme } = useTheme()
  const dark = theme === "dark"
  const S = makeS(dark)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [{ data: profile }, { data: monitored }] = await Promise.all([
        supabase.from("user_profiles").select("plan").eq("id", user.id).single(),
        supabase.from("monitored_firms").select("id").eq("user_id", user.id).eq("nip", props.nip).maybeSingle(),
      ])
      if (profile) setUserPlan(profile.plan)
      setIsMonitored(!!monitored)
    })
  }, [props.nip])

  async function handleMonitor() {
    const supabase = createClient()
    if (!userId) { window.location.href = "/login"; return }
    setMonitorLoading(true)
    if (isMonitored) {
      await supabase.rpc("remove_from_monitoring", { p_nip: props.nip })
      setIsMonitored(false)
      showToast(t("firma.toastRemoved"), true)
    } else {
      const { data } = await supabase.rpc("add_to_monitoring", { p_nip: props.nip })
      if (data?.ok) {
        setIsMonitored(true)
        showToast(t("firma.toastAdded"), true)
      } else if (data?.error === "limit") {
        showToast(`Limit monitoringu (${data.limit} firm) osiągnięty`, false)
      } else if (data?.error === "not_found") {
        showToast(t("firma.toastNotFound"), false)
      } else {
        showToast(t("firma.toastError"), false)
      }
    }
    setMonitorLoading(false)
  }

  async function handleAddToCrm() {
    if (!userId) { window.location.href = "/login"; return }
    if (userPlan !== "pro") { window.location.href = "/cennik"; return }
    setCrmLoading(true)
    const supabase = createClient()
    const { data } = await supabase.rpc("add_to_crm", {
      p_nip: props.nip,
      p_nazwa: props.name,
      p_forma_prawna: props.legalForm || null,
      p_miejscowosc: props.address.city || null,
      p_wojewodztwo: props.address.voivodeship || null,
      p_pkd_glowne: props.pkdCodes.find(p => p.isPrimary)?.code || null,
      p_telefon: props.contact.phone || null,
      p_email: props.contact.email || null,
      p_www: props.contact.website || null,
      p_source: "manual",
    })
    setCrmLoading(false)
    if (data?.error === "already_exists") { setCrmAdded(true); showToast("Firma już jest w CRM", true) }
    else if (data?.error === "requires_pro") { window.location.href = "/cennik" }
    else if (data?.error === "limit_reached") { showToast("Limit 500 kontaktów osiągnięty", false) }
    else if (data?.success) { setCrmAdded(true); showToast("Dodano do CRM!", true) }
  }

  function handlePrint() { window.print() }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    showToast("Link skopiowany do schowka!", true)
  }

  function handleExport() {
    showToast("Eksport danych wkrótce dostępny", true)
  }

  function showToast(msg: string, ok: boolean) {
    setMonitorToast({ msg, ok })
    setTimeout(() => setMonitorToast(null), 3000)
  }

  const isPro = userPlan === "basic" || userPlan === "pro"
  const isCEIDG = props.source === "CEIDG"
  const {
    nip, name, regon, krs, statusKrs, legalForm, formaWlasnosci, source,
    registrationDate, dataZawieszenia, dataWznowienia, dataZakonczenia,
    capital, currency, ostatnieSprRok, celDzialania, address, contact,
    representationMethod, representatives, prokurenci, radaNadzorcza,
    shareholders, pkdCodes, krsLink, ownerName, ownerGender, ownerCitizenship,
    organRejestrowy, liczbaPracownikow, flagaRyzyka, restrukturyzacja,
    vatStatus, vatRisk, accountNumbers, zakazyInfo, uprawieniaInfo,
    wspolnoscMajatkowa, adresDoreczenia, kontekst,
  } = props

  const formaWlasnosciDisplay = isCEIDG ? t("firma.valueCeidgForm") : (formaWlasnosci ? sc(formaWlasnosci) : null)
  const st = resolveStatus(statusKrs)
  const age = formatAge(registrationDate)
  const vat = resolveVatStatus(vatStatus)
  const capitalFmt = capital ? fmtCapital(capital, currency) : null
  const mapQ = encodeURIComponent(address.full || `${address.street}, ${address.postalCode} ${address.city}`)
  const primaryPkd = pkdCodes.find(p => p.isPrimary)
  const shareVals = shareholders.map(s => parsePct(s.shares))
  const shareTotal = shareVals.reduce((a, b) => a + b, 0)
  const maxShare = Math.max(...shareVals, 0)
  const hasVatSection = vatStatus !== null
  const hasAccounts = accountNumbers.length > 0
  const flag = countryCodeToFlag(ownerCitizenship)
  const citizenshipName = countryCodeToName(ownerCitizenship)
  const genderIcon = ownerGender === 'F' ? '♀' : ownerGender === 'M' ? '♂' : null
  const genderColor = ownerGender === 'F' ? '#ec4899' : '#2563eb'
  const hasPrivateSection = isCEIDG && (wspolnoscMajatkowa !== null || !!adresDoreczenia)
  const displayName = fmtCompanyName(name)
  const pkdCode = primaryPkd?.code || ''

  const kpiItems = isCEIDG ? [
    { icon: <User size={14} color="#2563eb" />, label: "Właściciel", value: ownerName ? fmtPerson(ownerName) : "—" },
    { icon: <MapPin size={14} color="#2563eb" />, label: "Siedziba", value: sc(address.city) || "—", sub: [address.county, address.voivodeship].filter(Boolean).map(sc).join(", ") },
    { icon: <Building2 size={14} color="#2563eb" />, label: "Forma własności", value: "JDG" },
    { icon: <Briefcase size={14} color="#2563eb" />, label: "PKD główne", value: primaryPkd ? primaryPkd.code : "—", sub: primaryPkd ? sc(primaryPkd.description)?.split(" ").slice(0, 4).join(" ") : "" },
  ] : [
    { icon: <CircleDollarSign size={14} color="#2563eb" />, label: "Kapitał", value: capitalFmt || "—" },
    { icon: <MapPin size={14} color="#2563eb" />, label: "Siedziba", value: sc(address.city) || "—", sub: [address.county, address.voivodeship].filter(Boolean).map(sc).join(", ") },
    { icon: <Users size={14} color="#2563eb" />, label: "Wspólnicy", value: shareholders.length > 0 ? String(shareholders.length) : "—" },
    { icon: <Briefcase size={14} color="#2563eb" />, label: "PKD główne", value: primaryPkd ? primaryPkd.code : "—", sub: primaryPkd ? sc(primaryPkd.description)?.split(" ").slice(0, 4).join(" ") : "" },
  ]

  const TABS: { key: Tab; label: string; sub: string; pro: boolean; icon: React.ReactNode }[] = [
    { key: "podstawowe", label: t("firma.tabBasic"), sub: t("firma.tabBasicSub"), pro: false, icon: <Building2 size={14} /> },
    { key: "finanse",    label: t("firma.tabFinance"), sub: t("firma.tabFinanceSub"),    pro: true,  icon: <TrendingUp size={14} /> },
    { key: "ryzyko",     label: t("firma.tabRisk"), sub: t("firma.tabRiskSub"),         pro: true,  icon: <Shield size={14} /> },
    { key: "sygnaly",    label: t("firma.tabSignals"), sub: t("firma.tabSignalsSub"),       pro: true,  icon: <Zap size={14} /> },
    { key: "dotacje",    label: t("firma.tabGrants"), sub: t("firma.tabGrantsSub"), pro: true,  icon: <Globe size={14} /> },
  ]

  const PRO_DESC: Partial<Record<Tab, string>> = {
    finanse: "Sprawozdania finansowe, wyniki finansowe, bilans, zadłużenie i historia płatności",
    ryzyko: "Scoring kredytowy, powiązania kapitałowo-osobowe, alerty zmian rejestrowych",
    sygnaly: "Zdarzenia rejestrowe jako sygnały zakupowe — nowy zarząd, wzrost kapitału, zmiana adresu, nowe PKD",
    dotacje: "Dotacje UE, pomoc publiczna PARP, wygrane przetargi, projekty dofinansowane",
  }

  // Build CEIDG link
  const ceidgLink = isCEIDG
    ? `https://www.biznes.gov.pl/pl/wyszukiwarka-firm/wyniki-wyszukiwania-nip/firma/${nip}`
    : krsLink

  return (
    <div style={{ color: S.text, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ha0{animation:fadeUp 0.4s ease both} .ha1{animation:fadeUp 0.4s 0.05s ease both}
        .ha2{animation:fadeUp 0.4s 0.1s ease both} .ha3{animation:fadeUp 0.4s 0.15s ease both}
        .ha4{animation:fadeUp 0.4s 0.2s ease both} .ha5{animation:fadeUp 0.4s 0.25s ease both}
        .tab-btn:hover{opacity:0.8}
      `}</style>

      {/* Toast */}
      {monitorToast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: monitorToast.ok ? "#16a34a" : "#ef4444", color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "toastIn 0.2s ease" }}>
          {monitorToast.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
          {monitorToast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px 80px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 20, textDecoration: "none" }}>
          <ChevronLeft size={13} /> Powrót do wyników
        </Link>

        {restrukturyzacja && typeof restrukturyzacja === "object" && Object.keys(restrukturyzacja).length > 0 && (
          <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #fde68a", background: "#fffbeb", marginBottom: 12 }}>
            <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>{sc(restrukturyzacja.typ || restrukturyzacja.rodzaj || "Postępowanie restrukturyzacyjne / upadłościowe")}</p>
          </div>
        )}
        {vatRisk && (
          <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #fecaca", background: dark ? "#1a0808" : "#fef2f2", marginBottom: 12 }}>
            <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: dark ? "#fca5a5" : "#991b1b", margin: 0 }}><strong>Uwaga:</strong> Firma aktywna w rejestrze, ale nie figuruje jako czynny podatnik VAT ({vatStatus}).</p>
          </div>
        )}
        {zakazyInfo && (
          <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #fecaca", background: dark ? "#1a0808" : "#fef2f2", marginBottom: 12 }}>
            <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: dark ? "#fca5a5" : "#991b1b", margin: 0 }}><strong>Zakazy:</strong> {zakazyInfo}</p>
          </div>
        )}

        {/* Hero */}
        <div style={{ marginBottom: 20 }}>
          <div className="ha0" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}33`, padding: "3px 10px", borderRadius: 100 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, display: "inline-block" }} />{st.label.toUpperCase()}
            </span>
            {legalForm && <span style={{ fontSize: 11, fontWeight: 500, color: dark ? "#555" : "#6b7280", background: dark ? "#161616" : "#f3f4f6", border: `1px solid ${dark ? "#222" : "#e5e7eb"}`, padding: "3px 10px", borderRadius: 100 }}>{sc(legalForm)}</span>}
            <span style={{ fontSize: 11, fontWeight: 600, color: isCEIDG ? "#16a34a" : "#2563eb", background: isCEIDG ? (dark ? "#0d2218" : "#f0fdf4") : (dark ? "#0f1f44" : "#eff6ff"), border: `1px solid ${isCEIDG ? (dark ? "#14532d" : "#bbf7d0") : (dark ? "#1a3a7a" : "#bfdbfe")}`, padding: "3px 10px", borderRadius: 100 }}>{source}</span>
            {vatStatus && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: vat.color, background: `${vat.color}18`, border: `1px solid ${vat.color}33`, padding: "3px 10px", borderRadius: 100 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: vat.color, display: "inline-block" }} />VAT {vat.label.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="ha1" style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, color: dark ? "#fff" : "#111", marginBottom: 10, marginTop: 0 }}>{displayName}</h1>
          <div className="ha2" style={{ display: "flex", flexWrap: "wrap", gap: "5px 20px", alignItems: "center" }}>
            {[{ label: "NIP", value: nip }, ...(krs ? [{ label: "KRS", value: krs }] : []), ...(regon ? [{ label: "REGON", value: formatRegon(regon) }] : [])].map(({ label, value }) => (
              <span key={label} style={{ fontSize: 12, color: dark ? "#444" : "#9ca3af" }}>
                {label} <span style={{ color: dark ? "#aaa" : "#374151", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>{value}</span>
              </span>
            ))}
            {age && (
              <span style={{ fontSize: 11, fontWeight: 600, color: age.color, background: dark ? `${age.color}22` : age.bg, border: `1px solid ${age.color}33`, padding: "2px 8px", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Calendar size={9} />{age.label}
              </span>
            )}
          </div>
        </div>

        {/* KPI strip */}
        <div className="ha3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: dark ? "#111" : "#fff", border: `1px solid ${S.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
          {kpiItems.map((kpi, i) => (
            <div key={i} style={{ padding: "14px 18px", borderRight: i < 3 ? `1px solid ${S.border}` : "none" }}>
              <div style={{ marginBottom: 7 }}>{kpi.icon}</div>
              <p style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: S.textMuted, fontWeight: 600, marginBottom: 4 }}>{kpi.label}</p>
              <p style={{ fontSize: 16, fontWeight: 500, color: dark ? "#fff" : "#111", letterSpacing: "-0.02em", margin: 0 }}>{kpi.value}</p>
              {"sub" in kpi && kpi.sub && <p style={{ fontSize: 10, color: dark ? "#444" : "#9ca3af", marginTop: 2, lineHeight: 1.4 }}>{kpi.sub}</p>}
            </div>
          ))}
        </div>

        {/* Kontekst + AI */}
        <div className="ha4">
          <KontekstRow kontekst={kontekst} city={address.city} voivodeship={address.voivodeship} pkdCode={pkdCode} dark={dark} S={S} isPro={isPro} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#e8eaed"}`, marginBottom: 24, overflowX: "auto" }}>
          {TABS.map((tb, idx) => {
            const active = tab === tb.key
            return (
              <button key={tb.key} onClick={() => setTab(tb.key)} className="tab-btn" style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "12px 20px", cursor: "pointer",
                background: active ? (dark ? "#0d1929" : "#f0f7ff") : "none",
                border: "none", borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                borderRight: idx < TABS.length - 1 ? `1px solid ${dark ? "#1a1a1a" : "#e8eaed"}` : "none",
                color: active ? "#2563eb" : (dark ? "#555" : "#6b7280"),
                whiteSpace: "nowrap", minWidth: 110, transition: "all 0.15s",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: active ? 600 : 400, marginBottom: 2 }}>
                  {tb.icon}{tb.label}{tb.pro ? <ProBadge dark={dark} /> : <FreeBadge dark={dark} />}
                </span>
                <span style={{ fontSize: 10, color: active ? "#2563eb99" : (dark ? "#333" : "#bbb") }}>{tb.sub}</span>
              </button>
            )
          })}
        </div>

        {tab === "podstawowe" && (
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Dane rejestrowe */}
              <div style={S.card}>
                <div style={S.cardHeader}><span style={S.label}>Dane rejestrowe</span></div>
                <Field S={S} label={t("firma.fieldName")} value={displayName} />
                <Field S={S} label={t("firma.fieldLegalForm")} value={sc(legalForm)} />
                <Field S={S} label={t("firma.fieldOwnership")} value={formaWlasnosciDisplay} />
                <Field S={S} label={t(isCEIDG ? "firma.fieldStartDate" : "firma.fieldRegDate")} value={fmtDate(registrationDate) || undefined} />
                {dataZawieszenia && <Field S={S} label={t("firma.fieldSuspDate")} value={fmtDate(dataZawieszenia)} />}
                {dataWznowienia && <Field S={S} label={t("firma.fieldResumeDate")} value={fmtDate(dataWznowienia)} />}
                {dataZakonczenia && <Field S={S} label={t("firma.fieldEndDate")} value={fmtDate(dataZakonczenia)} />}
                <Field S={S} label={t("firma.fieldAddress")} value={address.full || undefined} />
                {address.voivodeship && <Field S={S} label={t("firma.fieldVoivodeship")} value={sc(address.voivodeship)} />}
                {krs && <Field S={S} label={t("firma.fieldKrs")} value={krs} />}
                {regon && <Field S={S} label={t("firma.fieldRegon")} value={formatRegon(regon)} />}
                <Field S={S} label={t("firma.fieldNip")} value={nip} />
                {!isCEIDG && capitalFmt && <Field S={S} label={t("firma.fieldCapital")} value={capitalFmt} />}
                {ownerName && <Field S={S} label={t("firma.fieldOwner")} value={fmtPerson(ownerName)} />}
                {organRejestrowy && <Field S={S} label={t("firma.fieldOrgan")} value={sc(organRejestrowy)} />}
                {liczbaPracownikow && <Field S={S} label={t("firma.fieldEmployees")} value={liczbaPracownikow} />}
                {!isCEIDG && ostatnieSprRok && <Field S={S} label={t("firma.fieldLastReport")} value={String(ostatnieSprRok)} />}
                {!isCEIDG && celDzialania && <Field S={S} label={t("firma.fieldPurpose")} value={sc(celDzialania)} />}
                {flagaRyzyka && <Field S={S} label="Flaga ryzyka"><span style={{ color: "#ef4444", fontWeight: 600 }}>⚠ Wykryto ryzyko</span></Field>}
                {isCEIDG && uprawieniaInfo && <Field S={S} label={t("firma.fieldPermits")} value={uprawieniaInfo} />}
              </div>

              {isCEIDG && ownerName && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Właściciel</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ ...S.avatar, width: 44, height: 44, fontSize: 15, background: ownerGender === 'F' ? (dark ? "#2d1030" : "#fdf2f8") : (dark ? "#1a2444" : "#eff6ff"), border: `1px solid ${ownerGender === 'F' ? (dark ? "#7c3aed44" : "#f9a8d4") : (dark ? "#2a3a6a" : "#bfdbfe")}`, color: ownerGender === 'F' ? "#ec4899" : "#2563eb" }}>
                        {getInitials(ownerName) || "?"}
                      </div>
                      {genderIcon && <span style={{ position: "absolute", bottom: -2, right: -4, fontSize: 12, color: genderColor }}>{genderIcon}</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 500, color: S.textValue, margin: 0 }}>{fmtPerson(ownerName)}</p>
                      <p style={{ fontSize: 11, color: S.textMuted, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {ownerGender === 'F' ? 'Właścicielka' : 'Właściciel'} / JDG
                        {flag && ownerCitizenship !== 'PL' && <span style={{ marginLeft: 8 }}>{flag} {citizenshipName}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hasPrivateSection && (
                <div style={S.card}>
                  <div style={S.cardHeader}>
                    <span style={S.label}>Dane dodatkowe</span>
                    {!isPro && <span style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", background: dark ? "#1a1060" : "#ede9fe", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em" }}>BASIC+</span>}
                  </div>
                  <div style={{ filter: isPro ? "none" : "blur(5px)", pointerEvents: isPro ? "auto" : "none", userSelect: isPro ? "auto" : "none" }}>
                    {wspolnoscMajatkowa !== null && (
                      <Field S={S} label={t("firma.fieldSpouseProperty")}>
                        <span style={{ color: wspolnoscMajatkowa ? "#f59e0b" : S.textValue, fontWeight: wspolnoscMajatkowa ? 600 : 400 }}>
                          {wspolnoscMajatkowa ? "⚠ Tak — ustrój wspólności" : "Nie (rozdzielność)"}
                        </span>
                      </Field>
                    )}
                    {adresDoreczenia && <Field S={S} label="Adres e-Doręczeń"><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{adresDoreczenia}</span></Field>}
                  </div>
                  {!isPro && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${S.borderLight}`, gap: 4 }}>
                      <Lock size={13} color={dark ? "#444" : "#d1d5db"} />
                      <p style={{ fontSize: 12, fontWeight: 500, color: dark ? "#aaa" : "#374151", margin: 0 }}>Dane dodatkowe w planie Basic+</p>
                      <Link href="/cennik" style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>Odblokuj za 49 zł/mies.</Link>
                    </div>
                  )}
                </div>
              )}

              {hasVatSection && (
                <div style={S.card}>
                  <div style={S.cardHeader}>
                    <span style={S.label}>VAT / Biała Lista MF</span>
                    {!isPro && hasAccounts && <span style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", background: dark ? "#1a1060" : "#ede9fe", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em" }}>BASIC+</span>}
                  </div>
                  <Field S={S} label={t("firma.sectionVat")}>
                    <span style={{ color: vat.color, fontWeight: 600 }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: vat.color, marginRight: 6, verticalAlign: "middle" }} />{vat.label}
                    </span>
                  </Field>
                  {hasAccounts && (
                    <>
                      <div style={{ filter: isPro ? "none" : "blur(5px)", pointerEvents: isPro ? "auto" : "none", userSelect: isPro ? "auto" : "none" }}>
                        {accountNumbers.map((acc, i) => (
                          <Field key={i} S={S} label={i === 0 ? "Konto bankowe" : `Konto ${i + 1}`}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.04em" }}>{formatIban(acc)}</span>
                          </Field>
                        ))}
                      </div>
                      {!isPro && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${S.borderLight}`, gap: 4 }}>
                          <Lock size={13} color={dark ? "#444" : "#d1d5db"} />
                          <p style={{ fontSize: 12, fontWeight: 500, color: dark ? "#aaa" : "#374151", margin: 0 }}>Numery kont w planie Basic+</p>
                          <Link href="/cennik" style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>Odblokuj za 49 zł/mies.</Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {(contact.phone || contact.phoneMobile || contact.email || contact.website || contact.googleRating) && (
                <div style={{ ...S.card, position: "relative" }}>
                  <div style={S.cardHeader}>
                    <span style={S.label}>Kontakt</span>
                    {!isPro && <span style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", background: dark ? "#1a1060" : "#ede9fe", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em" }}>BASIC+</span>}
                  </div>
                  <div style={{ filter: isPro ? "none" : "blur(5px)", pointerEvents: isPro ? "auto" : "none", userSelect: isPro ? "auto" : "none" }}>
                    {contact.phone && <Field S={S} label="Tel" value={contact.phone} />}
                    {contact.phoneMobile && <Field S={S} label="Komórkowy" value={contact.phoneMobile} />}
                    {contact.email && <Field S={S} label="E-mail" value={contact.email} />}
                    {contact.website && <Field S={S} label="Strona WWW"><a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>{contact.website}</a></Field>}
                    {contact.googleRating != null && <Field S={S} label="Ocena Google"><span style={{ color: "#f59e0b", fontWeight: 600 }}>★ {contact.googleRating.toFixed(1)}</span></Field>}
                  </div>
                  {!isPro && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.75)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)", borderRadius: 16, zIndex: 10, gap: 6 }}>
                      <Lock size={16} color={dark ? "#444" : "#d1d5db"} />
                      <p style={{ fontSize: 12, fontWeight: 500, color: dark ? "#aaa" : "#374151", margin: 0 }}>Dane kontaktowe w planie Basic+</p>
                      <Link href="/cennik" style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>Odblokuj za 49 zł/mies.</Link>
                    </div>
                  )}
                </div>
              )}

              {!isCEIDG && representatives.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Zarząd</span><span style={{ fontSize: 11, color: S.textMuted }}>{representatives.length}</span></div>
                  {representatives.map((r, i) => <PersonRow S={S} key={i} rep={r} />)}
                  {representationMethod && (
                    <div style={{ padding: "14px 20px", borderTop: `1px solid ${S.borderLight}` }}>
                      <p style={{ ...S.label, marginBottom: 6 }}>Sposób reprezentacji</p>
                      <p style={{ fontSize: 13, color: S.textMuted, lineHeight: 1.6, margin: 0, background: dark ? "#0d0d0d" : "#f9fafb", padding: "10px 14px", borderRadius: 8, border: `1px solid ${S.borderLight}` }}>{sc(representationMethod)}</p>
                    </div>
                  )}
                </div>
              )}
              {!isCEIDG && prokurenci.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Prokurenci</span></div>
                  {prokurenci.map((p, i) => <PersonRow S={S} key={i} rep={p} />)}
                </div>
              )}
              {!isCEIDG && radaNadzorcza.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Rada nadzorcza</span></div>
                  {radaNadzorcza.map((r, i) => <PersonRow S={S} key={i} rep={r} />)}
                </div>
              )}
              {!isCEIDG && shareholders.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Wspólnicy</span><span style={{ fontSize: 12, color: S.textMuted }}>{shareholders.length}</span></div>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderLight}` }}>
                    {shareholders.map((s, i) => {
                      const pct = shareTotal > 0 ? (shareVals[i] / shareTotal) * 100 : 100 / shareholders.length
                      const isTop = shareVals[i] !== 0 && shareVals[i] === maxShare
                      return (
                        <div key={i} style={{ marginBottom: i < shareholders.length - 1 ? 14 : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                            <span style={{ color: dark ? "#aaa" : "#374151" }}>{fmtPerson(s.name)}</span>
                            <span style={{ color: S.textMuted, fontFamily: "'DM Mono', monospace" }}>{shareVals[i] > 0 ? `${shareVals[i]}%` : `${Math.round(pct)}%`}</span>
                          </div>
                          <div style={{ height: 3, borderRadius: 2, background: dark ? "#1e1e1e" : "#f3f4f6" }}>
                            <div style={{ height: 3, borderRadius: 2, width: `${pct}%`, background: isTop ? "#2563eb" : "#d1d5db", transition: "width 0.8s ease" }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {shareholders.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: `1px solid ${S.borderLight}` }}>
                      <div style={S.avatar}>{getInitials(s.name) || "?"}</div>
                      <p style={{ flex: 1, fontSize: 13, color: S.textValue, margin: 0 }}>{fmtPerson(s.name)}</p>
                      {s.shares && <span style={{ fontSize: 11, color: S.textMuted, fontFamily: "'DM Mono', monospace" }}>{fmtShares(s.shares)}</span>}
                    </div>
                  ))}
                </div>
              )}
              {pkdCodes.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.label}>Przedmiot działalności (PKD)</span><span style={{ fontSize: 12, color: S.textMuted }}>{pkdCodes.length} kodów</span></div>
                  {pkdCodes.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "11px 20px", borderBottom: `1px solid ${S.borderLight}` }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: p.isPrimary ? "#2563eb" : S.textMuted, flexShrink: 0, width: 52, paddingTop: 1, fontWeight: p.isPrimary ? 600 : 400 }}>{p.code}</span>
                      <p style={{ flex: 1, fontSize: 13, color: p.isPrimary ? S.textValue : S.textMuted, lineHeight: 1.5, margin: 0 }}>{sc(p.description)}</p>
                      {p.isPrimary && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#2563eb", background: dark ? "#0f1f44" : "#eff6ff", padding: "2px 6px", borderRadius: 4, flexShrink: 0, textTransform: "uppercase" }}>główna</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ width: 260, flexShrink: 0, position: "sticky", top: 72, alignSelf: "flex-start" }}>
              {/* Mapa */}
              <div style={{ ...S.card, overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "4/3" }}>
                  <iframe src={`https://maps.google.com/maps?q=${mapQ}&output=embed&z=14`} style={{ width: "100%", height: "100%", border: 0, display: "block" }} title="Lokalizacja" loading="lazy" />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noopener noreferrer" style={{ position: "absolute", bottom: 8, right: 8, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.9)", padding: "3px 8px", borderRadius: 5, fontSize: 11, color: "#374151" }}>
                    <ExternalLink size={9} /> Otwórz
                  </a>
                </div>
                {address.full && <div style={{ padding: "10px 14px", borderTop: `1px solid ${S.border}` }}><p style={{ fontSize: 11, color: S.textMuted, lineHeight: 1.5, margin: 0 }}>{address.full}</p></div>}
              </div>

              {/* Akcje */}
              <div style={S.card}>
                <div style={S.cardHeader}><span style={S.label}>Akcje</span></div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                  {/* Obserwuj */}
                  <button onClick={handleMonitor} disabled={monitorLoading}
                    style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", background: isMonitored ? (dark ? "#0d2218" : "#f0fdf4") : "#2563eb", color: isMonitored ? "#16a34a" : "#fff", border: isMonitored ? "1px solid #bbf7d0" : "none", opacity: monitorLoading ? 0.7 : 1 }}>
                    {monitorLoading ? <span style={{ fontSize: 12 }}>...</span> : isMonitored ? <><BellOff size={13} /> Obserwowane ✓</> : <><Bell size={13} /> Obserwuj</>}
                  </button>

                  {/* Dodaj do CRM */}
                  <button onClick={handleAddToCrm} disabled={crmLoading || crmAdded}
                    style={{ ...S.btnOutline, width: "100%", justifyContent: "center", fontSize: 12, background: crmAdded ? (dark ? "#0d2218" : "#f0fdf4") : S.btnOutline.background, color: crmAdded ? "#16a34a" : S.btnOutline.color, border: crmAdded ? "1px solid #bbf7d0" : S.btnOutline.border, opacity: crmLoading ? 0.7 : 1 }}>
                    {crmLoading ? "..." : crmAdded ? <><Check size={12} /> W CRM</> : <><Building2 size={12} /> Dodaj do CRM</>}
                  </button>

                  {/* Eksportuj */}
                  <button onClick={handleExport} style={{ ...S.btnOutline, width: "100%", justifyContent: "flex-start", fontSize: 12 }}>
                    <Download size={12} /> Eksportuj dane
                  </button>

                  {/* Drukuj */}
                  <button onClick={handlePrint} style={{ ...S.btnOutline, width: "100%", justifyContent: "flex-start", fontSize: 12 }}>
                    <Printer size={12} /> {t("firma.btnPrint")}
                  </button>

                  {/* Udostępnij */}
                  <button onClick={handleShare} style={{ ...S.btnOutline, width: "100%", justifyContent: "flex-start", fontSize: 12 }}>
                    <Share2 size={12} /> {t("firma.btnShare")}
                  </button>

                  {/* Zgłoś błąd */}
                  <button onClick={() => showToast("Dziękujemy za zgłoszenie!", true)} style={{ ...S.btnOutline, width: "100%", justifyContent: "flex-start", fontSize: 12 }}>
                    <Flag size={12} /> {t("firma.btnReportError")}
                  </button>

                  {/* Wpis w rejestrze */}
                  {ceidgLink && (
                    <a href={ceidgLink} target="_blank" rel="noopener noreferrer" style={{ ...S.btnOutline, width: "100%", justifyContent: "flex-start", fontSize: 12, textDecoration: "none" }}>
                      <ExternalLink size={12} /> Wpis w {source}
                    </a>
                  )}
                </div>
              </div>

              {/* Pro CTA — tylko dla non-pro */}
              {!isPro && (
                <div style={{ background: dark ? "linear-gradient(135deg, #0f1f44 0%, #0a0a2a 100%)" : "#eff6ff", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 14, padding: 16 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase", marginBottom: 5 }}>Plan Pro</p>
                  <p style={{ fontSize: 12, fontWeight: 400, color: dark ? "#ccc" : "#374151", lineHeight: 1.5, marginBottom: 14 }}>Finanse, ryzyko, sygnały i dotacje — pełny obraz firmy</p>
                  <Link href="/cennik" style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", textDecoration: "none", fontSize: 12 }}>Odblokuj za 119 zł/mies.</Link>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === "finanse" && (isPro ? <div style={{ padding: 32, color: S.text, fontSize: 14 }}>Sprawozdania finansowe — wkrótce dostępne</div> : <ProPaywall dark={dark} S={S} desc={PRO_DESC.finanse!} />)}
        {tab === "ryzyko" && (isPro ? <div style={{ padding: 32, color: S.text, fontSize: 14 }}>Scoring i powiązania — wkrótce dostępne</div> : <ProPaywall dark={dark} S={S} desc={PRO_DESC.ryzyko!} />)}
        {tab === "sygnaly" && (isPro ? <div style={{ padding: 32, color: S.text, fontSize: 14 }}>Sygnały zakupowe — wkrótce dostępne</div> : <ProPaywall dark={dark} S={S} desc={PRO_DESC.sygnaly!} />)}
        {tab === "dotacje" && (isPro ? <div style={{ padding: 32, color: S.text, fontSize: 14 }}>Dotacje UE — wkrótce dostępne</div> : <ProPaywall dark={dark} S={S} desc={PRO_DESC.dotacje!} />)}
      </div>

      <footer style={{ borderTop: `1px solid ${dark ? "#111" : "#e8eaed"}`, padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: S.textMuted, margin: 0 }}>
          Dane z {source === "KRS" ? "Krajowego Rejestru Sądowego" : "Centralnej Ewidencji i Informacji o Działalności Gospodarczej"}. Informacje mają charakter poglądowy.
        </p>
      </footer>
    </div>
  )
}