"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

const CATEGORIES = [
  "Food & Dining", "Transportation", "Shopping", "Entertainment",
  "Bills & Utilities", "Healthcare", "Education", "Travel",
  "Groceries", "Rent", "Investment", "Salary", "Business", "Other"
]

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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{editTransaction ? "Edit Transaction" : "Add New Transaction"}</h3>
        {editTransaction && <p className="text-sm text-gray-600">Editing: {editTransaction.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Type */}
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editTransaction ? "Update Transaction" : "Add Transaction"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
