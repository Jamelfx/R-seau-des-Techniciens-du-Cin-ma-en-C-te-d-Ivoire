"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clapperboard, QrCode, CheckCircle } from "lucide-react"

export function DigitalCard() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <Badge variant="outline" className="border-border text-muted-foreground px-4 py-1.5">
              INNOVATION RETECHCI
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              CARTE PROFESSIONNELLE{" "}
              <span className="text-primary">DIGITALE</span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
              Chaque membre du réseau dispose d&apos;une carte virtuelle unique. Scannable 
              instantanément sur les plateaux, elle certifie vos compétences, votre statut et 
              votre adhésion à la grille salariale.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-foreground">QR Code unique pour vérification instantanée</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">Certification des compétences par le Bureau</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-secondary mt-4"
            >
              Obtenir ma carte
            </Button>
          </div>
          
          {/* Right - Card Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              
              {/* Card */}
              <div className="relative bg-card border border-border rounded-2xl p-6 w-[320px] shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Clapperboard className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs">
                    CATEGORIE A
                  </Badge>
                </div>
                
                {/* Profile */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" 
                      alt="Jamel Basiru"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Jamel Basiru</h3>
                  <p className="text-primary font-medium">Monteur Image</p>
                  <Badge variant="secondary" className="mt-2 bg-secondary text-muted-foreground text-xs">
                    Directeur Exécutif
                  </Badge>
                </div>
                
                {/* ID Section */}
                <div className="bg-secondary/50 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">ID MEMBRE</p>
                    <p className="text-foreground font-mono font-bold">CI-2024-8842</p>
                  </div>
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
