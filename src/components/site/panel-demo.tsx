"use client";

import { Activity, FileCode2, Radio } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

const VIEWS = [
  {
    id: "console",
    label: "Consola RCON",
    Icon: Radio,
    file: "/panel/console.png",
    alt: "VXCore panel — Consola RCON Interactiva con salida en vivo del servidor FXServer",
  },
  {
    id: "logs",
    label: "Logs Globales",
    Icon: Activity,
    file: "/panel/logs.png",
    alt: "VXCore panel — Logs Globales del servidor con filtros por nivel y recurso",
  },
  {
    id: "editor",
    label: "Editor",
    Icon: FileCode2,
    file: "/panel/editor.png",
    alt: "VXCore panel — Editor de recursos con agente IA integrado",
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
        className="absolute -inset-x-10 -top-12 -bottom-10 -z-10 bg-gradient-to-tr from-violet-600/30 via-violet-500/20 to-fuchsia-500/20 blur-3xl"
      />

      <div className="group/frame relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 ring-1 ring-white/5 dark:shadow-black/50">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
          <div className="mx-auto hidden items-center gap-2 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            app.vxcore.io
          </div>
          <div className="ml-auto w-10 sm:hidden" />
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
          className="relative aspect-[1919/1043] w-full overflow-hidden bg-[#0d0d13]"
        >
          {/* Sheen sweep over the screenshot only */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
          >
            <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1000 group-hover/frame:translate-x-[420%]" />
          </div>
          {VIEWS.map(({ id, file, alt }) => (
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
                "object-cover object-top transition-opacity duration-500",
                "contrast-[1.04] saturate-[1.06]",
                active === id ? "opacity-100" : "opacity-0"
              )}
            />
          ))}

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
