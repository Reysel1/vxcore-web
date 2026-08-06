import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { URANTIX_STORE_URL } from "@/lib/site";

export function UrantixBanner() {
  return (
    <section
      id="urantix"
      className="relative overflow-hidden border-y border-border/60 bg-[#0b0b0f] py-16 text-white sm:py-20"
    >
      {/* Faint neutral glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 50% 0%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, rgba(11,11,15,0) 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <a
            href={URANTIX_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Urantix × VXCore asociación oficial — visita la tienda de Urantix (se abre en una pestaña nueva)"
            className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/50 transition-all duration-300 hover:ring-white/25"
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
          </a>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Compra el universo VXCore en{" "}
                <span className="text-gradient">Urantix</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
                Apps, temas, plantillas y herramientas creadas por el equipo de
                VXCore — disponibles en exclusiva en la tienda Urantix. Una
                cuenta, todos los productos.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                asChild
                className="group h-11 gap-2 bg-white px-6 text-base text-black hover:bg-white/90"
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
