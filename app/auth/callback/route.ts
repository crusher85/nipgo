import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resend } from '@/lib/resend'
import { WelcomeEmailHtml, WelcomeEmailText } from '@/emails/WelcomeEmail'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const plan = searchParams.get('plan') ?? 'free'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (!error && data.user) {
      const user = data.user
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
      try {
        await resend.emails.send({
          from: 'nipgo.pl <hello@nipgo.pl>',
          to: user.email!,
          subject: 'Witaj w nipgo.pl — Twoje konto jest gotowe',
          html: WelcomeEmailHtml({ name, plan: 'free' }),
          text: WelcomeEmailText({ name, plan: 'free' }),
        })
      } catch (e) {
        console.error('Welcome email failed:', e)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const user = data.user
      const isNewUser = user.created_at === user.updated_at ||
        (Date.now() - new Date(user.created_at).getTime()) < 30000

      if (plan === 'basic' || plan === 'pro') {
        await supabase.from('user_profiles').update({ plan }).eq('id', user.id)
      }

      if (isNewUser) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
        try {
          await resend.emails.send({
            from: 'nipgo.pl <hello@nipgo.pl>',
            to: user.email!,
            subject: 'Witaj w nipgo.pl — Twoje konto jest gotowe',
            html: WelcomeEmailHtml({ name, plan }),
            text: WelcomeEmailText({ name, plan }),
          })
        } catch (e) {
          console.error('Welcome email failed:', e)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
