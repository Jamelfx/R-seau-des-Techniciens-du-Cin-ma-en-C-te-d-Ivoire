"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Mail } from "lucide-react"
import Link from "next/link"

export default function AdhesionConfirmationPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Demande envoyée !</CardTitle>
            <CardDescription className="text-base">
              Votre demande d'adhésion a été transmise au Conseil d'Administration
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Délai de traitement</p>
                  <p className="text-sm text-muted-foreground">
                    Le Conseil d'Administration examinera votre demande et vous donnera une réponse dans un délai de 15 jours ouvrables.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Notification par email</p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un email de confirmation avec un lien pour créer votre compte et finaliser votre adhésion.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                En attendant, n'hésitez pas à découvrir notre plateforme et nos ressources.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline">
                    Retour à l'accueil
                  </Button>
                </Link>
                <Link href="/actualites">
                  <Button>
                    Voir les actualités
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}
