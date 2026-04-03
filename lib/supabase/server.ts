import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { MemberStatus, MemberRole, Member } from '@/lib/supabase/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

function isConfigured(): boolean {
  return !!supabase
}

export async function getAllMembers(): Promise<Member[]> {
  if (!isConfigured()) return []
  const { data, error } = await supabase!.from('members').select('*')
  if (error) {
    console.error('Erreur getAllMembers:', error)
    return []
  }
  return (data || []) as Member[]
}

export async function updateMemberStatus(
  memberId: string,
  newStatus: MemberStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) return { success: false, error: 'Supabase non configuré' }
  const { error } = await supabase!.from('members').update({ status: newStatus }).eq('id', memberId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateMemberRole(
  memberId: string,
  newRole: MemberRole
): Promise<{ success: boolean; error?: string }> {
  if (!isConfigured()) return { success: false, error: 'Supabase non configuré' }

  const uniqueRoles: MemberRole[] = ['director', 'president', 'treasurer']
  if (uniqueRoles.includes(newRole)) {
    const { data: currentHolder } = await supabase!
      .from('members')
      .select('id, role')
      .eq('role', newRole)
      .neq('id', memberId)
      .single()
    if (currentHolder) {
      const { error: retrogradeError } = await supabase!
        .from('members')
        .update({ role: 'member' })
        .eq('id', currentHolder.id)
      if (retrogradeError) return { success: false, error: `Erreur: ${retrogradeError.message}` }
    }
  }

  const { error } = await supabase!.from('members').update({ role: newRole }).eq('id', memberId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}
