import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { MemberStatus, MemberRole, Member } from '@/lib/supabase/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null

function isConfigured(): boolean {
  return !!supabase
}

// ═══════════════════════════════════════════════════════════════════════
// Récupérer tous les membres
// ═══════════════════════════════════════════════════════════════════════
export async function getAllMembers(): Promise<Member[]> {
  if (!isConfigured()) {
    return []
  }

  const { data, error } = await supabase!
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // Si created_at n'existe pas, essayer sans order
    const { data: data2, error: error2 } = await supabase!
      .from('members')
      .select('*')

    if (error2) {
      console.error('Erreur getAllMembers:', error2)
      return []
    }
    return (data2 || []) as Member[]
  }

  return (data || []) as Member[]
}

// ═══════════════════════════════════════════════════════════════════════
// Changer le statut d'un membre
// ═══════════════════════════════════════════════════════════════════════
export async function updateMemberStatus(
  memberId: string,
  newStatus: MemberStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: 'Supabase non configuré' }
  }

  const { error } = await supabase!
    .from('members')
    .update({ status: newStatus })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════
// Changer le rôle d'un membre (avec contrainte d'unicité)
// ═══════════════════════════════════════════════════════════════════════
export async function updateMemberRole(
  memberId: string,
  newRole: MemberRole
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: 'Supabase non configuré' }
  }

  const uniqueRoles: MemberRole[] = ['director', 'president', 'treasurer']

  // Si c'est un rôle unique, vérifier s'il est déjà pris
  if (uniqueRoles.includes(newRole)) {
    const { data: currentHolder } = await supabase!
      .from('members')
      .select('id, role')
      .eq('role', newRole)
      .neq('id', memberId)
      .single()

    if (currentHolder) {
      // Rétrograder l'ancien titulaire
      const { error: retrogradeError } = await supabase!
        .from('members')
        .update({ role: 'member' })
        .eq('id', currentHolder.id)

      if (retrogradeError) {
        return { success: false, error: `Erreur rétrogradation: ${retrogradeError.message}` }
      }
    }
  }

  // Assigner le nouveau rôle
  const { error } = await supabase!
    .from('members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════
// Mettre à jour les positions bureau / CA d'un membre
// ═══════════════════════════════════════════════════════════════════════
export async function updateMemberPositions(
  memberId: string,
  bureau_position: string | null,
  ca_position: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) {
    return { success: false, error: 'Supabase non configuré' }
  }

  const { error } = await supabase!
    .from('members')
    .update({ bureau_position, ca_position })
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
