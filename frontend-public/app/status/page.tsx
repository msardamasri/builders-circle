"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  "video_pending":   { label: "Video pending",   color: "var(--amber)", bg: "var(--amber-soft)" },
  "pending_review":  { label: "Under review",    color: "var(--blue)",  bg: "var(--blue-soft)" },
  "on_hold":         { label: "On hold",         color: "var(--text-muted)", bg: "var(--bg-soft)" },
  "accepted":        { label: "Accepted",        color: "var(--green)", bg: "var(--green-soft)" },
  "rejected":        { label: "Not at this time", color: "var(--text-muted)", bg: "var(--bg-soft)" },
};

export default function StatusPage() {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/signin?next=" + encodeURIComponent("/status"));
        return;
      }
      setAuthChecked(true);
      // Fetch most recent application for this user
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setApp(data);
      setLoading(false);
    })();
  }, [router]);

  if (!authChecked || loading) {
    return <Wrapper><p style={{ color: "var(--text-muted)" }}>Loading...</p></Wrapper>;
  }

  if (!app) {
    return (
      <Wrapper>
        <h1 style={hero}>You haven't applied yet.</h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "16px 0 28px" }}>
          You're signed in, but we don't see an application linked to your account.
        </p>
        <Link href="/apply" style={primaryCta}>Start your application →</Link>
      </Wrapper>
    );
  }

  const meta = STATUS_META[app.status] ?? STATUS_META.pending_review;

  return (
    <Wrapper>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Application reference</p>
      <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "4px 0 28px", fontFamily: "monospace" }}>
        {app.id.slice(0, 8).toUpperCase()}
      </p>

      {app.status === "accepted" ? (
        <AcceptedView app={app} />
      ) : app.status === "rejected" ? (
        <RejectedView app={app} />
      ) : (
        <PendingView app={app} meta={meta} />
      )}
    </Wrapper>
  );
}

function PendingView({ app, meta }: any) {
  return (
    <>
      <span style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 11,
        fontWeight: 500, color: meta.color, background: meta.bg, marginBottom: 24,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>{meta.label}</span>

      <h1 style={hero}>
        Your application is in. <span className="serif-italic">We're on it.</span>
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "16px 0 32px", lineHeight: 1.7, maxWidth: 580 }}>
        A partner from b2venture's investment team will personally review your application.
        Decisions are sent within <strong style={{ color: "var(--text)" }}>14 days</strong> of submission.
      </p>

      {app.status === "video_pending" && (
        <div style={{
          background: "var(--amber-soft)", border: "1px solid #FDE68A", borderRadius: 10,
          padding: 18, marginBottom: 28,
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--amber)" }}>
            Video still optional but recommended
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#78350F" }}>
            You have until {new Date(app.video_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {" "}to record your intro video. Founders who do are 3× more likely to move forward.
          </p>
          <Link href={`/apply/video?id=${app.id}`} style={{
            fontSize: 13, fontWeight: 500, color: "var(--amber)",
          }}>
            Record video now →
          </Link>
        </div>
      )}

      <div style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: 24 }}>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>
          What happens next
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--text)", lineHeight: 1.8 }}>
          <li>A b2venture partner reads your application personally.</li>
          <li>If you're a strong fit, you'll be invited to a 15-minute call.</li>
          <li>If accepted, you join the Circle and we begin curating co-founder introductions.</li>
        </ol>
      </div>
    </>
  );
}

function AcceptedView({ app }: any) {
  const linkedinPost = `Excited to share I've been admitted to the @b2venture Builders' Circle 🎉

A curated, invite-only program connecting Europe's most ambitious founders with the right co-founder. Only a small fraction of applicants are accepted — beyond grateful for the trust and looking forward to building what comes next.

#BuildersCircle #b2venture #StartupLife`;

  return (
    <div>
      <span style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 11,
        fontWeight: 500, color: "var(--green)", background: "var(--green-soft)",
        marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.08em",
      }}>Accepted</span>

      <h1 style={hero}>
        Welcome to the Circle, <span className="serif-italic">{app.full_name.split(" ")[0]}.</span>
      </h1>
      <p style={{ fontSize: 16, color: "var(--text-muted)", margin: "16px 0 32px", lineHeight: 1.7, maxWidth: 580 }}>
        You're in. Less than 1% of applicants make it this far. The b2venture investment team will start
        identifying compatible co-founder matches for you, and we'll be in touch with the first introductions
        in the coming weeks.
      </p>

      <div style={{
        background: "var(--bg-warm)", border: "1px solid var(--border)", borderRadius: 12,
        padding: 28, marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>
          What happens now
        </p>
        <ul style={{ margin: "0", paddingLeft: 20, fontSize: 14, color: "var(--text)", lineHeight: 1.9 }}>
          <li>You'll receive a welcome email with calendar links to upcoming members-only events</li>
          <li>The matching engine starts surfacing potential co-founders for the team to review</li>
          <li>Curated introductions arrive as we identify high-quality matches — quality, not volume</li>
          <li>You join the European Builders Briefing newsletter automatically</li>
        </ul>
      </div>

      <div style={{
        background: "var(--text)", color: "var(--accent-on)", borderRadius: 12, padding: 28, marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500 }}>
          Share the news
        </p>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400,
          margin: "0 0 18px", letterSpacing: "-0.015em",
        }}>
          A ready-to-post LinkedIn announcement.
        </p>
        <div style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: 18, marginBottom: 14,
        }}>
          <pre style={{
            margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap",
            fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.6,
          }}>{linkedinPost}</pre>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(linkedinPost)}
          style={{
            padding: "9px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent", color: "var(--accent-on)",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          Copy to clipboard
        </button>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
        Questions? Reply to your welcome email or reach the team at{" "}
        <a href="mailto:builderscircle@b2venture.vc" style={{ color: "var(--text)", fontWeight: 500 }}>
          builderscircle@b2venture.vc
        </a>
      </p>
    </div>
  );
}

function RejectedView({ app }: any) {
  return (
    <>
      <h1 style={hero}>
        Thank you for applying.
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-muted)", margin: "16px 0 24px", lineHeight: 1.7, maxWidth: 580 }}>
        We've completed our review of your application. Unfortunately, we won't be moving forward
        with you in this round. This is in no way a final judgement of your potential as a founder —
        we have a small intake and difficult choices to make every batch.
      </p>
      {app.decision_reason && (
        <div style={{
          background: "var(--bg-soft)", borderRadius: 8, padding: 18,
          margin: "0 0 24px", borderLeft: "3px solid var(--border-strong)",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            From the team
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>
            {app.decision_reason}
          </p>
        </div>
      )}
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
        Many of our most successful members were accepted on their second or third application.
        We'd genuinely welcome you to apply again in 6 months with new traction.
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        In the meantime — stay in the conversation:
      </p>
      <Link href="/#community" style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
        Subscribe to the European Builders Briefing →
      </Link>
    </>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-soft)", minHeight: "100vh", padding: "60px 32px 100px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 12, color: "var(--text-muted)" }}>← Builders' Circle</Link>
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>
    </div>
  );
}

const hero: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400,
  margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1,
};
const primaryCta: React.CSSProperties = {
  display: "inline-block", background: "var(--text)", color: "var(--accent-on)",
  padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 500,
};
