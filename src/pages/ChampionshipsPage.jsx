// pages/ChampionshipsPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Icon, championships } from "../shared";

const lightboxStyle = `
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
`;

export default function ChampionshipsPage() {
  const [activeTab, setActiveTab] = useState("state");
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0 });
  const [lightbox, setLightbox] = useState(false);

  const tabs = [
    { key: "state",    label: "State Championships (7)" },
    { key: "district", label: "District 1 Titles (17)" },
    { key: "league",   label: "Central League Titles (23)" },
  ];

  const handleMouseMove = (e) => {
    setPopup(p => ({ ...p, x: e.clientX, y: e.clientY }));
  };

  return (
    <section id="championships" style={{ background: "#0a0005", padding: "120px 5% 100px" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none" }}>BANNERS</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <style>{lightboxStyle}</style>

      {/* Fullscreen lightbox on click */}
      {lightbox && (
        <div onClick={() => setLightbox(false)} style={{
          position:"fixed", inset:0, zIndex:99999,
          background:"rgba(0,0,0,0.95)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"zoom-out",
          animation:"fadeIn 0.25s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position:"relative", maxWidth:"90vw", maxHeight:"90vh",
            borderRadius:16, overflow:"hidden",
            border:"2px solid rgba(201,164,74,0.5)",
            boxShadow:"0 0 80px rgba(132,0,54,0.5)",
          }}>
            <img
              src="/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg"
              alt="2025 Central League Champions"
              style={{ width:"100%", height:"auto", maxHeight:"80vh", objectFit:"contain", display:"block" }}
            />
            <div style={{ background:"rgba(8,0,4,0.97)", padding:"16px 24px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, letterSpacing:4, color:"var(--gold)", textTransform:"uppercase" }}>2025 Central League Champions</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4, letterSpacing:1 }}>Lower Merion Aces Basketball</div>
            </div>
            {/* Close button */}
            <button onClick={() => setLightbox(false)} style={{
              position:"absolute", top:12, right:12,
              background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", borderRadius:"50%", width:36, height:36,
              fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            }}>✕</button>
          </div>
          <div style={{ position:"absolute", bottom:24, color:"rgba(255,255,255,0.3)", fontSize:12, letterSpacing:2, fontFamily:"'Source Sans 3',sans-serif" }}>CLICK ANYWHERE TO CLOSE</div>
        </div>
      )}

      {/* Fixed photo popup that follows mouse */}
      {popup.visible && (
        <div style={{
          position:"fixed",
          left: popup.x + 20,
          top: popup.y - 180,
          zIndex: 9999,
          pointerEvents:"none",
          width: 300,
          borderRadius: 12,
          overflow:"hidden",
          border:"2px solid rgba(201,164,74,0.5)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(132,0,54,0.4)",
        }}>
          <img
            src="/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg"
            alt="2025 Central League Champions"
            style={{ width:"100%", height:"auto", display:"block" }}
          />
          <div style={{ background:"rgba(8,0,4,0.97)", padding:"10px 14px", fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, color:"var(--gold)", textAlign:"center", textTransform:"uppercase" }}>
            2025 Central League Champions
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Championship History</div>
          <h2 className="section-title">Banners<br /><span style={{ color: "var(--gold)" }}>&amp; Titles</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Reigning champions team photo */}
        <FadeIn delay={0.08}>
          <div onClick={() => setLightbox(true)} style={{ marginTop: 36, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(201,164,74,0.3)", position: "relative", transition: "transform 0.25s, box-shadow 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <img src="/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg" alt="2025 Central League Champions" style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover", objectPosition: "center 28%" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 42%, rgba(10,0,5,0.92))" }} />
            <div style={{ position: "absolute", left: 28, bottom: 22, right: 28 }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.92)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Reigning Champions</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.05 }}>2025 Central League Champions</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>Lower Merion's 23rd league title. Click to view the full photo.</div>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 36 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: "10px 20px", borderRadius: 6, cursor: "pointer",
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1,
                background: activeTab === t.key ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.04)",
                border: activeTab === t.key ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                color: activeTab === t.key ? "var(--gold)" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s ease",
              }}>{t.label}</button>
            ))}
          </div>
        </FadeIn>

        {/* Content */}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {activeTab === "state" && championships.state.map((c, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ background: "linear-gradient(135deg, rgba(132,0,54,0.25), rgba(0,0,0,0.5))", border: "1px solid rgba(201,164,74,0.2)", borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 42, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{c.year}</div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.5 }}>{c.details}</div>
              </div>
            </FadeIn>
          ))}

          {activeTab === "district" && championships.district.map((y, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--gold)" }}>{y}</div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 1 }}>District 1 Champions</div>
              </div>
            </FadeIn>
          ))}

          {activeTab === "league" && championships.league.map((y, i) => {
            const is2025 = String(y) === "2025";
            return (
              <FadeIn key={i} delay={i * 0.03}>
                <div
                  onClick={() => is2025 && setLightbox(true)}
                  onMouseEnter={() => is2025 && setPopup(p => ({ ...p, visible: true }))}
                  onMouseLeave={() => is2025 && setPopup(p => ({ ...p, visible: false }))}
                  onMouseMove={is2025 ? handleMouseMove : undefined}
                  style={{
                    background: is2025 ? "linear-gradient(135deg, rgba(132,0,54,0.25), rgba(0,0,0,0.5))" : "rgba(255,255,255,0.03)",
                    border: is2025 ? "1px solid rgba(201,164,74,0.35)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "20px", textAlign: "center",
                    cursor: is2025 ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--gold)" }}>{y}</div>
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 1 }}>Central League</div>
                  {is2025 && (
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"var(--gold)", marginTop:7, opacity:0.7, letterSpacing:1, textTransform:"uppercase" }}>
                      <Icon name="camera" size={12} color="var(--gold)" stroke={1.7} /> View Photo
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
