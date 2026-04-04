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
    const { data: meeting, error } = await supabase.from('meetings').select('*').eq('id', id).single()
    if (error || !meeting) return NextResponse.json({ error: 'Réunion introuvable.' }, { status: 404 })
    const { count, error: countError } = await supabase.from('meeting_attendance').select('*', { count: 'exact', head: true }).eq('meeting_id', id).eq('status', 'confirmed')
    return NextResponse.json({ meeting, attendance_count: countError ? null : (count ?? 0) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await supabase.from('meetings').update(body).eq('id', id).select().single()
    if (error || !data) return NextResponse.json({ error: 'Erreur mise à jour.' }, { status: 500 })
    return NextResponse.json({ meeting: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const { id } = await params
    await supabase.from('meeting_attendance').delete().eq('meeting_id', id)
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Erreur suppression.' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
