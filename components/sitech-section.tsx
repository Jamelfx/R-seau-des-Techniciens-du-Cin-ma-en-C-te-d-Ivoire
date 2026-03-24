"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function SitechSection() {
  const { t } = useI18n()

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-background/90" />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-primary font-semibold tracking-wide mb-4">
            {t("sitech.badge")}
          </p>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">{t("sitech.title")} </span>
            <span className="text-amber-500">{t("sitech.year")}</span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
            {t("sitech.description")}
          </p>
          
          <div className="flex gap-12 mb-8">
            <div>
              <p className="text-3xl font-bold text-foreground">{t("sitech.date")}</p>
              <p className="text-primary font-semibold text-sm">{t("sitech.month")}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{t("sitech.participants")}</p>
              <p className="text-primary font-semibold text-sm">{t("sitech.participantsLabel")}</p>
            </div>
          </div>
          
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 text-base"
          >
            {t("sitech.cta")}
          </Button>
        </div>
      </div>
    </section>
  )
}
