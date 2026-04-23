// ============================================================
// BASIC FLOW — 4 emaile
// Cel: dobry wybór → jak używać eksportu → monitoring → Pro teaser
// ============================================================

const BASE_STYLE = {
  body: `margin:0;padding:0;background:#f0f2f5;font-family:'DM Sans',Helvetica,Arial,sans-serif;`,
  wrapper: `background:#f0f2f5;padding:48px 20px;`,
  card: `background:#ffffff;border-radius:20px;border:1px solid #e3e6ea;overflow:hidden;max-width:580px;margin:0 auto;`,
  header: `padding:28px 40px 24px;border-bottom:1px solid #f3f4f6;`,
  body_pad: `padding:40px 40px 32px;`,
  footer_pad: `padding:20px 40px 28px;border-top:1px solid #f3f4f6;background:#f8f9fb;`,
}

function logo() {
  return `<span style="font-size:19px;font-weight:700;letter-spacing:-0.04em;color:#111;">nipgo</span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#2563eb;margin-left:2px;vertical-align:middle;margin-bottom:2px;"></span>`
}

function cta(label: string, url: string, color = '#2563eb') {
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:${color};color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;">${label}</a>`
}

function footer() {
  return `<p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;line-height:1.7;">
    Pytania? <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a><br/>
    nipgo.pl · AuraData · Poznań, Polska<br/>
    <a href="https://nipgo.pl/unsubscribe" style="color:#c4c9d4;text-decoration:none;font-size:11px;">Wypisz się z maili</a>
  </p>`
}

// ────────────────────────────────────────────────────────────
// BASIC — DZIEŃ 1: Dobry wybór + oto 3 rzeczy na start
// ────────────────────────────────────────────────────────────
export function Basic_Day1_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Witaj w Basic</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">
    ${logo()}
    <span style="display:inline-block;margin-left:10px;padding:3px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;font-size:11px;font-weight:700;color:#2563eb;letter-spacing:0.04em;">BASIC</span>
  </td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.2;">
      ${firstName ? `${firstName}, dobra` : 'Dobra'} decyzja. 💙
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;line-height:1.65;">
      Plan Basic to wszystko czego potrzebujesz do efektywnej pracy z bazą firm. Masz już odblokowane <strong style="color:#111;">pełne wyniki, dane kontaktowe i eksport CSV</strong>. Oto jak zacząć od razu.
    </p>

    <!-- 3 pierwsze kroki -->
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;margin:0 0 14px;">Zrób to w pierwszym tygodniu:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        {
          num: '01',
          title: 'Zbuduj swoją pierwszą listę leadów',
          desc: 'Ustaw filtry: PKD + województwo + status aktywny. Kliknij "Eksportuj wyniki". Gotowe — masz CSV do Excela lub CRM.',
          url: 'https://nipgo.pl/search',
          cta_label: 'Idź do wyszukiwarki →'
        },
        {
          num: '02',
          title: 'Sprawdź dane kontaktowe 3 firm',
          desc: 'Kliknij w dowolną firmę z wyników. Na karcie firmy zobaczysz teraz telefony, emaile i stronę WWW — bez blura.',
          url: 'https://nipgo.pl/search',
          cta_label: 'Szukaj firm →'
        },
        {
          num: '03',
          title: 'Dodaj 3 firmy do monitoringu',
          desc: 'Na karcie firmy kliknij "Obserwuj". Dostaniesz alert gdy zmieni się adres, zarząd, status VAT lub forma prawna.',
          url: 'https://nipgo.pl/dashboard',
          cta_label: 'Dashboard →'
        },
      ].map(s => `<tr><td style="padding:0 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;">
          <tr>
            <td style="padding:16px 18px;width:40px;vertical-align:top;">
              <span style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:0.04em;">${s.num}</span>
            </td>
            <td style="padding:16px 18px 16px 0;">
              <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 4px;">${s.title}</p>
              <p style="font-size:13px;color:#6b7280;margin:0 0 10px;line-height:1.5;">${s.desc}</p>
              <a href="${s.url}" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">${s.cta_label}</a>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Limity reminder -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:600;color:#15803d;margin:0 0 4px;">Twoje limity na planie Basic:</p>
      <p style="font-size:13px;color:#16a34a;margin:0;line-height:1.6;">
        ✓ 1 000 rekordów eksportu / miesiąc &nbsp;·&nbsp; ✓ 20 monitorowanych firm &nbsp;·&nbsp; ✓ 30 zapytań AI / dzień
      </p>
    </div>

    ${cta('Zacznij teraz →', 'https://nipgo.pl/search')}

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Basic_Day1_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, dobra` : 'Dobra'} decyzja.

Masz odblokowane: pełne wyniki, dane kontaktowe, eksport CSV.

Zrób to w pierwszym tygodniu:

01. Zbuduj pierwszą listę leadów
    PKD + województwo + aktywne → Eksportuj → CSV do Excela
    → https://nipgo.pl/search

02. Sprawdź dane kontaktowe 3 firm
    Na karcie firmy masz teraz telefony i emaile bez blura

03. Dodaj 3 firmy do monitoringu
    Kliknij "Obserwuj" → alert gdy zmieni się adres, zarząd, VAT
    → https://nipgo.pl/dashboard

Limity Basic: 1 000 eksportów/mies · 20 firm w monitoringu · 30 AI zapytań/dzień

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// BASIC — DZIEŃ 3: Jak efektywnie używać eksportu CSV
// ────────────────────────────────────────────────────────────
export function Basic_Day3_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Jak wycisnąć max z eksportu</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;margin:0 0 10px;">Tip #1</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, tak` : 'Tak'} działa eksport który naprawdę sprzedaje.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      Eksport CSV to nie koniec — to punkt startowy. Oto jak go używać żeby nie tracić czasu na zimne leady.
    </p>

    <!-- Tips -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        {
          icon: '🎯',
          title: 'Filtruj ostro przed eksportem',
          desc: 'Im węziej — tym lepiej. PKD + województwo + "tylko z telefonem" = lista gotowa do dzwonienia. Nie bierz 5 000 firm po PKD bez filtrów — stracisz czas na nieaktywne.',
        },
        {
          icon: '📅',
          title: 'Nowe firmy = gorące leady',
          desc: 'Filtruj po dacie rejestracji: "ostatnie 12 miesięcy". Świeżo założona firma potrzebuje wszystkiego — księgowego, ubezpieczenia, IT, dostawców. Konkurencja jeszcze do nich nie dzwoniła.',
        },
        {
          icon: '💰',
          title: 'Kapitał zakładowy jako kwalifikator',
          desc: 'Firmy z kapitałem > 500 000 zł to poważne podmioty z budżetem. Jeśli sprzedajesz do B2B — zacznij od górnego segmentu. Mniej leadów, wyższe konwersje.',
        },
        {
          icon: '🔄',
          title: 'Eksportuj co tydzień nowe',
          desc: 'Ustaw filtry na "data rejestracji: ostatnie 7 dni" i eksportuj regularnie. Masz 1 000 rekordów miesięcznie — to 250 nowych firm tygodniowo do kontaktu.',
        },
      ].map(t => `<tr><td style="padding:0 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecef;border-radius:12px;">
          <tr>
            <td style="padding:14px 16px;width:36px;font-size:20px;vertical-align:top;">${t.icon}</td>
            <td style="padding:14px 16px 14px 0;border-left:1px solid #f3f4f6;">
              <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 4px;">${t.title}</p>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5;">${t.desc}</p>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    ${cta('Wypróbuj eksport →', 'https://nipgo.pl/search')}

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Basic_Day3_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, tak` : 'Tak'} działa eksport który naprawdę sprzedaje.

🎯 Filtruj ostro przed eksportem
PKD + województwo + "tylko z telefonem". Nie bierz 5 000 firm bez filtrów.

📅 Nowe firmy = gorące leady
Data rejestracji: ostatnie 12 miesięcy. Konkurencja jeszcze do nich nie dzwoniła.

💰 Kapitał jako kwalifikator
Firmy z kapitałem > 500k mają budżet. Mniej leadów, wyższe konwersje.

🔄 Eksportuj co tydzień nowe
250 nowych firm tygodniowo = 1 000 leadów miesięcznie.

→ https://nipgo.pl/search

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// BASIC — DZIEŃ 7: Monitoring firm — czy już ustawiłeś?
// ────────────────────────────────────────────────────────────
export function Basic_Day7_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Monitoring firm</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#f59e0b;margin:0 0 10px;">Czy wiesz że...?</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      Twój klient właśnie zmienił zarząd.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 20px;line-height:1.65;">
      Nowy prezes = nowe decyzje zakupowe. Przegląd dostawców. Zmiana strategii. To jeden z najlepszych momentów żeby się odezwać.
    </p>
    <p style="font-size:15px;color:#374151;margin:0 0 28px;line-height:1.65;">
      Problem: skąd masz wiedzieć że to się wydarzyło?<br/>
      <strong style="color:#111;">Odpowiedź: monitoring firm w nipgo.pl.</strong>
    </p>

    <!-- Co monitorujemy -->
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;margin:0 0 14px;">Dostajesz alert gdy zmieni się:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ['👤', 'Zarząd lub prokurent'],
        ['📍', 'Adres siedziby'],
        ['💳', 'Status VAT (wykreślenie z rejestru)'],
        ['📋', 'Forma prawna lub PKD'],
        ['▶️', 'Status KRS (zawieszenie, wznowienie)'],
      ].map(([icon, label]) => `<tr><td style="padding:0 0 8px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:28px;font-size:16px;">${icon}</td>
          <td style="font-size:14px;color:#374151;">${label}</td>
        </tr></table>
      </td></tr>`).join('')}
    </table>

    <!-- How to -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 8px;">Jak ustawić monitoring w 30 sekund:</p>
      <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.8;">
        1. Wejdź na kartę firmy<br/>
        2. Kliknij przycisk <strong style="color:#111;">"Obserwuj"</strong> w prawym sidebarze<br/>
        3. Gotowe — alert email gdy coś się zmieni
      </p>
    </div>

    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Masz limit <strong style="color:#111;">20 firm</strong> na planie Basic. Zacznij od swoich najważniejszych klientów i kontrahentów.
    </p>

    ${cta('Ustaw monitoring teraz →', 'https://nipgo.pl/search')}

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Basic_Day7_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `Twój klient właśnie zmienił zarząd.

Nowy prezes = nowe decyzje zakupowe. Najlepszy moment żeby się odezwać.
${firstName ? `${firstName}, skąd` : 'Skąd'} masz wiedzieć że to się wydarzyło?

Monitoring firm w nipgo.pl — dostajesz alert gdy zmieni się:
👤 Zarząd lub prokurent
📍 Adres siedziby
💳 Status VAT
📋 Forma prawna lub PKD
▶️ Status KRS

Jak ustawić: karta firmy → "Obserwuj" → gotowe.

Masz 20 firm w limicie Basic. Zacznij od najważniejszych klientów.

→ https://nipgo.pl/search

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// BASIC — DZIEŃ 14: Pro teaser — oto co masz ponad Basic
// ────────────────────────────────────────────────────────────
export function Basic_Day14_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Co zyskujesz w Pro?</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;margin:0 0 10px;">Dla ciekawych</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, oto` : 'Oto'} co jest w Pro a czego nie masz na Basic.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      Nie musisz upgrade'ować — Basic spokojnie wystarczy na co dzień. Ale jeśli kiedyś poczujesz że potrzebujesz więcej, to tutaj jest granica.
    </p>

    <!-- Porównanie -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="width:50%;padding:0 6px 0 0;vertical-align:top;">
          <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:16px 18px;">
            <p style="font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#9ca3af;margin:0 0 12px;">Basic — masz to</p>
            ${['1 000 eksportów/mies', '20 monitorowanych firm', '30 zapytań AI/dzień', 'Dane kontaktowe', 'Wyszukiwarka zaawansowana'].map(i => `<p style="font-size:13px;color:#374151;margin:0 0 6px;">✓ ${i}</p>`).join('')}
          </div>
        </td>
        <td style="width:50%;padding:0 0 0 6px;vertical-align:top;">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 18px;">
            <p style="font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#2563eb;margin:0 0 12px;">Pro — dodatkowo</p>
            ${['5 000 eksportów/mies', '100 monitorowanych firm', '100 zapytań AI/dzień', 'Historia zmian firmy', 'Taby: Finanse, Ryzyko, Sygnały', 'Priorytetowe wsparcie'].map(i => `<p style="font-size:13px;color:#1d4ed8;margin:0 0 6px;">✦ ${i}</p>`).join('')}
          </div>
        </td>
      </tr>
    </table>

    <!-- Cena -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="font-size:13px;color:#9ca3af;margin:0 0 2px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Plan Pro</p>
            <p style="font-size:26px;font-weight:700;color:#111;margin:0;letter-spacing:-0.03em;">119 zł<span style="font-size:14px;font-weight:400;color:#9ca3af;">/mies</span></p>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <a href="https://nipgo.pl/cennik" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;border-radius:9px;text-decoration:none;">Sprawdź Pro →</a>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
      Nie ma presji — Basic jest po to żeby działało. Napisz na <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a> jeśli masz pytania.
    </p>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Basic_Day14_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, oto` : 'Oto'} co jest w Pro a czego nie masz na Basic.

Basic (masz):
✓ 1 000 eksportów/mies · 20 firm w monitoringu · 30 AI/dzień

Pro (dodatkowo):
✦ 5 000 eksportów/mies · 100 firm · 100 AI/dzień
✦ Historia zmian firmy
✦ Taby: Finanse, Ryzyko, Sygnały
✦ Priorytetowe wsparcie

119 zł/mies → https://nipgo.pl/cennik

Nie ma presji — Basic spokojnie wystarczy na co dzień.
Pytania? hello@nipgo.pl

nipgo.pl`
}
