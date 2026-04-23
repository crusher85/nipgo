"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showEmail, setShowEmail] = useState(false)
  const supabase = createClient()
  const { theme } = useTheme()
  const dark = theme === "dark"

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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError("Nieprawid┼éowy email lub has┼éo")
      else window.location.href = "/dashboard"
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
      if (error) setError(error.message)
      else setSuccess("Sprawd┼║ skrzynk─Ö email i potwierd┼║ rejestracj─Ö")
    }
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: "24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: textColor }}>nipgo</span>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
          </Link>
          <p style={{ fontSize: 14, color: mutedColor, marginTop: 8 }}>
            {mode === "login" ? "Zaloguj si─Ö do swojego konta" : "Utw├│rz nowe konto"}
          </p>
        </div>

        <button onClick={handleGoogle} disabled={loading}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 600, color: textColor, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Kontynuuj z Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: inputBorder }} />
          <span style={{ fontSize: 12, color: mutedColor }}>lub</span>
          <div style={{ flex: 1, height: 1, background: inputBorder }} />
        </div>

        {!showEmail ? (
          <button onClick={() => setShowEmail(true)}
            style={{ width: "100%", padding: "12px 20px", border: `1px solid ${inputBorder}`, borderRadius: 12, background: cardBg, fontSize: 14, fontWeight: 500, color: textColor, cursor: "pointer" }}>
            Kontynuuj z emailem
          </button>
        ) : (
          <form onSubmit={handleEmail}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 10, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
            <input type="password" placeholder="Has┼éo" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "12px 14px", border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: cardBg, color: textColor }} />
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px 20px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
              {loading ? "..." : mode === "login" ? "Zaloguj si─Ö" : "Zarejestruj si─Ö"}
            </button>
          </form>
        )}

        {error && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 12, textAlign: "center" }}>{error}</p>}
        {success && <p style={{ fontSize: 13, color: "#22c55e", marginTop: 12, textAlign: "center" }}>{success}</p>}

        <p style={{ fontSize: 13, color: mutedColor, textAlign: "center", marginTop: 20 }}>
          {mode === "login" ? (
            <>Nie masz konta?{" "}
              <button onClick={() => setMode("register")} style={{ color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Zarejestruj si─Ö</button>
            </>
          ) : (
            <>Masz ju┼╝ konto?{" "}
              <button onClick={() => setMode("login")} style={{ color: "#2563eb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Zaloguj si─Ö</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
