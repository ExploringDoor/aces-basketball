// pages/RosterPage.jsx
import { useState } from "react";
import { FadeIn, Spade, PlayerModal, roster, rosterSeason } from "../shared";

const NumberBadge = ({ number, photo, size = 64, highlight }) => (
  photo
    ? <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(201,164,74,0.4)" }}><img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} /></div>
    : <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #8a0038, #360017)", border: "2px solid rgba(201,164,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: Math.round(size * 0.42), color: "var(--gold)" }}>{number}</div>
);

const toPerson = (p) => ({
  name: p.name,
  photo: p.photo,
  eyebrow: `#${p.number} · ${p.pos}`,
  tags: [p.grade],
  rows: [
    { label: "Position", value: p.pos },
    { label: "Class", value: p.grade },
    { label: "Height", value: p.height },
  ],
  body: p.bio || "Full player profile coming soon.",
});

export default function RosterPage() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="roster" style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>
      <PlayerModal person={selected} onClose={() => setSelected(null)} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> {rosterSeason} Varsity</div>
          <h2 className="section-title">The<br /><span style={{ color: "var(--gold)" }}>Roster</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 640 }}>
            Meet the {rosterSeason} Lower Merion Aces. Click any player for their profile.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14, marginTop: 44 }}>
          {roster.map((p, i) => (
            <FadeIn key={i} delay={Math.min(i, 10) * 0.04}>
              <div onClick={() => setSelected(toPerson(p))} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(132,0,54,0.5)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
                <NumberBadge number={p.number} photo={p.photo} size={58} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "var(--gold)", marginTop: 2 }}>#{p.number} · {p.pos}</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{p.grade} · {p.height}</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, flexShrink: 0 }}>›</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
