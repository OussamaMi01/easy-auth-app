// src/lib/totp/totp-actions.ts


"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import {
  generateTotpSecret,
  generateTotpUri,
  generateQrCodeDataUrl,
  verifyTotpCode,
  generateBackupCodes,
  hashBackupCodes,
  findMatchingBackupCode,
} from "@/lib/totp";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult {
  success?: boolean;
  error?: string;
}

interface SetupTotpResult extends ActionResult {
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Step 1 of TOTP setup — generate a secret and QR code.
 * Does NOT enable TOTP yet — user must verify a code first.
 */
export async function initTotpSetupAction(): Promise<SetupTotpResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    await connectDB();
    const user = await User.findById(userId).select("email totpEnabled");
    if (!user) return { error: "User not found." };
    if (user.totpEnabled) return { error: "TOTP is already enabled." };

    const secret = generateTotpSecret();
    const uri = generateTotpUri(secret, user.email);
    const qrCodeUrl = await generateQrCodeDataUrl(uri);

    // Store secret temporarily (not yet enabled — user must verify first)
    await User.findByIdAndUpdate(userId, {
      $set: { totpSecret: secret, totpEnabled: false },
    });

    return { success: true, secret, qrCodeUrl };
  } catch (error) {
    console.error("[totp] initTotpSetupAction:", error);
    return { error: "Failed to initialize TOTP setup." };
  }
}

/**
 * Step 2 of TOTP setup — verify the first code and activate TOTP.
 * Also generates and returns backup codes (shown once).
 */
export async function enableTotpAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<SetupTotpResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const code = (formData.get("code") as string | null)?.replace(/\s/g, "");
    if (!code || !/^\d{6}$/.test(code)) {
      return { error: "Please enter a valid 6-digit code." };
    }

    await connectDB();
    const user = await User.findById(userId).select(
      "totpSecret totpEnabled email"
    );
    if (!user) return { error: "User not found." };
    if (user.totpEnabled) return { error: "TOTP is already enabled." };
    if (!user.totpSecret) {
      return { error: "No TOTP setup in progress. Please start again." };
    }

    const isValid = verifyTotpCode(user.totpSecret, code);
    if (!isValid) {
      return { error: "Invalid code. Check your authenticator app and try again." };
    }

    // Generate backup codes
    const plainCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(plainCodes);

    await User.findByIdAndUpdate(userId, {
      $set: {
        totpEnabled: true,
        backupCodes: hashedCodes,
      },
    });

    revalidatePath("/", "layout");

    // Return plain codes — shown once, never stored in plain text
    return { success: true, backupCodes: plainCodes };
  } catch (error) {
    console.error("[totp] enableTotpAction:", error);
    return { error: "Failed to enable TOTP." };
  }
}

/**
 * Verify a TOTP code during the MFA challenge (post-login).
 * Sets mfaPassed=true in the session on success.
 */


export async function verifyTotpChallengeAction(
    
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const code = (formData.get("code") as string | null)?.replace(/\s/g, "");
    if (!code) return { error: "Please enter your authentication code." };

    await connectDB();
    const user = await User.findById(userId).select(
      "totpSecret totpEnabled backupCodes"
    );
    if (!user) return { error: "User not found." };
    if (!user.totpEnabled || !user.totpSecret) {
      return { error: "TOTP is not enabled on this account." };
    }

    // Try TOTP code first
    if (/^\d{6}$/.test(code)) {
      const isValid = verifyTotpCode(user.totpSecret, code);
      if (isValid) {
        revalidatePath("/", "layout");
        return { success: true };
      }
    }

    // Try backup code (format: XXXXX-XXXXX or XXXXXXXXXX)
    const backupIndex = await findMatchingBackupCode(code, user.backupCodes);
    if (backupIndex !== -1) {
      // Consume the backup code — remove it so it can't be reused
      const remaining = [...user.backupCodes];
      remaining.splice(backupIndex, 1);
      await User.findByIdAndUpdate(userId, {
        $set: { backupCodes: remaining },
      });
      revalidatePath("/", "layout");
      return { success: true };
    }

    return { error: "Invalid code. Try again or use a backup code." };
  } catch (error) {
    console.error("[totp] verifyTotpChallengeAction:", error);
    return { error: "Failed to verify code." };
  }
}

/**
 * Disable TOTP — requires current TOTP code as confirmation.
 */
export async function disableTotpAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const code = (formData.get("code") as string | null)?.replace(/\s/g, "");
    if (!code || !/^\d{6}$/.test(code)) {
      return { error: "Please enter your current 6-digit TOTP code to confirm." };
    }

    await connectDB();
    const user = await User.findById(userId).select("totpSecret totpEnabled");
    if (!user) return { error: "User not found." };
    if (!user.totpEnabled || !user.totpSecret) {
      return { error: "TOTP is not enabled." };
    }

    const isValid = verifyTotpCode(user.totpSecret, code);
    if (!isValid) return { error: "Invalid code. TOTP not disabled." };

    await User.findByIdAndUpdate(userId, {
      $set: { totpEnabled: false, backupCodes: [] },
      $unset: { totpSecret: "" },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[totp] disableTotpAction:", error);
    return { error: "Failed to disable TOTP." };
  }
}

/**
 * Regenerate backup codes — requires current TOTP code.
 */
export async function regenerateBackupCodesAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<SetupTotpResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const code = (formData.get("code") as string | null)?.replace(/\s/g, "");
    if (!code || !/^\d{6}$/.test(code)) {
      return { error: "Please enter your current 6-digit TOTP code to confirm." };
    }

    await connectDB();
    const user = await User.findById(userId).select("totpSecret totpEnabled");
    if (!user) return { error: "User not found." };
    if (!user.totpEnabled || !user.totpSecret) {
      return { error: "TOTP is not enabled." };
    }

    const isValid = verifyTotpCode(user.totpSecret, code);
    if (!isValid) return { error: "Invalid code." };

    const plainCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(plainCodes);

    await User.findByIdAndUpdate(userId, {
      $set: { backupCodes: hashedCodes },
    });

    return { success: true, backupCodes: plainCodes };
  } catch (error) {
    console.error("[totp] regenerateBackupCodesAction:", error);
    return { error: "Failed to regenerate backup codes." };
  }
}