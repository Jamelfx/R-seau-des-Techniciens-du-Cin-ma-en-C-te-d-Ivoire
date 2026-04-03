"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Shield, User, Crown, Wallet, CheckCircle, Search,
  UserCheck, UserX, AlertTriangle, Loader2,
  Mail, Clock, Ban, Users, Database, LogOut, Film,
} from "lucide-react"
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
    label: 'Directeur Executif',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    description: 'Gestion complete des membres et roles',
  },
  president: {
    label: 'President du CA',
    icon: Crown,
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-800',
    description: 'Validation des adherions, convocation AG',
  },
  treasurer: {
    label: 'Tresoriere',
    icon: Wallet,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800',
    description: 'Gestion financiere et cotisations',
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
  invited: { label: 'Invite', color: 'bg-blue-500 text-white', icon: Mail },
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
  if (!res.ok) throw new Error('Erreur de mise a jour')
  return true
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : ConfirmDialog
// ═══════════════════════════════════════════════════════════════════════
function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel, variant = 'default', loading = false,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; description: string; confirmLabel: string
  variant?: 'default' | 'destructive' | 'success'; loading?: boolean
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
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Annuler</Button>
          <Button
            onClick={onConfirm} disabled={loading} className="flex-1"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            style={variant === 'success' ? { backgroundColor: '#16a34a', color: 'white' } : undefined}
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
  member, members, open, onClose, onAssign, loading = false,
}: {
  member: Member; members: Member[]; open: boolean
  onClose: () => void; onAssign: (roleId: MemberRole) => void; loading?: boolean
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
            Gerer le role de {member.first_name} {member.last_name}
          </DialogTitle>
          <DialogDescription>
            Role actuel : <strong>{ROLE_CONFIG[member.role].label}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Role actuel</p>
            <div className="flex items-center gap-2">
              {(() => { const Ic = ROLE_CONFIG[member.role].icon; return <Ic className={`h-5 w-5 ${ROLE_CONFIG[member.role].color}`} /> })()}
              <span className="font-medium">{ROLE_CONFIG[member.role].label}</span>
            </div>
          </div>
          <div>
            <Label>Nouveau role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as MemberRole)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <span className="flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> Membre</span>
                </SelectItem>
                {UNIQUE_ROLES.map((role) => {
                  const config = ROLE_CONFIG[role]; const Ic = config.icon
                  const taken = members.find(m => m.role === role && m.id !== member.id)
                  return (
                    <SelectItem key={role} value={role} disabled={!!taken && member.role !== role}>
                      <span className="flex items-center gap-2">
                        <Ic className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                        {taken && member.role !== role && (
                          <span className="text-[10px] text-destructive">(occupe par {taken.first_name} {taken.last_name})</span>
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          {currentHolder && selectedRole !== member.role && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive">
                <p className="font-semibold">Ce role est actuellement occupe.</p>
                <p className="mt-1"><strong>{currentHolder.first_name} {currentHolder.last_name}</strong> perdra son role et deviendra Membre.</p>
              </div>
            </div>
          )}
          <div className={`p-3 rounded-lg border ${ROLE_CONFIG[selectedRole].bg} ${ROLE_CONFIG[selectedRole].border}`}>
            <p className="text-xs text-muted-foreground">{ROLE_CONFIG[selectedRole].description}</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Annuler</Button>
            <Button onClick={() => onAssign(selectedRole)} disabled={loading} className="flex-1">
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
  member, directorId, onActivate, onReactivate, onRoleChange, onSuspend,
}: {
  member: Member; directorId: string
  onActivate: (m: Member) => void; onReactivate: (m: Member) => void
  onRoleChange: (m: Member) => void; onSuspend: (m: Member) => void
}) {
  const isDirector = member.id === directorId
  const statusConf = STATUS_CONFIG[member.status]
  const roleConf = ROLE_CONFIG[member.role]
  const StatusIcon = statusConf.icon
  const RoleIcon = roleConf.icon

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={member.profile_photo || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
          {member.first_name?.[0]}{member.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{member.first_name} {member.last_name}</span>
          <Badge variant="outline" className="text-[10px] font-mono">{member.member_id}</Badge>
          {isDirector && (
            <Badge className="bg-primary/20 text-primary border-primary/30 border text-[10px] gap-1 px-1.5">
              <Shield className="h-3 w-3" /> Vous
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground truncate">{member.profession}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground truncate">{member.email}</span>
        </div>
      </div>
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
      {!isDirector && (
        <div className="flex items-center gap-1 shrink-0">
          {member.status === 'invited' && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => onActivate(member)}>
              <UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activer</span>
            </Button>
          )}
          {member.status === 'suspended' && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => onReactivate(member)}>
              <UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Reactiver</span>
            </Button>
          )}
          {member.status === 'active' && (
            <>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5" onClick={() => onRoleChange(member)}>
                <Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Role</span>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => onSuspend(member)}>
                <UserX className="h-3.5 w-3.5" /><span className="hidden sm:inline">Suspendre</span>
              </Button>
            </>
          )}
          {member.status === 'pending' && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => onActivate(member)}>
              <UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activer</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RoleCard
// ═══════════════════════════════════════════════════════════════════════
function RoleCard({ role, holder }: { role: MemberRole; holder: Member | undefined }) {
  const config = ROLE_CONFIG[role]; const Icon = config.icon
  return (
    <Card className={`${config.bg} ${config.border} border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        {holder ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-background text-foreground">{holder.first_name?.[0]}{holder.last_name?.[0]}</AvatarFallback></Avatar>
            <span className="text-sm">{holder.first_name} {holder.last_name}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Non assigne</p>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — DIRECTEUR EXECUTIF
// ═══════════════════════════════════════════════════════════════════════
export default function DirectorDashboardPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; confirmLabel: string
    variant: 'default' | 'destructive' | 'success'; onConfirm: () => void
  }>({ open: false, title: '', description: '', confirmLabel: '', variant: 'default', onConfirm: () => {} })

  const [roleDialogMember, setRoleDialogMember] = useState<Member | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchMembers()
      setMembers(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUser({ email: data.user.email || '', name: data.user.user_metadata?.full_name || 'Directeur' })
      }
    })
    loadMembers()
  }, [loadMembers])

  const director = members.find(m => m.role === 'director')

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const handleActivate = (member: Member) => {
    setConfirmDialog({
      open: true, title: `Activer ${member.first_name} ${member.last_name}`,
      description: `Ce membre passera du statut "${STATUS_CONFIG[member.status].label}" a "Actif" et aura acces a son espace membre.`,
      confirmLabel: 'Activer', variant: 'success',
      onConfirm: () => executeStatusChange('active', member),
    })
  }
  const handleReactivate = (member: Member) => {
    setConfirmDialog({
      open: true, title: `Reactiver ${member.first_name} ${member.last_name}`,
      description: `Ce membre etait suspendu. Il retrouvera l'acces a son espace membre.`,
      confirmLabel: 'Reactiver', variant: 'success',
      onConfirm: () => executeStatusChange('active', member),
    })
  }
  const handleSuspend = (member: Member) => {
    setConfirmDialog({
      open: true, title: `Suspendre ${member.first_name} ${member.last_name}`,
      description: `Ce membre sera suspendu et perdra l'acces a son espace membre.`,
      confirmLabel: 'Suspendre', variant: 'destructive',
      onConfirm: () => executeStatusChange('suspended', member),
    })
  }
  const executeStatusChange = async (newStatus: MemberStatus, member: Member) => {
    setActionLoading(true)
    try {
      await patchMember(member.id, { status: newStatus })
      await loadMembers()
      setConfirmDialog(prev => ({ ...prev, open: false }))
    } catch (err) { console.error('Erreur:', err) }
    finally { setActionLoading(false) }
  }
  const handleRoleChange = (member: Member) => { setRoleDialogMember(member) }
  const executeRoleChange = async (newRole: MemberRole) => {
    if (!roleDialogMember) return
    setActionLoading(true)
    try {
      await patchMember(roleDialogMember.id, { role: newRole })
      await loadMembers()
      setRoleDialogMember(null)
    } catch (err) { console.error('Erreur:', err) }
    finally { setActionLoading(false) }
  }

  const displayName = currentUser?.name || (director ? `${director.first_name} ${director.last_name}` : 'Directeur')
  const displayEmail = currentUser?.email || director?.email

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ═══ HEADER ADMIN DIRECTEUR ═══ */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                  <Film className="size-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-black tracking-tight">
                  RETECH<span className="text-primary">CI</span>
                </h1>
              </a>
              <div className="hidden sm:block h-5 w-px bg-border" />
              <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                <Shield className="size-3" /> Espace Directeur
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/membre/dashboard')} className="hidden sm:flex items-center h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <User className="size-3.5" /> Espace Membre
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    {displayEmail && <p className="text-xs text-muted-foreground leading-none">{displayEmail}</p>}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/membre/dashboard')}>
                    <User className="mr-2 h-4 w-4" /> Passer a l&apos;espace Membre
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/')}>
                    <Film className="mr-2 h-4 w-4" /> Retour au site
                  </DropdownMenuSeparator>
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Deconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Banniere */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30 shrink-0">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold">Espace Directeur Executif</h1>
                <p className="text-sm text-muted-foreground">Gestion des membres, activation des invitations et attribution des roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Erreur */}
        {error && (
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Impossible de charger les donnees</p>
                  <p className="text-xs text-muted-foreground mt-1">Vérifiez que les variables d&apos;environnement Supabase sont configurees.</p>
                  <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={loadMembers}>Reessayer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aucun membre */}
        {!loading && !error && members.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-base font-medium mb-1">Aucun membre enregistre</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Les membres apparaitront ici des qu&apos;ils auront ete invites et inscrits.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu */}
        {!error && members.length > 0 && (
          <>
            {/* Roles */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4" /> Roles du bureau
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UNIQUE_ROLES.map(role => (
                  <RoleCard key={role} role={role} holder={occupiedRoles[role]} />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
                { label: 'Actifs', value: stats.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
                { label: 'Invites', value: stats.invited, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
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

            {/* Liste membres */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Gestion des membres</CardTitle>
                <CardDescription>Activez les invitations, gerez les roles et les statuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher par nom, email ou ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="invited">Invites</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="suspended">Suspendus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                        <p className="text-sm">Aucun membre trouve pour cette recherche</p>
                      </div>
                    ) : (
                      filteredMembers.map(member => (
                        <MemberRow key={member.id} member={member} directorId={director?.id || ''}
                          onActivate={handleActivate} onReactivate={handleReactivate}
                          onRoleChange={handleRoleChange} onSuspend={handleSuspend} />
                      ))
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} affiche{filteredMembers.length > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />

      <ConfirmDialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))} onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title} description={confirmDialog.description} confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant} loading={actionLoading} />

      {roleDialogMember && (
        <RoleAssignDialog member={roleDialogMember} members={members} open={!!roleDialogMember}
          onClose={() => setRoleDialogMember(null)} onAssign={executeRoleChange} loading={actionLoading} />
      )}
    </div>
  )
}
