"use client";
import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await subscribeNewsletter(email);
    if (res.ok) {
      setStatus("ok"); setMsg("You're in. First issue lands in your inbox shortly.");
      setEmail("");
    } else {
      setStatus("err"); setMsg(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, maxWidth: 460 }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{
          flex: 1, padding: "13px 18px", borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)",
          color: "var(--accent-on)", fontSize: 14, outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "13px 24px", borderRadius: 999, border: "none",
          background: "var(--accent-on)", color: "var(--text)",
          fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {msg && (
        <p style={{
          margin: 0, fontSize: 12,
          color: status === "ok" ? "rgba(255,255,255,0.85)" : "rgba(255,200,200,0.9)",
          alignSelf: "center", marginLeft: 8,
        }}>{msg}</p>
      )}
    </form>
  );
}
