"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routeShortcutFor } from "@/lib/accessibility/guide";
import { PROJECT } from "@/config/project";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="site-nav">
      {PROJECT.nav.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-keyshortcuts={routeShortcutFor(item.href)}
            className="nav-link"
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
