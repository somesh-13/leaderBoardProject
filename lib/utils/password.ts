import bcrypt from "bcryptjs";

/**
 * Hash a password with salt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function saltAndHashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher salt rounds for better security
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random password (for testing or temporary passwords)
 * @param length - Length of password (default: 12)
 * @returns string - Random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Check password strength
 * @param password - Password to check
 * @returns object with strength info
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  // Complexity checks
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score++;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&*)');
  } else {
    score++;
  }

  // Common password check (basic)
  const commonPasswords = ['password', '123456', 'password123', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('Avoid common passwords');
    score = Math.max(0, score - 2);
  }

  return {
    score: Math.min(4, score),
    feedback,
    isValid: score >= 3 && password.length >= 8
  };
}