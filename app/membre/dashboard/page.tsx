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
  User, 
  CreditCard, 
  FileText, 
  Settings, 
  Camera, 
  Upload,
  Plus,
  Trash2,
  Save,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  ImageIcon,
  Wallet,
  Smartphone,
  Building2,
  Loader2,
  Calendar,
  MapPin
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
  specialties: string[]
  experience_years: number
  profile_photo: string | null
  availability: string
  status: string
  role: string
  birth_date: string | null
  birth_place: string | null
  biography: string | null
  work_photos: string[]
  membership_level: string
  created_at: string
}

interface FilmographyItem {
  id?: string
  film_title: string
  film_format: string
  episode_count?: number
  production_company: string
  release_year: number
  role: string
}

const filmFormats = [
  { value: "fiction_long", label: "Fiction Long métrage" },
  { value: "doc_long", label: "Documentaire Long métrage" },
  { value: "fiction_court", label: "Fiction Court métrage" },
  { value: "doc_court", label: "Documentaire Court métrage" },
  { value: "serie_fiction", label: "Série Fiction" },
  { value: "serie_doc", label: "Série Documentaire" },
]

// Payment Dialog Component
function PaymentDialog({ memberName, memberId }: { memberName: string; memberId: string }) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "confirm" | "success">("select")
  const [phone, setPhone] = useState("")
  
  const paymentMethods = [
    { id: "wave", name: "Wave", icon: Wallet, color: "bg-cyan-500", description: "Paiement Wave" },
    { id: "orange", name: "Orange Money", icon: Smartphone, color: "bg-orange-500", description: "Paiement mobile Orange CI" },
    { id: "mtn", name: "MTN Mobile Money", icon: Smartphone, color: "bg-yellow-500", description: "Paiement mobile MTN CI" },
    { id: "card", name: "Carte Visa Prépayée", icon: CreditCard, color: "bg-purple-500", description: "Visa prépayée" },
  ]

  const handlePayment = () => {
    if (selectedMethod && phone) {
      setStep("confirm")
    }
  }

  const confirmPayment = () => {
    console.log("Payment confirmed:", { method: selectedMethod, phone, memberId, amount: 5000 })
    setStep("success")
  }

  if (step === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Paiement reussi !</h3>
        <p className="text-muted-foreground mb-4">Votre cotisation a ete enregistree</p>
        <Badge className="bg-green-500/20 text-green-400">Cotisation a jour</Badge>
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
            <span className="text-muted-foreground">Methode:</span>
            <span>{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Numero:</span>
            <span>{phone}</span>
          </div>
        </div>
        <Button onClick={confirmPayment} className="w-full">Confirmer le paiement</Button>
        <Button variant="outline" onClick={() => setStep("select")} className="w-full">Modifier</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === method.id 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-primary/50'
            }`}
          >
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
            <Label>Numero de telephone</Label>
            <Input 
              placeholder="+225 XX XX XX XX XX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handlePayment} className="w-full" disabled={!phone}>
            Payer 5 000 FCFA
          </Button>
        </div>
      )}
    </div>
  )
}

export default function MemberDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workPhotoInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [member, setMember] = useState<MemberData | null>(null)
  const [filmography, setFilmography] = useState<FilmographyItem[]>([])
  const [activeTab, setActiveTab] = useState("profile")
  const [photoError, setPhotoError] = useState("")
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profession: "",
    experience_years: 0,
    birth_date: "",
    birth_place: "",
    biography: "",
    availability: "available"
  })
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [workPhotos, setWorkPhotos] = useState<string[]>([])
  
  // New filmography form
  const [newFilm, setNewFilm] = useState<FilmographyItem>({
    film_title: "",
    film_format: "",
    episode_count: undefined,
    production_company: "",
    release_year: new Date().getFullYear(),
    role: ""
  })
  const [showFilmForm, setShowFilmForm] = useState(false)

  // Fetch member data on mount
  useEffect(() => {
    const fetchMemberData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/connexion')
        return
      }

      // Fetch member data
      const { data: memberData, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error || !memberData) {
        console.error("Error fetching member:", error)
        router.push('/connexion')
        return
      }

      setMember(memberData)
      setFormData({
        first_name: memberData.first_name || "",
        last_name: memberData.last_name || "",
        phone: memberData.phone || "",
        profession: memberData.profession || "",
        experience_years: memberData.experience_years || 0,
        birth_date: memberData.birth_date || "",
        birth_place: memberData.birth_place || "",
        biography: memberData.biography || "",
        availability: memberData.availability || "available"
      })
      setProfilePhoto(memberData.profile_photo)
      setWorkPhotos(memberData.work_photos || [])

      // Fetch filmography
      const { data: filmoData } = await supabase
        .from('member_filmography')
        .select('*')
        .eq('member_id', memberData.id)
        .order('release_year', { ascending: false })

      if (filmoData) {
        setFilmography(filmoData)
      }

      setLoading(false)
    }

    fetchMemberData()
  }, [router])

  // Handle profile photo upload
  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError("")

    // Check file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      setPhotoError("Seuls les fichiers JPEG sont acceptes")
      return
    }

    // Check file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setPhotoError("La photo doit faire moins de 1 Mo")
      return
    }

    // Convert to base64 for preview (in production, upload to storage)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle work photo upload
  const handleWorkPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError("")

    // Check max photos (2)
    if (workPhotos.length >= 2) {
      setPhotoError("Maximum 2 photos de travail autorisees")
      return
    }

    // Check file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      setPhotoError("Seuls les fichiers JPEG sont acceptes")
      return
    }

    // Check file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setPhotoError("La photo doit faire moins de 1 Mo")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setWorkPhotos([...workPhotos, reader.result as string])
    }
    reader.readAsDataURL(file)
  }

  // Remove work photo
  const removeWorkPhoto = (index: number) => {
    setWorkPhotos(workPhotos.filter((_, i) => i !== index))
  }

  // Save profile
  const handleSaveProfile = async () => {
    if (!member) return
    
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('members')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        profession: formData.profession,
        experience_years: formData.experience_years,
        birth_date: formData.birth_date || null,
        birth_place: formData.birth_place || null,
        biography: formData.biography,
        availability: formData.availability,
        profile_photo: profilePhoto,
        work_photos: workPhotos,
        updated_at: new Date().toISOString()
      })
      .eq('id', member.id)

    if (error) {
      console.error("Error saving:", error)
      alert("Erreur lors de la sauvegarde")
    } else {
      alert("Profil sauvegarde avec succes ! Vos informations sont maintenant visibles dans l'annuaire.")
      // Refresh member data
      setMember({
        ...member,
        ...formData,
        profile_photo: profilePhoto,
        work_photos: workPhotos
      })
    }
    
    setSaving(false)
  }

  // Add filmography item
  const handleAddFilm = async () => {
    if (!member || !newFilm.film_title || !newFilm.film_format || !newFilm.role) return

    const supabase = createClient()

    const { data, error } = await supabase
      .from('member_filmography')
      .insert({
        member_id: member.id,
        film_title: newFilm.film_title,
        film_format: newFilm.film_format,
        episode_count: newFilm.episode_count,
        production_company: newFilm.production_company,
        release_year: newFilm.release_year,
        role: newFilm.role
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding film:", error)
      alert("Erreur lors de l'ajout")
    } else if (data) {
      setFilmography([data, ...filmography])
      setNewFilm({
        film_title: "",
        film_format: "",
        episode_count: undefined,
        production_company: "",
        release_year: new Date().getFullYear(),
        role: ""
      })
      setShowFilmForm(false)
    }
  }

  // Delete filmography item
  const handleDeleteFilm = async (filmId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('member_filmography')
      .delete()
      .eq('id', filmId)

    if (!error) {
      setFilmography(filmography.filter(f => f.id !== filmId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) {
    return null
  }

  const memberCategory = member.experience_years >= 10 ? "A" : member.experience_years >= 5 ? "B" : "C"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Espace Membre</h1>
            <p className="text-muted-foreground">Bienvenue, {formData.first_name} {formData.last_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary">
              ID: {member.member_id || 'N/A'}
            </Badge>
            <Badge className={member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
              {member.status === 'active' ? 'Actif' : 'En attente'}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="profile" className="text-xs md:text-sm">
                  <User className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="cv" className="text-xs md:text-sm">
                  <FileText className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">CV</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs md:text-sm">
                  <CreditCard className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Cotisation</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  <Settings className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Paramètres</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-6">
                {photoError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {photoError}
                  </div>
                )}

                {/* Photo de profil */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Photo de profil
                    </CardTitle>
                    <CardDescription>
                      Format JPEG uniquement, maximum 1 Mo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-secondary">
                        {profilePhoto ? (
                          <Image
                            src={profilePhoto}
                            alt="Photo de profil"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleProfilePhotoChange}
                          accept="image/jpeg,image/jpg"
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Changer la photo
                        </Button>
                        <p className="text-xs text-muted-foreground">JPEG, max 1 Mo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations personnelles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom</Label>
                        <Input 
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Prenoms</Label>
                        <Input 
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date de naissance
                        </Label>
                        <Input 
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Lieu de naissance
                        </Label>
                        <Input 
                          value={formData.birth_place}
                          onChange={(e) => setFormData({...formData, birth_place: e.target.value})}
                          placeholder="Ex: Abidjan"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Telephone</Label>
                        <Input 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+225 XX XX XX XX XX"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          value={member.email}
                          disabled
                          className="mt-1 bg-secondary/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Profession / Metier</Label>
                        <Input 
                          value={formData.profession}
                          onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          placeholder="Ex: Chef Operateur"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Annees d&apos;experience</Label>
                        <Input 
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Disponibilite</Label>
                      <Select 
                        value={formData.availability} 
                        onValueChange={(value) => setFormData({...formData, availability: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="filming">En tournage</SelectItem>
                          <SelectItem value="unavailable">Non disponible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Biographie</Label>
                      <Textarea 
                        value={formData.biography}
                        onChange={(e) => setFormData({...formData, biography: e.target.value})}
                        placeholder="Presentez-vous en quelques lignes..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Photos de travail */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Photos de travail
                    </CardTitle>
                    <CardDescription>
                      Maximum 2 photos, format JPEG, max 1 Mo chacune
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {workPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-secondary group">
                          <Image
                            src={photo}
                            alt={`Photo de travail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removeWorkPhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                      {workPhotos.length < 2 && (
                        <button
                          onClick={() => workPhotoInputRef.current?.click()}
                          className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                        >
                          <Plus className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Ajouter</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={workPhotoInputRef}
                      onChange={handleWorkPhotoChange}
                      accept="image/jpeg,image/jpg"
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder le profil
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* CV / Filmography Tab */}
              <TabsContent value="cv" className="space-y-6 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Filmographie</CardTitle>
                      <CardDescription>
                        Ajoutez vos experiences cinematographiques
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowFilmForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un film
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* Add Film Form */}
                    {showFilmForm && (
                      <div className="bg-secondary/30 rounded-xl p-4 mb-6 space-y-4">
                        <h4 className="font-semibold">Nouveau film / Serie</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nom du film / Serie *</Label>
                            <Input 
                              value={newFilm.film_title}
                              onChange={(e) => setNewFilm({...newFilm, film_title: e.target.value})}
                              placeholder="Ex: La Vie en Rose"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Format *</Label>
                            <Select 
                              value={newFilm.film_format}
                              onValueChange={(value) => setNewFilm({...newFilm, film_format: value})}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selectionnez..." />
                              </SelectTrigger>
                              <SelectContent>
                                {filmFormats.map(format => (
                                  <SelectItem key={format.value} value={format.value}>
                                    {format.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {(newFilm.film_format === 'serie_fiction' || newFilm.film_format === 'serie_doc') && (
                          <div>
                            <Label>Nombre d&apos;episodes</Label>
                            <Input 
                              type="number"
                              value={newFilm.episode_count || ''}
                              onChange={(e) => setNewFilm({...newFilm, episode_count: parseInt(e.target.value) || undefined})}
                              placeholder="Ex: 26"
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Production</Label>
                            <Input 
                              value={newFilm.production_company}
                              onChange={(e) => setNewFilm({...newFilm, production_company: e.target.value})}
                              placeholder="Nom de la societe de production"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Annee</Label>
                            <Input 
                              type="number"
                              value={newFilm.release_year}
                              onChange={(e) => setNewFilm({...newFilm, release_year: parseInt(e.target.value) || new Date().getFullYear()})}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Votre poste / Role *</Label>
                          <Input 
                            value={newFilm.role}
                            onChange={(e) => setNewFilm({...newFilm, role: e.target.value})}
                            placeholder="Ex: Chef Operateur, Monteur Principal, etc."
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleAddFilm} disabled={!newFilm.film_title || !newFilm.film_format || !newFilm.role}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                          </Button>
                          <Button variant="outline" onClick={() => setShowFilmForm(false)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Filmography List */}
                    {filmography.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune filmographie ajoutee</p>
                        <p className="text-sm">Cliquez sur &quot;Ajouter un film&quot; pour commencer</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filmography.map((film) => (
                          <div 
                            key={film.id} 
                            className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                          >
                            <div>
                              <h4 className="font-semibold">{film.film_title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {filmFormats.find(f => f.value === film.film_format)?.label || film.film_format}
                                {film.episode_count && ` (${film.episode_count} episodes)`}
                                {' '}&bull;{' '}{film.release_year}
                              </p>
                              <p className="text-sm text-primary">{film.role}</p>
                              {film.production_company && (
                                <p className="text-xs text-muted-foreground">Production: {film.production_company}</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => film.id && handleDeleteFilm(film.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cotisation mensuelle</CardTitle>
                    <CardDescription>
                      5 000 FCFA / mois - Votre cotisation soutient le reseau
                    </CardDescription>
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
                        <CheckCircle className="h-4 w-4 mr-1" />
                        A jour
                      </Badge>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payer ma cotisation
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Paiement cotisation</DialogTitle>
                          <DialogDescription>
                            Cotisation mensuelle RETECHCI - 5 000 FCFA
                          </DialogDescription>
                        </DialogHeader>
                        <PaymentDialog 
                          memberName={`${formData.first_name} ${formData.last_name}`}
                          memberId={member.member_id || member.id}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
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
                        <p className="font-medium">Nouvelles opportunites</p>
                        <p className="text-sm text-muted-foreground">Etre informe des offres d&apos;emploi</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Member Card */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Ma carte professionnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfessionalCard
                  name={`${formData.first_name} ${formData.last_name}`}
                  role={formData.profession || "Technicien"}
                  title={member.role === 'director' ? 'Directeur Executif' : undefined}
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
