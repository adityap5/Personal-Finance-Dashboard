/**
 * Automated test suite for scheduling math, calendar rollover, leap years, and catch-up logic.
 */
import {
  computeNextDueDate,
  formatUtcDate,
  parseUtcDate,
  getDaysInMonth,
  isLeapYear,
  calculateDueStatus,
  getDaysUntilDue,
  MAX_OCCURRENCES_PER_RUN,
} from "../lib/scheduler.js"

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log("=== RUNNING SCHEDULER & ROLLOVER TESTS ===\n")

// 1. Days in Month & Leap Year
assert(getDaysInMonth(2025, 2) === 28, "2025 Feb has 28 days")
assert(getDaysInMonth(2028, 2) === 29, "2028 Feb has 29 days (leap year)")
assert(getDaysInMonth(2026, 4) === 30, "April has 30 days")
assert(getDaysInMonth(2026, 1) === 31, "January has 31 days")
assert(!isLeapYear(2025), "2025 is not a leap year")
assert(isLeapYear(2028), "2028 is a leap year")
assert(!isLeapYear(1900), "1900 is not a leap year (divisible by 100)")
assert(isLeapYear(2000), "2000 is a leap year (divisible by 400)")

// 2. 31st -> February (non-leap 2025)
const jan31_2025 = parseUtcDate("2025-01-31")
const febNext = computeNextDueDate(jan31_2025, "monthly", 31)
assert(formatUtcDate(febNext) === "2025-02-28", "31st in Jan 2025 rolls over to Feb 28 (non-leap)")

// 3. 31st -> February (leap year 2028)
const jan31_2028 = parseUtcDate("2028-01-31")
const feb2028Next = computeNextDueDate(jan31_2028, "monthly", 31)
assert(formatUtcDate(feb2028Next) === "2028-02-29", "31st in Jan 2028 rolls over to Feb 29 (leap year)")

// 4. 31st -> 30-day month (e.g. March 31 -> April 30)
const mar31 = parseUtcDate("2026-03-31")
const aprNext = computeNextDueDate(mar31, "monthly", 31)
assert(formatUtcDate(aprNext) === "2026-04-30", "31st in March rolls over to April 30")

// 5. Preserving original dueDay across subsequent months
// From April 30 (originally dueDay 31), advancing to May must restore May 31!
const mayNext = computeNextDueDate(aprNext, "monthly", 31)
assert(formatUtcDate(mayNext) === "2026-05-31", "May restores original 31st due day from April 30")

// From Feb 28 (originally dueDay 31), advancing to March must restore March 31!
const marNext = computeNextDueDate(febNext, "monthly", 31)
assert(formatUtcDate(marNext) === "2025-03-31", "March restores original 31st due day from Feb 28")

// 6. Yearly Leap Day rollover (Feb 29 -> Feb 28 next year)
const feb29_2024 = parseUtcDate("2024-02-29")
const yearlyNext = computeNextDueDate(feb29_2024, "yearly", 29)
assert(formatUtcDate(yearlyNext) === "2025-02-28", "Feb 29 yearly rolls to Feb 28 on non-leap year")

// 7. Weekly recurrence (+7 days)
const wed = parseUtcDate("2026-09-02")
const wedNext = computeNextDueDate(wed, "weekly")
assert(formatUtcDate(wedNext) === "2026-09-09", "Weekly adds exactly 7 days")

// 8. Multi-month catch-up simulation
let simDueDate = parseUtcDate("2026-06-05")
const todayLimit = parseUtcDate("2026-09-25")
const occurrences = []
let processedCount = 0

while (simDueDate.getTime() <= todayLimit.getTime() && processedCount < MAX_OCCURRENCES_PER_RUN) {
  occurrences.push(formatUtcDate(simDueDate))
  simDueDate = computeNextDueDate(simDueDate, "monthly", 5)
  processedCount++
}

assert(occurrences.length === 4, "Processed 4 missed occurrences (June 5, July 5, Aug 5, Sep 5)")
assert(occurrences[0] === "2026-06-05", "First occurrence June 5")
assert(occurrences[1] === "2026-07-05", "Second occurrence July 5")
assert(occurrences[2] === "2026-08-05", "Third occurrence Aug 5")
assert(occurrences[3] === "2026-09-05", "Fourth occurrence Sep 5")
assert(formatUtcDate(simDueDate) === "2026-10-05", "Next due date correctly advanced to Oct 5")

// 9. Status calculations
assert(calculateDueStatus(new Date(), false) === "paused", "Paused status takes precedence")
assert(calculateDueStatus("2020-01-01", true) === "overdue", "Past due date is overdue")
assert(calculateDueStatus("2099-01-01", true) === "upcoming", "Future date is upcoming")
assert(calculateDueStatus("2026-10-01", true, "2026-09-01") === "completed", "Surpassed endDate is completed")

console.log("\nALL SCHEDULER & ROLLOVER TESTS PASSED PERFECTLY! 🚀")
