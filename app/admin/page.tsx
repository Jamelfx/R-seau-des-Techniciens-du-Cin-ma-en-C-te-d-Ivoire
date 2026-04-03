"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clapperboard, Lock, User, AlertCircle, UserCog, Crown, Wallet, ChevronRight, ArrowRightLeft, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type AdminRole = "directeur" | "president" | "tresorier"

const adminRoles: { 
  value: AdminRole
  label: string
  description: string
  icon: React.ReactNode
  dbRole: string
  color: string
  bgColor: string
  borderColor: string
}[] = [
  { 
    value: "directeur", 
    label: "Directeur Exécutif", 
    description: "Gestion des membres, adhésions et opérations",
    icon: <UserCog className="h-6 w-6" />,
    dbRole: "director",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300"
  },
  { 
    value: "president", 
    label: "Président du CA", 
    description: "Validation des adhésions, convocation AG",
    icon: <Crown className="h-6 w-6" />,
    dbRole: "president",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300"
  },
  { 
    value: "tresorier", 
    label: "Trésorière", 
    description: "Gestion financière et cotisations",
    icon: <Wallet className="h-6 w-6" />,
    dbRole: "treasurer",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300"
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
      setError("Compte non trouvé. Vérifiez vos identifiants.")
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
      setError(`Vous n'avez pas les droits d'accès pour le rôle ${currentRole.label}`)
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
    <div className="min-h-screen bg-background flex flex-col">

      {/* ═══════════════════════════════════════════════════════════════
          ✅ BANDEAU COLORÉ — Rose/Orange/Amber pour Admin
          ═══════════════════════════════════════════════════════════════ */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Logo avec badge Admin */}
          <Link href="/" className="flex flex-col items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Clapperboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">RETECHCI</span>
            </div>
            {/* ✅ BADGE Admin + distinction visuelle */}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-300 px-3 py-1">
                <Shield className="h-3.5 w-3.5 mr-1" />
                Espace Administration
              </Badge>
            </div>
          </Link>

          {/* ✅ BANNIÈRE D'INFO — Lien vers espace Membre */}
          <div className="mb-5 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">
                Vous êtes aussi <strong>Membre</strong> ?
              </p>
            </div>
            <Link href="/connexion">
              <Button variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 text-xs gap-1">
                Aller à l&apos;Espace Membre
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Espace Administration</CardTitle>
              <CardDescription>
                Sélectionnez votre rôle et connectez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">

              {/* ═══════════════════════════════════════════════════════════════
                  ✅ ONGLETS AVEC SURBRILLANCE ACTIVE — Custom tabs
                  ═══════════════════════════════════════════════════════════════ */}
              <div className="mb-6">
                <div className="grid grid-cols-3 w-full bg-secondary/40 rounded-lg p-1 gap-1">
                  {adminRoles.map((role) => {
                    const isActive = selectedRole === role.value
                    return (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`
                          relative flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium transition-all duration-200
                          ${isActive
                            ? `bg-background text-foreground shadow-sm ${role.borderColor} border rounded-md`
                            : 'text-muted-foreground hover:text-foreground/80 hover:bg-background/50'
                          }
                        `}
                      >
                        {isActive && (
                          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${
                            role.value === 'directeur' ? 'bg-amber-500' :
                            role.value === 'president' ? 'bg-purple-500' : 'bg-emerald-500'
                          }`} />
                        )}
                        <span className={isActive ? role.color : ''}>
                          {role.icon}
                        </span>
                        <span className={isActive ? 'font-bold' : ''}>
                          {role.label.split(' ')[0]}
                        </span>
                        {isActive && (
                          <ChevronRight className={`h-3 w-3 ${role.color} -rotate-90 absolute bottom-0.5`} />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Description du rôle sélectionné */}
                {adminRoles.map((role) => selectedRole === role.value && (
                  <div key={role.value} className={`flex items-center gap-4 p-4 ${role.bgColor} ${role.borderColor} border rounded-lg mt-3`}>
                    <div className={`p-3 ${role.bgColor} rounded-lg ${role.color}`}>
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>

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
                    <span className="flex items-center gap-2">
                      Se connecter en tant que {currentRole.label}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Contactez le Directeur Exécutif si vous avez oublié vos identifiants.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4 text-xs text-muted-foreground">
                <Link href="/connexion" className="text-primary hover:underline flex items-center gap-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  Espace membre
                </Link>
                <span className="text-border">|</span>
                <Link href="/" className="hover:underline">
                  Retour à l&apos;accueil
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} RETECHCI — Espace Administration
        </p>
      </footer>
    </div>
  )
}
