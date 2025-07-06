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
    const budgets = await db.collection("budgets").find({}).sort({ month: -1 }).toArray()

    return Response.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return Response.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { category, amount, month } = body

    if (!category || !amount || !month) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return Response.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const db = await connectToDatabase()

    const existingBudget = await db.collection("budgets").findOne({ category, month })

    if (existingBudget) {
      const result = await db.collection("budgets").updateOne(
        { category, month },
        {
          $set: {
            amount: Number.parseFloat(amount),
            updatedAt: new Date(),
          },
        },
      )

      return Response.json({
        message: "Budget updated successfully",
        _id: existingBudget._id,
        category,
        amount: Number.parseFloat(amount),
        month,
      })
    } else {
      const budget = {
        category,
        amount: Number.parseFloat(amount),
        month,
        createdAt: new Date(),
      }

      const result = await db.collection("budgets").insertOne(budget)

      return Response.json(
        {
          _id: result.insertedId,
          ...budget,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error creating/updating budget:", error)
    return Response.json({ error: "Failed to save budget" }, { status: 500 })
  }
}
