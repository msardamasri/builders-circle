"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./logo";
import { supabase } from "@/lib/supabase";

export function PublicNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Click outside to close menu
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "");

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border-soft)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, color: "var(--text)" }}>
              Builders' Circle
            </span>
            <span style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              by b2venture
            </span>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/#how-it-works" style={navLink}>How it works</Link>
          <Link href="/#community" style={navLink}>The Circle</Link>
          <Link href="/#faq" style={navLink}>FAQ</Link>

          {user ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 14px 6px 6px", borderRadius: 999,
                  border: "1px solid var(--border)", background: "var(--bg)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <span style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: "var(--text)", color: "var(--accent-on)",
                  fontSize: 11, fontWeight: 500,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>{initials}</span>
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                  {(fullName ?? user.email).split(" ")[0]}
                </span>
                <span style={{ fontSize: 9, color: "var(--text-faint)", marginLeft: 2 }}>▼</span>
              </button>
              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)", padding: 6, minWidth: 200,
                }}>
                  <p style={{
                    fontSize: 11, color: "var(--text-faint)",
                    padding: "8px 10px 4px", margin: 0, letterSpacing: "0.06em",
                    textTransform: "uppercase", fontWeight: 500,
                  }}>Signed in as</p>
                  <p style={{
                    fontSize: 12, color: "var(--text-muted)",
                    padding: "0 10px 8px", margin: 0, borderBottom: "1px solid var(--border-soft)",
                  }}>{user.email}</p>
                  <Link href="/status" onClick={() => setMenuOpen(false)} style={menuLink}>
                    My application
                  </Link>
                  <Link href="/apply" onClick={() => setMenuOpen(false)} style={menuLink}>
                    Continue application
                  </Link>
                  <button onClick={handleSignOut} style={{
                    ...menuLink, width: "100%", textAlign: "left",
                    background: "transparent", border: "none", cursor: "pointer",
                    fontFamily: "inherit", borderTop: "1px solid var(--border-soft)", marginTop: 4,
                  }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" style={navLink}>Sign in</Link>
              <Link href="/apply" style={{
                ...navLink,
                background: "var(--text)", color: "var(--accent-on)",
                padding: "9px 18px", borderRadius: 999, fontWeight: 500,
              }}>
                Apply
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const navLink: React.CSSProperties = {
  fontSize: 13, color: "var(--text-muted)", fontWeight: 400, letterSpacing: "-0.005em",
};

const menuLink: React.CSSProperties = {
  display: "block", padding: "8px 10px", fontSize: 13,
  color: "var(--text)", borderRadius: 6,
};
