"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FolderOpen,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function CategoryManager() {
  const [categories, setCategories] = useState({
    defaults: [],
    custom: [],
  })
  const [loading, setLoading] = useState(true)

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  // Edit Modal State
  const [editingCat, setEditingCat] = useState(null)
  const [editName, setEditName] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState("")

  // Delete Confirm State
  const [deletingCat, setDeletingCat] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError("")
    const trimmed = newName.trim()
    if (!trimmed) return

    setCreating(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create category")

      toast.success(`Category "${data.name}" added!`)
      setCategories((prev) => ({
        ...prev,
        custom: [data, ...prev.custom],
      }))
      setCreateOpen(false)
      setNewName("")
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleStartEdit = (cat) => {
    setEditingCat(cat)
    setEditName(cat.name)
    setEditError("")
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setEditError("")
    const trimmed = editName.trim()
    if (!trimmed) return

    setSavingEdit(true)
    try {
      const res = await fetch(`/api/categories/${editingCat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update category")

      toast.success("Category updated")
      setCategories((prev) => ({
        ...prev,
        custom: prev.custom.map((c) =>
          c._id === editingCat._id ? { ...c, name: trimmed } : c
        ),
      }))
      setEditingCat(null)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCat) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deletingCat._id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete category")
      }

      toast.success(`Category "${deletingCat.name}" removed`)
      setCategories((prev) => ({
        ...prev,
        custom: prev.custom.filter((c) => c._id !== deletingCat._id),
      }))
      setDeletingCat(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
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
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Tag className="h-5 w-5 text-emerald-400" />
            Category Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize transactions and budgets using default and personalized custom categories.
          </p>
        </div>
        <button
          onClick={() => {
            setNewName("")
            setCreateError("")
            setCreateOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40 w-fit"
        >
          <PlusCircle className="h-4 w-4" />
          Add Custom Category
        </button>
      </div>

      {/* User Custom Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              My Custom Categories
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-semibold">
              {categories.custom.length}
            </span>
          </div>
        </div>

        {categories.custom.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#071912] border border-white/6 text-center">
            <FolderOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No custom categories yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create your first custom category (e.g. Gym, SIP, Freelance, Parents).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {categories.custom.map((cat) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#071912] border border-emerald-500/15 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Tag className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-white truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit Category Name"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCat(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Default System Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Default Categories
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-semibold">
            {categories.defaults.length}
          </span>
          <span className="text-xs text-slate-500 ml-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Built-in system defaults
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.defaults.map((defName) => (
            <div
              key={defName}
              className="px-3.5 py-2 rounded-xl bg-white/4 border border-white/6 text-slate-300 text-xs font-medium"
            >
              {defName}
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-[#071912] border-emerald-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <PlusCircle className="h-5 w-5 text-emerald-400" />
              New Custom Category
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter a unique name for your new personal category.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            {createError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Category Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Fitness, Tuition, Investments"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Category
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal Dialog */}
      <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
        <DialogContent className="sm:max-w-md bg-[#071912] border-emerald-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Edit2 className="h-5 w-5 text-emerald-400" />
              Rename Category
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the name of this custom category.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            {editError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Category Name
              </label>
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || !editName.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Name
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCat} onOpenChange={(open) => !open && setDeletingCat(null)}>
        <DialogContent className="sm:max-w-md bg-[#071912] border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Custom Category</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to remove &quot;{deletingCat?.name}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
            <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-400" />
            <strong>Historical Safe:</strong> Past transactions with this category will retain their category name. They will not be deleted or modified.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCat(null)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-300 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Category
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
