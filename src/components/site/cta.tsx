import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";

export function Cta() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="group relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
            {/* Decorations */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-background/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08] mask-fade-b"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Tu servidor merece su propio sistema operativo
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
                Entra en tu panel, conecta tu FXServer y descarga el instalador
                de VXCore. Empezar es gratis — sin tarjeta de crédito.
              </p>

              <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  className="group/btn h-11 gap-2 bg-background px-6 text-foreground hover:bg-background/90"
                >
                  <a href="/dashboard">
                    Entrar en mi panel
                    <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </a>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70">
                {["Plan gratis para siempre", "Sin tarjeta de crédito", "Cancela cuando quieras"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-primary-foreground/60" />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
