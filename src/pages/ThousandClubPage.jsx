// pages/ThousandClubPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Avatar, PlayerModal, photoFor, alumniByName, thousandPointClub } from "../shared";

const buildPerson = (p) => {
  const a = alumniByName(p.name);
  return {
    name: p.name,
    photo: photoFor(p.name),
    highlight: p.highlight,
    eyebrow: `#${p.rank} All-Time Scorer · Class of ${p.year}`,
    tags: ["1,000 Point Club"],
    stats: `${p.points} career points at Lower Merion`,
    rows: a ? [{ label: "College", value: a.college }, { label: "Pro / Career", value: a.pro }] : [],
    funFacts: a?.funFacts || [],
  };
};

export default function ThousandClubPage() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="thousand" style={{ background: "#0a0005", padding: "120px 5% 100px" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>1,000</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/rise.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <PlayerModal person={selected} onClose={() => setSelected(null)} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label">
            <Spade size={14} color="#840036" /> All-Time Greats
          </div>
          <h2 className="section-title">1,000 Point<br /><span style={{ color: "var(--gold)" }}>Club</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 16, lineHeight: 1.8 }}>
            The elite scorers in Lower Merion boys basketball history who reached the 1,000 career point milestone. Click any player for their full profile.
          </p>
        </FadeIn>

        {/* Kobe Feature */}
        <FadeIn delay={0.15}>
          <div onClick={() => setSelected(buildPerson(thousandPointClub[0]))} style={{ marginTop: 48, background: "linear-gradient(135deg, rgba(132,0,54,0.3), rgba(0,0,0,0.6))", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 16, padding: "30px 36px", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 18px 44px rgba(0,0,0,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <Avatar name="Kobe Bryant" photo={photoFor("Kobe Bryant")} size={92} highlight rounded="16px" />
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
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 66px 44px", gap: 0, padding: "12px 20px", background: "rgba(132,0,54,0.4)", fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>
              <div>#</div><div>Player</div><div style={{ textAlign: "right" }}>Points</div><div style={{ textAlign: "right" }}>Class</div>
            </div>
            {thousandPointClub.map((player, idx) => {
              const medal = ({ 1: "#c9a44a", 2: "#cbd2da", 3: "#cd8b5a" })[player.rank];
              return (
                <div
                  key={idx}
                  onClick={() => setSelected(buildPerson(player))}
                  style={{
                    display: "grid", gridTemplateColumns: "32px 1fr 66px 44px", gap: 0, alignItems: "center",
                    padding: "11px 20px",
                    background: player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, cursor: "pointer", transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                >
                  <div style={{ color: medal || "rgba(255,255,255,0.3)", fontFamily: "'Oswald', sans-serif", fontWeight: player.rank <= 3 ? 700 : 400 }}>{player.rank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={player.name} photo={photoFor(player.name)} size={30} highlight={player.highlight} />
                    <span style={{ fontWeight: player.highlight ? 600 : 400, lineHeight: 1.15, minWidth: 0 }}>{player.name}</span>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--gold)", fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>{player.points}</div>
                  <div style={{ textAlign: "right", color: "rgba(255,255,255,0.4)" }}>{player.year}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>Tap a name for their full profile.</div>
        </FadeIn>
      </div>
    </section>
  );
}
