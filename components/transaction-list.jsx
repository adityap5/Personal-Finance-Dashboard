"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionForm } from "./transaction-form"
import { Edit2, Trash2, Search, TrendingUp, TrendingDown, IndianRupee, Loader2, Bug } from "lucide-react"

export function TransactionList({ transactions, onTransactionUpdated, selectedMonth }) {
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  const handleDebug = async () => {
    try {
      const response = await fetch("/api/transactions/debug")
      const data = await response.json()
      setDebugInfo(data)
      console.log("Debug info:", data)
    } catch (err) {
      console.error("Debug failed:", err)
    }
  }

  const handleDelete = async (transaction) => {
    console.log("Attempting to delete transaction:", transaction)

    if (!transaction || !transaction._id) {
      setError("Invalid transaction data")
      return
    }

    setDeletingId(transaction._id)
    setError("")
    setShowDeleteConfirm(null)

    try {
      // First, try to fetch the transaction to see if it exists
      console.log("Checking if transaction exists...")
      const checkResponse = await fetch(`/api/transactions/${transaction._id}`)
      console.log("Check response status:", checkResponse.status)

      if (checkResponse.status === 404) {
        setError("Transaction not found in database. It may have been already deleted.")
        return
      }

      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: "DELETE",
      })

      console.log("Delete response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Delete error response:", errorData)
        throw new Error(errorData.error || "Failed to delete transaction")
      }

      const result = await response.json()
      console.log("Delete success:", result)

      onTransactionUpdated()
    } catch (err) {
      console.error("Error deleting transaction:", err)
      setError(`Failed to delete transaction: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = async (transaction) => {
    console.log("Editing transaction:", transaction)

    // Check if transaction exists before editing
    try {
      const response = await fetch(`/api/transactions/${transaction._id}`)
      if (response.status === 404) {
        setError("Transaction not found in database. It may have been deleted.")
        onTransactionUpdated() // Refresh the list
        return
      }
    } catch (err) {
      console.error("Error checking transaction:", err)
    }

    setEditingTransaction(transaction)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory

    const matchesMonth = selectedMonth ? new Date(transaction.date).toISOString().slice(0, 7) === selectedMonth : true

    return matchesSearch && matchesType && matchesCategory && matchesMonth
  })

  const categories = [...new Set(transactions.map((t) => t.category))]

  if (editingTransaction) {
    return (
      <TransactionForm
        editTransaction={editingTransaction}
        onTransactionAdded={() => {
          onTransactionUpdated()
          setEditingTransaction(null)
        }}
        onCancel={() => setEditingTransaction(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setError("")} className="text-red-600 hover:text-red-700">
              Dismiss
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTransactionUpdated}
              className="text-blue-600 hover:text-blue-700"
            >
              Refresh List
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={handleDebug} title="Debug Database">
          <Bug className="h-4 w-4" />
        </Button>
      </div>

      {debugInfo && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Database Debug Info</h4>
          <p className="text-sm text-blue-700">Total transactions: {debugInfo.totalCount}</p>
          <p className="text-sm text-blue-700">Database: {debugInfo.databaseName}</p>
          <p className="text-sm text-blue-700">Collection: {debugInfo.collectionName}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugInfo(null)}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            Hide Debug Info
          </Button>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-500">
              No transactions found
            </motion.div>
          ) : (
            filteredTransactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((transaction) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString("en-IN")}
                            </span>
                            
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`font-semibold flex items-center gap-1 ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          <IndianRupee className="h-4 w-4" />
                          {transaction.amount.toLocaleString("en-IN")}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            disabled={deletingId === transaction._id}
                            title="Edit transaction"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setShowDeleteConfirm(transaction)}
                            disabled={deletingId === transaction._id}
                            title="Delete transaction"
                          >
                            {deletingId === transaction._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Transaction</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Are you sure you want to delete this transaction?</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium">{showDeleteConfirm.description}</p>
                <p className="text-sm text-gray-600">
                  {showDeleteConfirm.category} • ₹{showDeleteConfirm.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {new Date(showDeleteConfirm.date).toLocaleDateString("en-IN")} 
                </p>
              </div>
              <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} disabled={deletingId}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm._id}
              >
                {deletingId === showDeleteConfirm._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Transaction"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
