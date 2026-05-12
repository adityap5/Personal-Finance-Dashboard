/**
 * auth.js — Full auth configuration with Node.js runtime.
 * Used only in API routes and server components (never in middleware).
 * Imports bcrypt and mongodb — NOT edge-compatible.
 */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import authConfig from "@/lib/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const db = await getDb()
        const user = await db
          .collection("users")
          .findOne({ email: String(credentials.email).toLowerCase().trim() })

        if (!user) return null

        const isPasswordValid = await compare(
          String(credentials.password),
          user.hashedPassword
        )
        if (!isPasswordValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    // Persist user.id into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    // Expose user.id on the session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
  },
})
