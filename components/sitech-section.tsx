"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { SectionContent } from "@/lib/content"
import Link from "next/link"

interface SitechSectionProps {
  content?: SectionContent
}

export function SitechSection({ content }: SitechSectionProps) {
  const { t } = useI18n()

  // Use Supabase content if available, fallback to i18n
  const title = content?.title || t("sitech.title")
  const year = content?.year || t("sitech.year")
  const description = content?.description || t("sitech.description")
  const date = content?.date || t("sitech.date")
  const month = content?.month || t("sitech.month")
  const participants = content?.participants || t("sitech.participants")
  const participantsLabel = content?.participants_label || t("sitech.participantsLabel")
  const ctaText = content?.cta_text || t("sitech.cta")
  const badge = content?.badge || t("sitech.badge")

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: content?.image 
            ? `url('${content.image}')` 
            : "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-background/90" />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-primary font-semibold tracking-wide mb-4">
            {badge}
          </p>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">{title} </span>
            <span className="text-amber-500">{year}</span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
            {description}
          </p>
          
          <div className="flex gap-12 mb-8">
            <div>
              <p className="text-3xl font-bold text-foreground">{date}</p>
              <p className="text-primary font-semibold text-sm">{month}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{participants}</p>
              <p className="text-primary font-semibold text-sm">{participantsLabel}</p>
            </div>
          </div>
          
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-6 text-base"
            asChild
          >
            <Link href={content?.cta_link || "/sitech-2027"}>
              {ctaText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
