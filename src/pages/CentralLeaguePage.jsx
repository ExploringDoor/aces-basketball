// pages/CentralLeaguePage.jsx
import { useState } from "react";
import { FadeIn, Spade, centralLeagueTeams, centralLeagueChampions } from "../shared";

// ── Derive title counts + years per school from the champions list ──
const titleCount = {};
const titleYears = {};
centralLeagueChampions.forEach(({ year, teams }) => {
  teams.forEach(t => {
    titleCount[t] = (titleCount[t] || 0) + 1;
    (titleYears[t] = titleYears[t] || []).push(year);
  });
});
const rankedTeams = Object.entries(titleCount).sort((a, b) => b[1] - a[1]);
const maxTitles = rankedTeams.length ? rankedTeams[0][1] : 1;
const colorFor = (name) => (centralLeagueTeams.find(t => t.name === name)?.color) || "#840036";
const lastTitle = (name) => (titleYears[name] ? Math.max(...titleYears[name]) : null);

// Only the clean, high-quality marks. Others fall back to a colored monogram badge.
const LOGOS = {
  "Conestoga": "/logos/conestoga.png", "Garnet Valley": "/logos/garnet-valley.png",
  "Marple Newtown": "/logos/marple-newtown.png", "Ridley": "/logos/ridley.png",
  "Springfield": "/logos/springfield.png", "Strath Haven": "/logos/strath-haven.png",
  "Upper Darby": "/logos/upper-darby.png", "Lower Merion": "/Bulldog.png",
};

const TeamBadge = ({ team, size = 44 }) => {
  const logo = team.logo || LOGOS[team.name];
  return logo
    ? <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", border: `2px solid ${team.color}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src={logo} alt={team.name} style={{ width: "78%", height: "78%", objectFit: "contain" }} /></div>
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", border: `2px solid ${team.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald', sans-serif", fontSize: Math.round(size * 0.34), fontWeight: 800, color: team.color, flexShrink: 0 }}>{team.initials}</div>;
};

export default function CentralLeaguePage() {
  const [selected, setSelected] = useState(null);
  const selYears = selected ? (titleYears[selected.name] || []).slice().sort((a, b) => b - a) : [];

  return (
    <section id="league" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>

      {/* Team detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", cursor: "zoom-out" }}>
          <style>{`@keyframes clIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border: `1px solid ${selected.isSelf ? "rgba(201,164,74,0.4)" : "rgba(132,0,54,0.4)"}`, borderRadius: 16, maxWidth: 560, width: "100%", padding: "34px", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default", animation: "clIn 0.3s ease", position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>✕</button>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, paddingRight: 30 }}>
              <TeamBadge team={selected} size={72} />
              <div>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 700, color: selected.isSelf ? "var(--gold)" : "#fff", lineHeight: 1.1 }}>{selected.name}</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{selected.mascot}{selected.isSelf ? " · Our Program" : ""}</div>
              </div>
            </div>
            <div style={{ background: "rgba(201,164,74,0.08)", border: "1px solid rgba(201,164,74,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 4 }}>Central League Championships</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>{selYears.length}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>{selYears.length === 1 ? "title" : "titles"}</span></div>
            </div>
            {selYears.length > 0 ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>Title Years (since 1968)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {selYears.map(y => <span key={y} style={{ padding: "4px 11px", borderRadius: 8, background: selected.isSelf ? "rgba(201,164,74,0.14)" : "rgba(132,0,54,0.2)", border: `1px solid ${selected.isSelf ? "rgba(201,164,74,0.3)" : "rgba(132,0,54,0.4)"}`, fontFamily: "'Oswald',sans-serif", fontSize: 13, color: selected.isSelf ? "var(--gold)" : "#fff" }}>{y}</span>)}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>No Central League basketball title on record since 1968.</div>
            )}
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, margin: 0 }}>{selected.desc}</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Our Conference</div>
          <h2 className="section-title">The Central<br /><span style={{ color: "var(--gold)" }}>League</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 700 }}>
            The Central League is a premier high school sports conference in suburban Philadelphia, founded in 1967. Comprised of 12 schools primarily from Delaware, Chester, and Montgomery counties, the Central League is home to some of the best basketball programs in District 1. Lower Merion has dominated the league's basketball landscape, capturing 23 titles, the most of any school since play began.
          </p>
        </FadeIn>

        {/* Team cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 48 }}>
          {centralLeagueTeams.map((team, i) => {
            const titles = titleCount[team.name] || 0;
            const last = lastTitle(team.name);
            return (
            <FadeIn key={i} delay={i * 0.04}>
              <div onClick={() => setSelected(team)} style={{
                height: "100%",
                background: team.isSelf ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                border: team.isSelf ? "1px solid rgba(132,0,54,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "24px", transition: "all 0.2s ease", cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = team.isSelf ? "rgba(201,164,74,0.5)" : "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${team.isSelf ? "rgba(132,0,54,0.2)" : "rgba(0,0,0,0.35)"}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = team.isSelf ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <TeamBadge team={team} />
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 500 }}>{team.name}</div>
                    <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>{team.mascot}</div>
                  </div>
                  {team.isSelf && (
                    <div style={{ marginLeft: "auto", padding: "2px 10px", background: "rgba(132,0,54,0.4)", border: "1px solid var(--gold)", borderRadius: 20, fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>US</div>
                  )}
                </div>

                {/* League title chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  <span style={{
                    padding: "3px 11px", borderRadius: 20,
                    background: titles > 0 ? (team.isSelf ? "rgba(201,164,74,0.15)" : "rgba(132,0,54,0.18)") : "rgba(255,255,255,0.04)",
                    border: `1px solid ${titles > 0 ? (team.isSelf ? "rgba(201,164,74,0.4)" : "rgba(132,0,54,0.35)") : "rgba(255,255,255,0.08)"}`,
                    fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 1,
                    color: titles > 0 ? (team.isSelf ? "var(--gold)" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.4)",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>{titles} League {titles === 1 ? "Title" : "Titles"}</span>
                  {last && (
                    <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Most recent {last}</span>
                  )}
                </div>

                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{team.desc}</p>
              </div>
            </FadeIn>
          );})}
        </div>

        {/* ── Titles by School ── */}
        <FadeIn>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: 80, marginBottom: 8 }}>Central League Titles by School</h3>
          <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 26 }}>All championships since the league's founding. Co-championships count for each school.</div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {rankedTeams.map(([name, count], i) => {
            const isLM = name === "Lower Merion";
            return (
            <FadeIn key={name} delay={Math.min(i, 8) * 0.04}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 22, textAlign: "right", fontFamily: "'Oswald', sans-serif", fontSize: 13, color: i < 3 ? "var(--gold)" : "rgba(255,255,255,0.3)", fontWeight: i < 3 ? 700 : 400, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ width: 118, fontFamily: "'Oswald', sans-serif", fontSize: 14, color: isLM ? "var(--gold)" : "rgba(255,255,255,0.8)", fontWeight: isLM ? 600 : 400, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.03)", borderRadius: 5, overflow: "hidden", minWidth: 60 }}>
                  <div style={{
                    width: `${(count / maxTitles) * 100}%`, height: "100%", borderRadius: 5,
                    background: isLM ? "linear-gradient(90deg, #840036, #c9a44a)" : `linear-gradient(90deg, ${colorFor(name)}cc, ${colorFor(name)}66)`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{ width: 26, fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, color: isLM ? "var(--gold)" : "rgba(255,255,255,0.6)", flexShrink: 0 }}>{count}</div>
              </div>
            </FadeIn>
          );})}
        </div>

        {/* ── Champions by Year ── */}
        <FadeIn>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: 72, marginBottom: 24 }}>Champions by Year</h3>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>
          {centralLeagueChampions.map(({ year, teams }, i) => {
            const isLM = teams.includes("Lower Merion");
            return (
              <div key={year} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8,
                background: isLM ? "rgba(132,0,54,0.16)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isLM ? "rgba(201,164,74,0.25)" : "rgba(255,255,255,0.05)"}`,
              }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, color: isLM ? "var(--gold)" : "rgba(255,255,255,0.55)", minWidth: 34 }}>{year}</span>
                <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: isLM ? "#fff" : "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>{teams.join(" · ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
