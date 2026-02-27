// pages/ThousandClubPage.jsx
import { FadeIn, SpadeIcon, thousandPointClub } from "../shared";

export default function ThousandClubPage() {
  return (
    <section id="thousand" style={{ background: "#0a0005", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label">
            <SpadeIcon size={14} color="#840036" /> All-Time Greats
          </div>
          <h2 className="section-title">1,000 Point<br /><span style={{ color: "var(--gold)" }}>Club</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 16, lineHeight: 1.8 }}>
            The elite scorers in Lower Merion boys basketball history who reached the 1,000 career point milestone.
          </p>
        </FadeIn>

        {/* Kobe Feature */}
        <FadeIn delay={0.15}>
          <div style={{ marginTop: 48, background: "linear-gradient(135deg, rgba(132,0,54,0.3), rgba(0,0,0,0.6))", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 16, padding: "36px 40px", display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 80, fontWeight: 900, color: "var(--maroon)", lineHeight: 1, opacity: 0.6 }}>33</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 8 }}>All-Time Leading Scorer · Class of 1996</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700 }}>Kobe Bryant</div>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
                Single Game High: 50 pts vs Marple Newtown (1996) · 50 pts vs Academy Park (1996)
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 52, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>2,883</div>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 4 }}>Career Points</div>
            </div>
          </div>
        </FadeIn>

        {/* Leaderboard */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 32, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 100px 80px", gap: 0, padding: "12px 20px", background: "rgba(132,0,54,0.4)", fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>
              <div>#</div><div>Player</div><div style={{ textAlign: "right" }}>Points</div><div style={{ textAlign: "right" }}>Class</div>
            </div>
            {thousandPointClub.map((player, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid", gridTemplateColumns: "48px 1fr 100px 80px", gap: 0,
                  padding: "14px 20px",
                  background: player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
              >
                <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Oswald', sans-serif" }}>{player.rank}</div>
                <div style={{ fontWeight: player.highlight ? 600 : 400 }}>
                  {player.name} {player.highlight && <span style={{ color: "var(--gold)", fontSize: 12 }}>♠</span>}
                </div>
                <div style={{ textAlign: "right", color: "var(--gold)", fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{player.points}</div>
                <div style={{ textAlign: "right", color: "rgba(255,255,255,0.4)" }}>{player.year}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
