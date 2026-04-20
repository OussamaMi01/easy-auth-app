// src/lib/email/templates/reset-password.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export interface ResetPasswordTemplateProps {
  link: string;
}

export const ResetPasswordTemplate = ({ link }: ResetPasswordTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your {APP_TITLE} password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={text}>Hi,</Text>
            <Text style={text}>
              Someone recently requested a password change for your {APP_TITLE}{" "}
              account. If this was you, click the button below to set a new password:
            </Text>

            {/*
              Bulletproof email button — table-based so it renders correctly
              in Gmail, Outlook, Apple Mail, and all major clients.
              @react-email Button has display:block issues in some clients.
            */}
            <Section style={btnSection}>
              <Link href={link} style={btnLink}>
                Reset password
              </Link>
            </Section>

           

            <Text style={text}>
              If you didn&apos;t request this, you can safely ignore this email.
              Your password won&apos;t change.
            </Text>
            <Text style={text}>
              To keep your account secure, don&apos;t forward this email to anyone.
            </Text>
            <Text style={text}>Have a nice day!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300" as const,
  color: "#404040",
  lineHeight: "26px",
};

const title = {
  ...text,
  fontSize: "22px",
  fontWeight: "700" as const,
  lineHeight: "32px",
};

// Button rendered as a padded inline-block link —
// more reliable than display:block across email clients
const btnSection = {
  textAlign: "left" as const,
  margin: "24px 0",
};

const btnLink = {
  backgroundColor: "#09090b",
  borderRadius: "6px",
  color: "#fafafa",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  fontSize: "15px",
  fontWeight: "500" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  // MSO (Outlook) fallback
  msoHide: "none" as const,
};

const fallback = {
  ...text,
  fontSize: "12px",
  color: "#888888",
  marginTop: "8px",
};

const fallbackLink = {
  color: "#6366f1",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};