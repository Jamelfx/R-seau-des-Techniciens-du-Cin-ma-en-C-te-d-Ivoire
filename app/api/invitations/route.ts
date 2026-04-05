import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ─── POST /api/invitations/accept ────────────────────────────────────────────
// Accepte une invitation : crée le membre (active) + met à jour l'invitation

interface AcceptBody {
  token: string
  // Optionnel si l'utilisateur s'inscrit via Supabase Auth (email déjà connu)
  auth_email?: string
  first_name?: string
  last_name?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const body: AcceptBody = await request.json()

    if (!body.token) {
      return NextResponse.json({ error: 'Token manquant.' }, { status: 400 })
    }

    // 1. Vérifier l'invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', body.token)
      .maybeSingle()

    if (invError || !invitation) {
      return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 })
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Cette invitation a déjà été utilisée.' }, { status: 409 })
    }

    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    if (now > expiresAt) {
      await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      return NextResponse.json({ error: 'Cette invitation a expiré.' }, { status: 410 })
    }

    // 2. Vérifier si un membre existe déjà avec cet email
    const memberEmail = body.auth_email || invitation.email
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('email', memberEmail)
      .maybeSingle()

    if (existingMember) {
      // Le membre existe déjà, juste mettre à jour son statut en active
      await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', existingMember.id)

      await supabase
        .from('invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return NextResponse.json({
        success: true,
        message: 'Votre compte a été activé avec succès.',
        member_id: existingMember.id,
      })
    }

    // 3. Générer un member_id unique (CI-ANNEE-XXXX)
    const year = new Date().getFullYear()
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const memberId = `CI-${year}-${randomDigits}`

    // Vérifier l'unicité du member_id
    let finalMemberId = memberId
    let attempts = 0
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('member_id', finalMemberId)
        .maybeSingle()
      if (!existing) break
      finalMemberId = `CI-${year}-${Math.floor(1000 + Math.random() * 9000)}`
      attempts++
    }

    // 4. Créer le membre avec status = 'active'
    const newMember = {
      member_id: finalMemberId,
      email: memberEmail,
      first_name: body.first_name || invitation.first_name,
      last_name: body.last_name || invitation.last_name,
      phone: body.phone || invitation.phone || null,
      status: 'active',
      role: 'member',
      invited_by: null,
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert(newMember)
      .select()
      .single()

    if (memberError) {
      console.error('Erreur création membre:', memberError.message)
      return NextResponse.json(
        { error: `Erreur lors de la création du membre: ${memberError.message}` },
        { status: 500 }
      )
    }

    // 5. Mettre à jour l'invitation
    await supabase
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    return NextResponse.json({
      success: true,
      message: 'Bienvenue ! Votre compte RETECHCI a été créé avec succès.',
      member,
      member_id: finalMemberId,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
