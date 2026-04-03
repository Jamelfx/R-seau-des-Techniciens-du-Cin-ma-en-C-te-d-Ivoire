import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Variables Supabase non configurees.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const body = await request.json()
    const { status, role } = body
    if (!status && !role) {
      return NextResponse.json({ error: 'Aucune donnee a mettre a jour.' }, { status: 400 })
    }

    const uniqueRoles = ['director', 'president', 'treasurer']
    if (role && uniqueRoles.includes(role)) {
      const { data: currentHolder } = await supabase.from('members').select('id').eq('role', role).neq('id', id).single()
      if (currentHolder) {
        const { error: re } = await supabase.from('members').update({ role: 'member' }).eq('id', currentHolder.id)
        if (re) return NextResponse.json({ error: re.message }, { status: 500 })
      }
    }

    const updateData: Record<string, string> = {}
    if (status) updateData.status = status
    if (role) updateData.role = role

    const { error } = await supabase.from('members').update(updateData).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, id, updated: updateData })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
