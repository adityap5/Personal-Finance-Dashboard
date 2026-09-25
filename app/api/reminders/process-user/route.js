/**
 * POST /api/reminders/process-user
 *
 * Authenticated user-scoped manual trigger to process due reminders
 * for the currently logged-in user only.
 */
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { processDueReminders } from "@/lib/reminder-engine"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = await getDb()
    const stats = await processDueReminders({
      db,
      userId: session.user.id,
    })

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...stats,
    })
  } catch (error) {
    console.error("User reminder processing failed:", error)
    return Response.json(
      { error: "Failed to process due reminders", message: error.message },
      { status: 500 }
    )
  }
}
