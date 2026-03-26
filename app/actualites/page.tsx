"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Calendar, FileText } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type Category = "all" | "actualites" | "evenements" | "formation" | "conventions"

const categoryColors: Record<string, string> = {
  all: "bg-primary",
  actualites: "bg-primary",
  evenements: "bg-amber-500",
  formation: "bg-green-500",
  conventions: "bg-blue-500",
}

const categoryLabels: Record<string, string> = {
  all: "TOUT",
  actualites: "ACTUALITES",
  evenements: "EVENEMENTS",
  formation: "FORMATION",
  conventions: "CONVENTIONS",
}

// Fallback articles if database is empty
const fallbackArticles = [
  {
    id: "1",
    title: "Bienvenue sur RETECHCI",
    excerpt: "Le Reseau des Techniciens du Cinema en Cote d'Ivoire vous souhaite la bienvenue.",
    cover_image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop",
    created_at: new Date().toISOString(),
    category: "actualites",
    published: true,
  },
  {
    id: "2",
    title: "SITECH 2027 - Salon International des Techniciens",
    excerpt: "Le plus grand rassemblement des professionnels techniques du cinema en Afrique de l'Ouest.",
    cover_image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop",
    created_at: new Date().toISOString(),
    category: "evenements",
    published: true,
  },
]

export default function ActualitesPage() {
  const { t } = useI18n()
  const [activeFilter, setActiveFilter] = useState<Category>("all")
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      
      if (!error && data && data.length > 0) {
        setArticles(data)
      } else {
        setArticles(fallbackArticles)
      }
      setLoading(false)
    }
    
    fetchArticles()
  }, [])

  const filters: { key: Category; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "actualites", label: "Actualites" },
    { key: "evenements", label: "Evenements" },
    { key: "formation", label: "Formation" },
    { key: "conventions", label: "Conventions" },
  ]

  const filteredArticles = activeFilter === "all" 
    ? articles 
    : articles.filter(article => article.category === activeFilter)

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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                    <div className="h-48 bg-secondary" />
                    <div className="p-5">
                      <div className="h-4 bg-secondary rounded w-24 mb-3" />
                      <div className="h-5 bg-secondary rounded w-full mb-2" />
                      <div className="h-4 bg-secondary rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun article</h3>
                <p className="text-muted-foreground">
                  {activeFilter === "all" 
                    ? "Aucun article n'a encore ete publie." 
                    : `Aucun article dans la categorie "${categoryLabels[activeFilter]}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/actualites/${article.id}`}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.cover_image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop"}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`${categoryColors[article.category] || categoryColors.actualites} text-white text-xs font-bold px-3 py-1 rounded`}>
                          {categoryLabels[article.category] || "ACTUALITES"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {article.excerpt || article.content?.substring(0, 150)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <Partners />
      </main>
      <Footer />
    </div>
  )
}
