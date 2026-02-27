// pages/SocialPage.jsx
import { FadeIn, SpadeIcon } from "../shared";

export default function SocialPage() {
  return (
    <section id="social" style={{ background: "#0a0005", padding: "120px 5% 100px", textAlign: "center" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}><SpadeIcon size={14} color="#840036" /> Connect</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>Follow<br /><span style={{ color: "var(--gold)" }}>Aces Nation</span></h2>
          <div className="divider divider-center" />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div style={{ marginTop: 48, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "48px 40px" }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, marginTop: 16, letterSpacing: 2 }}>@ACESBASKETBALL</h3>
            <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.8 }}>
              Follow us on Instagram for game highlights, behind-the-scenes content, recruiting updates, and Aces Nation community.
            </p>
            <a href="https://www.instagram.com/acesbasketball/" target="_blank" rel="noopener" style={{ display: "inline-block", marginTop: 20, padding: "14px 32px", background: "var(--maroon)", border: "1px solid rgba(201,164,74,0.3)", color: "var(--gold)", textDecoration: "none", borderRadius: 6, fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>
              Follow on Instagram →
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 24 }}>
            {[
              { label: "Instagram", href: "https://www.instagram.com/acesbasketball/", primary: true },
              { label: "X / Twitter", href: "https://twitter.com/aceshoops" },
              { label: "AcesHoops.com", href: "http://www.aceshoops.com" },
              { label: "MaxPreps", href: "https://www.maxpreps.com/pa/ardmore/lower-merion-aces/basketball/" },
            ].map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener" style={{
                padding: "12px 24px",
                background: link.primary ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.04)",
                border: link.primary ? "1px solid rgba(132,0,54,0.6)" : "1px solid rgba(255,255,255,0.1)",
                color: link.primary ? "var(--gold)" : "rgba(255,255,255,0.7)",
                textDecoration: "none", borderRadius: 6,
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}>{link.label}</a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
