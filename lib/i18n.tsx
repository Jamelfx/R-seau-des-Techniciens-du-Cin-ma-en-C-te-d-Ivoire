"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Locale = "fr" | "en"

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.directory": "Annuaire",
    "nav.news": "Actualités",
    "nav.conventions": "Conventions & Légal",
    "nav.live": "Direct",
    "nav.sitech": "SITECH 2027",
    
    // Hero
    "hero.badge": "LA RÉFÉRENCE TECHNIQUE EN CÔTE D'IVOIRE",
    "hero.title1": "L'Excellence Technique",
    "hero.title2": "du",
    "hero.title3": "Cinéma",
    "hero.title4": "Ivoirien",
    "hero.description": "La plateforme centrale pour les techniciens de cinéma de Côte d'Ivoire. Une vitrine pour nos talents, un hub pour les productions et un organe de défense de nos métiers.",
    "hero.cta1": "Explorer les Talents",
    "hero.cta2": "SITECH 2027",
    
    // Featured Talents
    "talents.title": "Talents à la Une",
    "talents.subtitle": "Techniciens certifiés et leurs disponibilités en temps réel.",
    "talents.viewAll": "Voir tout l'annuaire",
    "talents.available": "Disponible",
    "talents.filming": "En Tournage",
    "talents.unavailable": "Indisponible",
    
    // Digital Card
    "card.badge": "INNOVATION RETECHCI",
    "card.title1": "CARTE PROFESSIONNELLE",
    "card.title2": "DIGITALE",
    "card.description": "Chaque membre du réseau dispose d'une carte virtuelle unique. Scannable instantanément sur les plateaux, elle certifie vos compétences, votre statut et votre adhésion à la grille salariale.",
    "card.feature1": "QR Code unique pour vérification instantanée",
    "card.feature2": "Certification des compétences par le Bureau",
    "card.cta": "Obtenir ma carte",
    "card.category": "CATEGORIE A",
    "card.memberId": "ID MEMBRE",
    "card.role": "Directeur Exécutif",
    
    // SITECH Section
    "sitech.badge": "L'ÉVÉNEMENT DE L'ANNÉE",
    "sitech.title": "SITECH",
    "sitech.year": "2027",
    "sitech.description": "Salon International des Technologies de l'Image et du Son. Retrouvez les dernières innovations, des masterclasses exclusives et tout l'écosystème audiovisuel ouest-africain.",
    "sitech.date": "15-17",
    "sitech.month": "DÉCEMBRE 2027",
    "sitech.participants": "1500+",
    "sitech.participantsLabel": "PARTICIPANTS",
    "sitech.cta": "Découvrir SITECH 2027",
    
    // Partners
    "partners.title": "NOS PARTENAIRES OFFICIELS",
    
    // Footer
    "footer.description": "Réseau des Techniciens du cinéma en Côte d'Ivoire.",
    "footer.navigation": "Navigation",
    "footer.resources": "Ressources",
    "footer.contact": "Nous Contacter",
    "footer.salaryGrid": "Grille Salariale",
    "footer.contracts": "Contrats Types",
    "footer.training": "Formations",
    "footer.talentsDirectory": "Annuaire des Talents",
    "footer.address": "Cocody Riviera 2, Rue des Jardins, Abidjan, Côte d'Ivoire",
    "footer.rights": "Tous droits réservés.",
    
    // Theme
    "theme.light": "Mode clair",
    "theme.dark": "Mode sombre",
    "theme.system": "Système",
    
    // Language
    "lang.fr": "Français",
    "lang.en": "English",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.directory": "Directory",
    "nav.news": "News",
    "nav.conventions": "Conventions & Legal",
    "nav.live": "Live",
    "nav.sitech": "SITECH 2027",
    
    // Hero
    "hero.badge": "THE TECHNICAL REFERENCE IN CÔTE D'IVOIRE",
    "hero.title1": "Technical Excellence",
    "hero.title2": "of",
    "hero.title3": "Ivorian",
    "hero.title4": "Cinema",
    "hero.description": "The central platform for film technicians in Côte d'Ivoire. A showcase for our talents, a hub for productions, and a defense body for our professions.",
    "hero.cta1": "Explore Talents",
    "hero.cta2": "SITECH 2027",
    
    // Featured Talents
    "talents.title": "Featured Talents",
    "talents.subtitle": "Certified technicians and their availability in real time.",
    "talents.viewAll": "View full directory",
    "talents.available": "Available",
    "talents.filming": "Filming",
    "talents.unavailable": "Unavailable",
    
    // Digital Card
    "card.badge": "RETECHCI INNOVATION",
    "card.title1": "PROFESSIONAL",
    "card.title2": "DIGITAL CARD",
    "card.description": "Each network member has a unique virtual card. Instantly scannable on set, it certifies your skills, your status, and your adherence to the salary grid.",
    "card.feature1": "Unique QR Code for instant verification",
    "card.feature2": "Skills certification by the Bureau",
    "card.cta": "Get my card",
    "card.category": "CATEGORY A",
    "card.memberId": "MEMBER ID",
    "card.role": "Executive Director",
    
    // SITECH Section
    "sitech.badge": "THE EVENT OF THE YEAR",
    "sitech.title": "SITECH",
    "sitech.year": "2027",
    "sitech.description": "International Exhibition of Image and Sound Technologies. Discover the latest innovations, exclusive masterclasses, and the entire West African audiovisual ecosystem.",
    "sitech.date": "15-17",
    "sitech.month": "DECEMBER 2027",
    "sitech.participants": "1500+",
    "sitech.participantsLabel": "PARTICIPANTS",
    "sitech.cta": "Discover SITECH 2027",
    
    // Partners
    "partners.title": "OUR OFFICIAL PARTNERS",
    
    // Footer
    "footer.description": "Network of Film Technicians in Côte d'Ivoire.",
    "footer.navigation": "Navigation",
    "footer.resources": "Resources",
    "footer.contact": "Contact Us",
    "footer.salaryGrid": "Salary Grid",
    "footer.contracts": "Contract Templates",
    "footer.training": "Training",
    "footer.talentsDirectory": "Talents Directory",
    "footer.address": "Cocody Riviera 2, Rue des Jardins, Abidjan, Côte d'Ivoire",
    "footer.rights": "All rights reserved.",
    
    // Theme
    "theme.light": "Light mode",
    "theme.dark": "Dark mode",
    "theme.system": "System",
    
    // Language
    "lang.fr": "Français",
    "lang.en": "English",
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr")

  useEffect(() => {
    const savedLocale = localStorage.getItem("retechci-locale") as Locale
    if (savedLocale && (savedLocale === "fr" || savedLocale === "en")) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("retechci-locale", newLocale)
  }

  const t = (key: string): string => {
    return translations[locale][key as keyof typeof translations["fr"]] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
