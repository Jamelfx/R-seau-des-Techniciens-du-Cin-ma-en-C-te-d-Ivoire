"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, MapPin, Users, Monitor, Mic, Clock, Bell, 
  CreditCard, Smartphone, Wallet, Building2, CheckCircle,
  QrCode, Download, Play, Image as ImageIcon, Sparkles, Wand2,
  X, ChevronLeft, ChevronRight, GraduationCap, Briefcase
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface SitechContent {
  hero_type?: string
  hero_image?: string
  hero_video?: string
  student_price?: string
  professional_price?: string
  vip_price?: string
  event_date?: string
  event_location?: string
}

// Previous editions gallery data
const galleryData = {
  "2024": [
    { id: "1", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600", caption: "Ceremonie d'ouverture SITECH 2024" },
    { id: "2", url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600", caption: "Panel sur l'avenir du cinema africain" },
    { id: "3", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600", caption: "Atelier pratique ARRI" },
    { id: "4", url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600", caption: "Espace exposants" },
    { id: "5", url: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600", caption: "Networking entre professionnels" },
    { id: "6", url: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600", caption: "Remise des prix" },
  ],
  "2023": [
    { id: "7", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600", caption: "Vue d'ensemble SITECH 2023" },
    { id: "8", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600", caption: "Conference magistrale" },
    { id: "9", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600", caption: "Formation technique" },
  ]
}

const videosData = [
  { id: "1", title: "SITECH 2024 - Film Officiel", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", youtubeId: "dQw4w9WgXcQ", year: "2024" },
  { id: "2", title: "Masterclass Sony VENICE", thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400", youtubeId: "dQw4w9WgXcQ", year: "2024" },
  { id: "3", title: "Panel Financement Cinema", thumbnail: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400", youtubeId: "dQw4w9WgXcQ", year: "2023" },
  { id: "4", title: "SITECH 2023 - Aftermovie", thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400", youtubeId: "dQw4w9WgXcQ", year: "2023" },
]

// Digital Access Card Component
function AccessCard({ data, onClose }: { data: { name: string; email: string; type: string; company: string; qrCode: string }; onClose: () => void }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto w-[300px] bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-1">
        <div className="bg-black rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Salon International</p>
              <p className="text-lg font-bold text-white">SITECH 2027</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Monitor className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          {/* Type Badge */}
          <div className="mb-4">
            <Badge className={`${
              data.type.includes("VIP") ? "bg-purple-500" : 
              data.type.includes("Exposant") ? "bg-amber-500" : 
              data.type.includes("Professionnel") ? "bg-blue-500" : "bg-green-500"
            } text-white px-4 py-1`}>
              {data.type}
            </Badge>
          </div>

          {/* Name */}
          <h3 className="text-xl font-bold text-white mb-1">{data.name}</h3>
          <p className="text-sm text-white/70 mb-1">{data.company || "Participant individuel"}</p>
          <p className="text-xs text-white/50 mb-4">{data.email}</p>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-gray-800" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{data.qrCode}</p>
          </div>

          {/* Event Info */}
          <div className="flex items-center justify-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              15-17 Dec 2027
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Sofitel Ivoire
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button className="bg-amber-500 hover:bg-amber-600">
          <Download className="h-4 w-4 mr-2" />
          Telecharger
        </Button>
      </div>
    </div>
  )
}

// Registration Dialog Component
function RegistrationDialog({ type, onSuccess }: { type: "exposant" | "participant"; onSuccess: (data: { name: string; email: string; type: string; company: string; qrCode: string }) => void }) {
  const [step, setStep] = useState<"form" | "payment" | "success">("form")
  const [selectedType, setSelectedType] = useState(type === "exposant" ? "Exposant (Stand)" : "Participant - Professionnel (45 000 FCFA)")
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [phone, setPhone] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: ""
  })

  const participantTypes = [
    { value: "Participant - Etudiant (15 000 FCFA)", price: 15000 },
    { value: "Participant - Professionnel (45 000 FCFA)", price: 45000 },
    { value: "Participant - VIP (150 000 FCFA)", price: 150000 },
  ]

  const exposantTypes = [
    { value: "Exposant - Stand Standard (250 000 FCFA)", price: 250000 },
    { value: "Exposant - Stand Premium (500 000 FCFA)", price: 500000 },
    { value: "Exposant - Partenaire Or (1 000 000 FCFA)", price: 1000000 },
  ]

  const paymentMethods = [
    { id: "orange", name: "Orange Money", icon: Smartphone, color: "bg-orange-500" },
    { id: "mtn", name: "MTN MoMo", icon: Smartphone, color: "bg-yellow-500" },
    { id: "wave", name: "Wave", icon: Wallet, color: "bg-cyan-500" },
    { id: "card", name: "Carte Bancaire", icon: CreditCard, color: "bg-purple-500" },
    { id: "bank", name: "Virement", icon: Building2, color: "bg-gray-500" },
  ]

  const getCurrentPrice = () => {
    const allTypes = [...participantTypes, ...exposantTypes]
    const found = allTypes.find(t => t.value === selectedType)
    return found?.price || 0
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePayment = () => {
    // Generate QR code
    const qrCode = `SITECH-2027-${Date.now().toString(36).toUpperCase()}`
    onSuccess({
      name: formData.name,
      email: formData.email,
      type: selectedType.split(" (")[0],
      company: formData.company,
      qrCode
    })
  }

  if (step === "form") {
    return (
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <Label>Type d&apos;inscription</Label>
          <select 
            className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-3 text-foreground"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {type === "exposant" ? (
              exposantTypes.map(t => <option key={t.value} value={t.value}>{t.value}</option>)
            ) : (
              participantTypes.map(t => <option key={t.value} value={t.value}>{t.value}</option>)
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nom complet *</Label>
            <Input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email *</Label>
            <Input 
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemple.com"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Telephone *</Label>
            <Input 
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+225 XX XX XX XX"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Entreprise / Societe</Label>
            <Input 
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nom de la structure"
              className="mt-1"
            />
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total a payer</span>
            <span className="text-2xl font-bold text-amber-500">{getCurrentPrice().toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
          Continuer vers le paiement
        </Button>
      </form>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center pb-4 border-b border-border">
        <p className="text-3xl font-bold text-amber-500">{getCurrentPrice().toLocaleString('fr-FR')} FCFA</p>
        <p className="text-muted-foreground text-sm">{selectedType.split(" (")[0]}</p>
      </div>

      <div>
        <Label className="mb-3 block">Choisissez votre moyen de paiement</Label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedPayment === method.id 
                  ? "border-amber-500 bg-amber-500/5" 
                  : "border-border hover:border-amber-500/50"
              }`}
            >
              <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center mb-2`}>
                <method.icon className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-sm">{method.name}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedPayment && selectedPayment !== "bank" && selectedPayment !== "card" && (
        <div>
          <Label>Numero de telephone</Label>
          <Input
            type="tel"
            placeholder="+225 XX XX XX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {selectedPayment === "card" && (
        <div className="space-y-3">
          <div>
            <Label>Numero de carte</Label>
            <Input placeholder="1234 5678 9012 3456" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Expiration</Label>
              <Input placeholder="MM/AA" className="mt-1" />
            </div>
            <div>
              <Label>CVV</Label>
              <Input placeholder="123" type="password" className="mt-1" />
            </div>
          </div>
        </div>
      )}

      {selectedPayment === "bank" && (
        <div className="p-4 bg-secondary/30 rounded-xl text-sm space-y-2">
          <p className="font-medium">Informations bancaires RETECHCI</p>
          <p><span className="text-muted-foreground">Banque:</span> BCEAO Abidjan</p>
          <p><span className="text-muted-foreground">IBAN:</span> CI93 XXXX XXXX XXXX XXXX</p>
          <p><span className="text-muted-foreground">Reference:</span> SITECH-{formData.name.split(" ")[0].toUpperCase()}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
          Retour
        </Button>
        <Button 
          className="flex-1 bg-amber-500 hover:bg-amber-600" 
          disabled={!selectedPayment}
          onClick={handlePayment}
        >
          Payer {getCurrentPrice().toLocaleString('fr-FR')} FCFA
        </Button>
      </div>
    </div>
  )
}

// Student Registration Form (FREE)
function StudentRegistrationForm({ onSuccess }: { onSuccess: (data: { name: string; email: string; type: string; company: string; qrCode: string }) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    studentId: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const qrCode = `SITECH-STU-${Date.now().toString(36).toUpperCase()}`
    onSuccess({
      name: formData.name,
      email: formData.email,
      type: "Etudiant (Gratuit)",
      company: formData.school,
      qrCode
    })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center mb-4">
        <Badge className="bg-green-600 text-white mb-2">GRATUIT</Badge>
        <p className="text-sm text-muted-foreground">
          Inscription gratuite pour les eleves et etudiants
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nom complet *</Label>
          <Input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Votre nom"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input 
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemple.com"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Telephone *</Label>
          <Input 
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+225 XX XX XX XX"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Etablissement *</Label>
          <Input 
            required
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            placeholder="Nom de l'ecole/universite"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Numero de carte etudiante *</Label>
        <Input 
          required
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          placeholder="Numero de carte scolaire/etudiante"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Vous devrez presenter votre carte etudiante valide a l&apos;entree
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Inscription en cours..." : "S'inscrire gratuitement"}
      </Button>
    </form>
  )
}

// Gallery Lightbox Component
function GalleryLightbox({ images, initialIndex, onClose }: { images: typeof galleryData["2024"]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
        <X className="h-8 w-8" />
      </button>
      <button onClick={goPrev} className="absolute left-4 text-white/70 hover:text-white">
        <ChevronLeft className="h-12 w-12" />
      </button>
      <button onClick={goNext} className="absolute right-4 text-white/70 hover:text-white">
        <ChevronRight className="h-12 w-12" />
      </button>
      
      <div className="max-w-4xl max-h-[80vh] relative">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].caption}
          width={1200}
          height={800}
          className="object-contain max-h-[80vh]"
        />
        <p className="text-center text-white mt-4">{images[currentIndex].caption}</p>
        <p className="text-center text-white/50 text-sm">{currentIndex + 1} / {images.length}</p>
      </div>
    </div>
  )
}

export default function SitechPage() {
  const { t } = useI18n()
  const [activeDay, setActiveDay] = useState(0)
  const [exposantDialogOpen, setExposantDialogOpen] = useState(false)
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [accessCard, setAccessCard] = useState<{ name: string; email: string; type: string; company: string; qrCode: string } | null>(null)
  const [lightbox, setLightbox] = useState<{ images: typeof galleryData["2024"]; index: number } | null>(null)
  const [selectedGalleryYear, setSelectedGalleryYear] = useState("2024")
  const [aiPrompt, setAiPrompt] = useState("")
  const [sitechContent, setSitechContent] = useState<SitechContent>({})
  
  useEffect(() => {
    const fetchContent = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'sitech')
      
      if (data) {
        const content: SitechContent = {}
        data.forEach(item => {
          content[item.key as keyof SitechContent] = item.value
        })
        setSitechContent(content)
      }
    }
    fetchContent()
  }, [])

  const stats = [
    { value: "1500+", label: "PARTICIPANTS" },
    { value: "50+", label: "EXPOSANTS" },
    { value: "30+", label: "CONFERENCES" },
    { value: "3", label: "JOURS" },
  ]

  const schedule = [
    {
      day: "Jour 1 - 15 Dec",
      events: [
        { time: "09:00", title: "Ceremonie d'Ouverture Officielle", location: "Salle principale", type: "Ceremonie", color: "bg-amber-500" },
        { time: "10:30", title: "Conference : L'avenir du cinema africain", location: "Panel International", type: "Conference", color: "bg-blue-500" },
        { time: "14:00", title: "Atelier ARRI : Alexa 35 en pratique", location: "Partenaire ARRI/Camera", type: "Atelier", color: "bg-green-500" },
        { time: "16:00", title: "Masterclass Son : Recording en conditions extremes", location: "Comite Sono", type: "Masterclass", color: "bg-primary" },
      ]
    },
    {
      day: "Jour 2 - 16 Dec",
      events: [
        { time: "09:00", title: "Workshop Son avec Dolby Atmos", location: "Dolby Africa", type: "Workshop", color: "bg-green-500" },
        { time: "11:00", title: "Panel : Financement de projets audiovisuels", location: "Salle Conference A", type: "Panel", color: "bg-blue-500" },
        { time: "14:00", title: "Masterclass Camera Sony VENICE 2", location: "Sony Pro Africa", type: "Masterclass", color: "bg-primary" },
        { time: "16:00", title: "Pitching sessions - Courts metrages", location: "Espace Business", type: "Business", color: "bg-amber-500" },
        { time: "20:00", title: "Projection : Selection FESPACO 2027", location: "Grande Salle", type: "Projection", color: "bg-purple-500" },
      ]
    },
    {
      day: "Jour 3 - 17 Dec",
      events: [
        { time: "09:00", title: "Masterclass Post-production DaVinci Resolve", location: "Blackmagic Design", type: "Masterclass", color: "bg-primary" },
        { time: "11:00", title: "Table ronde : Convention collective nationale", location: "RETECHCI", type: "Panel", color: "bg-blue-500" },
        { time: "14:00", title: "Remise des prix RETECHCI Awards", location: "Salle principale", type: "Ceremonie", color: "bg-amber-500" },
        { time: "16:00", title: "Cloture et perspectives SITECH 2028", location: "Direction RETECHCI", type: "Ceremonie", color: "bg-amber-500" },
      ]
    }
  ]

  const sponsors = [
    { initials: "AR", name: "ARRI" },
    { initials: "SO", name: "Sony" },
    { initials: "BM", name: "Blackmagic" },
    { initials: "CA", name: "Canon" },
  ]

  const handleRegistrationSuccess = (data: { name: string; email: string; type: string; company: string; qrCode: string }) => {
    setAccessCard(data)
    setExposantDialogOpen(false)
    setParticipantDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {sitechContent.hero_type === 'video' && sitechContent.hero_video ? (
            <div className="absolute inset-0">
              <iframe
                src={`https://www.youtube.com/embed/${sitechContent.hero_video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/)?.[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${sitechContent.hero_video.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/)?.[1]}`}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media"
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%' }}
              />
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${sitechContent.hero_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80'}')`,
              }}
            />
          )}
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
              L&apos;evenement phare des technologies de l&apos;Image et du Son en Afrique de l&apos;Ouest
            </p>
            <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Sofitel Hotel Ivoire - 15-17 Decembre 2027
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {/* Student Dialog - FREE */}
              <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Etudiant / Eleve (Gratuit)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                      Inscription Etudiant - SITECH 2027
                    </DialogTitle>
                    <DialogDescription>
                      Acces gratuit pour les eleves et etudiants avec carte valide
                    </DialogDescription>
                  </DialogHeader>
                  <StudentRegistrationForm onSuccess={handleRegistrationSuccess} />
                </DialogContent>
              </Dialog>

              {/* Professional Dialog */}
              <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 px-8">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Professionnel / Exposant
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Inscription Professionnel - SITECH 2027</DialogTitle>
                    <DialogDescription>
                      Rejoignez-nous pour 3 jours de conferences, ateliers et networking
                    </DialogDescription>
                  </DialogHeader>
                  <RegistrationDialog type="participant" onSuccess={handleRegistrationSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Access Card Dialog */}
        <Dialog open={!!accessCard} onOpenChange={() => setAccessCard(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Inscription Reussie !</DialogTitle>
              <DialogDescription className="text-center">
                Voici votre carte d&apos;acces digitale
              </DialogDescription>
            </DialogHeader>
            {accessCard && <AccessCard data={accessCard} onClose={() => setAccessCard(null)} />}
          </DialogContent>
        </Dialog>

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
            <h2 className="text-3xl font-bold text-center mb-12">Programme Detaille</h2>
            
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

        {/* Gallery Section - Previous Editions */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Galerie des editions precedentes</h2>
                <p className="text-muted-foreground mt-2">Revivez les moments forts des SITECH</p>
              </div>
              <div className="flex gap-2">
                {Object.keys(galleryData).map((year) => (
                  <Button
                    key={year}
                    variant={selectedGalleryYear === year ? "default" : "outline"}
                    onClick={() => setSelectedGalleryYear(year)}
                    className={selectedGalleryYear === year ? "bg-amber-500 hover:bg-amber-600" : ""}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryData[selectedGalleryYear as keyof typeof galleryData].map((photo, index) => (
                <div 
                  key={photo.id}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => setLightbox({ images: galleryData[selectedGalleryYear as keyof typeof galleryData], index })}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-sm">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightbox && (
          <GalleryLightbox 
            images={lightbox.images} 
            initialIndex={lightbox.index} 
            onClose={() => setLightbox(null)} 
          />
        )}

        {/* Videos Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Videos des programmes</h2>
            <p className="text-center text-muted-foreground mb-12">Masterclasses, conferences et moments forts en video</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {videosData.map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70">{video.year}</Badge>
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">{video.title}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* AI Content Assistant */}
        <section className="py-20 bg-gradient-to-b from-purple-500/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Assistant IA - SITECH</h2>
              <p className="text-muted-foreground mb-8">
                Posez vos questions sur l&apos;evenement ou demandez de l&apos;aide pour preparer votre participation
              </p>

              <Card className="border-purple-500/30">
                <CardContent className="p-6">
                  <Textarea
                    placeholder="Ex: Quels sont les horaires des masterclasses ? Comment preparer mon stand exposant ? Quels sont les themes des conferences ?"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  <Button className="w-full bg-purple-500 hover:bg-purple-600">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Demander a l&apos;IA
                  </Button>
                </CardContent>
              </Card>
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

        <Partners />
      </main>
      <Footer />
    </div>
  )
}
