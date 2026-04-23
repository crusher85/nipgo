// ============================================================
// FREE FLOW — 4 emaile
// Cel: FOMO → use case → social proof → last chance upgrade
// ============================================================

const BASE_STYLE = {
  body: `margin:0;padding:0;background:#f0f2f5;font-family:'DM Sans',Helvetica,Arial,sans-serif;`,
  wrapper: `background:#f0f2f5;padding:48px 20px;`,
  card: `background:#ffffff;border-radius:20px;border:1px solid #e3e6ea;overflow:hidden;max-width:580px;margin:0 auto;`,
  header: `padding:28px 40px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;`,
  body_pad: `padding:40px 40px 32px;`,
  footer_pad: `padding:20px 40px 28px;border-top:1px solid #f3f4f6;background:#f8f9fb;`,
}

function logo() {
  return `<span style="font-size:19px;font-weight:700;letter-spacing:-0.04em;color:#111;">nipgo</span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#2563eb;margin-left:2px;vertical-align:middle;margin-bottom:2px;"></span>`
}

function cta(label: string, url: string, style?: string) {
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;${style || ''}">${label}</a>`
}

function footer() {
  return `<p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;line-height:1.7;">
    Pytania? <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a><br/>
    nipgo.pl · AuraData · Poznań, Polska<br/>
    <a href="https://nipgo.pl/unsubscribe" style="color:#c4c9d4;text-decoration:none;font-size:11px;">Wypisz się z maili</a>
  </p>`
}

// ────────────────────────────────────────────────────────────
// FREE — DZIEŃ 1: Witamy + pokaż co możesz (i co tracisz)
// ────────────────────────────────────────────────────────────
export function Free_Day1_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Witaj w nipgo.pl</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <!-- Header -->
  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <!-- Body -->
  <tr><td style="${BASE_STYLE.body_pad}">

    <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.2;">
      ${firstName ? `${firstName}, jesteś` : 'Jesteś'} w środku. 🎉
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;line-height:1.65;">
      Masz teraz dostęp do ponad <strong style="color:#111;">1,5 miliona firm</strong> z KRS i CEIDG — bez logowania, bez ukrytych opłat. Oto co możesz zrobić już teraz:
    </p>

    <!-- Co możesz -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        { icon: '🔍', text: '<strong>Szukaj po PKD i mieście</strong> — np. wszystkie drukarnie w Poznaniu' },
        { icon: '📋', text: '<strong>Sprawdź dowolną firmę</strong> — status KRS, forma prawna, adres, PKD' },
        { icon: '✅', text: '<strong>Weryfikuj kontrahentów</strong> — status VAT widoczny na karcie firmy' },
      ].map(r => `<tr><td style="padding:0 0 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #eaecef;border-radius:10px;">
          <tr>
            <td style="padding:12px 14px;width:36px;font-size:18px;vertical-align:top;">${r.icon}</td>
            <td style="padding:12px 14px 12px 0;font-size:14px;color:#374151;line-height:1.5;">${r.text}</td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Separator -->
    <div style="border-top:1px dashed #e3e6ea;margin:28px 0;"></div>

    <!-- FOMO blok -->
    <p style="font-size:13px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#9ca3af;margin:0 0 14px;">Na planie Free nie zobaczysz:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        'Telefonów i emaili firm — widoczne jako ████████',
        'Eksportu listy wyników do CSV (Excel)',
        'Monitorowania firm i alertów o zmianach',
        'Więcej niż 10 wyników wyszukiwania',
      ].map(t => `<tr><td style="padding:0 0 8px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:20px;font-size:13px;color:#ef4444;vertical-align:top;padding-top:1px;">✕</td>
          <td style="font-size:13px;color:#6b7280;line-height:1.5;">${t}</td>
        </tr></table>
      </td></tr>`).join('')}
    </table>

    <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;">
      Plan Basic kosztuje <strong style="color:#111;">59 zł/mies</strong> i odblokowuje wszystko powyżej. Pierwsze 7 dni gratis — możesz anulować w każdej chwili.
    </p>

    <div style="text-align:left;">
      ${cta('Zacznij 7-dniowy trial Basic →', 'https://nipgo.pl/cennik')}
      <span style="display:inline-block;margin-left:14px;font-size:12px;color:#9ca3af;vertical-align:middle;">lub <a href="https://nipgo.pl/search" style="color:#2563eb;text-decoration:none;">przeglądaj za darmo</a></span>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Free_Day1_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, jesteś` : 'Jesteś'} w środku!

Masz dostęp do 1,5 miliona firm z KRS i CEIDG. Oto co możesz teraz:
→ Szukaj po PKD i mieście
→ Sprawdź status KRS i VAT dowolnej firmy
→ Weryfikuj kontrahentów

Na planie Free NIE zobaczysz:
✕ Telefonów i emaili firm
✕ Eksportu CSV
✕ Monitorowania firm i alertów
✕ Więcej niż 10 wyników

Plan Basic — 59 zł/mies, 7 dni gratis:
https://nipgo.pl/cennik

Pytania? hello@nipgo.pl
nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// FREE — DZIEŃ 3: Konkretny use case + CTA upgrade
// ────────────────────────────────────────────────────────────
export function Free_Day3_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Wyobraź sobie...</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;margin:0 0 10px;">Wyobraź sobie</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      Poniedziałek rano, 8:15.${firstName ? `<br/>${firstName} otwiera laptop.` : ''}
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      Wpisuje w nipgo.pl: <em style="color:#111;">"firmy budowlane, Wielkopolska, aktywne"</em>.<br/>
      W 3 sekundy widzi 847 firm. Filtruje po kapitale powyżej 500k. Zostaje 94.<br/>
      Klika eksport. Pobiera CSV. Otwiera w Excelu. Ma gotową listę do dzwonienia.
    </p>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      Jego konkurencja spędzi na tym <strong style="color:#111;">3 godziny</strong> i kilka różnych stron.<br/>
      On skończy w 4 minuty.
    </p>

    <!-- Highlight box -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <p style="font-size:14px;font-weight:600;color:#1d4ed8;margin:0 0 6px;">To nie fikcja — to nipgo.pl Basic.</p>
      <p style="font-size:13px;color:#3b82f6;margin:0;line-height:1.6;">
        Eksport CSV · Dane kontaktowe · Zaawansowane filtry · Monitoring 20 firm
      </p>
    </div>

    <!-- Cena -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="font-size:13px;color:#9ca3af;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Plan Basic</p>
          <p style="font-size:28px;font-weight:700;color:#111;margin:0 0 2px;letter-spacing:-0.03em;">59 zł<span style="font-size:15px;font-weight:400;color:#9ca3af;">/mies</span></p>
          <p style="font-size:13px;color:#22c55e;margin:0;font-weight:600;">✓ Pierwsze 7 dni bezpłatnie</p>
        </td>
      </tr>
    </table>

    ${cta('Odblokuj Basic — zacznij za darmo →', 'https://nipgo.pl/cennik')}
    <p style="font-size:12px;color:#9ca3af;margin:14px 0 0;">Anulujesz kiedy chcesz. Bez zobowiązań.</p>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Free_Day3_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `Wyobraź sobie poniedziałek rano, 8:15.
${firstName ? `${firstName} otwiera laptop.` : ''}

Wpisuje: "firmy budowlane, Wielkopolska, aktywne".
3 sekundy → 847 firm. Filtruje po kapitale. Zostaje 94.
Klika eksport. Ma CSV. Otwiera w Excelu.
Gotowa lista do dzwonienia — w 4 minuty.

Jego konkurencja spędzi na tym 3 godziny.

To jest nipgo.pl Basic — 59 zł/mies, 7 dni gratis.

→ https://nipgo.pl/cennik

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// FREE — DZIEŃ 7: "Co robią użytkownicy Basic" + liczby
// ────────────────────────────────────────────────────────────
export function Free_Day7_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Co robią inni użytkownicy nipgo</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin:0 0 10px;">Minął tydzień</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, w` : 'W'} tym czasie użytkownicy Basic zrobili to:
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;line-height:1.65;">
      Mamy dostęp do danych. Oto jak naprawdę używają nipgo.pl ci, którzy płacą.
    </p>

    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        { num: '1 000', label: 'rekordów eksportują tygodniowo do CRM i Excela' },
        { num: '20 firm', label: 'monitorują na bieżąco — alert gdy coś się zmienia w KRS' },
        { num: '< 5 min', label: 'tyle zajmuje zbudowanie listy 100 leadów z filtrami' },
      ].map(s => `<tr><td style="padding:0 0 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;width:90px;vertical-align:middle;">
              <span style="font-size:22px;font-weight:700;color:#2563eb;letter-spacing:-0.03em;">${s.num}</span>
            </td>
            <td style="padding:16px 20px 16px 0;font-size:13px;color:#6b7280;line-height:1.5;border-left:1px solid #e3e6ea;">${s.label}</td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Separator -->
    <div style="border-top:1px dashed #e3e6ea;margin:0 0 28px;"></div>

    <p style="font-size:15px;color:#374151;margin:0 0 8px;line-height:1.6;">
      Na Twoim planie Free widzisz <strong style="color:#111;">maksymalnie 10 wyników</strong> i nie możesz pobrać żadnego kontaktu.
    </p>
    <p style="font-size:15px;color:#374151;margin:0 0 28px;line-height:1.6;">
      Jedna lista 100 firm może przynieść Ci nowych klientów. Basic kosztuje mniej niż jedna kawa dziennie.
    </p>

    ${cta('Przejdź na Basic — 59 zł/mies →', 'https://nipgo.pl/cennik')}
    <p style="font-size:12px;color:#9ca3af;margin:14px 0 0;">7 dni bezpłatnego trialu. Anulujesz kiedy chcesz.</p>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Free_Day7_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, minął` : 'Minął'} tydzień.

W tym czasie użytkownicy Basic:
→ Eksportują 1 000+ rekordów tygodniowo do CRM
→ Monitorują 20 firm — alert gdy coś się zmienia w KRS
→ Budują listę 100 leadów w < 5 minut

Ty na Free widzisz max 10 wyników i zero kontaktów.

Jedna lista 100 firm może przynieść Ci nowych klientów.
Basic kosztuje 59 zł/mies — mniej niż kawa dziennie.

→ https://nipgo.pl/cennik (7 dni gratis)

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// FREE — DZIEŃ 14: Ostatnia szansa / bezpośrednie pytanie
// ────────────────────────────────────────────────────────────
export function Free_Day14_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Szczere pytanie</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, mam` : 'Mam'} do Ciebie szczere pytanie.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 20px;line-height:1.65;">
      Jesteś z nami już 2 tygodnie i nadal korzystasz z planu Free. To jest OK — Free jest po to żeby sprawdzić czy nipgo.pl w ogóle ma sens dla Ciebie.
    </p>
    <p style="font-size:15px;color:#374151;margin:0 0 28px;line-height:1.65;">
      Ale chcę wiedzieć — <strong style="color:#111;">co Ci stoi na przeszkodzie?</strong>
    </p>

    <!-- Options -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        { label: 'Nie potrzebuję eksportu ani kontaktów', href: 'mailto:hello@nipgo.pl?subject=Free%20feedback&body=Nie%20potrzebuje%20eksportu' },
        { label: 'Za drogo — nie mam budżetu teraz', href: 'mailto:hello@nipgo.pl?subject=Free%20feedback&body=Za%20drogo' },
        { label: 'Nie wiem czy mi się przyda', href: 'mailto:hello@nipgo.pl?subject=Free%20feedback&body=Nie%20wiem%20czy%20sie%20przyda' },
        { label: 'Brakuje mi funkcji której potrzebuję', href: 'mailto:hello@nipgo.pl?subject=Free%20feedback&body=Brakuje%20mi%20funkcji' },
      ].map(o => `<tr><td style="padding:0 0 8px;">
        <a href="${o.href}" style="display:block;padding:13px 16px;background:#f8f9fb;border:1px solid #e3e6ea;border-radius:10px;font-size:13px;color:#374151;text-decoration:none;font-weight:500;">
          → ${o.label}
        </a>
      </td></tr>`).join('')}
    </table>

    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Kliknięcie w odpowiedź wysyła mi emaila — odpisuję osobiście. Naprawdę.<br/>
      <span style="font-size:13px;color:#9ca3af;">— Paweł, nipgo.pl</span>
    </p>

    <!-- Separator -->
    <div style="border-top:1px dashed #e3e6ea;margin:0 0 24px;"></div>

    <p style="font-size:14px;color:#374151;margin:0 0 20px;line-height:1.6;">
      Jeśli po prostu nie byłeś gotowy — oto Basic z rabatem <strong style="color:#2563eb;">−10%</strong> na pierwszy miesiąc:
    </p>
    ${cta('Zacznij Basic za 53 zł →', 'https://nipgo.pl/cennik?promo=WELCOME10')}
    <p style="font-size:11px;color:#9ca3af;margin:12px 0 0;">Kod WELCOME10 · ważny 48h · bez zobowiązań</p>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Free_Day14_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, mam` : 'Mam'} do Ciebie szczere pytanie.

Jesteś z nami 2 tygodnie i nadal korzystasz z Free. To OK.
Ale chcę wiedzieć — co Ci stoi na przeszkodzie?

Odpisz na tego maila i napisz:
→ Nie potrzebuję eksportu ani kontaktów
→ Za drogo
→ Nie wiem czy mi się przyda
→ Brakuje mi funkcji której potrzebuję

Odpisuję osobiście. — Paweł, nipgo.pl

Jeśli po prostu nie byłeś gotowy — masz −10% na pierwszy miesiąc:
https://nipgo.pl/cennik?promo=WELCOME10
(kod WELCOME10 · ważny 48h)

nipgo.pl`
}
