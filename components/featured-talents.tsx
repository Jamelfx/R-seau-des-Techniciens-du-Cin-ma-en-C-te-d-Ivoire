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
      
      // Fetch active members excluding admin accounts
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .not('email', 'like', '%@retechci.org') // Exclude admin accounts
        .order('updated_at', { ascending: false })
        .limit(4)
      
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    
    fetchMembers()
  }, [])

  return (
    <section className="border-t border-border bg-card/50 px-4 py-12 md:py-16">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm md:text-base text-muted-foreground">{subtitle}</p>
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
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-secondary" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-24 mb-2" />
                    <div className="h-3 bg-secondary rounded w-32" />
                  </div>
                </div>
                <div className="h-9 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          // Show "coming soon" when no real members exist
          <div className="text-center py-8 md:py-12 bg-card border border-dashed border-border rounded-xl">
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Bientôt disponible</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base px-4">
              Notre annuaire de techniciens est en cours de constitution. 
              Rejoignez le réseau pour être parmi les premiers membres affichés.
            </p>
            <Button asChild>
              <Link href="/adhesion">
                Rejoindre le réseau
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => {
              const availability = member.availability || "disponible"
              const status = statusConfig[availability as keyof typeof statusConfig] || statusConfig.disponible
              
              return (
                <Link 
                  key={member.member_id || member.id} 
                  href={`/membre/${member.member_id || member.id}`}
                  className="group bg-card border border-border rounded-xl p-3 md:p-4 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors">
                        <img 
                          src={member.photo || member.profile_photo || `https://ui-avatars.com/api/?name=${member.first_name}+${member.last_name}&size=150&background=dc2626&color=fff`} 
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {availability === "disponible" && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{member.profession}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[9px] md:text-[10px] px-1.5 py-0 ${status.className}`}>
                          {status.label}
                        </Badge>
                        {member.level && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-primary" />
                            <span className="text-[10px] md:text-xs text-muted-foreground">{member.level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs md:text-sm"
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
