import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cette route sert UNIQUEMENT au débug — à supprimer en production
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // 1. Vérifier les variables d'environnement
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Variables Supabase manquantes',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓ configurée' : '✗ manquante',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓ configurée' : '✗ manquante',
      },
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 2. Tenter de lire la table members
  const { data, error, count } = await supabase
    .from('members')
    .select('*', { count: 'exact' })

  if (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erreur lecture table members',
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      },
      env: {
        NEXT_PUBLIC_SUPABASE_URL: '✓ configurée',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '✓ configurée',
      },
    }, { status: 500 })
  }

  // 3. Analyser la structure des données
  const columns = data && data.length > 0
    ? Object.keys(data[0])
    : []

  // 4. Analyser les valeurs possibles pour status et role
  const statuses = [...new Set((data || []).map((m: any) => m.status).filter(Boolean))]
  const roles = [...new Set((data || []).map((m: any) => m.role).filter(Boolean))]

  // 5. Identifier les colonnes manquantes par rapport à notre interface
  const expectedColumns = [
    'id', 'member_id', 'first_name', 'last_name', 'email', 'phone',
    'profession', 'years_experience', 'profile_photo', 'availability',
    'status', 'role', 'birth_date', 'birth_place', 'biography',
    'membership_level', 'category', 'gender', 'created_at', 'invited_by',
  ]
  const missingColumns = expectedColumns.filter(c => !columns.includes(c))
  const extraColumns = columns.filter((c: string) => !expectedColumns.includes(c))

  return NextResponse.json({
    status: 'ok',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: '✓ configurée',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '✓ configurée',
    },
    table: 'members',
    total: count || 0,
    returned: data?.length || 0,
    columns: {
      found: columns,
      missing: missingColumns,
      extra: extraColumns,
    },
    values: {
      statuses,
      roles,
    },
    members: (data || []).map((m: any) => ({
      id: m.id,
      member_id: m.member_id,
      first_name: m.first_name,
      last_name: m.last_name,
      email: m.email,
      status: m.status,
      role: m.role,
      profession: m.profession,
      invited_by: m.invited_by,
      created_at: m.created_at,
    })),
  })
}
