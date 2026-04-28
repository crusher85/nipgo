import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { contactId, email } = await req.json()
  if (!contactId || !email) return NextResponse.json({ error: "missing_params" }, { status: 400 })

  // Pobierz kontakt
  const { data: contact } = await supabase
    .from("crm_contacts")
    .select("*")
    .eq("id", contactId)
    .eq("user_id", user.id)
    .single()

  if (!contact) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // Pobierz profil wysyłającego
  const { data: senderProfile } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const senderName = senderProfile?.full_name || user.email?.split("@")[0] || "Użytkownik nipgo"

  // Sprawdź czy odbiorca ma konto
  const { data: recipientProfile } = await supabase
    .from("user_profiles")
    .select("id, plan")
    .eq("billing_email", email)
    .single()

  // Generuj token do odbioru (dla niezarejestrowanych)
  const shareToken = crypto.randomUUID()

  // Zapisz token w kontakcie
  await supabase
    .from("crm_contacts")
    .update({ share_token: shareToken, shared_by: user.id, shared_at: new Date().toISOString() })
    .eq("id", contactId)

  if (recipientProfile && recipientProfile.plan === "pro") {
    // Użytkownik Pro — dodaj do jego CRM bezpośrednio
    const { error } = await supabase.from("crm_contacts").insert({
      user_id: recipientProfile.id,
      nip: contact.nip,
      nazwa: contact.nazwa,
      forma_prawna: contact.forma_prawna,
      miejscowosc: contact.miejscowosc,
      wojewodztwo: contact.wojewodztwo,
      pkd_glowne: contact.pkd_glowne,
      telefon: contact.telefon,
      email: contact.email,
      www: contact.www,
      source: "shared",
      shared_by: user.id,
      shared_at: new Date().toISOString(),
    })

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: "insert_failed" }, { status: 500 })
    }

    // Email powiadomienie
    await resend.emails.send({
      from: "nipgo.pl <hello@nipgo.pl>",
      to: email,
      subject: `${senderName} wysłał Ci kontakt biznesowy`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 17px; font-weight: 700; letter-spacing: -0.03em;">nipgo<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#2563eb; margin-left:2px; vertical-align:middle;"></span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.02em;">Masz nowy kontakt w CRM</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">${senderName} dodał firmę do Twojego CRM nipgo.pl</p>
          <div style="background: #f8f9fb; border: 1px solid #e8eaed; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${contact.nazwa ?? contact.nip}</p>
            ${contact.forma_prawna ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 2px;">${contact.forma_prawna}</p>` : ""}
            ${contact.miejscowosc ? `<p style="font-size: 13px; color: #6b7280; margin: 0;">📍 ${contact.miejscowosc}</p>` : ""}
          </div>
          <a href="https://nipgo.pl/dashboard" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">Zobacz w CRM →</a>
        </div>
      `
    })
  } else {
    // Brak konta lub nie Pro — wyślij zaproszenie z linkiem
    const receiveUrl = `https://nipgo.pl/crm/odbierz/${shareToken}`

    await resend.emails.send({
      from: "nipgo.pl <hello@nipgo.pl>",
      to: email,
      subject: `${senderName} wysłał Ci kontakt biznesowy przez nipgo.pl`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 17px; font-weight: 700; letter-spacing: -0.03em;">nipgo<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#2563eb; margin-left:2px; vertical-align:middle;"></span></span>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.02em;">${senderName} wysłał Ci kontakt biznesowy</h2>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Aby odebrać kontakt, potrzebujesz konta nipgo.pl w planie Pro.</p>
          <div style="background: #f8f9fb; border: 1px solid #e8eaed; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Kontakt do odebrania</p>
            <p style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${contact.nazwa ?? contact.nip}</p>
            ${contact.forma_prawna ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 2px;">${contact.forma_prawna}</p>` : ""}
            ${contact.miejscowosc ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 8px;">📍 ${contact.miejscowosc}</p>` : ""}
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">+ telefon, email i pełne dane po aktywacji</p>
          </div>
          <a href="${receiveUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 16px;">Odbierz kontakt →</a>
          <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0;">Link wygaśnie po 7 dniach. nipgo.pl — baza firm KRS i CEIDG.</p>
        </div>
      `
    })
  }

  return NextResponse.json({ success: true })
}
