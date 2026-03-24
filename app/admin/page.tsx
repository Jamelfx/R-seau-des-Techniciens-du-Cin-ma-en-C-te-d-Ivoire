"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clapperboard, Lock, User, AlertCircle, UserCog, Crown, Wallet } from "lucide-react"
import Link from "next/link"

type AdminRole = "directeur" | "president" | "tresorier"

const adminRoles: { 
  value: AdminRole
  label: string
  description: string
  icon: React.ReactNode
  email: string
  password: string
}[] = [
  { 
    value: "directeur", 
    label: "Directeur Exécutif", 
    description: "Gestion des membres, adhésions et opérations",
    icon: <UserCog className="h-6 w-6" />,
    email: "directeur@retechci.org",
    password: "admin123"
  },
  { 
    value: "president", 
    label: "Président du CA", 
    description: "Validation des adhésions, convocation AG",
    icon: <Crown className="h-6 w-6" />,
    email: "president@retechci.org",
    password: "admin123"
  },
  { 
    value: "tresorier", 
    label: "Trésorière", 
    description: "Gestion financière et cotisations",
    icon: <Wallet className="h-6 w-6" />,
    email: "tresorier@retechci.org",
    password: "admin123"
  },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<AdminRole>("directeur")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const currentRole = adminRoles.find(r => r.value === selectedRole)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check credentials
    if (email === currentRole.email && password === currentRole.password) {
      sessionStorage.setItem("adminRole", selectedRole)
      sessionStorage.setItem("adminEmail", email)
      router.push(`/admin/${selectedRole}`)
    } else {
      setError("Email ou mot de passe incorrect")
    }

    setLoading(false)
  }

  const fillCredentials = () => {
    setEmail(currentRole.email)
    setPassword(currentRole.password)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary rounded-lg p-2">
            <Clapperboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">RETECHCI</span>
          <span className="text-muted-foreground">| Admin</span>
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Espace Administration</CardTitle>
            <CardDescription>
              Sélectionnez votre rôle et connectez-vous
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Role Selection Tabs */}
            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as AdminRole)} className="mb-6">
              <TabsList className="grid grid-cols-3 w-full">
                {adminRoles.map((role) => (
                  <TabsTrigger 
                    key={role.value} 
                    value={role.value}
                    className="text-xs px-2"
                  >
                    {role.label.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {adminRoles.map((role) => (
                <TabsContent key={role.value} value={role.value} className="mt-4">
                  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg mb-4">
                    <div className="p-3 bg-primary/20 rounded-lg text-primary">
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={currentRole.email}
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
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

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Demo Credentials */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                  Identifiants de démonstration :
                </p>
                <p className="text-xs font-mono">{currentRole.email}</p>
                <p className="text-xs font-mono">Mot de passe: admin123</p>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-xs p-0 h-auto mt-1 text-amber-600 dark:text-amber-400"
                  onClick={fillCredentials}
                >
                  Remplir automatiquement
                </Button>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : `Se connecter en tant que ${currentRole.label}`}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Accès direct aux dashboards (mode démo)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Link href="/admin/directeur">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Directeur
                  </Button>
                </Link>
                <Link href="/admin/president">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Président
                  </Button>
                </Link>
                <Link href="/admin/tresorier">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Trésorière
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              <Link href="/connexion" className="text-primary hover:underline">
                Espace membre
              </Link>
              {" | "}
              <Link href="/" className="hover:underline">
                Retour à l'accueil
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
