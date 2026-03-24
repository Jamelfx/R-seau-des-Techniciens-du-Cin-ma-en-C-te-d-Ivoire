"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, Mail, FileText, CheckCircle, XCircle, Clock, 
  Search, Eye, MessageSquare, Building2, UserPlus,
  TrendingUp, Calendar, Bell, Send, Video, Settings,
  Link2, Copy, Receipt, Plus, Shield, LogOut, CalendarDays
} from "lucide-react"
import Image from "next/image"

// Mock data
const contactRequests = [
  { id: "1", name: "Production ABC", email: "contact@prodabc.ci", company: "AFRICA STUDIO PROD", message: "Demande de devis pour location matériel tournage", date: "2024-01-15", status: "pending" },
  { id: "2", name: "Jean Kouame", email: "j.kouame@email.com", company: "CINE TECH CI", message: "Besoin d'un steadicam pour 2 semaines", date: "2024-01-14", status: "pending" },
  { id: "3", name: "Marie Bamba", email: "marie.b@film.ci", company: "Mawa Couture", message: "Costumes pour long métrage historique", date: "2024-01-13", status: "replied" },
]

const membershipRequests = [
  { id: "1", name: "Amadou Diarra", email: "amadou.d@email.com", specialty: "Chef Électricien", experience: "8 ans", date: "2024-01-15", status: "pending", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", signature: true },
  { id: "2", name: "Fatou Keita", email: "fatou.k@email.com", specialty: "Scripte", experience: "5 ans", date: "2024-01-14", status: "pending", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", signature: true },
  { id: "3", name: "Paul Yao", email: "paul.y@email.com", specialty: "Ingénieur Son", experience: "10 ans", date: "2024-01-12", status: "sent_to_president", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", signature: true },
]

const allMembers = [
  { id: "CI-2024-001", name: "Jamel Basiru", specialty: "Monteur Image", email: "jamel@email.com", cotisation: "paid", phone: "+225 07 XX XX XX", level: "Senior", experience: 12 },
  { id: "CI-2024-002", name: "Sophie Kouassi", specialty: "Chef Op", email: "sophie@email.com", cotisation: "paid", phone: "+225 05 XX XX XX", level: "Senior", experience: 15 },
  { id: "CI-2024-003", name: "Marc Zadi", specialty: "Ingenieur Son", email: "marc@email.com", cotisation: "pending", phone: "+225 01 XX XX XX", level: "Intermediaire", experience: 8 },
  { id: "CI-2024-004", name: "Awa Diallo", specialty: "Scripte", email: "awa@email.com", cotisation: "paid", phone: "+225 07 XX XX XX", level: "Junior", experience: 3 },
  { id: "CI-2024-005", name: "Yves Bamba", specialty: "Cadreur", email: "yves@email.com", cotisation: "overdue", phone: "+225 05 XX XX XX", level: "Intermediaire", experience: 6 },
]

const expenses = [
  { id: "1", description: "Location salle AG", amount: 150000, date: "2024-01-20", invoice: true },
  { id: "2", description: "Impression cartes membres", amount: 85000, date: "2024-01-18", invoice: true },
  { id: "3", description: "Frais SITECH préparation", amount: 250000, date: "2024-01-15", invoice: false },
]

const convocationsReceived = [
  { id: "1", title: "Assemblée Générale Annuelle", date: "2024-03-10", time: "10:00", location: "Sofitel Ivoire", convoquePar: "Président CA", status: "pending" },
  { id: "2", title: "Conseil d'Administration Q1", date: "2024-02-15", time: "14:00", location: "Siège RETECHCI", convoquePar: "Président CA", status: "confirmed" },
]

const validatedMembers = [
  { id: "1", name: "Paul Yao", email: "paul.y@email.com", validatedAt: "2024-01-12", linkSent: false },
  { id: "2", name: "Marie Kouadio", email: "marie.k@email.com", validatedAt: "2024-01-10", linkSent: true },
]

export default function DirectorDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ email: "", role: "" })

  const stats = {
    totalMembers: 512,
    pendingRequests: 2,
    pendingContacts: 2,
    monthlyRevenue: 1024000
  }

  const handleSendToPresident = (requestId: string) => {
    console.log("Sending request to President:", requestId)
    // In production, this would be an API call
  }

  const handleSendPaymentLink = (email: string, name: string) => {
    const paymentLink = `https://retechci.ci/paiement/${Date.now()}`
    console.log("Sending payment link to:", email, paymentLink)
    alert(`Lien de paiement envoyé à ${name} (${email})`)
  }

  const handleSendDirectLink = () => {
    const directLink = `https://retechci.ci/inscription/${Date.now()}`
    navigator.clipboard.writeText(directLink)
    alert(`Lien copié: ${directLink}`)
  }

  const handleCreateAdmin = () => {
    console.log("Creating admin:", newAdmin)
    setShowAdminModal(false)
    setNewAdmin({ email: "", role: "" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const handleLogout = () => {
    router.push("/admin")
  }

  const handleRespondConvocation = (convId: string, response: "confirmed" | "declined") => {
    console.log("Responding to convocation:", convId, response)
    alert(`Réponse enregistrée: ${response === "confirmed" ? "Présent" : "Absent"}`)
  }

  const handleSendActivationLink = (email: string, name: string) => {
    const activationLink = `https://retechci.ci/activation/${Date.now()}`
    console.log("Sending activation link to:", email, activationLink)
    alert(`Lien d'activation envoyé à ${name} (${email})\n\nLe membre pourra payer son adhésion (5 000 FCFA) et créer son compte.`)
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
              <Button variant="outline" onClick={() => setShowAdminModal(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Créer Admin
              </Button>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  4
                </span>
              </Button>
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
                    <p className="text-xl font-bold text-foreground">{formatCurrency(stats.monthlyRevenue)}</p>
                    <p className="text-sm text-muted-foreground">Cotisations ce mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="memberships" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="memberships">Adhésions</TabsTrigger>
              <TabsTrigger value="validated">Membres validés</TabsTrigger>
              <TabsTrigger value="convocations">Convocations</TabsTrigger>
              <TabsTrigger value="members">Tous les membres</TabsTrigger>
              <TabsTrigger value="contacts">Messages</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
              <TabsTrigger value="live">Direct</TabsTrigger>
              <TabsTrigger value="sitech">SITECH 2027</TabsTrigger>
            </TabsList>

            {/* Membership Requests Tab */}
            <TabsContent value="memberships">
              <div className="space-y-6">
                {/* Quick invite */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inviter directement un membre</CardTitle>
                    <CardDescription>Envoyez un lien pour créer un compte sans formulaire d&apos;adhésion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="email@exemple.com" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="max-w-sm"
                      />
                      <Button onClick={() => handleSendPaymentLink(inviteEmail, inviteEmail)}>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer le lien
                      </Button>
                      <Button variant="outline" onClick={handleSendDirectLink}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le lien
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending requests */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Demandes d&apos;adhésion</CardTitle>
                        <CardDescription>Transmettez les dossiers au Président du CA pour validation</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {membershipRequests.map((request) => (
                        <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={request.photo} alt={request.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{request.name}</h4>
                              {request.signature && (
                                <Badge variant="outline" className="text-xs">Signé</Badge>
                              )}
                            </div>
                            <p className="text-sm text-primary">{request.specialty}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.experience} d&apos;expérience - {request.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Soumis le {new Date(request.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            {request.status === "pending" ? (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Voir
                                </Button>
                                <Button size="sm" onClick={() => handleSendToPresident(request.id)}>
                                  <Send className="h-4 w-4 mr-1" />
                                  Transmettre au PCA
                                </Button>
                              </div>
                            ) : request.status === "sent_to_president" ? (
                              <Badge className="bg-blue-500/20 text-blue-600">
                                <Clock className="h-3 w-3 mr-1" />
                                En attente PCA
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Badge className="bg-green-500/20 text-green-600">Validé</Badge>
                                <Button size="sm" onClick={() => handleSendPaymentLink(request.email, request.name)}>
                                  <Link2 className="h-4 w-4 mr-1" />
                                  Envoyer lien paiement
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Validated Members Tab - Send activation links */}
            <TabsContent value="validated">
              <Card>
                <CardHeader>
                  <CardTitle>Membres validés par le Président</CardTitle>
                  <CardDescription>Envoyez le lien de paiement et création de compte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validatedMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Validé le {new Date(member.validatedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          {member.linkSent ? (
                            <Badge className="bg-green-500/20 text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Lien envoyé
                            </Badge>
                          ) : (
                            <Button onClick={() => handleSendActivationLink(member.email, member.name)}>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer le lien d&apos;activation
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h4 className="font-medium mb-2">Processus d&apos;activation</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Le membre reçoit le lien par email</li>
                      <li>Il paie son adhésion (5 000 FCFA)</li>
                      <li>Il crée son compte (email + mot de passe)</li>
                      <li>Sa carte membre est générée automatiquement</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Convocations Tab */}
            <TabsContent value="convocations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Convocations reçues</CardTitle>
                    <CardDescription>Réunions convoquées par le Président du CA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {convocationsReceived.map((conv) => (
                        <div key={conv.id} className="p-4 bg-secondary/30 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold">{conv.title}</h4>
                              <p className="text-xs text-muted-foreground">Convoqué par: {conv.convoquePar}</p>
                            </div>
                            <Badge variant={conv.status === "confirmed" ? "default" : "outline"}>
                              {conv.status === "confirmed" ? "Confirmé" : "En attente"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {new Date(conv.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {conv.time}
                            </div>
                          </div>
                          {conv.status === "pending" && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-green-500 hover:bg-green-600"
                                onClick={() => handleRespondConvocation(conv.id, "confirmed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Présent
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleRespondConvocation(conv.id, "declined")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Convoquer une réunion</CardTitle>
                    <CardDescription>Le Président sera informé de cette convocation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Titre de la réunion</Label>
                      <Input placeholder="Ex: Réunion préparation SITECH" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Heure</Label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div>
                      <Label>Lieu</Label>
                      <Input placeholder="Ex: Siège RETECHCI" />
                    </div>
                    <div>
                      <Label>Ordre du jour</Label>
                      <Textarea placeholder="Points à aborder..." />
                    </div>
                    <Button className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer les convocations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* All Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Liste des membres</CardTitle>
                      <CardDescription>{allMembers.length} membres enregistrés</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un membre..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nom</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Specialite</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Exp.</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Niveau</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cotisation</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMembers.filter(m => 
                          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.specialty.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((member) => (
                          <tr key={member.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 text-sm font-mono">{member.id}</td>
                            <td className="py-3 px-4 font-medium">{member.name}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{member.specialty}</td>
                            <td className="py-3 px-4 text-sm">{member.experience} ans</td>
                            <td className="py-3 px-4">
                              <Select defaultValue={member.level}>
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Junior">Junior</SelectItem>
                                  <SelectItem value="Intermediaire">Intermediaire</SelectItem>
                                  <SelectItem value="Senior">Senior</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                member.cotisation === "paid" ? "bg-green-500/20 text-green-600" :
                                member.cotisation === "pending" ? "bg-amber-500/20 text-amber-600" :
                                "bg-red-500/20 text-red-600"
                              }>
                                {member.cotisation === "paid" ? "A jour" : 
                                 member.cotisation === "pending" ? "En attente" : "En retard"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Demandes de contact</CardTitle>
                  <CardDescription>Messages reçus via l&apos;annuaire</CardDescription>
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
                          <p className="text-sm text-muted-foreground mt-2">{request.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{request.email} - {new Date(request.date).toLocaleDateString('fr-FR')}</p>
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

            {/* Finances Tab */}
            <TabsContent value="finances">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cotisations des membres</CardTitle>
                    <CardDescription>Suivi des paiements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                        <span>À jour</span>
                        <span className="font-bold text-green-600">425 membres</span>
                      </div>
                      <div className="flex justify-between p-3 bg-amber-500/10 rounded-lg">
                        <span>En attente</span>
                        <span className="font-bold text-amber-600">52 membres</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                        <span>En retard</span>
                        <span className="font-bold text-red-600">35 membres</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dépenses récentes</CardTitle>
                    <CardDescription>Entrées par la Trésorière</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString('fr-FR')}</p>
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
            </TabsContent>

            {/* Live Tab */}
            <TabsContent value="live">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion du Direct</CardTitle>
                  <CardDescription>Lancez et gérez les diffusions en direct</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Statut du direct</h3>
                        <p className="text-muted-foreground">Aucune diffusion en cours</p>
                      </div>
                    </div>
                    <Button size="lg" className="bg-red-500 hover:bg-red-600">
                      <Video className="h-5 w-5 mr-2" />
                      Lancer le direct
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Titre du direct</Label>
                          <Input placeholder="Ex: AG Trimestrielle Q1 2024" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea placeholder="Description de l'événement..." />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <h4 className="font-medium mb-2">Statistiques</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernière diffusion</span>
                          <span>Il y a 3 jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spectateurs max</span>
                          <span>127</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durée moyenne</span>
                          <span>1h 45min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SITECH Tab */}
            <TabsContent value="sitech">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion SITECH 2027</CardTitle>
                  <CardDescription>Administrez la page du salon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-xl text-center">
                      <p className="text-3xl font-bold text-primary">127</p>
                      <p className="text-sm text-muted-foreground">Inscriptions exposants</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl text-center">
                      <p className="text-3xl font-bold text-primary">342</p>
                      <p className="text-sm text-muted-foreground">Inscriptions participants</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-xl text-center">
                      <p className="text-3xl font-bold text-green-500">8</p>
                      <p className="text-sm text-muted-foreground">Partenaires confirmés</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Modifier la page SITECH
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter les inscriptions
                    </Button>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un partenaire
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Créer un compte Admin</CardTitle>
              <CardDescription>Assignez un accès spécifique à un utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="admin@email.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <Select value={newAdmin.role} onValueChange={(v) => setNewAdmin({ ...newAdmin, role: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="president">Président du CA</SelectItem>
                    <SelectItem value="tresorier">Trésorier</SelectItem>
                    <SelectItem value="secretaire">Secrétaire</SelectItem>
                    <SelectItem value="moderateur">Modérateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdminModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleCreateAdmin}>
                  Créer le compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
