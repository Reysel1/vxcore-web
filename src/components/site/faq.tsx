import { BookOpen, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";
import { Link } from "@/i18n/navigation";

export async function Faq() {
  const t = await getTranslations("faq");
  const faqs = t.raw("items") as { q: string; a: string }[];

  return (
    <section
      id="faq"
      className="relative scroll-mt-24 border-t border-border/60 bg-muted/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          {/* Columna izquierda: cabecera + soporte */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title={
                <>
                  {t("title1")}{" "}
                  <span className="text-gradient">{t("titleAccent")}</span>
                </>
              }
              description={t("description")}
            />

            <Card className="mt-10 overflow-hidden">
              <div className="p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
                  <MessageCircle className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {t("moreTitle")}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t("moreText")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="gap-2">
                    <MessageCircle className="size-4" />
                    {t("joinDiscord")}
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/docs">
                      <BookOpen className="size-4" />
                      {t("documentation")}
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna derecha: acordeón */}
          <Accordion type="single" collapsible className="gap-1">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="group rounded-xl border border-border bg-card px-5 transition-colors not-last:mb-2 hover:border-foreground/20 data-open:border-foreground/30"
              >
                <AccordionTrigger className="gap-3 py-4 text-base font-medium transition-colors hover:no-underline group-data-open:[&_[data-slot=accordion-trigger-icon]]:text-foreground">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
