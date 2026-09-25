/**
 * PUT    /api/reminders/[id] — Update reminder details or toggle status (paused/active).
 * DELETE /api/reminders/[id] — Remove a reminder obligation.
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { parseUtcDate } from "@/lib/scheduler"

export async function PUT(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid reminder ID" }, { status: 400 })
  }

  try {
    const db = await getDb()
    const existing = await db.collection("reminders").findOne({
      _id: new ObjectId(id),
    })

    if (!existing) {
      return Response.json({ error: "Reminder not found" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updates = { updatedAt: new Date() }

    if (body.status && ["active", "paused", "completed"].includes(body.status)) {
      updates.status = body.status
    }

    if (body.name?.trim()) updates.name = body.name.trim()

    if (body.amount) {
      const parsedAmount = parseFloat(body.amount)
      if (parsedAmount > 0) updates.amount = parsedAmount
    }

    if (body.type) updates.type = body.type
    if (body.category) updates.category = body.category.trim()
    if (body.frequency) updates.frequency = body.frequency
    if (body.notes !== undefined) updates.notes = body.notes.trim()

    if (typeof body.autoCreateTransaction === "boolean") {
      updates.autoCreateTransaction = body.autoCreateTransaction
    }

    if (typeof body.notifyBefore === "boolean") {
      updates.notifyBefore = body.notifyBefore
    }

    if (body.dueDay) {
      updates.dueDay = Math.min(31, Math.max(1, parseInt(body.dueDay, 10)))
    }

    if (body.endDate !== undefined) {
      updates.endDate = body.endDate ? parseUtcDate(body.endDate) : null
    }

    // If frequency or dueDay changed, optionally recompute nextDueDate
    if (body.nextDueDate) {
      updates.nextDueDate = parseUtcDate(body.nextDueDate)
    }

    await db.collection("reminders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    const updated = await db.collection("reminders").findOne({
      _id: new ObjectId(id),
    })

    return Response.json({ message: "Reminder updated successfully", reminder: updated })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return Response.json({ error: "Failed to update reminder" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid reminder ID" }, { status: 400 })
  }

  try {
    const db = await getDb()
    const existing = await db.collection("reminders").findOne({
      _id: new ObjectId(id),
    })

    if (!existing) {
      return Response.json({ error: "Reminder not found" }, { status: 404 })
    }

    if (existing.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.collection("reminders").deleteOne({ _id: new ObjectId(id) })

    return Response.json({ message: "Reminder deleted successfully" })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return Response.json({ error: "Failed to delete reminder" }, { status: 500 })
  }
}
