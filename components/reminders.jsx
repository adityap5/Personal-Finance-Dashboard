"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Pause,
  Play,
  Zap,
  Loader2,
  IndianRupee,
  AlertCircle,
  Check,
  RefreshCw,
  TrendingDown,
  TrendingUp,
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

export default function Reminders({ onTransactionsChanged = () => {} }) {
  const [reminders, setReminders] = useState([])
  const [summary, setSummary] = useState({
    dueTodayCount: 0,
    overdueCount: 0,
    upcomingCount: 0,
    monthlyTotal: 0,
    totalCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [filterTab, setFilterTab] = useState("all") // all, due_today, overdue, upcoming, paused
  const [processingManual, setProcessingManual] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "expense",
    category: "",
    frequency: "monthly",
    dueDay: "5",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    autoCreateTransaction: true,
    notes: "",
  })

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReminders(data.reminders || [])
      setSummary(data.summary || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  const openCreateDialog = () => {
    setEditingReminder(null)
    setForm({
      name: "",
      amount: "",
      type: "expense",
      category: "",
      frequency: "monthly",
      dueDay: "5",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      autoCreateTransaction: true,
      notes: "",
    })
    setFormError("")
    setDialogOpen(true)
  }

  const openEditDialog = (item) => {
    setEditingReminder(item)
    setForm({
      name: item.name || "",
      amount: item.amount?.toString() || "",
      type: item.type || "expense",
      category: item.category || "",
      frequency: item.frequency || "monthly",
      dueDay: item.dueDay?.toString() || "5",
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: item.endDate
        ? new Date(item.endDate).toISOString().split("T")[0]
        : "",
      autoCreateTransaction: item.autoCreateTransaction ?? true,
      notes: item.notes || "",
    })
    setFormError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!form.name.trim() || !form.amount || !form.category) {
      setFormError("Name, amount, and category are required")
      return
    }

    const parsedAmount = parseFloat(form.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be a positive number")
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!editingReminder
      const url = isEdit
        ? `/api/reminders/${editingReminder._id}`
        : "/api/reminders"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parsedAmount,
          endDate: form.endDate || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save reminder")

      toast.success(isEdit ? "Reminder updated" : "Reminder created!")
      setDialogOpen(false)
      fetchReminders()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePause = async (item) => {
    const id = item._id
    setTogglingId(id)
    const newStatus = item.rawStatus === "paused" ? "active" : "paused"
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(newStatus === "paused" ? "Reminder paused" : "Reminder resumed")
      fetchReminders()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success("Reminder deleted")
      setReminders((prev) => prev.filter((r) => r._id !== id))
      fetchReminders()
    } catch {
      toast.error("Failed to delete reminder")
    } finally {
      setDeletingId(null)
    }
  }

  const handleProcessDueManual = async () => {
    setProcessingManual(true)
    try {
      const res = await fetch("/api/reminders/process-user", {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Processing failed")

      if (data.transactionsCreated > 0) {
        toast.success(
          `Processed! Generated ${data.transactionsCreated} transaction${
            data.transactionsCreated > 1 ? "s" : ""
          }.`
        )
        onTransactionsChanged()
      } else {
        toast.info("All reminders are up-to-date. No transactions needed.")
      }
      fetchReminders()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessingManual(false)
    }
  }

  const filteredReminders = reminders.filter((r) => {
    if (filterTab === "due_today") return r.status === "due_today"
    if (filterTab === "overdue") return r.status === "overdue"
    if (filterTab === "upcoming") return r.status === "upcoming"
    if (filterTab === "paused") return r.rawStatus === "paused"
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-emerald-400" />
            Reminders & Scheduled Obligations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track monthly EMIs, subscriptions, bills, and automatically record due transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleProcessDueManual}
            disabled={processingManual}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            title="Check and generate transactions for due items"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${processingManual ? "animate-spin text-emerald-400" : ""}`} />
            Check & Process Due
          </button>

          <button
            onClick={openCreateDialog}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/40"
          >
            <PlusCircle className="h-4 w-4" />
            New Reminder
          </button>
        </div>
      </div>

      {/* ── Summary Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Monthly */}
        <div className="p-4 rounded-2xl bg-[#071912] border border-emerald-500/15">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Monthly Commitment
          </p>
          <div className="text-2xl font-black text-white mt-1 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            {summary.monthlyTotal.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Active recurring obligations</p>
        </div>

        {/* Due Today */}
        <div className={`p-4 rounded-2xl bg-[#071912] border ${
          summary.dueTodayCount > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-white/6"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Due Today
            </p>
            {summary.dueTodayCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className={`text-2xl font-black mt-1 ${
            summary.dueTodayCount > 0 ? "text-amber-400" : "text-white"
          }`}>
            {summary.dueTodayCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Payments due today</p>
        </div>

        {/* Overdue */}
        <div className={`p-4 rounded-2xl bg-[#071912] border ${
          summary.overdueCount > 0 ? "border-rose-500/40 bg-rose-500/5" : "border-white/6"
        }`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overdue
          </p>
          <div className={`text-2xl font-black mt-1 ${
            summary.overdueCount > 0 ? "text-rose-400" : "text-white"
          }`}>
            {summary.overdueCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Past due obligations</p>
        </div>

        {/* Upcoming */}
        <div className="p-4 rounded-2xl bg-[#071912] border border-white/6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Upcoming
          </p>
          <div className="text-2xl font-black text-white mt-1">
            {summary.upcomingCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Future scheduled bills</p>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { key: "all", label: "All Reminders", count: reminders.length },
          { key: "due_today", label: "Due Today", count: summary.dueTodayCount },
          { key: "overdue", label: "Overdue", count: summary.overdueCount },
          { key: "upcoming", label: "Upcoming", count: summary.upcomingCount },
          { key: "paused", label: "Paused", count: reminders.filter((r) => r.rawStatus === "paused").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === tab.key
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-white/3 border border-white/6 text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterTab === tab.key ? "bg-emerald-500/30 text-emerald-200" : "bg-white/5 text-slate-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Reminders List ── */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#071912] border border-white/6 text-center">
          <Bell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No reminders in this view</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Configure your monthly EMIs, subscriptions, or credit card bills to track due dates easily.
          </p>
          <button
            onClick={openCreateDialog}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          >
            Add Your First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredReminders.map((item) => {
              const isOverdue = item.status === "overdue"
              const isDueToday = item.status === "due_today"
              const isPaused = item.rawStatus === "paused"
              const isCompleted = item.status === "completed"
              const isIncome = item.type === "income"

              // Status badge styling
              let statusLabel = "Upcoming"
              let statusClasses = "bg-white/5 border-white/10 text-slate-400"

              if (isDueToday) {
                statusLabel = "Due Today"
                statusClasses = "bg-amber-500/15 border-amber-500/30 text-amber-300 animate-pulse"
              } else if (isOverdue) {
                statusLabel = `Overdue (${Math.abs(item.daysUntilDue)}d)`
                statusClasses = "bg-rose-500/15 border-rose-500/30 text-rose-300"
              } else if (isPaused) {
                statusLabel = "Paused"
                statusClasses = "bg-white/5 border-white/10 text-slate-500"
              } else if (isCompleted) {
                statusLabel = "Completed"
                statusClasses = "bg-white/5 border-white/10 text-slate-600"
              } else if (item.daysUntilDue === 1) {
                statusLabel = "Due Tomorrow"
                statusClasses = "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              } else if (item.daysUntilDue > 1) {
                statusLabel = `In ${item.daysUntilDue} days`
                statusClasses = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`p-4 rounded-2xl bg-[#071912] border transition-all ${
                    isOverdue
                      ? "border-rose-500/25 bg-rose-500/3"
                      : isDueToday
                      ? "border-amber-500/30 bg-amber-500/3"
                      : "border-white/6 hover:border-emerald-500/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isOverdue
                            ? "bg-rose-500/15 text-rose-400"
                            : isDueToday
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white truncate">
                            {item.name}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClasses}`}
                          >
                            {statusLabel}
                          </span>
                          {item.autoCreateTransaction ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" />
                              Auto-Pay
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/4 border border-white/8 text-slate-500">
                              Manual
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">
                            {item.frequency === "monthly" && item.dueDay
                              ? `${item.dueDay}th of month`
                              : item.frequency}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            Next: {new Date(item.nextDueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500 truncate max-w-xs">{item.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right amount & controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div
                        className={`text-base font-bold flex items-center gap-0.5 ${
                          isIncome ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{item.amount.toLocaleString("en-IN")}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Pause / Resume */}
                        <button
                          onClick={() => handleTogglePause(item)}
                          disabled={togglingId === item._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title={isPaused ? "Resume reminder" : "Pause reminder"}
                        >
                          {togglingId === item._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isPaused ? (
                            <Play className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditDialog(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit reminder"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete reminder"
                        >
                          {deletingId === item._id ? (
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

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#071912] border-emerald-500/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-emerald-400" />
              {editingReminder ? "Edit Reminder" : "New Scheduled Reminder"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure EMIs, subscriptions, and recurring bills with optional auto-transaction generation.
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
                Expense (EMI, Bill, Subscription)
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
                Income (SIP Return, Rent In)
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Reminder Name
              </label>
              <input
                placeholder="e.g. Home Loan EMI, Netflix, House Rent, Health Insurance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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

            {/* Schedule Section */}
            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Schedule & Due Date
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    aria-label="Reminder frequency"
                    style={{ colorScheme: "dark" }}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="monthly" className="bg-[#0a1c14] text-white">Monthly</option>
                    <option value="weekly" className="bg-[#0a1c14] text-white">Weekly</option>
                    <option value="yearly" className="bg-[#0a1c14] text-white">Yearly</option>
                  </select>
                </div>

                {form.frequency === "monthly" ? (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Day of Month (1–31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      style={{ colorScheme: "dark" }}
                      value={form.dueDay}
                      onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Start Date</label>
                    <input
                      type="date"
                      style={{ colorScheme: "dark" }}
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {form.frequency === "monthly" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Start Date</label>
                    <input
                      type="date"
                      style={{ colorScheme: "dark" }}
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">End Date (optional)</label>
                    <input
                      type="date"
                      style={{ colorScheme: "dark" }}
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Automation Toggle */}
            <div className="p-3.5 rounded-xl bg-white/3 border border-white/6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoCreateTransaction}
                  onChange={(e) =>
                    setForm({ ...form, autoCreateTransaction: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    Automatically create transaction on due date
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    When enabled, FinanceIQ will automatically record an expense transaction when the due date arrives.
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Notes (optional)
              </label>
              <input
                placeholder="Account number, loan reference, or special instructions"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>

            {/* Actions */}
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
                {editingReminder ? "Save Changes" : "Save Reminder"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
