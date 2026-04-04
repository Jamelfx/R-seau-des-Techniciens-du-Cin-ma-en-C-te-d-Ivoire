import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const { data, error } = await supabase.from('invitations').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })
    return NextResponse.json({ invitations: data || [], total: data?.length || 0 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const body = await request.json() as { email: string; first_name: string; last_name: string; phone?: string }
    if (!body.email || !body.first_name || !body.last_name) {
      return NextResponse.json({ error: 'Email, prénom et nom requis.' }, { status: 400 })
    }
    const normalizedEmail = body.email.trim().toLowerCase()

    const { data: existingInvitation } = await supabase.from('invitations').select('id').eq('email', normalizedEmail).maybeSingle()
    if (existingInvitation) return NextResponse.json({ error: 'Invitation déjà existante pour cet email.' }, { status: 409 })

    const { data: existingMember } = await supabase.from('members').select('id').eq('email', normalizedEmail).maybeSingle()
    if (existingMember) return NextResponse.json({ error: 'Un membre existe déjà avec cet email.' }, { status: 409 })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data, error } = await supabase.from('invitations').insert({
      email: normalizedEmail,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      phone: body.phone?.trim() || null,
      token: crypto.randomUUID(),
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    }).select().single()

    if (error) return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })
    return NextResponse.json({ invitation: data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
