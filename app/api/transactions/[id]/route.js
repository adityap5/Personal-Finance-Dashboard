/**
 * GET    /api/transactions/[id]   — fetch a single transaction (must belong to user)
 * PUT    /api/transactions/[id]   — update a transaction
 * DELETE /api/transactions/[id]   — delete a transaction
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/** Helper: validate ObjectId and ownership */
async function getOwnedTransaction(id, userId) {
  if (!id || !ObjectId.isValid(id)) return { error: "Invalid ID", status: 400 }

  const db = await getDb()
  const transaction = await db
    .collection("transactions")
    .findOne({ _id: new ObjectId(id) })

  if (!transaction) return { error: "Transaction not found", status: 404 }
  if (transaction.userId !== userId) return { error: "Forbidden", status: 403 }

  return { transaction, db }
}

export async function GET(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { transaction, error, status } = await getOwnedTransaction(id, session.user.id)
  if (error) return Response.json({ error }, { status })

  return Response.json(transaction)
}

export async function PUT(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { transaction, db, error, status } = await getOwnedTransaction(id, session.user.id)
  if (error) return Response.json({ error }, { status })

  const { amount, description, category, type, date } = await request.json()

  if (!amount || !description || !category || !type || !date) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  await db.collection("transactions").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        amount: Number(amount),
        description,
        category,
        type,
        date: new Date(date),
        updatedAt: new Date(),
      },
    }
  )

  const updated = await db
    .collection("transactions")
    .findOne({ _id: new ObjectId(id) })

  return Response.json({ message: "Transaction updated successfully", transaction: updated })
}

export async function DELETE(request, { params }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { db, error, status } = await getOwnedTransaction(id, session.user.id)
  if (error) return Response.json({ error }, { status })

  const result = await db
    .collection("transactions")
    .deleteOne({ _id: new ObjectId(id) })

  if (result.deletedCount === 0) {
    return Response.json({ error: "Failed to delete" }, { status: 500 })
  }

  return Response.json({ message: "Transaction deleted successfully" })
}
