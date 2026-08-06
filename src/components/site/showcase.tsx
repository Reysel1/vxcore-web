"use client";

import {
  Bot,
  Check,
  FileCode2,
  Radio,
  ScrollText,
  ShieldCheck,
  Terminal,
  TimerReset,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/site/reveal";

const TABS = [
  {
    value: "console",
    label: "Consola RCON",
    Icon: Terminal,
    headline: "Control total de tu servidor, en tiempo real",
    copy: "Una terminal bidireccional que conecta tu navegador con el FXServer por WebSocket. Lo que haces se ve al instante, sin recargar la página.",
    points: [
      {
        Icon: Radio,
        title: "WebSocket bidireccional",
        desc: "Comandos y salida en vivo, sin refrescos.",
      },
      {
        Icon: Terminal,
        title: "Acciones rápidas",
        desc: "Refresh, status, restart, ensure… en un clic.",
      },
      {
        Icon: TimerReset,
        title: "Historial de comandos",
        desc: "Navega con las flechas ↕ por lo que ya ejecutaste.",
      },
      {
        Icon: ShieldCheck,
        title: "Control de acceso",
        desc: "Solo tú y tu equipo pueden ejecutar comandos.",
      },
    ],
  },
  {
    value: "logs",
    label: "Logs globales",
    Icon: ScrollText,
    headline: "Nunca más administres a ciegas",
    copy: "VXCore captura toda la salida de tu servidor, la organiza y te la presenta filtrable. Encuentra el error que te quita el sueño en segundos.",
    points: [
      {
        Icon: ScrollText,
        title: "Filtros por nivel",
        desc: "Error, aviso, info y debug con contadores en vivo.",
      },
      {
        Icon: Check,
        title: "Búsqueda instantánea",
        desc: "Por recurso o texto, sobre todos tus logs.",
      },
      {
        Icon: FileCode2,
        title: "Histórico en disco",
        desc: "Nada se pierde: consulta días atrás cuando quieras.",
      },
      {
        Icon: Bot,
        title: "Análisis con IA",
        desc: "El agente te explica qué falla y cómo arreglarlo.",
      },
    ],
  },
  {
    value: "agent",
    label: "Agente IA",
    Icon: Bot,
    headline: "Un copiloto dentro de tu servidor",
    copy: "El agente VXCore entiende tu servidor: lee recursos, detecta problemas y propone cambios. Tú decides siempre qué se aplica.",
    points: [
      {
        Icon: FileCode2,
        title: "Lee y edita recursos",
        desc: "fxmanifest, scripts, configs… sin FTP ni SSH.",
      },
      {
        Icon: Bot,
        title: "Explica cualquier cosa",
        desc: "Pregúntale qué hace un recurso o por qué falla.",
      },
      {
        Icon: ShieldCheck,
        title: "Guardado seguro",
        desc: "Nada se escribe en producción sin tu permiso.",
      },
      {
        Icon: Check,
        title: "Copias automáticas",
        desc: "Siempre queda una versión anterior para revertir.",
      },
    ],
  },
];

export function Showcase() {
  return (
    <section
      id="product"
      className="scroll-mt-24 border-y border-border/60 bg-muted/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Producto
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Un panel. Todo tu servidor.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Descubre lo que hace VXCore por tu servidor FXServer, minuto a
              minuto.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <Tabs defaultValue="console" className="mt-12 items-center">
            <TabsList className="mx-auto flex h-11 w-fit max-w-full overflow-x-auto rounded-xl bg-background p-1 ring-1 ring-border dark:bg-secondary/60">
              {TABS.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 rounded-lg px-4 py-2 text-sm"
                >
                  <Icon className="size-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-10">
              {TABS.map(({ value, headline, copy, points }) => (
                <TabsContent key={value} value={value}>
                  <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                      <h3 className="text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                        {headline}
                      </h3>
                      <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
                        {copy}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {points.map(({ Icon: PointIcon, title, desc }) => (
                        <Card
                          key={title}
                          className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
                        >
                          <CardContent className="flex flex-col gap-2.5 p-4">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/15 to-fuchsia-500/15 text-violet-600 ring-1 ring-inset ring-violet-500/20 dark:text-violet-400">
                              <PointIcon className="size-4" strokeWidth={1.8} />
                            </span>
                            <div className="text-sm font-semibold">{title}</div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {desc}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}
