// src/lib/totp/index.ts
import "server-only";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { hash, compare } from "bcryptjs";
import { APP_TITLE } from "@/lib/constants";

const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const TOTP_ALGORITHM = "SHA1";
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 10;

// ─── Secret ───────────────────────────────────────────────────────────────────

/**
 * Generate a new random TOTP secret (base32 encoded).
 */
export function generateTotpSecret(): string {
  const totp = new OTPAuth.TOTP({
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
  });
  return totp.secret.base32;
}

/**
 * Generate an otpauth:// URI for QR code display.
 */
export function generateTotpUri(secret: string, email: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: APP_TITLE,
    label: email,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.toString();
}

/**
 * Generate a base64 QR code data URL from a TOTP URI.
 */
export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Verify a TOTP code against a secret.
 * Accepts ±1 window (30s grace period) to handle clock skew.
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

// ─── Backup Codes ─────────────────────────────────────────────────────────────

/**
 * Generate N random backup codes (plain text — show once to user).
 */
export function generateBackupCodes(): string[] {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    Array.from(
      { length: BACKUP_CODE_LENGTH },
      () => chars[Math.floor(Math.random() * chars.length)]
    )
      .join("")
      // Format as XXXXX-XXXXX for readability
      .replace(/^(.{5})/, "$1-")
  );
}

/**
 * Hash backup codes for storage (bcrypt, cost 10).
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => hash(code.replace("-", ""), 10)));
}

/**
 * Check if a plain backup code matches any stored hash.
 * Returns the index of the matched code (for removal) or -1.
 */
export async function findMatchingBackupCode(
  plain: string,
  hashed: string[]
): Promise<number> {
  const normalized = plain.replace(/[-\s]/g, "").toUpperCase();
  for (let i = 0; i < hashed.length; i++) {
    const match = await compare(normalized, hashed[i]!);
    if (match) return i;
  }
  return -1;
}