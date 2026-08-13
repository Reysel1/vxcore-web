import * as React from "react";

/**
 * Convierte marcado inline mínimo a JSX:
 *   **negrita** → <strong> · *cursiva* → <em>
 *   `codigo` → <code> · [texto](url) → <a>
 *
 * Lo usan las páginas legales y la documentación, cuyos textos viven en los
 * ficheros de mensajes (JSON) y necesitan formato sin duplicar JSX.
 */
const TOKEN_RE =
  /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

function renderToken(token: string, key: number): React.ReactNode {
  if (token.startsWith("`")) {
    return (
      <code
        key={key}
        className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
      >
        {token.slice(1, -1)}
      </code>
    );
  }
  if (token.startsWith("**")) {
    return <strong key={key}>{token.slice(2, -2)}</strong>;
  }
  if (token.startsWith("[") && token.includes("](")) {
    const close = token.indexOf("](");
    const label = token.slice(1, close);
    const url = token.slice(close + 2, -1);
    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-foreground"
      >
        {label}
      </a>
    );
  }
  if (token.startsWith("*")) {
    return <em key={key}>{token.slice(1, -1)}</em>;
  }
  return token;
}

export function InlineText({ text }: { text: string }) {
  const parts = text.split(TOKEN_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? renderToken(part, i) : part
      )}
    </>
  );
}
