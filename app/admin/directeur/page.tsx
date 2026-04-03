"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Shield, User, Crown, Wallet, CheckCircle, XCircle, Search,
  UserCheck, UserX, ChevronRight, AlertTriangle, Loader2,
  Clapperboard, LogOut, Eye, Mail, Clock, Ban, ArrowRightLeft
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
type MemberStatus = 'active' | 'pending' | 'suspended' | 'invited'
type MemberRole = 'member' | 'director' | 'president' | 'treasurer'

interface MemberItem {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  profile_photo: string | null
  status: MemberStatus
  role: MemberRole
  created_at: string
  invited_by: string | null
  gender: string | null
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════
const UNIQUE_ROLES: MemberRole[] = ['director', 'president', 'treasurer']

const ROLE_CONFIG: Record<MemberRole, {
  label: string
  icon: typeof Shield
  color: string
  bg: string
  border: string
  description: string
}> = {
  member: {
    label: 'Membre',
    icon: User,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    description: 'Espace membre standard',
  },
  director: {
    label: 'Directeur Exécutif',
    icon: Shield,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    description: 'Gestion complète des membres et rôles',
  },
  president: {
    label: 'Président du CA',
    icon: Crown,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    description: 'Validation des adhésions, convocation AG',
  },
  treasurer: {
    label: 'Trésorière',
    icon: Wallet,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    description: 'Gestion financière et cotisations',
  },
}

const STATUS_CONFIG: Record<MemberStatus, {
  label: string
  color: string
  icon: typeof CheckCircle
}> = {
  active: { label: 'Actif', color: 'bg-green-500 text-white', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-yellow-500 text-white', icon: Clock },
  suspended: { label: 'Suspendu', color: 'bg-red-500 text-white', icon: Ban },
  invited: { label: 'Invité', color: 'bg-blue-500 text-white', icon: Mail },
}

// ═══════════════════════════════════════════════════════════════════════
// DONNÉES MOCK — Remplacer par Supabase dans votre vrai projet
// ═══════════════════════════════════════════════════════════════════════
const MOCK_MEMBERS: MemberItem[] = [
  {
    id: '1', member_id: 'RTC-001', first_name: 'Kouadio', last_name: 'Aka',
    email: 'ka@retechci.org', phone: '+225 07 XX XX XX', profession: 'Directeur Exécutif',
    profile_photo: null, status: 'active', role: 'director', created_at: '2024-01-15',
    invited_by: null, gender: 'male',
  },
  {
    id: '2', member_id: 'RTC-002', first_name: 'Yao', last_name: 'Konan',
    email: 'yk@retechci.org', phone: '+225 05 XX XX XX', profession: 'Président du CA',
    profile_photo: null, status: 'active', role: 'president', created_at: '2024-02-10',
    invited_by: null, gender: 'male',
  },
  {
    id: '3', member_id: 'RTC-003', first_name: 'Aminata', last_name: 'Diallo',
    email: 'ad@retechci.org', phone: '+225 01 XX XX XX', profession: 'Trésorière',
    profile_photo: null, status: 'active', role: 'treasurer', created_at: '2024-03-01',
    invited_by: null, gender: 'female',
  },
  {
    id: '4', member_id: 'RTC-004', first_name: 'Jahmiu', last_name: 'Basiru',
    email: 'jb@retechci.org', phone: '+225 07 XX XX XX', profession: 'Monteur Image',
    profile_photo: null, status: 'active', role: 'member', created_at: '2024-04-20',
    invited_by: 'ka@retechci.org', gender: 'male',
  },
  {
    id: '5', member_id: 'RTC-005', first_name: 'Fatou', last_name: 'Coulibaly',
    email: 'fc@retechci.org', phone: '+225 05 XX XX XX', profession: 'Scripte',
    profile_photo: null, status: 'active', role: 'member', created_at: '2024-05-12',
    invited_by: 'ka@retechci.org', gender: 'female',
  },
  {
    id: '6', member_id: 'RTC-006', first_name: 'Olivier', last_name: 'Traoré',
    email: 'ot@retechci.org', phone: '+225 01 XX XX XX', profession: 'Chef Opérateur',
    profile_photo: null, status: 'invited', role: 'member', created_at: '2025-03-01',
    invited_by: 'ka@retechci.org', gender: 'male',
  },
  {
    id: '7', member_id: 'RTC-007', first_name: 'Mariam', last_name: 'Koné',
    email: 'mk@retechci.org', phone: '+225 07 XX XX XX', profession: 'Régisseuse',
    profile_photo: null, status: 'invited', role: 'member', created_at: '2025-03-10',
    invited_by: 'ka@retechci.org', gender: 'female',
  },
  {
    id: '8', member_id: 'RTC-008', first_name: 'Ibrahim', last_name: 'Diabaté',
    email: 'id@retechci.org', phone: '+225 05 XX XX XX', profession: 'Ingénieur Son',
    profile_photo: null, status: 'suspended', role: 'member', created_at: '2024-06-01',
    invited_by: null, gender: 'male',
  },
  {
    id: '9', member_id: 'RTC-009', first_name: 'Aïssata', last_name: 'Bamba',
    email: 'ab@retechci.org', phone: '+225 01 XX XX XX', profession: 'Monteuse',
    profile_photo: null, status: 'pending', role: 'member', created_at: '2025-03-25',
    invited_by: null, gender: 'female',
  },
  {
    id: '10', member_id: 'RTC-010', first_name: 'Koffi', last_name: 'Yao',
    email: 'ky@retechci.org', phone: '+225 07 XX XX XX', profession: 'Éclairagiste',
    profile_photo: null, status: 'invited', role: 'member', created_at: '2025-03-28',
    invited_by: 'ka@retechci.org', gender: 'male',
  },
]

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : ConfirmDialog — Dialogue de confirmation
// ═══════════════════════════════════════════════════════════════════════
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  variant = 'default',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel: string
  variant?: 'default' | 'destructive' | 'success'
  loading?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'destructive' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {variant === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : variant === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RoleAssignDialog — Assigner un rôle avec contrainte d'unicité
// ═══════════════════════════════════════════════════════════════════════
function RoleAssignDialog({
  member,
  members,
  open,
  onClose,
  onAssign,
  loading = false,
}: {
  member: MemberItem
  members: MemberItem[]
  open: boolean
  onClose: () => void
  onAssign: (roleId: MemberRole) => void
  loading?: boolean
}) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>('member')

  // Vérifier si le rôle sélectionné est déjà pris par quelqu'un d'autre
  const currentHolder = useMemo(() => {
    if (!UNIQUE_ROLES.includes(selectedRole)) return null
    return members.find(m => m.role === selectedRole && m.id !== member.id)
  }, [selectedRole, members, member.id])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gérer le rôle de {member.first_name} {member.last_name}
          </DialogTitle>
          <DialogDescription>
            Rôle actuel : <strong>{ROLE_CONFIG[member.role].label}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Rôle actuel */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Rôle actuel</p>
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = ROLE_CONFIG[member.role].icon
                return <Icon className={`h-5 w-5 ${ROLE_CONFIG[member.role].color}`} />
              })()}
              <span className="font-medium">{ROLE_CONFIG[member.role].label}</span>
            </div>
          </div>

          {/* Nouveau rôle */}
          <div>
            <Label>Nouveau rôle</Label>
            <Select
              value={selectedRole}
              onValueChange={(v) => setSelectedRole(v as MemberRole)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" /> Membre
                  </span>
                </SelectItem>
                {UNIQUE_ROLES.map((role) => {
                  const config = ROLE_CONFIG[role]
                  const Icon = config.icon
                  const taken = members.find(m => m.role === role && m.id !== member.id)
                  return (
                    <SelectItem key={role} value={role} disabled={!!taken && member.role !== role}>
                      <span className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                        {taken && member.role !== role && (
                          <span className="text-[10px] text-red-500">(occupé par {taken.first_name} {taken.last_name})</span>
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Avertissement si le rôle est déjà pris */}
          {currentHolder && selectedRole !== member.role && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold">Ce rôle est actuellement occupé.</p>
                <p className="mt-1">
                  <strong>{currentHolder.first_name} {currentHolder.last_name}</strong> ({currentHolder.member_id})
                  perdra son rôle de <strong>{ROLE_CONFIG[selectedRole].label}</strong> et deviendra Membre.
                </p>
              </div>
            </div>
          )}

          {/* Avertissement si on enlève un rôle admin */}
          {member.role !== 'member' && selectedRole === 'member' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <InfoIcon className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                {member.first_name} {member.last_name} perdra son accès à l&apos;espace Admin
                et ne conservra que l&apos;espace Membre.
              </p>
            </div>
          )}

          {/* Info du nouveau rôle */}
          {ROLE_CONFIG[selectedRole] && (
            <div className={`p-3 rounded-lg border ${ROLE_CONFIG[selectedRole].bg} ${ROLE_CONFIG[selectedRole].border}`}>
              <p className="text-xs text-muted-foreground">{ROLE_CONFIG[selectedRole].description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={() => onAssign(selectedRole)}
              disabled={loading || (currentHolder && selectedRole !== member.role)}
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Icône info simple
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : MemberRow — Ligne d'un membre dans la liste
// ═══════════════════════════════════════════════════════════════════════
function MemberRow({
  member,
  directorId,
  onActivate,
  onReactivate,
  onRoleChange,
}: {
  member: MemberItem
  directorId: string
  onActivate: (m: MemberItem) => void
  onReactivate: (m: MemberItem) => void
  onRoleChange: (m: MemberItem) => void
}) {
  const isDirector = member.id === directorId
  const statusConf = STATUS_CONFIG[member.status]
  const roleConf = ROLE_CONFIG[member.role]
  const StatusIcon = statusConf.icon
  const RoleIcon = roleConf.icon

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={member.profile_photo || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
          {member.first_name[0]}{member.last_name[0]}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">
            {member.first_name} {member.last_name}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {member.member_id}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground truncate">{member.profession}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground truncate">{member.email}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge className={`${statusConf.color} text-[10px] gap-1 px-1.5`}>
          <StatusIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{statusConf.label}</span>
        </Badge>
        <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 ${roleConf.bg} ${roleConf.color} ${roleConf.border} border`}>
          <RoleIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{roleConf.label}</span>
        </Badge>
      </div>

      {/* Actions */}
      {!isDirector && (
        <div className="flex items-center gap-1 shrink-0">
          {member.status === 'invited' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
              onClick={() => onActivate(member)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Activer</span>
            </Button>
          )}
          {member.status === 'suspended' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50"
              onClick={() => onReactivate(member)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Réactiver</span>
            </Button>
          )}
          {member.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => onRoleChange(member)}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rôle</span>
            </Button>
          )}
        </div>
      )}

      {/* Indicateur Directeur */}
      {isDirector && (
        <Badge className="bg-amber-500/20 text-amber-700 border-amber-300 border text-[10px] gap-1 px-1.5">
          <Shield className="h-3 w-3" />
          Vous
        </Badge>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — ADMIN DASHBOARD (Directeur Exécutif)
// ═══════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [members, setMembers] = useState<MemberItem[]>(MOCK_MEMBERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Dialogues
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'destructive' | 'success'
    onConfirm: () => void
  }>({ open: false, title: '', description: '', confirmLabel: '', variant: 'default', onConfirm: () => {} })

  const [roleDialogMember, setRoleDialogMember] = useState<MemberItem | null>(null)

  // Le directeur actuel
  const director = members.find(m => m.role === 'director')!

  // ═══════════════════════════════════════════════════════════════════
  // FILTRES
  // ═══════════════════════════════════════════════════════════════════
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !searchQuery ||
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus = statusFilter === 'all' || m.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [members, searchQuery, statusFilter])

  // Statistiques
  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    invited: members.filter(m => m.status === 'invited').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    pending: members.filter(m => m.status === 'pending').length,
  }), [members])

  // Rôles occupés
  const occupiedRoles = useMemo(() => {
    const map: Partial<Record<MemberRole, MemberItem>> = {}
    UNIQUE_ROLES.forEach(role => {
      const holder = members.find(m => m.role === role)
      if (holder) map[role] = holder
    })
    return map
  }, [members])

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════
  const handleActivate = (member: MemberItem) => {
    setConfirmDialog({
      open: true,
      title: `Activer ${member.first_name} ${member.last_name}`,
      description: `Ce membre passera du statut "Invité" à "Actif" et aura accès à son espace membre.`,
      confirmLabel: 'Activer',
      variant: 'success',
      onConfirm: () => executeAction('activate', member),
    })
  }

  const handleReactivate = (member: MemberItem) => {
    setConfirmDialog({
      open: true,
      title: `Réactiver ${member.first_name} ${member.last_name}`,
      description: `Ce membre était suspendu. Il retrouvera l'accès à son espace membre.`,
      confirmLabel: 'Réactiver',
      variant: 'success',
      onConfirm: () => executeAction('reactivate', member),
    })
  }

  const handleRoleChange = (member: MemberItem) => {
    setRoleDialogMember(member)
  }

  const executeRoleChange = (newRole: MemberRole) => {
    if (!roleDialogMember) return

    /*
    ═══════════════════════════════════════════════════════════════
    DANS VOTRE VRAI PROJET, remplacez par un appel Supabase :
    ═══════════════════════════════════════════════════════════════

    const supabase = createClient()

    // 1. Si le rôle est unique et déjà pris, rétrograder l'ancien
    if (UNIQUE_ROLES.includes(newRole)) {
      const currentHolder = members.find(m => m.role === newRole && m.id !== roleDialogMember.id)
      if (currentHolder) {
        await supabase.from('members').update({ role: 'member' }).eq('id', currentHolder.id)
      }
    }

    // 2. Assigner le nouveau rôle
    await supabase.from('members').update({ role: newRole }).eq('id', roleDialogMember.id)

    ═══════════════════════════════════════════════════════════════
    */

    setLoading(true)

    // Simuler le délai API
    setTimeout(() => {
      setMembers(prev => {
        return prev.map(m => {
          // Rétrograder l'ancien titulaire du rôle
          if (UNIQUE_ROLES.includes(newRole) && m.role === newRole && m.id !== roleDialogMember!.id) {
            return { ...m, role: 'member' as MemberRole }
          }
          // Assigner le nouveau rôle
          if (m.id === roleDialogMember!.id) {
            return { ...m, role: newRole }
          }
          return m
        })
      })
      setLoading(false)
      setRoleDialogMember(null)
    }, 800)
  }

  const executeAction = (action: 'activate' | 'reactivate', member: MemberItem) => {
    /*
    ═══════════════════════════════════════════════════════════════
    DANS VOTRE VRAI PROJET, remplacez par :
    ═══════════════════════════════════════════════════════════════
    const supabase = createClient()
    const { error } = await supabase
      .from('members')
      .update({ status: 'active' })
      .eq('id', member.id)
    ═══════════════════════════════════════════════════════════════
    */

    setLoading(true)
    setTimeout(() => {
      setMembers(prev => prev.map(m =>
        m.id === member.id ? { ...m, status: 'active' as MemberStatus } : m
      ))
      setLoading(false)
      setConfirmDialog(prev => ({ ...prev, open: false }))
    }, 800)
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Bandeau Directeur */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

      {/* Barre du haut */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-md p-1.5">
              <Clapperboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">RETECHCI</span>
            <Separator orientation="vertical" className="h-5" />
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 px-2.5 py-0.5 text-xs font-semibold">
              <Shield className="h-3 w-3 mr-1" />Espace Directeur
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Lien vers espace membre */}
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Espace Membre</span>
            </Button>
            {/* Profil Directeur */}
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-amber-500 text-white">
                  {director.first_name[0]}{director.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">
                {director.first_name} {director.last_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Bannière Directeur */}
        <Card className="bg-amber-50 border-amber-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300">
                <Shield className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-800">
                  Espace Directeur Exécutif
                </h1>
                <p className="text-sm text-amber-700">
                  Gestion des membres, activation des invitations et attribution des rôles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Règles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {UNIQUE_ROLES.map(role => {
            const config = ROLE_CONFIG[role]
            const Icon = config.icon
            const holder = occupiedRoles[role]
            return (
              <Card key={role} className={`${config.bg} ${config.border} border`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <span className="font-semibold text-sm">{config.label}</span>
                  </div>
                  {holder ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-white text-foreground">
                          {holder.first_name[0]}{holder.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {holder.first_name} {holder.last_name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Non assigné</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
            { label: 'Actifs', value: stats.active, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Invités', value: stats.invited, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'En attente', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Suspendus', value: stats.suspended, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recherche + Filtre */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Gestion des membres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="invited">Invités</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Liste des membres */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre trouvé</p>
                </div>
              ) : (
                filteredMembers.map(member => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    directorId={director.id}
                    onActivate={handleActivate}
                    onReactivate={handleReactivate}
                    onRoleChange={handleRoleChange}
                  />
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} affiché{filteredMembers.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RETECHCI — Espace Directeur Exécutif
          </p>
        </div>
      </footer>

      {/* ═══════ DIALOGUES ═══════ */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        loading={loading}
      />

      {roleDialogMember && (
        <RoleAssignDialog
          member={roleDialogMember}
          members={members}
          open={!!roleDialogMember}
          onClose={() => setRoleDialogMember(null)}
          onAssign={executeRoleChange}
          loading={loading}
        />
      )}
    </div>
  )
}
