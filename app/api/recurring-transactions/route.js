/**
 * GET    /api/recurring-transactions       — fetch user's recurring transaction rules
 * POST   /api/recurring-transactions       — create a deterministic recurring rule
 * PUT    /api/recurring-transactions/[id]  — update or pause/resume a recurring rule
 * DELETE /api/recurring-transactions?id=  — delete a recurring rule
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { computeNextDueDate, parseUtcDate } from "@/lib/scheduler"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    return Response.json({ error: "Failed to fetch recurring rules" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      description,
      title,
      amount,
      category,
      type = "expense",
      frequency = "monthly",
      startDate,
      dueDay,
    } = body

    const itemTitle = (title || description || "").trim()

    if (!itemTitle || !amount || !category) {
      return Response.json({ error: "Title, amount, and category are required" }, { status: 400 })
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const validFrequencies = ["daily", "weekly", "monthly", "yearly"]
    if (!validFrequencies.includes(frequency)) {
      return Response.json({ error: "Invalid frequency" }, { status: 400 })
    }

    const parsedStartDate = startDate ? parseUtcDate(startDate) : new Date()
    const preferredDueDay =
      frequency === "monthly" && dueDay
        ? Math.min(31, Math.max(1, parseInt(dueDay, 10)))
        : parsedStartDate.getUTCDate()

    // Calculate initial next due date
    const nextDueDate = computeNextDueDate(parsedStartDate, frequency, preferredDueDay)

    const db = await getDb()
    const recurringRule = {
      userId: session.user.id,
      description: itemTitle,
      title: itemTitle,
      amount: parsedAmount,
      category: category.trim(),
      type,
      frequency,
      dueDay: preferredDueDay,
      startDate: parsedStartDate,
      nextDueDate,
      lastProcessedDate: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("recurring_transactions").insertOne(recurringRule)

    return Response.json(
      { _id: result.insertedId.toString(), ...recurringRule },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating recurring rule:", error)
    return Response.json({ error: "Failed to create recurring rule" }, { status: 500 })
  }
}

export async function PUT(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, description, amount, category, type, frequency, dueDay, active } = body

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid rule ID" }, { status: 400 })
    }

    const db = await getDb()
    const existing = await db.collection("recurring_transactions").findOne({
      _id: new ObjectId(id),
    })

    if (!existing) {
      return Response.json({ error: "Rule not found" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const updates = { updatedAt: new Date() }

    if (typeof active === "boolean") {
      updates.active = active
    }

    if (title || description) {
      updates.title = (title || description).trim()
      updates.description = updates.title
    }

    if (amount) {
      const parsed = parseFloat(amount)
      if (parsed > 0) updates.amount = parsed
    }

    if (category) updates.category = category.trim()
    if (type) updates.type = type
    if (frequency) updates.frequency = frequency
    if (dueDay) updates.dueDay = Math.min(31, Math.max(1, parseInt(dueDay, 10)))

    await db.collection("recurring_transactions").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updatedDoc = await db.collection("recurring_transactions").findOne({
      _id: new ObjectId(id),
    })

    return Response.json({ message: "Rule updated", rule: updatedDoc })
  } catch (error) {
    console.error("Error updating recurring rule:", error)
    return Response.json({ error: "Failed to update recurring rule" }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    return Response.json({ message: "Recurring rule deleted" })
  } catch (error) {
    console.error("Error deleting recurring rule:", error)
    return Response.json({ error: "Failed to delete recurring rule" }, { status: 500 })
  }
}
