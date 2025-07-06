import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect()
  }
  return client.db("finance")
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).toArray()

    return Response.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, description, category, type, date } = body

    if (!amount || !description || !category || !type || !date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const transaction = {
      amount: Number.parseFloat(amount),
      description,
      category,
      type,
      date: new Date(date),
      createdAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return Response.json(
      {
        _id: result.insertedId,
        ...transaction,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating transaction:", error)
    return Response.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
