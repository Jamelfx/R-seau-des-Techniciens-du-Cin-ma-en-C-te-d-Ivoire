"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clapperboard, Lock, User, AlertCircle, UserCog, Crown, Wallet, Shield } from "lucide-react"
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
  { value: "directeur", label: "Directeur Exécutif", description: "Gestion des membres, adhésions et opérations", icon: <UserCog className="h-6 w-6" />, dbRole: "director", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-300" },
  { value: "president", label: "Président du CA", description: "Validation des adhésions, convocation AG", icon: <Crown className="h-6 w-6" />, dbRole: "president", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-300" },
  { value: "tresorier", label: "Trésorière", description: "Gestion financière et cotisations", icon: <Wallet className="h-6 w-6" />, dbRole: "treasurer", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-300" },
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
      // If member not found but auth succeeded, allow login anyway
      const { error: signOutError } = await supabase.auth.signOut()
      setError("Authentification réussie mais votre email n'est pas dans la table des membres. Contactez le Directeur.")
      setLoading(false)
      return
    }

    const allowedRoles: Record<AdminRole, string[]> = {
      directeur: ["director"],
      president: ["president"],
      tresorier: ["treasurer"]
    }

    if (!allowedRoles[selectedRole].includes(memberData.role || "member")) {
      setError(`Vous n'avez pas les droits pour le rôle ${currentRole.label}. Votre rôle : ${memberData.role || 'membre'}.`)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Store admin info
    sessionStorage.setItem("adminRole", selectedRole)
    sessionStorage.setItem("adminEmail", email)
    sessionStorage.setItem("adminName", `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim())

    router.push(`/admin/${selectedRole}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link href="/" className="flex flex-col items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Clapperboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">RETECHCI</span>
            </div>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-300 px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Espace Administration
            </Badge>
          </Link>

          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Espace Administration</CardTitle>
              <CardDescription>Sélectionnez votre rôle et connectez-vous</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {adminRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      selectedRole === role.value
                        ? `${role.bgColor} ${role.borderColor} ${role.color}`
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {role.icon}
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">{currentRole.description}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    `Se connecter en tant que ${currentRole.label}`
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                Contactez le Directeur Exécutif si vous avez oublié vos identifiants.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4 text-sm">
            <Link href="/connexion" className="text-muted-foreground hover:text-foreground transition-colors">Espace Membre</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
