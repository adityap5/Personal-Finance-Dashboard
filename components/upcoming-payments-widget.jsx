"use client"

import { useState, useEffect } from "react"
import { Bell, ArrowRight, IndianRupee, Calendar, AlertTriangle, Zap, CheckCircle2 } from "lucide-react"

export default function UpcomingPaymentsWidget({ onNavigateToReminders }) {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reminders")
        if (!res.ok) return
        const data = await res.json()
        setReminders(data.reminders || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter out paused or completed items, sort by urgency: overdue -> due today -> upcoming
  const activeItems = reminders
    .filter((r) => r.rawStatus !== "paused" && r.status !== "completed")
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, 4)

  return (
    <div className="rounded-2xl bg-[#071912] border border-white/6 p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upcoming Obligations</h3>
              <p className="text-xs text-slate-500">Scheduled EMIs, bills & subscriptions</p>
            </div>
          </div>

          <button
            onClick={onNavigateToReminders}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : activeItems.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/30 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No upcoming payments due</p>
            <p className="text-slate-600 mt-0.5">All scheduled bills and EMIs are clear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map((item) => {
              const isDueToday = item.status === "due_today"
              const isOverdue = item.status === "overdue"

              let timingBadge = `In ${item.daysUntilDue} days`
              let badgeColor = "text-slate-400 bg-white/4 border-white/8"

              if (isDueToday) {
                timingBadge = "Due Today"
                badgeColor = "text-amber-300 bg-amber-500/15 border-amber-500/30 font-bold"
              } else if (isOverdue) {
                timingBadge = `Overdue (${Math.abs(item.daysUntilDue)}d)`
                badgeColor = "text-rose-300 bg-rose-500/15 border-rose-500/30 font-bold"
              } else if (item.daysUntilDue === 1) {
                timingBadge = "Tomorrow"
                badgeColor = "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
              }

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5 hover:border-emerald-500/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-white truncate">
                          {item.name}
                        </p>
                        {item.autoCreateTransaction && (
                          <Zap className="h-3 w-3 text-emerald-400 shrink-0" title="Auto-Pay active" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {item.category} • {new Date(item.nextDueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs font-bold text-white flex items-center justify-end gap-0.5">
                      <IndianRupee className="h-3 w-3" />
                      {item.amount.toLocaleString("en-IN")}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block mt-0.5 ${badgeColor}`}>
                      {timingBadge}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={onNavigateToReminders}
        className="mt-3 w-full py-2 rounded-xl bg-white/3 hover:bg-white/6 border border-white/6 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>Manage Reminders</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}
