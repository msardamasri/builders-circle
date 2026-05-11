import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer style={{
      background: "var(--text)", color: "var(--accent-on)",
      padding: "60px 32px 32px",
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48,
          paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Logo size={30} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500 }}>
                Builders' Circle
              </span>
            </div>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6, maxWidth: 380, margin: 0,
            }}>
              An invite-only community of Europe's most ambitious founders.
              Curated, interviewed, and matched by b2venture.
            </p>
          </div>

          <FooterCol title="Builders' Circle" links={[
            { label: "How it works", href: "/#how-it-works" },
            { label: "The Circle", href: "/#community" },
            { label: "FAQ", href: "/#faq" },
            { label: "Apply", href: "/apply" },
          ]} />

          <FooterCol title="b2venture" links={[
            { label: "Portfolio", href: "https://www.b2venture.vc/portfolio" },
            { label: "Stories", href: "https://www.b2venture.vc/stories" },
            { label: "Team", href: "https://www.b2venture.vc/team" },
            { label: "Contact", href: "https://www.b2venture.vc/contact" },
          ]} />

          <FooterCol title="Offices" links={[
            { label: "Berlin · Germany", href: "#" },
            { label: "Munich · Germany", href: "#" },
            { label: "Zurich · Switzerland", href: "#" },
            { label: "Luxembourg", href: "#" },
            { label: "St. Gallen · Switzerland", href: "#" },
          ]} />
        </div>

        <div style={{
          paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 11, color: "rgba(255,255,255,0.5)",
        }}>
          <span>© {new Date().getFullYear()} b2venture AG. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="https://www.b2venture.vc/imprint">Imprint</Link>
            <Link href="https://www.b2venture.vc/privacy-policy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{
        fontSize: 10, color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase", letterSpacing: "0.12em",
        margin: "0 0 14px", fontWeight: 500,
      }}>{title}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(l => (
          <li key={l.label}>
            <Link href={l.href} style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
