"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Star, Calendar, Film, Award, Quote, 
  Mail, CheckCircle, Loader2,
  Play, Camera, Clapperboard, Search
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface FilmEntry {
  title: string
  year: number
  role: string
  award: boolean
}

interface FeaturedMember {
  id: string
  member_id: string
  month: string
  is_current: boolean
  bio: string
  quote: string
  work_photos: string[]
  filmography: FilmEntry[]
  achievements: string[]
  skills: string[]
  // Données du membre joinées
  first_name: string
  last_name: string
  profession: string
  profile_photo: string
  experience_years: number
  cover_photo?: string
}

// Données de fallback si Supabase est vide
const fallbackFeatured: FeaturedMember = {
  id: "fallback",
  member_id: "CI-2024-0001",
  month: "Janvier 2024",
  is_current: true,
  bio: "Le portrait du technicien du mois sera bientôt disponible. Revenez nous rendre visite prochainement !",
  quote: "Le cinéma ivoirien a un avenir brillant grâce à ses techniciens passionnés.",
  work_photos: [
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop",
  ],
  filmography: [],
  achievements: [],
  skills: [],
  first_name: "RETECHCI",
  last_name: "",
  profession: "Réseau des Techniciens du Cinéma",
  profile_photo: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1000&fit=crop",
  experience_years: 0,
  cover_photo: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=600&fit=crop",
}

export default function ALaffichePage() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [featured, setFeatured] = useState<FeaturedMember | null>(null)
  const [previousFeatures, setPreviousFeatures] = useState<FeaturedMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient()

      // Récupérer le technicien du mois actuel
      const { data: currentData, error } = await supabase
        .from('featured_technicians')
        .select('*')
        .eq('is_current', true)
        .single()

      if (!error && currentData) {
        // Récupérer les données du membre
        const { data: memberData } = await supabase
          .from('members')
          .select('first_name, last_name, profession, profile_photo, experience_years')
          .eq('member_id', currentData.member_id)
          .single()

        setFeatured({
          ...currentData,
          first_name: memberData?.first_name || '',
          last_name: memberData?.last_name || '',
          profession: memberData?.profession || '',
          profile_photo: memberData?.profile_photo || fallbackFeatured.profile_photo,
          experience_years: memberData?.experience_years || 0,
        })
      } else {
        setFeatured(fallbackFeatured)
      }

      // Récupérer les éditions précédentes
      const { data: previousData } = await supabase
        .from('featured_technicians')
        .select('*')
        .eq('is_current', false)
        .order('created_at', { ascending: false })
        .limit(3)

      if (previousData && previousData.length > 0) {
        const previousWithMembers = await Promise.all(
          previousData.map(async (item) => {
            const { data: memberData } = await supabase
              .from('members')
              .select('first_name, last_name, profession, profile_photo, experience_years')
              .eq('member_id', item.member_id)
              .single()

            return {
              ...item,
              first_name: memberData?.first_name || '',
              last_name: memberData?.last_name || '',
              profession: memberData?.profession || '',
              profile_photo: memberData?.profile_photo || '',
              experience_years: memberData?.experience_years || 0,
            }
          })
        )
        setPreviousFeatures(previousWithMembers)
      }

      setLoading(false)
    }

    fetchFeatured()
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    const supabase = createClient()

    await supabase.from('newsletter_subscribers').upsert({
      email: email.toLowerCase().trim(),
      subscribed_at: new Date().toISOString(),
    }, { onConflict: 'email' })

    setIsSubscribing(false)
    setSubscribed(true)
    setEmail("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const tech = featured || fallbackFeatured
  const fullName = `${tech.first_name} ${tech.last_name}`.trim()
  const coverPhoto = tech.cover_photo || fallbackFeatured.cover_photo

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={coverPhoto!}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          
          <div className="relative h-full container mx-auto px-6 flex items-end pb-16">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary text-primary-foreground">
                <Star className="h-3 w-3 mr-1" />
                Technicien du mois — {tech.month}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                {fullName || "RETECHCI"}
              </h1>
              <p className="text-xl md:text-2xl text-primary font-medium mb-6">
                {tech.profession}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {tech.experience_years > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{tech.experience_years} ans d&apos;expérience</span>
                  </div>
                )}
                {tech.filmography?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" />
                    <span>{tech.filmography.length} films</span>
                  </div>
                )}
                {tech.achievements?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{tech.achievements.length} distinctions</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Bio */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Portrait</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {tech.bio}
                </p>
              </div>

              {/* Quote */}
              {tech.quote && (
                <div className="relative bg-primary/5 border border-primary/20 rounded-2xl p-8">
                  <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/30" />
                  <blockquote className="text-xl italic text-foreground pl-8">
                    &quot;{tech.quote}&quot;
                  </blockquote>
                  <p className="text-primary font-medium mt-4 pl-8">
                    — {fullName}
                  </p>
                </div>
              )}

              {/* Work Photos */}
              {tech.work_photos?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">En Conditions de Travail</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {tech.work_photos.map((photo, index) => (
                      <div 
                        key={index} 
                        className={`relative rounded-xl overflow-hidden ${
                          index === 0 ? "col-span-2 h-64" : "h-48"
                        }`}
                      >
                        <Image
                          src={photo}
                          alt={`${fullName} au travail ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <Camera className="h-4 w-4" />
                            <span>Sur le tournage</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filmography */}
              {tech.filmography?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Filmographie Sélective</h2>
                  <div className="space-y-3">
                    {tech.filmography.map((film, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Clapperboard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{film.title}</h4>
                              {film.award && <Award className="h-4 w-4 text-amber-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{film.role}</p>
                          </div>
                        </div>
                        <span className="text-muted-foreground font-mono">{film.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {tech.achievements?.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Distinctions</h2>
                  <div className="space-y-3">
                    {tech.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <span className="text-foreground">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Profile Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src={tech.profile_photo || fallbackFeatured.profile_photo}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Skills */}
              {tech.skills?.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Compétences Techniques</h3>
                    <div className="flex flex-wrap gap-2">
                      {tech.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Previous Features */}
              {previousFeatures.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Éditions Précédentes</h3>
                    <div className="space-y-4">
                      {previousFeatures.map((feature) => (
                        <Link 
                          key={feature.id}
                          href={`/membre/${feature.member_id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary">
                            {feature.profile_photo ? (
                              <Image
                                src={feature.profile_photo}
                                alt={`${feature.first_name} ${feature.last_name}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground font-semibold text-sm">
                                {feature.first_name?.[0]}{feature.last_name?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{feature.first_name} {feature.last_name}</h4>
                            <p className="text-xs text-muted-foreground">{feature.profession}</p>
                          </div>
                          <span className="text-xs text-primary whitespace-nowrap">{feature.month}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Voir profil */}
              {tech.id !== 'fallback' && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Play className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Voir son profil complet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Découvrez toutes les réalisations de {tech.first_name}
                    </p>
                    <Link href={`/membre/${tech.member_id}`}>
                      <Button className="w-full">
                        Voir le profil
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-card border-t border-border">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <Badge className="mb-4">Newsletter</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Restez informé des actualités du RETECHCI
              </h2>
              <p className="text-muted-foreground mb-8">
                Recevez chaque mois le portrait du technicien à l&apos;affiche et les dernières nouvelles du cinéma ivoirien.
              </p>

              {subscribed ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">
                    Merci ! Vous êtes inscrit à notre newsletter.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSubscribing}>
                    {isSubscribing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Inscription...</>
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" />S&apos;inscrire</>
                    )}
                  </Button>
                </form>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Désabonnement possible à tout moment.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
