"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Activity, Users } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { SectionContent } from "@/lib/content"

interface FeaturedTalentsProps {
  content?: SectionContent
}

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

export function FeaturedTalents({ content }: FeaturedTalentsProps) {
  const { t } = useI18n()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Use Supabase content if available
  const title = content?.title || t("talents.title")
  const subtitle = content?.subtitle || t("talents.subtitle")

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient()
      
      // Fetch active members with profiles
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .eq('adhesion_paid', true)
        .not('photo', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(4)
      
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    
    fetchMembers()
  }, [])

  // Fallback data if no members in database
  const fallbackTalents = [
    {
      member_id: "CI-2024-0001",
      first_name: "Marc",
      last_name: "Zadi",
      profession: "Directeur de la Photographie",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      availability: "disponible",
      level: "Senior",
    },
    {
      member_id: "CI-2024-0015",
      first_name: "Aicha",
      last_name: "Toure",
      profession: "Chef Monteuse",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      availability: "en-tournage",
      level: "Senior",
    },
    {
      member_id: "CI-2024-0023",
      first_name: "Eric",
      last_name: "Kouassi",
      profession: "Ingenieur du Son",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      availability: "disponible",
      level: "Intermediaire",
    },
    {
      member_id: "CI-2024-0047",
      first_name: "Fatou",
      last_name: "Diallo",
      profession: "Directrice Artistique",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      availability: "disponible",
      level: "Senior",
    },
  ]

  const displayedMembers = members.length > 0 ? members : fallbackTalents

  return (
    <section className="border-t border-border bg-card/50 px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>
          <Link
            href="/annuaire"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            {t("talents.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-24 mb-2" />
                    <div className="h-3 bg-secondary rounded w-32" />
                  </div>
                </div>
                <div className="h-9 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : displayedMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun membre a afficher pour le moment</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayedMembers.map((member) => {
              const availability = member.availability || "disponible"
              const status = statusConfig[availability as keyof typeof statusConfig] || statusConfig.disponible
              
              return (
                <Link 
                  key={member.member_id} 
                  href={`/membre/${member.member_id}`}
                  className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
                        <img 
                          src={member.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} 
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {availability === "disponible" && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{member.profession}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${status.className}`}>
                          {status.label}
                        </Badge>
                        {member.level && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-primary" />
                            <span className="text-xs text-muted-foreground">{member.level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  >
                    Voir le profil
                  </Button>
                </Link>
              )
            })}
          </div>
        )}

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
