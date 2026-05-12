/**
 * Protected dashboard page.
 * Server component — verifies session server-side before rendering.
 */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard"

export const metadata = {
  title: "Dashboard — Personal Finance",
  description: "Manage your finances, track expenses and budgets",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <Dashboard user={session.user} />
}
