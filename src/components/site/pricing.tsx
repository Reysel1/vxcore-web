"use client";

import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Link, useRouter } from "@/i18n/navigation";
import { startCheckout } from "@/lib/checkout";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  popular?: boolean;
  features: string[];
};

export function Pricing() {
  const t = useTranslations("pricing");
  const router = useRouter();
  const [annual, setAnnual] = React.useState(true);
  const [checkingOut, setCheckingOut] = React.useState(false);

  const plans = t.raw("plans") as Plan[];

  // Lanza el checkout de Stripe. Si no hay sesión, primero se pide login y
  // después se retoma el pago solo (con la intención ?pay=1).
  async function handleProCheckout() {
    if (checkingOut) return;
    setCheckingOut(true);
    const result = await startCheckout();
    if (result === "login") {
      router.push({ pathname: "/", query: { login: "1", pay: "1" } });
    }
    setCheckingOut(false);
  }

  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
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

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background/70 px-4 py-2 shadow-sm backdrop-blur-sm dark:bg-white/[0.03]">
              <span
                className={cn(
                  "text-sm transition-colors",
                  !annual ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t("monthly")}
              </span>
              <Switch
                checked={annual}
                onCheckedChange={setAnnual}
                aria-label={t("billingAria")}
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  annual ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t("annual")}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {t("save")}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <Reveal key={plan.name} delay={i * 100} className="h-full">
                <Card
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden transition-colors duration-300",
                    plan.popular
                      ? "border-foreground/30 bg-foreground/[0.03] ring-foreground/10 lg:scale-[1.03]"
                      : "hover:ring-foreground/20"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
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
                          {t("custom")}
                        </span>
                      ) : (
                        <>
                          <span className="font-heading text-4xl font-semibold tracking-tight">
                            ${price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {t("perMonth")}
                          </span>
                        </>
                      )}
                    </div>

                    <ul className="flex flex-1 flex-col gap-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                            <Check className="size-3" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {plan.popular ? (
                      /* Pro: inicia el pago con Stripe */
                      <Button
                        variant="default"
                        className="group/btn h-10 w-full gap-2"
                        onClick={handleProCheckout}
                        disabled={checkingOut}
                      >
                        {checkingOut ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            {t("opening")}
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </>
                        )}
                      </Button>
                    ) : plan.name === "Enterprise" ? (
                      /* Enterprise: contacto comercial */
                      <Button
                        asChild
                        variant="outline"
                        className="group/btn h-10 w-full gap-2"
                      >
                        <a href="#contacto">
                          {plan.cta}
                          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </a>
                      </Button>
                    ) : (
                      /* Starter: gratis — al panel (y login si hace falta) */
                      <Button
                        asChild
                        variant="outline"
                        className="group/btn h-10 w-full gap-2"
                      >
                        <Link href="/dashboard">
                          {plan.cta}
                          <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-foreground/50" />
            {t("guarantee")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
