import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/reveal";

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
    <section id="faq" className="scroll-mt-24 border-t border-border/60 bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
              FAQ
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Preguntas, respondidas
            </h2>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <Accordion type="single" collapsible className="mt-10 gap-1">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="rounded-xl border-border bg-card px-5 not-last:mb-2 [&[data-state=open]]:border-border"
              >
                <AccordionTrigger className="text-base font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
