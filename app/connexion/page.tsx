"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ConnexionPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login - in production, this would be an API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/membre/dashboard")
    }, 1500)
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Identifiant ou Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="CI-2024-XXXX ou email@exemple.com"
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
