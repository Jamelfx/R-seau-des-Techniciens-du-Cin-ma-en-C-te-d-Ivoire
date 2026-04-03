"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Users, Star } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { SectionContent } from "@/lib/content"

interface FeaturedTalentsProps {
  content?: SectionContent
}

const statusConfig = {
  available: {
    label: "Disponible",
    badgeClass: "bg-green-500/90 text-white border-green-600/30",
    dotClass: "bg-green-500",
  },
  filming: {
    label: "En Tournage",
    badgeClass: "bg-amber-500/90 text-white border-amber-600/30",
    dotClass: "bg-amber-500",
  },
  unavailable: {
    label: "Indisponible",
    badgeClass: "bg-red-500/90 text-white border-red-600/30",
    dotClass: "bg-red-500",
  },
}

export function FeaturedTalents({ content }: FeaturedTalentsProps) {
  const { t } = useI18n()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const title = content?.title || t("talents.title")
  const subtitle = content?.subtitle || t("talents.subtitle")

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(4)
      
      console.log("Talents:", data, error)
      
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    
    fetchMembers()
  }, [])

  const getLevelText = (years?: number) => {
    if (!years) return ""
    if (years >= 10) return "Senior"
    if (years >= 5) return "Intermédiaire"
    return "Junior"
  }

  const getLevelConfig = (years?: number) => {
    if (!years) return null
    return {
      text: getLevelText(years),
    }
  }

  return (
    <section className="border-t border-border bg-card/50 px-4 py-12 md:py-16">
      <div className="container mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
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

        {/* ── Loading Skeleton ───────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-secondary rounded w-24" />
                  <div className="h-9 bg-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          /* ── Empty State ──────────────────────────────────── */
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
          /* ── Talent Cards ─────────────────────────────────── */
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => {
              const availability = member.availability || "available"
              const status = statusConfig[availability as keyof typeof statusConfig] || statusConfig.available
              const level = getLevelConfig(member.years_experience)
              const initials = `${(member.first_name || "")[0] || ""}${(member.last_name || "")[0] || ""}`

              return (
                <Link 
                  key={member.id} 
                  href={`/membre/${member.id}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 block"
                >
                  {/* ── Photo de profil paysage ── */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {(member.photo || member.profile_photo) ? (
                      <img 
                        src={member.photo || member.profile_photo} 
                        alt={`${member.first_name} ${member.last_name}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary flex flex-col items-center justify-center gap-2">
                        <div className="flex size-16 md:size-20 items-center justify-center rounded-2xl bg-primary/10">
                          <span className="text-xl md:text-2xl font-bold text-primary/60">{initials}</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground/50 font-medium">Photo de profil</span>
                      </div>
                    )}

                    {/* Badge niveau — haut gauche */}
                    {level && (
                      <div className="absolute top-2 md:top-3 left-2 md:left-3">
                        <span className="inline-flex items-center gap-1 bg-black/50 text-white border border-white/20 backdrop-blur-md text-[10px] md:text-[11px] font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded">
                          <Star className="size-2.5 md:size-3 fill-amber-400 text-amber-400" />
                          {level.text}
                        </span>
                      </div>
                    )}

                    {/* Badge disponibilité — haut droite */}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3">
                      <span className={`text-[10px] md:text-[11px] font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded backdrop-blur-md border ${status.badgeClass}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Dégradé + Nom/Fonction en bas */}
                    <div className="absolute inset-x-0 bottom-0 h-24 md:h-28 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 px-3 md:px-4 pb-3 md:pb-4 pt-10 md:pt-12">
                      <h3 className="text-base md:text-xl font-bold text-white leading-tight drop-shadow-lg truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-xs md:text-sm text-primary font-semibold mt-0.5 drop-shadow-lg truncate">
                        {member.profession}
                      </p>
                    </div>
                  </div>

                  {/* ── Corps de la carte ── */}
                  <div className="px-3 md:px-4 py-3 md:py-4">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      {level && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Star className="size-3 md:size-3.5 fill-amber-500 text-amber-500" />
                          <span className="text-[11px] md:text-xs font-medium">{level.text}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className={`size-1.5 md:size-2 rounded-full ${status.dotClass}`} />
                        <span className="text-[11px] md:text-xs text-muted-foreground font-medium">{status.label}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs md:text-sm gap-1.5"
                    >
                      Voir le profil
                      <ArrowRight className="size-3 md:size-3.5" />
                    </Button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Mobile "View All" Link ────────────────────────── */}
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
