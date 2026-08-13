export const URANTIX_STORE_URL = "https://urantix.com/";

/** URL pública. Base de los canonical, del sitemap y de las imágenes de Open Graph. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ??
  "https://vxcore.reylab.cloud";

export const SITE_NAME = "VXCore";

/**
 * Ruta localizada para un idioma. El español (idioma por defecto) no lleva
 * prefijo; inglés y francés van prefijados (`/en`, `/fr`).
 */
export function localizedPath(locale: string, path: string): string {
  return locale === "es" ? path : `/${locale}${path}`;
}

/**
 * Objeto `alternates` para generateMetadata: canonical (del idioma actual) +
 * hreflang de los tres idiomas para una misma ruta.
 */
export function localizedAlternates(locale: string, path: string) {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      es: localizedPath("es", path),
      en: localizedPath("en", path),
      fr: localizedPath("fr", path),
    },
  };
}

export const SOCIAL_LINKS = [
  { name: "X", href: "https://x.com/vxcorex", icon: "x" },
  { name: "YouTube", href: "https://youtube.com/@VxCorex", icon: "youtube" },
  { name: "Instagram", href: "https://www.instagram.com/vxcorex/", icon: "instagram" },
  { name: "TikTok", href: "https://www.tiktok.com/@vxcorexx", icon: "tiktok" },
] as const;

export type SocialIconName = (typeof SOCIAL_LINKS)[number]["icon"];

/**
 * Rutas legales. Las etiquetas visibles viven en los mensajes de i18n
 * (`legal.nav`), aquí solo queda el orden y el href.
 */
export const LEGAL_ROUTES = [
  { href: "/terminos" },
  { href: "/privacidad" },
  { href: "/cookies" },
] as const;
