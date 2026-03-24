"use client"

import { useState, useRef } from "react"
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
  Wallet, TrendingUp, TrendingDown, Users, FileText, 
  Download, Calendar, Search, CheckCircle, Clock,
  AlertCircle, CreditCard, PiggyBank, Receipt, ArrowUpRight, ArrowDownRight,
  Plus, Upload, Eye, Send, History, Calculator, LogOut
} from "lucide-react"

// Mock data
const transactions = [
  { id: "1", type: "income", description: "Cotisation - Amadou Diarra", amount: 2000, date: "2024-01-15", status: "completed", memberId: "CI-2024-101" },
  { id: "2", type: "income", description: "Cotisation - Fatou Keita", amount: 2000, date: "2024-01-14", status: "completed", memberId: "CI-2024-102" },
  { id: "3", type: "expense", description: "Location salle réunion", amount: -50000, date: "2024-01-12", status: "completed", invoice: "FAC-2024-001" },
  { id: "4", type: "income", description: "Inscription SITECH 2027 - Production ABC", amount: 75000, date: "2024-01-10", status: "completed" },
  { id: "5", type: "expense", description: "Impression cartes membres", amount: -120000, date: "2024-01-08", status: "completed", invoice: "FAC-2024-002" },
  { id: "6", type: "income", description: "Cotisation - Marc Zadi", amount: 2000, date: "2024-01-05", status: "pending", memberId: "CI-2024-003" },
]

const pendingCotisations = [
  { id: "1", memberId: "CI-2024-003", name: "Jean Kouame", email: "jean@email.com", amount: 2000, dueDate: "2024-01-31", daysOverdue: 0 },
  { id: "2", memberId: "CI-2024-045", name: "Marie Bamba", email: "marie@email.com", amount: 2000, dueDate: "2024-01-15", daysOverdue: 5 },
  { id: "3", memberId: "CI-2024-078", name: "Eric Sanogo", email: "eric@email.com", amount: 2000, dueDate: "2024-01-10", daysOverdue: 10 },
  { id: "4", memberId: "CI-2024-092", name: "Awa Diallo", email: "awa@email.com", amount: 4000, dueDate: "2024-01-05", daysOverdue: 15, months: 2 },
]

const allMembers = [
  { id: "CI-2024-001", name: "Jamel Basiru", email: "jamel@email.com", cotisation: "paid", lastPayment: "2024-01-01" },
  { id: "CI-2024-002", name: "Sophie Kouassi", email: "sophie@email.com", cotisation: "paid", lastPayment: "2024-01-02" },
  { id: "CI-2024-003", name: "Marc Zadi", email: "marc@email.com", cotisation: "pending", lastPayment: "2023-12-01" },
  { id: "CI-2024-004", name: "Awa Diallo", email: "awa@email.com", cotisation: "overdue", lastPayment: "2023-11-01" },
]

const monthlyStats = [
  { month: "Jan", income: 850000, expenses: 320000 },
  { month: "Fév", income: 720000, expenses: 280000 },
  { month: "Mar", income: 950000, expenses: 410000 },
  { month: "Avr", income: 680000, expenses: 250000 },
]

export default function TreasurerDashboard() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchQuery, setSearchQuery] = useState("")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    invoice: null as File | null
  })
  const invoiceInputRef = useRef<HTMLInputElement>(null)

  const stats = {
    balance: 4250000,
    monthlyIncome: 850000,
    monthlyExpenses: 320000,
    pendingPayments: pendingCotisations.length,
    cotisationMensuelle: 2000
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.abs(amount)) + ' FCFA'
  }

  const handleSendReminder = (email: string, name: string) => {
    console.log("Sending reminder to:", email)
    alert(`Rappel envoyé à ${name}`)
  }

  const handleMarkAsPaid = (id: string) => {
    console.log("Marking as paid:", id)
    alert("Paiement enregistré")
  }

  const handleAddExpense = () => {
    console.log("Adding expense:", newExpense)
    setShowExpenseModal(false)
    setNewExpense({ description: "", amount: "", category: "", invoice: null })
    alert("Dépense enregistrée")
  }

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewExpense({ ...newExpense, invoice: file })
    }
  }

  const handleLogout = () => {
    router.push("/admin")
  }

  const handleSendReminderAll = () => {
    alert(`Rappels envoyés à ${pendingCotisations.length} membres`)
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
                  Trésorière
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gestion Financière
              </h1>
              <p className="text-muted-foreground">
                Suivi des cotisations (2 000 FCFA/mois) et dépenses du RETECHCI
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button onClick={() => setShowExpenseModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle dépense
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
                    <p className="text-sm text-muted-foreground">Dépenses du mois</p>
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

          <Tabs defaultValue="cotisations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="cotisations" className="relative">
                Cotisations
                {stats.pendingPayments > 0 && (
                  <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingPayments}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expenses">Dépenses</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            {/* Cotisations Tab */}
            <TabsContent value="cotisations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending cotisations */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Cotisations en attente</CardTitle>
                    <CardDescription>Membres avec paiements en retard ou à venir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingCotisations.map((payment) => (
                        <div key={payment.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.daysOverdue > 7 ? "bg-red-500/10" : 
                            payment.daysOverdue > 0 ? "bg-amber-500/10" : "bg-blue-500/10"
                          }`}>
                            {payment.daysOverdue > 7 ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : payment.daysOverdue > 0 ? (
                              <Clock className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Calendar className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">{payment.name}</h4>
                              <span className="text-xs text-muted-foreground font-mono">{payment.memberId}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{payment.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                              {payment.daysOverdue > 0 && (
                                <span className="text-red-500 ml-2">({payment.daysOverdue} jours de retard)</span>
                              )}
                              {payment.months && (
                                <span className="text-red-500 ml-2">({payment.months} mois)</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendReminder(payment.email, payment.name)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Relancer
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Payé
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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
                        <span className="font-bold text-amber-600">52</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>En retard (+7j)</span>
                        </div>
                        <span className="font-bold text-red-600">35</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Paramètres cotisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Montant mensuel</span>
                          <span className="text-2xl font-bold text-primary">{formatCurrency(stats.cotisationMensuelle)}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleSendReminderAll}>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer rappels à tous
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des dépenses</CardTitle>
                      <CardDescription>Enregistrez et suivez toutes les dépenses avec justificatifs</CardDescription>
                    </div>
                    <Button onClick={() => setShowExpenseModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle dépense
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.filter(t => t.type === "expense").map((expense) => (
                      <div key={expense.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-red-500">{formatCurrency(expense.amount)}</span>
                          {expense.invoice && (
                            <Badge variant="outline" className="text-xs">
                              <Receipt className="h-3 w-3 mr-1" />
                              {expense.invoice}
                            </Badge>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Historique des transactions</CardTitle>
                      <CardDescription>Toutes les entrées et sorties</CardDescription>
                    </div>
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
                  <div className="space-y-2">
                    {transactions.filter(t => 
                      t.description.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                            {transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant="outline" className={transaction.status === "completed" ? "text-green-500" : "text-amber-500"}>
                            {transaction.status === "completed" ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Complété</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> En attente</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Statut des cotisations par membre</CardTitle>
                      <CardDescription>Vue complète de tous les membres</CardDescription>
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
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dernier paiement</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMembers.filter(m => 
                          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((member) => (
                          <tr key={member.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 text-sm font-mono">{member.id}</td>
                            <td className="py-3 px-4 font-medium">{member.name}</td>
                            <td className="py-3 px-4 text-sm">{member.email}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                member.cotisation === "paid" ? "bg-green-500/20 text-green-600" :
                                member.cotisation === "pending" ? "bg-amber-500/20 text-amber-600" :
                                "bg-red-500/20 text-red-600"
                              }>
                                {member.cotisation === "paid" ? "À jour" : 
                                 member.cotisation === "pending" ? "En attente" : "En retard"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(member.lastPayment).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <History className="h-4 w-4" />
                                </Button>
                                {member.cotisation !== "paid" && (
                                  <Button size="sm" variant="ghost">
                                    <Send className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé mensuel</CardTitle>
                    <CardDescription>Recettes vs Dépenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyStats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{stat.month} 2024</span>
                            <span className="text-sm text-muted-foreground">
                              Net: <span className="text-green-500 font-bold">{formatCurrency(stat.income - stat.expenses)}</span>
                            </span>
                          </div>
                          <div className="flex gap-1 h-4">
                            <div 
                              className="bg-green-500 rounded-l"
                              style={{ width: `${(stat.income / (stat.income + stat.expenses)) * 100}%` }}
                            />
                            <div 
                              className="bg-red-500 rounded-r"
                              style={{ width: `${(stat.expenses / (stat.income + stat.expenses)) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="text-green-500">{formatCurrency(stat.income)}</span>
                            <span className="text-red-500">{formatCurrency(stat.expenses)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Générer un rapport</CardTitle>
                    <CardDescription>Exports et documents officiels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Receipt className="h-4 w-4 mr-2" />
                      Relevé mensuel (PDF)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Rapport trimestriel
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Liste des cotisants
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Export comptable (Excel)
                    </Button>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Répartition des revenus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">68%</p>
                        <p className="text-sm text-muted-foreground">Cotisations</p>
                        <p className="text-xs text-primary mt-1">12.8M FCFA</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">22%</p>
                        <p className="text-sm text-muted-foreground">Événements (SITECH)</p>
                        <p className="text-xs text-green-500 mt-1">4.1M FCFA</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">7%</p>
                        <p className="text-sm text-muted-foreground">Partenariats</p>
                        <p className="text-xs text-blue-500 mt-1">1.3M FCFA</p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-xl text-center">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">3%</p>
                        <p className="text-sm text-muted-foreground">Autres</p>
                        <p className="text-xs text-amber-500 mt-1">0.6M FCFA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nouvelle dépense</CardTitle>
              <CardDescription>Enregistrez une dépense avec justificatif</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input 
                  placeholder="Ex: Location salle réunion"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Montant (FCFA)</Label>
                <Input 
                  type="number"
                  placeholder="50000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="impression">Impression</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="evenement">Événement</SelectItem>
                    <SelectItem value="materiel">Matériel</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Facture / Justificatif</Label>
                <div 
                  className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => invoiceInputRef.current?.click()}
                >
                  {newExpense.invoice ? (
                    <div className="flex items-center justify-center gap-2">
                      <Receipt className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{newExpense.invoice.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Cliquez pour ajouter</p>
                    </>
                  )}
                </div>
                <input
                  ref={invoiceInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleInvoiceUpload}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExpenseModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleAddExpense}>
                  Enregistrer
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
