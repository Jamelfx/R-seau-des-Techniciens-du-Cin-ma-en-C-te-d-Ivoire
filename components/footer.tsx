"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, MapPin, Mail } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-card border-t border-border py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-lg text-foreground">RETECHCI</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">{t("footer.navigation")}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.talentsDirectory")}
                </Link>
              </li>
              <li>
                <Link href="/actualites" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link href="/sitech" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.sitech")}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Ressources */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">{t("footer.resources")}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/grille-salariale" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.salaryGrid")}
                </Link>
              </li>
              <li>
                <Link href="/contrats" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.contracts")}
                </Link>
              </li>
              <li>
                <Link href="/conventions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("nav.conventions")}
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t("footer.training")}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-6">{t("footer.contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  {t("footer.address")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <Link href="mailto:contact@retechci.org" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  contact@retechci.org
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            © 2024 RETECHCI. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
