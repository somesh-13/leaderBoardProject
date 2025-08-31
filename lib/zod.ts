import { object, string } from "zod";

export const signInSchema = object({
  email: string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});

export const signUpSchema = object({
  username: string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: string({ message: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: string({ message: "Please confirm your password" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type inference from schemas
export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};