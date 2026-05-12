"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-violet-500" />Savings Goals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track progress toward your financial milestones</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border-0">
          <PlusCircle className="h-4 w-4 mr-1" />New Goal
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader className="pb-3"><CardTitle className="text-base">Create New Goal</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  {formError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Goal Name</Label>
                      <Input placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Target Amount (₹)</Label>
                      <Input type="number" placeholder="100000" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Current Savings (₹)</Label>
                      <Input type="number" placeholder="0" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Target Date (optional)</Label>
                      <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Goal</Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No savings goals yet</p>
            <p className="text-sm text-gray-400 mt-1">Create a goal to start tracking your progress</p>
          </CardContent>
        </Card>
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
                  <Card className={`relative overflow-hidden ${isComplete ? "border-green-400 dark:border-green-600" : ""}`}>
                    {isComplete && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-semibold">{goal.name}</CardTitle>
                          {goal.deadline && (
                            <p className={`text-xs mt-0.5 flex items-center gap-1 ${daysLeft !== null && daysLeft < 30 ? "text-amber-500" : "text-gray-400"}`}>
                              <Calendar className="h-3 w-3" />
                              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Overdue"}
                            </p>
                          )}
                        </div>
                        <Badge variant={isComplete ? "default" : pct > 75 ? "secondary" : "outline"} className="text-xs shrink-0">{pct.toFixed(0)}%</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Progress value={pct} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{goal.currentAmount.toLocaleString("en-IN")} saved</span>
                          <span className="flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{goal.targetAmount.toLocaleString("en-IN")} goal</span>
                        </div>
                      </div>
                      {!isComplete && (
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Update amount" value={updateAmounts[id] ?? ""} onChange={(e) => setUpdateAmounts((p) => ({ ...p, [id]: e.target.value }))} className="h-8 text-xs" />
                          <Button size="sm" variant="outline" onClick={() => handleUpdateAmount(id)} disabled={updatingId === id || !updateAmounts[id]} className="h-8 px-2 shrink-0">
                            {updatingId === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                      {isComplete && <div className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Goal achieved! 🎉</div>}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(id)} disabled={deletingId === id} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2 w-full text-xs">
                        {deletingId === id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}Delete goal
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
