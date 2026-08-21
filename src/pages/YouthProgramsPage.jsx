// pages/YouthProgramsPage.jsx
import { FadeIn, CountUp, Spade } from "../shared";

const programs = [
  {
    icon: "🏀",
    name: "Little Aces Clinic",
    badge: "Grades K–2",
    desc: "Where it all begins. Boys and girls learn the fundamentals through fun, high-energy stations — dribbling, passing, shooting form — building into their very first scrimmages.",
    when: "Saturday mornings · Winter",
  },
  {
    icon: "🎯",
    name: "Aces Youth League",
    badge: "Grades 3–5",
    desc: "A true in-house league with drafted teams, weekly practices and a full game schedule. Young players learn to compete, share the ball and play the Aces way.",
    when: "In-house league · Dec–Feb",
  },
  {
    icon: "⚡",
    name: "Middle School Development",
    badge: "Grades 6–8",
    desc: "The direct feeder to the high school program. Travel and in-house squads run the same offensive and defensive concepts they will use in Maroon & White.",
    when: "Travel & in-house · Nov–Mar",
  },
  {
    icon: "☀️",
    name: "Summer Camp",
    badge: "Ages 6–14",
    desc: "A week-long camp for all skill levels held at the high school. Daily skill instruction, contests and games led by the varsity staff and current Aces players.",
    when: "Week-long sessions · June & July",
  },
  {
    icon: "🎓",
    name: "Skills Academy",
    badge: "Grades 4–8",
    desc: "Small-group training capped at low numbers for maximum reps. Position-specific ball-handling, finishing and shooting work to accelerate individual development.",
    when: "Small-group sessions · Year-round",
  },
  {
    icon: "♠",
    name: "Girls Program",
    badge: "Grades K–8",
    desc: "A dedicated pathway for the next generation of Lady Aces, honoring a tradition that produced 1,676-point scorer and Rhodes finalist Sarah Lowe. Clinics, league and camp.",
    when: "Clinics & league · Winter",
  },
];

const pathway = [
  { step: "01", label: "Youth", detail: "Grades K–8 — clinics, league & camp. Fundamentals and a love for the game." },
  { step: "02", label: "Middle School", detail: "The feeder program. Same system, same terminology as the varsity." },
  { step: "03", label: "JV", detail: "The high school proving ground under the Aces coaching staff." },
  { step: "04", label: "Varsity", detail: "Central League & District 1 6A — the program that produced Kobe Bryant." },
  { step: "05", label: "College", detail: "40+ Aces have played at the D-I, D-II, D-III and professional levels." },
];

export default function YouthProgramsPage() {
  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Next Generation</div>
          <h2 className="section-title">Youth<br /><span style={{ color: "var(--gold)" }}>Programs</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Intro card */}
        <FadeIn delay={0.15}>
          <div style={{
            marginTop: 48,
            background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
            border: "1px solid rgba(132,0,54,0.35)",
            borderRadius: 16,
            padding: "48px 44px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(132,0,54,0.15),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 24, opacity: 0.8 }}>
                ♠ Building the Next Aces
              </div>
              <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 2, margin: 0 }}>
                Every Ace starts somewhere. Our youth programs are the foundation of Lower Merion basketball — a clear developmental pathway that carries a young player from their first dribble in grade school all the way to the varsity program that produced Kobe Bryant and more than 40 college players. We teach the same values, the same terminology and the same brand of team basketball at every level. This is where the tradition is passed down, and where the next generation of Maroon & White is made.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Stat row */}
        <FadeIn delay={0.25}>
          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 24, textAlign: "center" }}>
            {[
              { end: 250, suffix: "+", label: "Youth Players" },
              { end: 20, suffix: "", label: "Youth Teams" },
              { end: 8, suffix: "", label: "Grades Served (K–8)" },
              { end: 6, suffix: "", label: "Programs" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "26px 14px",
              }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(32px,4vw,46px)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.34)", textTransform: "uppercase", marginTop: 9 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Programs grid */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>Our Programs</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
              {programs.map((p, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "26px 24px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(132,0,54,0.45)"; e.currentTarget.style.background = "rgba(132,0,54,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 26 }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.25)", borderRadius: 20, padding: "5px 12px", whiteSpace: "nowrap" }}>{p.badge}</span>
                  </div>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 19, letterSpacing: 1, color: "#fff", textTransform: "uppercase", marginBottom: 12 }}>{p.name}</div>
                  <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 18px" }}>{p.desc}</p>
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                    <Spade size={11} color="#840036" /> {p.when}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* The Aces Pathway */}
        <FadeIn delay={0.35}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>The Aces Pathway</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 620, margin: "0 0 28px" }}>
              One program, five stages. Every level is designed to prepare a player for the next, so the jump to varsity feels like a natural next step rather than a leap.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
              {pathway.map((s, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(132,0,54,0.14), rgba(0,0,0,0.4))",
                  border: "1px solid rgba(132,0,54,0.3)",
                  borderRadius: 12,
                  padding: "24px 20px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(132,0,54,0.3)"; }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 44, fontWeight: 700, color: "rgba(201,164,74,0.18)", lineHeight: 1, marginBottom: 6 }}>{s.step}</div>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>{s.label}</div>
                  <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Coaching note */}
        <FadeIn delay={0.4}>
          <div style={{
            marginTop: 48,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 28,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "36px 40px",
          }}>
            <img src="/LM_Logo.png" alt="Lower Merion Aces" style={{ height: 92, width: "auto", flexShrink: 0, filter: "drop-shadow(0 0 24px rgba(132,0,54,0.4))" }} />
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 14 }}>Coached the Aces Way</div>
              <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, margin: 0 }}>
                Our youth programs are led by the Lower Merion varsity coaching staff and former Aces players who came up through this very pathway. From the Little Aces Clinic to Middle School Development, every group runs the same system, the same values and the same terminology as Coach Downer's varsity — so when a player finally pulls on the Maroon & White, they already speak the language.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.45}>
          <div style={{
            marginTop: 48, textAlign: "center",
            padding: "44px 40px", borderRadius: 12,
            background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
            border: "1px solid rgba(201,164,74,0.25)",
          }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, letterSpacing: 3, color: "var(--gold)", marginBottom: 12, textTransform: "uppercase" }}>Join the Next Class of Aces</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 8px" }}>
              Ready to get your young player on the court? Registration opens each fall. Reach out to the Lower Merion Athletic Department to reserve a spot or ask about the program that fits your child.
            </p>
            <p style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: "0 0 28px" }}>Registration opens each fall</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <a href="mailto:athletics@lmsd.org" style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "rgba(132,0,54,0.5)",
                border: "1px solid rgba(201,164,74,0.5)",
                borderRadius: 6,
                fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2,
                color: "var(--gold)", textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,0,54,0.7)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(132,0,54,0.5)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.5)"; }}>
                Express Interest
              </a>
              <a href="https://www.lmsd.org/lowermerion" target="_blank" rel="noreferrer" style={{
                display: "inline-block",
                padding: "12px 32px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2,
                color: "rgba(255,255,255,0.75)", textDecoration: "none",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
                Visit LMSD.org
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
