"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  QrCode, Search, Loader2, CheckCircle, XCircle, Camera,
  CameraOff, UserCheck, AlertTriangle, Calendar, Hash, Mail,
  Phone, Briefcase, ScanLine, Shield
} from "lucide-react"
import type { Member } from "@/lib/supabase/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanResult {
  found: boolean
  member?: Member | null
  search_type?: string
  error?: string
  validation?: {
    is_active: boolean
    is_up_to_date: boolean
    payment_status: string
  }
  attendance?: {
    success: boolean
    meeting: { id: string; title: string }
    status: string
    scanned_at: string
  } | { error: string }
}

interface Meeting {
  id: string
  title: string
  type: string
  date: string
  status: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDisplayName(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`
  if (m.first_name) return m.first_name
  if (m.last_name) return m.last_name
  return m.email?.split("@")[0] || "Sans nom"
}

function getInitials(m: Member): string {
  if (m.first_name && m.last_name) return `${m.first_name[0]}${m.last_name[0]}`.toUpperCase()
  return m.first_name?.[0]?.toUpperCase() || m.email?.[0]?.toUpperCase() || "?"
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-green-500 text-white" },
  pending: { label: "En attente", color: "bg-yellow-500 text-white" },
  suspended: { label: "Suspendu", color: "bg-red-500 text-white" },
  invited: { label: "Invité", color: "bg-blue-500 text-white" },
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  member: { label: "Membre", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  director: { label: "Directeur Exécutif", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  president: { label: "Président", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
  treasurer: { label: "Trésorière", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
}

// ─── Vérifie si BarcodeDetector est disponible ──────────────────────────────

function isBarcodeDetectorSupported(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window
}

// ─── Composant Principal ─────────────────────────────────────────────────────

export function ScannerSection() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraSupported] = useState(isBarcodeDetectorSupported())
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Meetings
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<string>("")

  // Load upcoming meetings
  useEffect(() => {
    fetch("/api/meetings")
      .then(r => r.json())
      .then(json => {
        const upcoming = (json.meetings || [])
          .filter((m: Meeting) => m.status === "upcoming")
          .sort((a: Meeting, b: Meeting) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setMeetings(upcoming)
      })
      .catch(() => {})
  }, [])

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // ─── Camera ──────────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    detectorRef.current = null
    setCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraLoading(true)
    setError(null)

    try {
      // Vérifier support BarcodeDetector
      if (!isBarcodeDetectorSupported()) {
        setError("Scanning par caméra non supporté sur ce navigateur. Utilisez Chrome ou Edge, ou entrez le code manuellement.")
        setCameraLoading(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)

        // Créer le détecteur de QR code natif
        detectorRef.current = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetector }).BarcodeDetector({
          formats: ["qr_code"],
        })

        // Scanner toutes les 500ms
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || !detectorRef.current) return
          try {
            const barcodes = await detectorRef.current.detect(videoRef.current)
            if (barcodes.length > 0) {
              const detectedCode = barcodes[0].rawValue.trim()
              if (detectedCode) {
                stopCamera()
                // Extraire member_id du payload JSON
                let memberId = detectedCode
                try {
                  const parsed = JSON.parse(detectedCode)
                  if (parsed.mid) memberId = parsed.mid
                } catch {
                  // Utiliser la chaîne brute comme member_id
                }
                setCode(memberId)
                handleSearchWithCode(memberId)
              }
            }
          } catch {
            // Ignorer les erreurs de détection silencieusement
          }
        }, 500)
      }
    } catch (err) {
      setError("Caméra non accessible. Vérifiez les permissions ou utilisez la recherche manuelle.")
    } finally {
      setCameraLoading(false)
    }
  }, [stopCamera, handleSearchWithCode])

  // ─── Search ──────────────────────────────────────────────────────────────

  const handleSearchWithCode = useCallback(async (searchCode: string) => {
    if (!searchCode.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSuccessMsg(null)

    try {
      const res = await fetch("/api/members/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: searchCode.trim() }),
      })
      const json = await res.json() as ScanResult

      setResult(json)
      if (!json.found) {
        setError(json.error || "Membre non trouvé.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = () => {
    handleSearchWithCode(code)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  // ─── Validate & Mark Attendance ──────────────────────────────────────────

  const handleValidate = async () => {
    if (!code.trim() || !selectedMeeting) return
    setValidating(true)
    setSuccessMsg(null)
    setError(null)

    try {
      const res = await fetch("/api/scan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          meeting_id: selectedMeeting,
        }),
      })
      const json = await res.json() as ScanResult
      setResult(json)

      if (json.attendance && "success" in json.attendance && json.attendance.success) {
        setSuccessMsg(`✅ Présence confirmée pour "${json.attendance.meeting.title}"`)
      } else if (json.attendance && "error" in json.attendance) {
        setError(json.attendance.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la validation.")
    } finally {
      setValidating(false)
    }
  }

  // ─── Reset ───────────────────────────────────────────────────────────────

  const handleReset = () => {
    setCode("")
    setResult(null)
    setError(null)
    setSuccessMsg(null)
    setSelectedMeeting("")
  }

  // ─── Derived ─────────────────────────────────────────────────────────────

  const member = result?.member
  const memberStatus = member?.status || "pending"
  const memberRole = member?.role || "member"

  return (
    <div className="space-y-5">
      {/* ─── Scan Card ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Scanner QR / Rechercher un membre
          </CardTitle>
          <CardDescription>
            Scannez le QR code d&apos;un membre ou entrez son numéro d&apos;adhérent pour vérifier et valider sa présence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera / Manual toggle */}
          <div className="flex gap-2">
            {!cameraActive ? (
              <Button
                variant="outline"
                onClick={startCamera}
                disabled={cameraLoading || loading || !cameraSupported}
                className="gap-2 border-dashed"
                title={cameraSupported ? "Scanner via caméra" : "Non supporté sur ce navigateur (utilisez Chrome ou Edge)"}
              >
                {cameraLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {cameraLoading ? "Activation caméra..." : "Scanner QR Code"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopCamera}
                className="gap-2"
              >
                <CameraOff className="h-4 w-4" />
                Arrêter la caméra
              </Button>
            )}
          </div>

          {!cameraSupported && (
            <p className="text-[11px] text-muted-foreground">
              💡 Le scanning par caméra nécessite Chrome, Edge ou Opera. Utilisez la recherche manuelle ci-dessous.
            </p>
          )}

          {/* Camera view */}
          {cameraActive && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[300px]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-yellow-400 rounded-tl-xl" style={{ borderTop: "3px solid #facc15", borderLeft: "3px solid #facc15" }} />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-yellow-400 rounded-tr-xl" style={{ borderTop: "3px solid #facc15", borderRight: "3px solid #facc15" }} />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-yellow-400 rounded-bl-xl" style={{ borderBottom: "3px solid #facc15", borderLeft: "3px solid #facc15" }} />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-yellow-400 rounded-br-xl" style={{ borderBottom: "3px solid #facc15", borderRight: "3px solid #facc15" }} />
                  {/* Scan line animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-yellow-400/80 animate-bounce" style={{ animationDuration: "1.5s", top: "50%" }} />
                </div>
              </div>
              <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
                Pointez la caméra vers le QR code...
              </p>
            </div>
          )}

          {/* Manual search */}
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

      {/* ─── Error ─────────────────────────────────────────────────────── */}
      {error && !member && (
        <Card className="border-destructive/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  {result?.found === false ? "Membre non trouvé" : "Erreur"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Success Message ───────────────────────────────────────────── */}
      {successMsg && (
        <Card className="border-green-500/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Présence enregistrée
                </p>
                <p className="text-xs text-muted-foreground mt-1">{successMsg}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Member Result ─────────────────────────────────────────────── */}
      {member && (
        <>
          {/* Member Info Card */}
          <Card className="border-primary/20">
            <CardContent className="p-5">
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

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold">{getDisplayName(member)}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={`${STATUS_CONFIG[memberStatus]?.color || "bg-gray-500 text-white"} text-[10px] gap-1 px-1.5`}>
                        {STATUS_CONFIG[memberStatus]?.label || memberStatus}
                      </Badge>
                      {memberRole !== "member" && (
                        <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 border ${ROLE_CONFIG[memberRole]?.bg} ${ROLE_CONFIG[memberRole]?.color} ${ROLE_CONFIG[memberRole]?.border}`}>
                          <Shield className="h-3 w-3" />
                          {ROLE_CONFIG[memberRole]?.label || memberRole}
                        </Badge>
                      )}
                      {member.bureau_position && (
                        <Badge variant="secondary" className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-300">
                          ★ {member.bureau_position}
                        </Badge>
                      )}
                      {member.ca_position && (
                        <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 border border-purple-300">
                          ◆ {member.ca_position}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Validation status */}
                  {result?.validation && (
                    <div className={`p-3 rounded-lg border ${
                      result.validation.is_active
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    }`}>
                      <div className="flex items-center gap-2">
                        {result.validation.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          result.validation.is_active
                            ? "text-green-700 dark:text-green-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}>
                          {result.validation.is_active ? "Membre à jour — Validé" : "Membre non actif — Non validé"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Statut cotisation : {result.validation.payment_status}
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">N° :</span>
                      <span className="font-mono font-medium">{member.member_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{member.phone}</span>
                      </div>
                    )}
                    {member.profession && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{member.profession}</span>
                      </div>
                    )}
                  </div>

                  {result?.search_type && (
                    <p className="text-[10px] text-muted-foreground">
                      Recherché par : {result.search_type === "email" ? "adresse email" : "numéro d'adhérent / QR code"}
                    </p>
                  )}
                </div>

                {/* Check icon */}
                <div className="shrink-0 hidden sm:block">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    result?.validation?.is_active
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  }`}>
                    {result?.validation?.is_active ? (
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="h-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── Attendance Validation ──────────────────────────────────── */}
          <Card className="border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Valider la présence
              </CardTitle>
              <CardDescription>
                Sélectionnez un événement pour enregistrer la présence de ce membre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetings.length === 0 ? (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucun événement à venir.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créez d&apos;abord une réunion dans l&apos;onglet &quot;Réunions&quot;.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Événement / Réunion
                    </Label>
                    <Select value={selectedMeeting} onValueChange={setSelectedMeeting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un événement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {meetings.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex items-center gap-2">
                              <span>{m.title}</span>
                              <Badge variant="outline" className="text-[9px]">
                                {new Date(m.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleValidate}
                      disabled={validating || !selectedMeeting}
                      className="flex-1 gap-2"
                    >
                      {validating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                      {validating ? "Validation..." : "Valider & Marquer Présence"}
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="gap-2">
                      Nouveau scan
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
