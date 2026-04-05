"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wallet, TrendingUp, TrendingDown, Users, CheckCircle,
  Clock, ArrowUpRight, ArrowDownRight, CreditCard, Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

interface FinanceStats {
  balance: number
  monthlyIncome: number
  monthlyExpenses: number
  pendingPayments: number
  totalMembers: number
  paidMembers: number
}

interface FinanceViewProps {
  readOnly?: boolean
}

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
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  operations: "Opérations",
  events: "Événements",
  equipment: "Équipement",
  communication: "Communication",
  other: "Autre",
}

const EXPENSE_CATEGORIES = [
  { value: "operations", label: "Opérations" },
  { value: "events", label: "Événements" },
  { value: "equipment", label: "Équipement" },
  { value: "communication", label: "Communication" },
  { value: "other", label: "Autre" },
]

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT : FinanceView
// ═══════════════════════════════════════════════════════════════════════

export function FinanceView({ readOnly = true }: FinanceViewProps) {
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "expenses" | "cotisations">("overview")

  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<FinanceStats>({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    totalMembers: 0,
    paidMembers: 0,
  })

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      // Paiements
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*, member:members(first_name, last_name, email, member_id)")
        .order("payment_date", { ascending: false })
        .limit(100)

      // Dépenses
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false })
        .limit(100)

      setPayments(paymentsData || [])
      setExpenses(expensesData || [])

      // Calcul stats
      const completedPayments = paymentsData?.filter((p: Payment) => p.status === "completed") || []
      const monthlyPayments = completedPayments.filter(
        (p: Payment) => p.year === currentYear && p.month === currentMonth
      )
      const monthlyIncome = monthlyPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)

      const monthlyExpensesList = expensesData?.filter((e: Expense) => {
        const d = new Date(e.expense_date)
        return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
      }) || []
      const monthlyExpensesTotal = monthlyExpensesList.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0)

      const totalIncome = completedPayments.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
      const totalExpenses = expensesData?.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0)

      setStats({
        balance: totalIncome - totalExpenses,
        monthlyIncome,
        monthlyExpenses: monthlyExpensesTotal,
        pendingPayments: 0,
        totalMembers: 0,
        paidMembers: monthlyPayments.length,
      })
    } catch (err) {
      console.error("Erreur chargement finances:", err)
    } finally {
      setLoading(false)
    }
  }

  const recentPayments = payments.filter((p) => p.status === "completed").slice(0, 15)

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{stats.paidMembers}</p>
                <p className="text-xs text-muted-foreground">Cotisations ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
        </div>
      ) : (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-2 border-b border-border pb-0">
            {[
              { value: "overview" as const, label: "Vue d'ensemble", icon: Wallet },
              { value: "expenses" as const, label: "Dépenses", icon: ArrowDownRight },
              { value: "cotisations" as const, label: "Cotisations", icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveSubTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeSubTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Vue d'ensemble ── */}
          {activeSubTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dernières dépenses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    Dernières dépenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Aucune dépense enregistrée.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {expenses.slice(0, 8).map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30"
                        >
                          <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{exp.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {CATEGORY_LABELS[exp.category] || exp.category} · {formatDate(exp.expense_date)}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-red-500 shrink-0">
                            -{formatCurrency(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dernières cotisations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    Dernières cotisations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Aucune cotisation enregistrée.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {recentPayments.slice(0, 8).map((pay) => (
                        <div
                          key={pay.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-green-500/5"
                        >
                          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {pay.member?.first_name} {pay.member?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(pay.payment_date)}
                              {pay.payment_method && ` · ${pay.payment_method}`}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-green-500 shrink-0">
                            +{formatCurrency(pay.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Dépenses ── */}
          {activeSubTab === "expenses" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                  Toutes les dépenses
                </CardTitle>
                <CardDescription>
                  Dépenses enregistrées par la Trésorière ({expenses.length} entrée{expenses.length !== 1 ? "s" : ""})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune dépense enregistrée.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/60"
                      >
                        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                          <ArrowDownRight className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{exp.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">
                              {CATEGORY_LABELS[exp.category] || exp.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(exp.expense_date)}
                            </span>
                          </div>
                          {exp.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{exp.notes}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-red-500 shrink-0">
                          -{formatCurrency(exp.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Cotisations ── */}
          {activeSubTab === "cotisations" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  Cotisations des membres
                </CardTitle>
                <CardDescription>
                  Cotisations enregistrées ({recentPayments.length} entrée{recentPayments.length !== 1 ? "s" : ""})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune cotisation enregistrée.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentPayments.map((pay) => (
                      <div
                        key={pay.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                      >
                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center shrink-0">
                          <ArrowUpRight className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {pay.member?.first_name} {pay.member?.last_name}
                            </p>
                            {pay.member?.member_id && (
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {pay.member.member_id}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(pay.payment_date)}
                            </span>
                            {pay.payment_method && (
                              <span className="text-xs text-muted-foreground">
                                · {pay.payment_method}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-green-500">
                            +{formatCurrency(pay.amount)}
                          </span>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] text-green-600">Confirmé</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
