"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import {
  Film, Clapperboard, Camera, ArrowRight, Users,
  CreditCard, Star, Eye, Loader2, Award,
  Menu, X
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
interface Member {
  id: string
  member_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  profession?: string | null
  status?: string | null
  role?: string | null
  profile_photo?: string | null
  availability?: string | null
  category?: string | null
  years_experience?: number | null
}

// ─────────────────────────────────────────────────────────────────────
// Mini Professional Card
// ─────────────────────────────────────────────────────────────────────
function MiniProCard({ member }: { member: Member }) {
  const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Membre'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const category = member.category || (member.years_experience && member.years_experience >= 10 ? "A" : member.years_experience && member.years_experience >= 5 ? "B" : "C")
  const isAvailable = member.availability === 'available'

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <div className="h-14 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative">
        {isAvailable && (
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 border-2 border-card shadow-sm" />
        )}
      </div>
      <div className="px-4 pb-4 -mt-7">
        <div className="w-14 h-14 rounded-xl border-4 border-card bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-lg overflow-hidden">
          {member.profile_photo ? (
            <img src={member.profile_photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="mt-2.5 space-y-1">
          {member.role === 'director' && (
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Directeur Exécutif</p>
          )}
          {member.role === 'president' && (
            <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Président du CA</p>
          )}
          <h3 className="text-sm font-bold leading-tight">{name}</h3>
          {member.profession && (
            <div className="flex items-center gap-1.5">
              <Award className="size-3 text-primary" />
              <span className="text-xs font-medium text-primary">{member.profession}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Cat. {category}</Badge>
            {isAvailable && (
              <span className="text-[10px] text-green-400 font-medium">Disponible</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Digital Card Preview
// ─────────────────────────────────────────────────────────────────────
function DigitalCardPreview() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-card/80 overflow-hidden shadow-2xl shadow-primary/10">
        <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60 flex items-end px-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-white/20 flex items-center justify-center">
              <Film className="size-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">RETECHCI</span>
          </div>
        </div>
        <div className="px-5 pb-5 -mt-8">
          <div className="w-16 h-16 rounded-xl border-4 border-card bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary shadow-lg">
            AB
          </div>
          <div className="mt-3 space-y-1.5">
            <h3 className="text-base font-bold">Nom Prénom</h3>
            <div className="flex items-center gap-1.5">
              <Award className="size-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">Chef Opérateur</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-[10px]">Cat. A</Badge>
              <Badge variant="outline" className="text-[10px]">ID: RET-001</Badge>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">Carte professionnelle</p>
            <div className="w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center">
              <div className="w-7 h-7 grid grid-cols-3 grid-rows-3 gap-px">
                {Array.from({length: 9}).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${i % 2 === 0 ? 'bg-foreground/30' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE D'ACCUEIL PUBLIQUE RETECHCI
// ═══════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/members')
        const json = await res.json()
        const activeMembers = (json.members || []).filter((m: Member) =>
          m.status === 'active' && m.profile_photo
        )
        const shuffled = activeMembers.sort(() => Math.random() - 0.5).slice(0, 4)
        setMembers(shuffled.length > 0 ? shuffled : (json.members || []).slice(0, 4))
      } catch {
        // silent
      }
      setLoadingMembers(false)
    }
    fetchMembers()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ═══════════════ NAVIGATION ═══════════════ */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Film className="size-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-black tracking-tight">
                RETECH<span className="text-primary">CI</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <a href="#apropos" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">À propos</a>
              <a href="#talents" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Talents</a>
              <a href="#carte" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">Carte Pro</a>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/connexion"><Button variant="ghost" size="sm" className="text-sm">Se connecter</Button></Link>
              <Link href="/inscription"><Button size="sm" className="bg-primary hover:bg-primary/90 text-sm">S&apos;inscrire</Button></Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              <a href="#apropos" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">À propos</a>
              <a href="#talents" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">Talents</a>
              <a href="#carte" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">Carte Pro</a>
              <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
                <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}><Button variant="outline" className="w-full text-sm">Se connecter</Button></Link>
                <Link href="/inscription" onClick={() => setMobileMenuOpen(false)}><Button className="w-full text-sm bg-primary hover:bg-primary/90">S&apos;inscrire</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-black/90">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
            }} />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 opacity-20 hidden sm:block">
            <div className="flex flex-col h-full">
              {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="flex-1 mx-1.5 my-0.5 rounded-sm bg-white/30" />
              ))}
            </div>
          </div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28 md:py-36 lg:py-44">
              <div className="mb-6 sm:mb-8 size-16 sm:size-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Clapperboard className="size-8 sm:size-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl">
                L&apos;Excellence Technique
                <br />
                <span className="text-primary">du Cinéma Ivoirien</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed">
                RETECHCI réunit les professionnels de l&apos;audiovisuel de Côte d&apos;Ivoire.
                Formation, réseau, opportunités.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <Link href="/inscription">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base px-8 py-6 rounded-xl font-semibold shadow-lg shadow-primary/20">
                    Rejoindre RETECHCI
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white text-base px-8 py-6 rounded-xl">
                    Espace Membre
                  </Button>
                </Link>
              </div>
              <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-6 sm:gap-12 text-center">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">150+</p>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">Membres actifs</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">200+</p>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">Projets réalisés</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">10+</p>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">Ans d&apos;expérience</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ═══════════════ À PROPOS ═══════════════ */}
        <section id="apropos" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <Badge variant="outline" className="mb-4 text-xs border-primary/30 text-primary bg-primary/5">
                <Film className="size-3 mr-1" /> Qui sommes-nous
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                À propos de <span className="text-primary">RETECHCI</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Le Réseau des Techniciens de l&apos;Audiovisuel de Côte d&apos;Ivoire est une association professionnelle dédiée à la promotion et au développement des métiers techniques du cinéma et de l&apos;audiovisuel.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Camera, title: "Formation continue", desc: "Programmes de perfectionnement pour les techniciens de l'audiovisuel" },
                { icon: Users, title: "Networking professionnel", desc: "Connecter les talents et créer des opportunités de collaboration" },
                { icon: Star, title: "Promotion du cinéma", desc: "Valoriser le cinéma ivoirien sur la scène internationale" },
                { icon: Eye, title: "Visibilité des talents", desc: "Carte professionnelle digitale et annuaire des compétences" },
                { icon: CreditCard, title: "Avantages membres", desc: "Accès exclusif aux équipements, offres d'emploi et événements" },
                { icon: Film, title: "Projets collaboratifs", desc: "Participation à des productions cinématographiques nationales" },
              ].map((item, i) => (
                <Card key={i} className="border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-5 sm:p-6">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold">{item.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ TALENTUEUX À LA UNE ═══════════════ */}
        <section id="talents" className="py-16 sm:py-20 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <Badge variant="outline" className="mb-4 text-xs border-primary/30 text-primary bg-primary/5">
                <Star className="size-3 mr-1" /> Membres en vedette
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Talentueux <span className="text-primary">à la Une</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Découvrez les professionnels qui font briller le cinéma ivoirien
              </p>
            </div>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {members.map(member => (
                  <MiniProCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                    <div className="h-14 bg-gradient-to-r from-primary/40 via-primary/30 to-primary/20 relative">
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500/50 border-2 border-card" />
                    </div>
                    <div className="px-4 pb-4 -mt-7">
                      <div className="w-14 h-14 rounded-xl border-4 border-card bg-muted/50 flex items-center justify-center text-sm font-bold text-muted-foreground">?</div>
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-3.5 bg-muted/50 rounded w-3/4" />
                        <div className="h-3 bg-muted/30 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════ CARTE PROFESSIONNELLE DIGITALE ═══════════════ */}
        <section id="carte" className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-5 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                  <CreditCard className="size-3 mr-1" /> Nouveauté
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  Carte Professionnelle
                  <br />
                  <span className="text-primary">Digitale</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Chaque membre RETECHCI bénéficie d&apos;une carte professionnelle digitale unique.
                  Identifiez-vous, partagez vos compétences et facilitez vos collaborations sur les plateaux de tournage.
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="size-2 rounded-full bg-green-500" />
                    </div>
                    Identifiant membre unique avec QR code
                  </li>
                  <li className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="size-2 rounded-full bg-green-500" />
                    </div>
                    Catégorisation par niveau d&apos;expérience (A, B, C)
                  </li>
                  <li className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="size-2 rounded-full bg-green-500" />
                    </div>
                    Statut de disponibilité en temps réel
                  </li>
                  <li className="flex items-center gap-2 justify-center lg:justify-start">
                    <div className="size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="size-2 rounded-full bg-green-500" />
                    </div>
                    Partageable sur les réseaux professionnels
                  </li>
                </ul>
                <div className="pt-2">
                  <Link href="/inscription">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl font-semibold">
                      Obtenir ma carte
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <DigitalCardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA FINAL ═══════════════ */}
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-secondary/30 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className="mx-auto size-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Users className="size-7 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Rejoignez <span className="text-primary">RETECHCI</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Faites partie du réseau des professionnels de l&apos;audiovisuel en Côte d&apos;Ivoire.
                Accédez à des opportunités uniques et développez votre carrière.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                <Link href="/inscription">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base px-8 py-6 rounded-xl font-semibold shadow-lg shadow-primary/20">
                    S&apos;inscrire maintenant
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/connexion">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl">
                    Déjà membre ? Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
