// pages/CoachingPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Avatar, PlayerModal, photoFor, coachingStaff } from "../shared";

const coachPerson = (c) => ({
  name: c.name,
  photo: c.photo || photoFor(c.name),
  highlight: c.name === "Gregg Downer",
  eyebrow: c.since ? `${c.role} · Since ${c.since}` : c.role,
  tags: [c.role],
  body: c.bio,
  funFacts: c.funFacts || [],
});

export default function CoachingPage() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="coaching" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" , position: "relative", overflow: "hidden" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>STAFF</div>
      <PlayerModal person={selected} onClose={() => setSelected(null)} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Coaching Staff</div>
          <h2 className="section-title">Led By<br /><span style={{ color: "var(--gold)" }}>The Best</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 16, lineHeight: 1.8 }}>Click any coach for their full bio.</p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 40 }}>
          {coachingStaff.map((c, i) => {
            const head = c.name === "Gregg Downer";
            return (
              <FadeIn key={i} delay={i * 0.05}>
                <div onClick={() => setSelected(coachPerson(c))} style={{
                  display: "flex", alignItems: "center", gap: 20,
                  background: head ? "linear-gradient(135deg, rgba(132,0,54,0.2), rgba(0,0,0,0.5))" : "rgba(255,255,255,0.02)",
                  border: head ? "1px solid rgba(132,0,54,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: head ? "26px 28px" : "20px 24px", cursor: "pointer", transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = head ? "rgba(201,164,74,0.5)" : "rgba(132,0,54,0.45)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = head ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <Avatar name={c.name} photo={c.photo || photoFor(c.name)} size={head ? 74 : 56} highlight={head} rounded="12px" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: head ? 22 : 18, fontWeight: 500, letterSpacing: 1 }}>{c.name}</div>
                    <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "var(--gold)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                      {c.role}{c.since ? ` · Since ${c.since}` : ""}
                    </div>
                    {head && <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.bio}</p>}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
