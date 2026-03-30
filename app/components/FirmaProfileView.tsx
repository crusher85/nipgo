'use client'

import { useMemo, useState } from 'react'

type Firma = {
  zrodlo: 'CEIDG' | 'KRS'
  nazwa_pelna: string | null
  nip: string | null
  regon: string | null
  forma_prawna: string | null
  status: string | null
  data_startu: string | null
  krs_number?: string | null
  adres_pelny: string | null
  miejscowosc: string | null
  kod_pocztowy: string | null
  wojewodztwo: string | null
  gmina: string | null
  powiat: string | null
  ulica: string | null
  nr_budynku: string | null
  nr_lokalu: string | null
  email: string | null
  telefon: string | null
  www: string | null
  pkd_items: Array<{ kod: string; nazwa: string }>
  zarzad?: Array<{ imie: string; nazwisko: string; funkcja: string }>
  wspolnicy?: Array<{ imie: string; nazwisko: string; udzialy: string }>
  reprezentacja_sposob?: string | null
}

type CopyKey = 'nip' | 'regon' | 'krs' | 'data'

function isActiveStatus(status: string | null): boolean {
  const normalized = (status ?? '').trim().toUpperCase()
  return normalized === 'AKTYWNY' || normalized === 'AKTYWNA'
}

function buildAddressLine(firma: Firma): string {
  const parts: string[] = []
  const streetLineParts: string[] = []

  if (firma.ulica) streetLineParts.push(firma.ulica)
  if (firma.nr_budynku) {
    streetLineParts.push(firma.nr_lokalu ? `${firma.nr_budynku}/${firma.nr_lokalu}` : firma.nr_budynku)
  }

  const street = streetLineParts.join(' ').trim()
  if (street) parts.push(street)

  if (firma.miejscowosc) parts.push(firma.miejscowosc)
  if (firma.kod_pocztowy) parts.push(firma.kod_pocztowy)

  return parts.join(', ').trim()
}

function getInitials(imie: string | undefined, nazwisko: string | undefined): string {
  const a = (imie ?? '').trim().slice(0, 1)
  const b = (nazwisko ?? '').trim().slice(0, 1)
  return (a + b).toUpperCase()
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4h6M9 2h6a2 2 0 0 1 2 2v2H7V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7 6H5a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 6h-5a1 1 0 0 0-1 1v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10a2 2 0 1 0 0.001 0Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CopyButton({
  copied,
  which,
  onClick,
}: {
  copied: CopyKey | null
  which: CopyKey
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg text-[#2563EB] transition-colors"
      aria-label="Kopiuj"
    >
      {copied === which ? (
        <span className="text-[14px] font-semibold leading-none">✓</span>
      ) : (
        <span className="text-[#2563EB]">
          <ClipboardIcon />
        </span>
      )}
    </button>
  )
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      className="border-b border-[#E5E7EB] px-6 py-5 group"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="text-[14px] font-semibold text-[#111827]">{title}</span>
        <span className="text-[#6B7280] transition-transform group-open:rotate-180">
          <ChevronDownIcon />
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

export default function FirmaProfileView({ firma }: { firma: Firma }) {
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null)
  const [pkdExpanded, setPkdExpanded] = useState(false)

  const nazwa = firma.nazwa_pelna ?? 'Nieznana firma'
  const statusIsActive = isActiveStatus(firma.status)
  const statusLabel = statusIsActive ? 'Aktywny' : 'Nieaktywny'
  const addressLine = useMemo(
    () => firma.adres_pelny ?? buildAddressLine(firma),
    [firma]
  )
  const mapsUrl = useMemo(() => {
    const q = firma.adres_pelny ?? addressLine
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}`
  }, [firma, addressLine])
  const googleEmbedSrc = useMemo(() => {
    const q = firma.adres_pelny ?? addressLine
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
  }, [firma, addressLine])
  const registryUrl = useMemo(() => {
    if (firma.zrodlo === 'CEIDG') {
      return `https://aplikacja.ceidg.gov.pl/CEIDG/CEIDG.Public.UI/SearchDetails.aspx?NIP=${encodeURIComponent(firma.nip ?? '')}`
    }
    return `https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/index.html?krs=${encodeURIComponent(firma.krs_number ?? '')}`
  }, [firma])

  async function copyText(which: CopyKey, value: string | null) {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopiedKey(which)
    window.setTimeout(() => setCopiedKey((prev) => (prev === which ? null : prev)), 2000)
  }

  async function share() {
    try {
      if (!navigator.share) {
        await navigator.clipboard.writeText(window.location.href)
        return
      }
      await navigator.share({
        title: nazwa,
        text: nazwa,
        url: window.location.href,
      })
    } catch {
      // no-op (user cancelled)
    }
  }

  const pkd = firma.pkd_items ?? []
  const visiblePkd = pkdExpanded ? pkd : pkd.slice(0, 5)
  const hiddenCount = Math.max(0, pkd.length - 5)

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border border-[#E5E7EB] bg-white">
            <div className="px-6 py-6">
              <div className="text-[12px] text-[#6B7280]">nipgo / {nazwa}</div>
              <h1 className="mt-2 text-[26px] font-semibold leading-tight">{nazwa}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                    statusIsActive ? 'bg-green-100 text-green-700' : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {statusLabel}
                </span>
                <span className="rounded-full border border-[#2563EB] px-3 py-1 text-[12px] font-semibold text-[#2563EB]">
                  {firma.zrodlo}
                </span>
                {firma.forma_prawna ? (
                  <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-semibold text-[#6B7280]">
                    {firma.forma_prawna}
                  </span>
                ) : null}
              </div>
            </div>

            <Section title="Dane rejestrowe" defaultOpen>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">NIP</div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="text-[15px] font-bold">{firma.nip ?? 'Brak danych'}</div>
                    <CopyButton copied={copiedKey} which="nip" onClick={() => copyText('nip', firma.nip)} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">REGON</div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="text-[15px] font-bold">{firma.regon ?? 'Brak danych'}</div>
                    <CopyButton copied={copiedKey} which="regon" onClick={() => copyText('regon', firma.regon)} />
                  </div>
                </div>
                {firma.zrodlo === 'KRS' ? (
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">KRS</div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="text-[15px] font-bold">{firma.krs_number ?? 'Brak danych'}</div>
                      <CopyButton copied={copiedKey} which="krs" onClick={() => copyText('krs', firma.krs_number ?? null)} />
                    </div>
                  </div>
                ) : null}
                <div className={firma.zrodlo === 'KRS' ? 'md:col-span-2' : 'md:col-span-3'}>
                  <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                    {firma.zrodlo === 'CEIDG' ? 'Data rozpoczęcia' : 'Data rejestracji'}
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="text-[15px] font-bold">{firma.data_startu ?? 'Brak danych'}</div>
                    <CopyButton copied={copiedKey} which="data" onClick={() => copyText('data', firma.data_startu)} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Adres">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[15px]">{addressLine || 'Brak danych'}</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#2563EB] underline underline-offset-2"
                >
                  Zobacz na mapie
                </a>
              </div>
              <div className="mt-3 text-[14px] text-[#6B7280]">
                {[firma.gmina, firma.powiat, firma.wojewodztwo].filter(Boolean).join(' · ') || 'Brak danych'}
              </div>
            </Section>

            {pkd.length > 0 ? (
              <Section title="Działalność (PKD)">
                <div className="flex flex-wrap gap-2">
                  {visiblePkd.map((item, idx) => (
                    <span key={`${item.kod}-${idx}`} className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] inline-flex items-center gap-2">
                      <span className="font-mono text-[#6B7280]">{item.kod}</span>
                      <span>{item.nazwa}</span>
                    </span>
                  ))}
                </div>
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPkdExpanded((v) => !v)}
                    className="mt-3 text-[14px] font-semibold text-[#2563EB]"
                  >
                    {pkdExpanded ? 'Pokaż mniej' : `Pokaż wszystkie (+${hiddenCount})`}
                  </button>
                ) : null}
              </Section>
            ) : null}

            {firma.zrodlo === 'KRS' && (firma.zarzad?.length ?? 0) > 0 ? (
              <Section title="Zarząd">
                <ul className="space-y-4">
                  {firma.zarzad!.map((person, idx) => (
                    <li key={`${person.imie}-${person.nazwisko}-${idx}`} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                        <span className="text-[12px] font-semibold text-[#2563EB]">{getInitials(person.imie, person.nazwisko)}</span>
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold">{person.imie} {person.nazwisko}</div>
                        <div className="mt-1 text-[12px] text-[#6B7280]">{person.funkcja}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {firma.zrodlo === 'KRS' && (firma.wspolnicy?.length ?? 0) > 0 ? (
              <Section title="Wspólnicy">
                <ul className="space-y-4">
                  {firma.wspolnicy!.map((person, idx) => (
                    <li key={`${person.imie}-${person.nazwisko}-${idx}`} className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                          <span className="text-[12px] font-semibold text-[#2563EB]">{getInitials(person.imie, person.nazwisko)}</span>
                        </div>
                        <div className="text-[14px] font-semibold">{person.imie} {person.nazwisko}</div>
                      </div>
                      <div className="pt-1 text-[14px] text-[#6B7280] font-medium">{person.udzialy}</div>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {firma.zrodlo === 'KRS' && firma.reprezentacja_sposob ? (
              <Section title="Reprezentacja">
                <div className="rounded-lg bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#374151]">
                  {firma.reprezentacja_sposob}
                </div>
              </Section>
            ) : null}
          </section>

          <aside className="lg:sticky lg:top-6 h-fit space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="text-[14px] font-semibold text-[#111827]">Akcje</div>
              <div className="mt-4 grid gap-2">
                {firma.telefon ? (
                  <a href={`tel:${firma.telefon}`} className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-[14px] font-semibold text-gray-900 text-center">
                    Zadzwoń
                  </a>
                ) : null}
                {firma.email ? (
                  <a href={`mailto:${firma.email}`} className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-semibold text-[#111827] text-center">
                    Wyślij email
                  </a>
                ) : null}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-semibold text-[#111827] text-center inline-flex items-center justify-center gap-2"
                >
                  <MapIcon />
                  Nawiguj
                </a>
                <a
                  href={`sms:?&body=${encodeURIComponent(addressLine || '')}`}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-semibold text-[#111827] text-center"
                >
                  Wyślij adres na telefon
                </a>
                <button
                  type="button"
                  onClick={share}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] font-semibold text-[#111827] inline-flex items-center justify-center gap-2"
                >
                  <ShareIcon />
                  Udostępnij
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="text-[14px] font-semibold text-[#111827]">Lokalizacja</div>
              <div className="mt-4 overflow-hidden rounded-lg">
                <iframe
                  title="Google maps"
                  src={googleEmbedSrc}
                  className="h-[220px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 text-sm text-[#6B7280]">{addressLine || 'Brak danych'}</div>
              <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                <a href={registryUrl} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-[#2563EB] underline underline-offset-2">
                  Przejdź do wpisu {firma.zrodlo}
                </a>
              </div>
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-semibold">Kontakt</div>
                <div className="mt-2 space-y-2 text-[14px]">
                  <div>
                    {firma.email ? (
                      <a href={`mailto:${firma.email}`} className="text-[#2563EB] font-semibold underline underline-offset-2">
                        {firma.email}
                      </a>
                    ) : (
                      <span className="text-[#9CA3AF]">Brak danych</span>
                    )}
                  </div>
                  <div>
                    {firma.telefon ? (
                      <a href={`tel:${firma.telefon}`} className="text-[#2563EB] font-semibold underline underline-offset-2">
                        {firma.telefon}
                      </a>
                    ) : (
                      <span className="text-[#9CA3AF]">Brak danych</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

