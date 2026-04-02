"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  MapPin, Mail, Star, Film, Clock,
  ChevronLeft, Share2, CheckCircle, Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

const availabilityLabels: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-green-500" },
  filming: { label: "En Tournage", color: "bg-amber-500" },
  unavailable: { label: "Indisponible", color: "bg-red-500" }
}

function ContactTechnicianDialog({ technicianName }: { technicianName: string }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", project: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Demande envoyée !</h3>
        <p className="text-muted-foreground text-sm">
          Le Directeur Exécutif du RETECHCI vous mettra en relation avec {technicianName}.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom complet *</Label>
          <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Votre nom" />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="votre@email.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Téléphone</Label>
        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+225 XX XX XX XX XX" />
      </div>
      <div className="space-y-2">
        <Label>Nom du projet</Label>
        <Input value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} placeholder="Ex: Film documentaire, Série TV..." />
      </div>
      <div className="space-y-2">
        <Label>Message *</Label>
        <Textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Décrivez votre projet et les dates souhaitées..." rows={4} />
      </div>
      <Button type="submit" className="w-full">Envoyer la demande</Button>
      <p className="text-xs text-muted-foreground text-center">
        Votre demande sera transmise au Directeur Exécutif du RETECHCI.
      </p>
    </form>
  )
}

export default function MemberProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [member, setMember] = useState<any>(null)
  const [filmography, setFilmography] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState("filmography")
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return
      const supabase = createClient()

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`id.eq.${id},member_id.eq.${id}`)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setMember(data)

      // ✅ Bonne table + bonnes colonnes
      const { data: filmoData } = await supabase
        .from('filmography')
        .select('*')
        .eq('member_id', data.id)
        .order('year', { ascending: false })

      setFilmography(filmoData || [])
      setLoading(false)
    }

    fetchMember()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Membre introuvable</h1>
            <Link href="/annuaire"><Button>Retour à l'annuaire</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const fullName = `${member.first_name} ${member.last_name}`
  const availability = availabilityLabels[member.availability] || availabilityLabels.available
  const level = (member.years_experience || 0) >= 10 ? "Senior" : (member.years_experience || 0) >= 5 ? "Intermédiaire" : "Junior"
  const workPhotos = Array.isArray(member.work_photos) ? member.work_photos : []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <Link href="/annuaire" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Retour à l'annuaire
          </Link>
        </div>

        <section className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne gauche */}
            <div className="space-y-6">
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] w-full bg-secondary">
                    {member.profile_photo ? (
                      <Image src={member.profile_photo} alt={fullName} fill className="object-cover" priority unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{fullName}</h3>
                      <p className="text-primary font-medium">{member.profession}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/50 border-t border-border">
                    <p className="text-xs text-muted-foreground">ID Membre</p>
                    <p className="font-mono text-sm">{member.member_id}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Contacter ce technicien</h3>
                  <p className="text-sm text-muted-foreground">Le Directeur Exécutif vous mettra en relation.</p>
                  {member.birth_place && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{member.birth_place}, Côte d'Ivoire</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />Contacter
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Contacter {fullName}</DialogTitle>
                          <DialogDescription>Le Directeur Exécutif du RETECHCI vous mettra en relation.</DialogDescription>
                        </DialogHeader>
                        <ContactTechnicianDialog technicianName={fullName} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => navigator.share?.({ title: fullName, url: window.location.href })}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Disponibilité</span>
                    <Badge className={`${availability.color} text-white`}>{availability.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{fullName}</h1>
                    <p className="text-xl text-primary mt-1">{member.profession}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    <Star className="h-3 w-3 mr-1 fill-current" />{level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  {member.years_experience > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />{member.years_experience} ans d'expérience
                    </span>
                  )}
                  {filmography.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Film className="h-4 w-4" />{filmography.length} projets
                    </span>
                  )}
                </div>

                {member.biography && (
                  <p className="text-muted-foreground leading-relaxed">{member.biography}</p>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-secondary/50">
                  <TabsTrigger value="filmography">Filmographie</TabsTrigger>
                  <TabsTrigger value="photos">Photos de travail</TabsTrigger>
                </TabsList>

                <TabsContent value="filmography" className="mt-6">
                  {filmography.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                      <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune filmographie ajoutée</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filmography.map((film) => (
                        <Card key={film.id} className="bg-card border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                {/* ✅ Bonnes colonnes : title, role_in_production, year */}
                                <h4 className="font-semibold text-lg">{film.title}</h4>
                                <p className="text-primary text-sm">{film.role_in_production}</p>
                                {film.description && (
                                  <Badge variant="secondary" className="text-xs mt-2">
                                    {film.description}
                                  </Badge>
                                )}
                                {film.production_company ? (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Production: {film.production_company}
                                  </p>
                                ) : null}
                              </div>
                              <Badge variant="outline">{film.year}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="photos" className="mt-6">
                  {workPhotos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                      <p>Aucune photo de travail ajoutée</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {workPhotos.map((photo: string, i: number) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                          <Image src={photo} alt={`Photo de travail ${i + 1}`} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
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
