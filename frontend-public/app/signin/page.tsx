"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/apply";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-soft)", padding: "60px 32px",
    }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <form onSubmit={handleSubmit} style={card}>
          <h1 style={title}>Welcome back.</h1>
          <p style={sub}>Sign in to continue your application or check your status.</p>

          <Field label="Email">
            <input type="email" required style={input} value={email} autoFocus
              onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input type="password" required style={input} value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>

          {error && (
            <div style={errBox}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p style={altText}>
            New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={altLink}>
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 500,
        color: "var(--text)", marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 36,
};
const title: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400,
  margin: "0 0 6px", letterSpacing: "-0.02em",
};
const sub: React.CSSProperties = {
  fontSize: 13, color: "var(--text-muted)", margin: "0 0 26px",
};
const input: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--border)", fontSize: 14,
  background: "var(--bg)", color: "var(--text)", outline: "none", fontFamily: "inherit",
};
const errBox: React.CSSProperties = {
  background: "var(--red-soft)", color: "var(--red)",
  borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 16,
};
const btn: React.CSSProperties = {
  width: "100%", padding: "12px", borderRadius: 8, border: "none",
  background: "var(--text)", color: "var(--accent-on)",
  fontSize: 14, fontWeight: 500, cursor: "pointer",
};
const altText: React.CSSProperties = {
  textAlign: "center", marginTop: 18, marginBottom: 0,
  fontSize: 13, color: "var(--text-muted)",
};
const altLink: React.CSSProperties = {
  color: "var(--text)", fontWeight: 500,
};
