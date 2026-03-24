"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ConnexionPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const supabase = createClient()
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.identifier,
      password: formData.password,
    })

    if (signInError) {
      setError(signInError.message === "Invalid login credentials" 
        ? "Identifiants incorrects. Veuillez réessayer."
        : signInError.message)
      setIsLoading(false)
      return
    }

    // Get user role to redirect appropriately
    const role = data.user?.user_metadata?.role || "member"

    if (role === "director") {
      router.push("/admin/directeur")
    } else if (role === "president") {
      router.push("/admin/president")
    } else if (role === "treasurer") {
      router.push("/admin/tresorier")
    } else {
      router.push("/membre/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace membre RETECHCI
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <Link href="/mot-de-passe-oublie" className="text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore membre ?{" "}
                <Link href="/adhesion" className="text-primary hover:underline font-medium">
                  Faire une demande d'adhésion
                </Link>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/admin" className="block">
                <Button variant="outline" className="w-full text-sm">
                  Accès Administration
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                En vous connectant, vous acceptez les{" "}
                <Link href="/conventions" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link href="/conventions" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>{" "}
                du RETECHCI.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}
