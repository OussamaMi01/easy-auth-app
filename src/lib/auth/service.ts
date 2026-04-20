// src/lib/auth/service.ts
import { hash, compare } from "bcryptjs";
import { getServerSession } from "@/lib/auth";
import { signIn, signOut } from "next-auth/react";
import { sendMail, EmailTemplate } from "@/lib/email";
import { env } from "@/env";

// Import your database models
import { connectDB } from "@/server/db";
import { User, EmailVerificationCode, PasswordResetToken } from "@/server/db/model";

/**
 * Utility: normalize emails (lowercase + trim)
 */
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Utility: create or refresh email verification code (one active per user)
 */
async function createEmailVerificationCode(userId: string, email: string) {
  await EmailVerificationCode.deleteMany({ userId });
  
  // Generate 8-digit numeric code
  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  await EmailVerificationCode.create({
    userId,
    email,
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });
  
  return code;
}

/**
 * Utility: create/replace password reset token (single active per user)
 */
async function createPasswordResetToken(userId: string) {
  await PasswordResetToken.deleteMany({ userId });
  
  // Generate random token
  const tokenId = [...Array(40)].map(() => Math.random().toString(36)[2]).join('');
  
  await PasswordResetToken.create({
    _id: tokenId,
    userId,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  });
  
  return tokenId;
}

/**
 * Check if a date is within expiration
 */
function isWithinExpirationDate(date: Date) {
  return date.getTime() > Date.now();
}

export const authService = {
  /**
   * Signup: create user and send verification code
   */
  async signup({ email, password }: { email: string; password: string }) {
    await connectDB();

    const safeEmail = normalizeEmail(email);

    const existing = await User.findOne({ email: safeEmail }).select({ _id: 1 }).lean();
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await hash(password, 12);

    const user = await User.create({
      _id: crypto.randomUUID(), // Generate a UUID
      email: safeEmail,
      hashedPassword,
      emailVerified: false,
    });

    const code = await createEmailVerificationCode(user._id.toString(), safeEmail);
    await sendMail(safeEmail, EmailTemplate.EmailVerification, { code });

    return { userId: user._id.toString(), email: safeEmail };
  },

  /**
   * Login: verify credentials (returns session via NextAuth)
   */
  async login({ email, password }: { email: string; password: string }) {
    await connectDB();

    const safeEmail = normalizeEmail(email);

    const user = await User.findOne({ email: safeEmail }).lean();
    if (!user || !user.hashedPassword) {
      throw new Error("Incorrect email or password.");
    }

    const ok = await compare(password, user.hashedPassword);
    if (!ok) {
      throw new Error("Incorrect email or password.");
    }

    // NextAuth will handle session creation
    // We'll just return the user info
    return {
      userId: user._id.toString(),
      email: user.email,
      emailVerified: !!user.emailVerified,
    };
  },

  /**
   * Logout: invalidate current session
   */
  async logout() {
    await signOut({ redirect: false });
    return { success: true };
  },

  /**
   * Resend verification email: rate-limited by code TTL
   */
  async resendVerification() {
    await connectDB();

    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      throw new Error("Unauthorized.");
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) {
      throw new Error("Email not found in session.");
    }

    // Fetch existing code; if not expired yet, ask to wait
    const last = await EmailVerificationCode.findOne({ userId })
      .select({ expiresAt: 1 })
      .lean();

    if (last && isWithinExpirationDate(last.expiresAt)) {
      const ms = last.expiresAt.getTime() - Date.now();
      const minutes = Math.max(0, Math.floor(ms / 1000 / 60));
      const seconds = Math.max(0, Math.floor(ms / 1000) % 60);
      throw new Error(`Please wait ${minutes}m ${seconds}s before requesting a new code.`);
    }

    const code = await createEmailVerificationCode(userId, userEmail);
    await sendMail(userEmail, EmailTemplate.EmailVerification, { code });

    return { success: true };
  },

  /**
   * Verify email: mark verified
   */
  async verifyEmail({ code }: { code: string }) {
    await connectDB();

    const session = await getServerSession();
    if (!session || !session.user || !session.user.id || !session.user.email) {
      throw new Error("Unauthorized.");
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Atomically fetch & delete the code for this user
    const record = await EmailVerificationCode.findOneAndDelete({ userId }).lean();
    if (!record || record.code !== code) {
      throw new Error("Invalid verification code.");
    }
    if (!isWithinExpirationDate(record.expiresAt)) {
      throw new Error("Verification code has expired.");
    }
    if (record.email !== userEmail) {
      throw new Error("Verification code does not match your email.");
    }

    // Update user as verified
    await User.updateOne({ _id: userId }, { $set: { emailVerified: true } });

    return { success: true };
  },

  /**
   * Send password reset link: allowed only for verified users
   */
  async sendPasswordReset({ email }: { email: string }) {
    await connectDB();

    const safeEmail = normalizeEmail(email);
    const user = await User.findOne({ email: safeEmail }).lean();

    // To avoid account enumeration, keep response generic
    if (!user || !user.emailVerified) {
      return { success: true };
    }

    const token = await createPasswordResetToken(user._id.toString());
    const link = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

    await sendMail(user.email, EmailTemplate.PasswordReset, { link });

    return { success: true };
  },

  /**
   * Reset password using token
   */
  async resetPassword({ token, password }: { token: string; password: string }) {
    await connectDB();

    // Atomically fetch & delete token
    const record = await PasswordResetToken.findOneAndDelete({ _id: token }).lean();
    if (!record) {
      throw new Error("Invalid password reset link.");
    }
    if (!isWithinExpirationDate(record.expiresAt)) {
      throw new Error("Password reset link has expired.");
    }

    // Change password
    const hashed = await hash(password, 12);
    await User.updateOne(
      { _id: record.userId }, 
      { $set: { hashedPassword: hashed } }
    );

    return { success: true };
  },

  /**
   * Get current authenticated user
   */
  async whoami() {
    const session = await getServerSession();
    if (!session || !session.user) {
      throw new Error("Unauthorized.");
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    
    if (!user) {
      throw new Error("User not found.");
    }

    // Cast to any to access potentially missing fields
    const userObj = user as any;
    
    return {
      id: user._id.toString(),
      email: user.email,
      emailVerified: !!user.emailVerified,
      name: userObj.name || null,
      createdAt: userObj.createdAt || new Date(),
      updatedAt: userObj.updatedAt || new Date(),
    };
  },
};