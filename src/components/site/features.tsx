import {
  Bot,
  FileCode2,
  ScrollText,
  Server,
  ShoppingBag,
  TimerReset,
  Zap,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";

/* ---------- Mini mockups (estética del panel real) ---------- */

function WindowBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2">
      <span className="size-2 rounded-full bg-red-400/80" />
      <span className="size-2 rounded-full bg-amber-400/80" />
      <span className="size-2 rounded-full bg-emerald-400/80" />
      <span className="ml-auto font-mono text-[10px] tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function MiniConsole() {
  return (
    <div className="rounded-lg border border-border/70 bg-[#0a0a10] p-3 font-mono text-[11px] leading-relaxed">
      <div className="text-zinc-500">
        $ <span className="text-zinc-100">refresh</span>
      </div>
      <div>
        <span className="text-zinc-600">[script:oxmysql]</span>{" "}
        <span className="text-emerald-400">query ok · 12ms</span>
      </div>
      <div>
        <span className="text-zinc-600">[script:esx]</span>{" "}
        <span className="text-zinc-300">resource started</span>
      </div>
      <div className="flex items-center gap-1 text-zinc-500">
        $<span className="inline-block h-3 w-1.5 animate-pulse bg-foreground/60" />
      </div>
    </div>
  );
}

function MiniLogs() {
  const rows = [
    { level: "ERROR", text: "oxmysql · conexión perdida", time: "12:04:01" },
    { level: "INFO", text: "esx · recurso iniciado", time: "12:03:58" },
    { level: "WARN", text: "qb-core · query lenta (1.2s)", time: "12:03:41" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div
          key={r.time}
          className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
        >
          <span className="w-11 shrink-0 font-mono text-[10px] font-semibold uppercase text-foreground/60">
            {r.level}
          </span>
          <span className="truncate text-xs text-foreground/80">{r.text}</span>
          <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {r.time}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniAgent() {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
          <Bot className="size-3.5" />
        </span>
        <div className="rounded-lg rounded-tl-sm bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground/85">
          Detecté que <span className="font-medium text-foreground">oxmysql</span>{" "}
          perdió la conexión a las 03:12. ¿Quieres que revise la config?
        </div>
      </div>
      <div className="flex gap-1.5 pl-8">
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Explicar
        </span>
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Reconectar
        </span>
      </div>
    </div>
  );
}

function MiniEditor() {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-3 py-1.5">
        <FileCode2 className="size-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-foreground/80">
          fxmanifest.lua
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> guardado
        </span>
      </div>
      <div className="bg-[#0a0a10] p-3 font-mono text-[11px] leading-relaxed">
        <div>
          <span className="mr-3 select-none text-zinc-600">1</span>
          <span className="text-zinc-100">fx_version</span>{" "}
          <span className="text-zinc-400">&apos;cerulean&apos;</span>
        </div>
        <div>
          <span className="mr-3 select-none text-zinc-600">2</span>
          <span className="text-zinc-100">game</span>{" "}
          <span className="text-zinc-400">&apos;gta5&apos;</span>
        </div>
        <div>
          <span className="mr-3 select-none text-zinc-600">3</span>
          <span className="text-zinc-600">
            -- server_script &apos;server/main.lua&apos;
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniMarket() {
  const products = [
    { name: "UrantixDealership", meta: "Vehículos · $24.99" },
    { name: "qb-core UI Pack", meta: "Interfaz · $12.00" },
  ];
  return (
    <div className="space-y-1.5">
      {products.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-2.5 rounded-md bg-muted/40 px-2.5 py-2"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ShoppingBag className="size-3.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">{p.name}</div>
            <div className="text-[10px] text-muted-foreground">{p.meta}</div>
          </div>
          <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground">
            instalar
          </span>
        </div>
      ))}
    </div>
  );
}

function Toggle() {
  return (
    <div className="flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-foreground/80 px-0.5">
      <span className="size-4 rounded-full bg-background shadow-sm" />
    </div>
  );
}

function MiniAuto() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5 rounded-md bg-muted/40 px-2.5 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <TimerReset className="size-3.5" />
        </span>
        <div className="text-xs font-medium">Reinicio nocturno</div>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          04:00
        </span>
        <Toggle />
      </div>
      <div className="flex items-center gap-2.5 rounded-md bg-muted/40 px-2.5 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Zap className="size-3.5" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium">
            Restart qb-core automático
          </div>
          <div className="text-[10px] text-muted-foreground">
            si se cuelga · cada 10 min
          </div>
        </div>
        <Toggle />
      </div>
    </div>
  );
}

/* ---------- Cards ---------- */

const FEATURES = [
  {
    Icon: Server,
    window: "app.vxcore.io/console",
    mockup: <MiniConsole />,
    title: "Consola RCON interactiva",
    description:
      "Terminal bidireccional en tiempo real por WebSocket. Envía comandos y ve la salida al instante, con historial y acciones rápidas.",
  },
  {
    Icon: ScrollText,
    window: "app.vxcore.io/logs",
    mockup: <MiniLogs />,
    title: "Logs globales",
    description:
      "Toda la salida de tu servidor filtrada por nivel y recurso. Histórico en disco y exportación con un clic.",
  },
  {
    Icon: Bot,
    window: "app.vxcore.io/agent",
    mockup: <MiniAgent />,
    title: "Agente VXCore",
    description:
      "Un copiloto de IA conectado a tu servidor: monitoriza, explica errores y propone cambios. Nada se guarda sin tu permiso.",
  },
  {
    Icon: FileCode2,
    window: "app.vxcore.io/editor",
    mockup: <MiniEditor />,
    title: "Editor de recursos",
    description:
      "Explora y edita tus recursos desde el panel, sin FTP ni SSH. Guarda con copia de seguridad automática.",
  },
  {
    Icon: ShoppingBag,
    window: "app.vxcore.io/market",
    mockup: <MiniMarket />,
    title: "Marketplace integrado",
    description:
      "Compra e instala recursos y scripts desde la tienda Urantix en dos clics, sin salir del panel.",
  },
  {
    Icon: Zap,
    window: "app.vxcore.io/automate",
    mockup: <MiniAuto />,
    title: "Automatizaciones",
    description:
      "Reinicios, comandos y acciones programadas. Define reglas y deja que VXCore se encargue del resto.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Características"
          title={
            <>
              Todo lo que tu servidor necesita.{" "}
              <span className="text-gradient">Nada de lo que no.</span>
            </>
          }
          description="VXCore convierte la gestión de tu servidor FXServer en una experiencia simple, rápida y segura — desde la primera conexión hasta el escalado de tu comunidad."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, window, mockup, title, description }) => (
            <Card
              key={title}
              className="overflow-hidden transition-colors duration-300 hover:ring-foreground/20"
            >
              <WindowBar label={window} />
              <div className="p-4">{mockup}</div>
              <div className="px-4 pb-5 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                    <Icon className="size-4" strokeWidth={1.8} />
                  </span>
                  <h3 className="font-heading text-base font-semibold">
                    {title}
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
