"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Search, MapPin, Star, Mail, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Types
type AvailabilityStatus = "available" | "filming" | "unavailable"
type ExperienceLevel = "senior" | "intermediate" | "junior"
type LocationFilter = "all" | "urban" | "beach" | "nature" | "historical" | "modern" | "traditional"

interface Technician {
  id: string
  name: string
  role: string
  level: ExperienceLevel
  status: AvailabilityStatus
  image?: string
}

interface Equipment {
  name: string
  category: string
  pricePerDay: number
  pricePerWeek: number
}

interface Company {
  id: string
  name: string
  type: string
  description: string
  equipment: Equipment[]
}

interface CostumeService {
  id: string
  name: string
  specialty: string
  description: string
}

interface FilmLocation {
  id: string
  name: string
  city: string
  description: string
  image: string
  tags: string[]
  filters: LocationFilter[]
}

// Sample data with equipment pricing
const technicians: Technician[] = [
  { id: "1", name: "Marc Zadi", role: "Chef Opérateur", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { id: "2", name: "Aicha Toure", role: "Ingénieure Son", level: "intermediate", status: "filming", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { id: "3", name: "Eric Kouassi", role: "Chef Electro", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
  { id: "4", name: "Fatou Diallo", role: "Directrice Photo", level: "senior", status: "unavailable", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { id: "5", name: "Konan Yao", role: "Machiniste", level: "intermediate", status: "available", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  { id: "6", name: "Aminata Sanogo", role: "Scripte", level: "junior", status: "available", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
]

const companies: Company[] = [
  { 
    id: "1", 
    name: "AFRICA STUDIO PROD", 
    type: "Production & Location",
    description: "Leader de la location de matériel cinématographique professionnel en Côte d'Ivoire.",
    equipment: [
      { name: "ARRI Alexa Mini LF", category: "Caméra", pricePerDay: 150000, pricePerWeek: 750000 },
      { name: "ARRI Alexa Mini", category: "Caméra", pricePerDay: 120000, pricePerWeek: 600000 },
      { name: "RED Komodo 6K", category: "Caméra", pricePerDay: 80000, pricePerWeek: 400000 },
      { name: "Sony FX6", category: "Caméra", pricePerDay: 50000, pricePerWeek: 250000 },
      { name: "Zeiss Supreme Prime Set", category: "Optiques", pricePerDay: 100000, pricePerWeek: 500000 },
      { name: "ARRI Signature Prime Set", category: "Optiques", pricePerDay: 120000, pricePerWeek: 600000 },
      { name: "Kit Grip Complet", category: "Grip", pricePerDay: 40000, pricePerWeek: 200000 },
      { name: "Dolly Panther", category: "Machinerie", pricePerDay: 35000, pricePerWeek: 175000 },
    ]
  },
  { 
    id: "2", 
    name: "CINE TECH CI", 
    type: "Location Matériel",
    description: "Spécialiste des équipements de stabilisation et drones pour le cinéma.",
    equipment: [
      { name: "DJI Ronin 2", category: "Stabilisation", pricePerDay: 45000, pricePerWeek: 225000 },
      { name: "Steadicam M-1", category: "Stabilisation", pricePerDay: 80000, pricePerWeek: 400000 },
      { name: "DJI Inspire 3", category: "Drone", pricePerDay: 100000, pricePerWeek: 500000 },
      { name: "DJI Mavic 3 Cine", category: "Drone", pricePerDay: 40000, pricePerWeek: 200000 },
      { name: "ARRI SkyPanel S60-C", category: "Éclairage", pricePerDay: 35000, pricePerWeek: 175000 },
      { name: "Aputure 600d Pro", category: "Éclairage", pricePerDay: 25000, pricePerWeek: 125000 },
      { name: "Kit LED Nanlite", category: "Éclairage", pricePerDay: 15000, pricePerWeek: 75000 },
    ]
  },
  { 
    id: "3", 
    name: "ABIDJAN FILMS SERVICES", 
    type: "Production & Post-Production",
    description: "Services complets de post-production et location de studios.",
    equipment: [
      { name: "Suite DaVinci Resolve", category: "Post-Prod", pricePerDay: 50000, pricePerWeek: 250000 },
      { name: "Suite Pro Tools HDX", category: "Son", pricePerDay: 60000, pricePerWeek: 300000 },
      { name: "Studio Son (Journée)", category: "Studio", pricePerDay: 100000, pricePerWeek: 500000 },
      { name: "Salle Étalonnage", category: "Post-Prod", pricePerDay: 80000, pricePerWeek: 400000 },
      { name: "Sound Devices 888", category: "Son", pricePerDay: 40000, pricePerWeek: 200000 },
      { name: "Sennheiser MKH 416", category: "Son", pricePerDay: 8000, pricePerWeek: 40000 },
      { name: "Kit HF Sennheiser", category: "Son", pricePerDay: 20000, pricePerWeek: 100000 },
    ]
  },
]

const costumeServices: CostumeService[] = [
  { id: "1", name: "Mawa Couture", specialty: "Costumes Traditionnels", description: "Spécialiste des tenues traditionnelles africaines pour le cinéma et la télévision." },
  { id: "2", name: "Style & Scene", specialty: "Stylisme Moderne", description: "Création et location de costumes contemporains pour productions audiovisuelles." },
  { id: "3", name: "Africana Costumes", specialty: "Costumes d'Époque", description: "Reconstitution historique et costumes d'époque pour films et séries." },
]

const filmLocations: FilmLocation[] = [
  {
    id: "1",
    name: "Plateau Business District",
    city: "Abidjan",
    description: "Le quartier des affaires d'Abidjan offre un cadre urbain moderne parfait pour des scènes corporate, des thrillers ou des films contemporains.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
    tags: ["architecture moderne", "buildings", "entreprises"],
    filters: ["urban", "modern"]
  },
  {
    id: "2",
    name: "Village Lagunaire de Blockhauss",
    city: "Abidjan",
    description: "Village traditionnel au bord de la lagune Ebrié. Architecture vernaculaire, pirogues traditionnelles. Parfait pour des scènes de vie quotidienne authentique.",
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&h=250&fit=crop",
    tags: ["lagune", "traditionnel", "village"],
    filters: ["traditional", "nature"]
  },
  {
    id: "3",
    name: "Quartier Colonial de Grand-Bassam",
    city: "Grand-Bassam",
    description: "Site UNESCO avec une architecture coloniale française bien préservée. Rues pavées, vieux bâtiments, ambiance historique unique.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    tags: ["historique", "colonial", "UNESCO", "patrimoine"],
    filters: ["historical", "urban"]
  },
  {
    id: "4",
    name: "Plage d'Assinie",
    city: "Assinie",
    description: "Plages de sable fin bordées de cocotiers. Idéal pour les scènes de détente, de vacances ou de romance avec un cadre tropical paradisiaque.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop",
    tags: ["plage", "cocotiers", "tropical"],
    filters: ["beach", "nature"]
  },
]

// Contact Form Component
function ContactDialog({ companyName, serviceName }: { companyName?: string, serviceName?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send to the backend
    console.log("Contact request sent to Directeur Exécutif:", {
      ...formData,
      company: companyName,
      service: serviceName
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Message envoyé !</h3>
        <p className="text-muted-foreground text-sm">
          Le Directeur Exécutif vous contactera dans les plus brefs délais.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Votre nom"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="votre@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+225 XX XX XX XX XX"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Décrivez votre projet et vos besoins..."
          rows={4}
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        Envoyer la demande
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Votre demande sera transmise au Directeur Exécutif du RETECHCI
      </p>
    </form>
  )
}

// Equipment Table Component
function EquipmentTable({ equipment }: { equipment: Equipment[] }) {
  const categories = [...new Set(equipment.map(e => e.category))]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Équipement</th>
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Catégorie</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Prix/Jour</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">Prix/Semaine</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            equipment.filter(e => e.category === category).map((item, index) => (
              <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/50">
                <td className="py-2 px-2 text-foreground">{item.name}</td>
                <td className="py-2 px-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                    {item.category}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-foreground">{formatPrice(item.pricePerDay)}</td>
                <td className="py-2 px-2 text-right text-amber-500 font-medium">{formatPrice(item.pricePerWeek)}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DirectoryPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"technicians" | "companies" | "costumes" | "locations">("technicians")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all")
  const [locationSearch, setLocationSearch] = useState("")
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([])

  const toggleCompanyExpand = (id: string) => {
    setExpandedCompanies(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
      case "available": return t("directory.available")
      case "filming": return t("directory.filming")
      case "unavailable": return t("directory.unavailable")
    }
  }

  const getLevelText = (level: ExperienceLevel) => {
    switch (level) {
      case "senior": return t("directory.senior")
      case "intermediate": return t("directory.intermediate")
      case "junior": return t("directory.junior")
    }
  }

  const filteredTechnicians = technicians.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLocations = filmLocations.filter(loc => {
    const matchesFilter = locationFilter === "all" || loc.filters.includes(locationFilter)
    const matchesSearch = loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.city.toLowerCase().includes(locationSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const locationFilters: LocationFilter[] = ["all", "urban", "beach", "nature", "historical", "modern", "traditional"]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        {/* Hero Section */}
        <section className="px-6 py-12 lg:px-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {t("directory.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("directory.subtitle")}
              </p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("directory.search")}
                className="pl-10 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-6 lg:px-20 border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-4">
            <button
              onClick={() => setActiveTab("technicians")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "technicians"
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("directory.tabs.technicians")}
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "companies"
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("directory.tabs.companies")}
            </button>
            <button
              onClick={() => setActiveTab("costumes")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "costumes"
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("directory.tabs.costumes")}
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === "locations"
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-4 w-4" />
              {t("directory.tabs.locations")}
            </button>
          </div>
        </section>

        {/* Tab Content */}
        <section className="px-6 lg:px-20 py-12">
          {/* Technicians Tab */}
          {activeTab === "technicians" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-secondary">
                        {tech.image ? (
                          <Image src={tech.image} alt={tech.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground font-semibold">
                            {tech.name.split(" ").map(n => n[0]).join("")}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{tech.name}</h3>
                        <p className="text-sm text-primary">{tech.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs text-muted-foreground">{getLevelText(tech.level)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      tech.status === "available" ? "bg-green-500/20 text-green-500" :
                      tech.status === "filming" ? "bg-amber-500/20 text-amber-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {getStatusText(tech.status)}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    {t("directory.viewProfile")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Companies Tab - Updated with Equipment Table */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => toggleCompanyExpand(company.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-foreground">{company.name}</h3>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {company.type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {company.equipment.length} équipements disponibles
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-primary hover:bg-primary/90"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contacter
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Contacter {company.name}</DialogTitle>
                            </DialogHeader>
                            <ContactDialog companyName={company.name} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon">
                          {expandedCompanies.includes(company.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Equipment Table */}
                  {expandedCompanies.includes(company.id) && (
                    <div className="px-6 pb-6 border-t border-border">
                      <h4 className="text-sm font-semibold text-foreground mt-4 mb-2">
                        Tarifs de Location
                      </h4>
                      <EquipmentTable equipment={company.equipment} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Costumes Tab - Updated */}
          {activeTab === "costumes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {costumeServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-bold text-lg text-foreground mb-1">{service.name}</h3>
                  <p className="text-sm text-primary mb-2">{service.specialty}</p>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contacter {service.name}</DialogTitle>
                      </DialogHeader>
                      <ContactDialog serviceName={service.name} />
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Map placeholder + Search */}
              <div className="lg:w-1/3 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("directory.searchLocation")}
                    className="pl-10 bg-secondary border-border"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  {locationFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLocationFilter(filter)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        locationFilter === filter
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t(`directory.filters.${filter}`)}
                    </button>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="bg-card border border-border rounded-xl p-4 h-64 lg:h-80">
                  <h3 className="text-sm font-medium text-foreground mb-2">{t("directory.mapTitle")}</h3>
                  <div className="h-full bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-50">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path d="M100,20 C60,40 40,80 50,120 C60,160 100,180 140,160 C180,140 180,80 150,50 C130,30 100,20 100,20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                        <circle cx="80" cy="80" r="4" className="fill-primary" />
                        <circle cx="120" cy="100" r="4" className="fill-primary" />
                        <circle cx="100" cy="140" r="4" className="fill-primary" />
                        <circle cx="60" cy="120" r="4" className="fill-primary" />
                      </svg>
                    </div>
                    <div className="text-center text-muted-foreground text-sm z-10">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>Carte interactive</p>
                      <p className="text-xs">Côte d&apos;Ivoire</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Locations List */}
              <div className="lg:w-2/3 space-y-4">
                {filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-card border border-border rounded-xl overflow-hidden flex flex-col md:flex-row"
                  >
                    <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                      <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {location.city}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground">{location.name}</h3>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">
                          {t("directory.available")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{location.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {location.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          {t("directory.viewPhotos")}
                        </Button>
                        <Button size="sm" variant="outline">
                          {t("directory.requestScouting")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <Partners />
      </main>
      <Footer />
    </div>
  )
}
