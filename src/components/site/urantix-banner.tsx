import { ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { URANTIX_STORE_URL } from "@/lib/site";

export function UrantixBanner() {
  return (
    <section
      id="urantix"
      className="relative overflow-hidden border-y border-violet-500/20 bg-[#0b0b16] py-16 text-white sm:py-20"
    >
      {/* Deep violet glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 50% 0%, rgba(80,32,120,0.55) 0%, rgba(20,12,40,0.4) 45%, rgba(11,11,22,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <a
            href={URANTIX_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Urantix × VXCore asociación oficial — visita la tienda de Urantix (se abre en una pestaña nueva)"
            className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/50 transition-all duration-300 hover:ring-violet-400/40"
          >
            <Image
              src="/brand/urantix-x-vxcore.png"
              alt="Banner de la asociación oficial Urantix × VXCore"
              width={1983}
              height={793}
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span
              aria-hidden
              className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition-all duration-300 group-hover:bg-violet-500/80"
            >
              <Sparkles className="size-3.5" />
              Visitar la tienda
              <ArrowUpRight className="size-3.5" />
            </span>
          </a>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge
              variant="outline"
              className="h-7 gap-2 rounded-full border-violet-500/30 bg-violet-500/10 px-3 text-xs font-medium text-violet-200"
            >
              <Sparkles className="size-3.5 text-fuchsia-400" />
              Asociación oficial
            </Badge>

            <div className="mx-auto max-w-2xl">
              <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Compra el universo VXCore en{" "}
                <span className="text-gradient">Urantix</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
                Apps, temas, plantillas y herramientas creadas por el equipo de VXCore —
                disponibles en exclusiva en la tienda Urantix. Una cuenta, todos
                los productos.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                asChild
                className="group h-11 gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 text-base text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-fuchsia-400"
              >
                <a
                  href={URANTIX_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visita la tienda de Urantix (se abre en una pestaña nueva)"
                >
                  Visitar la tienda
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href={URANTIX_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir urantix.com (se abre en una pestaña nueva)"
                >
                  urantix.com
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
