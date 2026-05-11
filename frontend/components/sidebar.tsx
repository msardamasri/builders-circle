"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const links = [
  { href: "/dashboard",     label: "Dashboard",     icon: "▦" },
  { href: "/applications",  label: "Applications",  icon: "✎" },
  { href: "/builders",      label: "Builders",      icon: "◯" },
  { href: "/matches",       label: "Matches",       icon: "◇" },
  { href: "/introductions", label: "Introductions", icon: "→" },
  { href: "/events",        label: "Events",        icon: "✦" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 220,
      background: "var(--bg)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", padding: "20px 0",
      zIndex: 100,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 20px 22px", borderBottom: "1px solid var(--border-soft)",
      }}>
        <span style={{ color: "var(--text)" }}><Logo size={26} /></span>
        <div>
          <p style={{
            margin: 0, fontFamily: "var(--font-display)",
            fontSize: 14, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.01em",
          }}>
            Builders' Circle
          </p>
          <p style={{
            margin: 0, fontSize: 9, color: "var(--text-faint)",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            DRI · b2venture
          </p>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "16px 12px" }}>
        {links.map(l => {
          const active = path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              transition: "background 0.12s, color 0.12s",
              background: active ? "var(--text)" : "transparent",
              color: active ? "var(--accent-on)" : "var(--text-muted)",
            }}>
              <span style={{
                fontSize: 12, width: 16, textAlign: "center",
                color: active ? "var(--accent-on)" : "var(--text-faint)",
              }}>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        marginTop: "auto", padding: "16px 16px",
        borderTop: "1px solid var(--border-soft)",
      }}>
        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" style={{
          display: "block", padding: "8px 12px", borderRadius: 8,
          fontSize: 12, color: "var(--text-muted)",
          border: "1px solid var(--border)", textAlign: "center",
        }}>
          Public site ↗
        </a>
        <p style={{ margin: "12px 4px 0", fontSize: 10, color: "var(--text-faint)", lineHeight: 1.5 }}>
          ESADE Capstone<br />
          <span style={{ color: "var(--gray-300)" }}>v0.3 · internal · :3001</span>
        </p>
      </div>
    </aside>
  );
}
