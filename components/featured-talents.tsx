"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Star, Activity } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// This would typically come from the database, populated by member profiles
// Members are prioritized by: activity score (profile updates, login frequency)
const talents = [
  {
    id: "CI-2024-0001",
    name: "Marc Zadi",
    role: "Directeur de la Photographie",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
    experience: "Senior",
    activityScore: 95, // High activity = profile updated recently, frequent logins
    lastUpdate: "2024-01-20",
  },
  {
    id: "CI-2024-0015",
    name: "Aïcha Touré",
    role: "Chef Monteuse",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    status: "en-tournage" as const,
    experience: "Senior",
    activityScore: 88,
    lastUpdate: "2024-01-19",
  },
  {
    id: "CI-2024-0023",
    name: "Eric Kouassi",
    role: "Ingénieur du Son",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
    experience: "Intermédiaire",
    activityScore: 72,
    lastUpdate: "2024-01-15",
  },
  {
    id: "CI-2024-0047",
    name: "Fatou Diallo",
    role: "Directrice Artistique",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "indisponible" as const,
    experience: "Senior",
    activityScore: 65,
    lastUpdate: "2024-01-10",
  },
  {
    id: "CI-2024-0056",
    name: "Koné Amadou",
    role: "Chef Électricien",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
    experience: "Senior",
    activityScore: 91,
    lastUpdate: "2024-01-21",
  },
  {
    id: "CI-2024-0078",
    name: "Marie Kouadio",
    role: "Costumière",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    status: "disponible" as const,
    experience: "Intermédiaire",
    activityScore: 80,
    lastUpdate: "2024-01-18",
  },
]

const statusConfig = {
  disponible: {
    label: "Disponible",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  "en-tournage": {
    label: "En Tournage",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  indisponible: {
    label: "Indisponible",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

export function FeaturedTalents() {
  const { t } = useI18n()
  const [displayedTalents, setDisplayedTalents] = useState(talents.slice(0, 4))

  useEffect(() => {
    // Sort by activity score (highest first) and add some randomness
    // Members who update their profiles more frequently appear more often
    const sortedByActivity = [...talents].sort((a, b) => {
      // Weight by activity score with some randomness
      const randomFactor = Math.random() * 20 - 10 // -10 to +10
      return (b.activityScore + randomFactor) - (a.activityScore + randomFactor)
    })
    
    // Take top 4
    setDisplayedTalents(sortedByActivity.slice(0, 4))
  }, [])

  return (
    <section className="border-t border-border bg-card/50 px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("talents.title")}</h2>
            <p className="mt-1 text-muted-foreground">
              {t("talents.subtitle")}
            </p>
          </div>
          <Link
            href="/annuaire"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            {t("talents.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayedTalents.map((talent) => (
            <Link 
              key={talent.id} 
              href={`/membre/${talent.id}`}
              className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
            >
              {/* Header with avatar and status */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
                    <img 
                      src={talent.image} 
                      alt={talent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Online indicator */}
                  {talent.status === "disponible" && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground truncate">{talent.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{talent.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-[10px] px-1.5 py-0 ${statusConfig[talent.status].className}`}>
                      {statusConfig[talent.status].label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{talent.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                Voir le profil
              </Button>
            </Link>
          ))}
        </div>

        <Link
          href="/annuaire"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline sm:hidden"
        >
          {t("talents.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
