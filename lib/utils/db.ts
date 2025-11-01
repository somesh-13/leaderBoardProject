import { getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// User interface for database operations
export interface User {
  _id?: ObjectId | string;
  id?: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  role: 'user' | 'admin';
  lastLogin?: Date;
  emailVerified?: boolean;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string; // Should be hashed before calling this function
}

/**
 * Get user from database by email
 * @param email - User's email address
 * @returns Promise<User | null>
 */
export async function getUserFromDb(email: string): Promise<User | null> {
  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ email: email.toLowerCase() });
    
    if (!user) return null;

    // Convert MongoDB _id to string for NextAuth compatibility
    return {
      ...user,
      id: user._id.toString(),
    } as User;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
}

/**
 * Get user from database by username
 * @param username - User's username
 * @returns Promise<User | null>
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    
    if (!user) return null;

    return {
      ...user,
      id: user._id.toString(),
    } as User;
  } catch (error) {
    console.error('Error fetching user by username from database:', error);
    return null;
  }
}

/**
 * Get user from database by ID
 * @param id - User's ID
 * @returns Promise<User | null>
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(id) });
    
    if (!user) return null;

    return {
      ...user,
      id: user._id.toString(),
    } as User;
  } catch (error) {
    console.error('Error fetching user by ID from database:', error);
    return null;
  }
}

/**
 * Create a new user in the database
 * @param userData - User data to create
 * @returns Promise<User>
 */
export async function createUserInDb(userData: CreateUserInput): Promise<User> {
  try {
    const users = await getUsersCollection();

    // Check if user already exists
    const existingUser = await getUserFromDb(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const now = new Date();
    const newUser = {
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: userData.password, // Should already be hashed
      createdAt: now,
      updatedAt: now,
      isActive: true,
      role: 'user' as const,
      emailVerified: false,
    };

    const result = await users.insertOne(newUser);
    
    return {
      ...newUser,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    } as User;
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 * @param userId - User's ID
 * @returns Promise<boolean>
 */
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  try {
    const users = await getUsersCollection();
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user last login:', error);
    return false;
  }
}

/**
 * Update user's email verification status
 * @param userId - User's ID
 * @param verified - Verification status
 * @returns Promise<boolean>
 */
export async function updateUserEmailVerification(userId: string, verified: boolean): Promise<boolean> {
  try {
    const users = await getUsersCollection();
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          emailVerified: verified,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating user email verification:', error);
    return false;
  }
}

/**
 * Check if email is available
 * @param email - Email to check
 * @returns Promise<boolean>
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  try {
    const user = await getUserFromDb(email);
    return !user;
  } catch (error) {
    console.error('Error checking email availability:', error);
    return false;
  }
}

/**
 * Check if username is available
 * @param username - Username to check
 * @returns Promise<boolean>
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const user = await getUserByUsername(username);
    return !user;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

/**
 * Get user stats for admin dashboard
 * @returns Promise<object>
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
}> {
  try {
    const users = await getUsersCollection();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, activeUsers, newUsersThisMonth, verifiedUsers] = await Promise.all([
      users.countDocuments({}),
      users.countDocuments({ isActive: true }),
      users.countDocuments({ createdAt: { $gte: monthStart } }),
      users.countDocuments({ emailVerified: true })
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      verifiedUsers
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      verifiedUsers: 0
    };
  }
}