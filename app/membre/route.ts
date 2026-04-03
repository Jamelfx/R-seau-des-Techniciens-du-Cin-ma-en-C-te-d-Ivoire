import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      members: [],
      error: 'Variables Supabase non configurees.',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase.from('members').select('*').order('date', { ascending: false })

    if (error) {
      return NextResponse.json({
        members: [],
        error: `Supabase: ${error.message}${error.hint ? ` (${error.hint})` : ''}`,
      })
    }

    return NextResponse.json({
      members: data || [],
      total: data?.length || 0,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur.'
    return NextResponse.json({
      members: [],
      error: message,
    })
  }
}
