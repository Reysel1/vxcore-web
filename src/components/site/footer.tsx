import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/site/logo";
import { Link } from "@/i18n/navigation";
import {
  LEGAL_ROUTES,
  SOCIAL_LINKS,
  URANTIX_STORE_URL,
  type SocialIconName,
} from "@/lib/site";

/**
 * Iconos de marca. X y TikTok van rellenos (`fill`) porque sus logos son
 * siluetas macizas; YouTube e Instagram funcionan mejor trazados.
 */
function SocialIcon({ name }: { name: SocialIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    className: "size-4",
  } as const;

  if (name === "x") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.96 6.82H1.66l7.73-8.83L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.11z" />
      </svg>
    );
  }

  if (name === "tiktok") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.7a5.67 5.67 0 0 0-.77-.05A5.65 5.65 0 1 0 15.54 15.3V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48z" />
      </svg>
    );
  }

  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;

  if (name === "youtube") {
    return (
      <svg {...common} {...strokeProps}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    );
  }

  return (
    <svg {...common} {...strokeProps}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const legal = await getTranslations("legal.nav");
  const columns = t.raw("columns") as {
    title: string;
    links: string[];
  }[];

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-muted/30">
      {/* Top hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
      />
      {/* Giant watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      >
        <div className="text-gradient mx-auto w-fit translate-y-8 text-[clamp(6rem,18vw,16rem)] font-heading font-semibold leading-none tracking-tight opacity-[0.05]">
          VXCore
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
            <a
              href={URANTIX_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("storeAria")}
              className="group mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {t("visitStore")}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="mt-6 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("socialAria", { name: social.name })}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground dark:bg-white/[0.03]"
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col, colIndex) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link, linkIndex) => (
                    <li key={link}>
                      {/* La primera entrada de "Recursos" (Documentación) es la
                          única del pie que lleva a una página real. */}
                      {colIndex === 2 && linkIndex === 0 ? (
                        <Link
                          href="/docs"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </Link>
                      ) : (
                        <a
                          href="#top"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Legal va aparte: son las únicas del pie que llevan a páginas
                reales, no a anclas de la propia portada. */}
            <div>
              <h4 className="text-sm font-semibold">{t("legal")}</h4>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_ROUTES.map((route) => (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {route.href === "/terminos"
                        ? legal("terms")
                        : route.href === "/privacidad"
                          ? legal("privacy")
                          : legal("cookies")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
