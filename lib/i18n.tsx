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
    
    // About Page
    "about.badge": "À PROPOS DE RETECHCI",
    "about.title": "Qui sommes-nous ?",
    "about.intro": "Formellement créée le 16 Juillet 2022, le RETECHCI est la toute première association regroupant uniquement les techniciens du cinéma de Côte d'Ivoire.",
    "about.mission": "Face à la négligence dont fait l'objet la grande famille des techniciens dans notre pays, nous avons décidé de nous unir pour défendre nos intérêts et professionnaliser notre secteur.",
    "about.quote": "\"Loin d'un sytlle de syndicat contre les entreprises de cinéma, le RETECHCI veut plutôt apporter sa pierre à l'édifice en militant activement pour la réglementation et le développement du secteur.\"",
    "about.quoteAuthor": "Statuts de l'Association",
    "about.foundedYear": "2022",
    "about.foundedLabel": "Année de création",
    "about.members": "500+",
    "about.membersLabel": "Membres actifs",
    "about.objectivesTitle": "Nos Objectifs",
    "about.objective1": "Promouvoir les métiers techniques audiovisuels",
    "about.objective2": "Collecter les avis des membres (enquête semestrielle)",
    "about.bureauTitle": "Bureau Exécutif",
    "about.bureauSubtitle": "Les membres qui dirigent l'association au quotidien.",
    "about.councilTitle": "Conseil d'Administration",
    "about.councilSubtitle": "Organe de surveillance et d'orientation stratégique.",

    // Directory Page
    "directory.title": "Annuaire & Ressources",
    "directory.subtitle": "Trouvez le talent ou le matériel idéal pour votre prochaine production.",
    "directory.search": "Rechercher un technicien...",
    "directory.tabs.technicians": "Techniciens",
    "directory.tabs.companies": "Sociétés & Location",
    "directory.tabs.costumes": "Costumes & Stylisme",
    "directory.tabs.locations": "Carte Décors CI",
    "directory.viewProfile": "Voir le profil",
    "directory.senior": "Senior",
    "directory.intermediate": "Intermédiaire",
    "directory.junior": "Junior",
    "directory.available": "Disponible",
    "directory.filming": "En Tournage",
    "directory.unavailable": "Indisponible",
    "directory.viewPhotos": "Voir les photos",
    "directory.requestScouting": "Demander un repérage",
    "directory.mapTitle": "Carte des Décors",
    "directory.searchLocation": "Rechercher un décor ou une ville...",
    "directory.filters.all": "Toutes",
    "directory.filters.urban": "Urbain",
    "directory.filters.beach": "Plage",
    "directory.filters.nature": "Nature",
    "directory.filters.historical": "Historique",
    "directory.filters.modern": "Moderne",
    "directory.filters.traditional": "Traditionnel",

    // News Page
    "news.title": "Actualités &",
    "news.titleHighlight": "Tendances",
    "news.subtitle": "Suivez l'actualité du cinéma ivoirien et les dernières nouvelles de l'industrie.",
    "news.filters.all": "Tout",
    "news.filters.boxOffice": "Box Office",
    "news.filters.technique": "Technique",
    "news.filters.training": "Formation",
    "news.filters.production": "Production",
    "news.filters.festival": "Festival",
    "news.filters.association": "Association",

    // Live Page
    "live.title": "RETECHCI TV",
    "live.subtitle": "Direct",
    "live.badge": "EN DIRECT",
    "live.viewers": "spectateurs",
    "live.like": "J'aime",
    "live.share": "Partager",
    "live.chat": "Chat en direct",
    "live.upcoming": "PROCHAINEMENT",
    "live.tomorrow": "DEMAIN",
    "live.friday": "VEN.",
    "live.trainings": "Formations & Tutoriels",
    "live.trainingsSubtitle": "Vidéothèque technique réservée aux membres.",
    "live.filters.all": "Tout voir",
    "live.filters.image": "Image",
    "live.filters.sound": "Son",
    "live.filters.postProd": "Post-prod",
    "live.daysAgo": "Il y a",
    "live.days": "jours",
    "live.weeks": "semaines",
    "live.month": "mois",

    // Conventions & Legal Page
    "conventions.title": "Conventions &",
    "conventions.titleHighlight": "Légal",
    "conventions.subtitle": "Consultez les grilles salariales de référence, les conventions collectives et les modèles de contrats validés par le RETECHCI.",
    "conventions.warning": "Documents à caractère indicatif",
    "conventions.warningText": "Les grilles salariales présentées ici constituent des recommandations établies par le RETECHCI. Elles n'ont pas force de loi mais servent de référence pour les négociations entre techniciens et productions.",
    "conventions.salaryGrid": "Grille Salariale Minima (2024)",
    "conventions.categoryA": "Catégorie A",
    "conventions.categoryB": "Catégorie B",
    "conventions.categoryC": "Catégorie C",
    "conventions.seniorPositions": "CHEFS DE POSTE",
    "conventions.technicianPositions": "TECHNICIENS SPÉCIALISÉS",
    "conventions.assistants": "ASSISTANTS & AIDES",
    "conventions.perWeek": "FCFA/sem",
    "conventions.salaryGrids": "Grilles Salariales",
    "conventions.contractTemplates": "Modèles de Contrats",
    "conventions.officialDocs": "Documents Officiels",
    "conventions.download": "Télécharger",
    "conventions.recommended": "Recommandé",
    "conventions.inNegotiation": "En négociation",
    "conventions.updated": "Mise à jour",
    "conventions.needDoc": "Besoin d'un document spécifique ?",
    "conventions.needDocText": "Contactez le secrétariat pour obtenir des informations complémentaires ou des documents personnalisés.",
    "conventions.contactUs": "Nous Contacter",

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
    
    // About Page
    "about.badge": "ABOUT RETECHCI",
    "about.title": "Who are we?",
    "about.intro": "Formally created on July 16, 2022, RETECHCI is the very first association grouping only film technicians from Côte d'Ivoire.",
    "about.mission": "Faced with the neglect of the great family of technicians in our country, we decided to unite to defend our interests and professionalize our sector.",
    "about.quote": "\"Far from a union style against film companies, RETECHCI wants to contribute to building the industry by actively advocating for regulation and sector development.\"",
    "about.quoteAuthor": "Association Statutes",
    "about.foundedYear": "2022",
    "about.foundedLabel": "Year of creation",
    "about.members": "500+",
    "about.membersLabel": "Active members",
    "about.objectivesTitle": "Our Objectives",
    "about.objective1": "Promote audiovisual technical professions",
    "about.objective2": "Collect members' opinions (bi-annual survey)",
    "about.bureauTitle": "Executive Bureau",
    "about.bureauSubtitle": "The members who lead the association daily.",
    "about.councilTitle": "Board of Directors",
    "about.councilSubtitle": "Strategic oversight and guidance body.",

    // Directory Page
    "directory.title": "Directory & Resources",
    "directory.subtitle": "Find the talent or equipment ideal for your next production.",
    "directory.search": "Search for a technician...",
    "directory.tabs.technicians": "Technicians",
    "directory.tabs.companies": "Companies & Rental",
    "directory.tabs.costumes": "Costumes & Styling",
    "directory.tabs.locations": "CI Locations Map",
    "directory.viewProfile": "View profile",
    "directory.senior": "Senior",
    "directory.intermediate": "Intermediate",
    "directory.junior": "Junior",
    "directory.available": "Available",
    "directory.filming": "Filming",
    "directory.unavailable": "Unavailable",
    "directory.viewPhotos": "View photos",
    "directory.requestScouting": "Request scouting",
    "directory.mapTitle": "Locations Map",
    "directory.searchLocation": "Search for a location or city...",
    "directory.filters.all": "All",
    "directory.filters.urban": "Urban",
    "directory.filters.beach": "Beach",
    "directory.filters.nature": "Nature",
    "directory.filters.historical": "Historical",
    "directory.filters.modern": "Modern",
    "directory.filters.traditional": "Traditional",

    // News Page
    "news.title": "News &",
    "news.titleHighlight": "Trends",
    "news.subtitle": "Follow Ivorian cinema news and the latest industry updates.",
    "news.filters.all": "All",
    "news.filters.boxOffice": "Box Office",
    "news.filters.technique": "Technical",
    "news.filters.training": "Training",
    "news.filters.production": "Production",
    "news.filters.festival": "Festival",
    "news.filters.association": "Association",

    // Live Page
    "live.title": "RETECHCI TV",
    "live.subtitle": "Live",
    "live.badge": "LIVE",
    "live.viewers": "viewers",
    "live.like": "Like",
    "live.share": "Share",
    "live.chat": "Live chat",
    "live.upcoming": "UPCOMING",
    "live.tomorrow": "TOMORROW",
    "live.friday": "FRI.",
    "live.trainings": "Training & Tutorials",
    "live.trainingsSubtitle": "Technical video library reserved for members.",
    "live.filters.all": "View all",
    "live.filters.image": "Image",
    "live.filters.sound": "Sound",
    "live.filters.postProd": "Post-prod",
    "live.daysAgo": "ago",
    "live.days": "days",
    "live.weeks": "weeks",
    "live.month": "month",

    // Conventions & Legal Page
    "conventions.title": "Conventions &",
    "conventions.titleHighlight": "Legal",
    "conventions.subtitle": "Consult reference salary grids, collective agreements, and contract templates validated by RETECHCI.",
    "conventions.warning": "Indicative Documents",
    "conventions.warningText": "The salary grids presented here are recommendations established by RETECHCI. They do not have the force of law but serve as a reference for negotiations between technicians and productions.",
    "conventions.salaryGrid": "Minimum Salary Grid (2024)",
    "conventions.categoryA": "Category A",
    "conventions.categoryB": "Category B",
    "conventions.categoryC": "Category C",
    "conventions.seniorPositions": "DEPARTMENT HEADS",
    "conventions.technicianPositions": "SPECIALIZED TECHNICIANS",
    "conventions.assistants": "ASSISTANTS & AIDES",
    "conventions.perWeek": "FCFA/week",
    "conventions.salaryGrids": "Salary Grids",
    "conventions.contractTemplates": "Contract Templates",
    "conventions.officialDocs": "Official Documents",
    "conventions.download": "Download",
    "conventions.recommended": "Recommended",
    "conventions.inNegotiation": "In negotiation",
    "conventions.updated": "Updated",
    "conventions.needDoc": "Need a specific document?",
    "conventions.needDocText": "Contact the secretariat for additional information or personalized documents.",
    "conventions.contactUs": "Contact Us",

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
