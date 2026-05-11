import Link from "next/link";
import { HERO, PILLARS, PROCESS, PORTFOLIO_SAMPLE, STORIES, FAQ, STATS, NEWSLETTER } from "@/lib/landing-content";
import { NewsletterForm } from "./_newsletter-form";
import { FaqList } from "./_faq-list";

export default function LandingPage() {
  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section style={{
        background: "var(--bg-warm)",
        padding: "100px 32px 120px",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "left" }}>
          <p style={{
            fontSize: 11, fontWeight: 500, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 32px",
          }}>
            {HERO.eyebrow}
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 400,
            fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05,
            letterSpacing: "-0.025em", margin: "0 0 28px",
            maxWidth: 980,
          }}>
            Finding a co-founder is the most important decision you'll make.{" "}
            <span className="serif-italic">We help you make it once.</span>
          </h1>
          <p style={{
            fontSize: 17, color: "var(--text-muted)", lineHeight: 1.6,
            maxWidth: 680, margin: "0 0 40px",
          }}>
            {HERO.sub}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/apply" style={primaryCta}>
              {HERO.ctaPrimary} →
            </Link>
            <Link href="#how-it-works" style={secondaryCta}>
              {HERO.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- STATS BAR ---------------- */}
      <section style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
          padding: "48px 32px",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              borderRight: i < STATS.length - 1 ? "1px solid var(--border-soft)" : "none",
              padding: "0 24px",
              textAlign: i === 0 ? "left" : "center",
            }}>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 40,
                fontWeight: 400, color: "var(--text)", margin: 0,
                letterSpacing: "-0.025em", lineHeight: 1,
              }}>{s.value}</p>
              <p style={{
                fontSize: 12, color: "var(--text-muted)", margin: "10px 0 0",
              }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PILLARS ---------------- */}
      <section id="community" style={{ padding: "120px 32px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={sectionEyebrow}>The Circle</p>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400,
            margin: "0 0 60px", maxWidth: 820,
          }}>
            Three things separate Builders' Circle from every other matching platform you've seen.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
            borderTop: "1px solid var(--border)",
          }}>
            {PILLARS.map((p, i) => (
              <div key={p.title} style={{
                padding: "40px 32px 40px 0",
                borderRight: i < 2 ? "1px solid var(--border-soft)" : "none",
                paddingLeft: i > 0 ? 32 : 0,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 500, color: "var(--text-faint)",
                  margin: "0 0 16px", letterSpacing: "0.06em",
                }}>0{i + 1}</p>
                <h3 style={{
                  fontSize: 22, fontWeight: 500, margin: "0 0 14px",
                  letterSpacing: "-0.015em",
                }}>{p.title}</h3>
                <p style={{
                  fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, margin: 0,
                }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section id="how-it-works" style={{
        padding: "120px 32px", background: "var(--bg-soft)", borderTop: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={sectionEyebrow}>Process</p>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400,
            margin: "0 0 60px", maxWidth: 820,
          }}>
            Selective by design. <span className="serif-italic">Quality over volume.</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {PROCESS.map(s => (
              <div key={s.n} style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
                padding: "32px 28px", position: "relative",
              }}>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28, color: "var(--text)", margin: "0 0 28px",
                  letterSpacing: "-0.02em",
                }}>{s.n}</p>
                <h3 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 48, padding: "20px 28px",
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
          }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text)", fontWeight: 500 }}>Decisions within 14 days.</strong> No ghosting. Every applicant hears back.
            </p>
            <Link href="/apply" style={inlineCta}>Apply now →</Link>
          </div>
        </div>
      </section>

      {/* ---------------- PORTFOLIO ---------------- */}
      <section style={{ padding: "120px 32px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={sectionEyebrow}>Built by the same people behind</p>
          <h2 style={{
            fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400,
            margin: "0 0 50px", maxWidth: 820,
          }}>
            For two decades, b2venture has backed Europe's most defining technology companies.
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
          }}>
            {PORTFOLIO_SAMPLE.map((c, i) => (
              <div key={c.name} style={{
                padding: "32px 24px",
                borderRight: (i + 1) % 4 !== 0 ? "1px solid var(--border-soft)" : "none",
                borderBottom: i < 4 ? "1px solid var(--border-soft)" : "none",
                background: "var(--bg)",
              }}>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500,
                  margin: "0 0 6px", letterSpacing: "-0.015em",
                }}>{c.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{c.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- STORIES ---------------- */}
      <section style={{ padding: "120px 32px", background: "var(--bg-warm)", borderTop: "1px solid var(--border-soft)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={sectionEyebrow}>Voices from the Circle</p>
          <h2 style={{
            fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400,
            margin: "0 0 50px", maxWidth: 720,
          }}>
            What members say.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {STORIES.map((s, i) => (
              <div key={i} style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
                padding: 32, display: "flex", flexDirection: "column",
              }}>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: 24,
                  color: "var(--text-faint)", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
                }}>"</p>
                <p style={{
                  fontSize: 15, lineHeight: 1.6, margin: "8px 0 28px",
                  color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 400,
                }}>{s.quote}</p>
                <div style={{ marginTop: "auto" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{s.author}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{s.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" style={{ padding: "120px 32px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={sectionEyebrow}>Frequently asked</p>
          <h2 style={{
            fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400,
            margin: "0 0 50px",
          }}>
            Questions, answered.
          </h2>
          <FaqList items={FAQ} />
        </div>
      </section>

      {/* ---------------- NEWSLETTER ---------------- */}
      <section style={{
        padding: "100px 32px", background: "var(--text)", color: "var(--accent-on)",
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center",
        }}>
          <div>
            <p style={{
              fontSize: 11, color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 20px",
            }}>Stay in the loop</p>
            <h2 style={{
              fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 400, margin: "0 0 18px",
              color: "var(--accent-on)", lineHeight: 1.1,
            }}>
              {NEWSLETTER.title}
            </h2>
            <p style={{
              fontSize: 15, color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6, margin: "0 0 28px", maxWidth: 460,
            }}>
              {NEWSLETTER.body}
            </p>
            <NewsletterForm />
          </div>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 28,
          }}>
            <p style={{
              fontSize: 11, color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 14px",
            }}>{NEWSLETTER.preview.issue}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {NEWSLETTER.preview.bullets.map((b, i) => (
                <li key={i} style={{
                  fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5,
                  paddingLeft: 22, position: "relative",
                }}>
                  <span style={{
                    position: "absolute", left: 0, top: 7,
                    width: 6, height: 6, borderRadius: 3,
                    background: "rgba(255,255,255,0.4)",
                  }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section style={{ padding: "120px 32px", background: "var(--bg-warm)", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 400,
            margin: "0 0 20px", letterSpacing: "-0.025em",
          }}>
            Ready to find <span className="serif-italic">the one?</span>
          </h2>
          <p style={{
            fontSize: 16, color: "var(--text-muted)", lineHeight: 1.6,
            margin: "0 0 36px", maxWidth: 560, marginInline: "auto",
          }}>
            Less than 1% of applicants are admitted. The 20-minute application is the first step.
          </p>
          <Link href="/apply" style={{ ...primaryCta, fontSize: 15, padding: "16px 32px" }}>
            Begin your application →
          </Link>
        </div>
      </section>
    </div>
  );
}

const sectionEyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 500, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 24px",
};

const primaryCta: React.CSSProperties = {
  display: "inline-block", background: "var(--text)", color: "var(--accent-on)",
  padding: "14px 26px", borderRadius: 999, fontSize: 14, fontWeight: 500,
  letterSpacing: "-0.005em",
};

const secondaryCta: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid var(--border-strong)", color: "var(--text)",
  padding: "13px 26px", borderRadius: 999, fontSize: 14, fontWeight: 500,
  background: "transparent",
};

const inlineCta: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: "var(--text)", letterSpacing: "-0.005em",
};
