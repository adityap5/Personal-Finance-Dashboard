/** @type {import("next-auth").NextAuthConfig} */
const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnLogin = nextUrl.pathname === "/login"
      const isOnSignup = nextUrl.pathname === "/signup"

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // redirect to /login
      }
      if ((isOnLogin || isOnSignup) && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
}

export default authConfig
