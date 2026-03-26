"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Check, Quote } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface BoardMember {
  id: string
  name: string
  role: string
  board_type: string
  photo_url: string | null
  order_index: number
}

// Portrait rectangular card with rounded corners
function MemberCard({ name, role, photo_url, priority = false }: {
  name: string
  role: string
  photo_url?: string | null
  priority?: boolean
}) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  
  return (
    <div className="flex flex-col items-center group">
      {/* Portrait rectangle card - 3:4 aspect ratio */}
      <div className="relative w-full aspect-[3/4] bg-secondary rounded-2xl overflow-hidden mb-4 border-2 border-border group-hover:border-primary/50 transition-all duration-300">
        {photo_url ? (
          <Image
            src={photo_url}
            alt={name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <span className="text-5xl font-bold text-muted-foreground">{initials}</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="font-semibold text-foreground text-base text-center">{name}</h3>
      <p className="text-sm text-primary text-center">{role}</p>
    </div>
  )
}

function CouncilMemberRow({ name, role, photo_url }: { name: string; role: string; photo_url?: string | null }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
        {photo_url ? (
          <Image src={photo_url} alt={name} width={40} height={40} className="object-cover" />
        ) : (
          <span className="text-sm font-medium text-muted-foreground">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const { t } = useI18n()
  const [bureauMembers, setBureauMembers] = useState<BoardMember[]>([])
  const [conseilMembers, setConseilMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoardMembers = async () => {
      const supabase = createClient()
      
      // Fetch Bureau members
      const { data: bureau } = await supabase
        .from('board_members')
        .select('*')
        .eq('board_type', 'bureau')
        .eq('active', true)
        .order('order_index', { ascending: true })
      
      // Fetch Conseil members
      const { data: conseil } = await supabase
        .from('board_members')
        .select('*')
        .eq('board_type', 'conseil')
        .eq('active', true)
        .order('order_index', { ascending: true })
      
      setBureauMembers(bureau || [])
      setConseilMembers(conseil || [])
      setLoading(false)
    }
    
    fetchBoardMembers()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {t("about.badge")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground">
              {t("about.title")}
            </h1>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              {/* Left Column - Text */}
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Formellement creee le <span className="text-primary font-semibold">16 Juillet 2022</span>, le <span className="text-primary font-semibold">RETECHCI</span> est la toute premiere association regroupant uniquement les <span className="text-primary font-semibold">techniciens du cinema</span> de Cote d&apos;Ivoire.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Face a la negligence dont fait l&apos;objet la grande famille des techniciens dans notre pays, nous avons decide de nous unir pour defendre nos interets et professionnaliser notre secteur.
                </p>

                {/* Objectives */}
                <div className="pt-4">
                  <h3 className="text-primary font-semibold mb-4">{t("about.objectivesTitle")}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{t("about.objective1")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{t("about.objective2")}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Quote & Stats */}
              <div className="space-y-8">
                {/* Quote Box */}
                <div className="bg-card border border-border rounded-xl p-6 relative">
                  <Quote className="w-8 h-8 text-primary/30 absolute top-4 right-4" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">
                    &quot;Loin d&apos;un style de syndicat contre les entreprises de cinema, le RETECHCI veut plutot apporter sa pierre a l&apos;edifice en militant activement pour la reglementation et le developpement du secteur.&quot;
                  </p>
                  <p className="text-xs text-primary font-medium">{t("about.quoteAuthor")}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-foreground">2022</p>
                    <p className="text-xs text-primary uppercase tracking-wider mt-1">Annee de creation</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-foreground">500+</p>
                    <p className="text-xs text-primary uppercase tracking-wider mt-1">Membres actifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bureau Executif */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-primary">Bureau Executif</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-10">
                {t("about.bureauSubtitle")}
              </p>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bureauMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun membre du bureau enregistre</p>
              ) : (
                <>
                  {/* Portrait Grid - 4 columns on desktop */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                    {bureauMembers.slice(0, 4).map((member, index) => (
                      <MemberCard 
                        key={member.id} 
                        name={member.name}
                        role={member.role}
                        photo_url={member.photo_url}
                        priority={index < 2} 
                      />
                    ))}
                  </div>
                  {/* Second row - 3 columns centered */}
                  {bureauMembers.length > 4 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 mt-8 max-w-3xl mx-auto">
                      {bureauMembers.slice(4).map((member) => (
                        <MemberCard 
                          key={member.id}
                          name={member.name}
                          role={member.role}
                          photo_url={member.photo_url}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Conseil d'Administration */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-primary">Conseil d&apos;Administration</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-10">
                {t("about.councilSubtitle")}
              </p>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : conseilMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucun membre du conseil enregistre</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-3">
                  {conseilMembers.map((member) => (
                    <CouncilMemberRow 
                      key={member.id} 
                      name={member.name}
                      role={member.role}
                      photo_url={member.photo_url}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <Partners />
      </main>

      <Footer />
    </div>
  )
}
