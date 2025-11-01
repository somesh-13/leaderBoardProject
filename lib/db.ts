// lib/db.ts
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Missing "MONGODB_URI" env variable');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (process.env.NODE_ENV === "development") {
  // Retain client between HMR reloads in development
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoClientPromise?: Promise<MongoClient> | null;
  };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
  clientPromise = globalWithMongo._mongoClientPromise || null;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
}

export default client;

// Connect to MongoDB and return connected client
export async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (!clientPromise) {
    clientPromise = client.connect();
    if (process.env.NODE_ENV === "development") {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient> | null;
      };
      globalWithMongo._mongoClientPromise = clientPromise;
    }
  }

  try {
    cachedClient = await clientPromise;
    console.log('✅ MongoDB connected successfully');
    return cachedClient;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    clientPromise = null; // Reset promise so next call will retry
    throw error;
  }
}

// Helper function to get database (async now to ensure connection)
export async function getDatabase() {
  const connectedClient = await connectToDatabase();
  return connectedClient.db();
}

// Helper function to get users collection (async)
export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection("users");
}