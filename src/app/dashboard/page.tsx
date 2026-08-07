import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  KeyRound,
  PackageOpen,
  ReceiptText,
} from "lucide-react";

import { auth } from "@/auth";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckoutButton,
  CopyLicenseKey,
  PaymentStatusToast,
  SignOutButton,
} from "@/components/dashboard/actions";
import { UserTickets } from "@/components/dashboard/tickets";
import {
  ensureUser,
  getActiveLicense,
  getDbError,
  getLatestInstaller,
  getUserLicense,
  hasDownloadAccess,
  hasPaid,
  listOrdersForEmail,
} from "@/lib/db";

function initials(name?: string | null) {
  if (!name) return "VX";
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatAmount(cents: number | null | undefined, currency?: string) {
  const value = (cents ?? 0) / 100;
  const symbol = currency?.toLowerCase() === "usd" ? "$" : "€";
  return `${symbol}${value.toFixed(2)}`;
}

function formatDate(sqlDate?: string | null) {
  if (!sqlDate) return "—";
  return new Date(sqlDate.replace(" ", "T") + "Z").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/?login=1");
  }

  const email = session.user.email!;
  ensureUser({
    email,
    name: session.user.name,
    image: session.user.image,
    provider: session.user.provider,
  });

  const dbError = getDbError();
  const paid = hasPaid(email);
  const access = hasDownloadAccess(email);
  const license = getActiveLicense(email);
  const installer = getLatestInstaller();
  const orders = listOrdersForEmail(email);
  const planLabel = process.env.STRIPE_PLAN_LABEL ?? "VXCore Pro";

  return (
    <div className="min-h-dvh">
      <PaymentStatusToast />

      {/* Cabecera */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a la web
          </Link>
          <Logo />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar className="size-8">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user.name ?? "Usuario"}
                />
                <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="max-w-40 truncate text-sm font-medium">
                  {session.user.name ?? email}
                </div>
                <div className="max-w-40 truncate text-xs text-muted-foreground">
                  {email}
                </div>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {dbError && (
          <div
            role="alert"
            className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-sm text-amber-700 dark:text-amber-300"
          >
            <span className="font-semibold">Base de datos no configurada.</span>{" "}
            El panel se muestra con datos vacíos y las compras no se pueden
            registrar. En producción (Vercel) configura{" "}
            <code className="font-mono text-xs">TURSO_DATABASE_URL</code> y{" "}
            <code className="font-mono text-xs">TURSO_AUTH_TOKEN</code>.
          </div>
        )}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tu panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tu suscripción, tu licencia y descarga la última versión
            del instalador.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Suscripción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {paid ? (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                ) : (
                  <PackageOpen className="size-4 text-muted-foreground" />
                )}
                Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {access ? (
                <>
                  <div>
                    <div className="text-lg font-semibold">{planLabel}</div>
                    <p className="text-sm text-muted-foreground">
                      {paid ? (
                        <>
                          Acceso activo — pago confirmado el{" "}
                          {formatDate(
                            orders.find((o) => o.status === "paid")?.paid_at as
                              | string
                              | null
                              | undefined
                          )}
                        </>
                      ) : (
                        "Acceso activo — licencia emitida por el equipo"
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
                    {paid
                      ? "Gracias por confiar en VXCore. Tu licencia y el instalador están listos abajo."
                      : "Tu acceso está activo. Si quieres apoyar el proyecto o necesitas otra licencia, escríbenos desde la web."}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-lg font-semibold">{planLabel}</div>
                    <p className="text-sm text-muted-foreground">
                      Desbloquea la descarga del instalador y tu licencia
                      personal. Pago único, cancelas cuando quieras.
                    </p>
                  </div>
                  <CheckoutButton />
                  <p className="text-xs text-muted-foreground">
                    Pagas con tarjeta o Google Pay a través de Stripe. Al
                    confirmar, tu licencia se genera automáticamente.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Instalador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="size-4 text-muted-foreground" />
                Instalador
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {installer ? (
                <>
                  <div>
                    <div className="text-lg font-semibold">
                      VXCore v{String(installer.version)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Última versión publicada
                      {Number(installer.size_bytes) > 0 &&
                        ` · ${(Number(installer.size_bytes) / 1024 / 1024).toFixed(1)} MB`}
                    </p>
                  </div>
                  {access ? (
                    <Button asChild className="h-10 w-full gap-2">
                      <a href="/api/download">
                        <Download className="size-4" />
                        Descargar VXCore v{String(installer.version)}
                      </a>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <Button className="h-10 w-full gap-2" disabled>
                        <Download className="size-4" />
                        Descargar instalador
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        La descarga se desbloquea al completar tu compra.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <div className="text-lg font-semibold">Sin versión publicada</div>
                  <p className="text-sm text-muted-foreground">
                    El equipo todavía no ha publicado un instalador. Vuelve en
                    unos días.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Licencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-muted-foreground" />
                Tu licencia
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {license ? (
                <>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <code className="font-mono text-sm tracking-wider">
                      {String(license.license_key)}
                    </code>
                    <CopyLicenseKey licenseKey={String(license.license_key)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Actívala en el panel de VXCore cuando abras el instalador.
                    Esta clave está vinculada a tu cuenta (
                    <span className="text-foreground">{email}</span>).
                  </p>
                </>
              ) : paid ? (
                <p className="text-sm text-muted-foreground">
                  Estamos generando tu licencia… si no aparece en unos segundos,
                  recarga la página.
                </p>
              ) : getUserLicense(email) ? (
                <p className="text-sm text-muted-foreground">
                  Tu licencia fue revocada. Si crees que es un error, escríbenos
                  desde la sección de contacto.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tu licencia aparecerá aquí automáticamente cuando completes el
                  pago.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pedidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ReceiptText className="size-4 text-muted-foreground" />
                Tus pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Todavía no tienes pedidos.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={String(order.id)}>
                        <TableCell>
                          <span
                            className={
                              order.status === "paid"
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }
                          >
                            {order.status === "paid" ? "Pagado" : "Pendiente"}
                          </span>
                        </TableCell>
                        <TableCell>{String(order.plan_name)}</TableCell>
                        <TableCell>
                          {formatAmount(
                            order.amount_cents as number | null,
                            order.currency as string | undefined
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.created_at as string)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tickets de soporte */}
        <div className="mt-5">
          <UserTickets />
        </div>
      </main>
    </div>
  );
}
