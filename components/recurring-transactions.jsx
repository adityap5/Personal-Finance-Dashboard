"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Repeat,
  PlusCircle,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Calendar,
  Play,
  Pause,
} from "lucide-react"
import { toast } from "sonner"
import CategorySelector from "./category-selector"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

export default function RecurringTransactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    frequency: "monthly",
    dueDay: "5",
    startDate: new Date().toISOString().split("T")[0],
  })

  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/recurring-transactions")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreateDialog = () => {
    setEditingItem(null)
    setForm({
      title: "",
      amount: "",
      category: "",
      type: "expense",
      frequency: "monthly",
      dueDay: "5",
      startDate: new Date().toISOString().split("T")[0],
    })
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (item) => {
    setEditingItem(item)
    setForm({
      title: item.title || item.description || "",
      amount: item.amount?.toString() || "",
      category: item.category || "",
      type: item.type || "expense",
      frequency: item.frequency || "monthly",
      dueDay: item.dueDay?.toString() || "5",
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!form.title.trim() || !form.amount || !form.category) {
      setFormError("Please fill in all required fields")
      return
    }

    const parsedAmount = parseFloat(form.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be greater than 0")
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!editingItem
      const url = "/api/recurring-transactions"
      const method = isEdit ? "PUT" : "POST"
      const payload = isEdit
        ? { id: editingItem._id, ...form, amount: parsedAmount }
        : { ...form, amount: parsedAmount }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save rule")

      toast.success(isEdit ? "Recurring rule updated" : "Recurring rule created!")
      setDialogOpen(false)
      fetchItems()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (item) => {
    const id = item._id.toString()
    setTogglingId(id)
    try {
      const res = await fetch("/api/recurring-transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !item.active }),
      })
      if (!res.ok) throw new Error()
      setItems((prev) =>
        prev.map((i) =>
          i._id.toString() === id ? { ...i, active: !i.active } : i
        )
      )
      toast.success(item.active ? "Rule paused" : "Rule resumed")
    } catch {
      toast.error("Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/recurring-transactions?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Removed recurring rule")
        setItems((prev) => prev.filter((i) => i._id?.toString() !== id))
      } else {
        toast.error("Failed to delete")
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Repeat className="h-5 w-5 text-emerald-400" />
            Recurring Transactions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic rules for repeated income and expenses (e.g. salary, SIP, standard logs).
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40 w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          Add Recurring Rule
        </button>
      </div>

      {/* Rules List */}
      {items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#071912] border border-white/6 text-center">
          <Repeat className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No recurring rules configured</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Set up automatic transaction rules for recurring paychecks, investments, or ongoing expenses.
          </p>
          <button
            onClick={openCreateDialog}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          >
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const id = item._id?.toString()
              const isIncome = item.type === "income"
              const isActive = item.active !== false

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl bg-[#071912] border transition-all ${
                    isActive
                      ? "border-emerald-500/15 hover:border-emerald-500/30"
                      : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">
                            {item.title || item.description}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-white/5 border-white/10 text-slate-400"
                            }`}
                          >
                            {isActive ? "Active" : "Paused"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">
                            {FREQUENCY_LABELS[item.frequency] || item.frequency}
                            {item.frequency === "monthly" && item.dueDay && ` (Day ${item.dueDay})`}
                          </span>
                          {item.nextDueDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                Next: {new Date(item.nextDueDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div
                        className={`text-base font-bold flex items-center gap-0.5 ${
                          isIncome ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        <span>{isIncome ? "+" : "−"}</span>
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{item.amount.toLocaleString("en-IN")}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Pause / Resume */}
                        <button
                          onClick={() => handleToggleActive(item)}
                          disabled={togglingId === id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title={isActive ? "Pause rule" : "Resume rule"}
                        >
                          {togglingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 text-emerald-400" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditDialog(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit rule"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete rule"
                        >
                          {deletingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#071912] border-emerald-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Repeat className="h-5 w-5 text-emerald-400" />
              {editingItem ? "Edit Recurring Rule" : "New Recurring Rule"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure deterministic scheduling for recurring transactions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/4 border border-white/6">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "expense" })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  form.type === "expense"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "income" })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  form.type === "income"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Income
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Rule Title
              </label>
              <input
                placeholder="e.g. Monthly Paycheck, Mutual Fund SIP, Gym Membership"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    style={{ colorScheme: "dark" }}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <CategorySelector
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                  placeholder="Select category"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Frequency
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  aria-label="Recurring frequency"
                  style={{ colorScheme: "dark" }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="monthly" className="bg-[#0a1c14] text-white">Monthly</option>
                  <option value="weekly" className="bg-[#0a1c14] text-white">Weekly</option>
                  <option value="yearly" className="bg-[#0a1c14] text-white">Yearly</option>
                  <option value="daily" className="bg-[#0a1c14] text-white">Daily</option>
                </select>
              </div>

              {/* Monthly Due Day (or Start Date) */}
              {form.frequency === "monthly" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Day of Month (1–31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    style={{ colorScheme: "dark" }}
                    value={form.dueDay}
                    onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    style={{ colorScheme: "dark" }}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingItem ? "Save Changes" : "Create Rule"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
