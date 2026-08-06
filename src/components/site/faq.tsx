import { BookOpen, MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";
import { URANTIX_STORE_URL } from "@/lib/site";

const FAQS = [
  {
    q: "¿Funciona con mi servidor FXServer?",
    a: "Sí. VXCore se conecta a cualquier servidor FXServer moderno (txAdmin, standalone o tu propia configuración) a través de su consola RCON y WebSocket. En menos de 5 minutos tu servidor aparece en el panel.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Si sabes usar un navegador, sabes usar VXCore. La consola, los logs y el editor están pensados para que cualquiera del equipo pueda administrar sin miedo a romper nada.",
  },
  {
    q: "¿Puede el agente de IA romper mi servidor?",
    a: "No. El agente solo carga los cambios en el editor: nada se escribe en producción hasta que tú pulsas Guardar, y siempre queda una copia de la versión anterior para revertir.",
  },
  {
    q: "¿Qué pasa con mis recursos de la tienda Urantix?",
    a: "El marketplace de VXCore está integrado con la tienda Urantix: compra, descarga e instala recursos directamente en tu servidor desde el panel, sin FTP ni despliegues manuales.",
  },
  {
    q: "¿Puedo cambiar o cancelar el plan cuando quiera?",
    a: "Por supuesto. Sube, baja o cancela en un clic desde tu panel de facturación. Los planes anuales se prorratean si cambias antes de tiempo.",
  },
  {
    q: "¿Qué soporte incluye?",
    a: "El plan Pro incluye soporte prioritario con una primera respuesta media de menos de 2 horas. Todos los planes acceden a la documentación, la comunidad y el Discord oficial de Urantix.",
  },
];

export function Faq() {
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
                  Preguntas,{" "}
                  <span className="text-gradient">respondidas</span>
                </>
              }
              description="Todo lo que necesitas saber antes de conectar tu servidor. ¿No encuentras tu respuesta? Habla directamente con el equipo."
            />

            <Card className="mt-10 overflow-hidden">
              <div className="p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
                  <MessageCircle className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  ¿Tienes más dudas?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Nuestro equipo responde en menos de 2 horas en el Discord
                  oficial de Urantix. También tienes la documentación completa.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="gap-2">
                    <MessageCircle className="size-4" />
                    Unirme al Discord
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a
                      href={URANTIX_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpen className="size-4" />
                      Documentación
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna derecha: acordeón */}
          <Accordion type="single" collapsible className="gap-1">
            {FAQS.map((faq, i) => (
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
