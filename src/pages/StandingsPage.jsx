// pages/StandingsPage.jsx
import { FadeIn, Spade, standings, scheduleSeason, teamLogos } from "../shared";

const pct = (w, l) => (w + l === 0 ? 0 : w / (w + l));

// Sort by league win pct, then league wins, then name. GB vs first place.
const sorted = [...standings].sort((a, b) =>
  pct(b.confW, b.confL) - pct(a.confW, a.confL) || b.confW - a.confW || a.team.localeCompare(b.team)
);
const leader = sorted[0];
const gamesBack = (t) => {
  const gb = ((leader.confW - t.confW) + (t.confL - leader.confL)) / 2;
  return gb <= 0 ? "—" : gb % 1 === 0 ? String(gb) : gb.toFixed(1);
};
const preseason = standings.every(t => t.w + t.l + t.confW + t.confL === 0);

export default function StandingsPage() {
  return (
    <section id="standings" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none" }}>THE RACE</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/defense.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> {scheduleSeason} Central League</div>
          <h2 className="section-title">League<br /><span style={{ color: "var(--gold)" }}>Standings</span></h2>
          <div className="divider" />
          {preseason && (
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 18, lineHeight: 1.7, maxWidth: 620 }}>
              The {scheduleSeason} season tips off December 4. Standings update here after every game, all season long.
            </p>
          )}
        </FadeIn>

        <FadeIn delay={0.12}>
          <div style={{ marginTop: 36, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 64px 64px 46px 52px", gap: 6, padding: "12px 16px", background: "rgba(132,0,54,0.4)", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", alignItems: "center" }}>
              <div>#</div><div>Team</div>
              <div style={{ textAlign: "center" }}>League</div>
              <div style={{ textAlign: "center" }}>Overall</div>
              <div style={{ textAlign: "center" }}>GB</div>
              <div style={{ textAlign: "center" }}>Strk</div>
            </div>
            {sorted.map((t, i) => {
              const isLM = t.team === "Lower Merion";
              const logo = teamLogos[t.team];
              return (
                <div key={t.team} style={{
                  display: "grid", gridTemplateColumns: "34px 1fr 64px 64px 46px 52px", gap: 6, alignItems: "center",
                  padding: "10px 16px",
                  background: isLM ? "rgba(132,0,54,0.18)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderLeft: isLM ? "3px solid var(--gold)" : "3px solid transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: i < 1 ? "var(--gold)" : "rgba(255,255,255,0.35)", fontWeight: i < 1 ? 700 : 400 }}>{i + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    {logo && (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src={logo} alt="" style={{ width: "86%", height: "86%", objectFit: "contain" }} />
                      </div>
                    )}
                    <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, fontWeight: isLM ? 700 : 500, color: isLM ? "var(--gold)" : "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.team}</span>
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{t.confW}-{t.confL}</div>
                  <div style={{ textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{t.w}-{t.l}</div>
                  <div style={{ textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{gamesBack(t)}</div>
                  <div style={{ textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: 13, color: t.streak.startsWith("W") ? "#4ade80" : t.streak.startsWith("L") ? "#f87171" : "rgba(255,255,255,0.35)" }}>{t.streak}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 14 }}>
            League = Central League play · GB = games back · Updated after every game.
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
