import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://nipgo.pl'
const PAGE_SIZE = 50000

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function generateSitemaps() {
  const supabase = getSupabase()

  const [
    { count: krsActive },
    { count: ceidgTotal },
    { count: krsInactive },
  ] = await Promise.all([
    supabase.from('krs_firms').select('*', { count: 'exact', head: true }).not('nip', 'is', null).ilike('status_krs', '%aktywn%'),
    supabase.from('ceidg_firms').select('*', { count: 'exact', head: true }).not('nip', 'is', null),
    supabase.from('krs_firms').select('*', { count: 'exact', head: true }).not('nip', 'is', null).not('status_krs', 'ilike', '%aktywn%'),
  ])

  const krsActivePages  = Math.ceil((krsActive  ?? 0) / PAGE_SIZE)
  const ceidgPages      = Math.ceil((ceidgTotal ?? 0) / PAGE_SIZE)
  const krsInactivePages = Math.ceil((krsInactive ?? 0) / PAGE_SIZE)
  const total = krsActivePages + ceidgPages + krsInactivePages

  return Array.from({ length: Math.max(total, 1) }, (_, i) => ({ id: i }))
}

export default async function sitemap(
  { id }: { id: number }
): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase()

  // Policz granice segmentów dynamicznie
  const [{ count: krsActive }, { count: ceidgTotal }] = await Promise.all([
    supabase.from('krs_firms').select('*', { count: 'exact', head: true }).not('nip', 'is', null).ilike('status_krs', '%aktywn%'),
    supabase.from('ceidg_firms').select('*', { count: 'exact', head: true }).not('nip', 'is', null),
  ])

  const krsActivePages = Math.ceil((krsActive  ?? 0) / PAGE_SIZE)
  const ceidgPages     = Math.ceil((ceidgTotal ?? 0) / PAGE_SIZE)

  let rows: { nip: string; updated_at: string | null; status: string | null }[] = []

  if (id < krsActivePages) {
    // Segment 1: aktywne KRS (najwyższy priorytet SEO)
    const { data } = await supabase
      .from('krs_firms')
      .select('nip, updated_at, status_krs')
      .not('nip', 'is', null)
      .ilike('status_krs', '%aktywn%')
      .range(id * PAGE_SIZE, id * PAGE_SIZE + PAGE_SIZE - 1)
      .order('updated_at', { ascending: false })

    rows = (data ?? []).map(r => ({ nip: r.nip, updated_at: r.updated_at, status: r.status_krs }))

  } else if (id < krsActivePages + ceidgPages) {
    // Segment 2: CEIDG (rośnie do 2.3M)
    const offset = (id - krsActivePages) * PAGE_SIZE
    const { data } = await supabase
      .from('ceidg_firms')
      .select('nip, updated_at, status_gus')
      .not('nip', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1)
      .order('updated_at', { ascending: false })

    rows = (data ?? []).map(r => ({ nip: r.nip, updated_at: r.updated_at, status: r.status_gus }))

  } else {
    // Segment 3: nieaktywne KRS (najniższy priorytet)
    const offset = (id - krsActivePages - ceidgPages) * PAGE_SIZE
    const { data } = await supabase
      .from('krs_firms')
      .select('nip, updated_at, status_krs')
      .not('nip', 'is', null)
      .not('status_krs', 'ilike', '%aktywn%')
      .range(offset, offset + PAGE_SIZE - 1)
      .order('updated_at', { ascending: false })

    rows = (data ?? []).map(r => ({ nip: r.nip, updated_at: r.updated_at, status: r.status_krs }))
  }

  return rows
    .filter(r => r.nip)
    .map(r => {
      const isActive = (r.status ?? '').toLowerCase().includes('aktywn')
      return {
        url: `${BASE_URL}/firma/${r.nip}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
        changeFrequency: isActive ? ('weekly' as const) : ('monthly' as const),
        priority: isActive ? 0.8 : 0.4,
      }
    })
}
