"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import { useT } from "@/lib/i18n"
import { TabCrm } from "./TabCrm"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Download, Bell, Shield, FileText, TrendingUp, User, ChevronRight,
  AlertCircle, RefreshCw, Check, Building2, CreditCard, Receipt,
  ExternalLink, LayoutDashboard, Eye, Trash2, X, MapPin, Activity
} from "lucide-react"

type UserProfile = {
  id: string; plan: string; plan_expires_at: string | null; trial_ends_at: string | null
  is_trial: boolean; export_records_used_month: number; export_records_limit: number
  monitoring_limit: number; full_name: string | null; company_name: string | null
  nip: string | null; address: string | null; billing_email: string | null
}
type Export = { id: string; status: string; record_count: number | null; created_at: string; filters: any; file_url: string | null; columns_selected: string[] | null }
type Invoice = { id: string; created_at: string; amount: number; status: string; invoice_number: string | null; pdf_url: string | null; description: string | null }
type MonitoredFirm = { id: string; nip: string; nazwa: string | null; zrodlo: "KRS" | "CEIDG"; added_at: string; last_checked: string | null }
type FirmAlert = { id: string; nip: string; nazwa: string | null; zrodlo: "KRS" | "CEIDG"; typ: string; opis: string; wartosc_stara: string | null; wartosc_nowa: string | null; is_read: boolean; created_at: string }
type Tab = "przeglad" | "eksporty" | "monitoring" | "konto" | "faktury" | "crm"

const ALERT_ICONS: Record<string, string> = {
  adres: "📍", status: "⚡", kapital: "💰", zarzad: "👤", pkd: "🏷️", prokura: "📋", default: "🔔",
}

export default function DashboardPage() {
  const t = useT()
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
  const sidebarBg = dark ? "#0d0d0d" : "#f8f9fb"

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
      setProfile(p); setExports(exp ?? []); setInvoices(inv ?? [])
      setMonitored(mon ?? []); setAlerts(alr ?? [])
      if (p) setForm({ full_name: p.full_name ?? "", company_name: p.company_name ?? "", nip: p.nip ?? "", address: p.address ?? "", billing_email: p.billing_email ?? user.email ?? "" })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await supabase.from("user_profiles").update({ full_name: form.full_name || null, company_name: form.company_name || null, nip: form.nip || null, address: form.address || null, billing_email: form.billing_email || null }).eq("id", user.id)
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
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
      <p style={{ color: muted, fontSize: 14 }}>{t("common.loading")}</p>
    </div>
  )

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

  const exportStatusMap: Record<string, { label: string; bg: string; color: string }> = {
    ready:      { label: t("dashboard.exportStatusReady"),      bg: "#dcfce7", color: "#16a34a" },
    pending:    { label: t("dashboard.exportStatusPending"),    bg: "#fef3c7", color: "#92400e" },
    failed:     { label: t("common.error"),                     bg: "#fee2e2", color: "#dc2626" },
    downloaded: { label: t("dashboard.exportStatusDownloaded"), bg: dark ? "#1a1a1a" : "#f3f4f6", color: muted },
  }

  const invoiceStatusMap: Record<string, { label: string; bg: string; color: string }> = {
    paid:     { label: t("dashboard.invoiceStatusPaid"),   bg: "#dcfce7", color: "#16a34a" },
    pending:  { label: t("dashboard.exportStatusPending"), bg: "#fef3c7", color: "#92400e" },
    failed:   { label: t("common.error"),                  bg: "#fee2e2", color: "#dc2626" },
    refunded: { label: "Zwrot",                            bg: dark ? "#1a1a1a" : "#f3f4f6", color: muted },
  }

  function fmtDate(d: string) { return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" }) }
  function fmtDateTime(d: string) { return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }
  function fmtAmount(n: number) { return (n / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " zł" }
  function fmtFilters(f: any) {
    if (!f) return t("search.filterSourceAll")
    const p: string[] = []
    if (f.query) p.push(f.query); if (f.miasto) p.push(f.miasto)
    if (f.wojewodztwo) p.push(f.wojewodztwo); if (f.pkd) p.push(`PKD: ${f.pkd}`)
    if (f.rejestr) p.push(f.rejestr)
    return p.length ? p.join(" · ") : t("search.filterSourceAll")
  }
  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return fmtDate(d)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", fontSize: 13, color: text, background: sub, border: `1px solid ${inputBorder}`, borderRadius: 10, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', system-ui, sans-serif" }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }
  const tableHeaderStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.06em", textTransform: "uppercase" }

  function sectionHead(icon: React.ReactNode, title: string, extra?: React.ReactNode) {
    return (
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}<span style={{ fontSize: 13, fontWeight: 600, color: text }}>{title}</span></div>
        {extra}
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "przeglad",   label: t("dashboard.tabOverview"),    icon: <LayoutDashboard size={15} /> },
    { id: "eksporty",   label: t("dashboard.tabExports"),     icon: <Download size={15} /> },
    { id: "monitoring", label: t("dashboard.tabMonitoring"),  icon: <Bell size={15} />, badge: unreadCount },
    { id: "konto",      label: t("dashboard.tabAccount"),     icon: <User size={15} /> },
    { id: "faktury",    label: t("dashboard.tabInvoices"),    icon: <Receipt size={15} /> },
    { id: "crm", label: "CRM TEST", icon: <CreditCard size={15} /> },
  ]

  const TabPrzeglad = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color={planColor} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: muted, textTransform: "uppercase", margin: 0 }}>{t("dashboard.planLabel")}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: planColor, margin: 0 }}>{planLabel}</p>
                {profile?.is_trial && <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 100, fontWeight: 500 }}>Trial</span>}
              </div>
              {planExpiryDate && <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>{t("dashboard.planExpires")}: {planExpiryDate}</p>}
            </div>
          </div>
          {profile?.plan === "free"
            ? <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "8px 18px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>{t("dashboard.planUpgrade")}</Link>
            : <p style={{ fontSize: 12, color: muted }}>{planExpiryDate ? `${t("dashboard.planExpires")}: ${planExpiryDate}` : "Aktywny"}</p>
          }
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: sub, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Download size={14} color={muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("dashboard.planExports")}</span>
            </div>
            {exportLimit > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: text }}>{exportUsed.toLocaleString("pl-PL")} {t("dashboard.limitOf")} {exportLimit.toLocaleString("pl-PL")}</span>
                  <span style={{ color: muted }}>{remaining.toLocaleString("pl-PL")} {t("dashboard.limitRecords")}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${exportPct}%`, background: exportPct > 80 ? "#ef4444" : "#2563eb", transition: "width 0.5s" }} />
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>{t("dashboard.upgradeCta")}</p>
            )}
          </div>
          <div style={{ background: sub, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Bell size={14} color={muted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("dashboard.planMonitoring")}</span>
            </div>
            {monitoringLimit > 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: text }}>{monitoringCount} {t("dashboard.limitOf")} {monitoringLimit}</span>
                  <span style={{ color: muted }}>{t("dashboard.limitFirms")}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${Math.min((monitoringCount / monitoringLimit) * 100, 100)}%`, background: "#7c3aed", transition: "width 0.5s" }} />
                </div>
                {unreadCount > 0 && (
                  <button onClick={() => setActiveTab("monitoring")} style={{ marginTop: 8, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                    {unreadCount} {t("dashboard.alertNew").toLowerCase()}
                  </button>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>{t("dashboard.upgradeCta")}</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={15} color="#ef4444" />
              <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{t("dashboard.recentAlerts")}</span>
              {unreadCount > 0 && <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", padding: "1px 7px", borderRadius: 100, fontWeight: 600 }}>{unreadCount}</span>}
            </div>
            <button onClick={() => setActiveTab("monitoring")} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, padding: 0 }}>
              {t("dashboard.seeAll")} <ChevronRight size={12} />
            </button>
          </div>
          {alerts.filter(a => !a.is_read).length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <Bell size={24} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: muted, margin: 0 }}>{t("dashboard.noAlerts")}</p>
            </div>
          ) : alerts.filter(a => !a.is_read).slice(0, 5).map((a, i, arr) => (
            <div key={a.id} onClick={() => handleMarkRead(a.id)}
              style={{ padding: "12px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
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

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${divider}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{t("dashboard.goToSearch")}</span>
          </div>
          {[
            { icon: <TrendingUp size={16} color="#2563eb" />, label: t("dashboard.goToSearch"), sub: t("home.subtitle").slice(0, 50) + "...", href: "/search" },
            { icon: <Bell size={16} color="#7c3aed" />, label: t("dashboard.tabMonitoring"), sub: `${monitoringCount} ${t("dashboard.limitFirms")}`, action: () => setActiveTab("monitoring") },
            { icon: <FileText size={16} color="#16a34a" />, label: t("dashboard.exportsTitle"), sub: t("dashboard.exportsEmptyDesc"), action: () => setActiveTab("eksporty") },
            { icon: <User size={16} color="#f59e0b" />, label: t("dashboard.accountTitle"), sub: t("dashboard.tabAccount"), action: () => setActiveTab("konto") },
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
            <p style={{ fontSize: 14, fontWeight: 600, color: dark ? "#93c5fd" : "#1d4ed8", margin: 0 }}>{t("dashboard.upgradeCta")}</p>
            <p style={{ fontSize: 13, color: dark ? "#60a5fa" : "#3b82f6", margin: "4px 0 0" }}>{t("home.ctaDesc")}</p>
          </div>
          <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "10px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
            {t("dashboard.upgradeBtn")}
          </Link>
        </div>
      )}
    </div>
  )

  const TabEksporty = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: 0 }}>{t("dashboard.exportMonthlyLimit")}</p>
            <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>{t("dashboard.exportResets")} 1.</p>
          </div>
          {profile?.plan === "free" && (
            <Link href="/cennik" style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>{t("dashboard.planUpgrade")}</Link>
          )}
        </div>
        {exportLimit > 0 ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: text, letterSpacing: "-0.02em" }}>
                {exportUsed.toLocaleString("pl-PL")}
                <span style={{ fontSize: 14, fontWeight: 400, color: muted }}> / {exportLimit.toLocaleString("pl-PL")} {t("dashboard.limitRecords")}</span>
              </span>
              <span style={{ fontSize: 13, color: exportPct > 80 ? "#ef4444" : muted }}>{remaining.toLocaleString("pl-PL")} {t("dashboard.limitOf")} {exportLimit.toLocaleString("pl-PL")}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: dark ? "#1e1e1e" : "#e5e7eb" }}>
              <div style={{ height: 6, borderRadius: 3, width: `${exportPct}%`, background: exportPct > 80 ? "#ef4444" : exportPct > 60 ? "#f59e0b" : "#2563eb", transition: "width 0.5s" }} />
            </div>
          </>
        ) : (
          <div style={{ background: sub, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={15} color={muted} />
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>{t("search.exportLimitFree")}</p>
          </div>
        )}
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(
          <FileText size={15} color="#2563eb" />,
          t("dashboard.exportsTitle"),
          <Link href="/search" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "6px 14px", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff" }}>
            + {t("search.exportBtn")}
          </Link>
        )}
        {exports.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Download size={32} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>{t("dashboard.exportsEmpty")}</p>
            <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>{t("dashboard.exportsEmptyDesc")}</p>
            <Link href="/search" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>{t("dashboard.goToSearch")}</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 90px 110px 48px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
              {[t("dashboard.exportColFilters"), t("dashboard.exportColDate"), t("dashboard.exportColRecords"), t("dashboard.exportColStatus"), ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
            </div>
            {exports.map((e, i) => {
              const sc = exportStatusMap[e.status] ?? { label: e.status, bg: sub, color: muted }
              return (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 130px 90px 110px 48px", padding: "14px 24px", borderBottom: i < exports.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fmtFilters(e.filters)}</p>
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

  const TabMonitoring = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[
          { label: t("dashboard.monitoringTitle"), value: `${monitoringCount} / ${monitoringLimit}`, sub: `${monitoringLimit - monitoringCount} ${t("dashboard.limitFirms")}`, color: "#7c3aed" },
          { label: t("dashboard.recentAlerts"), value: String(unreadCount), sub: t("dashboard.alertNew"), color: unreadCount > 0 ? "#ef4444" : muted },
          { label: t("dashboard.monitoringDate"), value: String(alerts.length), sub: "total", color: "#2563eb" },
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
          <p style={{ fontSize: 15, fontWeight: 600, color: dark ? "#93c5fd" : "#1d4ed8", margin: "0 0 8px" }}>{t("dashboard.upgradeCta")}</p>
          <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, padding: "10px 24px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>{t("dashboard.upgradeBtn")}</Link>
        </div>
      ) : (
        <>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
            {sectionHead(
              <Activity size={15} color="#ef4444" />,
              t("dashboard.recentAlerts"),
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", background: sub, border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
                  {(["unread", "all"] as const).map(f => (
                    <button key={f} onClick={() => setAlertFilter(f)}
                      style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: alertFilter === f ? "#2563eb" : "transparent", color: alertFilter === f ? "#fff" : muted, border: "none", cursor: "pointer" }}>
                      {f === "unread" ? `${t("dashboard.alertNew")} (${unreadCount})` : t("dashboard.seeAll")}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {filteredAlerts.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Check size={28} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>{t("dashboard.noAlerts")}</p>
              </div>
            ) : filteredAlerts.map((a, i) => (
              <div key={a.id}
                style={{ padding: "14px 24px", borderBottom: i < filteredAlerts.length - 1 ? `1px solid ${divider}` : "none", display: "flex", alignItems: "flex-start", gap: 14, background: !a.is_read ? (dark ? "#111820" : "#fafbff") : "transparent", cursor: "pointer" }}
                onClick={() => handleMarkRead(a.id)}
                onMouseEnter={e => (e.currentTarget.style.background = hover)}
                onMouseLeave={e => (e.currentTarget.style.background = !a.is_read ? (dark ? "#111820" : "#fafbff") : "transparent")}>
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{ALERT_ICONS[a.typ] ?? ALERT_ICONS.default}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <Link href={`/firma/${a.nip}`} onClick={e => e.stopPropagation()} style={{ fontSize: 13, fontWeight: 600, color: text, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nazwa ?? a.nip}</Link>
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

          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
            {sectionHead(
              <Eye size={15} color="#7c3aed" />,
              `${t("dashboard.monitoringTitle")} (${monitoringCount})`,
              <Link href="/search" style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", padding: "6px 14px", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff" }}>
                + {t("firma.btnObserve")}
              </Link>
            )}
            {monitored.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <Eye size={28} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>{t("dashboard.monitoringEmpty")}</p>
                <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>{t("dashboard.monitoringEmptyDesc")}</p>
                <Link href="/search" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>{t("dashboard.goToSearch")}</Link>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 48px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
                  {["Firma", "Rejestr", t("dashboard.monitoringDate"), ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
                </div>
                {monitored.map((f, i) => {
                  const firmAlerts = alerts.filter(a => a.nip === f.nip && !a.is_read)
                  return (
                    <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 48px", padding: "14px 24px", borderBottom: i < monitored.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center" }}
                      onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Link href={`/firma/${f.nip}`} style={{ fontSize: 13, fontWeight: 600, color: text, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nazwa ?? f.nip}</Link>
                          {firmAlerts.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 100, flexShrink: 0 }}>{firmAlerts.length} {t("dashboard.alertNew").toLowerCase()}</span>}
                        </div>
                        <p style={{ fontSize: 11, color: muted, margin: "2px 0 0", fontFamily: "monospace" }}>{f.nip}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: f.zrodlo === "KRS" ? "#eff6ff" : "#f0fdf4", color: f.zrodlo === "KRS" ? "#2563eb" : "#16a34a", width: "fit-content" }}>{f.zrodlo}</span>
                      <span style={{ fontSize: 12, color: muted }}>{fmtDate(f.added_at)}</span>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => handleRemoveMonitored(f.nip)} disabled={removingNip === f.nip}
                          title={t("dashboard.monitoringRemove")}
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

  const TabKonto = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(<User size={15} color="#2563eb" />, t("dashboard.accountTitle"))}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t("dashboard.accountEmail")}</label>
            <input value={user?.email ?? ""} disabled style={{ ...inputStyle, color: muted, cursor: "not-allowed" }} />
          </div>
          <div>
            <label style={labelStyle}>{t("dashboard.accountName")}</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jan Kowalski" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {sectionHead(<Building2 size={15} color="#7c3aed" />, t("dashboard.invoicesTitle"))}
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{t("dashboard.accountCompany")}</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Moja Firma sp. z o.o." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("dashboard.accountNip")}</label>
              <input value={form.nip} onChange={e => setForm(f => ({ ...f, nip: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="0000000000" style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t("dashboard.accountAddress")}</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="ul. Przykładowa 1, 00-000 Warszawa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t("dashboard.accountBillingEmail")}</label>
            <input value={form.billing_email} onChange={e => setForm(f => ({ ...f, billing_email: e.target.value }))} placeholder="faktury@firma.pl" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSave} disabled={saving}
          style={{ fontSize: 14, fontWeight: 600, padding: "10px 28px", background: saved ? "#22c55e" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
          {saved ? <><Check size={15} /> {t("dashboard.accountSaved")}</> : saving ? t("common.loading") : t("dashboard.accountSave")}
        </button>
      </div>
    </div>
  )

  const TabFaktury = () => (
    <div>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        {sectionHead(<Receipt size={15} color="#2563eb" />, t("dashboard.invoicesTitle"))}
        {invoices.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <FileText size={32} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>{t("dashboard.invoicesEmpty")}</p>
            <Link href="/cennik" style={{ display: "inline-block", marginTop: 16, fontSize: 13, fontWeight: 600, padding: "9px 20px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none" }}>{t("dashboard.upgradeBtn")}</Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 130px 60px", padding: "10px 24px", background: sub, borderBottom: `1px solid ${divider}` }}>
              {[t("dashboard.invoiceColNumber"), t("dashboard.invoiceColDate"), t("dashboard.invoiceColAmount"), t("dashboard.invoiceColStatus"), ""].map((h, i) => <span key={i} style={tableHeaderStyle}>{h}</span>)}
            </div>
            {invoices.map((inv, i) => {
              const sc = invoiceStatusMap[inv.status] ?? { label: inv.status, bg: sub, color: muted }
              return (
                <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 130px 60px", padding: "14px 24px", borderBottom: i < invoices.length - 1 ? `1px solid ${divider}` : "none", alignItems: "center" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = hover)} onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: text, margin: 0, fontFamily: "'DM Mono', monospace" }}>{inv.invoice_number ?? `#${inv.id.slice(0, 8).toUpperCase()}`}</p>
                    <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{fmtDate(inv.created_at)}</p>
                  </div>
                  <span style={{ fontSize: 13, color: text }}>{inv.description ?? "Subskrypcja nipgo.pl"}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{fmtAmount(inv.amount)}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: sc.bg, color: sc.color, width: "fit-content" }}>{sc.label}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {inv.pdf_url && <a href={inv.pdf_url} download style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: dark ? "#0f1f44" : "#eff6ff", color: "#2563eb", textDecoration: "none" }}><Download size={13} /></a>}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )

  // ── PAGE TITLE per tab ──
  const tabTitles: Record<Tab, string> = {
    przeglad:   t("dashboard.tabOverview"),
    eksporty:   t("dashboard.tabExports"),
    monitoring: t("dashboard.tabMonitoring"),
    konto:      t("dashboard.tabAccount"),
    faktury:    t("dashboard.tabInvoices"),
    crm: "CRM",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "calc(100vh - 56px)", display: "flex" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── LEFT SIDEBAR ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: sidebarBg,
        borderRight: `1px solid ${border}`,
        padding: "28px 12px",
        position: "sticky", top: 56,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {/* User info */}
        <div style={{ padding: "0 8px 20px", marginBottom: 4, borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            {(user?.user_metadata?.full_name || user?.email || "?")[0].toUpperCase()}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
          </p>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 4, background: profile?.plan === "pro" ? "#eff6ff" : profile?.plan === "basic" ? "#f5f3ff" : `${border}`, color: planColor, display: "inline-block", marginTop: 4 }}>
            {planLabel}
          </span>
        </div>

        {/* Nav items */}
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, width: "100%",
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? "#2563eb" : muted,
                background: active ? (dark ? "#1a2a4a" : "#eff6ff") : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                fontFamily: "inherit", position: "relative",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = hover; if (!active) e.currentTarget.style.color = text }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; if (!active) e.currentTarget.style.color = muted }}>
              <span style={{ color: active ? "#2563eb" : muted, display: "flex", flexShrink: 0 }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, background: "#ef4444", color: "#fff", borderRadius: 100, padding: "1px 6px", minWidth: 16, textAlign: "center", lineHeight: "14px" }}>
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Bottom CTA */}
        {profile?.plan === "free" && (
          <div style={{ marginTop: "auto", paddingTop: 20 }}>
            <Link href="/cennik" style={{
              display: "block", padding: "10px 12px", background: "#2563eb",
              color: "#fff", borderRadius: 10, textDecoration: "none",
              fontSize: 12, fontWeight: 600, textAlign: "center",
            }}>
              ⚡ {t("dashboard.upgradeBtn")}
            </Link>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px 40px", overflowY: "auto" }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: text, margin: 0 }}>
            {tabTitles[activeTab]}
          </h1>
          <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>
            {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>

        {activeTab === "przeglad"   && <TabPrzeglad />}
        {activeTab === "eksporty"   && <TabEksporty />}
        {activeTab === "monitoring" && <TabMonitoring />}
        {activeTab === "konto"      && <TabKonto />}
        {activeTab === "faktury"    && <TabFaktury />}
        {activeTab === "crm" && <TabCrm dark={dark} userId={user?.id ?? ""} />}
      </main>
    </div>
  )
}