import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type MeetingType = 'ordinary' | 'extraordinary' | 'electoral'

interface CreateMeetingBody {
  title: string
  type: MeetingType
  description?: string
  date: string
  time?: string
  location?: string
  agenda?: string
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  }
  try {
    const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: false })
    if (error) {
      return NextResponse.json({ error: `Erreur Supabase: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ meetings: data || [], total: data?.length || 0 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  }
  try {
    const body = await request.json() as CreateMeetingBody
    if (!body.title || !body.type || !body.date) {
      return NextResponse.json({ error: 'Titre, type et date requis.' }, { status: 400 })
    }
    const meetingData: Record<string, unknown> = {
      title: body.title.trim(),
      type: body.type,
      date: body.date,
      status: 'upcoming',
    }
    if (body.description) meetingData.description = body.description
    if (body.time) meetingData.time = body.time
    if (body.location) meetingData.location = body.location
    if (body.agenda) meetingData.agenda = body.agenda

    const { data, error } = await supabase.from('meetings').insert(meetingData).select().single()
    if (error) {
      return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ meeting: data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
