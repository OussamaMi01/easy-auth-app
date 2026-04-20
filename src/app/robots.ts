// src/app/robots.ts
import { type MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        // Block all private/auth routes from indexing
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/signin",
          "/signup",
          "/verify-email",
          "/setup-totp",
          "/mfa-challenge",
          "/reset-password",
          "/forgot-password",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}