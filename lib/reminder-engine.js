/**
 * Serverless-safe processing engine for scheduled Reminders and Recurring obligations.
 *
 * Implements:
 * 1. Multiple missed occurrences sequential catch-up loop with MAX_OCCURRENCES_PER_RUN limit.
 * 2. Database-level idempotency via unique `occurrenceKey` on transactions.
 * 3. Exact scheduled occurrence date attribution.
 * 4. End-date termination policy (marks status = "completed").
 */
import {
  computeNextDueDate,
  formatUtcDate,
  parseUtcDate,
  MAX_OCCURRENCES_PER_RUN,
} from "./scheduler.js"

/**
 * Processes due reminders that have `autoCreateTransaction === true`.
 *
 * @param {object} params
 * @param {import("mongodb").Db} params.db
 * @param {string|null} [params.userId] - If provided, only processes reminders for this user
 * @param {number} [params.maxOccurrences] - Safety ceiling per reminder
 * @returns {Promise<{ remindersEvaluated: number, transactionsCreated: number, duplicatesSkipped: number, completedCount: number, errors: Array }>}
 */
export async function processDueReminders({ db, userId = null, maxOccurrences = MAX_OCCURRENCES_PER_RUN }) {
  const now = new Date()
  // Target up to the end of today UTC
  const todayEndOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

  const query = {
    status: "active",
    autoCreateTransaction: true,
    nextDueDate: { $lte: todayEndOfDay },
  }

  if (userId) {
    query.userId = userId
  }

  const dueReminders = await db.collection("reminders").find(query).toArray()

  let remindersEvaluated = 0
  let transactionsCreated = 0
  let duplicatesSkipped = 0
  let completedCount = 0
  const errors = []

  for (const reminder of dueReminders) {
    remindersEvaluated++
    let occurrencesProcessed = 0
    let currentNextDue = parseUtcDate(reminder.nextDueDate)
    let lastProcessed = reminder.lastOccurrenceProcessed || null
    let reminderStatus = reminder.status

    try {
      while (
        currentNextDue.getTime() <= todayEndOfDay.getTime() &&
        occurrencesProcessed < maxOccurrences
      ) {
        // 1. Check end date constraint
        if (reminder.endDate) {
          const endDate = parseUtcDate(reminder.endDate)
          if (currentNextDue.getTime() > endDate.getTime()) {
            reminderStatus = "completed"
            break
          }
        }

        const occurrenceDateStr = formatUtcDate(currentNextDue)
        const occurrenceKey = `reminder_${reminder._id.toString()}_${occurrenceDateStr}`

        const transactionDoc = {
          userId: reminder.userId,
          description: reminder.name,
          amount: parseFloat(reminder.amount),
          category: reminder.category,
          type: reminder.type || "expense",
          date: new Date(currentNextDue),
          source: "reminder",
          sourceId: reminder._id.toString(),
          occurrenceDate: occurrenceDateStr,
          occurrenceKey,
          createdAt: new Date(),
        }

        try {
          await db.collection("transactions").insertOne(transactionDoc)
          transactionsCreated++
        } catch (insertErr) {
          // MongoDB E11000 duplicate key error means this occurrence was already created
          if (insertErr.code === 11000) {
            duplicatesSkipped++
          } else {
            throw insertErr
          }
        }

        lastProcessed = occurrenceDateStr

        // Advance to next due date using preserved dueDay
        const preferredDueDay = reminder.dueDay || currentNextDue.getUTCDate()
        currentNextDue = computeNextDueDate(
          currentNextDue,
          reminder.frequency || "monthly",
          preferredDueDay
        )

        occurrencesProcessed++
      }

      // Check if newly computed nextDueDate surpasses endDate
      if (reminder.endDate) {
        const endDate = parseUtcDate(reminder.endDate)
        if (currentNextDue.getTime() > endDate.getTime()) {
          reminderStatus = "completed"
        }
      }

      if (reminderStatus === "completed") {
        completedCount++
      }

      // Update the reminder record
      await db.collection("reminders").updateOne(
        { _id: reminder._id },
        {
          $set: {
            nextDueDate: currentNextDue,
            lastOccurrenceProcessed: lastProcessed,
            status: reminderStatus,
            updatedAt: new Date(),
          },
        }
      )
    } catch (err) {
      console.error(`Error processing reminder ${reminder._id}:`, err)
      errors.push({ reminderId: reminder._id.toString(), error: err.message })
    }
  }

  return {
    remindersEvaluated,
    transactionsCreated,
    duplicatesSkipped,
    completedCount,
    errors,
  }
}
