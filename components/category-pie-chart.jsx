"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const FINTECH_PALETTE = [
  "#10b981", // vibrant emerald
  "#34d399", // light mint
  "#059669", // deep emerald
  "#38bdf8", // sky blue
  "#818cf8", // soft indigo
  "#fbbf24", // warm amber
  "#f43f5e", // soft rose
  "#a78bfa", // purple
  "#2dd4bf", // teal
  "#fb923c", // orange
  "#94a3b8", // slate
]

export function CategoryPieChart({ transactions }) {
  const processData = () => {
    const categoryData = {}
    const expenseTransactions = transactions.filter((t) => t.type === "expense")

    if (expenseTransactions.length === 0) return []

    expenseTransactions.forEach((t) => {
      const cat = t.category || "Uncategorized"
      categoryData[cat] = (categoryData[cat] || 0) + t.amount
    })

    const total = Object.values(categoryData).reduce((a, b) => a + b, 0)

    return Object.entries(categoryData)
      .map(([name, value]) => ({
        name,
        value,
        total,
      }))
      .sort((a, b) => b.value - a.value)
  }

  const data = processData()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const total = item.payload.total || 0
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0

      return (
        <div className="bg-[#0a1c14] p-3 border border-white/10 rounded-xl shadow-2xl text-xs space-y-1 text-white">
          <p className="font-bold text-sm text-emerald-400">{item.name}</p>
          <p className="text-slate-300">₹{item.value.toLocaleString("en-IN")}</p>
          <p className="text-slate-500">{percentage}% of monthly spending</p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs text-center">
        <div>
          <p className="text-sm font-semibold text-slate-300">No expense data available</p>
          <p className="text-slate-500 mt-1">Add expense transactions to see your category distribution</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            stroke="transparent"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={FINTECH_PALETTE[index % FINTECH_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-slate-400 text-[11px] font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
