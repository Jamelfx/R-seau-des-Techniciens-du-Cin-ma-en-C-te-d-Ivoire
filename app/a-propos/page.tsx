"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Check, Quote } from "lucide-react"
import Image from "next/image"

// Bureau Exécutif members
const bureauMembers = [
  { name: "Jamel Basiru", role: "Président", image: "/team/jamel.jpg", hasImage: true },
  { name: "Biata Yoane", role: "Vice-Présidente", image: "/team/biata.jpg", hasImage: true },
  { name: "Backet Diarra", initials: "BD", role: "Secrétaire Général" },
  { name: "Raymonde Lucas", image: "/team/raymonde.jpg", hasImage: true, role: "Trésorière" },
  { name: "Vincent Goultau", initials: "VG", role: "Commissaire aux comptes" },
  { name: "Orlane M'guessan", image: "/team/orlane.jpg", hasImage: true, role: "Chargée de Communication" },
  { name: "Ailith Brahins", initials: "AI", role: "Secrétaire Adjoint" },
]

// Conseil d'Administration members
const councilMembers = [
  { name: "Jean Aristide Eloa", role: "Membre actif", hasImage: true },
  { name: "Sanga'Oudol", role: "Membre actif" },
  { name: "Amalia Basora P.", role: "Membre actif" },
  { name: "Guy Toliviet", role: "Membre actif" },
  { name: "Mathieu Ohouagri", role: "Membre actif" },
  { name: "Jean Marc Croidliny", role: "Membre actif" },
  { name: "Fabrice Al Chaya", role: "Membre actif" },
  { name: "Conny Fransy", role: "Membre actif" },
  { name: "Modjesuka Diamoda", role: "Membre actif" },
  { name: "Clément Kouasil", role: "Membre actif" },
  { name: "Diata Sylvie Obit", role: "Membre actif" },
  { name: "Tresorphe Essono", role: "Membre actif" },
  { name: "Wily Benga", role: "Membre actif" },
]

function MemberCard({ name, role, image, initials, hasImage }: {
  name: string
  role: string
  image?: string
  initials?: string
  hasImage?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden mb-3">
        {hasImage && image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
          />
        ) : hasImage ? (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">
              {name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        ) : (
          <div className="w-full h-full bg-card flex items-center justify-center border border-border">
            <span className="text-4xl font-bold text-muted-foreground">{initials}</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-foreground text-sm">{name}</h3>
      <p className="text-xs text-primary">{role}</p>
    </div>
  )
}

function CouncilMemberRow({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-card rounded-lg border border-border">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </span>
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
                  Formellement créée le <span className="text-primary font-semibold">16 Juillet 2022</span>, le <span className="text-primary font-semibold">RETECHCI</span> est la toute première association regroupant uniquement les <span className="text-primary font-semibold">techniciens du cinéma</span> de Côte d'Ivoire.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Face à la négligence dont fait l'objet la grande famille des techniciens dans notre pays, nous avons décidé de nous unir pour défendre nos intérêts et professionnaliser notre secteur.
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
                    "Loin d'un style de syndicat contre les entreprises de cinéma, le RETECHCI veut plutôt apporter sa pierre à l'édifice en militant activement pour la réglementation et le développement du secteur."
                  </p>
                  <p className="text-xs text-primary font-medium">{t("about.quoteAuthor")}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-foreground">2022</p>
                    <p className="text-xs text-primary uppercase tracking-wider mt-1">Année de création</p>
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

        {/* Bureau Exécutif */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-primary">Bureau Exécutif</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-10">
                {t("about.bureauSubtitle")}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {bureauMembers.slice(0, 4).map((member) => (
                  <MemberCard key={member.name} {...member} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 max-w-xl">
                {bureauMembers.slice(4).map((member) => (
                  <MemberCard key={member.name} {...member} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Conseil d'Administration */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-primary">Conseil d'Administration</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-10">
                {t("about.councilSubtitle")}
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                {councilMembers.map((member) => (
                  <CouncilMemberRow key={member.name} {...member} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Partners />
      </main>

      <Footer />
    </div>
  )
}
