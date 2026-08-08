"use client";

import {
  Activity,
  BarChart3,
  Database,
  FileCode2,
  Radio,
  Server,
  ServerCog,
  SquareKanban,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

const VIEWS = [
  {
    id: "console",
    label: "Consola RCON",
    Icon: Radio,
    file: "/panel/cmd.png",
    w: 1176,
    h: 880,
    alt: "VXCore panel — Consola RCON interactiva con salida en vivo del servidor FXServer",
  },
  {
    id: "servers",
    label: "Servidores",
    Icon: Server,
    file: "/panel/server.png",
    w: 1181,
    h: 866,
    alt: "VXCore panel — Gestión de servidores con estado, métricas y acciones",
  },
  {
    id: "servers-list",
    label: "Lista de servidores",
    Icon: ServerCog,
    file: "/panel/servers.png",
    w: 1249,
    h: 930,
    alt: "VXCore panel — Lista de servidores conectados con estado y métricas",
  },
  {
    id: "database",
    label: "Base de Datos",
    Icon: Database,
    file: "/panel/db.png",
    w: 1647,
    h: 995,
    alt: "VXCore panel — Base de datos del servidor con tablas y consultas",
  },
  {
    id: "editor",
    label: "Editor IA",
    Icon: FileCode2,
    file: "/panel/editorai.png",
    w: 1658,
    h: 1005,
    alt: "VXCore panel — Editor de recursos con el agente de IA integrado",
  },
  {
    id: "events",
    label: "Eventos",
    Icon: Activity,
    file: "/panel/eventspt1.png",
    w: 1920,
    h: 1040,
    alt: "VXCore panel — Eventos del servidor con métricas en tiempo real",
  },
  {
    id: "events2",
    label: "Eventos 2",
    Icon: BarChart3,
    file: "/panel/eventsp2.png",
    w: 1920,
    h: 1036,
    alt: "VXCore panel — Segunda vista de eventos y actividad del servidor",
  },
  {
    id: "flows",
    label: "Flujos",
    Icon: Workflow,
    file: "/panel/flujp.png",
    w: 886,
    h: 871,
    maxH: 640,
    alt: "VXCore panel — Creador de flujos y automatizaciones con el agente IA",
  },
  {
    id: "board",
    label: "Tablero",
    Icon: SquareKanban,
    file: "/panel/trello.png",
    w: 1164,
    h: 856,
    alt: "VXCore panel — Tablero kanban para coordinar el trabajo del equipo",
  },
];

export function PanelDemo() {
  const [active, setActive] = React.useState(VIEWS[0].id);
  const view = VIEWS.find((v) => v.id === active) ?? VIEWS[0];

  return (
    <div id="demo" className="relative mx-auto mt-16 w-full max-w-6xl">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-x-10 -top-12 -bottom-10 -z-10 bg-foreground/[0.05] blur-3xl"
      />

      <div className="group/frame relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 ring-1 ring-white/5 dark:shadow-black/50">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
        </div>

        {/* View switcher */}
        <div
          role="tablist"
          aria-label="Selecciona una vista del panel"
          className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/20 px-3 py-2"
        >
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              role="tab"
              aria-selected={active === id}
              aria-controls="panel-view"
              onClick={() => setActive(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                active === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Screenshots (cross-fade, sharpened) */}
        <div
          id="panel-view"
          role="tabpanel"
          aria-labelledby={`tab-${view.id}`}
          className="relative w-full overflow-hidden bg-[#0d0d13] transition-[aspect-ratio] duration-500 ease-out"
          style={{ aspectRatio: `${view.w} / ${view.h}`, maxHeight: view.maxH ?? undefined }}
        >
          {/* Sheen sweep over the screenshot only */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1000 group-hover/frame:translate-x-[420%]" />
          </div>
          {VIEWS.map(({ id, file, alt }) => {
            const fits = VIEWS.find((v) => v.id === id)?.maxH != null;
            return (
              <Image
                key={id}
                src={file}
                alt={alt}
                fill
                priority={id === VIEWS[0].id}
                quality={100}
                sizes="(min-width: 1152px) 1152px, 100vw"
                aria-hidden={active !== id}
                className={cn(
                  fits ? "object-contain" : "object-cover object-top",
                  "transition-opacity duration-500 contrast-[1.04] saturate-[1.06]",
                  active === id ? "opacity-100" : "opacity-0"
                )}
              />
            );
          })}

          {/* Crisp highlight overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
