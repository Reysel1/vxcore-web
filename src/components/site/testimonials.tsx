import { Quote, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5 fill-current drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
        />
      ))}
    </div>
  );
}

export async function Testimonials() {
  const t = await getTranslations("testimonials");
  const items = t.raw("items") as {
    quote: string;
    name: string;
    role: string;
    initials: string;
  }[];

  return (
    <section className="relative border-y border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              <span className="text-gradient">{t("titleAccent")}</span>
            </>
          }
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.name}
              className="group relative h-full overflow-hidden transition-colors duration-300 hover:ring-foreground/20"
            >
              <Quote
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-2 size-20 rotate-12 text-foreground/[0.06] transition-colors duration-500 group-hover:text-foreground/10"
              />

              <CardContent className="relative flex h-full flex-col gap-4">
                <Stars />
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                  “{item.quote}”
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-inset ring-border">
                    <span className="flex size-full items-center justify-center rounded-full text-[11px] font-semibold">
                      {item.initials}
                    </span>
                  </span>
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
