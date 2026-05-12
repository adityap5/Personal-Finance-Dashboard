"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle, TrendingUp, TrendingDown, Wallet, Target,
  Calendar, IndianRupee, ChevronLeft, ChevronRight,
  Download, BarChart3, PieChart,
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

/* ─── Semantic card components — respond to light/dark via CSS vars ─── */
function Panel({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 ${className}`}>
      {children}
    </div>
  )
}
function PanelHeader({ children }) { return <div className="px-5 pt-5 pb-3">{children}</div> }
function PanelTitle({ children, icon: Icon }) {
  return (
    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-emerald-500" />}
      {children}
    </h3>
  )
}
function PanelDesc({ children }) { return <p className="text-sm text-gray-500 dark:text-slate-500 mt-0.5">{children}</p> }
function PanelBody({ children, className = "" }) { return <div className={`px-5 pb-5 ${className}`}>{children}</div> }

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [exporting, setExporting] = useState(false)

  useEffect(() => { fetchTransactions(); fetchBudgets() }, [])

  const fetchTransactions = async () => {
    try {
      const r = await fetch("/api/transactions")
      if (!r.ok) throw new Error()
      setTransactions(await r.json())
    } catch { setError("Failed to load transactions") }
    finally { setLoading(false) }
  }

  const fetchBudgets = async () => {
    try {
      const r = await fetch("/api/budgets")
      if (!r.ok) throw new Error()
      setBudgets(await r.json())
    } catch { setError("Failed to load budgets") }
  }

  const getMonthTxns = (m) => transactions.filter((t) => new Date(t.date).toISOString().slice(0, 7) === m)
  const selectedMonthTransactions = getMonthTxns(selectedMonth)
  const totalExpenses = selectedMonthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const totalIncome = selectedMonthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const categoryBreakdown = selectedMonthTransactions.filter((t) => t.type === "expense")
    .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a }, {})
  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]
  const recentTransactions = [...selectedMonthTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  const availableMonths = Array.from(new Set(transactions.map((t) => new Date(t.date).toISOString().slice(0, 7)))).sort().reverse()
  const fmt = (m) => new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })

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
    } catch { toast.error("Failed to export") }
    finally { setExporting(false) }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020c14] p-4">
      <div className="max-w-7xl mx-auto pt-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 animate-pulse" />)}
        </div>
        <div className="h-10 rounded-xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 animate-pulse" />
      </div>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020c14] flex items-center justify-center p-4">
      <div className="p-8 rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 text-center max-w-sm w-full shadow-sm">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020c14] transition-colors duration-300">

      {/* dark-only decorative elements */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-600/4 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">

        {/* ── Header / Navbar ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-5 border-b border-gray-200 dark:border-white/6">

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-md shadow-emerald-500/20">
                  <IndianRupee className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">FinanceIQ</h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5 ml-0.5">
                Welcome back, <span className="font-medium text-gray-700 dark:text-slate-300">{user?.name?.split(" ")[0]}</span>
              </p>
            </div>

            {/* Month nav */}
            <div className="flex items-center gap-2">
              <button onClick={() => navigateMonth("prev")}
                className="p-2 rounded-xl bg-white dark:bg-white/4 border border-gray-200 dark:border-white/8 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors shadow-sm dark:shadow-none">
                <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-white/4 border-gray-200 dark:border-white/8 text-gray-700 dark:text-white text-sm rounded-xl shadow-sm dark:shadow-none">
                  <SelectValue>{fmt(selectedMonth)}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0d1f35] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  {(availableMonths.length > 0 ? availableMonths : [selectedMonth]).map((m) => (
                    <SelectItem key={m} value={m} className="focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-700 dark:focus:text-emerald-300">{fmt(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => navigateMonth("next")}
                className="p-2 rounded-xl bg-white dark:bg-white/4 border border-gray-200 dark:border-white/8 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors shadow-sm dark:shadow-none">
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} disabled={exporting} id="export-csv-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 text-sm font-medium transition-all disabled:opacity-50 shadow-sm dark:shadow-none">
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <ProfileDropdown user={user} />
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Income", value: totalIncome, icon: TrendingUp, color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/20" },
            { label: "Total Expenses", value: totalExpenses, icon: TrendingDown, color: "from-rose-500 to-red-600", shadow: "shadow-red-500/20" },
            { label: "Net Balance", value: totalIncome - totalExpenses, icon: Wallet, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
            { label: "Top Category", value: null, topCat: topCategory, icon: Target, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
              <div className={`p-5 rounded-2xl bg-gradient-to-br ${c.color} shadow-lg ${c.shadow} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/8 -mr-4 -mt-4" />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-xs font-medium">{c.label}</span>
                  <c.icon className="h-4 w-4 text-white/60" />
                </div>
                {c.topCat !== undefined ? (
                  <>
                    <div className="text-xl font-bold text-white">{c.topCat ? c.topCat[0] : "N/A"}</div>
                    <div className="text-white/60 text-xs mt-0.5 flex items-center gap-0.5">
                      {c.topCat && <><IndianRupee className="h-3 w-3" />{c.topCat[1].toLocaleString("en-IN")}</>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white flex items-center gap-0.5">
                      <IndianRupee className="h-5 w-5" />{(c.value ?? 0).toLocaleString("en-IN")}
                    </div>
                    <div className="text-white/60 text-xs mt-0.5">{fmt(selectedMonth)}</div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="space-y-5">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 p-1 rounded-xl shadow-sm dark:shadow-none">
              {["overview","transactions","categories","budgets","goals","recurring"].map((tab) => (
                <TabsTrigger key={tab} value={tab}
                  className="rounded-lg text-xs sm:text-sm capitalize text-gray-500 dark:text-slate-500
                    data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm
                    dark:data-[state=active]:bg-emerald-500/15 dark:data-[state=active]:text-emerald-400 dark:data-[state=active]:border dark:data-[state=active]:border-emerald-500/20">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Panel>
                  <PanelHeader><PanelTitle icon={BarChart3}>Monthly Expenses</PanelTitle><PanelDesc>Spending pattern over the last 6 months</PanelDesc></PanelHeader>
                  <PanelBody><MonthlyExpensesChart transactions={transactions} /></PanelBody>
                </Panel>
                <Panel>
                  <PanelHeader><PanelTitle icon={PieChart}>Category Breakdown</PanelTitle><PanelDesc>Expenses by category for {fmt(selectedMonth)}</PanelDesc></PanelHeader>
                  <PanelBody><CategoryPieChart transactions={selectedMonthTransactions} /></PanelBody>
                </Panel>
              </div>
              <Panel>
                <PanelHeader><PanelTitle icon={Calendar}>Recent Transactions</PanelTitle><PanelDesc>Latest for {fmt(selectedMonth)}</PanelDesc></PanelHeader>
                <PanelBody>
                  <div className="space-y-2">
                    {recentTransactions.length > 0 ? recentTransactions.map((t) => (
                      <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                            {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{t.description}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">{t.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm flex items-center gap-0.5 ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {t.type === "income" ? "+" : "-"}<IndianRupee className="h-3.5 w-3.5" />{t.amount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-600">{new Date(t.date).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-gray-400 dark:text-slate-600">No transactions for {fmt(selectedMonth)}</div>
                    )}
                  </div>
                </PanelBody>
              </Panel>
            </TabsContent>

            {/* ── Transactions ── */}
            <TabsContent value="transactions" className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Panel className="lg:col-span-1">
                  <PanelHeader><PanelTitle icon={PlusCircle}>Add Transaction</PanelTitle></PanelHeader>
                  <PanelBody><TransactionForm onTransactionAdded={() => fetchTransactions()} /></PanelBody>
                </Panel>
                <Panel className="lg:col-span-2">
                  <PanelHeader><PanelTitle>All Transactions</PanelTitle><PanelDesc>Manage your income and expenses</PanelDesc></PanelHeader>
                  <PanelBody><TransactionList transactions={transactions} onTransactionUpdated={() => fetchTransactions()} selectedMonth={selectedMonth} /></PanelBody>
                </Panel>
              </div>
              <Panel>
                <PanelHeader><PanelTitle icon={BarChart3}>Monthly Expenses Chart</PanelTitle></PanelHeader>
                <PanelBody><MonthlyExpensesChart transactions={transactions} /></PanelBody>
              </Panel>
            </TabsContent>

            {/* ── Categories ── */}
            <TabsContent value="categories" className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Panel>
                  <PanelHeader><PanelTitle icon={PieChart}>Category Distribution</PanelTitle><PanelDesc>How your money is spent in {fmt(selectedMonth)}</PanelDesc></PanelHeader>
                  <PanelBody><CategoryPieChart transactions={selectedMonthTransactions} /></PanelBody>
                </Panel>
                <Panel>
                  <PanelHeader><PanelTitle>Category Summary</PanelTitle><PanelDesc>Breakdown for {fmt(selectedMonth)}</PanelDesc></PanelHeader>
                  <PanelBody>
                    <div className="space-y-2">
                      {Object.entries(categoryBreakdown).length > 0 ? (
                        Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([cat, amt]) => (
                          <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{cat}</span>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <IndianRupee className="h-3.5 w-3.5" />{amt.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-400 dark:text-slate-600">No expense categories for {fmt(selectedMonth)}</div>
                      )}
                    </div>
                  </PanelBody>
                </Panel>
              </div>
            </TabsContent>

            {/* ── Budgets ── */}
            <TabsContent value="budgets" className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Panel className="lg:col-span-1">
                  <PanelHeader><PanelTitle icon={Target}>Set Budget</PanelTitle></PanelHeader>
                  <PanelBody><BudgetForm onBudgetAdded={() => fetchBudgets()} selectedMonth={selectedMonth} /></PanelBody>
                </Panel>
                <Panel className="lg:col-span-2">
                  <PanelHeader><PanelTitle>Budget vs Actual</PanelTitle><PanelDesc>Track spending against budgets for {fmt(selectedMonth)}</PanelDesc></PanelHeader>
                  <PanelBody><BudgetComparison budgets={budgets} transactions={selectedMonthTransactions} selectedMonth={selectedMonth} /></PanelBody>
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="goals"><SavingsGoals /></TabsContent>
            <TabsContent value="recurring"><RecurringTransactions /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
