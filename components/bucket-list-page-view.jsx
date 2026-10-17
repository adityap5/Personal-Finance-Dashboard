"use client"

import Link from "next/link"
import {
  IndianRupee,
  LayoutDashboard,
  Trophy,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react"
import ProfileDropdown from "@/components/profile-dropdown"
import BucketList from "@/components/bucket-list"

export default function BucketListPageView({ user }) {
  return (
    <div className="min-h-screen bg-[#030c07] text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-dashboard">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[650px] h-[500px] bg-emerald-500/8 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[450px] bg-green-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[400px] bg-teal-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Floating Glass Header */}
        <header className="sticky top-4 z-40 px-4 py-2.5 rounded-2xl sm:rounded-full bg-[#071912]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 flex items-center justify-between gap-3">
          {/* Brand & Nav */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  FinanceIQ
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/10">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 hover:bg-white/8 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                <span>Dashboard</span>
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bucket List</span>
              </div>
            </div>
          </div>

          {/* Right: Back to Dashboard & Profile */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>

            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content */}
        <main>
          <BucketList fullPage={true} user={user} />
        </main>
      </div>
    </div>
  )
}
