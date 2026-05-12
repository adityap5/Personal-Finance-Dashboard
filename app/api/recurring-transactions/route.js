/**
 * GET    /api/recurring-transactions   — fetch user's recurring transactions
 * POST   /api/recurring-transactions   — create a recurring transaction
 * DELETE /api/recurring-transactions?id=  — delete a recurring transaction
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const db = await getDb()
    const items = await db
      .collection("recurring_transactions")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(items)
  } catch (error) {
    console.error("Error fetching recurring:", error)
    return Response.json({ error: "Failed to fetch recurring transactions" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { description, amount, category, type, frequency, nextDate } = body

    if (!description || !amount || !category || !type || !frequency) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (Number(amount) <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const validFrequencies = ["daily", "weekly", "monthly", "yearly"]
    if (!validFrequencies.includes(frequency)) {
      return Response.json({ error: "Invalid frequency" }, { status: 400 })
    }

    const db = await getDb()
    const item = {
      userId: session.user.id,
      description,
      amount: parseFloat(amount),
      category,
      type,
      frequency,
      nextDate: nextDate ? new Date(nextDate) : new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("recurring_transactions").insertOne(item)
    return Response.json({ _id: result.insertedId, ...item }, { status: 201 })
  } catch (error) {
    console.error("Error creating recurring:", error)
    return Response.json({ error: "Failed to create recurring transaction" }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 })
    }

    const db = await getDb()
    const item = await db
      .collection("recurring_transactions")
      .findOne({ _id: new ObjectId(id) })

    if (!item) return Response.json({ error: "Not found" }, { status: 404 })
    if (item.userId !== session.user.id) return Response.json({ error: "Forbidden" }, { status: 403 })

    await db.collection("recurring_transactions").deleteOne({ _id: new ObjectId(id) })
    return Response.json({ message: "Recurring transaction deleted" })
  } catch (error) {
    console.error("Error deleting recurring:", error)
    return Response.json({ error: "Failed to delete recurring transaction" }, { status: 500 })
  }
}
