"use client";

import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45c-.28 1.52-1.13 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.57-5.17 3.57-8.89z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.04c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.29v3.13C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.26c-.25-.72-.39-1.49-.39-2.26s.14-1.54.39-2.26V6.61H1.29A11.96 11.96 0 0 0 0 12c0 1.94.47 3.77 1.29 5.39l4-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l4 3.13C6.23 6.91 8.88 4.8 12 4.8z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#5865F2" aria-hidden className="size-4.5">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function LoginSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Si el usuario venía de pulsar "Comprar Pro", tras el login retomamos el
  // pago automáticamente (/dashboard?pay=1 dispara el checkout).
  const [payIntent] = React.useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("pay") === "1"
  );

  const provider = (name: string) =>
    signIn(name, {
      callbackUrl: payIntent ? "/dashboard?pay=1" : "/dashboard",
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-80 flex-col sm:w-96">
        <SheetHeader>
          <SheetTitle className="text-xl">Inicia sesión en VXCore</SheetTitle>
          <SheetDescription>
            Conecta tu cuenta para gestionar tu servidor desde el panel. Elige
            cómo quieres entrar:
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={() => provider("google")}
            className="h-11 gap-2.5 text-sm"
          >
            <GoogleIcon />
            Continuar con Google
          </Button>
          <Button
            variant="outline"
            onClick={() => provider("discord")}
            className="h-11 gap-2.5 text-sm"
          >
            <DiscordIcon />
            Continuar con Discord
          </Button>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              Tus credenciales nunca se comparten. Usamos los permisos mínimos
              de OAuth para identificar tu cuenta.
            </span>
          </div>
          <Button
            variant="ghost"
            className="gap-1.5 text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
