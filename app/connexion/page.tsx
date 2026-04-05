"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle, CheckCircle, Loader2, Mail, Lock, Eye, EyeOff,
  Shield, ArrowLeft, LogIn, ArrowRight
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface InvitationData {
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

type PageStep =
  | "loading"
  | "invalid"
  | "invite-form"      // Formulaire inscription via invitation
  | "invite-success"   // Invitation acceptée
  | "google-processing"
  | "login"            // Formulaire de connexion normal
  | "forgot-password"
  | "forgot-success"
  | "reset-password"   // Réinitialisation mot de passe après email

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

function ConnexionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inviteToken = searchParams.get("invite")
  const isResetFlow = searchParams.get("reset") === "1"

  const [step, setStep] = useState<PageStep>("loading")
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Champs communs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Champs inscription invitation
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // États
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  // ═══════════════════════════════════════════════════════════════════
  // INITIALISATION AU CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    async function init() {
      // Si flux de réinitialisation de mot de passe
      if (isResetFlow) {
        // Vérifier si on a une session avec un token de recovery
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setStep("reset-password")
          if (session.user?.email) setEmail(session.user.email)
        } else {
          setStep("login")
        }
        return
      }

      // Si token d'invitation présent → vérifier
      if (inviteToken) {
        try {
          const res = await fetch(`/api/invitations/verify?token=${inviteToken}`)
          const json = await res.json()

          if (json.valid && json.invitation) {
            setInvitation(json.invitation)
            setEmail(json.invitation.email)
            setFirstName(json.invitation.first_name || "")
            setLastName(json.invitation.last_name || "")
            setStep("invite-form")
          } else {
            setErrorMessage(json.error || "Invitation invalide.")
            setStep("invalid")
          }
        } catch {
          setErrorMessage("Erreur de connexion au serveur.")
          setStep("invalid")
        }
        return
      }

      // Sinon → page de connexion normale
      setStep("login")
    }

    init()
  }, [inviteToken, isResetFlow])

  // ═══════════════════════════════════════════════════════════════════
  // CONNEXION NORMALE (email + mot de passe)
  // ═══════════════════════════════════════════════════════════════════

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setSubmitError(
        signInError.message === "Invalid login credentials"
          ? "Identifiants incorrects. Veuillez réessayer."
          : signInError.message
      )
      setSubmitting(false)
      return
    }

    // Récupérer le rôle pour rediriger
    const { data: memberData } = await supabase
      .from("members")
      .select("role")
      .eq("email", email.trim())
      .single()

    const role = memberData?.role || data.user?.user_metadata?.role || "member"

    if (role === "director") {
      router.push("/directeur")
    } else if (role === "president") {
      router.push("/admin/president")
    } else if (role === "treasurer") {
      router.push("/admin/treasurer")
    } else {
      router.push("/membre/dashboard")
    }
  }, [email, password, router])

  // ═══════════════════════════════════════════════════════════════════
  // CONNEXION GOOGLE (normale)
  // ═══════════════════════════════════════════════════════════════════

  const handleGoogleLogin = useCallback(async () => {
    setSubmitError(null)
    const supabase = createClient()

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setSubmitError("Erreur lors de la connexion Google. Veuillez réessayer.")
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════════
  // INSCRIPTION VIA INVITATION (email + mot de passe)
  // ═══════════════════════════════════════════════════════════════════

  const handleInviteSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!email.trim()) {
      setSubmitError("L'adresse email est requise.")
      return
    }
    if (!password || password.length < 6) {
      setSubmitError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (password !== confirmPassword) {
      setSubmitError("Les mots de passe ne correspondent pas.")
      return
    }

    setSubmitting(true)

    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      )

      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (
          authError.message.includes("already registered") ||
          authError.message.includes("User already registered")
        ) {
          // Utilisateur déjà dans Supabase Auth → accepter directement
          const acceptRes = await fetch("/api/invitations/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: inviteToken,
              auth_email: email.trim(),
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            }),
          })
          const acceptJson = await acceptRes.json()

          if (acceptJson.success) {
            setStep("invite-success")
          } else {
            setSubmitError(acceptJson.error || "Erreur lors de l'activation.")
          }
        } else {
          setSubmitError(authError.message)
        }
        setSubmitting(false)
        return
      }

      // Accepter l'invitation
      const acceptRes = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          auth_email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      })
      const acceptJson = await acceptRes.json()

      if (acceptJson.success) {
        setStep("invite-success")
      } else {
        setSubmitError(acceptJson.error || "Erreur lors de la création du compte.")
      }
    } catch {
      setSubmitError("Erreur de connexion au serveur. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }, [email, password, confirmPassword, firstName, lastName, inviteToken])

  // ═══════════════════════════════════════════════════════════════════
  // INSCRIPTION GOOGLE VIA INVITATION
  // ═══════════════════════════════════════════════════════════════════

  const handleGoogleInvite = useCallback(async () => {
    setStep("google-processing")
    setSubmitError(null)

    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      )

      if (inviteToken) {
        sessionStorage.setItem("pending_invitation_token", inviteToken)
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/connexion?invite=${inviteToken || ""}&oauth=1`,
        },
      })

      if (error) {
        setSubmitError(error.message)
        setStep("invite-form")
      }
    } catch {
      setSubmitError("Erreur de connexion. Veuillez réessayer.")
      setStep("invite-form")
    }
  }, [inviteToken])

  // ═══════════════════════════════════════════════════════════════════
  // CALLBACK OAUTH GOOGLE (invitation)
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    const isOAuth = searchParams.get("oauth")
    if (!isOAuth || !inviteToken) return

    async function handleOAuthCallback() {
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        )

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user?.email) {
          const { data: userData } = await supabase.auth.getUser()
          const userEmail = userData.user?.email || session.user.email

          setStep("google-processing")
          setEmail(userEmail)

          const acceptRes = await fetch("/api/invitations/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: inviteToken,
              auth_email: userEmail,
              first_name: userData.user?.user_metadata?.full_name?.split(" ")[0] || firstName.trim(),
              last_name: userData.user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || lastName.trim(),
            }),
          })
          const acceptJson = await acceptRes.json()

          sessionStorage.removeItem("pending_invitation_token")

          if (acceptJson.success) {
            setStep("invite-success")
          } else {
            setSubmitError(acceptJson.error || "Erreur lors de l'activation.")
            setStep("invite-form")
          }
        }
      } catch {
        setSubmitError("Erreur lors de la connexion Google.")
        setStep("invite-form")
      }
    }

    const timer = setTimeout(handleOAuthCallback, 1500)
    return () => clearTimeout(timer)
  }, [searchParams, inviteToken, firstName, lastName])

  // ═══════════════════════════════════════════════════════════════════
  // MOT DE PASSE OUBLIÉ
  // ═══════════════════════════════════════════════════════════════════

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)

    if (!forgotEmail.trim()) {
      setForgotError("Veuillez entrer votre adresse email.")
      return
    }

    setForgotLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/connexion?reset=1`,
      })

      if (error) {
        setForgotError(error.message)
      } else {
        setStep("forgot-success")
      }
    } catch {
      setForgotError("Erreur de connexion au serveur.")
    } finally {
      setForgotLoading(false)
    }
  }, [forgotEmail])

  // ═══════════════════════════════════════════════════════════════════
  // RÉINITIALISATION MOT DE PASSE (après clic du lien email)
  // ═══════════════════════════════════════════════════════════════════

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)

    if (!newPassword || newPassword.length < 6) {
      setResetError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      setResetError("Les mots de passe ne correspondent pas.")
      return
    }

    setResetLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setResetError(error.message)
      } else {
        setResetSuccess(true)
        // Déconnecter après changement pour forcer une reconnexion
        await supabase.auth.signOut()
      }
    } catch {
      setResetError("Erreur de connexion au serveur.")
    } finally {
      setResetLoading(false)
    }
  }, [newPassword, confirmNewPassword])

  // ═══════════════════════════════════════════════════════════════════
  // RENDU — ICÔNE GOOGLE
  // ═══════════════════════════════════════════════════════════════════

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )

  // ═══════════════════════════════════════════════════════════════════
  // SÉPARATEUR
  // ═══════════════════════════════════════════════════════════════════

  const Separator = ({ label }: { label?: string }) => (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label || "ou"}</span>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* ── Titre dynamique ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              {step === "invite-success" || step === "forgot-success" || resetSuccess ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : step === "invalid" ? (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              ) : step === "invite-form" || step === "google-processing" ? (
                <Shield className="h-8 w-8 text-primary" />
              ) : (
                <LogIn className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {step === "invite-success" && "Bienvenue chez RETECHCI ! 🎉"}
              {step === "forgot-success" && "Email envoyé !"}
              {resetSuccess && "Mot de passe mis à jour !"}
              {step === "invalid" && "Invitation invalide"}
              {step === "google-processing" && "Connexion Google..."}
              {step === "invite-form" && "Rejoignez RETECHCI"}
              {step === "forgot-password" && "Mot de passe oublié"}
              {step === "reset-password" && "Nouveau mot de passe"}
              {(step === "login" || step === "loading") && "Connexion"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "invite-success" && "Votre compte est maintenant actif."}
              {step === "forgot-success" && "Vérifiez votre boîte de réception."}
              {resetSuccess && "Vous pouvez maintenant vous connecter."}
              {step === "invalid" && errorMessage}
              {step === "google-processing" && "Vous serez redirigé automatiquement."}
              {step === "invite-form" && invitation
                ? "Finalisez votre inscription"
                : step === "invite-form" ? "Créez votre compte"
                : ""}
              {step === "forgot-password" && "Entrez votre email pour recevoir un lien de réinitialisation."}
              {step === "reset-password" && "Choisissez votre nouveau mot de passe."}
              {(step === "login" || step === "loading") && "Accédez à votre espace membre RETECHCI"}
            </p>
          </div>

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Chargement
          ════════════════════════════════════════════════════════ */}
          {step === "loading" && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Invitation invalide
          ════════════════════════════════════════════════════════ */}
          {step === "invalid" && (
            <Card className="border-destructive/30">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link href="/connexion">
                      <LogIn className="h-4 w-4 mr-2" />
                      Se connecter
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour à l&apos;accueil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Google en cours
          ════════════════════════════════════════════════════════ */}
          {step === "google-processing" && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Connexion avec Google en cours...</p>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Succès invitation
          ════════════════════════════════════════════════════════ */}
          {step === "invite-success" && (
            <Card className="border-green-500/30">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Votre compte RETECHCI est maintenant <strong>actif</strong>. Vous pouvez accéder à votre espace membre.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild className="w-full">
                    <Link href="/membre/dashboard">
                      Accéder à mon espace membre
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      Retour à l&apos;accueil
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Mot de passe oublié
          ════════════════════════════════════════════════════════ */}
          {step === "forgot-password" && (
            <Card>
              <CardContent className="p-6 space-y-4">
                {forgotError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{forgotError}</p>
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Adresse email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
                  </Button>
                </form>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep("login"); setForgotError(null) }}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Retour à la connexion
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Email de réinitialisation envoyé
          ════════════════════════════════════════════════════════ */}
          {step === "forgot-success" && (
            <Card className="border-green-500/30">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Si un compte existe avec <strong>{forgotEmail}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <p className="text-xs text-muted-foreground">
                  Vérifiez votre boîte de réception et vos spams.
                </p>
                <Button onClick={() => setStep("login")} variant="outline" className="mt-2">
                  Retour à la connexion
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Réinitialisation du mot de passe (après lien email)
          ════════════════════════════════════════════════════════ */}
          {step === "reset-password" && !resetSuccess && (
            <Card>
              <CardContent className="p-6 space-y-4">
                {resetError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{resetError}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Connecté en tant que <strong>{email}</strong>
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="6 caractères minimum"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le mot de passe"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Reset réussi
          ════════════════════════════════════════════════════════ */}
          {step === "reset-password" && resetSuccess && (
            <Card className="border-green-500/30">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Votre mot de passe a été mis à jour avec succès. Veuillez vous reconnecter.
                </p>
                <Button asChild className="w-full">
                  <Link href="/connexion">Se connecter</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : Formulaire inscription via INVITATION
          ════════════════════════════════════════════════════════ */}
          {step === "invite-form" && (
            <Card>
              <CardHeader>
                {invitation && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-2">
                    <p className="text-sm">
                      <span className="font-medium">{invitation.first_name} {invitation.last_name}</span>
                      <span className="text-muted-foreground"> ({invitation.email})</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invitation valide — veuillez créer votre compte
                    </p>
                  </div>
                )}
                <CardTitle className="text-lg">Créer votre compte</CardTitle>
                <CardDescription>Choisissez une méthode d&apos;inscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {submitError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleInvite}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <GoogleIcon />
                  Continuer avec Google
                </button>

                <Separator label="ou par email" />

                <form onSubmit={handleInviteSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="inv-first-name">Prénom</Label>
                      <Input
                        id="inv-first-name"
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inv-last-name">Nom</Label>
                      <Input
                        id="inv-last-name"
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inv-email">Adresse email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="inv-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inv-password">Mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="inv-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="6 caractères minimum"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inv-confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="inv-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmez votre mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Création en cours...
                      </>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Link href="/connexion" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Déjà membre ? Se connecter
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              ÉTAT : CONNEXION NORMALE (login)
          ════════════════════════════════════════════════════════ */}
          {step === "login" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Connexion</CardTitle>
                <CardDescription>
                  Accédez à votre espace membre RETECHCI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{submitError}</p>
                  </div>
                )}

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-3"
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon />
                  Continuer avec Google
                </Button>

                <Separator label="ou" />

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <div className="flex items-center justify-end text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email)
                        setStep("forgot-password")
                        setSubmitError(null)
                      }}
                      className="text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
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

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Pas encore membre ?{" "}
                    <Link href="/adhesion" className="text-primary hover:underline font-medium">
                      Faire une demande d&apos;adhésion
                    </Link>
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    En vous connectant, vous acceptez les{" "}
                    <Link href="/conventions" className="text-primary hover:underline">
                      conditions d&apos;utilisation
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Wrapper avec Suspense pour useSearchParams
import { Suspense } from "react"

export default function ConnexionPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConnexionPage />
    </Suspense>
  )
}
