// src/lib/auth/email-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User, EmailVerificationCode } from "@/server/db/model";
import { sendVerificationEmail } from "@/lib/email";
import type { Session } from "next-auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult {
  success?: boolean;
  error?: string;
}

// Extend Session type to match your custom fields set in auth-options callbacks
interface AuthSession extends Session {
  user: Session["user"] & {
    id: string;
    emailVerified: boolean;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) return null;
  return session as AuthSession;
}

async function generateVerificationCode(
  userId: string,
  email: string
): Promise<string> {
  // 8-digit numeric code
  const code = Math.floor(10_000_000 + Math.random() * 90_000_000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Atomic replace — delete old codes then insert new one
  await EmailVerificationCode.deleteMany({ userId });
  await EmailVerificationCode.create({ userId, email, code, expiresAt });

  return code;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Resend a verification code to the signed-in user's email.
 */
export async function sendVerificationEmailAction(
  _prevState: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
 try {
    const session = await getAuthSession();
    
    if (!session) {
      return { error: "You must be signed in to resend a verification email." };
    }
    
    const { id: userId, email } = session.user;
    
    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return { error: "User not found." };
    if (user.emailVerified) return { error: "Email is already verified." };

    // Enforce cooldown — only one active code at a time
    const existing = await EmailVerificationCode.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      const secsLeft = Math.ceil(
        (existing.expiresAt.getTime() - Date.now()) / 1000
      );
      const m = Math.floor(secsLeft / 60);
      const s = secsLeft % 60;
      return {
        error: `Please wait ${m}m ${s}s before requesting a new code.`,
      };
    }

    const code = await generateVerificationCode(userId, email!);
    await sendVerificationEmail(email!, code);

    return { success: true };
  } catch (error) {
    console.error("[email-actions] sendVerificationEmailAction:", error);
    return { error: "Failed to send verification email. Please try again." };
  }
}

/**
 * Verify the submitted code against the stored one.
 */
export async function verifyEmailAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getAuthSession();
    if (!session) {
      return { error: "You must be signed in to verify your email." };
    }

    const code = (formData.get("code") as string | null)?.trim();
    if (!code || code.length !== 8 || !/^\d{8}$/.test(code)) {
      return { error: "Please enter a valid 8-digit code." };
    }

    const { id: userId, email } = session.user;

    await connectDB();

    // findOneAndDelete is atomic — prevents double-use of the same code
    const record = await EmailVerificationCode.findOneAndDelete({
      userId,
      code,
    });

    if (!record) return { error: "Invalid verification code." };

    // Expiry check (do this AFTER deletion so an expired code can't be reused)
    if (record.expiresAt < new Date()) {
      return { error: "Verification code has expired. Please request a new one." };
    }

    if (record.email !== email) {
      return { error: "This code does not match your email address." };
    }

    await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } });

    // Revalidate layout so server components re-read the updated session
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("[email-actions] verifyEmailAction:", error);
    return { error: "Failed to verify email. Please try again." };
  }
}

/**
 * Called server-side right after registration — sends the first code.
 */
export async function sendInitialVerificationEmail(
  userId: string,
  email: string
): Promise<void> {
  await connectDB();
  const code = await generateVerificationCode(userId, email);
  await sendVerificationEmail(email, code);
  // No plaintext code in logs — just a success marker
}