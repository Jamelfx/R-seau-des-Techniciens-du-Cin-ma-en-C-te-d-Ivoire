"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Search, MapPin, Star, Mail, ChevronDown, ChevronUp, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"

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
  image: string
  logo: string
  equipment: Equipment[]
}

interface Costume {
  id: string
  name: string
  description: string
  image: string
  available: boolean
}

interface CostumeService {
  id: string
  name: string
  specialty: string
  description: string
  image: string
  logo: string
  costumes: Costume[]
}

interface FilmLocation {
  id: string
  name: string
  city: string
  description: string
  image: string
  tags: string[]
  filters: LocationFilter[]
  coordinates: { lat: number; lng: number }
}

// Sample data
const technicians: Technician[] = [
  { id: "CI-2024-0001", name: "Marc Zadi", role: "Chef Opérateur", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  { id: "CI-2024-0002", name: "Aicha Toure", role: "Ingénieure Son", level: "intermediate", status: "filming", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
  { id: "CI-2024-0003", name: "Eric Kouassi", role: "Chef Electro", level: "senior", status: "available", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
  { id: "CI-2024-0004", name: "Fatou Diallo", role: "Directrice Photo", level: "senior", status: "unavailable", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  { id: "CI-2024-0005", name: "Konan Yao", role: "Machiniste", level: "intermediate", status: "available", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  { id: "CI-2024-0006", name: "Aminata Sanogo", role: "Scripte", level: "junior", status: "available", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
]

const companies: Company[] = [
  { 
    id: "1", 
    name: "AFRICA STUDIO PROD", 
    type: "Production & Location",
    description: "Leader de la location de matériel cinématographique professionnel en Côte d'Ivoire.",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    equipment: [
      { name: "DJI Ronin 2", category: "Stabilisation", pricePerDay: 45000, pricePerWeek: 225000 },
      { name: "Steadicam M-1", category: "Stabilisation", pricePerDay: 80000, pricePerWeek: 400000 },
      { name: "DJI Inspire 3", category: "Drone", pricePerDay: 100000, pricePerWeek: 500000 },
      { name: "DJI Mavic 3 Cine", category: "Drone", pricePerDay: 40000, pricePerWeek: 200000 },
      { name: "ARRI SkyPanel S60-C", category: "Éclairage", pricePerDay: 35000, pricePerWeek: 175000 },
      { name: "Aputure 600d Pro", category: "Éclairage", pricePerDay: 25000, pricePerWeek: 125000 },
    ]
  },
  { 
    id: "3", 
    name: "ABIDJAN FILMS SERVICES", 
    type: "Production & Post-Production",
    description: "Services complets de post-production et location de studios.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop",
    equipment: [
      { name: "Suite DaVinci Resolve", category: "Post-Prod", pricePerDay: 50000, pricePerWeek: 250000 },
      { name: "Suite Pro Tools HDX", category: "Son", pricePerDay: 60000, pricePerWeek: 300000 },
      { name: "Studio Son (Journée)", category: "Studio", pricePerDay: 100000, pricePerWeek: 500000 },
      { name: "Salle Étalonnage", category: "Post-Prod", pricePerDay: 80000, pricePerWeek: 400000 },
      { name: "Sound Devices 888", category: "Son", pricePerDay: 40000, pricePerWeek: 200000 },
    ]
  },
]

const costumeServices: CostumeService[] = [
  { 
    id: "1", 
    name: "Mawa Couture", 
    specialty: "Costumes Traditionnels", 
    description: "Spécialiste des tenues traditionnelles africaines pour le cinéma et la télévision.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop",
    costumes: [
      { id: "c1", name: "Boubou Royal Homme", description: "Boubou brodé main, tissus bazin riche", image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=300&h=400&fit=crop", available: true },
      { id: "c2", name: "Ensemble Kita Femme", description: "Kita traditionnel avec pagne assorti", image: "https://images.unsplash.com/photo-1582639510494-c80b5de9f148?w=300&h=400&fit=crop", available: true },
      { id: "c3", name: "Costume Chef Traditionnel", description: "Tenue complète de chef de village", image: "https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=300&h=400&fit=crop", available: false },
    ]
  },
  { 
    id: "2", 
    name: "Style & Scene", 
    specialty: "Stylisme Moderne", 
    description: "Création et location de costumes contemporains pour productions audiovisuelles.",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop",
    costumes: [
      { id: "c4", name: "Costume Business Homme", description: "Costume 3 pièces haute couture", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop", available: true },
      { id: "c5", name: "Robe de Soirée", description: "Robe longue élégante pour galas", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&h=400&fit=crop", available: true },
      { id: "c6", name: "Tenue Streetwear", description: "Ensemble urbain tendance", image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=400&fit=crop", available: true },
    ]
  },
  { 
    id: "3", 
    name: "Africana Costumes", 
    specialty: "Costumes d'Époque", 
    description: "Reconstitution historique et costumes d'époque pour films et séries.",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=300&fit=crop",
    logo: "https://images.unsplash.com/photo-1589810635657-232948472d98?w=100&h=100&fit=crop",
    costumes: [
      { id: "c7", name: "Tenue Coloniale 1920", description: "Costume époque coloniale française", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop", available: true },
      { id: "c8", name: "Uniforme Militaire", description: "Uniforme armée coloniale", image: "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=300&h=400&fit=crop", available: false },
    ]
  },
]

const filmLocations: FilmLocation[] = [
  {
    id: "1",
    name: "Plateau Business District",
    city: "Abidjan",
    description: "Le quartier des affaires d'Abidjan offre un cadre urbain moderne parfait pour des scènes corporate, des thrillers ou des films contemporains.",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
    tags: ["architecture moderne", "buildings", "entreprises"],
    filters: ["urban", "modern"],
    coordinates: { lat: 5.3221, lng: -4.0168 }
  },
  {
    id: "2",
    name: "Village Lagunaire de Blockhauss",
    city: "Abidjan",
    description: "Village traditionnel au bord de la lagune Ebrié. Architecture vernaculaire, pirogues traditionnelles.",
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&h=250&fit=crop",
    tags: ["lagune", "traditionnel", "village"],
    filters: ["traditional", "nature"],
    coordinates: { lat: 5.3167, lng: -4.0333 }
  },
  {
    id: "3",
    name: "Quartier Colonial de Grand-Bassam",
    city: "Grand-Bassam",
    description: "Site UNESCO avec une architecture coloniale française bien préservée.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    tags: ["historique", "colonial", "UNESCO"],
    filters: ["historical", "urban"],
    coordinates: { lat: 5.1939, lng: -3.7369 }
  },
  {
    id: "4",
    name: "Plage d'Assinie",
    city: "Assinie",
    description: "Plages de sable fin bordées de cocotiers. Idéal pour les scènes de détente ou de romance.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop",
    tags: ["plage", "cocotiers", "tropical"],
    filters: ["beach", "nature"],
    coordinates: { lat: 5.1500, lng: -3.5000 }
  },
  {
    id: "5",
    name: "Forêt de Banco",
    city: "Abidjan",
    description: "Parc national en plein coeur d'Abidjan. Forêt tropicale dense idéale pour scènes de nature.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=250&fit=crop",
    tags: ["forêt", "nature", "tropical"],
    filters: ["nature"],
    coordinates: { lat: 5.3833, lng: -4.0500 }
  },
  {
    id: "6",
    name: "Basilique Notre-Dame de la Paix",
    city: "Yamoussoukro",
    description: "Plus grande basilique chrétienne du monde. Architecture monumentale impressionnante.",
    image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400&h=250&fit=crop",
    tags: ["religieux", "architecture", "monument"],
    filters: ["historical", "modern"],
    coordinates: { lat: 6.8128, lng: -5.2894 }
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
        <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Votre nom" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+225 XX XX XX XX XX" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Décrivez votre projet et vos besoins..." rows={4} />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Envoyer la demande</Button>
      <p className="text-xs text-muted-foreground text-center">Votre demande sera transmise au Directeur Exécutif du RETECHCI</p>
    </form>
  )
}

// Equipment Table Component
function EquipmentTable({ equipment }: { equipment: Equipment[] }) {
  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'

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
          {equipment.map((item) => (
            <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/50">
              <td className="py-2 px-2 text-foreground">{item.name}</td>
              <td className="py-2 px-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{item.category}</span>
              </td>
              <td className="py-2 px-2 text-right text-foreground">{formatPrice(item.pricePerDay)}</td>
              <td className="py-2 px-2 text-right text-amber-500 font-medium">{formatPrice(item.pricePerWeek)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Google Maps Component
function InteractiveMap({ locations, selectedLocation, onSelectLocation }: { 
  locations: FilmLocation[], 
  selectedLocation: string | null,
  onSelectLocation: (id: string) => void 
}) {
  // Center on Côte d'Ivoire
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=7.5399,-5.5471&zoom=7&maptype=roadmap`
  
  return (
    <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden border border-border">
      <iframe
        src={mapSrc}
        className="w-full h-full"
        style={{ border: 0, minHeight: '400px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Map Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelectLocation(loc.id)}
            className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-transform hover:scale-125 ${
              selectedLocation === loc.id ? 'scale-125' : ''
            }`}
            style={{
              // Approximate positions on the embedded map
              left: `${((loc.coordinates.lng + 8) / 10) * 100}%`,
              top: `${((10 - loc.coordinates.lat) / 8) * 100}%`
            }}
          >
            <MapPin className={`h-6 w-6 ${selectedLocation === loc.id ? 'text-primary fill-primary' : 'text-primary'}`} />
          </button>
        ))}
      </div>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Décor disponible</span>
        </div>
        <p className="text-muted-foreground">Cliquez sur un marqueur pour voir les détails</p>
      </div>
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
  const [expandedCostumes, setExpandedCostumes] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const toggleCompanyExpand = (id: string) => {
    setExpandedCompanies(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const toggleCostumeExpand = (id: string) => {
    setExpandedCostumes(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
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
  const filterLabels: Record<LocationFilter, string> = {
    all: "Toutes",
    urban: "Urbain",
    beach: "Plage",
    nature: "Nature",
    historical: "Historique",
    modern: "Moderne",
    traditional: "Traditionnel"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8">
        {/* Hero Section */}
        <section className="px-6 py-12 lg:px-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">{t("directory.title")}</h1>
              <p className="text-muted-foreground">{t("directory.subtitle")}</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("directory.search")} className="pl-10 bg-secondary border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-6 lg:px-20 border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {[
              { key: "technicians", label: t("directory.tabs.technicians") },
              { key: "companies", label: t("directory.tabs.companies") },
              { key: "costumes", label: t("directory.tabs.costumes") },
              { key: "locations", label: t("directory.tabs.locations"), icon: MapPin }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-secondary text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        <section className="px-6 lg:px-20 py-12">
          {/* Technicians Tab */}
          {activeTab === "technicians" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechnicians.map((tech) => (
                <div key={tech.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
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
                  <Link href={`/membre/${tech.id}`}>
                    <Button variant="outline" className="w-full">{t("directory.viewProfile")}</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-6">
              {companies.map((company) => (
                <div key={company.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                  {/* Company Header with Image */}
                  <div className="relative h-48 w-full">
                    <Image src={company.image} alt={company.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-white bg-white">
                          <Image src={company.logo} alt={`${company.name} logo`} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{company.name}</h3>
                          <p className="text-primary text-sm">{company.type}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">Contacter</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contacter {company.name}</DialogTitle>
                            <DialogDescription>Envoyez une demande de contact au Directeur Exécutif du RETECHCI.</DialogDescription>
                          </DialogHeader>
                          <ContactDialog companyName={company.name} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4">{company.description}</p>
                    
                    <button
                      onClick={() => toggleCompanyExpand(company.id)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      {expandedCompanies.includes(company.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Masquer le catalogue
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Voir le catalogue ({company.equipment.length} équipements)
                        </>
                      )}
                    </button>
                    
                    {expandedCompanies.includes(company.id) && (
                      <EquipmentTable equipment={company.equipment} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Costumes Tab */}
          {activeTab === "costumes" && (
            <div className="space-y-8">
              {costumeServices.map((service) => (
                <div key={service.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Service Header with Image */}
                  <div className="relative h-48 w-full">
                    <Image src={service.image} alt={service.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-white bg-white">
                          <Image src={service.logo} alt={`${service.name} logo`} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{service.name}</h3>
                          <p className="text-primary text-sm">{service.specialty}</p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">Contacter</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contacter {service.name}</DialogTitle>
                            <DialogDescription>Envoyez une demande de contact pour les costumes et accessoires.</DialogDescription>
                          </DialogHeader>
                          <ContactDialog serviceName={service.name} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    
                    <button
                      onClick={() => toggleCostumeExpand(service.id)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
                    >
                      {expandedCostumes.includes(service.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Masquer les costumes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Voir les costumes disponibles ({service.costumes.length})
                        </>
                      )}
                    </button>
                    
                    {expandedCostumes.includes(service.id) && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {service.costumes.map((costume) => (
                          <div key={costume.id} className="relative group">
                            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                              <Image src={costume.image} alt={costume.name} fill className="object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              {!costume.available && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Indisponible</span>
                                </div>
                              )}
                              {costume.available && (
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Disponible</span>
                              )}
                            </div>
                            <div className="mt-2">
                              <h4 className="font-medium text-sm text-foreground">{costume.name}</h4>
                              <p className="text-xs text-muted-foreground">{costume.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map Column */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("directory.searchLocation")}
                    className="pl-10 bg-secondary border-border"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {locationFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLocationFilter(filter)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        locationFilter === filter
                          ? "bg-primary text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filterLabels[filter]}
                    </button>
                  ))}
                </div>

                <InteractiveMap 
                  locations={filteredLocations} 
                  selectedLocation={selectedLocation}
                  onSelectLocation={setSelectedLocation}
                />
              </div>

              {/* Locations List Column */}
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {filteredLocations.map((loc) => (
                  <div 
                    key={loc.id} 
                    className={`bg-card border rounded-xl overflow-hidden transition-all cursor-pointer ${
                      selectedLocation === loc.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedLocation(loc.id)}
                  >
                    <div className="flex gap-4">
                      <div className="relative w-40 h-32 flex-shrink-0">
                        <Image src={loc.image} alt={loc.name} fill className="object-cover" />
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">Disponible</span>
                      </div>
                      <div className="py-3 pr-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{loc.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {loc.city}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{loc.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {loc.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-secondary text-xs rounded text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-primary hover:bg-primary/90">{t("directory.viewPhotos")}</Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">{t("directory.requestScouting")}</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Demander un repérage - {loc.name}</DialogTitle>
                                <DialogDescription>Demandez un repérage pour vos besoins de tournage.</DialogDescription>
                              </DialogHeader>
                              <ContactDialog serviceName={loc.name} />
                            </DialogContent>
                          </Dialog>
                        </div>
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
