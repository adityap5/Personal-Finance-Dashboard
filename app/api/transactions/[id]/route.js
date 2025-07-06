import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect()
  }
  return client.db("finance")
}

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid or missing transaction ID" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(id) })

    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 })
    }

    return Response.json(transaction)
  } catch (error) {
    return Response.json({ error: "Failed to fetch transaction: " + error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid or missing transaction ID" }, { status: 400 })
    }

    const { amount, description, category, type, date } = await request.json()

    if (!amount || !description || !category || !type || !date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("transactions")

    const existingTransaction = await collection.findOne({ _id: new ObjectId(id) })

    if (!existingTransaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 })
    }

    const result = await collection.updateOne(
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

    const updatedTransaction = await collection.findOne({ _id: new ObjectId(id) })

    return Response.json({
      message: "Transaction updated successfully",
      modifiedCount: result.modifiedCount,
      transaction: updatedTransaction,
    })
  } catch (error) {
    return Response.json({ error: "Failed to update transaction: " + error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid or missing transaction ID" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const collection = db.collection("transactions")

    const existingTransaction = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingTransaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 })
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: "Failed to delete transaction" }, { status: 500 })
    }

    return Response.json({
      message: "Transaction deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    return Response.json({ error: "Failed to delete transaction: " + error.message }, { status: 500 })
  }
}
