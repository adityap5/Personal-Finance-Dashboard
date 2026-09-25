"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { IndianRupee, TrendingUp, TrendingDown, AlertTriangle, Target, CheckCircle2 } from "lucide-react"

export function BudgetComparison({ budgets, transactions, selectedMonth }) {
  const processData = () => {
    const currentMonth = selectedMonth || new Date().toISOString().slice(0, 7)
    const currentBudgets = budgets.filter((b) => b.month === currentMonth)

    return currentBudgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === "expense" && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
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
      const item = payload[0].payload
      return (
        <div className="bg-[#0a1c14] p-3 border border-white/10 rounded-xl shadow-2xl text-xs space-y-1 text-white">
          <p className="font-bold text-sm text-emerald-400">{label}</p>
          <p className="text-slate-300">Budget: ₹{item.budget.toLocaleString("en-IN")}</p>
          <p className="text-rose-400">Spent: ₹{item.spent.toLocaleString("en-IN")}</p>
          <p className="text-emerald-400">Remaining: ₹{item.remaining.toLocaleString("en-IN")}</p>
          <p className="text-slate-500">{item.percentage.toFixed(1)}% utilized</p>
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
      <div className="text-center py-12 rounded-2xl bg-[#071912] border border-white/6 text-slate-400">
        <Target className="h-10 w-10 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-white">
          No budgets set for {formatMonthDisplay(selectedMonth || new Date().toISOString().slice(0, 7))}
        </p>
        <p className="text-xs text-slate-500 mt-1">Set a budget for any category to track monthly spending limits.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => {
          const isOver = item.status === "over"
          const isWarning = item.status === "warning"

          return (
            <div
              key={item.category}
              className={`p-4 rounded-2xl bg-[#071912] border ${
                isOver
                  ? "border-rose-500/30 bg-rose-500/3"
                  : isWarning
                  ? "border-amber-500/30 bg-amber-500/3"
                  : "border-white/6"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white truncate max-w-[160px]">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isOver
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                      : isWarning
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {item.percentage.toFixed(0)}%
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Spent: ₹{item.spent.toLocaleString("en-IN")}</span>
                  <span>Budget: ₹{item.budget.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? "bg-rose-500"
                        : isWarning
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-emerald-500 to-green-400"
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={`flex items-center gap-1 font-medium ${
                    isOver
                      ? "text-rose-400"
                      : isWarning
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {isOver ? (
                    <>
                      <AlertTriangle className="h-3 w-3" /> Over budget
                    </>
                  ) : isWarning ? (
                    <>
                      <TrendingUp className="h-3 w-3" /> Near limit
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> On track
                    </>
                  )}
                </span>
                <span className="text-slate-500">
                  ₹{item.remaining.toLocaleString("en-IN")} remaining
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart Section */}
      <div className="p-5 rounded-2xl bg-[#071912] border border-white/6">
        <h4 className="text-sm font-bold text-white mb-1">Budget vs Actual Spending</h4>
        <p className="text-xs text-slate-500 mb-4">Comparison of budgeted target vs realized expenses</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={45}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="spent" fill="#f43f5e" name="Spent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
