// pages/HistoryPage.jsx
import { FadeIn, Spade } from "../shared";

const coaches = [
  { name: "Gregg Downer",    years: "1990–Present", record: "738-278", pct: ".726", titles: "3× State Champs ('96, '06, '13)", highlight: true },
  { name: "William Anderson", years: "1927–1945",  record: "346-55",  pct: ".863", titles: "4× State Champs ('33, '41, '42, '43)" },
  { name: "Bill Stephens",   years: "1970–1979",   record: "145-64",  pct: ".694", titles: "4× League Champs, 2× District 1" },
  { name: "Larry Davis",     years: "1960–1970",   record: "111-92",  pct: ".547", titles: "Central League Champ ('68)" },
  { name: "Michael Manning", years: "1979–1990",   record: "100-142", pct: ".413", titles: "Central League Champ ('84)" },
  { name: "Robert Ruoff",    years: "1953–1958",   record: "58-38",   pct: ".604", titles: "" },
  { name: "Jack Hinchey",    years: "1947–1952",   record: "48-54",   pct: ".471", titles: "" },
  { name: "O. Robinson",     years: "1945–47, 52–53", record: "29-29", pct: ".500", titles: "Suburban League ('46)" },
];

export default function HistoryPage() {
  return (
    <section id="history" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>LEGACY</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/celebrate.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label">
            <Spade size={14} color="#840036" /> Program History
          </div>
          <h2 className="section-title">A Legacy<br /><span style={{ color: "var(--gold)" }}>Like No Other</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Narrative */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginTop: 48 }}>
          {[
            "Lower Merion basketball is one of the most successful programs in Pennsylvania history, with roots stretching back to 1921. The Aces have amassed more than 1,660 victories, a 66.3% all-time winning percentage, and seven PIAA State Championships — the second-most of any program in the Commonwealth.",
            "The foundation was built by legendary coach William \"Andy\" Anderson, who compiled a remarkable 346-55 record (.863) from 1927 to 1945, capturing four state titles — including three consecutive championships in 1941, '42, and '43, a first in PA history.",
            "In 1990, a young Gregg Downer took the reins and ushered in a new era. Three years later, a freshman named Kobe Bryant arrived and the program exploded onto the national stage. The 1996 Aces rode a 30-game winning streak to the state title, finishing 31-3.",
          ].map((text, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>{text}</p>
            </FadeIn>
          ))}
        </div>

        {/* All-Time Stats */}
        <FadeIn delay={0.2}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 64, borderRadius: 12, overflow: "hidden" }}>
            {[
              { stat: "1,663", label: "All-Time Wins" },
              { stat: "104",   label: "Seasons" },
              { stat: ".663",  label: "Win Percentage" },
              { stat: "7",     label: "State Championships" },
              { stat: "17",    label: "District 1 Titles" },
              { stat: "23",    label: "League Titles" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 120px", background: "rgba(255,255,255,0.03)", padding: "28px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{s.stat}</div>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Defining Eras */}
        <FadeIn delay={0.15}>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: 72, marginBottom: 28 }}>Defining Eras</h3>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { era: "The Anderson Dynasty", years: "1927 – 1945", stat: "346-55 · .863", text: "Coach William \"Andy\" Anderson built the foundation with four state titles, including three straight in 1941, '42 and '43 — a Pennsylvania first." },
            { era: "The Kobe Years", years: "1993 – 1996", stat: "31-3 · State Champs", text: "A freshman phenom arrives on the Main Line. The 1996 Aces ride a 30-game winning streak to the state crown and launch a global legend.", highlight: true },
            { era: "The Modern Aces", years: "1990 – Present", stat: "738+ Wins · 3 Titles", text: "Gregg Downer's era: three state championships, seventeen District 1 crowns, and a program that never stops competing at the top." },
          ].map((e, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                height: "100%",
                background: e.highlight ? "linear-gradient(135deg, rgba(132,0,54,0.28), rgba(201,164,74,0.06))" : "rgba(255,255,255,0.02)",
                border: e.highlight ? "1px solid rgba(201,164,74,0.35)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "26px 24px",
                marginTop: [18, 0, 30][i] || 0,
              }}>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{e.years}</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: e.highlight ? "var(--gold)" : "#fff", marginTop: 6, lineHeight: 1.1 }}>{e.era}</div>
                <div style={{ display: "inline-block", marginTop: 12, marginBottom: 14, padding: "4px 12px", borderRadius: 20, background: e.highlight ? "rgba(201,164,74,0.15)" : "rgba(132,0,54,0.2)", border: `1px solid ${e.highlight ? "rgba(201,164,74,0.3)" : "rgba(132,0,54,0.35)"}`, fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 1, color: e.highlight ? "var(--gold)" : "rgba(255,255,255,0.7)" }}>{e.stat}</div>
                <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>{e.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Coaching History */}
        <FadeIn delay={0.2}>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: 72, marginBottom: 28 }}>Coaching History</h3>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {coaches.map((c, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", padding: "20px 24px", background: c.highlight ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)", borderLeft: c.highlight ? "3px solid var(--maroon)" : "3px solid transparent", borderRadius: 4 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{c.years} · {c.pct} win pct</div>
                </div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: "var(--gold)", fontWeight: 600, minWidth: 80 }}>{c.record}</div>
                {c.titles && (
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", flex: "1 1 200px" }}>{c.titles}</div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
