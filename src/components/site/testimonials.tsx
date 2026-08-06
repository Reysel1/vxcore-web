import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";

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
        <Star key={i} className="size-3.5 fill-current" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Testimonios
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              La gente que mantiene servidores nos entiende
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90}>
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
                <CardContent className="flex h-full flex-col gap-4">
                  <Stars />
                  <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-medium text-white">
                      {t.initials}
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
