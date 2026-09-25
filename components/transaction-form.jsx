"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle, IndianRupee, Calendar } from "lucide-react"
import CategorySelector from "./category-selector"

export function TransactionForm({ onTransactionAdded, editTransaction = null, onCancel = null }) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount?.toString() || "",
        description: editTransaction.description || "",
        category: editTransaction.category || "",
        type: editTransaction.type || "expense",
        date: editTransaction.date
          ? new Date(editTransaction.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      })
    }
  }, [editTransaction])

  const validate = () => {
    const newErrors = {}

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a number greater than 0"
    }

    // Description is explicitly OPTIONAL

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (!formData.type) {
      newErrors.type = "Please select a type"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")

    if (!validate()) return

    setLoading(true)

    try {
      const url = editTransaction ? `/api/transactions/${editTransaction._id}` : "/api/transactions"
      const method = editTransaction ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save transaction")
      }

      if (!editTransaction) {
        setFormData({
          amount: "",
          description: "",
          category: "",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
        })
      }

      onTransactionAdded()
      if (onCancel) onCancel()
    } catch (err) {
      console.error("Error saving transaction:", err)
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">
          {editTransaction ? "Edit Transaction" : "Record Transaction"}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {editTransaction ? "Update transaction details" : "Add an income or expense to your records"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Type: Segmented toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/4 border border-white/8 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === "expense"
                  ? "bg-rose-500/25 text-rose-200 border border-rose-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                formData.type === "income"
                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Income
            </button>
          </div>
          {errors.type && <p className="text-xs text-red-400">{errors.type}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              style={{ colorScheme: "dark" }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-base"
            />
          </div>
          {errors.amount && <p className="text-xs text-red-400">{errors.amount}</p>}
        </div>

        {/* Category: Uses CategorySelector with inline create */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Category
          </label>
          <CategorySelector
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
            placeholder="Select or create category"
          />
          {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
        </div>

        {/* Description: OPTIONAL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <span className="text-[10px] text-slate-500">Optional</span>
          </div>
          <input
            id="description"
            type="text"
            style={{ colorScheme: "dark" }}
            placeholder="e.g. Dinner with team, Groceries, Client payment"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Date
          </label>
          <div className="relative">
            <input
              id="date"
              type="date"
              style={{ colorScheme: "dark" }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
            />
          </div>
          {errors.date && <p className="text-xs text-red-400">{errors.date}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editTransaction ? "Save Changes" : "Add Transaction"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
