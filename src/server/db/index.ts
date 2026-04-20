import mongoose from "mongoose";
import { env } from "@/env";

const MONGODB_URL = env.MONGODB_URL;

// Prevent multiple connections in dev / hot reload
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.mongooseGlobal ?? { conn: null, promise: null };
global.mongooseGlobal = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      // These are safe defaults; Mongoose 6+ uses them by default
      // bufferCommands: false, // optional: fail fast if not connected
      // autoIndex: false,      // recommended for production performance
      // serverSelectionTimeoutMS: 5000, // optional
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Optional exports if you want direct access
export const db = mongoose.connection;