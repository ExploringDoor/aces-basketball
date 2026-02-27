// pages/KobePage.jsx
import { FadeIn, SpadeIcon } from "../shared";

const timeline = [
  { year: "Freshman · 1992-93", title: "The Arrival", text: "Kobe moved to Ardmore from Italy where his father Joe \"Jellybean\" Bryant had been playing professionally. He became the first freshman in decades to start for Lower Merion's varsity team. The Aces finished 4-20, but Coach Gregg Downer knew immediately he had something special." },
  { year: "Sophomore · 1993-94", title: "Building the Foundation", text: "With Kobe developing rapidly and playing all five positions, Lower Merion began its dramatic turnaround. The Aces posted a winning record as Bryant continued to hone his craft under Coach Downer's guidance." },
  { year: "Junior · 1994-95", title: "State Recognition", text: "Bryant exploded onto the state scene averaging 31.1 points, 10.4 rebounds, 5.2 assists, 3.8 blocks, and 2.3 steals per game. He was named Pennsylvania Player of the Year and earned Parade All-American honors." },
  { year: "Senior · 1995-96", title: "Championship Season", text: "In his final season, Kobe averaged 30.8 points, 12.0 rebounds, 6.5 assists, 4.0 steals, and 3.8 blocks. He led the Aces to a 31-3 record and Lower Merion's first PIAA State Championship since 1943, scoring 17 points in the title game. He finished with 2,883 career points — the most in Southeastern Pennsylvania history." },
];

export default function KobePage() {
  return (
    <section id="kobe" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a12 15%, #0d0005 50%, #1a0a12 85%, #0a0a0a 100%)", padding: "120px 5% 100px", position: "relative", overflow: "hidden" }}>
      {/* 33 watermark */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "min(50vw, 500px)", fontFamily: "'Oswald', sans-serif", fontWeight: 900, color: "rgba(132,0,54,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>33</div>

      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}><SpadeIcon size={14} color="#840036" /> 1978 – 2020</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>Kobe Bean<br /><span style={{ color: "var(--gold)" }}>Bryant</span></h2>
          <div style={{ textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 4, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 12 }}>
            Lower Merion '96 · #33 · The Black Mamba
          </div>
          <div className="divider divider-center" style={{ marginTop: 24 }} />
        </FadeIn>

        {/* Quote */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 48, textAlign: "center", padding: "0 20px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 700, margin: "0 auto" }}>
              "I didn't go to college, so this is my university. This is where all my memories lie."
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 3, color: "var(--gold)", marginTop: 16, textTransform: "uppercase" }}>
              — Kobe Bryant, Gymnasium Dedication · December 16, 2010
            </div>
          </div>
        </FadeIn>

        {/* Photos */}
        <FadeIn delay={0.25}>
          <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { id: "1FHihWDtAnEkF2DJYPpv_Y_cddj3wE5Bo", caption: "Kobe Bryant #33 — Lower Merion Aces" },
              { id: "1GUyWZIR0djugEyCFxhR0_sOgiVB3Cima", caption: "Kobe rises for a dunk at Lower Merion" },
              { id: "1o3si_FEEkoEXYsh0fnxjr4gFdG6P-bmf", caption: "The Mamba's high school days" },
            ].map((photo, idx) => (
              <div key={idx} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                <img src={`https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`} alt={photo.caption} loading="lazy" style={{ width: "100%", height: 260, objectFit: "cover", display: "block", filter: "saturate(0.85) contrast(1.05)" }} />
                <div style={{ padding: "12px 16px", fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{photo.caption}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Timeline */}
        <FadeIn delay={0.3}>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", textAlign: "center", marginTop: 64, marginBottom: 32 }}>The Lower Merion Years · 1992–1996</h3>
          {timeline.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 4 }}>{item.year}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{item.title}</div>
              </div>
              <div style={{ flex: 1, minWidth: 280, fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, borderLeft: "2px solid rgba(132,0,54,0.4)", paddingLeft: 20 }}>
                {item.text}
              </div>
            </div>
          ))}
        </FadeIn>

        {/* Senior Awards */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 48, background: "rgba(132,0,54,0.12)", border: "1px solid rgba(132,0,54,0.25)", borderRadius: 16, padding: "32px 36px" }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>Senior Year Honors · 1996</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {["Naismith HS Player of the Year","Gatorade National Player of the Year","McDonald's All-American","Parade First Team All-American","USA Today All-USA First Team","PA Player of the Year (2×)"].map((award, idx) => (
                <div key={idx} style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", padding: "12px 8px", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                  <span style={{ color: "var(--gold)", marginRight: 6 }}>♠</span>{award}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 2, borderRadius: 16, overflow: "hidden" }}>
            {[{ stat: "2,883", label: "Career Points" },{ stat: "30.8", label: "PPG (Senior)" },{ stat: "12.0", label: "RPG (Senior)" },{ stat: "6.5", label: "APG (Senior)" },{ stat: "31-3", label: "Senior Record" },{ stat: "#33", label: "Retired Jersey" }].map((s, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "28px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{s.stat}</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* NBA Legacy + LM Connection */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {[
              { title: "NBA Legacy", items: ["5× NBA Champion (2000–02, 2009–10)","2× NBA Finals MVP (2009, 2010)","NBA MVP (2008)","18× NBA All-Star","2× NBA Scoring Champion","NBA All-Star Game MVP (4×)","33,643 Career Points","Hall of Fame Class of 2020","NBA 75th Anniversary Team","Academy Award Winner (2018)"] },
              { title: "Lower Merion Connection", items: ["Kobe Bryant Gymnasium dedicated Dec. 16, 2010","Donated $411,000 to Lower Merion School District","#33 jersey retired and hangs over the gym door","Wore LM shorts under Lakers shorts every game","Jersey #33 retired by Lower Merion in 2002","33 seconds of silence opens every Aces season","Memorabilia display in the athletic atrium","Largest individual donation in LMSD history","Credited English teacher Jeanne Mastriano for sparking his love of writing","\"Aces Nation has lost its heartbeat\" — Coach Downer, Jan. 26, 2020"] },
            ].map((block, bi) => (
              <div key={bi} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "32px 28px" }}>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>{block.title}</h3>
                <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.9 }}>
                  {block.items.map((item, ii) => (
                    <div key={ii} style={{ marginBottom: 4 }}><span style={{ color: "var(--gold)", marginRight: 8, fontSize: 10 }}>▸</span>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Memorial */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: 64, textAlign: "center", padding: "48px 24px", background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))", borderRadius: 16, border: "1px solid rgba(201,164,74,0.15)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>January 26, 2020</div>
            <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
              Kobe Bryant, his daughter Gianna, and seven others tragically lost their lives in a helicopter crash in Calabasas, California. The Lower Merion community gathered at the Bryant Gymnasium, placing flowers, jerseys, and basketballs at the doors of the gym that bears his name.
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: "italic", color: "var(--gold)", marginTop: 32, lineHeight: 1.6 }}>Mamba Mentality Forever</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 16 }}>Rest in Peace · Kobe &amp; Gianna Bryant</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
