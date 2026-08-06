"use client";

import { ArrowRight, Check } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    tagline: "Para empezar a controlar tu servidor",
    monthly: 0,
    annual: 0,
    cta: "Empezar gratis",
    features: [
      "1 servidor conectado",
      "Consola RCON interactiva",
      "Logs de las últimas 24 h",
      "Agente IA básico",
      "Soporte de la comunidad",
    ],
  },
  {
    name: "Pro",
    tagline: "Para servidores que crecen",
    monthly: 24,
    annual: 19,
    cta: "Probar 14 días",
    popular: true,
    features: [
      "Servidores ilimitados",
      "Agente IA completo",
      "Histórico de logs en disco",
      "Marketplace integrado",
      "Automatizaciones",
      "Soporte prioritario",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Para proyectos y equipos grandes",
    monthly: null,
    annual: null,
    cta: "Hablar con ventas",
    features: [
      "Todo lo de Pro",
      "Instalación asistida",
      "Acceso para todo tu equipo",
      "SLA de soporte garantizado",
      "Recursos Urantix premium",
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Precios
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Precios simples para tu servidor
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Empieza gratis y actualiza cuando lo necesites. Sin costes
              ocultos, cancela cuando quieras.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-7 inline-flex items-center gap-3">
              <span
                className={cn(
                  "text-sm transition-colors",
                  !annual ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Mensual
              </span>
              <Switch
                checked={annual}
                onCheckedChange={setAnnual}
                aria-label="Cambiar a facturación anual"
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  annual ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Anual
              </span>
              <Badge
                variant="secondary"
                className="ml-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                Ahorra 20%
              </Badge>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <Reveal key={plan.name} delay={i * 100} className="h-full">
                <Card
                  className={cn(
                    "relative flex h-full flex-col transition-all duration-300 hover:-translate-y-1",
                    plan.popular
                      ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.06] to-transparent shadow-xl shadow-violet-500/10 lg:scale-[1.03]"
                      : "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
                  )}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-primary-foreground">
                      El más popular
                    </Badge>
                  )}
                  <CardContent className="flex h-full flex-col gap-6 p-6">
                    <div>
                      <h3 className="font-heading text-lg font-semibold">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      {price === null ? (
                        <span className="font-heading text-4xl font-semibold tracking-tight">
                          A medida
                        </span>
                      ) : (
                        <>
                          <span className="font-heading text-4xl font-semibold tracking-tight">
                            ${price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / mes
                          </span>
                        </>
                      )}
                    </div>

                    <ul className="flex flex-1 flex-col gap-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={cn(
                        "group h-10 w-full gap-2",
                        plan.popular &&
                          "bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-500"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Todos los planes incluyen cifrado de extremo a extremo y soporte
            real de la gente que construye VXCore.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
