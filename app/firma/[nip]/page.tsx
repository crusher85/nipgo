export const revalidate = 43200
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FirmaView } from './FirmaView'
const BASE_URL = 'https://nipgo.pl'
async function getFirma(nip: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const clean = nip.replace(/-/g, '')
  const { data: ceidg } = await supabase
    .from('ceidg_firms')
    .select(`
      nip, regon, nazwa_pelna, status_gus, status_dodatkowy,
      forma_prawna, forma_wlasnosci, forma_wlasnosci_nazwa,
      data_powstania, data_rozpoczecia, data_zawieszenia, data_wznowienia, data_zakonczenia,
      wlasciciel_imie, wlasciciel_nazwisko,
      ulica, nr_budynku, nr_lokalu, kod_pocztowy,
      miejscowosc, gmina, powiat, wojewodztwo, adres_pelny,
      pkd_glowne, pkd_wszystkie_json,
      email, telefon, telefon_komorkowy_premium,
      strona_www, strona_www_urzedowa, link_do_wpisu,
      facebook_url, google_rating,
      liczba_pracownikow, czy_nieruchomosc_wlasna,
      organ_rejestrowy, rodzaj_rejestru,
      zakazy_info, uprawnienia_info, flaga_ryzyka,
      wspolnosc_majatkowa, adres_doreczenia, obywatelstwo, plec,
      updated_at
    `)
    .eq('nip', clean)
    .maybeSingle()
  if (ceidg) return { ...ceidg, zrodlo: 'CEIDG' as const }
  const { data: krs } = await supabase
    .from('krs_firms')
    .select(`
      krs_number, nip, regon, nazwa_pelna, status_krs, forma_prawna,
      rejestr, data_rejestracji, cel_dzialania,
      ulica, nr_budynku, nr_lokalu, kod_pocztowy,
      miejscowosc, gmina, powiat, wojewodztwo, adres_pelny,
      kapital_zakladowy, waluta, ostatnie_sprawozdanie_rok,
      zarzad_sklad, reprezentacja_sposob,
      prokurenci, rada_nadzorcza, wspolnicy, pkd_lista, pkd_glowne,
      email, telefon, www, facebook_url, google_rating,
      flaga_ryzyka, flaga_aktywna_dotacja,
      oddzialy, zaleglosci_podatkowe, wierzytelnosci,
      restrukturyzacja_upadlosc, historia_przeksztalcen,
      suma_pomocy_eur, pomoc_publiczna_detale,
      all_data_json, updated_at
    `)
    .eq('nip', clean)
    .maybeSingle()
  if (krs) return { ...krs, zrodlo: 'KRS' as const }
  return null
}
async function getVatStatus(nip: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const clean = nip.replace(/-/g, '')
  const { data } = await supabase
    .from('vat_status')
    .select('status_vat, account_numbers')
    .eq('nip', clean)
    .maybeSingle()
  return data || null
}
async function getKontekst(f: any): Promise<any> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  try {
    // Obie tabele mają pkd_glowne po backfillu — używamy tego w pierwszej kolejności
    let pkd = f.pkd_glowne?.split('—')[0]?.trim() ?? ''

    // Fallback dla KRS na stary pkd_lista
    if (!pkd && f.zrodlo === 'KRS' && f.pkd_lista) {
      const prev = f.pkd_lista?.przedmiotPrzewazajacejDzialalnosci?.[0]
      if (prev) pkd = `${prev.kodDzial}.${prev.kodKlasa}.${prev.kodPodklasa}`
    }

    if (!pkd) return null

    if (f.zrodlo === 'CEIDG') {
      const { data } = await supabase.rpc('get_firma_kontekst_ceidg', {
        p_pkd: pkd,
        p_miasto: f.miejscowosc || '',
        p_wojewodztwo: f.wojewodztwo || '',
        p_data_rejestracji: f.data_rozpoczecia || null,
      })
      return data
    } else {
      const { data } = await supabase.rpc('get_firma_kontekst_krs', {
        p_pkd: pkd,
        p_miasto: f.miejscowosc || '',
        p_wojewodztwo: f.wojewodztwo || '',
        p_forma_prawna: f.forma_prawna || '',
        p_data_rejestracji: f.data_rejestracji || null,
        p_kapital: f.kapital_zakladowy ? parseFloat(f.kapital_zakladowy) : null,
      })
      return data
    }
  } catch {
    return null
  }
}
function cleanContact(val: string | null | undefined): string {
  if (!val) return ''
  const lower = val.toLowerCase().trim()
  if (['brak', 'b/d', '-', 'bd', 'brak danych'].includes(lower)) return ''
  return val
}
function buildAdres(f: any): string {
  const parts: string[] = []
  if (f.ulica) {
    const ulica = f.ulica.replace(/^ul\.\s*/i, '').replace(/^ulica\s*/i, '').trim()
    parts.push(`ul. ${ulica} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`.trim())
  } else if (f.nr_budynku) parts.push(f.nr_budynku)
  if (f.kod_pocztowy) parts.push(f.kod_pocztowy)
  if (f.miejscowosc) parts.push(f.miejscowosc)
  return parts.join(', ')
}
function getPkdMain(f: any): { code: string; desc: string } | null {
  // Najpierw pkd_glowne (obie tabele po backfillu)
  if (f.pkd_glowne) {
    const parts = f.pkd_glowne.split('—')
    return { code: parts[0]?.trim() ?? '', desc: parts[1]?.trim().toLowerCase() ?? '' }
  }
  // Fallback KRS stary format
  if (f.zrodlo === 'KRS' && f.pkd_lista) {
    try {
      const prev = f.pkd_lista?.przedmiotPrzewazajacejDzialalnosci
      if (prev?.[0]) {
        const p = prev[0]
        return { code: `${p.kodDzial}.${p.kodKlasa}.${p.kodPodklasa}`, desc: p.opis?.toLowerCase() ?? '' }
      }
    } catch {}
  }
  return null
}
function getPkdCodes(f: any) {
  if (f.zrodlo === 'CEIDG' && f.pkd_wszystkie_json) {
    return (f.pkd_wszystkie_json as any[]).map((p: any) => ({
      code: p.kod, description: p.nazwa, isPrimary: f.pkd_glowne?.startsWith(p.kod),
    }))
  }
  if (f.zrodlo === 'KRS' && f.pkd_lista) {
    const lista = f.pkd_lista as any
    const przewazajaca = lista.przedmiotPrzewazajacejDzialalnosci || []
    const pozostala = lista.przedmiotPozostalejDzialalnosci || []
    return [
      ...przewazajaca.map((p: any) => ({ code: `${p.kodDzial}.${p.kodKlasa}.${p.kodPodklasa}`, description: p.opis, isPrimary: true })),
      ...pozostala.map((p: any) => ({ code: `${p.kodDzial}.${p.kodKlasa}.${p.kodPodklasa}`, description: p.opis, isPrimary: false })),
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
    name: `${os.imiona?.imie || ''} ${os.nazwisko?.nazwiskoICzlon || ''}`.trim() || os.imieNazwisko || os.nazwa || '',
    fn: os.rodzajProkury || os.funkcjaWOrganie || 'Prokurent',
  }))
}
function getRadaNadzorcza(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const rada = f.rada_nadzorcza as any[]
  if (!rada || !Array.isArray(rada)) return []
  return rada.map((os: any) => ({
    name: `${os.imiona?.imie || ''} ${os.nazwisko?.nazwiskoICzlon || ''}`.trim() || os.imieNazwisko || '',
    fn: os.funkcjaWOrganie || 'Członek rady',
  }))
}
function getWspolnicy(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const ws = f.wspolnicy as any[]
  if (!ws || !Array.isArray(ws)) return []
  return ws.map((w: any) => ({
    name: `${w.imiona?.imie || ''} ${w.nazwisko?.nazwiskoICzlon || ''}`.trim() || w.nazwa || '-',
    shares: w.posiadaneUdzialy || '',
  }))
}
function getFinancialReports(f: any): any[] {
  if (f.zrodlo !== 'KRS') return []
  try {
    const r = f.all_data_json?.odpis?.dane?.dzial3?.wzmiankiOZlozonychDokumentach?.wzmiankaOZlozeniuRocznegoSprawozdaniaFinansowego
    if (!r) return []
    return Array.isArray(r) ? r : [r]
  } catch { return [] }
}
function getOddzialy(f: any): string[] {
  if (f.zrodlo !== 'KRS') return []
  const o = f.oddzialy as any[]
  if (!o || !Array.isArray(o)) return []
  return o.map((od: any) => od.nazwa || od.adres || '').filter(Boolean)
}
function getHistoriaPrzeksztalcen(f: any): string[] {
  if (f.zrodlo !== 'KRS') return []
  const h = f.historia_przeksztalcen as any[]
  if (!h || !Array.isArray(h)) return []
  return h.map((hp: any) => hp.opis || hp.typ || JSON.stringify(hp)).filter(Boolean)
}
function buildJsonLd(f: any, nip: string): object[] {
  const name = f.nazwa_pelna || ''
  const url = `${BASE_URL}/firma/${nip}`
  const website = f.strona_www || f.strona_www_urzedowa || f.www || ''
  const email = cleanContact(f.email)
  const phone = cleanContact(f.telefon || f.telefon_komorkowy_premium)
  const city = f.miejscowosc || ''
  const postalCode = f.kod_pocztowy || ''
  const voivodeship = f.wojewodztwo || ''
  const street = f.ulica
    ? `ul. ${f.ulica.replace(/^ul\.\s*/i, '').trim()} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`.trim()
    : f.nr_budynku || ''
  const pkd = getPkdMain(f)
  const identifiers: object[] = [{ '@type': 'PropertyValue', name: 'NIP', value: nip }]
  if (f.regon) identifiers.push({ '@type': 'PropertyValue', name: 'REGON', value: f.regon })
  if (f.krs_number) identifiers.push({ '@type': 'PropertyValue', name: 'KRS', value: f.krs_number })
  const sameAs: string[] = []
  if (website) sameAs.push(website)
  if (f.facebook_url) sameAs.push(f.facebook_url)
  if (f.krs_number) sameAs.push(`https://ekrs.ms.gov.pl/rdf/pd/time_aktualizacji,${f.krs_number}`)
  if (f.link_do_wpisu) sameAs.push(f.link_do_wpisu)
  const organization: Record<string, any> = {
    '@context': 'https://schema.org', '@type': city ? 'LocalBusiness' : 'Organization',
    '@id': url, name, url, identifier: identifiers,
    address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: city, postalCode, addressRegion: voivodeship, addressCountry: 'PL' },
    ...(f.forma_prawna && { legalName: name }),
    ...(pkd?.desc && { description: pkd.desc }),
    ...(email && { email }), ...(phone && { telephone: phone }),
    ...(sameAs.length > 0 && { sameAs }),
  }
  const foundingDate = f.data_rozpoczecia || f.data_rejestracji
  if (foundingDate) {
    try {
      let iso = foundingDate
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(foundingDate)) {
        const [d, m, y] = foundingDate.split('.'); iso = `${y}-${m}-${d}`
      }
      organization.foundingDate = iso
    } catch {}
  }
  if (f.liczba_pracownikow) organization.numberOfEmployees = { '@type': 'QuantitativeValue', value: f.liczba_pracownikow }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'nipgo.pl', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Wyszukiwarka firm', item: `${BASE_URL}/search` },
      ...(city ? [{ '@type': 'ListItem', position: 3, name: city, item: `${BASE_URL}/search?miasto=${encodeURIComponent(city)}` }] : []),
      { '@type': 'ListItem', position: city ? 4 : 3, name, item: url },
    ],
  }
  return [organization, breadcrumb]
}
export async function generateMetadata({ params }: { params: Promise<{ nip: string }> }): Promise<Metadata> {
  const { nip } = await params
  const firma = await getFirma(nip)
  if (!firma) return { title: 'Firma nie znaleziona | nipgo.pl', robots: { index: false } }
  const f = firma as any
  const name = f.nazwa_pelna || ''
  const city = f.miejscowosc || ''
  const voivodeship = f.wojewodztwo || ''
  const legalForm = f.forma_prawna || ''
  const status = ((f.status_gus || f.status_krs) ?? '').toLowerCase()
  const isActive = status.includes('aktywn')
  const pkd = getPkdMain(f)
  const url = `${BASE_URL}/firma/${nip}`
  const ogImageUrl = `${BASE_URL}/api/og/${nip}`
  const titleParts = [name]
  if (legalForm && !name.toLowerCase().includes(legalForm.toLowerCase())) titleParts.push(legalForm)
  const descParts = [
    isActive ? '✓ Aktywna' : 'Firma', legalForm,
    pkd?.desc ? `· ${pkd.desc}` : '', city ? `· ${city}` : '',
    voivodeship && voivodeship !== city ? `(${voivodeship})` : '',
    `· NIP ${nip}`, f.regon ? `· REGON ${f.regon}` : '',
    f.krs_number ? `· KRS ${f.krs_number}` : '',
  ].filter(Boolean).join(' ').slice(0, 160)
  return {
    title: `${titleParts.join(' — ')} | nipgo.pl`,
    description: descParts,
    keywords: [name, `NIP ${nip}`, f.regon ? `REGON ${f.regon}` : '', f.krs_number ? `KRS ${f.krs_number}` : '', legalForm, city, voivodeship, pkd?.desc ?? '', 'dane firmy', 'rejestr przedsiębiorców'].filter(Boolean).join(', '),
    alternates: { canonical: url },
    openGraph: { title: `${name} — NIP ${nip}`, description: descParts, url, siteName: 'nipgo.pl', locale: 'pl_PL', type: 'website', images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${name} — dane firmy na nipgo.pl` }] },
    twitter: { card: 'summary_large_image', title: `${name} — NIP ${nip}`, description: descParts, images: [ogImageUrl] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  }
}
export default async function FirmaPage({ params }: { params: Promise<{ nip: string }> }) {
  const { nip } = await params
  const [firma, vat] = await Promise.all([getFirma(nip), getVatStatus(nip)])
  if (!firma) notFound()
  const f = firma as any
  const status = ((f.status_gus || f.status_krs) ?? '').toLowerCase()
  const isActive = status.includes('aktywn')
  const adres = buildAdres(f)
  const jsonLdBlocks = buildJsonLd(f, nip)
  const vatStatus = vat?.status_vat || null
  const vatRisk = isActive && vatStatus !== null && !vatStatus.toLowerCase().includes('czynny')
  let accountNumbers: string[] = []
  if (vat?.account_numbers) {
    try {
      const parsed = typeof vat.account_numbers === 'string' ? JSON.parse(vat.account_numbers) : vat.account_numbers
      accountNumbers = Array.isArray(parsed) ? parsed : []
    } catch {}
  }
  const kontekst = await getKontekst(f)
  return (
    <>
      {jsonLdBlocks.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <FirmaView
        nip={f.nip || nip}
        name={f.nazwa_pelna || ''}
        regon={f.regon || ''}
        krs={f.krs_number || ''}
        statusKrs={f.status_krs || f.status_gus || ''}
        statusDodatkowy={f.status_dodatkowy || ''}
        status={isActive ? 'active' : 'inactive'}
        legalForm={f.forma_prawna || ''}
        formaWlasnosci={f.forma_wlasnosci_nazwa || f.forma_wlasnosci || ''}
        source={firma.zrodlo}
        rejestr={f.rejestr || ''}
        registrationDate={f.data_rozpoczecia || f.data_rejestracji || ''}
        dataZawieszenia={f.data_zawieszenia || ''}
        dataWznowienia={f.data_wznowienia || ''}
        dataZakonczenia={f.data_zakonczenia || ''}
        capital={f.kapital_zakladowy || ''}
        currency={f.waluta || 'PLN'}
        ostatnieSprRok={f.ostatnie_sprawozdanie_rok || null}
        celDzialania={f.cel_dzialania || ''}
        address={{
          street: f.ulica ? `ul. ${f.ulica.replace(/^ul\.\s*/i, '').replace(/^ulica\s*/i, '').trim()} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`.trim() : f.nr_budynku || '',
          city: f.miejscowosc || '', postalCode: f.kod_pocztowy || '',
          voivodeship: f.wojewodztwo || '', county: f.powiat || '',
          commune: f.gmina || '', full: f.adres_pelny || adres,
        }}
        contact={{
          phone: cleanContact(f.telefon), phoneMobile: cleanContact(f.telefon_komorkowy_premium),
          email: cleanContact(f.email), website: f.strona_www || f.strona_www_urzedowa || f.www || '',
          facebook: f.facebook_url || '', googleRating: f.google_rating || null,
        }}
        representationMethod={f.reprezentacja_sposob || ''}
        representatives={getZarzad(f)}
        prokurenci={getProkurenci(f)}
        radaNadzorcza={getRadaNadzorcza(f)}
        shareholders={getWspolnicy(f)}
        pkdCodes={getPkdCodes(f)}
        krsLink={f.link_do_wpisu || ''}
        ownerName={f.wlasciciel_imie ? `${f.wlasciciel_imie} ${f.wlasciciel_nazwisko || ''}`.trim() : ''}
        ownerGender={f.plec || null}
        ownerCitizenship={f.obywatelstwo || null}
        organRejestrowy={f.organ_rejestrowy || ''}
        liczbaPracownikow={f.liczba_pracownikow || ''}
        flagaRyzyka={f.flaga_ryzyka || false}
        flagaAktywaDotacja={f.flaga_aktywna_dotacja || false}
        czyNieruchomoscWlasna={f.czy_nieruchomosc_wlasna || false}
        sumaPomocyEur={f.suma_pomocy_eur || null}
        oddzialy={getOddzialy(f)}
        historiaPrzeksztalcen={getHistoriaPrzeksztalcen(f)}
        restrukturyzacja={f.restrukturyzacja_upadlosc ?? null}
        financialReports={getFinancialReports(f)}
        vatStatus={vatStatus}
        vatRisk={vatRisk}
        accountNumbers={accountNumbers}
        zakazyInfo={f.zakazy_info || null}
        uprawieniaInfo={f.uprawnienia_info || null}
        wspolnoscMajatkowa={f.wspolnosc_majatkowa ?? null}
        adresDoreczenia={f.adres_doreczenia || null}
        kontekst={kontekst}
      />
    </>
  )
}
