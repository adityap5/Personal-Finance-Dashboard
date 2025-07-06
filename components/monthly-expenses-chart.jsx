"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function MonthlyExpensesChart({ transactions }) {
  const processMonthlyData = () => {
    const monthlyData = {}
    const currentDate = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
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
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm ${entry.dataKey === "expenses" ? "text-red-600" : "text-green-600"}`}>
              {entry.dataKey === "expenses" ? "Expenses" : "Income"}: ₹{entry.value.toLocaleString("en-IN")}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
          <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
