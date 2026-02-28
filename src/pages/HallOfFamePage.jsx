// pages/HallOfFamePage.jsx
import { useState } from "react";
import { FadeIn, Spade, hallOfFame } from "../shared";

export default function HallOfFamePage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filters = [
    { key: "all",    label: "All Inductees" },
    { key: "player", label: "Players" },
    { key: "coach",  label: "Coaches" },
  ];

  const filtered = filter === "all" ? hallOfFame : hallOfFame.filter(p => p.type === filter);

  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>

      {/* Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position:"fixed", inset:0, zIndex:9999,
          background:"rgba(0,0,0,0.92)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px", cursor:"zoom-out",
          animation:"fadeInHof 0.25s ease",
        }}>
          <style>{`@keyframes fadeInHof { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }`}</style>
          <div onClick={e => e.stopPropagation()} style={{
            background:"linear-gradient(135deg,rgba(30,0,15,0.99),rgba(10,0,5,0.99))",
            border:`1px solid ${selected.highlight ? "rgba(201,164,74,0.5)" : "rgba(132,0,54,0.4)"}`,
            borderRadius:16, padding:"40px", maxWidth:680, width:"100%",
            maxHeight:"85vh", overflowY:"auto",
            boxShadow:`0 0 80px ${selected.highlight ? "rgba(201,164,74,0.2)" : "rgba(132,0,54,0.3)"}`,
            cursor:"default", position:"relative",
          }}>
            <button onClick={() => setSelected(null)} style={{
              position:"absolute", top:16, right:16,
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)",
              color:"#fff", borderRadius:"50%", width:34, height:34,
              fontSize:16, cursor:"pointer",
            }}>✕</button>

            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:24 }}>
              <div style={{
                width:56, height:56, borderRadius:"50%", flexShrink:0,
                background: selected.highlight ? "rgba(201,164,74,0.15)" : "rgba(132,0,54,0.2)",
                border:`2px solid ${selected.highlight ? "rgba(201,164,74,0.5)" : "rgba(132,0,54,0.5)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Oswald',sans-serif", fontSize:13, color: selected.highlight ? "var(--gold)" : "#fff",
              }}>
                {selected.type === "coach" ? "C" : selected.era.replace("'","")}
              </div>
              <div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:3, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:4 }}>
                  {selected.type === "coach" ? "Coach" : "Player"} · {selected.era}
                </div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26, fontWeight:700, color: selected.highlight ? "var(--gold)" : "#fff", lineHeight:1.2 }}>{selected.name}</div>
                {selected.college && (
                  <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:4, letterSpacing:1 }}>{selected.college}</div>
                )}
              </div>
            </div>

            {selected.quote && (
              <div style={{
                borderLeft:"3px solid var(--gold)", paddingLeft:16, marginBottom:24,
                fontFamily:"'Playfair Display',serif", fontSize:15, fontStyle:"italic",
                color:"rgba(255,255,255,0.65)", lineHeight:1.7,
              }}>"{selected.quote}"</div>
            )}

            <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:24 }}>
              {selected.summary}
            </p>

            <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20 }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:3, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:12 }}>Achievements</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {selected.achievements.map((a, i) => (
                  <div key={i} style={{
                    padding:"5px 12px", borderRadius:20,
                    background: selected.highlight ? "rgba(201,164,74,0.1)" : "rgba(132,0,54,0.15)",
                    border:`1px solid ${selected.highlight ? "rgba(201,164,74,0.25)" : "rgba(132,0,54,0.3)"}`,
                    fontFamily:"'Source Sans 3',sans-serif", fontSize:11,
                    color: selected.highlight ? "var(--gold)" : "rgba(255,255,255,0.6)",
                    letterSpacing:0.5,
                  }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Program Legends</div>
          <h2 className="section-title">Hall of<br /><span style={{ color:"var(--gold)" }}>Fame</span></h2>
          <div className="divider" />
          <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:15, color:"rgba(255,255,255,0.5)", marginTop:20, lineHeight:1.8, maxWidth:680 }}>
            Honoring the coaches, players, and legends who built the Aces into one of Pennsylvania's most storied basketball programs. Click any inductee to read their full story.
          </p>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn delay={0.1}>
          <div style={{ display:"flex", gap:8, marginTop:36, flexWrap:"wrap" }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding:"9px 20px", borderRadius:6, cursor:"pointer",
                fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:1.5,
                background: filter===f.key ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.04)",
                border: filter===f.key ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                color: filter===f.key ? "var(--gold)" : "rgba(255,255,255,0.5)",
                transition:"all 0.2s",
                textTransform:"uppercase",
              }}>{f.label}</button>
            ))}
          </div>
        </FadeIn>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16, marginTop:32 }}>
          {filtered.map((person, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div onClick={() => setSelected(person)} style={{
                background: person.highlight
                  ? "linear-gradient(135deg,rgba(132,0,54,0.2),rgba(201,164,74,0.05))"
                  : "rgba(255,255,255,0.02)",
                border: person.highlight
                  ? "1px solid rgba(201,164,74,0.3)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius:12, padding:"24px", cursor:"pointer",
                transition:"all 0.2s ease",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = person.highlight ? "rgba(201,164,74,0.6)" : "rgba(132,0,54,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 30px ${person.highlight ? "rgba(201,164,74,0.1)" : "rgba(132,0,54,0.15)"}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = person.highlight ? "rgba(201,164,74,0.3)" : "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}>

                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  {/* Era badge */}
                  <div style={{
                    width:48, height:48, borderRadius:"50%", flexShrink:0,
                    background: person.highlight ? "rgba(201,164,74,0.12)" : "rgba(132,0,54,0.18)",
                    border:`2px solid ${person.highlight ? "rgba(201,164,74,0.4)" : "rgba(132,0,54,0.4)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700,
                    color: person.highlight ? "var(--gold)" : "rgba(255,255,255,0.7)",
                    letterSpacing:1, textAlign:"center", lineHeight:1.2,
                  }}>
                    {person.type === "coach" ? "COACH" : person.era}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, fontWeight:600, color: person.highlight ? "var(--gold)" : "#fff", lineHeight:1.2 }}>{person.name}</div>
                    <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:3, letterSpacing:1 }}>
                      {person.type === "coach" ? person.era : person.title}
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.7, margin:0, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {selected === person ? person.summary : person.summary}
                </p>

                {/* Top achievement pills */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:14 }}>
                  {person.achievements.slice(0,2).map((a, j) => (
                    <div key={j} style={{
                      padding:"3px 10px", borderRadius:20, fontSize:10,
                      background: person.highlight ? "rgba(201,164,74,0.08)" : "rgba(132,0,54,0.12)",
                      border:`1px solid ${person.highlight ? "rgba(201,164,74,0.2)" : "rgba(132,0,54,0.25)"}`,
                      fontFamily:"'Source Sans 3',sans-serif",
                      color: person.highlight ? "rgba(201,164,74,0.8)" : "rgba(255,255,255,0.45)",
                    }}>{a}</div>
                  ))}
                </div>

                <div style={{ marginTop:14, fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:1 }}>
                  Click to read full story →
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
