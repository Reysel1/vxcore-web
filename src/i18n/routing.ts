import { defineRouting } from "next-intl/routing";

/**
 * Idiomas de la web. El español es el idioma por defecto y se sirve sin
 * prefijo (`/`, `/dashboard`, …); inglés y francés van prefijados (`/en`,
 * `/fr`). Así las URLs existentes no cambian.
 */
export const routing = defineRouting({
  locales: ["es", "en", "fr"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
