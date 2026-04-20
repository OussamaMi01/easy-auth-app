// src/app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/server/db";
import { PasswordResetToken } from "@/server/db/model";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    await connectDB();
    
    const resetToken = await PasswordResetToken.findOne({
      _id: token,
      expiresAt: { $gt: new Date() },
    });

    return NextResponse.json(
      { valid: !!resetToken },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}