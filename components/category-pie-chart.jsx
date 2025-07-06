"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
]

export function CategoryPieChart({ transactions }) {
  const processData = () => {
    const categoryData = {}

    const expenseTransactions = transactions.filter((t) => t.type === "expense")

    if (expenseTransactions.length === 0) {
      return []
    }

    expenseTransactions.forEach((transaction) => {
      if (categoryData[transaction.category]) {
        categoryData[transaction.category] += transaction.amount
      } else {
        categoryData[transaction.category] = transaction.amount
      }
    })

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
      }))
      .sort((a, b) => b.value - a.value)
  }

  const data = processData()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = payload[0].payload.total || 0
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">₹{data.value.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.03) return null

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No expense data available</p>
          <p className="text-sm">Add some expense transactions to see the breakdown</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map((item) => ({ ...item, total }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: "12px" }}>
                {value} (₹{entry.payload.value.toLocaleString("en-IN")})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
