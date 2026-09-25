"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Menu,
  X,
  Plus,
  Play,
  Mic,
  Activity,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  IndianRupee,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"

/* ── Minimalist Geometric Stroke Logo mimicking Untitled UI ── */
function PletyLogo({ className = "h-7 w-7 text-white" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.2"
        className="opacity-40"
      />
      <path
        d="M10 21V11C10 9.89543 10.8954 9 12 9H17C19.2091 9 21 10.7909 21 13C21 15.2091 19.2091 17 17 17H10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="21" r="2" fill="#34d399" />
    </svg>
  )
}

/* ── Custom Scroll-Reveal Wrapper Component ── */
function FadeInUp({ children, className = "", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const el = domRef.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [])

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: "1000ms",
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ── Dummy Brand Stroke Logos for Marquee ── */
const DUMMY_BRANDS = [
  {
    name: "Springfield",
    svg: (
      <svg className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "Orbitc",
    svg: (
      <svg className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
      </svg>
    ),
  },
  {
    name: "Cloud",
    svg: (
      <svg className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
  },
  {
    name: "Amster",
    svg: (
      <svg className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
        <path d="M12 3L3 21h18L12 3zm0 7l4 8H8l4-8z" />
      </svg>
    ),
  },
  {
    name: "Nexus",
    svg: (
      <svg className="h-6 w-6 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
        <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2zM12 6.5l4 2.25v4.5L12 15.5l-4-2.25v-4.5L12 6.5z" />
      </svg>
    ),
  },
]

/* ── FAQ Questions & Answers ── */
const FAQ_ITEMS = [
  {
    question: "Is my personal financial data encrypted and private?",
    answer:
      "Yes, completely. Every transaction, budget ceiling, and scheduled obligation is isolated per user in MongoDB Atlas. Neither third-party data brokers nor other accounts can access your financial standing.",
  },
  {
    question: "How does automated recurring transaction processing work?",
    answer:
      "Our system features a deterministic calendar engine with a multi-missed catch-up loop. Even across serverless sleep states, scheduled EMIs and recurring bills are verified and recorded with unique database-level occurrence keys, eliminating duplicates.",
  },
  {
    question: "Can I set custom budget thresholds for different categories?",
    answer:
      "Yes. You can manage built-in categories or create personal custom categories (e.g. Gym, SIP, Freelance). Plety monitors your real-time spend against your target thresholds with instant status indicators.",
  },
  {
    question: "How do Reminders differ from Recurring Transactions?",
    answer:
      "Reminders track upcoming obligations such as loan EMIs, insurance premiums, and bills with urgency badges (Due Today, Overdue). If auto-pay is enabled, Reminders can automatically create matching ledger transactions upon reaching due dates.",
  },
  {
    question: "Can I export my financial records to CSV or Excel?",
    answer:
      "Yes. With a single click on your dashboard, you can export your entire month's transaction records as a clean, standardized CSV spreadsheet formatted for accounting or offline analysis.",
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* ── 1. Navigation Bar (Sticky & Responsive) ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="#about" className="flex items-center gap-3 group">
            <PletyLogo />
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Plety
            </span>
          </Link>

          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["About", "Features", "FAQ", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/5 transition-all shadow-sm"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4">
            {["About", "Features", "FAQ", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="block w-full text-left text-base font-medium text-gray-300 hover:text-white py-2"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-center py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-center py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero Section (id="about") ── */}
      <section
        id="about"
        className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden"
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover min-w-full min-h-full opacity-90 -z-10 pointer-events-none"
          src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4"
        />

        {/* Video Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <FadeInUp delay={0}>
            {/* Top Badge */}
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm inline-flex items-center gap-1.5">
              <span>✨ Announcing API 2.0</span>
            </div>
          </FadeInUp>

          <FadeInUp delay={150}>
            {/* Headline with serif italic "decisions." */}
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center leading-[1.1]">
              The intelligence layer <br className="hidden sm:inline" />
              for clear <span className="font-serif italic font-normal text-emerald-300">decisions.</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={300}>
            {/* Sub-text forced to text-[16px] */}
            <p className="text-[16px] text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
              Our platform integrates seamlessly into your stack to deliver real-time understanding,
              not just predictions. Track cash flows, automate recurring bills, and command your wealth.
            </p>
          </FadeInUp>

          <FadeInUp delay={450}>
            {/* Buttons: Primary (white bg, black text) & Secondary (#1F1F22, white text) */}
            <div className="flex flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-all shadow-lg hover:scale-105"
              >
                Get started
              </Link>
              <a
                href="#features"
                className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-6 py-3 rounded-full border border-white/5 transition-all"
              >
                Learn more
              </a>
            </div>
          </FadeInUp>

          {/* Marquee (Trusted by industry leaders) */}
          <div className="w-full mt-24">
            <p className="text-sm text-gray-500 font-medium mb-8 text-center">
              Trusted by industry leaders
            </p>

            {/* Marquee Container with Mask Image Linear Gradient */}
            <div
              className="overflow-hidden w-full relative"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <div className="flex w-max animate-marquee py-2">
                {[...DUMMY_BRANDS, ...DUMMY_BRANDS, ...DUMMY_BRANDS, ...DUMMY_BRANDS].map(
                  (brand, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 px-8 flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {brand.svg}
                      <span className="text-sm font-semibold tracking-wider uppercase">
                        {brand.name}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Feature 1: Real-Time Cash Flow & Analytics (id="features") ── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <FadeInUp delay={0}>
            <div className="space-y-6">
              <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 inline-block">
                ✨ AI chat
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                Where speed meets intelligent conversation.
              </h2>
              <p className="text-base text-gray-400 leading-relaxed">
                A conversational financial engine that understands your spending velocity, provides
                intelligent answers, and helps you optimize monthly budgets from daily expenses to
                complex asset goals.
              </p>
              <div>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-all"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeInUp>

          {/* Right Mockup */}
          <FadeInUp delay={200}>
            <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative min-h-[420px] flex items-center justify-center">
              {/* Background Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 object-cover w-full h-full -z-10"
                src="https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4"
              />
              <div className="absolute inset-0 bg-black/20 -z-10" />

              {/* Floating UI Card */}
              <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-full max-w-md shadow-2xl relative z-10 space-y-4">
                {/* Top Chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +40.1% Net Standing
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[11px] font-medium text-gray-300">
                    Category Breakdown
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[11px] font-medium text-gray-300">
                    Target Budget
                  </span>
                </div>

                {/* Conversation / Query Bubble */}
                <div className="p-3.5 rounded-xl bg-white/4 border border-white/6 text-xs text-gray-200 space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[10px]">
                    <span>Assistant Insight</span>
                    <span>Just now</span>
                  </div>
                  <p className="font-medium text-white">
                    Current month cash flow shows ₹1,24,500 surplus. Category burn on groceries is
                    18% under target ceiling.
                  </p>
                </div>

                {/* Bottom Input with Mic & Waves */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10">
                  <input
                    type="text"
                    readOnly
                    placeholder="Ask anything about your money..."
                    className="bg-transparent text-xs text-white placeholder:text-gray-500 focus:outline-none flex-1 px-1"
                  />
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <Mic className="h-4 w-4 hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ── 4. Feature 2: Automated Transcription & Reminders ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Mockup */}
          <FadeInUp delay={200} className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative min-h-[420px] flex items-center justify-center">
              {/* Background Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 object-cover w-full h-full -z-10"
                src="https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4"
              />
              <div className="absolute inset-0 bg-black/20 -z-10" />

              {/* Floating UI Card */}
              <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 w-full max-w-md shadow-2xl relative z-10 space-y-4">
                {/* Audio / Transcription Player Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-black hover:bg-emerald-400 transition-colors shadow-md">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-white">11:06 AM – Chris</p>
                      <span className="text-[10px] text-gray-400">Scheduled EMI Processing</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Auto-Pay Active
                  </span>
                </div>

                {/* Visual Audio Waveform Mockup */}
                <div className="flex items-center gap-1 h-8 px-2 py-1 bg-black/40 rounded-lg">
                  {[40, 75, 55, 90, 30, 60, 100, 85, 45, 70, 95, 35, 80, 60, 90, 50, 70, 85, 40].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-400/80 rounded-full"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>

                {/* Dummy Transcription / Obligation Log Text */}
                <div className="p-3 rounded-xl bg-white/4 border border-white/6 text-xs text-gray-300">
                  <p className="font-mono text-[11px] text-emerald-300 mb-1">
                    [System Log 11:06:12 AM]
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    &ldquo;Verified recurring obligation for Home Loan EMI. Occurrence key matched,
                    ₹35,000 ledger debit recorded. Next cycle due Oct 5th.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Right Text */}
          <FadeInUp delay={0} className="order-1 lg:order-2">
            <div className="space-y-6">
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 inline-block">
                ✨ AI transcription
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                Turn speech into text with speed and precision.
              </h2>
              <p className="text-base text-gray-400 leading-relaxed">
                Automatically convert voice notes, financial receipts, and spoken reminders into
                accurate, editable ledger transactions in real time. Perfect for logging expenses
                on-the-go without typing.
              </p>
              <div>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-all"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ── 5. FAQ Section (id="faq") ── */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
        <FadeInUp delay={0}>
          <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center text-white">
            We&apos;ve got answers
          </h2>
        </FadeInUp>

        <FadeInUp delay={150}>
          {/* Main transparent container with border border-white/10 rounded-xl */}
          <div className="border border-white/10 rounded-xl bg-transparent overflow-hidden">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index
              const isLast = index === FAQ_ITEMS.length - 1

              return (
                <div
                  key={index}
                  className={`${!isLast ? "border-b border-white/10" : ""} transition-colors`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-6 px-6 flex items-center justify-between text-left focus:outline-none group"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base text-white font-medium pr-4 group-hover:text-emerald-300 transition-colors">
                      {item.question}
                    </span>
                    <span
                      className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? "rotate-45 text-white" : "rotate-0"
                      }`}
                    >
                      <Plus className="h-5 w-5" />
                    </span>
                  </button>

                  {/* CSS Grid Animation Trick (grid-template-rows: 0fr to 1fr) */}
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-gray-400 text-sm pb-6 px-6 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </FadeInUp>
      </section>

      {/* ── 6. Footer Section (id="contact") ── */}
      <footer id="contact" className="relative z-0 pt-32 pb-10 px-6 border-t border-white/5 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover w-full h-full opacity-40 -z-10 pointer-events-none"
          src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4"
        />

        {/* Strong Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Top CTA with Italic Serif "everything?" */}
          <FadeInUp delay={0}>
            <div className="text-center mb-32 space-y-8">
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white">
                Ready to automate{" "}
                <span className="font-serif italic font-normal text-emerald-300">
                  everything?
                </span>
              </h2>

              <div className="flex flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href="/signup"
                  className="bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-all shadow-lg hover:scale-105"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-6 py-3 rounded-full border border-white/5 transition-all"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </FadeInUp>

          {/* Link Grid (4 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
            {/* Col 1: Plety Logo + Title + Subtext */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <PletyLogo />
                <span className="text-xl font-bold tracking-tight text-white">Plety</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Speed, scale, and smarts — deployed.
              </p>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Product</p>
              <ul className="space-y-2 text-sm text-gray-400">
                {["About", "Pricing", "Changelog", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Legal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Terms of service", "Privacy policy", "404"].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Connect */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Connect</p>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Instagram", "YouTube", "LinkedIn", "Twitter / X"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Layout EXACTLY as: © 2026 Plety. All rights reserved • by Re-text • Made in Gemini */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-xs text-gray-500 border-t border-white/5 pt-8 text-center">
            <span>&copy; 2026 Plety. All rights reserved</span>
            <span className="hidden md:inline">&bull;</span>
            <span>
              by <span className="text-gray-300 font-medium">Re-text</span>
            </span>
            <span className="hidden md:inline">&bull;</span>
            <span>
              Made in <span className="text-gray-300 font-medium">Gemini</span>.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
