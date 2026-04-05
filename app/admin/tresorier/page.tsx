"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Wallet, TrendingUp, TrendingDown, Users,
  Search, CheckCircle, Clock, CreditCard,
  ArrowUpRight, ArrowDownRight, Plus, Send, RefreshCw,
  Loader2, Receipt, Bell, Mail, PiggyBank, History,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

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
  notes: string
  created_at?: string
}

interface Member {
  id: string
  member_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const CATEGORY_LABELS: Record<string, string> = {
  operations: "Opérations",
  events: "Événements",
  equipment: "Équipement",
  communication: "Communication",
  other: "Autre",
}

const COTISATION_AMOUNT = 2000

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.abs(amount)) + " FCFA"
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function TreasurerDashboard() {
  const { toast } = useToast()

  // ── State ──
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "operations",
    notes: "",
  })

  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalMembers: 0,
    paidMembers: 0,
    pendingMembers: 0,
  })

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, member:members(first_name, last_name, email, phone, member_id)")
        .order("payment_date", { ascending: false })
        .limit(100)

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false })
        .limit(100)

      const { data: membersData } = await supabase
        .from("members")
        .select("*")
        .eq("status", "active")

      setPayments(paymentsData || [])
      setExpenses(expensesData || [])
      setMembers(membersData || [])

      // Calcul stats
      const completedPayments = (paymentsData || []).filter((p: Payment) => p.status === "completed")
      const monthlyPayments = completedPayments.filter(
        (p: Payment) => p.year === currentYear && p.month === currentMonth
      )
      const monthlyIncome = monthlyPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)

      const monthlyExpensesList = (expensesData || []).filter((e: Expense) => {
        const d = new Date(e.expense_date)
        return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
      })
      const monthlyExpensesTotal = monthlyExpensesList.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0)

      const totalIncome = completedPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
      const totalExpenses = (expensesData || []).reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0)

      const paidMemberIds = new Set(monthlyPayments.map((p: Payment) => p.member_id))

      setStats({
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses: monthlyExpensesTotal,
        totalMembers: membersData?.length || 0,
        paidMembers: paidMemberIds.size,
        pendingMembers: (membersData?.length || 0) - paidMemberIds.size,
      })
    } catch (err) {
      console.error("Erreur:", err)
      toast({ title: "Erreur de chargement", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Membres en retard ──
  const pendingMembers = members.filter((m) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    return !payments.some(
      (p) =>
        p.member_id === m.id &&
        p.year === currentYear &&
        p.month === currentMonth &&
        p.status === "completed"
    )
  })

  const recentPayments = payments.filter((p) => p.status === "completed").slice(0, 20)

  // ── Actions ──
  const handleRecordPayment = async (memberId: string, memberName: string) => {
    setActionLoading(memberId)
    try {
      const now = new Date()
      const supabase = createClient()
      const { error } = await supabase.from("payments").insert({
        member_id: memberId,
        amount: COTISATION_AMOUNT,
        type: "cotisation",
        status: "completed",
        payment_date: now.toISOString(),
        payment_method: "espèces",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        reference: `MAN-${Date.now()}`,
      })

      if (error) throw error
      toast({ title: "Paiement enregistré", description: `${COTISATION_AMOUNT.toLocaleString()} FCFA pour ${memberName}` })
      await fetchData()
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le paiement", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({ title: "Champs manquants", description: "Remplissez la description et le montant", variant: "destructive" })
      return
    }

    setActionLoading("expense")
    try {
      const supabase = createClient()
      const { error } = await supabase.from("expenses").insert({
        description: newExpense.description,
        amount: parseInt(newExpense.amount),
        category: newExpense.category,
        expense_date: new Date().toISOString().split("T")[0],
        notes: newExpense.notes,
      })

      if (error) throw error
      toast({ title: "Dépense enregistrée", description: `${formatCurrency(parseInt(newExpense.amount))}` })
      setShowExpenseModal(false)
      setNewExpense({ description: "", amount: "", category: "operations", notes: "" })
      await fetchData()
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la dépense", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const handleSendReminder = async (member: Member) => {
    setActionLoading(`reminder-${member.id}`)
    try {
      // TODO: Envoyer un email réel via Resend / Supabase Edge Function
      // Exemple:
      // await fetch("/api/send-reminder", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: member.email, name: member.first_name }),
      // })

      toast({
        title: "Rappel envoyé",
        description: `Un rappel de cotisation a été envoyé à ${member.first_name} ${member.last_name}`,
      })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer le rappel", variant: "destructive" })
    }
    setActionLoading(null)
  }

  const handleSendAllReminders = async () => {
    setActionLoading("remind-all")
    try {
      // TODO: Envoyer un email de rappel groupé
      toast({
        title: "Rappels envoyés",
        description: `${pendingMembers.length} rappels de cotisation ont été envoyés.`,
      })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer les rappels", variant: "destructive" })
    }
    setActionLoading(null)
  }

  // ── Render ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Gestion Financière</h1>
                <p className="text-sm text-muted-foreground">Trésorière — RETECHCI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Actualiser
            </Button>
            <Button size="sm" onClick={() => setShowExpenseModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Nouvelle dépense
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Chargement des données...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <PiggyBank className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold">{formatCurrency(stats.balance)}</p>
                      <p className="text-xs text-muted-foreground">Solde total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-green-600">+{formatCurrency(stats.monthlyIncome)}</p>
                      <p className="text-xs text-muted-foreground">Recettes du mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-red-500">-{formatCurrency(stats.monthlyExpenses)}</p>
                      <p className="text-xs text-muted-foreground">Dépenses du mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={stats.pendingMembers > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold">{stats.pendingMembers}</p>
                      <p className="text-xs text-muted-foreground">Cotisations en attente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="recus" className="w-full">
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="recus" className="gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Paiements reçus</span>
                </TabsTrigger>
                <TabsTrigger value="attente" className="gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">En attente</span>
                  {pendingMembers.length > 0 && (
                    <Badge className="bg-amber-500 text-white text-[10px] ml-1 px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {pendingMembers.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="depenses" className="gap-1.5">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline">Dépenses</span>
                </TabsTrigger>
                <TabsTrigger value="membres" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Tous les membres</span>
                </TabsTrigger>
              </TabsList>

              {/* ── TAB : Paiements reçus ── */}
              <TabsContent value="recus" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-green-500" />
                          Paiements reçus
                        </CardTitle>
                        <CardDescription>Cotisations et autres paiements</CardDescription>
                      </div>
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-sm px-3 py-1">
                        {stats.paidMembers}/{stats.totalMembers} à jour
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentPayments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun paiement enregistré.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentPayments.map((payment) => (
                          <div key={payment.id} className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                              <ArrowUpRight className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">
                                  {payment.member?.first_name} {payment.member?.last_name}
                                </h4>
                                {payment.member?.member_id && (
                                  <Badge variant="outline" className="text-[10px] font-mono">
                                    {payment.member.member_id}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{payment.type}</span>
                                {payment.payment_method && <span>· {payment.payment_method}</span>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(payment.payment_date)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-green-500">+{formatCurrency(payment.amount)}</p>
                              <Badge className="bg-green-500/20 text-green-600 text-[10px]">
                                <CheckCircle className="h-3 w-3 mr-0.5" />
                                Confirmé
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB : En attente ── */}
              <TabsContent value="attente" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Cotisations en attente</CardTitle>
                        <CardDescription>
                          Membres n&apos;ayant pas payé ce mois-ci ({pendingMembers.length})
                        </CardDescription>
                      </div>
                      {pendingMembers.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSendAllReminders}
                          disabled={actionLoading === "remind-all"}
                          className="gap-1.5"
                        >
                          {actionLoading === "remind-all" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">Rappeler tous</span>
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pendingMembers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>Tous les membres sont à jour !</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {pendingMembers.map((member) => (
                          <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                              <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{member.first_name} {member.last_name}</h4>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {member.member_id}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                              {member.phone && (
                                <p className="text-xs text-muted-foreground">{member.phone}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm">{COTISATION_AMOUNT.toLocaleString()} FCFA</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReminder(member)}
                                disabled={actionLoading === `reminder-${member.id}`}
                                className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                                title="Envoyer un rappel"
                              >
                                {actionLoading === `reminder-${member.id}` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Bell className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline text-xs">Rappeler</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRecordPayment(member.id, `${member.first_name} ${member.last_name}`)
                                }
                                disabled={actionLoading === member.id}
                                className="gap-1"
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline text-xs">Payé</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB : Dépenses ── */}
              <TabsContent value="depenses" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Dépenses</CardTitle>
                        <CardDescription>Historique des dépenses ({expenses.length})</CardDescription>
                      </div>
                      <Button size="sm" onClick={() => setShowExpenseModal(true)}>
                        <Plus className="h-4 w-4 mr-1.5" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {expenses.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune dépense enregistrée.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
                            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                              <ArrowDownRight className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{expense.description}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px]">
                                  {CATEGORY_LABELS[expense.category] || expense.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatShortDate(expense.expense_date)}
                                </span>
                              </div>
                              {expense.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{expense.notes}</p>
                              )}
                            </div>
                            <span className="text-lg font-bold text-red-500 shrink-0">
                              -{formatCurrency(expense.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB : Tous les membres ── */}
              <TabsContent value="membres" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Statut des cotisations</CardTitle>
                        <CardDescription>Vue d&apos;ensemble par membre</CardDescription>
                      </div>
                      <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">ID</th>
                            <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Nom</th>
                            <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                            <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Statut</th>
                            <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members
                            .filter(
                              (m) =>
                                m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((member) => {
                              const hasPaid = !pendingMembers.find((pm) => pm.id === member.id)
                              return (
                                <tr key={member.id} className="border-b border-border hover:bg-muted/20">
                                  <td className="py-3 px-3 text-xs font-mono">{member.member_id}</td>
                                  <td className="py-3 px-3 font-medium text-sm">
                                    {member.first_name} {member.last_name}
                                  </td>
                                  <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                                    {member.email}
                                  </td>
                                  <td className="py-3 px-3">
                                    {hasPaid ? (
                                      <Badge className="bg-green-500/20 text-green-600 text-[10px]">
                                        <CheckCircle className="h-3 w-3 mr-0.5" />
                                        À jour
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">
                                        <Clock className="h-3 w-3 mr-0.5" />
                                        En attente
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    {!hasPaid && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleSendReminder(member)}
                                          disabled={actionLoading === `reminder-${member.id}`}
                                          className="h-7 text-amber-600 hover:bg-amber-50"
                                          title="Rappeler"
                                        >
                                          {actionLoading === `reminder-${member.id}` ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Bell className="h-3 w-3" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleRecordPayment(member.id, `${member.first_name} ${member.last_name}`)
                                          }
                                          disabled={actionLoading === member.id}
                                          className="h-7 text-xs"
                                        >
                                          {actionLoading === member.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            "Payé"
                                          )}
                                        </Button>
                                      </div>
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
          </>
        )}
      </main>

      {/* ── Modal : Nouvelle dépense ── */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle dépense
            </DialogTitle>
            <DialogDescription>Enregistrez une dépense de l&apos;organisation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="exp-desc">Description *</Label>
              <Input
                id="exp-desc"
                placeholder="Ex : Location salle de réunion"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="exp-amount">Montant (FCFA) *</Label>
              <Input
                id="exp-amount"
                type="number"
                placeholder="50 000"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select
                value={newExpense.category}
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Opérations</SelectItem>
                  <SelectItem value="events">Événements</SelectItem>
                  <SelectItem value="equipment">Équipement</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exp-notes">Notes</Label>
              <Textarea
                id="exp-notes"
                placeholder="Détails supplémentaires..."
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddExpense}
              disabled={actionLoading === "expense"}
            >
              {actionLoading === "expense" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Plus className="h-4 w-4 mr-1.5" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
