import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Rate limiting ─────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60        // requestów
const RATE_WINDOW = 60_000   // na minutę (ms)

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Czyszczenie starych wpisów co jakiś czas (zapobiega memory leak)
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}, 5 * 60_000)

// ── Types ─────────────────────────────────────────────────────────────────────

type SearchResultItem = {
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
  zrodlo: 'CEIDG' | 'KRS'
  telefon?: string | null
  email?: string | null
}

const CEIDG_SELECT = 'nip,nazwa_pelna,forma_prawna,miejscowosc,wojewodztwo,status_gus,adres_pelny,pkd_glowne,strona_www,data_rozpoczecia,telefon,email'
const KRS_SELECT   = 'nip,krs_number,nazwa_pelna,forma_prawna,miejscowosc,wojewodztwo,status_krs,adres_pelny,pkd_glowne,www,data_rejestracji,email'

// ── Static lookup lists ───────────────────────────────────────────────────────

const WOJEWODZTWA = [
  'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie',
  'małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie',
  'pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie',
  'wielkopolskie','zachodniopomorskie',
]

const MIASTA = [
  'warszawa','kraków','łódź','wrocław','poznań','gdańsk','szczecin',
  'bydgoszcz','lublin','katowice','białystok','gdynia','częstochowa',
  'radom','sosnowiec','toruń','kielce','rzeszów','gliwice','zabrze',
  'bytom','bielsko-biała','olsztyn','zielona góra','rybnik','ruda śląska',
  'opole','tychy','gorzów wielkopolski','dąbrowa górnicza','elbląg',
  'płock','wałbrzych','włocławek','tarnów','chorzów','koszalin','kalisz',
  'legnica','grudziądz','jaworzno','słupsk','jastrzębie-zdrój','nowy sącz',
  'jelenia góra','siedlce','konin','mysłowice','piła','inowrocław',
  'lubin','ostrów wielkopolski','suwałki','gniezno','leszno','zamość',
  'kędzierzyn-koźle','przemyśl','nowy targ','tarnowskie góry','żory',
  'wodzisław śląski','będzin','stargard','piotrków trybunalski','głogów',
  'ostrowiec świętokrzyski','siemianowice śląskie','zgierz','ostrów mazowiecka',
]

// ── Query type detection ──────────────────────────────────────────────────────

type DetectedType =
  | { type: 'wojewodztwo'; value: string }
  | { type: 'miejscowosc'; value: string }
  | { type: 'telefon'; value: string }
  | { type: 'email'; value: string }
  | { type: 'kod_pocztowy'; value: string }
  | { type: 'domena'; value: string }
  | { type: 'imie_nazwisko'; value: string }
  | null

function detectQueryType(q: string): DetectedType {
  const norm = q.toLowerCase().trim()
  if (WOJEWODZTWA.includes(norm)) return { type: 'wojewodztwo', value: q.trim() }
  if (MIASTA.includes(norm)) return { type: 'miejscowosc', value: q.trim() }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return { type: 'email', value: norm }
  if (/^\d{2}-\d{3}$/.test(q.trim())) return { type: 'kod_pocztowy', value: q.trim() }
  const digitsOnly = q.replace(/[\s\-\(\)]/g, '')
  if (/^\+?48?\d{9}$/.test(digitsOnly) || /^\d{9}$/.test(digitsOnly)) {
    return { type: 'telefon', value: digitsOnly.replace(/^\+?48/, '') }
  }
  if (/^[a-z0-9\-]+\.[a-z]{2,6}$/.test(norm) && !norm.includes(' ')) {
    return { type: 'domena', value: norm }
  }
  const words = q.trim().split(/\s+/)
  if (words.length === 2 && words.every(w => /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\-]{1,}$/.test(w))) {
    return { type: 'imie_nazwisko', value: q.trim() }
  }
  return null
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapCeidgRow(row: Record<string, unknown>): SearchResultItem {
  return {
    nip:          (row.nip           as string | null) ?? null,
    krs_number:   null,
    nazwa_pelna:  (row.nazwa_pelna   as string | null) ?? null,
    forma_prawna: (row.forma_prawna  as string | null) ?? null,
    miejscowosc:  (row.miejscowosc   as string | null) ?? null,
    wojewodztwo:  (row.wojewodztwo   as string | null) ?? null,
    status:       (row.status_gus    as string | null) ?? null,
    adres_pelny:  (row.adres_pelny   as string | null) ?? null,
    pkd_glowne:   (row.pkd_glowne    as string | null) ?? null,
    www:          (row.strona_www    as string | null) ?? null,
    data_rejestracji: (row.data_rozpoczecia as string | null) ?? null,
    telefon:      (row.telefon       as string | null) ?? null,
    email:        (row.email         as string | null) ?? null,
    zrodlo: 'CEIDG',
  }
}

function mapKrsRow(row: Record<string, unknown>): SearchResultItem {
  return {
    nip:          (row.nip           as string | null) ?? null,
    krs_number:   (row.krs_number    as string | null) ?? null,
    nazwa_pelna:  (row.nazwa_pelna   as string | null) ?? null,
    forma_prawna: (row.forma_prawna  as string | null) ?? null,
    miejscowosc:  (row.miejscowosc   as string | null) ?? null,
    wojewodztwo:  (row.wojewodztwo   as string | null) ?? null,
    status:       (row.status_krs    as string | null) ?? null,
    adres_pelny:  (row.adres_pelny   as string | null) ?? null,
    pkd_glowne:   (row.pkd_glowne    as string | null) ?? null,
    www:          (row.www           as string | null) ?? null,
    data_rejestracji: (row.data_rejestracji as string | null) ?? null,
    telefon:      null,
    email:        (row.email         as string | null) ?? null,
    zrodlo: 'KRS',
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('cf-connecting-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Zbyt wiele zapytań. Spróbuj za chwilę.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const { searchParams } = new URL(request.url)
  let q             = searchParams.get('q')?.trim()           ?? ''
  let wojewodztwo   = searchParams.get('wojewodztwo')?.trim() ?? ''
  let miejscowosc   = searchParams.get('miejscowosc')?.trim() ?? ''
  const zrodlo      = searchParams.get('zrodlo')?.trim()      ?? ''
  const status      = searchParams.get('status')?.trim()      ?? ''
  const pkd         = searchParams.get('pkd')?.trim()         ?? ''
  const formaP      = searchParams.get('forma')?.trim()       ?? ''
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit       = 25
  const offset      = (page - 1) * limit

  if (!q && !miejscowosc && !wojewodztwo && !pkd && !formaP) {
    return NextResponse.json({ error: 'Podaj frazę lub wybierz filtry' }, { status: 400 })
  }
  if (q.length > 100) {
    return NextResponse.json({ error: 'Parametr q jest za długi' }, { status: 400 })
  }

  // ── NIP (10 cyfr) ─────────────────────────────────────────────────────────
  if (/^\d{10}$/.test(q)) {
    const [c, k] = await Promise.all([
      supabase.from('ceidg_firms').select('nip').eq('nip', q).maybeSingle(),
      supabase.from('krs_firms').select('nip').eq('nip', q).maybeSingle(),
    ])
    const nip = c.data?.nip ?? k.data?.nip
    if (nip) return NextResponse.json({ redirect: true, nip })
    return NextResponse.json({ redirect: false, results: [], total: 0, page: 1, pages: 0, detectedType: null })
  }

  // ── REGON (9 cyfr) ────────────────────────────────────────────────────────
  if (/^\d{9}$/.test(q)) {
    const [c, k] = await Promise.all([
      supabase.from('ceidg_firms').select('nip').eq('regon', q).maybeSingle(),
      supabase.from('krs_firms').select('nip').eq('regon', q).maybeSingle(),
    ])
    const nip = c.data?.nip ?? k.data?.nip
    if (nip) return NextResponse.json({ redirect: true, nip })
  }

  // ── KRS (7-8 lub 10 cyfr, nie 9) ─────────────────────────────────────────
  if (/^\d{7,10}$/.test(q) && q.length !== 9 && zrodlo !== 'CEIDG') {
    const padded = q.padStart(10, '0')
    const k = await supabase.from('krs_firms').select('nip').eq('krs_number', padded).maybeSingle()
    if (k.data?.nip) return NextResponse.json({ redirect: true, nip: k.data.nip })
  }

  // ── Smart detection ───────────────────────────────────────────────────────
  let detectedType: DetectedType = null
  if (q && !miejscowosc && !wojewodztwo) {
    detectedType = detectQueryType(q)
  }

  try {
    if (detectedType?.type === 'wojewodztwo') { wojewodztwo = detectedType.value; q = '' }
    if (detectedType?.type === 'miejscowosc') { miejscowosc = detectedType.value; q = '' }

    if (detectedType?.type === 'email') {
      const [c, k] = await Promise.all([
        supabase.from('ceidg_firms').select(CEIDG_SELECT).ilike('email', detectedType.value).range(0, limit - 1),
        supabase.from('krs_firms').select(KRS_SELECT).ilike('email', detectedType.value).range(0, limit - 1),
      ])
      const results = [
        ...(c.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>)),
        ...(k.data ?? []).map(r => mapKrsRow(r as Record<string, unknown>)),
      ]
      if (results.length === 1 && results[0].nip) return NextResponse.json({ redirect: true, nip: results[0].nip })
      return NextResponse.json({ redirect: false, results, total: results.length, page: 1, pages: 1, detectedType })
    }

    if (detectedType?.type === 'telefon') {
      const tel = detectedType.value
      const c = await supabase.from('ceidg_firms').select(CEIDG_SELECT).or(`telefon.ilike.%${tel}%`).range(0, limit - 1)
      const results = (c.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>))
      if (results.length === 1 && results[0].nip) return NextResponse.json({ redirect: true, nip: results[0].nip })
      return NextResponse.json({ redirect: false, results, total: results.length, page: 1, pages: 1, detectedType })
    }

    if (detectedType?.type === 'kod_pocztowy') {
      const kod = detectedType.value
      const [c, k] = await Promise.all([
        supabase.from('ceidg_firms').select(CEIDG_SELECT).eq('kod_pocztowy', kod).range(offset, offset + limit - 1),
        supabase.from('krs_firms').select(KRS_SELECT).eq('kod_pocztowy', kod).range(offset, offset + limit - 1),
      ])
      const results = [
        ...(c.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>)),
        ...(k.data ?? []).map(r => mapKrsRow(r as Record<string, unknown>)),
      ].slice(0, limit)
      return NextResponse.json({ redirect: false, results, total: results.length, page: 1, pages: 1, detectedType })
    }

    if (detectedType?.type === 'domena') {
      const dom = detectedType.value
      const [c, k] = await Promise.all([
        supabase.from('ceidg_firms').select(CEIDG_SELECT).ilike('strona_www', `%${dom}%`).range(0, limit - 1),
        supabase.from('krs_firms').select(KRS_SELECT).ilike('www', `%${dom}%`).range(0, limit - 1),
      ])
      const results = [
        ...(c.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>)),
        ...(k.data ?? []).map(r => mapKrsRow(r as Record<string, unknown>)),
      ]
      if (results.length === 1 && results[0].nip) return NextResponse.json({ redirect: true, nip: results[0].nip })
      return NextResponse.json({ redirect: false, results, total: results.length, page: 1, pages: 1, detectedType })
    }

    if (detectedType?.type === 'imie_nazwisko') {
      const parts = detectedType.value.split(' ')
      const c = await supabase.from('ceidg_firms').select(CEIDG_SELECT)
        .ilike('wlasciciel_imie', `${parts[0]}%`)
        .ilike('wlasciciel_nazwisko', `${parts[1]}%`)
        .range(offset, offset + limit - 1)
      const results = (c.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>))
      if (results.length === 1 && results[0].nip) return NextResponse.json({ redirect: true, nip: results[0].nip })
      return NextResponse.json({ redirect: false, results, total: results.length, page: 1, pages: 1, detectedType })
    }

    // ── Standardowe wyszukiwanie ──────────────────────────────────────────────

    const runCeidg = zrodlo !== 'KRS'
    const runKrs   = zrodlo !== 'CEIDG'
    let ceidgResults: SearchResultItem[] = []
    let krsResults:   SearchResultItem[] = []
    let ceidgTotal = 0
    let krsTotal   = 0

    const pkdCeidg = pkd.replace(/\./g, '')
    const pkdKrs   = pkd.length === 5
      ? pkd.replace(/^(\d{2})(\d{2})([A-Z])$/, '$1.$2.$3')
      : pkd

    if (runCeidg) {
      let q2 = supabase.from('ceidg_firms').select(CEIDG_SELECT)
      if (q) q2 = q2.textSearch('nazwa_pelna',
        q.split(/\s+/).filter(Boolean).map(w => `${w}:*`).join(' & '),
        { type: 'websearch', config: 'simple' }
      )
      if (wojewodztwo) q2 = q2.ilike('wojewodztwo', `%${wojewodztwo}%`)
      if (miejscowosc) q2 = q2.ilike('miejscowosc', `%${miejscowosc}%`)
      if (status === 'aktywne') q2 = q2.eq('status_gus', 'AKTYWNY')
      if (pkd) q2 = q2.ilike('pkd_glowne', `${pkdCeidg}%`)
      if (formaP) q2 = q2.ilike('forma_prawna', `%${formaP}%`)
      q2 = q2.range(offset, offset + limit - 1)
      const res = await q2
      if (res.error) throw res.error
      ceidgResults = (res.data ?? []).map(r => mapCeidgRow(r as Record<string, unknown>))
      ceidgTotal   = ceidgResults.length
    }

    if (runKrs) {
      let q2 = supabase.from('krs_firms').select(KRS_SELECT)
      if (q) q2 = q2.textSearch('nazwa_pelna',
        q.split(/\s+/).filter(Boolean).map(w => `${w}:*`).join(' & '),
        { type: 'websearch', config: 'simple' }
      )
      if (wojewodztwo) q2 = q2.ilike('wojewodztwo', `%${wojewodztwo}%`)
      if (miejscowosc) q2 = q2.ilike('miejscowosc', `%${miejscowosc}%`)
      if (status === 'aktywne') q2 = q2.ilike('status_krs', '%aktywn%')
      if (pkd) q2 = q2.ilike('pkd_glowne', `${pkdKrs}%`)
      if (formaP) q2 = q2.ilike('forma_prawna', `%${formaP}%`)
      q2 = q2.range(offset, offset + limit - 1)
      const res = await q2
      if (res.error) throw res.error
      krsResults = (res.data ?? []).map(r => mapKrsRow(r as Record<string, unknown>))
      krsTotal   = krsResults.length
    }

    const combined = [...ceidgResults, ...krsResults].slice(0, limit)
    const total    = ceidgTotal + krsTotal

    if (combined.length === 1 && combined[0].nip && !miejscowosc && !pkd && !formaP) {
      return NextResponse.json({ redirect: true, nip: combined[0].nip })
    }

    return NextResponse.json({
      redirect: false,
      results: combined,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      detectedType,
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
