/**
 * middleware.js — Edge-compatible route protection.
 * Only imports auth.config.js (zero Node.js deps).
 */
import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Logic handled inside authConfig.callbacks.authorized
})

export const config = {
  // Only run middleware on dashboard, login, signup — NOT on homepage /
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
}
