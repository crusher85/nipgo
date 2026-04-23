"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sun, Moon, LogOut, LayoutDashboard, Sparkles, X, Send } from "lucide-react"
import { useT } from "@/lib/i18n"

type Theme = "light" | "dark"
type Lang = "pl" | "en"

interface NavbarProps {
  theme: Theme
  onThemeToggle: () => void
  lang: Lang
  onLangToggle: () => void
}

function AIAssistant({ theme }: { theme: Theme }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: t("nav.aiGreeting") }
  ])

  const bg = theme === "dark" ? "#111" : "#fff"
  const border = theme === "dark" ? "#1e1e1e" : "#e8eaed"
  const text = theme === "dark" ? "#f5f5f5" : "#111"
  const muted = theme === "dark" ? "#555" : "#9ca3af"
  const userBubble = "#2563eb"
  const aiBubble = theme === "dark" ? "#1a1a1a" : "#f3f4f6"
  const aiText = theme === "dark" ? "#e5e5e5" : "#374151"

  function handleSend() {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: t("nav.aiComingSoon") }])
    }, 800)
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, width: 48, height: 48,
          borderRadius: "50%", background: "#2563eb", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(37,99,235,0.4)", zIndex: 100, transition: "transform 0.2s, box-shadow 0.2s",
        }}
        title={t("nav.aiAssistant")}
      >
        {open ? <X size={20} color="#fff" /> : <Sparkles size={20} color="#fff" />}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: 84, right: 24, width: 320, maxHeight: 440,
          background: bg, border: `1px solid ${border}`, borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100,
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={14} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: 0 }}>{t("nav.aiAssistant")}</p>
              <p style={{ fontSize: 11, color: muted, margin: 0 }}>{t("nav.findFirms")}</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "8px 12px",
                  borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: m.role === "user" ? userBubble : aiBubble,
                  fontSize: 12, lineHeight: 1.5,
                  color: m.role === "user" ? "#fff" : aiText,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "8px 12px", borderTop: `1px solid ${border}`, display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={t("nav.aiPlaceholder")}
              style={{
                flex: 1, padding: "8px 12px", border: `1px solid ${border}`,
                borderRadius: 8, fontSize: 12, background: "transparent",
                color: text, outline: "none", fontFamily: "inherit",
              }}
            />
            <button onClick={handleSend} style={{ width: 32, height: 32, borderRadius: 8, background: "#2563eb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Send size={13} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function Navbar({ theme, onThemeToggle, lang, onLangToggle }: NavbarProps) {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>("free")
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const dark = theme === "dark"
  const bg = dark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"
  const btnOutlineBg = dark ? "transparent" : "#fff"
  const btnOutlineBorder = dark ? "#2a2a2a" : "#e5e7eb"
  const btnOutlineColor = dark ? "#aaa" : "#374151"

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from("user_profiles").select("plan").eq("id", user.id).single()
          .then(({ data }) => { if (data) setPlan(data.plan) })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  const planBadge = plan === "pro"
    ? { label: "Pro", bg: "#eff6ff", color: "#2563eb" }
    : plan === "basic"
    ? { label: "Basic", bg: "#f5f3ff", color: "#7c3aed" }
    : null

  if (pathname === "/login" || pathname === "/rejestracja") return null

  return (
    <>
      <nav style={{
        background: bg, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${border}`, position: "sticky", top: 0, zIndex: 50,
        height: 56, display: "flex", alignItems: "center", padding: "0 32px",
        justifyContent: "space-between", fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.03em", color: textColor }}>nipgo</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onLangToggle} style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
            padding: "5px 10px", borderRadius: 8,
            border: `1px solid ${btnOutlineBorder}`,
            background: btnOutlineBg, color: btnOutlineColor, cursor: "pointer",
          }}>
            {lang === "pl" ? "EN" : "PL"}
          </button>

          <button onClick={onThemeToggle} style={{
            width: 34, height: 34, borderRadius: 8,
            border: `1px solid ${btnOutlineBorder}`,
            background: btnOutlineBg, color: btnOutlineColor,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }} title={dark ? "Tryb jasny" : "Tryb ciemny"}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 12px 5px 6px", border: `1px solid ${btnOutlineBorder}`,
                borderRadius: 10, background: btnOutlineBg, cursor: "pointer",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: "#2563eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: textColor, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
                {planBadge && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 6px", borderRadius: 4, background: planBadge.bg, color: planBadge.color }}>
                    {planBadge.label}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: dark ? "#111" : "#fff", border: `1px solid ${border}`,
                  borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)", minWidth: 180, zIndex: 100,
                }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}` }}>
                    <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>{user.email}</p>
                  </div>
                  {[
                    { icon: <LayoutDashboard size={13} />, label: t("nav.dashboard"), href: "/dashboard" },
                    { icon: <LogOut size={13} />, label: t("nav.logout"), href: null },
                  ].map((item, i) => (
                    item.href ? (
                      <Link key={i} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: textColor, textDecoration: "none", borderBottom: i === 0 ? `1px solid ${border}` : "none" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "#1a1a1a" : "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ) : (
                      <button key={i} onClick={() => { setMenuOpen(false); handleLogout() }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
                      >
                        {item.icon} {item.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: 13, fontWeight: 500, padding: "7px 16px",
                border: `1px solid ${btnOutlineBorder}`, borderRadius: 10,
                background: btnOutlineBg, color: btnOutlineColor, textDecoration: "none",
              }}>
                {t("nav.login")}
              </Link>
              <Link href="/rejestracja" style={{
                fontSize: 13, fontWeight: 600, padding: "7px 16px",
                border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", textDecoration: "none",
              }}>
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </nav>

      <AIAssistant theme={theme} />
    </>
  )
}
