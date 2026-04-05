import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── GET /api/invitations/verify?token=xxx ─────────────────────────────────
// Vérifie si un token d'invitation est valide et non expiré

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  }

  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token manquant.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, anonKey)

  try {
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })
    }

    if (!invitation) {
      return NextResponse.json({ valid: false, error: 'Invitation introuvable.' })
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json({ valid: false, error: 'Cette invitation a déjà été utilisée.' })
    }

    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (now > expiresAt) {
      // Marquer comme expirée
      await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
      return NextResponse.json({ valid: false, error: 'Cette invitation a expiré.' })
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        email: invitation.email,
        phone: invitation.phone,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
