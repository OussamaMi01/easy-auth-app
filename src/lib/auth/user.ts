// src/lib/auth/user.ts
import { mongoClientPromise } from "@/server/db/mongo-client";

export type User = {
  id: string;
  email: string;
  name?: string;
  password?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const client = await mongoClientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email });
    
    return user ? {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      password: user.password,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  const client = await mongoClientPromise;
  const db = client.db();
  const now = new Date();
  
  const result = await db.collection("users").insertOne({
    ...userData,
    createdAt: now,
    updatedAt: now,
  });
  
  return {
    id: result.insertedId.toString(),
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
}