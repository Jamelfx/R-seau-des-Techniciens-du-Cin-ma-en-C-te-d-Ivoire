"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, CreditCard, FileText, Settings, Camera, Download, 
  Edit2, Save, CheckCircle, Calendar, Mail, Phone, MapPin,
  Briefcase, Star, QrCode
} from "lucide-react"
import Image from "next/image"

// Mock member data
const mockMember = {
  id: "CI-2024-8842",
  firstName: "Jamel",
  lastName: "Basiru",
  email: "jamel.basiru@email.com",
  phone: "+225 07 XX XX XX XX",
  address: "Cocody Riviera 2, Abidjan",
  birthDate: "1985-03-15",
  specialty: "Monteur Image",
  secondarySpecialty: "Étalonneur",
  experienceLevel: "senior",
  yearsExperience: 12,
  biography: "Monteur image professionnel avec plus de 12 ans d'expérience dans le cinéma et la télévision en Côte d'Ivoire. Spécialisé dans les longs métrages dramatiques et les documentaires. Formé à l'INSAAC et perfectionnement à la FEMIS Paris.",
  category: "A",
  status: "active",
  memberSince: "2022-07-16",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  portfolio: "https://portfolio.jamelbasiru.com",
  linkedin: "https://linkedin.com/in/jamelbasiru",
  imdb: "https://imdb.com/name/nm1234567",
  filmography: [
    { title: "La Lumière d'Abidjan", year: 2023, role: "Monteur Principal" },
    { title: "Destins Croisés", year: 2022, role: "Monteur" },
    { title: "Le Retour", year: 2021, role: "Monteur & Étalonneur" },
  ]
}

// Professional Card Component with QR Code
function ProfessionalCard({ member, forPrint = false }: { member: typeof mockMember, forPrint?: boolean }) {
  return (
    <div className={`relative ${forPrint ? 'w-[400px]' : 'w-full max-w-sm'}`}>
      <div className="bg-gradient-to-br from-card via-card to-secondary border border-border rounded-2xl overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="bg-primary/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-foreground">RETECHCI</span>
          </div>
          <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
            CATEGORIE {member.category}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Photo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src={member.photo}
                alt={`${member.firstName} ${member.lastName}`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Name & Role */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-primary font-medium">{member.specialty}</p>
            {member.secondarySpecialty && (
              <p className="text-muted-foreground text-sm">{member.secondarySpecialty}</p>
            )}
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 bg-secondary text-muted-foreground text-xs rounded-full">
              {member.experienceLevel === "senior" ? "Directeur Exécutif" : member.experienceLevel === "intermediate" ? "Technicien Confirmé" : "Technicien"}
            </span>
          </div>

          {/* Member ID & QR */}
          <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">ID MEMBRE</p>
              <p className="font-mono font-bold text-foreground">{member.id}</p>
            </div>
            <div className="w-14 h-14 bg-foreground rounded-lg flex items-center justify-center">
              <QrCode className="h-10 w-10 text-background" />
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-secondary/30 px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Membre depuis {new Date(member.memberSince).getFullYear()}</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Actif
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MemberDashboard() {
  const [member, setMember] = useState(mockMember)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMember, setEditedMember] = useState(member)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setEditedMember(prev => ({ ...prev, photo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setMember(editedMember)
    setIsEditing(false)
    setPhotoPreview(null)
  }

  const handlePrintCard = () => {
    const printContent = printRef.current
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Carte Professionnelle - ${member.firstName} ${member.lastName}</title>
              <style>
                body { 
                  font-family: system-ui, sans-serif; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh;
                  margin: 0;
                  background: #f5f5f5;
                }
                .card {
                  background: white;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                  width: 400px;
                }
                .card-header {
                  background: #fee2e2;
                  padding: 16px 24px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .logo {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-weight: bold;
                }
                .logo-box {
                  width: 32px;
                  height: 32px;
                  background: #dc2626;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                }
                .category {
                  background: rgba(220, 38, 38, 0.2);
                  color: #dc2626;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 500;
                }
                .card-body {
                  padding: 24px;
                  text-align: center;
                }
                .photo {
                  width: 96px;
                  height: 96px;
                  border-radius: 50%;
                  margin: 0 auto 16px;
                  border: 4px solid #fee2e2;
                  object-fit: cover;
                }
                .name {
                  font-size: 20px;
                  font-weight: bold;
                  margin: 0;
                }
                .role {
                  color: #dc2626;
                  font-weight: 500;
                  margin: 4px 0;
                }
                .secondary-role {
                  color: #666;
                  font-size: 14px;
                }
                .badge {
                  display: inline-block;
                  background: #f5f5f5;
                  color: #666;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  margin: 16px 0;
                }
                .id-section {
                  background: #f5f5f5;
                  border-radius: 12px;
                  padding: 16px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-top: 16px;
                }
                .id-label {
                  font-size: 12px;
                  color: #666;
                }
                .id-value {
                  font-family: monospace;
                  font-weight: bold;
                  font-size: 16px;
                }
                .qr-placeholder {
                  width: 56px;
                  height: 56px;
                  background: #333;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 10px;
                }
                .card-footer {
                  background: #f9f9f9;
                  padding: 12px 24px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  color: #666;
                }
                .status {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
                .status-dot {
                  width: 8px;
                  height: 8px;
                  background: #22c55e;
                  border-radius: 50%;
                }
                @media print {
                  body { background: white; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="card-header">
                  <div class="logo">
                    <div class="logo-box">R</div>
                    <span>RETECHCI</span>
                  </div>
                  <span class="category">CATEGORIE ${member.category}</span>
                </div>
                <div class="card-body">
                  <img src="${member.photo}" alt="${member.firstName}" class="photo" />
                  <h3 class="name">${member.firstName} ${member.lastName}</h3>
                  <p class="role">${member.specialty}</p>
                  ${member.secondarySpecialty ? `<p class="secondary-role">${member.secondarySpecialty}</p>` : ''}
                  <span class="badge">Directeur Exécutif</span>
                  <div class="id-section">
                    <div>
                      <p class="id-label">ID MEMBRE</p>
                      <p class="id-value">${member.id}</p>
                    </div>
                    <div class="qr-placeholder">QR</div>
                  </div>
                </div>
                <div class="card-footer">
                  <span>Membre depuis ${new Date(member.memberSince).getFullYear()}</span>
                  <span class="status">
                    <span class="status-dot"></span>
                    Actif
                  </span>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8 px-6 lg:px-20 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Mon Espace Membre
              </h1>
              <p className="text-muted-foreground">
                Gérez votre profil et votre carte professionnelle
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-500 text-sm rounded-full flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Membre actif
              </span>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Carte Pro
              </TabsTrigger>
              <TabsTrigger value="cv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CV & Filmo
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Photo & Quick Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 mx-auto">
                          <Image
                            src={photoPreview || editedMember.photo}
                            alt={`${member.firstName} ${member.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {isEditing && (
                          <>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handlePhotoChange}
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <Camera className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-foreground mt-4">
                        {member.firstName} {member.lastName}
                      </h2>
                      <p className="text-primary">{member.specialty}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm text-muted-foreground capitalize">{member.experienceLevel}</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{member.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Membre depuis {new Date(member.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right: Editable Info */}
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Informations du profil</CardTitle>
                      <CardDescription>Mettez à jour vos informations</CardDescription>
                    </div>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditedMember(member)
                          setPhotoPreview(null)
                        }}>
                          Annuler
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prénom</Label>
                        <Input
                          value={editedMember.firstName}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input
                          value={editedMember.lastName}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editedMember.email}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          value={editedMember.phone}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input
                        value={editedMember.address}
                        onChange={(e) => setEditedMember(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Spécialité principale</Label>
                        <Input
                          value={editedMember.specialty}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, specialty: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Spécialité secondaire</Label>
                        <Input
                          value={editedMember.secondarySpecialty || ""}
                          onChange={(e) => setEditedMember(prev => ({ ...prev, secondarySpecialty: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Biographie</Label>
                      <Textarea
                        value={editedMember.biography}
                        onChange={(e) => setEditedMember(prev => ({ ...prev, biography: e.target.value }))}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Card Tab */}
            <TabsContent value="card">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Carte Professionnelle Digitale</CardTitle>
                      <CardDescription>
                        Votre carte virtuelle scannable sur les plateaux
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div ref={printRef}>
                        <ProfessionalCard member={member} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full" onClick={handlePrintCard}>
                        <Download className="h-4 w-4 mr-2" />
                        Imprimer la carte
                      </Button>
                      <Button variant="outline" className="w-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        Télécharger le QR Code
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations de la carte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">ID Membre</span>
                        <span className="font-mono font-bold text-foreground">{member.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Catégorie</span>
                        <span className="font-bold text-foreground">Catégorie {member.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Statut</span>
                        <span className="text-green-500 font-medium">Actif</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Validité</span>
                        <span className="text-foreground">31 Déc 2025</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* CV Tab */}
            <TabsContent value="cv">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Filmographie</CardTitle>
                    <CardDescription>Vos réalisations principales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {member.filmography.map((film, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-foreground">{film.title}</h4>
                            <p className="text-sm text-muted-foreground">{film.role}</p>
                          </div>
                          <span className="text-muted-foreground">{film.year}</span>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        Ajouter une production
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>CV & Documents</CardTitle>
                    <CardDescription>Téléchargez votre CV mis à jour</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium text-foreground mb-2">Télécharger un nouveau CV</p>
                      <p className="text-sm text-muted-foreground mb-4">PDF, DOC ou DOCX (max 10MB)</p>
                      <Button variant="outline">
                        Choisir un fichier
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">CV_Jamel_Basiru_2024.pdf</p>
                          <p className="text-xs text-muted-foreground">Uploadé le 15 Jan 2024</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                  <CardDescription>Gérez vos préférences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Disponibilité</h3>
                    <Select defaultValue="available">
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Votre disponibilité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="filming">En Tournage</SelectItem>
                        <SelectItem value="unavailable">Indisponible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-muted-foreground">Recevoir les offres d&apos;emploi</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-muted-foreground">Actualités du RETECHCI</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-muted-foreground">Newsletter mensuelle</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      Désactiver mon compte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
