import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./lib/db";
import { signInSchema } from "./lib/zod";
import { saltAndHashPassword, verifyPassword } from "./lib/utils/password";
import { getUserFromDb, createUserInDb, updateUserLastLogin } from "./lib/utils/db";
import { ZodError } from "zod";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(client),
  session: {
    strategy: "jwt", // Use JWT tokens for better performance with credentials provider
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          console.log("🔐 Starting authentication process...");
          
          // Parse and validate credentials
          const { email, password } = await signInSchema.parseAsync(credentials);
          console.log(`📧 Attempting to authenticate user: ${email}`);

          // Check if user exists in database
          let user = await getUserFromDb(email);
          
          if (!user) {
            console.log("❌ User not found in database");
            return null;
          }

          // Verify password
          console.log("🔍 Verifying password...");
          const isPasswordValid = await verifyPassword(password, user.password);
          
          if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return null;
          }

          // Update last login
          await updateUserLastLogin(user.id || user._id?.toString() || '');

          console.log("✅ Authentication successful");
          
          // Return user object for NextAuth (exclude sensitive data)
          return {
            id: user.id || user._id?.toString() || '',
            email: user.email,
            name: user.username,
            username: user.username,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("❌ Authentication error:", error);
          
          if (error instanceof ZodError) {
            console.log("❌ Validation error:", error.issues);
          }
          
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.emailVerified = Boolean(user.emailVerified);
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session object
      if (token) {
        session.user.id = token.sub || '';
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/leaderboard`;
    },
  },
  events: {
    async signIn(message) {
      console.log(`🎉 User signed in: ${message.user.email}`);
    },
    async signOut(message) {
      console.log(`👋 User signed out: ${message.token?.email || 'Unknown'}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// NextAuth instance for server-side usage
export default NextAuth(authOptions);

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: string;
      emailVerified: boolean;
    };
  }

  interface User {
    username?: string;
    role?: string;
    emailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: string;
    emailVerified?: boolean;
  }
}