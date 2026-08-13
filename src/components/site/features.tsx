import {
  Activity,
  Bot,
  FileCode2,
  ScrollText,
  Server,
  ShoppingBag,
  TimerReset,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { InlineText } from "@/components/site/inline-text";

type MockStrings = {
  saved: string;
  agentDetected: string;
  explain: string;
  reconnect: string;
  nightRestart: string;
  autoRestart: string;
  ifHangs: string;
  uptime: string;
  online: string;
  install: string;
  live: string;
  last12h: string;
  t247: string;
};

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

function MockupBg({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <WindowBar label={label} />
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

function MiniConsole() {
  return (
    <div className="w-full rounded-lg border border-border/70 bg-[#0a0a10] p-3 font-mono text-[11px] leading-relaxed">
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
    <div className="w-full max-w-72 space-y-1.5">
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

function MiniAgent({ mock }: { mock: MockStrings }) {
  return (
    <div className="w-full max-w-72 space-y-2">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
          <Bot className="size-3.5" />
        </span>
        <div className="rounded-lg rounded-tl-sm bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground/85">
          <InlineText text={mock.agentDetected} />
        </div>
      </div>
      <div className="flex gap-1.5 pl-8">
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {mock.explain}
        </span>
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {mock.reconnect}
        </span>
      </div>
    </div>
  );
}

function MiniEditor({ mock }: { mock: MockStrings }) {
  return (
    <div className="w-full max-w-72 overflow-hidden rounded-lg border border-border/70">
      <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-3 py-1.5">
        <FileCode2 className="size-3 text-muted-foreground" />
        <span className="text-[10px] font-medium text-foreground/80">
          fxmanifest.lua
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> {mock.saved}
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

function MiniMarket({ mock }: { mock: MockStrings }) {
  const products = [
    { name: "UrantixDealership", meta: "Vehículos · $24.99" },
    { name: "qb-core UI Pack", meta: "Interfaz · $12.00" },
  ];
  return (
    <div className="w-full max-w-72 space-y-1.5">
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
            {mock.install}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniMonitor({ mock }: { mock: MockStrings }) {
  const bars = [45, 70, 52, 82, 60, 90, 74, 100, 86, 94, 88, 99];
  return (
    <div className="w-full max-w-72">
      <div className="flex items-center justify-between px-0.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {mock.live}
        </span>
        <span className="font-mono">99.9% {mock.uptime}</span>
      </div>
      <div className="mt-2 flex h-20 items-end gap-1 rounded-lg border border-border/70 bg-[#0a0a10] p-2">
        {bars.map((b, i) => (
          <span
            key={i}
            className="flex-1 rounded-[2px] bg-emerald-400/80"
            style={{ height: `${b}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between px-0.5 text-[10px] text-muted-foreground">
        <span>{mock.last12h}</span>
        <span>{mock.t247}</span>
      </div>
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

function MiniAuto({ mock }: { mock: MockStrings }) {
  return (
    <div className="w-full max-w-72 space-y-1.5">
      <div className="flex items-center gap-2.5 rounded-md bg-muted/40 px-2.5 py-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <TimerReset className="size-3.5" />
        </span>
        <div className="text-xs font-medium">{mock.nightRestart}</div>
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
          <div className="truncate text-xs font-medium">{mock.autoRestart}</div>
          <div className="text-[10px] text-muted-foreground">{mock.ifHangs}</div>
        </div>
        <Toggle />
      </div>
    </div>
  );
}

/* ---------- Bento grid ---------- */

export async function Features() {
  const t = await getTranslations("features");
  const mock = t.raw("mock") as MockStrings;
  const items = t.raw("items") as { title: string; description: string }[];

  const FEATURES = [
    {
      Icon: Server,
      className: "md:col-span-2",
      background: (
        <MockupBg label="VXCore · console">
          <MiniConsole />
        </MockupBg>
      ),
      ...items[0],
    },
    {
      Icon: Bot,
      className: "md:col-span-1",
      background: (
        <MockupBg label="VXCore · agent">
          <MiniAgent mock={mock} />
        </MockupBg>
      ),
      ...items[1],
    },
    {
      Icon: ScrollText,
      className: "md:col-span-1",
      background: (
        <MockupBg label="VXCore · logs">
          <MiniLogs />
        </MockupBg>
      ),
      ...items[2],
    },
    {
      Icon: FileCode2,
      className: "md:col-span-1",
      background: (
        <MockupBg label="VXCore · editor">
          <MiniEditor mock={mock} />
        </MockupBg>
      ),
      ...items[3],
    },
    {
      Icon: ShoppingBag,
      className: "md:col-span-1",
      background: (
        <MockupBg label="VXCore · market">
          <MiniMarket mock={mock} />
        </MockupBg>
      ),
      ...items[4],
    },
    {
      Icon: Activity,
      className: "md:col-span-1",
      background: (
        <MockupBg label="VXCore · monitor">
          <MiniMonitor mock={mock} />
        </MockupBg>
      ),
      ...items[5],
    },
    {
      Icon: Zap,
      className: "md:col-span-2",
      background: (
        <MockupBg label="VXCore · automate">
          <MiniAuto mock={mock} />
        </MockupBg>
      ),
      ...items[6],
    },
  ];

  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              <span className="text-gradient">{t("titleAccent")}</span>
            </>
          }
          description={t("description")}
        />

        <BentoGrid className="mt-14">
          {FEATURES.map(({ Icon, className, background, title, description }) => (
            <BentoCard
              key={title}
              Icon={Icon}
              name={title}
              description={description}
              className={className}
              background={background}
              href="#product"
              cta={t("cta")}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
