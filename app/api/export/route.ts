import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  // Sprawdź auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Pobierz plan
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, export_records_used_month, export_records_limit")
    .eq("id", user.id)
    .single()

  if (!profile || profile.plan === "free") {
    return NextResponse.json({ error: "Plan upgrade required" }, { status: 403 })
  }

  const body = await request.json()
  const { csvContent, filename, recordCount, filters } = body

  if (!csvContent || !filename) {
    return NextResponse.json({ error: "Missing csvContent or filename" }, { status: 400 })
  }

  // Sprawdź limit
  const used = profile.export_records_used_month ?? 0
  const limit = profile.export_records_limit ?? 0
  if (used + recordCount > limit) {
    return NextResponse.json({ error: "Export limit exceeded", used, limit }, { status: 429 })
  }

  // Upload do Storage
  const filePath = `${user.id}/${filename}`
  const csvBuffer = Buffer.from(csvContent, "utf-8")

  const { error: uploadError } = await supabase.storage
    .from("exports")
    .upload(filePath, csvBuffer, {
      contentType: "text/csv",
      upsert: true,
    })

  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  // Podpisany URL (ważny 7 dni)
  const { data: urlData } = await supabase.storage
    .from("exports")
    .createSignedUrl(filePath, 60 * 60 * 24 * 7)

  const fileUrl = urlData?.signedUrl ?? null

  // Zapisz rekord w tabeli exports
  const { data: exportRecord } = await supabase
    .from("exports")
    .insert({
      user_id: user.id,
      status: "ready",
      record_count: recordCount,
      filters: filters ?? {},
      file_url: fileUrl,
      columns_selected: null,
    })
    .select("id")
    .single()

  // Zaktualizuj licznik eksportów
  await supabase
    .from("user_profiles")
    .update({ export_records_used_month: used + recordCount })
    .eq("id", user.id)

  return NextResponse.json({
    ok: true,
    exportId: exportRecord?.id,
    fileUrl,
    recordCount,
  })
}