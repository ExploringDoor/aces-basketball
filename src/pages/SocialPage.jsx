// pages/SocialPage.jsx
// The grid embeds the 6 latest @acesbasketball posts live from Instagram.
// To refresh which posts show, edit `instagramPosts` in shared/index.jsx.
import { FadeIn, Spade, Icon, instagram, instagramPosts } from "../shared";

export default function SocialPage() {
  return (
    <section id="social" style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>FOLLOW</div>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Connect</div>
          <h2 className="section-title">Follow<br /><span style={{ color: "var(--gold)" }}>Aces Nation</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Instagram feed */}
        <FadeIn delay={0.12}>
          <div style={{ marginTop: 44, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
            {/* Profile header */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "24px 26px", flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #8a0038, #360017)", border: "2px solid rgba(201,164,74,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spade size={30} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--gold)" }}><Icon name="instagram" size={18} /></span>
                  <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>@{instagram.handle}</span>
                </div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{instagram.name}</div>
                <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
                  <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}><b style={{ color: "#fff" }}>{instagram.posts}</b> posts</span>
                  <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}><b style={{ color: "#fff" }}>{instagram.followers}</b> followers</span>
                </div>
              </div>
              <a href={instagram.url} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                padding: "11px 24px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap",
                color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", border: "1px solid rgba(201,164,74,0.5)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,164,74,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                Follow
              </a>
            </div>
            {/* Live post grid: the 6 latest posts embedded straight from Instagram */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, padding: 14 }}>
              {instagramPosts.map((code, i) => (
                <div key={i} style={{ borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                  <iframe
                    src={`https://www.instagram.com/${code}/embed`}
                    title={`Instagram post ${i + 1}`}
                    loading="lazy"
                    scrolling="no"
                    allowTransparency="true"
                    style={{ width: "100%", height: 540, border: "none", display: "block" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Other links */}
        <FadeIn delay={0.2}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 28 }}>
            {[
              { label: "Instagram", href: instagram.url, primary: true },
              { label: "MaxPreps", href: "https://www.maxpreps.com/pa/ardmore/lower-merion-aces/basketball/" },
            ].map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                padding: "12px 24px",
                background: link.primary ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.04)",
                border: link.primary ? "1px solid rgba(132,0,54,0.6)" : "1px solid rgba(255,255,255,0.1)",
                color: link.primary ? "var(--gold)" : "rgba(255,255,255,0.7)",
                textDecoration: "none", borderRadius: 6,
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.55)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = link.primary ? "rgba(132,0,54,0.6)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.color = link.primary ? "var(--gold)" : "rgba(255,255,255,0.7)"; }}>
                {link.label}
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
