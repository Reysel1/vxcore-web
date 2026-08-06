"use client";

import {
  Activity,
  Bot,
  Check,
  Clock,
  FileCode2,
  RefreshCcw,
  Search,
  Send,
  Settings2,
  Sun,
  Terminal,
  User,
  Wrench,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Widget frame (ventana de app)                                       */
/* ------------------------------------------------------------------ */

function WidgetFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-8 -z-10 bg-foreground/[0.04] blur-3xl"
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 ring-1 ring-white/5 dark:shadow-black/40">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
          <div className="mx-auto hidden items-center gap-2 rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground sm:flex">
            {url}
          </div>
          <div className="ml-auto w-10 sm:hidden" />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Consola RCON interactiva                                            */
/* ------------------------------------------------------------------ */

type Line = { id: number; kind: "cmd" | "ok" | "err" | "info"; text: string };

const INITIAL_LINES: Line[] = [
  { id: 1, kind: "info", text: "[script:oxmysql] conectado a MariaDB · 10.6.23" },
  { id: 2, kind: "ok", text: "[script:oxmysql] query ok · 12ms" },
  { id: 3, kind: "info", text: "[script:esx] resource esx loaded (25 scripts)" },
  { id: 4, kind: "ok", text: "[script:qb-core] resource started" },
];

const QUICK_ACTIONS = [
  { label: "refresh", Icon: RefreshCcw },
  { label: "status", Icon: Activity },
  { label: "restart qb-core", Icon: Settings2 },
  { label: "time 12 00", Icon: Clock },
  { label: "weather sunny", Icon: Sun },
  { label: "ensure fiveos", Icon: Wrench },
];

const RESPONSES: Record<string, string> = {
  refresh: "[core] refreshing resources · 38 recursos encontrados",
  status: "[core] estado: RUNNING · 24 jugadores · 15.2ms tick",
  "restart qb-core": "[script:qb-core] stopped · started · 1.4s",
  "time 12 00": "[server] hora del mundo actualizada a 12:00",
  "weather sunny": "[server] clima actualizado a sunny",
  "ensure fiveos": "[script:fiveos] already running",
};

function ConsoleWidget() {
  const [lines, setLines] = React.useState<Line[]>(INITIAL_LINES);
  const [input, setInput] = React.useState("");
  const idRef = React.useRef(100);
  const endRef = React.useRef<HTMLDivElement>(null);

  const push = React.useCallback(
    (kind: Line["kind"], text: string) => {
      idRef.current += 1;
      setLines((prev) => [...prev, { id: idRef.current, kind, text }]);
    },
    []
  );

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [lines]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setInput("");
    push("cmd", cmd);
    window.setTimeout(() => {
      const reply =
        RESPONSES[cmd.toLowerCase()] ??
        `[server] comando "${cmd}" ejecutado sin errores`;
      push(cmd.toLowerCase().includes("restart") ? "ok" : "info", reply);
    }, 320);
  };

  return (
    <WidgetFrame url="app.vxcore.io/console">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/70">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          WebSocket conectado
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {lines.length - INITIAL_LINES.length + 800} eventos registrados
        </span>
      </div>

      {/* Acciones rápidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
        <span className="mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Acciones
        </span>
        {QUICK_ACTIONS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => runCommand(label)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Terminal */}
      <div className="max-h-56 overflow-y-auto bg-[#0a0a10] p-3 font-mono text-[11px] leading-relaxed">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2">
            <span className="w-7 shrink-0 select-none text-right tabular-nums text-zinc-600">
              {line.id}
            </span>
            {line.kind === "cmd" ? (
              <span className="text-zinc-100">
                <span className="text-muted-foreground">$</span> {line.text}
              </span>
            ) : line.kind === "ok" ? (
              <span className="text-emerald-400">{line.text}</span>
            ) : line.kind === "err" ? (
              <span className="text-rose-400">{line.text}</span>
            ) : (
              <span className="text-zinc-400">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <span className="font-mono text-sm text-muted-foreground">$</span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand(input)}
          placeholder="Escribe un comando RCON…"
          aria-label="Comando RCON"
          className="h-8 border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"
        />
        <Button
          size="icon"
          onClick={() => runCommand(input)}
          aria-label="Ejecutar comando"
          className="size-8 shrink-0"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </WidgetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Logs globales con filtros                                           */
/* ------------------------------------------------------------------ */

type LogRow = {
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  time: string;
  resource: string;
  message: string;
};

const LOGS: LogRow[] = [
  { level: "ERROR", time: "12:04:01", resource: "oxmysql", message: "conexión perdida con el servidor de base de datos" },
  { level: "WARN", time: "12:03:41", resource: "qb-core", message: "query lenta detectada · 1.2s" },
  { level: "INFO", time: "12:03:22", resource: "esx", message: "resource esx loaded · 25 scripts" },
  { level: "INFO", time: "12:02:58", resource: "fiveos", message: "jugador conectado · license validada" },
  { level: "DEBUG", time: "12:02:11", resource: "UrantixDealership", message: "CREATE TABLE utx_dealership_financing ok" },
  { level: "WARN", time: "12:01:47", resource: "txAdmin", message: "heartbeat retrasado · 2.4s" },
  { level: "INFO", time: "12:00:00", resource: "core", message: "servidor iniciado · 38 recursos" },
];

function LogsWidget() {
  const [filter, setFilter] = React.useState<LogRow["level"] | "all">("all");
  const [query, setQuery] = React.useState("");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: LOGS.length };
    for (const l of LOGS) c[l.level] = (c[l.level] ?? 0) + 1;
    return c;
  }, []);

  const visible = LOGS.filter(
    (l) =>
      (filter === "all" || l.level === filter) &&
      (query.trim() === "" ||
        l.message.toLowerCase().includes(query.toLowerCase()) ||
        l.resource.toLowerCase().includes(query.toLowerCase()))
  );

  const filters: Array<LogRow["level"] | "all"> = ["all", "ERROR", "WARN", "INFO", "DEBUG"];

  return (
    <WidgetFrame url="app.vxcore.io/logs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium capitalize transition-colors",
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f === "all" ? "Todos" : f}
              <span className="ml-1 tabular-nums opacity-70">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-44">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en logs…"
            aria-label="Buscar en logs"
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="max-h-64 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Nivel
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recurso
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mensaje
              </TableHead>
              <TableHead className="px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hora
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((l, i) => (
              <TableRow key={`${l.time}-${i}`}>
                <TableCell className="px-3">
                  <span className="font-mono text-[10px] font-semibold uppercase text-foreground/60">
                    {l.level}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-foreground/80">
                  {l.resource}
                </TableCell>
                <TableCell className="max-w-56 truncate text-xs text-muted-foreground">
                  {l.message}
                </TableCell>
                <TableCell className="px-3 text-right text-xs tabular-nums text-muted-foreground">
                  {l.time}
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  Sin resultados para ese filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </WidgetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Agente IA — chat                                                    */
/* ------------------------------------------------------------------ */

type Msg = {
  id: number;
  role: "user" | "agent";
  text: string;
  actions?: string[];
};

const INITIAL_MSGS: Msg[] = [
  {
    id: 1,
    role: "agent",
    text: "Hola, soy el agente VXCore. Detecté que oxmysql perdió la conexión 2 veces en la última hora. ¿Quieres que revise la config de la base de datos?",
    actions: ["Revisar config", "Ver logs"],
  },
  {
    id: 2,
    role: "user",
    text: "Sí, ¿qué puedo hacer para evitar que se caiga?",
  },
];

function agentReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("config") || q.includes("mysql") || q.includes("base"))
    return "El problema suele ser max_connections. Te recomiendo subirlo a 200 y añadir un healthcheck cada 30s. He preparado el cambio en el editor — puedes revisarlo antes de guardar.";
  if (q.includes("crash") || q.includes("error"))
    return "He analizado los logs: el crash viene de un recurso que accede a la BD sin reintentos. Puedo envolver esa llamada con un retry automático (con copia de seguridad incluida).";
  if (q.includes("restart") || q.includes("servidor"))
    return "Puedo programar un reinicio nocturno a las 04:00 con aviso en el Discord de tu comunidad. ¿Lo activo?";
  return "He revisado el estado del servidor: todo en orden. ¿Quieres que mire un recurso, los logs o te prepare una automatización?";
}

function AgentWidget() {
  const [msgs, setMsgs] = React.useState<Msg[]>(INITIAL_MSGS);
  const [input, setInput] = React.useState("");
  const idRef = React.useRef(10);
  const endRef = React.useRef<HTMLDivElement>(null);

  const push = React.useCallback((m: Omit<Msg, "id">) => {
    idRef.current += 1;
    setMsgs((prev) => [...prev, { ...m, id: idRef.current }]);
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [msgs]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput("");
    push({ role: "user", text });
    window.setTimeout(() => {
      const isEdit = text.toLowerCase().includes("aplicar");
      push({
        role: "agent",
        text: isEdit
          ? "Listo: el cambio está guardado con una copia de seguridad. Puedes revertirlo desde el editor en cualquier momento."
          : agentReply(text),
        actions: ["Aplicar con copia", "Ver diff"],
      });
    }, 420);
  };

  return (
    <WidgetFrame url="app.vxcore.io/agent">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-muted/30 px-3 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
          <Bot className="size-4" />
        </span>
        <div>
          <div className="text-xs font-semibold">Agente VXCore</div>
          <div className="flex items-center gap-1 text-[10px] text-foreground/60">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            conectado a tu servidor
          </div>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">
          solo lectura · tú decides
        </span>
      </div>

      {/* Thread */}
      <div className="max-h-64 space-y-3 overflow-y-auto bg-[#0a0a10] p-3">
        {msgs.map((m) =>
          m.role === "agent" ? (
            <div key={m.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Bot className="size-3.5" />
              </span>
              <div className="min-w-0">
                <div className="rounded-lg rounded-tl-sm border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground/85">
                  {m.text}
                </div>
                {m.actions && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.actions.map((a) => (
                      <button
                        key={a}
                        onClick={() => send(a)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start justify-end gap-2">
              <div className="rounded-lg rounded-tr-sm bg-foreground px-3 py-2 text-xs text-background">
                {m.text}
              </div>
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="size-3.5" />
              </span>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pregúntale al agente…"
          aria-label="Pregunta al agente"
          className="h-8 bg-background text-xs"
        />
        <Button size="icon" onClick={() => send()} aria-label="Enviar mensaje" className="size-8 shrink-0">
          <Send className="size-3.5" />
        </Button>
      </div>
    </WidgetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Sección                                                             */
/* ------------------------------------------------------------------ */

const TABS = [
  {
    value: "console",
    label: "Consola RCON",
    Icon: Terminal,
    headline: "Control total de tu servidor, en tiempo real",
    copy: "Una terminal bidireccional que conecta tu navegador con el FXServer por WebSocket. Lo que haces se ve al instante, sin recargar la página.",
    points: [
      "WebSocket bidireccional — comandos y salida en vivo",
      "Acciones rápidas — refresh, status, restart, ensure…",
      "Historial de comandos navegable con las flechas ↕",
      "Control de acceso: solo tú y tu equipo ejecutan",
    ],
    widget: <ConsoleWidget />,
  },
  {
    value: "logs",
    label: "Logs globales",
    Icon: FileCode2,
    headline: "Nunca más administres a ciegas",
    copy: "VXCore captura toda la salida de tu servidor, la organiza y te la presenta filtrable. Encuentra el error que te quita el sueño en segundos.",
    points: [
      "Filtros por nivel con contadores en vivo",
      "Búsqueda instantánea por recurso o texto",
      "Histórico en disco: consulta días atrás",
      "El agente te explica qué falla y cómo arreglarlo",
    ],
    widget: <LogsWidget />,
  },
  {
    value: "agent",
    label: "Agente IA",
    Icon: Bot,
    headline: "Un copiloto dentro de tu servidor",
    copy: "El agente VXCore entiende tu servidor: lee recursos, detecta problemas y propone cambios. Tú decides siempre qué se aplica.",
    points: [
      "Lee y edita recursos — fxmanifest, scripts, configs",
      "Explica cualquier cosa: qué hace o por qué falla",
      "Nada se escribe en producción sin tu permiso",
      "Siempre queda una copia para revertir",
    ],
    widget: <AgentWidget />,
  },
];

export function Showcase() {
  return (
    <section
      id="product"
      className="relative scroll-mt-24 border-y border-border/60 bg-muted/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Producto"
          title={
            <>
              Un panel. <span className="text-gradient">Todo tu servidor.</span>
            </>
          }
          description="Descubre lo que hace VXCore por tu servidor FXServer, minuto a minuto. Prueba los módulos de abajo: son interactivos."
        />

        <Tabs defaultValue="console" className="mt-12">
          <TabsList className="mx-auto flex h-11 w-fit max-w-full overflow-x-auto rounded-full bg-background/80 p-1 ring-1 ring-border backdrop-blur-sm dark:bg-white/[0.04]">
            {TABS.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-2 rounded-full px-4 py-2 text-sm data-active:bg-foreground! data-active:text-background!"
              >
                <Icon className="size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-10">
            {TABS.map(({ value, headline, copy, points, widget }) => (
              <TabsContent key={value} value={value}>
                <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <h3 className="text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                      {headline}
                    </h3>
                    <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
                      {copy}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                            <Check className="size-3" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {widget}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
