"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Download, Bell, Shield, FileText, TrendingUp, User, ChevronRight,
  AlertCircle, RefreshCw, Check, Building2, CreditCard, Receipt,
  ExternalLink, LayoutDashboard, Eye, Trash2, X, MapPin, Activity
} from "lucide-react"

type UserProfile = {
  id: string
  plan: string
  plan_expires_at: string | null
  trial_ends_at: string | null
  is_trial: boolean
  export_records_used_month: number
  export_records_limit: number
  monitoring_limit: number
  full_name: string | null
  company_name: string | null
  nip: string | null
  address: string | null
  billing_email: string | null
}

type Export = {
  id: string
  status: string
  record_count: number | null
  created_at: string
  filters: any
  file_url: string | null
  columns_selected: string[] | null
}

type Invoice = {
  id: string
  created_at: string
  amount: number
  status: string
  invoice_number: string | null
  pdf_url: string | null
  description: string | null
}

type MonitoredFirm = {
  id: string
  nip: string
  nazwa: string | null
  zrodlo: "KRS" | "CEIDG"
  added_at: string
  last_checked: string | null
}

type FirmAlert = {
  id: string
  nip: string
  nazwa: string | null
  zrodlo: "KRS" | "CEIDG"
  typ: string
  opis: string
  wartosc_stara: string | null
  wartosc_nowa: string | null
  is_read: boolean
  created_at: string
}

type Tab = "przeglad" | "eksporty" | "monitoring" | "konto" | "faktury"

const ALERT_ICONS: Record<string, string> = {
  adres: "📍", status: "⚡", kapital: "💰", zarzad: "👤",
  pkd: "🏷️", prokura: "📋", default: "🔔",
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [exports, setExports] = useState<Export[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monitored, setMonitored] = useState<MonitoredFirm[]>([])
  const [alerts, setAlerts] = useState<FirmAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [removingNip, setRemovingNip] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: "", company_name: "", nip: "", address: "", billing_email: "" })
  const [activeTab, setActiveTab] = useState<Tab>("przeglad")
  const [alertFilter, setAlertFilter] = useState<"all" | "unread">("unread")
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const text = dark ? "#f5f5f5" : "#111"
  const muted = dark ? "#555" : "#9ca3af"
  const card = dark ? "#111" : "#fff"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const sub = dark ? "#0d0d0d" : "#f8f9fb"
  const hover = dark ? "#1a1a1a" : "#f9fafb"
  const divider = dark ? "#1a1a1a" : "#f3f4f6"
  const inputBorder = dark ? "#2a2a2a" : "#e8eaed"

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)
      const [{ data: p }, { data: exp }, { data: inv }, { data: mon }, { data: alr }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", user.id).single(),
        supabase.from("exports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("monitored_firms").select("*").eq("user_id", user.id).order("added_at", { ascending: false }),
        supabase.from("firm_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      ])
      setProfile(p)
      setExports(exp ?? [])
      setInvoices(inv ?? [])
      setMonitored(mon ?? [])
      setAlerts(alr ?? [])
      if (p) setForm({
        full_name: p.full_name ?? "",
        company_name: p.company_name ?? "",
        nip: p.nip ?? "",
        address: p.address ?? "",
        billing_email: p.billing_email ?? user.email ?? "",
      })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await supabase.from("user_profiles").update({
      full_name: form.full_name || null,
      company_name: form.company_name || null,
      nip: form.nip || null,
      address: form.address || null,
      billing_email: form.billing_email || null,
    }).eq("id", user.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleRemoveMonitored(nip: string) {
    setRemovingNip(nip)
    await supabase.rpc("remove_from_monitoring", { p_nip: nip })
    setMonitored(prev => prev.filter(f => f.nip !== nip))
    setRemovingNip(null)
  }

  async function handleMarkAllRead() {
    await supabase.from("firm_alerts").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
  }

  async function handleMarkRead(id: string) {
    await supabase.from("firm_alerts").update({ is_read: true }).eq("id", id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: muted, fontSize: 14 }}>Ładowanie...</p>
    </div>
  )

  // ── Helpers ───────────────────────────────────────────────────────────────
  const planLabel = profile?.plan === "pro" ? "Pro" : profile?.plan === "basic" ? "Basic" : "Free"
  const planColor = profile?.plan === "pro" ? "#2563eb" : profile?.plan === "basic" ? "#7c3aed" : "#6b7280"
  const planExpiry = profile?.trial_ends_at || profile?.plan_expires_at
  const planExpiryDate = planExpiry ? new Date(planExpiry).toLocaleDateString("pl-PL") : null
  const exportUsed = profile?.export_records_used_month ?? 0
  const exportLimit = profile?.export_records_limit ?? 0
  const exportPct = exportLimit > 0 ? Math.min((exportUsed / exportLimit) * 100, 100) : 0
  const remaining = exportLimit - exportUsed
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0)
  const monitoringLimit = profile?.monitoring_limit ?? 0
  const monitoringCount = monitored.length
  const unreadCount = alerts.filter(a => !a.is_read).length
  const filteredAlerts = alertFilter === "unread" ? alerts.filter(a => !a.is_read) : alerts

  const planFeatures: Record<string, string[]> = {
    free:  ["10 wyników wyszukiwania", "Przeglądanie kart firm", "Brak eksportu"],
    basic: ["25 wyników / strona", "1 000 eksportów / mies.", "20 firm w monitoringu", "Dane kontaktowe", "30 zapytań AI / dzień"],
    pro:   ["25 wyników / strona", "5 000 eksportów / mies.", "100 firm w monitoringu", "Historia zmian", "100 zapytań AI / dzień", "Priorytetowe wsparcie"],
  }

  const exportStatus: Record<string, { label: string; bg: string; color: string }> = {
    ready:      { label: "Gotowy",  bg: "#dcfce7", color: "#16a34a" },
    pending:    { label: "W toku",  bg: "#fef3c7", color: "#92400e" },
    failed:     { label: "Błąd",    bg: "#fee2e2", color: "#dc2626" },
    downloaded: { label: "Pobrany", bg: dark ? "#1a1a1a" : "#f3f4f6", color: muted },
  }

  const invoiceStatus: Record<string, { label: string; bg: string; color: string }> = {
    paid:     { label: "Opłacona",   bg: "#dcfce7", color: "#16a34a" },
    pending:  { label: "Oczekująca", bg: "#fef3c7", color: "#92400e" },
    failed:   { label: "Nieudana",   bg: "#fee2e2", color: "#dc2626" },
    refunded: { label: "Zwrot",      bg: dark ? "#1a1a1a" : "#f3f4f6", color: muted },
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" })
  }
  function fmtDateTime(d: string) {
    return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }
  function fmtAmount(n: number) {
    return (n / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " zł"
  }
  function fmtFilters(f: any) {
    if (!f) return "Wszystkie firmy"
    const p: string[] = []
    if (f.query) p.push(f.query)
    if (f.miasto) p.push(f.miasto)
    if (f.wojewodztwo) p.push(f.wojewodztwo)
    if (f.pkd) p.push(`PKD: ${f.pkd}`)
    if (f.rejestr) p.push(f.rejestr)
    return p.length ? p.join(" · ") : "Wszystkie firmy"
  }
  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min temu`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h temu`
    return fmtDate(d)
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 13, color: text,
    background: sub, border: `1px solid ${inputBorder}`, borderRadius: 10,
    outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase",
    letterSpacing: "0.06em", display: "block", marginBottom: 6,
  }
  const tableHeaderStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.06em", textTransform: "uppercase",
  }
  function sectionHead(icon: React.ReactNode, title: string, extra?: React.ReactNode) {
    return (
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{title}</span>
        </div>
        {extra}
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "przeglad",   label: "Przegląd",  icon: <LayoutDashboard size={14} /> },
    { id: "eksporty",   label: "Eksporty",  icon: <Download size={14} /> },
    { id: "monitoring", label: "Monitoring", icon: <Bell size={14} />, badge: unreadCount },
    { id: "konto",      label: "Konto",     icon: <User size={14} /> },
    { id: "faktury",    label: "Faktury",   icon: <Receipt size={14} /> },
  ]

  // ── Tab: PRZEGLĄD ─────────────────────────────────────────────────────────
  const TabPrzeglad = () => (
    <div>
      {/* Plan card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color={planColor} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: muted, textTransform: "uppercase", margin: 0 }}>Aktualny plan</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: planColor, margin: 0 }}>{planLabel}</p>
                {profile?.is_trial && <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>Trial</span>}
              </div>
              {planExpiryDate && <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>Ważny do: {planExpiryDate}</p>}
            </div>
          </div>
          {profile?.plan === "free"
            ? <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>Upgrade</Link>
            : <p style={{ fontSize: 12, color: muted }}>{planExpiryDate ? `Ważny do: ${planExpiryDate}` : "Aktywny"}</p>
          }
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: sub, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Download size={14} color={muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Eksport</span>
            </div>
            {exportLimit > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: text }}>{exportUsed.toLocaleString("pl-PL")} użytych</span>
                  <span style={{ color: muted }}>{exportLimit.toLocaleString("pl-PL")} limit</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${exportPct}%`, background: exportPct > 80 ? "#ef4444" : "#2563eb", transition: "width 0.5s" }} />
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Niedostępny w planie Free</p>
            )}
          </div>
          <div style={{ background: sub, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Bell size={14} color={muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Monitoring</span>
            </div>
            {monitoringLimit > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: text }}>{monitoringCount} obserwowanych</span>
                  <span style={{ color: muted }}>{monitoringLimit} limit</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${Math.min((monitoringCount / monitoringLimit) * 100, 100)}%`, background: "#7c3aed", transition: "width 0.5s" }} />
                </div>
                {unreadCount > 0 && (
                  <button onClick={() => setActiveTab("monitoring")} style={{ marginTop: 8, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    {unreadCount} {unreadCount === 1 ? "nowy alert" : "nowe alerty"}
                  </button>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Niedostępny w planie Free</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Ostatnie alerty */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={15} color="#ef4444" />
              <span style={{ fontSize: 13, fontWeight: 600, color: text }}>Ostatnie alerty</span>
              {unreadCount > 0 && <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "1px 7px", borderRadius: 100, fontWeight: 600 }}>{unreadCount}</span>}
            </div>
            <button onClick={() => setActiveTab("monitoring")} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, padding: 0 }}>
              Wszystkie <ChevronRight size={12} />
            </button>
          </div>
          {alerts.filter(a => !a.is_read).length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <Bell size={24} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>Brak nowych alertów</p>
              <p style={{ fontSize: 12, color: dark ? "#333" : "#d1d5db", marginTop: 4 }}>
                {monitoringCount > 0 ? "Obserwujesz " + monitoringCount + " firm" : "Dodaj firmy do monitoringu"}
              </p>
            </div>
          ) : alerts.filter(a => !a.is_read).slice(0, 5).map((a, i, arr) => (
            <div key={a.id} onClick={() => handleMarkRead(a.id)}
              style={{ padding: "12px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = hover)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{ALERT_ICONS[a.typ] ?? ALERT_ICONS.default}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nazwa ?? a.nip}</p>
                <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{a.opis}</p>
              </div>
              <span style={{ fontSize: 10, color: muted, flexShrink: 0 }}>{timeAgo(a.created_at)}</span>
            </div>
          ))}
        </div>

        {/* Szybkie akcje */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${divider}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: text }}>Szybkie akcje</span>
          </div>
          {[
            { icon: <TrendingUp size={16} color="#2563eb" />, label: "Wyszukaj firmy", sub: "Znajdź leady po PKD, mieście, formie", href: "/search" },
            { icon: <Bell size={16} color="#7c3aed" />, label: "Monitoring", sub: `${monitoringCount} obserwowanych firm`, action: () => setActiveTab("monitoring") },
            { icon: <FileText size={16} color="#16a34a" />, label: "Historia eksportów", sub: "Pobierz poprzednie listy CSV", action: () => setActiveTab("eksporty") },
            { icon: <User size={16} color="#f59e0b" />, label: "Ustawienia konta", sub: "Plan, fakturowanie, dane", action: () => setActiveTab("konto") },
          ].map((a, i) => {
            const inner = (
              <>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: sub, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: text, margin: 0 }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: muted, margin: "1px 0 0" }}>{a.sub}</p>
                </div>
                <ChevronRight size={14} color={dark ? "#333" : "#d1d5db"} style={{ marginLeft: "auto", flexShrink: 0 }} />
              </>
            )
            const sharedStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < 3 ? `1px solid ${divider}` : "none", textDecoration: "none", color: "inherit", cursor: "pointer", background: "transparent", border: "none", width: "100%", textAlign: "left" as const, fontFamily: "inherit" }
            return a.href
              ? <Link key={i} href={a.href} style={sharedStyle} onMouseEnter={e => (e.currentTarget.style.background = hover)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{inner}</Link>
              : <button key={i} onClick={a.action} style={sharedStyle} onMouseEnter={e => (e.currentTarget.style.background = hover)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{inner}</button>
          })}
        </div>
      </div>

      {profile?.plan === "free" && (
        <div style={{ background: dark ? "#0f1f44" : "#eff6ff", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? "#93c5fd" : "#1d4ed8", margin: 0 }}>Odblokuj pełny potencjał nipgo</p>
            <p style={{ fontSize: 13, color: dark ? "#60a5fa" : "#3b82f6", margin: "4px 0 0" }}>Dane kontaktowe, eksport CSV, monitoring firm — od 59 zł/mies.</p>
          </div>
          <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "10px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
            Zobacz plany
          </Link>
        </div>
      )}
    </div>
  )

  // ── Tab: EKSPORTY ─────────────────────────────────────────────────────────
  const TabEksporty = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: 0 }}>Limit miesięczny</p>
            <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>Resetuje się 1. dnia każdego miesiąca</p>
          </div>
          {exportLimit > 0 && remaining < exportLimit * 0.2 && (
            <Link href="/cennik" style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", background: "#fef3c7", color: "#92400e", borderRadius: 8, textDecoration: "none" }}>Dokup pakiet</Link>
          )}
          {profile?.plan === "free" && (
            <Link href="/cennik" style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>Upgrade</Link>
          )}
        </div>
        {exportLimit > 0 ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: text, letterSpacing: "-0.02em" }}>
                {exportUsed.toLocaleString("pl-PL")}
                <span style={{ fontSize: 14, fontWeight: 400, color: muted }}> / {exportLimit.toLocaleString("pl-PL")} rekordów</span>
              </span>
              <span style={{ fontSize: 13, color: exportPct > 80 ? "#ef4444" : muted }}>{remaining.toLocaleString("pl-PL")} pozostało</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
              <div style={{ height: 6, borderRadius: 3, width: `${exportPct}%`, background: exportPct > 80 ? "#ef4444" : exportPct > 60 ? "#f59e0b" : "#2563eb", transition: "width 0.5s" }} />
            </div>
          </>
        ) : (
          <div style={{ background: sub, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={15} color={muted} />
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>Eksport niedostępny w planie Free.</p>
          </div>
        )}
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(
          <FileText size={15} color="#2563eb" />,
          "Historia eksportów",
          <Link href="/search" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "6px 14px", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff" }}>
            + Nowy eksport
          </Link>
        )}
        {exports.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Download size={32} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>Brak eksportów</p>
            <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>Wyszukaj firmy i pobierz listę CSV</p>
            <Link href="/search" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>Przejdź do wyszukiwarki</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 90px 110px 48px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
              {["Filtry / Opis", "Data", "Rekordy", "Status", ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
            </div>
            {exports.map((e, i) => {
              const sc = exportStatus[e.status] ?? { label: e.status, bg: sub, color: muted }
              return (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px 90px 110px 48px", padding: "14px 24px", borderBottom: i < exports.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center", transition: "background 0.1s" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fmtFilters(e.filters)}</p>
                    {e.columns_selected?.length && <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{e.columns_selected.length} kolumn</p>}
                  </div>
                  <span style={{ fontSize: 12, color: muted }}>{fmtDateTime(e.created_at)}</span>
                  <span style={{ fontSize: 13, color: text }}>{e.record_count != null ? e.record_count.toLocaleString("pl-PL") : "—"}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: sc.bg, color: sc.color, display: "inline-flex", alignItems: "center", gap: 4, width: "fit-content" }}>
                    {e.status === "pending" && <RefreshCw size={9} style={{ animation: "spin 1s linear infinite" }} />}
                    {sc.label}
                  </span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {e.status === "ready" && e.file_url
                      ? <a href={e.file_url} download style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff", color: "#2563eb", textDecoration: "none" }}><Download size={14} /></a>
                      : <div style={{ width: 30 }} />}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )

  // ── Tab: MONITORING ───────────────────────────────────────────────────────
  const TabMonitoring = () => (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Obserwowane firmy", value: `${monitoringCount} / ${monitoringLimit}`, sub: monitoringLimit > 0 ? `${monitoringLimit - monitoringCount} wolnych miejsc` : "Niedostępne w Free", color: "#7c3aed" },
          { label: "Nowe alerty", value: String(unreadCount), sub: "nieprzeczytanych", color: unreadCount > 0 ? "#ef4444" : muted },
          { label: "Wszystkich alertów", value: String(alerts.length), sub: "w historii", color: "#2563eb" },
        ].map((s, i) => (
          <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: s.color, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: muted, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {monitoringLimit === 0 ? (
        <div style={{ background: dark ? "#0f1f44" : "#eff6ff", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
          <Bell size={32} color="#2563eb" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: dark ? "#93c5fd" : "#1d4ed8", margin: "0 0 8px" }}>Monitoring dostępny w planie Basic+</p>
          <p style={{ fontSize: 13, color: dark ? "#60a5fa" : "#3b82f6", margin: "0 0 20px" }}>Obserwuj firmy i otrzymuj alerty gdy zmieni się adres, zarząd, kapitał lub status VAT</p>
          <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "10px 24px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>
            Odblokuj monitoring
          </Link>
        </div>
      ) : (
        <>
          {/* Alerty */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
            {sectionHead(
              <Activity size={15} color="#ef4444" />,
              "Alerty zmian",
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", background: sub, border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
                  {(["unread", "all"] as const).map(f => (
                    <button key={f} onClick={() => setAlertFilter(f)}
                      style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: alertFilter === f ? "#2563eb" : "transparent", color: alertFilter === f ? "#fff" : muted, border: "none", cursor: "pointer" }}>
                      {f === "unread" ? `Nowe (${unreadCount})` : "Wszystkie"}
                    </button>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{ fontSize: 12, color: muted, background: "none", border: `1px solid ${border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
                    Oznacz wszystkie jako przeczytane
                  </button>
                )}
              </div>
            )}

            {filteredAlerts.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Check size={28} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>
                  {alertFilter === "unread" ? "Brak nowych alertów" : "Brak alertów"}
                </p>
                <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>Alerty pojawiają się gdy zmienią się dane obserwowanych firm</p>
              </div>
            ) : filteredAlerts.map((a, i) => (
              <div key={a.id}
                style={{ padding: "14px 24px", borderBottom: i < filteredAlerts.length - 1 ? `1px solid ${divider}` : "none", display: "flex", alignItems: "flex-start", gap: 14, background: !a.is_read ? (dark ? "#111820" : "#fafbff") : "transparent", transition: "background 0.1s", cursor: "pointer" }}
                onClick={() => handleMarkRead(a.id)}
                onMouseEnter={e => (e.currentTarget.style.background = hover)}
                onMouseLeave={e => (e.currentTarget.style.background = !a.is_read ? (dark ? "#111820" : "#fafbff") : "transparent")}>
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{ALERT_ICONS[a.typ] ?? ALERT_ICONS.default}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <Link href={`/firma/${a.nip}`} onClick={e => e.stopPropagation()} style={{ fontSize: 13, fontWeight: 600, color: text, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.nazwa ?? a.nip}
                    </Link>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: a.zrodlo === "KRS" ? "#eff6ff" : "#f0fdf4", color: a.zrodlo === "KRS" ? "#2563eb" : "#16a34a", flexShrink: 0 }}>{a.zrodlo}</span>
                    {!a.is_read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: text, margin: "0 0 4px" }}>{a.opis}</p>
                  {(a.wartosc_stara || a.wartosc_nowa) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      {a.wartosc_stara && <span style={{ color: "#ef4444", background: dark ? "#2a1010" : "#fef2f2", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>− {a.wartosc_stara}</span>}
                      {a.wartosc_stara && a.wartosc_nowa && <span style={{ color: muted }}>→</span>}
                      {a.wartosc_nowa && <span style={{ color: "#16a34a", background: dark ? "#0f2a10" : "#f0fdf4", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>+ {a.wartosc_nowa}</span>}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: muted, flexShrink: 0, marginTop: 2 }}>{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>

          {/* Lista obserwowanych */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
            {sectionHead(
              <Eye size={15} color="#7c3aed" />,
              `Obserwowane firmy (${monitoringCount})`,
              <Link href="/search" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "6px 14px", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff" }}>
                + Dodaj firmę
              </Link>
            )}

            {monitored.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Eye size={28} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>Brak obserwowanych firm</p>
                <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>Wejdź na kartę firmy i kliknij "Obserwuj"</p>
                <Link href="/search" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>Szukaj firm</Link>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 48px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
                  {["Firma", "Rejestr", "Dodano", ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
                </div>
                {monitored.map((f, i) => {
                  const firmAlerts = alerts.filter(a => a.nip === f.nip && !a.is_read)
                  return (
                    <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 48px", padding: "14px 24px", borderBottom: i < monitored.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center", transition: "background 0.1s" }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Link href={`/firma/${f.nip}`} style={{ fontSize: 13, fontWeight: 600, color: text, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.nazwa ?? f.nip}
                          </Link>
                          {firmAlerts.length > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 100, flexShrink: 0 }}>
                              {firmAlerts.length} nowe
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: muted, margin: "2px 0 0", fontFamily: "monospace" }}>{f.nip}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: f.zrodlo === "KRS" ? "#eff6ff" : "#f0fdf4", color: f.zrodlo === "KRS" ? "#2563eb" : "#16a34a", width: "fit-content" }}>{f.zrodlo}</span>
                      <span style={{ fontSize: 12, color: muted }}>{fmtDate(f.added_at)}</span>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleRemoveMonitored(f.nip)} disabled={removingNip === f.nip}
                          title="Usuń z monitoringu"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: "transparent", border: `1px solid ${border}`, color: muted, cursor: "pointer", opacity: removingNip === f.nip ? 0.4 : 1 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )

  // ── Tab: KONTO ────────────────────────────────────────────────────────────
  const TabKonto = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color={planColor} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: muted, textTransform: "uppercase", margin: 0 }}>Aktualny plan</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: planColor, margin: 0 }}>{planLabel}</p>
                {profile?.is_trial && <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>Trial</span>}
              </div>
              {planExpiryDate && <p style={{ fontSize: 12, color: muted, margin: "4px 0 0" }}>Ważny do: {planExpiryDate}</p>}
            </div>
          </div>
          <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", background: profile?.plan === "free" ? "#2563eb" : dark ? "#1a1a1a" : "#f3f4f6", color: profile?.plan === "free" ? "#fff" : text, borderRadius: 10, textDecoration: "none", border: profile?.plan === "free" ? "none" : `1px solid ${border}` }}>
            {profile?.plan === "free" ? "Upgrade" : profile?.plan === "basic" ? "Upgrade do Pro" : "Zarządzaj planem"}
          </Link>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(planFeatures[profile?.plan ?? "free"] ?? []).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: sub, borderRadius: 8 }}>
              <Check size={11} color="#22c55e" />
              <span style={{ fontSize: 12, color: text }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(<User size={15} color="#2563eb" />, "Dane konta")}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input value={user?.email ?? ""} disabled style={{ ...inputStyle, color: muted, cursor: "not-allowed" }} />
          </div>
          <div>
            <label style={labelStyle}>Imię i nazwisko</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jan Kowalski" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(<Building2 size={15} color="#7c3aed" />, "Dane do faktury")}
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Nazwa firmy</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Moja Firma sp. z o.o." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>NIP</label>
              <input value={form.nip} onChange={e => setForm(f => ({ ...f, nip: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="0000000000" style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Adres</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="ul. Przykładowa 1, 00-000 Warszawa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email do faktur</label>
            <input value={form.billing_email} onChange={e => setForm(f => ({ ...f, billing_email: e.target.value }))} placeholder="faktury@firma.pl" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
        {sectionHead(<CreditCard size={15} color="#16a34a" />, "Płatność")}
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: muted, margin: 0 }}>
            {profile?.plan === "free" ? "Brak aktywnej subskrypcji." : "Zarządzanie kartą dostępne po integracji Stripe."}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ fontSize: 14, fontWeight: 600, padding: "10px 28px", background: saved ? "#22c55e" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
          {saved ? <><Check size={15} /> Zapisano</> : saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </div>
  )

  // ── Tab: FAKTURY ──────────────────────────────────────────────────────────
  const TabFaktury = () => (
    <div>
      {invoices.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Łącznie zapłacono", value: fmtAmount(totalPaid), sub: `${invoices.filter(i => i.status === "paid").length} opłaconych` },
            { label: "Liczba faktur", value: String(invoices.length), sub: "wszystkie" },
            { label: "Ostatnia płatność", value: invoices[0] ? fmtDate(invoices[0].created_at) : "—", sub: invoices[0]?.invoice_number ?? "" },
          ].map((s, i) => (
            <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: muted, margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        {sectionHead(<Receipt size={15} color="#2563eb" />, "Historia faktur")}
        {invoices.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <FileText size={32} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>Brak faktur</p>
            <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>Faktury pojawią się po pierwszej płatności</p>
            <Link href="/cennik" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>Zobacz plany</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 130px 60px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
              {["Nr faktury", "Opis", "Kwota", "Status", ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
            </div>
            {invoices.map((inv, i) => {
              const sc = invoiceStatus[inv.status] ?? { label: inv.status, bg: sub, color: muted }
              return (
                <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 130px 60px", padding: "14px 24px", borderBottom: i < invoices.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center", transition: "background 0.1s" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: text, margin: 0, fontFamily: "'DM Mono', monospace" }}>{inv.invoice_number ?? `#${inv.id.slice(0, 8).toUpperCase()}`}</p>
                    <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{fmtDate(inv.created_at)}</p>
                  </div>
                  <span style={{ fontSize: 13, color: text }}>{inv.description ?? "Subskrypcja nipgo.pl"}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{fmtAmount(inv.amount)}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: sc.bg, color: sc.color, width: "fit-content" }}>{sc.label}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {inv.pdf_url && (
                      <a href={inv.pdf_url} download style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff", color: "#2563eb", textDecoration: "none" }}><Download size={13} /></a>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
      <div style={{ padding: "14px 20px", background: sub, border: `1px solid ${border}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <ExternalLink size={14} color={muted} />
        <p style={{ fontSize: 12, color: muted, margin: 0 }}>
          Faktury wystawiane automatycznie przez KSeF. Pytania? <a href="mailto:hello@nipgo.pl" style={{ color: "#2563eb" }}>hello@nipgo.pl</a>
        </p>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: muted, marginTop: 4 }}>Witaj, {user?.user_metadata?.full_name || user?.email}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: sub, padding: 4, borderRadius: 12, width: "fit-content", border: `1px solid ${border}` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", fontSize: 13, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? text : muted, background: activeTab === t.id ? card : "transparent", border: activeTab === t.id ? `1px solid ${border}` : "1px solid transparent", borderRadius: 8, cursor: "pointer", boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s", fontFamily: "'DM Sans', system-ui, sans-serif", position: "relative" }}>
              {t.icon}
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#ef4444", color: "#fff", borderRadius: 100, padding: "1px 5px", minWidth: 16, textAlign: "center", lineHeight: "14px" }}>
                  {t.badge > 99 ? "99+" : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "przeglad"   && <TabPrzeglad />}
        {activeTab === "eksporty"   && <TabEksporty />}
        {activeTab === "monitoring" && <TabMonitoring />}
        {activeTab === "konto"      && <TabKonto />}
        {activeTab === "faktury"    && <TabFaktury />}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
