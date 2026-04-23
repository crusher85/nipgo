import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nip: string }> }
) {
  const { nip } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const clean = nip.replace(/-/g, '')
  let name = `NIP ${nip}`
  let city = ''
  let voivodeship = ''
  let legalForm = ''
  let isActive = false
  let source = ''
  let pkdDesc = ''
  let pkdCode = ''
  let regon = ''

  const { data: ceidg } = await supabase
    .from('ceidg_firms')
    .select('nazwa_pelna, miejscowosc, wojewodztwo, forma_prawna, status_gus, pkd_glowne, regon')
    .eq('nip', clean)
    .maybeSingle()

  if (ceidg) {
    name = ceidg.nazwa_pelna || name
    city = ceidg.miejscowosc || ''
    voivodeship = ceidg.wojewodztwo || ''
    legalForm = ceidg.forma_prawna || 'JDG'
    isActive = (ceidg.status_gus || '').toLowerCase().includes('aktywn')
    source = 'CEIDG'
    regon = ceidg.regon || ''
    if (ceidg.pkd_glowne) {
      const parts = ceidg.pkd_glowne.split('—')
      pkdCode = parts[0]?.trim() ?? ''
      pkdDesc = parts[1]?.trim() ?? ''
    }
  } else {
    const { data: krs } = await supabase
      .from('krs_firms')
      .select('nazwa_pelna, miejscowosc, wojewodztwo, forma_prawna, status_krs, pkd_lista, regon')
      .eq('nip', clean)
      .maybeSingle()

    if (krs) {
      name = krs.nazwa_pelna || name
      city = krs.miejscowosc || ''
      voivodeship = krs.wojewodztwo || ''
      legalForm = krs.forma_prawna || ''
      isActive = (krs.status_krs || '').toLowerCase().includes('aktywn')
      source = 'KRS'
      regon = krs.regon || ''
      try {
        const prev = (krs.pkd_lista as any)?.przedmiotPrzewazajacejDzialalnosci
        if (prev?.[0]) {
          pkdCode = `${prev[0].kodDzial}.${prev[0].kodKlasa}.${prev[0].kodPodklasa}`
          pkdDesc = prev[0].opis || ''
        }
      } catch {}
    }
  }

  // Nie skracaj nazwy — pozwól zawijać do 2 linii
  const nameFontSize = name.length > 50 ? 36 : name.length > 35 ? 42 : 50
  const displayPkd = pkdDesc
    ? (pkdDesc.charAt(0).toUpperCase() + pkdDesc.slice(1).toLowerCase()).slice(0, 65)
    : ''
  const locationStr = [city, voivodeship].filter(Boolean).join(', ')

  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}>
        {/* Lewa kolumna */}
        <div style={{
          width: '200px',
          height: '100%',
          background: '#2563eb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '44px 0',
          flexShrink: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '30px', fontWeight: 700, color: '#fff' }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Rejestr</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{source}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#4ade80' : '#f87171', display: 'flex' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{isActive ? 'Aktywna' : 'Nieaktywna'}</span>
            </div>
          </div>

          {/* nipgo logo na dole */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.04em', color: '#fff' }}>nipgo</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>nipgo.pl</span>
          </div>
        </div>

        {/* Prawa strona */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 56px',
          background: '#ffffff',
        }}>

          {/* Góra — forma prawna + NIP */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {legalForm ? (
              <span style={{
                fontSize: '12px', fontWeight: 600, color: '#6b7280',
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                padding: '5px 14px', borderRadius: '6px',
              }}>{legalForm}</span>
            ) : <div style={{ display: 'flex' }} />}
            <span style={{ fontSize: '13px', color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
              NIP {nip}
            </span>
          </div>

          {/* Środek — nazwa firmy (główny element) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              fontSize: `${nameFontSize}px`,
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              display: 'flex',
              flexWrap: 'wrap',
            }}>
              {name}
            </div>
            {displayPkd ? (
              <div style={{ fontSize: '17px', color: '#6b7280', display: 'flex', letterSpacing: '-0.01em' }}>
                {displayPkd}
              </div>
            ) : null}
          </div>

          {/* Dół — lokalizacja + REGON */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              {locationStr ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Siedziba</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{locationStr}</span>
                </div>
              ) : null}
              {regon ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>REGON</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{regon}</span>
                </div>
              ) : null}
              {pkdCode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PKD</span>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{pkdCode}</span>
                </div>
              ) : null}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isActive ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '100px',
              padding: '6px 16px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#22c55e' : '#ef4444', display: 'flex' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#15803d' : '#dc2626' }}>
                {isActive ? 'Aktywna' : 'Nieaktywna'}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
