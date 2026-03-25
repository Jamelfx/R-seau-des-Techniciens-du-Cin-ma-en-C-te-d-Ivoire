"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Users, Settings,
  Plus, Edit, Trash2, Eye, Save, Upload, LogOut, Globe,
  Home, Info, Newspaper, CalendarDays, Star, Building2,
  CheckCircle, AlertCircle, Lock, User, Clapperboard, UserPlus,
  Menu, CreditCard, Palette, Sparkles, GripVertical, ExternalLink,
  Wand2, RefreshCw, Type, Move, MapPin, Camera
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Allowed roles for CMS access
const CMS_ALLOWED_ROLES = ["admin", "director", "president", "treasurer"]

// CMS Content Types
const pages = [
  { id: "home", name: "Accueil", path: "/", lastUpdated: "2024-01-20", status: "published" },
  { id: "about", name: "À propos", path: "/a-propos", lastUpdated: "2024-01-18", status: "published" },
  { id: "directory", name: "Annuaire", path: "/annuaire", lastUpdated: "2024-01-15", status: "published" },
  { id: "adhesion", name: "Formulaire d'adhésion", path: "/adhesion", lastUpdated: "2024-01-23", status: "published" },
  { id: "news", name: "Actualités", path: "/actualites", lastUpdated: "2024-01-19", status: "published" },
  { id: "conventions", name: "Conventions & Légal", path: "/conventions", lastUpdated: "2024-01-10", status: "published" },
  { id: "sitech", name: "SITECH 2027", path: "/sitech-2027", lastUpdated: "2024-01-21", status: "draft" },
  { id: "affiche", name: "À l'Affiche", path: "/a-laffiche", lastUpdated: "2024-01-22", status: "published" },
]

const articles = [
  { id: "1", title: "SITECH 2027 : Inscriptions ouvertes", category: "Événements", author: "Admin", date: "2024-01-20", status: "published" },
  { id: "2", title: "Nouvelle grille salariale 2024", category: "Conventions", author: "Admin", date: "2024-01-18", status: "published" },
  { id: "3", title: "Formation DaVinci Resolve", category: "Formation", author: "Admin", date: "2024-01-15", status: "draft" },
]

const mediaLibrary = [
  { id: "1", name: "hero-banner.jpg", type: "image", size: "2.4 MB", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200" },
  { id: "2", name: "sitech-poster.jpg", type: "image", size: "1.8 MB", url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200" },
  { id: "3", name: "team-photo.jpg", type: "image", size: "3.1 MB", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200" },
]

// Decors/Locations for CMS management
const decorsData = [
  { 
    id: "1", 
    name: "Plateau Business District", 
    city: "Abidjan", 
    category: "Urbain",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400",
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400"
    ],
    posX: 72,
    posY: 78
  },
  { 
    id: "2", 
    name: "Plage d'Assinie", 
    city: "Assinie", 
    category: "Plage",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400"
    ],
    posX: 85,
    posY: 82
  },
  { 
    id: "3", 
    name: "Basilique Notre-Dame", 
    city: "Yamoussoukro", 
    category: "Monument",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400"
    ],
    posX: 55,
    posY: 58
  },
]

// Login Component
function CMSLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError("Email ou mot de passe incorrect")
      setLoading(false)
      return
    }

    // Check if user has CMS access
    const { data: memberData } = await supabase
      .from('members')
      .select('role')
      .eq('email', email)
      .single()

    if (!memberData || !CMS_ALLOWED_ROLES.includes(memberData.role)) {
      setError("Vous n'avez pas acces au CMS")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    onLogin()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-purple-500 rounded-lg p-2">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">RETECHCI</span>
          <span className="text-muted-foreground">| CMS</span>
        </div>

        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Systeme de Gestion de Contenu</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte administrateur
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="cms@retechci.org"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600" disabled={loading}>
                {loading ? "Connexion..." : "Accéder au CMS"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-6">
              <a href="/admin" className="text-primary hover:underline">
                Administration
              </a>
              {" | "}
              <a href="/" className="hover:underline">
                Retour au site
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Card Designer Component
function CardDesigner() {
  const [cardConfig, setCardConfig] = useState({
    primaryColor: "#dc2626",
    secondaryColor: "#1f2937",
    backgroundColor: "#0a0a0a",
    gradientStart: "#dc2626",
    gradientEnd: "#7f1d1d",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iRNTq7lhwYLY9HdNoLXK0QH4OyVrpl.png",
    showQRCode: true,
    borderRadius: "16",
    fontFamily: "Inter"
  })

  const handleSave = () => {
    alert("Design de la carte sauvegardé avec succès !")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Aperçu de la carte
          </CardTitle>
          <CardDescription>Prévisualisation en temps réel</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div 
            className="w-[260px] rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ 
              backgroundColor: cardConfig.backgroundColor,
              borderRadius: `${cardConfig.borderRadius}px`
            }}
          >
            {/* Card Header with gradient */}
            <div 
              className="h-16 relative"
              style={{
                background: `linear-gradient(135deg, ${cardConfig.gradientStart} 0%, ${cardConfig.gradientEnd} 100%)`
              }}
            >
              {/* Logo */}
              <div className="absolute top-3 left-3 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Clapperboard className="h-5 w-5" style={{ color: cardConfig.primaryColor }} />
              </div>
              {/* Org name */}
              <div className="absolute top-3 right-3 text-right">
                <p className="text-[7px] text-white/80 leading-tight">Reseau des Techniciens</p>
                <p className="text-[7px] text-white/80 leading-tight">du Cinema en Cote d&apos;Ivoire</p>
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center -mt-10">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden border-4"
                style={{ borderColor: cardConfig.primaryColor }}
              >
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center mt-3 px-4">
              <h3 className="text-lg font-bold text-white">Nom Membre</h3>
              <p className="text-xs mt-1" style={{ color: cardConfig.primaryColor }}>
                Fonction
              </p>
              <div className="mt-2">
                <span 
                  className="inline-block px-2 py-0.5 rounded-full text-[10px]"
                  style={{ 
                    backgroundColor: `${cardConfig.primaryColor}20`,
                    color: cardConfig.primaryColor
                  }}
                >
                  Membre RETECHCI
                </span>
              </div>
            </div>

            {/* ID Section */}
            <div 
              className="mt-4 p-3"
              style={{ backgroundColor: cardConfig.secondaryColor }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">ID Membre</p>
                  <p className="text-xs font-mono text-white">CI-2024-XXXX</p>
                </div>
                {cardConfig.showQRCode && (
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personnalisation
          </CardTitle>
          <CardDescription>Modifiez les couleurs et le style</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Couleur principale</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={cardConfig.primaryColor}
                  onChange={(e) => setCardConfig({...cardConfig, primaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  value={cardConfig.primaryColor}
                  onChange={(e) => setCardConfig({...cardConfig, primaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Couleur secondaire</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={cardConfig.secondaryColor}
                  onChange={(e) => setCardConfig({...cardConfig, secondaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  value={cardConfig.secondaryColor}
                  onChange={(e) => setCardConfig({...cardConfig, secondaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dégradé début</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={cardConfig.gradientStart}
                  onChange={(e) => setCardConfig({...cardConfig, gradientStart: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  value={cardConfig.gradientStart}
                  onChange={(e) => setCardConfig({...cardConfig, gradientStart: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Dégradé fin</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  type="color" 
                  value={cardConfig.gradientEnd}
                  onChange={(e) => setCardConfig({...cardConfig, gradientEnd: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input 
                  value={cardConfig.gradientEnd}
                  onChange={(e) => setCardConfig({...cardConfig, gradientEnd: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Arrière-plan</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                type="color" 
                value={cardConfig.backgroundColor}
                onChange={(e) => setCardConfig({...cardConfig, backgroundColor: e.target.value})}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={cardConfig.backgroundColor}
                onChange={(e) => setCardConfig({...cardConfig, backgroundColor: e.target.value})}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Arrondi des coins (px)</Label>
            <Input 
              type="range"
              min="0"
              max="32"
              value={cardConfig.borderRadius}
              onChange={(e) => setCardConfig({...cardConfig, borderRadius: e.target.value})}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{cardConfig.borderRadius}px</p>
          </div>

          <div>
            <Label>URL du logo</Label>
            <Input 
              value={cardConfig.logoUrl}
              onChange={(e) => setCardConfig({...cardConfig, logoUrl: e.target.value})}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div>
              <p className="font-medium">Afficher le QR Code</p>
              <p className="text-sm text-muted-foreground">Sur la carte membre</p>
            </div>
            <Switch 
              checked={cardConfig.showQRCode}
              onCheckedChange={(checked) => setCardConfig({...cardConfig, showQRCode: checked})}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le design
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Menu Manager Component with AI Assistant
function MenuManager() {
  const [menuItems, setMenuItems] = useState([
    { id: "1", name: "Accueil", path: "/", visible: true, order: 1 },
    { id: "2", name: "À propos", path: "/a-propos", visible: true, order: 2 },
    { id: "3", name: "Annuaire", path: "/annuaire", visible: true, order: 3 },
    { id: "4", name: "À l'Affiche", path: "/a-laffiche", visible: true, isHighlight: true, order: 4 },
    { id: "5", name: "Actualités", path: "/actualites", visible: true, order: 5 },
    { id: "6", name: "Conventions & Légal", path: "/conventions", visible: true, order: 6 },
    { id: "7", name: "Direct", path: "/direct", visible: true, isLive: true, order: 7 },
    { id: "8", name: "SITECH 2027", path: "/sitech-2027", visible: true, order: 8 },
  ])

  const [newItem, setNewItem] = useState({ name: "", path: "" })
  const [aiInput, setAiInput] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleToggleVisibility = (id: string) => {
    setMenuItems(items => 
      items.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    )
  }

  const handleDelete = (id: string) => {
    setMenuItems(items => items.filter(item => item.id !== id))
  }

  const handleAddItem = () => {
    if (newItem.name && newItem.path) {
      setMenuItems([...menuItems, {
        id: String(Date.now()),
        name: newItem.name,
        path: newItem.path.startsWith('/') ? newItem.path : `/${newItem.path}`,
        visible: true,
        order: menuItems.length + 1
      }])
      setNewItem({ name: "", path: "" })
      setShowAddDialog(false)
    }
  }

  const handleAiImprove = async () => {
    if (!aiInput) return
    setIsAiLoading(true)
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const suggestions: Record<string, string> = {
      "annuaire": "Nos Talents - Découvrez les professionnels du cinéma ivoirien",
      "actualités": "Actu Ciné CI - Les dernières nouvelles du 7ème art en Côte d'Ivoire",
      "conventions": "Cadre Légal - Grilles salariales et conventions collectives",
      "sitech": "SITECH 2027 - Le salon international des technologies du cinéma",
      "direct": "RETECHCI TV - En direct du monde du cinéma",
      "à propos": "Notre Histoire - Le réseau qui unit les techniciens du cinéma",
    }
    
    const lowerInput = aiInput.toLowerCase()
    let suggestion = "Voici quelques suggestions pour améliorer votre contenu :\n\n"
    
    Object.entries(suggestions).forEach(([key, value]) => {
      if (lowerInput.includes(key)) {
        suggestion = value
      }
    })
    
    if (suggestion.startsWith("Voici")) {
      suggestion = `"${aiInput}" pourrait devenir : "${aiInput} - Votre destination pour l'excellence technique du cinéma ivoirien"`
    }
    
    setAiSuggestion(suggestion)
    setIsAiLoading(false)
  }

  const handleSave = () => {
    alert("Menu sauvegardé avec succès !")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Menu Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Structure du menu
              </CardTitle>
              <CardDescription>Gérez les éléments de navigation</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un élément de menu</DialogTitle>
                  <DialogDescription>Créez une nouvelle entrée dans le menu de navigation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nom de la rubrique</Label>
                    <Input 
                      placeholder="Ex: Galerie Photos"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Chemin URL</Label>
                    <Input 
                      placeholder="Ex: /galerie"
                      value={newItem.path}
                      onChange={(e) => setNewItem({...newItem, path: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter au menu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {menuItems.sort((a, b) => a.order - b.order).map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.visible ? 'bg-secondary/30 border-border' : 'bg-secondary/10 border-dashed opacity-60'
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.isLive && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        LIVE
                      </Badge>
                    )}
                    {item.isHighlight && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-amber-500">
                        Highlight
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={item.visible}
                    onCheckedChange={() => handleToggleVisibility(item.id)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button onClick={handleSave} className="w-full mt-4">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le menu
          </Button>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Assistant IA
          </CardTitle>
          <CardDescription>Améliorez vos contenus avec l&apos;intelligence artificielle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-purple-600 dark:text-purple-400">
                  Optimisation de contenu
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Entrez un titre ou une description et l&apos;IA vous proposera des améliorations.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Texte à améliorer</Label>
            <Textarea 
              placeholder="Entrez le nom d'une rubrique, un titre d'article ou une description..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleAiImprove} 
            className="w-full bg-purple-500 hover:bg-purple-600"
            disabled={isAiLoading || !aiInput}
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Améliorer avec l&apos;IA
              </>
            )}
          </Button>

          {aiSuggestion && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">
                    Suggestion
                  </h4>
                  <p className="text-sm">{aiSuggestion}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setAiInput(aiSuggestion)
                      setAiSuggestion("")
                    }}
                  >
                    <Type className="h-3 w-3 mr-1" />
                    Utiliser cette suggestion
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Suggestions rapides</h4>
            <div className="flex flex-wrap gap-2">
              {["Titre accrocheur", "Description SEO", "Call-to-action", "Ton professionnel"].map((suggestion) => (
                <Button 
                  key={suggestion}
                  variant="outline" 
                  size="sm"
                  onClick={() => setAiInput(`Améliorer pour un ${suggestion.toLowerCase()}: ${aiInput || "mon texte"}`)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main CMS Dashboard Component
function CMSDashboard({ onLogout }: { onLogout: () => void }) {
  const [selectedTab, setSelectedTab] = useState("pages")

  const handlePublish = (id: string, type: "page" | "article") => {
    alert(`${type === "page" ? "Page" : "Article"} publié avec succès !`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for CMS */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500 rounded-lg p-1.5">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">CMS RETECHCI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
              <Eye className="h-4 w-4 mr-2" />
              Voir le site
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                <LayoutDashboard className="h-3 w-3 mr-1" />
                Système de Gestion de Contenu
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Gestion du site RETECHCI
            </h1>
            <p className="text-muted-foreground">
              Modifiez le contenu, les pages et les médias du site
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{pages.length}</p>
                    <p className="text-sm text-muted-foreground">Pages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{articles.length}</p>
                    <p className="text-sm text-muted-foreground">Articles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{mediaLibrary.length}</p>
                    <p className="text-sm text-muted-foreground">Médias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">512</p>
                    <p className="text-sm text-muted-foreground">Membres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="about">A propos</TabsTrigger>
              <TabsTrigger value="sitech">SITECH 2027</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="card">Carte Membre</TabsTrigger>
              <TabsTrigger value="decors">Decors CI</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="media">Mediatheque</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
              <TabsTrigger value="branding">Logo & Design</TabsTrigger>
              <TabsTrigger value="settings">Parametres</TabsTrigger>
            </TabsList>

            {/* Pages Tab */}
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Pages</CardTitle>
                      <CardDescription>Modifiez le contenu des pages du site</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          {page.id === "home" ? <Home className="h-5 w-5 text-blue-500" /> :
                           page.id === "about" ? <Info className="h-5 w-5 text-blue-500" /> :
                           page.id === "news" ? <Newspaper className="h-5 w-5 text-blue-500" /> :
                           page.id === "sitech" ? <CalendarDays className="h-5 w-5 text-blue-500" /> :
                           page.id === "affiche" ? <Star className="h-5 w-5 text-blue-500" /> :
                           page.id === "directory" ? <Building2 className="h-5 w-5 text-blue-500" /> :
                           page.id === "adhesion" ? <UserPlus className="h-5 w-5 text-blue-500" /> :
                           <FileText className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{page.name}</h4>
                            <Badge variant={page.status === "published" ? "default" : "secondary"} className="text-xs">
                              {page.status === "published" ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{page.path}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground hidden md:block">
                          <p>Mis à jour le</p>
                          <p>{new Date(page.lastUpdated).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(page.path, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {page.status === "draft" && (
                            <Button size="sm" onClick={() => handlePublish(page.id, "page")}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Publier
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* A propos Tab - Bureau & Conseil d'Administration */}
            <TabsContent value="about">
              <div className="space-y-6">
                {/* Bureau Executif */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Bureau Executif</CardTitle>
                        <CardDescription>Gerez les membres du bureau executif</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Daouda Coulibaly", role: "Directeur Executif", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
                        { name: "Aminata Diallo", role: "Directrice Adjointe", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
                        { name: "Kouame Assi", role: "Secretaire General", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
                      ].map((member, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image src={member.photo} alt={member.name} width={48} height={48} className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Conseil d'Administration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Conseil d&apos;Administration</CardTitle>
                        <CardDescription>Gerez les membres du CA</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Mamadou Traore", role: "President du CA", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" },
                        { name: "Fatoumata Kone", role: "Vice-Presidente", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" },
                        { name: "Ibrahim Sangare", role: "Tresorier", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100" },
                        { name: "Mariam Bamba", role: "Tresoriere Adjointe", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
                      ].map((member, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image src={member.photo} alt={member.name} width={48} height={48} className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Texte de presentation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Texte de presentation (avec IA)
                    </CardTitle>
                    <CardDescription>Modifiez le texte de la page A propos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Titre principal</Label>
                      <Input defaultValue="A propos du RETECHCI" className="mt-1" />
                    </div>
                    <div>
                      <Label>Notre mission</Label>
                      <Textarea 
                        rows={4}
                        defaultValue="Le Reseau des Techniciens du Cinema en Cote d'Ivoire (RETECHCI) est une organisation professionnelle qui regroupe les techniciens du cinema et de l'audiovisuel. Notre mission est de promouvoir l'excellence technique, defendre les droits des professionnels et contribuer au developpement de l'industrie cinematographique ivoirienne."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Notre histoire</Label>
                      <Textarea 
                        rows={4}
                        defaultValue="Fonde en 2018, le RETECHCI est ne de la volonte de techniciens passionnes de structurer et professionnaliser le secteur. Depuis, nous avons grandi pour devenir la reference en matiere de representation des professionnels techniques du cinema en Cote d'Ivoire."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-purple-500 hover:bg-purple-600">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Ameliorer avec IA
                      </Button>
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SITECH 2027 Tab */}
            <TabsContent value="sitech">
              <div className="space-y-6">
                {/* Event Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations generales - SITECH 2027</CardTitle>
                    <CardDescription>Modifiez les informations de l&apos;evenement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nom de l&apos;evenement</Label>
                        <Input defaultValue="SITECH 2027" className="mt-1" />
                      </div>
                      <div>
                        <Label>Sous-titre</Label>
                        <Input defaultValue="Salon International des Technologies" className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Dates</Label>
                        <Input defaultValue="15-17 Decembre 2027" className="mt-1" />
                      </div>
                      <div>
                        <Label>Lieu</Label>
                        <Input defaultValue="Sofitel Hotel Ivoire" className="mt-1" />
                      </div>
                      <div>
                        <Label>Ville</Label>
                        <Input defaultValue="Abidjan, Cote d'Ivoire" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        defaultValue="L'evenement phare des technologies de l'Image et du Son en Afrique de l'Ouest"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tarifs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tarifs d&apos;inscription</CardTitle>
                        <CardDescription>Gerez les prix des differentes categories</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categorie</Label>
                          <p className="font-medium">Participant - Etudiant</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prix (FCFA)</Label>
                          <Input defaultValue="15000" className="mt-1" />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categorie</Label>
                          <p className="font-medium">Participant - Professionnel</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prix (FCFA)</Label>
                          <Input defaultValue="45000" className="mt-1" />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categorie</Label>
                          <p className="font-medium">Participant - VIP</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prix (FCFA)</Label>
                          <Input defaultValue="150000" className="mt-1" />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div>
                          <Label className="text-xs text-muted-foreground">Categorie</Label>
                          <p className="font-medium">Exposant - Stand Standard</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Prix (FCFA)</Label>
                          <Input defaultValue="250000" className="mt-1" />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Galerie Photos */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Galerie photos - Editions precedentes</CardTitle>
                        <CardDescription>Gerez les photos des editions passees</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter des photos
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden group">
                          <Image
                            src={`https://images.unsplash.com/photo-154057506306${i}-178a50c2df87?w=300`}
                            alt={`Photo ${i}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary"><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <Badge className="absolute top-2 left-2 bg-black/70 text-xs">2024</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Videos YouTube */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Videos YouTube</CardTitle>
                        <CardDescription>Liens vers les videos des programmes</CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une video
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "SITECH 2024 - Film Officiel", url: "https://youtube.com/watch?v=xxx", year: "2024" },
                        { title: "Masterclass Sony VENICE", url: "https://youtube.com/watch?v=yyy", year: "2024" },
                        { title: "Panel Financement Cinema", url: "https://youtube.com/watch?v=zzz", year: "2023" },
                      ].map((video, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.url}</p>
                          </div>
                          <Badge variant="outline">{video.year}</Badge>
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Assistant IA - Contenu SITECH
                    </CardTitle>
                    <CardDescription>Generez du contenu pour l&apos;evenement avec l&apos;IA</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Ex: Redige une description attractive pour le panel sur le financement du cinema africain..."
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      {["Description evenement", "Programme conference", "Email invitation", "Post reseaux sociaux"].map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-purple-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generer avec l&apos;IA
                    </Button>
                  </CardContent>
                </Card>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder toutes les modifications
                </Button>
              </div>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu">
              <MenuManager />
            </TabsContent>

            {/* Card Designer Tab */}
            <TabsContent value="card">
              <CardDesigner />
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Articles</CardTitle>
                      <CardDescription>Créez et modifiez les actualités</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvel article
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div key={article.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{article.title}</h4>
                            <Badge variant={article.status === "published" ? "default" : "secondary"} className="text-xs">
                              {article.status === "published" ? "Publié" : "Brouillon"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{article.category}</span>
                            <span>Par {article.author}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Decors Tab */}
            <TabsContent value="decors">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Decors</CardTitle>
                      <CardDescription>Gerez les lieux de tournage sur la carte de Cote d&apos;Ivoire</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un decor
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Ajouter un nouveau decor</DialogTitle>
                          <DialogDescription>Configurez les details du lieu de tournage</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nom du lieu</Label>
                              <Input placeholder="Ex: Plateau Business District" />
                            </div>
                            <div className="space-y-2">
                              <Label>Ville</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selectionnez une ville" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="abidjan">Abidjan</SelectItem>
                                  <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
                                  <SelectItem value="bouake">Bouake</SelectItem>
                                  <SelectItem value="grand-bassam">Grand-Bassam</SelectItem>
                                  <SelectItem value="assinie">Assinie</SelectItem>
                                  <SelectItem value="man">Man</SelectItem>
                                  <SelectItem value="korhogo">Korhogo</SelectItem>
                                  <SelectItem value="san-pedro">San-Pedro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Categorie</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Type de decor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="urban">Urbain / Moderne</SelectItem>
                                  <SelectItem value="beach">Plage / Littoral</SelectItem>
                                  <SelectItem value="nature">Nature / Foret</SelectItem>
                                  <SelectItem value="historical">Historique / Colonial</SelectItem>
                                  <SelectItem value="traditional">Traditionnel / Village</SelectItem>
                                  <SelectItem value="monument">Monument / Religieux</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Statut</Label>
                              <Select defaultValue="active">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Actif</SelectItem>
                                  <SelectItem value="inactive">Inactif</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Decrivez le lieu et ses caracteristiques pour le tournage..." rows={3} />
                          </div>
                          
                          {/* Position on Map */}
                          <div className="space-y-2">
                            <Label>Position sur la carte</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Position X (0-100)</Label>
                                <Input type="number" min="0" max="100" placeholder="Ex: 72" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Position Y (0-100)</Label>
                                <Input type="number" min="0" max="100" placeholder="Ex: 78" />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Calibrez la position de l&apos;icone sur la carte (0,0 = coin superieur gauche)
                            </p>
                          </div>

                          {/* Images */}
                          <div className="space-y-2">
                            <Label>Photos du lieu</Label>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Photo 1</span>
                              </div>
                              <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Ajoutez plusieurs photos pour presenter le lieu sous differents angles
                            </p>
                          </div>
                          <Button className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer le decor
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {decorsData.map((decor) => (
                      <div key={decor.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={decor.images[0]}
                            alt={decor.name}
                            fill
                            className="object-cover"
                          />
                          {decor.images.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              +{decor.images.length - 1}
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{decor.name}</h4>
                            <Badge variant={decor.status === "active" ? "default" : "secondary"} className="text-xs">
                              {decor.status === "active" ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {decor.city}
                            </span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              {decor.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>Position: X={decor.posX}, Y={decor.posY}</span>
                            <span>|</span>
                            <span>{decor.images.length} photo(s)</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map Preview */}
                  <div className="mt-6 p-4 bg-secondary/20 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Apercu de la carte
                    </h4>
                    <div className="relative aspect-[4/3] bg-background rounded-lg border border-border overflow-hidden">
                      {/* Simplified map preview */}
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path
                          d="M 15 10 L 25 8 L 40 5 L 55 8 L 70 12 L 85 18 L 88 25 L 85 35 L 82 45 L 80 55 L 82 65 L 85 75 L 80 85 L 70 88 L 60 85 L 50 88 L 40 90 L 30 88 L 20 82 L 15 70 L 12 55 L 10 40 L 12 25 L 15 10 Z"
                          fill="#262626"
                          stroke="#f97316"
                          strokeWidth="0.5"
                        />
                        {decorsData.map((decor) => (
                          <g key={decor.id}>
                            <circle
                              cx={decor.posX}
                              cy={decor.posY}
                              r="3"
                              fill="#f97316"
                              className="cursor-pointer"
                            />
                            <text
                              x={decor.posX}
                              y={decor.posY - 5}
                              fontSize="3"
                              fill="#a3a3a3"
                              textAnchor="middle"
                            >
                              {decor.name.substring(0, 10)}...
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Les positions des decors sont affichees sur cette carte. Modifiez X et Y pour ajuster le placement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Médiathèque</CardTitle>
                      <CardDescription>Gérez les images et fichiers</CardDescription>
                    </div>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter un média
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mediaLibrary.map((media) => (
                      <div key={media.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border">
                        <Image
                          src={media.url}
                          alt={media.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                          <p className="text-white text-xs text-center truncate w-full">{media.name}</p>
                          <p className="text-white/70 text-xs">{media.size}</p>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Glisser-déposer</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Contenus Membres</CardTitle>
                  <CardDescription>Technicien du mois, profils mis en avant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-4">Technicien du mois - Janvier 2024</h3>
                    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                          alt="Technicien du mois"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="font-bold">Jamel Basiru</h4>
                        <p className="text-sm text-muted-foreground">Monteur Image</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Changer
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">Talents à la une (Accueil)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Les profils sont automatiquement sélectionnés en fonction de l&apos;activité des membres.
                    </p>
                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <p className="text-sm flex-1">
                        Sélection automatique basée sur le score d&apos;activité des membres.
                      </p>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logo & Design Tab */}
            <TabsContent value="branding">
              <div className="space-y-6">
                {/* Logo et Identite */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clapperboard className="h-5 w-5 text-primary" />
                      Logo et Identite
                    </CardTitle>
                    <CardDescription>Modifiez le logo et l&apos;identite visuelle du site</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Logo principal</Label>
                        <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
                          <div className="w-32 h-32 mx-auto bg-black rounded-xl flex items-center justify-center mb-4">
                            <Image 
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iRNTq7lhwYLY9HdNoLXK0QH4OyVrpl.png"
                              alt="Logo RETECHCI"
                              width={100}
                              height={100}
                              className="object-contain"
                            />
                          </div>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Changer le logo
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Favicon</Label>
                        <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center">
                          <div className="w-16 h-16 mx-auto bg-black rounded-lg flex items-center justify-center mb-4">
                            <Clapperboard className="h-8 w-8 text-primary" />
                          </div>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Changer le favicon
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du site</Label>
                        <Input defaultValue="RETECHCI" className="mt-1" />
                      </div>
                      <div>
                        <Label>Slogan</Label>
                        <Input defaultValue="Reseau des Techniciens du Cinema en Cote d'Ivoire" className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typographie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="h-5 w-5" />
                      Typographie
                    </CardTitle>
                    <CardDescription>Personnalisez les polices du site</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Police des titres</Label>
                        <Select defaultValue="inter">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="playfair">Playfair Display</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Police du texte</Label>
                        <Select defaultValue="inter">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="opensans">Open Sans</SelectItem>
                            <SelectItem value="lato">Lato</SelectItem>
                            <SelectItem value="nunito">Nunito</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <h4 className="font-bold text-lg mb-2">Apercu de la typographie</h4>
                      <p className="text-muted-foreground">
                        Ceci est un exemple de texte pour visualiser le rendu des polices choisies sur le site.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Couleurs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Palette de couleurs
                    </CardTitle>
                    <CardDescription>Definissez les couleurs principales du site</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Couleur principale</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" defaultValue="#dc2626" className="w-12 h-10 p-1 cursor-pointer" />
                          <Input defaultValue="#dc2626" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Couleur secondaire</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" defaultValue="#f97316" className="w-12 h-10 p-1 cursor-pointer" />
                          <Input defaultValue="#f97316" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Arriere-plan</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" defaultValue="#0a0a0a" className="w-12 h-10 p-1 cursor-pointer" />
                          <Input defaultValue="#0a0a0a" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Accent</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="color" defaultValue="#a855f7" className="w-12 h-10 p-1 cursor-pointer" />
                          <Input defaultValue="#a855f7" className="flex-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assistant IA pour fonctionnalites */}
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Assistant IA - Developpement
                    </CardTitle>
                    <CardDescription>Demandez a l&apos;IA de creer ou modifier des fonctionnalites</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                      <p className="text-sm text-purple-200">
                        Decrivez la fonctionnalite que vous souhaitez ajouter ou modifier, et l&apos;IA vous aidera a la concevoir.
                      </p>
                    </div>
                    <Textarea 
                      placeholder="Ex: Je voudrais ajouter une galerie photo sur la page d'accueil avec un effet de diaporama..."
                      rows={4}
                    />
                    <div className="flex flex-wrap gap-2">
                      {["Nouvelle page", "Formulaire", "Animation", "Integration", "Modification design"].map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-purple-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generer avec l&apos;IA
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du site</CardTitle>
                    <CardDescription>Parametres generaux</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nom du site</Label>
                      <Input defaultValue="RETECHCI" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea defaultValue="Réseau des Techniciens du Cinéma en Côte d'Ivoire" />
                    </div>
                    <div>
                      <Label>Email de contact</Label>
                      <Input defaultValue="contact@retechci.ci" />
                    </div>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Réseaux sociaux</CardTitle>
                    <CardDescription>Liens des réseaux sociaux</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Facebook</Label>
                      <Input defaultValue="https://facebook.com/retechci" />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input defaultValue="https://instagram.com/retechci" />
                    </div>
                    <div>
                      <Label>Twitter / X</Label>
                      <Input defaultValue="https://twitter.com/retechci" />
                    </div>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Options d&apos;affichage</CardTitle>
                    <CardDescription>Personnalisez l&apos;apparence du site</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <h4 className="font-medium">Mode sombre par défaut</h4>
                          <p className="text-sm text-muted-foreground">Activer le thème sombre par défaut</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <h4 className="font-medium">Popup Anniversaires</h4>
                          <p className="text-sm text-muted-foreground">Afficher les anniversaires du jour</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <h4 className="font-medium">Newsletter</h4>
                          <p className="text-sm text-muted-foreground">Activer le formulaire newsletter</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                        <div>
                          <h4 className="font-medium">Maintenance</h4>
                          <p className="text-sm text-muted-foreground">Mettre le site en maintenance</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Main Export with Auth Check
export default function CMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has CMS access
        const { data: memberData } = await supabase
          .from('members')
          .select('role')
          .eq('email', user.email)
          .single()
        
        if (memberData && CMS_ALLOWED_ROLES.includes(memberData.role)) {
          setIsAuthenticated(true)
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <CMSLogin onLogin={handleLogin} />
  }

  return <CMSDashboard onLogout={handleLogout} />
}
