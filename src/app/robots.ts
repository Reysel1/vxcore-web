import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel y las rutas de API no aportan nada en buscadores: el panel
      // exige sesión y la API devuelve JSON. Con el prefijo de idioma, el
      // panel también vive en /es/dashboard, /en/dashboard y /fr/dashboard.
      disallow: [
        "/api/",
        "/dashboard",
        "/*/dashboard",
        "/dashboard/",
        "/*/dashboard/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
