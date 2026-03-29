import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const invited = requestUrl.searchParams.get('invited')
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
            } catch {
              // Ignoré dans les Server Components
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const userEmail = data.user.email?.toLowerCase().trim()

      // ✅ CAS 1 — Connexion via lien d'invitation du Directeur
      if (invited === 'true') {
        // Vérifier que cet email est bien dans la liste des invités
        const { data: invitedData } = await supabase
          .from('invited_members')
          .select('id, used')
          .eq('email', userEmail)
          .single()

        if (!invitedData) {
          // Email non invité → accès refusé
          return NextResponse.redirect(`${origin}/acces-refuse`)
        }

        // Marquer l'invitation comme utilisée
        await supabase
          .from('invited_members')
          .update({ used: true })
          .eq('email', userEmail)

        // Créer ou mettre à jour le membre dans la table members
        const { data: existingMember } = await supabase
          .from('members')
          .select('id')
          .eq('email', userEmail)
          .single()

        if (!existingMember) {
          // Créer le profil membre de base
          const memberId = `CI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
          await supabase.from('members').insert({
            member_id: memberId,
            email: userEmail,
            auth_user_id: data.user.id,
            first_name: data.user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            profile_photo: data.user.user_metadata?.avatar_url || null,
            status: 'active',
            role: 'member',
            adhesion_paid: true, // Invité directement par le Directeur
          })
        } else {
          // Mettre à jour l'auth_user_id si le membre existe déjà
          await supabase
            .from('members')
            .update({ auth_user_id: data.user.id, status: 'active' })
            .eq('email', userEmail)
        }

        return NextResponse.redirect(`${origin}/membre/dashboard`)
      }

      // ✅ CAS 2 — Connexion normale (email + mot de passe ou Google)
      // Vérifier le rôle du membre pour rediriger au bon endroit
      const { data: memberData } = await supabase
        .from('members')
        .select('role, status')
        .eq('auth_user_id', data.user.id)
        .single()

      // Si le membre n'existe pas dans la table → accès refusé
      if (!memberData) {
        // Vérifier par email comme fallback
        const { data: memberByEmail } = await supabase
          .from('members')
          .select('role, status')
          .eq('email', userEmail)
          .single()

        if (!memberByEmail) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/acces-refuse`)
        }

        const role = memberByEmail.role || 'member'
        return NextResponse.redirect(`${origin}/${getRoleRedirect(role)}`)
      }

      const role = memberData.role || 'member'
      return NextResponse.redirect(`${origin}/${getRoleRedirect(role)}`)
    }
  }

  // En cas d'erreur → page de connexion
  return NextResponse.redirect(`${origin}/connexion?error=auth_error`)
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'director': return 'admin/directeur'
    case 'president': return 'admin/president'
    case 'treasurer': return 'admin/tresorier'
    default: return 'membre/dashboard'
  }
}
