"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Shield, User, Crown, Wallet, CheckCircle, Search,
  UserCheck, UserX, AlertTriangle, Loader2,
  Mail, Clock, Ban, Users, Database,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Member, MemberStatus, MemberRole } from "@/lib/supabase/types"

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
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-800',
    description: 'Espace membre standard',
  },
  director: {
    label: 'Directeur Exécutif',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    description: 'Gestion complète des membres et rôles',
  },
  president: {
    label: 'Président du CA',
    icon: Crown,
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-800',
    description: 'Validation des adhésions, convocation AG',
  },
  treasurer: {
    label: 'Trésorière',
    icon: Wallet,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800',
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
// API HELPER
// ═══════════════════════════════════════════════════════════════════════
async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/members')
  if (!res.ok) throw new Error('Erreur de chargement')
  const json = await res.json()
  return json.members || []
}

async function patchMember(id: string, data: { status?: MemberStatus; role?: MemberRole }): Promise<boolean> {
  const res = await fetch(`/api/members/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur de mise à jour')
  return true
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : ConfirmDialog
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
            {variant === 'destructive' && <AlertTriangle className="h-5 w-5 text-destructive" />}
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
            className={`flex-1 ${variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : variant === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RoleAssignDialog
// ═══════════════════════════════════════════════════════════════════════
function RoleAssignDialog({
  member,
  members,
  open,
  onClose,
  onAssign,
  loading = false,
}: {
  member: Member
  members: Member[]
  open: boolean
  onClose: () => void
  onAssign: (roleId: MemberRole) => void
  loading?: boolean
}) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>('member')

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
                          <span className="text-[10px] text-destructive">(occupé par {taken.first_name} {taken.last_name})</span>
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
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive">
                <p className="font-semibold">Ce rôle est actuellement occupé.</p>
                <p className="mt-1">
                  <strong>{currentHolder.first_name} {currentHolder.last_name}</strong> ({currentHolder.member_id})
                  perdra son rôle et deviendra Membre.
                </p>
              </div>
            </div>
          )}

          {/* Avertissement si on enlève un rôle admin */}
          {member.role !== 'member' && selectedRole === 'member' && (
            <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <p className="text-xs text-muted-foreground">
                {member.first_name} {member.last_name} perdra son accès à l&apos;espace Admin
                et ne conservera que l&apos;espace Membre.
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
              disabled={loading}
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

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : MemberRow
// ═══════════════════════════════════════════════════════════════════════
function MemberRow({
  member,
  directorId,
  onActivate,
  onReactivate,
  onRoleChange,
  onSuspend,
}: {
  member: Member
  directorId: string
  onActivate: (m: Member) => void
  onReactivate: (m: Member) => void
  onRoleChange: (m: Member) => void
  onSuspend: (m: Member) => void
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
          {member.first_name?.[0]}{member.last_name?.[0]}
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
          {isDirector && (
            <Badge className="bg-primary/20 text-primary border-primary/30 border text-[10px] gap-1 px-1.5">
              <Shield className="h-3 w-3" />
              Vous
            </Badge>
          )}
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

      {/* Actions — uniquement si ce n'est pas le directeur */}
      {!isDirector && (
        <div className="flex items-center gap-1 shrink-0">
          {member.status === 'invited' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30"
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
              className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={() => onReactivate(member)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Réactiver</span>
            </Button>
          )}
          {member.status === 'active' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
                onClick={() => onRoleChange(member)}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Rôle</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => onSuspend(member)}
              >
                <UserX className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Suspendre</span>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RoleCard — Affiche le titulaire d'un rôle unique
// ═══════════════════════════════════════════════════════════════════════
function RoleCard({
  role,
  holder,
}: {
  role: MemberRole
  holder: Member | undefined
}) {
  const config = ROLE_CONFIG[role]
  const Icon = config.icon

  return (
    <Card className={`${config.bg} ${config.border} border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        {holder ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-background text-foreground">
                {holder.first_name?.[0]}{holder.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{holder.first_name} {holder.last_name}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Non assigné</p>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — DIRECTEUR EXÉCUTIF
// ═══════════════════════════════════════════════════════════════════════
export default function DirectorDashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState(false)

  // Dialogues
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'destructive' | 'success'
    onConfirm: () => void
  }>({ open: false, title: '', description: '', confirmLabel: '', variant: 'default', onConfirm: () => {} })

  const [roleDialogMember, setRoleDialogMember] = useState<Member | null>(null)

  // ═══════════════════════════════════════════════════════════════════
  // CHARGEMENT DES MEMBRES VIA API
  // ═══════════════════════════════════════════════════════════════════
  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMembers()
      setMembers(data)
    } catch (err: any) {
      console.error('Erreur chargement:', err)
      setError(err.message || 'Erreur de connexion à la base de données')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Le directeur actuel
  const director = members.find(m => m.role === 'director')

  // ═══════════════════════════════════════════════════════════════════
  // FILTRES & STATS
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

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    invited: members.filter(m => m.status === 'invited').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    pending: members.filter(m => m.status === 'pending').length,
  }), [members])

  const occupiedRoles = useMemo(() => {
    const map: Partial<Record<MemberRole, Member>> = {}
    UNIQUE_ROLES.forEach(role => {
      const holder = members.find(m => m.role === role)
      if (holder) map[role] = holder
    })
    return map
  }, [members])

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS VIA API
  // ═══════════════════════════════════════════════════════════════════
  const handleActivate = (member: Member) => {
    setConfirmDialog({
      open: true,
      title: `Activer ${member.first_name} ${member.last_name}`,
      description: `Ce membre passera du statut "Invité" à "Actif" et aura accès à son espace membre.`,
      confirmLabel: 'Activer',
      variant: 'success',
      onConfirm: () => executeStatusChange('active', member),
    })
  }

  const handleReactivate = (member: Member) => {
    setConfirmDialog({
      open: true,
      title: `Réactiver ${member.first_name} ${member.last_name}`,
      description: `Ce membre était suspendu. Il retrouvera l'accès à son espace membre.`,
      confirmLabel: 'Réactiver',
      variant: 'success',
      onConfirm: () => executeStatusChange('active', member),
    })
  }

  const handleSuspend = (member: Member) => {
    setConfirmDialog({
      open: true,
      title: `Suspendre ${member.first_name} ${member.last_name}`,
      description: `Ce membre sera suspendu et perdra l'accès à son espace membre.`,
      confirmLabel: 'Suspendre',
      variant: 'destructive',
      onConfirm: () => executeStatusChange('suspended', member),
    })
  }

  const executeStatusChange = async (newStatus: MemberStatus, member: Member) => {
    setActionLoading(true)
    try {
      await patchMember(member.id, { status: newStatus })
      await loadMembers()
      setConfirmDialog(prev => ({ ...prev, open: false }))
    } catch (err) {
      console.error('Erreur changement statut:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRoleChange = (member: Member) => {
    setRoleDialogMember(member)
  }

  const executeRoleChange = async (newRole: MemberRole) => {
    if (!roleDialogMember) return
    setActionLoading(true)
    try {
      await patchMember(roleDialogMember.id, { role: newRole })
      await loadMembers()
      setRoleDialogMember(null)
    } catch (err) {
      console.error('Erreur changement rôle:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ═══════ HEADER RETECHCI (partagé) ═══════ */}
      <Header
        space="director"
        userName={director ? `${director.first_name} ${director.last_name}` : 'Directeur'}
        userEmail={director?.email}
        userAvatar={director?.profile_photo}
        onSpaceSwitch={() => {}}
        onLogout={() => {}}
      />

      {/* ═══════ CONTENU PRINCIPAL ═══════ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Bannière Directeur */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30 shrink-0">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold">
                  Espace Directeur Exécutif
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestion des membres, activation des invitations et attribution des rôles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ État d'erreur ═══ */}
        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Impossible de charger les données
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vérifiez que les variables d&apos;environnement Supabase sont configurées
                    (<code className="bg-muted px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    onClick={loadMembers}
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ État vide (aucun membre en DB) ═══ */}
        {!loading && !error && members.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-base font-medium mb-1">Aucun membre enregistré</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Les membres apparaîtront ici dès qu&apos;ils auront été invités et inscrits via le système d&apos;invitation.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ Contenu (membres chargés) ═══ */}
        {!error && members.length > 0 && (
          <>
            {/* Rôles uniques */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Rôles du bureau
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UNIQUE_ROLES.map(role => (
                  <RoleCard
                    key={role}
                    role={role}
                    holder={occupiedRoles[role]}
                  />
                ))}
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
                { label: 'Actifs', value: stats.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
                { label: 'Invités', value: stats.invited, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { label: 'En attente', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
                { label: 'Suspendus', value: stats.suspended, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className={`p-3 text-center rounded-xl ${stat.bg}`}>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gestion des membres */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gestion des membres
                </CardTitle>
                <CardDescription>
                  Activez les invitations, gérez les rôles et les statuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recherche + Filtre */}
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
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Chargement des membres...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filteredMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Aucun membre trouvé pour cette recherche</p>
                      </div>
                    ) : (
                      filteredMembers.map(member => (
                        <MemberRow
                          key={member.id}
                          member={member}
                          directorId={director?.id || ''}
                          onActivate={handleActivate}
                          onReactivate={handleReactivate}
                          onRoleChange={handleRoleChange}
                          onSuspend={handleSuspend}
                        />
                      ))
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} affiché{filteredMembers.length > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* ═══════ FOOTER (partagé) ═══════ */}
      <Footer />

      {/* ═══════ DIALOGUES ═══════ */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        loading={actionLoading}
      />

      {roleDialogMember && (
        <RoleAssignDialog
          member={roleDialogMember}
          members={members}
          open={!!roleDialogMember}
          onClose={() => setRoleDialogMember(null)}
          onAssign={executeRoleChange}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
