import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const KOLUMNY_CEIDG = `
  nip, regon, nazwa_pelna, status_gus,
  forma_prawna, data_rozpoczecia,
  ulica, nr_budynku, kod_pocztowy, miejscowosc, wojewodztwo,
  pkd_glowne, adres_pelny
`

const KOLUMNY_KRS = `
  krs_number, nip, regon, nazwa_pelna, status_krs,
  forma_prawna, data_rejestracji,
  ulica, nr_budynku, kod_pocztowy, miejscowosc, wojewodztwo,
  adres_pelny
`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Za krotkie zapytanie' }, { status: 400 })
  }

  if (query.length > 100) {
    return NextResponse.json({ error: 'Zapytanie za dlugie' }, { status: 400 })
  }

  const isNip = /^\d{10}$/.test(query.replace(/-/g, ''))
  const cleanNip = query.replace(/-/g, '')

  try {
    let ceidgQuery = supabase
      .from('ceidg_firms')
      .select(KOLUMNY_CEIDG)
      .limit(20)

    let krsQuery = supabase
      .from('krs_firms')
      .select(KOLUMNY_KRS)
      .limit(20)

    if (isNip) {
      ceidgQuery = ceidgQuery.eq('nip', cleanNip)
      krsQuery = krsQuery.eq('nip', cleanNip)
    } else {
      ceidgQuery = ceidgQuery.ilike('nazwa_pelna', `%${query}%`)
      krsQuery = krsQuery.ilike('nazwa_pelna', `%${query}%`)
    }

    const [ceidg, krs] = await Promise.all([ceidgQuery, krsQuery])

    const wyniki = [
      ...(ceidg.data || []).map(f => ({ ...f, zrodlo: 'CEIDG' })),
      ...(krs.data || []).map(f => ({ ...f, zrodlo: 'KRS' })),
    ]

    return NextResponse.json({ wyniki, total: wyniki.length })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Blad serwera' }, { status: 500 })
  }
}