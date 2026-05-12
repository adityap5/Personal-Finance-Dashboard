"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, IndianRupee, Loader2, AlertCircle, TrendingUp, Shield, BarChart3 } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

const perks = [
  { icon: BarChart3, text: "Visual spending analytics" },
  { icon: TrendingUp, text: "Budget & savings tracking" },
  { icon: Shield, text: "Secure & private data" },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError("")
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false })
    setIsLoading(false)
    if (result?.error) {
      setAuthError("Invalid email or password. Please try again.")
    } else {
      toast.success("Welcome back!")
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex bg-[#020c14]">

      {/* ── Left panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 blur-[100px] rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-green-600/10 blur-3xl rounded-full" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-sm w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-emerald-900/60">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FinanceIQ</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Your money,<br />fully under control.
          </h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Join thousands tracking their finances smarter with FinanceIQ.
          </p>

          <div className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/8">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Decorative card */}
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-green-950/60 border border-emerald-800/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Net Balance — May 2026</span>
              <span className="text-xs text-emerald-400 font-medium">+12.4%</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">₹42,650</div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1.5">
              <span>Spent ₹42,350</span><span>Earned ₹85,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceIQ</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your FinanceIQ account</p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← Back to homepage
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
