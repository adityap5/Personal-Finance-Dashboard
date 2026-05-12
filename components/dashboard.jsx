"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle, TrendingUp, TrendingDown, Wallet, Target,
  Calendar, IndianRupee, ChevronLeft, ChevronRight,
  Download, Repeat, LogOut,
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

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchBudgets()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      if (!response.ok) throw new Error("Failed to fetch transactions")
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
      if (!response.ok) throw new Error("Failed to fetch budgets")
      const data = await response.json()
      setBudgets(data)
    } catch (err) {
      setError("Failed to load budgets")
    }
  }

  const handleTransactionAdded = () => fetchTransactions()
  const handleBudgetAdded = () => fetchBudgets()

  const getMonthTransactions = (monthString) =>
    transactions.filter((t) => new Date(t.date).toISOString().slice(0, 7) === monthString)

  const selectedMonthTransactions = getMonthTransactions(selectedMonth)

  const totalExpenses = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = selectedMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})

  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]

  const recentTransactions = selectedMonthTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getAvailableMonths = () => {
    const months = new Set()
    transactions.forEach((t) => months.add(new Date(t.date).toISOString().slice(0, 7)))
    return Array.from(months).sort().reverse()
  }

  const availableMonths = getAvailableMonths()

  const formatMonthDisplay = (monthString) => {
    const date = new Date(monthString + "-01")
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction) => {
    const currentDate = new Date(selectedMonth + "-01")
    if (direction === "prev") currentDate.setMonth(currentDate.getMonth() - 1)
    else currentDate.setMonth(currentDate.getMonth() + 1)
    setSelectedMonth(currentDate.toISOString().slice(0, 7))
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const url = `/api/export/transactions?month=${selectedMonth}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `transactions-${selectedMonth}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success("CSV downloaded!")
    } catch {
      toast.error("Failed to export transactions")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /></CardHeader>
                <CardContent><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-red-600">Error</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: branding + month nav */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">
                  FinanceIQ
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name?.split(" ")[0]}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="p-2 h-9 w-9">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[170px] h-9">
                    <SelectValue>{formatMonthDisplay(selectedMonth)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.length > 0 ? (
                      availableMonths.map((month) => (
                        <SelectItem key={month} value={month}>{formatMonthDisplay(month)}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value={selectedMonth}>{formatMonthDisplay(selectedMonth)}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="p-2 h-9 w-9">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right: export + profile */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={handleExportCSV}
                disabled={exporting}
                className="gap-1.5 text-sm"
                id="export-csv-btn"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
              <ProfileDropdown user={user} />
            </div>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg shadow-green-200 dark:shadow-green-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />{totalIncome.toLocaleString("en-IN")}
              </div>
              <p className="text-green-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0 shadow-lg shadow-red-200 dark:shadow-red-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />{totalExpenses.toLocaleString("en-IN")}
              </div>
              <p className="text-red-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />{(totalIncome - totalExpenses).toLocaleString("en-IN")}
              </div>
              <p className="text-blue-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-purple-700 text-white border-0 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" /> Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{topCategory ? topCategory[0] : "N/A"}</div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                {topCategory && <><IndianRupee className="h-3 w-3" />{topCategory[1].toLocaleString("en-IN")}</>}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg text-xs sm:text-sm">Transactions</TabsTrigger>
              <TabsTrigger value="categories" className="rounded-lg text-xs sm:text-sm">Categories</TabsTrigger>
              <TabsTrigger value="budgets" className="rounded-lg text-xs sm:text-sm">Budgets</TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg text-xs sm:text-sm">Goals</TabsTrigger>
              <TabsTrigger value="recurring" className="rounded-lg text-xs sm:text-sm">Recurring</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Expenses</CardTitle>
                    <CardDescription>Your spending pattern over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent><MonthlyExpensesChart transactions={transactions} /></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Expenses by category for {formatMonthDisplay(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent><CategoryPieChart transactions={selectedMonthTransactions} /></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" /> Recent Transactions
                  </CardTitle>
                  <CardDescription>Latest transactions for {formatMonthDisplay(selectedMonth)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.length > 0 ? recentTransactions.map((t) => (
                      <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"}`}>
                            {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{t.description}</p>
                            <p className="text-xs text-gray-500">{t.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm flex items-center gap-1 ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {t.type === "income" ? "+" : "-"}<IndianRupee className="h-3.5 w-3.5" />{t.amount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No transactions found for {formatMonthDisplay(selectedMonth)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions */}
            <TabsContent value="transactions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Add Transaction</CardTitle>
                  </CardHeader>
                  <CardContent><TransactionForm onTransactionAdded={handleTransactionAdded} /></CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Manage your income and expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionList transactions={transactions} onTransactionUpdated={handleTransactionAdded} selectedMonth={selectedMonth} />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Monthly Expenses Chart</CardTitle></CardHeader>
                <CardContent><MonthlyExpensesChart transactions={transactions} /></CardContent>
              </Card>
            </TabsContent>

            {/* Categories */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>How your money is spent in {formatMonthDisplay(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent><CategoryPieChart transactions={selectedMonthTransactions} /></CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Category Summary</CardTitle>
                    <CardDescription>Detailed breakdown for {formatMonthDisplay(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(categoryBreakdown).length > 0 ? (
                        Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <Badge variant="secondary">{category}</Badge>
                            <div className="font-semibold flex items-center gap-1 text-sm">
                              <IndianRupee className="h-3.5 w-3.5" />{amount.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No expense categories found for {formatMonthDisplay(selectedMonth)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Budgets */}
            <TabsContent value="budgets" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Set Budget</CardTitle>
                  </CardHeader>
                  <CardContent><BudgetForm onBudgetAdded={handleBudgetAdded} selectedMonth={selectedMonth} /></CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Budget vs Actual</CardTitle>
                    <CardDescription>Track your spending against budgets for {formatMonthDisplay(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BudgetComparison budgets={budgets} transactions={selectedMonthTransactions} selectedMonth={selectedMonth} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Savings Goals */}
            <TabsContent value="goals">
              <SavingsGoals />
            </TabsContent>

            {/* Recurring */}
            <TabsContent value="recurring">
              <RecurringTransactions />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
