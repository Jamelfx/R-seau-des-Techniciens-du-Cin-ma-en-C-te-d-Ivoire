'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Film, Eye, EyeOff, Loader2, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase n\'est pas configuré. Vérifiez les variables d\'environnement.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Étape 1 : Authentification avec mot de passe
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Votre email n\'est pas encore confirmé. Vérifiez votre boîte de réception.')
        } else {
          setError(`Erreur d'authentification : ${authError.message}`)
        }
        setLoading(false)
        return
      }

      // Étape 2 : L'authentification a réussi, chercher le rôle dans la table members
      let userRole: string | null = null
      let memberFound = false

      try {
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('role, first_name, last_name, status')
          .eq('email', email)
          .maybeSingle()

        if (!memberError && member) {
          memberFound = true
          userRole = member.role || 'member'
        }
      } catch {
        // Table members inaccessible — on continue quand même
      }

      // Étape 3 : Déterminer la redirection
      const userEmail = authData.user?.email?.toLowerCase() || ''
      const userMetadata = authData.user?.user_metadata || {}
      const metaRole = userMetadata.role || null

      // Priorité pour le rôle : metadata > table members > déduction par email
      const finalRole = metaRole || userRole

      setSuccess('Authentification réussie ! Redirection en cours...')

      // Redirection en fonction du rôle
      setTimeout(() => {
        if (finalRole === 'director' || userEmail.includes('directeur')) {
          router.push('/direct')
        } else if (finalRole === 'president') {
          router.push('/admin/president')
        } else if (finalRole === 'treasurer') {
          router.push('/admin/tresorier')
        } else if (finalRole === 'member' && memberFound) {
          router.push('/membre/dashboard')
        } else {
          router.push('/admin')
        }
      }, 1000)

    } catch (err) {
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
      console.error('Erreur login admin:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo RETECHCI */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
          <Film className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">RETECH</span>
            <span className="text-foreground">CI</span>
          </h1>
          <p className="text-xs text-muted-foreground">Réseau des Techniciens du Cinéma</p>
        </div>
      </div>

      {/* Carte de connexion */}
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 ring-1 ring-primary/20">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Espace Administration</CardTitle>
            <CardDescription className="mt-1.5">
              Connectez-vous avec votre compte administrateur
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertTitle className="text-sm font-semibold">Erreur</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <AlertTitle className="text-sm font-semibold text-green-400">
                  {success}
                </AlertTitle>
                <AlertDescription className="text-sm text-green-400/80">
                  Vous allez être redirigé...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Accès réservé aux administrateurs RETECHCI
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Retour au site
              </a>
              <span className="text-border">|</span>
              <a href="/connexion" className="hover:text-foreground transition-colors">
                Espace Membre
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} RETECHCI — Tous droits réservés
      </p>
    </div>
  )
}
