export const URANTIX_STORE_URL = "https://urantix.com/";

/** URL pública. Base de los canonical, del sitemap y de las imágenes de Open Graph. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  "https://vxcore.reylab.cloud";

export const SITE_NAME = "VXCore";

export const SOCIAL_LINKS = [
  { name: "X", href: "https://x.com/vxcorex", icon: "x" },
  { name: "YouTube", href: "https://youtube.com/@VxCorex", icon: "youtube" },
  { name: "Instagram", href: "https://www.instagram.com/vxcorex/", icon: "instagram" },
  { name: "TikTok", href: "https://www.tiktok.com/@vxcorexx", icon: "tiktok" },
] as const;

export type SocialIconName = (typeof SOCIAL_LINKS)[number]["icon"];

export const LEGAL_LINKS = [
  { label: "Términos", href: "/terminos" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Cookies", href: "/cookies" },
] as const;

/**
 * Fecha de la última revisión de los textos legales. Se muestra en las páginas
 * y hay que actualizarla cuando cambie el contenido.
 */
export const LEGAL_UPDATED_AT = "7 de agosto de 2026";
