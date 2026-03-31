"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Download, Printer, Share2, Lock, ExternalLink } from "lucide-react"

type Tab = "podstawowe" | "finanse" | "ryzyko" | "aktywnosc" | "dotacje"

interface Rep { name: string; fn: string }
interface Shareholder { name: string; shares: string }
interface PkdCode { code: string; description: string; isPrimary: boolean }

export interface FirmaViewProps {
  nip: string
  name: string
  regon: string
  krs: string
  status: "active" | "inactive"
  legalForm: string
  source: "KRS" | "CEIDG"
  registrationDate: string
  capital: string
  currency: string
  address: {
    street: string
    city: string
    postalCode: string
    voivodeship: string
    county: string
    commune: string
    full: string
  }
  contact: { phone: string; email: string; website: string }
  representationMethod: string
  representatives: Rep[]
  shareholders: Shareholder[]
  pkdCodes: PkdCode[]
  krsLink: string
  ownerName: string
}

// Title case for proper nouns (person names)
function toTitleCase(s: string | null | undefined): string {
  if (!s) return ""
  return s.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase())
}

// Sentence case: lowercase + capitalize first letter + restore abbreviations (S.A., Sp. z o.o.)
function toSentenceCase(s: string | null | undefined): string {
  if (!s) return ""
  const lower = s.toLowerCase()
  const first = lower.charAt(0).toUpperCase() + lower.slice(1)
  // Restore single-letter abbreviations separated by dots: s.a. → S.A., p.p.h. → P.P.H.
  return first.replace(/\b\p{L}(?:\.\p{L})+\./gu, m => m.toUpperCase())
}

function formatDate(s: string | null | undefined): string {
  if (!s) return ""
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function maskPhone(p: string): string {
  const d = p.replace(/\D/g, "")
  if (d.length >= 9) return `+48 ${d.slice(-9, -6)} *** ***`
  return "+48 *** *** ***"
}

function maskEmail(e: string): string {
  const [local, domain] = e.split("@")
  const ml = (local?.[0] ?? "k") + "***"
  const dp = domain?.split(".") ?? ["firma", "pl"]
  const md = (dp[0]?.[0] ?? "f") + "***." + dp.slice(1).join(".")
  return `${ml}@${md}`
}

function maskWebsite(w: string): string {
  const clean = w.replace(/^https?:\/\//, "").replace(/^www\./, "")
  return "www." + (clean[0] ?? "f") + "***"
}

const PRO_TABS: Tab[] = ["finanse", "ryzyko", "aktywnosc", "dotacje"]

const TAB_LABELS: Record<Tab, string> = {
  podstawowe: "Podstawowe",
  finanse: "Finanse",
  ryzyko: "Ryzyko",
  aktywnosc: "Aktywność",
  dotacje: "Dotacje UE",
}

const PRO_DESCRIPTIONS: Partial<Record<Tab, string>> = {
  finanse: "Sprawozdania finansowe, wyniki, zadłużenie",
  ryzyko: "Scoring kredytowy, powiązania, alerty",
  aktywnosc: "Historia zmian, ogłoszenia, przetargi",
  dotacje: "Dotacje UE i krajowe, projekty unijne",
}

// ─── Shared style primitives ─────────────────────────────────────────────────
const card: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: 16,
}

const cardHead: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e5e5",
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#111",
  letterSpacing: "-0.02em",
  margin: 0,
}

const tdLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#999",
  padding: "10px 16px",
  verticalAlign: "top",
  width: 180,
  fontWeight: 400,
}

const tdValue: React.CSSProperties = {
  fontSize: 13,
  color: "#111",
  padding: "10px 16px",
  verticalAlign: "top",
}

const btnOutline: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  background: "#fff",
  borderRadius: 6,
  padding: "7px 14px",
  fontSize: 13,
  color: "#111",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
}

const btnBlack: React.CSSProperties = {
  border: "none",
  background: "#111",
  borderRadius: 6,
  padding: "7px 14px",
  fontSize: 13,
  color: "#fff",
  cursor: "pointer",
}

const freeBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  padding: "1px 5px",
  borderRadius: 3,
  background: "#f0fdf4",
  color: "#16a34a",
}

const proBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  padding: "1px 5px",
  borderRadius: 3,
  background: "#f5f3ff",
  color: "#7c3aed",
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function TableRow({
  label,
  value,
  last,
}: {
  label: string
  value: string | null | undefined
  last?: boolean
}) {
  if (!value) return null
  return (
    <tr style={{ borderBottom: last ? "none" : "1px solid #e5e5e5" }}>
      <td style={tdLabel}>{label}</td>
      <td style={tdValue}>{value}</td>
    </tr>
  )
}

function SectionCard({
  title,
  badge,
  children,
  style,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section style={{ ...card, ...style }}>
      <div style={cardHead}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={sectionTitle}>{title}</h2>
          {badge}
        </div>
      </div>
      {children}
    </section>
  )
}

function PaywallOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backdropFilter: "blur(5px)",
        background: "rgba(255,255,255,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Lock size={20} style={{ margin: "0 auto 8px", color: "#999" }} />
        <p style={{ fontSize: 13, color: "#111", fontWeight: 500, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Dane kontaktowe
        </p>
        <button style={{ ...btnBlack, margin: "0 auto" }}>Odblokuj za 49 zł/mies.</button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function FirmaView(props: FirmaViewProps) {
  const [tab, setTab] = useState<Tab>("podstawowe")

  const {
    nip, name, regon, krs, status, legalForm, source,
    registrationDate, capital, currency, address, contact,
    representationMethod, representatives, shareholders, pkdCodes,
    krsLink, ownerName,
  } = props

  const isStatusActive = status === "active"
  const year = registrationDate ? new Date(registrationDate).getFullYear() : null
  const capitalFormatted = capital
    ? `${Number(capital).toLocaleString("pl-PL")} ${currency || "PLN"}`
    : null
  const mapQuery = encodeURIComponent(address.full || `${address.street}, ${address.postalCode} ${address.city}`)
  const hasContact = contact.phone || contact.email || contact.website
  const primaryPkd = pkdCodes.find(p => p.isPrimary)
  const mainShareholder =
    shareholders.length > 0 ? String(shareholders.length) : ownerName ? toTitleCase(ownerName) : "—"

  return (
    <div style={{ background: "#fff", color: "#111", minHeight: "100vh", fontFamily: "inherit" }}>
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.03em" }}>
            nipgo
          </span>
          <span
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", display: "inline-block" }}
          />
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btnOutline}>Zaloguj się</button>
          <button style={btnBlack}>Rejestracja</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" }}>
        {/* ── Back nav ── */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "#999",
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          <ChevronLeft size={14} />
          Powrót do wyników
        </Link>

        {/* ── Company header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: isStatusActive ? "#f0fdf4" : "#fef2f2",
                color: isStatusActive ? "#16a34a" : "#dc2626",
                border: `1px solid ${isStatusActive ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {isStatusActive ? "Aktywna" : "Nieaktywna"}
            </span>
            {legalForm && (
              <span style={{ fontSize: 12, color: "#999" }}>{toSentenceCase(legalForm)}</span>
            )}
            <span style={{ fontSize: 12, color: "#999" }}>{source}</span>
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "#111",
              margin: "0 0 10px 0",
              lineHeight: 1.3,
            }}
          >
            {toSentenceCase(name)}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 20px",
              fontSize: 13,
              color: "#999",
              marginBottom: 16,
            }}
          >
            <span>NIP: <span style={{ color: "#111" }}>{nip}</span></span>
            {krs && <span>KRS: <span style={{ color: "#111" }}>{krs}</span></span>}
            {regon && <span>REGON: <span style={{ color: "#111" }}>{regon}</span></span>}
            {year && <span>od <span style={{ color: "#111" }}>{year}</span></span>}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btnOutline}>
              <Download size={14} />
              Eksportuj
            </button>
            <button style={btnBlack}>Obserwuj</button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {[
            { label: "Kapitał zakładowy", value: capitalFormatted ?? "—" },
            { label: "Siedziba", value: toSentenceCase(address.city) || "—" },
            { label: "Wspólnicy", value: mainShareholder },
            { label: "PKD główne", value: primaryPkd?.code ?? "—" },
          ].map((kpi, i) => (
            <div
              key={i}
              style={{
                padding: "14px 18px",
                borderRight: i < 3 ? "1px solid #e5e5e5" : "none",
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{kpi.label}</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#111",
                  letterSpacing: "-0.01em",
                }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div>
          <div
            style={{
              borderBottom: "1px solid #e5e5e5",
              display: "flex",
              marginBottom: 24,
            }}
          >
            {(Object.keys(TAB_LABELS) as Tab[]).map(t => {
              const isPro = PRO_TABS.includes(t)
              const isActiveTab = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: isActiveTab ? 500 : 400,
                    color: isActiveTab ? "#111" : "#999",
                    background: "none",
                    border: "none",
                    borderBottom: isActiveTab ? "2px solid #111" : "2px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    marginBottom: -1,
                  }}
                >
                  {TAB_LABELS[t]}
                  <span style={isPro ? proBadge : freeBadge}>
                    {isPro ? "Pro" : "free"}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Tab: Podstawowe ── */}
          {tab === "podstawowe" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 260px",
                gap: 24,
                alignItems: "start",
              }}
            >
              {/* Left column */}
              <div>
                {/* Dane rejestrowe */}
                <SectionCard title="Dane rejestrowe">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <TableRow label="Pełna nazwa" value={toSentenceCase(name)} />
                      <TableRow label="Forma prawna" value={toSentenceCase(legalForm)} />
                      <TableRow
                        label="Data rejestracji"
                        value={formatDate(registrationDate) || null}
                      />
                      <TableRow label="Adres siedziby" value={toSentenceCase(address.full) || null} />
                      <TableRow label="Numer KRS" value={krs || null} />
                      <TableRow label="REGON" value={regon || null} />
                      <TableRow label="Kapitał zakładowy" value={capitalFormatted} />
                      <TableRow label="Właściciel" value={toTitleCase(ownerName) || null} />
                      {source === "CEIDG" && (
                        <>
                          <TableRow label="Nr konta VAT" value="—" />
                          <TableRow label="Status VAT" value="—" last />
                        </>
                      )}
                    </tbody>
                  </table>
                </SectionCard>

                {/* Kontakt — paywall */}
                {hasContact && (
                  <SectionCard title="Kontakt" style={{ position: "relative" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {contact.phone && (
                          <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                            <td style={tdLabel}>Telefon</td>
                            <td style={tdValue}>{maskPhone(contact.phone)}</td>
                          </tr>
                        )}
                        {contact.email && (
                          <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                            <td style={tdLabel}>E-mail</td>
                            <td style={tdValue}>{maskEmail(contact.email)}</td>
                          </tr>
                        )}
                        {contact.website && (
                          <tr>
                            <td style={tdLabel}>Strona www</td>
                            <td style={tdValue}>{maskWebsite(contact.website)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <PaywallOverlay />
                  </SectionCard>
                )}

                {/* Osoby reprezentujące */}
                {representatives.length > 0 && (
                  <SectionCard title="Osoby reprezentujące">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                          <th style={{ ...tdLabel, padding: "8px 16px", textAlign: "left" }}>
                            Imię i nazwisko
                          </th>
                          <th style={{ ...tdLabel, padding: "8px 16px", textAlign: "left" }}>
                            Funkcja
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {representatives.map((r, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom:
                                i < representatives.length - 1 ? "1px solid #e5e5e5" : "none",
                            }}
                          >
                            <td style={tdValue}>{toTitleCase(r.name)}</td>
                            <td style={{ ...tdValue, color: "#999" }}>{toSentenceCase(r.fn)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SectionCard>
                )}

                {/* Wspólnicy */}
                {shareholders.length > 0 && (
                  <SectionCard title="Wspólnicy">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                          <th style={{ ...tdLabel, padding: "8px 16px", textAlign: "left" }}>
                            Nazwa / Imię i nazwisko
                          </th>
                          <th style={{ ...tdLabel, padding: "8px 16px", textAlign: "left" }}>
                            Udziały
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shareholders.map((s, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom:
                                i < shareholders.length - 1 ? "1px solid #e5e5e5" : "none",
                            }}
                          >
                            <td style={tdValue}>{toTitleCase(s.name)}</td>
                            <td style={{ ...tdValue, color: "#999" }}>{toSentenceCase(s.shares)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </SectionCard>
                )}

                {/* Beneficjenci CRBR */}
                <SectionCard
                  title="Beneficjenci rzeczywiści (CRBR)"
                  badge={<span style={freeBadge}>free</span>}
                >
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "#999" }}>
                    Brak danych w rejestrze CRBR
                  </div>
                </SectionCard>

                {/* Powiązania kapitałowe */}
                <SectionCard
                  title="Powiązania kapitałowe"
                  badge={<span style={freeBadge}>free</span>}
                >
                  <div style={{ padding: "14px 16px", fontSize: 13, color: "#999" }}>
                    Brak powiązań kapitałowych w bazie
                  </div>
                </SectionCard>

                {/* Sposób reprezentacji */}
                {representationMethod && (
                  <SectionCard title="Sposób reprezentacji">
                    <div style={{ padding: "14px 16px", fontSize: 13, color: "#111", lineHeight: 1.6 }}>
                      {toSentenceCase(representationMethod)}
                    </div>
                  </SectionCard>
                )}

                {/* PKD jako tagi */}
                {pkdCodes.length > 0 && (
                  <SectionCard title="Przedmiot działalności (PKD)">
                    <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pkdCodes.map((p, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            fontSize: 12,
                            border: `1px solid ${p.isPrimary ? "#bbf7d0" : "#e5e5e5"}`,
                            background: p.isPrimary ? "#f0fdf4" : "#fafafa",
                            color: "#111",
                            fontWeight: p.isPrimary ? 500 : 400,
                          }}
                        >
                          {p.code}
                          {p.description && (
                            <span style={{ color: "#999", fontWeight: 400 }}>
                              {" "}— {toSentenceCase(p.description)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Right column */}
              <aside>
                {/* Mapa */}
                <div style={{ ...card, overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
                    <iframe
                      src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=14`}
                      style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                      title="Lokalizacja firmy"
                      loading="lazy"
                    />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(255,255,255,0.92)",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: 11,
                        color: "#111",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <ExternalLink size={10} />
                      Otwórz mapę
                    </a>
                  </div>
                </div>

                {/* Akcje */}
                <div style={card}>
                  <div style={cardHead}>
                    <h2 style={sectionTitle}>Akcje</h2>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      style={{ ...btnOutline, width: "100%", justifyContent: "flex-start" }}
                    >
                      <Printer size={14} />
                      Drukuj / PDF
                    </button>
                    <button
                      style={{ ...btnOutline, width: "100%", justifyContent: "flex-start" }}
                    >
                      <Share2 size={14} />
                      Udostępnij
                    </button>
                    <button style={{ ...btnBlack, width: "100%" }}>Obserwuj</button>
                    {krsLink && (
                      <a
                        href={krsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...btnOutline,
                          width: "100%",
                          justifyContent: "flex-start",
                          textDecoration: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <ExternalLink size={14} />
                        Wpis w {source}
                      </a>
                    )}
                  </div>
                </div>

                {/* Podobne firmy */}
                <div style={card}>
                  <div style={cardHead}>
                    <h2 style={sectionTitle}>Podobne firmy</h2>
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    <p style={{ fontSize: 12, color: "#999", margin: "0 0 6px" }}>
                      {primaryPkd
                        ? `Branża ${primaryPkd.code}${address.voivodeship ? `, ${toTitleCase(address.voivodeship)}` : ""}`
                        : "Ta sama branża i region"}
                    </p>
                    <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Brak danych</p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* ── Pro tabs ── */}
          {PRO_TABS.includes(tab) && (
            <div
              style={{
                position: "relative",
                minHeight: 320,
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Content skeleton behind blur */}
              <div
                style={{
                  padding: 24,
                  filter: "blur(5px)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {[60, 80, 70, 50, 65].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: i === 0 ? 20 : 14,
                      background: "#f0f0f0",
                      borderRadius: 4,
                      marginBottom: 12,
                      width: `${w}%`,
                    }}
                  />
                ))}
              </div>

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <Lock size={24} style={{ margin: "0 auto 10px", color: "#999" }} />
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#111",
                      margin: "0 0 6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Dostępne w planie Pro
                  </p>
                  <p style={{ fontSize: 13, color: "#999", margin: "0 0 18px" }}>
                    {PRO_DESCRIPTIONS[tab]}
                  </p>
                  <button style={btnBlack}>Odblokuj za 49 zł/mies.</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <p
          style={{
            marginTop: 32,
            fontSize: 12,
            color: "#999",
            textAlign: "center",
            borderTop: "1px solid #e5e5e5",
            paddingTop: 20,
          }}
        >
          Dane pochodzą z{" "}
          {source === "KRS"
            ? "Krajowego Rejestru Sądowego"
            : "Centralnej Ewidencji i Informacji o Działalności Gospodarczej"}
          . Informacje mają charakter poglądowy.
        </p>
      </main>
    </div>
  )
}
