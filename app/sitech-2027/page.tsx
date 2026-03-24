"use client"

import { Header } from "@/components/header"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Star, Monitor, GraduationCap, Handshake, Film, Check, Clock } from "lucide-react"

export default function SitechPage() {
  const { t } = useI18n()

  const highlights = [
    { icon: Monitor, title: t("sitech.page.highlight1"), description: t("sitech.page.highlight1Desc") },
    { icon: GraduationCap, title: t("sitech.page.highlight2"), description: t("sitech.page.highlight2Desc") },
    { icon: Handshake, title: t("sitech.page.highlight3"), description: t("sitech.page.highlight3Desc") },
    { icon: Film, title: t("sitech.page.highlight4"), description: t("sitech.page.highlight4Desc") },
  ]

  const schedule = [
    {
      day: t("sitech.page.day1"),
      events: [
        { time: "09:00", title: "Cérémonie d'ouverture", type: "Cérémonie" },
        { time: "10:30", title: "Keynote : L'avenir du cinéma africain", type: "Conférence" },
        { time: "14:00", title: "Masterclass Éclairage avec ARRI", type: "Masterclass" },
        { time: "17:00", title: "Visite des stands exposants", type: "Exposition" },
        { time: "19:00", title: "Cocktail de bienvenue", type: "Networking" },
      ]
    },
    {
      day: t("sitech.page.day2"),
      events: [
        { time: "09:00", title: "Workshop Son avec Dolby", type: "Workshop" },
        { time: "11:00", title: "Panel : Financement de projets", type: "Panel" },
        { time: "14:00", title: "Masterclass Caméra Sony VENICE", type: "Masterclass" },
        { time: "16:00", title: "Pitching sessions", type: "Business" },
        { time: "20:00", title: "Projection : Sélection FESPACO", type: "Projection" },
      ]
    },
    {
      day: t("sitech.page.day3"),
      events: [
        { time: "09:00", title: "Masterclass Post-production", type: "Masterclass" },
        { time: "11:00", title: "Table ronde : Convention collective", type: "Panel" },
        { time: "14:00", title: "Remise des prix RETECHCI", type: "Cérémonie" },
        { time: "16:00", title: "Clôture et perspectives 2028", type: "Cérémonie" },
      ]
    }
  ]

  const pricing = [
    {
      name: t("sitech.page.student"),
      price: "15 000",
      features: [t("sitech.page.access3days"), t("sitech.page.masterclasses"), t("sitech.page.certificate")],
      popular: false,
    },
    {
      name: t("sitech.page.professional"),
      price: "45 000",
      features: [t("sitech.page.access3days"), t("sitech.page.masterclasses"), t("sitech.page.networking"), t("sitech.page.certificate")],
      popular: true,
    },
    {
      name: t("sitech.page.vip"),
      price: "150 000",
      features: [t("sitech.page.access3days"), t("sitech.page.masterclasses"), t("sitech.page.networking"), t("sitech.page.certificate"), t("sitech.page.vipLounge")],
      popular: false,
    },
  ]

  const speakers = [
    { name: "Konan Yao", role: "Directeur Photo", company: "Cinema Africa", initials: "KY" },
    { name: "Marie Diallo", role: "Sound Designer", company: "Dolby Africa", initials: "MD" },
    { name: "Jean-Marc Kouamé", role: "VFX Supervisor", company: "Framestore", initials: "JK" },
    { name: "Aminata Traoré", role: "Productrice", company: "Côte Ouest Films", initials: "AT" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          
          <div className="relative z-10 container mx-auto px-4 text-center py-20">
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
              {t("sitech.badge")}
            </span>
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="text-foreground">{t("sitech.title")}</span>{" "}
              <span className="text-amber-500">{t("sitech.year")}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("sitech.page.heroSubtitle")}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  <span className="text-2xl font-bold">{t("sitech.date")}</span>
                </div>
                <p className="text-sm text-primary">{t("sitech.month")}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{t("sitech.participants")}</span>
                </div>
                <p className="text-sm text-primary">{t("sitech.participantsLabel")}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">Abidjan</span>
                </div>
                <p className="text-sm text-muted-foreground">Côte d'Ivoire</p>
              </div>
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
              {t("sitech.page.register")}
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t("sitech.page.about")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("sitech.page.aboutText")}
              </p>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("sitech.page.highlights")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <highlight.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("sitech.page.schedule")}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-background border border-border rounded-xl overflow-hidden">
                  <div className="bg-primary text-primary-foreground px-6 py-4">
                    <h3 className="text-xl font-bold">{day.day}</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex gap-4 p-3 bg-card rounded-lg">
                        <div className="flex items-center gap-2 text-primary min-w-[60px]">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{event.time}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <span className="text-xs text-muted-foreground">{event.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Speakers Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("sitech.page.speakers")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {speakers.map((speaker, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">{speaker.initials}</span>
                  </div>
                  <h3 className="font-semibold">{speaker.name}</h3>
                  <p className="text-sm text-primary">{speaker.role}</p>
                  <p className="text-xs text-muted-foreground">{speaker.company}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("sitech.page.pricing")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricing.map((plan, index) => (
                <div 
                  key={index}
                  className={`relative bg-background border rounded-xl p-6 ${
                    plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        <Star className="h-3 w-3" /> Populaire
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">FCFA</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("sitech.page.perPerson")}</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'}`}
                  >
                    {t("sitech.page.register")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("sitech.page.location")}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Map Placeholder */}
                <div className="h-64 bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Carte interactive</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{t("sitech.page.locationName")}</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("sitech.page.locationAddress")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("sitech.title")} {t("sitech.year")}
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {t("sitech.description")}
            </p>
            <Button size="lg" variant="secondary" className="px-8">
              {t("sitech.page.register")}
            </Button>
          </div>
        </section>

        <Partners />
      </main>
      <Footer />
    </div>
  )
}
