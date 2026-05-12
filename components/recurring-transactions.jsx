"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Repeat, Trash2, Loader2, AlertCircle, IndianRupee, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Bills & Utilities","Healthcare","Education","Travel",
  "Groceries","Rent","Investment","Salary","Business","Other",
]

const FREQUENCY_LABELS = {
  daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly",
}

export default function RecurringTransactions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formError, setFormError] = useState("")

  const [form, setForm] = useState({
    description: "", amount: "", category: "",
    type: "expense", frequency: "monthly", nextDate: "",
  })

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
    if (!form.description || !form.amount || !form.category || !form.frequency) {
      setFormError("Please fill in all required fields")
      return
    }
    if (Number(form.amount) <= 0) {
      setFormError("Amount must be greater than 0")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    if (res.ok) {
      toast.success("Recurring transaction created!")
      setForm({ description: "", amount: "", category: "", type: "expense", frequency: "monthly", nextDate: "" })
      setShowForm(false)
      fetchItems()
    } else {
      const d = await res.json()
      setFormError(d.error || "Failed to create")
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const res = await fetch(`/api/recurring-transactions?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Removed")
      setItems((prev) => prev.filter((i) => i._id?.toString() !== id))
    } else { toast.error("Failed to delete") }
    setDeletingId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="h-5 w-5 text-violet-500" />
            Recurring Transactions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your regular income and expenses</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border-0"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Recurring
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader className="pb-3"><CardTitle className="text-base">New Recurring Transaction</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Description</Label>
                      <Input placeholder="e.g. Netflix Subscription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Amount (₹)</Label>
                      <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Frequency</Label>
                      <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Next Due Date</Label>
                      <Input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Recurring
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Repeat className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recurring transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Add subscriptions, salaries, rent, and other regular transactions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const id = item._id?.toString()
              return (
                <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full shrink-0 ${item.type === "income" ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"}`}>
                          {item.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                            <Badge variant="outline" className="text-xs">{FREQUENCY_LABELS[item.frequency]}</Badge>
                            {item.nextDate && (
                              <span className="text-xs text-gray-400">
                                Next: {new Date(item.nextDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-semibold flex items-center gap-0.5 text-sm ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {item.type === "income" ? "+" : "-"}
                          <IndianRupee className="h-3.5 w-3.5" />
                          {item.amount.toLocaleString("en-IN")}
                        </span>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                        >
                          {deletingId === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
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
