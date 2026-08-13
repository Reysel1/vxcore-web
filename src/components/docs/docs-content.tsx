import { ArrowRight, Info, TriangleAlert } from "lucide-react";

import { InlineText } from "@/components/site/inline-text";
import { Link } from "@/i18n/navigation";

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang?: string; lines: string[] }
  | { type: "callout"; variant: "info" | "warning"; text: string }
  | {
      type: "cards";
      items: { title: string; description: string; href: string; cta: string }[];
    }
  | { type: "table"; head: string[]; rows: string[][] };

function CodeBlock({ lang, lines }: { lang?: string; lines: string[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0a0a10]">
      {lang && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {lang}
          </span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-200">
        {lines.map((line, i) => (
          <div key={i} className={line.trim() === "" ? "h-3" : ""}>
            {line === "" ? "\u00A0" : line}
          </div>
        ))}
      </pre>
    </div>
  );
}

function Callout({
  variant,
  text,
}: {
  variant: "info" | "warning";
  text: string;
}) {
  const Icon = variant === "warning" ? TriangleAlert : Info;
  return (
    <div
      className={
        variant === "warning"
          ? "flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-sm leading-relaxed text-amber-800 dark:text-amber-200"
          : "flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3.5 text-sm leading-relaxed text-sky-800 dark:text-sky-200"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <InlineText text={text} />
      </div>
    </div>
  );
}

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-10 scroll-mt-24 font-heading text-xl font-semibold tracking-tight text-foreground first:mt-0">
          <InlineText text={block.text} />
        </h2>
      );
    case "p":
      return (
        <p className="leading-relaxed text-foreground/85">
          <InlineText text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5 text-foreground/85">
          {block.items.map((item) => (
            <li key={item} className="leading-relaxed">
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock lang={block.lang} lines={block.lines} />;
    case "callout":
      return <Callout variant={block.variant} text={block.text} />;
    case "cards":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
            >
              <h3 className="font-heading text-base font-semibold">
                {card.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {card.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-b-0"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-2.5 align-top text-foreground/85"
                    >
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

/** Cuerpo de una página de documentación con espaciado consistente. */
export function DocsContent({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
