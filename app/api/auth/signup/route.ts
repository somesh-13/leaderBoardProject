import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { name, email, password } = validatedData

    // Connect to database
    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const now = new Date()
    const userDoc = {
      name,
      email,
      password: hashedPassword,
      emailVerified: null, // Will be set when email is verified
      image: null,
      createdAt: now,
      updatedAt: now
    }

    const result = await users.insertOne(userDoc)

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: email,
        name: name
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the signup if email fails
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully! Please sign in.',
        userId: result.insertedId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}