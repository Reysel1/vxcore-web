import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { LEGAL_LINKS, LEGAL_UPDATED_AT } from "@/lib/site";

/**
 * Marco común de las páginas legales.
 *
 * Van fuera de la portada (que es una sola página con anclas) porque tienen que
 * ser enlazables por sí mismas: es lo que piden Stripe, las tiendas de apps y
 * cualquiera que quiera leerlas sin pasar por el resto del sitio.
 */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver
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
          Última actualización: {LEGAL_UPDATED_AT}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/85">
          {children}
        </div>

        <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-sm">
          {LEGAL_LINKS.map((link) => (
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

/** Sección con encabezado, para no repetir clases en cada apartado. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
