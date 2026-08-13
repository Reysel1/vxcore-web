import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { routing } from "@/i18n/routing";
import {
  SITE_NAME,
  SITE_URL,
  URANTIX_STORE_URL,
  localizedAlternates,
} from "@/lib/site";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const alternates = localizedAlternates(locale, "/");

  return {
    // Sin metadataBase, Next avisa en el build y las rutas relativas de Open
    // Graph no se resuelven a absolutas, que es lo que exigen las redes.
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      // Las páginas hijas ponen solo su nombre y aquí se completa la marca.
      template: `%s — ${SITE_NAME}`,
    },
    description: t("description"),
    applicationName: SITE_NAME,
    keywords: [
      "FiveM",
      "FXServer",
      "VXCore",
      "panel FiveM",
      "FiveM panel",
      "FiveM hosting",
      "FiveM server management",
      "RCON",
    ],
    authors: [{ name: "Urantix", url: URANTIX_STORE_URL }],
    creator: "Urantix",
    publisher: "Urantix",
    alternates,
    openGraph: {
      type: "website",
      locale,
      url: SITE_URL,
      siteName: SITE_NAME,
      title: t("title"),
      description: t("description"),
      // Las imágenes las aportan opengraph-image.tsx y twitter-image.tsx: Next
      // genera la URL con su hash y la inyecta sola. Ponerlas a mano aquí daba
      // una ruta que en producción no coincide con la generada.
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      site: "@vxcorex",
      creator: "@vxcorex",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    category: "technology",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
