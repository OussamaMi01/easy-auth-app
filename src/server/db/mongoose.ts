// src/server/db/mongoose.ts
import mongoose from "mongoose";
import { env } from "@/env";

const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

export async function connectMongoose() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URL, {
      // bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}