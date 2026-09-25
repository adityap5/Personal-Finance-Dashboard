"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Edit2,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Loader2,
  Filter,
  Repeat,
  Calendar,
} from "lucide-react"
import { TransactionForm } from "./transaction-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import AnimatedList from "./AnimatedList"

export function TransactionList({ transactions, onTransactionUpdated, selectedMonth }) {
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const handleDelete = async (transaction) => {
    if (!transaction || !transaction._id) return

    setDeletingId(transaction._id)
    try {
      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      setShowDeleteConfirm(null)
      onTransactionUpdated()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Derive unique categories present in current list
  const categoryOptions = [
    ...new Set(transactions.map((t) => t.category).filter(Boolean)),
  ].sort()

  const filteredTransactions = transactions.filter((transaction) => {
    const desc = (transaction.description || "").toLowerCase()
    const cat = (transaction.category || "").toLowerCase()
    const term = searchTerm.toLowerCase()

    const matchesSearch = !term || desc.includes(term) || cat.includes(term)
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesCategory =
      filterCategory === "all" || transaction.category === filterCategory

    const matchesMonth = selectedMonth
      ? new Date(transaction.date).toISOString().slice(0, 7) === selectedMonth
      : true

    return matchesSearch && matchesType && matchesCategory && matchesMonth
  })

  if (editingTransaction) {
    return (
      <div className="p-5 rounded-2xl bg-[#071912] border border-white/6">
        <TransactionForm
          editTransaction={editingTransaction}
          onTransactionAdded={() => {
            onTransactionUpdated()
            setEditingTransaction(null)
          }}
          onCancel={() => setEditingTransaction(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/4 border border-white/8 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by transaction type"
            className="w-full px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
          >
            <option value="all" className="bg-[#0a1c14] text-white">All Types</option>
            <option value="expense" className="bg-[#0a1c14] text-white">Expenses</option>
            <option value="income" className="bg-[#0a1c14] text-white">Income</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
          >
            <option value="all" className="bg-[#0a1c14] text-white">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0a1c14] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List with AnimatedList from React Bits */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-white/2 border border-white/5">
          <p className="text-sm font-medium text-slate-400">No transactions found</p>
          <p className="text-xs text-slate-600 mt-1">
            Try adjusting your search or category filters.
          </p>
        </div>
      ) : (
        <AnimatedList
          items={[...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          className="w-full"
          renderItem={(transaction, index, isSelected) => {
            const isIncome = transaction.type === "income"
            // Clean fallback when description is missing/empty
            const displayTitle =
              (transaction.description && transaction.description.trim()) ||
              transaction.category ||
              "Transaction"
            const hasCustomDesc =
              transaction.description &&
              transaction.description.trim() &&
              transaction.description.trim().toLowerCase() !==
                (transaction.category || "").toLowerCase()

            const isAutoReminder = transaction.source === "reminder"

            return (
              <div
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-[#071912] border transition-all group ${
                  isSelected
                    ? "border-emerald-500/40 bg-[#0c241b] shadow-lg shadow-black/40"
                    : "border-white/6 hover:border-emerald-500/20"
                }`}
              >
                {/* Left: Icon + Title/Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
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

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">
                        {displayTitle}
                      </p>
                      {isAutoReminder && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                          <Repeat className="h-2.5 w-2.5" />
                          Auto
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {hasCustomDesc && (
                        <span className="text-slate-400 font-medium">
                          {transaction.category} •
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(transaction.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Actions */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div
                    className={`text-sm sm:text-base font-bold flex items-center gap-0.5 ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <span>{isIncome ? "+" : "−"}</span>
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span>{transaction.amount.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTransaction(transaction)
                      }}
                      disabled={deletingId === transaction._id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(transaction)
                      }}
                      disabled={deletingId === transaction._id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete transaction"
                    >
                      {deletingId === transaction._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#071912] border-rose-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Transaction</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to remove this transaction record?
            </DialogDescription>
          </DialogHeader>

          {showDeleteConfirm && (
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/6 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                {(showDeleteConfirm.description && showDeleteConfirm.description.trim()) ||
                  showDeleteConfirm.category}
              </p>
              <p className="text-slate-400">
                {showDeleteConfirm.category} • ₹
                {showDeleteConfirm.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                {new Date(showDeleteConfirm.date).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={!!deletingId}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              disabled={!!deletingId}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all disabled:opacity-50"
            >
              {deletingId && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Transaction
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
