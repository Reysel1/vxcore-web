"use client";

import { Headset, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Msg = {
  id: number;
  sender: "user" | "staff";
  body: string;
  created_at: string;
};

const POLL_MS = 4000;

function formatTime(sqlDate?: string) {
  if (!sqlDate) return "";
  const d = new Date(sqlDate.replace(" ", "T") + "Z");
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return sameDay
    ? time
    : `${d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · ${time}`;
}

export function StaffChat() {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const lastIdRef = React.useRef(0);
  const knownIds = React.useRef<Set<number>>(new Set());

  const load = React.useCallback(async () => {
    try {
      const after = lastIdRef.current;
      const res = await fetch(`/api/chat${after ? `?after=${after}` : ""}`);
      if (res.status === 401) return;
      const data = await res.json();
      if (!Array.isArray(data.messages)) return;

      const fresh = (data.messages as Msg[]).filter(
        (m) => !knownIds.current.has(m.id)
      );
      if (fresh.length > 0) {
        fresh.forEach((m) => knownIds.current.add(m.id));
        setMessages((prev) => [...prev, ...fresh]);
        lastIdRef.current = Math.max(
          lastIdRef.current,
          ...fresh.map((m) => m.id)
        );
      }
    } catch {
      /* el polling sigue en el siguiente tick */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  // Auto-scroll cuando llegan mensajes nuevos o al abrir.
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: body }),
      });
      if (res.status === 401) {
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }
      const created = data.message as Msg;
      // El polling pudo añadir este mensaje antes que la respuesta del POST.
      if (!knownIds.current.has(created.id)) {
        knownIds.current.add(created.id);
        setMessages((prev) => [...prev, created]);
      }
      lastIdRef.current = Math.max(lastIdRef.current, created.id);
      setDraft("");
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headset className="size-4 text-muted-foreground" />
          Habla con el staff
        </CardTitle>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          El equipo responde en menos de 24 h
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex h-72 flex-col gap-2.5 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
          {loading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Cargando conversación…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 text-center">
              <Headset className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">¿En qué podemos ayudarte?</p>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Escríbenos lo que necesites: bugs, dudas con tu licencia,
                facturación o lo que sea. Te respondemos por aquí y queda
                guardado.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-1",
                  m.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed sm:max-w-[75%]",
                    m.sender === "user"
                      ? "rounded-br-md bg-foreground text-background"
                      : "rounded-bl-md border border-border bg-background"
                  )}
                >
                  {m.body}
                </div>
                <span className="px-1 text-[10px] text-muted-foreground">
                  {m.sender === "user" ? "Tú" : "Staff VXCore"} ·{" "}
                  {formatTime(m.created_at)}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Escribe tu mensaje… (Enter para enviar)"
            rows={2}
            maxLength={2000}
            className="min-h-11 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          <Button
            type="submit"
            className="h-11 gap-2 px-4"
            disabled={sending || !draft.trim()}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
