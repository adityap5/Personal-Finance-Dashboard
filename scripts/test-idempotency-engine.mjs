/**
 * Automated test verifying idempotency, multi-occurrence catch-up,
 * duplicate rejection, and end-date completion in reminder engine.
 */
import { processDueReminders } from "../lib/reminder-engine.js"
import { parseUtcDate, formatUtcDate } from "../lib/scheduler.js"

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log("=== RUNNING REMINDER ENGINE IDEMPOTENCY & LOGIC TESTS ===\n")

// Create an in-memory mock MongoDB simulation that honors unique constraints
class MockCollection {
  constructor(name, uniqueIndexKey = null) {
    this.name = name
    this.uniqueIndexKey = uniqueIndexKey
    this.docs = []
  }

  find(query = {}) {
    const results = this.docs.filter((doc) => {
      for (const [k, v] of Object.entries(query)) {
        if (v && typeof v === "object" && "$lte" in v) {
          const docVal = doc[k] instanceof Date ? doc[k].getTime() : new Date(doc[k]).getTime()
          const qVal = v.$lte instanceof Date ? v.$lte.getTime() : new Date(v.$lte).getTime()
          if (docVal > qVal) return false
        } else if (doc[k] !== v) {
          return false
        }
      }
      return true
    })

    return {
      toArray: async () => JSON.parse(JSON.stringify(results)),
    }
  }

  async findOne(query) {
    const items = (await this.find(query)).toArray()
    const arr = await items
    return arr[0] || null
  }

  async insertOne(doc) {
    if (this.uniqueIndexKey && doc[this.uniqueIndexKey]) {
      const exists = this.docs.some(
        (d) => d[this.uniqueIndexKey] === doc[this.uniqueIndexKey]
      )
      if (exists) {
        const err = new Error(`E11000 duplicate key error collection: ${this.name} index: ${this.uniqueIndexKey}`)
        err.code = 11000
        throw err
      }
    }
    const inserted = { _id: "mock_id_" + Math.random().toString(36).slice(2), ...doc }
    this.docs.push(inserted)
    return { insertedId: inserted._id }
  }

  async updateOne(filter, update) {
    const doc = this.docs.find((d) => {
      for (const [k, v] of Object.entries(filter)) {
        if (d[k]?.toString() !== v?.toString()) return false
      }
      return true
    })
    if (doc && update.$set) {
      Object.assign(doc, update.$set)
    }
    return { modifiedCount: doc ? 1 : 0 }
  }
}

class MockDb {
  constructor() {
    this.collections = {
      transactions: new MockCollection("transactions", "occurrenceKey"),
      reminders: new MockCollection("reminders"),
    }
  }
  collection(name) {
    return this.collections[name]
  }
}

async function runTests() {
  const db = new MockDb()

  // Test 1: Insert an overdue monthly reminder (due 2 months ago)
  // Current simulated date is Sep 25, 2026.
  // Start date July 5, 2026. Next due July 5, 2026.
  const reminderDoc = {
    _id: "rem_1",
    userId: "user_test_1",
    name: "Home Loan EMI",
    amount: 25000,
    type: "expense",
    category: "Housing",
    frequency: "monthly",
    dueDay: 5,
    startDate: parseUtcDate("2026-07-05"),
    endDate: null,
    nextDueDate: parseUtcDate("2026-07-05"),
    autoCreateTransaction: true,
    status: "active",
  }
  await db.collection("reminders").insertOne(reminderDoc)

  // Run the processing engine
  const statsRun1 = await processDueReminders({ db })
  console.log("Run 1 Stats:", statsRun1)

  assert(statsRun1.transactionsCreated === 3, "Created 3 missed transactions (July 5, Aug 5, Sep 5)")
  assert(statsRun1.duplicatesSkipped === 0, "No duplicates skipped on initial run")

  const txns = db.collection("transactions").docs
  assert(txns.length === 3, "3 transaction documents inserted")
  assert(formatUtcDate(txns[0].date) === "2026-07-05", "First transaction attributed to 2026-07-05")
  assert(formatUtcDate(txns[1].date) === "2026-08-05", "Second transaction attributed to 2026-08-05")
  assert(formatUtcDate(txns[2].date) === "2026-09-05", "Third transaction attributed to 2026-09-05")

  // Check updated reminder nextDueDate
  const updatedRem = db.collection("reminders").docs[0]
  assert(formatUtcDate(updatedRem.nextDueDate) === "2026-10-05", "Reminder nextDueDate advanced to 2026-10-05")

  // Test 2: Idempotency & Duplicate Rejection
  // Run the engine a second time immediately
  const statsRun2 = await processDueReminders({ db })
  console.log("Run 2 Stats (Immediate rerun):", statsRun2)
  assert(statsRun2.transactionsCreated === 0, "Zero new transactions created on rerun")
  assert(db.collection("transactions").docs.length === 3, "Still exactly 3 transactions in database")

  // Test 3: Simulated Concurrent Insertion Collision
  // Artificially reset nextDueDate to test code 11000 collision handling
  updatedRem.nextDueDate = parseUtcDate("2026-09-05")
  const statsCollision = await processDueReminders({ db })
  console.log("Collision Test Stats:", statsCollision)
  assert(statsCollision.duplicatesSkipped === 1, "Duplicate key error safely caught and skipped")
  assert(statsCollision.transactionsCreated === 0, "No duplicate transactions created on collision")

  // Test 4: End Date Expiration
  const expiringRem = {
    _id: "rem_2",
    userId: "user_test_2",
    name: "Phone Installment",
    amount: 3000,
    type: "expense",
    category: "Electronics",
    frequency: "monthly",
    dueDay: 1,
    startDate: parseUtcDate("2026-08-01"),
    endDate: parseUtcDate("2026-09-01"), // Ends on Sep 1
    nextDueDate: parseUtcDate("2026-08-01"),
    autoCreateTransaction: true,
    status: "active",
  }
  await db.collection("reminders").insertOne(expiringRem)

  const statsExpiring = await processDueReminders({ db, userId: "user_test_2" })
  console.log("Expiring Reminder Stats:", statsExpiring)
  assert(statsExpiring.transactionsCreated === 2, "Created Aug 1 and Sep 1 installments")
  assert(statsExpiring.completedCount === 1, "Reminder status marked as completed upon reaching endDate")

  const finalExp = db.collection("reminders").docs.find((d) => d._id === "rem_2")
  assert(finalExp.status === "completed", "Reminder record updated with status: completed")

  // Test 5: Paused Reminder is Ignored
  const pausedRem = {
    _id: "rem_3",
    userId: "user_test_3",
    name: "Gym (Paused)",
    amount: 1500,
    type: "expense",
    category: "Health",
    frequency: "monthly",
    dueDay: 1,
    startDate: parseUtcDate("2026-08-01"),
    nextDueDate: parseUtcDate("2026-08-01"),
    autoCreateTransaction: true,
    status: "paused", // PAUSED
  }
  await db.collection("reminders").insertOne(pausedRem)
  const statsPaused = await processDueReminders({ db, userId: "user_test_3" })
  assert(statsPaused.remindersEvaluated === 0, "Paused reminder is not evaluated or processed")
  assert(statsPaused.transactionsCreated === 0, "Zero transactions created for paused reminder")

  console.log("\nALL IDEMPOTENCY & LOGIC TESTS PASSED PERFECTLY! 🚀")
}

runTests().catch((e) => {
  console.error("Test failed with error:", e)
  process.exit(1)
})
