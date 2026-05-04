"use client"

import Link from "next/link"
import { Suspense, useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useTheme } from "@/components/ThemeProvider"
import { useT } from "@/lib/i18n"
import { useUser } from "@/hooks/useUser"
import {
  Search, ChevronRight, MapPin, Lock, ChevronDown,
  X, SlidersHorizontal, Download, CheckSquare, Square,
  Building2, User, Loader2, AlertTriangle, Zap,
  Phone, Mail, Globe, Sparkles
} from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SearchItem = {
  nip: string | null
  krs_number: string | null
  nazwa_pelna: string | null
  forma_prawna: string | null
  miejscowosc: string | null
  wojewodztwo: string | null
  status: string | null
  adres_pelny: string | null
  pkd_glowne: string | null
  www: string | null
  data_rejestracji: string | null
  zrodlo: "CEIDG" | "KRS"
  telefon?: string | null
  email?: string | null
}

type DetectedType = {
  type: 'wojewodztwo' | 'miejscowosc' | 'telefon' | 'email' | 'kod_pocztowy' | 'domena' | 'imie_nazwisko'
  value: string
} | null

type SearchResponse =
  | { redirect: true; nip: string }
  | { redirect: false; results: SearchItem[]; total: number; page: number; pages: number; detectedType: DetectedType }

type PkdItem = { code: string; label: string; section: string }

const WOJEWODZTWA = [
  "dolnośląskie","kujawsko-pomorskie","lubelskie","lubuskie",
  "łódzkie","małopolskie","mazowieckie","opolskie",
  "podkarpackie","podlaskie","pomorskie","śląskie",
  "świętokrzyskie","warmińsko-mazurskie","wielkopolskie","zachodniopomorskie",
]

const FREE_LIMIT = 10

const EXAMPLE_SEARCHES = [
  { label: "Firmy IT Poznań", q: "IT", miejscowosc: "Poznań" },
  { label: "Producenci mebli Wlkp", q: "meble", wojewodztwo: "wielkopolskie" },
  { label: "Kancelarie prawne Warszawa", q: "kancelaria", miejscowosc: "Warszawa" },
  { label: "Nowe sp. z o.o. w 2024", q: "", forma: "sp. z o.o." },
]

const DETECTED_LABELS: Record<string, string> = {
  wojewodztwo: '🗺️ Szukam firm w województwie',
  miejscowosc: '📍 Szukam firm w miejscowości',
  telefon: '📞 Szukam firmy po numerze telefonu',
  email: '✉️ Szukam firmy po adresie email',
  kod_pocztowy: '📮 Szukam firm z kodem pocztowym',
  domena: '🌐 Szukam firmy po domenie',
  imie_nazwisko: '👤 Szukam właściciela JDG',
}

const EXPORT_COLS_BASIC = [
  { key: "nip", label: "NIP" },
  { key: "regon", label: "REGON" },
  { key: "nazwa_pelna", label: "Nazwa" },
  { key: "wlasciciel_imie", label: "Imię" },
  { key: "wlasciciel_nazwisko", label: "Nazwisko" },
  { key: "ulica", label: "Ulica" },
  { key: "nr_budynku", label: "Nr budynku" },
  { key: "kod_pocztowy", label: "Kod pocztowy" },
  { key: "miejscowosc", label: "Miejscowość" },
  { key: "powiat", label: "Powiat" },
  { key: "wojewodztwo", label: "Województwo" },
  { key: "forma_prawna", label: "Forma prawna" },
  { key: "pkd_glowne", label: "PKD główne" },
  { key: "status", label: "Status" },
  { key: "data_rejestracji", label: "Data rejestracji" },
  { key: "telefon", label: "Telefon" },
  { key: "email", label: "Email" },
  { key: "www", label: "WWW" },
]

const EXPORT_COLS_PRO = [
  ...EXPORT_COLS_BASIC,
  { key: "krs_number", label: "Nr KRS" },
  { key: "kapital_zakladowy", label: "Kapitał zakładowy" },
  { key: "status_vat", label: "Status VAT" },
  { key: "ai_tags", label: "Tagi AI" },
  { key: "ai_description", label: "Opis AI" },
]

function firmAge(dateStr: string | null): string | null {
  if (!dateStr) return null
  const years = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365))
  if (years < 1) return "< 1 rok"
  if (years === 1) return "1 rok"
  if (years < 5) return `${years} lata`
  return `${years} lat`
}

function generateCSV(rows: Record<string, unknown>[], cols: { key: string; label: string }[]): string {
  const header = cols.map(c => `"${c.label}"`).join(",")
  const lines = rows.map(row =>
    cols.map(c => {
      const v = row[c.key]
      if (v === null || v === undefined) return ""
      const s = Array.isArray(v) ? v.join("; ") : String(v)
      return `"${s.replace(/"/g, '""')}"`
    }).join(",")
  )
  return "\uFEFF" + [header, ...lines].join("\n")
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function SkeletonRow({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: dark ? "#1e1e1e" : "#f3f4f6" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, width: "55%", borderRadius: 4, background: dark ? "#1e1e1e" : "#f3f4f6", marginBottom: 8 }} />
        <div style={{ height: 11, width: "35%", borderRadius: 4, background: dark ? "#1a1a1a" : "#f9fafb" }} />
      </div>
      <div style={{ width: 36, height: 18, borderRadius: 100, background: dark ? "#1e1e1e" : "#f3f4f6" }} />
    </div>
  )
}

function PremiumFilter({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <div style={{ opacity: 0.5, pointerEvents: "none", filter: "blur(0.6px)" }}>{children}</div>
      <Link href="/cennik" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", textDecoration: "none" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#2563eb", background: dark ? "rgba(17,17,17,0.9)" : "rgba(239,246,255,0.95)", border: "1px solid #bfdbfe", borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>
          <Lock size={9} /> Basic+
        </span>
      </Link>
    </div>
  )
}

function PkdDropdown({ value, onChange, dark }: { value: string; onChange: (v: string) => void; dark: boolean }) {
  const [open, setOpen] = useState(false)
  const [pkdList, setPkdList] = useState<PkdItem[]>([])
  const [sections, setSections] = useState<{ sec: string; items: PkdItem[] }[]>([])
  const [search, setSearch] = useState("")
  const [loadingPkd, setLoadingPkd] = useState(false)

  const border = dark ? "#222" : "#e8eaed"
  const cardBg = dark ? "#111" : "#fff"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"

  useEffect(() => {
    if (!open || pkdList.length > 0) return
    setLoadingPkd(true)
    supabase.rpc("get_unique_pkd").then(({ data, error }) => {
      if (error || !Array.isArray(data)) { setLoadingPkd(false); return }
      const secs: Record<string, PkdItem[]> = {}
      ;(data as { pkd_glowne: string }[]).forEach(r => {
        const str = String(r.pkd_glowne || "").trim()
        if (!str) return
        const sep = str.indexOf(" — ")
        const code = (sep > 0 ? str.slice(0, sep) : str.split(" ")[0]).trim()
        if (!/^\d{4}[A-Z]$/.test(code) && !/^\d{2}\.\d{2}\.[A-Z]$/.test(code)) return
        const desc = sep > 0 ? str.slice(sep + 3).trim() : ""
        const codeRaw = code.replace(/\./g, "")
        const codeDisplay = codeRaw.replace(/^(\d{2})(\d{2})([A-Z])$/, "$1.$2.$3")
        const sec = codeRaw.slice(0, 2)
        if (!secs[sec]) secs[sec] = []
        if (!secs[sec].find(x => x.code === codeRaw))
          secs[sec].push({ code: codeRaw, label: desc ? `${codeDisplay} — ${desc}` : codeDisplay, section: sec })
      })
      const all: PkdItem[] = []
      const secList = Object.keys(secs).sort().map(sec => {
        const items = secs[sec].sort((a, b) => a.code.localeCompare(b.code))
        items.forEach(item => all.push(item))
        return { sec, items }
      })
      setPkdList(all)
      setSections(secList)
      setLoadingPkd(false)
    })
  }, [open, pkdList.length])

  const filtered = search.trim() ? pkdList.filter(p => p.label.toLowerCase().includes(search.toLowerCase())) : null
  const selected = pkdList.find(p => p.code === value)

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "8px 10px", border: `1px solid ${open ? "#2563eb" : border}`, borderRadius: 8, fontSize: 13, color: value ? textColor : mutedColor, background: cardBg, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
          {selected ? selected.label : "Wszystkie branże"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {value && <span onClick={e => { e.stopPropagation(); onChange(""); setOpen(false) }} style={{ color: mutedColor, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}><X size={11} /></span>}
          <ChevronDown size={13} color={mutedColor} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </div>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: cardBg, border: `1px solid ${border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 50, display: "flex", flexDirection: "column", maxHeight: 320 }}>
            <div style={{ padding: "8px 10px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj PKD lub opisu..."
                style={{ width: "100%", padding: "6px 8px", border: `1px solid ${border}`, borderRadius: 6, fontSize: 12, color: textColor, background: dark ? "#1a1a1a" : "#f9fafb", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loadingPkd && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: mutedColor }}>Ładowanie PKD...</div>}
              {!loadingPkd && (
                <div onClick={() => { onChange(""); setOpen(false); setSearch("") }}
                  style={{ padding: "8px 12px", fontSize: 13, color: value === "" ? "#2563eb" : textColor, background: value === "" ? "#eff6ff" : "transparent", cursor: "pointer", fontStyle: "italic" }}>
                  Wszystkie branże
                </div>
              )}
              {!loadingPkd && filtered && filtered.map(item => (
                <div key={item.code} onClick={() => { onChange(item.code); setOpen(false); setSearch("") }}
                  style={{ padding: "7px 12px", fontSize: 12, color: value === item.code ? "#2563eb" : textColor, background: value === item.code ? "#eff6ff" : "transparent", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  onMouseEnter={e => { if (value !== item.code) e.currentTarget.style.background = dark ? "#1a1a1a" : "#f9fafb" }}
                  onMouseLeave={e => { if (value !== item.code) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ fontFamily: "monospace", color: "#2563eb", marginRight: 6 }}>{item.code}</span>
                  {item.label.slice(item.code.length + 3)}
                </div>
              ))}
              {!loadingPkd && !filtered && sections.map(({ sec, items }) => (
                <div key={sec}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: mutedColor, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px 3px", background: dark ? "#0f0f0f" : "#f9fafb", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f3f4f6"}` }}>
                    Dział {sec}
                  </div>
                  {items.map(item => (
                    <div key={item.code} onClick={() => { onChange(item.code); setOpen(false) }}
                      style={{ padding: "7px 12px", fontSize: 12, color: value === item.code ? "#2563eb" : textColor, background: value === item.code ? "#eff6ff" : "transparent", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { if (value !== item.code) e.currentTarget.style.background = dark ? "#1a1a1a" : "#f9fafb" }}
                      onMouseLeave={e => { if (value !== item.code) e.currentTarget.style.background = "transparent" }}>
                      <span style={{ fontFamily: "monospace", color: "#2563eb", marginRight: 6 }}>{item.code}</span>
                      {item.label.slice(item.code.length + 3)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ExportModal({ dark, mode, count, onConfirm, onCancel, loading }: {
  dark: boolean; mode: "page" | "all"; count: number
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  const cardBg = dark ? "#111" : "#fff"
  const border = dark ? "#222" : "#e8eaed"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#666" : "#6b7280"
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Download size={18} color="#2563eb" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: textColor, margin: 0 }}>Eksport CSV</p>
            <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>
              {mode === "page" ? `${count} zaznaczonych firm` : `Wszystkie ${count.toLocaleString("pl-PL")} wyników`}
            </p>
          </div>
        </div>
        {mode === "all" && (
          <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: dark ? "#1a1a1a" : "#fffbeb", border: `1px solid ${dark ? "#333" : "#fde68a"}`, borderRadius: 10, marginBottom: 16 }}>
            <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: dark ? "#fbbf24" : "#92400e", margin: 0, lineHeight: 1.5 }}>
              Pobierzemy wszystkie strony wyników ({count.toLocaleString("pl-PL")} firm). Może to chwilę potrwać.
            </p>
          </div>
        )}
        <div style={{ background: dark ? "#0f0f0f" : "#f8f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Plik będzie zawierał</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
            {["NIP, REGON", "Nazwa firmy", "Imię i nazwisko", "Adres pełny", "Powiat, województwo", "Forma prawna, PKD", "Data rejestracji", "Telefon, email, WWW"].map(col => (
              <div key={col} style={{ fontSize: 12, color: textColor, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#22c55e", fontSize: 10 }}>✓</span> {col}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px", fontSize: 13, fontWeight: 500, color: textColor, background: "transparent", border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer" }}>Anuluj</button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 2, padding: "10px", fontSize: 13, fontWeight: 600, color: "#fff", background: loading ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Pobieranie...</> : <><Download size={14} /> Pobierz CSV</>}
          </button>
        </div>
      </div>
    </div>
  )
}

type SidebarProps = {
  dark: boolean
  q: string; setQ: (v: string) => void
  miejscowosc: string; setMiejscowosc: (v: string) => void
  wojewodztwo: string; setWojewodztwo: (v: string) => void
  formaP: string; setFormaP: (v: string) => void
  zrodlo: string; setZrodlo: (v: string) => void
  status: string; setStatus: (v: string) => void
  pkd: string; setPkd: (v: string) => void
  isPro: boolean; onSearch: () => void; loading: boolean
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void
  activeFiltersCount: number; onClear: () => void
}

function Sidebar({ dark, q, setQ, miejscowosc, setMiejscowosc, wojewodztwo, setWojewodztwo, formaP, setFormaP, zrodlo, setZrodlo, status, setStatus, pkd, setPkd, isPro, onSearch, loading, mobileOpen, setMobileOpen, activeFiltersCount, onClear }: SidebarProps) {
  const t = useT()
  const border = dark ? "#222" : "#e8eaed"
  const cardBg = dark ? "#111" : "#fff"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: mutedColor, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }
  const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, color: textColor, background: cardBg, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none", paddingRight: 28, cursor: "pointer" }

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {activeFiltersCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "2px 10px" }}>
            {activeFiltersCount} {activeFiltersCount === 1 ? "filtr" : activeFiltersCount < 5 ? "filtry" : "filtrów"}
          </span>
          <button onClick={onClear} style={{ fontSize: 12, color: mutedColor, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={11} /> Wyczyść
          </button>
        </div>
      )}

      <div>
        <label style={labelStyle}>Szukaj</label>
        <div style={{ position: "relative" }}>
          <Search size={14} color={mutedColor} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && onSearch()}
            placeholder={t("search.placeholder")} style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Miejscowość</label>
        <input value={miejscowosc} onChange={e => setMiejscowosc(e.target.value)} onKeyDown={e => e.key === "Enter" && onSearch()} placeholder="np. Poznań" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Województwo</label>
        <div style={{ position: "relative" }}>
          <select value={wojewodztwo} onChange={e => setWojewodztwo(e.target.value)} style={selectStyle}>
            <option value="">Wszystkie</option>
            {WOJEWODZTWA.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} color={mutedColor} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Kod PKD</label>
        <PkdDropdown value={pkd} onChange={setPkd} dark={dark} />
      </div>

      <div>
        <label style={labelStyle}>Forma prawna</label>
        <div style={{ position: "relative" }}>
          <select value={formaP} onChange={e => setFormaP(e.target.value)} style={selectStyle}>
            <option value="">Wszystkie</option>
            <option value="sp. z o.o.">Sp. z o.o.</option>
            <option value="spółka akcyjna">S.A.</option>
            <option value="jednoosobowa">JDG</option>
            <option value="spółka jawna">Sp. jawna</option>
            <option value="spółka komandytowa">Sp. komandytowa</option>
            <option value="fundacja">Fundacja</option>
            <option value="stowarzyszenie">Stowarzyszenie</option>
          </select>
          <ChevronDown size={13} color={mutedColor} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Rejestr</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ v: "", l: "Oba" }, { v: "KRS", l: "KRS" }, { v: "CEIDG", l: "CEIDG" }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setZrodlo(v)}
              style={{ flex: 1, padding: "7px 4px", fontSize: 12, fontWeight: 500, border: `1px solid ${zrodlo === v ? "#2563eb" : border}`, borderRadius: 8, background: zrodlo === v ? "#eff6ff" : cardBg, color: zrodlo === v ? "#2563eb" : mutedColor, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ v: "", l: t("search.filterStatusAll") }, { v: "aktywne", l: t("search.filterStatusActive") }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setStatus(v)}
              style={{ flex: 1, padding: "7px 4px", fontSize: 12, fontWeight: 500, border: `1px solid ${status === v ? "#2563eb" : border}`, borderRadius: 8, background: status === v ? "#eff6ff" : cardBg, color: status === v ? "#2563eb" : mutedColor, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Lock size={11} color="#2563eb" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>Filtry Premium</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PremiumFilter dark={dark}>
            <label style={labelStyle}>Dane kontaktowe</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Tylko z telefonem", "Tylko z emailem", "Tylko ze stroną WWW"].map(l => (
                <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: textColor }}>
                  <input type="checkbox" disabled style={{ width: 14, height: 14, accentColor: "#2563eb" }} /> {l}
                </label>
              ))}
            </div>
          </PremiumFilter>
          <PremiumFilter dark={dark}>
            <label style={labelStyle}>Kapitał zakładowy (PLN)</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input placeholder="od" disabled style={{ ...inputStyle, width: "50%" }} />
              <input placeholder="do" disabled style={{ ...inputStyle, width: "50%" }} />
            </div>
          </PremiumFilter>
          <PremiumFilter dark={dark}>
            <label style={labelStyle}>Data rejestracji</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="date" disabled style={{ ...inputStyle, width: "50%", fontSize: 11 }} />
              <input type="date" disabled style={{ ...inputStyle, width: "50%", fontSize: 11 }} />
            </div>
          </PremiumFilter>
          <PremiumFilter dark={dark}>
            <label style={labelStyle}>Liczba pracowników</label>
            <div style={{ position: "relative" }}>
              <select disabled style={selectStyle}><option>Wszystkie przedziały</option></select>
              <ChevronDown size={13} color={mutedColor} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </PremiumFilter>
          <PremiumFilter dark={dark}>
            <label style={labelStyle}>Status VAT</label>
            <div style={{ position: "relative" }}>
              <select disabled style={selectStyle}><option>Wszystkie</option></select>
              <ChevronDown size={13} color={mutedColor} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </PremiumFilter>
        </div>
      </div>

      <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onSearch} disabled={loading}
          style={{ width: "100%", padding: "10px 0", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
          {loading ? t("search.loading") : t("search.searchBtn")}
        </button>
        {!isPro && (
          <Link href="/cennik" style={{ width: "100%", padding: "9px 0", fontSize: 13, fontWeight: 500, background: "transparent", color: "#2563eb", border: "1px solid #2563eb44", borderRadius: 10, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxSizing: "border-box" }}>
            <Lock size={12} /> Odblokuj filtry Premium
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside className="search-sidebar" style={{ width: 300, flexShrink: 0, background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 22, height: "fit-content", position: "sticky", top: 80 }}>
        {content}
      </aside>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} className="mobile-backdrop" />}
      <div className="mobile-drawer" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: cardBg, borderTop: `1px solid ${border}`, borderRadius: "16px 16px 0 0", padding: "20px 20px 32px", zIndex: 50, transform: mobileOpen ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s ease", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f5f5f5" : "#111" }}>Filtry</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: mutedColor }}><X size={18} /></button>
        </div>
        {content}
      </div>
    </>
  )
}

function ResultRow({ item, dark, checked, onCheck, blurred, isPro }: {
  item: SearchItem; dark: boolean; checked: boolean
  onCheck: (nip: string) => void; blurred: boolean; isPro: boolean
}) {
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"
  const border = dark ? "#1a1a1a" : "#f3f4f6"
  const nip = item.nip ?? ""
  const statusActive = (item.status ?? "").toLowerCase().includes("aktywn")
  const initials = (item.nazwa_pelna ?? "?").replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "").slice(0, 2).toUpperCase()
  const pkd = item.pkd_glowne?.split("—")[0]?.trim() ?? ""
  const age = firmAge(item.data_rejestracji)
  const hasContact = item.telefon || item.email || item.www

  const rowContent = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderBottom: `1px solid ${border}`, transition: "background 0.1s", filter: blurred ? "blur(3.5px)" : "none", userSelect: blurred ? "none" : "auto" }}>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); if (!blurred) onCheck(nip) }}
        style={{ background: "none", border: "none", cursor: blurred ? "default" : "pointer", padding: 0, flexShrink: 0, color: checked ? "#2563eb" : mutedColor }}>
        {checked ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: item.zrodlo === "KRS" ? "#eff6ff" : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: item.zrodlo === "KRS" ? "#2563eb" : "#16a34a", flexShrink: 0 }}>
        {item.zrodlo === "KRS" ? initials : <User size={15} color="#16a34a" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: textColor, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.nazwa_pelna ?? "—"}
        </p>
        <p style={{ fontSize: 12, color: mutedColor, margin: "3px 0 0", display: "flex", alignItems: "center", gap: 6, overflow: "hidden", whiteSpace: "nowrap", flexWrap: "wrap" }}>
          {item.miejscowosc && <><MapPin size={10} /><span>{item.miejscowosc}</span></>}
          {item.forma_prawna && <><span style={{ color: "#d1d5db" }}>·</span><span>{item.forma_prawna}</span></>}
          {pkd && <><span style={{ color: "#d1d5db" }}>·</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{pkd}</span></>}
          {age && <><span style={{ color: "#d1d5db" }}>·</span><span>{age}</span></>}
        </p>
        {hasContact && (
          <p style={{ fontSize: 11, color: mutedColor, margin: "4px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
            {item.telefon && (
              isPro
                ? <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#16a34a" }}><Phone size={10} />{item.telefon}</span>
                : <span style={{ display: "flex", alignItems: "center", gap: 3, filter: "blur(4px)", userSelect: "none" }}><Phone size={10} />000 000 000</span>
            )}
            {item.email && (
              isPro
                ? <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#2563eb" }}><Mail size={10} />{item.email}</span>
                : <span style={{ display: "flex", alignItems: "center", gap: 3, filter: "blur(4px)", userSelect: "none" }}><Mail size={10} />firma@example.com</span>
            )}
            {item.www && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Globe size={10} />{item.www.replace(/^https?:\/\//, "").slice(0, 25)}</span>}
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 100, background: item.zrodlo === "KRS" ? "#eff6ff" : "#f0fdf4", color: item.zrodlo === "KRS" ? "#2563eb" : "#16a34a" }}>{item.zrodlo}</span>
        <span style={{ fontSize: 10, fontWeight: 500, color: statusActive ? "#22c55e" : mutedColor }}>{statusActive ? "● Aktywny" : item.status ?? ""}</span>
      </div>
      <ChevronRight size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
    </div>
  )

  if (blurred) {
    return (
      <div style={{ position: "relative" }}>
        {rowContent}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "rgba(10,10,10,0.25)" : "rgba(255,255,255,0.25)" }}>
          <Link href="/cennik" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#fff", background: "#2563eb", borderRadius: 8, padding: "6px 14px", textDecoration: "none" }}>
            <Lock size={12} /> Odblokuj wyniki — Basic
          </Link>
        </div>
      </div>
    )
  }
  return (
    <Link href={nip ? `/firma/${nip}` : "/"} style={{ display: "block", textDecoration: "none", color: "inherit" }}
      onMouseEnter={e => (e.currentTarget.style.background = dark ? "#1a1a1a" : "#f9fafb")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      {rowContent}
    </Link>
  )
}

function DetectionToast({ detected, dark }: { detected: DetectedType; dark: boolean }) {
  if (!detected) return null
  const label = DETECTED_LABELS[detected.type] ?? "Wykryto specjalne zapytanie"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: dark ? "#1a2a1a" : "#f0fdf4", border: `1px solid ${dark ? "#1a3a1a" : "#bbf7d0"}`, borderRadius: 10, marginBottom: 12, fontSize: 13, color: dark ? "#86efac" : "#15803d" }}>
      <Sparkles size={13} />
      <span>{label}: <strong>{detected.value}</strong></span>
    </div>
  )
}

function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const dark = theme === "dark"
  const { plan, loading: planLoading } = useUser()
  const t = useT()
  const isPro = plan === "basic" || plan === "pro"
  console.log('DEBUG plan:', plan, 'planLoading:', planLoading, 'isPro:', isPro)

  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [miejscowosc, setMiejscowosc] = useState(searchParams.get("miejscowosc") ?? "")
  const [wojewodztwo, setWojewodztwo] = useState(searchParams.get("wojewodztwo") ?? "")
  const [formaP, setFormaP] = useState(searchParams.get("forma") ?? "")
  const [zrodlo, setZrodlo] = useState(searchParams.get("zrodlo") ?? "")
  const [status, setStatus] = useState(searchParams.get("status") ?? "")
  const [pkd, setPkd] = useState(searchParams.get("pkd") ?? "")

  const [results, setResults] = useState<SearchItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exportModal, setExportModal] = useState<null | { mode: "page" | "all"; count: number }>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [detectedType, setDetectedType] = useState<DetectedType>(null)

  const border = dark ? "#222" : "#e8eaed"
  const cardBg = dark ? "#111" : "#fff"
  const textColor = dark ? "#f5f5f5" : "#111"
  const mutedColor = dark ? "#555" : "#9ca3af"
  const bg = dark ? "#0a0a0a" : "#f8f9fb"

  const activeFiltersCount = [miejscowosc, wojewodztwo, formaP, zrodlo, status, pkd].filter(Boolean).length

  const clearAll = () => {
    setQ(""); setMiejscowosc(""); setWojewodztwo(""); setFormaP("")
    setZrodlo(""); setStatus(""); setPkd(""); setDetectedType(null)
  }

  const buildParams = useCallback((pageNum: number) => {
    const params = new URLSearchParams({ q: q.trim(), page: String(pageNum) })
    if (wojewodztwo) params.set("wojewodztwo", wojewodztwo)
    if (zrodlo) params.set("zrodlo", zrodlo)
    if (status) params.set("status", status)
    if (miejscowosc) params.set("miejscowosc", miejscowosc)
    if (formaP) params.set("forma", formaP)
    if (pkd) params.set("pkd", pkd)
    return params
  }, [q, wojewodztwo, zrodlo, status, miejscowosc, formaP, pkd])

  const doSearch = useCallback(async (pageNum = 1) => {
    if (!q.trim() && !miejscowosc && !wojewodztwo && !pkd && !formaP) return
    setLoading(true); setError(null); setSearched(true); setMobileOpen(false); setDetectedType(null)
    const params = buildParams(pageNum)
    router.replace(`/search?${params}`, { scroll: false })
    try {
      const res = await fetch(`/api/search?${params}`)
      const data = await res.json() as SearchResponse & { detectedType?: DetectedType }
      if ("redirect" in data && data.redirect) { router.push(`/firma/${data.nip}`); return }
      if ("results" in data) {
        setResults(data.results)
        setTotal(data.total)
        setPages(data.pages)
        setPage(data.page)
        setChecked(new Set())
        if (data.detectedType) setDetectedType(data.detectedType)
      }
    } catch { setError("Błąd wyszukiwania — spróbuj ponownie") }
    finally { setLoading(false) }
  }, [buildParams, router, q, miejscowosc, wojewodztwo, pkd, formaP])

  useEffect(() => {
    if (searchParams.get("q") || searchParams.get("miejscowosc") || searchParams.get("pkd")) {
      doSearch(parseInt(searchParams.get("page") ?? "1"))
    }
  }, []) // eslint-disable-line

  const toggleCheck = (nip: string) => setChecked(prev => { const n = new Set(prev); n.has(nip) ? n.delete(nip) : n.add(nip); return n })
  const visibleResults = results?.slice(0, (!planLoading && isPro) ? results.length : FREE_LIMIT) ?? []
  const blurredResults = (!planLoading && !isPro) && results ? results.slice(FREE_LIMIT) : []

  const pagesArr = (() => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, -1, pages]
    if (page >= pages - 3) return [1, -1, pages - 4, pages - 3, pages - 2, pages - 1, pages]
    return [1, -1, page - 1, page, page + 1, -1, pages]
  })()

  const handleExportClick = (mode: "page" | "all") => {
    if (!isPro) { router.push("/cennik"); return }
    setExportModal({ mode, count: mode === "page" ? checked.size : total })
  }

  const handleExportConfirm = async () => {
    if (!exportModal) return
    setExportLoading(true)
    const cols = plan === "pro" ? EXPORT_COLS_PRO : EXPORT_COLS_BASIC
    try {
      let rows: Record<string, unknown>[]
      if (exportModal.mode === "page") {
        rows = (results ?? []).filter(r => r.nip && checked.has(r.nip)).map(r => ({ ...r }))
      } else {
        const all: SearchItem[] = []
        for (let p = 1; p <= pages; p++) {
          const res = await fetch(`/api/search?${buildParams(p)}`)
          const data = await res.json() as SearchResponse
          if ("results" in data) all.push(...data.results)
        }
        rows = all.map(r => ({ ...r }))
      }

      const date = new Date().toISOString().slice(0, 10)
      const filename = `nipgo_eksport_${date}_${Date.now()}.csv`
      const csvContent = generateCSV(rows, cols)

      // Zapisz do Storage + historia
      try {
        await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            csvContent,
            filename,
            recordCount: rows.length,
            filters: { q, miejscowosc, wojewodztwo, formaP, zrodlo, status, pkd },
          }),
        })
      } catch {
        console.warn("Storage save failed, downloading directly")
      }

      // Pobierz lokalnie zawsze
      downloadCSV(csvContent, filename)
      setExportModal(null)
    } catch {
      alert("Błąd eksportu — spróbuj ponownie")
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .skeleton-pulse { animation: shimmer 1.5s ease infinite; }
        @media (min-width: 768px) { .mobile-drawer { display: none !important; } .mobile-backdrop { display: none !important; } }
        @media (max-width: 767px) { .search-sidebar { display: none !important; } .mobile-filters-btn { display: flex !important; } }
        select { font-family: inherit; } input::placeholder { color: #9ca3af; }
      `}</style>

      {exportModal && <ExportModal dark={dark} mode={exportModal.mode} count={exportModal.count} onConfirm={handleExportConfirm} onCancel={() => setExportModal(null)} loading={exportLoading} />}

      {/* Subbar */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "10px 32px", display: "flex", alignItems: "center", gap: 12, background: dark ? "#0a0a0a" : "#f8f9fb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "9px 16px", flex: 1, maxWidth: 680 }}>
          <Search size={15} color={mutedColor} style={{ flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch(1)}
            placeholder="Nazwa, NIP, REGON, email, telefon, domena, kod pocztowy..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: textColor, background: "transparent", fontFamily: "inherit" }} />
          {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: mutedColor, padding: 0 }}><X size={13} /></button>}
        </div>
        <button onClick={() => setMobileOpen(true)} className="mobile-filters-btn"
          style={{ display: "none", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: textColor, background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}>
          <SlidersHorizontal size={14} /> Filtry{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {checked.size > 0 && (
            <button onClick={() => handleExportClick("page")}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: textColor, background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}>
              <Download size={13} /> Zaznaczone ({checked.size}){!isPro && <Lock size={11} color="#2563eb" />}
            </button>
          )}
          {searched && total > 0 && (
            <button onClick={() => handleExportClick("all")}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: isPro ? "#2563eb" : cardBg, color: isPro ? "#fff" : mutedColor, border: `1px solid ${isPro ? "#2563eb" : border}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>
              <Download size={13} /> Eksportuj ({total.toLocaleString("pl-PL")}){!isPro && <Lock size={11} color="#2563eb" />}
            </button>
          )}
        </div>
      </div>

      {/* Layout */}
      <div style={{ padding: "24px 32px", display: "flex", gap: 28, alignItems: "flex-start" }}>
        <Sidebar dark={dark} q={q} setQ={setQ} miejscowosc={miejscowosc} setMiejscowosc={setMiejscowosc}
          wojewodztwo={wojewodztwo} setWojewodztwo={setWojewodztwo} formaP={formaP} setFormaP={setFormaP}
          zrodlo={zrodlo} setZrodlo={setZrodlo} status={status} setStatus={setStatus} pkd={pkd} setPkd={setPkd}
          isPro={isPro} onSearch={() => doSearch(1)} loading={loading} mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen} activeFiltersCount={activeFiltersCount} onClear={clearAll} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {detectedType && <DetectionToast detected={detectedType} dark={dark} />}

          {searched && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: mutedColor }}>
                {loading ? "Szukam..." : total === 0 ? t("search.noResults") : <><strong style={{ color: textColor }}>{total.toLocaleString("pl-PL")}</strong> wyników{pages > 1 && ` — strona ${page} z ${pages}`}</>}
              </span>
              {results && results.length > 0 && !loading && (
                <button onClick={() => { const v = visibleResults.map(r => r.nip).filter(Boolean) as string[]; const all = v.every(n => checked.has(n)); setChecked(all ? new Set() : new Set(v)) }}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: mutedColor, background: "none", border: `1px solid ${border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
                  <CheckSquare size={12} />
                  {visibleResults.every(r => r.nip && checked.has(r.nip)) ? "Odznacz" : "Zaznacz"} wszystkie
                </button>
              )}
            </div>
          )}

          {error && <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#ef4444", marginBottom: 12 }}>{error}</div>}

          {loading && (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }} className="skeleton-pulse">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} dark={dark} />)}
            </div>
          )}

            {!loading && !planLoading && results !== null && results.length > 0 && (
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {visibleResults.map((item, i) => (
                <ResultRow key={`${item.zrodlo}-${item.nip}-${i}`} item={item} dark={dark}
                  checked={!!(item.nip && checked.has(item.nip))} onCheck={toggleCheck} blurred={false} isPro={isPro} />
              ))}
              {blurredResults.map((item, i) => (
                <ResultRow key={`blur-${i}`} item={item} dark={dark} checked={false} onCheck={() => {}} blurred={true} isPro={isPro} />
              ))}
            </div>
          )}

          {!loading && searched && results !== null && results.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 32px", color: mutedColor }}>
              <Building2 size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: textColor, marginBottom: 8 }}>Brak wyników</p>
              <p style={{ fontSize: 13 }}>Spróbuj innej frazy lub zmień filtry</p>
            </div>
          )}

          {!searched && !loading && (
            <div style={{ textAlign: "center", padding: "48px 32px", color: mutedColor }}>
              <Search size={36} style={{ opacity: 0.15, marginBottom: 16 }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: textColor, marginBottom: 6 }}>Znajdź firmy w Polsce</p>
              <p style={{ fontSize: 13, marginBottom: 24 }}>Wpisz nazwę, NIP, REGON, email, telefon, domenę, kod pocztowy lub imię właściciela</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {EXAMPLE_SEARCHES.map(ex => (
                  <button key={ex.label} onClick={() => {
                    if (ex.q) setQ(ex.q)
                    if (ex.miejscowosc) setMiejscowosc(ex.miejscowosc)
                    if (ex.wojewodztwo) setWojewodztwo(ex.wojewodztwo)
                    if (ex.forma) setFormaP(ex.forma)
                    setTimeout(() => doSearch(1), 50)
                  }}
                    style={{ fontSize: 12, fontWeight: 500, color: "#2563eb", background: dark ? "#1a2a3a" : "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "5px 14px", cursor: "pointer" }}>
                    {ex.label}
                  </button>
                ))}
              </div>
              {!isPro && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 14px" }}>
                  <Zap size={12} color="#2563eb" />
                  <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}>Basic: wyszukiwanie AI — opisz branżę słowami</span>
                  <Link href="/cennik" style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textDecoration: "underline" }}>Odblokuj</Link>
                </div>
              )}
            </div>
          )}

          {!loading && pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
              <button onClick={() => doSearch(page - 1)} disabled={page === 1} style={{ padding: "7px 12px", fontSize: 13, borderRadius: 8, border: `1px solid ${border}`, background: cardBg, color: page === 1 ? mutedColor : textColor, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}>←</button>
              {pagesArr.map((p, i) => p === -1
                ? <span key={`dot-${i}`} style={{ padding: "7px 4px", color: mutedColor, fontSize: 13 }}>…</span>
                : <button key={p} onClick={() => doSearch(p)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${p === page ? "#2563eb" : border}`, background: p === page ? "#2563eb" : cardBg, color: p === page ? "#fff" : textColor, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{p}</button>
              )}
              <button onClick={() => doSearch(page + 1)} disabled={page === pages} style={{ padding: "7px 12px", fontSize: 13, borderRadius: 8, border: `1px solid ${border}`, background: cardBg, color: page === pages ? mutedColor : textColor, cursor: page === pages ? "default" : "pointer", opacity: page === pages ? 0.4 : 1 }}>→</button>
            </div>
          )}

            {!planLoading && !isPro && searched && !loading && results && results.length > FREE_LIMIT && (
            <div style={{ marginTop: 16, padding: "14px 20px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8", margin: 0 }}>Pokazujemy {FREE_LIMIT} z {total.toLocaleString("pl-PL")} wyników</p>
                <p style={{ fontSize: 12, color: "#3b82f6", margin: "3px 0 0" }}>Basic odblokuje wszystkie wyniki, eksport i dane kontaktowe</p>
              </div>
              <Link href="/cennik" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#2563eb", borderRadius: 8, padding: "8px 16px", textDecoration: "none", whiteSpace: "nowrap" }}>
                Odblokuj za 59 zł/mies
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPageWrapper() {
  return <Suspense><SearchPage /></Suspense>
}