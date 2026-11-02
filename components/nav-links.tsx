"use client";

// components/nav-links.tsx
//
// Portfolio-only revamp (R2) — the three site links (Work · About · Contact),
// shared by the header and the footer. Client-side only to mark the current
// section with aria-current (no other logic).

import { Link, usePathname } from "@/i18n/navigation";

export type NavLink = { href: string; label: string; section: string };

export function NavLinks({
  links,
  className,
  linkClassName,
}: {
  links: NavLink[];
  className?: string;
  linkClassName: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {links.map((link) => {
        const current =
          pathname === link.section || pathname.startsWith(`${link.section}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={linkClassName}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
