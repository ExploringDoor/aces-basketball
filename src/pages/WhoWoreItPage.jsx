import { useState, useMemo } from "react";
import { FadeIn, Spade, Avatar, photoFor } from "../shared";
import { allTimeRoster } from "../shared/allTimeRoster";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const CURRENT = Object.keys(allTimeRoster).sort().pop();

// Retired numbers are shown even though nobody on the rosters wears them.
const RETIRED = { "33": { name: "Kobe Bryant", grad: "1996", note: "Retired. His No. 33 hangs above the doors of Kobe Bryant Gymnasium." } };

// number -> [{ name, grad, seasons: [...] }]
function buildNumbers() {
  const map = {};
  Object.keys(allTimeRoster).sort().forEach(season => allTimeRoster[season].forEach(p => {
    const n = String(p.number || "").trim();
    if (!n) return;
    const name = `${p.first} ${p.last}`.trim();
    const list = (map[n] = map[n] || []);
    let who = list.find(x => x.name === name && x.grad === String(p.grad));
    if (!who) { who = { name, grad: String(p.grad), seasons: [] }; list.push(who); }
    who.seasons.push(season);
  }));
  Object.entries(RETIRED).forEach(([n, r]) => { (map[n] = map[n] || []).unshift({ name: r.name, grad: r.grad, seasons: [], note: r.note, retired: true }); });
  Object.values(map).forEach(list => list.sort((a, b) => (b.retired ? 1 : 0) - (a.retired ? 1 : 0) || (b.seasons[b.seasons.length - 1] || "").localeCompare(a.seasons[a.seasons.length - 1] || "")));
  return map;
}

const span = (seasons) => seasons.length === 0 ? "" : seasons.length === 1 ? seasons[0] : `${seasons[0]} to ${seasons[seasons.length - 1]}`;

export default function WhoWoreItPage() {
  const numbers = useMemo(buildNumbers, []);
  const keys = Object.keys(numbers).sort((a, b) => Number(a) - Number(b));
  const [pick, setPick] = useState(null);
  const [q, setQ] = useState("");
  // first season where most of the roster has numbers listed
  const firstSeason = Object.keys(allTimeRoster).sort().find(s => allTimeRoster[s].filter(p => p.number).length * 2 >= allTimeRoster[s].length);

  const found = q.trim().length >= 2
    ? keys.flatMap(n => numbers[n].filter(p => p.name.toLowerCase().includes(q.trim().toLowerCase())).map(p => ({ ...p, n })))
    : [];

  const open = (n) => { setPick(n); setTimeout(() => document.getElementById("wore-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30); };

  return (
    <section id="numbers" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>NUMBERS</div>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Jersey Numbers</div>
          <h2 className="section-title">Who<br /><span style={{ color: "var(--gold)" }}>Wore It</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 680, margin: "18px 0 0" }}>
            Tap a number to see every Ace who wore it, from the varsity rosters since {firstSeason}. No. 33 belongs to Kobe Bryant and nobody wears it.
          </p>
        </FadeIn>

        <div style={{ marginTop: 26, maxWidth: 420 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Find a player by name" aria-label="Find a player by name" style={{
            width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10,
            color: "#fff", padding: "12px 14px", fontFamily: SANS, fontSize: 16, outline: "none",
          }} />
          {q.trim().length >= 2 && (
            <div style={{ marginTop: 8 }}>
              {found.length === 0 && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>No one by that name on the rosters with a number.</div>}
              {found.map(p => (
                <button key={p.n + p.name} onClick={() => open(p.n)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 2px" }}>
                  <span style={{ fontFamily: OSW, fontSize: 22, fontWeight: 700, color: "var(--gold)", width: 40 }}>{p.n}</span>
                  <span style={{ fontFamily: SANS, fontSize: 15, color: "#fff" }}>{p.name} <span style={{ color: "rgba(255,255,255,0.5)" }}>'{p.grad.slice(2)}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))", gap: 10, marginTop: 30 }}>
          {keys.map(n => {
            const list = numbers[n]; const retired = list.some(p => p.retired); const on = pick === n;
            return (
              <button key={n} onClick={() => open(n)} aria-pressed={on} style={{
                aspectRatio: "1 / 1.05", cursor: "pointer", font: "inherit", color: "inherit", padding: 6,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: retired ? "linear-gradient(160deg,#f2ecdf,#e0d6c0)" : on ? "rgba(132,0,54,0.55)" : "rgba(132,0,54,0.18)",
                border: on ? "2px solid var(--gold)" : retired ? "2px solid #840036" : "1px solid rgba(201,164,74,0.3)", borderRadius: 12,
                transition: "transform 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                <span style={{ fontFamily: OSW, fontWeight: 700, fontSize: 38, lineHeight: 1, color: retired ? "#840036" : "#fff" }}>{n}</span>
                <span style={{ fontFamily: OSW, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6, color: retired ? "#840036" : "rgba(201,164,74,0.9)" }}>
                  {retired ? "Retired" : `${list.length} ${list.length === 1 ? "Ace" : "Aces"}`}
                </span>
              </button>
            );
          })}
        </div>

        {pick && (
          <div id="wore-detail" style={{ marginTop: 30, scrollMarginTop: 90, background: "linear-gradient(120deg, rgba(132,0,54,0.25), rgba(0,0,0,0.35))", border: "1px solid rgba(201,164,74,0.35)", borderRadius: 16, padding: "clamp(20px,4vw,30px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontFamily: OSW, fontWeight: 700, fontSize: 64, lineHeight: 1, color: "var(--gold)" }}>{pick}</span>
              <span style={{ fontFamily: OSW, fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                {numbers[pick].length} {numbers[pick].length === 1 ? "Ace has" : "Aces have"} worn it
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10, marginTop: 18 }}>
              {numbers[pick].map(p => (
                <div key={p.name + p.grad} style={{ display: "flex", alignItems: "center", gap: 14, background: p.retired ? "rgba(242,236,223,0.08)" : "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
                  <Avatar name={p.name} photo={photoFor(p.name)} size={52} highlight={p.retired} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: OSW, fontSize: 17, fontWeight: 600, color: "#fff" }}>{p.name} <span style={{ color: "var(--gold)", fontWeight: 400, fontSize: 14 }}>'{p.grad.slice(2)}</span></div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1.45 }}>
                      {p.retired ? p.note : `Wore it ${span(p.seasons)}${p.seasons.includes(CURRENT) ? ` · on the ${CURRENT} roster` : ""}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 30 }}>
          Numbers come from the season rosters on our Alumni page. Rosters before {firstSeason} do not list numbers yet. Know who wore a number before then? Use the Alumni check-in to tell us.
        </p>
      </div>
    </section>
  );
}
