"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Calendar } from "lucide-react"
import Image from "next/image"

type Category = "all" | "boxOffice" | "technique" | "training" | "production" | "festival" | "association"

interface NewsArticle {
  id: string
  title: string
  description: string
  image: string
  date: string
  category: Category
  tags: string[]
}

const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Record d'entrées pour \"La Canne du Roi\"",
    description: "Le dernier film de Zeka Laplaine dépasse les 50 000 entrées en salles en seulement 3 semaines.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    date: "15 Nov 2024",
    category: "boxOffice",
    tags: ["Cinéma", "Box Office"]
  },
  {
    id: "2",
    title: "Arrivée du nouvel ARRI Alexa 35 à Abidjan",
    description: "AFRICA STUDIO PROD annonce l'acquisition de la dernière caméra professionnelle ARRI pour les...",
    image: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=600&h=400&fit=crop",
    date: "12 Nov 2024",
    category: "technique",
    tags: ["Équipement", "Technique"]
  },
  {
    id: "3",
    title: "Masterclass Sound Design avec André Konan",
    description: "Le célèbre ingénieur son ivoirien organise une session exclusive sur le mixage professionnel au Sofitel.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
    date: "08 Nov 2024",
    category: "training",
    tags: ["Formation", "Son"]
  },
  {
    id: "4",
    title: "Tournage du film \"Abobo at Night\" lancé",
    description: "Une production ambitieuse explorant la vie nocturne du quartier populaire d'Abobo démarre cette semaine.",
    image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&h=400&fit=crop",
    date: "05 Nov 2024",
    category: "production",
    tags: ["Production", "Cinéma"]
  },
  {
    id: "5",
    title: "FESPACO 2025 : La Côte d'Ivoire en force",
    description: "12 films ivoiriens sélectionnés pour la prochaine édition du plus grand festival de cinéma africain.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop",
    date: "01 Nov 2024",
    category: "festival",
    tags: ["Festival", "International"]
  },
  {
    id: "6",
    title: "AG Ordinaire RETECHCI 2024",
    description: "L'assemblée générale annuelle se tiendra le 20 décembre au Sofitel Ivoire pour voter le budget 2025.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    date: "28 Oct 2024",
    category: "association",
    tags: ["RETECHCI", "Événement"]
  },
]

const categoryColors: Record<Category, string> = {
  all: "bg-primary",
  boxOffice: "bg-primary",
  technique: "bg-primary",
  training: "bg-primary",
  production: "bg-primary",
  festival: "bg-primary",
  association: "bg-primary",
}

const categoryLabels: Record<Category, string> = {
  all: "TOUT",
  boxOffice: "BOX OFFICE",
  technique: "TECHNIQUE",
  training: "FORMATION",
  production: "PRODUCTION",
  festival: "FESTIVAL",
  association: "ASSOCIATION",
}

export default function ActualitesPage() {
  const { t } = useI18n()
  const [activeFilter, setActiveFilter] = useState<Category>("all")

  const filters: { key: Category; label: string }[] = [
    { key: "all", label: t("news.filters.all") },
    { key: "boxOffice", label: t("news.filters.boxOffice") },
    { key: "technique", label: t("news.filters.technique") },
    { key: "training", label: t("news.filters.training") },
    { key: "production", label: t("news.filters.production") },
    { key: "festival", label: t("news.filters.festival") },
    { key: "association", label: t("news.filters.association") },
  ]

  const filteredArticles = activeFilter === "all" 
    ? newsArticles 
    : newsArticles.filter(article => article.category === activeFilter)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="px-4 md:px-8 lg:px-16 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("news.title")} <span className="text-primary">{t("news.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t("news.subtitle")}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 md:px-8 lg:px-16 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="px-4 md:px-8 lg:px-16 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`${categoryColors[article.category]} text-primary-foreground text-xs font-bold px-3 py-1 rounded`}>
                        {categoryLabels[article.category]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Partners />
      </main>
      <Footer />
    </div>
  )
}
