// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import { hash } from "bcryptjs";
import { checkRateLimit, getClientIp, signupLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(signupLimiter, ip); // ← now async

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many accounts created. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const { name, email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    if (!/[A-Z]/.test(password))
      return NextResponse.json({ error: "Password must contain an uppercase letter." }, { status: 400 });
    if (!/\d/.test(password))
      return NextResponse.json({ error: "Password must contain a number." }, { status: 400 });
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return NextResponse.json({ error: "Password must contain a special character." }, { status: 400 });

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const hashedPassword = await hash(password, 12);
    await User.create({
      name: name?.trim() || undefined,
      email: normalizedEmail,
      hashedPassword,
      emailVerified: false,
      totpEnabled: false,
    });

    return NextResponse.json({ success: true, message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}