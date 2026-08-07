"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, KeyRound, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

/**
 * Garantías reales, no promesas de marketing: cada línea se corresponde con
 * algo comprobable en el código o en las cabeceras que sirve la web.
 */
const GUARANTEES = [
  {
    Icon: KeyRound,
    title: "Tu contraseña no pasa por aquí",
    text: "El inicio de sesión ocurre en Google o Discord. Nosotros solo recibimos la confirmación de que eres tú.",
  },
  {
    Icon: Eye,
    title: "Permisos mínimos",
    text: "Pedimos tu nombre, tu email y tu foto de perfil. Nada más: ni contactos, ni servidores, ni permiso para publicar.",
  },
  {
    Icon: Lock,
    title: "Sesión cifrada",
    text: "La cookie de sesión es HttpOnly y Secure: viaja solo por HTTPS y ningún script del navegador puede leerla.",
  },
  {
    Icon: ShieldCheck,
    title: "Revocable cuando quieras",
    text: "Puedes retirarle el acceso a VXCore desde los ajustes de tu cuenta de Google o Discord, sin pasar por nosotros.",
  },
];

export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const provider = (name: string) => signIn(name, { callbackUrl: "/dashboard" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 sm:grid sm:grid-cols-[1.05fr_1fr]">
        {/* Columna de confianza. Fondo oscuro fijo, así que los colores van
            explícitos: con tokens del tema, en modo claro saldría texto casi
            negro sobre negro. */}
        <aside className="hidden flex-col justify-between bg-[#0a0a10] p-7 sm:flex">
          <div>
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-zinc-100">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="mt-4 font-heading text-lg font-semibold text-zinc-50">
              Entrar es seguro
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              Usamos el inicio de sesión de Google y Discord para no manejar
              nunca tus credenciales.
            </p>

            <ul className="mt-6 space-y-4">
              {GUARANTEES.map(({ Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <div>
                    <div className="text-xs font-medium text-zinc-100">
                      {title}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-500">
            Detallamos qué datos tratamos y durante cuánto tiempo en la{" "}
            <Link
              href="/privacidad"
              className="text-zinc-300 underline underline-offset-4 transition-colors hover:text-zinc-100"
            >
              política de privacidad
            </Link>
            .
          </p>
        </aside>

        {/* Columna de acceso */}
        <div className="flex flex-col justify-center p-7">
          <DialogHeader>
            <DialogTitle className="text-xl">Inicia sesión en VXCore</DialogTitle>
            <DialogDescription>
              Conecta tu cuenta para gestionar tu servidor desde el panel. Elige
              cómo quieres entrar:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-2.5">
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

          {/* En móvil no se ve la columna de la izquierda, así que la garantía
              esencial se repite aquí en corto. */}
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground sm:hidden">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>
              Tu contraseña no pasa por VXCore: el acceso lo gestionan Google y
              Discord con los permisos mínimos.
            </span>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Al continuar aceptas los{" "}
            <Link
              href="/terminos"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              términos
            </Link>{" "}
            y la{" "}
            <Link
              href="/privacidad"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
