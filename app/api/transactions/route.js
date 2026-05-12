/**
 * GET  /api/transactions       — fetch authenticated user's transactions
 * POST /api/transactions       — create a new transaction for current user
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()
    const transactions = await db
      .collection("transactions")
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .toArray()

    return Response.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { amount, description, category, type, date } = body

    if (!amount || !description || !category || !type || !date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (Number(amount) <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const db = await getDb()
    const transaction = {
      userId: session.user.id,
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date(date),
      createdAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return Response.json(
      { _id: result.insertedId, ...transaction },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating transaction:", error)
    return Response.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
