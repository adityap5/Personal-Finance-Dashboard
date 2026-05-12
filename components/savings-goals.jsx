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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGoals() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError("")
    if (!form.name.trim() || !form.targetAmount) { setFormError("Goal name and target amount are required"); return }
    if (Number(form.targetAmount) <= 0) { setFormError("Target amount must be greater than 0"); return }
    setSubmitting(true)
    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0, deadline: form.deadline || null }),
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
    if (res.ok) { toast.success("Goal deleted"); setGoals((prev) => prev.filter((g) => g._id?.toString() !== id)) }
    else toast.error("Failed to delete goal")
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
    if (res.ok) { toast.success("Progress updated!"); setUpdateAmounts((p) => { const c = { ...p }; delete c[id]; return c }); fetchGoals() }
    else toast.error("Failed to update")
    setUpdatingId(null)
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white"><Target className="h-5 w-5 text-emerald-500" />Savings Goals</h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-0.5">Track progress toward your financial milestones</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 text-sm font-medium transition-all shadow-sm dark:shadow-none">
          <PlusCircle className="h-4 w-4" />New Goal
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-2xl bg-white dark:bg-[#0a1628] border border-emerald-200 dark:border-emerald-500/20 p-5 shadow-sm dark:shadow-none">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Create New Goal</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                {formError && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Goal Name</label>
                    <input placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Target Amount (₹)</label>
                    <input type="number" placeholder="100000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Current Savings (₹)</label>
                    <input type="number" placeholder="0" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-600 dark:text-slate-400">Target Date (optional)</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-60 shadow-sm">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}Create Goal</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0a1628] border border-gray-200 dark:border-white/6 py-14 text-center shadow-sm dark:shadow-none">
          <Target className="h-10 w-10 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">No savings goals yet</p>
          <p className="text-sm text-gray-400 dark:text-slate-600 mt-1">Create a goal to start tracking your progress</p>
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
                <motion.div key={id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a1628] border p-4 shadow-sm dark:shadow-none ${isComplete ? "border-emerald-300 dark:border-emerald-500/30" : "border-gray-200 dark:border-white/6"}`}>
                    {isComplete && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400" />}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                        {goal.deadline && (
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${daysLeft !== null && daysLeft < 30 ? "text-amber-500 dark:text-amber-400" : "text-gray-400 dark:text-slate-500"}`}>
                            <Calendar className="h-3 w-3" />
                            {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Overdue"}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ isComplete ? "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10" : "text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5" }`}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/6 overflow-hidden">
                        <div className={`h-full rounded-full transition-all bg-gradient-to-r ${isComplete ? "from-emerald-400 to-green-400" : "from-emerald-500 to-green-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-slate-600">
                        <span className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{goal.currentAmount.toLocaleString("en-IN")} saved</span>
                        <span className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{goal.targetAmount.toLocaleString("en-IN")} goal</span>
                      </div>
                    </div>
                    {!isComplete && (
                      <div className="flex gap-2 mb-3">
                        <input type="number" placeholder="Update amount" value={updateAmounts[id] ?? ""} onChange={(e) => setUpdateAmounts((p) => ({ ...p, [id]: e.target.value }))} className="flex-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/4 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs" />
                        <button onClick={() => handleUpdateAmount(id)} disabled={updatingId === id || !updateAmounts[id]} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs transition-colors disabled:opacity-40">
                          {updatingId === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                    {isComplete && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">✓ Goal achieved! 🎉</div>}
                    <button onClick={() => handleDelete(id)} disabled={deletingId === id} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors">
                      {deletingId === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}Delete goal
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
