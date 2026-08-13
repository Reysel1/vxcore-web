import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DocsPage } from "@/components/docs/docs-page";
import { localizedAlternates } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docs.installation" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/docs/instalacion"),
  };
}

export default async function DocsInstallationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocsPage namespace="docs.installation" />;
}
