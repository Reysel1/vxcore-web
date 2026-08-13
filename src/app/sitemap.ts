import type { MetadataRoute } from "next";

import { SITE_URL, localizedPath } from "@/lib/site";

const LOCALES = ["es", "en", "fr"] as const;

const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/docs/instalacion", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/requisitos", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/bot-discord", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      entries.push({
        url: `${SITE_URL}${localizedPath(locale, route.path)}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  return entries;
}
