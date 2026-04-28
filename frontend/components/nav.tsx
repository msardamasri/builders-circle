"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard",     label: "Dashboard"      },
  { href: "/builders",      label: "Builders"       },
  { href: "/matches",       label: "Matches"        },
  { href: "/introductions", label: "Introductions"  },
];

export function Nav() {
  const path = usePathname();
  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 52,
      background: "var(--white)", borderBottom: "1px solid var(--gray-200)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", zIndex: 100,
    }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--black)", letterSpacing: "-0.01em" }}>
        Builders Circle
      </span>
      <nav style={{ display: "flex", gap: 4 }}>
        {links.map(l => {
          const active = path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "background 0.12s",
              background: active ? "var(--black)" : "transparent",
              color: active ? "var(--white)" : "var(--gray-600)",
            }}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>b2venture</span>
    </header>
  );
}