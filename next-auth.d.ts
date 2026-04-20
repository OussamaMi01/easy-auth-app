// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: boolean;
      totpEnabled: boolean;
      mfaPassed: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    emailVerified: boolean;
    totpEnabled: boolean;
    mfaPassed?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    emailVerified: boolean;
    totpEnabled: boolean;
    mfaPassed: boolean;
  }
}