"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clapperboard, Lock, User, AlertCircle, UserCog, Crown, Wallet, Shield, Mail, ArrowRight } from "lucide-react"
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
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const currentRole = adminRoles.find(r => r.value === selectedRole)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()

    // Check if user has the correct role before sending magic link
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('role, first_name, last_name')
      .eq('email', email)
      .single()

    if (memberError || !memberData) {
      setError("Compte non trouvé dans la base des membres.")
      setLoading(false)
      return
    }

    const allowedRoles: Record<AdminRole, string[]> = {
      directeur: ["director"],
      president: ["president"],
      tresorier: ["treasurer"]
    }

    if (!allowedRoles[selectedRole].includes(memberData.role)) {
      setError(`Vous n'avez pas les droits pour le rôle ${currentRole.label}. Votre rôle actuel : ${memberData.role || 'membre'}.`)
      setLoading(false)
      return
    }

    // Send magic link
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}&redirect=/admin/${selectedRole}`,
      },
    })

    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  if (magicLinkSent) {
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

            <Card className="border-2 border-green-200">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Lien de connexion envoyé !</h2>
                <p className="text-muted-foreground">
                  Un email a été envoyé à <strong>{email}</strong>.<br />
                  Cliquez sur le lien pour accéder à l&apos;espace <strong>{currentRole.label}</strong>.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Vous allez être redirigé automatiquement...</span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => { setMagicLinkSent(false); setEmail("") }}>
                    Utiliser un autre email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
              <CardDescription>Sélectionnez votre rôle et connectez-vous par email</CardDescription>
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
              <p className="text-sm text-muted-foreground text-center">
                {currentRole.description}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Envoyer le lien de connexion
                    </span>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                Un lien de connexion sera envoyé à votre adresse email. Aucun mot de passe nécessaire.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-4 text-sm">
            <Link href="/connexion" className="text-muted-foreground hover:text-foreground transition-colors">
              Espace Membre
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
