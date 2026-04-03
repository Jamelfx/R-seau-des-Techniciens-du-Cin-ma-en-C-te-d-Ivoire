import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Variables Supabase non configurees.' }, { status: 500 })
  }

  // Lire le jeton depuis les cookies
  const cookieStore = await cookies()
  let accessToken = ''
  for (const [name, value] of cookieStore.getAll()) {
    if (name.includes('-auth-token')) {
      try {
        const parsed = JSON.parse(value)
        accessToken = Array.isArray(parsed) ? (parsed[0] || '') : value
      } catch {
        accessToken = value
      }
      break
    }
  }

  // Créer le client avec service_role ou jeton utilisateur
  const options: { global?: { headers?: { Authorization?: string } } } = {}
  if (serviceRoleKey) {
    options.global = { headers: { Authorization: `Bearer ${serviceRoleKey}` } }
  } else if (accessToken) {
    options.global = { headers: { Authorization: `Bearer ${accessToken}` } }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

  try {
    const { id } = await params
    const body = await request.json()
    const { status, role } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID manquant.' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (role) updates.role = role

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'Aucune donnee a mettre a jour.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur API members PATCH:', error)
      return NextResponse.json({ success: false, error: `Supabase: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, member: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    console.error('Erreur API members PATCH catch:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
