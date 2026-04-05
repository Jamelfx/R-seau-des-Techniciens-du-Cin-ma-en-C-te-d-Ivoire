"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, UserPlus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function JoinSection() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("members")
          .select("id, first_name, last_name, profession, profile_photo, photo")
          .eq("status", "active")
          .not("profile_photo", "is", null)
          .order("created_at", { ascending: false })
          .limit(6)

        if (!error && data) {
          setMembers(data)
        }
      } catch {
        // Silently fail — show section without photos
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  return (
    <section className="relative overflow-hidden border-t border-border">
      {/* ── Background noir + image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      />
      <div className="absolute inset-0 z-0 bg-black" style={{ opacity: 0.92 }} />

      {/* ── Content ── */}
      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Heading */}
            <div className="mb-10 md:mb-14">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full mb-5 border border-white/20">
                <Users className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                Communauté
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight whitespace-nowrap">
                Rejoignez notre réseau de <span className="text-primary">techniciens</span>
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                RETECHCI rassemble les meilleurs techniciens du cinéma et de l&apos;audiovisuel en Côte d&apos;Ivoire.
                Adhérez pour accéder à votre espace membre, votre carte professionnelle digitale et à un réseau d&apos;opportunités.
              </p>
            </div>

            {/* Member photos grid */}
            {!loading && members.length > 0 && (
              <div className="mb-10 md:mb-14">
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {members.map((member, idx) => {
                    const photoUrl = member.profile_photo || member.photo
                    const initials = `${(member.first_name || "?")[0] || ""}${(member.last_name || "")[0] || ""}`.toUpperCase()
                    return (
                      <div
                        key={member.id}
                        className="group relative"
                        style={{
                          zIndex: members.length - idx,
                          marginLeft: idx > 0 ? "-8px" : "0",
                        }}
                      >
                        {photoUrl ? (
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-3 border-white/30 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <img
                              src={photoUrl}
                              alt={`${member.first_name} ${member.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-3 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-sm font-bold text-white/80">{initials}</span>
                          </div>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          <span>{member.first_name} {member.last_name}</span>
                          {member.profession && (
                            <span className="text-white/60 block">{member.profession}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="text-white/50 text-sm mt-4">
                  {members.length} membre{members.length > 1 ? "s" : ""} actif{members.length > 1 ? "s" : ""} dans le réseau
                </p>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12 max-w-3xl mx-auto">
              {[
                { icon: Users, text: "Réseau professionnel" },
                { icon: UserPlus, text: "Carte digitale membre" },
                { icon: CheckCircle, text: "Accès aux opportunités" },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <benefit.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-white/90">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button — centré */}
            <div className="flex items-center justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-base shadow-xl"
              >
                <Link href="/adhesion">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Devenir membre
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
