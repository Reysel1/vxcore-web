import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Detecta el idioma por cookie (NEXT_LOCALE) o Accept-Language y enruta a la
 * ruta con el prefijo correspondiente. Las rutas de API, los archivos
 * estáticos y las imágenes de Open Graph / Twitter quedan fuera.
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Excluye api, _next, _vercel, archivos con extensión (robots.txt,
    // sitemap.xml, favicon.ico…) y las rutas generadas por
    // opengraph-image.tsx / twitter-image.tsx (no llevan extensión).
    "/((?!api|_next|_vercel|.*\\..*|opengraph-image|twitter-image).*)",
  ],
};
