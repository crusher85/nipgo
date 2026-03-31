import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHeader, BackNavigation } from "@/components/page-header"
import { CompanyHeader } from "@/components/company-header"
import { DataSection, DataRow, DataGrid } from "@/components/data-section"
import { SidebarActions } from "@/components/sidebar-actions"
import { RepresentativesTable } from "@/components/representatives-table"
import { ShareholdersList } from "@/components/shareholders-list"
import { PKDCodesList } from "@/components/pkd-codes-list"
import { Info, MapPin, Users, Briefcase, Scale, Calendar } from "lucide-react"

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

  const { data: krs, error: krsError } = await supabase
    .from('krs_firms')
    .select(`krs_number, nip, regon, nazwa_pelna, status_krs, forma_prawna,
      data_rejestracji, ulica, nr_budynku, kod_pocztowy,
      miejscowosc, gmina, powiat, wojewodztwo, adres_pelny,
      kapital_zakladowy, waluta, zarzad_sklad, reprezentacja_sposob,
      prokurenci, rada_nadzorcza, wspolnicy, pkd_lista,
      email, telefon, www`)
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

function buildAdres(f: any) {
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
    role: 'Zarzad', function: os.funkcjaWOrganie || '', since: '',
  }))
}

function getWspolnicy(f: any) {
  if (f.zrodlo !== 'KRS') return []
  const ws = f.wspolnicy as any[]
  if (!ws || !Array.isArray(ws)) return []
  return ws.map((w: any) => ({
    name: `${w.imiona?.imie || ''} ${w.nazwisko?.nazwiskoICzlon || ''}`.trim() || w.nazwa || '-',
    udzialy: w.posiadaneUdzialy || '',
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
  const pkdCodes = getPkdCodes(f)
  const zarzad = getZarzad(f)
  const wspolnicy = getWspolnicy(f)

  const companyData = {
    name: f.nazwa_pelna || '',
    nip: f.nip || nip,
    regon: f.regon || '',
    krs: f.krs_number || '',
    status: isActive ? 'active' as const : 'inactive' as const,
    legalForm: f.forma_prawna || '',
    address: {
      street: f.ulica ? `ul. ${f.ulica} ${f.nr_budynku || ''}` : f.nr_budynku || '',
      city: f.miejscowosc || '',
      postalCode: f.kod_pocztowy || '',
      country: 'Polska',
    },
    contact: {
      phone: f.telefon || '',
      email: f.email || '',
      website: f.strona_www || f.www || '',
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BackNavigation />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[70%] space-y-4">
            <CompanyHeader
              name={companyData.name}
              nip={companyData.nip}
              regon={companyData.regon}
              krs={companyData.krs}
              status={companyData.status}
              legalForm={companyData.legalForm}
            />
            <DataSection title="Dane podstawowe" icon={<Info className="h-4 w-4" />}>
              <DataGrid>
                <DataRow label="Pelna nazwa" value={f.nazwa_pelna} />
                {f.krs_number && <DataRow label="Numer KRS" value={f.krs_number} />}
                <DataRow label="NIP" value={f.nip} />
                <DataRow label="REGON" value={f.regon} />
                {f.forma_prawna && <DataRow label="Forma prawna" value={f.forma_prawna} />}
                {(f.data_rozpoczecia || f.data_rejestracji) && (
                  <DataRow label="Data rejestracji" value={f.data_rozpoczecia || f.data_rejestracji} />
                )}
                {firma.zrodlo === 'CEIDG' && f.wlasciciel_imie && (
                  <DataRow label="Wlasciciel" value={`${f.wlasciciel_imie} ${f.wlasciciel_nazwisko || ''}`} />
                )}
                {f.kapital_zakladowy && (
                  <DataRow label="Kapital zakladowy" value={`${Number(f.kapital_zakladowy).toLocaleString('pl-PL')} ${f.waluta || 'PLN'}`} />
                )}
              </DataGrid>
            </DataSection>
            {adres && (
              <DataSection title="Adres siedziby" icon={<MapPin className="h-4 w-4" />}>
                <DataGrid>
                  {f.ulica && <DataRow label="Ulica" value={`ul. ${f.ulica} ${f.nr_budynku || ''}${f.nr_lokalu ? '/' + f.nr_lokalu : ''}`} />}
                  {!f.ulica && f.nr_budynku && <DataRow label="Nr budynku" value={f.nr_budynku} />}
                  {f.kod_pocztowy && <DataRow label="Kod pocztowy" value={f.kod_pocztowy} />}
                  {f.miejscowosc && <DataRow label="Miejscowosc" value={f.miejscowosc} />}
                  {f.gmina && <DataRow label="Gmina" value={f.gmina} />}
                  {f.powiat && <DataRow label="Powiat" value={f.powiat} />}
                  {f.wojewodztwo && <DataRow label="Wojewodztwo" value={f.wojewodztwo} />}
                </DataGrid>
              </DataSection>
            )}
            {pkdCodes.length > 0 && (
              <DataSection title="Przedmiot dzialalnosci (PKD)" icon={<Briefcase className="h-4 w-4" />}>
                <PKDCodesList codes={pkdCodes} />
              </DataSection>
            )}
            {zarzad.length > 0 && (
              <DataSection title="Osoby reprezentujace" icon={<Users className="h-4 w-4" />}>
                <RepresentativesTable representatives={zarzad} />
              </DataSection>
            )}
            {wspolnicy.length > 0 && (
              <DataSection title="Wspolnicy / Akcjonariusze" icon={<Scale className="h-4 w-4" />}>
                <div className="space-y-2">
                  {wspolnicy.map((w, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium">{w.name}</span>
                      <span className="text-sm text-muted-foreground">{w.udzialy}</span>
                    </div>
                  ))}
                </div>
              </DataSection>
            )}
            {f.reprezentacja_sposob && (
              <DataSection title="Sposob reprezentacji" icon={<Calendar className="h-4 w-4" />}>
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  {f.reprezentacja_sposob}
                </p>
              </DataSection>
            )}
          </div>
          <aside className="lg:w-[30%]">
            <div className="lg:sticky lg:top-20">
              <SidebarActions
                companyName={companyData.name}
                address={companyData.address}
                contact={companyData.contact}
                krsLink={f.link_do_wpisu}
                adresPelny={f.adres_pelny || adres}
                zrodlo={firma.zrodlo}
              />
            </div>
          </aside>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground text-center">
            Dane pochodza z {firma.zrodlo === 'KRS' ? 'Krajowego Rejestru Sadowego' : 'Centralnej Ewidencji i Informacji o Dzialalnosci Gospodarczej'}.
            Informacje maja charakter pogladowy i nie stanowia oficjalnego odpisu z rejestru.
          </p>
        </div>
      </main>
    </div>
  )
}