import { NextRequest, NextResponse } from "next/server";
import { signUpSchema } from "@/lib/zod";
import { saltAndHashPassword } from "@/lib/utils/password";
import { createUserInDb, isEmailAvailable, isUsernameAvailable } from "@/lib/utils/db";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Starting user registration process...");
    
    // Parse request body
    const body = await request.json();
    console.log("📧 Registration attempt for email:", body.email);

    // Validate input data
    const validatedData = signUpSchema.parse(body);
    const { username, email, password } = validatedData;

    // Check if email is available
    const emailAvailable = await isEmailAvailable(email);
    if (!emailAvailable) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Check if username is available
    const usernameAvailable = await isUsernameAvailable(username);
    if (!usernameAvailable) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    console.log("🔐 Hashing password...");
    // Hash the password
    const hashedPassword = await saltAndHashPassword(password);

    console.log("💾 Creating user in database...");
    // Create user in database
    const user = await createUserInDb({
      username,
      email,
      password: hashedPassword,
    });

    console.log("✅ User created successfully:", user.email);

    // Return success response (exclude password)
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration error:", error);

    if (error instanceof ZodError) {
      console.log("❌ Validation errors:", error.issues);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}