// pages/StoryPage.jsx
// "Story of the Season" — each chapter is a page-turning photo story that opens
// right on the site. Add chapters as the season produces them.
import { useState, useEffect, useRef } from "react";
import { FadeIn, Spade, Icon } from "../shared";

// ── Season chapters ─────────────────────────────────────────────────────────
// To add a chapter: drop its cover image in public/story/ and add an entry here.
//   { ch: "1", title: "Opening Night", cover: "/story/26-27_ch01.jpg", url: "https://<flipbook-url>" }
// `url` is a hosted flip-book / photo story (Canva, Flipsnack, issuu, etc.); it
// opens in a viewer on this page. Newest season first.
const seasons = [
  {
    id: "2026-27",
    label: "2026-27",
    chapters: [],
  },
];

const TIP_OFF_LABEL = "December 4 vs Chester";

export default function StoryPage() {
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [active, setActive] = useState(null); // the open chapter {season, chapter}
  const closeBtnRef = useRef(null);
  const season = seasons[seasonIdx];
  const chapters = season.chapters || [];

  // Lock scroll + Esc-to-close while the flip viewer is open.
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtnRef.current && closeBtnRef.current.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      if (opener && opener.focus) opener.focus();
    };
  }, [active]);

  return (
    <section id="story" style={{ background: "#0a0005", padding: "120px 5% 110px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>THE STORY</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/rise.jpg')", backgroundSize: "cover", backgroundPosition: "center 26%", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Every Game · Every Moment</div>
          <h2 className="section-title">Story of the<br /><span style={{ color: "var(--gold)" }}>Season</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 16, color: "rgba(255,255,255,0.62)", lineHeight: 1.9, maxWidth: 700, marginTop: 24 }}>
            Every Aces season, told chapter by chapter in a page-turning photo story. Each chapter opens right here on the site. Pick one, use the arrows and full-screen button inside to flip through it all, from opening night to the final buzzer.
          </p>
        </FadeIn>

        {/* Season tabs (shown once there is more than one season) */}
        {seasons.length > 1 && (
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "36px 0 30px" }}>
              {seasons.map((s, i) => {
                const on = i === seasonIdx;
                return (
                  <button key={s.id} onClick={() => setSeasonIdx(i)} style={{
                    fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                    padding: "11px 26px", borderRadius: 8, cursor: "pointer",
                    color: on ? "#fff" : "rgba(255,255,255,0.55)",
                    background: on ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.03)",
                    border: on ? "1px solid rgba(201,164,74,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.2s",
                  }}>{s.label}</button>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* Chapter grid, or a pre-season "coming soon" panel */}
        {chapters.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginTop: 38 }}>
            {chapters.map((c, i) => (
              <FadeIn key={`${season.id}-${i}`} delay={Math.min(i * 0.05, 0.4)}>
                <button onClick={() => setActive({ season, chapter: c })} style={{
                  width: "100%", padding: 0, cursor: "pointer", borderRadius: 14, overflow: "hidden",
                  background: "#15000a", border: "1px solid rgba(201,164,74,0.22)", display: "block", transition: "all 0.22s", position: "relative",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.6)"; e.currentTarget.querySelector('.play').style.opacity = 1; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.22)"; e.currentTarget.querySelector('.play').style.opacity = 0; }}>
                  <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#0a0005" }}>
                    <img src={c.cover} alt={`${season.label} — Chapter ${c.ch}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div className="play" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0, transition: "opacity 0.25s", background: "rgba(10,0,5,0.55)", pointerEvents: "none" }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(132,0,54,0.95)", border: "1px solid rgba(201,164,74,0.7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(132,0,54,0.7)" }}>
                        <span style={{ color: "#fff", fontSize: 21, marginLeft: 4 }}>▶</span>
                      </div>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>Flip the Story</div>
                    </div>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "22px 14px 12px", background: "linear-gradient(0deg, rgba(10,0,5,0.9), transparent)" }}>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Chapter {c.ch}</div>
                      {c.title && <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 600, color: "#fff", textTransform: "uppercase", lineHeight: 1.15, marginTop: 2 }}>{c.title}</div>}
                    </div>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn delay={0.1}>
            <div style={{ marginTop: 40, borderRadius: 18, border: "1px solid rgba(201,164,74,0.25)", background: "linear-gradient(135deg, rgba(132,0,54,0.14), rgba(10,0,5,0.5))", padding: "clamp(34px, 6vw, 60px)", textAlign: "center" }}>
              <div style={{ width: 62, height: 62, borderRadius: "50%", margin: "0 auto 18px", background: "rgba(201,164,74,0.12)", border: "1px solid rgba(201,164,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
                <Icon name="book" size={26} />
              </div>
              <h3 style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(26px,4.5vw,40px)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>The {season.label} Story Begins Soon</h3>
              <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 8px" }}>
                Tip-off is {TIP_OFF_LABEL}. As the season unfolds, each stretch of games becomes its own photo-story chapter, dropped right here. Check back after opening night for Chapter 1.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 14, fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                <Icon name="calendar" size={15} color="var(--gold)" /> First tip-off {TIP_OFF_LABEL}
              </div>
            </div>
          </FadeIn>
        )}

        <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginTop: 34, textAlign: "center" }}>
          Photos via @acesbasketball. Click any chapter to read it here, or open it full screen inside the viewer.
        </p>
      </div>

      {/* Flip viewer modal */}
      {active && (
        <div role="dialog" aria-modal="true" aria-label={`${active.season.label} Chapter ${active.chapter.ch}`} onClick={() => setActive(null)} style={{
          position: "fixed", inset: 0, zIndex: 5000, background: "rgba(5,0,3,0.94)",
          backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", padding: "clamp(10px,2vw,26px)",
        }}>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1300, width: "100%", margin: "0 auto 12px", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
              <span style={{ color: "var(--gold)", fontSize: 12 }}>{active.season.label}</span>
              <span style={{ color: "#fff", fontSize: 17, marginLeft: 10 }}>Chapter {active.chapter.ch}{active.chapter.title ? " · " + active.chapter.title : ""}</span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <a href={active.chapter.url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", padding: "9px 18px", borderRadius: 6, textDecoration: "none", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>Open in New Tab ↗</a>
              <button ref={closeBtnRef} onClick={() => setActive(null)} style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", padding: "9px 20px", borderRadius: 6, cursor: "pointer", color: "var(--gold)", border: "1px solid rgba(201,164,74,0.55)", background: "rgba(132,0,54,0.2)" }}>✕ Close</button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, maxWidth: 1300, width: "100%", margin: "0 auto", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(201,164,74,0.4)", background: "#000", boxShadow: "0 30px 90px rgba(0,0,0,0.7)" }}>
            <iframe key={active.chapter.url} src={active.chapter.url} title={`${active.season.label} Chapter ${active.chapter.ch}`} allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
          </div>
        </div>
      )}
    </section>
  );
}
