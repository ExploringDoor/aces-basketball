// pages/AlumniPage.jsx
import { FadeIn, SpadeIcon, alumni } from "../shared";

export default function AlumniPage() {
  return (
    <section id="alumni" style={{ background: "#0a0005", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> Notable Alumni</div>
          <h2 className="section-title">College &<br /><span style={{ color: "var(--gold)" }}>Professional Players</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 700 }}>
            More than 70 Aces alumni have gone on to play at the college and professional levels — at Division I, II, III programs, in the NBA, and in professional leagues overseas.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 48 }}>
          {alumni.map((a, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <div style={{
                background: a.highlight ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                border: a.highlight ? "1px solid rgba(201,164,74,0.3)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "20px 22px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Class of {a.classYear}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {a.pro?.includes("NBA") && (
                      <span style={{ padding: "2px 8px", background: "rgba(30,120,200,0.2)", border: "1px solid rgba(30,120,200,0.4)", borderRadius: 12, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 1, color: "#4a9eff", textTransform: "uppercase" }}>NBA</span>
                    )}
                    {(a.pro?.includes("overseas") || a.pro?.includes("NBL") || a.pro?.includes("Europe")) && (
                      <span style={{ padding: "2px 8px", background: "rgba(74,200,100,0.15)", border: "1px solid rgba(74,200,100,0.3)", borderRadius: 12, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 1, color: "#4ade80", textTransform: "uppercase" }}>Pro</span>
                    )}
                    {a.college && (
                      <span style={{ padding: "2px 8px", background: "rgba(201,164,74,0.15)", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 12, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 1, color: "var(--gold)", textTransform: "uppercase" }}>College</span>
                    )}
                  </div>
                </div>
                {a.college && <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}><span style={{ color: "rgba(255,255,255,0.3)" }}>College: </span>{a.college}</div>}
                {a.pro && <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}><span style={{ color: "rgba(255,255,255,0.3)" }}>Pro: </span>{a.pro}</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
