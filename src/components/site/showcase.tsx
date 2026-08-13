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
import { useTranslations } from "next-intl";
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

type ShowcaseT = ReturnType<typeof useTranslations>;

/* ------------------------------------------------------------------ */
/* Widget frame (ventana de app)                                       */
/* ------------------------------------------------------------------ */

function WidgetFrame({
  children,
  className,
}: {
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

function ConsoleWidget({ t }: { t: ShowcaseT }) {
  const [lines, setLines] = React.useState<Line[]>(INITIAL_LINES);
  const [input, setInput] = React.useState("");
  const idRef = React.useRef(100);
  const listRef = React.useRef<HTMLDivElement>(null);

  const push = React.useCallback(
    (kind: Line["kind"], text: string) => {
      idRef.current += 1;
      setLines((prev) => [...prev, { id: idRef.current, kind, text }]);
    },
    []
  );

  React.useEffect(() => {
    // Scroll solo el contenedor de la terminal, no la ventana: scrollIntoView
    // sobre un elemento anidado mueve también la página entera y, al entrar
    // en la web, el scroll arrancaba en la sección showcase en lugar de arriba.
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setInput("");
    push("cmd", cmd);
    window.setTimeout(() => {
      const reply =
        RESPONSES[cmd.toLowerCase()] ??
        t("console.executed", { cmd });
      push(cmd.toLowerCase().includes("restart") ? "ok" : "info", reply);
    }, 320);
  };

  return (
    <WidgetFrame>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/70">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {t("console.connected")}
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
          {t("console.events", { count: lines.length - INITIAL_LINES.length + 800 })}
        </span>
      </div>

      {/* Acciones rápidas */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
        <span className="mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("console.actions")}
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
      <div
        ref={listRef}
        className="max-h-56 overflow-y-auto bg-[#0a0a10] p-3 font-mono text-[11px] leading-relaxed"
      >
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
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <span className="font-mono text-sm text-muted-foreground">$</span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runCommand(input)}
          placeholder={t("console.placeholder")}
          aria-label={t("console.commandAria")}
          className="h-8 border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"
        />
        <Button
          size="icon"
          onClick={() => runCommand(input)}
          aria-label={t("console.runAria")}
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

const LOG_DEFS: Omit<LogRow, "message">[] = [
  { level: "ERROR", time: "12:04:01", resource: "oxmysql" },
  { level: "WARN", time: "12:03:41", resource: "qb-core" },
  { level: "INFO", time: "12:03:22", resource: "esx" },
  { level: "INFO", time: "12:02:58", resource: "fiveos" },
  { level: "DEBUG", time: "12:02:11", resource: "UrantixDealership" },
  { level: "WARN", time: "12:01:47", resource: "txAdmin" },
  { level: "INFO", time: "12:00:00", resource: "core" },
];

function LogsWidget({ t }: { t: ShowcaseT }) {
  const [filter, setFilter] = React.useState<LogRow["level"] | "all">("all");
  const [query, setQuery] = React.useState("");

  const rowMessages = t.raw("logs.rows") as { message: string }[];
  const LOGS: LogRow[] = LOG_DEFS.map((row, i) => ({
    ...row,
    message: rowMessages[i]?.message ?? "",
  }));

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: LOGS.length };
    for (const l of LOGS) c[l.level] = (c[l.level] ?? 0) + 1;
    return c;
  }, [LOGS]);

  const visible = LOGS.filter(
    (l) =>
      (filter === "all" || l.level === filter) &&
      (query.trim() === "" ||
        l.message.toLowerCase().includes(query.toLowerCase()) ||
        l.resource.toLowerCase().includes(query.toLowerCase()))
  );

  const filters: Array<LogRow["level"] | "all"> = ["all", "ERROR", "WARN", "INFO", "DEBUG"];

  return (
    <WidgetFrame>
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
              {f === "all" ? t("logs.all") : f}
              <span className="ml-1 tabular-nums opacity-70">{counts[f] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-44">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("logs.searchPlaceholder")}
            aria-label={t("logs.searchAria")}
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
                {t("logs.level")}
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("logs.resource")}
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("logs.message")}
              </TableHead>
              <TableHead className="px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("logs.time")}
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
                  {t("logs.empty")}
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

function agentReply(t: ShowcaseT, question: string): string {
  const q = question.toLowerCase();
  if (q.includes("config") || q.includes("mysql") || q.includes("base"))
    return t("agent.replyConfig");
  if (q.includes("crash") || q.includes("error"))
    return t("agent.replyCrash");
  if (q.includes("restart") || q.includes("servidor"))
    return t("agent.replyRestart");
  return t("agent.replyDefault");
}

function AgentWidget({ t }: { t: ShowcaseT }) {
  const initial1Actions = t.raw("agent.initial1Actions") as string[];
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      id: 1,
      role: "agent",
      text: t("agent.initial1"),
      actions: initial1Actions,
    },
    {
      id: 2,
      role: "user",
      text: t("agent.initial2"),
    },
  ]);
  const [input, setInput] = React.useState("");
  const idRef = React.useRef(10);
  const listRef = React.useRef<HTMLDivElement>(null);

  const push = React.useCallback((m: Omit<Msg, "id">) => {
    idRef.current += 1;
    setMsgs((prev) => [...prev, { ...m, id: idRef.current }]);
  }, []);

  React.useEffect(() => {
    // Ídem que en ConsoleWidget: scroll solo del hilo de chat, sin mover la página.
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
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
        text: isEdit ? t("agent.applied") : agentReply(t, text),
        actions: t.raw("agent.applyActions") as string[],
      });
    }, 420);
  };

  return (
    <WidgetFrame>
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border bg-muted/30 px-3 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
          <Bot className="size-4" />
        </span>
        <div>
          <div className="text-xs font-semibold">{t("agent.name")}</div>
          <div className="flex items-center gap-1 text-[10px] text-foreground/60">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {t("agent.connected")}
          </div>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {t("agent.readOnly")}
        </span>
      </div>

      {/* Thread */}
      <div
        ref={listRef}
        className="max-h-64 space-y-3 overflow-y-auto bg-[#0a0a10] p-3"
      >
        {msgs.map((m) =>
          m.role === "agent" ? (
            <div key={m.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-900">
                <Bot className="size-3.5" />
              </span>
              <div className="min-w-0">
                <div className="rounded-lg rounded-tl-sm border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-zinc-200">
                  {m.text}
                </div>
                {m.actions && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.actions.map((a) => (
                      <button
                        key={a}
                        onClick={() => send(a)}
                        className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
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
              <div className="rounded-lg rounded-tr-sm bg-zinc-100 px-3 py-2 text-xs text-zinc-900">
                {m.text}
              </div>
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-300">
                <User className="size-3.5" />
              </span>
            </div>
          )
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("agent.placeholder")}
          aria-label={t("agent.askAria")}
          className="h-8 bg-background text-xs"
        />
        <Button size="icon" onClick={() => send()} aria-label={t("agent.sendAria")} className="size-8 shrink-0">
          <Send className="size-3.5" />
        </Button>
      </div>
    </WidgetFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Sección                                                             */
/* ------------------------------------------------------------------ */

type TabMeta = {
  label: string;
  headline: string;
  copy: string;
  points: string[];
};

export function Showcase() {
  const t = useTranslations("showcase");

  const tabs = [
    {
      value: "console",
      Icon: Terminal,
      meta: t.raw("console") as TabMeta,
      widget: <ConsoleWidget t={t} />,
    },
    {
      value: "logs",
      Icon: FileCode2,
      meta: t.raw("logs") as TabMeta,
      widget: <LogsWidget t={t} />,
    },
    {
      value: "agent",
      Icon: Bot,
      meta: t.raw("agent") as TabMeta,
      widget: <AgentWidget t={t} />,
    },
  ];

  return (
    <section
      id="product"
      className="relative scroll-mt-24 border-y border-border/60 bg-muted/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")} <span className="text-gradient">{t("titleAccent")}</span>
            </>
          }
          description={t("description")}
        />

        <Tabs defaultValue="console" className="mt-12">
          <TabsList className="mx-auto flex h-11 w-fit max-w-full overflow-x-auto rounded-full bg-background/80 p-1 ring-1 ring-border backdrop-blur-sm dark:bg-white/[0.04]">
            {tabs.map(({ value, meta, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-2 rounded-full px-4 py-2 text-sm data-active:bg-foreground! data-active:text-background!"
              >
                <Icon className="size-4" />
                {meta.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-10">
            {tabs.map(({ value, meta, widget }) => (
              <TabsContent key={value} value={value}>
                <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <h3 className="text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                      {meta.headline}
                    </h3>
                    <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
                      {meta.copy}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {meta.points.map((point) => (
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
