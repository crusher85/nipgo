import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  // Sprawdź plan
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", user.id)
    .single()

  if (profile?.plan !== "pro") {
    return NextResponse.json({ error: "requires_pro" }, { status: 403 })
  }

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 })

  // Pobierz kontakt po tokenie
  const { data: contact } = await supabase
    .from("crm_contacts")
    .select("*")
    .eq("share_token", token)
    .single()

  if (!contact) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // Sprawdź czy już ma ten kontakt
  const { data: existing } = await supabase
    .from("crm_contacts")
    .select("id")
    .eq("user_id", user.id)
    .eq("nip", contact.nip)
    .single()

  if (existing) return NextResponse.json({ already_exists: true })

  // Sprawdź limit 500
  const { count } = await supabase
    .from("crm_contacts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  if ((count ?? 0) >= 500) {
    return NextResponse.json({ error: "limit_reached" }, { status: 403 })
  }

  // Dodaj do CRM odbiorcy
  const { data: newContact, error } = await supabase
    .from("crm_contacts")
    .insert({
      user_id: user.id,
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
      shared_by: contact.user_id,
      shared_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "insert_failed" }, { status: 500 })

  // Zapisz pierwszy status w historii
  await supabase.from("crm_status_history").insert({
    user_id: user.id,
    contact_id: newContact.id,
    status_old: null,
    status_new: "nowy",
  })

  // Unieważnij token żeby nie można było użyć drugi raz
  await supabase
    .from("crm_contacts")
    .update({ share_token: null })
    .eq("share_token", token)

  return NextResponse.json({ success: true })
}
