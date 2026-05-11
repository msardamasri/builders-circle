"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/apply";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);
    if (error) { setError(error.message); return; }

    // If a session exists, email confirmation is OFF — sign them in directly
    if (data.session) {
      router.push(next);
      router.refresh();
    } else {
      // Email confirmation required
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div style={wrapper}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={card}>
            <h1 style={title}>Check your email.</h1>
            <p style={{ ...sub, margin: "0 0 24px" }}>
              We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
              Click it to activate your account, then come back and sign in.
            </p>
            <Link href="/signin" style={btnLinkInverted}>Go to sign in →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapper}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <form onSubmit={handleSubmit} style={card}>
          <h1 style={title}>Start your application.</h1>
          <p style={sub}>Create an account so you can save your progress and check your status anytime.</p>

          <Field label="Full name">
            <input type="text" required style={input} value={fullName} autoFocus
              onChange={e => setFullName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email">
            <input type="email" required style={input} value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} style={input} value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>

          {error && <div style={errBox}>{error}</div>}

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p style={altText}>
            Already have an account? <Link href={`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`} style={altLink}>
              Sign in
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

const wrapper: React.CSSProperties = {
  minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center",
  background: "var(--bg-soft)", padding: "60px 32px",
};
const card: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 36,
};
const title: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400,
  margin: "0 0 6px", letterSpacing: "-0.02em",
};
const sub: React.CSSProperties = {
  fontSize: 13, color: "var(--text-muted)", margin: "0 0 26px", lineHeight: 1.6,
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
const btnLinkInverted: React.CSSProperties = {
  display: "inline-block", padding: "11px 22px", borderRadius: 999,
  background: "var(--text)", color: "var(--accent-on)",
  fontSize: 14, fontWeight: 500,
};
const altText: React.CSSProperties = {
  textAlign: "center", marginTop: 18, marginBottom: 0,
  fontSize: 13, color: "var(--text-muted)",
};
const altLink: React.CSSProperties = {
  color: "var(--text)", fontWeight: 500,
};
