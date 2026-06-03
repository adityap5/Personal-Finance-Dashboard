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
    ...authConfig.providers,
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

        if (!user || !user.hashedPassword) return null

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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const db = await getDb()
          const email = user.email?.toLowerCase().trim()
          if (!email) return false

          const existingUser = await db.collection("users").findOne({ email })

          if (existingUser) {
            // Link Google account to existing user if not already linked
            if (!existingUser.googleId) {
              await db.collection("users").updateOne(
                { _id: existingUser._id },
                { $set: { googleId: account.providerAccountId } }
              )
            }
          } else {
            // Create a new user for Google Sign-In
            const newUser = {
              name: user.name || profile?.name || "Google User",
              email: email,
              googleId: account.providerAccountId,
              createdAt: new Date(),
            }
            await db.collection("users").insertOne(newUser)
          }
          return true
        } catch (error) {
          console.error("Error in Google signIn callback:", error)
          return false
        }
      }
      return true
    },
    // Persist user.id into the JWT
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const db = await getDb()
          const dbUser = await db
            .collection("users")
            .findOne({ email: user.email?.toLowerCase().trim() })
          if (dbUser) {
            token.id = dbUser._id.toString()
          }
        } else {
          token.id = user.id
        }
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
