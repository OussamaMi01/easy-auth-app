// src/lib/email/index.ts
import "server-only";

import { EmailVerificationTemplate } from "./templates/email-verification";
import { ResetPasswordTemplate } from "./templates/reset-password";
import { render } from "@react-email/render";
import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";
import { createTransport } from "nodemailer";
import type { ComponentProps } from "react";
import { logger } from "../logger";
import nodemailer from "nodemailer";

export enum EmailTemplate {
  EmailVerification = "EmailVerification",
  PasswordReset = "PasswordReset",
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<typeof EmailVerificationTemplate>;
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>;
};

const getEmailTemplate = <T extends EmailTemplate>(
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: "Verify your email address",
        body: render(
          <EmailVerificationTemplate
            {...(props as PropsMap[EmailTemplate.EmailVerification])}
          />,
        ),
      };
    case EmailTemplate.PasswordReset:
      return {
        subject: "Reset your password",
        body: render(
          <ResetPasswordTemplate
            {...(props as PropsMap[EmailTemplate.PasswordReset])}
          />,
        ),
      };
    default:
      throw new Error(`Invalid email template: ${template}`);
  }
};

// ── Gmail-correct transporter ─────────────────────────────────────────────────
// Port 587 → secure: false + requireTLS: true  (STARTTLS)
// Port 465 → secure: true                      (SSL — alternative)
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true only for port 465, false for 587
  requireTLS: env.SMTP_PORT !== 465, // force STARTTLS on port 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid/self-signed certs in development
    rejectUnauthorized: env.NODE_ENV === "production",
  },
});

// Verify connection on startup so misconfiguration is caught early
transporter.verify((error) => {
  if (error) {
    console.error("[email] SMTP connection failed:", error.message);
    console.error("[email] Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and that you are using a Gmail App Password.");
  } else {
  }
});

export const sendMail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  // TEMPORARY DEBUG
  
  if (env.MOCK_SEND_EMAIL) {
    
    logger.info(
      `[email:mock] Template="${template}" To="${to}" Props=${JSON.stringify(props)}`,
    );
    return;
  }

  const { subject, body } = getEmailTemplate(template, props);

  try {
    const info = await transporter.sendMail({
      from: EMAIL_SENDER,
      to,
      subject,
      html: body,
    });
    return info;
  } catch (error) {
    // Log the full error so you can see exactly what Gmail rejects
    console.error(`[email] Failed to send to=${to}:`, error);
    throw error;
  }
};

export async function sendVerificationEmail(to: string, code: string) {
  await sendMail(to, EmailTemplate.EmailVerification, { code });
}