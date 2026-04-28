"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard",      label: "Overview",       icon: "▦" },
  { href: "/matches",        label: "Matches",        icon: "⇄" },
  { href: "/builders",       label: "Builders",       icon: "◉" },
  { href: "/introductions",  label: "Introductions",  icon: "✉" },
];

export function Nav() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-10">
      <div className="px-6 py-6 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">b2venture</p>
        <h1 className="text-base font-semibold text-gray-900">Builders Circle</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => {
          const active = path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Privacy-first · Local AI</p>
      </div>
    </aside>
  );
}