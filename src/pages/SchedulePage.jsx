// pages/SchedulePage.jsx
import { useState } from "react";
import { FadeIn, SpadeIcon, seasonData } from "../shared";

export default function SchedulePage() {
  const [selectedSeason, setSelectedSeason] = useState("2025-26");
  const s = seasonData[selectedSeason];

  return (
    <section id="schedule" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> 2025–26 Season</div>
          <h2 className="section-title">Schedule &<br /><span style={{ color: "var(--gold)" }}>Results</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Season Selector */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36 }}>
            {Object.keys(seasonData).map(s => (
              <button key={s} onClick={() => setSelectedSeason(s)} style={{
                padding: "8px 16px", borderRadius: 6, cursor: "pointer",
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1,
                background: selectedSeason === s ? "var(--maroon)" : "rgba(255,255,255,0.05)",
                border: selectedSeason === s ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                color: selectedSeason === s ? "var(--gold)" : "rgba(255,255,255,0.6)",
                transition: "all 0.2s ease",
              }}>{s}</button>
            ))}
          </div>
        </FadeIn>

        {/* Record Display */}
        <FadeIn delay={0.15}>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <div style={{ background: "rgba(132,0,54,0.2)", border: "1px solid rgba(132,0,54,0.4)", borderRadius: 10, padding: "20px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: "var(--gold)" }}>{s.wins} - {s.losses}</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 4 }}>Overall</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: "#fff" }}>{s.confW} - {s.confL}</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 4 }}>Conference ({s.confPlace})</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{s.notes}</div>
              {s.highlight && (
                <div style={{ display: "inline-block", marginTop: 8, padding: "4px 14px", background: "rgba(132,0,54,0.3)", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 20, fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>{s.highlight}</div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Game-by-game table */}
        {s.games.length > 0 ? (
          <FadeIn delay={0.2}>
            <div style={{ marginTop: 32, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(132,0,54,0.4)", fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>
                    {["Date","Opponent","W/L","LM","OPP"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.games.map((g, i) => (
                    <tr key={i}
                      style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.2s", cursor: "default" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                    >
                      <td style={{ padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{g.date}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "'Source Sans 3', sans-serif", fontSize: 14 }}>
                        {g.loc} {g.opp}
                        {g.conf && <span style={{ color: "var(--gold)", marginLeft: 6, fontSize: 10 }}>★</span>}
                        {g.tag && <span style={{ marginLeft: 8, padding: "2px 8px", background: "rgba(132,0,54,0.3)", borderRadius: 4, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>{g.tag}</span>}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: g.r === "W" ? "#4ade80" : "#f87171" }}>{g.r}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 16 }}>{g.lm}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>{g.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
              {[{ icon: "★", color: "var(--gold)", label: "Conference Game" }].map((l, i) => (
                <div key={i} style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: l.color }}>{l.icon}</span> {l.label}
                </div>
              ))}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.2}>
            <div style={{ marginTop: 40, textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
                Full game-by-game results for this season coming soon.
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
