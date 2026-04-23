import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { WelcomeEmailHtml, WelcomeEmailText } from '@/emails/WelcomeEmail'

export async function POST(request: NextRequest) {
  try {
    const { email, name, plan } = await request.json()
    if (!email) return NextResponse.json({ error: 'Brak email' }, { status: 400 })

    const { data, error } = await resend.emails.send({
      from: 'nipgo.pl <hello@nipgo.pl>',
      to: email,
      subject: 'Witaj w nipgo.pl — Twoje konto jest gotowe',
      html: WelcomeEmailHtml({ name: name || '', plan: plan || 'free' }),
      text: WelcomeEmailText({ name: name || '', plan: plan || 'free' }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
