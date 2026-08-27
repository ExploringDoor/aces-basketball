// pages/CentralLeaguePage.jsx
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

export default function CentralLeaguePage() {
  return (
    <section id="league" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
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
              <div style={{
                height: "100%",
                background: team.isSelf ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                border: team.isSelf ? "1px solid rgba(132,0,54,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "24px", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = team.isSelf ? "rgba(201,164,74,0.5)" : "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${team.isSelf ? "rgba(132,0,54,0.2)" : "rgba(0,0,0,0.35)"}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = team.isSelf ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${team.color}33`, border: `2px solid ${team.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
                    flexShrink: 0,
                  }}>{team.initials}</div>
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
