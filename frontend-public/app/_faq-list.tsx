"use client";
import { useState } from "react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%", textAlign: "left", padding: "26px 0",
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 24,
              }}
            >
              <span style={{
                fontSize: 17, fontWeight: 500, color: "var(--text)",
                fontFamily: "var(--font-body)", letterSpacing: "-0.005em",
              }}>{item.q}</span>
              <span style={{
                fontSize: 18, color: "var(--text-faint)",
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                lineHeight: 1, flexShrink: 0,
              }}>+</span>
            </button>
            {isOpen && (
              <p style={{
                fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7,
                margin: "0 0 28px", maxWidth: 720,
              }}>{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
