"use client"

import { useState, useEffect, useRef } from "react"
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
  Wallet, TrendingUp, TrendingDown, Users, FileText, 
  Download, Calendar, Search, CheckCircle, Clock,
  AlertCircle, CreditCard, PiggyBank, Receipt, ArrowUpRight, ArrowDownRight,
  Plus, Upload, Eye, Send, History, Calculator, LogOut,
  Loader2, RefreshCw
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Payment {
  id: string
  member_id: string
  amount: number
  type: string
  status: string
  payment_date: string
  payment_method: string
  year: number
  month: number
  reference: string
  member?: {
    first_name: string
    last_name: string
    email: string
    phone: string
    member_id: string
  }
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  expense_date: string
  approved: boolean
  receipt_url: string | null
  notes: string
}

interface Member {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  adhesion_paid: boolean
}

export default function TreasurerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchQuery, setSearchQuery] = useState("")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "operations",
    notes: ""
  })
  
  // Data states
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    totalMembers: 0,
    paidMembers: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      // Fetch payments with member info
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          member:members(first_name, last_name, email, phone, member_id)
        `)
        .order('payment_date', { ascending: false })
        .limit(100)
      
      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .limit(100)
      
      // Fetch all members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')

      setPayments(paymentsData || [])
      setExpenses(expensesData || [])
      setMembers(membersData || [])

      // Calculate stats
      const monthlyPayments = paymentsData?.filter(p => 
        p.year === currentYear && p.month === currentMonth && p.status === 'completed'
      ) || []
      const monthlyIncome = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

      const monthlyExpensesList = expensesData?.filter(e => {
        const expenseDate = new Date(e.expense_date)
        return expenseDate.getFullYear() === currentYear && 
               expenseDate.getMonth() + 1 === currentMonth &&
               e.approved
      }) || []
      const monthlyExpensesTotal = monthlyExpensesList.reduce((sum, e) => sum + (e.amount || 0), 0)

      const totalIncome = paymentsData?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const totalExpenses = expensesData?.filter(e => e.approved).reduce((sum, e) => sum + (e.amount || 0), 0) || 0

      // Members who paid this month
      const paidMemberIds = new Set(monthlyPayments.map(p => p.member_id))

      setStats({
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses: monthlyExpensesTotal,
        pendingPayments: (membersData?.length || 0) - paidMemberIds.size,
        totalMembers: membersData?.length || 0,
        paidMembers: paidMemberIds.size
      })

    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.abs(amount)) + ' FCFA'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin")
  }

  // Record a manual payment
  const handleRecordPayment = async (memberId: string, memberName: string) => {
    setActionLoading(memberId)
    try {
      const currentDate = new Date()
      
      const { error } = await supabase
        .from('payments')
        .insert({
          member_id: memberId,
          amount: 2000,
          type: 'cotisation',
          status: 'completed',
          payment_date: currentDate.toISOString(),
          payment_method: 'especes',
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          reference: `MAN-${Date.now()}`
        })
      
      if (error) throw error
      
      alert(`Paiement de 2 000 FCFA enregistre pour ${memberName}`)
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'enregistrement")
    }
    setActionLoading(null)
  }

  // Add expense
  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    setActionLoading('expense')
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          description: newExpense.description,
          amount: parseInt(newExpense.amount),
          category: newExpense.category,
          expense_date: new Date().toISOString().split('T')[0],
          notes: newExpense.notes,
          approved: false
        })
      
      if (error) throw error
      
      alert("Depense enregistree (en attente d'approbation)")
      setShowExpenseModal(false)
      setNewExpense({ description: "", amount: "", category: "operations", notes: "" })
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
      alert("Erreur lors de l'enregistrement")
    }
    setActionLoading(null)
  }

  // Approve expense
  const handleApproveExpense = async (expenseId: string) => {
    setActionLoading(expenseId)
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ approved: true })
        .eq('id', expenseId)
      
      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
    setActionLoading(null)
  }

  // Get members who haven't paid this month
  const getMembersWithPendingPayments = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    const paidMemberIds = new Set(
      payments
        .filter(p => p.year === currentYear && p.month === currentMonth && p.status === 'completed')
        .map(p => p.member_id)
    )
    
    return members.filter(m => !paidMemberIds.has(m.id))
  }

  const pendingMembers = getMembersWithPendingPayments()
  const recentPayments = payments.filter(p => p.status === 'completed').slice(0, 20)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des donnees financieres...</p>
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
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  <Wallet className="h-3 w-3 mr-1" />
                  Tresoriere
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gestion Financiere
              </h1>
              <p className="text-muted-foreground">
                Suivi des cotisations (2 000 FCFA/mois) et depenses du RETECHCI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={() => setShowExpenseModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle depense
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
                    <PiggyBank className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(stats.balance)}</p>
                    <p className="text-sm text-muted-foreground">Solde total</p>
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
                    <p className="text-xl font-bold text-green-500">+{formatCurrency(stats.monthlyIncome)}</p>
                    <p className="text-sm text-muted-foreground">Recettes du mois</p>
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
                    <p className="text-xl font-bold text-red-500">-{formatCurrency(stats.monthlyExpenses)}</p>
                    <p className="text-sm text-muted-foreground">Depenses du mois</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={stats.pendingPayments > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stats.pendingPayments}</p>
                    <p className="text-sm text-muted-foreground">Cotisations en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="payments" className="space-y-6">
            <TabsList>
              <TabsTrigger value="payments">
                Paiements recus
                <span className="ml-2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {recentPayments.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                En attente
                {pendingMembers.length > 0 && (
                  <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingMembers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expenses">Depenses</TabsTrigger>
              <TabsTrigger value="members">Tous les membres</TabsTrigger>
            </TabsList>

            {/* Payments Received Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-500" />
                        Paiements recus
                      </CardTitle>
                      <CardDescription>Cotisations et autres paiements</CardDescription>
                    </div>
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-lg px-4 py-2">
                      {stats.paidMembers}/{stats.totalMembers} a jour
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentPayments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun paiement enregistre</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">
                                {payment.member?.first_name} {payment.member?.last_name}
                              </h4>
                              <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                                {payment.member?.member_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {payment.payment_method || 'Non specifie'}
                              </span>
                              <span>{payment.type}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-500">+{formatCurrency(payment.amount)}</p>
                            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirme
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Payments Tab */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Cotisations en attente</CardTitle>
                  <CardDescription>Membres n&apos;ayant pas paye ce mois-ci</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMembers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>Tous les membres sont a jour !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{member.first_name} {member.last_name}</h4>
                              <span className="text-xs text-muted-foreground font-mono">{member.member_id}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-sm text-muted-foreground">{member.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">2 000 FCFA</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleRecordPayment(member.id, `${member.first_name} ${member.last_name}`)}
                              disabled={actionLoading === member.id}
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Paye
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Depenses</CardTitle>
                      <CardDescription>Historique des depenses de l&apos;organisation</CardDescription>
                    </div>
                    <Button onClick={() => setShowExpenseModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une depense
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune depense enregistree</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{expense.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} - {new Date(expense.expense_date).toLocaleDateString('fr-FR')}
                            </p>
                            {expense.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{expense.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">-{formatCurrency(expense.amount)}</p>
                            {expense.approved ? (
                              <Badge className="bg-green-500/20 text-green-600">Approuve</Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-amber-600">En attente</Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleApproveExpense(expense.id)}
                                  disabled={actionLoading === expense.id}
                                >
                                  {actionLoading === expense.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3" />
                                  )}
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

            {/* All Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Statut des cotisations</CardTitle>
                      <CardDescription>Vue d&apos;ensemble des paiements par membre</CardDescription>
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut ce mois</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members
                          .filter(m => 
                            m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((member) => {
                            const hasPaid = !pendingMembers.find(pm => pm.id === member.id)
                            return (
                              <tr key={member.id} className="border-b border-border hover:bg-secondary/30">
                                <td className="py-3 px-4 text-sm font-mono">{member.member_id}</td>
                                <td className="py-3 px-4 font-medium">{member.first_name} {member.last_name}</td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">{member.email}</td>
                                <td className="py-3 px-4">
                                  {hasPaid ? (
                                    <Badge className="bg-green-500/20 text-green-600">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      A jour
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                      <Clock className="h-3 w-3 mr-1" />
                                      En attente
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {!hasPaid && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleRecordPayment(member.id, `${member.first_name} ${member.last_name}`)}
                                      disabled={actionLoading === member.id}
                                    >
                                      {actionLoading === member.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Enregistrer paiement"
                                      )}
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Add Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle depense</DialogTitle>
            <DialogDescription>
              Enregistrez une depense de l&apos;organisation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description *</Label>
              <Input 
                placeholder="Ex: Location salle reunion"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Montant (FCFA) *</Label>
              <Input 
                type="number"
                placeholder="50000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
            <div>
              <Label>Categorie</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense({...newExpense, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="events">Evenements</SelectItem>
                  <SelectItem value="equipment">Equipement</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                placeholder="Details supplementaires..."
                value={newExpense.notes}
                onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseModal(false)}>Annuler</Button>
            <Button onClick={handleAddExpense} disabled={actionLoading === 'expense'}>
              {actionLoading === 'expense' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
