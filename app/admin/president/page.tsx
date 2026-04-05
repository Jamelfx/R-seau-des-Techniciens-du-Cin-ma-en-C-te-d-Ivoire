"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Crown, CheckCircle, Clock, XCircle, AlertTriangle, Loader2,
  Mail, Phone, Briefcase, CalendarDays, MapPin, FileText,
  Shield, ChevronDown, ChevronUp, Users, Scale,
  RotateCcw, Bell, PenLine, Wallet,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { FinanceView } from "@/components/finance-view"

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

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

interface Meeting {
  id: string
  title: string
  type: string
  description: string | null
  date: string
  time: string | null
  location: string | null
  agenda: string | null
  status: string
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const MEETING_TYPE_LABELS: Record<string, string> = {
  ca: "Conseil d'Administration",
  ag: "Assemblée Générale",
  ag_extra: "Assemblée Générale Extraordinaire",
  ordinary: "Assemblée Générale Ordinaire",
  extraordinary: "Assemblée Générale Extraordinaire",
  electoral: "Assemblée Élective",
}

const MEETING_TYPE_COLORS: Record<string, string> = {
  ca: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  ag: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
  ag_extra: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800",
  ordinary: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
  extraordinary: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800",
  electoral: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800",
}

const MEETING_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  upcoming: { label: "À venir", color: "bg-blue-500 text-white", icon: Clock },
  ongoing: { label: "En cours", color: "bg-yellow-500 text-white", icon: Loader2 },
  completed: { label: "Terminée", color: "bg-green-500 text-white", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-500 text-white", icon: XCircle },
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

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

function getInitials(req: AdhesionRequest): string {
  if (req.first_name && req.last_name)
    return `${req.first_name[0]}${req.last_name[0]}`.toUpperCase()
  if (req.first_name) return req.first_name[0].toUpperCase()
  return "?"
}

function getFullName(req: AdhesionRequest): string {
  if (req.first_name && req.last_name) return `${req.first_name} ${req.last_name}`
  if (req.first_name) return req.first_name
  if (req.last_name) return req.last_name
  return req.email || "Sans nom"
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RejectDialog
// ═══════════════════════════════════════════════════════════════════════

function RejectDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  loading?: boolean
}) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason.trim())
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setReason(""); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Refuser la demande d&apos;adhésion
          </DialogTitle>
          <DialogDescription>
            Veuillez indiquer la raison du refus. Cette information sera transmise au Directeur Exécutif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="rejection-reason">Raison du refus *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Ex : Profil incomplet, expérience insuffisante dans le domaine audiovisuel..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setReason(""); onClose() }}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmer le refus"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : RequestCard (expandable)
// ═══════════════════════════════════════════════════════════════════════

function RequestCard({
  request,
  expanded,
  onToggle,
  onApprove,
  onReject,
  approving = false,
}: {
  request: AdhesionRequest
  expanded: boolean
  onToggle: () => void
  onApprove: () => void
  onReject: () => void
  approving?: boolean
}) {
  const fullName = getFullName(request)
  const initials = getInitials(request)
  const createdLabel = formatShortDate(request.created_at)

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Summary row — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="text-xs bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{fullName}</span>
            <Badge className="bg-yellow-500 text-white text-[10px] gap-1 px-1.5">
              <Clock className="h-3 w-3" />
              En attente
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground truncate">{request.email}</span>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">{request.profession}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{createdLabel}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/60 p-4 sm:p-6 space-y-5 bg-muted/10">
          {/* Personal info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField icon={Briefcase} label="Profession" value={request.profession} />
            <InfoField icon={CalendarDays} label="Expérience" value={`${request.years_experience} an${request.years_experience > 1 ? "s" : ""}`} />
            <InfoField icon={Mail} label="Email" value={request.email} />
            <InfoField icon={Phone} label="Téléphone" value={request.phone || "Non renseigné"} />
          </div>

          {/* Motivation */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Motivation</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-background/50 rounded-lg p-3 border border-border/40">
              {request.motivation || "Non renseigné"}
            </p>
          </div>

          {/* Signature */}
          {request.signature_data && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Signature</span>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border border-border/40 inline-block">
                <img
                  src={request.signature_data}
                  alt="Signature du candidat"
                  className="max-h-24 max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onApprove}
              disabled={approving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {approving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Approuver
                </>
              )}
            </Button>
            <Button
              onClick={onReject}
              disabled={approving}
              variant="outline"
              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Refuser
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : InfoField
// ═══════════════════════════════════════════════════════════════════════

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : HistoryCard (approved or rejected)
// ═══════════════════════════════════════════════════════════════════════

function HistoryCard({ request }: { request: AdhesionRequest }) {
  const fullName = getFullName(request)
  const initials = getInitials(request)
  const isApproved = request.status === "approved_by_president" || request.status === "invitation_sent"
  const isRejected = request.status === "rejected_by_president"

  return (
    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card">
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        <AvatarFallback className={`text-[10px] font-medium ${
          isApproved
            ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400"
        }`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{fullName}</span>
          {isApproved ? (
            <Badge className="bg-green-500 text-white text-[10px] gap-1 px-1.5">
              <CheckCircle className="h-3 w-3" />
              Approuvée
            </Badge>
          ) : isRejected ? (
            <Badge className="bg-red-500 text-white text-[10px] gap-1 px-1.5">
              <XCircle className="h-3 w-3" />
              Refusée
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{request.email}</p>
        {isRejected && request.rejection_reason && (
          <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <p className="text-xs text-red-700 dark:text-red-400">
              <span className="font-semibold">Raison : </span>
              {request.rejection_reason}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <span className="text-xs text-muted-foreground">
          {formatShortDate(request.reviewed_at)}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : MeetingCard (read-only)
// ═══════════════════════════════════════════════════════════════════════

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const typeLabel = MEETING_TYPE_LABELS[meeting.type] || meeting.type
  const typeColor = MEETING_TYPE_COLORS[meeting.type] || "bg-muted text-muted-foreground border-border"
  const statusConf = MEETING_STATUS_CONFIG[meeting.status] || MEETING_STATUS_CONFIG.upcoming
  const StatusIcon = statusConf.icon

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">{meeting.title}</h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] border ${typeColor}`}>
              {typeLabel}
            </Badge>
            <Badge className={`${statusConf.color} text-[10px] gap-1 px-1.5`}>
              <StatusIcon className="h-3 w-3" />
              {statusConf.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <InfoField icon={CalendarDays} label="Date" value={formatDate(meeting.date)} />
        {meeting.time && (
          <InfoField icon={Clock} label="Heure" value={meeting.time} />
        )}
        {meeting.location && (
          <InfoField icon={MapPin} label="Lieu" value={meeting.location} />
        )}
      </div>

      {/* Agenda */}
      {meeting.agenda && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Ordre du jour</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
            {meeting.agenda}
          </p>
        </div>
      )}

      {/* Description */}
      {meeting.description && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{meeting.description}</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function PresidentDashboard() {
  const { toast } = useToast()

  // Data state
  const [pendingRequests, setPendingRequests] = useState<AdhesionRequest[]>([])
  const [approvedRequests, setApprovedRequests] = useState<AdhesionRequest[]>([])
  const [rejectedRequests, setRejectedRequests] = useState<AdhesionRequest[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)

  // ═══════════════════════════════════════════════════════════════════
  // FETCH DATA
  // ═══════════════════════════════════════════════════════════════════

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch pending requests (sent_to_president)
      const { data: pendingData, error: pendingError } = await supabase
        .from("adhesion_requests")
        .select("*")
        .eq("status", "sent_to_president")
        .order("created_at", { ascending: false })

      if (pendingError) throw pendingError

      // Fetch approved requests
      const { data: approvedData, error: approvedError } = await supabase
        .from("adhesion_requests")
        .select("*")
        .in("status", ["approved_by_president", "invitation_sent"])
        .order("reviewed_at", { ascending: false })

      if (approvedError) throw approvedError

      // Fetch rejected requests
      const { data: rejectedData, error: rejectedError } = await supabase
        .from("adhesion_requests")
        .select("*")
        .eq("status", "rejected_by_president")
        .order("reviewed_at", { ascending: false })

      if (rejectedError) throw rejectedError

      // Fetch upcoming meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from("meetings")
        .select("*")
        .in("status", ["upcoming", "ongoing"])
        .order("date", { ascending: true })

      if (meetingsError) throw meetingsError

      setPendingRequests(pendingData || [])
      setApprovedRequests(approvedData || [])
      setRejectedRequests(rejectedData || [])
      setMeetings(meetingsData || [])
    } catch (err) {
      console.error("Erreur de chargement:", err)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("adhesion_requests")
        .update({
          status: "approved_by_president",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error

      toast({
        title: "Demande approuvée",
        description: "Le Directeur Exécutif sera notifié.",
        variant: "default",
      })

      // Refresh data
      await fetchData()
      setExpandedId(null)
    } catch (err) {
      console.error("Erreur d'approbation:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectTargetId) return
    setApprovingId(rejectTargetId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("adhesion_requests")
        .update({
          status: "rejected_by_president",
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", rejectTargetId)

      if (error) throw error

      toast({
        title: "Demande refusée",
        description: "La raison du refus a été enregistrée.",
        variant: "default",
      })

      setRejectDialogOpen(false)
      setRejectTargetId(null)
      await fetchData()
      setExpandedId(null)
    } catch (err) {
      console.error("Erreur de refus:", err)
      toast({
        title: "Erreur",
        description: "Impossible de refuser la demande. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setApprovingId(null)
    }
  }

  const openRejectDialog = (requestId: string) => {
    setRejectTargetId(requestId)
    setRejectDialogOpen(true)
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════

  const pendingCount = pendingRequests.length
  const approvedCount = approvedRequests.length
  const rejectedCount = rejectedRequests.length

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Tableau de bord du Président</h1>
              <p className="text-sm text-muted-foreground">Président du Conseil d&apos;Administration — RETECHCI</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Chargement des données...</span>
          </div>
        ) : (
          <Tabs defaultValue="validations" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="validations" className="gap-1.5 text-xs sm:text-sm">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Validations</span>
                {pendingCount > 0 && (
                  <Badge className="bg-yellow-500 text-white text-[10px] ml-1 px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="historique" className="gap-1.5 text-xs sm:text-sm">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Historique</span>
              </TabsTrigger>
              <TabsTrigger value="convocations" className="gap-1.5 text-xs sm:text-sm">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Convocations</span>
                {meetings.length > 0 && (
                  <Badge className="bg-blue-500 text-white text-[10px] ml-1 px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {meetings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="finances" className="gap-1.5 text-xs sm:text-sm">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Finances</span>
              </TabsTrigger>
            </TabsList>

            {/* ───────────── TAB 1: VALIDATIONS ───────────── */}
            <TabsContent value="validations" className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/40">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-700 dark:text-yellow-400">{pendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">En attente</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/40">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">{approvedCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Approuvées</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-400">{rejectedCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Refusées</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pending requests list */}
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Demandes à traiter
                  {pendingCount === 0 && (
                    <span className="text-sm font-normal text-muted-foreground">— Aucune demande en attente</span>
                  )}
                </h2>

                {pendingCount === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Toutes les demandes ont été traitées. Aucune demande en attente de validation.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {pendingRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        expanded={expandedId === req.id}
                        onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
                        onApprove={() => handleApprove(req.id)}
                        onReject={() => openRejectDialog(req.id)}
                        approving={approvingId === req.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ───────────── TAB 2: HISTORIQUE ───────────── */}
            <TabsContent value="historique" className="space-y-8">
              {/* Approved */}
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Demandes approuvées
                  <span className="text-sm font-normal text-muted-foreground">({approvedCount})</span>
                </h2>

                {approvedCount === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Aucune demande approuvée pour le moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {approvedRequests.map((req) => (
                      <HistoryCard key={req.id} request={req} />
                    ))}
                  </div>
                )}
              </div>

              {/* Rejected */}
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Demandes refusées
                  <span className="text-sm font-normal text-muted-foreground">({rejectedCount})</span>
                </h2>

                {rejectedCount === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Aucune demande refusée pour le moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {rejectedRequests.map((req) => (
                      <HistoryCard key={req.id} request={req} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ───────────── TAB 3: CONVOCATIONS ───────────── */}
            <TabsContent value="convocations" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Prochaines réunions et assemblées
                </h2>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                  <Shield className="h-3 w-3 mr-0.5" />
                  Lecture seule
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Les convocations sont créées par le Directeur Exécutif. Vous pouvez consulter les détails ci-dessous.
              </p>

              {meetings.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Aucune réunion ou assemblée à venir.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ───────────── TAB 4: FINANCES (lecture seule) ───────────── */}
            <TabsContent value="finances" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Suivi financier
                </h2>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                  <Shield className="h-3 w-3 mr-0.5" />
                  Lecture seule
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Les données financières sont gérées par la Trésorière. Vous pouvez consulter les dépenses et cotisations ci-dessous.
              </p>
              <FinanceView readOnly />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Reject dialog */}
      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => { setRejectDialogOpen(false); setRejectTargetId(null) }}
        onConfirm={handleReject}
        loading={approvingId !== null}
      />

      <Footer />
    </div>
  )
}
