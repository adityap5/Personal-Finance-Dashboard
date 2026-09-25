/**
 * Pure, deterministic scheduling & date calculation engine.
 * Shared between Recurring Transactions and Reminders to eliminate duplicated logic.
 *
 * Uses UTC calendar date representations (YYYY-MM-DD) to prevent timezone off-by-one shifts.
 */

export const MAX_OCCURRENCES_PER_RUN = 12

/**
 * Returns number of days in a given year and 1-based month (1 = Jan, 12 = Dec).
 */
export function getDaysInMonth(year, month) {
  // Day 0 of next month is the last day of this month in JS Date
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * Checks if a given year is a leap year.
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Formats a Date object to 'YYYY-MM-DD' in UTC.
 */
export function formatUtcDate(date) {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().split("T")[0]
}

/**
 * Parses a 'YYYY-MM-DD' string to a UTC Date at 00:00:00.000Z.
 */
export function parseUtcDate(dateStr) {
  if (!dateStr) return new Date()
  if (dateStr instanceof Date) return dateStr
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

/**
 * Computes the next due date based on frequency and optional dueDay preference.
 *
 * Rules:
 * - Monthly: advances 1 month. If dueDay (e.g. 31) exceeds the days in target month,
 *   clamps to month-end (Feb 28/29, Apr 30), but preserves dueDay for future 31-day months.
 * - Weekly: exactly +7 days.
 * - Yearly: exactly +1 year. (Feb 29 on non-leap year resolves to Feb 28).
 * - Daily: +1 day.
 *
 * @param {Date|string} currentDueDate
 * @param {"daily"|"weekly"|"monthly"|"yearly"} frequency
 * @param {number} [preferredDueDay] - Preserved original due day (1-31)
 * @returns {Date} UTC Date
 */
export function computeNextDueDate(currentDueDate, frequency = "monthly", preferredDueDay = null) {
  const current = parseUtcDate(currentDueDate)
  const curYear = current.getUTCFullYear()
  const curMonth = current.getUTCMonth() + 1 // 1-based (1-12)
  const curDay = current.getUTCDate()

  const targetDay = preferredDueDay || curDay

  if (frequency === "weekly") {
    const next = new Date(current.getTime())
    next.setUTCDate(next.getUTCDate() + 7)
    return next
  }

  if (frequency === "daily") {
    const next = new Date(current.getTime())
    next.setUTCDate(next.getUTCDate() + 1)
    return next
  }

  if (frequency === "yearly") {
    const nextYear = curYear + 1
    const maxDays = getDaysInMonth(nextYear, curMonth)
    const clampedDay = Math.min(targetDay, maxDays)
    return new Date(Date.UTC(nextYear, curMonth - 1, clampedDay, 0, 0, 0, 0))
  }

  // Monthly
  let nextYear = curYear
  let nextMonth = curMonth + 1
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear += 1
  }

  const maxDaysInNextMonth = getDaysInMonth(nextYear, nextMonth)
  const clampedDay = Math.min(targetDay, maxDaysInNextMonth)

  return new Date(Date.UTC(nextYear, nextMonth - 1, clampedDay, 0, 0, 0, 0))
}

/**
 * Computes the status of a reminder based on nextDueDate and today's date in UTC.
 *
 * @param {Date|string} nextDueDate
 * @param {boolean} active
 * @param {Date|string} [endDate]
 * @returns {"due_today"|"overdue"|"upcoming"|"paused"|"completed"}
 */
export function calculateDueStatus(nextDueDate, active = true, endDate = null) {
  if (!active) return "paused"

  const now = new Date()
  const todayStr = formatUtcDate(now)
  const dueStr = formatUtcDate(nextDueDate)

  if (endDate) {
    const endStr = formatUtcDate(endDate)
    if (dueStr > endStr) return "completed"
  }

  if (dueStr === todayStr) return "due_today"
  if (dueStr < todayStr) return "overdue"
  return "upcoming"
}

/**
 * Calculates remaining days from today until due date.
 * Returns negative numbers for overdue.
 */
export function getDaysUntilDue(nextDueDate) {
  const now = new Date()
  const today = parseUtcDate(formatUtcDate(now))
  const due = parseUtcDate(formatUtcDate(nextDueDate))
  const diffTime = due.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}
