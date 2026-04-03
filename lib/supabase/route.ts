import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Member } from '@/lib/supabase/types'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      members: [],
      error: 'Variables Supabase non configurées.',
    })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase.from('members').select('*')

    if (error) {
      return NextResponse.json({
        members: [],
        error: `Supabase: ${error.message}${error.hint ? ` (${error.hint})` : ''}`,
      })
    }

    return NextResponse.json({
      members: (data || []) as Member[],
      total: data?.length || 0,
    })
  } catch (err: any) {
    return NextResponse.json({
      members: [],
      error: err.message || 'Erreur serveur.',
    })
  }
}
