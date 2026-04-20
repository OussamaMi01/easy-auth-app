// src/lib/user/user-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/server/db";
import { User } from "@/server/db/model";
import { hash, compare } from "bcryptjs";
import { env } from "@/env";

interface ActionResult {
  success?: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

// ─── Update Name ──────────────────────────────────────────────────────────────

export async function updateNameAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const name = (formData.get("name") as string | null)?.trim();
    if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };
    if (name.length > 64) return { error: "Name must be under 64 characters." };

    await connectDB();
    await User.findByIdAndUpdate(userId, { $set: { name } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[user-actions] updateNameAction:", error);
    return { error: "Failed to update name." };
  }
}

// ─── Update Email ─────────────────────────────────────────────────────────────

export async function updateEmailAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const email = (formData.get("email") as string | null)?.trim().toLowerCase();
    if (!email || !email.includes("@")) return { error: "Please enter a valid email address." };

    await connectDB();

    const existing = await User.findOne({ email, _id: { $ne: userId } }).lean();
    if (existing) return { error: "That email is already in use." };

    await User.findByIdAndUpdate(userId, {
      $set: { email, emailVerified: false },
    });

    // Send re-verification email
    try {
      const { sendInitialVerificationEmail } = await import("@/lib/auth/email-actions");
      await sendInitialVerificationEmail(userId, email);
    } catch (emailError) {
      console.error("[user-actions] re-verification email failed:", emailError);
      // Don't fail the whole action — email can be resent manually
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[user-actions] updateEmailAction:", error);
    return { error: "Failed to update email." };
  }
}

// ─── Update Avatar (Cloudinary) ───────────────────────────────────────────────

export async function updateAvatarAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const file = formData.get("avatar") as File | null;
    if (!file || file.size === 0) return { error: "No file provided." };

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { error: "Image must be under 2MB." };
    }

    // Upload to Cloudinary via unsigned upload API
    // No SDK needed — plain fetch to the upload endpoint
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", env.CLOUDINARY_UPLOAD_PRESET);
    uploadData.append("folder", "avatars");
    // Use userId as public_id so re-uploads overwrite the old one
    uploadData.append("public_id", `avatar_${userId}`);

    const res = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[user-actions] Cloudinary upload error:", err);
      return { error: "Failed to upload image. Please try again." };
    }

    const result = await res.json();
    // Use the secure URL with auto format/quality transformation
    const imageUrl: string = result.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_200,h_200,c_fill/"
    );

    await connectDB();
    await User.findByIdAndUpdate(userId, { $set: { image: imageUrl } });

    revalidatePath("/", "layout");
    return { success: true, data: { imageUrl } };
  } catch (error) {
    console.error("[user-actions] updateAvatarAction:", error);
    return { error: "Failed to upload avatar." };
  }
}

// ─── Remove Avatar ────────────────────────────────────────────────────────────

export async function removeAvatarAction(
  _prev: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    await connectDB();
    await User.findByIdAndUpdate(userId, { $unset: { image: "" } });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[user-actions] removeAvatarAction:", error);
    return { error: "Failed to remove avatar." };
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const current = formData.get("currentPassword") as string | null;
    const next = formData.get("newPassword") as string | null;
    const confirm = formData.get("confirmPassword") as string | null;

    if (!current || !next || !confirm) return { error: "All fields are required." };
    if (next !== confirm) return { error: "New passwords don't match." };
    if (next.length < 8) return { error: "Password must be at least 8 characters." };
    if (!/[A-Z]/.test(next)) return { error: "Password must contain an uppercase letter." };
    if (!/\d/.test(next)) return { error: "Password must contain a number." };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(next)) return { error: "Password must contain a special character." };

    await connectDB();
    const user = await User.findById(userId).select("+hashedPassword");
    if (!user || !user.hashedPassword) return { error: "User not found." };

    const isValid = await compare(current, user.hashedPassword);
    if (!isValid) return { error: "Current password is incorrect." };

    const hashedPassword = await hash(next, 12);
    await User.findByIdAndUpdate(userId, { $set: { hashedPassword } });

    return { success: true };
  } catch (error) {
    console.error("[user-actions] changePasswordAction:", error);
    return { error: "Failed to change password." };
  }
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function deleteAccountAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    const confirmation = (formData.get("confirmation") as string | null)?.trim();
    if (confirmation !== "DELETE") {
      return { error: 'Type "DELETE" to confirm account deletion.' };
    }

    const password = formData.get("password") as string | null;
    if (!password) return { error: "Password is required to delete your account." };

    await connectDB();
    const user = await User.findById(userId).select("+hashedPassword");
    if (!user || !user.hashedPassword) return { error: "User not found." };

    const isValid = await compare(password, user.hashedPassword);
    if (!isValid) return { error: "Incorrect password." };

    await User.findByIdAndDelete(userId);
    return { success: true };
  } catch (error) {
    console.error("[user-actions] deleteAccountAction:", error);
    return { error: "Failed to delete account." };
  }
}

// ─── Get Account Data ─────────────────────────────────────────────────────────

export async function getAccountDataAction(): Promise<ActionResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { error: "Not authenticated." };

    await connectDB();
    const user = await User.findById(userId)
      .select("-hashedPassword -totpSecret -backupCodes")
      .lean();

    if (!user) return { error: "User not found." };

    return {
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        totpEnabled: user.totpEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error) {
    console.error("[user-actions] getAccountDataAction:", error);
    return { error: "Failed to retrieve account data." };
  }
}