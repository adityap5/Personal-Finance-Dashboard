/**
 * GET  /api/bucket-list — fetch authenticated user's bucket list items
 * POST /api/bucket-list — create a new bucket list item for current user
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

const VALID_CATEGORIES = [
  "Needs",
  "Wants",
  "Financial Goals",
  "Travel",
  "Personal",
  "Career",
  "Custom",
]

const VALID_PRIORITIES = ["Low", "Medium", "High"]

export async function GET(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const category = searchParams.get("category")?.trim() || ""
    const priority = searchParams.get("priority")?.trim() || ""
    const status = searchParams.get("status")?.trim() || "" // "all" | "active" | "completed"
    const sortBy = searchParams.get("sortBy")?.trim() || "createdAt" // "priority" | "targetDate" | "createdAt"

    const query = { userId: session.user.id }

    // Status filter
    if (status === "active") {
      query.isCompleted = false
    } else if (status === "completed") {
      query.isCompleted = true
    }

    // Category filter
    if (category && category.toLowerCase() !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") }
    }

    // Priority filter
    if (priority && priority.toLowerCase() !== "all") {
      query.priority = { $regex: new RegExp(`^${priority}$`, "i") }
    }

    // Search filter across title and description
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ]
    }

    const db = await getDb()

    // Determine sort
    let sortOptions = { createdAt: -1 }
    if (sortBy === "targetDate") {
      sortOptions = { targetDate: 1, createdAt: -1 }
    } else if (sortBy === "priority") {
      // Priority sorting: High > Medium > Low
      // We will sort in-memory or use aggregation if needed, or by priority string + date
      sortOptions = { priority: 1, createdAt: -1 }
    }

    const items = await db
      .collection("bucket_items")
      .find(query)
      .sort(sortOptions)
      .toArray()

    // If sorting by priority, apply custom order High -> Medium -> Low
    if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 }
      items.sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 4
        const orderB = priorityOrder[b.priority] || 4
        if (orderA !== orderB) return orderA - orderB
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    return Response.json(items)
  } catch (error) {
    console.error("Error fetching bucket list items:", error)
    return Response.json(
      { error: "Failed to fetch bucket list items" },
      { status: 500 }
    )
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
      title,
      description,
      category,
      priority,
      targetDate,
      targetAmount,
      savedAmount,
      link,
    } = body

    // 1. Title validation (required, trimmed, rejected if empty)
    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json(
        { error: "Title is required and cannot be empty" },
        { status: 400 }
      )
    }

    const trimmedTitle = title.trim()
    if (trimmedTitle.length > 200) {
      return Response.json(
        { error: "Title cannot exceed 200 characters" },
        { status: 400 }
      )
    }

    // 2. Category validation
    const trimmedCategory = (category || "Personal").trim()

    // 3. Priority validation
    const formattedPriority =
      VALID_PRIORITIES.find(
        (p) => p.toLowerCase() === (priority || "medium").trim().toLowerCase()
      ) || "Medium"

    // 4. Target Date validation
    let parsedTargetDate = null
    if (targetDate) {
      const d = new Date(targetDate)
      if (isNaN(d.getTime())) {
        return Response.json(
          { error: "Invalid target date format" },
          { status: 400 }
        )
      }
      parsedTargetDate = d
    }

    // 5. Target Amount validation
    let parsedTargetAmount = null
    if (targetAmount !== undefined && targetAmount !== null && targetAmount !== "") {
      const val = parseFloat(targetAmount)
      if (isNaN(val) || val <= 0) {
        return Response.json(
          { error: "Target amount must be a positive number" },
          { status: 400 }
        )
      }
      parsedTargetAmount = val
    }

    // 6. Saved Amount validation
    let parsedSavedAmount = 0
    if (savedAmount !== undefined && savedAmount !== null && savedAmount !== "") {
      const val = parseFloat(savedAmount)
      if (isNaN(val) || val < 0) {
        return Response.json(
          { error: "Saved amount cannot be negative" },
          { status: 400 }
        )
      }
      parsedSavedAmount = val
    }

    // 7. Link validation (optional URL/link)
    let parsedLink = null
    if (link && typeof link === "string" && link.trim()) {
      const raw = link.trim()
      // Basic sanity check
      if (raw.length > 500) {
        return Response.json(
          { error: "Link cannot exceed 500 characters" },
          { status: 400 }
        )
      }
      parsedLink = raw
    }

    const now = new Date()
    const newItem = {
      userId: session.user.id,
      title: trimmedTitle,
      description: (description || "").trim(),
      category: trimmedCategory,
      priority: formattedPriority,
      targetDate: parsedTargetDate,
      targetAmount: parsedTargetAmount,
      savedAmount: parsedTargetAmount ? parsedSavedAmount : 0,
      link: parsedLink,
      isCompleted: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    const db = await getDb()
    const result = await db.collection("bucket_items").insertOne(newItem)

    return Response.json(
      { _id: result.insertedId, ...newItem },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating bucket list item:", error)
    return Response.json(
      { error: "Failed to create bucket list item" },
      { status: 500 }
    )
  }
}
