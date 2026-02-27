// pages/HomePage.jsx
import { useState, useEffect } from "react";
import { FadeIn, CountUp, SpadeIcon } from "../shared";

const bannerTexts = [
  { title: "7× PIAA State Champions",     sub: "The Pride of the Main Line" },
  { title: "Kobe Bryant's Alma Mater",    sub: "Where Mamba Mentality Was Born" },
  { title: "600+ Wins Under Coach Downer", sub: "A Living Legend" },
  { title: "Est. 1911 · Ardmore, PA",     sub: "Over a Century of Excellence" },
];

export default function HomePage({ scrollTo }) {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % bannerTexts.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #0a0005 0%, #1a0010 50%, #0a0005 100%)" }}>
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "0 5%" }}>
          <FadeIn>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(60px, 15vw, 140px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 0.85, color: "#fff" }}>
              LOWER<br />MERION
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(16px, 3vw, 22px)", letterSpacing: 8, color: "var(--gold)", textTransform: "uppercase", marginTop: 20 }}>
              Aces Basketball — Ardmore, Pennsylvania
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div style={{ marginTop: 40, minHeight: 80 }}>
              {bannerTexts.map((b, i) => (
                <div key={i} style={{ display: i === activeBanner ? "block" : "none", transition: "opacity 0.5s ease" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 32px)", color: "#fff" }}>{b.title}</div>
                  <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{b.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.35}>
            <button onClick={() => scrollTo("history")} style={{ marginTop: 40, background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", padding: "12px 28px", borderRadius: 4, cursor: "pointer", fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 3 }}>
              Scroll ↓
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: "#0d0008", padding: "60px 5%", borderTop: "1px solid rgba(132,0,54,0.3)", borderBottom: "1px solid rgba(132,0,54,0.3)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 40, textAlign: "center" }}>
          {[
            { end: 7,    suffix: "×", label: "State Championships" },
            { end: 738,  suffix: "+", label: "Career Wins (Downer Era)" },
            { end: 23,   suffix: "",  label: "Central League Titles" },
            { end: 70,   suffix: "+", label: "College/Pro Players" },
            { end: 1663, suffix: "+", label: "All-Time Program Wins" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
                <CountUp end={s.end} suffix={s.suffix} />
              </div>
              <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
