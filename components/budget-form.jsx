"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, IndianRupee } from "lucide-react"
import CategorySelector from "./category-selector"

export function BudgetForm({ onBudgetAdded, selectedMonth }) {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: selectedMonth || new Date().toISOString().slice(0, 7),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.category || !formData.amount || !formData.month) {
      setError("Please fill in all fields")
      return
    }

    if (Number.parseFloat(formData.amount) <= 0) {
      setError("Budget amount must be greater than 0")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save budget")
      }

      setFormData({
        category: "",
        amount: "",
        month: selectedMonth || new Date().toISOString().slice(0, 7),
      })

      onBudgetAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category
          </label>
          <CategorySelector
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            placeholder="Select or create category"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="budget-amount" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Budget Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              id="budget-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              style={{ colorScheme: "dark" }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-base"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="budget-month" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Target Month
          </label>
          <input
            id="budget-month"
            type="month"
            style={{ colorScheme: "dark" }}
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Set Category Budget
        </button>
      </form>
    </motion.div>
  )
}
