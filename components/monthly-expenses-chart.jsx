"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function MonthlyExpensesChart({ transactions }) {
  const processMonthlyData = () => {
    const monthlyData = {}
    const currentDate = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-IN", { month: "short" })
      monthlyData[monthKey] = {
        month: monthName,
        expenses: 0,
        income: 0,
      }
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (monthlyData[monthKey]) {
        if (transaction.type === "expense") {
          monthlyData[monthKey].expenses += transaction.amount
        } else {
          monthlyData[monthKey].income += transaction.amount
        }
      }
    })

    return Object.values(monthlyData)
  }

  const data = processMonthlyData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a1c14] p-3 border border-white/10 rounded-xl shadow-2xl text-xs space-y-1 text-white">
          <p className="font-bold text-sm text-slate-200">{label}</p>
          {payload.map((entry) => (
            <p
              key={entry.dataKey}
              className={`font-semibold flex items-center justify-between gap-3 ${
                entry.dataKey === "expenses" ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              <span>{entry.dataKey === "expenses" ? "Expenses" : "Income"}:</span>
              <span>₹{entry.value.toLocaleString("en-IN")}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#ffffff10" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
