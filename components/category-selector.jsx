"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PlusCircle, Loader2, AlertCircle, Tag } from "lucide-react"
import { toast } from "sonner"

export default function CategorySelector({
  value,
  onValueChange,
  placeholder = "Select category",
  className = "",
  disabled = false,
}) {
  const [categories, setCategories] = useState({
    defaults: [],
    custom: [],
    allNames: [],
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error("Failed to load categories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSelectChange = (val) => {
    if (val === "__create_new__") {
      setNewCategoryName("")
      setCreateError("")
      setDialogOpen(true)
      return
    }
    onValueChange(val)
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    setCreateError("")

    const trimmed = newCategoryName.trim()
    if (!trimmed) {
      setCreateError("Category name cannot be empty")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create category")
      }

      toast.success(`Category "${data.name}" created!`)

      // Add to local list and select immediately
      setCategories((prev) => ({
        ...prev,
        custom: [data, ...prev.custom],
        allNames: [data.name, ...prev.allNames],
      }))

      onValueChange(data.name)
      setDialogOpen(false)
      setNewCategoryName("")
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Select
        value={value || ""}
        onValueChange={handleSelectChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className={`h-10 bg-white/4 border-white/8 text-white rounded-xl focus:ring-emerald-500/30 ${className}`}>
          <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#0a1c14] border-white/10 text-white max-h-72">
          {/* Action to create new category */}
          <SelectItem
            value="__create_new__"
            className="font-medium text-emerald-400 focus:bg-emerald-500/20 focus:text-emerald-300 border-b border-white/8 py-2.5 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>+ Create new category</span>
            </div>
          </SelectItem>

          {/* User's custom categories */}
          {categories.custom.length > 0 && (
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
              My Categories
            </div>
          )}
          {categories.custom.map((cat) => (
            <SelectItem
              key={cat._id || cat.name}
              value={cat.name}
              className="focus:bg-emerald-500/10 focus:text-emerald-300 flex items-center justify-between"
            >
              <span>{cat.name}</span>
            </SelectItem>
          ))}

          {/* Default categories */}
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Default Categories
          </div>
          {categories.defaults.map((defName) => (
            <SelectItem
              key={defName}
              value={defName}
              className="focus:bg-emerald-500/10 focus:text-emerald-300"
            >
              {defName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Modal Dialog for Inline Category Creation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#071912] border-emerald-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Tag className="h-5 w-5 text-emerald-400" />
              Create Custom Category
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a personal category to organize your finances.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
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
                placeholder="e.g. Gym, SIP, Freelance, Parents"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>

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
                disabled={creating || !newCategoryName.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Category
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
