"use client"

import { useRef } from "react"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import QRCode from "qrcode"
import { useEffect, useState } from "react"

interface ProfessionalCardProps {
  member?: {
    id: string
    name: string
    role: string
    title?: string
    photo?: string
  }
  memberId?: string
  name?: string
  role?: string
  function?: string
  category?: string
  title?: string
  photo?: string
  image?: string // ← ajout pour compatibilité avec dashboard
  showActions?: boolean
  size?: "sm" | "md" | "lg"
}

// Vrai logo RETECHCI SVG
function RetechciLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <path d="M8 8L16 20L8 32H4L12 20L4 8H8Z" fill="#dc2626"/>
      <path d="M12 8L20 20L12 32H8L16 20L8 8H12Z" fill="#dc2626"/>
      <path d="M20 8L32 8V12H24V18H30V22H24V28H32V32H20V8Z" fill="#dc2626"/>
    </svg>
  )
}

export function ProfessionalCard({ 
  member, 
  memberId,
  name: propName,
  role: propRole,
  function: propFunction,
  title: propTitle,
  photo: propPhoto,
  image: propImage, // ← compatibilité dashboard
  showActions = true, 
  size = "md" 
}: ProfessionalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  
  const id = member?.id || memberId || "CI-0000-0000"
  const name = member?.name || propName || ""
  const role = member?.role || propFunction || propRole || ""
  const title = member?.title || propTitle
  // ✅ Accepte photo ou image (les deux formats)
  const photo = member?.photo || propPhoto || propImage

  // ✅ Générer un vrai QR code scannable pointant vers le profil public
  useEffect(() => {
    if (!id || id === "CI-0000-0000") return
    const profileUrl = `https://retechci.org/membre/${id}`
    QRCode.toDataURL(profileUrl, {
      width: 80,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(url => setQrDataUrl(url)).catch(() => {})
  }, [id])

  const sizeClasses = {
    sm: "w-[200px] h-[320px]",
    md: "w-[280px] h-[440px]",
    lg: "w-[320px] h-[500px]"
  }

  const photoSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-28 h-28"
  }

  const textSizes = {
    sm: { name: "text-lg", role: "text-xs", badge: "text-[10px] px-2 py-0.5", id: "text-[10px]" },
    md: { name: "text-xl", role: "text-sm", badge: "text-xs px-3 py-1", id: "text-xs" },
    lg: { name: "text-2xl", role: "text-base", badge: "text-sm px-4 py-1.5", id: "text-sm" }
  }

  if (!name) {
    return (
      <div className="w-[280px] h-[440px] rounded-2xl bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    )
  }

  const handlePrint = () => {
    if (cardRef.current) {
      const printWindow = window.open('', '', 'height=600,width=400')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Carte Membre RETECHCI - ${name}</title>
              <style>
                body { 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  margin: 0;
                  background: #1a1a1a;
                  font-family: system-ui, sans-serif;
                }
              </style>
            </head>
            <body>
              ${cardRef.current.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleDownload = () => {
    // Ouvrir le profil dans un nouvel onglet pour téléchargement
    window.open(`https://retechci.org/membre/${id}`, '_blank')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={cardRef}
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden relative`}
        style={{
          background: 'linear-gradient(180deg, rgba(220,38,38,0.3) 0%, rgba(10,10,10,1) 40%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <RetechciLogo className="w-10 h-10" />
          <div className="text-right">
            <p className="text-[8px] text-gray-400 leading-tight">Réseau des Techniciens</p>
            <p className="text-[8px] text-gray-400 leading-tight">du Cinéma en Côte d&apos;Ivoire</p>
          </div>
        </div>

        {/* Photo */}
        <div className="flex flex-col items-center mt-4">
          <div className={`${photoSizes[size]} rounded-full border-4 border-red-600 overflow-hidden bg-muted`}>
            {photo ? (
              <Image 
                src={photo} 
                alt={name}
                width={120}
                height={120}
                className="w-full h-full object-cover"
                unoptimized={photo.startsWith('data:')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700 text-2xl font-bold text-white">
                {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>

          <h3 className={`${textSizes[size].name} font-bold text-white mt-4 text-center px-4`}>
            {name}
          </h3>
          <p className={`${textSizes[size].role} text-red-500 mt-1`}>
            {role}
          </p>
          {title && (
            <span className={`${textSizes[size].badge} bg-gray-700/50 text-gray-300 rounded-full mt-3`}>
              {title}
            </span>
          )}
        </div>

        {/* QR Code + ID */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID Membre</p>
              <p className={`${textSizes[size].id} text-red-500 font-mono font-bold`}>{id}</p>
            </div>
            {/* ✅ Vrai QR code scannable */}
            <div className="w-12 h-12 bg-white p-0.5 rounded">
              {qrDataUrl ? (
                <Image 
                  src={qrDataUrl} 
                  alt="QR Code" 
                  width={48} 
                  height={48}
                  className="w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
              )}
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      )}
    </div>
  )
}
