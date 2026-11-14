import { useState, useCallback } from "react";
import { FadeIn, Spade, championships, titlePhoto, titleName, seasonLabel } from "../shared";
import { titleStories } from "../shared/titleStories";
import StoryModal from "../shared/StoryModal";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";

const storyFor = (kind, year) => titleStories.find(s => s.kind === kind && s.year === Number(year)) || null;

// What opens when a banner is tapped: our story if we have one, else just the team photo.
const openable = (kind, year) => {
  const story = storyFor(kind, year);
  if (story) return story;
  const photo = titlePhoto(kind, year);
  if (!photo) return null;
  return { title: `${seasonLabel(year)} ${titleName[kind]}`, category: titleName[kind], date: `${seasonLabel(year)} season`, image: photo, body: [] };
};

const ROWS = [
  { kind: "state",    label: "PIAA State Champions",     short: "State Champions",   years: championships.state.map(c => c.year), w: 132 },
  { kind: "district", label: "District 1 Champions",     short: "District 1 Champions", years: championships.district, w: 104 },
  { kind: "league",   label: "Central League Champions", short: "Central League Champions", years: championships.league, w: 92 },
  { kind: "suburban", label: "Suburban League Champions", short: "Suburban League Champions", years: championships.suburban, w: 92 },
];

function Banner({ kind, year, short, w, onOpen }) {
  const target = openable(kind, year);
  const big = kind === "state";
  const Tag = target ? "button" : "div";
  return (
    <Tag {...(target ? { onClick: () => onOpen(target), "aria-label": `${year} ${short}: open the story` } : {})} style={{
      width: w, flex: "0 0 auto", padding: 0, border: "none", background: "none", font: "inherit", color: "inherit",
      cursor: target ? "pointer" : "default", transition: "transform 0.2s ease", filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.55))",
    }}
      onMouseEnter={e => { if (target) e.currentTarget.style.transform = "translateY(4px) rotate(-1deg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
      {/* the banner cloth: straight top, pointed bottom */}
      <div style={{
        clipPath: "polygon(0 0, 100% 0, 100% 84%, 50% 100%, 0 84%)",
        background: big ? "linear-gradient(180deg,#f2ecdf,#e4dcc8)" : "linear-gradient(180deg,#8a0038,#5c0026)",
        padding: 4,
      }}>
        <div style={{
          clipPath: "polygon(0 0, 100% 0, 100% 84%, 50% 100%, 0 84%)",
          border: big ? "2px solid #840036" : "2px solid rgba(201,164,74,0.75)",
          borderBottom: "none",
          padding: big ? "16px 8px 44px" : "12px 6px 34px", textAlign: "center",
          color: big ? "#840036" : "#fff",
        }}>
          <div style={{ fontFamily: OSW, fontSize: big ? 10 : 8.5, letterSpacing: 1.5, textTransform: "uppercase", lineHeight: 1.25, opacity: 0.92 }}>Lower Merion<br />Aces</div>
          <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: big ? 38 : 28, lineHeight: 1, margin: big ? "12px 0 10px" : "9px 0 8px", color: big ? "#840036" : "var(--gold)" }}>{year}</div>
          <div style={{ fontFamily: OSW, fontSize: big ? 10.5 : 8.5, letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.3 }}>{short}</div>
        </div>
      </div>
      <div style={{ fontFamily: OSW, fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", textAlign: "center", marginTop: 4, height: 14, color: "rgba(201,164,74,0.85)" }}>
        {target ? (target.body && target.body.length ? "Story ›" : "Photo ›") : ""}
      </div>
    </Tag>
  );
}

export default function BannersPage() {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const total = ROWS.reduce((n, r) => n + r.years.length, 0);
  return (
    <section id="banners" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>RAFTERS</div>
      <StoryModal story={open} onClose={close} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Kobe Bryant Gymnasium</div>
          <h2 className="section-title">The<br /><span style={{ color: "var(--gold)" }}>Rafters</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 640, margin: "18px 0 0" }}>
            {total} banners. Every state, district and league championship in program history, newest first. Tap a banner to see that team and read how they won it.
          </p>
        </FadeIn>

        {ROWS.map((row, ri) => {
          const years = [...row.years].sort((a, b) => b - a);
          return (
            <FadeIn key={row.kind} delay={0.05 + ri * 0.05}>
              <div style={{ marginTop: 56 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 0 }}>
                  <h3 style={{ fontFamily: OSW, fontSize: 14, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", margin: 0 }}>{row.label}</h3>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{years.length} banners</span>
                </div>
                {/* the rafter beam the banners hang from */}
                <div style={{ height: 10, marginTop: 14, borderRadius: 3, background: "linear-gradient(180deg,#3a3a3a,#161616)", boxShadow: "0 2px 0 rgba(255,255,255,0.06) inset, 0 6px 14px rgba(0,0,0,0.6)" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: row.kind === "state" ? "22px 18px" : "20px 12px", padding: "0 6px" }}>
                  {years.map(y => <Banner key={y} kind={row.kind} year={y} short={row.short} w={row.w} onOpen={setOpen} />)}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
