"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  IndianRupee,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Target,
  Flame,
  Check,
  X,
  Compass,
  TrendingUp,
  Layers,
  ArrowRight,
  ListTodo,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const CATEGORIES = [
  "Needs",
  "Wants",
  "Financial Goals",
  "Travel",
  "Personal",
  "Career",
  "Custom",
]

const PRIORITIES = ["High", "Medium", "Low"]

const PRIORITY_BADGE_STYLES = {
  High: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  Medium: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  Low: "bg-blue-500/15 border-blue-500/30 text-blue-300",
}

const CATEGORY_COLORS = {
  Needs: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Wants: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Financial Goals": "bg-teal-500/15 text-teal-300 border-teal-500/30",
  Travel: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Personal: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Career: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Custom: "bg-slate-500/15 text-slate-300 border-slate-500/30",
}

export default function BucketList({ fullPage = false, user = null }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all") // all | active | completed
  const [sortBy, setSortBy] = useState("priority") // priority | targetDate | createdAt

  // Modals & forms
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Personal",
    customCategory: "",
    priority: "Medium",
    targetDate: "",
    targetAmount: "",
    savedAmount: "",
    link: "",
  })

  // Delete confirmation
  const [deleteModalItem, setDeleteModalItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Quick update saved amount modal
  const [savingsModalItem, setSavingsModalItem] = useState(null)
  const [quickSavedAmount, setQuickSavedAmount] = useState("")
  const [updatingSavings, setUpdatingSavings] = useState(false)

  // In-flight toggling item IDs to prevent duplicate calls
  const [togglingIds, setTogglingIds] = useState(new Set())

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/bucket-list")
      if (!res.ok) {
        throw new Error("Failed to load bucket list items")
      }
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load bucket list")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Summary statistics
  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter((i) => i.isCompleted).length
    const pending = total - completed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // Financial totals across goals
    const totalTargetSavings = items.reduce(
      (sum, item) => sum + (item.targetAmount ? Number(item.targetAmount) : 0),
      0
    )
    const totalCurrentSavings = items.reduce(
      (sum, item) => sum + (item.savedAmount ? Number(item.savedAmount) : 0),
      0
    )

    return {
      total,
      completed,
      pending,
      percentage,
      totalTargetSavings,
      totalCurrentSavings,
    }
  }, [items])

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Personal",
      customCategory: "",
      priority: "Medium",
      targetDate: "",
      targetAmount: "",
      savedAmount: "",
      link: "",
    })
    setEditingItem(null)
    setFormError("")
  }

  // Open Add modal
  const handleOpenAdd = () => {
    resetForm()
    setFormOpen(true)
  }

  // Open Edit modal
  const handleOpenEdit = (item) => {
    const isStandardCategory = CATEGORIES.slice(0, -1).includes(item.category)
    setEditingItem(item)
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: isStandardCategory ? item.category : "Custom",
      customCategory: isStandardCategory ? "" : item.category || "",
      priority: item.priority || "Medium",
      targetDate: item.targetDate
        ? new Date(item.targetDate).toISOString().slice(0, 10)
        : "",
      targetAmount:
        item.targetAmount !== null && item.targetAmount !== undefined
          ? String(item.targetAmount)
          : "",
      savedAmount:
        item.savedAmount !== null && item.savedAmount !== undefined
          ? String(item.savedAmount)
          : "",
      link: item.link || "",
    })
    setFormError("")
    setFormOpen(true)
  }

  // Handle Form Submission (Create or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormError("")

    const trimmedTitle = formData.title.trim()
    if (!trimmedTitle) {
      setFormError("Title is required and cannot be empty")
      return
    }

    const resolvedCategory =
      formData.category === "Custom"
        ? formData.customCategory.trim() || "Custom"
        : formData.category

    const parsedTargetAmount = formData.targetAmount
      ? parseFloat(formData.targetAmount)
      : null
    if (parsedTargetAmount !== null && (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0)) {
      setFormError("Target amount must be a positive number")
      return
    }

    const parsedSavedAmount = formData.savedAmount
      ? parseFloat(formData.savedAmount)
      : 0
    if (isNaN(parsedSavedAmount) || parsedSavedAmount < 0) {
      setFormError("Saved amount cannot be negative")
      return
    }

    setSubmitting(true)

    const payload = {
      title: trimmedTitle,
      description: formData.description.trim(),
      category: resolvedCategory,
      priority: formData.priority,
      targetDate: formData.targetDate || null,
      targetAmount: parsedTargetAmount,
      savedAmount: parsedTargetAmount ? parsedSavedAmount : 0,
      link: formData.link.trim() || null,
    }

    try {
      if (editingItem) {
        // PUT update
        const res = await fetch(`/api/bucket-list/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Failed to update item")
        }

        const data = await res.json()
        setItems((prev) =>
          prev.map((i) => (i._id === editingItem._id ? data.item : i))
        )
        toast.success("Goal updated successfully!")
      } else {
        // POST create
        const res = await fetch("/api/bucket-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Failed to create item")
        }

        const newItem = await res.json()
        setItems((prev) => [newItem, ...prev])
        toast.success("Goal added to your Bucket List!")
      }

      setFormOpen(false)
      resetForm()
    } catch (err) {
      setFormError(err.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Completion (Requirement 4)
  const handleToggleComplete = async (item) => {
    if (togglingIds.has(item._id)) return // Prevent duplicate requests

    const newCompletedStatus = !item.isCompleted
    const prevItem = { ...item }

    // Mark as in-flight
    setTogglingIds((prev) => new Set(prev).add(item._id))

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => {
        if (i._id === item._id) {
          return {
            ...i,
            isCompleted: newCompletedStatus,
            completedAt: newCompletedStatus ? new Date().toISOString() : null,
          }
        }
        return i
      })
    )

    try {
      const res = await fetch(`/api/bucket-list/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newCompletedStatus }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to update status")
      }

      const data = await res.json()
      // Synchronize with database result
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? data.item : i))
      )

      if (newCompletedStatus) {
        toast.success(`Accomplished: "${item.title}"! 🎉`)
      } else {
        toast.info(`Moved "${item.title}" back to To Accomplish`)
      }
    } catch (err) {
      // Rollback on failure
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? prevItem : i))
      )
      toast.error(err.message || "Could not update status. Rolled back.")
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(item._id)
        return next
      })
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/bucket-list/${deleteModalItem._id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to delete item")
      }

      setItems((prev) => prev.filter((i) => i._id !== deleteModalItem._id))
      toast.success("Item removed from bucket list")
      setDeleteModalItem(null)
    } catch (err) {
      toast.error(err.message || "Failed to delete item")
    } finally {
      setDeleting(false)
    }
  }

  // Quick Update Saved Amount
  const handleSaveQuickSavings = async (e) => {
    e.preventDefault()
    if (!savingsModalItem) return

    const val = parseFloat(quickSavedAmount)
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid amount (0 or more)")
      return
    }

    setUpdatingSavings(true)
    try {
      const res = await fetch(`/api/bucket-list/${savingsModalItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedAmount: val }),
      })

      if (!res.ok) {
        throw new Error("Failed to update saved amount")
      }

      const data = await res.json()
      setItems((prev) =>
        prev.map((i) => (i._id === savingsModalItem._id ? data.item : i))
      )
      toast.success("Savings progress updated!")
      setSavingsModalItem(null)
    } catch (err) {
      toast.error(err.message || "Update failed")
    } finally {
      setUpdatingSavings(false)
    }
  }

  // Filtered & Sorted Items
  const { activeItems, completedItems } = useMemo(() => {
    let result = [...items]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
    }

    // 2. Category Filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (item) =>
          item.category?.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // 3. Priority Filter
    if (priorityFilter !== "all") {
      result = result.filter(
        (item) =>
          item.priority?.toLowerCase() === priorityFilter.toLowerCase()
      )
    }

    // 4. Split into Active and Completed
    let active = result.filter((item) => !item.isCompleted)
    let completed = result.filter((item) => item.isCompleted)

    // 5. Sort Active items
    if (sortBy === "priority") {
      const priorityWeights = { High: 1, Medium: 2, Low: 3 }
      active.sort((a, b) => {
        const wA = priorityWeights[a.priority] || 4
        const wB = priorityWeights[b.priority] || 4
        if (wA !== wB) return wA - wB
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    } else if (sortBy === "targetDate") {
      active.sort((a, b) => {
        if (!a.targetDate) return 1
        if (!b.targetDate) return -1
        return new Date(a.targetDate) - new Date(b.targetDate)
      })
    } else if (sortBy === "createdAt") {
      active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // Completed items sorted by completedAt desc
    completed.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt)
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt)
      return dateB - dateA
    })

    return { activeItems: active, completedItems: completed }
  }, [items, searchQuery, categoryFilter, priorityFilter, sortBy])

  // Distinct categories in the user's list for dynamic filtering
  const availableCategories = useMemo(() => {
    const set = new Set(CATEGORIES)
    items.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set)
  }, [items])

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl bg-[#071912]/80 border border-white/6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 rounded-2xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="h-24 rounded-2xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="h-24 rounded-2xl bg-[#071912]/80 border border-white/6 animate-pulse" />
          <div className="h-24 rounded-2xl bg-[#071912]/80 border border-white/6 animate-pulse" />
        </div>
        <div className="h-64 rounded-3xl bg-[#071912]/80 border border-white/6 animate-pulse" />
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-[#071912] border border-rose-500/30 text-center max-w-md mx-auto my-12 shadow-2xl">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Failed to Load Bucket List</h3>
        <p className="text-xs text-rose-300/80 mb-5">{error}</p>
        <button
          onClick={fetchItems}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header & Subtitle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#072418]/90 via-[#071912]/85 to-[#04120c]/95 border border-emerald-500/25 backdrop-blur-2xl shadow-xl shadow-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                My Bucket List
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Turn your plans into achievements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer group shrink-0"
            aria-label="Add new bucket list item"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Total Goals</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Life ambitions listed</p>
        </div>

        {/* To Accomplish / Pending */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-xs text-amber-400/90 mb-1">
            <span className="font-semibold">To Accomplish</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {stats.pending}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Active dreams in progress</p>
        </div>

        {/* Completed Achievements */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span className="font-semibold">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.completed}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Achievements unlocked</p>
        </div>

        {/* Completion Percentage */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Completion Rate</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.percentage}%
            </div>
            <span className="text-xs text-emerald-400 font-semibold">
              {stats.completed} of {stats.total}
            </span>
          </div>
          {/* Mini progress bar inside stat card */}
          <div className="h-1.5 w-full bg-white/6 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Overall Progress Bar ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-emerald-400" />
            Overall Bucket List Progress
          </span>
          <span className="text-emerald-400 font-bold">{stats.percentage}% Completed</span>
        </div>
        <div className="h-3 rounded-full bg-white/6 p-0.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 shadow-md shadow-emerald-500/40"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {stats.totalTargetSavings > 0 && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>
              Linked Financial Savings: ₹{stats.totalCurrentSavings.toLocaleString("en-IN")}
            </span>
            <span className="text-emerald-300">
              Total Target: ₹{stats.totalTargetSavings.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* ── Search, Sorting & Filters Bar ── */}
      <div className="p-4 rounded-2xl bg-[#071912]/80 backdrop-blur-xl border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals by title or description..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/4 border border-white/8 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-white/4 border border-white/8 p-0.5 text-xs font-medium">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "all"
                    ? "bg-emerald-500 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "active"
                    ? "bg-emerald-500 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Active ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === "completed"
                    ? "bg-emerald-500 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Completed ({stats.completed})
              </button>
            </div>

            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-xs text-white focus:outline-none focus:border-emerald-500/40 cursor-pointer"
            >
              <option value="all" className="bg-[#071912] text-white">
                All Categories
              </option>
              {availableCategories.map((c) => (
                <option key={c} value={c} className="bg-[#071912] text-white">
                  {c}
                </option>
              ))}
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className="px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-xs text-white focus:outline-none focus:border-emerald-500/40 cursor-pointer"
            >
              <option value="all" className="bg-[#071912] text-white">
                All Priorities
              </option>
              <option value="High" className="bg-[#071912] text-white">
                High Priority
              </option>
              <option value="Medium" className="bg-[#071912] text-white">
                Medium Priority
              </option>
              <option value="Low" className="bg-[#071912] text-white">
                Low Priority
              </option>
            </select>

            {/* Sort Active By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort active items"
              className="px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-xs text-white focus:outline-none focus:border-emerald-500/40 cursor-pointer"
            >
              <option value="priority" className="bg-[#071912] text-white">
                Sort: Priority
              </option>
              <option value="targetDate" className="bg-[#071912] text-white">
                Sort: Target Date
              </option>
              <option value="createdAt" className="bg-[#071912] text-white">
                Sort: Newest First
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: TO ACCOMPLISH (Active Items) ── */}
      {statusFilter !== "completed" && (
        <section className="space-y-3" aria-labelledby="to-accomplish-heading">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2
                id="to-accomplish-heading"
                className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
              >
                <Target className="h-4 w-4 text-emerald-400" />
                To Accomplish
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                {activeItems.length}
              </span>
            </div>
            {activeItems.length > 0 && (
              <p className="text-xs text-slate-500 hidden sm:block">
                Check item to mark as complete
              </p>
            )}
          </div>

          {activeItems.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white/2 border border-white/5 space-y-3">
              <div className="p-3 rounded-full bg-white/4 w-fit mx-auto text-slate-500">
                <Compass className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {items.length === 0
                  ? "No items in your bucket list yet"
                  : "No active goals match the current filters"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {items.length === 0
                  ? "Turn your dreams into reality. Add your first travel destination, career goal, or life ambition!"
                  : "Try clearing your search query or adjusting your filters above."}
              </p>
              {items.length === 0 && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Add Your First Goal
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {activeItems.map((item) => (
                  <BucketItemRow
                    key={item._id}
                    item={item}
                    isToggling={togglingIds.has(item._id)}
                    onToggle={() => handleToggleComplete(item)}
                    onEdit={() => handleOpenEdit(item)}
                    onDelete={() => setDeleteModalItem(item)}
                    onOpenSavings={() => {
                      setSavingsModalItem(item)
                      setQuickSavedAmount(String(item.savedAmount || 0))
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 2: COMPLETED ACHIEVEMENTS (Completed Items Underneath) ── */}
      {statusFilter !== "active" && (
        <section
          className="space-y-3 pt-6 border-t border-white/8"
          aria-labelledby="completed-achievements-heading"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2
                id="completed-achievements-heading"
                className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
              >
                <Trophy className="h-4 w-4 text-emerald-400" />
                Completed Achievements
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                {completedItems.length}
              </span>
            </div>
            {completedItems.length > 0 && (
              <p className="text-xs text-slate-500 hidden sm:block">
                Uncheck to move back to active
              </p>
            )}
          </div>

          {completedItems.length === 0 ? (
            <div className="text-center py-10 rounded-3xl bg-white/2 border border-white/5 space-y-2">
              <CheckCircle2 className="h-7 w-7 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">
                No completed achievements yet
              </p>
              <p className="text-[11px] text-slate-600">
                Check off items in &quot;To Accomplish&quot; as you complete your life goals!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {completedItems.map((item) => (
                  <BucketItemRow
                    key={item._id}
                    item={item}
                    isToggling={togglingIds.has(item._id)}
                    onToggle={() => handleToggleComplete(item)}
                    onEdit={() => handleOpenEdit(item)}
                    onDelete={() => setDeleteModalItem(item)}
                    onOpenSavings={() => {
                      setSavingsModalItem(item)
                      setQuickSavedAmount(String(item.savedAmount || 0))
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {/* ── Add / Edit Item Dialog ── */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="sm:max-w-lg bg-[#071912]/95 border-emerald-500/20 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-5 w-5 text-emerald-400" />
              {editingItem ? "Edit Bucket List Goal" : "Add to Bucket List"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Define your aspirations, set financial targets, and track life milestones.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Hike the Himalayas, Buy dream EV, Launch startup"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>

            {/* Category & Custom Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a2319] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category === "Custom" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Custom Category</label>
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, customCategory: e.target.value })
                    }
                    placeholder="e.g., Fitness, Music"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a2319] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* If Custom Category was chosen, show Priority in separate row */}
            {formData.category === "Custom" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a2319] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Date & Financial Goals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Target Amount in INR (Optional)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    placeholder="e.g. 50000"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Current Saved Amount (Only if Target Amount is entered) */}
            {formData.targetAmount && (
              <div className="space-y-1 p-3 rounded-xl bg-white/2 border border-white/6">
                <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Current Saved Amount (₹)
                </label>
                <p className="text-[11px] text-slate-400">
                  Track your financial progress towards this goal. Independent of item completion.
                </p>
                <div className="relative mt-1">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.savedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, savedAmount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}

            {/* Optional External Link or Image */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Link or Image URL (Optional)
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com/dream-trip or image URL"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Notes & Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any thoughts, milestones, or reasons why this goal matters to you..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/4 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/8">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{editingItem ? "Save Changes" : "Create Goal"}</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Quick Update Savings Modal ── */}
      <Dialog
        open={!!savingsModalItem}
        onOpenChange={(open) => !open && setSavingsModalItem(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#071912]/95 border-emerald-500/20 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base">
              <IndianRupee className="h-5 w-5 text-emerald-400" />
              Update Savings Progress
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Log your current savings for &quot;{savingsModalItem?.title}&quot;.
            </DialogDescription>
          </DialogHeader>

          {savingsModalItem && (
            <form onSubmit={handleSaveQuickSavings} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-white/4 border border-white/6 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Target Amount:</span>
                  <span className="font-bold text-white">
                    ₹{savingsModalItem.targetAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Previously Saved:</span>
                  <span className="font-bold text-emerald-400">
                    ₹{(savingsModalItem.savedAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  New Saved Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={quickSavedAmount}
                    onChange={(e) => setQuickSavedAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/4 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSavingsModalItem(null)}
                  disabled={updatingSavings}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSavings}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updatingSavings && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Progress</span>
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={!!deleteModalItem}
        onOpenChange={(open) => !open && setDeleteModalItem(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#071912] border-rose-500/20 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-base">
              <Trash2 className="h-5 w-5 text-rose-400" />
              Delete Bucket List Goal
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to permanently delete this goal from your bucket list?
            </DialogDescription>
          </DialogHeader>

          {deleteModalItem && (
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/6 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white text-sm">{deleteModalItem.title}</p>
              <p className="text-slate-400">
                {deleteModalItem.category} • {deleteModalItem.priority} Priority
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalItem(null)}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Delete Goal</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Single Bucket Item Card Row
 */
function BucketItemRow({
  item,
  isToggling,
  onToggle,
  onEdit,
  onDelete,
  onOpenSavings,
}) {
  const isCompleted = Boolean(item.isCompleted)
  const categoryStyle =
    CATEGORY_COLORS[item.category] || "bg-slate-500/15 text-slate-300 border-slate-500/30"
  const priorityStyle =
    PRIORITY_BADGE_STYLES[item.priority] || PRIORITY_BADGE_STYLES.Medium

  // Financial calculations
  const hasFinancialTarget =
    item.targetAmount !== null &&
    item.targetAmount !== undefined &&
    item.targetAmount > 0

  const targetAmount = Number(item.targetAmount || 0)
  const savedAmount = Number(item.savedAmount || 0)
  const remainingAmount = Math.max(0, targetAmount - savedAmount)
  const savingsPercent =
    targetAmount > 0
      ? Math.min(100, Math.round((savedAmount / targetAmount) * 100))
      : 0

  // Date calculations
  const targetDateObj = item.targetDate ? new Date(item.targetDate) : null
  const isOverdue =
    targetDateObj &&
    !isCompleted &&
    targetDateObj < new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all ${
        isCompleted
          ? "bg-[#071912]/60 border-white/6 opacity-85 hover:opacity-100"
          : "bg-[#071912]/90 border-white/10 hover:border-emerald-500/30 shadow-lg shadow-black/20"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Large Checkbox Touch Target */}
        <button
          type="button"
          onClick={onToggle}
          disabled={isToggling}
          aria-label={
            isCompleted
              ? `Mark "${item.title}" as incomplete`
              : `Mark "${item.title}" as complete`
          }
          className={`shrink-0 mt-0.5 p-1 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer ${
            isCompleted
              ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              : "text-slate-500 hover:text-emerald-400 hover:bg-white/5"
          }`}
        >
          {isToggling ? (
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-6 w-6 fill-emerald-500/20 stroke-[2.5]" />
          ) : (
            <Circle className="h-6 w-6 stroke-[1.8]" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Top meta tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryStyle}`}
            >
              {item.category}
            </span>

            {/* Priority */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}
            >
              {item.priority}
            </span>

            {/* Target Date */}
            {targetDateObj && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isOverdue
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    : "bg-white/4 border-white/8 text-slate-400"
                }`}
              >
                <Calendar className="h-2.5 w-2.5" />
                <span>
                  {isOverdue ? "Overdue: " : "Target: "}
                  {targetDateObj.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}

            {/* Completed At Timestamp */}
            {isCompleted && item.completedAt && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <Check className="h-2.5 w-2.5" />
                Completed:{" "}
                {new Date(item.completedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}

            {/* External Link */}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/4 border border-white/8 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/30 flex items-center gap-1 transition-colors"
                title="Open external link"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                <span>Link</span>
              </a>
            )}
          </div>

          {/* Title & Strikethrough */}
          <div>
            <h3
              className={`text-sm sm:text-base font-bold transition-all ${
                isCompleted
                  ? "line-through text-slate-400 decoration-emerald-500/70 decoration-2"
                  : "text-white"
              }`}
            >
              {item.title}
            </h3>

            {item.description && (
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isCompleted ? "text-slate-500 line-through" : "text-slate-400"
                }`}
              >
                {item.description}
              </p>
            )}
          </div>

          {/* Financial Goal Tracking Section (Requirement 6) */}
          {hasFinancialTarget && (
            <div className="pt-2 mt-2 border-t border-white/6 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Financial Target:</span>
                  <span className="font-bold text-white flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />
                    {targetAmount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">Saved:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />
                    {savedAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Remaining: ₹{remainingAmount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={onOpenSavings}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
                  >
                    Update Saved
                  </button>
                </div>
              </div>

              {/* Savings Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      savingsPercent >= 100
                        ? "bg-emerald-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${savingsPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{savingsPercent}% funded</span>
                  {savingsPercent >= 100 && (
                    <span className="text-emerald-300 font-bold">Target Reached!</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Edit goal"
            aria-label={`Edit ${item.title}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete goal"
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
