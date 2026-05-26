// src/lib/auth-options.ts
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { compare } from "bcryptjs";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import { env } from "@/env";
import { ObjectId } from "mongodb";

// Define types for Google OAuth
interface GoogleProfile {
  picture?: string;
  email_verified?: boolean;
  name?: string;
  email?: string;
}

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.toLowerCase().trim();
          const password = credentials?.password;
          if (!email || !password) return null;

          await connectDB();
          const user = await User.findOne({ email }).select("+hashedPassword");
          if (!user || !user.hashedPassword) return null;

          const isValid = await compare(password, user.hashedPassword);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? null,
            emailVerified: user.emailVerified ?? false,
            totpEnabled: user.totpEnabled ?? false,
            image: user.image ?? null,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Add signIn callback with proper typing (matching your existing pattern)
    async signIn({ user, account, profile }: { user: any; account: any; profile: GoogleProfile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            await User.updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  emailVerified: true,
                  image: profile?.picture ?? user.image,
                  name: user.name ?? existingUser.name,
                }
              }
            );
            user.id = existingUser._id.toString();
            // Preserve existing totpEnabled setting
            user.totpEnabled = existingUser.totpEnabled ?? false;
          } else {
            const newObjectId = new ObjectId();
            await User.create({
              _id: newObjectId.toString(),
              email: user.email,
              name: user.name,
              emailVerified: true,
              totpEnabled: false,
              image: profile?.picture,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            user.id = newObjectId.toString();
            user.totpEnabled = false;
          }
          // Also set totpEnabled on the user object for the JWT callback
      if (user.totpEnabled === undefined) {
        user.totpEnabled = false;
      }
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({
      token,
      user,
      account,
      trigger,
      session,
    }: {
      token: JWT;
      user?: AdapterUser;
      account?: { provider: string };
      trigger?: "signIn" | "signUp" | "update";
      session?: { mfaPassed?: boolean };
    }) {
      // ── Initial sign-in ────────────────────────────────────────────────────
      if (user) {
        let userId = user.id;
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        if (!isValidObjectId && account?.provider === "google") {
          // For Google users, ensure we have a valid ObjectId
          const existingUser = await User.findOne({ email: user.email });
          if (existingUser) {
            userId = existingUser._id.toString();
          } else {
            userId = new ObjectId().toString();
          }
        }

        token.id = userId;
        token.email = user.email ?? token.email;
        token.name = user.name ?? null;
        token.emailVerified = (user as any).emailVerified ?? false;
        token.totpEnabled = (user as any).totpEnabled ?? false;
        token.picture = user.image;
        token.mfaPassed = false;

        if (account?.provider === "google") {
          token.emailVerified = true;
        }

        return token;
      }

      // ── updateSession({ mfaPassed: true }) from client ────────────────────
      if (trigger === "update" && session?.mfaPassed === true) {
        token.mfaPassed = true;
        return token;
      }

      // ── Subsequent requests — sync DB fields ───────────────────────────────
      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id)
            .select("emailVerified totpEnabled")
            .lean();
          if (dbUser) {
            token.emailVerified = dbUser.emailVerified ?? false;
            token.totpEnabled = dbUser.totpEnabled ?? false;
          }
        } catch (error) {
          console.error("[auth] jwt DB error:", error);
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.emailVerified = Boolean(token.emailVerified);
        session.user.totpEnabled = Boolean(token.totpEnabled);
        session.user.mfaPassed = Boolean(token.mfaPassed);
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
    verifyRequest: "/verify-email",
  },
};