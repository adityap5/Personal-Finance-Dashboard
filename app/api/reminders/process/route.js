/**
 * GET/POST /api/reminders/process
 *
 * Protected serverless cron endpoint for automatic transaction generation.
 * Triggered automatically by Vercel Cron on a daily schedule.
 *
 * Security:
 * Requires valid CRON_SECRET via Authorization header or Vercel Cron header.
 */
import { getDb } from "@/lib/mongodb"
import { processDueReminders } from "@/lib/reminder-engine"

function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET

  // 1. Check for standard Vercel Cron header
  const isVercelCron = request.headers.get("x-vercel-cron") === "1"
  if (isVercelCron) return true

  // 2. If CRON_SECRET is configured, check Authorization Bearer
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      if (token === cronSecret) return true
    }

    // Also support ?secret= query parameter for manual testing
    const { searchParams } = new URL(request.url)
    if (searchParams.get("secret") === cronSecret) return true

    return false
  }

  // In development, if CRON_SECRET is not yet set, allow for testing
  if (process.env.NODE_ENV === "development") {
    return true
  }

  return false
}

export async function GET(request) {
  return handleProcess(request)
}

export async function POST(request) {
  return handleProcess(request)
}

async function handleProcess(request) {
  if (!isAuthorized(request)) {
    return Response.json(
      { error: "Unauthorized: Invalid or missing cron credentials" },
      { status: 401 }
    )
  }

  try {
    const db = await getDb()
    const stats = await processDueReminders({ db })

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...stats,
    })
  } catch (error) {
    console.error("Cron processing failed:", error)
    return Response.json(
      { error: "Internal processing error", message: error.message },
      { status: 500 }
    )
  }
}
