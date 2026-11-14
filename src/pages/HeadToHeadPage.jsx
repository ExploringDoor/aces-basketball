import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FadeIn, Spade, teamLogos } from "../shared";
import { headToHead, h2hSeasons } from "../shared/headToHead";
import { tomGalleries } from "../shared/tomGalleries";
import GalleryModal from "../shared/GalleryModal";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dateOf = (g) => `${MON[g.m - 1]} ${g.d}, ${g.y}`;
const short = (g) => `${MON[g.m - 1].slice(0, 3)} ${g.d}, ${g.y}`;

// One of Tom's albums from this game, if he shot it (his album dates can be a day or two off the schedule).
const dayNum = (y, m, d) => Date.UTC(y, m - 1, d) / 86400000;
const albumDay = (t) => { const m = /^(\w+) (\d+), (\d{4})$/.exec(t.date || ""); return m ? dayNum(+m[3], MON.indexOf(m[1]) + 1, +m[2]) : null; };
const albumFor = (team, g) => tomGalleries.find(t => t.title.includes(team) && albumDay(t) != null && Math.abs(albumDay(t) - dayNum(g.y, g.m, g.d)) <= 3);

const seriesLine = (t) => t.wins === t.losses ? `Series tied ${t.wins}-${t.losses}`
  : t.wins > t.losses ? `Aces lead ${t.wins}-${t.losses}` : `${t.name} leads ${t.losses}-${t.wins}`;

function Logo({ name, size }) {
  const src = teamLogos[name];
  return src
    ? <img src={src} alt={`${name} logo`} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, background: "#fff", borderRadius: "50%", padding: size * 0.08, boxSizing: "border-box" }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />;
}

function TeamDetail({ t, onClose }) {
  const [album, setAlbum] = useState(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !album) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, album]);
  const tiles = [
    ["Games", t.games.length],
    ["Aces record", `${t.wins}-${t.losses}`],
    ["Playoff games", t.playoffWins + t.playoffLosses ? `${t.playoffWins}-${t.playoffLosses}` : "None"],
    ["Longest Aces win streak", t.bestStreak],
    ["Biggest Aces win", t.bigWin ? `${t.bigWin.lm}-${t.bigWin.them}, ${t.bigWin.y}` : ""],
  ].filter(([, v]) => v !== "");
  return createPortal(
    <>
      <GalleryModal album={album} onClose={() => setAlbum(null)} />
      <div onClick={onClose} role="dialog" aria-modal="true" aria-label={`Aces vs. ${t.name}`} style={{
        position: "fixed", inset: 0, zIndex: 99990, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "clamp(12px,4vw,40px) clamp(10px,3vw,20px)", overflowY: "auto", cursor: "zoom-out",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border: "1px solid rgba(201,164,74,0.28)", borderRadius: 16,
          maxWidth: 760, width: "100%", color: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default", position: "relative",
          padding: "clamp(22px,4vw,32px) clamp(18px,4vw,34px) clamp(26px,4vw,36px)",
        }}>
          <button onClick={onClose} aria-label="Close" autoFocus style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer" }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,3vw,22px)", paddingRight: 40, flexWrap: "wrap" }}>
            <Logo name="Lower Merion" size={84} />
            <span style={{ fontFamily: OSW, fontSize: 18, color: "rgba(255,255,255,0.5)" }}>vs.</span>
            <Logo name={t.name} size={84} />
            <div>
              <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: "clamp(24px,4.5vw,34px)", lineHeight: 1.05 }}>{t.name} {t.team.mascot}</div>
              <div style={{ fontFamily: OSW, fontSize: 17, color: "var(--gold)", marginTop: 4 }}>{seriesLine(t)}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginTop: 22 }}>
            {tiles.map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontFamily: OSW, fontSize: 9.5, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontFamily: OSW, fontSize: 18, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontFamily: OSW, fontSize: 12, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", margin: "26px 0 8px" }}>Every game</h3>
          {t.games.map((g, i) => {
            const a = albumFor(t.name, g);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: SANS, fontSize: 14, flexWrap: "wrap" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", width: 96, flexShrink: 0, fontSize: 13 }}>{short(g)}</span>
                <span style={{ flex: "1 1 140px", minWidth: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                  {g.note || "Regular season"}
                  {a && <button onClick={() => setAlbum(a)} style={{ marginLeft: 10, padding: 0, background: "none", border: "none", cursor: "pointer", fontFamily: OSW, fontSize: 10.5, letterSpacing: 1.2, color: "var(--gold)", textTransform: "uppercase" }}>Photos ›</button>}
                </span>
                <span style={{ fontFamily: OSW, fontSize: 15, whiteSpace: "nowrap", color: g.w ? "#fff" : "rgba(255,255,255,0.5)" }}>
                  <span style={{ color: g.w ? "var(--gold)" : "rgba(255,255,255,0.4)", marginRight: 8 }}>{g.w ? "W" : "L"}</span>{g.lm}-{g.them}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}

export default function HeadToHeadPage() {
  const [open, setOpen] = useState(null);
  const first = h2hSeasons[0], last = h2hSeasons[h2hSeasons.length - 1];
  return (
    <section id="headtohead" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>RIVALS</div>
      {open && <TeamDetail t={open} onClose={() => setOpen(null)} />}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Central League</div>
          <h2 className="section-title">Head<br /><span style={{ color: "var(--gold)" }}>to Head</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 680, margin: "18px 0 0" }}>
            The Aces against every team in the Central League. Tap a team for every game, the biggest win and the longest streak. These records cover {first} through 2019-20 plus {last}, the seasons we have full results for, and will grow as the rest are filled in.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12, marginTop: 36 }}>
          {headToHead.map((t, i) => (
            <FadeIn key={t.name} delay={Math.min(i, 8) * 0.03} className="h100">
              <button onClick={() => setOpen(t)} style={{
                width: "100%", height: "100%", textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 16, padding: "18px 18px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, transition: "transform 0.15s ease, border-color 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}>
                <Logo name={t.name} size={76} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: OSW, fontSize: 19, fontWeight: 600, color: "#fff", lineHeight: 1.15 }}>{t.name}</div>
                  <div style={{ fontFamily: OSW, fontSize: 30, fontWeight: 700, color: "var(--gold)", lineHeight: 1.1, marginTop: 4 }}>{t.wins}-{t.losses}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{t.games.length} games · Tap for details</div>
                </div>
              </button>
            </FadeIn>
          ))}
          <FadeIn className="h100">
            <a href="/rivalry" style={{
              height: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, padding: "18px", textDecoration: "none", color: "inherit",
              background: "linear-gradient(120deg, rgba(132,0,54,0.35), rgba(0,0,0,0.35))", border: "1px solid rgba(201,164,74,0.45)", borderRadius: 14,
            }}>
              <Logo name="Chester" size={76} />
              <div>
                <div style={{ fontFamily: OSW, fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Outside the league</div>
                <div style={{ fontFamily: OSW, fontSize: 19, fontWeight: 600, color: "#fff", marginTop: 3 }}>Aces vs. Chester</div>
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>The playoff rivalry has its own page ›</div>
              </div>
            </a>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
