"use client";

import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { LoginDialog } from "@/components/site/login-dialog";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Producto", href: "#product" },
  { label: "Características", href: "#features" },
  { label: "Precios", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

function initials(name?: string | null) {
  if (!name) return "VX";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const authenticated = status === "authenticated";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Si vienen a la web con ?login=1 (p. ej. al intentar entrar al panel
  // sin sesión), abrimos el login automáticamente.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") {
      const id = window.setTimeout(() => setLoginOpen(true), 0);
      window.history.replaceState({}, "", window.location.pathname);
      return () => window.clearTimeout(id);
    }
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" aria-label="VXCore — inicio">
          <Logo />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {authenticated && session.user ? (
            <>
              <Button asChild className="h-9 gap-1.5 px-3">
                <a href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Panel
                </a>
              </Button>
              <Avatar className="size-8 ring-2 ring-foreground/20">
                <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "Usuario"} />
                <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="h-9 gap-1.5 px-2 text-muted-foreground"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="h-9 px-4" onClick={() => setLoginOpen(true)}>
                Iniciar sesión
              </Button>
              <RainbowButton
                className="h-9 rounded-xl px-4"
                onClick={() => setLoginOpen(true)}
              >
                Empezar gratis
              </RainbowButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menú">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col">
              <SheetTitle className="px-4 pt-2">
                <Logo />
              </SheetTitle>
              <div className="flex flex-col gap-1 px-2 pt-2">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2 px-4 pb-6">
                {authenticated && session.user ? (
                  <>
                    <Button asChild className="w-full gap-1.5">
                      <a href="/dashboard">
                        <LayoutDashboard className="size-4" />
                        Ir a mi panel
                      </a>
                    </Button>
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                      <Avatar className="size-8">
                        <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "Usuario"} />
                        <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {session.user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {session.user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="size-4" />
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        setLoginOpen(true);
                      }}
                    >
                      Iniciar sesión
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        setLoginOpen(true);
                      }}
                    >
                      Empezar gratis
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
}
