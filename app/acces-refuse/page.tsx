"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"
import Link from "next/link"

export default function AccesRefusePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground mb-6">
            Votre compte n&apos;est pas encore membre du RETECHCI. 
            Pour accéder à votre espace, vous devez avoir reçu une invitation 
            du Directeur Exécutif ou avoir soumis une demande d&apos;adhésion approuvée.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/adhesion">
              <Button className="w-full">
                Faire une demande d&apos;adhésion
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
