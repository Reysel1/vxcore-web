"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const DOC_ROUTES = [
  { href: "/docs", key: "gettingStarted" },
  { href: "/docs/requisitos", key: "requirements" },
  { href: "/docs/instalacion", key: "installation" },
  { href: "/docs/bot-discord", key: "discordBot" },
];

export function DocsSidebar({ horizontal = false }: { horizontal?: boolean }) {
  const t = useTranslations("docs.nav");
  const pathname = usePathname();

  if (horizontal) {
    return (
      <nav aria-label={t("label")} className="flex w-max gap-1">
        {DOC_ROUTES.map((route) => {
          const active =
            route.href === "/docs"
              ? pathname === route.href
              : pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(route.key as never)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-1">
      <span className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <BookOpen className="size-3.5" />
        {t("label")}
      </span>
      {DOC_ROUTES.map((route) => {
        const active =
          route.href === "/docs"
            ? pathname === route.href
            : pathname.startsWith(route.href);
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t(route.key as never)}
          </Link>
        );
      })}
    </nav>
  );
}
