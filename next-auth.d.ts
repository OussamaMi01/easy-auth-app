// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: boolean;
      totpEnabled: boolean;
      mfaPassed: boolean;
      // Google OAuth specific fields
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    emailVerified: boolean;
    totpEnabled: boolean;
    // Google OAuth specific fields
    image?: string | null;
  }

  // Add Google Profile type
  interface Profile {
    picture?: string;
    email_verified?: boolean;
    locale?: string;
    given_name?: string;
    family_name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    emailVerified: boolean;
    totpEnabled: boolean;
    mfaPassed: boolean;
    // Google OAuth specific fields
    picture?: string | null;
  }
}

// Add Google Provider specific types
declare module "next-auth/providers/google" {
  interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
    email_verified: boolean;
    locale: string;
    given_name: string;
    family_name: string;
  }
}