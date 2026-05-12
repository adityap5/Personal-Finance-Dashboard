/**
 * POST /api/auth/register
 * Creates a new user account with hashed password.
 */
import { hash } from "bcryptjs"
import { getDb } from "@/lib/mongodb"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // --- Validation ---
    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 })
    }

    const db = await getDb()
    const normalizedEmail = email.toLowerCase().trim()

    // Check for existing user
    const existingUser = await db
      .collection("users")
      .findOne({ email: normalizedEmail })

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password (12 salt rounds — good balance of security vs speed)
    const hashedPassword = await hash(password, 12)

    const user = {
      name: name.trim(),
      email: normalizedEmail,
      hashedPassword,
      createdAt: new Date(),
    }

    const result = await db.collection("users").insertOne(user)

    // Return user data (never return hashedPassword)
    return Response.json(
      {
        id: result.insertedId.toString(),
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ error: "Failed to create account" }, { status: 500 })
  }
}
