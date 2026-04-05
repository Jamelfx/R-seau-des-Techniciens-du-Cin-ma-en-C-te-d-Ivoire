// Types correspondant à la vraie table Supabase members
// Structure réelle : id, member_id, first_name, last_name, email, phone, date
// Colonnes à ajouter via SQL : status, role

export type MemberStatus = 'active' | 'pending' | 'suspended' | 'invited'
export type MemberRole = 'member' | 'director' | 'president' | 'treasurer'

export interface Member {
  id: string
  member_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  date: string | null
  // Colonnes optionnelles (peuvent ne pas exister encore)
  status?: MemberStatus | null
  role?: MemberRole | null
  gender?: string | null
  profession?: string | null
  invited_by?: string | null
  created_at?: string | null
  profile_photo?: string | null
  bureau_position?: string | null
  ca_position?: string | null
}
