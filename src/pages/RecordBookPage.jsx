// pages/RecordBookPage.jsx
import { useState } from "react";
import { FadeIn, Spade, recordBookSeasons } from "../shared";

export default function RecordBookPage() {
  const [activeSeason, setActiveSeason] = useState("2025-26");
  const season = recordBookSeasons[activeSeason];

  const sorted = (key) => [...season.leaders].sort((a, b) => b[key] - a[key])[0];

  return (
    <section id="records" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Stats &amp; Records</div>
          <h2 className="section-title">Record<br /><span style={{ color: "var(--gold)" }}>Book</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Season Tabs */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36 }}>
            {Object.keys(recordBookSeasons).map(key => (
              <button key={key} onClick={() => setActiveSeason(key)} style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 1,
                padding: "8px 18px", border: "1px solid",
                borderColor: activeSeason === key ? "var(--maroon)" : "rgba(255,255,255,0.1)",
                background: activeSeason === key ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.02)",
                color: activeSeason === key ? "#fff" : "rgba(255,255,255,0.5)",
                borderRadius: 8, cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s ease",
              }}>{key}</button>
            ))}
          </div>
        </FadeIn>

        {/* Season Record */}
        <FadeIn delay={0.15}>
          <div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(132,0,54,0.2)", border: "1px solid rgba(132,0,54,0.4)", borderRadius: 10, padding: "16px 28px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Season Record</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--gold)" }}>{season.record}</div>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{season.games} Games Played</div>
            </div>
          </div>
        </FadeIn>

        {/* Stat Leaders Grid */}
        <FadeIn delay={0.2}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 24 }}>
            {[
              { label: "Points Leader",   value: sorted("pts").pts,    player: sorted("pts").name },
              { label: "Rebounds Leader", value: sorted("reb").reb,    player: sorted("reb").name },
              { label: "Assists Leader",  value: sorted("ast").ast,    player: sorted("ast").name },
              { label: "Steals Leader",   value: sorted("stl").stl,    player: sorted("stl").name },
              { label: "Blocks Leader",   value: sorted("blk").blk,    player: sorted("blk").name },
              { label: "3-Pointers",      value: sorted("threes").threes, player: sorted("threes").name },
            ].map((s, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 30, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.player}</div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Stats Table */}
        <FadeIn delay={0.25}>
          <div style={{ marginTop: 28, overflowX: "auto", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "rgba(132,0,54,0.3)" }}>
                  {["#", "Player", "GP", "PTS", "PPG", "REB", "RPG", "AST", "APG", "STL", "BLK", "3PM", "FG%", "FT%", "MIN"].map(h => (
                    <th key={h} style={{ padding: "12px 10px", fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", fontWeight: 400, textAlign: "center", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {season.leaders.map((p, idx) => (
                  <tr key={idx}
                    style={{ background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.2s", cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.12)"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                  >
                    {[
                      p.number, p.name, p.gp, p.pts, (p.pts/p.gp).toFixed(1),
                      p.reb, (p.reb/p.gp).toFixed(1), p.ast, (p.ast/p.gp).toFixed(1),
                      p.stl, p.blk, p.threes, p.fgPct+"%", p.ftPct+"%", p.mins,
                    ].map((val, vi) => (
                      <td key={vi} style={{
                        padding: "11px 10px",
                        fontFamily: vi === 1 ? "'Source Sans 3', sans-serif" : "'Oswald', sans-serif",
                        fontSize: vi === 1 ? 13 : 14, textAlign: "center",
                        color: vi === 3 || vi === 5 || vi === 7 ? "var(--gold)" : "rgba(255,255,255,0.75)",
                        fontWeight: vi === 3 ? 600 : 400,
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
