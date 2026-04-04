"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  UserCheck, AlertTriangle, Loader2,
  Mail, Clock, Ban, Users, Database,
  CalendarDays, MapPin, QrCode, Send,
  Copy, Check, X, Video, ClipboardCheck,
  Plus, Trash2, Eye, MessageSquare, Link2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Member, MemberStatus, MemberRole } from "@/lib/supabase/types"

type TabId = 'members' | 'meetings' | 'invitations' | 'scan'

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'members', label: 'Membres', icon: Users },
  { id: 'meetings', label: 'Réunions & AG', icon: CalendarDays },
  { id: 'invitations', label: 'Invitations', icon: Send },
  { id: 'scan', label: 'Scanner QR', icon: QrCode },
]

const UNIQUE_ROLES: MemberRole[] = ['director', 'president', 'treasurer']

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: typeof Shield; color: string; bg: string; border: string; description: string }> = {
  member: { label: 'Membre', icon: User, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-800', description: 'Espace membre standard' },
  director: { label: 'Directeur Exécutif', icon: Shield, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', description: 'Gestion complète des membres et rôles' },
  president: { label: 'Président du CA', icon: Crown, color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-800', description: 'Validation des adhésions, convocation AG' },
  treasurer: { label: 'Trésorière', icon: Wallet, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-800', description: 'Gestion financière et cotisations' },
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Actif', color: 'bg-green-500 text-white', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-yellow-500 text-white', icon: Clock },
  suspended: { label: 'Suspendu', color: 'bg-red-500 text-white', icon: Ban },
  invited: { label: 'Invité', color: 'bg-blue-500 text-white', icon: Mail },
}

const MEETING_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ordinary: { label: 'Assemblée Générale Ordinaire (AGO)', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  extraordinary: { label: 'Assemblée Générale Extraordinaire (AGE)', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  electoral: { label: 'Assemblée Élective', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
}

const MEETING_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'À venir', color: 'bg-blue-500 text-white' },
  ongoing: { label: 'En cours', color: 'bg-green-500 text-white' },
  completed: { label: 'Terminée', color: 'bg-gray-500 text-white' },
  cancelled: { label: 'Annulée', color: 'bg-red-500 text-white' },
}

interface Meeting { id: string; title: string; type: string; description?: string | null; date: string; time?: string | null; location?: string | null; agenda?: string | null; status: string; created_at?: string | null }
interface Invitation { id: string; email: string; first_name: string; last_name: string; phone?: string | null; token: string; status: string; expires_at: string; created_at?: string | null; accepted_at?: string | null }
interface AttendanceRecord { id: string; meeting_id: string; member_id: string; status: string; created_at: string; member?: { id: string; member_id: string; first_name: string; last_name: string; email: string } }

function getDisplayName(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`
  if (m.first_name) return m.first_name
  if (m.last_name) return m.last_name
  if (m.email) { const name = m.email.split('@')[0]; return name.charAt(0).toUpperCase() + name.slice(1) }
  return 'Sans nom'
}

function getInitials(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase()
  if (m.first_name) return m.first_name[0].toUpperCase()
  if (m.email) return m.email[0].toUpperCase()
  return '?'
}

function getMemberStatus(m: Member): MemberStatus { return m.status || ((m.first_name && m.last_name) ? 'active' : 'invited') }
function getMemberRole(m: Member): MemberRole { return m.role || 'member' }
function formatDate(dateStr: string): string { try { return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return dateStr } }
function formatDateTime(dateStr: string, timeStr?: string | null): string { const date = formatDate(dateStr); return timeStr ? `${date} à ${timeStr}` : date }

async function fetchMembers(): Promise<Member[]> { const res = await fetch('/api/members'); const json = await res.json(); if (json.error) throw new Error(json.error); return json.members || [] }
async function patchMember(id: string, data: { status?: MemberStatus; role?: MemberRole }): Promise<boolean> { const res = await fetch(`/api/members/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!res.ok) { const json = await res.json().catch(() => ({})); throw new Error(json.error || 'Erreur') } return true }
async function fetchMeetings(): Promise<Meeting[]> { const res = await fetch('/api/meetings'); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meetings || [] }
async function createMeeting(data: Record<string, unknown>): Promise<Meeting> { const res = await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meeting }
async function updateMeeting(id: string, data: Record<string, unknown>): Promise<Meeting> { const res = await fetch(`/api/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meeting }
async function deleteMeeting(id: string): Promise<void> { const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' }); const json = await res.json(); if (json.error) throw new Error(json.error) }
async function fetchMeetingAttendance(meetingId: string): Promise<{ attendance: AttendanceRecord[]; summary: { total: number; confirmed: number; declined: number } }> { const res = await fetch(`/api/meetings/${meetingId}/attendance`); const json = await res.json(); if (json.error) throw new Error(json.error); return { attendance: json.attendance || [], summary: json.summary || { total: 0, confirmed: 0, declined: 0 } } }
async function fetchInvitations(): Promise<Invitation[]> { const res = await fetch('/api/invitations'); const json = await res.json(); if (json.error) throw new Error(json.error); return json.invitations || [] }
async function createInvitation(data: Record<string, unknown>): Promise<Invitation> { const res = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.invitation }
async function scanMember(code: string): Promise<{ found: boolean; member?: Member; error?: string }> { const res = await fetch('/api/members/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }); return await res.json() }

function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, variant = 'default', loading = false }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel: string; variant?: 'default' | 'destructive' | 'success'; loading?: boolean }) {
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
          <Button onClick={onConfirm} disabled={loading} className={`flex-1 ${variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : variant === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RoleAssignDialog({ member, members, open, onClose, onAssign, loading = false }: { member: Member; members: Member[]; open: boolean; onClose: () => void; onAssign: (roleId: MemberRole) => void; loading?: boolean }) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(getMemberRole(member))
  const displayName = getDisplayName(member)
  const currentRole = getMemberRole(member)
  const currentHolder = useMemo(() => {
    if (!UNIQUE_ROLES.includes(selectedRole)) return null
    return members.find(m => getMemberRole(m) === selectedRole && m.id !== member.id)
  }, [selectedRole, members, member.id])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Gérer le rôle de {displayName}</DialogTitle>
          <DialogDescription>Rôle actuel : <strong>{ROLE_CONFIG[currentRole].label}</strong></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Rôle actuel</p>
            <div className="flex items-center gap-2">
              {(() => { const Icon = ROLE_CONFIG[currentRole].icon; return <Icon className={`h-5 w-5 ${ROLE_CONFIG[currentRole].color}`} /> })()}
              <span className="font-medium">{ROLE_CONFIG[currentRole].label}</span>
            </div>
          </div>
          <div>
            <Label>Nouveau rôle</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as MemberRole)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member"><span className="flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> Membre</span></SelectItem>
                {UNIQUE_ROLES.map((role) => {
                  const config = ROLE_CONFIG[role]; const Icon = config.icon
                  const taken = members.find(m => getMemberRole(m) === role && m.id !== member.id)
                  return (
                    <SelectItem key={role} value={role} disabled={!!taken && currentRole !== role}>
                      <span className="flex items-center gap-2"><Icon className={`h-4 w-4 ${config.color}`} />{config.label}{taken && currentRole !== role && <span className="text-[10px] text-destructive">(occupé)</span>}</span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          {currentHolder && selectedRole !== currentRole && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive"><p className="font-semibold">Rôle occupé.</p><p className="mt-1"><strong>{getDisplayName(currentHolder)}</strong> perdra son rôle.</p></div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Annuler</Button>
            <Button onClick={() => onAssign(selectedRole)} disabled={loading} className="flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MemberRow({ member, directorId, onActivate, onRoleChange }: { member: Member; directorId: string; onActivate: (m: Member) => void; onRoleChange: (m: Member) => void }) {
  const isDirector = member.id === directorId; const status = getMemberStatus(member); const role = getMemberRole(member)
  const statusConf = STATUS_CONFIG[status]; const roleConf = ROLE_CONFIG[role]; const StatusIcon = statusConf.icon; const RoleIcon = roleConf.icon
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10 shrink-0"><AvatarImage src={member.profile_photo || undefined} /><AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{getInitials(member)}</AvatarFallback></Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{getDisplayName(member)}</span>
          <Badge variant="outline" className="text-[10px] font-mono">{member.member_id}</Badge>
          {isDirector && <Badge className="bg-primary/20 text-primary border-primary/30 border text-[10px] gap-1 px-1.5"><Shield className="h-3 w-3" />Vous</Badge>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5"><span className="text-xs text-muted-foreground truncate">{member.email}</span></div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge className={`${statusConf.color} text-[10px] gap-1 px-1.5`}><StatusIcon className="h-3 w-3" /><span className="hidden sm:inline">{statusConf.label}</span></Badge>
        {(role !== 'member' || isDirector) && <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 ${roleConf.bg} ${roleConf.color} ${roleConf.border} border`}><RoleIcon className="h-3 w-3" /><span className="hidden sm:inline">{roleConf.label}</span></Badge>}
      </div>
      {!isDirector && (
        <div className="flex items-center gap-1 shrink-0">
          {status === 'invited' && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800" onClick={() => onActivate(member)}><UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activer</span></Button>}
          {status === 'active' && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-primary border-primary/30" onClick={() => onRoleChange(member)}><Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Rôle</span></Button>}
        </div>
      )}
    </div>
  )
}

function RoleCard({ role, holder }: { role: MemberRole; holder: Member | undefined }) {
  const config = ROLE_CONFIG[role]; const Icon = config.icon
  return (
    <Card className={`${config.bg} ${config.border} border`}><CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2"><Icon className={`h-5 w-5 ${config.color}`} /><span className="font-semibold text-sm">{config.label}</span></div>
      {holder ? <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-background text-foreground">{getInitials(holder)}</AvatarFallback></Avatar><span className="text-sm">{getDisplayName(holder)}</span></div> : <p className="text-xs text-muted-foreground">Non assigné</p>}
    </CardContent></Card>
  )
}

function MembersTab({ members, directorId, loading, error, onActivate, onRoleChange, searchQuery, setSearchQuery, statusFilter, setStatusFilter, onRetry }: { members: Member[]; directorId: string; loading: boolean; error: string | null; onActivate: (m: Member) => void; onRoleChange: (m: Member) => void; searchQuery: string; setSearchQuery: (q: string) => void; statusFilter: string; setStatusFilter: (f: string) => void; onRetry: () => void }) {
  const membersWithStatus = useMemo(() => members.map(m => ({ ...m, _status: getMemberStatus(m), _role: getMemberRole(m) })), [members])
  const filteredMembers = useMemo(() => membersWithStatus.filter(m => {
    const dn = getDisplayName(m).toLowerCase(); const ms = !searchQuery || dn.includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.member_id.toLowerCase().includes(searchQuery.toLowerCase())
    return ms && (statusFilter === 'all' || m._status === statusFilter)
  }), [membersWithStatus, searchQuery, statusFilter])
  const stats = useMemo(() => ({ total: members.length, active: membersWithStatus.filter(m => m._status === 'active').length, invited: membersWithStatus.filter(m => m._status === 'invited').length, suspended: membersWithStatus.filter(m => m._status === 'suspended').length, pending: membersWithStatus.filter(m => m._status === 'pending').length }), [members, membersWithStatus])
  const occupiedRoles = useMemo(() => { const map: Partial<Record<MemberRole, Member>> = {}; UNIQUE_ROLES.forEach(role => { const h = members.find(m => getMemberRole(m) === role); if (h) map[role] = h }); return map }, [members])

  if (error) return (<Card className="border-destructive/30"><CardContent className="p-5"><div className="flex items-start gap-3"><Database className="h-5 w-5 text-destructive mt-0.5 shrink-0" /><div className="flex-1"><p className="text-sm font-medium text-destructive">Erreur</p><p className="text-xs text-muted-foreground mt-1">{error}</p><Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={onRetry}>Réessayer</Button></div></div></CardContent></Card>)
  if (!loading && members.length === 0) return (<Card><CardContent className="p-8"><div className="text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-base font-medium mb-1">Aucun membre</h3></div></CardContent></Card>)

  return (
    <div className="space-y-6">
      <div><h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Crown className="h-4 w-4" />Rôles du bureau</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{UNIQUE_ROLES.map(role => <RoleCard key={role} role={role} holder={occupiedRoles[role]} />)}</div></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{[{ label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' }, { label: 'Actifs', value: stats.active, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' }, { label: 'Invités', value: stats.invited, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' }, { label: 'En attente', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20' }, { label: 'Suspendus', value: stats.suspended, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' }].map(s => <Card key={s.label}><CardContent className={`p-3 text-center rounded-xl ${s.bg}`}><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>)}</div>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Gestion des membres</CardTitle><CardDescription>Activez les invitations et gérez les rôles</CardDescription></CardHeader><CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par nom, email ou ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filtrer" /></SelectTrigger><SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="active">Actifs</SelectItem><SelectItem value="invited">Invités</SelectItem><SelectItem value="pending">En attente</SelectItem><SelectItem value="suspended">Suspendus</SelectItem></SelectContent></Select></div>
        {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Chargement...</span></div> : (<div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">{filteredMembers.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Search className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Aucun résultat</p></div> : filteredMembers.map(member => <MemberRow key={member.id} member={member} directorId={directorId} onActivate={onActivate} onRoleChange={onRoleChange} />)}</div>)}
        <p className="text-xs text-muted-foreground text-center">{filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}</p>
      </CardContent></Card>
    </div>
  )
}

function MeetingsTab({ members }: { members: Member[] }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [actionLoading, setActionLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false); const [newMeeting, setNewMeeting] = useState({ title: '', type: 'ordinary', date: '', time: '', location: '', description: '', agenda: '' })
  const [viewAttendanceMeeting, setViewAttendanceMeeting] = useState<Meeting | null>(null); const [attendanceData, setAttendanceData] = useState<{ attendance: AttendanceRecord[]; summary: { total: number; confirmed: number; declined: number } } | null>(null); const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null); const [editForm, setEditForm] = useState({ title: '', type: '', date: '', time: '', location: '', description: '', agenda: '', status: '' })

  const loadMeetings = useCallback(async () => { setLoading(true); setError(null); try { setMeetings(await fetchMeetings()) } catch (err: any) { setError(err.message) } finally { setLoading(false) } }, [])
  useEffect(() => { loadMeetings() }, [loadMeetings])

  const handleCreate = async () => { setActionLoading(true); try { await createMeeting({ title: newMeeting.title, type: newMeeting.type, date: newMeeting.date, time: newMeeting.time || null, location: newMeeting.location || null, description: newMeeting.description || null, agenda: newMeeting.agenda || null }); setShowCreate(false); setNewMeeting({ title: '', type: 'ordinary', date: '', time: '', location: '', description: '', agenda: '' }); await loadMeetings() } catch (err: any) { setError(err.message) } finally { setActionLoading(false) } }
  const handleDelete = async (meeting: Meeting) => { if (!confirm(`Supprimer "${meeting.title}" ?`)) return; setActionLoading(true); try { await deleteMeeting(meeting.id); await loadMeetings() } catch (err: any) { setError(err.message) } finally { setActionLoading(false) } }
  const handleViewAttendance = async (meeting: Meeting) => { setViewAttendanceMeeting(meeting); setLoadingAttendance(true); try { setAttendanceData(await fetchMeetingAttendance(meeting.id)) } catch { } finally { setLoadingAttendance(false) } }
  const handleEditMeeting = (m: Meeting) => { setEditMeeting(m); setEditForm({ title: m.title, type: m.type, date: m.date, time: m.time || '', location: m.location || '', description: m.description || '', agenda: m.agenda || '', status: m.status }) }
  const handleSaveEdit = async () => { if (!editMeeting) return; setActionLoading(true); try { await updateMeeting(editMeeting.id, { ...editForm }); setEditMeeting(null); await loadMeetings() } catch (err: any) { setError(err.message) } finally { setActionLoading(false) } }

  if (error) return (<Card className="border-destructive/30"><CardContent className="p-5"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" /><div className="flex-1"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={loadMeetings}>Réessayer</Button></div></div></CardContent></Card>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><h2 className="text-base font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Convocations</h2><p className="text-sm text-muted-foreground">Gérez les assemblées et réunions</p></div><Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle convocation</Button></div>
      {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Chargement...</span></div> : meetings.length === 0 ? <Card><CardContent className="p-8 text-center"><CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-base font-medium mb-1">Aucune convocation</h3></CardContent></Card> : (
        <div className="grid gap-4">{meetings.map(meeting => { const tc = MEETING_TYPE_CONFIG[meeting.type] || MEETING_TYPE_CONFIG.ordinary; const sc = MEETING_STATUS_CONFIG[meeting.status] || MEETING_STATUS_CONFIG.upcoming; return (
          <Card key={meeting.id}><CardContent className="p-4 sm:p-5"><div className="flex flex-col sm:flex-row sm:items-start gap-3"><div className="flex items-start gap-3 flex-1 min-w-0"><div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tc.bg}`}><Video className={`h-5 w-5 ${tc.color}`} /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-sm">{meeting.title}</h3><Badge className={`${sc.color} text-[10px]`}>{sc.label}</Badge></div><div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground"><span className={`font-medium ${tc.color}`}>{tc.label}</span><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateTime(meeting.date, meeting.time)}</span>{meeting.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.location}</span>}</div>{meeting.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{meeting.description}</p>}</div></div><div className="flex items-center gap-1.5 shrink-0 sm:ml-auto"><Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleViewAttendance(meeting)}><ClipboardCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Présences</span></Button><Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleEditMeeting(meeting)}><Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline">Modifier</span></Button><Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive" onClick={() => handleDelete(meeting)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" /></Button></div></div></CardContent></Card>
        ) })}</div>
      )}
      <Dialog open={showCreate} onOpenChange={(v) => !v && setShowCreate(false)}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Nouvelle convocation</DialogTitle><DialogDescription>Créez une assemblée ou réunion</DialogDescription></DialogHeader><div className="space-y-4 pt-2"><div><Label>Titre</Label><Input placeholder="Ex: AGO - 1er semestre 2025" value={newMeeting.title} onChange={(e) => setNewMeeting(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div><div><Label>Type</Label><Select value={newMeeting.type} onValueChange={(v) => setNewMeeting(p => ({ ...p, type: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ordinary">AGO</SelectItem><SelectItem value="extraordinary">AGE</SelectItem><SelectItem value="electoral">Assemblée Élective</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div><Label>Date</Label><Input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div><div><Label>Heure</Label><Input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting(p => ({ ...p, time: e.target.value }))} className="mt-1" /></div></div><div><Label>Lieu</Label><Input placeholder="Ex: Salle Plateau, Abidjan" value={newMeeting.location} onChange={(e) => setNewMeeting(p => ({ ...p, location: e.target.value }))} className="mt-1" /></div><div><Label>Description</Label><Textarea placeholder="Description..." value={newMeeting.description} onChange={(e) => setNewMeeting(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} /></div><div><Label>Ordre du jour</Label><Textarea placeholder="1. Ordre du jour&#10;2. Rapport moral..." value={newMeeting.agenda} onChange={(e) => setNewMeeting(p => ({ ...p, agenda: e.target.value }))} className="mt-1" rows={4} /></div><div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => setShowCreate(false)} disabled={actionLoading} className="flex-1">Annuler</Button><Button onClick={handleCreate} disabled={actionLoading || !newMeeting.title || !newMeeting.date} className="flex-1">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}</Button></div></div></DialogContent></Dialog>
      <Dialog open={!!viewAttendanceMeeting} onOpenChange={(v) => !v && setViewAttendanceMeeting(null)}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" />Présences</DialogTitle><DialogDescription>{viewAttendanceMeeting?.title}</DialogDescription></DialogHeader>{loadingAttendance ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : attendanceData ? (<div className="space-y-4 pt-2"><div className="grid grid-cols-3 gap-3"><Card><CardContent className="p-3 text-center bg-blue-50 dark:bg-blue-950/20 rounded-lg"><p className="text-xl font-bold text-blue-600">{attendanceData.summary.total}</p><p className="text-[10px] text-muted-foreground">Réponses</p></CardContent></Card><Card><CardContent className="p-3 text-center bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-xl font-bold text-green-600">{attendanceData.summary.confirmed}</p><p className="text-[10px] text-muted-foreground">Confirmés</p></CardContent></Card><Card><CardContent className="p-3 text-center bg-red-50 dark:bg-red-950/20 rounded-lg"><p className="text-xl font-bold text-red-600">{attendanceData.summary.declined}</p><p className="text-[10px] text-muted-foreground">Déclinés</p></CardContent></Card></div>{attendanceData.attendance.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Aucune réponse</p> : <div className="space-y-2 max-h-60 overflow-y-auto">{attendanceData.attendance.map((r) => (<div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.status === 'confirmed' ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'}`}>{r.status === 'confirmed' ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium">{r.member ? `${r.member.first_name} ${r.member.last_name}` : 'Inconnu'}</p><p className="text-xs text-muted-foreground">{r.member?.email || ''}</p></div><Badge className={`${r.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'} text-white text-[10px]`}>{r.status === 'confirmed' ? 'Présent' : 'Absent'}</Badge></div>))}</div>}</div>) : null}</DialogContent></Dialog>
      <Dialog open={!!editMeeting} onOpenChange={(v) => !v && setEditMeeting(null)}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" />Modifier</DialogTitle><DialogDescription>{editMeeting?.title}</DialogDescription></DialogHeader><div className="space-y-4 pt-2"><div><Label>Titre</Label><Input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div><div><Label>Type</Label><Select value={editForm.type} onValueChange={(v) => setEditForm(p => ({ ...p, type: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ordinary">AGO</SelectItem><SelectItem value="extraordinary">AGE</SelectItem><SelectItem value="electoral">Élective</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-3"><div><Label>Date</Label><Input type="date" value={editForm.date} onChange={(e) => setEditForm(p => ({ ...p, date: e.target.value }))} className="mt-1" /></div><div><Label>Heure</Label><Input type="time" value={editForm.time} onChange={(e) => setEditForm(p => ({ ...p, time: e.target.value }))} className="mt-1" /></div></div><div><Label>Lieu</Label><Input value={editForm.location} onChange={(e) => setEditForm(p => ({ ...p, location: e.target.value }))} className="mt-1" /></div><div><Label>Description</Label><Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} /></div><div><Label>Ordre du jour</Label><Textarea value={editForm.agenda} onChange={(e) => setEditForm(p => ({ ...p, agenda: e.target.value }))} className="mt-1" rows={4} /></div><div><Label>Statut</Label><Select value={editForm.status} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upcoming">À venir</SelectItem><SelectItem value="ongoing">En cours</SelectItem><SelectItem value="completed">Terminée</SelectItem><SelectItem value="cancelled">Annulée</SelectItem></SelectContent></Select></div><div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => setEditMeeting(null)} disabled={actionLoading} className="flex-1">Annuler</Button><Button onClick={handleSaveEdit} disabled={actionLoading} className="flex-1">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}</Button></div></div></DialogContent></Dialog>
    </div>
  )
}

function InvitationsTab() {
  const [invitations, setInvitations] = useState<Invitation[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [actionLoading, setActionLoading] = useState(false); const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false); const [newInv, setNewInv] = useState({ email: '', first_name: '', last_name: '', phone: '' })
  const loadInvitations = useCallback(async () => { setLoading(true); setError(null); try { setInvitations(await fetchInvitations()) } catch (err: any) { setError(err.message) } finally { setLoading(false) } }, [])
  useEffect(() => { loadInvitations() }, [loadInvitations])
  const handleCreate = async () => { setActionLoading(true); setError(null); try { await createInvitation({ email: newInv.email, first_name: newInv.first_name, last_name: newInv.last_name, phone: newInv.phone || null }); setShowCreate(false); setNewInv({ email: '', first_name: '', last_name: '', phone: '' }); await loadInvitations() } catch (err: any) { setError(err.message) } finally { setActionLoading(false) } }
  const copyLink = (token: string) => { const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/inscription?token=${token}`; navigator.clipboard.writeText(link).then(() => { setCopiedToken(token); setTimeout(() => setCopiedToken(null), 3000) }) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><h2 className="text-base font-semibold flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Invitations directes</h2><p className="text-sm text-muted-foreground">Envoyez un lien d&apos;inscription directement</p></div><Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" />Nouvelle invitation</Button></div>
      {error && <Card className="border-destructive/30"><CardContent className="p-4"><div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /><p className="text-sm text-destructive flex-1">{error}</p></div></CardContent></Card>}
      {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Chargement...</span></div> : invitations.length === 0 ? <Card><CardContent className="p-8 text-center"><Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-base font-medium mb-1">Aucune invitation</h3></CardContent></Card> : (
        <div className="space-y-3">{invitations.map(inv => { const isExpired = new Date(inv.expires_at) < new Date(); const sc = inv.status === 'accepted' ? 'bg-green-500 text-white' : (inv.status === 'expired' || isExpired) ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'; const sl = inv.status === 'accepted' ? 'Acceptée' : (inv.status === 'expired' || isExpired) ? 'Expirée' : 'En attente'; return (
          <Card key={inv.id}><CardContent className="p-4"><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex items-center gap-3 flex-1 min-w-0"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Mail className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-sm">{inv.first_name} {inv.last_name}</span><Badge className={`${sc} text-[10px]`}>{sl}</Badge></div><p className="text-xs text-muted-foreground mt-0.5">{inv.email}</p></div></div><div className="flex items-center gap-1.5 shrink-0">{inv.status === 'pending' && !isExpired && <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => copyLink(inv.token)}>{copiedToken === inv.token ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}<span className="hidden sm:inline">{copiedToken === inv.token ? 'Copié !' : 'Copier le lien'}</span></Button>}</div></div></CardContent></Card>
        ) })}</div>
      )}
      <Dialog open={showCreate} onOpenChange={(v) => !v && setShowCreate(false)}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Nouvelle invitation</DialogTitle><DialogDescription>Envoyez un lien d&apos;inscription</DialogDescription></DialogHeader><div className="space-y-4 pt-2"><div><Label>Prénom</Label><Input placeholder="Ex: Ibrahim" value={newInv.first_name} onChange={(e) => setNewInv(p => ({ ...p, first_name: e.target.value }))} className="mt-1" /></div><div><Label>Nom</Label><Input placeholder="Ex: Coulibaly" value={newInv.last_name} onChange={(e) => setNewInv(p => ({ ...p, last_name: e.target.value }))} className="mt-1" /></div><div><Label>Email</Label><Input type="email" placeholder="email@exemple.com" value={newInv.email} onChange={(e) => setNewInv(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div><div><Label>Téléphone</Label><Input placeholder="+225 07 XX XX XX" value={newInv.phone} onChange={(e) => setNewInv(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div><div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"><Link2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><p className="text-xs text-muted-foreground">Un lien unique sera généré. Expire dans 7 jours.</p></div><div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => setShowCreate(false)} disabled={actionLoading} className="flex-1">Annuler</Button><Button onClick={handleCreate} disabled={actionLoading || !newInv.email || !newInv.first_name || !newInv.last_name} className="flex-1">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer'}</Button></div></div></DialogContent></Dialog>
    </div>
  )
}

function ScanTab() {
  const [scanCode, setScanCode] = useState(''); const [loading, setLoading] = useState(false); const [result, setResult] = useState<{ found: boolean; member?: Member; error?: string } | null>(null); const [scanHistory, setScanHistory] = useState<Array<{ member: Member; time: string }>>([])
  const handleScan = async () => { if (!scanCode.trim()) return; setLoading(true); setResult(null); try { const data = await scanMember(scanCode.trim()); setResult(data); if (data.found && data.member) setScanHistory(prev => [{ member: data.member!, time: new Date().toLocaleTimeString('fr-FR') }, ...prev.slice(0, 9)]) } catch (err: any) { setResult({ found: false, error: err.message }) } finally { setLoading(false) } }

  return (
    <div className="space-y-6">
      <div><h2 className="text-base font-semibold flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" />Scanner QR Code</h2><p className="text-sm text-muted-foreground">Vérifiez l&apos;identité d&apos;un membre</p></div>
      <Card><CardContent className="p-5"><div className="space-y-4"><div><Label className="mb-2 block">Numéro d&apos;adhérent ou Email</Label><div className="flex gap-2"><div className="relative flex-1"><QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="CI-2026-0001 ou email" value={scanCode} onChange={(e) => setScanCode(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === 'Enter' && handleScan()} /></div><Button onClick={handleScan} disabled={loading || !scanCode.trim()} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Scanner</Button></div></div><p className="text-xs text-muted-foreground">Saisissez le numéro d&apos;adhérent ou l&apos;email de la carte.</p></div></CardContent></Card>
      {result && (<Card className={result.found ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'}><CardContent className="p-5">{result.found && result.member ? (<div className="space-y-4"><div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /><span className="font-semibold text-sm">Membre vérifié</span></div><div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarImage src={result.member.profile_photo || undefined} /><AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">{getInitials(result.member)}</AvatarFallback></Avatar><div><h3 className="text-lg font-bold">{getDisplayName(result.member)}</h3><p className="text-sm text-muted-foreground">{result.member.member_id}</p></div></div><div className="grid grid-cols-2 gap-3"><div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground mb-1">Email</p><p className="text-xs font-medium">{result.member.email}</p></div>{result.member.phone && <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground mb-1">Téléphone</p><p className="text-xs font-medium">{result.member.phone}</p></div>}<div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground mb-1">Statut</p><Badge className={STATUS_CONFIG[getMemberStatus(result.member)].color + ' text-[10px]'}>{STATUS_CONFIG[getMemberStatus(result.member)].label}</Badge></div><div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground mb-1">Rôle</p><span className="text-xs font-medium">{ROLE_CONFIG[getMemberRole(result.member)].label}</span></div></div></div>) : (<div className="flex items-center gap-2 text-destructive"><X className="h-5 w-5" /><div><p className="font-semibold text-sm">Non trouvé</p><p className="text-xs text-muted-foreground mt-1">{result.error}</p></div></div>)}</CardContent></Card>)}
      {scanHistory.length > 0 && <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Historique</CardTitle></CardHeader><CardContent><div className="space-y-2 max-h-48 overflow-y-auto">{scanHistory.map((e, i) => (<div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"><Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(e.member)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{getDisplayName(e.member)}</p><p className="text-[10px] text-muted-foreground">{e.member.member_id}</p></div><span className="text-[10px] text-muted-foreground">{e.time}</span></div>))}</div></CardContent></Card>}
    </div>
  )
}

export default function DirectorDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('members')
  const [members, setMembers] = useState<Member[]>([]); const [membersLoading, setMembersLoading] = useState(true); const [membersError, setMembersError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(''); const [statusFilter, setStatusFilter] = useState<string>('all'); const [actionLoading, setActionLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; confirmLabel: string; variant: 'default' | 'destructive' | 'success'; onConfirm: () => void }>({ open: false, title: '', description: '', confirmLabel: '', variant: 'default', onConfirm: () => {} })
  const [roleDialogMember, setRoleDialogMember] = useState<Member | null>(null)

  const loadMembers = useCallback(async () => { setMembersLoading(true); setMembersError(null); try { setMembers(await fetchMembers()) } catch (err: any) { setMembersError(err.message) } finally { setMembersLoading(false) } }, [])
  useEffect(() => { loadMembers() }, [loadMembers])
  const director = members.find(m => m.email === 'directeur@retechci.org' || getMemberRole(m) === 'director'); const directorId = director?.id || ''

  const handleActivate = (member: Member) => setConfirmDialog({ open: true, title: `Activer ${getDisplayName(member)}`, description: `Ce membre deviendra actif.`, confirmLabel: 'Activer', variant: 'success', onConfirm: () => { (async () => { setActionLoading(true); try { await patchMember(member.id, { status: 'active' }); await loadMembers(); setConfirmDialog(p => ({ ...p, open: false })) } catch { } finally { setActionLoading(false) } })() } })
  const handleRoleChange = (member: Member) => setRoleDialogMember(member)
  const executeRoleChange = async (newRole: MemberRole) => { if (!roleDialogMember) return; setActionLoading(true); try { await patchMember(roleDialogMember.id, { role: newRole }); await loadMembers(); setRoleDialogMember(null) } catch { } finally { setActionLoading(false) } }

  const headerName = director ? getDisplayName(director) : 'Directeur'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header space="director" userName={headerName} userEmail={director?.email} userAvatar={director?.profile_photo || null} onSpaceSwitch={() => {}} onLogout={() => {}} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        <Card className="border-primary/20"><CardContent className="p-5"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30 shrink-0"><Shield className="h-7 w-7 text-primary" /></div><div className="min-w-0"><h1 className="text-lg font-bold">Espace Directeur Exécutif</h1><p className="text-sm text-muted-foreground">Gestion des membres, convocations, invitations et vérification</p></div></div></CardContent></Card>
        <div className="border-b border-border"><div className="flex gap-1 overflow-x-auto -mb-px">{TABS.map(tab => { const Icon = tab.icon; const isActive = activeTab === tab.id; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span></button>) })}</div></div>
        {activeTab === 'members' && <MembersTab members={members} directorId={directorId} loading={membersLoading} error={membersError} onActivate={handleActivate} onRoleChange={handleRoleChange} searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onRetry={loadMembers} />}
        {activeTab === 'meetings' && <MeetingsTab members={members} />}
        {activeTab === 'invitations' && <InvitationsTab />}
        {activeTab === 'scan' && <ScanTab />}
      </main>
      <Footer />
      <ConfirmDialog open={confirmDialog.open} onClose={() => setConfirmDialog(p => ({ ...p, open: false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} description={confirmDialog.description} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} loading={actionLoading} />
      {roleDialogMember && <RoleAssignDialog member={roleDialogMember} members={members} open={!!roleDialogMember} onClose={() => setRoleDialogMember(null)} onAssign={executeRoleChange} loading={actionLoading} />}
    </div>
  )
}
