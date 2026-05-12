"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, IndianRupee, Loader2, AlertCircle, CheckCircle2, Target, TrendingUp, Repeat } from "lucide-react"
import { toast } from "sonner"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })

const pwStrength = (p) => {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

const strengthMeta = ["", { label: "Weak", color: "bg-red-500" }, { label: "Fair", color: "bg-yellow-500" }, { label: "Good", color: "bg-blue-400" }, { label: "Strong", color: "bg-emerald-500" }]

const benefits = [
  { icon: TrendingUp, text: "Track income & expenses" },
  { icon: Target, text: "Set savings goals" },
  { icon: Repeat, text: "Manage recurring payments" },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [showCPw, setShowCPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(signupSchema) })
  const pwVal = watch("password", "")
  const strength = pwStrength(pwVal)

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    })
    const result = await res.json()
    if (!res.ok) { setAuthError(result.error || "Failed to create account"); setIsLoading(false); return }

    const signInResult = await signIn("credentials", { email: data.email, password: data.password, redirect: false })
    if (signInResult?.error) { setAuthError("Account created but sign-in failed. Try logging in."); setIsLoading(false); return }

    toast.success("Account created! Welcome to FinanceIQ 🎉")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-[#020c14]">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/12 blur-[100px] rounded-full" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-sm w-full">
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-emerald-900/60">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FinanceIQ</span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">Start your journey to<br />financial freedom.</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">Create your free account and get a complete view of your finances in minutes.</p>

          <div className="space-y-3 mb-10">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/4 border border-white/8">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Goals preview */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-green-950/60 border border-emerald-800/40">
            <p className="text-xs text-slate-500 mb-3 font-medium">Savings Goal — Emergency Fund</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white font-semibold">₹65,000 saved</span>
              <span className="text-emerald-400 font-medium">65%</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
            </div>
            <p className="text-xs text-slate-600 mt-2">Target: ₹1,00,000 by Dec 2026</p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceIQ</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Free forever. No credit card needed.</p>
          </div>

          {authError && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />{authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
              <input {...register("name")} type="text" autoComplete="name" placeholder="Aditya Pippal"
                className="w-full px-4 py-3.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm" />
              {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm" />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="Min. 8 characters"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {pwVal.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthMeta[strength].color : "bg-white/8"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Strength: <span className="text-slate-300">{strengthMeta[strength]?.label}</span></p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
              <div className="relative">
                <input {...register("confirmPassword")} type={showCPw ? "text" : "password"} autoComplete="new-password" placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm" />
                <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</> : <><CheckCircle2 className="h-4 w-4" />Create free account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Sign in</Link>
          </p>
          <p className="mt-3 text-center">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to homepage</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
