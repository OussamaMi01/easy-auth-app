// src/lib/verification-codes.ts
export function generateVerificationCode(): string {
  // Generate 8-digit code (matching what your UI expects)
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}