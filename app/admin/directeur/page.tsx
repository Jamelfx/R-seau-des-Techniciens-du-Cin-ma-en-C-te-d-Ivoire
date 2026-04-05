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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  Shield, User, Crown, Wallet, CheckCircle, Search,
  UserCheck, UserX, AlertTriangle, Loader2,
  Mail, Clock, Ban, Users, Database,
  Calendar, QrCode, Send, Copy, XCircle, MapPin,
  FileText, Plus, Trash2, Eye, Check, ExternalLink,
  ChevronDown, ScanLine, Phone, Link2, Hash, Briefcase, Settings, Upload, Image as ImageIcon, Trash2 as TrashIcon, CheckCircle as CheckIcon,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Member, MemberStatus, MemberRole } from "@/lib/supabase/types"
import { createClient as createSupabaseClient } from "@/lib/supabase/client"

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

type MeetingType = "ordinary" | "extraordinary" | "electoral"
type MeetingStatus = "upcoming" | "ongoing" | "completed" | "cancelled"
type InvitationStatus = "pending" | "accepted" | "expired"

interface Meeting {
  id: string
  title: string
  type: MeetingType
  description: string | null
  date: string
  time: string | null
  location: string | null
  agenda: string | null
  status: MeetingStatus
  created_at: string | null
  attendance_count?: number | null
}

interface AttendanceRecord {
  id: string
  meeting_id: string
  member_id: string
  status: "confirmed" | "declined"
  created_at: string
  member: {
    id: string
    member_id: string
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface AttendanceSummary {
  total: number
  confirmed: number
  declined: number
}

interface Invitation {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  token: string
  status: InvitationStatus
  expires_at: string
  created_at: string
  accepted_at: string | null
}

interface ScanResult {
  found: boolean
  member?: Member | null
  search_type?: string
  error?: string
}

interface AdhesionRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  years_experience: number
  motivation: string
  status: string
  created_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  signature_data: string | null
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES – MEMBRES
// ═══════════════════════════════════════════════════════════════════════

const UNIQUE_ROLES: MemberRole[] = ["director", "president", "treasurer"]

const ROLE_CONFIG: Record<
  MemberRole,
  {
    label: string
    icon: typeof Shield
    color: string
    bg: string
    border: string
    description: string
  }
> = {
  member: {
    label: "Membre",
    icon: User,
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-800",
    description: "Espace membre standard",
  },
  director: {
    label: "Directeur Exécutif",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    description: "Gestion complète des membres et rôles",
  },
  president: {
    label: "Président du CA",
    icon: Crown,
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-300 dark:border-purple-800",
    description: "Validation des adhésions, convocation AG",
  },
  treasurer: {
    label: "Trésorière",
    icon: Wallet,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
    description: "Gestion financière et cotisations",
  },
}

const STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  active: { label: "Actif", color: "bg-green-500 text-white", icon: CheckCircle },
  pending: { label: "En attente", color: "bg-yellow-500 text-white", icon: Clock },
  suspended: { label: "Suspendu", color: "bg-red-500 text-white", icon: Ban },
  invited: { label: "Invité", color: "bg-blue-500 text-white", icon: Mail },
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES – RÉUNIONS
// ═══════════════════════════════════════════════════════════════════════

const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  ordinary: "Assemblée Générale Ordinaire",
  extraordinary: "Assemblée Générale Extraordinaire",
  electoral: "Assemblée Élective",
}

const MEETING_TYPE_SHORT: Record<MeetingType, string> = {
  ordinary: "AGO",
  extraordinary: "AGE",
  electoral: "Élective",
}

const MEETING_TYPE_COLORS: Record<MeetingType, string> = {
  ordinary: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
  extraordinary: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  electoral: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800",
}

const MEETING_STATUS_CONFIG: Record<
  MeetingStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  upcoming: { label: "À venir", color: "bg-blue-500 text-white", icon: Clock },
  ongoing: { label: "En cours", color: "bg-yellow-500 text-white", icon: Loader2 },
  completed: { label: "Terminée", color: "bg-green-500 text-white", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-500 text-white", icon: XCircle },
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES – INVITATIONS
// ═══════════════════════════════════════════════════════════════════════

const INVITATION_STATUS_CONFIG: Record<
  InvitationStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  pending: { label: "En attente", color: "bg-yellow-500 text-white", icon: Clock },
  accepted: { label: "Acceptée", color: "bg-green-500 text-white", icon: CheckCircle },
  expired: { label: "Expirée", color: "bg-red-500 text-white", icon: XCircle },
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function getDisplayName(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`
  if (m.first_name) return m.first_name
  if (m.last_name) return m.last_name
  if (m.email) {
    const name = m.email.split("@")[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return "Sans nom"
}

function getInitials(m: Member): string {
  if (m.first_name && m.last_name)
    return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase()
  if (m.first_name) return m.first_name[0].toUpperCase()
  if (m.email) return m.email[0].toUpperCase()
  return "?"
}

function getMemberStatus(m: Member): MemberStatus {
  if (m.status) return m.status
  return m.first_name && m.last_name ? "active" : "invited"
}

function getMemberRole(m: Member): MemberRole {
  if (m.role) return m.role
  return "member"
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return ""
  return timeStr
}

// ═══════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch("/api/members")
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.members || []
}

async function patchMember(
  id: string,
  data: { status?: MemberStatus; role?: MemberRole }
): Promise<boolean> {
  const res = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error || "Erreur de mise à jour")
  }
  return true
}

async function fetchMeetings(): Promise<Meeting[]> {
  const res = await fetch("/api/meetings")
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.meetings || []
}

async function createMeeting(
  data: Record<string, unknown>
): Promise<Meeting> {
  const res = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.meeting
}

async function patchMeeting(
  id: string,
  data: Record<string, unknown>
): Promise<Meeting> {
  const res = await fetch(`/api/meetings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.meeting
}

async function deleteMeeting(id: string): Promise<boolean> {
  const res = await fetch(`/api/meetings/${id}`, { method: "DELETE" })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return true
}

async function fetchAttendance(
  meetingId: string
): Promise<{
  attendance: AttendanceRecord[]
  summary: AttendanceSummary
  meeting: { id: string; title: string }
}> {
  const res = await fetch(`/api/meetings/${meetingId}/attendance`)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return {
    attendance: json.attendance || [],
    summary: json.summary || { total: 0, confirmed: 0, declined: 0 },
    meeting: json.meeting || { id: meetingId, title: "" },
  }
}

async function fetchInvitations(): Promise<Invitation[]> {
  const res = await fetch("/api/invitations")
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.invitations || []
}

async function createInvitation(
  data: Record<string, unknown>
): Promise<Invitation> {
  const res = await fetch("/api/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.invitation
}

async function scanMember(code: string): Promise<ScanResult> {
  const res = await fetch("/api/members/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  const json = await res.json()
  return json as ScanResult
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
  variant = "default",
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel: string
  variant?: "default" | "destructive" | "success"
  loading?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            {variant === "success" && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90"
                : variant === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
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
  const [selectedRole, setSelectedRole] = useState<MemberRole>(
    getMemberRole(member)
  )
  const displayName = getDisplayName(member)
  const currentRole = getMemberRole(member)

  const currentHolder = useMemo(() => {
    if (!UNIQUE_ROLES.includes(selectedRole)) return null
    return members.find(
      (m) => getMemberRole(m) === selectedRole && m.id !== member.id
    )
  }, [selectedRole, members, member.id])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gérer le rôle de {displayName}
          </DialogTitle>
          <DialogDescription>
            Rôle actuel : <strong>{ROLE_CONFIG[currentRole].label}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Rôle actuel */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Rôle actuel</p>
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = ROLE_CONFIG[currentRole].icon
                return (
                  <Icon className={`h-5 w-5 ${ROLE_CONFIG[currentRole].color}`} />
                )
              })()}
              <span className="font-medium">{ROLE_CONFIG[currentRole].label}</span>
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
                  const taken = members.find(
                    (m) => getMemberRole(m) === role && m.id !== member.id
                  )
                  return (
                    <SelectItem
                      key={role}
                      value={role}
                      disabled={!!taken && currentRole !== role}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                        {taken && currentRole !== role && (
                          <span className="text-[10px] text-destructive">
                            (occupé par {getDisplayName(taken)})
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Avertissement si le rôle est déjà pris */}
          {currentHolder && selectedRole !== currentRole && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive">
                <p className="font-semibold">Ce rôle est actuellement occupé.</p>
                <p className="mt-1">
                  <strong>{getDisplayName(currentHolder)}</strong> (
                  {currentHolder.member_id}) perdra son rôle et deviendra Membre.
                </p>
              </div>
            </div>
          )}

          {/* Avertissement si on enlève un rôle admin */}
          {currentRole !== "member" && selectedRole === "member" && (
            <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <p className="text-xs text-muted-foreground">
                {displayName} perdra son accès à l&apos;espace Admin et ne
                conservera que l&apos;espace Membre.
              </p>
            </div>
          )}

          {/* Info du nouveau rôle */}
          {ROLE_CONFIG[selectedRole] && (
            <div
              className={`p-3 rounded-lg border ${ROLE_CONFIG[selectedRole].bg} ${ROLE_CONFIG[selectedRole].border}`}
            >
              <p className="text-xs text-muted-foreground">
                {ROLE_CONFIG[selectedRole].description}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={() => onAssign(selectedRole)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmer"
              )}
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
  onRoleChange,
}: {
  member: Member
  directorId: string
  onActivate: (m: Member) => void
  onRoleChange: (m: Member) => void
}) {
  const isDirector = member.id === directorId
  const status = getMemberStatus(member)
  const role = getMemberRole(member)
  const statusConf = STATUS_CONFIG[status]
  const roleConf = ROLE_CONFIG[role]
  const StatusIcon = statusConf.icon
  const RoleIcon = roleConf.icon
  const displayName = getDisplayName(member)
  const isInvited = status === "invited"
  const isActive = status === "active"

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={member.profile_photo || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
          {getInitials(member)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{displayName}</span>
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
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {member.email}
          </span>
          {member.phone && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {member.phone}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge
          className={`${statusConf.color} text-[10px] gap-1 px-1.5`}
        >
          <StatusIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{statusConf.label}</span>
        </Badge>
        {(role !== "member" || isDirector) && (
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 px-1.5 ${roleConf.bg} ${roleConf.color} ${roleConf.border} border`}
          >
            <RoleIcon className="h-3 w-3" />
            <span className="hidden sm:inline">{roleConf.label}</span>
          </Badge>
        )}
      </div>

      {/* Actions */}
      {!isDirector && (
        <div className="flex items-center gap-1 shrink-0">
          {isInvited && (
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
          {isActive && (
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RoleCard
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
                {getInitials(holder)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{getDisplayName(holder)}</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Non assigné</p>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : MeetingFormDialog
// ═══════════════════════════════════════════════════════════════════════

function MeetingFormDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  loading?: boolean
}) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<MeetingType>("ordinary")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [agenda, setAgenda] = useState("")

  const resetForm = () => {
    setTitle("")
    setType("ordinary")
    setDate("")
    setTime("")
    setLocation("")
    setDescription("")
    setAgenda("")
  }

  const handleSubmit = () => {
    if (!title.trim() || !date) return
    const payload: Record<string, unknown> = {
      title: title.trim(),
      type,
      date,
    }
    if (time) payload.time = time
    if (location.trim()) payload.location = location.trim()
    if (description.trim()) payload.description = description.trim()
    if (agenda.trim()) payload.agenda = agenda.trim()
    onSubmit(payload)
    resetForm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Nouvelle réunion
          </DialogTitle>
          <DialogDescription>
            Créer une nouvelle assemblée générale ou réunion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="meeting-title">Titre *</Label>
            <Input
              id="meeting-title"
              placeholder="Ex: Assemblée Générale Ordinaire — 1er Semestre 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Type de réunion *</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as MeetingType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinary">
                  Assemblée Générale Ordinaire
                </SelectItem>
                <SelectItem value="extraordinary">
                  Assemblée Générale Extraordinaire
                </SelectItem>
                <SelectItem value="electoral">
                  Assemblée Élective
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="meeting-date">Date *</Label>
              <Input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="meeting-time">Heure</Label>
              <Input
                id="meeting-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meeting-location">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              Lieu
            </Label>
            <Input
              id="meeting-location"
              placeholder="Ex: Salle de conférence RETECHCI"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="meeting-description">
              <FileText className="h-3.5 w-3.5 inline mr-1" />
              Description
            </Label>
            <Textarea
              id="meeting-description"
              placeholder="Description de la réunion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="meeting-agenda">
              <FileText className="h-3.5 w-3.5 inline mr-1" />
              Ordre du jour
            </Label>
            <Textarea
              id="meeting-agenda"
              placeholder="1. Ouverture de la séance&#10;2. Lecture du rapport moral&#10;3. ..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !date}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : AttendanceDialog
// ═══════════════════════════════════════════════════════════════════════

function AttendanceDialog({
  meetingId,
  meetingTitle,
  open,
  onClose,
}: {
  meetingId: string
  meetingTitle: string
  open: boolean
  onClose: () => void
}) {
  // Start as loading=true so we show spinner on mount without synchronous setState
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<AttendanceSummary>({
    total: 0,
    confirmed: 0,
    declined: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!meetingId) return
    let cancelled = false
    fetchAttendance(meetingId)
      .then((data) => {
        if (!cancelled) {
          setAttendance(data.attendance)
          setSummary(data.summary)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur de chargement")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [meetingId])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Présences — {meetingTitle}
          </DialogTitle>
          <DialogDescription>
            Détail des confirmations de participation
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Chargement...
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {summary.confirmed}
                  </p>
                  <p className="text-xs text-muted-foreground">Confirmés</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {summary.declined}
                  </p>
                  <p className="text-xs text-muted-foreground">Déclinés</p>
                </CardContent>
              </Card>
            </div>

            {/* Liste */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Aucune réponse de présence enregistrée.
                </p>
              ) : (
                attendance.map((record) => {
                  const memberName =
                    record.member?.first_name && record.member?.last_name
                      ? `${record.member.first_name} ${record.member.last_name}`
                      : record.member?.email || "Membre inconnu"
                  const isConfirmed = record.status === "confirmed"
                  return (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {record.member?.first_name?.[0]?.toUpperCase() || "?"}
                          {record.member?.last_name?.[0]?.toUpperCase() || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {memberName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {record.member?.member_id || record.member?.email}
                        </p>
                      </div>
                      <Badge
                        className={
                          isConfirmed
                            ? "bg-green-500 text-white text-[10px] gap-1"
                            : "bg-red-500 text-white text-[10px] gap-1"
                        }
                      >
                        {isConfirmed ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {isConfirmed ? "Confirmé" : "Décliné"}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : MeetingRow
// ═══════════════════════════════════════════════════════════════════════

function MeetingRow({
  meeting,
  onCancel,
  onDelete,
  onViewAttendance,
}: {
  meeting: Meeting
  onCancel: (m: Meeting) => void
  onDelete: (m: Meeting) => void
  onViewAttendance: (m: Meeting) => void
}) {
  const statusConf = MEETING_STATUS_CONFIG[meeting.status]
  const StatusIcon = statusConf.icon
  const isUpcoming = meeting.status === "upcoming"
  const isCancelled = meeting.status === "cancelled"

  return (
    <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm truncate">{meeting.title}</h3>
            <Badge
              className={`${statusConf.color} text-[10px] gap-1 px-1.5`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConf.label}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] border ${MEETING_TYPE_COLORS[meeting.type]}`}
          >
            {MEETING_TYPE_SHORT[meeting.type]} —{" "}
            {MEETING_TYPE_LABELS[meeting.type]}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {meeting.attendance_count !== undefined &&
            meeting.attendance_count !== null && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
                onClick={() => onViewAttendance(meeting)}
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{meeting.attendance_count}</span>
              </Button>
            )}
          {isUpcoming && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              onClick={() => onCancel(meeting)}
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Annuler</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => onDelete(meeting)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Suppr.</span>
          </Button>
        </div>
      </div>

      {/* Détails */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(meeting.date)}
          {meeting.time && ` à ${formatTime(meeting.time)}`}
        </span>
        {meeting.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {meeting.location}
          </span>
        )}
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {meeting.description}
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : InvitationForm
// ═══════════════════════════════════════════════════════════════════════

function InvitationForm({
  onSubmit,
  loading = false,
}: {
  onSubmit: (data: Record<string, unknown>) => void
  loading?: boolean
}) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return
    const payload: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    }
    if (phone.trim()) payload.phone = phone.trim()
    onSubmit(payload)
    setEmail("")
    setFirstName("")
    setLastName("")
    setPhone("")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="h-4 w-4" />
          Envoyer une invitation
        </CardTitle>
        <CardDescription>
          Invitez un nouveau membre à rejoindre RETECHCI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="inv-first-name">Prénom *</Label>
            <Input
              id="inv-first-name"
              placeholder="Jean"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="inv-last-name">Nom *</Label>
            <Input
              id="inv-last-name"
              placeholder="Dupont"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="inv-email">Adresse email *</Label>
          <Input
            id="inv-email"
            type="email"
            placeholder="jean.dupont@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="inv-phone">
            <Phone className="h-3.5 w-3.5 inline mr-1" />
            Téléphone{" "}
            <span className="text-muted-foreground">(optionnel)</span>
          </Label>
          <Input
            id="inv-phone"
            placeholder="+225 07 XX XX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            !email.trim() ||
            !firstName.trim() ||
            !lastName.trim()
          }
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer l&apos;invitation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : InvitationLinkCard
// ═══════════════════════════════════════════════════════════════════════

function InvitationLinkCard({
  invitation,
}: {
  invitation: Invitation
}) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `https://retechci.org/connexion?invite=${invitation.token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Invitation créée avec succès
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {invitation.first_name} {invitation.last_name}
          </span>
          <span className="text-xs text-muted-foreground">
            ({invitation.email})
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <code className="text-xs flex-1 truncate text-foreground">
            {inviteUrl}
          </code>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copié
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copier
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Expire le {formatDate(invitation.expires_at)}
        </p>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : InvitationRow
// ═══════════════════════════════════════════════════════════════════════

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const [copied, setCopied] = useState(false)
  const statusConf = INVITATION_STATUS_CONFIG[invitation.status]
  const StatusIcon = statusConf.icon
  const inviteUrl = `https://retechci.org/connexion?invite=${invitation.token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">
            {invitation.first_name} {invitation.last_name}
          </span>
          <Badge
            className={`${statusConf.color} text-[10px] gap-1 px-1.5`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConf.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {invitation.email}
          </span>
          {invitation.phone && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">
                {invitation.phone}
              </span>
            </>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Envoyée le {formatShortDate(invitation.created_at)}
          {invitation.status === "pending" &&
            ` · Expire le ${formatShortDate(invitation.expires_at)}`}
          {invitation.accepted_at &&
            ` · Acceptée le ${formatShortDate(invitation.accepted_at)}`}
        </p>
      </div>

      {invitation.status === "pending" && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Lien
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : ScannerSection
// ═══════════════════════════════════════════════════════════════════════

function ScannerSection() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await scanMember(code.trim())
      setResult(data)
      if (!data.found) {
        setError(data.error || "Membre non trouvé.")
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la recherche."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const member = result?.member
  const memberStatus = member ? getMemberStatus(member) : null
  const memberRole = member ? getMemberRole(member) : null

  return (
    <div className="space-y-6">
      {/* Recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Scanner QR / Rechercher un membre
          </CardTitle>
          <CardDescription>
            Entrez un numéro d&apos;adhérent (ex: CI-2026-2723) ou une adresse
            email pour vérifier un membre.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="CI-2026-2723 ou email@example.com"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erreur */}
      {error && !member && (
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Membre non trouvé
                </p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultat */}
      {member && (
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Photo */}
              <div className="shrink-0">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={member.profile_photo || undefined} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                    {getInitials(member)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Infos principales */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold">
                    {getDisplayName(member)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {memberStatus && (
                      <Badge
                        className={`${STATUS_CONFIG[memberStatus].color} text-[10px] gap-1 px-1.5`}
                      >
                        {STATUS_CONFIG[memberStatus].label}
                      </Badge>
                    )}
                    {memberRole && memberRole !== "member" && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] gap-1 px-1.5 border ${ROLE_CONFIG[memberRole].bg} ${ROLE_CONFIG[memberRole].color} ${ROLE_CONFIG[memberRole].border}`}
                      >
                        {ROLE_CONFIG[memberRole].label}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">N° Adhérent :</span>
                    <span className="font-mono font-medium">
                      {member.member_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {member.email}
                    </span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {member.phone}
                      </span>
                    </div>
                  )}
                  {member.profession && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {member.profession}
                      </span>
                    </div>
                  )}
                </div>

                {/* Type de recherche */}
                {result?.search_type && (
                  <p className="text-[10px] text-muted-foreground">
                    Recherché par :{" "}
                    {result.search_type === "email"
                      ? "adresse email"
                      : "numéro d'adhérent"}
                  </p>
                )}
              </div>

              {/* Check */}
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : SiteSettings (Paramètres du site)
// ═══════════════════════════════════════════════════════════════════════

function SiteSettings() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadHeroImage()
  }, [])

  async function loadHeroImage() {
    try {
      const res = await fetch("/api/site-settings/hero-image")
      const json = await res.json()
      setHeroImageUrl(json.heroImageUrl || null)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WebP.")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.")
      return
    }

    setUploading(true)
    setError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch("/api/site-settings/hero-image", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors de l'upload.")
        return
      }

      setHeroImageUrl(json.heroImageUrl)
      setUploadSuccess(true)
      // Reset success message after 4s
      setTimeout(() => setUploadSuccess(false), 4000)
    } catch {
      setError("Erreur de connexion au serveur.")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Paramètres du site
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personnalisez l&apos;apparence de la page d&apos;accueil
        </p>
      </div>

      {/* Hero Image Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image Hero de la page d&apos;accueil
          </CardTitle>
          <CardDescription>
            Cette image s&apos;affiche en arrière-plan de la section Hero sur la page d&apos;accueil.
            Format recommandé : 1920×1080px (16:9). Max 5 Mo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div className="relative w-full aspect-video rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : heroImageUrl ? (
              <>
                <img
                  src={heroImageUrl}
                  alt="Hero actuel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-black/60 text-white border-0 text-[10px]">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Image active
                  </Badge>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ImageIcon className="h-10 w-10 opacity-20" />
                <p className="text-sm">Aucune image définie</p>
                <p className="text-xs opacity-60">Le dégradé par défaut s&apos;affiche</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success */}
          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 rounded-lg">
              <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Image Hero mise à jour avec succès ! La page d&apos;accueil affichera la nouvelle image.
              </p>
            </div>
          )}

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {heroImageUrl ? "Changer l'image Hero" : "Télécharger une image Hero"}
                </>
              )}
            </Button>
            {heroImageUrl && (
              <a href={heroImageUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Voir l&apos;image
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — DIRECTEUR EXÉCUTIF
// ═══════════════════════════════════════════════════════════════════════

export default function DirectorDashboardPage() {
  // ── Membres state ──
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [actionLoading, setActionLoading] = useState(false)

  // ── Réunions state ──
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)
  const [meetingsError, setMeetingsError] = useState<string | null>(null)
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [attendanceDialog, setAttendanceDialog] = useState<{
    open: boolean
    meetingId: string
    meetingTitle: string
  }>({ open: false, meetingId: "", meetingTitle: "" })

  // ── Invitations state ──
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [invitationsLoading, setInvitationsLoading] = useState(false)
  const [invitationsError, setInvitationsError] = useState<string | null>(null)
  const [lastCreatedInvitation, setLastCreatedInvitation] =
    useState<Invitation | null>(null)
  const [invitationFormError, setInvitationFormError] = useState<string | null>(
    null
  )

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState("membres")

  // ── Dialogs ──
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: "default" | "destructive" | "success"
    onConfirm: () => void
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "default",
    onConfirm: () => {},
  })
  const [roleDialogMember, setRoleDialogMember] = useState<Member | null>(null)

  // ── Adhésions state ──
  const [adhesions, setAdhesions] = useState<AdhesionRequest[]>([])
  const [adhesionsLoading, setAdhesionsLoading] = useState(false)
  const [adhesionsError, setAdhesionsError] = useState<string | null>(null)
  const [adhesionActionLoading, setAdhesionActionLoading] = useState(false)
  const [adhesionSuccessMessage, setAdhesionSuccessMessage] = useState<string | null>(null)
  const [rejectDialogAdhesion, setRejectDialogAdhesion] = useState<AdhesionRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  // ═══════════════════════════════════════════════════════════════════
  // CHARGEMENT DES MEMBRES
  // ═══════════════════════════════════════════════════════════════════

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMembers()
      setMembers(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur de connexion à la base de données"
      console.error("Erreur chargement:", err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // ═══════════════════════════════════════════════════════════════════
  // CHARGEMENT DES RÉUNIONS
  // ═══════════════════════════════════════════════════════════════════

  const loadMeetings = useCallback(async () => {
    setMeetingsLoading(true)
    setMeetingsError(null)
    try {
      const data = await fetchMeetings()
      setMeetings(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des réunions."
      console.error("Erreur chargement réunions:", err)
      setMeetingsError(message)
    } finally {
      setMeetingsLoading(false)
    }
  }, [])

  // Load meetings when tab becomes active
  useEffect(() => {
    if (activeTab === "reunions" && meetings.length === 0) {
      loadMeetings()
    }
  }, [activeTab, meetings.length, loadMeetings])

  // ═══════════════════════════════════════════════════════════════════
  // CHARGEMENT DES INVITATIONS
  // ═══════════════════════════════════════════════════════════════════

  const loadInvitations = useCallback(async () => {
    setInvitationsLoading(true)
    setInvitationsError(null)
    try {
      const data = await fetchInvitations()
      setInvitations(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des invitations."
      console.error("Erreur chargement invitations:", err)
      setInvitationsError(message)
    } finally {
      setInvitationsLoading(false)
    }
  }, [])

  // Load invitations when tab becomes active
  useEffect(() => {
    if (activeTab === "invitations" && invitations.length === 0) {
      loadInvitations()
    }
  }, [activeTab, invitations.length, loadInvitations])

  // ═══════════════════════════════════════════════════════════════════
  // CHARGEMENT DES ADHÉSIONS
  // ═══════════════════════════════════════════════════════════════════

  const loadAdhesions = useCallback(async () => {
    setAdhesionsLoading(true)
    setAdhesionsError(null)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("adhesion_requests")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw new Error(error.message)
      setAdhesions((data as AdhesionRequest[]) || [])
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des demandes d'adhésion."
      setAdhesionsError(message)
    } finally {
      setAdhesionsLoading(false)
    }
  }, [])

  // Load adhesions when tab becomes active
  useEffect(() => {
    if (activeTab === "adhesions" && adhesions.length === 0) {
      loadAdhesions()
    }
  }, [activeTab, adhesions.length, loadAdhesions])

  // ═══════════════════════════════════════════════════════════════════
  // IDENTIFIER LE DIRECTEUR
  // ═══════════════════════════════════════════════════════════════════

  const director = members.find(
    (m) =>
      m.email === "directeur@retechci.org" || getMemberRole(m) === "director"
  )
  const directorId = director?.id || ""

  // ═══════════════════════════════════════════════════════════════════
  // FILTRES & STATS MEMBRES
  // ═══════════════════════════════════════════════════════════════════

  const membersWithStatus = useMemo(() => {
    return members.map((m) => ({
      ...m,
      _status: getMemberStatus(m),
      _role: getMemberRole(m),
    }))
  }, [members])

  const filteredMembers = useMemo(() => {
    return membersWithStatus.filter((m) => {
      const displayName = getDisplayName(m).toLowerCase()
      const matchSearch =
        !searchQuery ||
        displayName.includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus = statusFilter === "all" || m._status === statusFilter

      return matchSearch && matchStatus
    })
  }, [membersWithStatus, searchQuery, statusFilter])

  const stats = useMemo(
    () => ({
      total: members.length,
      active: membersWithStatus.filter((m) => m._status === "active").length,
      invited: membersWithStatus.filter((m) => m._status === "invited").length,
      suspended: membersWithStatus.filter((m) => m._status === "suspended")
        .length,
      pending: membersWithStatus.filter((m) => m._status === "pending").length,
    }),
    [members, membersWithStatus]
  )

  const occupiedRoles = useMemo(() => {
    const map: Partial<Record<MemberRole, Member>> = {}
    UNIQUE_ROLES.forEach((role) => {
      const holder = members.find((m) => getMemberRole(m) === role)
      if (holder) map[role] = holder
    })
    return map
  }, [members])

  // ── Adhésions computed lists ──
  const pendingAdhesions = useMemo(
    () => adhesions.filter((a) => a.status === "pending"),
    [adhesions]
  )
  const sentToPresidentAdhesions = useMemo(
    () => adhesions.filter((a) => a.status === "sent_to_president"),
    [adhesions]
  )
  const approvedAdhesions = useMemo(
    () => adhesions.filter((a) => a.status === "approved_by_president"),
    [adhesions]
  )
  const historyAdhesions = useMemo(
    () =>
      adhesions.filter((a) =>
        ["rejected", "rejected_by_president", "invitation_sent"].includes(
          a.status
        )
      ),
    [adhesions]
  )

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS MEMBRES
  // ═══════════════════════════════════════════════════════════════════

  const handleActivate = (member: Member) => {
    const displayName = getDisplayName(member)
    setConfirmDialog({
      open: true,
      title: `Activer ${displayName}`,
      description: `Ce membre passera du statut "Invité" à "Actif" et aura accès à son espace membre.`,
      confirmLabel: "Activer",
      variant: "success",
      onConfirm: () => executeStatusChange("active", member),
    })
  }

  const executeStatusChange = async (
    newStatus: MemberStatus,
    member: Member
  ) => {
    setActionLoading(true)
    try {
      await patchMember(member.id, { status: newStatus })
      await loadMembers()
      setConfirmDialog((prev) => ({ ...prev, open: false }))
    } catch (err) {
      console.error("Erreur:", err)
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
      console.error("Erreur:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS RÉUNIONS
  // ═══════════════════════════════════════════════════════════════════

  const handleCreateMeeting = async (data: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      await createMeeting(data)
      await loadMeetings()
      setMeetingFormOpen(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la création."
      alert(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelMeeting = (meeting: Meeting) => {
    setConfirmDialog({
      open: true,
      title: `Annuler : ${meeting.title}`,
      description: "Cette réunion sera marquée comme annulée.",
      confirmLabel: "Annuler la réunion",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(true)
        try {
          await patchMeeting(meeting.id, { status: "cancelled" })
          await loadMeetings()
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        } catch (err) {
          console.error("Erreur:", err)
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  const handleDeleteMeeting = (meeting: Meeting) => {
    setConfirmDialog({
      open: true,
      title: `Supprimer : ${meeting.title}`,
      description:
        "Cette action est irréversible. Toutes les réponses de présence seront également supprimées.",
      confirmLabel: "Supprimer définitivement",
      variant: "destructive",
      onConfirm: async () => {
        setActionLoading(true)
        try {
          await deleteMeeting(meeting.id)
          await loadMeetings()
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        } catch (err) {
          console.error("Erreur:", err)
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS INVITATIONS
  // ═══════════════════════════════════════════════════════════════════

  const handleCreateInvitation = async (data: Record<string, unknown>) => {
    setInvitationFormError(null)
    setActionLoading(true)
    try {
      const invitation = await createInvitation(data)
      setLastCreatedInvitation(invitation)
      await loadInvitations()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la création."
      setInvitationFormError(message)
    } finally {
      setActionLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS ADHÉSIONS
  // ═══════════════════════════════════════════════════════════════════

  const handleTransferToPresident = async (req: AdhesionRequest) => {
    setAdhesionActionLoading(true)
    setAdhesionSuccessMessage(null)
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("adhesion_requests")
        .update({
          status: "sent_to_president",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", req.id)
      if (error) throw new Error(error.message)
      await loadAdhesions()
      setAdhesionSuccessMessage(
        `Demande de ${req.first_name} ${req.last_name} transférée au Président avec succès.`
      )
      setTimeout(() => setAdhesionSuccessMessage(null), 4000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du transfert."
      alert(message)
    } finally {
      setAdhesionActionLoading(false)
    }
  }

  const handleRejectAdhesion = async () => {
    if (!rejectDialogAdhesion) return
    if (!rejectReason.trim()) return
    setAdhesionActionLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("adhesion_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectReason.trim(),
        })
        .eq("id", rejectDialogAdhesion.id)
      if (error) throw new Error(error.message)
      await loadAdhesions()
      setRejectDialogAdhesion(null)
      setRejectReason("")
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du refus."
      alert(message)
    } finally {
      setAdhesionActionLoading(false)
    }
  }

  const handleSendInvitation = async (req: AdhesionRequest) => {
    setAdhesionActionLoading(true)
    setAdhesionSuccessMessage(null)
    try {
      await createInvitation({
        email: req.email,
        first_name: req.first_name,
        last_name: req.last_name,
        phone: req.phone || null,
      })
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("adhesion_requests")
        .update({
          status: "invitation_sent",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", req.id)
      if (error) throw new Error(error.message)
      await loadAdhesions()
      setAdhesionSuccessMessage(
        `Invitation envoyée à ${req.first_name} ${req.last_name} avec succès !`
      )
      setTimeout(() => setAdhesionSuccessMessage(null), 4000)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi de l'invitation."
      alert(message)
    } finally {
      setAdhesionActionLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const headerName = director ? getDisplayName(director) : "Directeur"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ═══════ HEADER RETECHCI ═══════ */}
      <Header
        space="director"
        userName={headerName}
        userEmail={director?.email}
        userAvatar={director?.profile_photo || null}
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
                  Gestion des membres, réunions, invitations et vérification
                  d&apos;adhérents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ Onglets principaux ═══ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="membres" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Membres</span>
            </TabsTrigger>
            <TabsTrigger value="reunions" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Réunions</span>
            </TabsTrigger>
            <TabsTrigger value="adhesions" className="gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Adhésions</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-1.5">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Invitations</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="gap-1.5">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scanner QR</span>
            </TabsTrigger>
            <TabsTrigger value="parametres" className="gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════
              TAB : MEMBRES
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="membres" className="space-y-6 mt-6">
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
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-mono text-muted-foreground break-all">
                          {error}
                        </p>
                      </div>
                      {error.includes(
                        "new row violates row-level security"
                      ) && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-lg">
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            ⚠️ RLS (Row Level Security) bloque l&apos;accès
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Exécutez ce SQL dans Supabase SQL Editor pour
                            autoriser la lecture :
                          </p>
                          <code className="block mt-2 p-2 bg-background rounded text-[10px] font-mono whitespace-pre-wrap">
                            {`CREATE POLICY "Lecture publique members"\nON public.members\nFOR SELECT\nUSING (true);`}
                          </code>
                        </div>
                      )}
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

            {/* ═══ État vide ═══ */}
            {!loading && !error && members.length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-base font-medium mb-1">
                      Aucun membre enregistré
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Les membres apparaîtront ici dès qu&apos;ils auront été
                      invités.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ═══ Contenu principal ═══ */}
            {!error && members.length > 0 && (
              <>
                {/* Rôles uniques */}
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Rôles du bureau
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {UNIQUE_ROLES.map((role) => (
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
                    {
                      label: "Total",
                      value: stats.total,
                      color: "text-foreground",
                      bg: "bg-muted/50",
                    },
                    {
                      label: "Actifs",
                      value: stats.active,
                      color: "text-green-600 dark:text-green-400",
                      bg: "bg-green-50 dark:bg-green-950/20",
                    },
                    {
                      label: "Invités",
                      value: stats.invited,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-50 dark:bg-blue-950/20",
                    },
                    {
                      label: "En attente",
                      value: stats.pending,
                      color: "text-yellow-600 dark:text-yellow-400",
                      bg: "bg-yellow-50 dark:bg-yellow-950/20",
                    },
                    {
                      label: "Suspendus",
                      value: stats.suspended,
                      color: "text-red-600 dark:text-red-400",
                      bg: "bg-red-50 dark:bg-red-950/20",
                    },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardContent
                        className={`p-3 text-center rounded-xl ${stat.bg}`}
                      >
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
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
                      Activez les invitations et gérez les rôles
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
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
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
                        <span className="ml-3 text-muted-foreground">
                          Chargement des membres...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {filteredMembers.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">
                              Aucun membre trouvé pour cette recherche
                            </p>
                          </div>
                        ) : (
                          filteredMembers.map((member) => (
                            <MemberRow
                              key={member.id}
                              member={member}
                              directorId={directorId}
                              onActivate={handleActivate}
                              onRoleChange={handleRoleChange}
                            />
                          ))
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      {filteredMembers.length} membre
                      {filteredMembers.length > 1 ? "s" : ""} affiché
                      {filteredMembers.length > 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB : RÉUNIONS
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="reunions" className="space-y-6 mt-6">
            {/* Bouton créer */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Gestion des réunions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Créez et gérez les assemblées générales
                </p>
              </div>
              <Button
                onClick={() => setMeetingFormOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouvelle réunion</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>

            {/* Erreur */}
            {meetingsError && (
              <Card className="border-destructive/30">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">
                        Erreur de chargement
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {meetingsError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 h-8 text-xs"
                        onClick={loadMeetings}
                      >
                        Réessayer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chargement */}
            {meetingsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Chargement des réunions...
                </span>
              </div>
            )}

            {/* Liste vide */}
            {!meetingsLoading && !meetingsError && meetings.length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-base font-medium mb-1">
                      Aucune réunion planifiée
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                      Créez votre première assemblée générale pour commencer à
                      gérer les réunions.
                    </p>
                    <Button
                      onClick={() => setMeetingFormOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Créer une réunion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des réunions */}
            {!meetingsLoading &&
              !meetingsError &&
              meetings.length > 0 && (
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      onCancel={handleCancelMeeting}
                      onDelete={handleDeleteMeeting}
                      onViewAttendance={(m) =>
                        setAttendanceDialog({
                          open: true,
                          meetingId: m.id,
                          meetingTitle: m.title,
                        })
                      }
                    />
                  ))}
                </div>
              )}

            {/* Statistiques rapides */}
            {!meetingsLoading && meetings.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    {
                      label: "Total",
                      count: meetings.length,
                      color: "text-foreground",
                      bg: "bg-muted/50",
                    },
                    {
                      label: "À venir",
                      count: meetings.filter((m) => m.status === "upcoming")
                        .length,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-50 dark:bg-blue-950/20",
                    },
                    {
                      label: "En cours",
                      count: meetings.filter((m) => m.status === "ongoing")
                        .length,
                      color: "text-yellow-600 dark:text-yellow-400",
                      bg: "bg-yellow-50 dark:bg-yellow-950/20",
                    },
                    {
                      label: "Terminées",
                      count: meetings.filter((m) => m.status === "completed")
                        .length,
                      color: "text-green-600 dark:text-green-400",
                      bg: "bg-green-50 dark:bg-green-950/20",
                    },
                  ] as const
                ).map((stat) => (
                  <Card key={stat.label}>
                    <CardContent
                      className={`p-3 text-center rounded-xl ${stat.bg}`}
                    >
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB : ADHÉSIONS
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="adhesions" className="space-y-6 mt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Gestion des adhésions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Examinez les demandes d&apos;adhésion et validez les processus
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={loadAdhesions}
                disabled={adhesionsLoading}
              >
                Actualiser
              </Button>
            </div>

            {/* Loading */}
            {adhesionsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Chargement des demandes...
                </span>
              </div>
            )}

            {/* Error */}
            {adhesionsError && (
              <Card className="border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{adhesionsError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!adhesionsLoading && !adhesionsError && (
              <>
                {/* Section 1: Demandes en attente */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Demandes en attente
                        </CardTitle>
                        <CardDescription>
                          {pendingAdhesions.length} demande
                          {pendingAdhesions.length > 1 ? "s" : ""} à
                          traiter
                        </CardDescription>
                      </div>
                      <Badge className="bg-yellow-500 text-white">
                        {pendingAdhesions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pendingAdhesions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Aucune demande en attente
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {pendingAdhesions.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 rounded-xl border border-border/60 bg-card space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm">
                                  {req.first_name} {req.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {req.email}
                                </p>
                              </div>
                              <Badge className="bg-yellow-500 text-white text-[10px] shrink-0 gap-1">
                                <Clock className="h-3 w-3" />
                                En attente
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {req.profession && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {req.profession}
                                </span>
                              )}
                              {req.years_experience > 0 && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {req.years_experience} an
                                  {req.years_experience > 1 ? "s" : ""} d&apos;expérience
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatShortDate(req.created_at)}
                              </span>
                            </div>
                            {req.motivation && (
                              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                &ldquo;{req.motivation}&rdquo;
                              </p>
                            )}
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                onClick={() => handleTransferToPresident(req)}
                                disabled={adhesionActionLoading}
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Transférer au Président
                                </span>
                                <span className="sm:hidden">Transférer</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                                onClick={() => setRejectDialogAdhesion(req)}
                                disabled={adhesionActionLoading}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Refuser</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Section 2: Transférées au Président */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Send className="h-4 w-4 text-blue-500" />
                          Transférées au Président
                        </CardTitle>
                        <CardDescription>
                          {sentToPresidentAdhesions.length} demande
                          {sentToPresidentAdhesions.length > 1
                            ? "s"
                            : ""}{" "}
                          en attente de validation
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {sentToPresidentAdhesions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sentToPresidentAdhesions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Aucune demande transférée
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {sentToPresidentAdhesions.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {req.first_name} {req.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {req.email}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Transférée le{" "}
                                {formatShortDate(req.reviewed_at)}
                              </p>
                            </div>
                            <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              En attente de validation
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Section 3: Validées par le Président */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Validées par le Président
                        </CardTitle>
                        <CardDescription>
                          {approvedAdhesions.length} demande
                          {approvedAdhesions.length > 1 ? "s" : ""} prête
                          {approvedAdhesions.length > 1 ? "s" : ""} pour
                          invitation
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        {approvedAdhesions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {approvedAdhesions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Aucune demande validée par le Président
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {approvedAdhesions.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm">
                                  {req.first_name} {req.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {req.email}
                                </p>
                              </div>
                              <Badge className="bg-green-500 text-white text-[10px] gap-1 shrink-0">
                                <CheckCircle className="h-3 w-3" />
                                Validée
                              </Badge>
                            </div>
                            {req.profession && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {req.profession}
                              </p>
                            )}
                            <Button
                              size="sm"
                              className="h-8 text-xs gap-1"
                              onClick={() => handleSendInvitation(req)}
                              disabled={adhesionActionLoading}
                            >
                              {adhesionActionLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              Envoyer un lien d&apos;invitation
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Success message */}
                {adhesionSuccessMessage && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {adhesionSuccessMessage}
                    </p>
                  </div>
                )}

                {/* Section 4: Historique */}
                {historyAdhesions.length > 0 && (
                  <Collapsible>
                    <Card>
                      <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Historique
                          </CardTitle>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs gap-1"
                            >
                              <ChevronDown className="h-4 w-4" />
                              {historyAdhesions.length} entrée
                              {historyAdhesions.length > 1 ? "s" : ""}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="pt-3">
                          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {historyAdhesions.map((req) => {
                              const isRejected =
                                req.status === "rejected" ||
                                req.status === "rejected_by_president"
                              return (
                                <div
                                  key={req.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium truncate">
                                        {req.first_name} {req.last_name}
                                      </p>
                                      <Badge
                                        className={`${isRejected ? "bg-red-500" : "bg-green-500"} text-white text-[10px]`}
                                      >
                                        {isRejected ? "Refusée" : "Invitation envoyée"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {req.email}
                                    </p>
                                    {req.rejection_reason && (
                                      <p className="text-[10px] text-destructive mt-0.5">
                                        Raison : {req.rejection_reason}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {formatShortDate(req.reviewed_at || req.created_at)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}
              </>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB : INVITATIONS
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="invitations" className="space-y-6 mt-6">
            {/* Formulaire */}
            <InvitationForm
              onSubmit={handleCreateInvitation}
              loading={actionLoading}
            />

            {/* Erreur du formulaire */}
            {invitationFormError && (
              <Card className="border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">
                      {invitationFormError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lien de la dernière invitation */}
            {lastCreatedInvitation && (
              <InvitationLinkCard invitation={lastCreatedInvitation} />
            )}

            {/* Liste des invitations */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Invitations envoyées
                    </CardTitle>
                    <CardDescription>
                      {invitations.length} invitation
                      {invitations.length > 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  {invitations.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={loadInvitations}
                    >
                      Actualiser
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Erreur */}
                {invitationsError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm text-destructive">
                      {invitationsError}
                    </p>
                  </div>
                )}

                {/* Chargement */}
                {invitationsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Chargement...
                    </span>
                  </div>
                )}

                {/* Liste */}
                {!invitationsLoading &&
                  !invitationsError &&
                  invitations.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {invitations.map((invitation) => (
                        <InvitationRow
                          key={invitation.id}
                          invitation={invitation}
                        />
                      ))}
                    </div>
                  )}

                {/* Vide */}
                {!invitationsLoading &&
                  !invitationsError &&
                  invitations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Aucune invitation envoyée pour le moment.
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB : SCANNER QR
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="scanner" className="space-y-6 mt-6">
            <ScannerSection />
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB : PARAMÈTRES DU SITE
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="parametres" className="space-y-6 mt-6">
            <SiteSettings />
          </TabsContent>
        </Tabs>

        {/* ═══ SQL d'installation ═══ */}
        {!error && (
          <Card className="border-dashed border-border/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Installation :</strong> Si les colonnes{" "}
                <code className="bg-muted px-1 rounded">status</code> et{" "}
                <code className="bg-muted px-1 rounded">role</code> n&apos;existent
                pas encore dans votre table Supabase, exécutez le SQL dans le SQL
                Editor de Supabase.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <Footer />

      {/* ═══════ DIALOGUES ═══════ */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        }
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

      <MeetingFormDialog
        open={meetingFormOpen}
        onClose={() => setMeetingFormOpen(false)}
        onSubmit={handleCreateMeeting}
        loading={actionLoading}
      />

      {attendanceDialog.open && (
        <AttendanceDialog
          key={attendanceDialog.meetingId}
          meetingId={attendanceDialog.meetingId}
          meetingTitle={attendanceDialog.meetingTitle}
          open={attendanceDialog.open}
          onClose={() =>
            setAttendanceDialog({ open: false, meetingId: "", meetingTitle: "" })
          }
        />
      )}

      {/* ═══════ DIALOG : Refuser adhésion ═══════ */}
      <Dialog
        open={!!rejectDialogAdhesion}
        onOpenChange={(v) => {
          if (!v) {
            setRejectDialogAdhesion(null)
            setRejectReason("")
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Refuser la demande d&apos;adhésion
            </DialogTitle>
            <DialogDescription>
              {rejectDialogAdhesion && (
                <>
                  Vous allez refuser la demande de{" "}
                  <strong>
                    {rejectDialogAdhesion.first_name}{" "}
                    {rejectDialogAdhesion.last_name}
                  </strong>
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="reject-reason">Motif du refus *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Expliquez la raison du refus..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogAdhesion(null)
                  setRejectReason("")
                }}
                disabled={adhesionActionLoading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRejectAdhesion}
                disabled={adhesionActionLoading || !rejectReason.trim()}
                className="flex-1 bg-destructive hover:bg-destructive/90"
              >
                {adhesionActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmer le refus"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
