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
import { createClient } from "@/lib/supabase/client"

type AdminRole = "directeur" | "president" | "tresorier"

const adminRoles: { 
  value: AdminRole
  label: string
  description: string
  icon: React.ReactNode
  dbRole: string
}[] = [
  { 
    value: "directeur", 
    label: "Directeur Executif", 
    description: "Gestion des membres, adhesions et operations",
    icon: <UserCog className="h-6 w-6" />,
    dbRole: "director"
  },
  { 
    value: "president", 
    label: "President du CA", 
    description: "Validation des adhesions, convocation AG",
    icon: <Crown className="h-6 w-6" />,
    dbRole: "president"
  },
  { 
    value: "tresorier", 
    label: "Tresoriere", 
    description: "Gestion financiere et cotisations",
    icon: <Wallet className="h-6 w-6" />,
    dbRole: "treasurer"
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

    const supabase = createClient()

    // Authenticate with Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message === "Invalid login credentials" 
        ? "Email ou mot de passe incorrect"
        : signInError.message)
      setLoading(false)
      return
    }

    // Check if user has the correct role in the members table
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('role, first_name, last_name')
      .eq('email', email)
      .single()

    if (memberError || !memberData) {
      setError("Compte non trouve. Verifiez vos identifiants.")
      setLoading(false)
      return
    }

    // Check if the user role matches the selected admin role
    const allowedRoles = {
      directeur: ["director"],
      president: ["president"],
      tresorier: ["treasurer"]
    }

    if (!allowedRoles[selectedRole].includes(memberData.role)) {
      setError(`Vous n'avez pas les droits d'acces pour le role ${currentRole.label}`)
      // Sign out the user since they don't have the right role
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Store admin info in sessionStorage
    sessionStorage.setItem("adminRole", selectedRole)
    sessionStorage.setItem("adminEmail", email)
    sessionStorage.setItem("adminName", `${memberData.first_name} ${memberData.last_name}`)

    // Redirect to the appropriate dashboard
    router.push(`/admin/${selectedRole}`)
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
              Selectionnez votre role et connectez-vous
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
                    placeholder="votre.email@retechci.org"
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

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  `Se connecter en tant que ${currentRole.label}`
                )}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Contactez le Directeur Executif si vous avez oublie vos identifiants.
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              <Link href="/connexion" className="text-primary hover:underline">
                Espace membre
              </Link>
              {" | "}
              <Link href="/" className="hover:underline">
                Retour a l&apos;accueil
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
