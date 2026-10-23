// pages/StoryPage.jsx
// "Story of the Season" — each chapter is a photo story that opens right on the site.
// A chapter is EITHER a native photo story ({photos:[{src,cap}]}, played in an on-page
// slideshow) OR a hosted flip-book ({url}, opened in a viewer iframe). Add chapters as
// the season produces them.
import { useState, useEffect, useRef } from "react";
import { FadeIn, Spade, Icon } from "../shared";

// ── Seasons, newest first ────────────────────────────────────────────────────
// Native chapter:   { ch, title, cover, photos: [{ src, cap }, ...] }
// Flip-book chapter: { ch, title, cover, url: "https://<flip-book>" }
// Covers + photos live in /public (e.g. /ig/*.jpg or /story/*.jpg).
const seasons = [
  {
    id: "2026-27",
    label: "2026-27",
    chapters: [],
  },
  {
    id: "2025-26",
    label: "2025-26",
    chapters: [
      {
        ch: "1",
        title: "The Season in Photos",
        cover: "/ig/celebrate.jpg",
        photos: [
          { src: "/ig/tunnel.jpg",    cap: "Pregame. Together at center court." },
          { src: "/ig/crowd.jpg",     cap: "A packed house on the Main Line." },
          { src: "/ig/rise.jpg",      cap: "Rise and fire." },
          { src: "/ig/defense.jpg",   cap: "Locked in on the defensive end." },
          { src: "/ig/battle.jpg",    cap: "Battling for every possession." },
          { src: "/ig/finish.jpg",    cap: "Finishing at the rim." },
          { src: "/ig/celebrate.jpg", cap: "Celebrating together." },
          { src: "/ig/seniors.jpg",   cap: "The seniors. Thank you for everything." },
        ],
      },
    ],
  },
];

const TIP_OFF_LABEL = "December 4 vs Chester";

export default function StoryPage() {
  const firstWithChapters = seasons.findIndex((s) => (s.chapters || []).length > 0);
  const [seasonIdx, setSeasonIdx] = useState(firstWithChapters >= 0 ? firstWithChapters : 0);
  const [active, setActive] = useState(null); // the open chapter {season, chapter}
  const [slide, setSlide] = useState(0);      // photo index within a native chapter
  const closeBtnRef = useRef(null);
  const season = seasons[seasonIdx];
  const chapters = season.chapters || [];

  const photos = active && active.chapter.photos;
  const nPhotos = photos ? photos.length : 0;
  const go = (d) => setSlide((s) => (nPhotos ? (s + d + nPhotos) % nPhotos : 0));

  // Lock scroll + keyboard controls while a chapter is open.
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
      else if (nPhotos && e.key === "ArrowRight") go(1);
      else if (nPhotos && e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeBtnRef.current && closeBtnRef.current.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      if (opener && opener.focus) opener.focus();
    };
  }, [active, nPhotos]);

  const open = (chapter) => { setSlide(0); setActive({ season, chapter }); };

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
            Every Aces season, told chapter by chapter in a page-turning photo story. Each chapter opens right here on the site. Pick one, use the arrows and full-screen view inside to flip through it all, from opening night to the final buzzer.
          </p>
        </FadeIn>

        {/* Season tabs */}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16, marginTop: 38 }}>
            {chapters.map((c, i) => (
              <FadeIn key={`${season.id}-${i}`} delay={Math.min(i * 0.05, 0.4)}>
                <button onClick={() => open(c)} style={{
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
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>{c.photos ? "View the Story" : "Flip the Story"}</div>
                    </div>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "24px 14px 13px", background: "linear-gradient(0deg, rgba(10,0,5,0.92), transparent)" }}>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Chapter {c.ch}{c.photos ? " · " + c.photos.length + " photos" : ""}</div>
                      {c.title && <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 17, fontWeight: 600, color: "#fff", textTransform: "uppercase", lineHeight: 1.15, marginTop: 2 }}>{c.title}</div>}
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
          Photos via @acesbasketball. Click any chapter to read it here.
        </p>
      </div>

      {/* ── Chapter viewer ─────────────────────────── */}
      {active && (
        <div role="dialog" aria-modal="true" aria-label={`${active.season.label} Chapter ${active.chapter.ch}`} onClick={() => setActive(null)} style={{
          position: "fixed", inset: 0, zIndex: 5000, background: "rgba(5,0,3,0.95)",
          backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", padding: "clamp(10px,2vw,26px)",
        }}>
          {/* header */}
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 1300, width: "100%", margin: "0 auto 12px", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
              <span style={{ color: "var(--gold)", fontSize: 12 }}>{active.season.label}</span>
              <span style={{ color: "#fff", fontSize: 17, marginLeft: 10 }}>Chapter {active.chapter.ch}{active.chapter.title ? " · " + active.chapter.title : ""}</span>
              {photos && <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginLeft: 12 }}>{slide + 1} / {nPhotos}</span>}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              {active.chapter.url && <a href={active.chapter.url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", padding: "9px 18px", borderRadius: 6, textDecoration: "none", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}>Open in New Tab ↗</a>}
              <button ref={closeBtnRef} onClick={() => setActive(null)} style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", padding: "9px 20px", borderRadius: 6, cursor: "pointer", color: "var(--gold)", border: "1px solid rgba(201,164,74,0.55)", background: "rgba(132,0,54,0.2)" }}>✕ Close</button>
            </div>
          </div>

          {/* body: native slideshow OR flip-book iframe */}
          {photos ? (
            <div onClick={e => e.stopPropagation()} style={{ flex: 1, maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                <img key={slide} src={photos[slide].src} alt={photos[slide].cap || ""} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10, boxShadow: "0 30px 90px rgba(0,0,0,0.7)", animation: "storyFade .35s ease" }} />
                {/* prev / next */}
                <button onClick={() => go(-1)} aria-label="Previous" style={navBtn("left")}>‹</button>
                <button onClick={() => go(1)} aria-label="Next" style={navBtn("right")}>›</button>
              </div>
              {photos[slide].cap && (
                <div style={{ textAlign: "center", marginTop: 14, fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.82)" }}>{photos[slide].cap}</div>
              )}
              {/* thumbnails */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setSlide(i)} style={{ width: 46, height: 46, borderRadius: 7, overflow: "hidden", padding: 0, cursor: "pointer", border: i === slide ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.2)", opacity: i === slide ? 1 : 0.55, background: "#000" }}>
                    <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div onClick={e => e.stopPropagation()} style={{ flex: 1, maxWidth: 1300, width: "100%", margin: "0 auto", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(201,164,74,0.4)", background: "#000", boxShadow: "0 30px 90px rgba(0,0,0,0.7)" }}>
              <iframe key={active.chapter.url} src={active.chapter.url} title={`${active.season.label} Chapter ${active.chapter.ch}`} allowFullScreen style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes storyFade{from{opacity:0;transform:scale(0.99)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}

function navBtn(side) {
  return {
    position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 6,
    width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
    background: "rgba(10,0,5,0.6)", border: "1px solid rgba(201,164,74,0.5)", color: "#fff",
    fontSize: 28, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
  };
}
