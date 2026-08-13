import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  LegalPage,
  type LegalSection,
} from "@/components/site/legal-page";
import { localizedAlternates } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/terminos"),
  };
}

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  const sections = t.raw("sections") as LegalSection[];

  return (
    <LegalPage title={t("title")} intro={t("intro")} sections={sections} />
  );
}
