import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ members: [], error: 'Variables Supabase non configurees.' })
  }

  const options: { global?: { headers?: { Authorization?: string } } } = {}
  if (serviceRoleKey) {
    options.global = { headers: { Authorization: `Bearer ${serviceRoleKey}` } }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')

    if (error) {
      console.error('Erreur API members GET:', error)
      return NextResponse.json({ members: [], error: `Supabase: ${error.message}` })
    }
    return NextResponse.json({ members: data || [], total: data?.length || 0 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    console.error('Erreur API members GET catch:', message)
    return NextResponse.json({ members: [], error: message })
  }
}
