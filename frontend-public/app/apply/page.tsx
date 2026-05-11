"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitApplication } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "bc_application_draft";

const ARCHETYPES = [
  "Visionary", "Builder", "Hustler", "Operator", "CEO", "Seller",
  "Domain Expert", "Generalist", "Product Designer", "Marketer", "Engineer", "Hacker",
];
const INDUSTRIES = ["AI", "FinTech", "HealthTech", "EdTech", "Climate", "B2B SaaS", "Marketplace", "DeepTech", "Cybersecurity", "Logistics", "Consumer", "Robotics"];
const SKILLS = ["tech", "sales", "ops", "product", "design", "finance"];

type Draft = {
  step: number;
  full_name: string;
  email: string;
  linkedin: string;
  founder_section: any;
  idea_section: any;
  personal_section: any;
};

const EMPTY: Draft = {
  step: 0,
  full_name: "",
  email: "",
  linkedin: "",
  founder_section: {
    location: "", remote_ok: false, primary_skill: "", looking_for: [],
    years_experience: "", founder_history: "", archetype_primary: "",
    archetype_secondary: "", commitment: "", runway_months: "", background: "",
  },
  idea_section: {
    has_idea: "", industries: [], pitch: "", why_now: "",
    business_model: "", funding_philosophy: "", idea_stage: "", time_to_mvp: "",
  },
  personal_section: {
    motivation: "", proudest_project: "", biggest_failure: "",
    risk_tolerance: 5, work_life_balance: 5,
    decision_style: "", conflict_style: "", ultimate_goal: "", dealbreakers: "",
  },
};

export default function ApplyPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Auth gate + prefill from user metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/signin?next=" + encodeURIComponent("/apply"));
        return;
      }
      setUserId(data.user.id);
      // Prefill from user metadata if not already in draft
      setDraft(d => ({
        ...d,
        full_name: d.full_name || (data.user!.user_metadata?.full_name ?? ""),
        email: d.email || data.user!.email || "",
      }));
      setAuthChecked(true);
    });
  }, [router]);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try { setDraft(d => ({ ...EMPTY, ...JSON.parse(saved), full_name: d.full_name || JSON.parse(saved).full_name, email: d.email || JSON.parse(saved).email })); } catch {}
    }
    setHydrated(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  function update<K extends keyof Draft>(k: K, v: Draft[K]) {
    setDraft(d => ({ ...d, [k]: v }));
  }
  function updateSection(section: "founder_section" | "idea_section" | "personal_section", patch: any) {
    setDraft(d => ({ ...d, [section]: { ...d[section], ...patch } }));
  }
  function next() { setDraft(d => ({ ...d, step: Math.min(d.step + 1, 4) })); window.scrollTo(0, 0); }
  function back() { setDraft(d => ({ ...d, step: Math.max(d.step - 1, 0) })); window.scrollTo(0, 0); }

  async function handleSubmit() {
    if (!userId) return;
    setError(null);
    setSubmitting(true);
    const res = await submitApplication({
      user_id: userId,
      full_name: draft.full_name,
      email: draft.email,
      linkedin: draft.linkedin,
      founder_section: draft.founder_section,
      idea_section: draft.idea_section,
      personal_section: draft.personal_section,
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Submission failed"); return; }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem("bc_app_id", res.id!);
    router.push(`/apply/video?id=${res.id}`);
  }

  const steps = [
    { id: 0, label: "Identity" },
    { id: 1, label: "Founder" },
    { id: 2, label: "Idea" },
    { id: 3, label: "Personal" },
    { id: 4, label: "Review" },
  ];

  if (!authChecked) {
    return (
      <div style={{ background: "var(--bg-soft)", minHeight: "100vh", padding: "60px 32px" }}>
        <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-soft)", minHeight: "100vh", padding: "60px 32px 100px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 12, color: "var(--text-muted)" }}>← Builders' Circle</Link>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400,
            margin: "16px 0 8px", letterSpacing: "-0.02em",
          }}>Application</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
            About 20 minutes. Your progress is saved automatically — close this tab and come back anytime.
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= draft.step ? "var(--text)" : "var(--border)",
              transition: "background 0.2s",
            }} />
          ))}
        </div>

        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14,
          padding: 40,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 500, color: "var(--text-faint)",
            textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px",
          }}>
            Step {draft.step + 1} of {steps.length} · {steps[draft.step].label}
          </p>

          {draft.step === 0 && <StepIdentity draft={draft} update={update} />}
          {draft.step === 1 && <StepFounder draft={draft} updateSection={updateSection} />}
          {draft.step === 2 && <StepIdea draft={draft} updateSection={updateSection} />}
          {draft.step === 3 && <StepPersonal draft={draft} updateSection={updateSection} />}
          {draft.step === 4 && <StepReview draft={draft} />}

          {error && (
            <div style={{
              marginTop: 24, padding: "12px 14px", borderRadius: 8,
              background: "var(--red-soft)", color: "var(--red)", fontSize: 13,
            }}>{error}</div>
          )}

          <div style={{
            marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border-soft)",
            display: "flex", justifyContent: "space-between",
          }}>
            {draft.step > 0 ? (
              <button onClick={back} style={btnSecondary}>← Back</button>
            ) : <div />}

            {draft.step < 4 ? (
              <button onClick={next} style={btnPrimary} disabled={!canAdvance(draft)}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} style={btnPrimary} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit application"}
              </button>
            )}
          </div>
        </div>

        <p style={{
          textAlign: "center", fontSize: 12, color: "var(--text-faint)",
          marginTop: 24,
        }}>
          Your information is reviewed only by the b2venture investment team. Confidential.
        </p>
      </div>
    </div>
  );
}

function canAdvance(d: Draft): boolean {
  if (d.step === 0) return Boolean(d.full_name && d.email);
  return true;
}

// ==== Step components ====

function StepIdentity({ draft, update }: any) {
  return (
    <div>
      <h2 style={stepTitle}>Let's start with the basics.</h2>
      <p style={stepSub}>Confirm your details so we know how to reach you.</p>

      <Field label="Full name *">
        <input type="text" style={input} value={draft.full_name}
          onChange={e => update("full_name", e.target.value)} />
      </Field>
      <Field label="Email *">
        <input type="email" style={input} value={draft.email}
          onChange={e => update("email", e.target.value)} />
      </Field>
      <Field label="LinkedIn URL">
        <input type="url" style={input} placeholder="https://linkedin.com/in/..."
          value={draft.linkedin} onChange={e => update("linkedin", e.target.value)} />
      </Field>
    </div>
  );
}

function StepFounder({ draft, updateSection }: any) {
  const f = draft.founder_section;
  return (
    <div>
      <h2 style={stepTitle}>Tell us who you are as a builder.</h2>
      <p style={stepSub}>The structured part — quick to fill, important for matching.</p>

      <div style={twoCol}>
        <Field label="Location (city)">
          <input style={input} value={f.location} onChange={e => updateSection("founder_section", { location: e.target.value })} />
        </Field>
        <Field label="Open to remote co-founder?">
          <select style={input} value={String(f.remote_ok)}
            onChange={e => updateSection("founder_section", { remote_ok: e.target.value === "true" })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </Field>
      </div>

      <div style={twoCol}>
        <Field label="Primary skill">
          <select style={input} value={f.primary_skill}
            onChange={e => updateSection("founder_section", { primary_skill: e.target.value })}>
            <option value="">Select...</option>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Years of professional experience">
          <input type="number" style={input} value={f.years_experience}
            onChange={e => updateSection("founder_section", { years_experience: e.target.value })} />
        </Field>
      </div>

      <Field label="Looking for a co-founder with skills in (select all that fit)">
        <ChipGroup options={SKILLS} value={f.looking_for}
          onChange={v => updateSection("founder_section", { looking_for: v })} />
      </Field>

      <div style={twoCol}>
        <Field label="Founder history">
          <select style={input} value={f.founder_history}
            onChange={e => updateSection("founder_section", { founder_history: e.target.value })}>
            <option value="">Select...</option>
            <option value="first_time">First-time founder</option>
            <option value="repeat">Repeat founder</option>
            <option value="exited">Exited founder</option>
          </select>
        </Field>
        <Field label="Commitment level">
          <select style={input} value={f.commitment}
            onChange={e => updateSection("founder_section", { commitment: e.target.value })}>
            <option value="">Select...</option>
            <option value="full_time">Full-time, ready now</option>
            <option value="full_time_3mo">Full-time, within 3 months</option>
            <option value="full_time_6mo">Full-time, within 6 months</option>
            <option value="side_hustle">Side project for now</option>
          </select>
        </Field>
      </div>

      <div style={twoCol}>
        <Field label="If you primarily identify as one of these archetypes, which?">
          <select style={input} value={f.archetype_primary}
            onChange={e => updateSection("founder_section", { archetype_primary: e.target.value })}>
            <option value="">Select primary...</option>
            {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="And a secondary archetype?">
          <select style={input} value={f.archetype_secondary}
            onChange={e => updateSection("founder_section", { archetype_secondary: e.target.value })}>
            <option value="">Select secondary...</option>
            {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Briefly: what's your background? (~75 words)">
        <textarea style={textarea} rows={4} value={f.background}
          onChange={e => updateSection("founder_section", { background: e.target.value })} />
      </Field>
    </div>
  );
}

function StepIdea({ draft, updateSection }: any) {
  const i = draft.idea_section;
  return (
    <div>
      <h2 style={stepTitle}>Do you have an idea yet?</h2>
      <p style={stepSub}>It's perfectly fine if you don't. Some of our strongest members joined idea-less.</p>

      <Field label="Where are you on the idea spectrum?">
        <select style={input} value={i.idea_stage}
          onChange={e => updateSection("idea_section", { idea_stage: e.target.value })}>
          <option value="">Select...</option>
          <option value="exploratory">Just exploring — no specific idea</option>
          <option value="committed">I have a clear idea I want to build</option>
          <option value="building">Already building something</option>
        </select>
      </Field>

      <Field label="Industries or spaces you'd want to build in (pick the ones that genuinely excite you)">
        <ChipGroup options={INDUSTRIES} value={i.industries}
          onChange={v => updateSection("idea_section", { industries: v })} />
      </Field>

      {(i.idea_stage === "committed" || i.idea_stage === "building") && (
        <>
          <Field label="One paragraph: what are you building?">
            <textarea style={textarea} rows={4} value={i.pitch}
              onChange={e => updateSection("idea_section", { pitch: e.target.value })} />
          </Field>
          <Field label="Why now? Why is this the right moment?">
            <textarea style={textarea} rows={3} value={i.why_now}
              onChange={e => updateSection("idea_section", { why_now: e.target.value })} />
          </Field>
        </>
      )}

      <div style={twoCol}>
        <Field label="Preferred business model">
          <select style={input} value={i.business_model}
            onChange={e => updateSection("idea_section", { business_model: e.target.value })}>
            <option value="">Select...</option>
            <option value="b2b_saas">B2B SaaS</option>
            <option value="b2c">B2C / Consumer</option>
            <option value="marketplace">Marketplace</option>
            <option value="hardware">Hardware / Deeptech</option>
            <option value="agnostic">Agnostic</option>
          </select>
        </Field>
        <Field label="Funding philosophy *">
          <select style={input} value={i.funding_philosophy}
            onChange={e => updateSection("idea_section", { funding_philosophy: e.target.value })}>
            <option value="">Select...</option>
            <option value="vc_track">VC track — raise & scale</option>
            <option value="bootstrapping">Bootstrapping — profit first</option>
            <option value="open">Open to either, depends on the idea</option>
          </select>
        </Field>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>
        We treat funding philosophy as a hard veto in matching — VC-track builders rarely thrive paired with bootstrappers.
      </p>
    </div>
  );
}

function StepPersonal({ draft, updateSection }: any) {
  const p = draft.personal_section;
  return (
    <div>
      <h2 style={stepTitle}>The part that actually matters.</h2>
      <p style={stepSub}>
        This is what we read most carefully. Take your time. Be specific. Honest answers beat polished ones.
      </p>

      <Field label="Why are you choosing to start a company at this point in your life?">
        <textarea style={textarea} rows={4} value={p.motivation}
          onChange={e => updateSection("personal_section", { motivation: e.target.value })} />
      </Field>

      <Field label="What's the most ambitious thing you've built or led so far? Walk us through it.">
        <textarea style={textarea} rows={4} value={p.proudest_project}
          onChange={e => updateSection("personal_section", { proudest_project: e.target.value })} />
      </Field>

      <Field label="Tell us about a project, role, or relationship that didn't work out. What did you learn?">
        <textarea style={textarea} rows={4} value={p.biggest_failure}
          onChange={e => updateSection("personal_section", { biggest_failure: e.target.value })} />
      </Field>

      <Field label="When you face a hard decision, are you a 'gather data first' or 'commit and adjust' person?">
        <select style={input} value={p.decision_style}
          onChange={e => updateSection("personal_section", { decision_style: e.target.value })}>
          <option value="">Select...</option>
          <option value="data_first">Gather data first, then decide</option>
          <option value="bias_to_action">Bias to action, decide and adjust</option>
          <option value="hybrid">Depends on the stakes</option>
        </select>
      </Field>

      <Field label="When you disagree with someone you respect, what do you tend to do?">
        <select style={input} value={p.conflict_style}
          onChange={e => updateSection("personal_section", { conflict_style: e.target.value })}>
          <option value="">Select...</option>
          <option value="direct">Push back directly, hash it out</option>
          <option value="explore">Try to understand their angle first</option>
          <option value="back_off">Often back off, then revisit later</option>
          <option value="depends">Depends entirely on the person</option>
        </select>
      </Field>

      <div style={twoCol}>
        <Field label={`Risk tolerance (1–10): ${p.risk_tolerance}`}>
          <input type="range" min={1} max={10} value={p.risk_tolerance}
            onChange={e => updateSection("personal_section", { risk_tolerance: parseInt(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--text)" }} />
        </Field>
        <Field label={`Importance of work-life balance (1–10): ${p.work_life_balance}`}>
          <input type="range" min={1} max={10} value={p.work_life_balance}
            onChange={e => updateSection("personal_section", { work_life_balance: parseInt(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--text)" }} />
        </Field>
      </div>

      <Field label="Five years from now, what does success look like for you personally?">
        <textarea style={textarea} rows={3} value={p.ultimate_goal}
          onChange={e => updateSection("personal_section", { ultimate_goal: e.target.value })} />
      </Field>

      <Field label="What would make a co-founder partnership a failure for you in 18 months? Be specific.">
        <textarea style={textarea} rows={3} value={p.dealbreakers}
          onChange={e => updateSection("personal_section", { dealbreakers: e.target.value })} />
      </Field>
    </div>
  );
}

function StepReview({ draft }: any) {
  return (
    <div>
      <h2 style={stepTitle}>Final check.</h2>
      <p style={stepSub}>
        After submitting, you'll be invited to record a short video answering three behavioral questions.
        It's optional but strongly recommended — you'll have <strong>72 hours</strong> to record it.
      </p>

      <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: 20 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Identity</p>
        <p style={{ margin: 0, fontSize: 14 }}>{draft.full_name} — <span style={{ color: "var(--text-muted)" }}>{draft.email}</span></p>
      </div>

      <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: 20, marginTop: 12 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Founder profile</p>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          {draft.founder_section.primary_skill || "—"} · {draft.founder_section.location || "—"} · {draft.founder_section.commitment || "—"} · {draft.founder_section.archetype_primary || "—"}
        </p>
      </div>

      <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: 20, marginTop: 12 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Idea</p>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
          Stage: {draft.idea_section.idea_stage || "—"} · Funding: {draft.idea_section.funding_philosophy || "—"} · Industries: {(draft.idea_section.industries ?? []).join(", ") || "—"}
        </p>
      </div>
    </div>
  );
}

// ==== Reusable bits ====

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 500, color: "var(--text)",
        marginBottom: 8, letterSpacing: "-0.005em",
      }}>{label}</label>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(opt => {
        const active = value.includes(opt);
        return (
          <button
            key={opt} type="button"
            onClick={() => onChange(active ? value.filter(v => v !== opt) : [...value, opt])}
            style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
              border: "1px solid",
              borderColor: active ? "var(--text)" : "var(--border)",
              background: active ? "var(--text)" : "var(--bg)",
              color: active ? "var(--accent-on)" : "var(--text-muted)",
              cursor: "pointer", textTransform: "capitalize",
            }}
          >{opt}</button>
        );
      })}
    </div>
  );
}

const stepTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400,
  margin: "8px 0 8px", letterSpacing: "-0.015em",
};
const stepSub: React.CSSProperties = {
  fontSize: 14, color: "var(--text-muted)", margin: "0 0 28px", lineHeight: 1.6,
};
const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const input: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--border)", fontSize: 14, background: "var(--bg)",
  color: "var(--text)", outline: "none", fontFamily: "inherit",
};
const textarea: React.CSSProperties = { ...input, minHeight: 100, resize: "vertical", lineHeight: 1.6 };
const btnPrimary: React.CSSProperties = {
  padding: "11px 22px", borderRadius: 999, border: "none",
  background: "var(--text)", color: "var(--accent-on)",
  fontSize: 14, fontWeight: 500, cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "11px 22px", borderRadius: 999, border: "1px solid var(--border)",
  background: "var(--bg)", color: "var(--text-muted)",
  fontSize: 14, fontWeight: 500, cursor: "pointer",
};
