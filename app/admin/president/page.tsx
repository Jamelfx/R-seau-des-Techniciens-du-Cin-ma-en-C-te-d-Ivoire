"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, TrendingUp, FileText, Eye, Calendar, 
  BarChart3, PieChart, Award, Building, Shield,
  CheckCircle, Clock, AlertCircle, ChevronRight
} from "lucide-react"

// Mock data
const councilMembers = [
  { name: "Amadou Koné", role: "Président", status: "active" },
  { name: "Marie Bamba", role: "Vice-Président", status: "active" },
  { name: "Jean-Pierre Yao", role: "Secrétaire Général", status: "active" },
  { name: "Fatou Diallo", role: "Trésorier", status: "active" },
  { name: "Eric Kouassi", role: "Membre", status: "active" },
]

const strategicDecisions = [
  { id: "1", title: "Augmentation cotisation annuelle", status: "pending", votes: { for: 3, against: 1, abstain: 1 }, date: "2024-02-01" },
  { id: "2", title: "Partenariat FESPACO 2025", status: "approved", votes: { for: 5, against: 0, abstain: 0 }, date: "2024-01-20" },
  { id: "3", title: "Création commission Formation", status: "approved", votes: { for: 4, against: 0, abstain: 1 }, date: "2024-01-15" },
]

const upcomingMeetings = [
  { title: "Conseil d'Administration Q1", date: "2024-02-15", time: "14:00", location: "Siège RETECHCI" },
  { title: "Assemblée Générale Annuelle", date: "2024-03-10", time: "10:00", location: "Sofitel Ivoire" },
]

const annualReports = [
  { year: 2023, status: "published", members: 450, revenue: "22.5M FCFA", growth: "+18%" },
  { year: 2022, status: "published", members: 380, revenue: "19M FCFA", growth: "+25%" },
]

export default function PresidentDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const stats = {
    totalMembers: 512,
    activeProjects: 3,
    pendingDecisions: 1,
    partnerships: 8
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-8 px-6 lg:px-20 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                  <Award className="h-3 w-3 mr-1" />
                  Président du CA
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Conseil d&apos;Administration
              </h1>
              <p className="text-muted-foreground">
                Vision stratégique et gouvernance du RETECHCI
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                    <p className="text-sm text-muted-foreground">Membres total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
                    <p className="text-sm text-muted-foreground">Projets actifs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingDecisions}</p>
                    <p className="text-sm text-muted-foreground">Décisions en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.partnerships}</p>
                    <p className="text-sm text-muted-foreground">Partenariats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="decisions">Décisions</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="council">Conseil</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart Placeholder */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Croissance des membres</CardTitle>
                    <CardDescription>Évolution sur les 12 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-secondary/30 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Graphique de croissance</p>
                        <p className="text-2xl font-bold text-green-500 mt-2">+18%</p>
                        <p className="text-sm text-muted-foreground">vs année précédente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Meetings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prochaines réunions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingMeetings.map((meeting, index) => (
                      <div key={index} className="p-4 bg-secondary/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground text-sm">{meeting.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <p className="text-xs text-muted-foreground">{meeting.time} - {meeting.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Decisions */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Décisions stratégiques récentes</CardTitle>
                      <Button variant="outline" size="sm">
                        Voir tout
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {strategicDecisions.map((decision) => (
                        <div key={decision.id} className="p-4 bg-secondary/30 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-foreground text-sm">{decision.title}</h4>
                            <Badge variant={decision.status === "approved" ? "default" : "outline"} className={decision.status === "approved" ? "bg-green-500/20 text-green-500" : ""}>
                              {decision.status === "approved" ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Approuvé</>
                              ) : (
                                <><Clock className="h-3 w-3 mr-1" /> En cours</>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-green-500">Pour: {decision.votes.for}</span>
                            <span className="text-red-500">Contre: {decision.votes.against}</span>
                            <span className="text-muted-foreground">Abstention: {decision.votes.abstain}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(decision.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Decisions Tab */}
            <TabsContent value="decisions">
              <Card>
                <CardHeader>
                  <CardTitle>Décisions du Conseil</CardTitle>
                  <CardDescription>Historique des votes et délibérations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategicDecisions.map((decision) => (
                      <div key={decision.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          decision.status === "approved" ? "bg-green-500/10" : "bg-amber-500/10"
                        }`}>
                          {decision.status === "approved" ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <Clock className="h-6 w-6 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{decision.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(decision.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-500">{decision.votes.for}</p>
                            <p className="text-xs text-muted-foreground">Pour</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-500">{decision.votes.against}</p>
                            <p className="text-xs text-muted-foreground">Contre</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-muted-foreground">{decision.votes.abstain}</p>
                            <p className="text-xs text-muted-foreground">Abstention</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rapports annuels</CardTitle>
                    <CardDescription>Bilans financiers et d&apos;activité</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {annualReports.map((report) => (
                        <div key={report.year} className="p-4 bg-secondary/30 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-foreground">{report.year}</h4>
                            <Badge className="bg-green-500/20 text-green-500">Publié</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Membres</p>
                              <p className="font-bold text-foreground">{report.members}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Revenus</p>
                              <p className="font-bold text-foreground">{report.revenue}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Croissance</p>
                              <p className="font-bold text-green-500">{report.growth}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4">
                            <FileText className="h-4 w-4 mr-2" />
                            Télécharger le rapport
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Indicateurs clés</CardTitle>
                    <CardDescription>Performance de l&apos;association</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Taux de rétention</span>
                        <span className="font-bold text-foreground">92%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Objectif membres 2024</span>
                        <span className="font-bold text-foreground">85%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Satisfaction membres</span>
                        <span className="font-bold text-foreground">88%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Council Tab */}
            <TabsContent value="council">
              <Card>
                <CardHeader>
                  <CardTitle>Membres du Conseil d&apos;Administration</CardTitle>
                  <CardDescription>Composition actuelle du CA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {councilMembers.map((member, index) => (
                      <div key={index} className="p-4 bg-secondary/30 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{member.name}</h4>
                          <p className="text-sm text-primary">{member.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-muted-foreground">Actif</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
