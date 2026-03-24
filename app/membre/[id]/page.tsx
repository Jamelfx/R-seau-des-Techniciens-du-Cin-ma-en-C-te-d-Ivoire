"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { 
  MapPin, 
  Mail, 
  Star,
  Film,
  Award,
  Clock,
  ChevronLeft,
  Share2,
  Download,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Simulated member data - will be fetched from Supabase
const memberData = {
  id: "CI-2024-0001",
  firstName: "Marc",
  lastName: "Zadi",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  function: "Chef Opérateur",
  category: "A",
  role: "Directeur Exécutif",
  experience: 15,
  level: "Senior",
  availability: "available",
  location: "Abidjan, Côte d'Ivoire",
  phone: "+225 07 XX XX XX XX",
  email: "marc.zadi@email.com",
  bio: "Chef opérateur avec plus de 15 ans d'expérience dans l'industrie cinématographique ivoirienne. Spécialisé dans la lumière naturelle et les tournages en conditions difficiles. Passionné par la transmission du savoir aux jeunes techniciens.",
  skills: ["Éclairage", "Cadrage", "Steadicam", "Drone", "DaVinci Resolve", "ARRI", "RED"],
  languages: ["Français", "Anglais", "Dioula"],
  workPhotos: [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=300&fit=crop",
  ],
  filmography: [
    {
      id: 1,
      title: "La Canne du Roi",
      year: 2024,
      role: "Chef Opérateur",
      director: "Zeka Laplaine",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
      type: "Long métrage",
      awards: ["Meilleure Image - FESPACO 2024"]
    },
    {
      id: 2,
      title: "Abidjan by Night",
      year: 2023,
      role: "Chef Opérateur",
      director: "Aka Moussou",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop",
      type: "Long métrage",
      awards: []
    },
    {
      id: 3,
      title: "Les Enfants de Bassam",
      year: 2022,
      role: "Cadreur",
      director: "Marie Kouassi",
      poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&h=300&fit=crop",
      type: "Documentaire",
      awards: ["Sélection Officielle - Cannes 2022"]
    },
    {
      id: 4,
      title: "Héritage",
      year: 2021,
      role: "Chef Opérateur",
      director: "Konan Yao",
      poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=300&fit=crop",
      type: "Série TV",
      awards: []
    },
    {
      id: 5,
      title: "Le Retour",
      year: 2020,
      role: "Assistant Caméra",
      director: "Philippe Lacôte",
      poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=300&fit=crop",
      type: "Long métrage",
      awards: ["Étalon d'Or - FESPACO 2021"]
    }
  ],
  formations: [
    { title: "Formation ARRI Certified", year: 2023, institution: "ARRI Academy" },
    { title: "Masterclass Éclairage Cinéma", year: 2020, institution: "La Fémis" },
    { title: "BTS Audiovisuel", year: 2008, institution: "INSAAC Abidjan" }
  ]
}

const availabilityLabels: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-green-500" },
  filming: { label: "En Tournage", color: "bg-amber-500" },
  unavailable: { label: "Indisponible", color: "bg-red-500" }
}

// Contact Dialog Component
function ContactTechnicianDialog({ technicianName }: { technicianName: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    project: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact request for technician:", technicianName, formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Demande envoyee !</h3>
        <p className="text-muted-foreground text-sm">
          Le Directeur Executif du RETECHCI vous mettra en relation avec {technicianName} dans les plus brefs delais.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Nom complet *</Label>
          <Input 
            id="contact-name" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Votre nom" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email *</Label>
          <Input 
            id="contact-email" 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            placeholder="votre@email.com" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Telephone</Label>
        <Input 
          id="contact-phone" 
          type="tel" 
          value={formData.phone} 
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
          placeholder="+225 XX XX XX XX XX" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-project">Nom du projet</Label>
        <Input 
          id="contact-project" 
          value={formData.project} 
          onChange={(e) => setFormData({ ...formData, project: e.target.value })} 
          placeholder="Ex: Film documentaire, Serie TV..." 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message *</Label>
        <Textarea 
          id="contact-message" 
          required 
          value={formData.message} 
          onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
          placeholder="Decrivez votre projet et les dates souhaitees..." 
          rows={4} 
        />
      </div>
      <Button type="submit" className="w-full">Envoyer la demande</Button>
      <p className="text-xs text-muted-foreground text-center">
        Votre demande sera transmise au Directeur Executif du RETECHCI qui vous mettra en relation.
      </p>
    </form>
  )
}

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("filmography")
  const [contactOpen, setContactOpen] = useState(false)
  const member = memberData // In production, fetch by params.id
  const availability = availabilityLabels[member.availability]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link href="/annuaire" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Retour à l'annuaire
          </Link>
        </div>

        {/* Profile Header */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Photo & Contact */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={member.photo}
                      alt={`${member.firstName} ${member.lastName}`}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay with info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{member.firstName} {member.lastName}</h3>
                      <p className="text-primary font-medium">{member.function}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {member.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* Member ID */}
                  <div className="p-3 bg-secondary/50 border-t border-border">
                    <p className="text-xs text-muted-foreground">ID Membre</p>
                    <p className="font-mono text-sm">{member.id}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Card */}
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Contacter ce technicien</h3>
                  <p className="text-sm text-muted-foreground">
                    Envoyez une demande de contact. Le Directeur Executif vous mettra en relation.
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{member.location}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Contacter
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Contacter {member.firstName} {member.lastName}</DialogTitle>
                          <DialogDescription>
                            Envoyez une demande de contact. Le Directeur Executif du RETECHCI vous mettra en relation.
                          </DialogDescription>
                        </DialogHeader>
                        <ContactTechnicianDialog technicianName={`${member.firstName} ${member.lastName}`} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disponibilité</span>
                    <Badge className={`${availability.color} text-white`}>
                      {availability.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Info & Portfolio */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{member.firstName} {member.lastName}</h1>
                    <p className="text-xl text-primary mt-1">{member.function}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {member.level}
                    </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {member.experience} ans d'expérience
                  </span>
                  <span className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {member.filmography.length} projets
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {member.filmography.filter(f => f.awards.length > 0).length} récompenses
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>

              {/* Skills */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Langues</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-secondary/50">
                  <TabsTrigger value="filmography">Filmographie</TabsTrigger>
                  <TabsTrigger value="photos">Photos de travail</TabsTrigger>
                  <TabsTrigger value="formations">Formations</TabsTrigger>
                </TabsList>

                <TabsContent value="filmography" className="mt-6">
                  <div className="grid gap-4">
                    {member.filmography.map((film) => (
                      <Card key={film.id} className="bg-card border-border overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-36 flex-shrink-0">
                              <Image
                                src={film.poster}
                                alt={film.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="py-4 pr-4 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-lg">{film.title}</h4>
                                  <p className="text-primary text-sm">{film.role}</p>
                                </div>
                                <Badge variant="outline">{film.year}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Réalisé par {film.director}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{film.type}</Badge>
                              </div>
                              {film.awards.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {film.awards.map((award, i) => (
                                    <Badge key={i} className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                                      <Award className="h-3 w-3 mr-1" />
                                      {award}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {member.workPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                        <Image
                          src={photo}
                          alt={`Photo de travail ${i + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="formations" className="mt-6">
                  <div className="space-y-4">
                    {member.formations.map((formation, i) => (
                      <Card key={i} className="bg-card border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{formation.title}</h4>
                            <p className="text-sm text-muted-foreground">{formation.institution}</p>
                          </div>
                          <Badge variant="outline">{formation.year}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
