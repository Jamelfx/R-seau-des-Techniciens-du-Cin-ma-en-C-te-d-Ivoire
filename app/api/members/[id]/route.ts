import { NextRequest, NextResponse } from 'next/server'
import { updateMemberStatus, updateMemberRole } from '@/lib/supabase/server'
import type { MemberStatus, MemberRole } from '@/lib/supabase/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, role } = body as { status?: MemberStatus; role?: MemberRole }

    if (!status && !role) {
      return NextResponse.json(
        { error: 'Parametres manquants: status ou role requis' },
        { status: 400 }
      )
    }

    if (status) {
      const result = await updateMemberStatus(id, status)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    if (role) {
      const result = await updateMemberRole(id, role)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise a jour'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
