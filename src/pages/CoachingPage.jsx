// pages/CoachingPage.jsx
import { FadeIn, SpadeIcon, coachingStaff } from "../shared";

export default function CoachingPage() {
  return (
    <section id="coaching" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> Coaching Staff</div>
          <h2 className="section-title">Led By<br /><span style={{ color: "var(--gold)" }}>The Best</span></h2>
          <div className="divider" />
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 48 }}>
          {coachingStaff.map((c, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{
                background: i === 0 ? "linear-gradient(135deg, rgba(132,0,54,0.2), rgba(0,0,0,0.5))" : "rgba(255,255,255,0.02)",
                border: i === 0 ? "1px solid rgba(132,0,54,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "28px 32px",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 500, letterSpacing: 1 }}>{c.name}</div>
                    <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                      {c.role}{c.since ? ` · Since ${c.since}` : ""}
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: 0 }}>{c.bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
