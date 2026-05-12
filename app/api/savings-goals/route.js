/**
 * GET   /api/savings-goals       — fetch user's savings goals
 * POST  /api/savings-goals       — create a new savings goal
 * PATCH /api/savings-goals       — update currentAmount for a goal
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const db = await getDb()
    const goals = await db
      .collection("savings_goals")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return Response.json({ error: "Failed to fetch savings goals" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, targetAmount, currentAmount = 0, deadline } = body

    if (!name?.trim() || !targetAmount) {
      return Response.json({ error: "Name and target amount are required" }, { status: 400 })
    }

    if (Number(targetAmount) <= 0) {
      return Response.json({ error: "Target amount must be greater than 0" }, { status: 400 })
    }

    const db = await getDb()
    const goal = {
      userId: session.user.id,
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date(),
    }

    const result = await db.collection("savings_goals").insertOne(goal)
    return Response.json({ _id: result.insertedId, ...goal }, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return Response.json({ error: "Failed to create savings goal" }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, currentAmount } = body

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid goal ID" }, { status: 400 })
    }

    const db = await getDb()
    const goal = await db
      .collection("savings_goals")
      .findOne({ _id: new ObjectId(id) })

    if (!goal) return Response.json({ error: "Goal not found" }, { status: 404 })
    if (goal.userId !== session.user.id) return Response.json({ error: "Forbidden" }, { status: 403 })

    await db.collection("savings_goals").updateOne(
      { _id: new ObjectId(id) },
      { $set: { currentAmount: parseFloat(currentAmount), updatedAt: new Date() } }
    )

    return Response.json({ message: "Goal updated successfully" })
  } catch (error) {
    console.error("Error updating goal:", error)
    return Response.json({ error: "Failed to update savings goal" }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid goal ID" }, { status: 400 })
    }

    const db = await getDb()
    const goal = await db
      .collection("savings_goals")
      .findOne({ _id: new ObjectId(id) })

    if (!goal) return Response.json({ error: "Goal not found" }, { status: 404 })
    if (goal.userId !== session.user.id) return Response.json({ error: "Forbidden" }, { status: 403 })

    await db.collection("savings_goals").deleteOne({ _id: new ObjectId(id) })
    return Response.json({ message: "Goal deleted successfully" })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return Response.json({ error: "Failed to delete savings goal" }, { status: 500 })
  }
}
