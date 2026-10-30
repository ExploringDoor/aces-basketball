// pages/SchedulePage.jsx
import { FadeIn, Spade, schedule, scheduleSeason, homeVenue, teamLogos, nextGame, computeRecord, gameTime } from "../shared";

const OppBadge = ({ opp, size = 36 }) => {
  const logo = teamLogos[opp];
  return logo
    ? <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src={logo} alt="" style={{ width: "88%", height: "88%", objectFit: "contain" }} /></div>
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(132,0,54,0.25)", border: "2px solid rgba(132,0,54,0.5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontSize: Math.round(size * 0.4), fontWeight: 700, color: "#fff" }}>{opp[0]}</div>;
};

const countableGames = schedule.flatMap(m => m.games).filter(g => !g.exhibition);
const totalGames = countableGames.length;
const homeGames = countableGames.filter(g => g.home).length;

export default function SchedulePage() {
  const now = Date.now();
  const ng = nextGame(now);
  const rec = computeRecord();
  const inSeason = rec.played > 0;

  const stats = [
    { v: totalGames, l: "Games" },
    { v: homeGames, l: "Home Games" },
    inSeason ? { v: `${rec.w}–${rec.l}`, l: "Record" } : { v: "Dec 4", l: "Tip-Off" },
  ];

  return (
    <section id="schedule" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>GAME DAY</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/tunnel.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> {scheduleSeason} Season</div>
          <h2 className="section-title">The<br /><span style={{ color: "var(--gold)" }}>Schedule</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Next-up / opener banner */}
        {ng && (
          <FadeIn delay={0.12}>
            <div style={{ marginTop: 40, borderRadius: 16, overflow: "hidden", position: "relative", border: "1px solid rgba(201,164,74,0.3)", background: "linear-gradient(135deg, rgba(132,0,54,0.35), rgba(10,0,5,0.7))" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg')", backgroundSize: "cover", backgroundPosition: "center 25%", opacity: 0.18 }} />
              <div style={{ position: "relative", padding: "30px 34px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.9)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>{inSeason ? "Next Game" : "Season Opener"}</div>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.1 }}>
                    {ng.home ? "vs" : "@"} {ng.opp}
                  </div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>
                    {ng.date} · {ng.time} · {ng.venue || (ng.home ? homeVenue : "Away")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <OppBadge opp="Lower Merion" size={58} />
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, color: "rgba(255,255,255,0.4)" }}>{ng.home ? "vs" : "@"}</span>
                  <OppBadge opp={ng.opp} size={58} />
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Quick stats */}
        <FadeIn delay={0.16}>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ flex: "1 1 120px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, color: "var(--gold)" }}>{s.v}</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Month-by-month schedule */}
        {schedule.map((m, mi) => (
          <FadeIn key={m.month} delay={0.1}>
            <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: mi === 0 ? 44 : 34, marginBottom: 14 }}>{m.month}</h3>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              {m.games.map((g, i) => {
                const isNext = ng && g.iso === ng.iso;
                const played = !!g.result;
                const win = played && g.result.us > g.result.them;
                const past = !played && Number.isFinite(gameTime(g)) && gameTime(g) + 3 * 3600000 < now && !g.multi;
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "78px 1fr auto", gap: 14, alignItems: "center",
                    padding: "13px 18px",
                    background: isNext ? "rgba(201,164,74,0.08)" : (i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"),
                    borderLeft: isNext ? "3px solid var(--gold)" : "3px solid transparent",
                    borderBottom: i < m.games.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    opacity: past ? 0.55 : 1,
                  }}>
                    <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: isNext ? "var(--gold)" : "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>{g.date}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, flexShrink: 0,
                        color: g.home ? "var(--gold)" : "rgba(255,255,255,0.5)",
                        background: g.home ? "rgba(201,164,74,0.14)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${g.home ? "rgba(201,164,74,0.3)" : "rgba(255,255,255,0.1)"}`,
                      }}>{g.home ? "Home" : "Away"}</span>
                      <OppBadge opp={g.opp} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14.5, color: "#fff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {g.home ? "vs " : "@ "}{g.opp}
                          {g.conf && <span title="Central League" style={{ color: "var(--gold)", marginLeft: 7, fontSize: 11 }}>★</span>}
                        </div>
                        {g.tag && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{g.tag}</div>}
                      </div>
                    </div>
                    {played ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 12, color: win ? "#4ade80" : "#f87171" }}>{win ? "W" : "L"}</span>
                        <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>{g.result.us}–{g.result.them}</span>
                      </div>
                    ) : (
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: isNext ? "var(--gold)" : "rgba(255,255,255,0.7)", textAlign: "right", whiteSpace: "nowrap" }}>{g.time}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        ))}

        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--gold)" }}>★</span> Central League game
          </div>
          <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Home games at the {homeVenue}.</div>
        </div>
      </div>
    </section>
  );
}
