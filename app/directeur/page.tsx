"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield, User, Crown, Wallet, CheckCircle, Search,
  UserCheck, UserX, AlertTriangle, Loader2,
  Mail, Clock, Ban, Users, Database,
  Calendar, QrCode, Send, Copy, XCircle, MapPin,
  FileText, Plus, Trash2, Eye, Check, ExternalLink,
  ScanLine, Phone, Link2, Hash, Briefcase, Settings, Upload, Image as ImageIcon, Trash2 as TrashIcon, CheckCircle as CheckIcon,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Member, MemberStatus, MemberRole } from "@/lib/supabase/types"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type MeetingType = "ordinary" | "extraordinary" | "electoral"
type MeetingStatus = "upcoming" | "ongoing" | "completed" | "cancelled"
type InvitationStatus = "pending" | "accepted" | "expired"

interface Meeting {
  id: string; title: string; type: MeetingType; description: string | null
  date: string; time: string | null; location: string | null; agenda: string | null
  status: MeetingStatus; created_at: string | null; attendance_count?: number | null
}

interface AttendanceRecord {
  id: string; meeting_id: string; member_id: string; status: "confirmed" | "declined"
  created_at: string; member: { id: string; member_id: string; first_name: string | null; last_name: string | null; email: string }
}

interface AttendanceSummary { total: number; confirmed: number; declined: number }

interface Invitation {
  id: string; email: string; first_name: string; last_name: string; phone: string | null
  token: string; status: InvitationStatus; expires_at: string; created_at: string; accepted_at: string | null
}

interface ScanResult { found: boolean; member?: Member | null; search_type?: string; error?: string }

const UNIQUE_ROLES: MemberRole[] = ["director", "president", "treasurer"]

const ROLE_CONFIG: Record<MemberRole, { label: string; icon: typeof Shield; color: string; bg: string; border: string; description: string }> = {
  member: { label: "Membre", icon: User, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-800", description: "Espace membre standard" },
  director: { label: "Directeur Exécutif", icon: Shield, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", description: "Gestion complète des membres et rôles" },
  president: { label: "Président du CA", icon: Crown, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-300 dark:border-purple-800", description: "Validation des adhésions, convocation AG" },
  treasurer: { label: "Trésorière", icon: Wallet, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-800", description: "Gestion financière et cotisations" },
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Actif", color: "bg-green-500 text-white", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-yellow-500 text-white", icon: Clock },
  suspended: { label: "Suspendu", color: "bg-red-500 text-white", icon: Ban },
  invited: { label: "Invité", color: "bg-blue-500 text-white", icon: Mail },
}

const MEETING_TYPE_LABELS: Record<MeetingType, string> = { ordinary: "Assemblée Générale Ordinaire", extraordinary: "Assemblée Générale Extraordinaire", electoral: "Assemblée Élective" }
const MEETING_TYPE_SHORT: Record<MeetingType, string> = { ordinary: "AGO", extraordinary: "AGE", electoral: "Élective" }
const MEETING_TYPE_COLORS: Record<MeetingType, string> = { ordinary: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800", extraordinary: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800", electoral: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800" }
const MEETING_STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; icon: typeof CheckCircle }> = { upcoming: { label: "À venir", color: "bg-blue-500 text-white", icon: Clock }, ongoing: { label: "En cours", color: "bg-yellow-500 text-white", icon: Loader2 }, completed: { label: "Terminée", color: "bg-green-500 text-white", icon: CheckCircle }, cancelled: { label: "Annulée", color: "bg-red-500 text-white", icon: XCircle } }
const INVITATION_STATUS_CONFIG: Record<InvitationStatus, { label: string; color: string; icon: typeof CheckCircle }> = { pending: { label: "En attente", color: "bg-yellow-500 text-white", icon: Clock }, accepted: { label: "Acceptée", color: "bg-green-500 text-white", icon: CheckCircle }, expired: { label: "Expirée", color: "bg-red-500 text-white", icon: XCircle } }

function getDisplayName(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`
  if (m.first_name) return m.first_name
  if (m.last_name) return m.last_name
  if (m.email) { const name = m.email.split("@")[0]; return name.charAt(0).toUpperCase() + name.slice(1) }
  return "Sans nom"
}
function getInitials(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase()
  if (m.first_name) return m.first_name[0].toUpperCase()
  if (m.email) return m.email[0].toUpperCase()
  return "?"
}
function getMemberStatus(m: Member): MemberStatus { return m.status || (m.first_name && m.last_name ? "active" : "invited") }
function getMemberRole(m: Member): MemberRole { return m.role || "member" }
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try { return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) } catch { return dateStr }
}
function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try { return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) } catch { return dateStr }
}
function formatTime(timeStr: string | null | undefined): string { return timeStr || "" }

async function fetchMembers(): Promise<Member[]> { const res = await fetch("/api/members"); const json = await res.json(); if (json.error) throw new Error(json.error); return json.members || [] }
async function patchMember(id: string, data: { status?: MemberStatus; role?: MemberRole }): Promise<boolean> {
  const res = await fetch(`/api/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
  if (!res.ok) { const json = await res.json().catch(() => ({})); throw new Error(json.error || "Erreur") }
  return true
}
async function fetchMeetings(): Promise<Meeting[]> { const res = await fetch("/api/meetings"); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meetings || [] }
async function createMeeting(data: Record<string, unknown>): Promise<Meeting> { const res = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meeting }
async function patchMeeting(id: string, data: Record<string, unknown>): Promise<Meeting> { const res = await fetch(`/api/meetings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.meeting }
async function deleteMeeting(id: string): Promise<boolean> { const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" }); const json = await res.json(); if (json.error) throw new Error(json.error); return true }
async function fetchAttendance(meetingId: string): Promise<{ attendance: AttendanceRecord[]; summary: AttendanceSummary; meeting: { id: string; title: string } }> {
  const res = await fetch(`/api/meetings/${meetingId}/attendance`); const json = await res.json(); if (json.error) throw new Error(json.error)
  return { attendance: json.attendance || [], summary: json.summary || { total: 0, confirmed: 0, declined: 0 }, meeting: json.meeting || { id: meetingId, title: "" } }
}
async function fetchInvitations(): Promise<Invitation[]> { const res = await fetch("/api/invitations"); const json = await res.json(); if (json.error) throw new Error(json.error); return json.invitations || [] }
async function createInvitation(data: Record<string, unknown>): Promise<Invitation> { const res = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const json = await res.json(); if (json.error) throw new Error(json.error); return json.invitation }
async function scanMember(code: string): Promise<ScanResult> { const res = await fetch("/api/members/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }); const json = await res.json(); return json as ScanResult }

function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, variant = "default", loading = false }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel: string; variant?: "default" | "destructive" | "success"; loading?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{variant === "destructive" && <AlertTriangle className="h-5 w-5 text-destructive" />}{variant === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Annuler</Button>
          <Button onClick={onConfirm} disabled={loading} className={`flex-1 ${variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : variant === "success" ? "bg-green-600 hover:bg-green-700" : ""}`}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}</Button>
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
    return members.find((m) => getMemberRole(m) === selectedRole && m.id !== member.id)
  }, [selectedRole, members, member.id])
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Gérer le rôle de {displayName}</DialogTitle>
          <DialogDescription>Rôle actuel : <strong>{ROLE_CONFIG[currentRole].label}</strong></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg border bg-muted/30"><p className="text-xs text-muted-foreground mb-2">Rôle actuel</p><div className="flex items-center gap-2">{(() => { const Icon = ROLE_CONFIG[currentRole].icon; return <Icon className={`h-5 w-5 ${ROLE_CONFIG[currentRole].color}`} /> })()}<span className="font-medium">{ROLE_CONFIG[currentRole].label}</span></div></div>
          <div><Label>Nouveau rôle</Label><Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as MemberRole)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member"><span className="flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> Membre</span></SelectItem>{UNIQUE_ROLES.map((role) => { const config = ROLE_CONFIG[role]; const Icon = config.icon; const taken = members.find((m) => getMemberRole(m) === role && m.id !== member.id); return <SelectItem key={role} value={role} disabled={!!taken && currentRole !== role}><span className="flex items-center gap-2"><Icon className={`h-4 w-4 ${config.color}`} />{config.label}{taken && currentRole !== role && <span className="text-[10px] text-destructive">(occupé par {getDisplayName(taken)})</span>}</span></SelectItem> })}</SelectContent></Select></div>
          {currentHolder && selectedRole !== currentRole && <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"><AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /><div className="text-xs text-destructive"><p className="font-semibold">Ce rôle est actuellement occupé.</p><p className="mt-1"><strong>{getDisplayName(currentHolder)}</strong> ({currentHolder.member_id}) perdra son rôle.</p></div></div>}
          {currentRole !== "member" && selectedRole === "member" && <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg><p className="text-xs text-muted-foreground">{displayName} perdra son accès à l&apos;espace Admin.</p></div>}
          {ROLE_CONFIG[selectedRole] && <div className={`p-3 rounded-lg border ${ROLE_CONFIG[selectedRole].bg} ${ROLE_CONFIG[selectedRole].border}`}><p className="text-xs text-muted-foreground">{ROLE_CONFIG[selectedRole].description}</p></div>}
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Annuler</Button><Button onClick={() => onAssign(selectedRole)} disabled={loading} className="flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MemberRow({ member, directorId, onActivate, onRoleChange }: { member: Member; directorId: string; onActivate: (m: Member) => void; onRoleChange: (m: Member) => void }) {
  const isDirector = member.id === directorId; const status = getMemberStatus(member); const role = getMemberRole(member)
  const statusConf = STATUS_CONFIG[status]; const roleConf = ROLE_CONFIG[role]; const StatusIcon = statusConf.icon; const RoleIcon = roleConf.icon
  const displayName = getDisplayName(member); const isInvited = status === "invited"; const isActive = status === "active"
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10 shrink-0"><AvatarImage src={member.profile_photo || undefined} /><AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">{getInitials(member)}</AvatarFallback></Avatar>
      <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-sm truncate">{displayName}</span><Badge variant="outline" className="text-[10px] font-mono">{member.member_id}</Badge>{isDirector && <Badge className="bg-primary/20 text-primary border-primary/30 border text-[10px] gap-1 px-1.5"><Shield className="h-3 w-3" />Vous</Badge>}</div><div className="flex items-center gap-1.5 mt-0.5"><span className="text-xs text-muted-foreground truncate">{member.email}</span>{member.phone && <><span className="text-muted-foreground/40">·</span><span className="text-xs text-muted-foreground truncate">{member.phone}</span></>}</div></div>
      <div className="flex items-center gap-1.5 shrink-0"><Badge className={`${statusConf.color} text-[10px] gap-1 px-1.5`}><StatusIcon className="h-3 w-3" /><span className="hidden sm:inline">{statusConf.label}</span></Badge>{(role !== "member" || isDirector) && <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 ${roleConf.bg} ${roleConf.color} ${roleConf.border} border`}><RoleIcon className="h-3 w-3" /><span className="hidden sm:inline">{roleConf.label}</span></Badge>}</div>
      {!isDirector && <div className="flex items-center gap-1 shrink-0">{isInvited && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => onActivate(member)}><UserCheck className="h-3.5 w-3.5" /><span className="hidden sm:inline">Activer</span></Button>}{isActive && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5" onClick={() => onRoleChange(member)}><Shield className="h-3.5 w-3.5" /><span className="hidden sm:inline">Rôle</span></Button>}</div>}
    </div>
  )
}

function RoleCard({ role, holder }: { role: MemberRole; holder: Member | undefined }) {
  const config = ROLE_CONFIG[role]; const Icon = config.icon
  return (<Card className={`${config.bg} ${config.border} border`}><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Icon className={`h-5 w-5 ${config.color}`} /><span className="font-semibold text-sm">{config.label}</span></div>{holder ? <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-background text-foreground">{getInitials(holder)}</AvatarFallback></Avatar><span className="text-sm">{getDisplayName(holder)}</span></div> : <p className="text-xs text-muted-foreground">Non assigné</p>}</CardContent></Card>)
}
function MeetingFormDialog({ open, onClose, onSubmit, loading = false }: { open: boolean; onClose: () => void; onSubmit: (data: Record<string, unknown>) => void; loading?: boolean }) {
  const [title, setTitle] = useState(""); const [type, setType] = useState<MeetingType>("ordinary"); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [location, setLocation] = useState(""); const [description, setDescription] = useState(""); const [agenda, setAgenda] = useState("")
  const resetForm = () => { setTitle(""); setType("ordinary"); setDate(""); setTime(""); setLocation(""); setDescription(""); setAgenda("") }
  const handleSubmit = () => { if (!title.trim() || !date) return; const payload: Record<string, unknown> = { title: title.trim(), type, date }; if (time) payload.time = time; if (location.trim()) payload.location = location.trim(); if (description.trim()) payload.description = description.trim(); if (agenda.trim()) payload.agenda = agenda.trim(); onSubmit(payload); resetForm() }
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose() } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Nouvelle réunion</DialogTitle><DialogDescription>Créer une nouvelle assemblée générale ou réunion.</DialogDescription></DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label htmlFor="meeting-title">Titre *</Label><Input id="meeting-title" placeholder="Ex: AGO — 1er Semestre 2025" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
          <div><Label>Type de réunion *</Label><Select value={type} onValueChange={(v) => setType(v as MeetingType)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ordinary">Assemblée Générale Ordinaire</SelectItem><SelectItem value="extraordinary">Assemblée Générale Extraordinaire</SelectItem><SelectItem value="electoral">Assemblée Élective</SelectItem></SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="meeting-date">Date *</Label><Input id="meeting-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div><div><Label htmlFor="meeting-time">Heure</Label><Input id="meeting-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" /></div></div>
          <div><Label htmlFor="meeting-location"><MapPin className="h-3.5 w-3.5 inline mr-1" />Lieu</Label><Input id="meeting-location" placeholder="Ex: Salle RETECHCI" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" /></div>
          <div><Label htmlFor="meeting-description"><FileText className="h-3.5 w-3.5 inline mr-1" />Description</Label><Textarea id="meeting-description" placeholder="Description de la réunion..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={3} /></div>
          <div><Label htmlFor="meeting-agenda"><FileText className="h-3.5 w-3.5 inline mr-1" />Ordre du jour</Label><Textarea id="meeting-agenda" placeholder="1. Ouverture de la séance&#10;2. Rapport moral&#10;3. ..." value={agenda} onChange={(e) => setAgenda(e.target.value)} className="mt-1" rows={4} /></div>
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => { resetForm(); onClose() }} disabled={loading} className="flex-1">Annuler</Button><Button onClick={handleSubmit} disabled={loading || !title.trim() || !date} className="flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Créer</>}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AttendanceDialog({ meetingId, meetingTitle, open, onClose }: { meetingId: string; meetingTitle: string; open: boolean; onClose: () => void }) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]); const [summary, setSummary] = useState<AttendanceSummary>({ total: 0, confirmed: 0, declined: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!meetingId) return; let cancelled = false; fetchAttendance(meetingId).then((data) => { if (!cancelled) { setAttendance(data.attendance); setSummary(data.summary); setError(null) } }).catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Erreur") }).finally(() => { if (!cancelled) setLoading(false) }); return () => { cancelled = true } }, [meetingId])
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Présences — {meetingTitle}</DialogTitle><DialogDescription>Détail des confirmations de participation</DialogDescription></DialogHeader>
        {loading && <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /><span className="ml-2 text-sm text-muted-foreground">Chargement...</span></div>}
        {error && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg"><p className="text-sm text-destructive">{error}</p></div>}
        {!loading && !error && <>
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-muted/50"><CardContent className="p-3 text-center"><p className="text-xl font-bold">{summary.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
            <Card className="bg-green-50 dark:bg-green-950/20"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600 dark:text-green-400">{summary.confirmed}</p><p className="text-xs text-muted-foreground">Confirmés</p></CardContent></Card>
            <Card className="bg-red-50 dark:bg-red-950/20"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600 dark:text-red-400">{summary.declined}</p><p className="text-xs text-muted-foreground">Déclinés</p></CardContent></Card>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {attendance.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Aucune réponse enregistrée.</p> : attendance.map((record) => {
              const memberName = record.member?.first_name && record.member?.last_name ? `${record.member.first_name} ${record.member.last_name}` : record.member?.email || "Inconnu"
              const isConfirmed = record.status === "confirmed"
              return (
                <div key={record.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card">
                  <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{record.member?.first_name?.[0]?.toUpperCase() || "?"}{record.member?.last_name?.[0]?.toUpperCase() || ""}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{memberName}</p><p className="text-xs text-muted-foreground truncate">{record.member?.member_id || record.member?.email}</p></div>
                  <Badge className={isConfirmed ? "bg-green-500 text-white text-[10px] gap-1" : "bg-red-500 text-white text-[10px] gap-1"}>{isConfirmed ? <><Check className="h-3 w-3" />Oui</> : <><XCircle className="h-3 w-3" />Non</>}</Badge>
                </div>
              )
            })}
          </div>
        </>}
      </DialogContent>
    </Dialog>
  )
}

function InvitationFormDialog({ open, onClose, onSubmit, loading = false }: { open: boolean; onClose: () => void; onSubmit: (data: Record<string, unknown>) => void; loading?: boolean }) {
  const [email, setEmail] = useState(""); const [firstName, setFirstName] = useState(""); const [lastName, setLastName] = useState(""); const [phone, setPhone] = useState("")
  const resetForm = () => { setEmail(""); setFirstName(""); setLastName(""); setPhone("") }
  const handleSubmit = () => { if (!email.trim() || !firstName.trim()) return; const payload: Record<string, unknown> = { email: email.trim().toLowerCase(), first_name: firstName.trim(), last_name: lastName.trim() }; if (phone.trim()) payload.phone = phone.trim(); onSubmit(payload); resetForm() }
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Nouvelle invitation</DialogTitle><DialogDescription>Inviter un nouveau technicien à rejoindre le réseau.</DialogDescription></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3"><div><Label>Prénom *</Label><Input placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" /></div><div><Label>Nom</Label><Input placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" /></div></div>
          <div><Label>Email *</Label><Input type="email" placeholder="jean@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
          <div><Label>Téléphone</Label><Input type="tel" placeholder="+225 07 XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" /></div>
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => { resetForm(); onClose() }} disabled={loading} className="flex-1">Annuler</Button><Button onClick={handleSubmit} disabled={loading || !email.trim() || !firstName.trim()} className="flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" />Inviter</>}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
function SiteSettings() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetch("/api/site-settings/hero-image").then(r => r.json()).then(data => { setHeroImageUrl(data.heroImageUrl); setLoading(false) }).catch(() => setLoading(false)) }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError(null); setSuccess(false)
    const formData = new FormData(); formData.append("image", file)
    try {
      const res = await fetch("/api/site-settings/hero-image", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) { setHeroImageUrl(data.heroImageUrl); setSuccess(true) } else { setError(data.error || "Erreur") }
    } catch { setError("Erreur de connexion") }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-6">
      <div><h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Paramètres du site</h3><p className="text-sm text-muted-foreground mt-1">Gérer l&apos;image du Hero de la page d&apos;accueil.</p></div>
      <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />Image du Hero</CardTitle><CardDescription>Cette image s&apos;affiche en arrière-plan de la section Hero sur la page d&apos;accueil.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement...</div>}
          {heroImageUrl && !loading && (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border"><img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" /><div className="absolute bottom-2 right-2"><Badge className="bg-green-500 text-white text-[10px] gap-1"><CheckIcon className="h-3 w-3" />Active</Badge></div></div>
          )}
          {!heroImageUrl && !loading && <div className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground"><ImageIcon className="h-10 w-10 mb-2" /><p className="text-sm">Aucune image configurée</p><p className="text-xs">L&apos;image par défaut sera utilisée</p></div>}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2"><Upload className="h-4 w-4" />{uploading ? "Envoi..." : "Changer l'image"}</Button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
            {heroImageUrl && <Button variant="outline" size="sm" className="gap-1" onClick={() => { navigator.clipboard.writeText(heroImageUrl) }}><Copy className="h-3.5 w-3.5" />Copier l&apos;URL</Button>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">Image mise à jour avec succès !</p>}
          <p className="text-xs text-muted-foreground">Formats acceptés : JPG, PNG, WebP — Max 5 MB</p>
        </CardContent>
      </Card>
    </div>
  )
}

function QrScanner() {
  const [code, setCode] = useState(""); const [result, setResult] = useState<ScanResult | null>(null); const [scanning, setScanning] = useState(false); const [manualCode, setManualCode] = useState("")
  const handleScan = useCallback(async () => {
    if (!manualCode.trim()) return
    setScanning(true); setResult(null)
    try {
      const data = await scanMember(manualCode.trim())
      setResult(data)
    } catch { setResult({ found: false, error: "Erreur de connexion" }) }
    finally { setScanning(false) }
  }, [manualCode])

  return (
    <div className="space-y-6">
      <div><h3 className="text-lg font-semibold flex items-center gap-2"><ScanLine className="h-5 w-5 text-primary" />Scanner QR Code</h3><p className="text-sm text-muted-foreground mt-1">Scanner la carte numérique d&apos;un membre pour vérifier son statut.</p></div>
      <Card><CardContent className="p-6 space-y-6">
        <div className="flex gap-3"><Input placeholder="Saisir l'ID membre (ex: CI-2024-8842)" value={manualCode} onChange={(e) => setManualCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} className="flex-1" /><Button onClick={handleScan} disabled={scanning || !manualCode.trim()} className="gap-2">{scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <><QrCode className="h-4 w-4" />Scanner</>}</Button></div>
        {result && (
          <div className={`p-4 rounded-lg border ${result.found ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "border-red-300 bg-red-50 dark:bg-red-950/20"}`}>
            {result.found && result.member ? (<>
              <div className="flex items-center gap-3 mb-3"><Avatar className="h-12 w-12"><AvatarImage src={result.member.profile_photo || undefined} /><AvatarFallback className="bg-primary/10 text-primary">{getInitials(result.member)}</AvatarFallback></Avatar><div><p className="font-semibold">{getDisplayName(result.member)}</p><p className="text-sm text-muted-foreground">{result.member.member_id}</p></div><Badge className={STATUS_CONFIG[getMemberStatus(result.member)].color}>{STATUS_CONFIG[getMemberStatus(result.member)].label}</Badge></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><div><span className="text-muted-foreground">Email : </span><span>{result.member.email}</span></div>{result.member.phone && <div><span className="text-muted-foreground">Tél : </span><span>{result.member.phone}</span></div>}{result.member.profession && <div><span className="text-muted-foreground">Profession : </span><span>{result.member.profession}</span></div>}<div><span className="text-muted-foreground">Rôle : </span><span className="capitalize">{getMemberRole(result.member) === "member" ? "Membre" : ROLE_CONFIG[getMemberRole(result.member)].label}</span></div></div>
            </>) : (
              <div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /><p className="text-sm">{result.error || "Aucun membre trouvé avec ce code."}</p></div>
            )}
          </div>
        )}
      </CardContent></Card>
    </div>
  )
}
export default function DirectorDashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("membres")

  // Dialogs
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [activateLoading, setActivateLoading] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [suspendLoading, setSuspendLoading] = useState(false)
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [meetingLoading, setMeetingLoading] = useState(false)
  const [invitationFormOpen, setInvitationFormOpen] = useState(false)
  const [invitationLoading, setInvitationLoading] = useState(false)

  // Attendance dialog
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [attendanceMeetingId, setAttendanceMeetingId] = useState("")
  const [attendanceMeetingTitle, setAttendanceMeetingTitle] = useState("")

  // Meeting delete
  const [deleteMeetingDialogOpen, setDeleteMeetingDialogOpen] = useState(false)
  const [deleteMeetingId, setDeleteMeetingId] = useState("")
  const [deleteMeetingLoading, setDeleteMeetingLoading] = useState(false)

  const router = useRouter()

  // ── Data fetching ──────────────────────────────────────────
  const loadMembers = useCallback(async () => {
    try { const data = await fetchMembers(); setMembers(data) } catch (err) { setError(err instanceof Error ? err.message : "Erreur chargement membres") }
  }, [])

  const loadMeetings = useCallback(async () => {
    try { const data = await fetchMeetings(); setMeetings(data) } catch (err) { console.error("Meetings error:", err) }
  }, [])

  const loadInvitations = useCallback(async () => {
    try { const data = await fetchInvitations(); setInvitations(data) } catch (err) { console.error("Invitations error:", err) }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([loadMembers(), loadMeetings(), loadInvitations()])
      setLoading(false)
    }
    load()
  }, [loadMembers, loadMeetings, loadInvitations])

  // ── Auth check ─────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/connexion"); return }
      const { data: memberData } = await supabase.from('members').select('role').eq('email', user.email).single()
      if (!memberData || (memberData.role !== 'director' && memberData.role !== 'president' && memberData.role !== 'treasurer' && memberData.role !== 'admin')) { router.push("/connexion") }
    }
    checkAuth()
  }, [router])

  // ── Derived state ──────────────────────────────────────────
  const directorId = useMemo(() => {
    const d = members.find((m) => getMemberRole(m) === "director")
    return d?.id || ""
  }, [members])

  const filteredMembers = useMemo(() => {
    let list = members
    if (search) { const s = search.toLowerCase(); list = list.filter((m) => getDisplayName(m).toLowerCase().includes(s) || m.email.toLowerCase().includes(s) || m.member_id.toLowerCase().includes(s)) }
    if (statusFilter !== "all") list = list.filter((m) => getMemberStatus(m) === statusFilter)
    return list
  }, [members, search, statusFilter])

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => getMemberStatus(m) === "active").length,
    invited: members.filter((m) => getMemberStatus(m) === "invited").length,
    pending: members.filter((m) => getMemberStatus(m) === "pending").length,
    suspended: members.filter((m) => getMemberStatus(m) === "suspended").length,
  }), [members])

  // ── Handlers ───────────────────────────────────────────────
  const handleActivate = async (member: Member) => {
    setSelectedMember(member); setActivateDialogOpen(true)
  }
  const confirmActivate = async () => {
    if (!selectedMember) return
    setActivateLoading(true)
    try { await patchMember(selectedMember.id, { status: "active" }); setActivateDialogOpen(false); await loadMembers() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur") }
    finally { setActivateLoading(false) }
  }

  const handleRoleChange = (member: Member) => { setSelectedMember(member); setRoleDialogOpen(true) }
  const confirmRoleChange = async (roleId: MemberRole) => {
    if (!selectedMember) return
    setRoleLoading(true)
    try { await patchMember(selectedMember.id, { role: roleId }); setRoleDialogOpen(false); await loadMembers() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur") }
    finally { setRoleLoading(false) }
  }

  const handleSuspend = async (member: Member) => { setSelectedMember(member); setSuspendDialogOpen(true) }
  const confirmSuspend = async () => {
    if (!selectedMember) return
    setSuspendLoading(true)
    try { await patchMember(selectedMember.id, { status: "suspended" }); setSuspendDialogOpen(false); await loadMembers() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur") }
    finally { setSuspendLoading(false) }
  }

  const handleCreateMeeting = async (data: Record<string, unknown>) => {
    setMeetingLoading(true)
    try { await createMeeting(data); setMeetingFormOpen(false); await loadMeetings() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur création réunion") }
    finally { setMeetingLoading(false) }
  }

  const handleDeleteMeeting = (id: string) => { setDeleteMeetingId(id); setDeleteMeetingDialogOpen(true) }
  const confirmDeleteMeeting = async () => {
    if (!deleteMeetingId) return
    setDeleteMeetingLoading(true)
    try { await deleteMeeting(deleteMeetingId); setDeleteMeetingDialogOpen(false); await loadMeetings() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur suppression") }
    finally { setDeleteMeetingLoading(false) }
  }

  const handleCreateInvitation = async (data: Record<string, unknown>) => {
    setInvitationLoading(true)
    try { await createInvitation(data); setInvitationFormOpen(false); await loadInvitations(); await loadMembers() }
    catch (err) { setError(err instanceof Error ? err.message : "Erreur création invitation") }
    finally { setInvitationLoading(false) }
  }

  const openAttendance = (meeting: Meeting) => { setAttendanceMeetingId(meeting.id); setAttendanceMeetingTitle(meeting.title); setAttendanceDialogOpen(true) }

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/adhesion?token=${token}`
    navigator.clipboard.writeText(link)
  }
    if (loading) return (<div className="min-h-screen bg-background flex items-center justify-center"><div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Chargement du tableau de bord...</p></div></div>)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Espace Directeur Exécutif</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion des membres, invitations, réunions et paramètres du site</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <Card className="bg-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card className="bg-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p><p className="text-xs text-muted-foreground">Actifs</p></CardContent></Card>
          <Card className="bg-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.invited}</p><p className="text-xs text-muted-foreground">Invités</p></CardContent></Card>
          <Card className="bg-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p><p className="text-xs text-muted-foreground">En attente</p></CardContent></Card>
          <Card className="bg-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.suspended}</p><p className="text-xs text-muted-foreground">Suspendus</p></CardContent></Card>
        </div>

        {/* Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {UNIQUE_ROLES.map((role) => <RoleCard key={role} role={role} holder={members.find((m) => getMemberRole(m) === role)} />)}
        </div>

        {error && <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg"><p className="text-sm text-destructive">{error}</p><Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2">Fermer</Button></div>}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="membres" className="gap-1.5 flex-1 min-w-0"><Users className="h-4 w-4" /><span className="hidden sm:inline">Membres</span></TabsTrigger>
            <TabsTrigger value="reunions" className="gap-1.5 flex-1 min-w-0"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">Réunions</span></TabsTrigger>
            <TabsTrigger value="invitations" className="gap-1.5 flex-1 min-w-0"><Send className="h-4 w-4" /><span className="hidden sm:inline">Invitations</span></TabsTrigger>
            <TabsTrigger value="scanner" className="gap-1.5 flex-1 min-w-0"><ScanLine className="h-4 w-4" /><span className="hidden sm:inline">Scanner</span></TabsTrigger>
            <TabsTrigger value="parametres" className="gap-1.5 flex-1 min-w-0"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Paramètres</span></TabsTrigger>
          </TabsList>

          {/* ── TAB MEMBRES ── */}
          <TabsContent value="membres" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par nom, email ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Statut" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="active">Actifs</SelectItem><SelectItem value="invited">Invités</SelectItem><SelectItem value="pending">En attente</SelectItem><SelectItem value="suspended">Suspendus</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredMembers.length === 0 ? <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Aucun membre trouvé.</p></div> : filteredMembers.map((m) => <MemberRow key={m.id} member={m} directorId={directorId} onActivate={handleActivate} onRoleChange={handleRoleChange} />)}
            </div>
          </TabsContent>

          {/* ── TAB REUNIONS ── */}
          <TabsContent value="reunions" className="mt-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Réunions & Assemblées</h3><Button onClick={() => setMeetingFormOpen(true)} size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Nouvelle réunion</Button></div>
            {meetings.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Aucune réunion créée.</p><Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setMeetingFormOpen(true)}><Plus className="h-4 w-4" />Créer une réunion</Button></CardContent></Card> : <div className="space-y-3 max-h-[500px] overflow-y-auto">{meetings.map((meeting) => { const statusConf = MEETING_STATUS_CONFIG[meeting.status]; const typeConf = MEETING_TYPE_COLORS[meeting.type]; const StatusIcon = statusConf.icon; return (<Card key={meeting.id}><CardContent className="p-4"><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap mb-1"><span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${typeConf}`}>{MEETING_TYPE_SHORT[meeting.type]}</span><Badge className={`${statusConf.color} text-[10px] gap-1`}><StatusIcon className="h-3 w-3" />{statusConf.label}</Badge></div><p className="font-semibold text-sm truncate">{meeting.title}</p><div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(meeting.date)}</span>{meeting.time && <span>{meeting.time}</span>}{meeting.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.location}</span>}</div></div><div className="flex items-center gap-1.5 shrink-0"><Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => openAttendance(meeting)}><Users className="h-3.5 w-3.5" />Présences</Button><Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteMeeting(meeting.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div></CardContent></Card>) })}</div>}
          </TabsContent>

          {/* ── TAB INVITATIONS ── */}
          <TabsContent value="invitations" className="mt-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Invitations</h3><Button onClick={() => setInvitationFormOpen(true)} size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" />Nouvelle invitation</Button></div>
            {invitations.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><Mail className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Aucune invitation envoyée.</p><Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setInvitationFormOpen(true)}><Send className="h-4 w-4" />Inviter un technicien</Button></CardContent></Card> : <div className="space-y-2 max-h-[500px] overflow-y-auto">{invitations.map((inv) => { const stConf = INVITATION_STATUS_CONFIG[inv.status]; const StIcon = stConf.icon; return (<Card key={inv.id}><CardContent className="p-4"><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{inv.first_name} {inv.last_name}</span><Badge className={`${stConf.color} text-[10px] gap-1`}><StIcon className="h-3 w-3" />{stConf.label}</Badge></div><p className="text-xs text-muted-foreground">{inv.email}{inv.phone && ` · ${inv.phone}`}</p><p className="text-xs text-muted-foreground mt-0.5">Expire le {formatShortDate(inv.expires_at)}</p></div><div className="flex items-center gap-1.5 shrink-0"><Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => copyInvitationLink(inv.token)}><Copy className="h-3.5 w-3.5" />Lien</Button></div></div></CardContent></Card>) })}</div>}
          </TabsContent>

          {/* ── TAB SCANNER ── */}
          <TabsContent value="scanner" className="mt-6"><QrScanner /></TabsContent>

          {/* ── TAB PARAMETRES ── */}
          <TabsContent value="parametres" className="mt-6"><SiteSettings /></TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Dialogs */}
      <RoleAssignDialog member={selectedMember!} members={members} open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} onAssign={confirmRoleChange} loading={roleLoading} />
      <ConfirmDialog open={activateDialogOpen} onClose={() => setActivateDialogOpen(false)} onConfirm={confirmActivate} title="Activer ce membre ?" description={`${selectedMember ? getDisplayName(selectedMember) : ""} sera marqué comme actif.`} confirmLabel="Activer" variant="success" loading={activateLoading} />
      <ConfirmDialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} onConfirm={confirmSuspend} title="Suspendre ce membre ?" description={`${selectedMember ? getDisplayName(selectedMember) : ""} sera suspendu et perdra l'accès à l'espace membre.`} confirmLabel="Suspendre" variant="destructive" loading={suspendLoading} />
      <ConfirmDialog open={deleteMeetingDialogOpen} onClose={() => setDeleteMeetingDialogOpen(false)} onConfirm={confirmDeleteMeeting} title="Supprimer cette réunion ?" description="Cette action est irréversible." confirmLabel="Supprimer" variant="destructive" loading={deleteMeetingLoading} />
      <MeetingFormDialog open={meetingFormOpen} onClose={() => setMeetingFormOpen(false)} onSubmit={handleCreateMeeting} loading={meetingLoading} />
      <InvitationFormDialog open={invitationFormOpen} onClose={() => setInvitationFormOpen(false)} onSubmit={handleCreateInvitation} loading={invitationLoading} />
      <AttendanceDialog meetingId={attendanceMeetingId} meetingTitle={attendanceMeetingTitle} open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} />
    </div>
  )
}
  
