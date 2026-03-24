"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Share2, MessageCircle, Play, Bell, Users } from "lucide-react"
import Image from "next/image"

const upcomingEvents = [
  {
    id: 1,
    time: "DEMAIN 14H",
    timeEn: "TOMORROW 2PM",
    title: "Débat : Le statut de l'intermittent en CI",
    titleEn: "Debate: Freelancer status in CI",
    subtitle: "Invité: M. le Ministre de la Culture",
    subtitleEn: "Guest: Minister of Culture",
  },
  {
    id: 2,
    time: "VEN. 20H",
    timeEn: "FRI. 8PM",
    title: "Projection : Courts Métrages 2024",
    titleEn: "Screening: Short Films 2024",
    subtitle: "Sélection officielle NIGA",
    subtitleEn: "Official NIGA selection",
  },
]

const tutorials = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=250&fit=crop",
    duration: "15:42",
    title: "Menus cachés de la Sony FX6 : Guide complet",
    titleEn: "Hidden menus of Sony FX6: Complete Guide",
    author: "Sony Pro Africa",
    authorInitials: "SP",
    timeAgo: "Il y a 2 jours",
    timeAgoEn: "2 days ago",
    category: "image",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop",
    duration: "42:18",
    title: "Etalonnage HDR : Workflow DaVinci Resolve",
    titleEn: "HDR Color Grading: DaVinci Resolve Workflow",
    author: "Blackmagic Design",
    authorInitials: "DE",
    timeAgo: "Il y a 1 semaine",
    timeAgoEn: "1 week ago",
    category: "postProd",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=250&fit=crop",
    duration: "08:55",
    title: "Bien placer son micro cravate",
    titleEn: "How to properly place a lavalier mic",
    author: "Audio CI",
    authorInitials: "SG",
    timeAgo: "Il y a 3 semaines",
    timeAgoEn: "3 weeks ago",
    category: "sound",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=250&fit=crop",
    duration: "24:00",
    title: "Utiliser le SkyPanel en mode effets",
    titleEn: "Using SkyPanel in effects mode",
    author: "Light House",
    authorInitials: "LH",
    timeAgo: "Il y a 1 mois",
    timeAgoEn: "1 month ago",
    category: "image",
  },
]

export default function DirectPage() {
  const { t, locale } = useI18n()
  const [activeFilter, setActiveFilter] = useState("all")
  const [likes, setLikes] = useState(45)
  const [hasLiked, setHasLiked] = useState(false)

  const filters = [
    { id: "all", label: t("live.filters.all") },
    { id: "image", label: t("live.filters.image") },
    { id: "sound", label: t("live.filters.sound") },
    { id: "postProd", label: t("live.filters.postProd") },
  ]

  const filteredTutorials = activeFilter === "all" 
    ? tutorials 
    : tutorials.filter(tut => tut.category === activeFilter)

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setHasLiked(!hasLiked)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Live Section */}
        <div className="mb-12">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <h1 className="text-xl font-bold text-foreground">
              {t("live.title")} <span className="text-muted-foreground font-normal">| {t("live.subtitle")}</span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-card rounded-lg overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop"
                  alt="Live stream"
                  fill
                  className="object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Live badge and viewers */}
                <div className="absolute top-4 right-4 flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    {t("live.badge")}
                  </span>
                  <span className="bg-black/60 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    124 {t("live.viewers")}
                  </span>
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Masterclass : La lumière en extérieur jour
                  </h2>
                  <p className="text-white/80 text-sm">
                    Rejoignez-nous pour une session pratique sur la gestion du contraste et le débouchage en lumière naturelle avec le Chef Opérateur Marc Zadi.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                  <div className="h-full w-1/3 bg-primary" />
                </div>
              </div>

              {/* Video controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant={hasLiked ? "default" : "outline"} 
                    size="sm" 
                    className="gap-2"
                    onClick={handleLike}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t("live.like")} ({likes})
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {t("live.share")}
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t("live.chat")}
                </Button>
              </div>
            </div>

            {/* Upcoming events */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wider">
                {t("live.upcoming")}
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {locale === "fr" ? event.time : event.timeEn}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {locale === "fr" ? event.title : event.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {locale === "fr" ? event.subtitle : event.subtitleEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trainings & Tutorials Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t("live.trainings")}</h2>
              <p className="text-muted-foreground">{t("live.trainingsSubtitle")}</p>
            </div>
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="group cursor-pointer">
                <div className="relative aspect-video bg-card rounded-lg overflow-hidden mb-3">
                  <Image
                    src={tutorial.image}
                    alt={locale === "fr" ? tutorial.title : tutorial.titleEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Duration badge */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </span>
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground flex-shrink-0">
                    {tutorial.authorInitials}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                      {locale === "fr" ? tutorial.title : tutorial.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tutorial.author} • {locale === "fr" ? tutorial.timeAgo : tutorial.timeAgoEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
