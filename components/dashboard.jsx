"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  PieChart,
  Bell,
  Repeat,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { BudgetForm } from "@/components/budget-form"
import ProfileDropdown from "@/components/profile-dropdown"
import SavingsGoals from "@/components/savings-goals"
import RecurringTransactions from "@/components/recurring-transactions"
import Reminders from "@/components/reminders"
import CategoryManager from "@/components/category-manager"
import UpcomingPaymentsWidget from "@/components/upcoming-payments-widget"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [exporting, setExporting] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const fetchTransactions = async () => {
    try {
      const r = await fetch("/api/transactions")
      if (!r.ok) throw new Error()
      setTransactions(await r.json())
    } catch {
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const r = await fetch("/api/budgets")
      if (!r.ok) throw new Error()
      setBudgets(await r.json())
    } catch {
      setError("Failed to load budgets")
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchBudgets()
  }, [])

  const getMonthTxns = (m) =>
    transactions.filter(
      (t) => new Date(t.date).toISOString().slice(0, 7) === m
    )

  const selectedMonthTransactions = getMonthTxns(selectedMonth)
  const totalExpenses = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = selectedMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)
  const netBalance = totalIncome - totalExpenses

  // Calculate prior month to compute percentage change
  const currentMonthDate = new Date(selectedMonth + "-01")
  const priorMonthDate = new Date(currentMonthDate)
  priorMonthDate.setMonth(priorMonthDate.getMonth() - 1)
  const priorMonthStr = priorMonthDate.toISOString().slice(0, 7)
  const priorMonthTxns = getMonthTxns(priorMonthStr)
  const priorIncome = priorMonthTxns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)
  const priorExpenses = priorMonthTxns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)
  const priorNet = priorIncome - priorExpenses

  let netChangePercent = 0
  if (priorNet > 0 && netBalance > 0) {
    netChangePercent = (((netBalance - priorNet) / priorNet) * 100).toFixed(1)
  }

  // Budget calculations for Target progress card
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth)
  const totalMonthlyBudget = monthBudgets.reduce((s, b) => s + b.amount, 0)
  const budgetSpentPct =
    totalMonthlyBudget > 0
      ? Math.min(100, Math.round((totalExpenses / totalMonthlyBudget) * 100))
      : 0
  const budgetLeftPct = Math.max(0, 100 - budgetSpentPct)
  const budgetRemainingAmount = Math.max(0, totalMonthlyBudget - totalExpenses)

  const recentTransactions = [...selectedMonthTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const availableMonths = Array.from(
    new Set(transactions.map((t) => new Date(t.date).toISOString().slice(0, 7)))
  )
    .sort()
    .reverse()

  const fmtMonth = (m) =>
    new Date(m + "-01").toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })

  const navigateMonth = (dir) => {
    const d = new Date(selectedMonth + "-01")
    d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1))
    setSelectedMonth(d.toISOString().slice(0, 7))
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const res = await fetch(`/api/export/transactions?month=${selectedMonth}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `transactions-${selectedMonth}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success("CSV downloaded!")
    } catch {
      toast.error("Failed to export")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030c07] text-white p-4">
        <div className="max-w-7xl mx-auto pt-8 space-y-4">
          <div className="h-16 rounded-full bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="h-56 rounded-3xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="h-12 rounded-2xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 rounded-3xl bg-[#071912]/80 border border-white/6 animate-pulse" />
            <div className="h-64 rounded-3xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030c07] text-white flex items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-[#071912] border border-rose-500/30 text-center max-w-sm w-full shadow-2xl">
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const TABS = [
    { key: "overview", label: "Overview", icon: Wallet },
    { key: "transactions", label: "Transactions", icon: PlusCircle },
    { key: "categories", label: "Categories", icon: Tag },
    { key: "budgets", label: "Budgets", icon: Target },
    { key: "goals", label: "Goals", icon: Sparkles },
    { key: "recurring", label: "Recurring", icon: Repeat },
    { key: "reminders", label: "Reminders", icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-[#030c07] text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-dashboard">
      {/* Background ambient lighting effects for pure dark glassmorphism */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[650px] h-[500px] bg-emerald-500/8 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[450px] bg-green-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[400px] bg-teal-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* ── Floating Glass Navbar Layout ── */}
        <header className="sticky top-4 z-40 px-4 py-2.5 rounded-2xl sm:rounded-full bg-[#071912]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all">
          {/* Brand + Live Status Indicator */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-950/60">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  FinanceIQ
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Quick Profile for Mobile */}
            <div className="sm:hidden flex items-center gap-2">
              <ProfileDropdown user={user} />
            </div>
          </div>

          {/* Center: Month Navigator Glass Capsule */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/4 border border-white/8 backdrop-blur-md">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Select month"
                className="bg-transparent text-xs font-bold text-white px-2 py-1 focus:outline-none cursor-pointer tracking-wide"
              >
                {(availableMonths.length > 0 ? availableMonths : [selectedMonth]).map(
                  (m) => (
                    <option key={m} value={m} className="bg-[#071912] text-white">
                      {fmtMonth(m)}
                    </option>
                  )
                )}
              </select>

              <button
                onClick={() => navigateMonth("next")}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Quick Action, Export & Profile */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              id="export-csv-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>{exporting ? "..." : "Export"}</span>
            </button>

            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* ── Modern Card Layout (Inspired by Reference UI) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Primary Hero Glass Card (Net Balance & Liquid Flow) - 7 cols */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-[#072418]/90 to-[#04120c]/95 border border-emerald-400/30 p-6 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-2xl flex flex-col justify-between">
            {/* Top decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

            <div className="relative z-10 space-y-4">
              {/* Header row inside hero */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300/90">
                    Total Amount
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {fmtMonth(selectedMonth)}
                  </span>
                </div>

                {netChangePercent !== 0 && (
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md ${
                      parseFloat(netChangePercent) >= 0
                        ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300"
                        : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {parseFloat(netChangePercent) >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>{netChangePercent}%</span>
                  </div>
                )}
              </div>

              {/* Large Bold Currency Figure */}
              <div>
                <div className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <IndianRupee className="h-7 w-7 sm:h-10 sm:w-10 text-emerald-400 font-light" />
                  <span>{netBalance.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Real-time net liquidity across all recorded streams
                </p>
              </div>

              {/* Bottom Inflow & Outflow Glass Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium">Total Income</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {totalIncome.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-medium">Total Expenses</span>
                    <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-rose-400 flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {totalExpenses.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Target / Monthly Budget Progress Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-7 shadow-xl shadow-black/40 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Target className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Monthly Target
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("budgets")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {totalMonthlyBudget > 0 ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {budgetLeftPct}% Left
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      of ₹{totalMonthlyBudget.toLocaleString("en-IN")} Target Budget
                    </p>
                  </div>

                  {/* Glowing Slider Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 rounded-full bg-white/6 p-0.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetSpentPct > 100
                            ? "bg-rose-500"
                            : budgetSpentPct > 80
                            ? "bg-gradient-to-r from-amber-500 to-rose-500"
                            : "bg-gradient-to-r from-emerald-400 to-green-500 shadow-md shadow-emerald-500/40"
                        }`}
                        style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span>Spent: ₹{totalExpenses.toLocaleString("en-IN")}</span>
                      <span className="text-emerald-300">
                        Remaining: ₹{budgetRemainingAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-5 text-center text-slate-500">
                  <p className="text-sm font-bold text-slate-300">No Target Budget Set</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Set category spending limits to track progress like in the preview.
                  </p>
                  <button
                    onClick={() => setActiveTab("budgets")}
                    className="mt-3 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                  >
                    Set Budget Now
                  </button>
                </div>
              )}
            </div>

            {/* Quick account action bar */}
            <div className="pt-4 border-t border-white/6 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Encrypted & User-Scoped</span>
              </div>
              <button
                onClick={() => setQuickAddOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>New Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Segmented Floating Pill Navigation ── */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 no-scrollbar shadow-lg"
          aria-label="Dashboard Navigation"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-950/50"
                    : "text-slate-400 hover:text-white hover:bg-white/4"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* ── Tab Content Views ── */}
        <main>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Cash Flow */}
                <div className="rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                        Cash Flow History
                      </h3>
                      <p className="text-xs text-slate-500">
                        Monthly income vs expense trajectory (6 months)
                      </p>
                    </div>
                  </div>
                  <MonthlyExpensesChart transactions={transactions} />
                </div>

                {/* Spending by Category */}
                <div className="rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-emerald-400" />
                        Spending Distribution
                      </h3>
                      <p className="text-xs text-slate-500">
                        Breakdown of expenses for {fmtMonth(selectedMonth)}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("categories")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Manage
                    </button>
                  </div>
                  <CategoryPieChart transactions={selectedMonthTransactions} />
                </div>
              </div>

              {/* Bottom Row: Recent Transactions + Upcoming Obligations Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Transactions List (2 Cols) */}
                <div className="lg:col-span-2 rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        Recent Transactions
                      </h3>
                      <p className="text-xs text-slate-500">
                        Latest recorded transactions for {fmtMonth(selectedMonth)}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("transactions")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((t) => {
                        const isIncome = t.type === "income"
                        const displayTitle =
                          (t.description && t.description.trim()) ||
                          t.category ||
                          "Transaction"
                        const isAuto = t.source === "reminder"

                        return (
                          <div
                            key={t._id}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/3 border border-white/5 hover:border-emerald-500/20 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl shrink-0 ${
                                  isIncome
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-rose-500/10 text-rose-400"
                                }`}
                              >
                                {isIncome ? (
                                  <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                                    {displayTitle}
                                  </p>
                                  {isAuto && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Auto
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  {t.category} •{" "}
                                  {new Date(t.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 ml-2">
                              <p
                                className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-0.5 ${
                                  isIncome ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                <span>{isIncome ? "+" : "−"}</span>
                                <IndianRupee className="h-3 w-3" />
                                <span>{t.amount.toLocaleString("en-IN")}</span>
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        No transactions recorded for {fmtMonth(selectedMonth)}.
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Obligations Widget (1 Col) */}
                <div className="lg:col-span-1">
                  <UpcomingPaymentsWidget
                    onNavigateToReminders={() => setActiveTab("reminders")}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TRANSACTIONS */}
          {activeTab === "transactions" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-6 rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 h-fit shadow-xl shadow-black/30">
                  <TransactionForm onTransactionAdded={fetchTransactions} />
                </div>
                <div className="lg:col-span-2 p-6 rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white">All Transactions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Filter, search, edit, or remove your records
                    </p>
                  </div>
                  <TransactionList
                    transactions={transactions}
                    onTransactionUpdated={fetchTransactions}
                    selectedMonth={selectedMonth}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === "categories" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryManager />
            </motion.div>
          )}

          {/* TAB 4: BUDGETS */}
          {activeTab === "budgets" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-6 rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 h-fit shadow-xl shadow-black/30">
                  <h3 className="text-base font-bold text-white mb-1">Set Category Budget</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Define monthly target thresholds per category
                  </p>
                  <BudgetForm
                    onBudgetAdded={fetchBudgets}
                    selectedMonth={selectedMonth}
                  />
                </div>
                <div className="lg:col-span-2">
                  <BudgetComparison
                    budgets={budgets}
                    transactions={selectedMonthTransactions}
                    selectedMonth={selectedMonth}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SAVINGS GOALS */}
          {activeTab === "goals" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SavingsGoals />
            </motion.div>
          )}

          {/* TAB 6: RECURRING */}
          {activeTab === "recurring" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RecurringTransactions />
            </motion.div>
          )}

          {/* TAB 7: REMINDERS */}
          {activeTab === "reminders" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Reminders onTransactionsChanged={fetchTransactions} />
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Quick Add Transaction Dialog (Accessible from anywhere) ── */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="sm:max-w-md bg-[#071912]/95 border-emerald-500/20 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              Quick Add Transaction
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Record an inflow or outflow instantly without leaving your current view.
            </DialogDescription>
          </DialogHeader>

          <TransactionForm
            onTransactionAdded={() => {
              fetchTransactions()
              setQuickAddOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
