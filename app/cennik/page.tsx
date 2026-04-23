"use client"

import Link from "next/link"
import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { Check, X, Zap, Shield, Download, Brain, ChevronDown, Sparkles } from "lucide-react"

type Period = "monthly" | "yearly"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    priceMonthlyFromYearly: null,
    desc: "Do przeglądania i weryfikacji",
    color: "#6b7280",
    popular: false,
    cta: "Zacznij za darmo",
    ctaHref: "/rejestracja",
    trial: null,
    features: [
      { label: "10 wyników wyszukiwania", ok: true },
      { label: "Karta firmy (dane rejestrowe)", ok: true },
      { label: "Status VAT", ok: true },
      { label: "Filtry: miasto, woj., forma prawna, PKD", ok: true },
      { label: "Dane kontaktowe", ok: false },
      { label: "Eksport CSV", ok: false },
      { label: "AI wyszukiwanie", ok: false },
      { label: "Monitoring firm", ok: false },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 59, yearly: 629 },
    priceMonthlyFromYearly: 52,
    desc: "Dla handlowców i małych zespołów",
    color: "#2563eb",
    popular: true,
    cta: "Zacznij Basic",
    ctaHref: "/rejestracja?plan=basic",
    trial: "🎁 Pierwsze 7 dni na poziomie Pro — w cenie Basic",
    features: [
      { label: "Wszystkie wyniki wyszukiwania", ok: true },
      { label: "Dane kontaktowe (telefon, email, WWW)", ok: true },
      { label: "Eksport CSV — 1 000 rekordów/mies", ok: true },
      { label: "AI wyszukiwanie — 30 zapytań/dzień", ok: true },
      { label: "Monitoring — 20 firm", ok: true },
      { label: "Filtry premium (kontakty, kapitał, VAT)", ok: true },
      { label: "Weryfikacja kontrahenta (podstawowa)", ok: true },
      { label: "Historia zmian firmy", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 119, yearly: 1259 },
    priceMonthlyFromYearly: 105,
    desc: "Dla działów sprzedaży i agencji",
    color: "#7c3aed",
    popular: false,
    cta: "Zacznij Pro",
    ctaHref: "/rejestracja?plan=pro",
    trial: null,
    features: [
      { label: "Wszystko z Basic", ok: true },
      { label: "Eksport CSV — 5 000 rekordów/mies", ok: true },
      { label: "AI wyszukiwanie — 100 zapytań/dzień", ok: true },
      { label: "Monitoring — 100 firm", ok: true },
      { label: "Historia zmian firmy", ok: true },
      { label: "Taby Finanse, Ryzyko, Aktywność, Dotacje", ok: true },
      { label: "Pełna weryfikacja kontrahenta", ok: true },
      { label: "Wsparcie priorytetowe", ok: true },
    ],
  },
]

const EXPORT_PACKAGES = [
  { records: "500 rekordów",    price: 19 },
  { records: "2 000 rekordów",  price: 59 },
  { records: "10 000 rekordów", price: 199 },
]

const AI_PACKAGES = [
  { queries: "100 zapytań",   price: 19 },
  { queries: "500 zapytań",   price: 69 },
  { queries: "2 000 zapytań", price: 199 },
]

const FAQ = [
  {
    q: "Czy mogę anulować w dowolnym momencie?",
    a: "Tak. Anulacja jest natychmiastowa — dostęp masz do końca opłaconego okresu. Bez ukrytych opłat i bez wymaganych powodów.",
  },
  {
    q: "Na czym polega bonus 7 dni Pro dla Basic?",
    a: "Każdy nowy użytkownik który wykupi plan Basic, przez pierwsze 7 dni korzysta z funkcji Pro — widzi historię zmian firm, wszystkie taby analityczne i pełną weryfikację kontrahenta. Po 7 dniach automatycznie przechodzi na standardowy Basic. Żadnych dodatkowych opłat.",
  },
  {
    q: "Jak działają płatności?",
    a: "Płatności są rekurencyjne — pobierane automatycznie co miesiąc lub rok z podanej karty. Obsługujemy karty Visa, Mastercard oraz płatności przez Przelewy24.",
  },
  {
    q: "Co się stanie gdy przekroczę limit eksportów?",
    a: "Możesz dokupić jednorazowy pakiet eksportów bez zmiany planu. Limit odnawia się pierwszego dnia każdego miesiąca.",
  },
  {
    q: "Czy dostanę fakturę VAT?",
    a: "Tak — faktura KSeF wystawiana jest automatycznie po każdej płatności na podane dane firmowe.",
  },
  {
    q: "Skąd pochodzą dane?",
    a: "Z rejestrów publicznych: KRS (Ministerstwo Sprawiedliwości), CEIDG (Ministerstwo Rozwoju), GUS BIR, Biała Lista VAT MF. Dane kontaktowe z własnych scraperów stron WWW firm — aktualizowane na bieżąco.",
  },
]

function FaqItem({ q, a, dark }: { q: string; a: string; dark: boolean }) {
  const [open, setOpen] = useState(false)
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#666" : "#6b7280"
  return (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", cursor: "pointer", gap: 16, textAlign: "left" }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: textColor }}>{q}</span>
        <ChevronDown size={16} color={mutedColor} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && <p style={{ fontSize: 14, color: mutedColor, lineHeight: 1.7, paddingBottom: 18, margin: 0 }}>{a}</p>}
    </div>
  )
}

export default function CennikPage() {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const [period, setPeriod] = useState<Period>("monthly")

  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#666" : "#6b7280"
  const cardBg = dark ? "#111" : "#fff"
  const borderColor = dark ? "#1e1e1e" : "#e8eaed"
  const bg = dark ? "#0a0a0a" : "#f8f9fb"

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeUp 0.4s ease both; }
        @media (max-width: 768px) { .plans-grid { grid-template-columns: 1fr !important; } .alacarte-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }} className="fade-in">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: "#2563eb", letterSpacing: "0.06em", marginBottom: 20 }}>
            <Zap size={11} /> CENY EARLY ADOPTER
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.04em", color: textColor, margin: "0 0 16px", lineHeight: 1.1 }}>
            Prosty cennik.<br />Bez niespodzianek.
          </h1>
          <p style={{ fontSize: 16, color: mutedColor, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.65 }}>
            Subskrypcja miesięczna lub roczna. Anuluj w dowolnym momencie.
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", background: dark ? "#1a1a1a" : "#f3f4f6", borderRadius: 10, padding: 4 }}>
            {(["monthly", "yearly"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{ padding: "8px 20px", fontSize: 13, fontWeight: 500, borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.15s", background: period === p ? (dark ? "#222" : "#fff") : "transparent", color: period === p ? textColor : mutedColor, boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                {p === "monthly" ? "Miesięcznie" : <span>Rocznie <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginLeft: 4 }}>-12%</span></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
          {PLANS.map((plan, i) => {
            const price = period === "monthly" ? plan.price.monthly : plan.price.yearly
            const monthlyEquiv = period === "yearly" && plan.priceMonthlyFromYearly
            const savings = plan.price.monthly * 12 - plan.price.yearly

            return (
              <div key={plan.id} className="fade-in"
                style={{ background: cardBg, border: `${plan.popular ? 2 : 1}px solid ${plan.popular ? plan.color : borderColor}`, borderRadius: 16, padding: 28, position: "relative", display: "flex", flexDirection: "column", animationDelay: `${i * 0.08}s` }}>

                {plan.popular && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", padding: "4px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>
                    NAJPOPULARNIEJSZY
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: plan.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    {price === 0
                      ? <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: textColor }}>0 zł</span>
                      : <><span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", color: textColor }}>{price} zł</span><span style={{ fontSize: 13, color: mutedColor }}>{period === "yearly" ? "/rok" : "/mies"}</span></>
                    }
                  </div>
                  {monthlyEquiv && savings > 0 && (
                    <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 500, margin: "0 0 6px" }}>
                      ~{plan.priceMonthlyFromYearly} zł/mies — oszczędzasz {savings} zł/rok
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: mutedColor, margin: 0 }}>{plan.desc}</p>
                </div>

                {plan.trial && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 10px", marginBottom: 16 }}>
                    <Sparkles size={12} color="#16a34a" />
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#15803d" }}>{plan.trial}</span>
                  </div>
                )}

                <Link href={plan.ctaHref}
                  style={{ display: "block", textAlign: "center", padding: "11px 0", fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: "none", marginBottom: 20, background: plan.popular ? plan.color : "transparent", color: plan.popular ? "#fff" : plan.color, border: `1.5px solid ${plan.popular ? plan.color : plan.color + "44"}`, transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  {plan.cta}
                </Link>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.ok ? "#f0fdf4" : "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        {f.ok ? <Check size={11} color="#16a34a" strokeWidth={2.5} /> : <X size={11} color="#ef4444" strokeWidth={2.5} />}
                      </div>
                      <span style={{ fontSize: 13, color: f.ok ? textColor : mutedColor, lineHeight: 1.5 }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bonus box */}
        <div style={{ background: dark ? "#0f1a0f" : "#f0fdf4", border: `1px solid ${dark ? "#1a3a1a" : "#bbf7d0"}`, borderRadius: 14, padding: "18px 24px", marginBottom: 64, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Sparkles size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: dark ? "#86efac" : "#166534", margin: 0, lineHeight: 1.6 }}>
            <strong>Bonus dla nowych użytkowników Basic:</strong> przez pierwsze 7 dni od rejestracji masz pełny dostęp do funkcji Pro — historia zmian firmy, wszystkie taby analityczne, pełna weryfikacja kontrahenta. Po 7 dniach automatycznie przechodzisz na standardowy Basic. Żadnych dodatkowych opłat.
          </p>
        </div>

        {/* À la carte */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, margin: 0 }}>Dokup gdy potrzebujesz</h2>
            <p style={{ fontSize: 14, color: mutedColor, marginTop: 8 }}>Jednorazowe pakiety dla Basic i Pro — nie wygasają, nie odnawiane automatycznie.</p>
          </div>
          <div className="alacarte-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { title: "Pakiety eksportów", sub: "Dodatkowe rekordy CSV", icon: <Download size={16} color="#2563eb" />, iconBg: "#eff6ff", items: EXPORT_PACKAGES.map(p => ({ label: p.records, price: p.price })), accentColor: "#2563eb", accentBg: "#eff6ff" },
              { title: "Tokeny AI", sub: "Dodatkowe zapytania AI", icon: <Brain size={16} color="#7c3aed" />, iconBg: "#faf5ff", items: AI_PACKAGES.map(p => ({ label: p.queries, price: p.price })), accentColor: "#7c3aed", accentBg: "#faf5ff" },
            ].map(pkg => (
              <div key={pkg.title} style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: pkg.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>{pkg.icon}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: textColor, margin: 0 }}>{pkg.title}</p>
                    <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>{pkg.sub}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pkg.items.map(item => (
                    <div key={item.price} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: dark ? "#0f0f0f" : "#f8f9fb", borderRadius: 10, border: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: 13, color: textColor }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{item.price} zł</span>
                        <Link href="/rejestracja" style={{ fontSize: 12, fontWeight: 600, color: pkg.accentColor, background: pkg.accentBg, borderRadius: 6, padding: "4px 10px", textDecoration: "none" }}>Kup</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise */}
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "24px 32px", marginBottom: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "#1a1a1a" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color={mutedColor} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: textColor, margin: 0 }}>Enterprise</p>
              <p style={{ fontSize: 13, color: mutedColor, margin: "2px 0 0" }}>Nieograniczone eksporty, API access, SLA, dedykowane wsparcie, faktura na firmę</p>
            </div>
          </div>
          <a href="mailto:hello@nipgo.pl" style={{ fontSize: 13, fontWeight: 600, color: textColor, border: `1.5px solid ${borderColor}`, borderRadius: 10, padding: "10px 20px", textDecoration: "none", whiteSpace: "nowrap" }}>
            Skontaktuj się →
          </a>
        </div>

        {/* Comparison */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, margin: 0 }}>Dlaczego nipgo?</h2>
            <p style={{ fontSize: 14, color: mutedColor, marginTop: 8 }}>Porównanie z konkurencją</p>
          </div>
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: dark ? "#0f0f0f" : "#f9fafb" }}>
                  {["Funkcja", "nipgo Basic\n59 zł/mies", "Prześwietl\n57 zł/mies", "Apollo\n~200 zł/mies", "MGBI\njednorazowo"].map((h, i) => (
                    <th key={i} style={{ padding: "14px 20px", textAlign: i === 0 ? "left" : "center", fontSize: 13, fontWeight: 700, color: i === 1 ? "#2563eb" : mutedColor, borderBottom: `1px solid ${borderColor}`, whiteSpace: "pre-line", lineHeight: 1.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["KRS + CEIDG",          "✓", "✓", "✗", "✓"],
                  ["Dane kontaktowe",       "✓", "✓", "✓", "częściowo"],
                  ["Eksport list CSV",      "✓", "✗", "✓", "✓"],
                  ["AI wyszukiwanie",       "✓", "✗", "częściowo", "✗"],
                  ["Transparentne ceny",    "✓", "częściowo", "✓", "✗"],
                  ["Monitoring alertów",    "✓", "✓", "częściowo", "✗"],
                  ["Nowoczesny interfejs",  "✓", "✗", "✓", "✗"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 6 ? `1px solid ${borderColor}` : "none" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "13px 20px", textAlign: j === 0 ? "left" : "center", fontSize: 14, color: cell === "✓" ? "#22c55e" : cell === "✗" ? "#ef4444" : cell === "częściowo" ? "#f59e0b" : j === 0 ? textColor : mutedColor, fontWeight: j === 0 ? 500 : 400 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 680, margin: "0 auto 64px" }}>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, marginBottom: 32, textAlign: "center" }}>
            Pytania i odpowiedzi
          </h2>
          {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} dark={dark} />)}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "48px 32px", background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20 }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, letterSpacing: "-0.03em", color: textColor, marginBottom: 12 }}>
            Zacznij już dziś
          </h2>
          <p style={{ fontSize: 15, color: mutedColor, marginBottom: 28, lineHeight: 1.65 }}>
            Plan Free bez karty. Basic i Pro — płatność kartą, odnawia się automatycznie.<br />Anuluj w dowolnym momencie.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/rejestracja?plan=basic" style={{ fontSize: 14, fontWeight: 600, padding: "12px 28px", background: "#2563eb", color: "#fff", borderRadius: 12, textDecoration: "none" }}>
              Zacznij Basic — 59 zł/mies
            </Link>
            <Link href="/rejestracja" style={{ fontSize: 14, fontWeight: 500, padding: "12px 28px", background: "transparent", color: textColor, border: `1px solid ${borderColor}`, borderRadius: 12, textDecoration: "none" }}>
              Zacznij za darmo (Free)
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
