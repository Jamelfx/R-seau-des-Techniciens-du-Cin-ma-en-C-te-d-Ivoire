import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase non configuré.' }, { status: 500 })
  try {
    const body = await request.json() as { code: string }
    if (!body.code || !body.code.trim()) {
      return NextResponse.json({ error: 'Le champ "code" est requis.' }, { status: 400 })
    }
    const code = body.code.trim()
    const isEmail = code.includes('@')

    let query = supabase.from('members').select('*')
    if (isEmail) {
      query = query.ilike('email', code)
    } else {
      query = query.eq('member_id', code)
    }

    const { data: member, error } = await query.single()
    if (error || !member) {
      return NextResponse.json({
        found: false,
        error: isEmail ? `Aucun membre trouvé avec l'email "${code}".` : `Aucun membre trouvé avec le numéro "${code}".`,
      }, { status: 404 })
    }
    return NextResponse.json({ found: true, member, search_type: isEmail ? 'email' : 'member_id' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
