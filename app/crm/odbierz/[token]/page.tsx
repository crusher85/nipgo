"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/components/ThemeProvider"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Building2, MapPin, Check, Lock, ChevronRight } from "lucide-react"

type ContactPreview = {
  nazwa: string | null
  forma_prawna: string | null
  miejscowosc: string | null
  nip: string
  shared_by_name: string | null
}

export default function OdbierzPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const dark = theme === "dark"

  const text = dark ? "#f5f5f5" : "#111"
  const muted = dark ? "#555" : "#9ca3af"
  const card = dark ? "#111" : "#fff"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const sub = dark ? "#0d0d0d" : "#f8f9fb"
  const bg = dark ? "#0a0a0a" : "#f8f9fb"

  const [state, setState] = useState<"loading" | "preview" | "no_token" | "already_claimed" | "success" | "need_pro">("loading")
  const [contact, setContact] = useState<ContactPreview | null>(null)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>("free")
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token) { setState("no_token"); return }

      // Sprawdź usera
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("plan")
          .eq("id", user.id)
          .single()
        setPlan(profile?.plan ?? "free")
      }

      // Pobierz kontakt po tokenie — tylko podstawowe dane (preview)
      const { data: raw } = await supabase
        .from("crm_contacts")
        .select("nazwa, forma_prawna, miejscowosc, nip, shared_by, share_token")
        .eq("share_token", token)
        .single()

      if (!raw) { setState("no_token"); return }

      // Pobierz imię wysyłającego
      let senderName: string | null = null
      if (raw.shared_by) {
        const { data: sender } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", raw.shared_by)
          .single()
        senderName = sender?.full_name ?? null
      }

      setContact({
        nazwa: raw.nazwa,
        forma_prawna: raw.forma_prawna,
        miejscowosc: raw.miejscowosc,
        nip: raw.nip,
        shared_by_name: senderName,
      })

      setState("preview")
    }
    load()
  }, [token])

  async function handleClaim() {
    if (!user) { router.push(`/rejestracja?plan=pro&redirect=/crm/odbierz/${token}`); return }
    if (plan !== "pro") { setState("need_pro"); return }

    setClaiming(true)
    const res = await fetch("/api/crm/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()

    if (data.already_exists) { setState("already_claimed"); setClaiming(false); return }
    if (data.success) { setState("success"); setClaiming(false) }
    else { setClaiming(false) }
  }

  const centerStyle: React.CSSProperties = {
    minHeight: "100vh", background: bg, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 24,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  if (state === "loading") return (
    <div style={centerStyle}>
      <p style={{ color: muted, fontSize: 14 }}>Ładowanie...</p>
    </div>
  )

  if (state === "no_token") return (
    <div style={centerStyle}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>🔗</p>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: text, margin: "0 0 8px" }}>Link nieważny lub wygasły</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 24px" }}>Ten link do odbioru kontaktu nie istnieje lub wygasł.</p>
        <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", padding: "10px 24px", borderRadius: 10, textDecoration: "none" }}>
          Przejdź do nipgo.pl
        </Link>
      </div>
    </div>
  )

  if (state === "success") return (
    <div style={centerStyle}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={24} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: text, margin: "0 0 8px" }}>Kontakt dodany do CRM!</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 24px" }}>{contact?.nazwa ?? contact?.nip} jest teraz w Twoim CRM.</p>
        <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", padding: "10px 24px", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          Przejdź do CRM <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )

  if (state === "already_claimed") return (
    <div style={centerStyle}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check size={24} color="#2563eb" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: text, margin: "0 0 8px" }}>Już masz ten kontakt</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 24px" }}>{contact?.nazwa ?? contact?.nip} jest już w Twoim CRM.</p>
        <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", padding: "10px 24px", borderRadius: 10, textDecoration: "none" }}>
          Przejdź do CRM
        </Link>
      </div>
    </div>
  )

  if (state === "need_pro") return (
    <div style={centerStyle}>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 32, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Lock size={20} color="#2563eb" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: text, margin: "0 0 8px" }}>Wymagany plan Pro</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 24px" }}>CRM jest dostępny tylko w planie Pro. Odbierz kontakt i zyskaj dostęp do pełnego CRM.</p>
        <Link href={`/cennik?redirect=/crm/odbierz/${token}`}
          style={{ display: "inline-block", fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", padding: "12px 28px", borderRadius: 10, textDecoration: "none", marginBottom: 12 }}>
          Przejdź na Pro — 119 zł/mies
        </Link>
        <p style={{ fontSize: 12, color: muted, margin: 0 }}>Link do odbioru zostanie zachowany</p>
      </div>
    </div>
  )

  // Preview state
  return (
    <div style={centerStyle}>
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 32, maxWidth: 440, width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em", color: text }}>nipgo</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
        </div>

        {contact?.shared_by_name && (
          <p style={{ fontSize: 13, color: muted, margin: "0 0 20px" }}>
            <strong style={{ color: text }}>{contact.shared_by_name}</strong> wysłał Ci kontakt biznesowy
          </p>
        )}

        {/* Contact card */}
        <div style={{ background: sub, border: `1px solid ${border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
              {(contact?.nazwa ?? "?").replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: text, margin: 0 }}>{contact?.nazwa ?? contact?.nip}</p>
              {contact?.forma_prawna && <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>{contact.forma_prawna}</p>}
            </div>
          </div>
          {contact?.miejscowosc && (
            <p style={{ fontSize: 13, color: muted, display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
              <MapPin size={12} /> {contact.miejscowosc}
            </p>
          )}

          {/* Blurred contact data teaser */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Dane kontaktowe</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {["📞 +48 ••• ••• •••", "✉️ ••••@••••.pl", "🌐 www.••••.pl"].map((item, i) => (
                <p key={i} style={{ fontSize: 13, color: muted, margin: 0, filter: "blur(3px)", userSelect: "none" }}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {!user ? (
          <div>
            <Link href={`/rejestracja?plan=pro&redirect=/crm/odbierz/${token}`}
              style={{ display: "block", textAlign: "center", padding: "12px 24px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              Zarejestruj się i odbierz kontakt
            </Link>
            <p style={{ fontSize: 12, color: muted, textAlign: "center", margin: 0 }}>Wymagany plan Pro · 119 zł/mies</p>
          </div>
        ) : plan === "pro" ? (
          <button onClick={handleClaim} disabled={claiming}
            style={{ width: "100%", padding: "12px 24px", background: claiming ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: claiming ? "not-allowed" : "pointer" }}>
            {claiming ? "Dodawanie..." : "Dodaj do mojego CRM"}
          </button>
        ) : (
          <div>
            <Link href={`/cennik?redirect=/crm/odbierz/${token}`}
              style={{ display: "block", textAlign: "center", padding: "12px 24px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              Przejdź na Pro i odbierz kontakt
            </Link>
            <p style={{ fontSize: 12, color: muted, textAlign: "center", margin: 0 }}>Masz konto Free/Basic · CRM wymaga Pro</p>
          </div>
        )}
      </div>
    </div>
  )
}
