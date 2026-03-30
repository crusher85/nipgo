import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SearchResultItem = {
  nip: string | null
  nazwa_pelna: string | null
  forma_prawna: string | null
  miejscowosc: string | null
  wojewodztwo: string | null
  status: string | null
  adres_pelny: string | null
  zrodlo: 'CEIDG' | 'KRS'
}

const CEIDG_SELECT = 'nip,nazwa_pelna,forma_prawna,miejscowosc,wojewodztwo,status_gus,adres_pelny'
const KRS_SELECT = 'nip,nazwa_pelna,forma_prawna,miejscowosc,wojewodztwo,status_krs,adres_pelny'

function mapCeidgRow(row: Record<string, unknown>): SearchResultItem {
  return {
    nip: (row.nip as string | null) ?? null,
    nazwa_pelna: (row.nazwa_pelna as string | null) ?? null,
    forma_prawna: (row.forma_prawna as string | null) ?? null,
    miejscowosc: (row.miejscowosc as string | null) ?? null,
    wojewodztwo: (row.wojewodztwo as string | null) ?? null,
    status: (row.status_gus as string | null) ?? null,
    adres_pelny: (row.adres_pelny as string | null) ?? null,
    zrodlo: 'CEIDG',
  }
}

function mapKrsRow(row: Record<string, unknown>): SearchResultItem {
  return {
    nip: (row.nip as string | null) ?? null,
    nazwa_pelna: (row.nazwa_pelna as string | null) ?? null,
    forma_prawna: (row.forma_prawna as string | null) ?? null,
    miejscowosc: (row.miejscowosc as string | null) ?? null,
    wojewodztwo: (row.wojewodztwo as string | null) ?? null,
    status: (row.status_krs as string | null) ?? null,
    adres_pelny: (row.adres_pelny as string | null) ?? null,
    zrodlo: 'KRS',
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const miejscowosc = searchParams.get('miejscowosc')?.trim() ?? ''

  if (!q) {
    return NextResponse.json({ error: 'Brak parametru q' }, { status: 400 })
  }

  if (q.length > 100) {
    return NextResponse.json({ error: 'Parametr q jest za dlugi' }, { status: 400 })
  }

  try {
    if (/^\d{10}$/.test(q)) {
      const ceidg = await supabase
        .from('ceidg_firms')
        .select('nip')
        .eq('nip', q)
        .maybeSingle()

      if (ceidg.error) throw ceidg.error
      if (ceidg.data?.nip) {
        return NextResponse.json({ redirect: true, nip: ceidg.data.nip })
      }

      const krs = await supabase
        .from('krs_firms')
        .select('nip')
        .eq('nip', q)
        .maybeSingle()

      if (krs.error) throw krs.error
      if (krs.data?.nip) {
        return NextResponse.json({ redirect: true, nip: krs.data.nip })
      }

      return NextResponse.json({ redirect: false, results: [], total: 0 })
    }

    let ceidgQuery = supabase
      .from('ceidg_firms')
      .select(CEIDG_SELECT)
      .ilike('nazwa_pelna', `%${q}%`)
      .limit(10)

    let krsQuery = supabase
      .from('krs_firms')
      .select(KRS_SELECT)
      .ilike('nazwa_pelna', `%${q}%`)
      .limit(10)

    if (miejscowosc) {
      ceidgQuery = ceidgQuery.ilike('miejscowosc', `%${miejscowosc}%`)
      krsQuery = krsQuery.ilike('miejscowosc', `%${miejscowosc}%`)
    }

    const [ceidgRes, krsRes] = await Promise.all([ceidgQuery, krsQuery])
    if (ceidgRes.error) throw ceidgRes.error
    if (krsRes.error) throw krsRes.error

    const combined = [
      ...(ceidgRes.data ?? []).map((row) => mapCeidgRow(row as Record<string, unknown>)),
      ...(krsRes.data ?? []).map((row) => mapKrsRow(row as Record<string, unknown>)),
    ]

    if (combined.length === 1 && combined[0].nip) {
      return NextResponse.json({ redirect: true, nip: combined[0].nip })
    }

    return NextResponse.json({
      redirect: false,
      results: combined.slice(0, 10),
      total: combined.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 })
  }
}