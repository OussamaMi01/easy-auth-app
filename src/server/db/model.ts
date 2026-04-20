// src/server/db/model.ts
import mongoose, { Schema, Types, type Model } from "mongoose";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  hashedPassword?: string;
  emailVerified: boolean;
  image?: string;
  // TOTP / MFA fields
  totpSecret?: string;       // encrypted TOTP secret (base32)
  totpEnabled: boolean;      // whether TOTP is active and verified
  backupCodes: string[];     // bcrypt-hashed one-time backup codes
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    hashedPassword: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    // TOTP fields — select: false so they never leak into session/API responses
    totpSecret: { type: String, select: false },
    totpEnabled: { type: Boolean, default: false },
    backupCodes: { type: [String], default: [], select: false },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

// ─── Email Verification Code ──────────────────────────────────────────────────

export interface IEmailVerificationCode {
  userId: string;
  email: string;
  code: string;
  expiresAt: Date;
}

const EmailVerificationCodeSchema = new Schema<IEmailVerificationCode>(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // TTL — MongoDB auto-deletes expired docs
    },
  },
  { timestamps: true }
);

export const EmailVerificationCode: Model<IEmailVerificationCode> =
  (mongoose.models.EmailVerificationCode as Model<IEmailVerificationCode>) ||
  mongoose.model<IEmailVerificationCode>(
    "EmailVerificationCode",
    EmailVerificationCodeSchema
  );

// ─── Password Reset Token ─────────────────────────────────────────────────────

export interface IPasswordResetToken {
  _id: string;
  userId: string;
  expiresAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },
  },
  { timestamps: true }
);

export const PasswordResetToken: Model<IPasswordResetToken> =
  (mongoose.models.PasswordResetToken as Model<IPasswordResetToken>) ||
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  );