"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Download, Printer, Loader2, CheckCircle,
  CreditCard, User, Briefcase, Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberCardData {
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  role: string
  status: string
  profile_photo: string | null
  bureau_position: string | null
  ca_position: string | null
}

// ─── QR Code via API externe (aucun paquet npm requis) ───────────────────────

function getQrCodeUrl(data: string, size = 280): string {
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10&color=1a1a2e&bgcolor=ffffff&ecc=H`
}

// ─── Composant Principal ─────────────────────────────────────────────────────

export function MemberCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [member, setMember] = useState<MemberCardData | null>(null)
  const [qrUrl, setQrUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)

  // Charger les données du membre + générer le QR via API externe
  useEffect(() => {
    async function loadCardData() {
      try {
        const supabase = createClient()

        // Récupérer la session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) {
          setError("Vous devez être connecté pour voir votre carte.")
          setLoading(false)
          return
        }

        // Chercher le membre par email
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (memberError || !memberData) {
          setError("Profil membre introuvable.")
          setLoading(false)
          return
        }

        const cardData: MemberCardData = {
          member_id: memberData.member_id || "",
          first_name: memberData.first_name || "",
          last_name: memberData.last_name || "",
          email: memberData.email || "",
          phone: memberData.phone || "",
          profession: memberData.profession || "",
          role: memberData.role || "member",
          status: memberData.status || "pending",
          profile_photo: memberData.profile_photo || null,
          bureau_position: memberData.bureau_position || null,
          ca_position: memberData.ca_position || null,
        }

        setMember(cardData)

        // Générer le QR code via API externe (aucun paquet npm)
        const qrPayload = JSON.stringify({
          mid: cardData.member_id,
          n: `${cardData.first_name} ${cardData.last_name}`.trim(),
          e: cardData.email,
        })

        setQrUrl(getQrCodeUrl(qrPayload))
      } catch (err) {
        console.error("Erreur chargement carte:", err)
        setError("Erreur lors du chargement de la carte.")
      } finally {
        setLoading(false)
      }
    }

    loadCardData()
  }, [])

  // ─── Imprimer ──────────────────────────────────────────────────────────────

  const handlePrint = useCallback(() => {
    if (!cardRef.current || !member) return
    setPrinting(true)

    const printWindow = window.open("", "_blank", "width=900,height=600")
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression.")
      setPrinting(false)
      return
    }

    const cardHtml = cardRef.current.innerHTML
    const fullName = `${member.first_name} ${member.last_name}`.trim()

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Carte RETECHCI - ${fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }

          .card-container {
            width: 400px;
            height: 600px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            background: linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #DC143C 100%);
            box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          }

          .card-bg-pattern {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 50%);
            pointer-events: none;
          }

          .card-header {
            position: relative;
            padding: 24px 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .logo-area {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .logo-area img {
            width: 40px;
            height: 40px;
            object-fit: contain;
          }

          .org-full-name {
            font-size: 9px;
            font-weight: 600;
            color: rgba(255,255,255,0.85);
            line-height: 1.4;
            text-align: right;
            max-width: 180px;
            letter-spacing: 0.2px;
          }

          .card-body {
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 24px;
          }

          .photo-ring {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            padding: 4px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            margin-bottom: 16px;
          }

          .photo-ring img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
          }

          .photo-placeholder {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255,255,255,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid rgba(255,255,255,0.3);
          }

          .member-name {
            font-size: 22px;
            font-weight: 800;
            color: white;
            text-align: center;
            margin-bottom: 4px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .member-profession {
            font-size: 13px;
            font-weight: 500;
            color: rgba(255,255,255,0.85);
            margin-bottom: 8px;
          }

          .status-badge {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 6px;
            border: 1px solid rgba(255,255,255,0.2);
          }

          .position-badge {
            background: rgba(0,0,0,0.25);
            backdrop-filter: blur(10px);
            color: #FFD700;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 14px;
            border-radius: 20px;
            margin-bottom: 4px;
            border: 1px solid rgba(255,215,0,0.3);
          }

          .card-footer {
            position: relative;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255,255,255,0.1);
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .id-section {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .id-label {
            font-size: 8px;
            font-weight: 600;
            color: rgba(255,255,255,0.5);
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }

          .id-value {
            font-size: 15px;
            font-weight: 700;
            color: #FFD700;
            font-family: 'Courier New', monospace;
          }

          .qr-container {
            background: white;
            border-radius: 10px;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qr-container img {
            width: 70px;
            height: 70px;
          }
        </style>
      </head>
      <body>
        ${cardHtml}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
    setPrinting(false)
  }, [member])

  // ─── Télécharger comme image (via URL du QR) ───────────────────────────────

  const handleDownload = useCallback(() => {
    if (!member) return

    // Ouvrir le QR code dans un nouvel onglet pour sauvegarder
    if (qrUrl) {
      window.open(qrUrl, "_blank")
      toast.success("Cliquez droit sur l'image → Enregistrer sous...")
    }
  }, [member, qrUrl])

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de votre carte...</p>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm text-destructive font-medium">{error || "Carte indisponible"}</p>
        <p className="text-xs text-muted-foreground">
          Votre carte sera disponible une fois votre adhésion validée.
        </p>
      </div>
    )
  }

  const fullName = `${member.first_name} ${member.last_name}`.trim()
  const isActive = member.status === "active"
  const hasPosition = !!(member.bureau_position || member.ca_position)

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ─── CARTE ──────────────────────────────────────────────────────── */}
      <div ref={cardRef} className="relative w-[340px] sm:w-[400px] h-[510px] sm:h-[600px] rounded-[20px] overflow-hidden shadow-2xl select-none"
        style={{
          background: "linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #DC143C 100%)",
        }}
      >
        {/* Motif de fond */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)",
          }}
        />

        {/* ── Header ── */}
        <div className="relative p-5 sm:p-6 pt-5 sm:pt-6 flex justify-between items-start">
          {/* Logo RETECHCI — haut à gauche */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src="/logo.svg"
                alt="RETECHCI"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.innerHTML = '<span style="font-size:14px;font-weight:800;color:white;">R</span>'
                }}
              />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] sm:text-[11px] font-bold text-white/95 uppercase tracking-wider">
                RETECHCI
              </p>
            </div>
          </div>

          {/* Nom complet de l'organisation — haut à droite */}
          <p className="text-[8px] sm:text-[9px] font-semibold text-white/80 leading-tight text-right max-w-[170px] sm:max-w-[200px]">
            Réseau des Techniciens<br />du Cinéma en Côte d&apos;Ivoire
          </p>
        </div>

        {/* ── Séparateur doré fin ── */}
        <div className="relative mx-5 sm:mx-6 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        {/* ── Body ── */}
        <div className="relative flex-1 flex flex-col items-center px-6 sm:px-8 pt-3">
          {/* Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] mb-4"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
            }}
          >
            {member.profile_photo ? (
              <img
                src={member.profile_photo}
                alt={fullName}
                className="w-full h-full rounded-full object-cover border-[3px] border-white"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/15 flex items-center justify-center border-[3px] border-white/30">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" />
              </div>
            )}
          </div>

          {/* Nom */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white text-center mb-1"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
          >
            {fullName || "Membre RETECHCI"}
          </h2>

          {/* Profession */}
          {member.profession && (
            <p className="text-sm text-white/85 font-medium mb-2">
              {member.profession}
            </p>
          )}

          {/* Statut — Membre Actif */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-xs font-semibold px-4 py-1.5 rounded-full mb-2 flex items-center gap-1.5">
            {isActive ? (
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-amber-300" />
            )}
            {isActive ? "Membre Actif" : "En attente de validation"}
          </div>

          {/* Position Bureau — si assignée */}
          {member.bureau_position && (
            <div className="bg-black/25 backdrop-blur-sm border border-yellow-400/30 text-yellow-300 text-[10px] sm:text-[11px] font-semibold px-3.5 py-1 rounded-full mb-1.5 flex items-center gap-1.5 max-w-[260px] text-center">
              <span className="text-yellow-400">★</span>
              <span className="truncate">{member.bureau_position}</span>
            </div>
          )}

          {/* Position Conseil d'Administration — si assignée */}
          {member.ca_position && (
            <div className="bg-black/25 backdrop-blur-sm border border-purple-400/30 text-purple-200 text-[10px] sm:text-[11px] font-semibold px-3.5 py-1 rounded-full flex items-center gap-1.5 max-w-[260px] text-center">
              <span className="text-purple-300">◆</span>
              <span className="truncate">{member.ca_position}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="relative bg-black/30 backdrop-blur-md border-t border-white/10 px-5 sm:px-6 py-4 flex justify-between items-center">
          {/* ID */}
          <div className="flex flex-col gap-0.5">
            <p className="text-[8px] font-semibold text-white/40 tracking-[2px] uppercase">
              ID Membre
            </p>
            <p className="text-sm sm:text-base font-bold text-yellow-400 font-mono tracking-wide">
              {member.member_id || "—"}
            </p>
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="bg-white rounded-xl p-1.5 shadow-lg">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-[68px] h-[68px] sm:w-[76px] sm:h-[76px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── BOUTONS D'ACTIONS ───────────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button
          onClick={handlePrint}
          disabled={printing}
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 gap-2 px-6"
        >
          {printing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          Imprimer
        </Button>

        <Button
          onClick={handleDownload}
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 gap-2 px-6"
        >
          <Download className="h-4 w-4" />
          Télécharger QR
        </Button>
      </div>

      {/* ─── Infos additionnelles ───────────────────────────────────────── */}
      <div className="w-full max-w-[400px] space-y-3 mt-2">
        {/* Positions info */}
        {hasPosition && (
          <div className="space-y-2">
            {member.bureau_position && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <span className="text-yellow-500 text-sm">★</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">Membre du Bureau</p>
                  <p className="text-xs font-medium truncate">{member.bureau_position}</p>
                </div>
              </div>
            )}
            {member.ca_position && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                <span className="text-purple-500 text-sm">◆</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">Conseil d&apos;Administration</p>
                  <p className="text-xs font-medium truncate">{member.ca_position}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {member.phone && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Téléphone</p>
                <p className="text-xs font-medium truncate">{member.phone}</p>
              </div>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="text-xs font-medium truncate">{member.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            Présentez cette carte lors des événements RETECHCI. Le Directeur pourra scanner votre QR code pour valider votre présence.
          </p>
        </div>
      </div>
    </div>
  )
}
