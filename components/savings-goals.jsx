"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PlusCircle, Target, Trash2, Loader2, AlertCircle, IndianRupee, Calendar, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function SavingsGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
  const [updateAmounts, setUpdateAmounts] = useState({})

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/savings-goals")
      const data = await res.json()
      setGoals(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError("")
    if (!form.name.trim() || !form.targetAmount) {
      setFormError("Goal name and target amount are required")
      return
    }
    if (Number(form.targetAmount) <= 0) {
      setFormError("Target amount must be greater than 0")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        deadline: form.deadline || null,
      }),
    })
    if (res.ok) {
      toast.success("Savings goal created!")
      setForm({ name: "", targetAmount: "", currentAmount: "", deadline: "" })
      setShowForm(false)
      fetchGoals()
    } else {
      const d = await res.json()
      setFormError(d.error || "Failed to create goal")
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const res = await fetch(`/api/savings-goals?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Goal deleted")
      setGoals((prev) => prev.filter((g) => g._id?.toString() !== id))
    } else {
      toast.error("Failed to delete goal")
    }
    setDeletingId(null)
  }

  const handleUpdateAmount = async (id) => {
    const newAmount = updateAmounts[id]
    if (newAmount === undefined || newAmount === "") return
    setUpdatingId(id)
    const res = await fetch("/api/savings-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, currentAmount: parseFloat(newAmount) }),
    })
    if (res.ok) {
      toast.success("Progress updated!")
      setUpdateAmounts((p) => {
        const c = { ...p }
        delete c[id]
        return c
      })
      fetchGoals()
    } else {
      toast.error("Failed to update")
    }
    setUpdatingId(null)
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-emerald-400" />
            Savings Goals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track progress toward your financial milestones
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs sm:text-sm font-semibold transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-emerald-500/20 p-6 shadow-xl shadow-black/40">
              <h3 className="text-base font-bold text-white mb-4">Create New Goal</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Goal Name
                    </label>
                    <input
                      placeholder="e.g. Emergency Fund"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={form.targetAmount}
                      onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Current Savings (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.currentAmount}
                      onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Target Date (optional)
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-60 shadow-lg shadow-emerald-950/40"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/4 border border-white/8 text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <div className="rounded-3xl bg-[#071912]/80 backdrop-blur-xl border border-white/8 py-16 text-center shadow-xl shadow-black/30">
          <Target className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">No savings goals yet</p>
          <p className="text-xs text-slate-500 mt-1">Create a goal to start tracking your progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((goal) => {
              const id = goal._id?.toString()
              const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
              const daysLeft = getDaysLeft(goal.deadline)
              const isComplete = pct >= 100
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div
                    className={`relative overflow-hidden rounded-3xl bg-[#071912]/80 backdrop-blur-xl border p-5 shadow-xl shadow-black/40 transition-all ${
                      isComplete
                        ? "border-emerald-500/40 bg-gradient-to-b from-[#0a2319] to-[#071912]"
                        : "border-white/8 hover:border-emerald-500/20"
                    }`}
                  >
                    {isComplete && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-green-400" />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{goal.name}</p>
                        {goal.deadline && (
                          <p
                            className={`text-[11px] mt-0.5 flex items-center gap-1 font-medium ${
                              daysLeft !== null && daysLeft < 30
                                ? "text-amber-400"
                                : "text-slate-400"
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {daysLeft !== null && daysLeft > 0
                              ? `${daysLeft} days left`
                              : daysLeft === 0
                              ? "Due today"
                              : "Overdue"}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isComplete
                            ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/15"
                            : "text-slate-400 border-white/10 bg-white/4"
                        }`}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all bg-gradient-to-r ${
                            isComplete
                              ? "from-emerald-400 to-green-400 shadow-sm shadow-emerald-500/50"
                              : "from-emerald-500 to-green-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-0.5 text-white">
                          <IndianRupee className="h-3 w-3 text-emerald-400" />
                          {goal.currentAmount.toLocaleString("en-IN")} saved
                        </span>
                        <span className="flex items-center gap-0.5 text-slate-400">
                          <IndianRupee className="h-3 w-3" />
                          {goal.targetAmount.toLocaleString("en-IN")} goal
                        </span>
                      </div>
                    </div>

                    {!isComplete && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="number"
                          placeholder="Update amount"
                          value={updateAmounts[id] ?? ""}
                          onChange={(e) =>
                            setUpdateAmounts((p) => ({ ...p, [id]: e.target.value }))
                          }
                          style={{ colorScheme: "dark" }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs font-medium"
                        />
                        <button
                          onClick={() => handleUpdateAmount(id)}
                          disabled={updatingId === id || !updateAmounts[id]}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors disabled:opacity-40"
                        >
                          {updatingId === id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {isComplete && (
                      <div className="text-xs text-emerald-400 font-semibold mb-3 flex items-center gap-1">
                        <span>✓ Goal achieved!</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-medium"
                    >
                      {deletingId === id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete goal
                    </button>
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
