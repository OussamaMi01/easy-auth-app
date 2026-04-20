// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Redis client ─────────────────────────────────────────────────────────────

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/** Login: 10 attempts per 15 minutes per IP */
export const signinLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "rl:signin",
  analytics: true,
});

/** Registration: 5 accounts per hour per IP */
export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:signup",
  analytics: true,
});

/** Password reset: 3 requests per 15 minutes per IP */
export const resetPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  prefix: "rl:reset-password",
  analytics: true,
});

/** Email verification resend: 5 per 10 minutes per IP */
export const verifyEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:verify-email",
  analytics: true,
});

// ─── Result type ──────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// ─── checkRateLimit wrapper ───────────────────────────────────────────────────

/**
 * Usage:
 *   const result = await checkRateLimit(resetPasswordLimiter, ip);
 *   if (!result.success) return 429;
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, resetAt: reset };
}

// ─── IP helper ────────────────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}