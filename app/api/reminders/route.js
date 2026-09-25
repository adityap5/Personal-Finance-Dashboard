/**
 * GET  /api/reminders — List user's reminders with real-time due status and days remaining.
 * POST /api/reminders — Create a scheduled reminder (EMI, subscription, recurring bill).
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import {
  computeNextDueDate,
  calculateDueStatus,
  getDaysUntilDue,
  parseUtcDate,
} from "@/lib/scheduler"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()
    const rawItems = await db
      .collection("reminders")
      .find({ userId: session.user.id })
      .sort({ nextDueDate: 1 })
      .toArray()

    const reminders = rawItems.map((item) => {
      const active = item.status !== "paused"
      const status = calculateDueStatus(item.nextDueDate, active, item.endDate)
      const daysUntilDue = getDaysUntilDue(item.nextDueDate)

      return {
        _id: item._id.toString(),
        name: item.name,
        amount: item.amount,
        type: item.type || "expense",
        category: item.category,
        frequency: item.frequency || "monthly",
        dueDay: item.dueDay,
        startDate: item.startDate,
        endDate: item.endDate || null,
        nextDueDate: item.nextDueDate,
        lastOccurrenceProcessed: item.lastOccurrenceProcessed || null,
        autoCreateTransaction: !!item.autoCreateTransaction,
        notifyBefore: !!item.notifyBefore,
        status, // calculated status: "due_today" | "overdue" | "upcoming" | "paused" | "completed"
        rawStatus: item.status,
        daysUntilDue,
        notes: item.notes || "",
        createdAt: item.createdAt,
      }
    })

    // Compute summary metrics
    const dueTodayCount = reminders.filter((r) => r.status === "due_today").length
    const overdueCount = reminders.filter((r) => r.status === "overdue").length
    const upcomingCount = reminders.filter((r) => r.status === "upcoming").length
    const monthlyTotal = reminders
      .filter((r) => r.rawStatus !== "paused" && r.status !== "completed")
      .reduce((sum, r) => {
        if (r.frequency === "monthly") return sum + r.amount
        if (r.frequency === "weekly") return sum + r.amount * 4.33
        if (r.frequency === "yearly") return sum + r.amount / 12
        return sum + r.amount
      }, 0)

    return Response.json({
      reminders,
      summary: {
        dueTodayCount,
        overdueCount,
        upcomingCount,
        monthlyTotal: Math.round(monthlyTotal),
        totalCount: reminders.length,
      },
    })
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return Response.json({ error: "Failed to fetch reminders" }, { status: 500 })
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
      name,
      amount,
      type = "expense",
      category,
      frequency = "monthly",
      dueDay,
      startDate,
      endDate,
      autoCreateTransaction = true,
      notifyBefore = false,
      notes = "",
    } = body

    if (!name?.trim() || !amount || !category) {
      return Response.json(
        { error: "Name, amount, and category are required" },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return Response.json(
        { error: "Amount must be a number greater than 0" },
        { status: 400 }
      )
    }

    const parsedStartDate = startDate ? parseUtcDate(startDate) : new Date()
    const parsedEndDate = endDate ? parseUtcDate(endDate) : null

    // Determine target day of month (1-31)
    const preferredDueDay =
      frequency === "monthly" && dueDay
        ? Math.min(31, Math.max(1, parseInt(dueDay, 10)))
        : parsedStartDate.getUTCDate()

    // Calculate the first upcoming nextDueDate on or after startDate
    let initialNextDue = new Date(Date.UTC(
      parsedStartDate.getUTCFullYear(),
      parsedStartDate.getUTCMonth(),
      preferredDueDay,
      0, 0, 0, 0
    ))

    // If due day in start month has already passed before startDate, advance 1 cycle
    if (initialNextDue.getTime() < parsedStartDate.getTime()) {
      initialNextDue = computeNextDueDate(parsedStartDate, frequency, preferredDueDay)
    }

    const reminder = {
      userId: session.user.id,
      name: name.trim(),
      amount: parsedAmount,
      type,
      category: category.trim(),
      frequency,
      dueDay: preferredDueDay,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      nextDueDate: initialNextDue,
      lastOccurrenceProcessed: null,
      autoCreateTransaction: !!autoCreateTransaction,
      notifyBefore: !!notifyBefore,
      status: "active",
      notes: (notes || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const db = await getDb()
    const result = await db.collection("reminders").insertOne(reminder)

    return Response.json(
      {
        _id: result.insertedId.toString(),
        ...reminder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating reminder:", error)
    return Response.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
