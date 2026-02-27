// pages/CentralLeaguePage.jsx
import { FadeIn, SpadeIcon, centralLeagueTeams } from "../shared";

export default function CentralLeaguePage() {
  return (
    <section id="league" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> Our Conference</div>
          <h2 className="section-title">The Central<br /><span style={{ color: "var(--gold)" }}>League</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 700 }}>
            The Central Athletic League is a premier high school sports conference in suburban Philadelphia, founded in 1967. Comprised of 12 schools primarily from Delaware, Chester, and Montgomery counties, the Central League is home to some of the best basketball programs in District 1. Lower Merion has dominated the league's basketball landscape, capturing 23 titles since 1967.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 48 }}>
          {centralLeagueTeams.map((team, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{
                background: team.isSelf ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                border: team.isSelf ? "1px solid rgba(132,0,54,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "24px", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = team.isSelf ? "rgba(201,164,74,0.5)" : "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = team.isSelf ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.06)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${team.color}33`, border: `2px solid ${team.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
                    flexShrink: 0,
                  }}>{team.initials}</div>
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 500 }}>{team.name}</div>
                    <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>{team.mascot}</div>
                  </div>
                  {team.isSelf && (
                    <div style={{ marginLeft: "auto", padding: "2px 10px", background: "rgba(132,0,54,0.4)", border: "1px solid var(--gold)", borderRadius: 20, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>US</div>
                  )}
                </div>
                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{team.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
