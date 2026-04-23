// WelcomeEmail.ts — email powitalny po rejestracji
// Wysyłany przez auth/callback po potwierdzeniu email lub OAuth

export function WelcomeEmailHtml({ name, plan }: { name: string; plan: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  const isPaid = plan === 'basic' || plan === 'pro'
  const isPro = plan === 'pro'
  const planLabel = isPro ? 'Pro' : isPaid ? 'Basic' : 'Free'

  const planColor = isPro ? '#111' : isPaid ? '#2563eb' : '#6b7280'
  const planBg = isPro ? '#111' : isPaid ? '#eff6ff' : '#f8f9fb'
  const planBorder = isPro ? '#333' : isPaid ? '#bfdbfe' : '#e8eaed'
  const planTextColor = isPro ? '#fff' : isPaid ? '#2563eb' : '#6b7280'

  const actions = isPro
    ? [
        { num: '01', title: 'Wyeksportuj pierwszą listę leadów', desc: 'Wyszukaj po PKD + województwo → Eksportuj → CSV gotowy do CRM. Masz 5 000 rekordów miesięcznie.', url: 'https://nipgo.pl/search' },
        { num: '02', title: 'Dodaj 5 firm do monitoringu', desc: 'Karta firmy → "Obserwuj". Dostaniesz alert gdy zmieni się zarząd, adres, VAT lub status KRS.', url: 'https://nipgo.pl/search' },
        { num: '03', title: 'Sprawdź zakładkę Sygnały', desc: 'Otwórz kartę dowolnej firmy którą znasz. Zakładka Sygnały pokazuje zdarzenia rejestrowe — nowy zarząd, wzrost kapitału, zmiana adresu.', url: 'https://nipgo.pl/search' },
      ]
    : isPaid
    ? [
        { num: '01', title: 'Zbuduj pierwszą listę leadów', desc: 'PKD + województwo + aktywne → Eksportuj. Masz 1 000 rekordów miesięcznie.', url: 'https://nipgo.pl/search' },
        { num: '02', title: 'Sprawdź dane kontaktowe', desc: 'Kliknij dowolną firmę. Na karcie firmy masz teraz telefony i emaile — bez blura.', url: 'https://nipgo.pl/search' },
        { num: '03', title: 'Dodaj 3 firmy do monitoringu', desc: 'Karta firmy → "Obserwuj" → alert gdy coś się zmieni w KRS. Masz 20 firm w limicie.', url: 'https://nipgo.pl/dashboard' },
      ]
    : [
        { num: '01', title: 'Wyszukaj firmy po PKD i mieście', desc: 'Wpisz kod PKD lub nazwę branży + miasto. Znajdź potencjalnych klientów w swojej okolicy.', url: 'https://nipgo.pl/search' },
        { num: '02', title: 'Sprawdź kartę dowolnej firmy', desc: 'Wpisz NIP lub KRS — widzisz status KRS, VAT, adres, zarząd i PKD. Bez rejestracji.', url: 'https://nipgo.pl/search' },
        { num: '03', title: 'Poznaj co zyskujesz w Basic', desc: 'Eksport CSV, dane kontaktowe, monitoring firm, 1 000 rekordów/mies — za 59 zł.', url: 'https://nipgo.pl/cennik' },
      ]

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Witaj w nipgo.pl</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:48px 20px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;border:1px solid #e3e6ea;overflow:hidden;max-width:580px;">

  <!-- Header -->
  <tr>
    <td style="padding:28px 40px 24px;border-bottom:1px solid #f3f4f6;">
      <span style="font-size:19px;font-weight:700;letter-spacing:-0.04em;color:#111;">nipgo</span>
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#2563eb;margin-left:2px;vertical-align:middle;margin-bottom:2px;"></span>
      <span style="display:inline-block;margin-left:10px;padding:3px 10px;background:${planBg};border:1px solid ${planBorder};border-radius:20px;font-size:11px;font-weight:700;color:${planTextColor};letter-spacing:0.04em;">${planLabel.toUpperCase()}</span>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:40px 40px 32px;">

      <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.2;">
        ${isPro
          ? `${firstName ? `${firstName}, masz` : 'Masz'} teraz pełny dostęp. ✦`
          : isPaid
          ? `${firstName ? `${firstName}, dobra` : 'Dobra'} decyzja. 💙`
          : `${firstName ? `${firstName}, jesteś` : 'Jesteś'} w środku. 🎉`
        }
      </h1>
      <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.65;">
        ${isPro
          ? `Plan Pro to najlepszy sposób pracy z danymi firm w Polsce. Masz odblokowane <strong style="color:#111;">wszystkie funkcje</strong> — bez limitów które zatrzymują innych.`
          : isPaid
          ? `Masz dostęp do ponad <strong style="color:#111;">1,5 miliona firm</strong> z KRS i CEIDG. Eksport CSV, dane kontaktowe i monitoring — już odblokowane.`
          : `Masz dostęp do ponad <strong style="color:#111;">1,5 miliona firm</strong> z KRS i CEIDG — bez logowania. Oto 3 rzeczy które możesz zrobić od razu.`
        }
      </p>

      <!-- 3 kroki -->
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;margin:0 0 12px;">Zacznij od tych 3 rzeczy:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        ${actions.map(a => `<tr><td style="padding:0 0 10px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #eaecef;border-radius:12px;">
            <tr>
              <td style="padding:14px 16px;width:28px;vertical-align:top;">
                <span style="font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:0.04em;">${a.num}</span>
              </td>
              <td style="padding:14px 16px 14px 0;">
                <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 3px;">${a.title}</p>
                <p style="font-size:13px;color:#6b7280;margin:0 0 8px;line-height:1.5;">${a.desc}</p>
                <a href="${a.url}" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">Zrób to teraz →</a>
              </td>
            </tr>
          </table>
        </td></tr>`).join('')}
      </table>

      ${!isPaid ? `
      <!-- FOMO dla Free -->
      <div style="background:#fff8ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
        <p style="font-size:13px;font-weight:600;color:#92400e;margin:0 0 4px;">Na planie Free nie zobaczysz:</p>
        <p style="font-size:13px;color:#b45309;margin:0;line-height:1.7;">
          ✕ Telefonów i emaili firm &nbsp;·&nbsp; ✕ Eksportu CSV &nbsp;·&nbsp; ✕ Monitoringu firm &nbsp;·&nbsp; ✕ Więcej niż 10 wyników
        </p>
      </div>
      <div style="text-align:left;margin-bottom:0;">
        <a href="https://nipgo.pl/cennik" style="display:inline-block;padding:13px 24px;background:#2563eb;color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;">Sprawdź plan Basic — 7 dni gratis →</a>
        <span style="display:block;margin-top:8px;font-size:12px;color:#9ca3af;">59 zł/mies · anulujesz kiedy chcesz</span>
      </div>
      ` : `
      <!-- CTA dla płatnych -->
      <a href="https://nipgo.pl/search" style="display:inline-block;padding:13px 28px;background:${isPro ? '#111' : '#2563eb'};color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;">Przejdź do wyszukiwarki →</a>
      <p style="font-size:12px;color:#9ca3af;margin:12px 0 0;">Pytania? Odpisz na tego maila — czytam każdą wiadomość.</p>
      `}

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;background:#f8f9fb;">
      <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;line-height:1.7;">
        Pytania? <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a><br/>
        nipgo.pl · AuraData · Poznań, Polska<br/>
        <a href="https://nipgo.pl/unsubscribe" style="color:#c4c9d4;text-decoration:none;font-size:11px;">Wypisz się z maili</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function WelcomeEmailText({ name, plan }: { name: string; plan: string }) {
  const firstName = name ? name.split(' ')[0] : ''
  const isPaid = plan === 'basic' || plan === 'pro'
  const isPro = plan === 'pro'

  return `${isPro
    ? `${firstName ? `${firstName}, masz` : 'Masz'} teraz pełny dostęp. ✦`
    : isPaid
    ? `${firstName ? `${firstName}, dobra` : 'Dobra'} decyzja.`
    : `${firstName ? `${firstName}, jesteś` : 'Jesteś'} w środku!`
  }

${isPro
  ? 'Plan Pro — wszystkie funkcje bez limitów.'
  : isPaid
  ? 'Eksport CSV, dane kontaktowe i monitoring są już odblokowane.'
  : 'Masz dostęp do 1,5 miliona firm z KRS i CEIDG.'
}

${isPro ? `Zacznij od:
01. Wyeksportuj pierwszą listę leadów → https://nipgo.pl/search
02. Dodaj 5 firm do monitoringu (karta firmy → Obserwuj)
03. Sprawdź zakładkę Sygnały na karcie dowolnej firmy`
  : isPaid ? `Zacznij od:
01. Zbuduj pierwszą listę leadów → https://nipgo.pl/search
02. Sprawdź dane kontaktowe — wejdź na kartę firmy
03. Dodaj 3 firmy do monitoringu → https://nipgo.pl/dashboard`
  : `Zacznij od:
01. Wyszukaj firmy po PKD i mieście → https://nipgo.pl/search
02. Sprawdź kartę dowolnej firmy — wpisz NIP
03. Poznaj co zyskujesz w Basic → https://nipgo.pl/cennik`
}

${!isPaid ? '\nNa Free nie widzisz: telefonów, emaili, eksportu CSV, więcej niż 10 wyników.\nBasic — 59 zł/mies, 7 dni gratis: https://nipgo.pl/cennik' : ''}

Pytania? hello@nipgo.pl — odpisuję osobiście.

nipgo.pl`
}
