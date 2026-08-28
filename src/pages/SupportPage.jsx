// pages/SupportPage.jsx
import { FadeIn, Spade, Icon } from "../shared";

export default function SupportPage() {
  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none" }}>GIVE</div>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Give Back</div>
          <h2 className="section-title">Support<br /><span style={{ color: "var(--gold)" }}>The Aces</span></h2>
          <div className="divider" />
        </FadeIn>

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
            {/* Background glow */}
            <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(132,0,54,0.15),transparent 70%)", pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:4, color:"var(--gold)", textTransform:"uppercase", marginBottom:24, opacity:0.8 }}>
                ♠ Aces Nation
              </div>
              <p style={{
                fontFamily:"'Source Sans 3',sans-serif",
                fontSize: 17,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 2,
                margin: 0,
              }}>
                With your help, we are able to provide outstanding experiences for our student-athletes. Team travel, events, awards, publications and the year-end banquet would not be possible without generous financial contributions from our families and friends. Special thanks to members of the community who have volunteered their time to help support our students through tutoring and mentoring programs.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* What your support funds */}
        <FadeIn delay={0.25}>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:4, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:24 }}>What Your Support Funds</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
              {[
                { icon:"plane",  label:"Team Travel" },
                { icon:"trophy", label:"Awards & Recognition" },
                { icon:"news",   label:"Publications" },
                { icon:"star",   label:"Year-End Banquet" },
                { icon:"grad",   label:"Tutoring Programs" },
                { icon:"users",  label:"Mentoring Programs" },
              ].map((item, i) => (
                <div key={i} style={{
                  background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:10, padding:"20px",
                  display:"flex", alignItems:"center", gap:14,
                  transition:"all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(132,0,54,0.4)"; e.currentTarget.style.background="rgba(132,0,54,0.08)"; const ic=e.currentTarget.querySelector('.fund-ic'); if(ic) ic.style.color="var(--gold)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; const ic=e.currentTarget.querySelector('.fund-ic'); if(ic) ic.style.color="rgba(201,164,74,0.85)"; }}>
                  <span className="fund-ic" style={{ color:"rgba(201,164,74,0.85)", transition:"color 0.2s", flexShrink:0 }}><Icon name={item.icon} size={22} stroke={1.6} /></span>
                  <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:1.5, color:"rgba(255,255,255,0.7)", textTransform:"uppercase" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.35}>
          <div style={{
            marginTop:48, textAlign:"center",
            padding:"40px", borderRadius:12,
            background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(201,164,74,0.2)",
          }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, letterSpacing:3, color:"var(--gold)", marginBottom:12, textTransform:"uppercase" }}>Get Involved</div>
            <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.8, maxWidth:500, margin:"0 auto 28px" }}>
              Interested in supporting the program through a financial contribution or volunteering your time? Reach out and connect with the Aces.
            </p>
            <a href="mailto:aceshoops@gmail.com?subject=Supporting%20Lower%20Merion%20Aces%20Basketball" style={{
              display:"inline-block",
              padding:"12px 32px",
              background:"rgba(132,0,54,0.4)",
              border:"1px solid rgba(201,164,74,0.4)",
              borderRadius:6,
              fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:2,
              color:"var(--gold)", textDecoration:"none",
              textTransform:"uppercase",
              transition:"all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(132,0,54,0.6)"; e.currentTarget.style.borderColor="rgba(201,164,74,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(132,0,54,0.4)"; e.currentTarget.style.borderColor="rgba(201,164,74,0.4)"; }}>
              Email the Aces
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
