/**
 * GET /api/export/transactions?month=YYYY-MM
 * Streams user's transactions as a CSV download.
 * Optional ?month= query param to filter by specific month.
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // e.g. "2025-01"

    const db = await getDb()

    // Build query — always filter by userId
    const query = { userId: session.user.id }

    if (month) {
      const [year, mon] = month.split("-").map(Number)
      query.date = {
        $gte: new Date(year, mon - 1, 1),
        $lt: new Date(year, mon, 1),
      }
    }

    const transactions = await db
      .collection("transactions")
      .find(query)
      .sort({ date: -1 })
      .toArray()

    // Build CSV
    const header = "Date,Type,Category,Description,Amount (INR)\n"
    const rows = transactions
      .map((t) => {
        const date = new Date(t.date).toLocaleDateString("en-IN")
        const desc = `"${(t.description || "").replace(/"/g, '""')}"` // escape quotes
        return `${date},${t.type},${t.category},${desc},${t.amount}`
      })
      .join("\n")

    const csv = header + rows

    const fileName = month
      ? `transactions-${month}.csv`
      : `transactions-all.csv`

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return Response.json({ error: "Failed to export transactions" }, { status: 500 })
  }
}
