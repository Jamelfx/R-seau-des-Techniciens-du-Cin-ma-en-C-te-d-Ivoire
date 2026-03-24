"use client"

import { useState } from "react"
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
  ArrowRight, Mail, CheckCircle, Loader2,
  Play, Camera, Clapperboard
} from "lucide-react"

// Featured technician of the month
const technicianOfTheMonth = {
  id: "CI-2024-0001",
  name: "Jamel Basiru",
  role: "Monteur Image",
  title: "Directeur Exécutif RETECHCI",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=face",
  coverPhoto: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=600&fit=crop",
  workPhotos: [
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop",
  ],
  experience: "15 ans",
  films: 42,
  awards: 3,
  bio: "Jamel Basiru est l'un des monteurs les plus respectés de la scène cinématographique ivoirienne. Avec plus de 15 ans d'expérience, il a travaillé sur des productions majeures allant du documentaire au long métrage de fiction. Son approche unique du montage, alliant rythme narratif et sensibilité artistique, a contribué au succès de nombreux films primés.",
  quote: "Le montage, c'est l'art invisible qui donne vie à l'histoire. Chaque coupe est une décision qui façonne l'émotion du spectateur.",
  filmography: [
    { title: "Les Enfants du Soleil", year: 2023, role: "Chef Monteur", award: true },
    { title: "Abidjan by Night", year: 2022, role: "Chef Monteur", award: false },
    { title: "La Route du Cacao", year: 2021, role: "Monteur", award: true },
    { title: "Mémoires d'Afrique", year: 2020, role: "Chef Monteur", award: false },
    { title: "Le Dernier Griot", year: 2019, role: "Chef Monteur", award: true },
  ],
  skills: ["Final Cut Pro", "DaVinci Resolve", "Adobe Premiere", "Avid Media Composer"],
  achievements: [
    "Prix du Meilleur Montage - FESPACO 2023",
    "Nomination aux Africa Movie Academy Awards 2022",
    "Prix Spécial du Jury - Festival d'Abidjan 2021",
  ],
}

// Previous technicians of the month
const previousFeatures = [
  {
    id: "CI-2024-0015",
    name: "Aïcha Touré",
    role: "Chef Opératrice",
    month: "Décembre 2023",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "CI-2024-0023",
    name: "Eric Kouassi",
    role: "Ingénieur du Son",
    month: "Novembre 2023",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "CI-2024-0047",
    name: "Fatou Diallo",
    role: "Directrice Artistique",
    month: "Octobre 2023",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
]

export default function ALaffichePage() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubscribing(false)
    setSubscribed(true)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section - Magazine Style */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={technicianOfTheMonth.coverPhoto}
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
                Technicien du mois - Janvier 2024
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                {technicianOfTheMonth.name}
              </h1>
              <p className="text-xl md:text-2xl text-primary font-medium mb-2">
                {technicianOfTheMonth.role}
              </p>
              <p className="text-muted-foreground mb-6">
                {technicianOfTheMonth.title}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{technicianOfTheMonth.experience} d&apos;expérience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <span>{technicianOfTheMonth.films} films</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>{technicianOfTheMonth.awards} prix</span>
                </div>
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
                  {technicianOfTheMonth.bio}
                </p>
              </div>

              {/* Quote */}
              <div className="relative bg-primary/5 border border-primary/20 rounded-2xl p-8">
                <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/30" />
                <blockquote className="text-xl italic text-foreground pl-8">
                  &quot;{technicianOfTheMonth.quote}&quot;
                </blockquote>
                <p className="text-primary font-medium mt-4 pl-8">
                  — {technicianOfTheMonth.name}
                </p>
              </div>

              {/* Work Photos Gallery */}
              <div>
                <h2 className="text-2xl font-bold mb-6">En Conditions de Travail</h2>
                <div className="grid grid-cols-2 gap-4">
                  {technicianOfTheMonth.workPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`relative rounded-xl overflow-hidden ${
                        index === 0 ? "col-span-2 h-64" : "h-48"
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`${technicianOfTheMonth.name} au travail ${index + 1}`}
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

              {/* Filmography */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Filmographie Sélective</h2>
                <div className="space-y-3">
                  {technicianOfTheMonth.filmography.map((film, index) => (
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
                            {film.award && (
                              <Award className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{film.role}</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground font-mono">{film.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Distinctions</h2>
                <div className="space-y-3">
                  {technicianOfTheMonth.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <span className="text-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Profile Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src={technicianOfTheMonth.photo}
                  alt={technicianOfTheMonth.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Skills */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Compétences Techniques</h3>
                  <div className="flex flex-wrap gap-2">
                    {technicianOfTheMonth.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Previous Features */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Éditions Précédentes</h3>
                  <div className="space-y-4">
                    {previousFeatures.map((feature) => (
                      <Link 
                        key={feature.id}
                        href={`/membre/${feature.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={feature.photo}
                            alt={feature.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{feature.name}</h4>
                          <p className="text-xs text-muted-foreground">{feature.role}</p>
                        </div>
                        <span className="text-xs text-primary">{feature.month}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Play className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Voir son travail</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Découvrez la bande démo de {technicianOfTheMonth.name}
                  </p>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Voir la démo
                  </Button>
                </CardContent>
              </Card>
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
                Recevez chaque mois le portrait du technicien à l&apos;affiche, les dernières actualités 
                du cinéma ivoirien et les opportunités de formation.
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
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        S&apos;inscrire
                      </>
                    )}
                  </Button>
                </form>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                En vous inscrivant, vous acceptez de recevoir nos communications. 
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
