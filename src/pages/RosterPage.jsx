// pages/RosterPage.jsx
import { FadeIn, Spade } from "../shared";

export default function RosterPage() {
  return (
    <section id="roster" style={{ background: "#0a0005", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}><Spade size={14} color="#840036" /> Current Team</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>2025-26<br /><span style={{ color: "var(--gold)" }}>Roster</span></h2>
          <div className="divider divider-center" />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div style={{ marginTop: 48, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "48px 40px" }}>
            <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 32 }}>
              View the full 2025-26 varsity roster, JV roster, schedule, scores, and stats on our official pages:
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://www.maxpreps.com/pa/ardmore/lower-merion-aces/basketball/"
                target="_blank" rel="noopener"
                style={{
                  padding: "14px 32px", background: "var(--maroon)", border: "1px solid rgba(201,164,74,0.3)",
                  color: "var(--gold)", textDecoration: "none", borderRadius: 6,
                  fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}
              >
                MaxPreps Roster
              </a>
              <a
                href="http://www.aceshoops.com"
                target="_blank" rel="noopener"
                style={{
                  padding: "14px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", textDecoration: "none", borderRadius: 6,
                  fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase",
                  transition: "all 0.2s ease",
                }}
              >
                AcesHoops.com
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
