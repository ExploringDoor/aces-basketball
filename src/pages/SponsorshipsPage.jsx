// pages/SponsorshipsPage.jsx
import { FadeIn, CountUp, Spade } from "../shared";

const whySponsor = [
  { icon: "📍", label: "Community Reach", desc: "Connect with thousands of Main Line families, students, alumni and fans across a full season of packed gyms." },
  { icon: "🏆", label: "Championship Brand", desc: "Align your business with 7× PIAA state champions and one of the most decorated programs in Pennsylvania." },
  { icon: "🎓", label: "Direct Impact", desc: "Every dollar goes straight to the student-athletes — travel, gear, academics and life-changing experiences." },
  { icon: "📣", label: "Season-Long Visibility", desc: "Your name and logo in front of engaged crowds from December through the district and state playoffs." },
];

const tiers = [
  {
    name: "Sixth Man",
    price: "$250",
    per: "per season",
    benefits: [
      "Website sponsor listing",
      "Social media thank-you post",
    ],
  },
  {
    name: "Bulldog",
    price: "$500",
    per: "per season",
    benefits: [
      "Website sponsor listing",
      "Social media thank-you post",
      "Name in the printed game program",
      "Game-night PA shout-out",
    ],
  },
  {
    name: "Maroon & Gold",
    price: "$1,500",
    per: "per season",
    benefits: [
      "Website sponsor listing",
      "Social media thank-you post",
      "Name in the printed game program",
      "Game-night PA shout-out",
      "Gym banner displayed all season",
      "Logo on the website sponsor wall",
    ],
  },
  {
    name: "Championship",
    price: "$5,000+",
    per: "per season",
    label: "Presenting",
    featured: true,
    benefits: [
      "Website sponsor listing",
      "Social media thank-you post",
      "Name in the printed game program",
      "Game-night PA shout-out",
      "Gym banner displayed all season",
      "Logo on the website sponsor wall",
      "Logo on team warm-up shirts",
      "Featured placement across all channels",
      "Recognition at the year-end banquet",
    ],
  },
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
              { end: 23, suffix: "", label: "League Titles" },
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

        {/* Sponsorship tiers — centerpiece */}
        <FadeIn delay={0.35}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>Sponsorship Tiers</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 28px", maxWidth: 620 }}>
              Choose the level that fits your business. Benefits build on the tier before it, so each step up carries everything below it — plus more.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16, alignItems: "start" }}>
              {tiers.map((tier, i) => {
                const featured = tier.featured;
                return (
                  <div key={i} style={{
                    position: "relative",
                    background: featured
                      ? "linear-gradient(135deg, rgba(201,164,74,0.14), rgba(132,0,54,0.18))"
                      : "rgba(255,255,255,0.02)",
                    border: featured ? "1px solid rgba(201,164,74,0.55)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    padding: featured ? "36px 26px 30px" : "30px 26px",
                    boxShadow: featured ? "0 0 40px rgba(201,164,74,0.16)" : "none",
                    transition: "all 0.2s",
                    overflow: "hidden",
                  }}
                    onMouseEnter={e => {
                      if (featured) { e.currentTarget.style.boxShadow = "0 0 56px rgba(201,164,74,0.28)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.8)"; }
                      else { e.currentTarget.style.borderColor = "rgba(132,0,54,0.5)"; e.currentTarget.style.background = "rgba(132,0,54,0.08)"; }
                    }}
                    onMouseLeave={e => {
                      if (featured) { e.currentTarget.style.boxShadow = "0 0 40px rgba(201,164,74,0.16)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.55)"; }
                      else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }
                    }}>
                    {featured && (
                      <div style={{ position: "absolute", top: 0, right: 0, background: "var(--gold)", color: "#0a0005", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", padding: "5px 14px", borderBottomLeftRadius: 10, fontWeight: 700 }}>
                        {tier.label}
                      </div>
                    )}
                    <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, letterSpacing: 1.5, color: featured ? "var(--gold)" : "#fff", textTransform: "uppercase", marginBottom: 10 }}>{tier.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 34, fontWeight: 700, color: featured ? "#fff" : "var(--gold)", lineHeight: 1 }}>{tier.price}</span>
                      <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{tier.per}</span>
                    </div>
                    <div style={{ height: 1, background: featured ? "rgba(201,164,74,0.35)" : "rgba(255,255,255,0.08)", marginBottom: 18 }} />
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                      {tier.benefits.map((b, bi) => (
                        <li key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.68)", lineHeight: 1.5 }}>
                          <span style={{ flexShrink: 0, marginTop: 2 }}><Spade size={12} color={featured ? "#c9a44a" : "#840036"} /></span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, margin: "22px 0 0", textAlign: "center" }}>
              All sponsorships are tax-deductible to the extent allowed by law. Registration opens each fall ahead of the season.
            </p>
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

        {/* Current partners */}
        <FadeIn delay={0.45}>
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>Our Partners</div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 24px", maxWidth: 620 }}>
              We are proud to partner with the businesses and families who make Aces basketball possible. There is room on the wall for yours.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
              {Array.from({ length: 8 }).map((_, i) => (
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

        {/* CTA */}
        <FadeIn delay={0.5}>
          <div style={{
            marginTop: 56, textAlign: "center",
            padding: "44px 40px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
            border: "1px solid rgba(201,164,74,0.3)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", bottom: -70, left: -50, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,164,74,0.12),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, letterSpacing: 3, color: "var(--gold)", marginBottom: 14, textTransform: "uppercase" }}>Become a Sponsor</div>
              <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 28px" }}>
                Ready to partner with the Aces, or want to build something that fits your business? Reach out to the Lower Merion Athletic Department to get started. Custom packages available.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                <a href="mailto:athletics@lmsd.org" style={{
                  display: "inline-block",
                  padding: "13px 34px",
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
                  Email the Athletic Dept.
                </a>
                <a href="https://www.lmsd.org/lowermerion" target="_blank" rel="noreferrer" style={{
                  display: "inline-block",
                  padding: "13px 34px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 6,
                  fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2,
                  color: "rgba(255,255,255,0.75)", textDecoration: "none",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,164,74,0.6)"; e.currentTarget.style.color = "var(--gold)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                  Visit LMSD.org
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
