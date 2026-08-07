import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SITE_NAME, SITE_URL, URANTIX_STORE_URL } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "VXCore — El sistema operativo de tu servidor FXServer";
const DESCRIPTION =
  "VXCore une servidores, recursos, logs y automatizaciones en un solo panel — con un agente de IA que monitoriza, edita y responde a tu servidor en tiempo real.";

export const metadata: Metadata = {
  // Sin metadataBase, Next avisa en el build y las rutas relativas de Open
  // Graph no se resuelven a absolutas, que es lo que exigen las redes.
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Las páginas hijas ponen solo su nombre y aquí se completa la marca.
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "FiveM",
    "FXServer",
    "panel FiveM",
    "panel de control FiveM",
    "servidor FiveM",
    "RCON FiveM",
    "hosting FiveM",
    "txAdmin alternativa",
    "administrar servidor FiveM",
    "automatizaciones FiveM",
  ],
  authors: [{ name: "Urantix", url: URANTIX_STORE_URL }],
  creator: "Urantix",
  publisher: "Urantix",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    // Las imágenes las aportan opengraph-image.tsx y twitter-image.tsx: Next
    // genera la URL con su hash y la inyecta sola. Ponerlas a mano aquí daba
    // una ruta que en producción no coincide con la generada.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
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
      </body>
    </html>
  );
}
