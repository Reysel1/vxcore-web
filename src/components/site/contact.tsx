"use client";

import { Headset, Loader2, MessageSquareText, Send } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/site/section-heading";

const CHANNELS = [
  {
    title: "Habla con el staff",
    description:
      "Tu mensaje llega directo al equipo que construye VXCore. Respondemos personalmente, sin bots.",
  },
  {
    title: "Respuesta en menos de 24 h",
    description:
      "Los mensajes se atienden en orden de llegada, de lunes a domingo.",
  },
  {
    title: "De todo",
    description:
      "Bugs, ideas, facturación, licencias o simplemente saludar. Todo es bienvenido.",
  },
];

export function Contact() {
  const [sending, setSending] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // Campo honeypot: los bots lo rellenan, las personas no.
    company: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }
      toast.success("Mensaje enviado. Te respondemos muy pronto.");
      setForm({ name: "", email: "", subject: "", message: "", company: "" });
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contacto"
      className="relative scroll-mt-24 border-t border-border/60 bg-muted/30 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          {/* Columna izquierda */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Contacto"
              title={
                <>
                  Habla con el{" "}
                  <span className="text-gradient">equipo</span>
                </>
              }
              description="¿Algo no va, necesitas una licencia de prueba o quieres proponer una función? Escríbenos y te lo resolvemos."
            />

            <div className="mt-10 flex flex-col gap-4">
              {CHANNELS.map((channel) => (
                <div
                  key={channel.title}
                  className="flex items-start gap-3.5 rounded-xl border border-border bg-background/60 p-4"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <MessageSquareText className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{channel.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha: formulario */}
          <Card className="h-fit">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Honeypot invisible (anti-bots) */}
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <Label htmlFor="contact-company">No rellenes este campo</Label>
                  <Input
                    id="contact-company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">Tu nombre</Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Alex Rivera"
                      required
                      maxLength={120}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">Tu email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-subject">Asunto</Label>
                  <Input
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    placeholder="¿En qué podemos ayudarte?"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-message">Mensaje</Label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Cuéntanos con detalle qué necesitas…"
                    required
                    maxLength={4000}
                    rows={6}
                    className="flex min-h-32 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  />
                </div>

                <Button type="submit" className="h-10 gap-2 self-start" disabled={sending}>
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {sending ? "Enviando…" : "Enviar mensaje"}
                </Button>

                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Headset className="mt-0.5 size-3.5 shrink-0" />
                  Tu mensaje lo lee el equipo real de VXCore. Nunca lo usamos
                  para spam.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
