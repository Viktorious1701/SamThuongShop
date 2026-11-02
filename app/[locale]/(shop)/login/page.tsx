import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="mx-auto max-w-md px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <h1 className="text-h1 text-ink">{t("loginTitle")}</h1>
      <div className="mt-8 rounded-md border border-border bg-surface p-gutter">
        <LoginForm />
      </div>
    </div>
  );
}
