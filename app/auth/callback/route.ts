import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignoré dans les Server Components
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Vérifier le rôle du membre pour rediriger au bon endroit
      const { data: memberData } = await supabase
        .from('members')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single()

      const role = memberData?.role || data.user.user_metadata?.role || 'member'

      if (role === 'director') {
        return NextResponse.redirect(`${origin}/admin/directeur`)
      } else if (role === 'president') {
        return NextResponse.redirect(`${origin}/admin/president`)
      } else if (role === 'treasurer') {
        return NextResponse.redirect(`${origin}/admin/tresorier`)
      } else {
        return NextResponse.redirect(`${origin}/membre/dashboard`)
      }
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(`${origin}/connexion?error=auth_error`)
}
