"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, TrendingUp, FileText, Eye, Calendar, 
  BarChart3, Award, Building, CheckCircle, Clock, 
  XCircle, Send, AlertTriangle, ChevronRight, Gavel,
  Shield, Vote, History, LogOut, Plus, CalendarDays,
  MapPin, UserCheck, UserX, Mail, TrendingDown, Receipt
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

const meetings = [
  { id: "1", title: "Conseil d'Administration Q1", date: "2024-02-15", time: "14:00", location: "Siège RETECHCI", type: "ca", status: "confirmed", confirmations: 4, total: 5 },
  { id: "2", title: "Assemblée Générale Annuelle", date: "2024-03-10", time: "10:00", location: "Sofitel Ivoire", type: "ag", status: "pending", confirmations: 156, total: 512 },
]

const convocations = [
  { id: "1", memberId: "CI-2024-001", name: "Jamel Basiru", email: "jamel@email.com", meeting: "Assemblée Générale Annuelle", response: "confirmed" },
  { id: "2", memberId: "CI-2024-002", name: "Sophie Kouassi", email: "sophie@email.com", meeting: "Assemblée Générale Annuelle", response: "confirmed" },
  { id: "3", memberId: "CI-2024-003", name: "Marc Zadi", email: "marc@email.com", meeting: "Assemblée Générale Annuelle", response: "declined" },
  { id: "4", memberId: "CI-2024-004", name: "Awa Diallo", email: "awa@email.com", meeting: "Assemblée Générale Annuelle", response: "pending" },
]

const financialStats = {
  totalCotisations: 1024000,
  totalExpenses: 485000,
  balance: 4250000,
  pendingCotisations: 52
}

const recentExpenses = [
  { id: "1", description: "Location salle AG", amount: 150000, date: "2024-01-20", invoice: true },
  { id: "2", description: "Impression cartes membres", amount: 85000, date: "2024-01-18", invoice: true },
  { id: "3", description: "Frais SITECH préparation", amount: 250000, date: "2024-01-15", invoice: false },
]

export default function PresidentDashboard() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("validations")
  const [selectedRequest, setSelectedRequest] = useState<typeof pendingMemberRequests[0] | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showConvocationModal, setShowConvocationModal] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    type: "ca",
    date: "",
    time: "",
    location: "",
    description: ""
  })

  const stats = {
    totalMembers: 512,
    pendingValidations: pendingMemberRequests.length,
    upcomingMeetings: meetings.length,
    partnerships: 8
  }

  const handleLogout = () => {
    router.push("/admin")
  }

  const handleApprove = (requestId: string) => {
    console.log("Approving member:", requestId)
    alert("Membre approuvé. Le Directeur Exécutif pourra maintenant envoyer le lien de paiement.")
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

  const handleCreateMeeting = () => {
    console.log("Creating meeting:", newMeeting)
    alert(`Convocation envoyée à ${newMeeting.type === "ag" ? "tous les membres" : "tous les membres du CA"}`)
    setShowConvocationModal(false)
    setNewMeeting({ title: "", type: "ca", date: "", time: "", location: "", description: "" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
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
                Validations, convocations et suivi financier
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={showConvocationModal} onOpenChange={setShowConvocationModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Convoquer une réunion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle convocation</DialogTitle>
                    <DialogDescription>
                      Convoquez une réunion du CA ou une Assemblée Générale
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Type de réunion</Label>
                      <Select value={newMeeting.type} onValueChange={(v) => setNewMeeting({...newMeeting, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">Conseil d&apos;Administration</SelectItem>
                          <SelectItem value="ag">Assemblée Générale</SelectItem>
                          <SelectItem value="ag_extra">AG Extraordinaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Titre</Label>
                      <Input 
                        placeholder="Ex: Conseil d'Administration Q1 2024"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input 
                          type="date"
                          value={newMeeting.date}
                          onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Heure</Label>
                        <Input 
                          type="time"
                          value={newMeeting.time}
                          onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Lieu</Label>
                      <Input 
                        placeholder="Ex: Siège RETECHCI, Abidjan"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Ordre du jour</Label>
                      <Textarea 
                        placeholder="Points à aborder lors de cette réunion..."
                        value={newMeeting.description}
                        onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateMeeting}>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer les convocations
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
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
                    <p className="text-sm text-muted-foreground">Membres total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={stats.pendingValidations > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}>
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.upcomingMeetings}</p>
                    <p className="text-sm text-muted-foreground">Réunions à venir</p>
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
                    <p className="text-lg font-bold text-foreground">{formatCurrency(financialStats.balance)}</p>
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
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
              <TabsTrigger value="meetings">Réunions & AG</TabsTrigger>
              <TabsTrigger value="finances">Suivi Financier</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
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

            {/* Meetings Tab */}
            <TabsContent value="meetings">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Réunions à venir</CardTitle>
                      <CardDescription>Gérez les convocations et suivez les confirmations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {meetings.map((meeting) => (
                          <div key={meeting.id} className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={meeting.type === "ag" ? "bg-amber-500/20 text-amber-600" : "bg-blue-500/20 text-blue-600"}>
                                    {meeting.type === "ag" ? "Assemblée Générale" : meeting.type === "ag_extra" ? "AG Extraordinaire" : "Conseil d'Administration"}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-lg">{meeting.title}</h4>
                              </div>
                              <Badge variant={meeting.status === "confirmed" ? "default" : "outline"}>
                                {meeting.status === "confirmed" ? "Confirmée" : "En attente"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {meeting.time}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {meeting.location}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{meeting.confirmations} confirmés</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">sur {meeting.total}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir les réponses
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Convocation responses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Réponses aux convocations</CardTitle>
                      <CardDescription>Assemblée Générale Annuelle - 10 Mars 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {convocations.map((conv) => (
                          <div key={conv.id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              conv.response === "confirmed" ? "bg-green-500/10" :
                              conv.response === "declined" ? "bg-red-500/10" : "bg-amber-500/10"
                            }`}>
                              {conv.response === "confirmed" ? (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              ) : conv.response === "declined" ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{conv.name}</p>
                              <p className="text-xs text-muted-foreground">{conv.memberId}</p>
                            </div>
                            <Badge variant="outline" className={
                              conv.response === "confirmed" ? "text-green-600 border-green-500/30" :
                              conv.response === "declined" ? "text-red-600 border-red-500/30" : ""
                            }>
                              {conv.response === "confirmed" ? "Présent" :
                               conv.response === "declined" ? "Absent" : "En attente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" onClick={() => setShowConvocationModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Convoquer une AG
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setShowConvocationModal(true)}>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Convoquer le CA
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Relancer les non-réponses
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Statistiques réunions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                        <span>Présences confirmées</span>
                        <span className="font-bold text-green-600">156</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                        <span>Absences déclarées</span>
                        <span className="font-bold text-red-600">23</span>
                      </div>
                      <div className="flex justify-between p-3 bg-amber-500/10 rounded-lg">
                        <span>Sans réponse</span>
                        <span className="font-bold text-amber-600">333</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Finances Tab */}
            <TabsContent value="finances">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Financial overview */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-green-500">+{formatCurrency(financialStats.totalCotisations)}</p>
                            <p className="text-sm text-muted-foreground">Cotisations ce mois</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-red-500">-{formatCurrency(financialStats.totalExpenses)}</p>
                            <p className="text-sm text-muted-foreground">Dépenses ce mois</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent expenses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dépenses récentes</CardTitle>
                      <CardDescription>Enregistrées par la Trésorière</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentExpenses.map((expense) => (
                          <div key={expense.id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
                            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(expense.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-red-500">-{formatCurrency(expense.amount)}</span>
                              {expense.invoice && (
                                <Badge variant="outline" className="text-xs">
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Facture
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Résumé cotisations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>À jour</span>
                        </div>
                        <span className="font-bold text-green-600">425</span>
                      </div>
                      <div className="flex justify-between p-3 bg-amber-500/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>En attente</span>
                        </div>
                        <span className="font-bold text-amber-600">{financialStats.pendingCotisations}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>En retard (+7j)</span>
                        </div>
                        <span className="font-bold text-red-600">35</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bilan mensuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Recettes</span>
                          <span className="font-medium text-green-500">+{formatCurrency(financialStats.totalCotisations)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dépenses</span>
                          <span className="font-medium text-red-500">-{formatCurrency(financialStats.totalExpenses)}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between">
                          <span className="font-medium">Solde</span>
                          <span className="font-bold text-primary">{formatCurrency(financialStats.balance)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des décisions</CardTitle>
                  <CardDescription>Toutes vos validations et refus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Paul Yao", specialty: "Ingénieur Son", decision: "approved", date: "2024-01-12" },
                      { name: "Marie Kouadio", specialty: "Costumière", decision: "approved", date: "2024-01-10" },
                      { name: "Eric Sanogo", specialty: "Machiniste", decision: "rejected", date: "2024-01-08", reason: "Documents incomplets" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.decision === "approved" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {item.decision === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.specialty}</p>
                          {item.reason && (
                            <p className="text-xs text-red-500 mt-1">Motif: {item.reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={item.decision === "approved" ? "default" : "destructive"}>
                            {item.decision === "approved" ? "Approuvé" : "Refusé"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.date).toLocaleDateString('fr-FR')}
                          </p>
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
