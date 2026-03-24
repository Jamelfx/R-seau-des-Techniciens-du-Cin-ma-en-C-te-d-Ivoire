"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download, FileText, Star } from "lucide-react"

// Salary Grid Data
const categoryA = [
  { role: "Directeur Photo", salary: "450 000" },
  { role: "Ingénieur Son", salary: "400 000" },
  { role: "Chef Électricien", salary: "350 000" },
  { role: "Chef Machiniste", salary: "350 000" },
]

const categoryB = [
  { role: "Cadreur / Opérateur", salary: "250 000" },
  { role: "Perchman", salary: "200 000" },
  { role: "Électricien", salary: "180 000" },
  { role: "Machiniste", salary: "180 000" },
]

const categoryC = [
  { role: "Assistant Caméra (2nd)", salary: "150 000" },
  { role: "Renfort Élec/Mach", salary: "125 000" },
  { role: "Assistant Son", salary: "120 000" },
  { role: "Stagiaire Technique", salary: "90 000" },
]

const salaryGridDocuments = [
  {
    title: "Grille Salariale 2024 - Image (Caméra & Lumière)",
    description: "Barème officiel pour chefs opérateurs, assistants caméra, électriciens et machinistes.",
    type: "PDF",
    size: "245 KB",
    date: "Mars à Juin 2024",
    recommended: true,
  },
  {
    title: "Grille Salariale 2024 - Son",
    description: "Tarifs de référence pour ingénieurs son, perchman et assistants.",
    type: "PDF",
    size: "198 KB",
    date: "Mars à Juin 2024",
    recommended: false,
  },
  {
    title: "Grille Salariale 2024 - Post-Production",
    description: "Montage, étalonnage, VFX et finition.",
    type: "PDF",
    size: "156 KB",
    date: "Mars à Juin 2024",
    recommended: false,
  },
]

const contractTemplates = [
  {
    title: "Contrat Type CDD Technicien",
    description: "Modèle de contrat à durée déterminée conforme aux normes RETECHCI.",
    type: "DOCX",
    size: "124 KB",
    version: "Version 2024",
  },
  {
    title: "Contrat Intermittent du Cinéma",
    description: "Pour les techniciens travaillant sur plusieurs productions.",
    type: "DOCX",
    size: "132 KB",
    version: "Version 2024",
  },
]

const officialDocuments = [
  {
    title: "Statuts de l'Association RETECHCI",
    description: "Document fondateur et règlement intérieur complet.",
    type: "PDF",
    size: "512 KB",
    date: "Adopté Juillet 2022",
    recommended: true,
  },
  {
    title: "Charte Éthique & Déontologie",
    description: "Code de conduite et bonnes pratiques professionnelles.",
    type: "PDF",
    size: "278 KB",
    version: "Version 2023",
    recommended: false,
  },
  {
    title: "Convention Collective Nationale",
    description: "Accord-cadre entre producteurs et techniciens (en négociation).",
    type: "PDF",
    size: "623 KB",
    date: "Projet 2024",
    inNegotiation: true,
  },
]

function SalaryCategory({ 
  title, 
  badge, 
  badgeColor, 
  roles, 
  t 
}: { 
  title: string
  badge: string
  badgeColor: string
  roles: { role: string; salary: string }[]
  t: (key: string) => string
}) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div className="space-y-3">
        {roles.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-muted-foreground">{item.role}</span>
            <span className="text-primary font-medium">{item.salary} <span className="text-xs text-muted-foreground">{t("conventions.perWeek")}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentCard({
  title,
  description,
  type,
  size,
  date,
  version,
  recommended,
  inNegotiation,
  t,
}: {
  title: string
  description: string
  type: string
  size: string
  date?: string
  version?: string
  recommended?: boolean
  inNegotiation?: boolean
  t: (key: string) => string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {recommended && (
              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                {t("conventions.recommended")}
              </span>
            )}
            {inNegotiation && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                {t("conventions.inNegotiation")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {type}
            </span>
            <span>{size}</span>
            {date && <span>{date}</span>}
            {version && <span>{version}</span>}
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Download className="w-4 h-4" />
        {t("conventions.download")}
      </Button>
    </div>
  )
}

export default function ConventionsPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("conventions.title")} <span className="text-primary">{t("conventions.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {t("conventions.subtitle")}
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-10 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-500">{t("conventions.warning")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("conventions.warningText")}
              </p>
            </div>
          </div>

          {/* Salary Grid Minima */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("conventions.salaryGrid")}</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="grid md:grid-cols-3 gap-8">
                <SalaryCategory
                  title={t("conventions.categoryA")}
                  badge={t("conventions.seniorPositions")}
                  badgeColor="bg-primary/20 text-primary"
                  roles={categoryA}
                  t={t}
                />
                <SalaryCategory
                  title={t("conventions.categoryB")}
                  badge={t("conventions.technicianPositions")}
                  badgeColor="bg-amber-500/20 text-amber-500"
                  roles={categoryB}
                  t={t}
                />
                <SalaryCategory
                  title={t("conventions.categoryC")}
                  badge={t("conventions.assistants")}
                  badgeColor="bg-muted text-muted-foreground"
                  roles={categoryC}
                  t={t}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
                * Les tarifs sont des minima recommandés pour une semaine de base (5 jours/8h jour). Les heures supplémentaires et répétitions de nuit s&apos;appliquent conformément au Code du Travail.
              </p>
            </div>
          </section>

          {/* Salary Grid Documents */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("conventions.salaryGrids")}</h2>
            </div>
            
            <div className="space-y-4">
              {salaryGridDocuments.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  description={doc.description}
                  type={doc.type}
                  size={doc.size}
                  date={doc.date}
                  recommended={doc.recommended}
                  t={t}
                />
              ))}
            </div>
          </section>

          {/* Contract Templates */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("conventions.contractTemplates")}</h2>
            </div>
            
            <div className="space-y-4">
              {contractTemplates.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  description={doc.description}
                  type={doc.type}
                  size={doc.size}
                  version={doc.version}
                  t={t}
                />
              ))}
            </div>
          </section>

          {/* Official Documents */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("conventions.officialDocs")}</h2>
            </div>
            
            <div className="space-y-4">
              {officialDocuments.map((doc, index) => (
                <DocumentCard
                  key={index}
                  title={doc.title}
                  description={doc.description}
                  type={doc.type}
                  size={doc.size}
                  date={doc.date}
                  recommended={doc.recommended}
                  inNegotiation={doc.inNegotiation}
                  t={t}
                />
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t("conventions.needDoc")}</h3>
              <p className="text-muted-foreground">{t("conventions.needDocText")}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t("conventions.contactUs")}
            </Button>
          </section>
        </div>
      </main>
      <Partners />
      <Footer />
    </div>
  )
}
