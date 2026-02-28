// pages/ChampionshipsPage.jsx
import { useState } from "react";
import { FadeIn, Spade, championships } from "../shared";

export default function ChampionshipsPage() {
  const [activeTab, setActiveTab] = useState("state");
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0 });

  const tabs = [
    { key: "state",    label: "State Championships (7)" },
    { key: "district", label: "District 1 Titles (17)" },
    { key: "league",   label: "Central League Titles (23)" },
  ];

  const handleMouseMove = (e) => {
    setPopup(p => ({ ...p, x: e.clientX, y: e.clientY }));
  };

  return (
    <section id="championships" style={{ background: "#0a0005", padding: "120px 5% 100px" }}>

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
                    <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"var(--gold)", marginTop:6, opacity:0.6, letterSpacing:1 }}>📸 hover</div>
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
