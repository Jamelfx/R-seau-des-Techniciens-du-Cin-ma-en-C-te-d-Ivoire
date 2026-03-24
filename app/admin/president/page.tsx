"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Users, TrendingUp, FileText, Eye, Calendar, 
  BarChart3, Award, Building, CheckCircle, Clock, 
  XCircle, Send, AlertTriangle, ChevronRight, Gavel,
  Shield, Vote, History
} from "lucide-react"
import Image from "next/image"

// Mock data
const pendingMemberRequests = [
  { 
    id: "1", 
    name: "Amadou Diarra", 
    specialty: "Chef Électricien", 
    experience: "8 ans",
    email: "amadou.d@email.com",
    phone: "+225 07 12 34 56",
    motivation: "Passionné de cinéma depuis plus de 10 ans, je souhaite rejoindre le RETECHCI pour contribuer à la professionnalisation du secteur.",
    references: "A travaillé sur 15+ productions",
    date: "2024-01-15", 
    sentBy: "Jamel Basiru",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    signature: true
  },
  { 
    id: "2", 
    name: "Fatou Keita", 
    specialty: "Scripte", 
    experience: "5 ans",
    email: "fatou.k@email.com",
    phone: "+225 05 98 76 54",
    motivation: "Scripte professionnelle, je cherche à élargir mon réseau et participer aux initiatives collectives.",
    references: "Diplômée INSAAC",
    date: "2024-01-14", 
    sentBy: "Jamel Basiru",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    signature: true
  },
]

const recentDecisions = [
  { id: "1", name: "Paul Yao", specialty: "Ingénieur Son", decision: "approved", date: "2024-01-12", reason: null },
  { id: "2", name: "Marie Kouadio", specialty: "Costumière", decision: "approved", date: "2024-01-10", reason: null },
  { id: "3", name: "Eric Sanogo", specialty: "Machiniste", decision: "rejected", date: "2024-01-08", reason: "Documents incomplets" },
]

const strategicVotes = [
  { id: "1", title: "Augmentation cotisation annuelle 2025", status: "pending", deadline: "2024-02-01", description: "Proposition d'augmenter la cotisation de 2000 FCFA à 2500 FCFA" },
  { id: "2", title: "Partenariat FESPACO 2025", status: "voted", result: "approved", votes: { for: 5, against: 0, abstain: 0 }, date: "2024-01-20" },
  { id: "3", title: "Création commission Formation", status: "voted", result: "approved", votes: { for: 4, against: 0, abstain: 1 }, date: "2024-01-15" },
]

const councilMembers = [
  { name: "Amadou Koné", role: "Président", status: "active", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" },
  { name: "Marie Bamba", role: "Vice-Présidente", status: "active", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" },
  { name: "Jean-Pierre Yao", role: "Secrétaire Général", status: "active", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
  { name: "Fatou Diallo", role: "Trésorière", status: "active", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
  { name: "Eric Kouassi", role: "Membre", status: "active", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100" },
]

const upcomingMeetings = [
  { title: "Conseil d'Administration Q1", date: "2024-02-15", time: "14:00", location: "Siège RETECHCI", type: "ca" },
  { title: "Assemblée Générale Annuelle", date: "2024-03-10", time: "10:00", location: "Sofitel Ivoire", type: "ag" },
]

export default function PresidentDashboard() {
  const [selectedTab, setSelectedTab] = useState("validations")
  const [selectedRequest, setSelectedRequest] = useState<typeof pendingMemberRequests[0] | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const stats = {
    totalMembers: 512,
    pendingValidations: pendingMemberRequests.length,
    pendingVotes: strategicVotes.filter(v => v.status === "pending").length,
    partnerships: 8
  }

  const handleApprove = (requestId: string) => {
    console.log("Approving member:", requestId)
    // This would be an API call in production
    // After approval, a payment link is sent automatically
    alert("Membre approuvé. Un lien de paiement sera envoyé automatiquement.")
    setSelectedRequest(null)
  }

  const handleReject = (requestId: string) => {
    if (!rejectionReason) {
      alert("Veuillez indiquer un motif de refus")
      return
    }
    console.log("Rejecting member:", requestId, "Reason:", rejectionReason)
    alert("Demande refusée. Le candidat sera notifié.")
    setSelectedRequest(null)
    setRejectionReason("")
  }

  const handleVote = (voteId: string, decision: "for" | "against" | "abstain") => {
    console.log("Voting:", voteId, decision)
    alert(`Vote enregistré: ${decision === "for" ? "Pour" : decision === "against" ? "Contre" : "Abstention"}`)
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
                  Président du Conseil d&apos;Administration
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gouvernance du RETECHCI
              </h1>
              <p className="text-muted-foreground">
                Validations, votes stratégiques et rapports d&apos;activité
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
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingValidations}</p>
                    <p className="text-sm text-muted-foreground">Validations en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={stats.pendingVotes > 0 ? "border-blue-500/30 bg-blue-500/5" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Vote className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingVotes}</p>
                    <p className="text-sm text-muted-foreground">Votes en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-green-500" />
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
              <TabsTrigger value="validations" className="relative">
                Validations
                {stats.pendingValidations > 0 && (
                  <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingValidations}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="votes">Votes stratégiques</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="council">Conseil</TabsTrigger>
            </TabsList>

            {/* Validations Tab */}
            <TabsContent value="validations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes d&apos;adhésion à valider</CardTitle>
                      <CardDescription>
                        Dossiers transmis par le Directeur Exécutif pour approbation finale
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pendingMemberRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                          <p>Aucune demande en attente</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {pendingMemberRequests.map((request) => (
                            <div 
                              key={request.id} 
                              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                                selectedRequest?.id === request.id 
                                  ? "bg-primary/10 border border-primary/30" 
                                  : "bg-secondary/30 hover:bg-secondary/50"
                              }`}
                              onClick={() => setSelectedRequest(request)}
                            >
                              <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                                <Image src={request.photo} alt={request.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-foreground">{request.name}</h4>
                                  {request.signature && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Signé
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-primary">{request.specialty}</p>
                                <p className="text-xs text-muted-foreground">
                                  {request.experience} d&apos;expérience - Transmis par {request.sentBy}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(request.date).toLocaleDateString('fr-FR')}
                                </Badge>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Detail Panel */}
                <div>
                  {selectedRequest ? (
                    <Card className="sticky top-24">
                      <CardHeader>
                        <CardTitle className="text-lg">Détails du dossier</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-full overflow-hidden">
                            <Image src={selectedRequest.photo} alt={selectedRequest.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{selectedRequest.name}</h3>
                            <p className="text-primary">{selectedRequest.specialty}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div>
                            <Label className="text-xs text-muted-foreground">Expérience</Label>
                            <p className="font-medium">{selectedRequest.experience}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Contact</Label>
                            <p className="text-sm">{selectedRequest.email}</p>
                            <p className="text-sm">{selectedRequest.phone}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Motivation</Label>
                            <p className="text-sm">{selectedRequest.motivation}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Références</Label>
                            <p className="text-sm">{selectedRequest.references}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div>
                            <Label className="text-xs text-muted-foreground">Motif de refus (optionnel)</Label>
                            <Textarea 
                              placeholder="Expliquez le motif si vous refusez..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleReject(selectedRequest.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>
                          <Button 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(selectedRequest.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Valider
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Sélectionnez une demande pour voir les détails</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Votes Tab */}
            <TabsContent value="votes">
              <div className="space-y-6">
                {/* Pending Votes */}
                {strategicVotes.filter(v => v.status === "pending").length > 0 && (
                  <Card className="border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-blue-500" />
                        Votes en cours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {strategicVotes.filter(v => v.status === "pending").map((vote) => (
                        <div key={vote.id} className="p-4 bg-blue-500/10 rounded-xl">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-lg">{vote.title}</h4>
                              <p className="text-sm text-muted-foreground">{vote.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Date limite : {new Date(vote.deadline!).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente de vote
                            </Badge>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={() => handleVote(vote.id, "for")}
                            >
                              Pour
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleVote(vote.id, "against")}
                            >
                              Contre
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleVote(vote.id, "abstain")}
                            >
                              Abstention
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Past Votes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des votes</CardTitle>
                    <CardDescription>Décisions stratégiques passées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strategicVotes.filter(v => v.status === "voted").map((vote) => (
                        <div key={vote.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            vote.result === "approved" ? "bg-green-500/10" : "bg-red-500/10"
                          }`}>
                            {vote.result === "approved" ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{vote.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(vote.date!).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="font-bold text-green-500">{vote.votes!.for}</p>
                              <p className="text-xs text-muted-foreground">Pour</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-red-500">{vote.votes!.against}</p>
                              <p className="text-xs text-muted-foreground">Contre</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-muted-foreground">{vote.votes!.abstain}</p>
                              <p className="text-xs text-muted-foreground">Abstention</p>
                            </div>
                          </div>
                          <Badge className={vote.result === "approved" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}>
                            {vote.result === "approved" ? "Approuvé" : "Refusé"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des validations
                  </CardTitle>
                  <CardDescription>Toutes les décisions d&apos;adhésion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentDecisions.map((decision, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          decision.decision === "approved" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {decision.decision === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{decision.name}</h4>
                          <p className="text-sm text-primary">{decision.specialty}</p>
                          {decision.reason && (
                            <p className="text-xs text-red-500 mt-1">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {decision.reason}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={decision.decision === "approved" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}>
                            {decision.decision === "approved" ? "Approuvé" : "Refusé"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(decision.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
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
                    <CardTitle>Croissance des membres</CardTitle>
                    <CardDescription>Évolution annuelle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-secondary/30 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-2xl font-bold text-green-500">+18%</p>
                        <p className="text-sm text-muted-foreground">vs année précédente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prochaines réunions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingMeetings.map((meeting, index) => (
                      <div key={index} className="p-4 bg-secondary/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            meeting.type === "ag" ? "bg-amber-500/10" : "bg-primary/10"
                          }`}>
                            <Calendar className={`h-5 w-5 ${meeting.type === "ag" ? "text-amber-500" : "text-primary"}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{meeting.title}</h4>
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

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Indicateurs clés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <p className="text-3xl font-bold text-foreground">92%</p>
                        <p className="text-sm text-muted-foreground">Taux de rétention</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <p className="text-3xl font-bold text-foreground">85%</p>
                        <p className="text-sm text-muted-foreground">Objectif membres</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <p className="text-3xl font-bold text-foreground">88%</p>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <p className="text-3xl font-bold text-foreground">95%</p>
                        <p className="text-sm text-muted-foreground">Taux de cotisation</p>
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
                        <div className="relative w-14 h-14 rounded-full overflow-hidden">
                          <Image src={member.photo} alt={member.name} fill className="object-cover" />
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
      <Footer />
    </div>
  )
}
