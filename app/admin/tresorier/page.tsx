"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Wallet, TrendingUp, TrendingDown, Users, FileText, 
  Download, Calendar, Search, CheckCircle, Clock,
  AlertCircle, CreditCard, PiggyBank, Receipt, ArrowUpRight, ArrowDownRight
} from "lucide-react"

// Mock data
const transactions = [
  { id: "1", type: "income", description: "Cotisation - Amadou Diarra", amount: 25000, date: "2024-01-15", status: "completed" },
  { id: "2", type: "income", description: "Cotisation - Fatou Keita", amount: 25000, date: "2024-01-14", status: "completed" },
  { id: "3", type: "expense", description: "Location salle réunion", amount: -50000, date: "2024-01-12", status: "completed" },
  { id: "4", type: "income", description: "Inscription SITECH 2027", amount: 75000, date: "2024-01-10", status: "completed" },
  { id: "5", type: "expense", description: "Impression cartes membres", amount: -120000, date: "2024-01-08", status: "completed" },
  { id: "6", type: "income", description: "Cotisation - Marc Zadi", amount: 25000, date: "2024-01-05", status: "pending" },
]

const pendingPayments = [
  { id: "1", name: "Jean Kouame", type: "Cotisation annuelle", amount: 25000, dueDate: "2024-01-31", daysOverdue: 0 },
  { id: "2", name: "Marie Bamba", type: "Cotisation annuelle", amount: 25000, dueDate: "2024-01-15", daysOverdue: 5 },
  { id: "3", name: "Eric Sanogo", type: "Cotisation annuelle", amount: 25000, dueDate: "2024-01-10", daysOverdue: 10 },
]

const monthlyStats = [
  { month: "Jan", income: 850000, expenses: 320000 },
  { month: "Fév", income: 720000, expenses: 280000 },
  { month: "Mar", income: 950000, expenses: 410000 },
  { month: "Avr", income: 680000, expenses: 250000 },
]

export default function TreasurerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [searchQuery, setSearchQuery] = useState("")

  const stats = {
    balance: 4250000,
    monthlyIncome: 850000,
    monthlyExpenses: 320000,
    pendingPayments: 3
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.abs(amount)) + ' FCFA'
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
                  Trésorier
                </Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gestion Financière
              </h1>
              <p className="text-muted-foreground">
                Suivi des cotisations et dépenses du RETECHCI
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stats.pendingPayments}</p>
                    <p className="text-sm text-muted-foreground">Paiements en attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="pending">Paiements en attente</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Historique des transactions</CardTitle>
                      <CardDescription>Toutes les entrées et sorties</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button>
                        + Nouvelle transaction
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
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

            {/* Pending Payments Tab */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Paiements en attente</CardTitle>
                  <CardDescription>Cotisations non réglées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.daysOverdue > 0 ? "bg-red-500/10" : "bg-amber-500/10"
                        }`}>
                          {payment.daysOverdue > 0 ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{payment.name}</h4>
                          <p className="text-sm text-muted-foreground">{payment.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                            {payment.daysOverdue > 0 && (
                              <span className="text-red-500 ml-2">({payment.daysOverdue} jours de retard)</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Relancer
                          </Button>
                          <Button size="sm">
                            Marquer payé
                          </Button>
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
                        <p className="text-sm text-muted-foreground">Événements</p>
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

            {/* Cotisations Tab */}
            <TabsContent value="cotisations">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Statut des cotisations</CardTitle>
                    <CardDescription>Année 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="font-medium text-foreground">À jour</p>
                            <p className="text-sm text-muted-foreground">Cotisations payées</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-500">478</p>
                          <p className="text-sm text-muted-foreground">membres</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Clock className="h-6 w-6 text-amber-500" />
                          <div>
                            <p className="font-medium text-foreground">En attente</p>
                            <p className="text-sm text-muted-foreground">Moins de 30 jours</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-500">24</p>
                          <p className="text-sm text-muted-foreground">membres</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-red-500" />
                          <div>
                            <p className="font-medium text-foreground">En retard</p>
                            <p className="text-sm text-muted-foreground">Plus de 30 jours</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-500">10</p>
                          <p className="text-sm text-muted-foreground">membres</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      Envoyer rappels automatiques
                    </Button>
                    <Button className="w-full" variant="outline">
                      Générer reçus cotisation
                    </Button>
                    <Button className="w-full" variant="outline">
                      Exporter liste impayés
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
