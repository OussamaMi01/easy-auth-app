// src/lib/auth-options.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import { compare } from "bcryptjs";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import { env } from "@/env";

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
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
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: AdapterUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: { mfaPassed?: boolean };
    }) {
      // ── Initial sign-in ────────────────────────────────────────────────────
      if (user) {
        token.id = user.id;
        token.email = user.email  ?? token.email;
        token.name = user.name ?? null;
        token.emailVerified =
          (user as AdapterUser & { emailVerified?: boolean }).emailVerified ?? false;
        token.totpEnabled =
          (user as AdapterUser & { totpEnabled?: boolean }).totpEnabled ?? false;
        token.picture = user.image;
        token.mfaPassed = false; // always reset on new sign-in
        return token;
      }

      // ── updateSession({ mfaPassed: true }) from client ────────────────────
      if (trigger === "update" && session?.mfaPassed === true) {
        token.mfaPassed = true;
        return token; // return early — skip DB re-read
      }

      // ── Subsequent requests — sync DB fields ───────────────────────────────
      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id)
            .select("emailVerified totpEnabled")
            .lean();
          if (dbUser) {
            token.emailVerified =
              (dbUser as { emailVerified?: boolean }).emailVerified ?? false;
            token.totpEnabled =
              (dbUser as { totpEnabled?: boolean }).totpEnabled ?? false;
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
        session.user.name = (token.name as string | null) ?? null;
        session.user.emailVerified = Boolean(token.emailVerified);
        session.user.totpEnabled = Boolean(token.totpEnabled);
        session.user.mfaPassed = Boolean(token.mfaPassed);
        session.user.image = (token.picture as string | null) ?? null;
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