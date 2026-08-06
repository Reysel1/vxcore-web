"use client";

import { ArrowRight, Mail } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/site/reveal";

export function Cta() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Escribe tu email para apuntarte a la lista.");
      return;
    }
    toast.success("¡Estás en la lista! Revisa tu bandeja de entrada. 🎉");
    setEmail("");
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-500 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            {/* Decorations */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-white/20 blur-3xl"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-20 mask-fade-b" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Tu servidor merece su propio sistema operativo
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-white/80">
                Únete a miles de servidores que ya gestionan su FXServer con
                VXCore. Empieza gratis — sin tarjeta de crédito.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    aria-label="Tu email"
                    className="h-11 border-white/25 bg-white/10 pl-9 text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:ring-white/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="group h-11 gap-2 bg-white px-6 text-violet-700 hover:bg-white/90 hover:text-violet-700"
                >
                  Empezar gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>

              <p className="mt-4 text-xs text-white/60">
                Plan gratis para siempre · Sin tarjeta · Cancela cuando quieras
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
