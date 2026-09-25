/**
 * Singleton MongoDB client for Next.js.
 * Reuses the connection across hot-reloads in dev and across requests in prod.
 */
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) throw new Error("MONGODB_URI is not set in environment variables")

const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === "development") {
  // In dev, use a global variable so the client is reused across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In prod, always create a new client (one per serverless function)
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

let indexesEnsured = false

/**
 * Ensures critical database indexes exist (idempotency, unique constraints, performance).
 */
export async function ensureIndexes(db) {
  if (indexesEnsured) return
  try {
    // 1. Transactions: unique occurrenceKey for idempotent auto-generated transactions
    await db.collection("transactions").createIndex(
      { occurrenceKey: 1 },
      { unique: true, sparse: true, name: "unique_occurrence_key_sparse" }
    )
    await db.collection("transactions").createIndex(
      { userId: 1, date: -1 },
      { name: "user_transactions_date_idx" }
    )

    // 2. Categories: user-scoped case-insensitive unique category name
    await db.collection("categories").createIndex(
      { userId: 1, nameLower: 1 },
      { unique: true, name: "user_category_namelower_unique" }
    )

    // 3. Reminders: query by user and by cron processing criteria
    await db.collection("reminders").createIndex(
      { userId: 1, nextDueDate: 1 },
      { name: "user_reminders_nextdue_idx" }
    )
    await db.collection("reminders").createIndex(
      { status: 1, autoCreateTransaction: 1, nextDueDate: 1 },
      { name: "cron_due_reminders_idx" }
    )

    indexesEnsured = true
  } catch (err) {
    console.error("Index creation warning:", err.message)
  }
}

/** Helper: get a specific database and ensure indexes */
export async function getDb(dbName = "finance") {
  const client = await clientPromise
  const db = client.db(dbName)
  // Ensure indexes without blocking critical path
  ensureIndexes(db).catch(() => {})
  return db
}
