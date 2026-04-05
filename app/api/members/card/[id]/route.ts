import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Helper ───────────────────────────────────────────────────────────────────

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

// ─── GET /api/members/card/[id] ───────────────────────────────────────────────
// Retourne les données d'un membre pour la carte + QR code
// id = member_id (ex: CI-2026-2723) ou uuid

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getServiceClient()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase non configuré.' },
      { status: 500 }
    )
  }

  try {
    const { id } = await params

    // Chercher par member_id ou par uuid
    const isUUID = id.length > 20 && !id.startsWith('CI')

    let query = supabase.from('members').select('*')

    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('member_id', id)
    }

    const { data: member, error } = await query.single()

    if (error || !member) {
      return NextResponse.json(
        { error: 'Membre introuvable.' },
        { status: 404 }
      )
    }

    // Données pour la carte
    const cardData = {
      member_id: member.member_id,
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      profession: member.profession || '',
      role: member.role || 'member',
      status: member.status || 'pending',
      category: member.category || '',
      profile_photo: member.profile_photo || null,
      membership_level: member.membership_level || '',
      bureau_position: member.bureau_position || null,
      ca_position: member.ca_position || null,
    }

    // Données à encoder dans le QR (JSON minimal)
    const qrPayload = JSON.stringify({
      mid: member.member_id,
      n: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
      e: member.email || '',
    })

    return NextResponse.json({
      card: cardData,
      qr_payload: qrPayload,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
