// pages/FallClinicsPage.jsx
// Marketing page for the Fall Clinic Series. Real registration + secure
// payment happen on /register.html (the carried, re-skinned static page).
import { FadeIn, Spade, Icon } from "../shared";

const DETAILS = [
  ["calendar", "Sundays this fall", "11:00 AM – 12:15 PM"],
  ["users", "Boys & girls, ages 6–14", "All skill levels welcome"],
  ["pin", "Kobe Bryant Gymnasium", "Lower Merion HS · 315 E. Montgomery Ave, Ardmore"],
  ["whistle", "Lower Merion coaches & players", "Fundamentals, skills, and real competition"],
];

// The last Fall Sunday (keep in sync with api/_clinic.js). After it ends the page stops
// selling and says spring dates are coming; add the spring season to _clinic.js and
// register.html, then point this at its last date.
const SERIES_ENDS = new Date("2026-11-01T12:15:00-05:00");

export default function FallClinicsPage() {
  const open = new Date() < SERIES_ENDS;
  const cta = {
    display: "inline-flex", alignItems: "center", gap: 10,
    fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase",
    padding: "16px 38px", borderRadius: 10, cursor: "pointer", color: "#fff", textDecoration: "none",
    background: "var(--maroon)", border: "1px solid var(--maroon)", transition: "all 0.2s",
  };
  const priceCard = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "26px 24px" };

  return (
    <section id="clinics" style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>TRAIN</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/finish.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Train With the Aces</div>
          <h2 className="section-title">{open ? "Fall" : "Aces"}<br /><span style={{ color: "var(--gold)" }}>Clinics</span></h2>
          <div className="divider" />
          {open && <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 20, lineHeight: 1.8, maxWidth: 680 }}>
            Train in the Kobe Bryant Gymnasium with Lower Merion coaches and players. Our Fall Clinic Series builds fundamentals, confidence, and a love for the game for boys and girls ages 6 to 14. Pick individual Sundays or save with the full series.
          </p>}
        </FadeIn>

        {open && <>
        {/* Pricing */}
        <FadeIn delay={0.1}>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div style={priceCard}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Single Sunday</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 40, fontWeight: 700, color: "#fff", margin: "4px 0" }}>$35</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Drop in for any week.</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(132,0,54,0.22), rgba(0,0,0,0.5))", border: "1px solid rgba(201,164,74,0.4)", borderRadius: 14, padding: "26px 24px" }}>
              <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.9)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Best Value · Save $46</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>All Six Sundays</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 40, fontWeight: 700, color: "#fff", margin: "4px 0" }}>$164</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>The full series, one checkout.</div>
            </div>
          </div>
        </FadeIn>

        {/* Details */}
        <FadeIn delay={0.16}>
          <div style={{ marginTop: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "26px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {DETAILS.map(([ic, a, b], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ color: "rgba(201,164,74,0.85)", flexShrink: 0, marginTop: 2 }}><Icon name={ic} size={18} /></span>
                <div>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 0.5, color: "#fff", textTransform: "uppercase" }}>{a}</div>
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        </>}

        {/* Register CTA -> real registration + payment page */}
        <FadeIn delay={0.22}>
          <div style={{ marginTop: 40, textAlign: "center", background: "rgba(132,0,54,0.12)", border: "1px solid rgba(201,164,74,0.25)", borderRadius: 16, padding: "clamp(32px, 6vw, 52px)" }}>
            <h3 style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(28px,4.5vw,44px)", textTransform: "uppercase", margin: "0 0 10px", letterSpacing: 0.5 }}>{open ? "Ready to Hoop?" : "Fall Clinics Are a Wrap"}</h3>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", margin: "0 auto 28px", maxWidth: 520, lineHeight: 1.7 }}>
              {open
                ? "Sign up in a couple of minutes. Pick your Sundays, add your player, and check out securely. A receipt is emailed right away."
                : "Thanks to every family who came out this fall! Spring clinics are coming in the spring. Dates and sign ups will be posted right here."}
            </p>
            {open && <a href="/register.html" style={cta}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(132,0,54,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              Register &amp; Pay <span aria-hidden>→</span>
            </a>}
            <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginTop: 18 }}>
              Questions? <a href="mailto:aceshoops@gmail.com" style={{ color: "var(--gold)" }}>aceshoops@gmail.com</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
