import Image from "next/image";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15 shadow-sm shadow-black/30",
        className
      )}
    >
      {/* Dos ficheros en vez de `useTheme`: el cambio lo hace CSS, así el logo
          correcto ya viene en el HTML del servidor y no parpadea al hidratar. */}
      <Image
        src="/brand/light.png"
        alt=""
        fill
        sizes="32px"
        className="object-cover dark:hidden"
        aria-hidden
      />
      <Image
        src="/brand/dark.png"
        alt=""
        fill
        sizes="32px"
        className="hidden object-cover dark:block"
        aria-hidden
      />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-heading text-lg font-semibold tracking-tight">
        VXCore
      </span>
    </span>
  );
}
