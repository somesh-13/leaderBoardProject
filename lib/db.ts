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

if (process.env.NODE_ENV === "development") {
  // Retain client between HMR reloads in development
  let globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
}

export default client;

// Helper function to get database
export function getDatabase() {
  return client.db();
}

// Helper function to get users collection
export function getUsersCollection() {
  return getDatabase().collection("users");
}