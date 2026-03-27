"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Partners } from "@/components/partners"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download, FileText, Star, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SalaryItem {
  id: string
  department: string
  job_title: string
  daily_rate_min: number
  daily_rate_max: number
  weekly_rate_min: number
  weekly_rate_max: number
  year: number
}

interface Document {
  id: string
  title: string
  description: string
  category: string
  file_url: string
  file_type: string
  file_size: string
  version: string
  date_info: string
  is_recommended: boolean
  is_negotiation: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount)
}

function DocumentCard({
  doc,
  t,
}: {
  doc: Document
  t: (key: string) => string
}) {
  const handleDownload = () => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground">{doc.title}</h4>
            {doc.is_recommended && (
              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                {t("conventions.recommended")}
              </span>
            )}
            {doc.is_negotiation && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                {t("conventions.inNegotiation")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {doc.file_type || 'PDF'}
            </span>
            {doc.file_size && <span>{doc.file_size}</span>}
            {doc.date_info && <span>{doc.date_info}</span>}
            {doc.version && <span>{doc.version}</span>}
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleDownload}
        disabled={!doc.file_url}
      >
        <Download className="w-4 h-4" />
        {t("conventions.download")}
      </Button>
    </div>
  )
}

export default function ConventionsPage() {
  const { t } = useI18n()
  const [salaryGrid, setSalaryGrid] = useState<SalaryItem[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch salary grid
      const { data: salaryData } = await supabase
        .from('salary_grid')
        .select('*')
        .eq('active', true)
        .eq('year', 2026)
        .order('order_index')
      
      // Fetch documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('active', true)
        .order('order_index')
      
      if (salaryData) setSalaryGrid(salaryData)
      if (docsData) setDocuments(docsData)
      setLoading(false)
    }
    
    fetchData()
  }, [])

  // Group salary by department
  const groupedSalary = salaryGrid.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = []
    }
    acc[item.department].push(item)
    return acc
  }, {} as Record<string, SalaryItem[]>)

  const salaryGridDocs = documents.filter(d => d.category === 'salary_grid')
  const contractDocs = documents.filter(d => d.category === 'contract')
  const officialDocs = documents.filter(d => d.category === 'official' || d.category === 'charter')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

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

          {/* Salary Grid Minima 2026 */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Grille Salariale Minima 2026</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
              {Object.keys(groupedSalary).length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupedSalary).map(([department, items]) => (
                    <div key={department}>
                      <h3 className="text-lg font-semibold text-primary mb-4 border-b border-border pb-2">
                        {department}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="pb-3 font-medium">Poste</th>
                              <th className="pb-3 font-medium text-right">Tarif Jour (Min)</th>
                              <th className="pb-3 font-medium text-right">Tarif Jour (Max)</th>
                              <th className="pb-3 font-medium text-right">Tarif Semaine (Min)</th>
                              <th className="pb-3 font-medium text-right">Tarif Semaine (Max)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr key={item.id} className="border-t border-border/50">
                                <td className="py-3 font-medium text-foreground">{item.job_title}</td>
                                <td className="py-3 text-right text-muted-foreground">
                                  {formatCurrency(item.daily_rate_min)} FCFA
                                </td>
                                <td className="py-3 text-right text-primary font-medium">
                                  {formatCurrency(item.daily_rate_max)} FCFA
                                </td>
                                <td className="py-3 text-right text-muted-foreground">
                                  {formatCurrency(item.weekly_rate_min)} FCFA
                                </td>
                                <td className="py-3 text-right text-primary font-medium">
                                  {formatCurrency(item.weekly_rate_max)} FCFA
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  La grille salariale sera bientot disponible. Revenez plus tard.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
                * Les tarifs sont des minima recommandes. Les heures supplementaires et repetitions de nuit s&apos;appliquent conformement au Code du Travail.
              </p>
            </div>
          </section>

          {/* Salary Grid Documents */}
          {salaryGridDocs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">{t("conventions.salaryGrids")}</h2>
              </div>
              
              <div className="space-y-4">
                {salaryGridDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* Contract Templates */}
          {contractDocs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">{t("conventions.contractTemplates")}</h2>
              </div>
              
              <div className="space-y-4">
                {contractDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* Official Documents */}
          {officialDocs.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">{t("conventions.officialDocs")}</h2>
              </div>
              
              <div className="space-y-4">
                {officialDocs.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} t={t} />
                ))}
              </div>
            </section>
          )}

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
