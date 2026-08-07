"use client";

import {
  CheckCircle2,
  Headset,
  Loader2,
  Send,
  Star,
  Ticket,
  TicketPlus,
  TicketX,
} from "lucide-react";
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

type Ticket = {
  id: number;
  user_email: string;
  subject: string | null;
  status: "open" | "closed";
  rating: number | null;
  rating_comment: string | null;
  closed_at: string | null;
  rated_at: string | null;
  created_at: string;
};

const POLL_MS = 4000;

function formatTime(sqlDate?: string) {
  if (!sqlDate) return "";
  const d = new Date(sqlDate.replace(" ", "T") + "Z");
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return sameDay
    ? time
    : `${d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · ${time}`;
}

/** Estrellas de solo lectura (p. ej. para mostrar una valoración guardada). */
function StarRating({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Valoración: ${value} de 5`}
    >
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
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

  // Estado del ticket del usuario.
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [subject, setSubject] = React.useState("");
  const [opening, setOpening] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [showOpenForm, setShowOpenForm] = React.useState(false);
  const [ratingDismissed, setRatingDismissed] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingComment, setRatingComment] = React.useState("");
  const [ratingSending, setRatingSending] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const after = lastIdRef.current;
      const res = await fetch(`/api/chat${after ? `?after=${after}` : ""}`);
      if (res.status === 401) return;
      const data = await res.json();
      if (!Array.isArray(data.messages)) return;

      // El ticket viaja con los mensajes: se mantiene al día en cada poll.
      if (data.ticket) setTicket(data.ticket as Ticket);

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

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    if (opening) return;

    setOpening(true);
    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      if (res.status === 401) {
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo abrir el ticket.");
        return;
      }
      setTicket(data.ticket as Ticket);
      setSubject("");
      setShowOpenForm(false);
      // Reiniciamos la valoración: no debe arrastrarse entre tickets.
      setRating(0);
      setRatingHover(0);
      setRatingComment("");
      setRatingDismissed(false);
      toast.success("Ticket abierto. Escríbenos lo que necesites.");
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setOpening(false);
    }
  }

  async function handleClose() {
    if (closing || !ticket) return;

    setClosing(true);
    try {
      const res = await fetch("/api/ticket/close", { method: "POST" });
      if (res.status === 401) {
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo cerrar el ticket.");
        return;
      }
      setTicket(data.ticket as Ticket);
      // Al cerrar, el usuario ve la valoración.
      setRatingDismissed(false);
      toast.success("Ticket cerrado. ¡Gracias!");
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setClosing(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (ratingSending || !ticket || rating < 1) return;

    setRatingSending(true);
    try {
      const res = await fetch("/api/ticket/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          rating,
          comment: ratingComment,
        }),
      });
      if (res.status === 401) {
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo enviar la valoración.");
        return;
      }
      setTicket(data.ticket as Ticket);
      toast.success("¡Gracias por tu valoración!");
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setRatingSending(false);
    }
  }

  const ticketOpen = ticket?.status === "open";
  const ticketClosedUnrated =
    ticket?.status === "closed" && ticket.rating == null;
  const ticketClosedRated =
    ticket?.status === "closed" && ticket.rating != null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headset className="size-4 text-muted-foreground" />
          Habla con el staff
        </CardTitle>
        {ticket && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              ticketOpen
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : ticketClosedUnrated
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-muted/40 text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                ticketOpen
                  ? "bg-emerald-500"
                  : ticketClosedUnrated
                    ? "bg-amber-500"
                    : "bg-muted-foreground/50"
              )}
            />
            {ticketOpen
              ? `Ticket #${ticket.id} abierto`
              : ticketClosedUnrated
                ? `Ticket #${ticket.id} cerrado · valóralo`
                : `Ticket #${ticket.id} cerrado · ★ ${ticket.rating}/5`}
          </span>
        )}
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
                Abre un ticket y escríbenos lo que necesites: bugs, dudas con
                tu licencia, facturación o lo que sea. Te respondemos por aquí
                y queda guardado.
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

        {/* Zona inferior: composer o acciones del ticket */}
        {loading && !ticket ? (
          <div className="flex h-12 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Cargando…
          </div>
        ) : ticketOpen ? (
          <>
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
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                {ticket.subject
                  ? `${ticket.subject}`
                  : "Cuéntanos qué necesitas."}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={closing}
                className="shrink-0 gap-1.5 text-muted-foreground hover:text-destructive"
              >
                {closing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <TicketX className="size-3.5" />
                )}
                Cerrar ticket
              </Button>
            </div>
          </>
        ) : ticketClosedUnrated && !ratingDismissed ? (
          /* Ticket cerrado y sin valorar: pedimos la valoración */
          <form
            onSubmit={handleRate}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <p className="text-sm font-medium">
                ¿Cómo valoras la atención recibida?
              </p>
            </div>
            <div
              className="mt-3 flex items-center gap-1"
              onMouseLeave={() => setRatingHover(0)}
            >
              {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setRatingHover(n)}
                  onClick={() => setRating(n)}
                  className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Star
                    className={cn(
                      "size-7",
                      (ratingHover || rating) >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="¿Algo que quieras comentar? (opcional)"
              rows={2}
              maxLength={500}
              className="mt-3 min-h-11 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRatingDismissed(true)}
                className="text-muted-foreground"
              >
                Ahora no
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={rating < 1 || ratingSending}
              >
                {ratingSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Star className="size-4" />
                )}
                Enviar valoración
              </Button>
            </div>
          </form>
        ) : (
          /* Sin ticket abierto: el usuario puede abrir uno */
          <form
            onSubmit={handleOpen}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center gap-2">
              <Ticket className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {ticketClosedRated
                  ? "¿Necesitas ayuda de nuevo?"
                  : "Abre un ticket para poder escribirnos"}
              </p>
            </div>
            {ticketClosedRated && !showOpenForm ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Gracias por tu valoración
                  <StarRating value={Number(ticket.rating)} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOpenForm(true)}
                  className="gap-1.5"
                >
                  <TicketPlus className="size-3.5" />
                  Abrir nuevo ticket
                </Button>
              </div>
            ) : (
              <>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="¿Sobre qué necesitas ayuda? (opcional)"
                  maxLength={120}
                  className="mt-3 h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                />
                <div className="mt-3">
                  <Button type="submit" className="gap-2" disabled={opening}>
                    {opening ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <TicketPlus className="size-4" />
                    )}
                    Abrir ticket
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
