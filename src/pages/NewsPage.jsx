// pages/NewsPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Icon, news } from "../shared";

const ordered = [...news].sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0));

export default function NewsPage() {
  const [selected, setSelected] = useState(null);

  const featured = ordered.find(p => p.featured) || ordered[0];
  const rest = ordered.filter(p => p.id !== featured?.id);

  return (
    <section id="news" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>NEWS</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/crowd.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />

      {/* Article reader modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "40px 20px", overflowY: "auto", cursor: "zoom-out",
        }}>
          <style>{`@keyframes newsIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
          <div onClick={e => e.stopPropagation()} style={{
            background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))",
            border: "1px solid rgba(201,164,74,0.28)", borderRadius: 16,
            maxWidth: 720, width: "100%", overflow: "hidden",
            boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default",
            animation: "newsIn 0.3s ease", position: "relative",
          }}>
            <button onClick={() => setSelected(null)} style={{
              position: "absolute", top: 14, right: 14, zIndex: 2,
              background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer",
            }}>✕</button>

            {selected.image && (
              <div style={{ height: 260, backgroundImage: `linear-gradient(180deg,transparent 40%,rgba(10,0,5,0.9)), url(${selected.image})`, backgroundSize: "cover", backgroundPosition: "center 25%" }} />
            )}
            <div style={{ padding: "32px 36px 40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(132,0,54,0.35)", border: "1px solid rgba(201,164,74,0.35)", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>{selected.category}</span>
                <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>{selected.date}</span>
              </div>
              <h2 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: "clamp(24px,3.4vw,34px)", lineHeight: 1.15, textTransform: "uppercase", margin: "0 0 20px" }}>{selected.title}</h2>
              {selected.body.map((para, i) => (
                <p key={i} style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15.5, color: "rgba(255,255,255,0.68)", lineHeight: 1.85, margin: "0 0 16px" }}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Aces Nation</div>
          <h2 className="section-title">News &amp;<br /><span style={{ color: "var(--gold)" }}>Recaps</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Featured */}
        {featured && (
          <FadeIn delay={0.12}>
            <div onClick={() => setSelected(featured)} style={{
              marginTop: 44, borderRadius: 16, overflow: "hidden", cursor: "pointer",
              border: "1px solid rgba(201,164,74,0.25)",
              display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              background: "rgba(255,255,255,0.02)", transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ minHeight: 240, backgroundImage: `linear-gradient(120deg, rgba(10,0,5,0.35), rgba(10,0,5,0.05)), url(${featured.image || "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg"})`, backgroundSize: "cover", backgroundPosition: "center 25%" }} />
              <div style={{ padding: "34px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(132,0,54,0.35)", border: "1px solid rgba(201,164,74,0.35)", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Featured · {featured.category}</span>
                  <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{featured.date}</span>
                </div>
                <h3 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: "clamp(22px,2.8vw,30px)", lineHeight: 1.15, textTransform: "uppercase", margin: "0 0 12px" }}>{featured.title}</h3>
                <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 18px" }}>{featured.excerpt}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                  Read Story <Icon name="news" size={15} color="var(--gold)" />
                </span>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Grid of the rest */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginTop: 20 }}>
          {rest.map((post, i) => (
            <FadeIn key={post.id} delay={i * 0.06}>
              <div onClick={() => setSelected(post)} style={{
                height: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(132,0,54,0.5)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
                {post.image && (
                  <div style={{ height: 150, backgroundImage: `linear-gradient(180deg,transparent,rgba(10,0,5,0.5)), url(${post.image})`, backgroundSize: "cover", backgroundPosition: "center 25%" }} />
                )}
                <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(132,0,54,0.25)", border: "1px solid rgba(132,0,54,0.4)", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>{post.category}</span>
                    <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{post.date}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 19, lineHeight: 1.2, margin: "0 0 10px" }}>{post.title}</h3>
                  <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{post.excerpt}</p>
                  <span style={{ marginTop: "auto", paddingTop: 16, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1.5, color: "rgba(201,164,74,0.75)", textTransform: "uppercase" }}>Read Story →</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
