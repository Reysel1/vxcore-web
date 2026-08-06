import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { URANTIX_STORE_URL } from "@/lib/site";

const COLUMNS = [
  {
    title: "Producto",
    links: ["Consola RCON", "Logs globales", "Agente IA", "Editor", "Automatizaciones"],
  },
  {
    title: "Tienda",
    links: ["Marketplace", "Recursos", "Scripts", "Configuraciones", "Soporte"],
  },
  {
    title: "Recursos",
    links: ["Documentación", "Guías de inicio", "API", "Comunidad", "Estado"],
  },
  {
    title: "Legal",
    links: ["Privacidad", "Términos", "Seguridad", "DPA"],
  },
];

function SocialIcon({ name }: { name: "github" | "x" | "linkedin" | "youtube" }) {
  const paths: Record<string, React.ReactNode> = {
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </>
    ),
    x: (
      <path d="M4 4l7.2 9.6L4.4 20h2.2l5.6-5.4L16.8 20H20l-7.5-10L19.3 4h-2.2l-5.1 4.9L8.2 4H4z" />
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    youtube: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      {paths[name]}
    </svg>
  );
}

export function Footer() {
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
              El sistema operativo de tu servidor FXServer. Gestiona, monitoriza
              y automatiza desde un solo panel.
            </p>
            <a
              href={URANTIX_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita la tienda de Urantix (se abre en una pestaña nueva)"
              className="group mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Visita la tienda de Urantix
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="mt-6 flex gap-2">
              {(["github", "x", "linkedin", "youtube"] as const).map((name) => (
                <a
                  key={name}
                  href={URANTIX_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground dark:bg-white/[0.03]"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VXCore · Un producto de Urantix. Todos
            los derechos reservados.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            Hecho con <span className="text-rose-500">❤️</span> para la
            comunidad FiveM
          </p>
        </div>
      </div>
    </footer>
  );
}
