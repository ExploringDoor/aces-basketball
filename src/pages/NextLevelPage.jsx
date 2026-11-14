import { FadeIn, Spade, Avatar, photoFor } from "../shared";
import { nextLevel } from "../shared/nextLevel";
import AlumniForm from "../shared/AlumniForm";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";

const GROUPS = [
  { key: "pro",     label: "The Pros",      blurb: "Aces who were paid to play.", test: p => !!p.pro },
  { key: "D-I",     label: "Division I",    blurb: "", test: p => !p.pro && p.level === "D-I" },
  { key: "D-II",    label: "Division II",   blurb: "", test: p => !p.pro && p.level === "D-II" },
  { key: "D-III",   label: "Division III",  blurb: "", test: p => !p.pro && p.level === "D-III" },
  { key: "College", label: "College",       blurb: "", test: p => !p.pro && p.level === "College" },
];

function Row({ p, big }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, height: "100%", boxSizing: "border-box",
      background: big ? "linear-gradient(120deg, rgba(132,0,54,0.28), rgba(0,0,0,0.35))" : "rgba(255,255,255,0.03)",
      border: big ? "1px solid rgba(201,164,74,0.3)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: big ? "16px 18px" : "13px 16px",
    }}>
      <Avatar name={p.name} photo={photoFor(p.name)} size={big ? 64 : 46} highlight={big} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: OSW, fontSize: big ? 19 : 16, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
          {p.name} {p.cls && <span style={{ color: "var(--gold)", fontWeight: 400, fontSize: big ? 15 : 13 }}>{p.cls}</span>}
        </div>
        {p.pro && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.45, marginTop: 3 }}>{p.pro}</div>}
        <div style={{ fontFamily: SANS, fontSize: 13.5, color: p.pro ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.8)", lineHeight: 1.45, marginTop: 2 }}>{p.college}</div>
        {p.note && <div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, marginTop: 2 }}>{p.note}</div>}
      </div>
    </div>
  );
}

export default function NextLevelPage() {
  const pros = nextLevel.filter(p => p.pro).length;
  return (
    <section id="nextlevel" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>NEXT</div>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> After Lower Merion</div>
          <h2 className="section-title">Aces at the<br /><span style={{ color: "var(--gold)" }}>Next Level</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 660, margin: "18px 0 0" }}>
            {nextLevel.length} Aces who kept playing after high school, {pros} of them professionally. Played after Lower Merion and not on the list? <a href="#nextlevel" onClick={e => { e.preventDefault(); document.getElementById("alumni-checkin")?.scrollIntoView({ behavior: "smooth" }); }} style={{ color: "var(--gold)", textDecoration: "none" }}>Check in below ›</a>
          </p>
        </FadeIn>
        {GROUPS.map((g, gi) => {
          const people = nextLevel.filter(g.test);
          if (!people.length) return null;
          const big = g.key === "pro";
          return (
            <div key={g.key} style={{ marginTop: gi ? 52 : 44 }}>
              <FadeIn>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: OSW, fontSize: 14, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", margin: 0 }}>{g.label}</h3>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{people.length}</span>
                </div>
              </FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${big ? 320 : 250}px,1fr))`, gap: 10 }}>
                {people.map((p, i) => <FadeIn key={p.name} delay={Math.min(i, 8) * 0.03} className="h100"><Row p={p} big={big} /></FadeIn>)}
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 64 }}><AlumniForm id="alumni-checkin" /></div>
      </div>
    </section>
  );
}
