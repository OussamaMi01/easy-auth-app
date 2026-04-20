// src/app/sitemap.ts
import { type MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only include publicly indexable routes — never auth or dashboard pages
  const routes = ["/"].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }));

  return routes;
}