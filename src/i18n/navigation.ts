import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Versiones de Link / redirect / useRouter / usePathname que conocen el
 * prefijo de idioma: un `<Link href="/dashboard">` renderiza `/dashboard`
 * en español y `/en/dashboard` en inglés sin tocar el resto del código.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

/**
 * Redirige a la portada con `?login=1` (abre el diálogo de acceso) en el
 * idioma actual. El tipo explícito `never` permite a TypeScript estrechar
 * el flujo tras la llamada, cosa que el redirect genérico no garantiza con
 * href en forma de objeto.
 */
export function redirectToLogin(locale: string): never {
  return redirect({
    href: { pathname: "/", query: { login: "1" } },
    locale,
  });
}
