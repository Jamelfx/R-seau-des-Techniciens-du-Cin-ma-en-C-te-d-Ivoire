"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useState, useEffect } from "react"

export function Hero() {
  const { t } = useI18n()
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
      {/* Background Video/Image with very low opacity */}
      <div className="absolute inset-0 z-0">
        {/* Fallback image */}
        <Image
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop"
          alt="Cinema background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Video overlay - will replace image when loaded */}
        <video
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-movie-filming-set-behind-the-scenes-34482-large.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for readability - very low opacity on the media */}
        <div className="absolute inset-0 bg-background/85" />
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-accent">{t("hero.badge")}</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-foreground">{t("hero.title1")}</span>
          <br />
          <span className="text-foreground">{t("hero.title2")}</span>
          <br />
          <span className="text-primary">{t("hero.title3")} </span>
          <span className="text-muted-foreground">{t("hero.title4")}</span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-pretty text-lg text-muted-foreground">
          {t("hero.description")}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="min-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/annuaire">{t("hero.cta1")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[180px] border-muted-foreground/30 text-foreground hover:bg-muted backdrop-blur-sm">
            <Link href="/sitech-2027">{t("hero.cta2")}</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs uppercase tracking-widest">Défiler</span>
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
