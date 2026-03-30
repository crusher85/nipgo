import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function normalizePkdList(pkd: unknown): string[] {
  if (!pkd) return []
  if (Array.isArray(pkd)) {
    return pkd.map(v => String(v).trim()).filter(Boolean)
  }
  if (typeof pkd === 'string') {
    // Common formats: comma/semicolon/newline separated.
    return pkd.split(/[;,\n]+/g).map(s => s.trim()).filter(Boolean)
  }
  const asString = String(pkd).trim()
  return asString ? [asString] : []
}

async function getFirma(nip: string) {
  const cleanNip = nip.replace(/-/g, '')

  const [ceidg, krs] = await Promise.all([
    supabase
      .from('ceidg_firms')
      .select(`
        nip, regon, nazwa_pelna, status_gus, forma_prawna,
        data_rozpoczecia, ulica, nr_budynku, kod_pocztowy,
        miejscowosc, wojewodztwo, adres_pelny, pkd_glowne,
        pkd_wszystkie, email, telefon, strona_www
      `)
      .eq('nip', cleanNip)
      .single(),
    supabase
      .from('krs_firms')
      .select(`
        krs_number, nip, regon, nazwa_pelna, status_krs,
        forma_prawna, data_rejestracji, ulica, nr_budynku,
        kod_pocztowy, miejscowosc, wojewodztwo, adres_pelny,
        kapital_zakladowy, email, telefon, www
      `)
      .eq('nip', cleanNip)
      .single()
  ])

  if (ceidg.data) return { ...ceidg.data, zrodlo: 'CEIDG' }
  if (krs.data) return { ...krs.data, zrodlo: 'KRS' }
  return null
}

export async function generateMetadata(
  { params }: { params: Promise<{ nip: string }> }
): Promise<Metadata> {
  const { nip } = await params
  const firma = await getFirma(nip)
  if (!firma) return { title: 'Firma nie znaleziona | nipgo.pl' }
  return {
    title: `${firma.nazwa_pelna} — NIP ${nip} | nipgo.pl`,
    description: `Dane firmy ${firma.nazwa_pelna}: adres, status, kontakt. Sprawdź pełne informacje na nipgo.pl`,
  }
}

export default async function FirmaPage(
  { params }: { params: Promise<{ nip: string }> }
) {
  const { nip } = await params
  const firma = (await getFirma(nip)) as any
  if (!firma) notFound()

  const status = firma.status_gus || firma.status_krs || 'Nieznany'
  const statusKolor = status === 'Aktywny' || status === 'Aktywna'
    ? 'text-green-400' : 'text-red-400'

  const pkdWszystkie = normalizePkdList(firma.pkd_wszystkie)
  const pkdDoWyswietlenia =
    pkdWszystkie.length > 0 ? pkdWszystkie : normalizePkdList(firma.pkd_glowne)

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="px-8 py-6 border-b border-white/10">
        <a href="/" className="text-white font-bold text-xl tracking-tight">nipgo</a>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16">

        {/* HEADER */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/20 text-white/60">
              {firma.zrodlo}
            </span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
              status === 'Aktywny' || status === 'Aktywna'
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-red-500/30 text-red-400 bg-red-500/10'
            }`}>
              {status}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {firma.nazwa_pelna}
          </h1>
          {firma.adres_pelny && (
            <p className="text-white/50 text-lg">{firma.adres_pelny}</p>
          )}
        </div>

        {/* DANE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden">

          <div className="bg-black p-8">
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">NIP</p>
            <p className="text-white text-lg font-mono">{nip}</p>
          </div>

          {firma.regon && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">REGON</p>
              <p className="text-white text-lg font-mono">{firma.regon}</p>
            </div>
          )}

          {firma.krs_number && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">KRS</p>
              <p className="text-white text-lg font-mono">{firma.krs_number}</p>
            </div>
          )}

          {firma.forma_prawna && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Forma prawna</p>
              <p className="text-white text-lg">{firma.forma_prawna}</p>
            </div>
          )}

          {status && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Status firmy</p>
              <p className={`text-white text-lg ${statusKolor}`}>{status}</p>
            </div>
          )}

          {(firma.data_rozpoczecia || firma.data_rejestracji) && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Data rozpoczęcia działalności</p>
              <p className="text-white text-lg">
                {firma.data_rozpoczecia || firma.data_rejestracji}
              </p>
            </div>
          )}

          {firma.kapital_zakladowy && (
            <div className="bg-black p-8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Kapitał zakładowy</p>
              <p className="text-white text-lg">
                {Number(firma.kapital_zakladowy).toLocaleString('pl-PL')} PLN
              </p>
            </div>
          )}

          {(firma.ulica || firma.nr_budynku || firma.kod_pocztowy || firma.miejscowosc || firma.wojewodztwo) && (
            <div className="bg-black p-8 md:col-span-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Adres</p>
              <div className="space-y-1">
                {(firma.ulica || firma.nr_budynku) && (
                  <p className="text-white text-lg">
                    {[firma.ulica, firma.nr_budynku].filter(Boolean).join(' ')}
                  </p>
                )}
                {(firma.kod_pocztowy || firma.miejscowosc) && (
                  <p className="text-white text-lg">
                    {[firma.kod_pocztowy, firma.miejscowosc].filter(Boolean).join(' ')}
                  </p>
                )}
                {firma.wojewodztwo && (
                  <p className="text-white text-lg">{firma.wojewodztwo}</p>
                )}
              </div>
            </div>
          )}

          {pkdDoWyswietlenia.length > 0 && (
            <div className="bg-black p-8 md:col-span-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">PKD</p>
              <ul className="mt-3 space-y-1">
                {pkdDoWyswietlenia.map(code => (
                  <li key={code} className="text-white/90 text-sm font-mono">{code}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* KONTAKT */}
        <div className="mt-px bg-white/10 rounded-2xl overflow-hidden">
          <div className="bg-black p-8">
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-6">Kontakt</p>
            <div className="space-y-4">
              {firma.email ? (
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm w-20">Email</span>
                  <span className="text-white">{firma.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm w-20">Email</span>
                  <span className="text-white/20 text-sm">— dostępny w planie START</span>
                </div>
              )}
              {firma.telefon ? (
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm w-20">Telefon</span>
                  <span className="text-white">{firma.telefon}</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm w-20">Telefon</span>
                  <span className="text-white/20 text-sm">— dostępny w planie START</span>
                </div>
              )}
              {(firma.strona_www || firma.www) && (
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-sm w-20">WWW</span>
                  <a href={firma.strona_www || firma.www}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300">
                    {firma.strona_www || firma.www}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}