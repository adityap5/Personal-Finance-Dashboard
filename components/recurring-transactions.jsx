"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Repeat, Trash2, Loader2, AlertCircle, IndianRupee, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Bills & Utilities","Healthcare","Education","Travel",
  "Groceries","Rent","Investment","Salary","Business","Other",
]
const FREQUENCY_LABELS = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" }

/* Shared input/select style */
const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm transition-colors"

export default function RecurringTransactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({ description: "", amount: "", category: "", type: "expense", frequency: "monthly", nextDate: "" })

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/recurring-transactions")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError("")
    if (!form.description || !form.amount || !form.category || !form.frequency) { setFormError("Please fill in all required fields"); return }
    if (Number(form.amount) <= 0) { setFormError("Amount must be greater than 0"); return }
    setSubmitting(true)
    const res = await fetch("/api/recurring-transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    if (res.ok) {
      toast.success("Recurring transaction created!")
      setForm({ description: "", amount: "", category: "", type: "expense", frequency: "monthly", nextDate: "" })
      setShowForm(false); fetchItems()
    } else { const d = await res.json(); setFormError(d.error || "Failed to create") }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const res = await fetch(`/api/recurring-transactions?id=${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Removed"); setItems((prev) => prev.filter((i) => i._id?.toString() !== id)) }
    else toast.error("Failed to delete")
    setDeletingId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Repeat className="h-5 w-5 text-emerald-500" />Recurring Transactions
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-0.5">Manage your regular income and expenses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 text-sm font-medium transition-all shadow-sm dark:shadow-none">
          <PlusCircle className="h-4 w-4" />Add Recurring
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-2xl bg-white dark:bg-[#0a1628] border border-emerald-200 dark:border-emerald-500/20 p-5 shadow-sm dark:shadow-none">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">New Recurring Transaction</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />{formError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Description</label>
                    <input placeholder="e.g. Netflix Subscription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Type</label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="h-10 bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0d1f35] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Amount (₹)</label>
                    <input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Category</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="h-10 bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0d1f35] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Frequency</label>
                    <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                      <SelectTrigger className="h-10 bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/8 text-gray-900 dark:text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0d1f35] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                        {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Next Due Date</label>
                    <input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-60 shadow-sm">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}Save Recurring
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 py-14 text-center shadow-sm dark:shadow-none">
          <Repeat className="h-10 w-10 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">No recurring transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-slate-600 mt-1">Add subscriptions, salaries, rent, and other regular transactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const id = item._id?.toString()
              return (
                <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${item.type === "income"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}>
                          {item.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-slate-400">{item.category}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-500">{FREQUENCY_LABELS[item.frequency]}</span>
                            {item.nextDate && (
                              <span className="text-xs text-gray-400 dark:text-slate-600">
                                Next: {new Date(item.nextDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-semibold flex items-center gap-0.5 text-sm ${item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {item.type === "income" ? "+" : "-"}<IndianRupee className="h-3.5 w-3.5" />{item.amount.toLocaleString("en-IN")}
                        </span>
                        <button onClick={() => handleDelete(id)} disabled={deletingId === id}
                          className="p-2 rounded-xl text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors disabled:opacity-40">
                          {deletingId === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
