// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { User, PasswordResetToken } from "@/server/db/model";
import { env } from "@/env";
import { sendMail, EmailTemplate } from "@/lib/email";
import { checkRateLimit, getClientIp, resetPasswordLimiter } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(resetPasswordLimiter, ip); // ← now async

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: true, message: "If an account exists, a reset link will be sent." },
        { status: 200 }
      );
    }

    await PasswordResetToken.deleteMany({ userId: user._id.toString() });

    const token = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.create({
      _id: token,
      userId: user._id.toString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;
    await sendMail(normalizedEmail, EmailTemplate.PasswordReset, { link: resetLink });

    return NextResponse.json({ success: true, message: "Password reset link sent." }, { status: 200 });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}