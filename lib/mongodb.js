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

/** Helper: get a specific database */
export async function getDb(dbName = "finance") {
  const client = await clientPromise
  return client.db(dbName)
}
