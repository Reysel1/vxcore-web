"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, Copy, CreditCard, Loader2, LogOut } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { getPathname, useRouter } from "@/i18n/navigation";
import { startCheckout } from "@/lib/checkout";

/* ------------------------------------------------------------------ */
/* Botón de pago con Stripe                                            */
/* ------------------------------------------------------------------ */

export function CheckoutButton() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [loading, setLoading] = React.useState(false);

  async function handleCheckout() {
    setLoading(true);
    const result = await startCheckout();
    if (result === "login") {
      // Sesión caducada: de vuelta al login.
      router.push({ pathname: "/", query: { login: "1" } });
    }
    setLoading(false);
  }

  return (
    <Button className="h-10 w-full gap-2" onClick={handleCheckout} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CreditCard className="size-4" />
      )}
      {loading ? t("opening") : t("payStripe")}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Copiar la clave de licencia                                         */
/* ------------------------------------------------------------------ */

export function CopyLicenseKey({ licenseKey }: { licenseKey: string }) {
  const t = useTranslations("dashboard");
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
    toast.success(t("copiedToast"));
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
      {copied ? t("copied") : t("copy")}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Pago automático al llegar con intención de compra (?pay=1)          */
/* ------------------------------------------------------------------ */

export function AutoCheckout() {
  const router = useRouter();
  const locale = useLocale();
  const dashboardPath = getPathname({ href: "/dashboard", locale });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pay") !== "1") return;

    (async () => {
      const result = await startCheckout();
      if (result === "login") {
        router.push({ pathname: "/", query: { login: "1" } });
        return;
      }
      // Si nos quedamos en la página (error o Stripe sin configurar),
      // limpiamos el intento para que recargar no reintente el pago solo.
      window.history.replaceState({}, "", dashboardPath);
    })();
  }, [router, dashboardPath]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Cerrar sesión                                                       */
/* ------------------------------------------------------------------ */

export function SignOutButton({ variant = "outline" }: { variant?: "outline" | "ghost" }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const homePath = getPathname({ href: "/", locale });

  return (
    <Button
      variant={variant}
      size="sm"
      className="gap-1.5 text-muted-foreground"
      onClick={() => signOut({ callbackUrl: homePath })}
    >
      <LogOut className="size-4" />
      {t("logout")}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Avisos tras volver de Stripe (?success / ?canceled)                 */
/* ------------------------------------------------------------------ */

export function PaymentStatusToast() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const dashboardPath = getPathname({ href: "/dashboard", locale });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      toast.success(t("successToast"));
      window.history.replaceState({}, "", dashboardPath);
    } else if (params.get("canceled") === "1") {
      toast.info(t("canceledToast"));
      window.history.replaceState({}, "", dashboardPath);
    }
  }, [t, dashboardPath]);

  return null;
}
