"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { pickThreeQuestions } from "@/lib/behavioral-questions";

export default function VideoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? (typeof window !== "undefined" ? localStorage.getItem("bc_app_id") : null);

  const [questions, setQuestions] = useState<{ id: string; text: string; category: string }[]>([]);

  useEffect(() => {
    if (id) setQuestions(pickThreeQuestions(id));
  }, [id]);

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 72);
  const deadlineStr = deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " +
    deadline.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  function handleFinishLater() {
    router.push(`/status?id=${id}`);
  }

  function handleSkip() {
    router.push(`/status?id=${id}&skipped=1`);
  }

  return (
    <div style={{ background: "var(--bg-soft)", minHeight: "100vh", padding: "60px 32px 100px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 12, color: "var(--text-muted)" }}>← Builders' Circle</Link>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400,
          margin: "16px 0 8px", letterSpacing: "-0.02em",
        }}>
          Application received. <span className="serif-italic">One last thing.</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "0 0 36px", lineHeight: 1.6 }}>
          We'd love to see you on camera, briefly. Below are three behavioral questions —
          record one short video (5–10 minutes) addressing all three. The founders who do this
          consistently stand out the most.
        </p>

        {/* Deadline */}
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "16px 20px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recommended by</p>
            <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 500, color: "var(--text)" }}>{deadlineStr}</p>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", maxWidth: 240, textAlign: "right" }}>
            72 hours from now. After that, your application is reviewed without the video.
          </p>
        </div>

        {/* The 3 questions */}
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14,
          padding: 36, marginBottom: 24,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 500, color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 24px",
          }}>Your three questions</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                paddingLeft: 28, borderLeft: "2px solid var(--border)",
                position: "relative",
              }}>
                <p style={{
                  position: "absolute", left: -18, top: 0,
                  width: 32, height: 32, borderRadius: 16,
                  background: "var(--text)", color: "var(--accent-on)",
                  fontSize: 13, fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: 0,
                }}>{i + 1}</p>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 400,
                  color: "var(--text)", lineHeight: 1.4, margin: "2px 0 0",
                  letterSpacing: "-0.01em",
                }}>
                  {q.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recorder placeholder */}
        <div style={{
          background: "var(--bg)", border: "2px dashed var(--border)", borderRadius: 14,
          padding: "60px 32px", textAlign: "center", marginBottom: 28,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: "var(--bg-soft)", border: "1px solid var(--border)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 18, fontSize: 22, color: "var(--text-muted)",
          }}>▶</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "var(--text)" }}>
            Video recorder coming soon
          </p>
          <p style={{
            margin: "6px auto 24px", fontSize: 13, color: "var(--text-muted)",
            maxWidth: 480, lineHeight: 1.6,
          }}>
            We're rolling out the in-browser recorder. For now, you can finish your application without the video,
            or come back within 72 hours when it's available.
          </p>
          <button disabled style={{
            padding: "11px 22px", borderRadius: 999, border: "1px solid var(--border)",
            background: "var(--bg-soft)", color: "var(--text-muted)",
            fontSize: 13, fontWeight: 500, cursor: "not-allowed",
          }}>
            Record video
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
          <button onClick={handleSkip} style={{
            padding: "12px 22px", borderRadius: 999, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--text-muted)",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>
            Skip the video for now
          </button>
          <button onClick={handleFinishLater} style={{
            padding: "12px 22px", borderRadius: 999, border: "none",
            background: "var(--text)", color: "var(--accent-on)",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>
            I'll finish within 72 hours →
          </button>
        </div>

        <p style={{
          textAlign: "center", fontSize: 12, color: "var(--text-faint)",
          marginTop: 36, lineHeight: 1.6,
        }}>
          Either way, your written application is in. The DRI team will start reviewing.
          You'll receive a decision within 14 days.
        </p>
      </div>
    </div>
  );
}
