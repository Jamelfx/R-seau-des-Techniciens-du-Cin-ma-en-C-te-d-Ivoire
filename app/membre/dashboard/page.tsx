"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProfessionalCard } from "@/components/professional-card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  User, CreditCard, FileText, Settings, Camera, Upload,
  Plus, Trash2, Save, CheckCircle, AlertCircle,
  Wallet, Smartphone, Loader2, Calendar, MapPin, Video, Link2,
  Play, ExternalLink, Film, Clapperboard, Award
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface MemberData {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  years_experience: number
  profile_photo: string | null
  availability: string
  status: string
  role: string
  birth_date: string | null
  birth_place: string | null
  biography: string | null
  membership_level: string
  created_at: string
  category: string
}

interface FilmographyItem {
  id?: string
  title?: string
  year?: number
  role_in_production?: string
  production_company?: string
  description?: string
  // ✅ NOUVEAUX CHAMPS — Lien vidéo intégré à chaque film
  video_url?: string | null
  video_title?: string | null
}

const filmFormats = [
  { value: "fiction_long", label: "Fiction Long métrage" },
  { value: "doc_long", label: "Documentaire Long métrage" },
  { value: "fiction_court", label: "Fiction Court métrage" },
  { value: "doc_court", label: "Documentaire Court métrage" },
  { value: "serie_fiction", label: "Série Fiction" },
  { value: "serie_doc", label: "Série Documentaire" },
]

// ─────────────────────────────────────────────────────────────────────
// ✅ Fonction utilitaire : Extraire la miniature et la plateforme d'une URL vidéo
// ─────────────────────────────────────────────────────────────────────
function getVideoInfo(url: string): { thumbnail: string; embedUrl: string; platform: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  if (ytMatch) {
    return {
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      platform: 'YouTube'
    }
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return {
      thumbnail: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'Vimeo'
    }
  }
  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/video\/([^_]+)/)
  if (dmMatch) {
    return {
      thumbnail: `https://www.dailymotion.com/thumbnail/video/${dmMatch[1]}`,
      embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`,
      platform: 'Dailymotion'
    }
  }
  return { thumbnail: '', embedUrl: url, platform: 'Vidéo' }
}

// ─────────────────────────────────────────────────────────────────────
// ✅ BADGE PLATEFORME — Affiche le logo couleur selon la plateforme
// ─────────────────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const config: Record<string, { className: string }> = {
    YouTube: { className: 'bg-red-600/20 text-red-400 border-red-600/30' },
    Vimeo: { className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    Dailymotion: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  }
  const style = config[platform] || { className: 'bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${style.className}`}>
      {platform}
    </Badge>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Payment Dialog (inchangé)
// ─────────────────────────────────────────────────────────────────────
function PaymentDialog({ memberName, memberId }: { memberName: string; memberId: string }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "confirm" | "success">("select")
  const [phone, setPhone] = useState("")
  
  const paymentMethods = [
    { id: "wave", name: "Wave", icon: Wallet, color: "bg-cyan-500" },
    { id: "orange", name: "Orange Money", icon: Smartphone, color: "bg-orange-500" },
    { id: "mtn", name: "MTN Mobile Money", icon: Smartphone, color: "bg-yellow-500" },
    { id: "card", name: "Carte Visa", icon: CreditCard, color: "bg-purple-500" },
  ]

  if (step === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Paiement réussi !</h3>
        <Badge className="bg-green-500/20 text-green-400">Cotisation à jour</Badge>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant:</span>
            <span className="font-bold">5 000 FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Méthode:</span>
            <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Numéro:</span>
            <span>{phone}</span>
          </div>
        </div>
        <Button onClick={() => setStep("success")} className="w-full">Confirmer le paiement</Button>
        <Button variant="outline" onClick={() => setStep("select")} className="w-full">Modifier</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button key={method.id} onClick={() => setSelectedMethod(method.id)}
            className={`p-4 rounded-xl border-2 transition-all ${selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
              <method.icon className="h-5 w-5 text-white" />
            </div>
            <p className="font-medium text-sm">{method.name}</p>
          </button>
        ))}
      </div>
      {selectedMethod && (
        <div className="space-y-4">
          <div>
            <Label>Numéro de téléphone</Label>
            <Input placeholder="+225 XX XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={() => phone && setStep("confirm")} className="w-full" disabled={!phone}>
            Payer 5 000 FCFA
          </Button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ✅ CARTE FILMOGRAPHIE AVEC MINIATURE VIDÉO INTÉGRÉE
// ─────────────────────────────────────────────────────────────────────
function FilmographyCard({ 
  film, 
  onDelete 
}: { 
  film: FilmographyItem; 
  onDelete: (id: string) => void 
}) {
  const videoInfo = film.video_url ? getVideoInfo(film.video_url) : null

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/80 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* ✅ Miniature vidéo */}
          {videoInfo?.thumbnail ? (
            <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
              <div className="aspect-video sm:aspect-[4/3] relative overflow-hidden bg-muted">
                <img
                  src={videoInfo.thumbnail}
                  alt={film.video_title || film.title || "Vidéo"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Bouton Play */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <Play className="size-5 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {/* Badge plateforme */}
                <div className="absolute top-2 right-2">
                  <PlatformBadge platform={videoInfo.platform} />
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder quand pas de vidéo */
            <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
              <div className="aspect-video sm:aspect-[4/3] relative overflow-hidden bg-muted flex items-center justify-center">
                <Film className="size-10 text-muted-foreground/30" />
              </div>
            </div>
          )}

          {/* ✅ Informations du film */}
          <div className="flex flex-1 flex-col justify-between gap-2 p-4 md:p-5">
            <div className="space-y-2">
              {/* Titre + Année */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground leading-tight">
                  {film.title}
                </h3>
                {film.year && (
                  <Badge variant="secondary" className="shrink-0 text-xs font-semibold tabular-nums">
                    {film.year}
                  </Badge>
                )}
              </div>

              {/* Rôle */}
              {film.role_in_production && (
                <div className="flex items-center gap-2">
                  <Award className="size-3.5 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-primary">{film.role_in_production}</span>
                </div>
              )}

              {/* Format */}
              {film.description && (
                <div className="flex items-center gap-2">
                  <Film className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{film.description}</span>
                </div>
              )}

              {/* Production */}
              {film.production_company && (
                <div className="flex items-center gap-2">
                  <Clapperboard className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{film.production_company}</span>
                </div>
              )}
            </div>

            {/* ✅ Lien vidéo + actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {film.video_url ? (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {film.video_title || "Voir la vidéo"}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/60 italic">Aucun lien vidéo</span>
              )}
              
              {film.id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(film.id!)}
                  className="h-8 w-8 shrink-0 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — MEMBER DASHBOARD
// ─────────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<MemberData | null>(null)
  const [filmography, setFilmography] = useState<FilmographyItem[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const [photoError, setPhotoError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", phone: "", profession: "",
    experience_years: 0, birth_date: "", birth_place: "",
    biography: "", availability: "available"
  })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  
  // ✅ Formulaire d'ajout film — avec les NOUVEAUX champs vidéo
  const [newFilm, setNewFilm] = useState({
    film_title: "", film_format: "", episode_count: undefined as number | undefined,
    production_company: "", release_year: new Date().getFullYear(), role: "",
    // ✅ NOUVEAUX CHAMPS
    video_url: "", video_title: ""
  })
  const [showFilmForm, setShowFilmForm] = useState(false)

  useEffect(() => {
    const fetchMemberData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data: memberData, error } = await supabase
        .from('members')
        .select('*')
        .or(`email.eq.${user.email},auth_user_id.eq.${user.id}`)
        .single()

      if (error || !memberData) { router.push('/connexion'); return }

      setMember(memberData)
      setFormData({
        first_name: memberData.first_name || "",
        last_name: memberData.last_name || "",
        phone: memberData.phone || "",
        profession: memberData.profession || "",
        experience_years: memberData.years_experience || 0,
        birth_date: memberData.birth_date || "",
        birth_place: memberData.birth_place || "",
        biography: memberData.biography || "",
        availability: memberData.availability || "available"
      })
      setProfilePhoto(memberData.profile_photo)

      // ✅ Récupérer la filmographie avec les champs vidéo
      const { data: filmoData } = await supabase
        .from('filmography')
        .select('*')
        .eq('member_id', memberData.id)
        .order('year', { ascending: false })

      if (filmoData) setFilmography(filmoData)
      setLoading(false)
    }
    fetchMemberData()
  }, [router])

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError("")
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      setPhotoError("Seuls les fichiers JPEG sont acceptés"); return
    }
    if (file.size > 1 * 1024 * 1024) {
      setPhotoError("La photo doit faire moins de 1 Mo"); return
    }
    const reader = new FileReader()
    reader.onloadend = () => setProfilePhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadPhotoToStorage = async (supabase: ReturnType<typeof createClient>, base64: string, path: string): Promise<string | null> => {
    try {
      const base64Data = base64.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteArray = new Uint8Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) byteArray[i] = byteCharacters.charCodeAt(i)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const { data, error } = await supabase.storage.from('member-photos').upload(path, blob, { upsert: true })
      if (error || !data) return null
      const { data: urlData } = supabase.storage.from('member-photos').getPublicUrl(path)
      return urlData.publicUrl
    } catch (e) { return null }
  }

  const handleSaveProfile = async () => {
    if (!member) return
    setSaving(true)
    setSaveSuccess(false)
    const supabase = createClient()

    let photoUrl = profilePhoto
    if (profilePhoto && profilePhoto.startsWith('data:')) {
      const uploaded = await uploadPhotoToStorage(supabase, profilePhoto, `${member.id}/profile-${Date.now()}.jpg`)
      if (uploaded) photoUrl = uploaded
    }

    // ✅ Mise à jour du profil — PLUS de video_links ici
    const { error } = await supabase
      .from('members')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        profession: formData.profession,
        years_experience: formData.experience_years,
        birth_date: formData.birth_date || null,
        birth_place: formData.birth_place || null,
        biography: formData.biography,
        availability: formData.availability,
        profile_photo: photoUrl,
        // ❌ SUPPRIMÉ : video_links: videoLinks
      })
      .eq('id', member.id)

    if (error) {
      alert(`Erreur: ${error.message}`)
    } else {
      setProfilePhoto(photoUrl)
      setMember({ ...member, ...formData, years_experience: formData.experience_years, profile_photo: photoUrl })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    setSaving(false)
  }

  // ✅ Ajouter un film — AVEC les champs vidéo
  const handleAddFilm = async () => {
    if (!member || !newFilm.film_title || !newFilm.role) return
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('filmography')
      .insert({
        member_id: member.id,
        title: newFilm.film_title,
        year: newFilm.release_year,
        role_in_production: newFilm.role,
        production_company: newFilm.production_company,
        description: newFilm.film_format,
        // ✅ NOUVEAUX CHAMPS vidéo
        video_url: newFilm.video_url || null,
        video_title: newFilm.video_title || null,
      })
      .select().single()

    if (!error && data) {
      setFilmography([data, ...filmography])
      setNewFilm({ 
        film_title: "", film_format: "", episode_count: undefined, 
        production_company: "", release_year: new Date().getFullYear(), role: "",
        video_url: "", video_title: ""
      })
      setShowFilmForm(false)
    } else {
      alert("Erreur : " + error?.message)
    }
  }

  const handleDeleteFilm = async (filmId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('filmography').delete().eq('id', filmId)
    if (!error) setFilmography(filmography.filter(f => f.id !== filmId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) return null

  const memberCategory = member.category || ((member.years_experience || 0) >= 10 ? "A" : (member.years_experience || 0) >= 5 ? "B" : "C")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Espace Membre</h1>
            <p className="text-muted-foreground">Bienvenue, {formData.first_name} {formData.last_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary">ID: {member.member_id || 'N/A'}</Badge>
            <Badge className={member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
              {member.status === 'active' ? 'Actif' : 'En attente'}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="profile" className="text-xs md:text-sm">
                  <User className="h-4 w-4 mr-1 md:mr-2" /><span className="hidden md:inline">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="cv" className="text-xs md:text-sm">
                  <FileText className="h-4 w-4 mr-1 md:mr-2" /><span className="hidden md:inline">CV</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs md:text-sm">
                  <CreditCard className="h-4 w-4 mr-1 md:mr-2" /><span className="hidden md:inline">Cotisation</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  <Settings className="h-4 w-4 mr-1 md:mr-2" /><span className="hidden md:inline">Paramètres</span>
                </TabsTrigger>
              </TabsList>

              {/* ═══════════════════════════════════════════════════════════
                  PROFIL TAB — ✅ SECTION VIDÉO SUPPRIMÉE
                  ═══════════════════════════════════════════════════════════ */}
              <TabsContent value="profile" className="space-y-6 mt-6">
                {photoError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />{photoError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />Profil sauvegardé avec succès !
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" />Photo de profil</CardTitle>
                    <CardDescription>Format JPEG uniquement, maximum 1 Mo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary">
                        {profilePhoto ? (
                          <Image src={profilePhoto} alt="Photo de profil" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input type="file" ref={fileInputRef} onChange={handleProfilePhotoChange} accept="image/jpeg,image/jpg" className="hidden" />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />Changer la photo
                        </Button>
                        <p className="text-xs text-muted-foreground">JPEG, max 1 Mo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Nom</Label><Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="mt-1" /></div>
                      <div><Label>Prénoms</Label><Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="mt-1" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />Date de naissance</Label>
                        <Input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" />Lieu de naissance</Label>
                        <Input value={formData.birth_place} onChange={(e) => setFormData({...formData, birth_place: e.target.value})} placeholder="Ex: Abidjan" className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+225 XX XX XX XX XX" className="mt-1" /></div>
                      <div><Label>Email</Label><Input value={member.email} disabled className="mt-1 bg-secondary/50" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Profession / Métier</Label><Input value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} placeholder="Ex: Chef Opérateur" className="mt-1" /></div>
                      <div><Label>Années d&apos;expérience</Label><Input type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})} className="mt-1" /></div>
                    </div>
                    <div>
                      <Label>Disponibilité</Label>
                      <Select value={formData.availability} onValueChange={(value) => setFormData({...formData, availability: value})}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="filming">En tournage</SelectItem>
                          <SelectItem value="unavailable">Non disponible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Biographie</Label>
                      <Textarea value={formData.biography ?? ""} onChange={(e) => setFormData({...formData, biography: e.target.value})} placeholder="Présentez-vous en quelques lignes..." className="mt-1 min-h-[100px]" />
                    </div>
                  </CardContent>
                </Card>

                {/* ❌ SECTION "LIENS DE PROJETS VIDÉO" SUPPRIMÉE — 
                    Les vidéos sont maintenant gérées dans l'onglet CV, 
                    directement dans chaque entrée de la filmographie. */}

                <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde en cours...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Sauvegarder le profil</>
                  )}
                </Button>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  CV TAB — ✅ FILMOGRAPHIE AVEC MINIATURES VIDÉO INTÉGRÉES
                  ═══════════════════════════════════════════════════════════ */}
              <TabsContent value="cv" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Film className="h-5 w-5" />
                        Filmographie
                      </CardTitle>
                      <CardDescription>
                        Ajoutez vos expériences cinématographiques avec liens vidéo
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowFilmForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />Ajouter un film
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* ✅ Formulaire d'ajout — AVEC les nouveaux champs vidéo */}
                    {showFilmForm && (
                      <div className="bg-secondary/30 rounded-xl p-4 mb-6 space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Film className="h-4 w-4" />
                          Nouveau film / Série
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nom du film / Série *</Label>
                            <Input 
                              value={newFilm.film_title} 
                              onChange={(e) => setNewFilm({...newFilm, film_title: e.target.value})} 
                              placeholder="Ex: La Vie en Rose" 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label>Format *</Label>
                            <Select value={newFilm.film_format} onValueChange={(value) => setNewFilm({...newFilm, film_format: value})}>
                              <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                              <SelectContent>
                                {filmFormats.map(format => (
                                  <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Production</Label>
                            <Input 
                              value={newFilm.production_company} 
                              onChange={(e) => setNewFilm({...newFilm, production_company: e.target.value})} 
                              placeholder="Société de production" 
                              className="mt-1" 
                            />
                          </div>
                          <div>
                            <Label>Année</Label>
                            <Input 
                              type="number" 
                              value={newFilm.release_year} 
                              onChange={(e) => setNewFilm({...newFilm, release_year: parseInt(e.target.value) || new Date().getFullYear()})} 
                              className="mt-1" 
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Votre poste / Rôle *</Label>
                          <Input 
                            value={newFilm.role} 
                            onChange={(e) => setNewFilm({...newFilm, role: e.target.value})} 
                            placeholder="Ex: Chef Opérateur" 
                            className="mt-1" 
                          />
                        </div>

                        {/* ✅✅✅ NOUVEAUX CHAMPS VIDÉO ✅✅✅ */}
                        <div className="border-t border-border/50 pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Video className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Lien vidéo du projet</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                              NOUVEAU
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="flex items-center gap-1.5">
                                <Link2 className="h-3.5 w-3.5" />
                                URL de la vidéo
                              </Label>
                              <Input 
                                value={newFilm.video_url} 
                                onChange={(e) => setNewFilm({...newFilm, video_url: e.target.value})} 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                className="mt-1" 
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                YouTube, Vimeo ou Dailymotion — La miniature sera automatiquement récupérée
                              </p>
                            </div>
                            <div>
                              <Label>Titre du lien vidéo</Label>
                              <Input 
                                value={newFilm.video_title} 
                                onChange={(e) => setNewFilm({...newFilm, video_title: e.target.value})} 
                                placeholder="Ex: Bande-annonce officielle" 
                                className="mt-1" 
                              />
                            </div>
                          </div>

                          {/* ✅ Aperçu miniature en temps réel */}
                          {newFilm.video_url && getVideoInfo(newFilm.video_url).thumbnail && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                              <div className="relative w-28 aspect-video rounded overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={getVideoInfo(newFilm.video_url).thumbnail}
                                  alt="Aperçu"
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/90">
                                    <Play className="size-3 ml-0.5" fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">Aperçu miniature</p>
                                <p className="text-xs text-muted-foreground truncate">{newFilm.video_url}</p>
                                <PlatformBadge platform={getVideoInfo(newFilm.video_url).platform} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleAddFilm} disabled={!newFilm.film_title || !newFilm.role}>
                            <Plus className="h-4 w-4 mr-2" />Ajouter
                          </Button>
                          <Button variant="outline" onClick={() => setShowFilmForm(false)}>Annuler</Button>
                        </div>
                      </div>
                    )}

                    {/* ✅ Liste des films — AVEC miniatures vidéo intégrées */}
                    {filmography.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune filmographie ajoutée</p>
                        <p className="text-sm">Cliquez sur &quot;Ajouter un film&quot; pour commencer</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filmography.map((film) => (
                          <FilmographyCard 
                            key={film.id} 
                            film={film} 
                            onDelete={handleDeleteFilm} 
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  COTISATION TAB (inchangé)
                  ═══════════════════════════════════════════════════════════ */}
              <TabsContent value="payments" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cotisation mensuelle</CardTitle>
                    <CardDescription>5 000 FCFA / mois</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium">Statut actuel</p>
                        <p className="text-sm text-muted-foreground">
                          Membre depuis {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />À jour
                      </Badge>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full"><CreditCard className="h-4 w-4 mr-2" />Payer ma cotisation</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Paiement cotisation</DialogTitle>
                          <DialogDescription>Cotisation mensuelle RETECHCI - 5 000 FCFA</DialogDescription>
                        </DialogHeader>
                        <PaymentDialog memberName={`${formData.first_name} ${formData.last_name}`} memberId={member.member_id || member.id} />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  PARAMÈTRES TAB (inchangé)
                  ═══════════════════════════════════════════════════════════ */}
              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card>
                  <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Rappels de cotisation</p>
                        <p className="text-sm text-muted-foreground">Recevoir des rappels par email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nouvelles opportunités</p>
                        <p className="text-sm text-muted-foreground">Être informé des offres d&apos;emploi</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SIDEBAR — Carte professionnelle (inchangée)
              ═══════════════════════════════════════════════════════════ */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader><CardTitle className="text-lg">Ma carte professionnelle</CardTitle></CardHeader>
              <CardContent>
                <ProfessionalCard
                  name={`${formData.first_name} ${formData.last_name}`}
                  role={formData.profession || "Technicien"}
                  title={member.role === 'director' ? 'Directeur Exécutif' : undefined}
                  category={memberCategory}
                  memberId={member.member_id || 'N/A'}
                  image={profilePhoto || undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
