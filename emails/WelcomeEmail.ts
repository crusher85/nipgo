export function WelcomeEmailHtml({ name, plan }: { name: string; plan: string }) {
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'basic' ? 'Basic' : 'Free'
  const isPaid = plan === 'basic' || plan === 'pro'

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Witaj w nipgo.pl</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8eaed;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="padding:28px 36px 24px;border-bottom:1px solid #f3f4f6;">
          <span style="font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#111;">nipgo</span>
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#2563eb;margin-left:2px;vertical-align:middle;"></span>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px 36px;">
          <h1 style="font-size:24px;font-weight:600;color:#111;margin:0 0 8px;letter-spacing:-0.02em;">
            Witaj w nipgo.pl${name ? `, ${name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p style="font-size:15px;color:#6b7280;margin:0 0 28px;line-height:1.6;">
            Twoje konto jest gotowe. Masz dostęp do bazy ponad <strong style="color:#111;">1,5 miliona firm</strong> z KRS i CEIDG.
          </p>

          <!-- Plan badge -->
          <div style="background:#f8f9fb;border:1px solid #e8eaed;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#9ca3af;text-transform:uppercase;margin:0 0 4px;">Twój plan</p>
            <p style="font-size:18px;font-weight:600;color:${isPaid ? '#2563eb' : '#6b7280'};margin:0;">${planLabel}</p>
          </div>

          <!-- 3 szybkie akcje -->
          <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 14px;">Zacznij od tych 3 rzeczy:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              { num: '1', title: 'Wyszukaj firmy po PKD i mieście', desc: 'Znajdź potencjalnych klientów lub dostawców w swojej branży', url: 'https://nipgo.pl/search' },
              { num: '2', title: 'Sprawdź kartę wybranej firmy', desc: 'Wpisz NIP lub KRS i zobacz pełne dane rejestrowe', url: 'https://nipgo.pl/search' },
              { num: '3', title: isPaid ? 'Wyeksportuj listę leadów CSV' : 'Poznaj możliwości planu Basic', desc: isPaid ? 'Pobierz dane firm do Excela jednym kliknięciem' : 'Eksport CSV, dane kontaktowe i monitoring firm', url: isPaid ? 'https://nipgo.pl/search' : 'https://nipgo.pl/cennik' },
            ].map(item => `
            <tr>
              <td style="padding:0 0 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e8eaed;border-radius:10px;">
                  <tr>
                    <td style="padding:14px 16px;width:36px;vertical-align:top;">
                      <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:#2563eb;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">${item.num}</span>
                    </td>
                    <td style="padding:14px 16px 14px 0;">
                      <p style="font-size:14px;font-weight:600;color:#111;margin:0 0 2px;">${item.title}</p>
                      <p style="font-size:12px;color:#6b7280;margin:0;">${item.desc}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`).join('')}
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px;">
            <a href="https://nipgo.pl/search" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;">
              Przejdź do wyszukiwarki →
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 36px;border-top:1px solid #f3f4f6;background:#f8f9fb;">
          <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;line-height:1.6;">
            Pytania? Napisz na <a href="mailto:hello@nipgo.pl" style="color:#2563eb;text-decoration:none;">hello@nipgo.pl</a><br/>
            nipgo.pl · AuraData · Poznań, Polska
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
  return `Witaj w nipgo.pl${name ? `, ${name.split(' ')[0]}` : ''}!

Twoje konto jest gotowe. Masz dostęp do bazy ponad 1,5 miliona firm z KRS i CEIDG.

Plan: ${plan === 'pro' ? 'Pro' : plan === 'basic' ? 'Basic' : 'Free'}

Zacznij od:
1. Wyszukaj firmy po PKD i mieście → https://nipgo.pl/search
2. Sprawdź kartę wybranej firmy — wpisz NIP lub KRS
3. ${plan === 'free' ? 'Zobacz możliwości planu Basic → https://nipgo.pl/cennik' : 'Wyeksportuj listę leadów CSV'}

Pytania? hello@nipgo.pl

nipgo.pl · AuraData · Poznań`
}
