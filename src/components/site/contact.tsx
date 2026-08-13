"use client";

import { Headset, Loader2, MessageSquareText, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/site/section-heading";

export function Contact() {
  const t = useTranslations("contact");
  const form = useTranslations("contact.form");
  const toasts = useTranslations("contact.toasts");
  const channels = t.raw("channels") as { title: string; description: string }[];
  const [sending, setSending] = React.useState(false);
  const [formState, setFormState] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // Campo honeypot: los bots lo rellenan, las personas no.
    company: "",
  });

  function update(field: keyof typeof formState, value: string) {
    setFormState((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? toasts("error"));
        return;
      }
      toast.success(toasts("success"));
      setFormState({ name: "", email: "", subject: "", message: "", company: "" });
    } catch {
      toast.error(toasts("network"));
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
              eyebrow={t("eyebrow")}
              title={
                <>
                  {t("title1")}{" "}
                  <span className="text-gradient">{t("titleAccent")}</span>
                </>
              }
              description={t("description")}
            />

            <div className="mt-10 flex flex-col gap-4">
              {channels.map((channel) => (
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
                  <Label htmlFor="contact-company">{form("honeypot")}</Label>
                  <Input
                    id="contact-company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formState.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">{form("name")}</Label>
                    <Input
                      id="contact-name"
                      value={formState.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={form("namePlaceholder")}
                      required
                      maxLength={120}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">{form("email")}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder={form("emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-subject">{form("subject")}</Label>
                  <Input
                    id="contact-subject"
                    value={formState.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    placeholder={form("subjectPlaceholder")}
                    required
                    maxLength={200}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-message">{form("message")}</Label>
                  <textarea
                    id="contact-message"
                    value={formState.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder={form("messagePlaceholder")}
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
                  {sending ? form("sending") : form("send")}
                </Button>

                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Headset className="mt-0.5 size-3.5 shrink-0" />
                  {form("note")}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
