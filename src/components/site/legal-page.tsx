import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/site/logo";
import { InlineText } from "@/components/site/inline-text";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "note"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "table";
      head: string[];
      rows: { name: string; purpose: string; duration: string }[];
    };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "note") {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
        <InlineText text={block.text} />
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="list-disc space-y-1.5 pl-5">
        {block.items.map((item) => (
          <li key={item}>
            <InlineText text={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {block.head.map((h) => (
                <th key={h} className="py-2 pr-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.name} className="border-b border-border/50">
                <td className="py-3 pr-4 align-top font-mono text-xs">
                  {row.name}
                </td>
                <td className="py-3 pr-4 align-top text-muted-foreground">
                  {row.purpose}
                </td>
                <td className="py-3 align-top text-muted-foreground">
                  {row.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <p>
      <InlineText text={block.text} />
    </p>
  );
}

/**
 * Marco común de las páginas legales.
 *
 * Van fuera de la portada (que es una sola página con anclas) porque tienen que
 * ser enlazables por sí mismas: es lo que piden Stripe, las tiendas de apps y
 * cualquiera que quiera leerlas sin pasar por el resto del sitio.
 */
export async function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  const t = await getTranslations("legal");
  const common = await getTranslations("common");
  const nav = t.raw("nav") as Record<"terms" | "privacy" | "cookies", string>;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {common("back")}
          </Link>
          <Logo />
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("updated", { date: t("updatedAt") })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {section.heading}
              </h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-sm">
          {(
            [
              { href: "/terminos", label: nav.terms },
              { href: "/privacidad", label: nav.privacy },
              { href: "/cookies", label: nav.cookies },
            ] as const
          ).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
