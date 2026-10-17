/**
 * Protected Bucket List page.
 * Server component — verifies session server-side before rendering.
 */
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import BucketListPageView from "@/components/bucket-list-page-view"

export const metadata = {
  title: "My Bucket List — FinanceIQ",
  description: "Turn your plans into achievements. Track your life goals and aspirations.",
}

export default async function BucketListPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return <BucketListPageView user={session.user} />
}
