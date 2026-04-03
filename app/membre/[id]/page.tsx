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
  ChevronLeft, Share2, CheckCircle, Loader2, Video, ExternalLink,
  Play, Award, Clapperboard, X, Tv
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

// ─────────────────────────────────────────────────────────────────────
// Types — filmographie avec les NOUVEAUX champs vidéo intégrés
// ─────────────────────────────────────────────────────────────────────
interface FilmographyItem {
  id?: string
  title?: string
  year?: number
  role_in_production?: string
  production_company?: string
  description?: string
  // ✅ NOUVEAUX CHAMPS
  video_url?: string | null
  video_title?: string | null
}

const availabilityLabels: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-green-500" },
  filming: { label: "En Tournage", color: "bg-amber-500" },
  unavailable: { label: "Indisponible", color: "bg-red-500" }
}

// ─────────────────────────────────────────────────────────────────────
// ✅ Utilitaire : Extraire la miniature et la plateforme d'une URL vidéo
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
// ✅ Badge Plateforme — couleur selon la plateforme
// ─────────────────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const config: Record<string, string> = {
    YouTube: 'bg-red-600/20 text-red-400 border-red-600/30',
    Vimeo: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    Dailymotion: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${config[platform] || 'bg-muted text-muted-foreground'}`}>
      {platform}
    </Badge>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Dialogue de contact (inchangé)
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// ✅ CARTE FILMOGRAPHIE AVEC MINIATURE VIDÉO INTÉGRÉE (Visiteur)
// ─────────────────────────────────────────────────────────────────────
function FilmographyCard({ 
  film, 
  onPlayVideo 
}: { 
  film: FilmographyItem
  onPlayVideo: (film: FilmographyItem) => void
}) {
  const videoInfo = film.video_url ? getVideoInfo(film.video_url) : null

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/80 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* ✅ Miniature vidéo ou placeholder */}
          {videoInfo?.thumbnail ? (
            <div 
              className="relative w-full sm:w-48 md:w-56 flex-shrink-0 cursor-pointer"
              onClick={() => onPlayVideo(film)}
            >
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
                <h4 className="text-base md:text-lg font-bold tracking-tight text-foreground leading-tight">
                  {film.title}
                </h4>
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

            {/* ✅ Lien vidéo */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {film.video_url ? (
                <button
                  onClick={() => onPlayVideo(film)}
                  className="flex items-center gap-2 min-w-0 flex-1 group/link"
                >
                  <Play className="size-3.5 text-primary shrink-0" />
                  <span className="text-xs text-primary font-medium truncate group-hover/link:underline">
                    {film.video_title || "Voir la vidéo"}
                  </span>
                </button>
              ) : (
                <span className="text-xs text-muted-foreground/60 italic">Aucun lien vidéo</span>
              )}
              {film.video_url && (
                <a
                  href={film.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — PAGE PROFIL MEMBRE
// ─────────────────────────────────────────────────────────────────────
export default function MemberProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [member, setMember] = useState<any>(null)
  const [filmography, setFilmography] = useState<FilmographyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  // ✅ État pour le lecteur vidéo intégré (un seul film à la fois)
  const [playingFilm, setPlayingFilm] = useState<FilmographyItem | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`id.eq.${id},member_id.eq.${id}`)
        .single()

      if (error || !data) { setNotFound(true); setLoading(false); return }
      setMember(data)

      // ✅ Récupérer la filmographie avec les champs vidéo
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

  // ✅ Compter les films qui ont un lien vidéo
  const videoCount = filmography.filter(f => f.video_url).length

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <Link href="/annuaire" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />Retour à l'annuaire
          </Link>
        </div>

        <section className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ═══════════════════════════════════════════════════════
                COLONNE GAUCHE — Profil
                ═══════════════════════════════════════════════════════ */}
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
                      <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-amber-500/30">
                        <Star className="h-3 w-3 mr-1 fill-current" />{level}
                      </Badge>
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
                        <Button className="flex-1"><Mail className="h-4 w-4 mr-2" />Contacter</Button>
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

            {/* ═══════════════════════════════════════════════════════
                COLONNE DROITE — Filmographie avec vidéos intégrées
                ═══════════════════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-6">
              {/* En-tête profil */}
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
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{member.years_experience} ans d'expérience</span>
                  )}
                  {filmography.length > 0 && (
                    <span className="flex items-center gap-1"><Film className="h-4 w-4" />{filmography.length} projets</span>
                  )}
                  {videoCount > 0 && (
                    <span className="flex items-center gap-1"><Video className="h-4 w-4" />{videoCount} vidéo{videoCount > 1 ? 's' : ''}</span>
                  )}
                </div>
                {member.biography && (
                  <p className="text-muted-foreground leading-relaxed">{member.biography}</p>
                )}
              </div>

              {/* ✅ Lecteur vidéo intégré (quand une vidéo est sélectionnée) */}
              {playingFilm?.video_url && (() => {
                const info = getVideoInfo(playingFilm.video_url!)
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        {playingFilm.video_title || playingFilm.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <PlatformBadge platform={info.platform} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPlayingFilm(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-2xl shadow-black/50">
                      <iframe
                        src={`${info.embedUrl}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )
              })()}

              {/* ✅ FILMOGRAPHIE — avec miniatures vidéo intégrées */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Film className="h-5 w-5" />
                      Filmographie
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filmography.length} projet{filmography.length > 1 ? 's' : ''} cinématographique{filmography.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  {videoCount > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Video className="size-3" />
                      {videoCount} vidéo{videoCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                {filmography.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                    <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune filmographie ajoutée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filmography.map((film) => (
                      <FilmographyCard
                        key={film.id}
                        film={film}
                        onPlayVideo={setPlayingFilm}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
