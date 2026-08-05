// components/logout-button.tsx
//
// Server Component — a plain <form> posting to the shared logout Server
// Action. No client JS required for this interaction.

import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth-actions";

export function LogoutButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          "text-caption text-ink transition-colors hover:text-sky-deep"
        }
      >
        {children}
      </button>
    </form>
  );
}
