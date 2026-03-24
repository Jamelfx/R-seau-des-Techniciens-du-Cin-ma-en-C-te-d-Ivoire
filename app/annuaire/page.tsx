"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Search, MapPin, Star, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Company {
  id: string
  name: string
  type: string
  equipment: string[]
  phone: string
}

interface CostumeService {
  id: string
  name: string
  specialty: string
  phone: string
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

// Sample data
const technicians: Technician[] = [
  { id: "1", name: "Marc Zadi", role: "Chef Opérateur", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { id: "2", name: "Aicha Toure", role: "Ingénieure Son", level: "intermediate", status: "filming", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { id: "3", name: "Eric Kouassi", role: "Chef Electro", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
  { id: "4", name: "Fatou Diallo", role: "Directrice Photo", level: "senior", status: "unavailable", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { id: "5", name: "Konan Yao", role: "Machiniste", level: "intermediate", status: "available", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  { id: "6", name: "Aminata Sanogo", role: "Scripte", level: "junior", status: "available", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
]

const companies: Company[] = [
  { id: "1", name: "AFRICA STUDIO PROD", type: "Production & Location", equipment: ["ARRI", "RED", "Sony Cinema", "Grip Complet"], phone: "+225 07 XX XX XX XX" },
  { id: "2", name: "CINE TECH CI", type: "Location Matériel", equipment: ["Steadicam", "Drone", "Eclairage LED"], phone: "+225 05 XX XX XX XX" },
  { id: "3", name: "ABIDJAN FILMS SERVICES", type: "Production & Post-Production", equipment: ["DaVinci Resolve", "Pro Tools", "Studio Son"], phone: "+225 01 XX XX XX XX" },
]

const costumeServices: CostumeService[] = [
  { id: "1", name: "Mawa Couture", specialty: "Costumes Traditionnels", phone: "+225 07 XX XX XX XX" },
  { id: "2", name: "Style & Scene", specialty: "Stylisme Moderne", phone: "+225 05 XX XX XX XX" },
  { id: "3", name: "Africana Costumes", specialty: "Costumes d'Époque", phone: "+225 01 XX XX XX XX" },
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
  {
    id: "5",
    name: "Parc National de Taï",
    city: "Taï",
    description: "Forêt tropicale primaire classée UNESCO. Faune et flore exceptionnelles. Cadre idéal pour documentaires nature ou films d'aventure.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=250&fit=crop",
    tags: ["forêt", "nature", "UNESCO", "faune"],
    filters: ["nature"]
  },
  {
    id: "6",
    name: "Mont Tonkoui",
    city: "Man",
    description: "Point culminant de Côte d'Ivoire (1189m). Vues panoramiques spectaculaires. Idéal pour scènes épiques, introspectives ou de montagne.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop",
    tags: ["montagne", "panorama", "nature"],
    filters: ["nature"]
  },
]

export default function DirectoryPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<"technicians" | "companies" | "costumes" | "locations">("technicians")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all")
  const [locationSearch, setLocationSearch] = useState("")

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case "available": return "bg-green-500"
      case "filming": return "bg-amber-500"
      case "unavailable": return "bg-red-500"
    }
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

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{company.name}</h3>
                    <p className="text-sm text-primary mb-2">{company.type}</p>
                    <p className="text-sm text-muted-foreground">{company.equipment.join(", ")}</p>
                  </div>
                  <Button variant="outline" className="whitespace-nowrap">
                    <Phone className="h-4 w-4 mr-2" />
                    {company.phone}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Costumes Tab */}
          {activeTab === "costumes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {costumeServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-bold text-lg text-foreground mb-1">{service.name}</h3>
                  <p className="text-sm text-primary mb-4">{service.specialty}</p>
                  <Button variant="outline" className="whitespace-nowrap">
                    <Phone className="h-4 w-4 mr-2" />
                    {service.phone}
                  </Button>
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
