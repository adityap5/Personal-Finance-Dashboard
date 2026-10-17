/**
 * GET    /api/bucket-list/[id] — fetch single bucket item (scoped to user)
 * PUT    /api/bucket-list/[id] — update bucket item (fields or completion toggle)
 * DELETE /api/bucket-list/[id] — delete bucket item (scoped to user)
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const VALID_PRIORITIES = ["Low", "Medium", "High"]

/** Helper: validate ObjectId and user ownership */
async function getOwnedBucketItem(id, userId) {
  if (!id || !ObjectId.isValid(id)) {
    return { error: "Invalid item ID", status: 400 }
  }

  const db = await getDb()
  const item = await db
    .collection("bucket_items")
    .findOne({ _id: new ObjectId(id) })

  if (!item) {
    return { error: "Bucket list item not found", status: 404 }
  }

  if (item.userId !== userId) {
    return { error: "Forbidden", status: 403 }
  }

  return { item, db }
}

export async function GET(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { item, error, status } = await getOwnedBucketItem(id, session.user.id)
  if (error) return Response.json({ error }, { status })

  return Response.json(item)
}

export async function PUT(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { item, db, error, status } = await getOwnedBucketItem(
    id,
    session.user.id
  )
  if (error) return Response.json({ error }, { status })

  try {
    const body = await request.json()
    const updateDoc = { updatedAt: new Date() }

    // 1. Title
    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return Response.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        )
      }
      if (body.title.trim().length > 200) {
        return Response.json(
          { error: "Title cannot exceed 200 characters" },
          { status: 400 }
        )
      }
      updateDoc.title = body.title.trim()
    }

    // 2. Description
    if (body.description !== undefined) {
      updateDoc.description = (body.description || "").trim()
    }

    // 3. Category
    if (body.category !== undefined) {
      updateDoc.category = (body.category || "Personal").trim()
    }

    // 4. Priority
    if (body.priority !== undefined) {
      const formatted =
        VALID_PRIORITIES.find(
          (p) => p.toLowerCase() === (body.priority || "").trim().toLowerCase()
        ) || "Medium"
      updateDoc.priority = formatted
    }

    // 5. Target Date
    if (body.targetDate !== undefined) {
      if (body.targetDate === null || body.targetDate === "") {
        updateDoc.targetDate = null
      } else {
        const d = new Date(body.targetDate)
        if (isNaN(d.getTime())) {
          return Response.json(
            { error: "Invalid target date format" },
            { status: 400 }
          )
        }
        updateDoc.targetDate = d
      }
    }

    // 6. Target Amount
    if (body.targetAmount !== undefined) {
      if (body.targetAmount === null || body.targetAmount === "") {
        updateDoc.targetAmount = null
        updateDoc.savedAmount = 0
      } else {
        const val = parseFloat(body.targetAmount)
        if (isNaN(val) || val <= 0) {
          return Response.json(
            { error: "Target amount must be a positive number" },
            { status: 400 }
          )
        }
        updateDoc.targetAmount = val
      }
    }

    // 7. Saved Amount
    if (body.savedAmount !== undefined) {
      const val = parseFloat(body.savedAmount)
      if (isNaN(val) || val < 0) {
        return Response.json(
          { error: "Saved amount cannot be negative" },
          { status: 400 }
        )
      }
      updateDoc.savedAmount = val
    }

    // 8. Link
    if (body.link !== undefined) {
      if (body.link === null || body.link === "") {
        updateDoc.link = null
      } else {
        const raw = String(body.link).trim()
        if (raw.length > 500) {
          return Response.json(
            { error: "Link cannot exceed 500 characters" },
            { status: 400 }
          )
        }
        updateDoc.link = raw
      }
    }

    // 9. Completion status toggle & timestamp
    if (body.isCompleted !== undefined) {
      const isCompleted = Boolean(body.isCompleted)
      updateDoc.isCompleted = isCompleted
      if (isCompleted) {
        // Only set completedAt if not already set, or refresh if transitioning to complete
        updateDoc.completedAt = item.completedAt || new Date()
      } else {
        updateDoc.completedAt = null
      }
    }

    await db.collection("bucket_items").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    )

    const updatedItem = await db
      .collection("bucket_items")
      .findOne({ _id: new ObjectId(id) })

    return Response.json({
      message: "Item updated successfully",
      item: updatedItem,
    })
  } catch (error) {
    console.error("Error updating bucket list item:", error)
    return Response.json(
      { error: "Failed to update bucket list item" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { db, error, status } = await getOwnedBucketItem(id, session.user.id)
  if (error) return Response.json({ error }, { status })

  try {
    const result = await db
      .collection("bucket_items")
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: "Failed to delete" }, { status: 500 })
    }

    return Response.json({ message: "Bucket item deleted successfully" })
  } catch (error) {
    console.error("Error deleting bucket list item:", error)
    return Response.json(
      { error: "Failed to delete bucket list item" },
      { status: 500 }
    )
  }
}
