"use client"

import { useState, useRef } from "react"
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
  ImageIcon
} from "lucide-react"
import Image from "next/image"

// Simulated member data
const memberData = {
  id: "CI-2024-8842",
  nom: "BASIRU",
  prenoms: "Jamel",
  email: "jamel.basiru@email.com",
  phone: "+225 07 XX XX XX XX",
  fonction: "Monteur Image",
  category: "A" as const,
  title: "Directeur Exécutif",
  dateNaissance: "1990-05-15",
  lieuNaissance: "Abidjan",
  anneesExperience: 8,
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  disponibilite: "available",
  cotisationStatus: "paid",
  memberSince: "2024-01-15",
  biography: "Monteur image passionné avec plus de 8 ans d'expérience dans le cinéma ivoirien. J'ai travaillé sur de nombreuses productions locales et internationales.",
  filmography: [
    { title: "La Vie en Rose", year: "2024", role: "Monteur Principal" },
    { title: "Abidjan Dreams", year: "2023", role: "Monteur" },
    { title: "Les Chemins de la Sagesse", year: "2022", role: "Assistant Monteur" },
  ],
  workPhotos: [
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
  ]
}

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(memberData)
  const [newFilm, setNewFilm] = useState({ title: "", year: "", role: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workPhotoInputRef = useRef<HTMLInputElement>(null)

  const updateProfile = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateProfile("photo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWorkPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          workPhotos: [...prev.workPhotos, reader.result as string]
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeWorkPhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      workPhotos: prev.workPhotos.filter((_, i) => i !== index)
    }))
  }

  const addFilmography = () => {
    if (newFilm.title && newFilm.year && newFilm.role) {
      setProfileData(prev => ({
        ...prev,
        filmography: [...prev.filmography, newFilm]
      }))
      setNewFilm({ title: "", year: "", role: "" })
    }
  }

  const removeFilmography = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      filmography: prev.filmography.filter((_, i) => i !== index)
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> À jour</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
      case "overdue":
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" /> En retard</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-8 px-4 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Bienvenue, {profileData.prenoms} !
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez votre profil et votre carte professionnelle
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cotisation</p>
                {getStatusBadge(profileData.cotisationStatus)}
              </div>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Carte</span>
              </TabsTrigger>
              <TabsTrigger value="cv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">CV</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Paramètres</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Photo & Basic Info */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Photo de profil</CardTitle>
                    <CardDescription>Cette photo apparaîtra sur votre carte et dans l&apos;annuaire</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20">
                        {profileData.photo ? (
                          <Image
                            src={profileData.photo}
                            alt={profileData.prenoms}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{profileData.prenoms} {profileData.nom}</h3>
                      <p className="text-primary">{profileData.fonction}</p>
                      <p className="text-sm text-muted-foreground">ID: {profileData.id}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>Ces informations sont visibles sur votre profil public</CardDescription>
                    </div>
                    <Button 
                      variant={isEditing ? "default" : "outline"} 
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <><Save className="h-4 w-4 mr-2" /> Enregistrer</> : "Modifier"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input
                          value={profileData.nom}
                          onChange={(e) => updateProfile("nom", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prénoms</Label>
                        <Input
                          value={profileData.prenoms}
                          onChange={(e) => updateProfile("prenoms", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => updateProfile("email", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => updateProfile("phone", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Disponibilité</Label>
                      <Select
                        value={profileData.disponibilite}
                        onValueChange={(value) => updateProfile("disponibilite", value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="filming">En Tournage</SelectItem>
                          <SelectItem value="unavailable">Indisponible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Biographie</Label>
                      <Textarea
                        value={profileData.biography}
                        onChange={(e) => updateProfile("biography", e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Work Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Photos de travail
                  </CardTitle>
                  <CardDescription>
                    Ajoutez des photos de vous en conditions de travail. Elles apparaîtront sur votre profil public.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profileData.workPhotos.map((photo, index) => (
                      <div key={index} className="relative group aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={photo}
                          alt={`Photo de travail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => removeWorkPhoto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <button
                      onClick={() => workPhotoInputRef.current?.click()}
                      className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Ajouter</span>
                    </button>
                    <input
                      ref={workPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleWorkPhotoUpload}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Card Tab */}
            <TabsContent value="card" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Carte Professionnelle Digitale</CardTitle>
                  <CardDescription>
                    Votre carte professionnelle unique avec QR code. Utilisez-la pour le pointage lors des événements 
                    et pour bénéficier des avantages partenaires.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-8">
                  <ProfessionalCard
                    member={{
                      id: profileData.id,
                      name: `${profileData.prenoms} ${profileData.nom}`,
                      role: profileData.fonction,
                      category: profileData.category,
                      title: profileData.title,
                      photo: profileData.photo
                    }}
                    size="lg"
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Utilisations du QR Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Pointage de présence</p>
                        <p className="text-sm text-muted-foreground">Réunions, AG, événements RETECHCI</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Avantages partenaires</p>
                        <p className="text-sm text-muted-foreground">Bons d&apos;achat, réductions, assurances</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Vérification d&apos;identité</p>
                        <p className="text-sm text-muted-foreground">Accès plateaux, locations matériel</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Historique des pointages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <div>
                          <p className="font-medium">AG Trimestrielle</p>
                          <p className="text-xs text-muted-foreground">15 Mars 2024</p>
                        </div>
                        <Badge variant="secondary">Présent</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <div>
                          <p className="font-medium">Réunion Bureau</p>
                          <p className="text-xs text-muted-foreground">28 Février 2024</p>
                        </div>
                        <Badge variant="secondary">Présent</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">Formation DaVinci</p>
                          <p className="text-xs text-muted-foreground">10 Février 2024</p>
                        </div>
                        <Badge variant="secondary">Présent</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CV Tab */}
            <TabsContent value="cv" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Filmographie</CardTitle>
                  <CardDescription>
                    Votre filmographie sera visible sur votre profil public et dans la section &quot;Talents à la Une&quot;
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.filmography.map((film, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{film.title}</h4>
                        <p className="text-sm text-muted-foreground">{film.role} - {film.year}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFilmography(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-3">Ajouter un film</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        placeholder="Titre du film"
                        value={newFilm.title}
                        onChange={(e) => setNewFilm(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Input
                        placeholder="Année"
                        value={newFilm.year}
                        onChange={(e) => setNewFilm(prev => ({ ...prev, year: e.target.value }))}
                      />
                      <Input
                        placeholder="Votre rôle"
                        value={newFilm.role}
                        onChange={(e) => setNewFilm(prev => ({ ...prev, role: e.target.value }))}
                      />
                      <Button onClick={addFilmography}>
                        <Plus className="h-4 w-4 mr-2" /> Ajouter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CV / Document</CardTitle>
                  <CardDescription>Téléchargez votre CV au format PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Glissez votre CV ici ou cliquez pour parcourir</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, DOC ou DOCX (max 10 MB)</p>
                    <Button variant="outline" className="mt-4">
                      Choisir un fichier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Gérez vos préférences de notification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rappels de cotisation</p>
                      <p className="text-sm text-muted-foreground">Recevez un rappel avant l&apos;échéance</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Événements RETECHCI</p>
                      <p className="text-sm text-muted-foreground">Réunions, AG, formations</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Opportunités de travail</p>
                      <p className="text-sm text-muted-foreground">Nouvelles offres correspondant à votre profil</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cotisation</CardTitle>
                  <CardDescription>Informations sur votre cotisation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Cotisation mensuelle</p>
                      <p className="text-2xl font-bold text-foreground">2 000 FCFA</p>
                      <p className="text-sm text-muted-foreground">Prochaine échéance : 1er Avril 2024</p>
                    </div>
                    {getStatusBadge(profileData.cotisationStatus)}
                  </div>
                  <Button className="w-full mt-4">
                    Payer ma cotisation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
