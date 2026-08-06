import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { LogoutButton } from "@/components/logout-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("accountTitle") };
}

// Page-level guard (Dev Notes: no middleware change this story — /account
// guards itself here; route-guarding via proxy.ts arrives with the
// operator/admin shell in Story 1.5).
export default async function AccountPage() {
  const session = await auth();
  const locale = await getLocale();
  const user = session?.user;

  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Auth");

  return (
    <div className="mx-auto max-w-md px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <h1 className="text-h1 text-ink">{t("accountTitle")}</h1>
      <div className="mt-8 space-y-4 rounded-md border border-border bg-surface p-gutter">
        <p className="text-body text-ink-muted">{t("signedInAs")}</p>
        <p className="text-h3 text-ink">{user.email}</p>
        <LogoutButton>{t("logoutNav")}</LogoutButton>
      </div>
    </div>
  );
}
