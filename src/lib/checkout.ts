"use client";

import { toast } from "sonner";

/**
 * Inicia el checkout de Stripe llamando a /api/checkout.
 *
 * Devuelve:
 *  - "redirected": ya se navegó a la URL de Stripe.
 *  - "login": falta sesión (el llamador debe mandar al login).
 *  - "error": algo falló (ya se mostró el toast).
 */
export async function startCheckout(): Promise<
  "redirected" | "login" | "error"
> {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.status === 401) return "login";
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return "redirected";
    }
    toast.error(data.error ?? "No se pudo iniciar el pago.");
  } catch {
    toast.error("Error de red. Inténtalo de nuevo.");
  }
  return "error";
}
