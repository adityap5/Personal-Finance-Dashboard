"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

export function BudgetComparison({ budgets, transactions, selectedMonth }) {
  const processData = () => {
    const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7)
    const currentBudgets = budgets.filter((b) => b.month === currentMonth)

    return currentBudgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = (spent / budget.amount) * 100
      const remaining = budget.amount - spent

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining: Math.max(0, remaining),
        percentage: Math.min(100, percentage),
        status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
      }
    })
  }

  const data = processData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">Budget: ₹{data.budget.toLocaleString("en-IN")}</p>
          <p className="text-sm text-red-600">Spent: ₹{data.spent.toLocaleString("en-IN")}</p>
          <p className="text-sm text-green-600">Remaining: ₹{data.remaining.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-500">{data.percentage.toFixed(1)}% used</p>
        </div>
      )
    }
    return null
  }

  const formatMonthDisplay = (monthString) => {
    const date = new Date(monthString + "-01")
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No budgets set for {formatMonthDisplay(selectedMonth || new Date().toISOString().slice(0, 7))}.</p>
        <p className="text-sm mt-1">Create a budget to start tracking!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <Card key={item.category} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {item.category}
                <Badge
                  variant={item.status === "over" ? "destructive" : item.status === "warning" ? "secondary" : "default"}
                >
                  {item.percentage.toFixed(0)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {item.spent.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    {item.budget.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Progress
                value={Math.min(100, item.percentage)}
                className={`h-2 ${
                  item.status === "over"
                    ? "[&>div]:bg-red-500"
                    : item.status === "warning"
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-green-500"
                }`}
              />

              <div className="flex items-center justify-between text-xs">
                <span
                  className={`flex items-center gap-1 ${
                    item.status === "over"
                      ? "text-red-600"
                      : item.status === "warning"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {item.status === "over" ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Over budget
                    </>
                  ) : item.status === "warning" ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Near limit
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      On track
                    </>
                  )}
                </span>
                <span className="text-gray-500">₹{item.remaining.toLocaleString("en-IN")} left</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.filter((item) => item.status === "over").length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Over Budget Categories
                </h4>
                <div className="space-y-1">
                  {data
                    .filter((item) => item.status === "over")
                    .map((item) => (
                      <p key={item.category} className="text-sm text-red-700">
                        <strong>{item.category}</strong>: ₹{(item.spent - item.budget).toLocaleString("en-IN")} over
                        budget
                      </p>
                    ))}
                </div>
              </div>
            )}

            {data.filter((item) => item.status === "warning").length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Near Budget Limit
                </h4>
                <div className="space-y-1">
                  {data
                    .filter((item) => item.status === "warning")
                    .map((item) => (
                      <p key={item.category} className="text-sm text-yellow-700">
                        <strong>{item.category}</strong>: {item.percentage.toFixed(0)}% of budget used
                      </p>
                    ))}
                </div>
              </div>
            )}

            {data.filter((item) => item.status === "good").length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Well Within Budget
                </h4>
                <div className="space-y-1">
                  {data
                    .filter((item) => item.status === "good")
                    .map((item) => (
                      <p key={item.category} className="text-sm text-green-700">
                        <strong>{item.category}</strong>: ₹{item.remaining.toLocaleString("en-IN")} remaining
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
