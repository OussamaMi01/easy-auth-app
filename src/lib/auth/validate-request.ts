// src/lib/auth/validate-request.ts
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";

export async function validateRequest() {
  try {
    const session = await getServerSession(authOptions);

    return {
      user: session?.user
        ? {
            id: session.user.id ?? "",
            email: session.user.email ?? "",
            name: session.user.name ?? "",
            emailVerified: session.user.emailVerified ?? false,
          }
        : null,
      session: session ? { id: "nextauth-session" } : null,
    };
  } catch (error) {
    console.error("validateRequest error:", error);
    return { user: null, session: null };
  }
}