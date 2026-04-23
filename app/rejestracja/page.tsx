"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import { useT } from "@/lib/i18n"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function RejestracjaInner() {
  const t = useT()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)
  const supabase = createClient()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const searchParams = useSearchParams()

  const cardBg = dark ? "#111" : "#fff"
  const borderColor = dark ? "#1e1e1e" : "#e8eaed"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#6b7280"
  const inputBorder = dark ? "#2a2a2a" : "#e5e7eb"

  const PLANS = [
    {
      id: "free",
      name: t("pricing.planFree"),
      price: "0 zł",
      period: "",
      desc: t("pricing.planFreeDesc"),
      features: [t("pricing.featureFreeResults"), t("pricing.featureRegistry"), t("pricing.featureVat")],
      color: "#6b7280",
      bg: "transparent",
    },
    {
      id: "basic",
      name: t("pricing.planBasic"),
      price: "59 zł",
      period: t("common.perMonth"),
      desc: t("pricing.planBasicDesc"),
      features: ["25 " + t("pricing.featureResults"), t("pricing.featureContact"), "1000 " + t("pricing.featureExports"), "20 " + t("pricing.featureMonitoring")],
      color: "#2563eb",
      bg: dark ? "#0f1a2e" : "#eff6ff",
      highlight: true,
    },
    {
      id: "pro",
      name: t("pricing.planPro"),
      price: "119 zł",
      period: t("common.perMonth"),
      desc: t("pricing.planProDesc"),
      features: [t("pricing.featureAll"), "5000 " + t("pricing.featureExports"), "100 " + t("pricing.featureMonitoring"), t("pricing.featureAi")],
      color: "#7c3aed",
      bg: dark ? "#130d24" : "#fdf4ff",
    },
  ]

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
    setSuccess(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?plan=${selectedPlan}`,
      },
    })
    if (error) {
      setError(error.message === "User already registered" ? t("register.errorAlreadyRegistered") : error.message)
    } else {
      setSuccess(t("register.successMsg"))
    }
    setLoading(false)
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan)

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: "24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: step === 1 ? 560 : 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: textColor }}>nipgo</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          </Link>
          <p style={{ fontSize: 14, color: mutedColor, marginTop: 8 }}>{t("register.title")}</p>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: step >= s ? "#2563eb" : (dark ? "#1a1a1a" : "#f3f4f6"), border: `1px solid ${step >= s ? "#2563eb" : (dark ? "#2a2a2a" : "#e5e7eb")}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: step >= s ? "#fff" : mutedColor }}>
                  {s}
                </div>
                {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? "#2563eb" : (dark ? "#1a1a1a" : "#e5e7eb") }} />}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: mutedColor, marginTop: 8 }}>{step === 1 ? t("register.step1of2") : t("register.step2of2")} — {step === 1 ? t("register.step1") : t("register.step2")}</p>
        </div>

        {step === 1 ? (
          /* Krok 1 — wybór planu */
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {PLANS.map(plan => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  style={{ padding: "16px 12px", border: `2px solid ${selectedPlan === plan.id ? plan.color : (dark ? "#1e1e1e" : "#e8eaed")}`, borderRadius: 14, background: selectedPlan === plan.id ? plan.bg : (dark ? "#0d0d0d" : "#f9fafb"), cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: selectedPlan === plan.id ? plan.color : textColor, margin: "0 0 4px" }}>{plan.name}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: textColor, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{plan.price}<span style={{ fontSize: 11, fontWeight: 400, color: mutedColor }}>{plan.period}</span></p>
                  <p style={{ fontSize: 11, color: mutedColor, margin: "0 0 10px" }}>{plan.desc}</p>
                  {plan.features.map(f => (
                    <p key={f} style={{ fontSize: 11, color: dark ? "#888" : "#374151", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: plan.color, fontWeight: 700 }}>✓</span> {f}
                    </p>
                  ))}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              style={{ width: "100%", padding: "13px 20px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {t("common.next")} →
            </button>
          </div>
        ) : (
          /* Krok 2 — tworzenie konta */
          <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: "32px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

            {/* Plan summary */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: dark ? "#0d0d0d" : "#f8f9fb", borderRadius: 10, marginBottom: 24, border: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: 13, color: mutedColor }}>{t("register.planSelect")} <strong style={{ color: textColor }}>{selectedPlanData?.name}</strong> — {selectedPlanData?.price}{selectedPlanData?.period}</span>
              <button onClick={() => setStep(1)} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>{t("register.changePlan")}</button>
            </div>

            <p style={{ fontSize: 13, color: mutedColor, textAlign: "center", marginBottom: 20 }}>
              {selectedPlan === "free" ? t("register.planFreeNote") : t("register.planPaidNote")}
            </p>

            <button onClick={handleGoogle} disabled={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 600, color: textColor, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("register.googleBtn")}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: inputBorder }} />
              <span style={{ fontSize: 12, color: mutedColor }}>{t("register.or")}</span>
              <div style={{ flex: 1, height: 1, background: inputBorder }} />
            </div>

            {!showEmail ? (
              <button onClick={() => setShowEmail(true)}
                style={{ width: "100%", padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 500, color: textColor, cursor: "pointer" }}>
                {t("register.emailBtn")}
              </button>
            ) : (
              <form onSubmit={handleEmail}>
                <input type="email" placeholder={t("register.emailPlaceholder")} value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
                <input type="password" placeholder={t("register.passwordPlaceholder")} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "12px 20px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                  {loading ? t("register.loading") : t("register.submitBtn")}
                </button>
              </form>
            )}

            {error && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12, textAlign: "center" }}>{error}</p>}
            {success && <p style={{ fontSize: 13, color: "#22c55e", marginTop: 12, textAlign: "center" }}>{success}</p>}

            <button onClick={() => setStep(1)} style={{ display: "block", margin: "16px auto 0", fontSize: 13, color: mutedColor, background: "none", border: "none", cursor: "pointer" }}>
              {t("register.backBtn")}
            </button>
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
