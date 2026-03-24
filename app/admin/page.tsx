"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clapperboard, Lock, User, AlertCircle } from "lucide-react"
import Link from "next/link"

type AdminRole = "directeur" | "president" | "tresorier"

const adminRoles: { value: AdminRole; label: string; description: string }[] = [
  { value: "directeur", label: "Directeur Exécutif", description: "Gestion des membres, adhésions, et opérations" },
  { value: "president", label: "Président du CA", description: "Validation des adhésions, convocation AG" },
  { value: "tresorier", label: "Trésorière", description: "Gestion financière et cotisations" },
]

// Demo credentials for testing
const demoCredentials: Record<AdminRole, { email: string; password: string }> = {
  directeur: { email: "directeur@retechci.org", password: "demo123" },
  president: { email: "president@retechci.org", password: "demo123" },
  tresorier: { email: "tresorier@retechci.org", password: "demo123" },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<AdminRole | "">("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (!role) {
      setError("Veuillez sélectionner votre rôle")
      setLoading(false)
      return
    }

    // Demo authentication - in production, this would validate against Supabase
    const creds = demoCredentials[role]
    if (email === creds.email && password === creds.password) {
      // Store auth in session storage for demo
      sessionStorage.setItem("adminRole", role)
      sessionStorage.setItem("adminEmail", email)
      router.push(`/admin/${role}`)
    } else {
      setError("Email ou mot de passe incorrect")
    }

    setLoading(false)
  }

  const fillDemoCredentials = () => {
    if (role) {
      const creds = demoCredentials[role]
      setEmail(creds.email)
      setPassword(creds.password)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary rounded-lg p-2">
            <Clapperboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">RETECHCI</span>
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Espace Administration</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à votre tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Rôle administrateur</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{r.label}</span>
                          <span className="text-xs text-muted-foreground">{r.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@retechci.org"
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
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>

              {/* Demo Credentials Helper */}
              {role && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Identifiants de démonstration :</p>
                  <p className="text-xs font-mono text-foreground">{demoCredentials[role].email}</p>
                  <p className="text-xs font-mono text-foreground">Mot de passe: demo123</p>
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="text-xs p-0 h-auto mt-2"
                    onClick={fillDemoCredentials}
                  >
                    Remplir automatiquement
                  </Button>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Cet espace est réservé aux administrateurs du RETECHCI.
                <br />
                <Link href="/connexion" className="text-primary hover:underline">
                  Espace membre
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Link href="/admin/directeur" className="text-center p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <span className="text-xs text-muted-foreground block">Directeur</span>
            <span className="text-xs text-foreground font-medium">Accès rapide</span>
          </Link>
          <Link href="/admin/president" className="text-center p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <span className="text-xs text-muted-foreground block">Président</span>
            <span className="text-xs text-foreground font-medium">Accès rapide</span>
          </Link>
          <Link href="/admin/tresorier" className="text-center p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            <span className="text-xs text-muted-foreground block">Trésorière</span>
            <span className="text-xs text-foreground font-medium">Accès rapide</span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
