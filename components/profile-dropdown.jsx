"use client"

/**
 * ProfileDropdown — shows user avatar with initials, name/email,
 * dark mode toggle, and logout button.
 */
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Avatar from "@radix-ui/react-avatar"
import {
  LogOut,
  Moon,
  Sun,
  User,
  ChevronDown,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileDropdown({ user }) {
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    toast.info("Signing you out...")
    await signOut({ callbackUrl: "/login" })
  }

  const cycleTheme = () => {
    const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark"
    setTheme(next)
  }

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="profile-menu-trigger"
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400/40 group"
          aria-label="User menu"
        >
          {/* Avatar */}
          <Avatar.Root className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
            <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white text-xs font-bold">
              {getInitials(user?.name)}
            </Avatar.Fallback>
          </Avatar.Root>

          {/* Name — hidden on small screens */}
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
            {user?.name || "User"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
        >
          {/* User info header */}
          <div className="px-3 py-3 border-b border-gray-100 dark:border-white/10 mb-1">
            <div className="flex items-center gap-3">
              <Avatar.Root className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white text-sm font-bold">
                  {getInitials(user?.name)}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Profile item */}
          <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg cursor-default select-none hover:bg-gray-100 dark:hover:bg-white/10 outline-none transition-colors">
            <User className="h-4 w-4 text-gray-400" />
            Profile
          </DropdownMenu.Item>

          {/* Theme toggle */}
          <DropdownMenu.Item
            onSelect={(e) => { e.preventDefault(); cycleTheme() }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-white/10 outline-none transition-colors"
          >
            <ThemeIcon className="h-4 w-4 text-gray-400" />
            <span className="flex-1">
              {theme === "dark" ? "Dark mode" : theme === "light" ? "Light mode" : "System theme"}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">
              {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻"}
            </span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/10" />

          {/* Logout */}
          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer select-none hover:bg-red-50 dark:hover:bg-red-500/10 outline-none transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
