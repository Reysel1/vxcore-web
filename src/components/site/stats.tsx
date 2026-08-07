"use client";

import { Activity, Server, ShieldCheck, Star, TrendingUp } from "lucide-react";
import * as React from "react";

import { Progress } from "@/components/ui/progress";

function useCountUp(target: number, decimals: number, duration = 1400) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, value: value.toFixed(decimals) };
}

const TILES = [
  {
    value: 99.9,
    decimals: 1,
    suffix: "%",
    label: "Uptime del panel",
    detail: "últimos 90 días",
    progress: 99.9,
    delta: "+0.1%",
    Icon: ShieldCheck,
  },
  {
    value: 5000,
    decimals: 0,
    suffix: "+",
    label: "Servidores conectados",
    detail: "red VXCore",
    progress: 77,
    delta: "+128 esta semana",
    Icon: Server,
  },
  {
    value: 24,
    decimals: 0,
    suffix: "/7",
    label: "Monitorización",
    detail: "tiempo real continuo",
    progress: 100,
    delta: "En vivo",
    Icon: Activity,
  },
  {
    value: 4.9,
    decimals: 1,
    suffix: "/5",
    label: "Valoración media",
    detail: "tienda Urantix",
    progress: 98,
    delta: "+0.2",
    Icon: Star,
  },
];

function Tile({
  value,
  decimals,
  suffix,
  label,
  detail,
  progress,
  delta,
  Icon,
}: (typeof TILES)[number]) {
  const { ref, value: display } = useCountUp(value, decimals);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 transition-colors hover:border-foreground/20 dark:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-inset ring-border">
          <Icon className="size-4" strokeWidth={1.8} />
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <TrendingUp className="size-3" />
          {delta}
        </span>
      </div>
      <div className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        <span ref={ref}>{display}</span>
        <span className="text-gradient">{suffix}</span>
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <Progress
        value={progress}
        className="h-1.5 bg-muted/60"
        indicatorClassName="bg-foreground"
      />
    </div>
  );
}

export function Stats() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 ring-1 ring-white/5 dark:shadow-black/40">
          {/* Window bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-400/90" />
            <span className="size-2.5 rounded-full bg-amber-400/90" />
            <span className="size-2.5 rounded-full bg-emerald-400/90" />
            <div className="mx-auto hidden items-center gap-2 rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              VXCore
            </div>
            <span className="ml-auto hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-foreground/50" />
              datos en vivo
            </span>
          </div>

          <div className="relative p-5 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TILES.map((tile) => (
                <Tile key={tile.label} {...tile} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
