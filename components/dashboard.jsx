"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { BudgetForm } from "@/components/budget-form"

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

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

  const handleTransactionAdded = () => {
    fetchTransactions()
  }

  const handleBudgetAdded = () => {
    fetchBudgets()
  }

  const getMonthTransactions = (monthString) => {
    return transactions.filter((t) => {
      const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
      return transactionMonth === monthString
    })
  }

  const selectedMonthTransactions = getMonthTransactions(selectedMonth)

  const totalExpenses = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = selectedMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown = selectedMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]

  const recentTransactions = selectedMonthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const getAvailableMonths = () => {
    const months = new Set()
    transactions.forEach((t) => {
      const month = new Date(t.date).toISOString().slice(0, 7)
      months.add(month)
    })
    return Array.from(months).sort().reverse()
  }

  const availableMonths = getAvailableMonths()

  const formatMonthDisplay = (monthString) => {
    const date = new Date(monthString + "-01")
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction) => {
    const currentDate = new Date(selectedMonth + "-01")
    if (direction === "prev") {
      currentDate.setMonth(currentDate.getMonth() - 1)
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    setSelectedMonth(currentDate.toISOString().slice(0, 7))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Finance Dashboard</h1>
              <p className="text-gray-600">Track your expenses, manage budgets, and visualize your financial health</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="p-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>{formatMonthDisplay(selectedMonth)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.length > 0 ? (
                    availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={selectedMonth}>{formatMonthDisplay(selectedMonth)}</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="p-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {totalIncome.toLocaleString("en-IN")}
              </div>
              <p className="text-green-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {totalExpenses.toLocaleString("en-IN")}
              </div>
              <p className="text-red-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {(totalIncome - totalExpenses).toLocaleString("en-IN")}
              </div>
              <p className="text-blue-100 text-sm">{formatMonthDisplay(selectedMonth)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCategory ? topCategory[0] : "N/A"}</div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                {topCategory && (
                  <>
                    <IndianRupee className="h-3 w-3" />
                    {topCategory[1].toLocaleString("en-IN")}
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Expenses</CardTitle>
                    <CardDescription>Your spending pattern over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlyExpensesChart transactions={transactions} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Expenses by category for {formatMonthDisplay(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryPieChart transactions={selectedMonthTransactions} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>Latest transactions for {formatMonthDisplay(selectedMonth)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "income"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold flex items-center gap-1 ${
                                transaction.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              <IndianRupee className="h-4 w-4" />
                              {transaction.amount.toLocaleString("en-IN")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No transactions found for {formatMonthDisplay(selectedMonth)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" />
                      Add Transaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm onTransactionAdded={handleTransactionAdded} />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Manage your income and expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionList
                      transactions={transactions}
                      onTransactionUpdated={handleTransactionAdded}
                      selectedMonth={selectedMonth}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyExpensesChart transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>
                      How your money is spent across categories in {formatMonthDisplay(selectedMonth)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryPieChart transactions={selectedMonthTransactions} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Summary</CardTitle>
                    <CardDescription>
                      Detailed breakdown by category for {formatMonthDisplay(selectedMonth)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(categoryBreakdown).length > 0 ? (
                        Object.entries(categoryBreakdown)
                          .sort(([, a], [, b]) => b - a)
                          .map(([category, amount]) => (
                            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">{category}</Badge>
                              </div>
                              <div className="font-semibold flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                {amount.toLocaleString("en-IN")}
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

            <TabsContent value="budgets" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Set Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BudgetForm onBudgetAdded={handleBudgetAdded} selectedMonth={selectedMonth} />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Budget vs Actual</CardTitle>
                    <CardDescription>
                      Track your spending against your budgets for {formatMonthDisplay(selectedMonth)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BudgetComparison
                      budgets={budgets}
                      transactions={selectedMonthTransactions}
                      selectedMonth={selectedMonth}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
