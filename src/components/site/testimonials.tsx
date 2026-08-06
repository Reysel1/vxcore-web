import { Quote, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";

const TESTIMONIALS = [
  {
    quote:
      "La consola RCON por web me cambió la vida. Puedo gestionar el servidor desde el móvil cuando estoy fuera, sin abrir nada más.",
    name: "Dani",
    role: "Owner · Proyecto Roleplay",
    initials: "DN",
  },
  {
    quote:
      "El agente me explicó por qué un recurso crasheaba a las 3 de la mañana. Lo arreglé en cinco minutos. Vale por sí solo el precio.",
    name: "Marcos",
    role: "Desarrollador · SCRIPTS",
    initials: "MC",
  },
  {
    quote:
      "Los logs filtrables y el histórico en disco son una pasada. Por fin sé qué pasa en mi servidor sin mirar archivos a mano.",
    name: "Laura",
    role: "Admin · Comunidad RP",
    initials: "LR",
  },
  {
    quote:
      "Instalé UrantixDealership desde el marketplace en dos clics. Antes eso era una tarde entera de FTP y configuraciones.",
    name: "Álex",
    role: "Owner · Servidor FiveM",
    initials: "AX",
  },
  {
    quote:
      "La automatización de reinicios nos quitó un trabajo de todas las noches. El servidor responde solo cuando algo se cuelga.",
    name: "Sofía",
    role: "DevOps · Roleplay urbano",
    initials: "SF",
  },
  {
    quote:
      "Nada se escribe en producción sin tu permiso y siempre hay copia. Es la primera herramienta que usan de verdad en todo el equipo.",
    name: "Javi",
    role: "Líder de desarrollo · Urantix",
    initials: "JV",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5 fill-current drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative border-y border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonios"
          title={
            <>
              La gente que mantiene servidores{" "}
              <span className="text-gradient">nos entiende</span>
            </>
          }
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card
              key={t.name}
              className="group relative h-full overflow-hidden transition-colors duration-300 hover:ring-foreground/20"
            >
              <Quote
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-2 size-20 rotate-12 text-foreground/[0.06] transition-colors duration-500 group-hover:text-foreground/10"
              />

              <CardContent className="relative flex h-full flex-col gap-4">
                <Stars />
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-inset ring-border">
                    <span className="flex size-full items-center justify-center rounded-full text-[11px] font-semibold">
                      {t.initials}
                    </span>
                  </span>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
