"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, CreditCard, Loader2, LogOut } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Botón de pago con Stripe                                            */
/* ------------------------------------------------------------------ */

export function CheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.status === 401) {
        // Sesión caducada: de vuelta al login.
        router.push("/?login=1");
        return;
      }
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error ?? "No se pudo iniciar el pago.");
    } catch {
      toast.error("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="h-10 w-full gap-2" onClick={handleCheckout} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CreditCard className="size-4" />
      )}
      {loading ? "Abriendo pago…" : "Pagar con Stripe"}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Copiar la clave de licencia                                         */
/* ------------------------------------------------------------------ */

export function CopyLicenseKey({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(licenseKey);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = licenseKey;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast.success("Licencia copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 font-mono text-xs"
      onClick={copy}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copiada" : "Copiar"}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Cerrar sesión                                                       */
/* ------------------------------------------------------------------ */

export function SignOutButton({ variant = "outline" }: { variant?: "outline" | "ghost" }) {
  return (
    <Button
      variant={variant}
      size="sm"
      className="gap-1.5 text-muted-foreground"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-4" />
      Salir
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Avisos tras volver de Stripe (?success / ?canceled)                 */
/* ------------------------------------------------------------------ */

export function PaymentStatusToast() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      toast.success("Pago recibido. Tu licencia ya está disponible.");
      window.history.replaceState({}, "", "/dashboard");
    } else if (params.get("canceled") === "1") {
      toast.info("Pago cancelado. Puedes intentarlo cuando quieras.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  return null;
}
