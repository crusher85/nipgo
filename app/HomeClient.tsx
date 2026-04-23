"use client"

import Link from "next/link"
import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { useT } from "@/lib/i18n"
import { Search, Building2, Users, Database, Zap, Shield, TrendingUp, Sparkles, Bell, ArrowRight, MapPin, Phone, Mail, Globe, CheckCircle, Download } from "lucide-react"

interface LiveStats {
  krs_total: number
  ceidg_total: number
}

function HeroSearch({ dark }: { dark: boolean }) {
  const t = useT()
  const router = useRouter()
  const [q, setQ] = useState("")
  const border = dark ? "#2a2a2a" : "#e5e7eb"
  const cardBg = dark ? "#111" : "#fff"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const exampleList: string[] = ["producenci opakowań Poznań", "sp. z o.o. IT Warszawa", "hurtownie elektryczne"]

  return (
    <div style={{ width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: cardBg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "12px 16px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
          <Search size={17} color={mutedColor} style={{ flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("home.searchPlaceholder")} autoComplete="off"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: textColor, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif" }} />
          <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 9, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}>
            {t("home.searchBtn")}
          </button>
        </div>
      </form>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: mutedColor, alignSelf: "center" }}>{t("home.searchExamplesLabel")}</span>
        {exampleList.map((ex: string) => (
          <button key={ex} onClick={() => router.push(`/search?q=${encodeURIComponent(ex)}`)}
            style={{ fontSize: 11, padding: "3px 10px", border: `1px solid ${border}`, borderRadius: 100, background: "transparent", color: dark ? "#9ca3af" : "#6b7280", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = dark ? "#9ca3af" : "#6b7280" }}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

function FirmaCardMockup({ dark }: { dark: boolean }) {
  const t = useT()
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 300) }, [])

  const cardBg = dark ? "#111" : "#fff"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const textMuted = dark ? "#555" : "#9ca3af"
  const textValue = dark ? "#e5e5e5" : "#111"

  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)", transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)", position: "relative" }}>
      <div style={{ position: "absolute", inset: -1, borderRadius: 22, background: "linear-gradient(135deg, #2563eb44, #7c3aed22)", filter: "blur(20px)", zIndex: -1 }} />
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.5)" : "0 24px 64px rgba(37,99,235,0.12)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", background: "#22c55e18", border: "1px solid #22c55e33", padding: "2px 8px", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />{t("home.mockupStatus")}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: dark ? "#555" : "#6b7280", background: dark ? "#161616" : "#f3f4f6", border: `1px solid ${border}`, padding: "2px 8px", borderRadius: 100 }}>Sp. z o.o.</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#2563eb", background: dark ? "#0f1f44" : "#eff6ff", border: `1px solid ${dark ? "#1a3a7a" : "#bfdbfe"}`, padding: "2px 8px", borderRadius: 100 }}>KRS</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", background: "#22c55e18", border: "1px solid #22c55e33", padding: "2px 8px", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />{t("home.mockupVat")}
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 300, letterSpacing: "-0.02em", color: dark ? "#fff" : "#111", margin: "0 0 6px" }}>Kowalski Technology sp. z o.o.</h3>
          <div style={{ display: "flex", gap: 16 }}>
            {[{ l: "NIP", v: "7733436826" }, { l: "KRS", v: "0001137217" }, { l: "REGON", v: "540135259" }].map(({ l, v }) => (
              <span key={l} style={{ fontSize: 11, color: textMuted }}>
                {l} <span style={{ fontFamily: "monospace", color: dark ? "#aaa" : "#374151", fontWeight: 500 }}>{v}</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${border}` }}>
          {[
            { label: t("home.mockupCapital"), value: "250 000 PLN" },
            { label: t("home.mockupCity"), value: "Warszawa" },
            { label: t("home.mockupShareholders"), value: "3" },
            { label: t("home.mockupPkd"), value: "62.01.Z" },
          ].map((kpi, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRight: i < 3 ? `1px solid ${border}` : "none" }}>
              <p style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: textMuted, fontWeight: 600, marginBottom: 3 }}>{kpi.label}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: dark ? "#fff" : "#111", margin: 0 }}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${border}` }}>
          <div style={{ padding: "12px 14px", borderRight: `1px solid ${border}` }}>
            <p style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: textMuted, fontWeight: 600, marginBottom: 6 }}>{t("home.mockupBranchPos")}</p>
            <p style={{ fontSize: 13, color: textValue, margin: "0 0 2px" }}>
              <span style={{ fontWeight: 600 }}>8</span>
              <span style={{ color: textMuted }}> {t("home.mockupItFirms")}</span>
            </p>
            <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {t("home.mockupNiche")}
            </p>
          </div>
          <div style={{ padding: "12px 14px", position: "relative", overflow: "hidden" }}>
            <p style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: textMuted, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              {t("home.mockupAiDesc")} <span style={{ fontSize: 8, fontWeight: 700, background: dark ? "#1a1060" : "#ede9fe", color: "#7c3aed", padding: "1px 5px", borderRadius: 3 }}>PRO</span>
            </p>
            <p style={{ fontSize: 11, color: dark ? "#888" : "#6b7280", margin: 0, lineHeight: 1.5, filter: "blur(3px)" }}>
              {t("home.mockupAiBlur")}
            </p>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.7)" : "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", display: "flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={10} /> {t("home.mockupAiPro")}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, position: "relative" }}>
          <p style={{ fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: textMuted, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            {t("home.mockupContact")} <span style={{ fontSize: 8, fontWeight: 700, background: dark ? "#1a1060" : "#ede9fe", color: "#7c3aed", padding: "1px 5px", borderRadius: 3 }}>{t("home.mockupContactBasic")}</span>
          </p>
          <div style={{ display: "flex", gap: 16, filter: "blur(4px)" }}>
            {[
              { icon: <Phone size={11} />, v: "+48 601 ••• •••" },
              { icon: <Mail size={11} />, v: "biuro@kowalski-••••.pl" },
              { icon: <Globe size={11} />, v: "www.kowalski-••••.pl" },
            ].map(({ icon, v }, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: dark ? "#aaa" : "#374151" }}>
                <span style={{ color: "#2563eb" }}>{icon}</span>{v}
              </span>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.75)" : "rgba(255,255,255,0.75)", backdropFilter: "blur(2px)" }}>
            <Link href="/cennik" style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              {t("home.mockupUnlock")}
            </Link>
          </div>
        </div>

        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={13} color="#22c55e" />
          <span style={{ fontSize: 12, color: dark ? "#aaa" : "#374151" }}>{t("home.mockupVatRow")}</span>
          <span style={{ fontSize: 12, color: textMuted, marginLeft: "auto" }}>{t("home.mockupAccount")} PL•• •••• ••••</span>
        </div>
      </div>

      <div style={{ position: "absolute", top: -12, right: -12, background: "#22c55e", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100, boxShadow: "0 4px 12px rgba(34,197,94,0.4)", animation: "float 3s ease-in-out infinite" }}>
        {t("home.mockupActiveBadge")}
      </div>
    </div>
  )
}

function LiveTicker({ dark }: { dark: boolean }) {
  const t = useT()
  const [stats, setStats] = useState<LiveStats | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/get_report_stats`, {
      method: "POST",
      headers: { "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`, "Content-Type": "application/json" },
      body: "{}",
    }).then(r => r.json()).then(d => { if (d) setStats(d) }).catch(() => {})
  }, [])

  const total = stats ? (stats.krs_total + stats.ceidg_total) : null

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: dark ? "#0d0d0d" : "#f8faff", border: `1px solid ${dark ? "#1a1a1a" : "#e0e7ff"}`, borderRadius: 100, padding: "7px 18px", fontSize: 11, color: dark ? "#888" : "#6b7280", flexWrap: "wrap", justifyContent: "center" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse-dot 2s ease infinite" }} />
        <span style={{ color: dark ? "#ccc" : "#374151", fontWeight: 600 }}>{total ? total.toLocaleString("pl-PL") : "1 580 000+"}</span> {t("home.tickerFirms")}
      </span>
      <span style={{ color: dark ? "#222" : "#e5e7eb" }}>·</span>
      <span><span style={{ color: dark ? "#ccc" : "#374151", fontWeight: 600 }}>{stats?.krs_total ? stats.krs_total.toLocaleString("pl-PL") : "711k+"}</span> KRS</span>
      <span style={{ color: dark ? "#222" : "#e5e7eb" }}>·</span>
      <span><span style={{ color: dark ? "#ccc" : "#374151", fontWeight: 600 }}>{stats?.ceidg_total ? stats.ceidg_total.toLocaleString("pl-PL") : "869k+"}</span> CEIDG</span>
      <span style={{ color: dark ? "#222" : "#e5e7eb" }}>·</span>
      <span>{t("home.tickerUpdate")}</span>
    </div>
  )
}

function AnimatedStat({ value, label, dark }: { value: string; label: string; dark: boolean }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "24px 16px" }}>
      <div style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", color: dark ? "#fff" : "#111", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>{label}</div>
    </div>
  )
}

function MapPoland({ dark }: { dark: boolean }) {
  const dots = [
    { x: 52, y: 28, s: 8 }, { x: 35, y: 45, s: 6 }, { x: 68, y: 42, s: 7 },
    { x: 44, y: 55, s: 10 }, { x: 58, y: 60, s: 5 }, { x: 25, y: 35, s: 6 },
    { x: 72, y: 30, s: 5 }, { x: 40, y: 70, s: 7 }, { x: 62, y: 72, s: 6 },
    { x: 30, y: 62, s: 4 }, { x: 55, y: 45, s: 8 }, { x: 48, y: 38, s: 5 },
    { x: 78, y: 55, s: 4 }, { x: 20, y: 50, s: 5 }, { x: 66, y: 20, s: 6 },
  ]
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: dark ? "#0a0a0a" : "#f0f7ff", borderRadius: 20, border: `1px solid ${dark ? "#1a1a1a" : "#dbeafe"}`, overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
        {[20, 40, 60, 80].map(x => <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#2563eb" strokeWidth="0.5" />)}
        {[25, 50, 75].map(y => <line key={`h${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#2563eb" strokeWidth="0.5" />)}
      </svg>
      {dots.map((dot, i) => (
        <div key={i} style={{ position: "absolute", left: `${dot.x}%`, top: `${dot.y}%`, width: dot.s, height: dot.s, borderRadius: "50%", background: "#2563eb", opacity: 0.7, transform: "translate(-50%, -50%)", animation: `pulse-dot ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export default function HomePage() {
  const t = useT()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"
  const cardBg = dark ? "#111" : "#fff"
  const borderColor = dark ? "#1e1e1e" : "#e8eaed"
  const heroBg = dark ? "#050505" : "#f8faff"

  const STATS = [
    { value: t("home.stat1value"), label: t("home.stat1label") },
    { value: t("home.stat2value"), label: t("home.stat2label") },
    { value: t("home.stat3value"), label: t("home.stat3label") },
    { value: t("home.stat4value"), label: t("home.stat4label") },
  ]

  const FEATURES = [
    { icon: <Database size={20} />, title: t("home.feature1title"), desc: t("home.feature1desc") },
    { icon: <Zap size={20} />, title: t("home.feature2title"), desc: t("home.feature2desc") },
    { icon: <Shield size={20} />, title: t("home.feature3title"), desc: t("home.feature3desc") },
    { icon: <TrendingUp size={20} />, title: t("home.feature4title"), desc: t("home.feature4desc") },
  ]

  const PRO_FEATURES = [
    {
      icon: <Bell size={24} />, badge: t("home.proFeature1badge"), color: "#f59e0b",
      bg: dark ? "#1a1200" : "#fffbeb", border: dark ? "#2a1e00" : "#fde68a",
      title: t("home.proFeature1title"), desc: t("home.proFeature1desc"),
      examples: [t("home.proFeature1ex1"), t("home.proFeature1ex2"), t("home.proFeature1ex3")],
    },
    {
      icon: <Search size={24} />, badge: t("home.proFeature2badge"), color: "#2563eb",
      bg: dark ? "#0f1a2e" : "#eff6ff", border: dark ? "#1a3a7a" : "#bfdbfe",
      title: t("home.proFeature2title"), desc: t("home.proFeature2desc"),
      examples: [t("home.proFeature2ex1"), t("home.proFeature2ex2"), t("home.proFeature2ex3")],
    },
    {
      icon: <Sparkles size={24} />, badge: t("home.proFeature3badge"), color: "#7c3aed",
      bg: dark ? "#130d24" : "#fdf4ff", border: dark ? "#2a1a4a" : "#e9d5ff",
      title: t("home.proFeature3title"), desc: t("home.proFeature3desc"),
      examples: [t("home.proFeature3ex1"), t("home.proFeature3ex2"), t("home.proFeature3ex3")],
    },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse-dot { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:0.7; } 50% { transform: translate(-50%,-50%) scale(2); opacity:0.2; } }
        .fade-1{animation:fadeUp 0.5s 0.05s ease both}
        .fade-2{animation:fadeUp 0.5s 0.15s ease both}
        .fade-3{animation:fadeUp 0.5s 0.25s ease both}
        .fade-4{animation:fadeUp 0.5s 0.35s ease both}
        .fade-5{animation:fadeUp 0.5s 0.45s ease both}
        .pro-card{transition:transform 0.2s,box-shadow 0.2s}
        .pro-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.12)}
        input::placeholder{color:#9ca3af}
      `}</style>

      {/* Hero */}
      <section style={{ background: heroBg, borderBottom: `1px solid ${borderColor}`, padding: "64px 48px 72px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="fade-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 600, color: "#2563eb", letterSpacing: "0.04em", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              {t("home.badge")}
            </div>
            <h1 className="fade-2" style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, color: textColor, marginBottom: 20, marginTop: 0 }}>
              {t("home.h1")}<br />
              <span style={{ color: "#2563eb" }}>{t("home.h1accent")}</span>
            </h1>
            <p className="fade-3" style={{ fontSize: 16, color: mutedColor, marginBottom: 32, lineHeight: 1.7, maxWidth: 440 }}>
              {t("home.subtitle")}
            </p>
            <div className="fade-4">
              <Suspense><HeroSearch dark={dark} /></Suspense>
            </div>
            <div className="fade-5" style={{ marginTop: 24 }}>
              <LiveTicker dark={dark} />
            </div>
            <div className="fade-5" style={{ marginTop: 28, display: "flex", gap: 20 }}>
              {[
                { text: t("home.checkNoReg") },
                { text: t("home.checkFree") },
                { text: t("home.checkSources") },
              ].map(({ text }) => (
                <span key={text} style={{ fontSize: 12, color: dark ? "#888" : "#6b7280", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>{text}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <FirmaCardMockup dark={dark} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderBottom: `1px solid ${borderColor}`, background: cardBg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ borderRight: i < 3 ? `1px solid ${borderColor}` : "none" }}>
              <AnimatedStat value={s.value} label={s.label} dark={dark} />
            </div>
          ))}
        </div>
      </section>

      {/* Pro Features */}
      <section style={{ padding: "80px 32px", background: dark ? "#0a0a0a" : "#f8faff", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase" as const, marginBottom: 12 }}>{t("home.proSectionTag")}</p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, lineHeight: 1.15, marginBottom: 16 }}>
              {t("home.proSectionH2a")}<br />{t("home.proSectionH2b")}
            </h2>
            <p style={{ fontSize: 16, color: mutedColor, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
              {t("home.proSectionDesc")}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="pro-card" style={{ background: f.bg, border: `1px solid ${f.border}`, borderRadius: 20, padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${f.color}22`, border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: f.color, textTransform: "uppercase" as const }}>{f.badge}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: dark ? "#fff" : "#111", marginTop: 4, lineHeight: 1.3 }}>{f.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: dark ? "#888" : "#6b7280", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {f.examples.map((ex, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                      <span style={{ color: dark ? "#aaa" : "#374151" }}>{ex}</span>
                    </div>
                  ))}
                </div>
                <Link href="/cennik" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: f.color, textDecoration: "none", marginTop: "auto", paddingTop: 4 }}>
                  {t("home.proSeePrice")} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/cennik" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, padding: "13px 32px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", textDecoration: "none" }}>
              {t("home.proCta")} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Map + Live stats */}
      <section style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 12 }}>{t("home.liveTag")}</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, marginBottom: 16, lineHeight: 1.2 }}>
              {t("home.liveH2a")}<br />{t("home.liveH2b")}
            </h2>
            <p style={{ fontSize: 15, color: mutedColor, lineHeight: 1.7, marginBottom: 24 }}>
              {t("home.liveDesc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: t("home.liveStat1label"), value: "~600", color: "#22c55e" },
                { label: t("home.liveStat2label"), value: "~4 000", color: "#2563eb" },
                { label: t("home.liveStat3label"), value: "54%", color: "#f59e0b" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: dark ? "#aaa" : "#374151" }}>{item.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <MapPoland dark={dark} />
        </div>
      </section>

      {/* Use cases */}
      <section style={{ background: cardBg, borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: "64px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 12 }}>{t("home.usecasesTag")}</p>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, lineHeight: 1.2 }}>{t("home.usecasesH2")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>

            {/* Handlowiec */}
            <div style={{ background: dark ? "#0d0d0d" : "#f9fafb", border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 6 }}>{t("home.usecase1tag")}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: textColor, marginBottom: 4, lineHeight: 1.4 }}>{t("home.usecase1title")}</h3>
                <p style={{ fontSize: 12, color: dark ? "#666" : "#9ca3af", marginBottom: 14 }}>{t("home.usecase1desc")}</p>
              </div>
              <div style={{ margin: "0 14px", background: dark ? "#111" : "#fff", border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                {[
                  { name: "Softex Solutions sp. z o.o.", city: "Poznań", tel: "+48 61 ••• ••••" },
                  { name: "DataBridge Poland sp. z o.o.", city: "Gniezno", tel: "+48 61 ••• ••••" },
                  { name: "Kowalski IT JDG", city: "Konin", tel: "+48 602 ••• •••" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: i < 2 ? `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                      {r.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: textColor, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                      <p style={{ fontSize: 10, color: dark ? "#555" : "#9ca3af", margin: 0 }}>{r.city}</p>
                    </div>
                    <span style={{ fontSize: 10, color: "#16a34a", fontFamily: "monospace", flexShrink: 0 }}>{r.tel}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 14px 20px", display: "flex", gap: 8 }}>
                <Link href="/search?pkd=6201Z&wojewodztwo=wielkopolskie" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "8px 0", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
                  <Search size={11} /> {t("home.usecase1cta")}
                </Link>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "8px 0", background: dark ? "#1a1a1a" : "#f3f4f6", color: dark ? "#888" : "#6b7280", borderRadius: 8, border: `1px solid ${borderColor}` }}>
                  <Download size={11} /> {t("home.usecase1cta2")}
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div style={{ background: dark ? "#0d0d0d" : "#f9fafb", border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 6 }}>{t("home.usecase2tag")}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: textColor, marginBottom: 4, lineHeight: 1.4 }}>{t("home.usecase2title")}</h3>
                <p style={{ fontSize: 12, color: dark ? "#666" : "#9ca3af", marginBottom: 14 }}>{t("home.usecase2desc")}</p>
              </div>
              <div style={{ margin: "0 14px", background: dark ? "#111" : "#fff", border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ padding: "10px 12px", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: textColor, margin: 0 }}>ABC Trading sp. z o.o.</p>
                  <p style={{ fontSize: 10, color: dark ? "#555" : "#9ca3af", margin: "2px 0 0", fontFamily: "monospace" }}>NIP 5213456789</p>
                </div>
                {[
                  { label: t("home.usecase2row1"), value: t("home.usecase2row1v"), ok: true },
                  { label: t("home.usecase2row2"), value: t("home.usecase2row2v"), ok: true },
                  { label: t("home.usecase2row3"), value: "PL61 1090 ••••", ok: true },
                  { label: t("home.usecase2row4"), value: t("home.usecase2row4v"), ok: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: i < 3 ? `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` : "none" }}>
                    <span style={{ fontSize: 11, color: dark ? "#888" : "#6b7280" }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: row.ok ? "#16a34a" : "#ef4444" }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 14px 20px", display: "flex", gap: 8 }}>
                <Link href="/search" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "8px 0", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
                  <Shield size={11} /> {t("home.usecase2cta")}
                </Link>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "8px 0", background: dark ? "#1a1a1a" : "#f3f4f6", color: dark ? "#888" : "#6b7280", borderRadius: 8, border: `1px solid ${borderColor}` }}>
                  <Bell size={11} /> {t("home.usecase2cta2")}
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div style={{ background: dark ? "#0d0d0d" : "#f9fafb", border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 6 }}>{t("home.usecase3tag")}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: textColor, marginBottom: 4, lineHeight: 1.4 }}>{t("home.usecase3title")}</h3>
                <p style={{ fontSize: 12, color: dark ? "#666" : "#9ca3af", marginBottom: 14 }}>{t("home.usecase3desc")}</p>
              </div>
              <div style={{ margin: "0 14px", background: dark ? "#111" : "#fff", border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px", padding: "6px 12px", background: dark ? "#0a0a0a" : "#f9fafb", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` }}>
                  {[t("home.usecase3col1"), t("home.usecase3col2"), t("home.usecase3col3")].map((col, i) => (
                    <span key={i} style={{ fontSize: 9, fontWeight: 700, color: dark ? "#555" : "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: i > 0 ? "center" as const : "left" as const }}>{col}</span>
                  ))}
                </div>
                {[
                  { city: "Kalisz", count: 1 }, { city: "Ostrów Wlkp.", count: 2 },
                  { city: "Konin", count: 1 }, { city: "Leszno", count: 2 },
                ].map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px", padding: "7px 12px", borderBottom: i < 3 ? `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` : "none", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: textColor }}>{r.city}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", textAlign: "center" as const }}>{r.count}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px", textAlign: "center" as const }}>{t("home.usecase3free")}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 14px 20px", display: "flex", gap: 8 }}>
                <Link href="/search" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "8px 0", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
                  <MapPin size={11} /> {t("home.usecase3cta")}
                </Link>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "8px 0", background: dark ? "#1a1a1a" : "#f3f4f6", color: dark ? "#888" : "#6b7280", borderRadius: 8, border: `1px solid ${borderColor}` }}>
                  <Download size={11} /> {t("home.usecase3cta2")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "72px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 12 }}>{t("home.featuresTag")}</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, lineHeight: 1.2 }}>{t("home.featuresH2")}</h2>
          <p style={{ fontSize: 16, color: mutedColor, marginTop: 12, maxWidth: 480, margin: "12px auto 0", lineHeight: 1.65 }}>{t("home.featuresDesc")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "28px 32px", display: "flex", gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>{f.icon}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: textColor, marginBottom: 8 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: mutedColor, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section style={{ background: cardBg, borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, padding: "64px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 12 }}>{t("home.coverageTag")}</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, marginBottom: 20, lineHeight: 1.2 }}>{t("home.coverageH2")}</h2>
            <p style={{ fontSize: 15, color: mutedColor, lineHeight: 1.7, marginBottom: 28 }}>{t("home.coverageDesc")}</p>
            {[
              { label: t("home.coverageNip"), pct: 99 },
              { label: t("home.coverageVat"), pct: 94 },
              { label: t("home.coverageWww"), pct: 67 },
              { label: t("home.coverageTel"), pct: 54 },
              { label: t("home.coverageEmail"), pct: 38 },
            ].map(({ label, pct }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: textColor }}>{label}</span>
                  <span style={{ color: mutedColor, fontFamily: "monospace" }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: dark ? "#1e1e1e" : "#f3f4f6" }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${pct}%`, background: "#2563eb" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: <Building2 size={20} />, label: "KRS", value: "711k+", sub: t("home.coverageKrs"), color: "#eff6ff", tc: "#2563eb" },
              { icon: <Users size={20} />, label: "CEIDG", value: "869k+", sub: t("home.coverageCeidg"), color: "#f0fdf4", tc: "#16a34a" },
              { icon: <Database size={20} />, label: "GUS BIR", value: "88%", sub: t("home.coverageGus"), color: "#fefce8", tc: "#ca8a04" },
              { icon: <Shield size={20} />, label: "Biała lista", value: "94%", sub: t("home.coverageBiala"), color: "#fdf4ff", tc: "#9333ea" },
            ].map((c, i) => (
              <div key={i} style={{ background: c.color, borderRadius: 16, padding: "24px 20px", border: `1px solid ${c.tc}22` }}>
                <div style={{ color: c.tc, marginBottom: 10 }}>{c.icon}</div>
                <p style={{ fontSize: 11, fontWeight: 600, color: c.tc, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: "#111" }}>{c.value}</p>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 32px", textAlign: "center", background: dark ? "#0a0a0a" : "#f0f7ff", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2563eb", textTransform: "uppercase" as const, marginBottom: 16 }}>{t("home.ctaTag")}</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, marginBottom: 16, lineHeight: 1.15 }}>
            {t("home.ctaH2a")}<br />
            <span style={{ color: "#2563eb" }}>{t("home.ctaH2b")}</span>
          </h2>
          <p style={{ fontSize: 15, color: mutedColor, marginBottom: 36, lineHeight: 1.65 }}>
            {t("home.ctaDesc")}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" style={{ fontSize: 15, fontWeight: 600, padding: "14px 32px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {t("home.ctaBtn")} <ArrowRight size={15} />
            </Link>
            <Link href="/cennik" style={{ fontSize: 15, fontWeight: 500, padding: "14px 32px", border: `1px solid ${borderColor}`, borderRadius: 12, background: cardBg, color: textColor, textDecoration: "none" }}>
              {t("home.ctaPricing")}
            </Link>
          </div>
          <p style={{ fontSize: 12, color: mutedColor, marginTop: 16 }}>{t("home.ctaNote")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${borderColor}`, padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.03em", color: textColor }}>nipgo</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
        </div>
        <p style={{ fontSize: 11, color: mutedColor }}>{t("home.footerCopy")} © {new Date().getFullYear()} nipgo.pl</p>
        <div style={{ display: "flex", gap: 16 }}>
          {[t("home.footerTos"), t("home.footerPrivacy"), t("home.footerContact")].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: mutedColor, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
