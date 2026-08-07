"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquareText,
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
  ticket_id: number | null;
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
  last_body: string | null;
};

const TICKET_POLL_MS = 5000;
const MSG_POLL_MS = 4000;

function formatDate(sqlDate?: string | null) {
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

/** Estrellas de solo lectura para mostrar una valoración guardada. */
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
            "size-3.5",
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

function StatusChip({ status }: { status: "open" | "closed" }) {
  return status === "open" ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Abierto
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      Cerrado
    </span>
  );
}

export function UserTickets() {
  const router = useRouter();

  // Tickets del usuario.
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const selectedIdRef = React.useRef<number | null>(null);

  // Mensajes del ticket seleccionado.
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [draft, setDraft] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const lastIdRef = React.useRef(0);
  const knownIds = React.useRef<Set<number>>(new Set());

  // Acciones y formularios.
  const [subject, setSubject] = React.useState("");
  const [opening, setOpening] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [showOpenForm, setShowOpenForm] = React.useState(false);
  const [ratingDismissed, setRatingDismissed] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [ratingHover, setRatingHover] = React.useState(0);
  const [ratingComment, setRatingComment] = React.useState("");
  const [ratingSending, setRatingSending] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());

  const openTicket = tickets.find((t) => t.status === "open") ?? null;
  const selected = tickets.find((t) => t.id === selectedId) ?? openTicket ?? null;
  const selectedOpen = selected?.status === "open";
  const selectedUnrated =
    !!selected &&
    selected.status === "closed" &&
    selected.rating == null &&
    !ratingDismissed;
  const showCreateForm =
    !openTicket && (tickets.length === 0 || showOpenForm);

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  /* ---------- lista de tickets ---------- */
  const loadTickets = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.status === 401) {
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data.tickets)) return;
      const list = data.tickets as Ticket[];
      setTickets(list);
      // Selección por defecto: el ticket abierto o, si no, el más reciente.
      if (selectedIdRef.current == null) {
        const def = list.find((t) => t.status === "open") ?? list[0] ?? null;
        if (def) {
          selectedIdRef.current = Number(def.id);
          setSelectedId(Number(def.id));
        }
      }
    } catch {
      /* noop */
    } finally {
      // La lista terminó de cargar (aunque esté vacía): salir del spinner.
      setLoading(false);
    }
  }, [router]);

  /* ---------- mensajes del ticket seleccionado ---------- */
  const loadMessages = React.useCallback(async (ticketId: number) => {
    try {
      const after = lastIdRef.current;
      const res = await fetch(
        `/api/chat?ticket=${ticketId}${after ? `&after=${after}` : ""}`
      );
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
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const t1 = window.setTimeout(() => loadTickets(), 0);
    const ticketsTimer = window.setInterval(loadTickets, TICKET_POLL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearInterval(ticketsTimer);
    };
  }, [loadTickets]);

  // Al cambiar de ticket, recargamos su conversación desde cero.
  React.useEffect(() => {
    if (!selectedId) return;
    lastIdRef.current = 0;
    knownIds.current.clear();
    const t1 = window.setTimeout(() => setMessages([]), 0);
    const t2 = window.setTimeout(() => loadMessages(selectedId), 0);
    const id = window.setInterval(() => loadMessages(selectedId), MSG_POLL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearInterval(id);
    };
  }, [selectedId, loadMessages]);

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
      if (!knownIds.current.has(created.id)) {
        knownIds.current.add(created.id);
        setMessages((prev) => [...prev, created]);
      }
      lastIdRef.current = Math.max(lastIdRef.current, created.id);
      setDraft("");
      loadTickets();
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
      const created = data.ticket as Ticket;
      setSubject("");
      setShowOpenForm(false);
      setRating(0);
      setRatingHover(0);
      setRatingComment("");
      setRatingDismissed(false);
      selectedIdRef.current = Number(created.id);
      setSelectedId(Number(created.id));
      toast.success("Ticket abierto. Escríbenos lo que necesites.");
      await loadTickets();
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setOpening(false);
    }
  }

  async function handleClose() {
    if (closing || !selected) return;

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
      setRatingDismissed(false);
      toast.success("Ticket cerrado. ¡Gracias!");
      await loadTickets();
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setClosing(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (ratingSending || !selected || rating < 1) return;

    setRatingSending(true);
    try {
      const res = await fetch("/api/ticket/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selected.id,
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
      toast.success("¡Gracias por tu valoración!");
      await loadTickets();
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setRatingSending(false);
    }
  }

  const conversation = (
    <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/20">
      {messages.length === 0 ? (
        <p className="px-3.5 py-6 text-center text-sm text-muted-foreground">
          {selectedOpen
            ? "Este ticket está listo para empezar. Escríbenos y te responderemos aquí."
            : "Esta conversación no tiene mensajes."}
        </p>
      ) : (
        <div className="divide-y divide-border">
          {messages.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-2.5 px-3.5 py-2.5"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  m.sender === "user"
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground ring-1 ring-border"
                )}
              >
                {m.sender === "user" ? "Tú" : "Staff"}
              </span>
              <p className="min-w-0 flex-1 text-sm leading-relaxed">
                {m.body}
              </p>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {formatDate(m.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="size-4 text-muted-foreground" />
          Tickets de soporte
        </CardTitle>
        {tickets.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {tickets.filter((t) => t.status === "open").length} abiertos ·{" "}
            {tickets.filter((t) => t.status === "closed").length} cerrados
          </span>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {loading && tickets.length === 0 ? (
          <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Cargando…
          </div>
        ) : (
          <>
            {/* Lista de tickets */}
            {tickets.length > 0 && (
              <div className="flex flex-col gap-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      selectedIdRef.current = t.id;
                      setSelectedId(t.id);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      selected?.id === t.id
                        ? "border-foreground/40 bg-muted"
                        : "border-border bg-background hover:border-foreground/25"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {t.subject ?? `Ticket #${t.id}`}
                        </span>
                        {t.rating != null && <StarRating value={t.rating} />}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        Ticket #{t.id} · {formatDate(t.created_at)}
                        {t.last_body ? ` · ${t.last_body}` : ""}
                      </div>
                    </div>
                    <StatusChip status={t.status} />
                  </button>
                ))}
              </div>
            )}

            {showCreateForm ? (
              /* Sin ticket abierto: formulario para abrir uno */
              <form
                onSubmit={handleOpen}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <TicketPlus className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {tickets.length > 0
                      ? "¿Necesitas ayuda de nuevo?"
                      : "Crea un ticket para escribirnos"}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Cuéntanos brevemente tu problema o duda. Te respondemos aquí
                  y todo queda guardado en el ticket.
                </p>
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
              </form>
            ) : selected ? (
              <>
                {/* Cabecera del ticket seleccionado */}
                <div className="rounded-xl border border-border bg-muted/20 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {selected.subject ?? `Ticket #${selected.id}`}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Ticket #{selected.id} · abierto{" "}
                        {formatDate(selected.created_at)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {selected.rating != null && (
                        <StarRating value={selected.rating} />
                      )}
                      {selectedOpen ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClose}
                          disabled={closing}
                          className="gap-1.5 text-muted-foreground hover:text-destructive"
                        >
                          {closing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <TicketX className="size-3.5" />
                          )}
                          Cerrar ticket
                        </Button>
                      ) : (
                        <StatusChip status={selected.status} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Conversación del ticket */}
                {selectedOpen ? (
                  conversation
                ) : expanded.has(selected.id) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(selected.id)}
                      className="flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronUp className="size-3.5" />
                      Ocultar conversación
                    </button>
                    {conversation}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(selected.id)}
                    className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MessageSquareText className="size-4" />
                    Ver conversación ({messages.length} mensajes)
                    <ChevronDown className="size-4" />
                  </button>
                )}

                {/* Pie según el estado */}
                {selectedOpen ? (
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
                ) : selectedUnrated ? (
                  /* Ticket cerrado sin valorar: pedimos la valoración */
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
                  /* Ticket cerrado (valorado o sin valorar): resumen */
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      {selected.rating != null ? (
                        <>
                          Gracias por tu valoración
                          <StarRating value={selected.rating} />
                        </>
                      ) : (
                        "Ticket cerrado. Si necesitas algo más, abre un nuevo ticket."
                      )}
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
                )}
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
