// src/lib/auth.ts
import { getServerSession as _getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import type { Session } from "next-auth";

export async function getServerSession(
  // ✅ Cast to any to avoid the dual Session type conflict caused by
  // the local next-auth folder shadowing node_modules/next-auth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any = authOptions
): Promise<Session | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (_getServerSession as any)(options);
  } catch (error) {
    console.error("[auth] getServerSession error:", error);
    return null;
  }
}

export { authOptions } from "./auth-options";
export { signIn, signOut } from "next-auth/react";
export type { Session } from "next-auth";