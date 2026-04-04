import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const { id } = await params
    const { data: meeting, error: meetingError } = await supabase.from('meetings').select('id, title').eq('id', id).single()
    if (meetingError || !meeting) return NextResponse.json({ error: 'Réunion introuvable.' }, { status: 404 })

    const { data: attendance, error } = await supabase
      .from('meeting_attendance')
      .select(`*, member:members(id, member_id, first_name, last_name, email)`)
      .eq('meeting_id', id)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })

    const confirmed = (attendance || []).filter((r: any) => r.status === 'confirmed').length
    const declined = (attendance || []).filter((r: any) => r.status === 'declined').length

    return NextResponse.json({
      meeting: { id: meeting.id, title: meeting.title },
      attendance: attendance || [],
      summary: { total: attendance?.length || 0, confirmed, declined },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const { id } = await params
    const body = await request.json() as { member_id: string; status: string }
    if (!body.member_id || !body.status) {
      return NextResponse.json({ error: 'member_id et status requis.' }, { status: 400 })
    }

    const { data: meeting, error: meetingError } = await supabase.from('meetings').select('id').eq('id', id).single()
    if (meetingError || !meeting) return NextResponse.json({ error: 'Réunion introuvable.' }, { status: 404 })

    const { data, error } = await supabase
      .from('meeting_attendance')
      .upsert({ meeting_id: id, member_id: body.member_id, status: body.status }, { onConflict: 'meeting_id,member_id' })
      .select(`*, member:members(id, member_id, first_name, last_name, email)`)
      .single()
    if (error) return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })
    return NextResponse.json({ attendance: data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
