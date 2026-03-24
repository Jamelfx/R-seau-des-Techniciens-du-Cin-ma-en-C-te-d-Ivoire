"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Mail, FileText, CheckCircle, XCircle, Clock, 
  Search, Eye, MessageSquare, Building2, UserPlus,
  TrendingUp, Calendar, Bell
} from "lucide-react"
import Image from "next/image"

// Mock data
const contactRequests = [
  { id: "1", name: "Production ABC", email: "contact@prodabc.ci", company: "AFRICA STUDIO PROD", message: "Demande de devis pour location matériel tournage", date: "2024-01-15", status: "pending" },
  { id: "2", name: "Jean Kouame", email: "j.kouame@email.com", company: "CINE TECH CI", message: "Besoin d'un steadicam pour 2 semaines", date: "2024-01-14", status: "pending" },
  { id: "3", name: "Marie Bamba", email: "marie.b@film.ci", company: "Mawa Couture", message: "Costumes pour long métrage historique", date: "2024-01-13", status: "replied" },
]

const membershipRequests = [
  { id: "1", name: "Amadou Diarra", specialty: "Chef Électricien", experience: "senior", date: "2024-01-15", status: "pending", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  { id: "2", name: "Fatou Keita", specialty: "Scripte", experience: "intermediate", date: "2024-01-14", status: "pending", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  { id: "3", name: "Paul Yao", specialty: "Ingénieur Son", experience: "senior", date: "2024-01-12", status: "approved", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
]

const recentActivity = [
  { type: "member", action: "Nouveau membre approuvé", name: "Paul Yao", time: "Il y a 2 heures" },
  { type: "contact", action: "Message répondu", name: "Production XYZ", time: "Il y a 5 heures" },
  { type: "member", action: "Demande d'adhésion reçue", name: "Fatou Keita", time: "Hier" },
]

export default function DirectorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = {
    totalMembers: 512,
    pendingRequests: 2,
    pendingContacts: 2,
    newThisMonth: 15
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
                <Badge variant="outline" className="text-primary border-primary">
                  Directeur Exécutif
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground">
                Gestion quotidienne du RETECHCI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  4
                </span>
              </Button>
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
                    <p className="text-sm text-muted-foreground">Membres actifs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingRequests}</p>
                    <p className="text-sm text-muted-foreground">Adhésions en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingContacts}</p>
                    <p className="text-sm text-muted-foreground">Messages à traiter</p>
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
                    <p className="text-2xl font-bold text-foreground">+{stats.newThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="contacts" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="contacts" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Demandes de contact
                    <Badge variant="secondary" className="ml-1">{contactRequests.filter(c => c.status === "pending").length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="memberships" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adhésions
                    <Badge variant="secondary" className="ml-1">{membershipRequests.filter(m => m.status === "pending").length}</Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Contact Requests */}
                <TabsContent value="contacts">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Demandes de contact</CardTitle>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {contactRequests.map((request) => (
                          <div key={request.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-foreground">{request.name}</h4>
                                  <p className="text-sm text-primary">{request.company}</p>
                                </div>
                                <Badge variant={request.status === "pending" ? "outline" : "secondary"}>
                                  {request.status === "pending" ? (
                                    <><Clock className="h-3 w-3 mr-1" /> En attente</>
                                  ) : (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Répondu</>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{request.message}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs text-muted-foreground">{request.email}</span>
                                <span className="text-xs text-muted-foreground">{new Date(request.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Membership Requests */}
                <TabsContent value="memberships">
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes d&apos;adhésion</CardTitle>
                      <CardDescription>Validez les nouveaux membres</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {membershipRequests.map((request) => (
                          <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image src={request.photo} alt={request.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">{request.name}</h4>
                                <Badge variant="outline" className="capitalize">{request.experience}</Badge>
                              </div>
                              <p className="text-sm text-primary">{request.specialty}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Soumis le {new Date(request.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            {request.status === "pending" ? (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-500">Approuvé</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === "member" ? "bg-green-500/10" : "bg-blue-500/10"
                        }`}>
                          {activity.type === "member" ? (
                            <Users className="h-4 w-4 text-green-500" />
                          ) : (
                            <Mail className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{activity.action}</p>
                          <p className="text-xs text-primary">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un membre
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Exporter la liste
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planifier un événement
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
