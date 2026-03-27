"use client"

import { useState, useEffect } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { 
  Users, Mail, FileText, CheckCircle, XCircle, Clock, 
  Search, Eye, MessageSquare, Building2, UserPlus,
  TrendingUp, Calendar, Bell, Send, Video, Settings,
  Link2, Copy, Receipt, Plus, Shield, LogOut, CalendarDays,
  Loader2, RefreshCw, Trash2
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

interface Member {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  profession: string
  status: string
  category: string
  years_experience: number
  adhesion_paid: boolean
  profile_photo: string | null
  role: string
}

interface ContactRequest {
  id: string
  requester_name: string
  requester_email: string
  requester_phone: string
  target_type: string
  target_name: string
  message: string
  status: string
  created_at: string
}

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: string
  convened_by: string
}

interface Payment {
  id: string
  member_id: string
  amount: number
  type: string
  status: string
  payment_date: string
  year: number
  month: number
}

export default function DirectorDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ email: "", role: "" })
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Data states
  const [adhesionRequests, setAdhesionRequests] = useState<AdhesionRequest[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    pendingContacts: 0,
    monthlyRevenue: 0
  })

  // Fetch all data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch adhesion requests
      const { data: adhesions } = await supabase
        .from('adhesion_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fetch members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fetch contact requests
      const { data: contacts } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fetch meetings
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true })
      
      // Fetch payments for this month
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('year', currentYear)
        .eq('month', currentMonth)
      
      setAdhesionRequests(adhesions || [])
      setMembers(membersData || [])
      setContactRequests(contacts || [])
      setMeetings(meetingsData || [])
      setPayments(paymentsData || [])
      
      // Calculate stats
      const activeMembers = membersData?.filter(m => m.status === 'active').length || 0
      const pendingAdhesions = adhesions?.filter(a => a.status === 'pending').length || 0
      const pendingContactsCount = contacts?.filter(c => c.status === 'pending').length || 0
      const monthlyRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      
      setStats({
        totalMembers: activeMembers,
        pendingRequests: pendingAdhesions,
        pendingContacts: pendingContactsCount,
        monthlyRevenue
      })
      
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  // Send adhesion to President for validation
  const handleSendToPresident = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const { error } = await supabase
        .from('adhesion_requests')
        .update({ status: 'sent_to_president' })
        .eq('id', requestId)
      
      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'envoi")
    }
    setActionLoading(null)
  }

  // Reject adhesion request
  const handleRejectAdhesion = async (requestId: string) => {
    if (!confirm("Etes-vous sur de vouloir rejeter cette demande ?")) return
    
    setActionLoading(requestId)
    try {
      const { error } = await supabase
        .from('adhesion_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
      
      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors du rejet")
    }
    setActionLoading(null)
  }

  // Handle contact request
  const handleContactResponse = async (contactId: string, status: 'replied' | 'archived') => {
    setActionLoading(contactId)
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ 
          status,
          handled_at: new Date().toISOString()
        })
        .eq('id', contactId)
      
      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
    setActionLoading(null)
  }

  // Update member level/category
  const handleUpdateMemberLevel = async (memberId: string, category: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ category })
        .eq('id', memberId)
      
      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Send activation link to approved member
  const handleSendActivationLink = async (request: AdhesionRequest) => {
    setActionLoading(request.id)
    try {
      // Create member from adhesion request
      const memberId = `CI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      
      const { error } = await supabase
        .from('members')
        .insert({
          member_id: memberId,
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
          phone: request.phone,
          profession: request.profession,
          years_experience: request.years_experience,
          status: 'pending_payment',
          role: 'member',
          category: request.years_experience >= 10 ? 'senior' : request.years_experience >= 5 ? 'intermediate' : 'junior',
          adhesion_paid: false
        })
      
      if (error) throw error
      
      // Update adhesion request status
      await supabase
        .from('adhesion_requests')
        .update({ status: 'activation_sent' })
        .eq('id', request.id)
      
      alert(`Lien d'activation envoye a ${request.first_name} ${request.last_name} (${request.email})`)
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'envoi du lien")
    }
    setActionLoading(null)
  }

  // Invite new member directly
  const handleInviteMember = async () => {
    if (!inviteEmail) return
    
    setActionLoading('invite')
    try {
      // Get the current site URL
      const siteUrl = window.location.origin
      
      // Use Supabase Auth to send magic link invitation
      const { error } = await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          emailRedirectTo: `${siteUrl}/adhesion?invited=true&email=${encodeURIComponent(inviteEmail)}`,
          data: {
            invited_by: 'directeur',
            invitation_date: new Date().toISOString()
          }
        }
      })
      
      if (error) {
        if (error.message.includes('rate limit')) {
          alert("Trop de demandes. Veuillez attendre quelques minutes avant de renvoyer.")
        } else {
          throw error
        }
      } else {
        alert(`Email d'invitation envoyé à ${inviteEmail}.\n\nLe destinataire recevra un lien pour rejoindre le réseau RETECHCI.`)
        setInviteEmail("")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'envoi de l'invitation. Vérifiez que l'email est valide.")
    }
    setActionLoading(null)
  }

  // Create new admin
  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.role) return
    
    setActionLoading('admin')
    try {
      const { error } = await supabase
        .from('members')
        .update({ role: newAdmin.role })
        .eq('email', newAdmin.email)
      
      if (error) throw error
      
      alert(`Role ${newAdmin.role} attribue a ${newAdmin.email}`)
      setShowAdminModal(false)
      setNewAdmin({ email: "", role: "" })
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur: Verifiez que l'email existe dans la base")
    }
    setActionLoading(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin")
  }

  const filteredMembers = members.filter(m => 
    m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                <Badge variant="outline" className="text-primary border-primary">
                  Directeur Executif
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
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" onClick={() => setShowAdminModal(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Creer Admin
              </Button>
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingRequests}</p>
                    <p className="text-sm text-muted-foreground">Adhesions en attente</p>
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
                    <p className="text-sm text-muted-foreground">Messages a traiter</p>
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
              <TabsTrigger value="memberships">Adhesions ({adhesionRequests.filter(a => a.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="approved">Valides par PCA ({adhesionRequests.filter(a => a.status === 'approved').length})</TabsTrigger>
              <TabsTrigger value="members">Tous les membres ({members.length})</TabsTrigger>
              <TabsTrigger value="contacts">Messages ({contactRequests.filter(c => c.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="meetings">Reunions</TabsTrigger>
            </TabsList>

            {/* Adhesion Requests Tab */}
            <TabsContent value="memberships">
              <div className="space-y-6">
                {/* Quick invite */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inviter directement un membre</CardTitle>
                    <CardDescription>Envoyez un lien d&apos;inscription direct</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="email@exemple.com" 
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="max-w-sm"
                      />
                      <Button onClick={handleInviteMember} disabled={actionLoading === 'invite'}>
                        {actionLoading === 'invite' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Envoyer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes d&apos;adhesion en attente</CardTitle>
                    <CardDescription>Transmettez les dossiers au President du CA pour validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {adhesionRequests.filter(a => a.status === 'pending').length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucune demande en attente</p>
                    ) : (
                      <div className="space-y-4">
                        {adhesionRequests.filter(a => a.status === 'pending').map((request) => (
                          <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">{request.first_name} {request.last_name}</h4>
                                {request.signature_data && (
                                  <Badge variant="outline" className="text-xs">Signe</Badge>
                                )}
                              </div>
                              <p className="text-sm text-primary">{request.profession}</p>
                              <p className="text-xs text-muted-foreground">
                                {request.years_experience} ans d&apos;experience - {request.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Soumis le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Voir
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Demande d&apos;adhesion</DialogTitle>
                                  </DialogHeader>
                                  {selectedRequest && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Nom</Label>
                                          <p className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Profession</Label>
                                          <p className="font-medium">{selectedRequest.profession}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Email</Label>
                                          <p className="font-medium">{selectedRequest.email}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Telephone</Label>
                                          <p className="font-medium">{selectedRequest.phone}</p>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Experience</Label>
                                          <p className="font-medium">{selectedRequest.years_experience} ans</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Motivation</Label>
                                        <p className="text-sm mt-1 p-3 bg-secondary/50 rounded-lg">{selectedRequest.motivation}</p>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button 
                                size="sm" 
                                onClick={() => handleSendToPresident(request.id)}
                                disabled={actionLoading === request.id}
                              >
                                {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                                Transmettre au PCA
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectAdhesion(request.id)}
                                disabled={actionLoading === request.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sent to president */}
                <Card>
                  <CardHeader>
                    <CardTitle>En attente de validation du President</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adhesionRequests.filter(a => a.status === 'sent_to_president').length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Aucune demande en attente</p>
                    ) : (
                      <div className="space-y-3">
                        {adhesionRequests.filter(a => a.status === 'sent_to_president').map((request) => (
                          <div key={request.id} className="flex items-center gap-4 p-3 bg-blue-500/10 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                              <p className="font-medium">{request.first_name} {request.last_name}</p>
                              <p className="text-sm text-muted-foreground">{request.profession}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-600">En attente PCA</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Approved by President - Send Activation */}
            <TabsContent value="approved">
              <Card>
                <CardHeader>
                  <CardTitle>Membres valides par le President</CardTitle>
                  <CardDescription>Envoyez le lien d&apos;activation pour finaliser l&apos;inscription</CardDescription>
                </CardHeader>
                <CardContent>
                  {adhesionRequests.filter(a => a.status === 'approved').length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune adhesion validee en attente d&apos;activation</p>
                  ) : (
                    <div className="space-y-4">
                      {adhesionRequests.filter(a => a.status === 'approved').map((request) => (
                        <div key={request.id} className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{request.first_name} {request.last_name}</h4>
                            <p className="text-sm text-muted-foreground">{request.email} - {request.profession}</p>
                          </div>
                          <Button 
                            onClick={() => handleSendActivationLink(request)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Envoyer le lien d&apos;activation
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h4 className="font-medium mb-2">Processus d&apos;activation</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Le membre recoit le lien par email</li>
                      <li>Il paie son adhesion (5 000 FCFA)</li>
                      <li>Il cree son compte (email + mot de passe)</li>
                      <li>Sa carte membre est generee automatiquement</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tous les membres</CardTitle>
                      <CardDescription>Gerez les niveaux et les informations des membres</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Profession</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Exp.</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Niveau</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 text-sm font-mono">{member.member_id}</td>
                            <td className="py-3 px-4 font-medium">{member.first_name} {member.last_name}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{member.profession}</td>
                            <td className="py-3 px-4 text-sm">{member.years_experience || 0} ans</td>
                            <td className="py-3 px-4">
                              <Select 
                                defaultValue={member.category || 'junior'} 
                                onValueChange={(value) => handleUpdateMemberLevel(member.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="junior">Junior</SelectItem>
                                  <SelectItem value="intermediate">Intermediaire</SelectItem>
                                  <SelectItem value="senior">Senior</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                member.status === "active" ? "bg-green-500/20 text-green-600" :
                                member.status === "pending" ? "bg-amber-500/20 text-amber-600" :
                                "bg-red-500/20 text-red-600"
                              }>
                                {member.status === "active" ? "Actif" : 
                                 member.status === "pending" ? "En attente" : member.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/membre/${member.id}`)}>
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

            {/* Contact Requests Tab */}
            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Demandes de contact</CardTitle>
                  <CardDescription>Messages recus via le site web</CardDescription>
                </CardHeader>
                <CardContent>
                  {contactRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun message</p>
                  ) : (
                    <div className="space-y-4">
                      {contactRequests.map((contact) => (
                        <div key={contact.id} className={`p-4 rounded-xl ${contact.status === 'pending' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-secondary/30'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{contact.requester_name}</h4>
                                <Badge variant={contact.status === 'pending' ? 'default' : 'secondary'}>
                                  {contact.status === 'pending' ? 'Nouveau' : contact.status === 'replied' ? 'Repondu' : 'Archive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {contact.requester_email} - {contact.requester_phone}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                Concerne: <span className="text-foreground">{contact.target_name}</span> ({contact.target_type})
                              </p>
                              <p className="text-sm p-3 bg-background rounded-lg">{contact.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(contact.created_at).toLocaleDateString('fr-FR', { 
                                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {contact.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleContactResponse(contact.id, 'replied')}
                                  disabled={actionLoading === contact.id}
                                >
                                  {actionLoading === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                  Repondu
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleContactResponse(contact.id, 'archived')}
                                  disabled={actionLoading === contact.id}
                                >
                                  Archiver
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Meetings Tab */}
            <TabsContent value="meetings">
              <Card>
                <CardHeader>
                  <CardTitle>Reunions et convocations</CardTitle>
                  <CardDescription>Reunions convoquees par le President du CA</CardDescription>
                </CardHeader>
                <CardContent>
                  {meetings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune reunion planifiee</p>
                  ) : (
                    <div className="space-y-4">
                      {meetings.map((meeting) => (
                        <div key={meeting.id} className="p-4 bg-secondary/30 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold">{meeting.title}</h4>
                              <p className="text-sm text-muted-foreground">{meeting.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(meeting.date).toLocaleDateString('fr-FR', { 
                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                  })}
                                </span>
                                <span>{meeting.location}</span>
                              </div>
                            </div>
                            <Badge>{meeting.type}</Badge>
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

      {/* Create Admin Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creer un administrateur</DialogTitle>
            <DialogDescription>
              Attribuez un role d&apos;administration a un membre existant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email du membre</Label>
              <Input 
                placeholder="membre@email.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({...newAdmin, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Directeur Executif</SelectItem>
                  <SelectItem value="president">President CA</SelectItem>
                  <SelectItem value="treasurer">Tresorier(e)</SelectItem>
                  <SelectItem value="admin">Admin CMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminModal(false)}>Annuler</Button>
            <Button onClick={handleCreateAdmin} disabled={actionLoading === 'admin'}>
              {actionLoading === 'admin' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Attribuer le role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
