"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Users, Monitor, Mic, Clock, Bell } from "lucide-react"

export default function SitechPage() {
  const { t } = useI18n()
  const [activeDay, setActiveDay] = useState(0)

  const stats = [
    { value: "1500+", label: "PARTICIPANTS" },
    { value: "50+", label: "EXPOSANTS" },
    { value: "30+", label: "CONFÉRENCES" },
    { value: "3", label: "JOURS" },
  ]

  const schedule = [
    {
      day: "Jour 1 - 15 Déc",
      events: [
        { time: "09:00", title: "Cérémonie d'Ouverture Officielle", location: "Salle principale", type: "Cérémonie", color: "bg-amber-500" },
        { time: "10:30", title: "Conférence : L'avenir du cinéma africain", location: "Panel International", type: "Conférence", color: "bg-blue-500" },
        { time: "14:00", title: "Atelier ARRI : Alexa 35 en pratique", location: "Partenaire ARRI/Caméra", type: "Atelier", color: "bg-green-500" },
        { time: "16:00", title: "Masterclass Son : Recording en conditions extrêmes", location: "Comité Sono", type: "Masterclass", color: "bg-primary" },
      ]
    },
    {
      day: "Jour 2 - 16 Déc",
      events: [
        { time: "09:00", title: "Workshop Son avec Dolby Atmos", location: "Dolby Africa", type: "Workshop", color: "bg-green-500" },
        { time: "11:00", title: "Panel : Financement de projets audiovisuels", location: "Salle Conférence A", type: "Panel", color: "bg-blue-500" },
        { time: "14:00", title: "Masterclass Caméra Sony VENICE 2", location: "Sony Pro Africa", type: "Masterclass", color: "bg-primary" },
        { time: "16:00", title: "Pitching sessions - Courts métrages", location: "Espace Business", type: "Business", color: "bg-amber-500" },
        { time: "20:00", title: "Projection : Sélection FESPACO 2027", location: "Grande Salle", type: "Projection", color: "bg-purple-500" },
      ]
    },
    {
      day: "Jour 3 - 17 Déc",
      events: [
        { time: "09:00", title: "Masterclass Post-production DaVinci Resolve", location: "Blackmagic Design", type: "Masterclass", color: "bg-primary" },
        { time: "11:00", title: "Table ronde : Convention collective nationale", location: "RETECHCI", type: "Panel", color: "bg-blue-500" },
        { time: "14:00", title: "Remise des prix RETECHCI Awards", location: "Salle principale", type: "Cérémonie", color: "bg-amber-500" },
        { time: "16:00", title: "Clôture et perspectives SITECH 2028", location: "Direction RETECHCI", type: "Cérémonie", color: "bg-amber-500" },
      ]
    }
  ]

  const sponsors = [
    { initials: "AR", name: "ARRI" },
    { initials: "SO", name: "Sony" },
    { initials: "BM", name: "Blackmagic" },
    { initials: "CA", name: "Canon" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
          
          <div className="relative z-10 container mx-auto px-4 text-center py-16">
            <span className="inline-block px-4 py-2 bg-muted/50 text-muted-foreground rounded-full text-xs font-medium tracking-wider mb-6 border border-border">
              SALON INTERNATIONAL DES TECHNOLOGIES
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-foreground">SITECH</span>{" "}
              <span className="text-amber-500">2027</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
              L'événement phare des technologies de l'Image et du Son en Afrique de l'Ouest
            </p>
            <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Sofitel Hôtel Ivoire • 15-17 Décembre 2027
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Inscription Exposant
              </Button>
              <Button size="lg" variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 px-8">
                Inscription Participant
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Programme Détaillé</h2>
            
            {/* Day Tabs */}
            <div className="flex justify-center gap-2 mb-10">
              {schedule.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDay(index)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                    activeDay === index 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-card border border-border text-muted-foreground hover:border-amber-500/50'
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* Events Timeline */}
            <div className="max-w-4xl mx-auto space-y-4">
              {schedule[activeDay].events.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                >
                  <div className="text-primary font-bold text-lg min-w-[60px]">
                    {event.time}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  </div>
                  <span className={`px-3 py-1 ${event.color} text-white text-xs font-medium rounded-full`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Partenaires & Sponsors</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {sponsors.map((sponsor, index) => (
                <div 
                  key={index}
                  className="w-24 h-24 bg-background border border-border rounded-full flex items-center justify-center hover:border-primary/50 transition-colors"
                >
                  <span className="text-2xl font-bold text-muted-foreground">{sponsor.initials}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-2">Inscription SITECH 2027</h2>
              <p className="text-center text-muted-foreground mb-10">
                Rejoignez-nous pour le plus grand événement technologique du cinéma africain.
              </p>
              
              <div className="bg-card border border-border rounded-xl p-8">
                <div className="space-y-6">
                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type d'inscription</label>
                    <select className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Exposant (Stand professionnel)</option>
                      <option>Participant - Étudiant (15 000 FCFA)</option>
                      <option>Participant - Professionnel (45 000 FCFA)</option>
                      <option>Participant - VIP (150 000 FCFA)</option>
                    </select>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet</label>
                      <Input 
                        placeholder="Votre nom..." 
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input 
                        type="email"
                        placeholder="votre@email.com" 
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  {/* Phone & Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone</label>
                      <Input 
                        placeholder="+225 XX XX XX XX XX" 
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Entreprise / Société</label>
                      <Input 
                        placeholder="Nom de la structure" 
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Message / Besoins spécifiques</label>
                    <Textarea 
                      placeholder="Décrivez vos attentes ou besoins..."
                      className="bg-background border-border min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg">
                    Confirmer mon inscription
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Un email de confirmation vous sera envoyé avec les détails de paiement.
                  </p>
                </div>
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
