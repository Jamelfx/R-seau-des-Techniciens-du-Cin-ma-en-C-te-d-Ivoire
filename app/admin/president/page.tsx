"use client"

import { useState, useEffect } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, TrendingUp, FileText, Eye, Calendar, 
  BarChart3, Award, Building, CheckCircle, Clock, 
  XCircle, Send, AlertTriangle, ChevronRight, Gavel,
  Shield, Vote, History, LogOut, Plus, CalendarDays,
  MapPin, UserCheck, UserX, Mail, TrendingDown, Receipt,
  Loader2, RefreshCw
} from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface AdhesionRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  years_experience: number
  motivation: string
  status: string
  created_at: string
  signature_data: string | null
}

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: string
  agenda: string
  online_link: string
}

interface Member {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  status: string
}

interface Payment {
  id: string
  amount: number
  type: string
  status: string
  payment_date: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  expense_date: string
  approved: boolean
}

export default function PresidentDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("validations")
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showConvocationModal, setShowConvocationModal] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    type: "ca",
    date: "",
    time: "",
    location: "",
    description: "",
    agenda: ""
  })

  // Data states
  const [adhesionRequests, setAdhesionRequests] = useState<AdhesionRequest[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingValidations: 0,
    upcomingMeetings: 0,
    balance: 0,
    totalCotisations: 0,
    totalExpenses: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch adhesion requests sent to president
      const { data: adhesions } = await supabase
        .from('adhesion_requests')
        .select('*')
        .eq('status', 'sent_to_president')
        .order('created_at', { ascending: false })
      
      // Fetch meetings
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
      
      // Fetch all members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
      
      // Fetch payments this year
      const currentYear = new Date().getFullYear()
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('year', currentYear)
        .eq('status', 'completed')
      
      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .limit(20)

      setAdhesionRequests(adhesions || [])
      setMeetings(meetingsData || [])
      setMembers(membersData || [])
      setPayments(paymentsData || [])
      setExpenses(expensesData || [])

      // Calculate stats
      const totalCotisations = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const totalExpensesAmount = expensesData?.filter(e => e.approved).reduce((sum, e) => sum + (e.amount || 0), 0) || 0

      setStats({
        totalMembers: membersData?.length || 0,
        pendingValidations: adhesions?.length || 0,
        upcomingMeetings: meetingsData?.length || 0,
        balance: totalCotisations - totalExpensesAmount,
        totalCotisations,
        totalExpenses: totalExpensesAmount
      })

    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin")
  }

  const handleApprove = async (request: AdhesionRequest) => {
    setActionLoading(request.id)
    try {
      const { error } = await supabase
        .from('adhesion_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)
      
      if (error) throw error
      
      alert(`Adhesion approuvee pour ${request.first_name} ${request.last_name}. Le Directeur Executif pourra envoyer le lien d'activation.`)
      setSelectedRequest(null)
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'approbation")
    }
    setActionLoading(null)
  }

  const handleReject = async (request: AdhesionRequest) => {
    if (!rejectionReason) {
      alert("Veuillez indiquer un motif de refus")
      return
    }
    
    setActionLoading(request.id)
    try {
      const { error } = await supabase
        .from('adhesion_requests')
        .update({ 
          status: 'rejected',
          notes: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id)
      
      if (error) throw error
      
      alert("Demande refusee. Le candidat sera notifie.")
      setSelectedRequest(null)
      setRejectionReason("")
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors du refus")
    }
    setActionLoading(null)
  }

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.location) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    setActionLoading('meeting')
    try {
      const meetingDate = new Date(`${newMeeting.date}T${newMeeting.time || '10:00'}`)
      
      const { error } = await supabase
        .from('meetings')
        .insert({
          title: newMeeting.title,
          type: newMeeting.type,
          date: meetingDate.toISOString(),
          location: newMeeting.location,
          description: newMeeting.description,
          agenda: newMeeting.agenda
        })
      
      if (error) throw error
      
      alert(`Reunion creee. Les convocations seront envoyees a ${newMeeting.type === "ag" ? "tous les membres" : "tous les membres du CA"}.`)
      setShowConvocationModal(false)
      setNewMeeting({ title: "", type: "ca", date: "", time: "", location: "", description: "", agenda: "" })
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de la creation")
    }
    setActionLoading(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des donnees...</p>
        </div>
      </div>
    )
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
                  President du Conseil d&apos;Administration
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
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Dialog open={showConvocationModal} onOpenChange={setShowConvocationModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Convoquer une reunion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle convocation</DialogTitle>
                    <DialogDescription>
                      Convoquez une reunion du CA ou une Assemblee Generale
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Type de reunion</Label>
                      <Select value={newMeeting.type} onValueChange={(v) => setNewMeeting({...newMeeting, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">Conseil d&apos;Administration</SelectItem>
                          <SelectItem value="ag">Assemblee Generale</SelectItem>
                          <SelectItem value="ag_extra">AG Extraordinaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Titre *</Label>
                      <Input 
                        placeholder="Ex: Conseil d'Administration Q1 2024"
                        value={newMeeting.title}
                        onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date *</Label>
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
                      <Label>Lieu *</Label>
                      <Input 
                        placeholder="Ex: Siege RETECHCI, Abidjan"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Ordre du jour</Label>
                      <Textarea 
                        placeholder="Points a aborder lors de cette reunion..."
                        value={newMeeting.agenda}
                        onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConvocationModal(false)}>Annuler</Button>
                    <Button onClick={handleCreateMeeting} disabled={actionLoading === 'meeting'}>
                      {actionLoading === 'meeting' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Envoyer les convocations
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Deconnexion
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
                    <p className="text-sm text-muted-foreground">Reunions a venir</p>
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
                    <p className="text-lg font-bold text-foreground">{formatCurrency(stats.balance)}</p>
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
              <TabsTrigger value="meetings">Reunions & AG</TabsTrigger>
              <TabsTrigger value="finances">Suivi Financier</TabsTrigger>
            </TabsList>

            {/* Validations Tab */}
            <TabsContent value="validations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes d&apos;adhesion a valider</CardTitle>
                      <CardDescription>
                        Dossiers transmis par le Directeur Executif pour approbation finale
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {adhesionRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                          <p>Aucune demande en attente de validation</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {adhesionRequests.map((request) => (
                            <div 
                              key={request.id} 
                              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                                selectedRequest?.id === request.id 
                                  ? "bg-primary/10 border border-primary/30" 
                                  : "bg-secondary/30 hover:bg-secondary/50"
                              }`}
                              onClick={() => setSelectedRequest(request)}
                            >
                              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-foreground">{request.first_name} {request.last_name}</h4>
                                  {request.signature_data && (
                                    <Badge variant="outline" className="text-xs text-green-600 border-green-500/30">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Signe
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-primary">{request.profession}</p>
                                <p className="text-xs text-muted-foreground">
                                  {request.years_experience} ans d&apos;experience - {request.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(request.created_at).toLocaleDateString('fr-FR')}
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
                        <CardTitle className="text-lg">Details du dossier</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{selectedRequest.first_name} {selectedRequest.last_name}</h3>
                            <p className="text-primary">{selectedRequest.profession}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div>
                            <Label className="text-xs text-muted-foreground">Experience</Label>
                            <p className="font-medium">{selectedRequest.years_experience} ans</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Contact</Label>
                            <p className="text-sm">{selectedRequest.email}</p>
                            <p className="text-sm">{selectedRequest.phone}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Motivation</Label>
                            <p className="text-sm p-3 bg-secondary/50 rounded-lg">{selectedRequest.motivation || "Non renseignee"}</p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div>
                            <Label className="text-xs text-muted-foreground">Motif de refus (si applicable)</Label>
                            <Textarea 
                              placeholder="Expliquez le motif si vous refusez..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="destructive" 
                              className="w-full"
                              onClick={() => handleReject(selectedRequest)}
                              disabled={actionLoading === selectedRequest.id}
                            >
                              {actionLoading === selectedRequest.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                              Refuser
                            </Button>
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(selectedRequest)}
                              disabled={actionLoading === selectedRequest.id}
                            >
                              {actionLoading === selectedRequest.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="sticky top-24">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Selectionnez une demande pour voir les details</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Meetings Tab */}
            <TabsContent value="meetings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reunions planifiees</CardTitle>
                    <CardDescription>Prochaines reunions du CA et Assemblees Generales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune reunion planifiee</p>
                        <Button className="mt-4" onClick={() => setShowConvocationModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Convoquer une reunion
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {meetings.map((meeting) => (
                          <div key={meeting.id} className="p-4 bg-secondary/30 rounded-xl">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold">{meeting.title}</h4>
                                  <Badge variant="outline">
                                    {meeting.type === 'ca' ? 'CA' : meeting.type === 'ag' ? 'AG' : 'AG Extra'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                                      weekday: 'long',
                                      day: 'numeric', 
                                      month: 'long', 
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {meeting.location}
                                  </span>
                                </div>
                                {meeting.agenda && (
                                  <div className="mt-3 p-3 bg-background rounded-lg">
                                    <Label className="text-xs text-muted-foreground">Ordre du jour</Label>
                                    <p className="text-sm mt-1">{meeting.agenda}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Finances Tab */}
            <TabsContent value="finances">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCotisations)}</p>
                      <p className="text-sm text-muted-foreground">Cotisations recues</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
                      <p className="text-sm text-muted-foreground">Depenses</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">{formatCurrency(stats.balance)}</p>
                      <p className="text-sm text-muted-foreground">Solde</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Dernieres depenses</CardTitle>
                  <CardDescription>Depenses recentes de l&apos;organisation</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune depense enregistree</p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.slice(0, 10).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(expense.expense_date).toLocaleDateString('fr-FR')} - {expense.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                            <Badge variant={expense.approved ? "default" : "outline"}>
                              {expense.approved ? "Approuve" : "En attente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
