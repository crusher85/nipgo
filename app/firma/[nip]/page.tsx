export const revalidate = 43200

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FirmaView } from './FirmaView'

async function getFirma(nip: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const clean = nip.replace(/-/g, '')

  const { data: ceidg } = await supabase
    .from('ceidg_firms')
    .select(`nip, regon, nazwa_pelna, status_gus, forma_prawna,
      data_rozpoczecia, wlasciciel_imie, wlasciciel_nazwisko,
      ulica, nr_budynku, nr_lokalu, kod_pocztowy,
      miejscowosc, gmina, powiat, wojewodztwo, adres_pelny,
      pkd_glowne, pkd_wszystkie_json, email, telefon, strona_www, link_do_wpisu`)
    .eq('nip', clean)
    .maybeSingle()

  if (ceidg) return { ...ceidg, zrodlo: 'CEIDG' as const }

  const { data: krs } = await supabase
    .from('krs_firms')
    .select(`krs_number, nip, regon, nazwa_pelna, status_krs, forma_prawna,
      rejestr, data_rejestracji, ulica, nr_budynku, kod_pocztowy,
      miejscowosc, gmina, powiat, wojewodztwo, adres_pelny,
      kapital_zakladowy, waluta, zarzad_sklad, reprezentacja_sposob,
      prokurenci, rada_nadzorcza, wspolnicy, pkd_lista,
      email, telefon, www, restrukturyzacja_upadlosc, all_data_json`)
    .eq('nip', clean)
    .maybeSingle()

  if (krs) return { ...krs, zrodlo: 'KRS' as const }
  return null
}

export async function generateMetadata(
  { params }: { params: Promise<{ nip: string }> }
): Promise<Metadata> {
  const { nip } = await params
  const firma = await getFirma(nip)
  if (!firma) return { title: 'Firma nie znaleziona | nipgo.pl' }
  const f = firma as any
  return {
    title: `${f.nazwa_pelna} — NIP ${nip} | nipgo.pl`,
    description: `Dane firmy ${f.nazwa_pelna}: ${f.adres_pelny || f.miejscowosc || ''}`,
  }
}

function buildAdres(f: any): string {
  const parts = []
  if (f.ulica) {
    parts.push(`ul. ${f.ulica} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`.trim())
  } else if (f.nr_budynku) {
    parts.push(f.nr_budynku)
  }
  if (f.miejscowosc) parts.push(f.miejscowosc)
  if (f.kod_pocztowy) parts.push(f.kod_pocztowy)
  return parts.join(', ')
}

function getPkdCodes(f: any) {
  if (f.zrodlo === 'CEIDG' && f.pkd_wszystkie_json) {
    return (f.pkd_wszystkie_json as any[]).map((p: any) => ({
      code: p.kod,
      description: p.nazwa,
      isPrimary: f.pkd_glowne?.startsWith(p.kod),
    }))
  }
  if (f.zrodlo === 'KRS' && f.pkd_lista) {
    const lista = f.pkd_lista as any
    const przewazajaca = lista.przedmiotPrzewazajacejDzialalnosci || []
    const pozostala = lista.przedmiotPozostalejDzialalnosci || []
    return [
      ...przewazajaca.map((p: any) => ({
        code: `${p.kodDzial}.${p.kodKlasa}.${p.kodPodklasa}`,
        description: p.opis,
        isPrimary: true,
      })),
      ...pozostala.map((p: any) => ({
        code: `${p.kodDzial}.${p.kodKlasa}.${p.kodPodklasa}`,
        description: p.opis,
        isPrimary: false,
      })),
    ]
  }
  return []
}

function getZarzad(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const sklad = f.zarzad_sklad as any[]
  if (!sklad || !Array.isArray(sklad)) return []
  return sklad.map((os: any) => ({
    name: `${os.imiona?.imie || ''} ${os.nazwisko?.nazwiskoICzlon || ''}`.trim(),
    fn: os.funkcjaWOrganie || '',
  }))
}

function getProkurenci(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const prok = f.prokurenci as any[]
  if (!prok || !Array.isArray(prok)) return []
  return prok.map((os: any) => ({
    name: `${os.imiona?.imie || ''} ${os.nazwisko?.nazwiskoICzlon || ''}`.trim()
      || os.imieNazwisko || os.nazwa || '',
    fn: os.rodzajProkury || os.funkcjaWOrganie || 'Prokurent',
  }))
}

function getRadaNadzorcza(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const rada = f.rada_nadzorcza as any[]
  if (!rada || !Array.isArray(rada)) return []
  return rada.map((os: any) => ({
    name: `${os.imiona?.imie || ''} ${os.nazwisko?.nazwiskoICzlon || ''}`.trim()
      || os.imieNazwisko || '',
    fn: os.funkcjaWOrganie || 'Członek rady',
  }))
}

function getFinancialReports(f: any): any[] {
  if (f.zrodlo !== 'KRS') return []
  try {
    const r = f.all_data_json?.odpis?.dane?.dzial3
      ?.wzmiankiOZlozonychDokumentach
      ?.wzmiankaOZlozeniuRocznegoSprawozdaniaFinansowego
    if (!r) return []
    return Array.isArray(r) ? r : [r]
  } catch {
    return []
  }
}

function getWspolnicy(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const ws = f.wspolnicy as any[]
  if (!ws || !Array.isArray(ws)) return []
  return ws.map((w: any) => ({
    name:
      `${w.imiona?.imie || ''} ${w.nazwisko?.nazwiskoICzlon || ''}`.trim() ||
      w.nazwa ||
      '-',
    shares: w.posiadaneUdzialy || '',
  }))
}

export default async function FirmaPage(
  { params }: { params: Promise<{ nip: string }> }
) {
  const { nip } = await params
  const firma = await getFirma(nip)
  if (!firma) notFound()

  const f = firma as any
  const status = ((f.status_gus || f.status_krs) ?? '').toLowerCase()
  const isActive = status.includes('aktywn')
  const adres = buildAdres(f)

  return (
    <FirmaView
      nip={f.nip || nip}
      name={f.nazwa_pelna || ''}
      regon={f.regon || ''}
      krs={f.krs_number || ''}
      statusKrs={f.status_krs || f.status_gus || ''}
      status={isActive ? 'active' : 'inactive'}
      legalForm={f.forma_prawna || ''}
      source={firma.zrodlo}
      rejestr={f.rejestr || ''}
      registrationDate={f.data_rozpoczecia || f.data_rejestracji || ''}
      capital={f.kapital_zakladowy || ''}
      currency={f.waluta || 'PLN'}
      address={{
        street: f.ulica
          ? `ul. ${f.ulica} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`.trim()
          : f.nr_budynku || '',
        city: f.miejscowosc || '',
        postalCode: f.kod_pocztowy || '',
        voivodeship: f.wojewodztwo || '',
        county: f.powiat || '',
        commune: f.gmina || '',
        full: f.adres_pelny || adres,
      }}
      contact={{
        phone: f.telefon || '',
        email: f.email || '',
        website: f.strona_www || f.www || '',
      }}
      representationMethod={f.reprezentacja_sposob || ''}
      representatives={getZarzad(f)}
      prokurenci={getProkurenci(f)}
      radaNadzorcza={getRadaNadzorcza(f)}
      shareholders={getWspolnicy(f)}
      pkdCodes={getPkdCodes(f)}
      krsLink={f.link_do_wpisu || ''}
      ownerName={
        f.wlasciciel_imie
          ? `${f.wlasciciel_imie} ${f.wlasciciel_nazwisko || ''}`.trim()
          : ''
      }
      restrukturyzacja={f.restrukturyzacja_upadlosc ?? null}
      financialReports={getFinancialReports(f)}
    />
  )
}
