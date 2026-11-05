// pages/flyers/finalLayouts.jsx
// 25 Final Score layouts for the Flyer Studio. Each renders inside a fixed
// W×H board (the page owns the root div + ref); layouts fill it with
// absolutely positioned content. Props every layout receives:
//   f        edited fields { opp, dateLine, venue, us, them }
//   photo, focus, zoom      the chosen picture + framing
//   win, tie                outcome flags
//   recLine                 projected season record, e.g. "5-2"
//   longDate                "DEC 4, 2026"
//   oppLogo                 opponent logo src or null
import { teamLogos } from "../../shared";

export const S = 1080, PW = 1080, PH = 1350;
export const MAROON = "#840036", DEEP = "#4d0020", GOLD = "#c9a44a", CREAM = "#f4ecdc", INK = "#0b0b0d";
export const A = "'Anton',sans-serif", O = "'Oswald',sans-serif", P = "'Playfair Display',serif", M = "'Permanent Marker',cursive";
export const G = "'Sedgwick Ave Display',cursive", B = "'Bebas Neue',sans-serif", BG = "'Bangers',cursive", SS = "'Source Sans 3',sans-serif";
export const LM = "/LM_Logo.png", BULL = "/Bulldog.png";

export const Photo =({ src, focus, zoom, style }) => (
  <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focus.x}% ${focus.y}%`, transform: `scale(${zoom})`, transformOrigin: `${focus.x}% ${focus.y}%`, ...style }} />
);
export const Fill = ({ style, children }) => <div style={{ position: "absolute", inset: 0, ...style }}>{children}</div>;
export const Logo = ({ src, size, bg = "#fff", ring = "rgba(255,255,255,0.25)", fallback = "?", style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: src ? bg : "rgba(255,255,255,0.12)", border: `${Math.max(3, size * 0.015)}px solid ${ring}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, boxShadow: "0 14px 40px rgba(0,0,0,0.45)", ...style }}>
    {src ? <img src={src} alt="" style={{ width: "82%", height: "82%", objectFit: "contain" }} /> : <span style={{ fontFamily: O, fontSize: size * 0.42, fontWeight: 700, color: "#fff" }}>{fallback}</span>}
  </div>
);
export const Meta = ({ children, style }) => <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", opacity: 0.75, whiteSpace: "nowrap", ...style }}>{children}</div>;
export const scoreSize = (us, them, base) => ((us + them).length > 4 ? base * 0.84 : base);

// ── Square layouts ───────────────────────────────────────────
const PanelMaroon = ({ f, photo, focus, zoom, us, them }) => (
  <Fill style={{ display: "flex", background: MAROON }}>
    <div style={{ width: 54, height: "100%", flexShrink: 0, background: `repeating-linear-gradient(135deg, #fff 0 22px, ${MAROON} 22px 44px)` }} />
    <div style={{ width: 470, height: "100%", position: "relative", overflow: "hidden", flexShrink: 0, borderRight: "8px solid #fff" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, position: "relative", background: "linear-gradient(160deg, #9c0f3b 0%, #7a0028 60%, #5a001d 100%)", padding: "66px 40px 46px 52px", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ position: "absolute", top: -70, right: -70, width: 180, height: 180, background: "#fff", transform: "rotate(35deg)" }} />
      <div style={{ position: "relative", fontFamily: A, fontSize: 172, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: 2 }}>Final<br />Score</div>
      <div style={{ height: 16, width: 300, marginTop: 26, background: "#fff", transform: "skewX(-25deg)", opacity: 0.92 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 64, fontFamily: A, lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: scoreSize(us, them, 160) }}>{us}</span><span style={{ fontSize: 96, opacity: 0.85 }}>-</span><span style={{ fontSize: scoreSize(us, them, 160) }}>{them}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 24, fontFamily: O, fontSize: 38, fontWeight: 600, textTransform: "uppercase", lineHeight: 1.1 }}>
        <div>Lower<br />Merion</div><div style={{ textAlign: "right" }}>{f.opp}</div>
      </div>
      <Meta style={{ marginTop: "auto", fontSize: 20, letterSpacing: 4, overflow: "hidden", textOverflow: "ellipsis" }}>{f.dateLine} · {f.venue}</Meta>
    </div>
  </Fill>
);

const PanelBlack = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ display: "flex", background: INK }}>
    <div style={{ width: 520, height: "100%", position: "relative", overflow: "hidden", flexShrink: 0 }}><Photo src={photo} focus={focus} zoom={zoom} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0) 70%, #0b0b0d 100%)" }} /></div>
    <div style={{ flex: 1, padding: "70px 50px 50px 30px", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, color: GOLD, textTransform: "uppercase" }}>{win ? "Aces Win" : "Final"}</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 0.95, marginTop: 24, color: "#fff" }}>{us}</div>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 2, color: GOLD, marginTop: 4 }}>Lower Merion</div>
      <div style={{ width: 120, height: 4, background: GOLD, margin: "34px 0" }} />
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 0.95, color: "rgba(255,255,255,0.55)" }}>{them}</div>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{f.opp}</div>
      <Meta style={{ marginTop: "auto", fontSize: 19, color: "rgba(255,255,255,0.5)" }}>{longDate}</Meta>
    </div>
  </Fill>
);

const PanelCream = ({ f, photo, focus, zoom, us, them, longDate }) => (
  <Fill style={{ display: "flex", background: CREAM, color: MAROON }}>
    <div style={{ width: 560, padding: "70px 40px 56px 60px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <img src={LM} alt="" style={{ width: 120, height: 120 }} />
      <div style={{ fontFamily: P, fontStyle: "italic", fontWeight: 700, fontSize: 78, lineHeight: 1, marginTop: 40 }}>Final<br />Score</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 190), lineHeight: 1, marginTop: 40, whiteSpace: "nowrap" }}>{us}<span style={{ fontSize: 100, margin: "0 10px", opacity: 0.5 }}>–</span>{them}</div>
      <div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 3, marginTop: 14, lineHeight: 1.3 }}>Lower Merion<br /><span style={{ opacity: 0.55 }}>{f.opp}</span></div>
      <Meta style={{ marginTop: "auto", color: MAROON, opacity: 0.6, fontSize: 20 }}>{longDate} · {f.venue}</Meta>
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden", borderLeft: `12px solid ${MAROON}` }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
  </Fill>
);

const Scoreboard = ({ f, us, them, win, oppLogo, longDate }) => {
  const Row = ({ logo, name, score, hot }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 36, padding: "30px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
      <Logo src={logo} size={120} fallback={name[0]} />
      <div style={{ fontFamily: B, fontSize: 84, letterSpacing: 4, flex: 1, color: hot ? "#fff" : "rgba(255,255,255,0.6)" }}>{name}</div>
      <div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, color: hot ? "#ffb13b" : "rgba(255,177,59,0.5)", textShadow: hot ? "0 0 30px rgba(255,177,59,0.6)" : "none", minWidth: 240, textAlign: "right" }}>{score}</div>
    </div>
  );
  return (
    <Fill style={{ background: "radial-gradient(ellipse at 50% 0%, #1b1b22 0%, #050507 70%)", padding: "70px 70px 60px", display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: B, fontSize: 110, color: "#ff3b3b", textShadow: "0 0 26px rgba(255,59,59,0.8)", letterSpacing: 8, lineHeight: 1 }}>FINAL</div>
        <div style={{ fontFamily: B, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>{longDate}</div>
      </div>
      <Row logo={LM} name="LOWER MERION" score={us} hot={win || Number(us) >= Number(them)} />
      <Row logo={oppLogo} name={f.opp.toUpperCase()} score={them} hot={!win && Number(them) > Number(us)} />
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 24, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}><span>@{f.venue}</span><span>Aces Basketball</span></div>
    </Fill>
  );
};

const Matchup = ({ f, photo, focus, zoom, us, them, oppLogo, longDate, win }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 40%, #a3113f 0%, ${DEEP} 70%)` }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.18, filter: "grayscale(1)" }} />
    <Fill style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 60px 56px" }}>
      <div style={{ fontFamily: O, fontSize: 26, letterSpacing: 10, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final Score"}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 70 }}>
        <div style={{ textAlign: "center", width: 400 }}><Logo src={LM} size={300} ring={GOLD} /><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 200), marginTop: 26, lineHeight: 1 }}>{us}</div><div style={{ fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>Lower Merion</div></div>
        <div style={{ fontFamily: A, fontSize: 90, opacity: 0.5 }}>vs</div>
        <div style={{ textAlign: "center", width: 400 }}><Logo src={oppLogo} size={300} fallback={f.opp[0]} /><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 200), marginTop: 26, lineHeight: 1, opacity: win ? 0.6 : 1 }}>{them}</div><div style={{ fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>{f.opp}</div></div>
      </div>
      <Meta style={{ marginTop: "auto" }}>{longDate} · {f.venue}</Meta>
    </Fill>
  </Fill>
);

const Headline = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: CREAM, color: INK, padding: "56px 64px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `3px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: "12px 0", fontFamily: O, fontSize: 20, letterSpacing: 4, textTransform: "uppercase" }}><span>Lower Merion Aces Basketball</span><span>{longDate}</span></div>
    <div style={{ fontFamily: P, fontWeight: 700, fontSize: win ? 200 : 170, lineHeight: 0.95, marginTop: 30, letterSpacing: -4, color: MAROON }}>{win ? "ACES WIN." : "FINAL."}</div>
    <div style={{ display: "flex", gap: 36, marginTop: 36, alignItems: "stretch" }}>
      <div style={{ width: 520, height: 520, position: "relative", overflow: "hidden", border: `6px solid ${INK}`, flexShrink: 0 }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 150), lineHeight: 1, color: INK }}>{us}</div><div style={{ fontFamily: P, fontStyle: "italic", fontSize: 34 }}>Lower Merion</div>
        <div style={{ height: 2, background: INK, margin: "26px 0", width: 160 }} />
        <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 150), lineHeight: 1, color: "rgba(11,11,13,0.45)" }}>{them}</div><div style={{ fontFamily: P, fontStyle: "italic", fontSize: 34 }}>{f.opp}</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 64, right: 64, bottom: 44, borderTop: `1px solid ${INK}`, paddingTop: 12, fontFamily: SS, fontSize: 22, display: "flex", justifyContent: "space-between" }}><span>{f.venue}</span><span>Ardmore, Pennsylvania</span></div>
  </Fill>
);

const BigW = ({ f, photo, focus, zoom, us, them, win, recLine }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.85 }} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.75))" }} />
    {win ? <div style={{ position: "absolute", left: 0, right: 0, top: -60, textAlign: "center", fontFamily: A, fontSize: 900, lineHeight: 1, color: "transparent", WebkitTextStroke: "10px rgba(255,255,255,0.85)" }}>W</div>
         : <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: A, fontSize: 300, lineHeight: 1, color: "transparent", WebkitTextStroke: "6px rgba(255,255,255,0.85)", letterSpacing: 10 }}>FINAL</div>}
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 190), lineHeight: 1 }}>{us}<span style={{ opacity: 0.5, margin: "0 14px" }}>-</span>{them}</div><div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 8 }}>Lower Merion <span style={{ opacity: 0.5 }}>vs {f.opp}</span></div></div>
      <div style={{ textAlign: "right", fontFamily: O, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final"}<br /><span style={{ color: "#fff", opacity: 0.7 }}>{recLine} on the season</span></div>
    </div>
  </Fill>
);

const Diagonal = ({ f, photo, focus, zoom, us, them, oppLogo, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: MAROON, clipPath: "polygon(0 100%, 100% 38%, 100% 100%)" }} />
    <Fill style={{ background: GOLD, clipPath: "polygon(0 100%, 100% 38%, 100% 41%, 0 103%)" }} />
    <div style={{ position: "absolute", right: 60, bottom: 56, textAlign: "right" }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>Final Score</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 260), lineHeight: 1, marginTop: 10 }}>{us}<span style={{ opacity: 0.55, fontSize: 150, margin: "0 16px" }}>-</span>{them}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20, marginTop: 20, fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 2 }}><Logo src={LM} size={76} />Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}<Logo src={oppLogo} size={76} fallback={f.opp[0]} /></div>
      <Meta style={{ marginTop: 18, fontSize: 20 }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const StripesBand = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 390, background: INK, borderTop: `16px solid ${GOLD}`, padding: "30px 60px", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -30, height: 14, background: `repeating-linear-gradient(90deg, ${MAROON} 0 40px, transparent 40px 60px)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final"}</div><div style={{ fontFamily: O, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", opacity: 0.6 }}>{longDate}</div></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ fontFamily: O, fontSize: 44, textTransform: "uppercase", fontWeight: 600, lineHeight: 1.05 }}>Lower<br />Merion</div>
        <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 200), lineHeight: 1, whiteSpace: "nowrap" }}>{us} <span style={{ color: GOLD }}>-</span> {them}</div>
        <div style={{ fontFamily: O, fontSize: 44, textTransform: "uppercase", fontWeight: 600, lineHeight: 1.05, textAlign: "right", opacity: 0.7 }}>{f.opp}</div>
      </div>
      <Meta style={{ marginTop: "auto", fontSize: 20 }}>@{f.venue}</Meta>
    </div>
  </Fill>
);

const Ticker = ({ f, photo, focus, zoom, us, them, oppLogo, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", top: 44, left: 48, display: "flex", alignItems: "center", gap: 18 }}><Logo src={LM} size={84} /><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 5, textTransform: "uppercase" }}>Aces Basketball<br /><span style={{ opacity: 0.6, fontSize: 18 }}>{longDate}</span></div></div>
    <div style={{ position: "absolute", left: 48, right: 48, bottom: 56, display: "flex", height: 150, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 190, background: MAROON, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: A, fontSize: 48, letterSpacing: 4 }}>FINAL</div>
      <div style={{ flex: 1, background: "#fff", color: INK, display: "flex", alignItems: "center", padding: "0 30px", gap: 24 }}>
        <Logo src={LM} size={92} ring="rgba(0,0,0,0.1)" /><span style={{ fontFamily: O, fontSize: 42, fontWeight: 700, textTransform: "uppercase" }}>LM</span><span style={{ fontFamily: A, fontSize: 92, lineHeight: 1 }}>{us}</span>
        <span style={{ width: 2, height: 90, background: "rgba(0,0,0,0.15)", margin: "0 10px" }} />
        <Logo src={oppLogo} size={92} ring="rgba(0,0,0,0.1)" fallback={f.opp[0]} /><span style={{ fontFamily: O, fontSize: 42, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 230 }}>{f.opp}</span><span style={{ fontFamily: A, fontSize: 92, lineHeight: 1, marginLeft: "auto" }}>{them}</span>
      </div>
    </div>
  </Fill>
);

const Polaroid = ({ f, photo, focus, zoom, us, them, win, dateLine }) => (
  <Fill style={{ background: `${MAROON} repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 18px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 760, background: "#fdfcf8", padding: "34px 34px 150px", transform: "rotate(-4deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ width: "100%", height: 680, position: "relative", overflow: "hidden", background: "#222" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, display: "flex", justifyContent: "space-between", alignItems: "baseline", color: INK, fontFamily: M }}>
        <span style={{ fontSize: 44 }}>Aces {us}, {f.opp} {them}</span><span style={{ fontSize: 30, opacity: 0.6 }}>{dateLine}</span>
      </div>
    </div>
    <div style={{ position: "absolute", top: 90, right: 100, width: 220, height: 220, borderRadius: "50%", background: GOLD, color: DEEP, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: A, fontSize: win ? 64 : 54, lineHeight: 1, transform: "rotate(12deg)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", whiteSpace: "pre-line" }}>{win ? "ACES\nWIN" : "FINAL"}</div>
  </Fill>
);

const Duotone = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: MAROON }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "grayscale(1) contrast(1.15)" }} />
    <Fill style={{ background: MAROON, opacity: 0.72 }} />
    <Fill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
      <div style={{ fontFamily: O, fontSize: 30, letterSpacing: 14, textTransform: "uppercase" }}>{win ? "Aces Win" : "Final Score"}</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 330), lineHeight: 1, marginTop: 20, whiteSpace: "nowrap", textShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>{us}<span style={{ opacity: 0.6 }}>–</span>{them}</div>
      <div style={{ fontFamily: O, fontSize: 40, textTransform: "uppercase", letterSpacing: 4, marginTop: 20 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
      <Meta style={{ position: "absolute", bottom: 56 }}>{longDate} · {f.venue}</Meta>
    </Fill>
  </Fill>
);

const TopBarWhite = ({ f, photo, focus, zoom, us, them, oppLogo, longDate }) => (
  <Fill style={{ background: "#fff", color: MAROON, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 130, background: MAROON, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 50px" }}><div style={{ fontFamily: A, fontSize: 64, letterSpacing: 3 }}>FINAL SCORE</div><img src={LM} alt="" style={{ height: 90 }} /></div>
    <div style={{ height: 560, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 50px", gap: 30 }}>
      <Logo src={LM} size={120} ring="rgba(132,0,54,0.2)" /><div><div style={{ fontFamily: A, fontSize: 150, lineHeight: 1 }}>{us}</div><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 3, textTransform: "uppercase" }}>Lower Merion</div></div>
      <div style={{ flex: 1, textAlign: "center", fontFamily: O, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", opacity: 0.6 }}>{longDate}<br />{f.venue}</div>
      <div style={{ textAlign: "right" }}><div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, opacity: 0.55 }}>{them}</div><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 3, textTransform: "uppercase" }}>{f.opp}</div></div><Logo src={oppLogo} size={120} ring="rgba(132,0,54,0.2)" fallback={f.opp[0]} />
    </div>
  </Fill>
);

const Circle = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 30%, #6b0030 0%, ${INK} 65%)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 60px 56px" }}>
    <div style={{ width: 600, height: 600, borderRadius: "50%", overflow: "hidden", position: "relative", border: `14px solid ${GOLD}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 170), lineHeight: 1, marginTop: 40, whiteSpace: "nowrap" }}>{us} <span style={{ color: GOLD }}>·</span> {them}</div>
    <div style={{ fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
    <Meta style={{ marginTop: "auto", color: GOLD }}>{win ? "Aces Win" : "Final"} · {longDate}</Meta>
  </Fill>
);

// ── Portrait layouts ─────────────────────────────────────────
export const Tape = ({ style, children, size = 64 }) => <div style={{ position: "absolute", background: "#0a0a0a", padding: "10px 26px 14px", fontFamily: M, fontSize: size, lineHeight: 1.05, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", ...style }}>{children}</div>;

const StoryTape = ({ f, photo, focus, zoom, us, them, win, dateLine }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    <img src={BULL} alt="" style={{ position: "absolute", top: 20, left: 14, height: 200 }} /><img src={BULL} alt="" style={{ position: "absolute", top: 20, right: 14, height: 200, transform: "scaleX(-1)" }} />
    <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: G, fontSize: 150, lineHeight: 1, transform: "rotate(-4deg)", textShadow: "0 0 3px #35d0ff, 5px 5px 0 #e3142f, 0 0 36px rgba(227,20,47,0.9)" }}>{win ? "ACES WIN" : "FINAL"}</div>
    <Tape style={{ left: 40, bottom: 330, transform: "rotate(-5deg)" }}>{dateLine}</Tape>
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 110, fontFamily: A, fontSize: scoreSize(us, them, 300), lineHeight: 1, textAlign: "center", textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>{us}<span style={{ opacity: 0.6 }}>-</span>{them}</div>
    <Tape style={{ left: 40, bottom: 30 }} size={46}>LOWER MERION</Tape><Tape style={{ right: 40, bottom: 30 }} size={46}>VS. {f.opp.toUpperCase()}</Tape>
  </Fill>
);

const GoldFrame = ({ f, photo, focus, zoom, us, them, longDate }) => (
  <Fill style={{ background: GOLD, padding: 26 }}>
    <div style={{ width: "100%", height: "100%", background: MAROON, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 760, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ flex: 1, padding: "40px 54px", display: "flex", flexDirection: "column", borderTop: `6px solid ${GOLD}` }}>
        <div style={{ fontFamily: B, fontSize: 90, letterSpacing: 6, color: GOLD, lineHeight: 1 }}>FINAL SCORE</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 10 }}><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 210), lineHeight: 1 }}>{us}</span><span style={{ fontFamily: A, fontSize: 110, opacity: 0.5 }}>–</span><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 210), lineHeight: 1 }}>{them}</span></div>
        <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
        <Meta style={{ marginTop: "auto", color: GOLD }}>{longDate} · {f.venue}</Meta>
      </div>
    </div>
  </Fill>
);

const Stacked = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 660, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, #0b0b0d 100%)" }} /></div>
    <div style={{ flex: 1, padding: "10px 60px 50px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final"}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}><span style={{ fontFamily: A, fontSize: 92, textTransform: "uppercase", letterSpacing: 2 }}>Lower Merion</span><span style={{ fontFamily: A, fontSize: 170, lineHeight: 1, color: win ? GOLD : "#fff" }}>{us}</span></div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.15)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}><span style={{ fontFamily: A, fontSize: 92, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6 }}>{f.opp}</span><span style={{ fontFamily: A, fontSize: 170, lineHeight: 1, color: !win && Number(them) > Number(us) ? GOLD : "rgba(255,255,255,0.6)" }}>{them}</span></div>
      <Meta style={{ marginTop: "auto" }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const VerticalSplit = ({ f, photo, focus, zoom, us, them, longDate }) => (
  <Fill style={{ background: INK, display: "flex" }}>
    <div style={{ width: 290, background: MAROON, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", writingMode: "vertical-rl", fontFamily: A, fontSize: 190, lineHeight: 1, letterSpacing: 4, color: "#fff" }}>FINAL SCORE</div>
      <img src={LM} alt="" style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", width: 170 }} />
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 44px 46px", background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.85))" }}>
        <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 210), lineHeight: 1, whiteSpace: "nowrap" }}>{us} <span style={{ color: GOLD }}>-</span> {them}</div>
        <div style={{ fontFamily: O, fontSize: 36, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
        <Meta style={{ marginTop: 14, fontSize: 20 }}>{longDate} · {f.venue}</Meta>
      </div>
    </div>
  </Fill>
);

const ScoreboardPortrait = ({ f, us, them, win, oppLogo, recLine, longDate }) => (
  <Fill style={{ background: `linear-gradient(180deg, #9a0f3b 0%, ${DEEP} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 70px 60px" }}>
    <img src={LM} alt="" style={{ width: 330, height: 330, filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))" }} />
    <div style={{ fontFamily: B, fontSize: 110, letterSpacing: 10, marginTop: 20, lineHeight: 1 }}>{win ? "ACES WIN" : "FINAL"}</div>
    <div style={{ width: "100%", marginTop: 40, display: "grid", gap: 20 }}>
      {[[LM, "Lower Merion", us, true], [oppLogo, f.opp, them, false]].map(([logo, name, sc, isUs]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 30, background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "26px 40px" }}>
          <Logo src={logo} size={120} fallback={name[0]} /><div style={{ fontFamily: O, fontSize: 48, fontWeight: 600, textTransform: "uppercase", flex: 1 }}>{name}</div><div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, color: (isUs ? win : !win && Number(them) > Number(us)) ? GOLD : "#fff" }}>{sc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: "auto", textAlign: "center" }}><div style={{ fontFamily: O, fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: GOLD }}>Aces are {recLine}</div><Meta style={{ marginTop: 10 }}>{longDate} · {f.venue}</Meta></div>
  </Fill>
);

const TornPaper = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: CREAM, color: MAROON }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 780, overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ position: "absolute", top: 720, left: 0, right: 0, bottom: 0, background: CREAM, clipPath: "polygon(0 40px, 4% 0, 9% 46px, 15% 10px, 21% 50px, 27% 4px, 33% 44px, 40% 12px, 46% 52px, 52% 6px, 58% 46px, 64% 14px, 70% 50px, 77% 2px, 83% 44px, 89% 10px, 95% 48px, 100% 8px, 100% 100%, 0 100%)", padding: "110px 64px 56px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: P, fontStyle: "italic", fontWeight: 700, fontSize: 72, lineHeight: 1 }}>{win ? "Aces win." : "Final."}</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 1, marginTop: 20, whiteSpace: "nowrap" }}>{us}<span style={{ opacity: 0.4, margin: "0 16px" }}>–</span>{them}</div>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 14 }}>Lower Merion <span style={{ opacity: 0.55 }}>vs</span> {f.opp}</div>
      <Meta style={{ marginTop: "auto", color: MAROON }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const Neon = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: "#07070a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.3 }} />
    <div style={{ position: "relative", fontFamily: G, fontSize: 180, lineHeight: 1, transform: "rotate(-4deg)", textShadow: "0 0 4px #35d0ff, 0 0 18px #35d0ff, 6px 6px 0 #e3142f, 0 0 50px rgba(227,20,47,0.9)" }}>{win ? "ACES WIN" : "FINAL"}</div>
    <div style={{ position: "relative", fontFamily: A, fontSize: scoreSize(us, them, 320), lineHeight: 1, marginTop: 50, whiteSpace: "nowrap", textShadow: "0 0 30px rgba(255,255,255,0.5)" }}>{us}<span style={{ color: "#ff2d78" }}>-</span>{them}</div>
    <div style={{ position: "relative", fontFamily: B, fontSize: 70, letterSpacing: 6, marginTop: 30 }}>LOWER MERION <span style={{ color: "#35d0ff" }}>vs</span> {f.opp.toUpperCase()}</div>
    <Meta style={{ position: "absolute", bottom: 60 }}>{longDate} · {f.venue}</Meta>
  </Fill>
);

const Minimal = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: "#faf7f1", color: MAROON, padding: "80px 80px 70px" }}>
    <img src={LM} alt="" style={{ width: 110, height: 110 }} />
    <div style={{ fontFamily: P, fontStyle: "italic", fontSize: 64, marginTop: 70, color: INK }}>{win ? "Aces win." : "Final."}</div>
    <div style={{ fontFamily: O, fontWeight: 300, fontSize: scoreSize(us, them, 290), lineHeight: 1, letterSpacing: -8, marginTop: 10, whiteSpace: "nowrap" }}>{us}<span style={{ opacity: 0.35 }}>–</span>{them}</div>
    <div style={{ width: 90, height: 3, background: MAROON, margin: "34px 0" }} />
    <div style={{ fontFamily: SS, fontSize: 30, color: INK, lineHeight: 1.6 }}>Lower Merion <span style={{ opacity: 0.5 }}>vs</span> {f.opp}<br /><span style={{ opacity: 0.55, fontSize: 24 }}>{longDate} · {f.venue}</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 70, width: 360, height: 360, overflow: "hidden", borderRadius: 6 }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
  </Fill>
);

const RecordCard = ({ f, photo, focus, zoom, us, them, win, tie, recLine, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, background: "#fff", color: INK, borderRadius: 18, padding: "34px 40px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "inline-block", background: MAROON, color: "#fff", fontFamily: O, fontSize: 20, letterSpacing: 5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 6 }}>Final</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 14 }}><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 170), lineHeight: 1 }}>{us}</span><span style={{ fontFamily: A, fontSize: 80, opacity: 0.35 }}>–</span><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 170), lineHeight: 1, opacity: 0.55 }}>{them}</span><span style={{ marginLeft: "auto", fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 2, textAlign: "right", lineHeight: 1.2 }}>Lower Merion<br /><span style={{ opacity: 0.5 }}>vs {f.opp}</span></span></div>
      <div style={{ marginTop: 18, fontFamily: O, fontSize: 34, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, color: MAROON }}>{tie ? `Aces are ${recLine}` : win ? `Aces improve to ${recLine}` : `Aces fall to ${recLine}`}</div>
      <div style={{ fontFamily: SS, fontSize: 22, opacity: 0.6, marginTop: 6 }}>{longDate} · {f.venue}</div>
    </div>
  </Fill>
);

const MatchupPortrait = ({ f, photo, focus, zoom, us, them, win, oppLogo, longDate }) => (
  <Fill style={{ background: DEEP }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.25 }} />
    <Fill style={{ background: `linear-gradient(180deg, rgba(77,0,32,0.2), rgba(77,0,32,0.9))`, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 60px 50px" }}>
      <Logo src={LM} size={330} ring={GOLD} />
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 220), lineHeight: 1, marginTop: 20, color: win ? GOLD : "#fff" }}>{us}</div>
      <div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 4 }}>Lower Merion</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, width: "100%", margin: "26px 0" }}><div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.25)" }} /><span style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase" }}>Final</span><div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.25)" }} /></div>
      <Logo src={oppLogo} size={240} fallback={f.opp[0]} />
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 170), lineHeight: 1, marginTop: 14, opacity: win ? 0.65 : 1 }}>{them}</div>
      <div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 4 }}>{f.opp}</div>
      <Meta style={{ marginTop: "auto" }}>{longDate} · {f.venue}</Meta>
    </Fill>
  </Fill>
);

const Marquee = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 790, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, margin: 30, border: `6px solid ${GOLD}`, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
      <div style={{ position: "absolute", inset: 12, border: "2px dotted rgba(201,164,74,0.8)", pointerEvents: "none" }} />
      <div style={{ fontFamily: A, fontSize: 92, color: GOLD, letterSpacing: 6, lineHeight: 1 }}>{win ? "ACES WIN" : "FINAL SCORE"}</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 190), lineHeight: 1, marginTop: 14, whiteSpace: "nowrap" }}>{us} <span style={{ color: GOLD }}>-</span> {them}</div>
      <div style={{ fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
      <Meta style={{ marginTop: 16, color: GOLD, fontSize: 19 }}>{longDate}</Meta>
    </div>
  </Fill>
);

const Comic = ({ f, photo, focus, zoom, us, them, win }) => (
  <Fill style={{ background: `${GOLD} radial-gradient(circle, rgba(0,0,0,0.18) 2px, transparent 2.5px) 0 0 / 26px 26px` }}>
    <div style={{ position: "absolute", top: 60, left: 60, right: 60, height: 620, overflow: "hidden", border: `10px solid ${INK}`, transform: "rotate(-2deg)", background: "#000" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ position: "absolute", top: 20, right: 40, background: "#fff", border: `8px solid ${INK}`, borderRadius: "50%", width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BG, fontSize: win ? 70 : 56, color: MAROON, transform: "rotate(10deg)", textAlign: "center", lineHeight: 1 }}>{win ? "ACES WIN!" : "FINAL!"}</div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, background: "#fff", border: `10px solid ${INK}`, padding: "30px 40px", color: INK, boxShadow: `18px 18px 0 ${INK}` }}>
      <div style={{ fontFamily: BG, fontSize: scoreSize(us, them, 200), lineHeight: 1, color: MAROON, letterSpacing: 4 }}>{us} - {them}</div>
      <div style={{ fontFamily: BG, fontSize: 56, letterSpacing: 3, marginTop: 6 }}>LOWER MERION <span style={{ opacity: 0.5 }}>vs</span> {f.opp.toUpperCase()}</div>
    </div>
  </Fill>
);

// ── Batch 2 ──────────────────────────────────────────────────
const SplitHorizontal = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: "#fff", color: MAROON, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 560, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, padding: "40px 60px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 8, textTransform: "uppercase", opacity: 0.6 }}>{win ? "Aces Win" : "Final"} · {longDate}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 }}>
        <div><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 0.95 }}>{us}</div><div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 3 }}>Lower Merion</div></div>
        <div style={{ textAlign: "right", opacity: 0.55 }}><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 0.95 }}>{them}</div><div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 3 }}>{f.opp}</div></div>
      </div>
    </div>
  </Fill>
);

const TickerPortrait = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: INK, padding: "34px 54px 44px", borderTop: `10px solid ${GOLD}` }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final"} · {longDate}</div>
      {[["Lower Merion", us, win || Number(us) >= Number(them)], [f.opp, them, !win && Number(them) > Number(us)]].map(([n, s, hot]) => (
        <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(255,255,255,0.12)", padding: "14px 0" }}>
          <span style={{ fontFamily: B, fontSize: 82, letterSpacing: 3, color: hot ? "#fff" : "rgba(255,255,255,0.55)" }}>{n}</span><span style={{ fontFamily: A, fontSize: 120, lineHeight: 1, color: hot ? GOLD : "rgba(255,255,255,0.55)" }}>{s}</span>
        </div>
      ))}
      <Meta style={{ marginTop: 16, fontSize: 19 }}>@{f.venue}</Meta>
    </div>
  </Fill>
);

const GlassCard = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "rgba(40,0,15,0.35)" }} />
    <div style={{ position: "relative", width: 820, padding: "60px 60px 50px", borderRadius: 28, background: "rgba(10,0,5,0.72)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", textAlign: "center" }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 10, textTransform: "uppercase", color: GOLD }}>{win ? "Aces Win" : "Final Score"}</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 250), lineHeight: 1, marginTop: 14, whiteSpace: "nowrap" }}>{us}<span style={{ opacity: 0.4, margin: "0 18px" }}>–</span>{them}</div>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
      <Meta style={{ marginTop: 26, fontSize: 19 }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const OutlineScore = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6))" }} />
    <div style={{ position: "absolute", top: 70, left: 60, fontFamily: A, fontSize: 70, letterSpacing: 6, color: GOLD }}>{win ? "ACES WIN" : "FINAL"}</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily: A, fontSize: scoreSize(us, them, 420), lineHeight: 1, color: "transparent", WebkitTextStroke: "8px #fff", whiteSpace: "nowrap" }}>{us}-{them}</div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 32, textTransform: "uppercase", letterSpacing: 3 }}><span>Lower Merion</span><span style={{ opacity: 0.6 }}>{longDate}</span><span>{f.opp}</span></div>
  </Fill>
);

const CornerTag = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: `420px solid ${MAROON}`, borderRight: "420px solid transparent" }} />
    <div style={{ position: "absolute", top: 60, left: 60, fontFamily: A, fontSize: win ? 200 : 110, lineHeight: 1, color: "#fff" }}>{win ? "W" : "FINAL"}</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 60px 54px", background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.85))" }}>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 210), lineHeight: 1 }}>{us} <span style={{ color: GOLD }}>-</span> {them}</div>
      <div style={{ fontFamily: O, fontSize: 36, textTransform: "uppercase", letterSpacing: 3, marginTop: 8 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
      <Meta style={{ marginTop: 10, fontSize: 20 }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const Watermark = ({ f, us, them, win, longDate, recLine }) => (
  <Fill style={{ background: `linear-gradient(160deg, #9a0f3b, ${DEEP})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <img src={LM} alt="" style={{ position: "absolute", width: 1100, height: 1100, left: -120, top: -60, opacity: 0.08 }} />
    <div style={{ position: "relative", fontFamily: B, fontSize: 90, letterSpacing: 12 }}>{win ? "ACES WIN" : "FINAL SCORE"}</div>
    <div style={{ position: "relative", fontFamily: A, fontSize: scoreSize(us, them, 340), lineHeight: 1, marginTop: 10, whiteSpace: "nowrap" }}>{us}<span style={{ color: GOLD }}>-</span>{them}</div>
    <div style={{ position: "relative", fontFamily: O, fontSize: 44, textTransform: "uppercase", letterSpacing: 4, marginTop: 14 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div>
    <div style={{ position: "relative", fontFamily: O, fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: GOLD, marginTop: 40 }}>Aces are {recLine}</div>
    <Meta style={{ position: "absolute", bottom: 60 }}>{longDate} · {f.venue}</Meta>
  </Fill>
);

const TwoTone = ({ f, us, them, win, oppLogo, longDate }) => (
  <Fill style={{ display: "flex" }}>
    <div style={{ flex: 1, background: MAROON, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}><Logo src={LM} size={260} ring={GOLD} /><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 260), lineHeight: 1, marginTop: 40, color: win ? GOLD : "#fff" }}>{us}</div><div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 10, textAlign: "center" }}>Lower<br />Merion</div></div>
    <div style={{ flex: 1, background: INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}><Logo src={oppLogo} size={260} fallback={f.opp[0]} /><div style={{ fontFamily: A, fontSize: scoreSize(us, them, 260), lineHeight: 1, marginTop: 40, color: !win && Number(them) > Number(us) ? GOLD : "rgba(255,255,255,0.7)" }}>{them}</div><div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 3, marginTop: 10, textAlign: "center" }}>{f.opp}</div></div>
    <div style={{ position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", background: GOLD, color: DEEP, fontFamily: A, fontSize: 40, letterSpacing: 6, padding: "10px 36px", borderRadius: 40 }}>FINAL</div>
    <Meta style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center" }}>{longDate} · {f.venue}</Meta>
  </Fill>
);

const Hardwood = ({ f, us, them, win, oppLogo, longDate }) => (
  <Fill style={{ background: "repeating-linear-gradient(90deg, #c98a4b 0 118px, #b9793d 118px 122px, #d19553 122px 240px, #b9793d 240px 244px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Fill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 26px)" }} />
    <div style={{ position: "relative", width: 860, background: MAROON, borderRadius: 24, padding: "54px 60px", boxShadow: "0 40px 90px rgba(0,0,0,0.45)", border: `8px solid ${GOLD}` }}>
      <div style={{ fontFamily: B, fontSize: 80, letterSpacing: 10, textAlign: "center" }}>{win ? "ACES WIN" : "FINAL"}</div>
      {[[LM, "Lower Merion", us], [oppLogo, f.opp, them]].map(([lg, n, s]) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 26 }}><Logo src={lg} size={110} fallback={n[0]} /><span style={{ fontFamily: O, fontSize: 46, fontWeight: 600, textTransform: "uppercase", flex: 1 }}>{n}</span><span style={{ fontFamily: A, fontSize: 130, lineHeight: 1 }}>{s}</span></div>
      ))}
      <Meta style={{ marginTop: 30, textAlign: "center", color: GOLD }}>{longDate} · {f.venue}</Meta>
    </div>
  </Fill>
);

const BottomSheet = ({ f, photo, focus, zoom, us, them, win, tie, recLine, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", color: INK, borderRadius: "48px 48px 0 0", padding: "50px 64px 60px" }}>
      <div style={{ width: 90, height: 8, borderRadius: 4, background: "rgba(0,0,0,0.15)", margin: "0 auto 30px" }} />
      <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: MAROON }}>{win ? "Aces Win" : "Final"}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 10 }}><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 1 }}>{us}</span><span style={{ fontFamily: A, fontSize: 100, opacity: 0.3 }}>–</span><span style={{ fontFamily: A, fontSize: scoreSize(us, them, 230), lineHeight: 1, opacity: 0.5 }}>{them}</span></div>
      <div style={{ fontFamily: O, fontSize: 36, textTransform: "uppercase", letterSpacing: 3, marginTop: 10 }}>Lower Merion <span style={{ opacity: 0.5 }}>vs</span> {f.opp}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, fontFamily: SS, fontSize: 24, opacity: 0.7 }}><span>{longDate} · {f.venue}</span><span style={{ color: MAROON, fontWeight: 600 }}>{tie ? recLine : `Now ${recLine}`}</span></div>
    </div>
  </Fill>
);

const PressRelease = ({ f, us, them, win, longDate, recLine }) => (
  <Fill style={{ background: "#f7f3ea", color: INK, padding: "90px 100px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}><img src={LM} alt="" style={{ width: 90 }} /><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 6, textTransform: "uppercase" }}>Lower Merion Aces<br /><span style={{ opacity: 0.5 }}>Boys Basketball</span></div></div>
    <div style={{ height: 3, background: INK, margin: "40px 0" }} />
    <div style={{ fontFamily: SS, fontSize: 28, lineHeight: 1.5, opacity: 0.8 }}>{longDate}</div>
    <div style={{ fontFamily: P, fontWeight: 700, fontSize: 86, lineHeight: 1.05, marginTop: 14 }}>{win ? "Lower Merion" : "Final:"} {win ? "defeats" : "Lower Merion"} {win ? f.opp : `${us}, ${f.opp} ${them}`}{win ? "." : ""}</div>
    <div style={{ fontFamily: A, fontSize: 200, lineHeight: 1, marginTop: 30, color: MAROON }}>{us}<span style={{ opacity: 0.35, margin: "0 20px" }}>–</span>{them}</div>
    <div style={{ fontFamily: SS, fontSize: 30, lineHeight: 1.6, marginTop: 30, opacity: 0.85 }}>The Aces {win ? "move to" : "are now"} <b>{recLine}</b> on the season. {f.venue}.</div>
  </Fill>
);

const Ribbon = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", top: 90, right: -140, width: 620, padding: "16px 0", background: GOLD, color: DEEP, textAlign: "center", fontFamily: A, fontSize: 52, letterSpacing: 6, transform: "rotate(35deg)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>{win ? "ACES WIN" : "FINAL"}</div>
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, background: MAROON, padding: "30px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `14px solid ${GOLD}` }}>
      <div><div style={{ fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 2 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div><Meta style={{ marginTop: 6, fontSize: 18 }}>{longDate} · {f.venue}</Meta></div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 130), lineHeight: 1, whiteSpace: "nowrap" }}>{us}-{them}</div>
    </div>
  </Fill>
);

const LogosBar = ({ f, photo, focus, zoom, us, them, win, oppLogo, longDate }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 300, background: MAROON, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Logo src={LM} size={170} ring={GOLD} /><span style={{ fontFamily: A, fontSize: 170, lineHeight: 1, color: win ? GOLD : "#fff" }}>{us}</span></div>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", textAlign: "center" }}>Final</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}><span style={{ fontFamily: A, fontSize: 170, lineHeight: 1, opacity: win ? 0.6 : 1 }}>{them}</span><Logo src={oppLogo} size={170} fallback={f.opp[0]} /></div>
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px", fontFamily: O, fontSize: 30, textTransform: "uppercase", letterSpacing: 3 }}><span>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</span><span style={{ opacity: 0.6, fontSize: 22, letterSpacing: 5 }}>{longDate}</span></div>
  </Fill>
);

const VerticalScore = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: DEEP }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.35, filter: "grayscale(0.6)" }} />
    <Fill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 6 }}>Lower Merion</div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 400), lineHeight: 0.9, color: win ? GOLD : "#fff" }}>{us}</div>
      <div style={{ width: 300, height: 4, background: "rgba(255,255,255,0.4)", margin: "30px 0" }} />
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 400), lineHeight: 0.9, opacity: win ? 0.55 : 1 }}>{them}</div>
      <div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 6 }}>{f.opp}</div>
    </Fill>
    <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", fontFamily: B, fontSize: 60, letterSpacing: 12 }}>{win ? "ACES WIN" : "FINAL"}</div>
    <Meta style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center" }}>{longDate} · {f.venue}</Meta>
  </Fill>
);

const FramedCaption = ({ f, photo, focus, zoom, us, them, longDate }) => (
  <Fill style={{ background: MAROON, padding: 44, display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, position: "relative", overflow: "hidden", border: "6px solid #fff" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
      <div><div style={{ fontFamily: O, fontSize: 20, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>Final</div><div style={{ fontFamily: O, fontSize: 36, textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</div><Meta style={{ fontSize: 16, marginTop: 4 }}>{longDate}</Meta></div>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 120), lineHeight: 1, whiteSpace: "nowrap" }}>{us} <span style={{ color: GOLD }}>-</span> {them}</div>
    </div>
  </Fill>
);

const Stamp = ({ f, photo, focus, zoom, us, them, win, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6))" }} />
    <div style={{ position: "absolute", top: 110, left: 90, padding: "14px 40px", border: "12px double #e3142f", color: "#e3142f", fontFamily: A, fontSize: win ? 150 : 100, lineHeight: 1, letterSpacing: 8, transform: "rotate(-14deg)", opacity: 0.92, textShadow: "0 0 10px rgba(0,0,0,0.3)" }}>{win ? "WIN" : "FINAL"}</div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60 }}>
      <div style={{ fontFamily: A, fontSize: scoreSize(us, them, 220), lineHeight: 1 }}>{us}<span style={{ opacity: 0.5, margin: "0 14px" }}>-</span>{them}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}><span style={{ fontFamily: O, fontSize: 36, textTransform: "uppercase", letterSpacing: 3 }}>Lower Merion <span style={{ opacity: 0.6 }}>vs</span> {f.opp}</span><Meta style={{ fontSize: 20 }}>{longDate}</Meta></div>
    </div>
  </Fill>
);

export const FINAL_LAYOUTS = [
  { id: "panel-maroon", name: "Maroon Panel", w: S, h: S, Comp: PanelMaroon },
  { id: "panel-black", name: "Black Panel", w: S, h: S, Comp: PanelBlack },
  { id: "panel-cream", name: "Cream Panel", w: S, h: S, Comp: PanelCream },
  { id: "scoreboard", name: "Scoreboard", w: S, h: S, Comp: Scoreboard, noPhoto: true },
  { id: "matchup", name: "Matchup Logos", w: S, h: S, Comp: Matchup },
  { id: "headline", name: "Newspaper", w: S, h: S, Comp: Headline },
  { id: "big-w", name: "Big W", w: S, h: S, Comp: BigW },
  { id: "diagonal", name: "Diagonal", w: S, h: S, Comp: Diagonal },
  { id: "stripes", name: "Gold Band", w: S, h: S, Comp: StripesBand },
  { id: "ticker", name: "Broadcast Bug", w: S, h: S, Comp: Ticker },
  { id: "polaroid", name: "Polaroid", w: S, h: S, Comp: Polaroid },
  { id: "duotone", name: "Duotone", w: S, h: S, Comp: Duotone },
  { id: "topbar", name: "White Top Bar", w: S, h: S, Comp: TopBarWhite },
  { id: "circle", name: "Circle Photo", w: S, h: S, Comp: Circle },
  { id: "story-tape", name: "Tape (Game Day family)", w: PW, h: PH, Comp: StoryTape },
  { id: "gold-frame", name: "Gold Frame", w: PW, h: PH, Comp: GoldFrame },
  { id: "stacked", name: "Stacked Lines", w: PW, h: PH, Comp: Stacked },
  { id: "vsplit", name: "Vertical Split", w: PW, h: PH, Comp: VerticalSplit },
  { id: "scoreboard-p", name: "Scoreboard Tall", w: PW, h: PH, Comp: ScoreboardPortrait, noPhoto: true },
  { id: "torn", name: "Torn Paper", w: PW, h: PH, Comp: TornPaper },
  { id: "neon", name: "Neon", w: PW, h: PH, Comp: Neon },
  { id: "minimal", name: "Minimal", w: PW, h: PH, Comp: Minimal },
  { id: "record", name: "Record Card", w: PW, h: PH, Comp: RecordCard },
  { id: "matchup-p", name: "Matchup Tall", w: PW, h: PH, Comp: MatchupPortrait },
  { id: "marquee", name: "Marquee", w: PW, h: PH, Comp: Marquee },
  // batch 2
  { id: "split-h", name: "Photo Over White", w: S, h: S, Comp: SplitHorizontal },
  { id: "ticker-p", name: "Score Lines Tall", w: PW, h: PH, Comp: TickerPortrait },
  { id: "glass", name: "Glass Card", w: S, h: S, Comp: GlassCard },
  { id: "outline", name: "Outline Digits", w: S, h: S, Comp: OutlineScore },
  { id: "corner", name: "Corner Tag", w: S, h: S, Comp: CornerTag },
  { id: "watermark", name: "Crest Watermark", w: S, h: S, Comp: Watermark, noPhoto: true },
  { id: "twotone", name: "Two Tone", w: S, h: S, Comp: TwoTone, noPhoto: true },
  { id: "hardwood", name: "Hardwood", w: S, h: S, Comp: Hardwood, noPhoto: true },
  { id: "sheet", name: "Bottom Sheet", w: PW, h: PH, Comp: BottomSheet },
  { id: "press", name: "Press Release", w: S, h: S, Comp: PressRelease, noPhoto: true },
  { id: "ribbon", name: "Gold Ribbon", w: S, h: S, Comp: Ribbon },
  { id: "logosbar", name: "Logos Bar", w: PW, h: PH, Comp: LogosBar },
  { id: "vscore", name: "Vertical Score", w: PW, h: PH, Comp: VerticalScore },
  { id: "framed", name: "Framed Caption", w: S, h: S, Comp: FramedCaption },
  { id: "stamp", name: "Rubber Stamp", w: S, h: S, Comp: Stamp },
];

export const oppLogoFor = (opp) => teamLogos[opp] || null;
