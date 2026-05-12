"use client"

import { signOut } from "next-auth/react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Avatar from "@radix-ui/react-avatar"
import { LogOut, Moon, Sun, Monitor, User, ChevronDown, IndianRupee } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "U"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ProfileDropdown({ user }) {
  const { theme, setTheme } = useTheme()
  const cycleTheme = () => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  const handleLogout = async () => {
    toast.info("Signing you out...")
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="profile-menu-trigger"
          className="flex items-center gap-2 px-3 py-2 rounded-xl
            bg-white dark:bg-white/4
            border border-gray-200 dark:border-white/8
            hover:bg-gray-50 dark:hover:bg-white/8
            shadow-sm dark:shadow-none
            transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 group"
        >
          <Avatar.Root className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
            <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white text-xs font-bold">
              {getInitials(user?.name)}
            </Avatar.Fallback>
          </Avatar.Root>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-300 max-w-[110px] truncate">
            {user?.name || "User"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] overflow-hidden rounded-2xl
            border border-gray-200 dark:border-white/10
            bg-white dark:bg-[#0d1f35]/95
            backdrop-blur-xl p-1.5 shadow-xl
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {/* User info */}
          <div className="px-3 py-3 border-b border-gray-100 dark:border-white/8 mb-1">
            <div className="flex items-center gap-3">
              <Avatar.Root className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white text-sm font-bold">
                  {getInitials(user?.name)}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 rounded-xl cursor-default select-none hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200 outline-none transition-colors">
            <User className="h-4 w-4 text-gray-400 dark:text-slate-500" />Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onSelect={(e) => { e.preventDefault(); cycleTheme() }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 rounded-xl cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-slate-200 outline-none transition-colors"
          >
            <ThemeIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="flex-1">{theme === "dark" ? "Dark mode" : theme === "light" ? "Light mode" : "System"}</span>
            <span className="text-xs">{theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻"}</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/8" />

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 rounded-xl cursor-pointer select-none hover:bg-red-50 dark:hover:bg-red-500/10 outline-none transition-colors"
          >
            <LogOut className="h-4 w-4" />Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
