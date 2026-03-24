"use client"

import { useI18n } from "@/lib/i18n"

export function Partners() {
  const { t } = useI18n()

  const partners = [
    { name: "SONY", style: "font-bold tracking-wider" },
    { name: "Canon", style: "font-semibold" },
    { name: "Dolby", style: "font-bold" },
    { name: "Blackmagic", style: "font-semibold" },
    { name: "CANAL+", style: "font-bold italic" },
  ]

  return (
    <section className="py-16 px-4 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-muted-foreground text-sm tracking-widest mb-10">
          {t("partners.title")}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <span 
              key={partner.name}
              className={`text-xl md:text-2xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${partner.style}`}
            >
              {partner.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
