"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clapperboard, QrCode, CheckCircle, Scan, ShieldCheck } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface CardContent {
  badge?: string
  title1?: string
  title2?: string
  description?: string
  feature1?: string
  feature2?: string
  feature3?: string
  feature4?: string
  cta?: string
  sample_name?: string
  sample_role?: string
  sample_title?: string
  sample_photo?: string
  sample_id?: string
  sample_category?: string
}

export function DigitalCard() {
  const { t } = useI18n()
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [content, setContent] = useState<CardContent>({})

  useEffect(() => {
    const fetchContent = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'digital_card')
      
      if (data && data.length > 0) {
        const cardContent: CardContent = {}
        data.forEach(item => {
          cardContent[item.key as keyof CardContent] = item.value
        })
        setContent(cardContent)
      }
    }
    fetchContent()
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    const rotateYValue = (mouseX / (rect.width / 2)) * 15
    const rotateXValue = -(mouseY / (rect.height / 2)) * 15
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => {
    setIsHovering(false)
    setRotateX(0)
    setRotateY(0)
  }

  // Use Supabase content or fallback to i18n
  const badge = content.badge || t("card.badge")
  const title1 = content.title1 || t("card.title1")
  const title2 = content.title2 || t("card.title2")
  const description = content.description || t("card.description")
  const feature1 = content.feature1 || t("card.feature1")
  const feature2 = content.feature2 || t("card.feature2")
  const feature3 = content.feature3 || "Pointage de présence aux événements"
  const feature4 = content.feature4 || "Avantages partenaires (bons d'achat, assurance)"
  const cta = content.cta || t("card.cta")
  const sampleName = content.sample_name || "Jamel Basiru"
  const sampleRole = content.sample_role || "Monteur Image"
  const sampleTitle = content.sample_title || "Directeur Exécutif"
  const samplePhoto = content.sample_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
  const sampleId = content.sample_id || "CI-2024-8842"
  const sampleCategory = content.sample_category || "CATÉGORIE A"

  return (
    <section className="py-16 md:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <Badge variant="outline" className="border-border text-muted-foreground px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
              {badge}
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {title1}{" "}
              <span className="text-primary">{title2}</span>
            </h2>
            
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
              {description}
            </p>
            
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{feature1}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{feature2}</span>
              </div>
              <div className="flex items-center gap-3">
                <Scan className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{feature3}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{feature4}</span>
              </div>
            </div>
            
            <Link href="/adhesion">
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-secondary mt-2 md:mt-4 w-full sm:w-auto"
              >
                {cta}
              </Button>
            </Link>
          </div>
          
          {/* Right - Card Preview */}
          <div className="flex justify-center lg:justify-end perspective-1000 order-1 lg:order-2">
            <div 
              ref={cardRef}
              className="relative cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ perspective: "1000px" }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-75 transition-opacity duration-300"
                style={{ opacity: isHovering ? 0.6 : 0.3 }}
              />
              
              {/* Card */}
              <div 
                className="relative w-[240px] h-[360px] sm:w-[280px] sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 transition-all duration-200 ease-out"
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovering ? 'scale(1.02)' : 'scale(1)'}`,
                  transformStyle: "preserve-3d",
                  boxShadow: isHovering 
                    ? `${rotateY * -2}px ${rotateX * 2}px 40px rgba(0,0,0,0.4), 0 0 60px rgba(var(--primary), 0.2)`
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Shine effect */}
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
                
                {/* Top arc */}
                <div className="absolute top-0 left-0 right-0 h-24 sm:h-32">
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
                <div className="relative z-10 h-full flex flex-col p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <Badge className="bg-card/80 backdrop-blur-sm text-muted-foreground text-[9px] sm:text-[10px] border-0">
                      {sampleCategory}
                    </Badge>
                  </div>
                  
                  {/* Profile */}
                  <div className="flex-1 flex flex-col items-center justify-center -mt-2 sm:-mt-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-primary via-primary/60 to-primary/30">
                        <div className="w-full h-full rounded-full overflow-hidden bg-card">
                          <img 
                            src={samplePhoto}
                            alt={sampleName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-base sm:text-xl font-bold text-foreground mt-3 sm:mt-4 text-center">{sampleName}</h3>
                    <p className="text-primary font-semibold text-xs sm:text-sm mt-1">{sampleRole}</p>
                    
                    <Badge variant="secondary" className="mt-2 sm:mt-3 bg-secondary/80 text-muted-foreground text-[10px] sm:text-xs px-2 sm:px-3">
                      {sampleTitle}
                    </Badge>
                  </div>
                  
                  {/* ID Section */}
                  <div className="bg-card/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 flex justify-between items-center border border-border/50">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium tracking-wider">ID MEMBRE</p>
                      <p className="text-primary font-mono font-bold text-xs sm:text-sm">{sampleId}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-foreground rounded-lg p-1 sm:p-1.5">
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
