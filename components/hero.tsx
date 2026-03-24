"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function Hero() {
  const { t } = useI18n()

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
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

      <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
        {t("hero.description")}
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="min-w-[180px] bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/annuaire">{t("hero.cta1")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="min-w-[180px] border-muted-foreground/30 text-foreground hover:bg-muted">
          <Link href="/sitech-2027">{t("hero.cta2")}</Link>
        </Button>
      </div>
    </section>
  )
}
