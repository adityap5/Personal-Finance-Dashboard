/**
 * PUT    /api/categories/[id] — Rename a user's custom category.
 * DELETE /api/categories/[id] — Delete a user's custom category (historical transactions retain their category).
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { DEFAULT_CATEGORIES } from "../route"

export async function PUT(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const newName = body?.name?.trim()

    if (!newName) {
      return Response.json({ error: "Category name is required" }, { status: 400 })
    }

    if (newName.length > 40) {
      return Response.json({ error: "Category name must be 40 characters or less" }, { status: 400 })
    }

    const nameLower = newName.toLowerCase()

    if (DEFAULT_CATEGORIES.some((def) => def.toLowerCase() === nameLower)) {
      return Response.json(
        { error: `"${newName}" is a default category` },
        { status: 409 }
      )
    }

    const db = await getDb()

    // 1. Verify ownership of target category
    const categoryDoc = await db.collection("categories").findOne({
      _id: new ObjectId(id),
    })

    if (!categoryDoc) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    if (categoryDoc.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Check if another category with newName already exists for this user
    const collision = await db.collection("categories").findOne({
      userId: session.user.id,
      nameLower,
      _id: { $ne: new ObjectId(id) },
    })

    if (collision) {
      return Response.json(
        { error: `You already have another category named "${collision.name}"` },
        { status: 409 }
      )
    }

    await db.collection("categories").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: newName,
          nameLower,
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({
      message: "Category updated successfully",
      category: { _id: id, name: newName, isCustom: true },
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return Response.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 })
  }

  try {
    const db = await getDb()

    const categoryDoc = await db.collection("categories").findOne({
      _id: new ObjectId(id),
    })

    if (!categoryDoc) {
      return Response.json({ error: "Category not found" }, { status: 404 })
    }

    if (categoryDoc.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.collection("categories").deleteOne({ _id: new ObjectId(id) })

    return Response.json({
      message: "Category deleted successfully",
      deletedId: id,
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return Response.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
