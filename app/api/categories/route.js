/**
 * GET  /api/categories — Returns default system categories + user's custom categories.
 * POST /api/categories — Creates a user-scoped custom category with case-insensitive uniqueness.
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export const DEFAULT_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Rent",
  "Investment",
  "Salary",
  "Business",
  "Other",
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()
    const customDocs = await db
      .collection("categories")
      .find({ userId: session.user.id })
      .sort({ name: 1 })
      .toArray()

    const custom = customDocs.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      type: doc.type || "both",
      isCustom: true,
      createdAt: doc.createdAt,
    }))

    // Combined unique list with custom categories first
    const allNames = [
      ...custom.map((c) => c.name),
      ...DEFAULT_CATEGORIES.filter(
        (def) => !custom.some((c) => c.name.toLowerCase() === def.toLowerCase())
      ),
    ]

    return Response.json({
      defaults: DEFAULT_CATEGORIES,
      custom,
      allNames,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const rawName = body?.name?.trim()

    if (!rawName) {
      return Response.json({ error: "Category name is required" }, { status: 400 })
    }

    if (rawName.length > 40) {
      return Response.json({ error: "Category name must be 40 characters or less" }, { status: 400 })
    }

    const nameLower = rawName.toLowerCase()

    // 1. Check if name collides with default categories (case-insensitive)
    const matchesDefault = DEFAULT_CATEGORIES.some(
      (def) => def.toLowerCase() === nameLower
    )
    if (matchesDefault) {
      return Response.json(
        { error: `"${rawName}" is already a default category` },
        { status: 409 }
      )
    }

    const db = await getDb()

    // 2. Check if user already created this category
    const existing = await db.collection("categories").findOne({
      userId: session.user.id,
      nameLower,
    })

    if (existing) {
      return Response.json(
        { error: `You already have a category named "${existing.name}"` },
        { status: 409 }
      )
    }

    const newCategory = {
      userId: session.user.id,
      name: rawName,
      nameLower,
      type: body.type || "both",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newCategory)

    return Response.json(
      {
        _id: result.insertedId.toString(),
        name: rawName,
        isCustom: true,
        type: newCategory.type,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error.code === 11000) {
      return Response.json({ error: "Category already exists" }, { status: 409 })
    }
    console.error("Error creating category:", error)
    return Response.json({ error: "Failed to create category" }, { status: 500 })
  }
}
