/**
 * Root page — Landing page for unauthenticated users,
 * redirects authenticated users to /dashboard.
 */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp, Shield, Target, Repeat, Download,
  IndianRupee, BarChart3, ArrowRight, CheckCircle2,
  PieChart, Wallet, Zap
} from "lucide-react"

const features = [
  { icon: BarChart3, title: "Smart Analytics", desc: "Visualize spending with beautiful charts and monthly breakdowns." },
  { icon: Target, title: "Budget Tracking", desc: "Set budgets per category and get real-time alerts when overspending." },
  { icon: TrendingUp, title: "Savings Goals", desc: "Define goals with target amounts and track progress automatically." },
  { icon: Repeat, title: "Recurring Transactions", desc: "Log subscriptions, salaries, and regular bills in one place." },
  { icon: Download, title: "CSV Export", desc: "Export any month's transactions as a CSV file instantly." },
  { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and only accessible by you." },
]

const stats = [
  { value: "₹10L+", label: "Tracked monthly" },
  { value: "100%", label: "Data privacy" },
  { value: "6", label: "Powerful modules" },
  { value: "Free", label: "Always" },
]

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#020c14] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-emerald-900/40 bg-[#020c14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-900/50">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinanceIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold shadow-lg shadow-emerald-900/40 transition-all">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* bg glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-green-600/8 blur-3xl" />
          <div className="absolute top-60 right-10 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <Zap className="h-3.5 w-3.5" />
            Your smart personal finance companion
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Take control of{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              your money
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track expenses, manage budgets, set savings goals, and get full visibility into your financial health — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-lg shadow-2xl shadow-emerald-900/50 transition-all duration-300 hover:scale-105">
              Start for free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 hover:border-emerald-500/30 hover:bg-white/5 text-slate-300 hover:text-white font-semibold text-lg transition-all duration-300">
              Sign in
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-emerald-900/30 shadow-2xl shadow-emerald-950/50 bg-[#0a1628]">
            {/* fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 bg-[#081020] border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 px-3 py-1 rounded-lg bg-white/5 text-xs text-slate-500">localhost:3000/dashboard</div>
            </div>
            {/* mock dashboard */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-lg font-bold text-white">FinanceIQ</div>
                  <div className="text-xs text-slate-500">Welcome back, Aditya</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                    <Download className="h-3 w-3" />Export CSV
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xs font-bold text-white">AP</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Total Income", val: "₹85,000", color: "from-emerald-500 to-green-600" },
                  { label: "Total Expenses", val: "₹42,350", color: "from-rose-500 to-red-600" },
                  { label: "Net Balance", val: "₹42,650", color: "from-blue-500 to-indigo-600" },
                  { label: "Top Category", val: "Groceries", color: "from-amber-500 to-orange-600" },
                ].map((c) => (
                  <div key={c.label} className={`p-3 rounded-2xl bg-gradient-to-br ${c.color}`}>
                    <div className="text-xs text-white/70 mb-1">{c.label}</div>
                    <div className="text-base font-bold text-white">{c.val}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 h-40 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-emerald-500/50 mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Monthly chart</div>
                  </div>
                </div>
                <div className="col-span-2 h-40 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-8 w-8 text-emerald-500/50 mx-auto mb-1" />
                    <div className="text-xs text-slate-600">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to manage money</h2>
            <p className="text-slate-400 text-lg">Powerful tools built for serious personal finance tracking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300">
                <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <f.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get started in 3 steps</h2>
          <p className="text-slate-400 text-lg mb-14">No complex setup. Start tracking in under a minute.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create account", desc: "Sign up free — no credit card required." },
              { step: "02", title: "Add transactions", desc: "Log your income and expenses with categories." },
              { step: "03", title: "See insights", desc: "Watch charts update and budgets track in real-time." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-black text-emerald-500/15 mb-3">{s.step}</div>
                <div className="text-lg font-semibold text-white mb-2">{s.title}</div>
                <div className="text-slate-400 text-sm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-green-950/80 border border-emerald-800/40 shadow-2xl shadow-emerald-950/50 backdrop-blur-sm">
            <Wallet className="h-12 w-12 text-emerald-400 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to master your finances?</h2>
            <p className="text-slate-400 mb-8">Join and take control of your money today. It&apos;s completely free.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold shadow-xl shadow-emerald-900/40 transition-all hover:scale-105">
                Create free account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white font-semibold transition-all">
                Sign in
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-600">
              {["No credit card", "100% free", "Secure & private"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><IndianRupee className="h-4 w-4 text-emerald-500" /></div>
            <span className="font-semibold text-slate-400">FinanceIQ</span>
          </div>
          <span>© 2026 FinanceIQ. Built for smart money management.</span>
        </div>
      </footer>
    </div>
  )
}
