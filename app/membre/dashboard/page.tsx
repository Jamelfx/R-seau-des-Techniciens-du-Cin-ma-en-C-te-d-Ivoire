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
  Play, ExternalLink, Film, Clapperboard, Award, Pencil, X,
  Shield, ChevronRight, ArrowRightLeft,
  Lock, XCircle, Minus, CircleDollarSign, Clock, Ban
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
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
  gender: string | null
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

/* ══════════════════════════════════════════════════════════════════════════════
   ✅ CONSTANTES COTISATION
   ══════════════════════════════════════════════════════════════════════════════ */
const MONTHLY_FEE = 2000
const MONTHS_SUSPEND_AFTER = 12

const moisNoms = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

const tabItems = [
  { value: "profile", label: "Profil", icon: User },
  { value: "cv", label: "CV", icon: FileText },
  { value: "payments", label: "Cotisation", icon: CreditCard },
  { value: "settings", label: "Paramètres", icon: Settings },
]

// ─────────────────────────────────────────────────────────────────────
// ✅ Fonction utilitaire : Extraire la miniature et la plateforme d'une URL vidéo
// ─────────────────────────────────────────────────────────────────────
function getVideoInfo(url: string): { thumbnail: string; embedUrl: string; platform: string } {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  if (ytMatch) {
    return {
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      platform: 'YouTube'
    }
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return {
      thumbnail: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: 'Vimeo'
    }
  }
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
// ✅ BADGE PLATEFORME
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
// ✅ PaymentDialog — Choix du nombre de mois + montant dynamique
// ─────────────────────────────────────────────────────────────────────
function PaymentDialog({ memberName, memberId, onSuccess }: { memberName: string; memberId: string; onSuccess: () => void }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "confirm" | "success">("select")
  const [phone, setPhone] = useState("")
  const [monthsCount, setMonthsCount] = useState(1)
  const totalAmount = monthsCount * MONTHLY_FEE

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
        <p className="text-sm text-muted-foreground mb-3">
          {monthsCount} mois{monthsCount > 1 ? 's' : ''} de cotisation payé{monthsCount > 1 ? 's' : ''}
        </p>
        <Badge className="bg-green-500/20 text-green-400">Cotisation à jour</Badge>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durée:</span>
            <span className="font-medium">{monthsCount} mois{monthsCount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant ({MONTHLY_FEE.toLocaleString('fr-FR')} × {monthsCount}):</span>
            <span className="font-bold text-primary">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
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
        <Button onClick={() => { setStep("success"); onSuccess() }} className="w-full">Confirmer le paiement</Button>
        <Button variant="outline" onClick={() => setStep("select")} className="w-full">Modifier</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ✅ Sélection du nombre de mois */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-primary" />
          Nombre de mois à payer
        </Label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonthsCount(Math.max(1, monthsCount - 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            disabled={monthsCount <= 1}
          >
            <Minus className="size-4" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-2xl font-bold text-primary">{monthsCount}</span>
            <span className="text-sm text-muted-foreground ml-1">
              mois{monthsCount > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setMonthsCount(Math.min(12, monthsCount + 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
            disabled={monthsCount >= 12}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <CircleDollarSign className="size-4 text-primary" />
          <span className="text-lg font-bold">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
          <span className="text-xs text-muted-foreground">({MONTHLY_FEE.toLocaleString('fr-FR')}/mois)</span>
        </div>
      </div>

      <div className="border-t border-border/50 pt-4">
        <Label className="mb-3 block">Méthode de paiement</Label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button key={method.id} onClick={() => setSelectedMethod(method.id)}
              className={`p-3 rounded-xl border-2 transition-all ${selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <div className={`w-8 h-8 ${method.color} rounded-lg flex items-center justify-center mb-1.5 mx-auto`}>
                <method.icon className="h-4 w-4 text-white" />
              </div>
              <p className="font-medium text-xs">{method.name}</p>
            </button>
          ))}
        </div>
      </div>
      {selectedMethod && (
        <div className="space-y-3">
          <div>
            <Label>Numéro de téléphone</Label>
            <Input placeholder="+225 XX XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={() => phone && setStep("confirm")} className="w-full" disabled={!phone}>
            Payer {totalAmount.toLocaleString('fr-FR')} FCFA
          </Button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ✅ CARTE FILMOGRAPHIE AVEC MINIATURE VIDÉO INTÉGRÉE + BOUTON MODIFIER
// ─────────────────────────────────────────────────────────────────────
function FilmographyCard({ 
  film, 
  onDelete,
  onEdit
}: { 
  film: FilmographyItem; 
  onDelete: (id: string) => void
  onEdit: (film: FilmographyItem) => void
}) {
  const videoInfo = film.video_url ? getVideoInfo(film.video_url) : null

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/80 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {videoInfo?.thumbnail ? (
            <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
              <div className="aspect-video sm:aspect-[4/3] relative overflow-hidden bg-muted">
                <img
                  src={videoInfo.thumbnail}
                  alt={film.video_title || film.title || "Vidéo"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <Play className="size-5 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <PlatformBadge platform={videoInfo.platform} />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
              <div className="aspect-video sm:aspect-[4/3] relative overflow-hidden bg-muted flex items-center justify-center">
                <Film className="size-10 text-muted-foreground/30" />
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col justify-between gap-2 p-4 md:p-5">
            <div className="space-y-2">
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

              {film.role_in_production && (
                <div className="flex items-center gap-2">
                  <Award className="size-3.5 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-primary">{film.role_in_production}</span>
                </div>
              )}

              {film.description && (
                <div className="flex items-center gap-2">
                  <Film className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{film.description}</span>
                </div>
              )}

              {film.production_company && (
                <div className="flex items-center gap-2">
                  <Clapperboard className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{film.production_company}</span>
                </div>
              )}
            </div>

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
                <div className="flex items-center gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(film)}
                    className="h-8 w-8 hover:bg-primary/10"
                    title="Modifier ce film"
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(film.id!)}
                    className="h-8 w-8 hover:bg-red-500/10"
                    title="Supprimer ce film"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
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
    experience_years: 0, gender: "", birth_date: "", birth_place: "",
    biography: "", availability: "available"
  })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  
  const [newFilm, setNewFilm] = useState({
    film_title: "", film_format: "", episode_count: undefined as number | undefined,
    production_company: "", release_year: new Date().getFullYear(), role: "",
    video_url: "", video_title: ""
  })
  const [showFilmForm, setShowFilmForm] = useState(false)

  const [editingFilm, setEditingFilm] = useState<FilmographyItem | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  // ✅ État des mois payés
  const [paidMonths, setPaidMonths] = useState<number[]>([0, 1, 2, 3]) // Jan-Avr payés

    useEffect(() => {
    const fetchMemberData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      // ✅ Requête simplifiée — uniquement par email
      const { data: memberData, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email!)
        .maybeSingle()

      const isAdmin = user.email && (
        user.email.includes('directeur') ||
        user.email.includes('president') ||
        user.email.includes('tresorier') ||
        user.email.includes('admin')
      )

      if (!memberData && !isAdmin) { router.push('/connexion'); return }

      if (memberData) {
        setMember(memberData)
        setFormData({
          first_name: memberData.first_name || "",
          last_name: memberData.last_name || "",
          phone: memberData.phone || "",
          profession: memberData.profession || "",
          experience_years: memberData.years_experience || 0,
          gender: memberData.gender || "",
          birth_date: memberData.birth_date || memberData.date_of_birth || "",
          birth_place: memberData.birth_place || memberData.place_of_birth || "",
          biography: memberData.biography || memberData.bio || "",
          availability: memberData.availability || "available"
        })
        setProfilePhoto(memberData.profile_photo)

        const { data: filmoData } = await supabase
          .from('filmography')
          .select('*')
          .eq('member_id', memberData.id)
          .order('year', { ascending: false })

        if (filmoData) setFilmography(filmoData)
      } else if (isAdmin) {
        const adminProfile = {
          id: user.id,
          member_id: '',
          first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Directeur',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: '',
          profession: '',
          years_experience: 0,
          profile_photo: null,
          availability: 'available',
          status: 'active',
          role: 'director',
          gender: '',
          birth_date: '',
          birth_place: '',
          biography: '',
          membership_level: '',
          created_at: new Date().toISOString(),
          category: '',
        } as MemberData
        setMember(adminProfile)
        setFormData({
          first_name: adminProfile.first_name,
          last_name: adminProfile.last_name,
          phone: '',
          profession: '',
          experience_years: 0,
          gender: '',
          birth_date: '',
          birth_place: '',
          biography: '',
          availability: 'available'
        })
      }

      setLoading(false)
    }
    fetchMemberData()
  }, [router])

  const buildBirthDate = (currentDate: string, part: 'day' | 'month' | 'year', value: string) => {
    const parts = currentDate ? currentDate.split('-') : ['', '', '']
    let [y, m, d] = [parts[0] || '', parts[1] || '', parts[2] || '']
    if (part === 'day') d = value
    if (part === 'month') m = value
    if (part === 'year') y = value
    if (y && m && d) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    return ''
  }

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

    const updatePayload: Record<string, unknown> = {
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
    }
    if (formData.gender) {
      updatePayload.gender = formData.gender
    }

    let { error } = await supabase
      .from('members')
      .update(updatePayload)
      .eq('id', member.id)

    if (error && error.message.includes('gender')) {
      const { gender: _g, ...payloadWithoutGender } = updatePayload
      const retry = await supabase
        .from('members')
        .update(payloadWithoutGender)
        .eq('id', member.id)
      error = retry.error
      if (!retry.error) {
        setProfilePhoto(photoUrl)
        setMember({ ...member, ...formData, years_experience: formData.experience_years, profile_photo: photoUrl })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } else if (!error) {
      setProfilePhoto(photoUrl)
      setMember({ ...member, ...formData, years_experience: formData.experience_years, profile_photo: photoUrl })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }

    if (error) {
      alert(`Erreur: ${error.message}`)
    }
    setSaving(false)
  }

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

  const handleOpenEdit = (film: FilmographyItem) => {
    setEditingFilm({ ...film })
  }

  const handleUpdateFilm = async () => {
    if (!editingFilm || !editingFilm.id) return
    setEditSaving(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('filmography')
      .update({
        title: editingFilm.title,
        year: editingFilm.year,
        role_in_production: editingFilm.role_in_production,
        production_company: editingFilm.production_company,
        description: editingFilm.description,
        video_url: editingFilm.video_url || null,
        video_title: editingFilm.video_title || null,
      })
      .eq('id', editingFilm.id)
      .select().single()

    if (!error && data) {
      setFilmography(filmography.map(f => f.id === editingFilm.id ? data : f))
      setEditingFilm(null)
    } else {
      alert("Erreur : " + error?.message)
    }
    setEditSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) return null

  const isAdmin = member?.role === 'admin' || ['director', 'president', 'treasurer'].includes(member?.role)
  const hasBothRoles = isAdmin
  const isSuspended = member?.status === 'suspended'

  // ✅ Si suspendu → afficher l'écran de blocage
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-500/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="size-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-500">Compte suspendu</h2>
            <p className="text-sm text-muted-foreground">
              Votre compte a été suspendu car vous n&apos;avez pas payé vos cotisations pendant {MONTHS_SUSPEND_AFTER} mois consécutifs.
            </p>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Pour réactiver votre compte, veuillez contacter le Directeur Exécutif de RETECHCI.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="text-red-500 border-red-500/30" onClick={() => router.push('/connexion')}>
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
    )
  }

  const currentYear = new Date().getFullYear()
  const unpaidCount = 12 - paidMonths.length

  const memberCategory = member.category || ((member.years_experience || 0) >= 10 ? "A" : (member.years_experience || 0) >= 5 ? "B" : "C")

  // ✅ Extraire jour/mois/année depuis birth_date (format YYYY-MM-DD)
  const birthParts = formData.birth_date ? formData.birth_date.split('-') : ['', '', '']
  const birthDay = birthParts[2] || ''
  const birthMonth = birthParts[1] || ''
  const birthYear = birthParts[0] || ''

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Espace Membre</h1>
            <p className="text-muted-foreground">Bienvenue, {formData.first_name} {formData.last_name}</p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              ✅ BADGES DE RÔLE dans le header
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary">
              ID: {member.member_id || 'N/A'}
            </Badge>
            <Badge className={member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
              {member.status === 'active' ? 'Actif' : 'En attente'}
            </Badge>

            {/* ✅ Badge double rôle — visible SEULEMENT si l'utilisateur est Admin */}
            {hasBothRoles && (
              <Badge className="bg-amber-500 text-white gap-1 px-2.5 py-0.5 shadow-sm shadow-amber-500/20">
                <Shield className="size-3" />
                Admin
                <span className="mx-0.5">+</span>
                <User className="size-3" />
                Membre
              </Badge>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ✅ BANNIÈRE D'INFO si double rôle
            ═══════════════════════════════════════════════════════════════════ */}
        {hasBothRoles && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 shrink-0">
              <ArrowRightLeft className="size-4.5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Double rôle détecté — Vous avez accès à l&apos;espace Admin et Membre
              </p>
              <p className="text-xs text-muted-foreground">
                Vous êtes actuellement dans l&apos;espace Membre. Utilisez le bouton en haut pour basculer vers l&apos;Admin.
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              onClick={() => router.push('/admin')}
            >
              <Shield className="size-3.5" />
              <span className="hidden sm:inline">Aller à l&apos;Admin</span>
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">

            {/* ═══════════════════════════════════════════════════════════════════
                ✅ NAVIGATION AVEC SURBRILLANCE DE L'ONGLET ACTIF
                ═══════════════════════════════════════════════════════════════════ */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              
              {/* Navigation custom avec surbrillance */}
              <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl border border-border/50">
                {tabItems.map((tab) => {
                  const isActive = activeTab === tab.value
                  const Icon = tab.icon

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`size-4 transition-colors duration-200 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />

                      <span>{tab.label}</span>

                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
                      )}

                      {isActive && (
                        <ChevronRight className="size-3.5 text-primary hidden sm:block" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  PROFIL TAB
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

                    {/* ✅ SEXE — Masculin / Féminin */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Sexe</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Masculin</SelectItem>
                            <SelectItem value="female">Féminin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div />
                    </div>

                    {/* ✅ DATE DE NAISSANCE — 3 CHAMPS SÉPARÉS (mobile-friendly) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />Date de naissance</Label>
                        <div className="flex gap-2 mt-1">
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="JJ"
                              min={1}
                              max={31}
                              value={birthDay}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                                setFormData({...formData, birth_date: buildBirthDate(formData.birth_date, 'day', val)})
                              }}
                              className="w-[60px] text-center pr-1 pl-1"
                              inputMode="numeric"
                            />
                          </div>
                          <Select
                            value={birthMonth}
                            onValueChange={(value) => {
                              setFormData({...formData, birth_date: buildBirthDate(formData.birth_date, 'month', value)})
                            }}
                          >
                            <SelectTrigger className="flex-1 min-w-0">
                              <SelectValue placeholder="Mois" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">Janvier</SelectItem>
                              <SelectItem value="02">Février</SelectItem>
                              <SelectItem value="03">Mars</SelectItem>
                              <SelectItem value="04">Avril</SelectItem>
                              <SelectItem value="05">Mai</SelectItem>
                              <SelectItem value="06">Juin</SelectItem>
                              <SelectItem value="07">Juillet</SelectItem>
                              <SelectItem value="08">Août</SelectItem>
                              <SelectItem value="09">Septembre</SelectItem>
                              <SelectItem value="10">Octobre</SelectItem>
                              <SelectItem value="11">Novembre</SelectItem>
                              <SelectItem value="12">Décembre</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="AAAA"
                              min={1940}
                              max={2010}
                              value={birthYear}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                                setFormData({...formData, birth_date: buildBirthDate(formData.birth_date, 'year', val)})
                              }}
                              className="w-[76px] text-center pr-1 pl-1"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">Entrez le jour, sélectionnez le mois, puis tapez l&apos;année</p>
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
                      <div><Label>Profession / Métier</Label><Input
  value={formData.profession}
  onChange={(e) => setFormData({...formData, profession: e.target.value})}
  placeholder="Tapez ou choisissez votre métier..."
  className="mt-1"
  list="professions-datalist"
  autoComplete="off"
/>
<datalist id="professions-datalist">
  {AUDIOVISUAL_PROFESSIONS.map(p => (
    <option key={p} value={p} />
  ))}
</datalist>
<p className="text-xs text-muted-foreground mt-1">Saisissez librement ou choisissez dans la liste</p></div>
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

                <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde en cours...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Sauvegarder le profil</>
                  )}
                </Button>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  CV TAB — FILMOGRAPHIE AVEC MINIATURES VIDÉO
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
                            onEdit={handleOpenEdit}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  DIALOGUE DE MODIFICATION D'UN FILM
                  ═══════════════════════════════════════════════════════════ */}
              <Dialog open={!!editingFilm} onOpenChange={(open) => !open && setEditingFilm(null)}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Pencil className="h-5 w-5 text-primary" />
                      Modifier le film
                    </DialogTitle>
                    <DialogDescription>
                      Modifiez les informations de « {editingFilm?.title} »
                    </DialogDescription>
                  </DialogHeader>

                  {editingFilm && (
                    <div className="space-y-4 mt-4">
                      {editingFilm.video_url && getVideoInfo(editingFilm.video_url).thumbnail && (
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                          <div className="relative w-28 aspect-video rounded overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={getVideoInfo(editingFilm.video_url).thumbnail}
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
                            <p className="text-xs font-medium text-foreground">Miniature actuelle</p>
                            <PlatformBadge platform={getVideoInfo(editingFilm.video_url).platform} />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom du film / Série *</Label>
                          <Input 
                            value={editingFilm.title || ""} 
                            onChange={(e) => setEditingFilm({...editingFilm, title: e.target.value})} 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Format</Label>
                          <Select 
                            value={editingFilm.description || ""} 
                            onValueChange={(value) => setEditingFilm({...editingFilm, description: value})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionnez..." />
                            </SelectTrigger>
                            <SelectContent>
                              {filmFormats.map(format => (
                                <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Production</Label>
                          <Input 
                            value={editingFilm.production_company || ""} 
                            onChange={(e) => setEditingFilm({...editingFilm, production_company: e.target.value})} 
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label>Année</Label>
                          <Input 
                            type="number" 
                            value={editingFilm.year || ""} 
                            onChange={(e) => setEditingFilm({...editingFilm, year: parseInt(e.target.value) || undefined})} 
                            className="mt-1" 
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Votre poste / Rôle *</Label>
                        <Input 
                          value={editingFilm.role_in_production || ""} 
                          onChange={(e) => setEditingFilm({...editingFilm, role_in_production: e.target.value})} 
                          className="mt-1" 
                        />
                      </div>

                      <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Video className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Lien vidéo du projet</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="flex items-center gap-1.5">
                              <Link2 className="h-3.5 w-3.5" />
                              URL de la vidéo
                            </Label>
                            <Input 
                              value={editingFilm.video_url || ""} 
                              onChange={(e) => setEditingFilm({...editingFilm, video_url: e.target.value})} 
                              placeholder="https://www.youtube.com/watch?v=..." 
                              className="mt-1" 
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              YouTube, Vimeo ou Dailymotion
                            </p>
                          </div>
                          <div>
                            <Label>Titre du lien vidéo</Label>
                            <Input 
                              value={editingFilm.video_title || ""} 
                              onChange={(e) => setEditingFilm({...editingFilm, video_title: e.target.value})} 
                              placeholder="Ex: Bande-annonce officielle" 
                              className="mt-1" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleUpdateFilm} 
                          disabled={!editingFilm.title || !editingFilm.role_in_production || editSaving}
                          className="flex-1"
                        >
                          {editSaving ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sauvegarde...</>
                          ) : (
                            <><Save className="h-4 w-4 mr-2" />Enregistrer les modifications</>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingFilm(null)}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* ═══════════════════════════════════════════════════════════
                  ✅ COTISATION TAB — 2 000 FCFA/mois + Tableau annuel + Choix mois
                  ═══════════════════════════════════════════════════════════ */}
              <TabsContent value="payments" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-primary" />
                        Cotisation mensuelle
                      </CardTitle>
                      <CardDescription>{MONTHLY_FEE.toLocaleString('fr-FR')} FCFA / mois — {MONTHS_SUSPEND_AFTER} mois impayés = suspension</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <CreditCard className="h-4 w-4" />Payer ma cotisation
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Paiement cotisation</DialogTitle>
                          <DialogDescription>Cotisation RETECHCI — Choisissez le nombre de mois</DialogDescription>
                        </DialogHeader>
                        <PaymentDialog
                          memberName={`${formData.first_name} ${formData.last_name}`}
                          memberId={member.member_id || member.id}
                          onSuccess={() => {
                            const currentMonth = new Date().getMonth()
                            setPaidMonths(prev => [...prev, currentMonth])
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ── Résumé ── */}
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium">Membre depuis</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`gap-1 ${unpaidCount === 0 ? 'bg-green-500/20 text-green-400' : unpaidCount >= MONTHS_SUSPEND_AFTER ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {unpaidCount === 0 ? (
                            <><CheckCircle className="h-3.5" />À jour</>
                          ) : (
                            <><Clock className="h-3.5" />{unpaidCount} mois impayé{unpaidCount > 1 ? 's' : ''}</>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* ✅ Alerte si proche de la suspension */}
                    {unpaidCount >= MONTHS_SUSPEND_AFTER - 3 && unpaidCount < MONTHS_SUSPEND_AFTER && (
                      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Attention ! Il vous reste {MONTHS_SUSPEND_AFTER - unpaidCount} mois avant la suspension de votre compte.
                        </p>
                      </div>
                    )}

                    {/* ✅ Alerte URGENTE si 1 mois avant suspension */}
                    {unpaidCount >= MONTHS_SUSPEND_AFTER - 1 && unpaidCount < MONTHS_SUSPEND_AFTER && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <Ban className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                          URGENT : Payez immédiatement pour éviter la suspension de votre compte !
                        </p>
                      </div>
                    )}

                    {/* ═══ TABLEAU ANNUEL DES COTISATIONS ═══ */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="size-4 text-primary" />
                        État des cotisations — {currentYear}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {moisNoms.map((mois, index) => {
                          const isPaid = paidMonths.includes(index)
                          const isCurrentMonth = index === new Date().getMonth()
                          return (
                            <div
                              key={mois}
                              className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                                isPaid
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-secondary/30 border-border/50'
                              } ${isCurrentMonth ? 'ring-2 ring-primary/50' : ''}`}
                            >
                              {isPaid ? (
                                <CheckCircle className="size-5 text-green-500" />
                              ) : (
                                <XCircle className="size-5 text-muted-foreground/40" />
                              )}
                              <span className={`text-[10px] sm:text-xs font-medium leading-tight text-center ${
                                isPaid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                              }`}>
                                {mois.slice(0, 3)}.<br className="sm:hidden" />{mois.slice(3, 6)}
                              </span>
                              {isCurrentMonth && (
                                <span className="text-[8px] font-bold text-primary bg-primary/10 px-1 rounded">
                                  MAINTENANT
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1"><CheckCircle className="size-3 text-green-500" />Payé ({paidMonths.length})</span>
                          <span className="flex items-center gap-1"><XCircle className="size-3 text-muted-foreground/40" />Non payé ({unpaidCount})</span>
                        </div>
                        <span className="font-medium">
                          Total annuel : {(MONTHLY_FEE * 12).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ═══════════════════════════════════════════════════════════
                  PARAMÈTRES TAB
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
              SIDEBAR — Carte professionnelle
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
