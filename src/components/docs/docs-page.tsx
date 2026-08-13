import { getTranslations } from "next-intl/server";

import { DocsContent, type DocBlock } from "@/components/docs/docs-content";

export async function DocsPage({ namespace }: { namespace: string }) {
  const t = await getTranslations(namespace);
  const blocks = t.raw("blocks") as DocBlock[];

  return (
    <article>
      <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
        {t("description")}
      </p>
      <div className="mt-8">
        <DocsContent blocks={blocks} />
      </div>
    </article>
  );
}
