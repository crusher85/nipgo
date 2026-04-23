// ============================================================
// PRO FLOW — 4 emaile
// Cel: elite club → ficzer którego nie znasz → AI search → tips & tricks
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

function cta(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:#111;color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;">${label}</a>`
}

function footer() {
  return `<p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;line-height:1.7;">
    Pytania? <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a><br/>
    nipgo.pl · AuraData · Poznań, Polska<br/>
    <a href="https://nipgo.pl/unsubscribe" style="color:#c4c9d4;text-decoration:none;font-size:11px;">Wypisz się z maili</a>
  </p>`
}

// ────────────────────────────────────────────────────────────
// PRO — DZIEŃ 1: Witamy, jesteś w najlepszym miejscu
// ────────────────────────────────────────────────────────────
export function Pro_Day1_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Witaj w Pro</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <!-- Header z Pro badge -->
  <tr><td style="${BASE_STYLE.header}">
    ${logo()}
    <span style="display:inline-block;margin-left:10px;padding:3px 10px;background:#111;border-radius:20px;font-size:11px;font-weight:700;color:#fff;letter-spacing:0.04em;">PRO</span>
  </td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.2;">
      ${firstName ? `${firstName}, masz` : 'Masz'} teraz pełny dostęp. ✦
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;line-height:1.65;">
      Plan Pro to najlepszy sposób pracy z danymi firm w Polsce. Masz wszystko — bez limitów które zatrzymują innych. Oto co masz odblokowane od dziś:
    </p>

    <!-- Pełna lista Pro features -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        { icon: '📤', label: '5 000 rekordów eksportu / miesiąc', sub: 'Do CRM, Excela, kampanii emailowych' },
        { icon: '👁️', label: '100 firm w monitoringu', sub: 'Alert email gdy zmieni się cokolwiek w KRS' },
        { icon: '🤖', label: '100 zapytań AI dziennie', sub: 'Wyszukiwanie semantyczne — opisz firmę słowami' },
        { icon: '📊', label: 'Taby: Finanse, Ryzyko, Sygnały, Dotacje', sub: 'Pełny obraz firmy w jednym miejscu' },
        { icon: '🕰️', label: 'Historia zmian firmy', sub: 'Kiedy zmieniał się zarząd, adres, kapitał' },
        { icon: '⚡', label: 'Priorytetowe wsparcie', sub: 'Odpowiadam w ciągu kilku godzin' },
      ].map(f => `<tr><td style="padding:0 0 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #eaecef;border-radius:10px;">
          <tr>
            <td style="padding:12px 14px;width:36px;font-size:18px;vertical-align:top;">${f.icon}</td>
            <td style="padding:12px 14px 12px 0;">
              <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 2px;">${f.label}</p>
              <p style="font-size:12px;color:#9ca3af;margin:0;">${f.sub}</p>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Gdzie zacząć -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 10px;">Zacznij od tego:</p>
      <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.8;">
        1. Wyszukaj firmy i wyeksportuj pierwszą listę → <a href="https://nipgo.pl/search" style="color:#2563eb;text-decoration:none;">nipgo.pl/search</a><br/>
        2. Dodaj 5–10 kluczowych kontrahentów do monitoringu<br/>
        3. Sprawdź zakładkę "Sygnały" na karcie firmy którą znasz
      </p>
    </div>

    ${cta('Przejdź do wyszukiwarki →', 'https://nipgo.pl/search')}
    <p style="font-size:12px;color:#9ca3af;margin:14px 0 0;">Masz pytanie? Odpisz na tego maila — czytam każdą wiadomość.</p>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Pro_Day1_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, masz` : 'Masz'} teraz pełny dostęp. ✦

Odblokowane od dziś:
📤 5 000 eksportów/mies
👁️ 100 firm w monitoringu
🤖 100 zapytań AI/dzień
📊 Taby: Finanse, Ryzyko, Sygnały, Dotacje
🕰️ Historia zmian firmy
⚡ Priorytetowe wsparcie

Zacznij od:
1. Wyeksportuj pierwszą listę → https://nipgo.pl/search
2. Dodaj kluczowych kontrahentów do monitoringu
3. Sprawdź zakładkę "Sygnały" na karcie firmy którą znasz

Pytania? Odpisz na tego maila.

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// PRO — DZIEŃ 3: Ficzer którego pewnie nie znasz — Historia zmian
// ────────────────────────────────────────────────────────────
export function Pro_Day3_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Ficzer którego pewnie nie znasz</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;margin:0 0 10px;">Pro — ficzer #1</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, większość` : 'Większość'} użytkowników Pro nie używa tego od razu.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      A szkoda — bo to jeden z najmocniejszych sygnałów sprzedażowych jakie masz. Mówię o zakładce <strong style="color:#111;">Sygnały</strong> na karcie firmy.
    </p>

    <!-- Co to jest -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-left:3px solid #f59e0b;border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:28px;">
      <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 6px;">Sygnały zakupowe — co to?</p>
      <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">
        Zakładka Sygnały pokazuje zdarzenia rejestrowe które wskazują że firma jest w momencie zakupowym — zmiana zarządu, wzrost kapitału, zmiana adresu, nowe PKD, wznowienie działalności.
      </p>
    </div>

    <!-- Tabela sygnałów -->
    <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 12px;">Dlaczego to ważne dla Ciebie:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        { signal: '👤 Nowy zarząd/prokurent', meaning: 'Nowy decydent = nowe decyzje zakupowe. Idealny moment na cold outreach.' },
        { signal: '💰 Wzrost kapitału zakładowego', meaning: 'Dostali finansowanie. Mają budżet. Wydają.' },
        { signal: '📍 Zmiana adresu', meaning: 'Przeprowadzka = nowe biuro, meble, sprzęt, internet, ochrona.' },
        { signal: '📋 Nowe PKD', meaning: 'Wchodzą w nową branżę — potrzebują nowych narzędzi i dostawców.' },
        { signal: '▶️ Wznowienie działalności', meaning: 'Właściciel wraca. Znowu aktywny. Znowu kupuje.' },
      ].map(s => `<tr><td style="padding:0 0 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3f4f6;border-radius:10px;">
          <tr>
            <td style="padding:10px 14px;width:180px;vertical-align:top;border-right:1px solid #f3f4f6;">
              <span style="font-size:12px;font-weight:600;color:#374151;">${s.signal}</span>
            </td>
            <td style="padding:10px 14px;font-size:12px;color:#6b7280;line-height:1.5;">${s.meaning}</td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <p style="font-size:14px;color:#374151;margin:0 0 24px;line-height:1.6;">
      Wejdź na kartę dowolnej firmy którą monitorujesz i kliknij zakładkę <strong style="color:#111;">Sygnały</strong>. Zobaczysz historię zdarzeń.
    </p>

    ${cta('Sprawdź zakładkę Sygnały →', 'https://nipgo.pl/search')}

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Pro_Day3_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, większość` : 'Większość'} użytkowników Pro nie używa tego od razu.

Zakładka Sygnały na karcie firmy — sygnały zakupowe:

👤 Nowy zarząd → nowe decyzje zakupowe
💰 Wzrost kapitału → mają budżet, wydają
📍 Zmiana adresu → nowe biuro, sprzęt, usługi
📋 Nowe PKD → wchodzą w nową branżę
▶️ Wznowienie działalności → znowu aktywni, znowu kupują

Wejdź na kartę firmy → zakładka Sygnały.

→ https://nipgo.pl/search

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// PRO — DZIEŃ 7: Jak używać AI search
// ────────────────────────────────────────────────────────────
export function Pro_Day7_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>AI search — jak to działa</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7c3aed;margin:0 0 10px;">Pro — ficzer #2</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      Zapomnij o kodach PKD.<br/>Wpisz co szukasz po ludzku.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
      AI search w nipgo.pl rozumie język naturalny i sam dobiera odpowiednie kody PKD. ${firstName ? `${firstName}, nie` : 'Nie'} musisz znać żadnych numerów.
    </p>

    <!-- Przykłady -->
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;margin:0 0 14px;">Przykłady które działają:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        { query: '"producenci opakowań ekologicznych w Wielkopolsce"', result: '→ PKD 22.2x + 17.xx · województwo wielkopolskie' },
        { query: '"kancelarie prawne specjalizujące się w prawie pracy"', result: '→ PKD 69.10.Z · aktywne · forma prawna spółka' },
        { query: '"małe drukarnie na Mazowszu z kapitałem powyżej 100k"', result: '→ PKD 18.xx · Mazowsze · kapitał > 100 000' },
        { query: '"firmy IT zatrudniające powyżej 50 osób"', result: '→ PKD 62.xx · GUS pracownicy > 50' },
      ].map(e => `<tr><td style="padding:0 0 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;">
          <tr><td style="padding:12px 16px;">
            <p style="font-size:13px;font-style:italic;color:#7c3aed;margin:0 0 4px;font-weight:500;">${e.query}</p>
            <p style="font-size:12px;color:#9ca3af;margin:0;">${e.result}</p>
          </td></tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Jak używać -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
      <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 8px;">Jak włączyć AI search:</p>
      <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.8;">
        W wyszukiwarce znajdziesz przycisk <strong style="color:#111;">"AI"</strong> obok pola wyszukiwania.<br/>
        Wpisz opis — AI przetłumaczy go na filtry i zwróci wyniki.<br/>
        Masz 100 zapytań dziennie na planie Pro.
      </p>
    </div>

    ${cta('Wypróbuj AI search →', 'https://nipgo.pl/search')}

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Pro_Day7_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `Zapomnij o kodach PKD. Wpisz co szukasz po ludzku.

AI search rozumie język naturalny.${firstName ? ` ${firstName}, nie` : ' Nie'} musisz znać żadnych numerów.

Przykłady:
→ "producenci opakowań ekologicznych w Wielkopolsce"
→ "kancelarie prawne specjalizujące się w prawie pracy"
→ "małe drukarnie na Mazowszu z kapitałem powyżej 100k"
→ "firmy IT zatrudniające powyżej 50 osób"

Jak włączyć: przycisk "AI" obok pola wyszukiwania.
100 zapytań dziennie na planie Pro.

→ https://nipgo.pl/search

nipgo.pl`
}

// ────────────────────────────────────────────────────────────
// PRO — DZIEŃ 14: Tips & tricks, hidden gems
// ────────────────────────────────────────────────────────────
export function Pro_Day14_Html({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>5 trików których nie znasz</title></head>
<body style="${BASE_STYLE.body}">
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.wrapper}">
<tr><td>
<table width="100%" cellpadding="0" cellspacing="0" style="${BASE_STYLE.card}">

  <tr><td style="${BASE_STYLE.header}">${logo()}</td></tr>

  <tr><td style="${BASE_STYLE.body_pad}">

    <p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ca3af;margin:0 0 10px;">2 tygodnie minęły</p>
    <h1 style="font-size:24px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.25;">
      ${firstName ? `${firstName}, 5` : '5'} rzeczy które robią najlepsi użytkownicy Pro.
    </h1>
    <p style="font-size:15px;color:#6b7280;margin:0 0 32px;line-height:1.65;">
      Zebrałem zachowania tych którzy używają nipgo.pl najefektywniej. Oto co ich wyróżnia.
    </p>

    <!-- Tips -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        {
          num: '01',
          title: 'Szukają po NIP kontrahenta przed każdym spotkaniem',
          desc: 'Wpisz NIP firmy z którą masz jutro meeting. Sprawdź zarząd, kapitał, historię zmian, status VAT. 2 minuty — wyglądasz jak ekspert.'
        },
        {
          num: '02',
          title: 'Monitorują 3–5 firm zamiast 100',
          desc: 'Nie próbują obserwować wszystkich. Skupiają się na kluczowych klientach i topowych prospektach — i reagują szybko gdy coś się zmienia.'
        },
        {
          num: '03',
          title: 'Eksportują segmentem, nie branżą',
          desc: 'Nie "firmy budowlane" — ale "firmy budowlane, Poznań, kapitał 200k–2M, aktywne, z telefonem". Mniejsza lista, wyższy hit rate.'
        },
        {
          num: '04',
          title: 'Używają filtra "tylko z emailem" dla kampanii',
          desc: 'Jeśli robisz cold email — filtruj od razu po firmach z adresem email. Oszczędzasz kredy i masz wyższy deliverability.'
        },
        {
          num: '05',
          title: 'Wpisują NIP klientów których tracą',
          desc: 'Gdy klient się nie odzywa — sprawdź kartę firmy. Zmiana zarządu, zawieszenie, problemy VAT — to tłumaczy dużo.'
        },
      ].map(t => `<tr><td style="padding:0 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecef;border-radius:12px;">
          <tr>
            <td style="padding:14px 16px;width:36px;vertical-align:top;border-right:1px solid #f3f4f6;">
              <span style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:0.04em;">${t.num}</span>
            </td>
            <td style="padding:14px 16px;">
              <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 4px;">${t.title}</p>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5;">${t.desc}</p>
            </td>
          </tr>
        </table>
      </td></tr>`).join('')}
    </table>

    <!-- Feedback CTA -->
    <div style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;padding:18px 20px;margin-bottom:0;">
      <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 6px;">Brakuje Ci czegoś?</p>
      <p style="font-size:13px;color:#6b7280;margin:0 0 14px;line-height:1.6;">
        Buduję nipgo.pl sam — każda opinia trafia bezpośrednio do mnie i wpływa na to co będę budował w następnych tygodniach.
      </p>
      <a href="mailto:hello@nipgo.pl?subject=Pro%20feedback" style="font-size:13px;font-weight:600;color:#2563eb;text-decoration:none;">Napisz mi co Ci brakuje →</a>
    </div>

  </td></tr>
  <tr><td style="${BASE_STYLE.footer_pad}">${footer()}</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function Pro_Day14_Text({ name }: { name: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  return `${firstName ? `${firstName}, 5` : '5'} rzeczy które robią najlepsi użytkownicy Pro:

01. Wpisują NIP kontrahenta przed każdym meetingiem
    2 minuty — zarząd, kapitał, historia zmian, VAT. Wyglądasz jak ekspert.

02. Monitorują 3–5 firm zamiast 100
    Skupiają się na kluczowych — i reagują szybko.

03. Eksportują segmentem, nie branżą
    "budowlane + Poznań + kapitał 200k-2M + z telefonem" — mniejsza lista, wyższy hit rate.

04. Filtrują "tylko z emailem" dla cold email
    Mniejszy eksport, wyższy deliverability.

05. Sprawdzają firmy które przestały kupować
    Zmiana zarządu, zawieszenie, VAT — to tłumaczy dużo.

Brakuje Ci czegoś? Odpisz na tego maila — buduję to sam i każda opinia trafia do mnie.

nipgo.pl`
}
