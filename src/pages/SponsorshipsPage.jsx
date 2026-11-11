// pages/SponsorshipsPage.jsx
import { FadeIn, CountUp, Spade, sponsors } from "../shared";
import ContactForm from "../shared/ContactForm";

const whySponsor = [
  { icon: "📍", label: "Community Reach", desc: "Connect with thousands of Main Line families, students, alumni and fans across a full season of packed gyms." },
  { icon: "🏆", label: "Championship Brand", desc: "Align your business with 7× PIAA state champions and one of the most decorated programs in Pennsylvania." },
  { icon: "🎓", label: "Direct Impact", desc: "Every dollar goes straight to the student-athletes — travel, gear, academics and life-changing experiences." },
  { icon: "📣", label: "Season-Long Visibility", desc: "Your name and logo in front of engaged crowds from December through the district and state playoffs." },
];

const funds = [
  { icon: "🚌", label: "Team Travel" },
  { icon: "👕", label: "Equipment & Uniforms" },
  { icon: "🏀", label: "Youth Programs" },
  { icon: "🎉", label: "Awards & Banquet" },
  { icon: "🎥", label: "Streaming & Production" },
  { icon: "📚", label: "Tutoring & Academics" },
];

export default function SponsorshipsPage() {
  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Partner With Us</div>
          <h2 className="section-title">Sponsor<br /><span style={{ color: "var(--gold)" }}>The Aces</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Current partners */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>Our Partners</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 24px", maxWidth: 620 }}>
              We are proud to partner with the businesses and families who make Aces basketball possible. There is room on the wall for yours.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {sponsors.map((sp) => (
                <a key={sp.name} href={sp.url} target="_blank" rel="noopener noreferrer" aria-label={`${sp.name} ${sp.place}`} style={{
                  gridColumn: "1 / -1",
                  background: "#fff",
                  border: "2px solid rgba(201,164,74,0.6)",
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
                  padding: 18, textDecoration: "none", transition: "transform 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                  <img src={sp.logo} alt={`${sp.name} ${sp.place}`} style={{ height: 150, width: "auto", maxWidth: "60%", objectFit: "contain" }} />
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 1.5, color: "#840036", textTransform: "uppercase", lineHeight: 1.4 }}>{sp.name}<br />{sp.place}<br /><span style={{ fontSize: 11, color: "#555" }}>Visit them →</span></span>
                </a>
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: "3 / 2",
                  background: "rgba(255,255,255,0.015)",
                  border: "1px dashed rgba(201,164,74,0.28)",
                  borderRadius: 12,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.6)"; e.currentTarget.style.background = "rgba(132,0,54,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.28)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}>
                  <Spade size={22} color="#840036" />
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Your Logo Here</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Intro card */}
        <FadeIn delay={0.15}>
          <div style={{
            marginTop: 40,
            background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
            border: "1px solid rgba(132,0,54,0.35)",
            borderRadius: 16,
            padding: "48px 44px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(132,0,54,0.18),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 24, opacity: 0.8 }}>
                ♠ Aces Nation
              </div>
              <p style={{
                fontFamily: "'Source Sans 3',sans-serif",
                fontSize: 17,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 2,
                margin: 0,
              }}>
                Partner with one of the most storied programs in Pennsylvania basketball. Seven PIAA state championships, the alma mater of Kobe Bryant, and a tradition built over more than a century — Lower Merion basketball is woven into the fabric of the Main Line. A sponsorship puts your business in front of an engaged community of families, alumni, students and fans across a full season of packed gyms and streamed games, while directly supporting the student-athletes who carry the Maroon & Gold forward.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Reach stat row */}
        <FadeIn delay={0.25}>
          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: 24,
            textAlign: "center",
            padding: "36px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
          }}>
            {[
              { end: 7, suffix: "×", label: "State Championships" },
              { end: 25, suffix: "+", label: "Home Games / Season" },
              { end: 24, suffix: "", label: "League Titles" },
              { end: 1663, suffix: "+", label: "All-Time Wins" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.34)", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Why sponsor */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>Why Sponsor the Aces</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 12 }}>
              {whySponsor.map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "26px 24px",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(132,0,54,0.4)"; e.currentTarget.style.background = "rgba(132,0,54,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                  <span style={{ fontSize: 26 }}>{item.icon}</span>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: 1.5, color: "#fff", textTransform: "uppercase", margin: "14px 0 10px" }}>{item.label}</div>
                  <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* What your sponsorship funds */}
        <FadeIn delay={0.4}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 24 }}>What Your Sponsorship Funds</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {funds.map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "20px",
                  display: "flex", alignItems: "center", gap: 14,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(132,0,54,0.4)"; e.currentTarget.style.background = "rgba(132,0,54,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Contact form -> aceshoops@gmail.com */}
        <FadeIn delay={0.5}>
          <div style={{ marginTop: 56 }}>
            <ContactForm topic="Sponsorship" title="Become a Sponsor" blurb="Want to partner with the Aces? Tell us a little about your business and we will reach out." />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
