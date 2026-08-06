import {
  Bot,
  FileCode2,
  ScrollText,
  Server,
  ShoppingBag,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";

const FEATURES = [
  {
    Icon: Server,
    title: "Consola RCON interactiva",
    description:
      "Terminal bidireccional en tiempo real con WebSocket. Envía comandos, ve la salida al instante y guarda tu historial.",
  },
  {
    Icon: ScrollText,
    title: "Logs globales",
    description:
      "Toda la salida de tu servidor filtrada por nivel y recurso. Histórico en disco y exportación con un clic.",
  },
  {
    Icon: Bot,
    title: "Agente VXCore",
    description:
      "Un copiloto de IA conectado a tu servidor: monitoriza, explica errores y aplica cambios — nada se guarda sin tu permiso.",
  },
  {
    Icon: FileCode2,
    title: "Editor de recursos",
    description:
      "Explora y edita tus recursos desde el panel, sin FTP ni acceso SSH. Guarda con copia de seguridad automática.",
  },
  {
    Icon: ShoppingBag,
    title: "Marketplace integrado",
    description:
      "Compra e instala recursos, scripts y configuraciones directamente desde la tienda Urantix, sin salir del panel.",
  },
  {
    Icon: Zap,
    title: "Automatizaciones",
    description:
      "Reinicios, comandos y acciones programadas. Define reglas y deja que VXCore se encargue del resto.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Características
            </p>
            <h2 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Todo lo que tu servidor necesita.
              <br />
              <span className="text-muted-foreground">Nada de lo que no.</span>
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              VXCore convierte la gestión de tu servidor FXServer en una
              experiencia simple, rápida y segura — desde la primera conexión
              hasta el escalado de tu comunidad.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <Reveal key={title} delay={(i % 3) * 90}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
                <CardContent className="flex flex-col gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/15 to-fuchsia-500/15 text-violet-600 ring-1 ring-inset ring-violet-500/20 transition-transform duration-300 group-hover:scale-110 dark:text-violet-400">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
