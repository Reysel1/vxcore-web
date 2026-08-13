import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Link } from "@/i18n/navigation";

export default async function DocsLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const common = await getTranslations("common");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {common("back")}
          </Link>
          <Logo />
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="hidden lg:block">
            <DocsSidebar />
          </div>
          {/* En móvil, la navegación de docs se despliega horizontalmente. */}
          <div className="-mx-5 overflow-x-auto border-b border-border px-5 pb-3 lg:hidden">
            <DocsSidebar horizontal />
          </div>
        </aside>

        <main className="min-w-0 pb-20">{children}</main>
      </div>
    </div>
  );
}
