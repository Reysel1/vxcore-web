import { ArrowRight, Play } from "lucide-react";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Button } from "@/components/ui/button";
import { PanelDemo } from "@/components/site/panel-demo";
import { Reveal } from "@/components/site/reveal";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40">
      {/* Background decorations */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mask-fade-radial"
      >
        <FlickeringGrid
          squareSize={4}
          gridGap={6}
          flickerChance={0.12}
          color="rgb(130, 130, 130)"
          maxOpacity={0.2}
          className="opacity-70 dark:opacity-100"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-foreground/[0.05] blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <Reveal delay={0}>
          <h1 className="mx-auto max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Controla tu servidor FiveM desde{" "}
            <span className="text-gradient">un único núcleo</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            VXCore une servidores, recursos, logs y automatizaciones en un solo
            panel — con un agente de IA que monitoriza, edita y responde a tu
            servidor en tiempo real.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RainbowButton asChild className="group h-11 gap-2 rounded-xl px-6 text-base">
              <a href="/dashboard">
                Empezar gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </RainbowButton>
            <Button asChild variant="outline" className="h-11 gap-2 px-6 text-base">
              <a href="#demo">
                <Play className="size-4 fill-current" />
                Ver demostración
              </a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <PanelDemo />
        </Reveal>
      </div>
    </section>
  );
}
