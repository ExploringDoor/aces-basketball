// pages/ChampionshipsPage.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FadeIn, Spade, Icon, championships, titlePhoto, titleName, seasonLabel } from "../shared";

const lightboxStyle = `
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
`;

// A title card: the team photo as the thumbnail when we have one, else just the year.
function TitleCard({ year, kind, label, short, onOpen, big }) {
  const photo = titlePhoto(kind, year);
  if (!photo) return (
    <div style={{ height: "100%", boxSizing: "border-box", background: big ? "linear-gradient(135deg, rgba(132,0,54,0.25), rgba(0,0,0,0.5))" : "rgba(255,255,255,0.03)", border: big ? "1px solid rgba(201,164,74,0.2)" : "1px solid rgba(255,255,255,0.08)", borderRadius: big ? 12 : 10, padding: big ? "24px 20px" : "20px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: big ? 42 : 32, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{year}</div>
      <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: big ? 12 : 11, color: big ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.4)", marginTop: 8, letterSpacing: big ? 0 : 1, lineHeight: 1.5 }}>{label}</div>
    </div>
  );
  return (
    <button onClick={() => onOpen({ kind, year: Number(year) })} aria-label={`See the ${seasonLabel(year)} ${titleName[kind]} photo`} style={{
      width: "100%", height: "100%", padding: 0, cursor: "pointer", textAlign: "center", font: "inherit", color: "inherit",
      background: "linear-gradient(135deg, rgba(132,0,54,0.25), rgba(0,0,0,0.5))",
      border: "1px solid rgba(201,164,74,0.35)", borderRadius: 10, overflow: "hidden",
      display: "flex", flexDirection: "column", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.8)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.35)"; e.currentTarget.style.boxShadow = "none"; }}>
      <img src={photo} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", display: "block", background: "#000" }} />
      <div style={{ padding: "12px 10px 14px" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{year}</div>
        {big && <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.4 }}>{label}</div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"var(--gold)", marginTop:7, opacity:0.8, letterSpacing:1, textTransform:"uppercase" }}>
          <Icon name="camera" size={12} color="var(--gold)" stroke={1.7} /> {big ? "View Photo" : `${short || label} · View Photo`}
        </div>
      </div>
    </button>
  );
}

export default function ChampionshipsPage() {
  const [activeTab, setActiveTab] = useState("state");
  const [lightbox, setLightbox] = useState(null); // { kind, year } of the title photo being shown
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const tabs = [
    { key: "state",    label: "State Championships (7)" },
    { key: "district", label: "District 1 Titles (17)" },
    { key: "league",   label: "Central League Titles (24)" },
  ];

  return (
    <section id="championships" style={{ background: "#0a0005", padding: "120px 5% 100px" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none" }}>BANNERS</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <style>{lightboxStyle}</style>

      {/* Fullscreen title photo. Portaled: the section's isolation would trap it under the site menu */}
      {lightbox && createPortal(
        <div onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={`${seasonLabel(lightbox.year)} ${titleName[lightbox.kind]}`} style={{
          position:"fixed", inset:0, zIndex:99999,
          background:"rgba(0,0,0,0.95)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"zoom-out", padding:"clamp(10px,3vw,30px)",
          animation:"fadeIn 0.25s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position:"relative", maxWidth:"min(1200px, 94vw)",
            borderRadius:16, overflow:"hidden", cursor:"default",
            border:"2px solid rgba(201,164,74,0.5)",
            boxShadow:"0 0 80px rgba(132,0,54,0.5)",
          }}>
            <img
              src={titlePhoto(lightbox.kind, lightbox.year)}
              alt={`Lower Merion, ${seasonLabel(lightbox.year)} ${titleName[lightbox.kind]}`}
              style={{ width:"100%", height:"auto", maxHeight:"78vh", objectFit:"contain", display:"block", background:"#000" }}
            />
            <div style={{ background:"rgba(8,0,4,0.97)", padding:"14px 24px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, letterSpacing:4, color:"var(--gold)", textTransform:"uppercase" }}>{seasonLabel(lightbox.year)} {titleName[lightbox.kind]}</div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4, letterSpacing:1 }}>Lower Merion Aces Basketball</div>
            </div>
            <button onClick={() => setLightbox(null)} aria-label="Close" autoFocus style={{
              position:"absolute", top:12, right:12,
              background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", borderRadius:"50%", width:38, height:38,
              fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            }}>✕</button>
          </div>
        </div>,
        document.body
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Championship History</div>
          <h2 className="section-title">Banners<br /><span style={{ color: "var(--gold)" }}>&amp; Titles</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Reigning champions team photo */}
        <FadeIn delay={0.08}>
          <div onClick={() => setLightbox({ kind: "league", year: 2025 })} style={{ marginTop: 36, borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(201,164,74,0.3)", position: "relative", transition: "transform 0.25s, box-shadow 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <img src="/central-league/2024-2025.jpg" alt="2025 Central League Champions" style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover", objectPosition: "center 40%" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 42%, rgba(10,0,5,0.92))" }} />
            <div style={{ position: "absolute", left: 28, bottom: 22, right: 28 }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.92)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Reigning Champions</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.05 }}>2025 Central League Champions</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>Lower Merion's 24th league title. Click to view the full photo.</div>
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
              <TitleCard year={c.year} kind="state" label={c.details} onOpen={setLightbox} big />
            </FadeIn>
          ))}

          {activeTab === "district" && championships.district.map((y, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <TitleCard year={y} kind="district" label="District 1 Champions" short="District 1" onOpen={setLightbox} />
            </FadeIn>
          ))}

          {activeTab === "league" && championships.league.map((y, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <TitleCard year={y} kind="league" label="Central League" onOpen={setLightbox} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
