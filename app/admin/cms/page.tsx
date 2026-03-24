"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Users, Settings,
  Plus, Edit, Trash2, Eye, Save, Upload, LogOut, Globe,
  Home, Info, Newspaper, CalendarDays, Star, Building2,
  CheckCircle, AlertCircle, RefreshCw, Lock, User, Clapperboard
} from "lucide-react"
import Image from "next/image"

// CMS credentials
const CMS_CREDENTIALS = {
  email: "cms@retechci.org",
  password: "cms2024"
}

// CMS Content Types
const pages = [
  { id: "home", name: "Accueil", path: "/", lastUpdated: "2024-01-20", status: "published" },
  { id: "about", name: "À propos", path: "/a-propos", lastUpdated: "2024-01-18", status: "published" },
  { id: "directory", name: "Annuaire", path: "/annuaire", lastUpdated: "2024-01-15", status: "published" },
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

// Login Component
function CMSLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    if (email === CMS_CREDENTIALS.email && password === CMS_CREDENTIALS.password) {
      sessionStorage.setItem("cmsAuth", "true")
      onLogin()
    } else {
      setError("Email ou mot de passe incorrect")
    }

    setLoading(false)
  }

  const fillCredentials = () => {
    setEmail(CMS_CREDENTIALS.email)
    setPassword(CMS_CREDENTIALS.password)
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
            <CardTitle className="text-2xl">Système de Gestion de Contenu</CardTitle>
            <CardDescription>
              Connectez-vous pour gérer le site web
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

              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Identifiants CMS :
                </p>
                <p className="text-xs font-mono">{CMS_CREDENTIALS.email}</p>
                <p className="text-xs font-mono">Mot de passe: {CMS_CREDENTIALS.password}</p>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-xs p-0 h-auto mt-1 text-purple-600 dark:text-purple-400"
                  onClick={fillCredentials}
                >
                  Remplir automatiquement
                </Button>
              </div>

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

        <p className="text-xs text-center text-muted-foreground mt-4">
          Accès réservé aux administrateurs du site RETECHCI
        </p>
      </div>
    </div>
  )
}

// Main CMS Dashboard Component
function CMSDashboard({ onLogout }: { onLogout: () => void }) {
  const [selectedTab, setSelectedTab] = useState("pages")
  const [editingPage, setEditingPage] = useState<string | null>(null)

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
            <TabsList>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="media">Médiathèque</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
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
                          <Button size="sm" variant="outline" onClick={() => setEditingPage(page.id)}>
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
                            <span>•</span>
                            <span>Par {article.author}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des Contenus Membres</CardTitle>
                      <CardDescription>Technicien du mois, profils mis en avant</CardDescription>
                    </div>
                  </div>
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

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du site</CardTitle>
                    <CardDescription>Paramètres généraux</CardDescription>
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
                    <div>
                      <Label>Téléphone</Label>
                      <Input defaultValue="+225 07 XX XX XX" />
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
                    <div>
                      <Label>LinkedIn</Label>
                      <Input defaultValue="https://linkedin.com/company/retechci" />
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
                          <h4 className="font-medium">Afficher RETECHCI TV</h4>
                          <p className="text-sm text-muted-foreground">Section direct en page d&apos;accueil</p>
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

  useEffect(() => {
    const authStatus = sessionStorage.getItem("cmsAuth")
    setIsAuthenticated(authStatus === "true")
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("cmsAuth")
    setIsAuthenticated(false)
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
