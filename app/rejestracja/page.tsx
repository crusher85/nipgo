"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0 zł",
    period: "",
    desc: "Na start — bez karty",
    features: ["10 wyników wyszukiwania", "Dane rejestrowe firm", "Status VAT"],
    color: "#6b7280",
    bg: "transparent",
  },
  {
    id: "basic",
    name: "Basic",
    price: "59 zł",
    period: "/mies.",
    desc: "7 dni Pro gratis",
    features: ["25 wyników / strona", "Dane kontaktowe", "1000 eksportów / mies.", "20 firm w monitoringu"],
    color: "#2563eb",
    bg: "transparent",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "119 zł",
    period: "/mies.",
    desc: "Pełny dostęp",
    features: ["Wszystko z Basic", "5000 eksportów / mies.", "100 firm w monitoringu", "AI wyszukiwanie", "Historia zmian"],
    color: "#2563eb",
    bg: "transparent",
    popular: true,
  },
]

function RejestracjaInner() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get("plan") || "free"
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const bg = dark ? "#0a0a0a" : "#f8f9fb"
  const cardBg = dark ? "#111" : "#fff"
  const borderColor = dark ? "#1e1e1e" : "#e8eaed"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#6b7280"
  const inputBorder = dark ? "#2a2a2a" : "#e5e7eb"

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?plan=${selectedPlan}`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?plan=${selectedPlan}`,
      },
    })
    if (error) {
      setError(error.message === "User already registered" ? "Ten email jest już zarejestrowany." : error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const progressPct = step === 1 ? 50 : 100

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif", background: bg }}>
        <div style={{ width: "100%", maxWidth: 400, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: "48px 36px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: textColor, marginBottom: 8 }}>Sprawdź skrzynkę email</h2>
          <p style={{ fontSize: 14, color: mutedColor, lineHeight: 1.6 }}>
            Wysłaliśmy link potwierdzający na <strong style={{ color: textColor }}>{email}</strong>.<br />
            Kliknij w link żeby aktywować konto.
          </p>
          <Link href="/login" style={{ display: "inline-block", marginTop: 24, fontSize: 14, color: "#2563eb", fontWeight: 500, textDecoration: "none" }}>
            Wróć do logowania →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: bg, padding: "40px 24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: step === 1 ? 760 : 400, margin: "0 auto" }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: step === 1 ? "#2563eb" : mutedColor }}>1. Wybierz plan</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: step === 2 ? "#2563eb" : mutedColor }}>2. Utwórz konto</span>
          </div>
          <div style={{ height: 3, background: dark ? "#1e1e1e" : "#e8eaed", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "#2563eb", borderRadius: 4, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: textColor }}>nipgo</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          </Link>
        </div>

        {/* KROK 1 — wybór planu */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: textColor, textAlign: "center", marginBottom: 6 }}>
              Wybierz plan
            </h1>
            <p style={{ fontSize: 14, color: mutedColor, textAlign: "center", marginBottom: 28 }}>
              Możesz zmienić plan w dowolnym momencie
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
              {PLANS.map(plan => {
                const selected = selectedPlan === plan.id
                return (
                  <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      background: cardBg,
                      border: selected ? `2px solid #2563eb` : `1px solid ${borderColor}`,
                      borderRadius: 14,
                      padding: "20px 18px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "border-color 0.15s",
                    }}>
                    {plan.popular && (
                      <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.05em" }}>
                        NAJPOPULARNIEJSZY
                      </div>
                    )}
                    {selected && (
                      <div style={{ position: "absolute", top: 12, right: 12, width: 18, height: 18, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{plan.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{plan.price}</span>
                      <span style={{ fontSize: 12, color: mutedColor }}>{plan.period}</span>
                    </div>
                    <div style={{ fontSize: 11, color: plan.id === "free" ? mutedColor : "#16a34a", fontWeight: 500, marginBottom: 14 }}>
                      {plan.desc}
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: mutedColor, marginBottom: 6 }}>
                          <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={() => setStep(2)}
                style={{ padding: "13px 40px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Dalej →
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 13, color: mutedColor, marginTop: 16 }}>
              Masz już konto?{" "}
              <Link href="/login" style={{ color: "#2563eb", fontWeight: 500, textDecoration: "none" }}>Zaloguj się</Link>
            </p>
          </>
        )}

        {/* KROK 2 — tworzenie konta */}
        {step === 2 && (
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: "36px 32px" }}>
            <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: mutedColor, fontSize: 13, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Wróć
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: textColor, margin: 0 }}>Utwórz konto</h2>
              <span style={{ fontSize: 11, fontWeight: 700, background: dark ? "#1e2a3a" : "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: 6 }}>
                Plan {PLANS.find(p => p.id === selectedPlan)?.name}
              </span>
            </div>
            <p style={{ fontSize: 13, color: mutedColor, marginBottom: 24 }}>
              {selectedPlan === "free" ? "Darmowy dostęp — bez karty kredytowej" : "Zacznij od 7 dni Pro gratis"}
            </p>

            <button onClick={handleGoogle} disabled={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 600, color: textColor, cursor: loading ? "not-allowed" : "pointer", marginBottom: 14, opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Kontynuuj z Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: inputBorder }} />
              <span style={{ fontSize: 12, color: mutedColor }}>lub</span>
              <div style={{ flex: 1, height: 1, background: inputBorder }} />
            </div>

            {!showEmail ? (
              <button onClick={() => setShowEmail(true)}
                style={{ width: "100%", padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 500, color: textColor, cursor: "pointer", fontFamily: "inherit" }}>
                Kontynuuj z emailem
              </button>
            ) : (
              <form onSubmit={handleEmail}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
                <input type="password" placeholder="Hasło (min. 8 znaków)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "12px 20px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                  {loading ? "..." : "Zarejestruj się"}
                </button>
              </form>
            )}

            {error && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12, textAlign: "center" }}>{error}</p>}

            <p style={{ fontSize: 11, color: mutedColor, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
              Rejestrując się akceptujesz{" "}
              <Link href="/regulamin" style={{ color: "#2563eb", textDecoration: "none" }}>Regulamin</Link>
              {" "}i{" "}
              <Link href="/polityka-prywatnosci" style={{ color: "#2563eb", textDecoration: "none" }}>Politykę prywatności</Link>
            </p>

            <p style={{ fontSize: 13, color: mutedColor, textAlign: "center", marginTop: 12 }}>
              Masz już konto?{" "}
              <Link href="/login" style={{ color: "#2563eb", fontWeight: 500, textDecoration: "none" }}>Zaloguj się</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RejestracjaPage() {
  return (
    <Suspense>
      <RejestracjaInner />
    </Suspense>
  )
}