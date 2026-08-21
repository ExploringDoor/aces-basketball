// pages/AcademicsPage.jsx
import { FadeIn, CountUp, Spade } from "../shared";

const support = [
  { icon: "📚", label: "Team Study Hall", desc: "Mandatory monitored study hall keeps players ahead of assignments during the season. Homework, film, and books before the ball." },
  { icon: "🧑‍🏫", label: "Tutoring & Mentoring", desc: "Peer and faculty tutors, plus alumni mentors, are matched to any student-athlete who needs subject-specific help." },
  { icon: "🎓", label: "NCAA Eligibility Guidance", desc: "Staff and counselors walk families through NCAA Eligibility Center registration, core-course tracking, and amateurism rules." },
  { icon: "📈", label: "College Recruiting Support", desc: "Coach Downer and his staff advocate for players with college programs and help align athletic fit with academic goals." },
  { icon: "✏️", label: "SAT / ACT Prep", desc: "Access to Lower Merion's test-prep resources, practice exams, and scheduling so testing never collides with the season." },
  { icon: "🔍", label: "Progress Monitoring", desc: "Weekly grade checks and eligibility reviews catch trouble early. Accountability is the standard, not the exception." },
];

const placements = [
  { name: "Sarah Lowe", year: "'02", college: "University of Florida", note: "Fulbright Scholar and 2× Rhodes Scholarship Finalist. Woody Hayes National Scholar Athlete of the Year." },
  { name: "Sam Brown", year: "'23", college: "University of Pennsylvania", note: "Ivy League. Balanced 1,000+ career points with an admission to one of the nation's top universities." },
  { name: "Jack Forrest", year: "'19", college: "Columbia → Saint Joseph's", note: "Began his college career in the Ivy League at Columbia before transferring to Saint Joseph's (D-I)." },
  { name: "Al Bonniwell", year: "'30", college: "Dartmouth College", note: "NCAA First Team All-American and First Team All-Ivy League. An Ace nearly a century before today's scholars." },
  { name: "Alai Nuualiitia", year: "'98", college: "Brown University", note: "Ivy League. 3× All-Ivy selection and a member of the Brown University Hall of Fame." },
  { name: "Demetrius Lilley", year: "'22", college: "Penn State", note: "Big Ten Conference. Central League MVP who carried the program's academic-and-athletic standard to a Power Five." },
  { name: "Ryan Brooks", year: "'06", college: "Temple University", note: "All-Atlantic 10 at Temple. A state-championship Ace who thrived in a demanding academic and athletic program." },
];

const values = [
  { icon: "⏱️", label: "Time Management", desc: "Balancing practice, film, travel, and a rigorous Lower Merion course load teaches players to own every hour of the day." },
  { icon: "🧭", label: "Discipline", desc: "The same accountability that shows up in the gym shows up in the classroom. There are no shortcuts to either." },
  { icon: "🤝", label: "Leadership", desc: "Captains set the tone in study hall as well as on the floor, modeling the standard for younger student-athletes." },
];

export default function AcademicsPage() {
  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Student-Athletes First</div>
          <h2 className="section-title">Academic<br /><span style={{ color: "var(--gold)" }}>Excellence</span></h2>
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
                ♠ Classroom First
              </div>
              <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 2, margin: 0 }}>
                Lower Merion is one of the most respected academic high schools in Pennsylvania, and the Aces wear the word student-athlete in that order. At Lower Merion the classroom comes first. Our culture is built on accountability: monitored team study hall, weekly grade checks, and firm eligibility standards that hold every player to the same line. That same discipline that produces Central League and District 1 titles also produces scholars. Aces alumni have gone on to earn degrees from Ivy League universities and the nation's top Division I programs, proof that the habits learned in this gym carry far beyond it.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Stat row */}
        <FadeIn delay={0.25}>
          <div style={{
            marginTop: 40,
            padding: "36px 5%",
            background: "#0d0008",
            border: "1px solid rgba(132,0,54,0.2)",
            borderRadius: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 32,
            textAlign: "center",
          }}>
            <div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>3.4</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.34)", textTransform: "uppercase", marginTop: 8 }}>Team GPA</div>
            </div>
            {[
              { end: 40, suffix: "+", label: "College Players" },
              { end: 8, suffix: "", label: "Ivy / D-I Programs" },
              { end: 100, suffix: "%", label: "Graduation Rate" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.34)", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Academic support grid */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>Academic Support</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {support.map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "24px 22px",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(132,0,54,0.4)"; e.currentTarget.style.background = "rgba(132,0,54,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: 1.2, color: "#fff", textTransform: "uppercase", marginBottom: 10 }}>{item.label}</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* College placement highlight */}
        <FadeIn delay={0.35}>
          <div style={{ marginTop: 60 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>Where Aces Go To Learn</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 640, margin: "0 0 26px" }}>
              The names on these banners did not just win games. They earned their way into some of the finest classrooms in the country.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
              {placements.map((p, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(132,0,54,0.12), rgba(0,0,0,0.35))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "24px 22px",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.45)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 0.5, color: "#fff", textTransform: "uppercase" }}>{p.name}</span>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{p.year}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontStyle: "italic", color: "var(--gold)", marginBottom: 12 }}>{p.college}</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{p.note}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Scholar-athlete recognition */}
        <FadeIn delay={0.4}>
          <div style={{ marginTop: 60 }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
              border: "1px solid rgba(132,0,54,0.35)",
              borderRadius: 16,
              padding: "44px 40px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", bottom: -70, left: -50, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,164,74,0.1),transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 18 }}>Scholar-Athlete Recognition</div>
                <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.95, margin: "0 0 28px", maxWidth: 720 }}>
                  Every season Aces earn spots on the Distinguished Honor Roll and Honor Roll, and the program celebrates its Central League and District 1 Scholar-Athlete honorees alongside its champions. We believe the two go together. The game demands the very habits that build great students, and we hold our players to both standards at once.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                  {values.map((v, i) => (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12,
                      padding: "22px 20px",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 12 }}>{v.icon}</div>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 1.5, color: "#fff", textTransform: "uppercase", marginBottom: 8 }}>{v.label}</div>
                      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{v.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.45}>
          <div style={{
            marginTop: 48, textAlign: "center",
            padding: "44px 40px", borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,164,74,0.2)",
          }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, letterSpacing: 3, color: "var(--gold)", marginBottom: 12, textTransform: "uppercase" }}>Academic Questions?</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 28px" }}>
              For questions about eligibility, counseling, tutoring, or the NCAA process, connect with the Lower Merion School Counseling Office or the Athletic Department. We are here to keep your student-athlete on track in the classroom and beyond.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://www.lmsd.org/lowermerion" target="_blank" rel="noreferrer" style={{
                display: "inline-block", padding: "12px 32px",
                background: "rgba(132,0,54,0.4)", border: "1px solid rgba(201,164,74,0.4)", borderRadius: 6,
                fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2, color: "var(--gold)", textDecoration: "none", textTransform: "uppercase", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,0,54,0.6)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(132,0,54,0.4)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.4)"; }}>
                Visit LMSD.org
              </a>
              <a href="mailto:athletics@lmsd.org" style={{
                display: "inline-block", padding: "12px 32px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
                fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2, color: "rgba(255,255,255,0.7)", textDecoration: "none", textTransform: "uppercase", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.5)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                Email Athletics
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
