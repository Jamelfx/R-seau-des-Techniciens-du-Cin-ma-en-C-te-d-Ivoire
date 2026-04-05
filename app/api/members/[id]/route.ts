import { NextRequest, NextResponse } from 'next/server'
import { updateMemberStatus, updateMemberRole, updateMemberPositions } from '@/lib/supabase/server'
import type { MemberStatus, MemberRole } from '@/lib/supabase/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, role, bureau_position, ca_position } = body as {
      status?: MemberStatus
      role?: MemberRole
      bureau_position?: string | null
      ca_position?: string | null
    }

    if (!status && !role && bureau_position === undefined && ca_position === undefined) {
      return NextResponse.json(
        { error: 'Paramètres manquants: status, role, bureau_position ou ca_position requis' },
        { status: 400 }
      )
    }

    // Changer le statut
    if (status) {
      const result = await updateMemberStatus(id, status)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    // Changer le rôle
    if (role) {
      const result = await updateMemberRole(id, role)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    // Changer les positions bureau/CA
    if (bureau_position !== undefined || ca_position !== undefined) {
      const result = await updateMemberPositions(
        id,
        bureau_position !== undefined ? bureau_position : null,
        ca_position !== undefined ? ca_position : null,
      )
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
    console.error('PATCH /api/members/[id] error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
