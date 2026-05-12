/**
 * GET  /api/budgets       — fetch authenticated user's budgets
 * POST /api/budgets       — create or update a budget for current user
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
    const budgets = await db
      .collection("budgets")
      .find({ userId: session.user.id })
      .sort({ month: -1 })
      .toArray()

    return Response.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return Response.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { category, amount, month } = body

    if (!category || !amount || !month) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (Number(amount) <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const db = await getDb()
    const userId = session.user.id

    // Upsert: update existing budget for this user/category/month or create new
    const existingBudget = await db
      .collection("budgets")
      .findOne({ userId, category, month })

    if (existingBudget) {
      await db.collection("budgets").updateOne(
        { userId, category, month },
        { $set: { amount: parseFloat(amount), updatedAt: new Date() } }
      )

      return Response.json({
        message: "Budget updated successfully",
        _id: existingBudget._id,
        category,
        amount: parseFloat(amount),
        month,
        userId,
      })
    } else {
      const budget = {
        userId,
        category,
        amount: parseFloat(amount),
        month,
        createdAt: new Date(),
      }

      const result = await db.collection("budgets").insertOne(budget)
      return Response.json({ _id: result.insertedId, ...budget }, { status: 201 })
    }
  } catch (error) {
    console.error("Error saving budget:", error)
    return Response.json({ error: "Failed to save budget" }, { status: 500 })
  }
}
