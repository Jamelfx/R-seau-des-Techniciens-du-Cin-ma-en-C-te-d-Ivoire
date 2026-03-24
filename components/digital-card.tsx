"use client"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clapperboard, QrCode, CheckCircle, Scan, ShieldCheck } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"

export function DigitalCard() {
  const { t } = useI18n()
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // Calculate rotation (max 15 degrees)
    const rotateYValue = (mouseX / (rect.width / 2)) * 15
    const rotateXValue = -(mouseY / (rect.height / 2)) * 15
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <Badge variant="outline" className="border-border text-muted-foreground px-4 py-1.5">
              {t("card.badge")}
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {t("card.title1")}{" "}
              <span className="text-primary">{t("card.title2")}</span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
              {t("card.description")}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-foreground">{t("card.feature1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">{t("card.feature2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Scan className="w-5 h-5 text-primary" />
                <span className="text-foreground">Pointage de présence aux événements</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-foreground">Avantages partenaires (bons d'achat, assurance)</span>
              </div>
            </div>
            
            <Link href="/adhesion">
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-secondary mt-4"
              >
                {t("card.cta")}
              </Button>
            </Link>
          </div>
          
          {/* Right - Card Preview - Portrait PVC Format with 3D Effect */}
          <div className="flex justify-center lg:justify-end perspective-1000">
            <div 
              ref={cardRef}
              className="relative cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                perspective: "1000px",
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-75 transition-opacity duration-300"
                style={{ opacity: isHovering ? 0.6 : 0.3 }}
              />
              
              {/* Card - Portrait PVC Format with 3D Transform */}
              <div 
                className="relative w-[280px] h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-200 ease-out"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovering ? 'scale(1.02)' : 'scale(1)'}`,
                  transformStyle: "preserve-3d",
                  boxShadow: isHovering 
                    ? `${rotateY * -2}px ${rotateX * 2}px 40px rgba(0,0,0,0.4), 0 0 60px rgba(var(--primary), 0.2)`
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Shine effect on hover */}
                <div 
                  className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
                  style={{
                    background: isHovering 
                      ? `linear-gradient(${105 + rotateY * 2}deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`
                      : 'none',
                    opacity: isHovering ? 1 : 0,
                  }}
                />
                
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-card to-card" />
                
                {/* Top decorative arc */}
                <div className="absolute top-0 left-0 right-0 h-32">
                  <svg viewBox="0 0 280 128" className="w-full h-full" preserveAspectRatio="none">
                    <path 
                      d="M0,0 L280,0 L280,80 Q140,128 0,80 Z" 
                      fill="url(#cardGradient)" 
                    />
                    <defs>
                      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-primary/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Clapperboard className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className="bg-card/80 backdrop-blur-sm text-muted-foreground text-[10px] border-0">
                      CATÉGORIE A
                    </Badge>
                  </div>
                  
                  {/* Profile - Centered */}
                  <div className="flex-1 flex flex-col items-center justify-center -mt-4">
                    {/* Profile Picture with ring */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-primary via-primary/60 to-primary/30">
                        <div className="w-full h-full rounded-full overflow-hidden bg-card">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" 
                            alt="Jamel Basiru"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Name & Role */}
                    <h3 className="text-xl font-bold text-foreground mt-4 text-center">Jamel Basiru</h3>
                    <p className="text-primary font-semibold text-sm mt-1">Monteur Image</p>
                    
                    {/* Role Badge */}
                    <Badge variant="secondary" className="mt-3 bg-secondary/80 text-muted-foreground text-xs px-3">
                      Directeur Exécutif
                    </Badge>
                  </div>
                  
                  {/* ID Section - Bottom */}
                  <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center border border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium tracking-wider">ID MEMBRE</p>
                      <p className="text-primary font-mono font-bold text-sm">CI-2024-8842</p>
                    </div>
                    {/* QR Code placeholder */}
                    <div className="w-14 h-14 bg-foreground rounded-lg p-1.5">
                      <div className="w-full h-full grid grid-cols-5 gap-0.5">
                        {[...Array(25)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`${[0,1,2,4,5,6,9,10,14,15,18,19,20,22,23,24].includes(i) ? 'bg-background' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
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
