"use client"

import { signOut } from "next-auth/react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import * as Avatar from "@radix-ui/react-avatar"
import { LogOut, Moon, User, ChevronDown } from "lucide-react"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "U"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ProfileDropdown({ user }) {
  const handleLogout = async () => {
    toast.info("Signing you out...")
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          id="profile-menu-trigger"
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 group backdrop-blur-xl"
        >
          <Avatar.Root className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-500/30">
            <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-black text-xs font-black">
              {getInitials(user?.name)}
            </Avatar.Fallback>
          </Avatar.Root>
          <span className="hidden sm:block text-xs font-bold text-slate-200 max-w-[110px] truncate">
            {user?.name?.split(" ")[0] || "User"}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#071a11]/95 backdrop-blur-2xl p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 text-white"
        >
          {/* User info */}
          <div className="px-3 py-3 border-b border-white/8 mb-1">
            <div className="flex items-center gap-3">
              <Avatar.Root className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-black text-sm font-black">
                  {getInitials(user?.name)}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-400/90 rounded-xl">
            <Moon className="h-3.5 w-3.5" />
            <span>Obsidian Dark Mode</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Active</span>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-white/8" />

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 rounded-xl cursor-pointer select-none hover:bg-rose-500/10 outline-none transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
