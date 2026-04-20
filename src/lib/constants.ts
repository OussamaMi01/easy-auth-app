
export const EMAIL_SENDER = '"Easy Auth App" <oussama.missaoui.it@gmail.com>';
export const APP_TITLE = "AuthApp";
export const APP_DESCRIPTION = "A modern authentication application";
export const Paths = {
  Home: "/",
  Dashboard: "/dashboard",
  Login: "/auth/signin",
  Signup: "/auth/signup",
  VerifyEmail: "/auth/verify-email",
  ForgotPassword: "/auth/forgot-password",
  ResetPassword: "/auth/reset-password",
  SetupTOTP: "/auth/setup-totp",
  MfaChallenge: "/auth/mfa-challenge",
} as const;
