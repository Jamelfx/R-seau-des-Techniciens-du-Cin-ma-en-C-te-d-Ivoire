"use client"

import React, { useState, useRef, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  CheckCircle, UserPlus, PenLine, Loader2, Plus, Trash2,
  Camera, Briefcase, FileText, CalendarDays, MapPin,
  Clock, Mail, Phone, Users, Award,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const TECHNICIAN_FUNCTIONS: string[] = [
  // Réalisation & Direction
  "Assistant Réalisateur",
  "Régisseur Général",
  "Régisseur Fixeur",
  "Scripte",
  // Image
  "Chef Opérateur / Directeur Photo",
  "Cadreur",
  "Assistant Caméra",
  "Chef Électricien",
  "Électricien",
  "Chef Machiniste",
  "Machiniste",
  "Photographe de Plateau",
  "Pilote Drone",
  // Son
  "Ingénieur du Son",
  "Perchiste",
  "Mixeur",
  "Sound Designer",
  // Montage & Post-production
  "Monteur Image",
  "Monteur Son",
  "Étalonneur / Coloriste",
  "Infographiste",
  "Animateur 2D / 3D",
  "Motion Designer",
  "Truquiste",
  "Compositeur VFX",
  // Décoration
  "Chef Décorateur",
  "Accessoiriste",
  // Costumes
  "Chef Costumier",
  "Costumier",
  // Maquillage & Coiffure
  "Chef Maquilleur",
  "Maquilleur Prothésiste",
  "Coiffeur Plateau",
  // Cascades
  "Cascadeur",
  // Autres
  "Projectionniste",
  "Compositeur Musical",
]

const FILM_FORMATS = [
  { value: "fiction_long", label: "Fiction Long métrage" },
  { value: "doc_long", label: "Documentaire Long métrage" },
  { value: "fiction_court", label: "Fiction Court métrage" },
  { value: "doc_court", label: "Documentaire Court métrage" },
  { value: "serie_fiction", label: "Série Fiction" },
  { value: "serie_doc", label: "Série Documentaire" },
  { value: "clip", label: "Clip Musical" },
  { value: "publicite", label: "Publicité" },
  { value: "autre", label: "Autre" },
]

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface FilmEntry {
  id: string
  title: string
  format: string
  production_company: string
  year: string
  role: string
}

interface FormData {
  nom: string
  prenoms: string
  email: string
  phone: string
  fonction: string
  dateNaissance: string
  lieuNaissance: string
  anneesExperience: string
  biographie: string
  acceptAdhesion: boolean
  signature: string
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function AdhesionPage() {
  // ── State ──
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenoms: "",
    email: "",
    phone: "",
    fonction: "",
    dateNaissance: "",
    lieuNaissance: "",
    anneesExperience: "",
    biographie: "",
    acceptAdhesion: false,
    signature: "",
  })

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profilePhotoName, setProfilePhotoName] = useState<string>("")
  const [filmography, setFilmography] = useState<FilmEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Signature pad
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // ── Helpers ──
  const updateFormData = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const isFormValid = (): boolean => {
    return !!(
      formData.nom.trim() &&
      formData.prenoms.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.fonction &&
      formData.dateNaissance &&
      formData.lieuNaissance.trim() &&
      formData.anneesExperience &&
      formData.biographie.trim() &&
      formData.acceptAdhesion &&
      formData.signature
    )
  }

  // ── Photo handler ──
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Seuls les fichiers JPEG sont acceptés pour la photo.")
      return
    }

    // Validate size (1 Mo)
    if (file.size > 1 * 1024 * 1024) {
      setError("La photo doit faire moins de 1 Mo.")
      return
    }

    setError(null)
    setProfilePhotoName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      setProfilePhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ── Filmography handlers ──
  const addFilmEntry = () => {
    const newEntry: FilmEntry = {
      id: `film-${Date.now()}`,
      title: "",
      format: "",
      production_company: "",
      year: new Date().getFullYear().toString(),
      role: "",
    }
    setFilmography(prev => [...prev, newEntry])
  }

  const removeFilmEntry = (id: string) => {
    setFilmography(prev => prev.filter(f => f.id !== id))
  }

  const updateFilmEntry = (id: string, field: keyof FilmEntry, value: string) => {
    setFilmography(prev =>
      prev.map(f => (f.id === id ? { ...f, [field]: value } : f))
    )
  }

  // ── Signature pad handlers ──
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    const { x, y } = getCanvasPos(e)
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getCanvasPos(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = "#991b1b"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const sig = canvas.toDataURL()
      updateFormData("signature", sig)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateFormData("signature", "")
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/adhesion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.prenoms.trim(),
          last_name: formData.nom.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          profession: formData.fonction,
          birth_date: formData.dateNaissance,
          birth_place: formData.lieuNaissance.trim(),
          years_experience: parseInt(formData.anneesExperience, 10),
          biography: formData.biographie.trim(),
          filmography: filmography.length > 0
            ? filmography.map(f => ({
                title: f.title.trim(),
                format: f.format,
                production_company: f.production_company.trim(),
                year: f.year ? parseInt(f.year, 10) : null,
                role_in_production: f.role.trim(),
              }))
            : null,
          signature_data: formData.signature,
          profile_photo_base64: profilePhoto || null,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors de l'envoi. Veuillez réessayer.")
        setIsSubmitting(false)
        return
      }

      // Show success dialog instead of redirecting
      setShowSuccessDialog(true)
    } catch {
      setError("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ──
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* ── Background : fond rouge plat + image avec opacité réduite ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.08,
        }}
      />
      <div className="fixed inset-0 z-0 bg-red-950" style={{ opacity: 0.85 }} />

      {/* ── Content ── */}
      <div className="relative z-10">
        <Header />

        <main className="flex-1 pt-6 pb-16 px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            {/* ── Header ── */}
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4 border border-white/20">
                REJOIGNEZ LE RÉSEAU
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Demande d&apos;adhésion
              </h1>
              <p className="text-white/70 max-w-xl mx-auto text-sm sm:text-base">
                Remplissez ce formulaire pour rejoindre RETECHCI. Votre demande sera examinée
                par le Directeur Exécutif puis par le Conseil d&apos;Administration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ════════════════════════════════════════════════════════ */}
              {/* SECTION 1 : IDENTITÉ                                       */}
              {/* ════════════════════════════════════════════════════════ */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Identité</CardTitle>
                      <CardDescription>Informations personnelles du candidat</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Photo de profil */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Photo de profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserPlus className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {profilePhotoName ? (
                          <span className="text-green-600 font-medium">{profilePhotoName}</span>
                        ) : (
                          "Ajouter votre photo (JPEG, max 1 Mo)"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Nom et Prénoms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => updateFormData("nom", e.target.value)}
                        placeholder="KONÉ"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenoms">Prénoms *</Label>
                      <Input
                        id="prenoms"
                        value={formData.prenoms}
                        onChange={(e) => updateFormData("prenoms", e.target.value)}
                        placeholder="Amadou Moussa"
                        required
                      />
                    </div>
                  </div>

                  {/* Email et Téléphone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Téléphone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="+225 XX XX XX XX XX"
                        required
                      />
                    </div>
                  </div>

                  {/* Date et lieu de naissance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateNaissance" className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" /> Date de naissance *
                      </Label>
                      <Input
                        id="dateNaissance"
                        type="date"
                        value={formData.dateNaissance}
                        onChange={(e) => updateFormData("dateNaissance", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lieuNaissance" className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Lieu de naissance *
                      </Label>
                      <Input
                        id="lieuNaissance"
                        value={formData.lieuNaissance}
                        onChange={(e) => updateFormData("lieuNaissance", e.target.value)}
                        placeholder="Abidjan, Côte d&apos;Ivoire"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ════════════════════════════════════════════════════════ */}
              {/* SECTION 2 : PARCOURS PROFESSIONNEL                         */}
              {/* ════════════════════════════════════════════════════════ */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Parcours professionnel</CardTitle>
                      <CardDescription>Votre expérience dans le cinéma</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Fonction / Métier */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" />
                      Métier / Fonction (Technicien du cinéma) *
                    </Label>
                    <Select
                      value={formData.fonction}
                      onValueChange={(value) => updateFormData("fonction", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre métier" />
                      </SelectTrigger>
                      <SelectContent>
                        {TECHNICIAN_FUNCTIONS.map((func) => (
                          <SelectItem key={func} value={func}>
                            {func}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Années d'expérience */}
                  <div className="space-y-2">
                    <Label htmlFor="anneesExperience" className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Années d&apos;expérience *
                    </Label>
                    <Input
                      id="anneesExperience"
                      type="number"
                      min="0"
                      max="60"
                      value={formData.anneesExperience}
                      onChange={(e) => updateFormData("anneesExperience", e.target.value)}
                      placeholder="Ex : 5"
                      required
                    />
                  </div>

                  {/* Biographie */}
                  <div className="space-y-2">
                    <Label htmlFor="biographie" className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Biographie / Présentation *
                    </Label>
                    <Textarea
                      id="biographie"
                      value={formData.biographie}
                      onChange={(e) => updateFormData("biographie", e.target.value)}
                      placeholder="Parlez de votre parcours, vos compétences, vos réalisations..."
                      className="min-h-[120px] resize-y"
                      rows={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Décrivez votre parcours professionnel, vos compétences principales et ce qui vous motive à rejoindre RETECHCI.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* ════════════════════════════════════════════════════════ */}
              {/* SECTION 3 : FILMOGRAPHIE / CV                              */}
              {/* ════════════════════════════════════════════════════════ */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Filmographie / CV</CardTitle>
                        <CardDescription>
                          Projets sur lesquels vous avez travaillé (optionnel)
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFilmEntry}
                      className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filmography.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-muted-foreground/20 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">
                        Aucun projet ajouté
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Cliquez sur &quot;Ajouter&quot; pour lister vos projets
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filmography.map((film, index) => (
                        <FilmEntryCard
                          key={film.id}
                          film={film}
                          index={index}
                          onUpdate={(field, value) => updateFilmEntry(film.id, field, value)}
                          onRemove={() => removeFilmEntry(film.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ════════════════════════════════════════════════════════ */}
              {/* SECTION 4 : ENGAGEMENT & SIGNATURE                         */}
              {/* ════════════════════════════════════════════════════════ */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <PenLine className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Engagement &amp; Signature</CardTitle>
                      <CardDescription>Termes et validation du formulaire</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Engagement */}
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border/60">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="acceptAdhesion"
                        checked={formData.acceptAdhesion}
                        onCheckedChange={(checked) =>
                          updateFormData("acceptAdhesion", checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="acceptAdhesion"
                        className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                      >
                        Je signifie ma volonté d&apos;adhérer au RETECHCI et j&apos;accepte que le Conseil
                        d&apos;Administration examine ma demande. Je comprends que j&apos;aurai une
                        réponse dans un délai de 30 jours. *
                      </Label>
                    </div>
                  </div>

                  {/* Infos financières */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/40">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <span className="text-amber-600">💰</span>
                      Frais d&apos;adhésion et cotisation
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>
                        • Frais d&apos;adhésion :{" "}
                        <strong className="text-foreground">5 000 FCFA</strong> (paiement unique après validation)
                      </li>
                      <li>
                        • Cotisation mensuelle :{" "}
                        <strong className="text-foreground">2 000 FCFA</strong>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 mt-2 pt-2 border-t border-amber-200/50">
                      Vous recevrez un lien de paiement par email après validation de votre demande.
                    </p>
                  </div>

                  {/* Signature électronique */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <PenLine className="h-4 w-4 text-red-700" />
                      Signature électronique *
                    </Label>
                    <div className="border-2 border-dashed border-red-200 rounded-xl p-2 bg-white dark:bg-gray-900">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={150}
                        className="w-full h-32 rounded-lg cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          Dessinez votre signature dans le cadre ci-dessus
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSignature}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Effacer
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold"
                    size="lg"
                    disabled={!isFormValid() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Soumettre ma demande d&apos;adhésion
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </main>

        <Footer />
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BOÎTE DE DIALOGUE DE SUCCÈS                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Dialog open={showSuccessDialog} onOpenChange={() => setShowSuccessDialog(false)}>
        <DialogContent className="max-w-lg bg-white dark:bg-gray-950">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-green-700 dark:text-green-400">
                Demande envoyée avec succès !
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Votre demande d&apos;adhésion a été transmise au{" "}
                <strong className="text-foreground">Directeur Exécutif</strong> qui la transmettra
                au <strong className="text-foreground">Conseil d&apos;Administration</strong>.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="bg-muted/50 rounded-xl p-4 space-y-3 mt-2">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Délai de traitement
            </p>
            <p className="text-sm text-muted-foreground">
              Le Conseil d&apos;Administration va délibérer sur votre demande dans un délai de{" "}
              <strong className="text-foreground">30 jours</strong>. Vous recevrez un accusé de
              réception par email.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Prochaines étapes :</p>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Le Directeur Exécutif reçoit votre dossier et le transmet au Président</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Le Conseil d&apos;Administration délibère (délai de 30 jours)</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                <span>En cas d&apos;approbation, vous recevrez un lien d&apos;invitation par email</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Après activation, vous aurez accès à votre espace membre</span>
              </li>
            </ol>
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                window.location.href = "/"
              }}
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              Retour à l&apos;accueil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANT : FilmEntryCard
// ═══════════════════════════════════════════════════════════════════════

function FilmEntryCard({
  film,
  index,
  onUpdate,
  onRemove,
}: {
  film: FilmEntry
  index: number
  onUpdate: (field: keyof FilmEntry, value: string) => void
  onRemove: () => void
}) {
  return (
    <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          Projet
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Titre du film / série *</Label>
          <Input
            value={film.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Ex : Les Saisons"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Format *</Label>
          <Select value={film.format} onValueChange={(v) => onUpdate("format", v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {FILM_FORMATS.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Maison de production</Label>
          <Input
            value={film.production_company}
            onChange={(e) => onUpdate("production_company", e.target.value)}
            placeholder="Ex : African Productions"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Année *</Label>
          <Input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={film.year}
            onChange={(e) => onUpdate("year", e.target.value)}
            placeholder="2024"
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Votre rôle / poste *</Label>
        <Input
          value={film.role}
          onChange={(e) => onUpdate("role", e.target.value)}
          placeholder="Ex : Chef Opérateur"
          className="h-9 text-sm"
        />
      </div>
    </div>
  )
}
