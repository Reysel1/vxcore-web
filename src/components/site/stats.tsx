"use client";

import * as React from "react";

import { Reveal } from "@/components/site/reveal";

function useCountUp(target: number, decimals: number, duration = 1600) {
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

function Stat({
  value,
  decimals,
  suffix,
  label,
  delay,
}: {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const { ref, value: display } = useCountUp(value, decimals);
  return (
    <Reveal delay={delay} className="text-center">
      <div className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        <span ref={ref}>{display}</span>
        <span className="text-gradient">{suffix}</span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </Reveal>
  );
}

export function Stats() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <Stat value={99.9} decimals={1} suffix="%" label="Uptime garantizado del panel" delay={0} />
          <Stat value={5000} decimals={0} suffix="+" label="Servidores conectados a VXCore" delay={100} />
          <Stat value={24} decimals={0} suffix="/7" label="Monitorización en tiempo real" delay={200} />
          <Stat value={4.9} decimals={1} suffix="/5" label="Valoración media en la tienda Urantix" delay={300} />
        </div>
      </div>
    </section>
  );
}
