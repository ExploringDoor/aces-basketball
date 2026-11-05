// pages/flyers/gameDayLayouts.jsx
// 38 Game Day layouts for the Flyer Studio. Same contract as finalLayouts:
// each renders inside a fixed W×H board owned by the page. Props:
//   f { opp, weekday, dateLine, time, venue, event }, photo, focus, zoom,
//   oppLogo, longDate, home (true = Aces host)
import { S, PW, PH, MAROON, DEEP, GOLD, CREAM, INK, A, O, P, M, G, B, BG, SS, LM, BULL, Photo, Fill, Logo, Meta, Tape, Fit, initials, seasonOf } from "./finalLayouts";

const vs = (home) => (home ? "VS" : "@");
const Strip = ({ style, lines, size, align = "left", max = 9999 }) => (
  <div style={{ position: "absolute", ...style, background: "#0a0a0a", padding: "12px 28px 16px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", textAlign: align, fontFamily: M }}>
    {lines.map((l, i) => <Fit key={i} max={max} size={size} style={{ lineHeight: 1.05, color: "#fff" }}>{l}</Fit>)}
  </div>
);
const Details = ({ f, style, color = "#fff", size = 26 }) => (
  <div style={{ fontFamily: O, fontSize: size, letterSpacing: 4, textTransform: "uppercase", color, lineHeight: 1.6, ...style }}>
    {f.weekday} {f.dateLine} · {f.time}<br /><span style={{ opacity: 0.7 }}>{f.venue}</span>
  </div>
);

// 1. The program's existing IG template.
const TapeClassic = ({ f, photo, focus, zoom }) => {
  const oppSize = f.opp.length > 12 ? 48 : f.opp.length > 9 ? 56 : 66;
  const venueSize = f.venue.length > 26 ? 28 : f.venue.length > 18 ? 36 : 42;
  const stripBottom = f.event ? 240 : 150;
  const glow = "0 0 2px #35d0ff, 0 0 3px #35d0ff, 5px 5px 0 #e3142f, 0 0 36px rgba(227,20,47,0.9), 0 0 12px rgba(0,0,0,0.6)";
  return (
    <Fill style={{ fontFamily: M }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.45) 100%)" }} />
      <img src={BULL} alt="" style={{ position: "absolute", top: 18, left: 10, height: 215, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.55))" }} />
      <img src={BULL} alt="" style={{ position: "absolute", top: 18, right: 10, height: 215, transform: "scaleX(-1)", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.55))" }} />
      <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", transform: "rotate(-4deg)" }}>
        <div style={{ fontFamily: G, fontSize: 168, lineHeight: 1, letterSpacing: 1, whiteSpace: "nowrap", textShadow: glow }}>GAME DAY</div>
        <div style={{ height: 12, margin: "0 250px 0 190px", background: "linear-gradient(90deg, #ff1e3c, #ff5d75)", transform: "skewX(-25deg)", borderRadius: 6, boxShadow: "0 0 22px rgba(255,30,60,0.9), 0 0 6px #fff" }} />
      </div>
      <Strip style={{ left: 40, bottom: stripBottom, transform: "rotate(-5deg)" }} lines={[f.weekday, f.dateLine]} size={70} max={340} />
      <Strip style={{ right: 40, bottom: stripBottom + 10, transform: "rotate(4deg)" }} lines={["VS.", f.opp.toUpperCase()]} size={oppSize} align="right" max={500} />
      {f.event && <Strip style={{ left: "50%", bottom: 118, transform: "translateX(-50%) rotate(-3deg)" }} lines={[f.event.toUpperCase()]} size={f.event.length > 18 ? 54 : 70} max={860} />}
      <div style={{ position: "absolute", left: 24, bottom: 26, background: "#000", padding: "10px 26px 14px", fontSize: venueSize, letterSpacing: 3, whiteSpace: "nowrap", maxWidth: 780, overflow: "hidden", textOverflow: "ellipsis", boxSizing: "border-box" }}>@{f.venue.toUpperCase()}</div>
      {f.time && <div style={{ position: "absolute", right: 24, bottom: 26, background: "#000", padding: "10px 26px 14px", fontSize: 42, letterSpacing: 4, whiteSpace: "nowrap" }}>{f.time}</div>}
    </Fill>
  );
};

const BulldogBanner = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 250, background: MAROON, display: "flex", alignItems: "center", padding: "0 50px", gap: 30 }}>
      <img src={BULL} alt="" style={{ height: 190 }} />
      <div><div style={{ fontFamily: A, fontSize: 120, lineHeight: 1, color: GOLD, letterSpacing: 4 }}>GAME DAY</div><div style={{ fontFamily: O, fontSize: 26, letterSpacing: 8, textTransform: "uppercase" }}>{f.event || "Lower Merion Aces Basketball"}</div></div>
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ height: 280, padding: "34px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `8px solid ${GOLD}` }}>
      <div style={{ minWidth: 0 }}><Fit max={540} size={96} style={{ fontFamily: A, lineHeight: 1 }}>{vs(home)} {f.opp.toUpperCase()}</Fit><Details f={f} style={{ marginTop: 12, whiteSpace: "nowrap" }} size={f.venue.length > 22 ? 22 : 26} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Logo src={LM} size={150} ring={GOLD} /><span style={{ fontFamily: A, fontSize: 44, opacity: 0.5 }}>{vs(home)}</span><Logo src={oppLogo} size={150} fallback={f.opp[0]} /></div>
    </div>
  </Fill>
);

const MatchupLogos = ({ f, photo, focus, zoom, oppLogo, home }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 40%, #a3113f 0%, ${DEEP} 70%)` }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.18, filter: "grayscale(1)" }} />
    <Fill style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 60px 56px" }}>
      <div style={{ fontFamily: A, fontSize: 110, letterSpacing: 6, color: GOLD, lineHeight: 1 }}>GAME DAY</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 70 }}>
        <div style={{ textAlign: "center", width: 400 }}><Logo src={LM} size={320} ring={GOLD} /><div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 2, marginTop: 20 }}>Lower Merion</div></div>
        <div style={{ fontFamily: A, fontSize: 110, opacity: 0.6 }}>{vs(home)}</div>
        <div style={{ textAlign: "center", width: 400 }}><Logo src={oppLogo} size={320} fallback={f.opp[0]} /><div style={{ fontFamily: O, fontSize: 34, textTransform: "uppercase", letterSpacing: 2, marginTop: 20 }}>{f.opp}</div></div>
      </div>
      <Details f={f} style={{ marginTop: "auto", textAlign: "center" }} />
    </Fill>
  </Fill>
);

const Tonight = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%)" }} />
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 60 }}>
      <div style={{ fontFamily: A, fontSize: 250, lineHeight: 0.9, letterSpacing: -4 }}>{f.weekday === "SATURDAY" || f.weekday === "SUNDAY" ? f.weekday : "TONIGHT"}</div>
      <div style={{ fontFamily: O, fontSize: 54, textTransform: "uppercase", letterSpacing: 3, marginTop: 20, color: GOLD }}>{vs(home)} {f.opp}</div>
      <div style={{ display: "flex", gap: 40, marginTop: 20, fontFamily: O, fontSize: 30, letterSpacing: 4, textTransform: "uppercase" }}><span>{f.dateLine}</span><span>{f.time}</span><span style={{ opacity: 0.7 }}>{f.venue}</span></div>
    </div>
    <img src={LM} alt="" style={{ position: "absolute", top: 50, right: 50, width: 140 }} />
  </Fill>
);

const Ticket = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: `${DEEP} repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 16px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 920, height: 460, background: CREAM, color: MAROON, borderRadius: 20, display: "flex", position: "relative", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", transform: "rotate(-3deg)" }}>
      <div style={{ width: 620, padding: "40px 46px", borderRight: `3px dashed ${MAROON}`, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: O, fontSize: 20, letterSpacing: 8, textTransform: "uppercase" }}>Admit One · Aces Basketball</div>
        <div style={{ fontFamily: A, fontSize: 96, lineHeight: 1, marginTop: 16 }}>GAME DAY</div>
        <div style={{ fontFamily: O, fontSize: 44, textTransform: "uppercase", letterSpacing: 2, marginTop: 8 }}>Lower Merion {vs(home)} {f.opp}</div>
        <Details f={f} color={MAROON} size={22} style={{ marginTop: "auto" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <Logo src={LM} size={120} ring={MAROON} /><div style={{ fontFamily: A, fontSize: 34 }}>{vs(home)}</div><Logo src={oppLogo} size={120} ring={MAROON} fallback={f.opp[0]} />
      </div>
      {[-26, 440].map((y) => <div key={y} style={{ position: "absolute", left: 604, top: y, width: 46, height: 46, borderRadius: "50%", background: DEEP }} />)}
    </div>
  </Fill>
);

const Newspaper = ({ f, photo, focus, zoom, home, longDate }) => (
  <Fill style={{ background: CREAM, color: INK, padding: "56px 64px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `3px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: "12px 0", fontFamily: O, fontSize: 20, letterSpacing: 4, textTransform: "uppercase" }}><span>Lower Merion Aces Basketball</span><span>{longDate}</span></div>
    <div style={{ fontFamily: P, fontWeight: 700, fontSize: 150, lineHeight: 0.95, marginTop: 30, letterSpacing: -3, color: MAROON }}>GAME DAY.</div>
    <div style={{ fontFamily: P, fontStyle: "italic", fontSize: 44, marginTop: 14 }}>Aces {home ? "host" : "visit"} {f.opp}{f.event ? ` · ${f.event}` : ""}</div>
    <div style={{ display: "flex", gap: 36, marginTop: 30 }}>
      <div style={{ width: 560, height: 480, position: "relative", overflow: "hidden", border: `6px solid ${INK}`, flexShrink: 0 }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
        {[["When", `${f.weekday} ${f.dateLine}`], ["Tip-off", f.time], ["Where", f.venue]].map(([k, v]) => <div key={k}><div style={{ fontFamily: O, fontSize: 18, letterSpacing: 5, textTransform: "uppercase", opacity: 0.55 }}>{k}</div><div style={{ fontFamily: P, fontWeight: 700, fontSize: 36, lineHeight: 1.15 }}>{v}</div></div>)}
      </div>
    </div>
  </Fill>
);

const Neon = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: "#07070a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ opacity: 0.3 }} />
    <div style={{ position: "relative", fontFamily: G, fontSize: 190, lineHeight: 1, transform: "rotate(-4deg)", textShadow: "0 0 4px #35d0ff, 0 0 18px #35d0ff, 6px 6px 0 #e3142f, 0 0 50px rgba(227,20,47,0.9)" }}>GAME DAY</div>
    <div style={{ position: "relative", fontFamily: B, fontSize: 120, letterSpacing: 6, marginTop: 60, lineHeight: 1 }}>{vs(home)} {f.opp.toUpperCase()}</div>
    <div style={{ position: "relative", fontFamily: B, fontSize: 60, letterSpacing: 8, marginTop: 20, color: "#35d0ff" }}>{f.weekday} {f.dateLine} · {f.time}</div>
    <Meta style={{ position: "absolute", bottom: 60 }}>{f.venue}</Meta>
  </Fill>
);

const VerticalSplit = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK, display: "flex" }}>
    <div style={{ width: 290, background: MAROON, position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", writingMode: "vertical-rl", fontFamily: A, fontSize: 210, lineHeight: 1, letterSpacing: 6 }}>GAME DAY</div>
      <img src={BULL} alt="" style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", width: 200 }} />
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 44px 46px", background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.88))" }}>
        <div style={{ fontFamily: A, fontSize: 110, lineHeight: 1 }}>{vs(home)} {f.opp.toUpperCase()}</div>
        <Details f={f} style={{ marginTop: 14 }} size={24} />
      </div>
    </div>
  </Fill>
);

const Diagonal = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: MAROON, clipPath: "polygon(0 70%, 100% 34%, 100% 100%, 0 100%)" }} />
    <Fill style={{ background: GOLD, clipPath: "polygon(0 67%, 100% 31%, 100% 34%, 0 70%)" }} />
    <div style={{ position: "absolute", right: 60, bottom: 56, textAlign: "right" }}>
      <div style={{ fontFamily: A, fontSize: 130, lineHeight: 1, color: GOLD }}>GAME DAY</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20, marginTop: 16, fontFamily: A, fontSize: 70 }}><Logo src={LM} size={90} />{vs(home)}<Logo src={oppLogo} size={90} fallback={f.opp[0]} /><Fit max={560} size={70}>{f.opp.toUpperCase()}</Fit></div>
      <Details f={f} style={{ marginTop: 14 }} size={24} />
    </div>
  </Fill>
);

const Minimal = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: "#faf7f1", color: MAROON, padding: "80px 80px 70px" }}>
    <img src={LM} alt="" style={{ width: 110 }} />
    <div style={{ fontFamily: P, fontStyle: "italic", fontSize: 72, marginTop: 70, color: INK }}>Game day.</div>
    <div style={{ fontFamily: O, fontWeight: 300, fontSize: 150, lineHeight: 1, letterSpacing: -4, marginTop: 10, textTransform: "uppercase" }}>{vs(home).toLowerCase()} {f.opp}</div>
    <div style={{ width: 90, height: 3, background: MAROON, margin: "34px 0" }} />
    <div style={{ fontFamily: SS, fontSize: 32, color: INK, lineHeight: 1.6 }}>{f.weekday.charAt(0) + f.weekday.slice(1).toLowerCase()} {f.dateLine} · {f.time}<br /><span style={{ opacity: 0.55, fontSize: 26 }}>{f.venue}</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 70, width: 380, height: 380, overflow: "hidden", borderRadius: 6 }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
  </Fill>
);

const Broadcast = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", top: 40, left: 48, display: "flex", alignItems: "center", gap: 18 }}><Logo src={LM} size={84} ring={GOLD} /><span style={{ fontFamily: A, fontSize: 64, letterSpacing: 4, color: GOLD }}>GAME DAY</span></div>
    <div style={{ position: "absolute", left: 48, right: 48, bottom: 56, display: "flex", height: 150, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 220, background: MAROON, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: A, fontSize: 40, letterSpacing: 3, lineHeight: 1.1 }}>{f.weekday.slice(0, 3)}<span style={{ fontSize: 28, color: GOLD }}>{f.dateLine}</span></div>
      <div style={{ flex: 1, background: "#fff", color: INK, display: "flex", alignItems: "center", padding: "0 30px", gap: 22 }}>
        <span style={{ fontFamily: A, fontSize: 40, opacity: 0.5 }}>{vs(home)}</span>
        <Logo src={oppLogo} size={92} ring="rgba(0,0,0,0.1)" fallback={f.opp[0]} /><Fit max={330} size={46} style={{ fontFamily: O, fontWeight: 700, textTransform: "uppercase" }}>{f.opp}</Fit>
        <span style={{ marginLeft: "auto", fontFamily: A, fontSize: 56, color: MAROON, whiteSpace: "nowrap" }}>{f.time}</span>
      </div>
    </div>
  </Fill>
);

const ScoreboardPreview = ({ f, home, oppLogo, longDate }) => (
  <Fill style={{ background: "radial-gradient(ellipse at 50% 0%, #1b1b22 0%, #050507 70%)", padding: "70px 70px 60px", display: "flex", flexDirection: "column", gap: 26 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: B, fontSize: 110, color: "#ff3b3b", textShadow: "0 0 26px rgba(255,59,59,0.8)", letterSpacing: 8, lineHeight: 1 }}>TIP-OFF</div><div style={{ fontFamily: B, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>{longDate}</div></div>
    {[[home ? oppLogo : LM, home ? f.opp : "Lower Merion", "AWAY"], [home ? LM : oppLogo, home ? "Lower Merion" : f.opp, "HOME"]].map(([lg, n, tag]) => (
      <div key={tag} style={{ display: "flex", alignItems: "center", gap: 36, padding: "30px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
        <Logo src={lg} size={120} fallback={n[0]} /><div style={{ flex: 1, minWidth: 0 }}><Fit max={560} size={84} style={{ fontFamily: B, letterSpacing: 4 }}>{n.toUpperCase()}</Fit></div><div style={{ fontFamily: B, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.4)" }}>{tag}</div>
      </div>
    ))}
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><Fit max={520} size={150} style={{ fontFamily: A, lineHeight: 1, color: "#ffb13b", textShadow: "0 0 30px rgba(255,177,59,0.6)" }}>{f.time}</Fit><Fit max={400} size={24} style={{ fontFamily: O, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>@{f.venue}</Fit></div>
  </Fill>
);

const Polaroid = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: `${MAROON} repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 18px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 760, background: "#fdfcf8", padding: "34px 34px 150px", transform: "rotate(-4deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ width: "100%", height: 680, position: "relative", overflow: "hidden", background: "#222" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, display: "flex", justifyContent: "space-between", alignItems: "baseline", color: INK, fontFamily: M }}><Fit max={540} size={42}>{vs(home)} {f.opp} · {f.time}</Fit><span style={{ fontSize: 30, opacity: 0.6, whiteSpace: "nowrap" }}>{f.dateLine}</span></div>
    </div>
    <div style={{ position: "absolute", top: 80, right: 90, width: 240, height: 240, borderRadius: "50%", background: GOLD, color: DEEP, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: A, fontSize: 60, lineHeight: 1, transform: "rotate(12deg)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", whiteSpace: "pre-line" }}>{"GAME\nDAY"}</div>
  </Fill>
);

const GoldFrame = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: GOLD, padding: 26 }}>
    <div style={{ width: "100%", height: "100%", background: MAROON, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 760, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ flex: 1, padding: "40px 54px", display: "flex", flexDirection: "column", borderTop: `6px solid ${GOLD}` }}>
        <div style={{ fontFamily: B, fontSize: 110, letterSpacing: 8, color: GOLD, lineHeight: 1 }}>GAME DAY</div>
        <div style={{ fontFamily: A, fontSize: 96, lineHeight: 1, marginTop: 10 }}>{vs(home)} {f.opp.toUpperCase()}</div>
        <Details f={f} style={{ marginTop: "auto" }} />
      </div>
    </div>
  </Fill>
);

const CirclePhoto = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 30%, #6b0030 0%, ${INK} 65%)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 60px 56px" }}>
    <div style={{ fontFamily: B, fontSize: 120, letterSpacing: 12, lineHeight: 1 }}>GAME DAY</div>
    <div style={{ width: 560, height: 560, borderRadius: "50%", overflow: "hidden", position: "relative", border: `14px solid ${GOLD}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", marginTop: 30 }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ fontFamily: A, fontSize: 90, lineHeight: 1, marginTop: 36 }}>{vs(home)} {f.opp.toUpperCase()}</div>
    <Details f={f} style={{ marginTop: "auto", textAlign: "center" }} size={24} />
  </Fill>
);

const Comic = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: `${GOLD} radial-gradient(circle, rgba(0,0,0,0.18) 2px, transparent 2.5px) 0 0 / 26px 26px` }}>
    <div style={{ position: "absolute", top: 60, left: 60, right: 60, height: 620, overflow: "hidden", border: `10px solid ${INK}`, transform: "rotate(-2deg)", background: "#000" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ position: "absolute", top: 20, right: 40, background: "#fff", border: `8px solid ${INK}`, borderRadius: "50%", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BG, fontSize: 64, color: MAROON, transform: "rotate(10deg)", textAlign: "center", lineHeight: 1, whiteSpace: "pre-line" }}>{"GAME\nDAY!"}</div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, background: "#fff", border: `10px solid ${INK}`, padding: "30px 40px", color: INK, boxShadow: `18px 18px 0 ${INK}` }}>
      <div style={{ fontFamily: BG, fontSize: 130, lineHeight: 1, color: MAROON, letterSpacing: 4 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <div style={{ fontFamily: BG, fontSize: 48, letterSpacing: 3, marginTop: 6 }}>{f.weekday} {f.dateLine} · {f.time} · {f.venue.toUpperCase()}</div>
    </div>
  </Fill>
);

const Duotone = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: MAROON }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "grayscale(1) contrast(1.15)" }} />
    <Fill style={{ background: MAROON, opacity: 0.72 }} />
    <Fill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
      <div style={{ fontFamily: A, fontSize: 220, lineHeight: 0.95, color: "transparent", WebkitTextStroke: "6px #fff", whiteSpace: "pre-line" }}>{"GAME\nDAY"}</div>
      <div style={{ fontFamily: A, fontSize: 100, lineHeight: 1, marginTop: 40 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <Details f={f} style={{ marginTop: 30, textAlign: "center" }} size={28} />
    </Fill>
  </Fill>
);

const StackedInfo = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 640, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, #0b0b0d 100%)" }} /></div>
    <div style={{ flex: 1, padding: "0 60px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: GOLD }}>Game Day{f.event ? ` · ${f.event}` : ""}</div>
      <div style={{ fontFamily: A, fontSize: 150, lineHeight: 0.95, marginTop: 10 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <div style={{ fontFamily: A, fontSize: 110, lineHeight: 1, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>{f.weekday.slice(0, 3)} {f.dateLine}</div>
      <div style={{ fontFamily: A, fontSize: 110, lineHeight: 1, color: GOLD, marginTop: 6 }}>{f.time}</div>
      <Meta style={{ marginTop: 20 }}>{f.venue}</Meta>
    </div>
  </Fill>
);

const Marquee = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 790, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, margin: 30, border: `6px solid ${GOLD}`, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
      <div style={{ position: "absolute", inset: 12, border: "2px dotted rgba(201,164,74,0.8)", pointerEvents: "none" }} />
      <div style={{ fontFamily: A, fontSize: 100, color: GOLD, letterSpacing: 6, lineHeight: 1 }}>GAME DAY</div>
      <div style={{ fontFamily: A, fontSize: 90, lineHeight: 1, marginTop: 10 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <Details f={f} style={{ marginTop: 14, textAlign: "center" }} size={22} />
    </div>
  </Fill>
);

const BigVS = ({ f, photo, focus, zoom, oppLogo }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "rgba(20,0,8,0.55)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: O, fontSize: 28, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>Game Day</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: A, fontSize: 520, lineHeight: 1, color: "transparent", WebkitTextStroke: "10px rgba(255,255,255,0.9)" }}>VS</div>
    <Logo src={LM} size={300} ring={GOLD} style={{ position: "absolute", left: 60, top: 320 }} />
    <Logo src={oppLogo} size={300} fallback={f.opp[0]} style={{ position: "absolute", right: 60, top: 320 }} />
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ fontFamily: O, fontSize: 40, textTransform: "uppercase", letterSpacing: 2, lineHeight: 1.2 }}>Lower Merion<br /><span style={{ opacity: 0.6 }}>{f.opp}</span></div>
      <Details f={f} style={{ textAlign: "right" }} size={24} />
    </div>
  </Fill>
);

const ScheduleCard = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, background: "#fff", color: INK, borderRadius: 18, padding: "34px 40px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "inline-block", background: MAROON, color: "#fff", fontFamily: O, fontSize: 20, letterSpacing: 5, textTransform: "uppercase", padding: "6px 16px", borderRadius: 6 }}>Next Up</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 20 }}><Logo src={LM} size={110} ring="rgba(0,0,0,0.1)" /><span style={{ fontFamily: A, fontSize: 60, opacity: 0.4 }}>{vs(home)}</span><Logo src={oppLogo} size={110} ring="rgba(0,0,0,0.1)" fallback={f.opp[0]} /><div style={{ fontFamily: A, fontSize: 78, lineHeight: 1, marginLeft: 10 }}>{f.opp.toUpperCase()}</div></div>
      {[["Date", `${f.weekday} ${f.dateLine}`], ["Tip-off", f.time], ["Where", f.venue]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.1)", padding: "14px 0", fontFamily: O, fontSize: 30, textTransform: "uppercase" }}><span style={{ opacity: 0.5, letterSpacing: 4, fontSize: 22 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
    </div>
  </Fill>
);

const TornPaper = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: CREAM, color: MAROON }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 780, overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ position: "absolute", top: 720, left: 0, right: 0, bottom: 0, background: CREAM, clipPath: "polygon(0 40px, 4% 0, 9% 46px, 15% 10px, 21% 50px, 27% 4px, 33% 44px, 40% 12px, 46% 52px, 52% 6px, 58% 46px, 64% 14px, 70% 50px, 77% 2px, 83% 44px, 89% 10px, 95% 48px, 100% 8px, 100% 100%, 0 100%)", padding: "110px 64px 56px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: P, fontStyle: "italic", fontWeight: 700, fontSize: 80, lineHeight: 1 }}>Game day.</div>
      <div style={{ fontFamily: A, fontSize: 130, lineHeight: 1, marginTop: 16 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <Details f={f} color={MAROON} style={{ marginTop: "auto" }} />
    </div>
  </Fill>
);

const StripesBand = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 400, background: INK, borderTop: `16px solid ${GOLD}`, padding: "30px 60px", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -30, height: 14, background: `repeating-linear-gradient(90deg, ${MAROON} 0 40px, transparent 40px 60px)` }} />
      <div style={{ fontFamily: A, fontSize: 100, lineHeight: 1, color: GOLD, letterSpacing: 4 }}>GAME DAY</div>
      <div style={{ fontFamily: A, fontSize: 90, lineHeight: 1, marginTop: 8 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <Details f={f} style={{ marginTop: "auto" }} size={24} />
    </div>
  </Fill>
);

const HomeAway = ({ f, home, oppLogo }) => (
  <Fill style={{ background: home ? MAROON : INK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
    <img src={BULL} alt="" style={{ width: 360, filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))" }} />
    <div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, marginTop: 20, color: GOLD, letterSpacing: 4 }}>{home ? "HOME GAME" : "ROAD GAME"}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30, fontFamily: A, fontSize: 80 }}>{vs(home)} <Logo src={oppLogo} size={120} fallback={f.opp[0]} /> {f.opp.toUpperCase()}</div>
    <Details f={f} style={{ marginTop: 40, textAlign: "center" }} size={28} />
  </Fill>
);

const PackTheGym = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7))" }} />
    <div style={{ position: "absolute", left: 50, right: 50, top: 80, fontFamily: A, fontSize: home ? 240 : 230, lineHeight: 0.88, letterSpacing: -4, whiteSpace: "pre-line" }}>{home ? "PACK\nTHE\nGYM" : "ROAD\nTRIP"}</div>
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, background: MAROON, padding: "28px 40px", borderLeft: `14px solid ${GOLD}` }}>
      <div style={{ fontFamily: A, fontSize: 84, lineHeight: 1 }}>{vs(home)} {f.opp.toUpperCase()}</div>
      <Details f={f} style={{ marginTop: 10 }} size={24} />
    </div>
  </Fill>
);

// ── Batch 2 ─────────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOf = (f, longDate) => { const m = Number(String(f.dateLine).split("/")[0]); return MONTHS[m - 1] || String(longDate).slice(0, 3); };
const dayOf = (f) => String(f.dateLine).split("/")[1] || f.dateLine;
const cap = (w) => (w ? w.charAt(0) + w.slice(1).toLowerCase() : "");
// "night" for 5 PM and later, else "afternoon"/"morning".
const slotOf = (t) => { const m = String(t).match(/(\d+)(?::\d+)?\s*(AM|PM)/i); if (!m) return "night"; let h = Number(m[1]) % 12; if (/pm/i.test(m[2])) h += 12; return h >= 17 ? "night" : h >= 12 ? "afternoon" : "morning"; };
const clock = (t) => String(t).replace(/\s*(AM|PM)/i, "");
const ampm = (t) => ((String(t).match(/AM|PM/i) || [""])[0]).toUpperCase();

// 25. Gym scoreboard before tip: 00-00, clock shows tip-off time.
const GymBoard = ({ f, home, longDate }) => {
  const H = home ? "Lower Merion" : f.opp, V = home ? f.opp : "Lower Merion";
  const led = (c) => ({ fontFamily: B, color: c, textShadow: `0 0 18px ${c}, 0 0 4px ${c}`, lineHeight: 0.9 });
  const Side = ({ tag, name }) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: O, fontSize: 40, letterSpacing: 10 }}>{tag}</div>
      <Fit max={340} size={34} style={{ fontFamily: O, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{name}</Fit>
      <div style={{ marginTop: 18, background: "#050505", border: "4px solid #222", borderRadius: 10, padding: "6px 0", ...led("#ff2d2d"), fontSize: 250 }}>00</div>
    </div>
  );
  return (
    <Fill style={{ background: "radial-gradient(ellipse at 50% 30%, #2a2a30 0%, #0c0c0e 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: A, fontSize: 96, letterSpacing: 12, color: GOLD, marginBottom: 30 }}>GAME DAY</div>
      <div style={{ width: 960, background: "#111114", border: "14px solid #2c2c31", borderRadius: 24, boxShadow: "0 40px 90px rgba(0,0,0,0.7)", overflow: "hidden" }}>
        <div style={{ background: MAROON, padding: "16px 0", textAlign: "center", fontFamily: A, fontSize: 42, letterSpacing: 8 }}>LOWER MERION <span style={{ color: GOLD }}>ACES</span></div>
        <div style={{ display: "flex", gap: 26, padding: "30px 40px 20px" }}>
          <Side tag="HOME" name={H} />
          <div style={{ width: 200, textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontFamily: O, fontSize: 20, letterSpacing: 6, color: "rgba(255,255,255,0.6)" }}>TIP-OFF</div>
            <Fit max={200} size={96} style={{ ...led("#ffb300"), marginTop: 6 }}>{clock(f.time) || "--"}</Fit>
            <div style={{ ...led("#ffb300"), fontSize: 44, marginTop: 6 }}>{ampm(f.time)}</div>
          </div>
          <Side tag="GUEST" name={V} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 46px 28px" }}><Meta style={{ fontSize: 20, opacity: 0.55 }}>{f.weekday} {f.dateLine}</Meta><Fit max={460} size={20} style={{ fontFamily: O, letterSpacing: 5, textTransform: "uppercase", opacity: 0.55 }}>{f.venue}</Fit></div>
      </div>
    </Fill>
  );
};

// 26. Jumbotron LED panel.
const JumbotronGD = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: "#050505", display: "flex", flexDirection: "column" }}>
    <div style={{ height: 740, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, #050505 100%)" }} /></div>
    <div style={{ flex: 1, margin: "0 50px 60px", position: "relative", background: "#0a0a0a", border: "6px solid #1d1d1d", borderRadius: 14, padding: "30px 50px", overflow: "hidden", textAlign: "center" }}>
      <div style={{ fontFamily: B, fontSize: 64, letterSpacing: 16, color: "#ffb300", textShadow: "0 0 20px rgba(255,179,0,0.8)" }}>{slotOf(f.time) === "night" ? "TONIGHT" : f.weekday}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, fontFamily: B, fontSize: 150, lineHeight: 1, color: "#e8e8e8", textShadow: "0 0 18px rgba(255,255,255,0.5)", marginTop: 4 }}>
        <span style={{ color: "#ff3030", textShadow: "0 0 26px rgba(255,48,48,0.9)" }}>LM</span><span style={{ fontSize: 70, opacity: 0.6 }}>{home ? "VS" : "@"}</span><span>{initials(f.opp)}</span>
      </div>
      <Fit max={820} size={40} style={{ fontFamily: B, letterSpacing: 8, color: "#e8e8e8", marginTop: 6 }}>{f.opp.toUpperCase()}</Fit>
      <div style={{ fontFamily: B, fontSize: 80, letterSpacing: 6, color: "#ffb300", textShadow: "0 0 22px rgba(255,179,0,0.8)", marginTop: 10 }}>{f.time}</div>
      <Fill style={{ background: "radial-gradient(circle, rgba(0,0,0,0) 52%, rgba(0,0,0,0.78) 58%) 0 0 / 9px 9px", pointerEvents: "none" }} />
    </div>
    <Meta style={{ position: "absolute", left: 0, right: 0, bottom: 20, textAlign: "center", fontSize: 18, opacity: 0.45 }}>{f.weekday} {f.dateLine} · {f.venue}</Meta>
  </Fill>
);

// 27. Magazine cover.
const MagazineGD = ({ f, photo, focus, zoom, home, longDate }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)" }} />
    <div style={{ position: "absolute", top: 46, left: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}><span>Lower Merion Basketball</span><span>{seasonOf(longDate)} Season</span></div>
    <div style={{ position: "absolute", top: 70, left: 44, fontFamily: P, fontWeight: 700, fontSize: 330, lineHeight: 1, letterSpacing: -10, textShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>Aces</div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 70 }}>
      <div style={{ display: "inline-block", background: GOLD, color: INK, fontFamily: O, fontWeight: 700, fontSize: 24, letterSpacing: 6, padding: "6px 16px", textTransform: "uppercase" }}>Game Day</div>
      <Fit max={960} size={120} style={{ fontFamily: A, lineHeight: 1, marginTop: 14, textTransform: "uppercase" }}>{vs(home)} {f.opp}</Fit>
      <Fit max={960} size={50} style={{ fontFamily: P, fontStyle: "italic", marginTop: 10 }}>{cap(f.weekday)} {slotOf(f.time)} · tip-off {f.time}</Fit>
      {f.event && <Fit max={960} size={28} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginTop: 14 }}>{f.event}</Fit>}
      <Meta style={{ marginTop: 14, fontSize: 18, opacity: 0.6 }}>{f.dateLine} · {f.venue}</Meta>
    </div>
  </Fill>
);

// 28. Swiss grid: the date as the hero.
const SwissGD = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: "#f3f1ec", color: INK }}>
    <Fill style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "90px 90px" }} />
    <div style={{ position: "absolute", left: 90, top: 90, width: 18, height: 900, background: MAROON }} />
    <div style={{ position: "absolute", left: 140, top: 80, fontFamily: O, fontWeight: 600, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: MAROON }}>Game Day</div>
    <div style={{ position: "absolute", left: 130, top: 120 }}><Fit max={820} size={330} style={{ fontFamily: O, fontWeight: 700, lineHeight: 0.85, letterSpacing: -12 }}>{f.dateLine}</Fit></div>
    <div style={{ position: "absolute", left: 140, top: 430, fontFamily: O, fontWeight: 600, fontSize: 44, letterSpacing: 6, textTransform: "uppercase" }}>{f.weekday} · {f.time}</div>
    <div style={{ position: "absolute", left: 140, top: 520 }}><Fit max={560} size={90} style={{ fontFamily: O, fontWeight: 700, lineHeight: 1, textTransform: "uppercase", color: MAROON }}>{vs(home)} {f.opp}</Fit></div>
    <div style={{ position: "absolute", right: 90, bottom: 90, width: 380, height: 380, overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <img src={LM} alt="" style={{ position: "absolute", right: 90, top: 80, width: 120 }} />
    <div style={{ position: "absolute", left: 140, bottom: 90, width: 420, fontFamily: O, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", lineHeight: 1.7 }}>{f.event || "Lower Merion Aces"}<br /><span style={{ opacity: 0.55 }}>{f.venue}</span></div>
  </Fill>
);

// 29. Tear-off calendar page.
const CalendarPage = ({ f, photo, focus, zoom, home, longDate, oppLogo }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "brightness(0.45) blur(2px)" }} />
    <div style={{ position: "absolute", left: 150, top: 110, width: 780, height: 860, background: "#fdfcf8", color: INK, borderRadius: 18, boxShadow: "0 50px 100px rgba(0,0,0,0.6)", transform: "rotate(-3deg)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: MAROON, color: "#fff", padding: "36px 0 28px", textAlign: "center", position: "relative", borderRadius: "18px 18px 0 0" }}>
        {[200, 560].map((x) => <div key={x} style={{ position: "absolute", top: -14, left: x, width: 24, height: 50, borderRadius: 12, background: "#2b2b30", boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.4)" }} />)}
        <div style={{ fontFamily: A, fontSize: 70, letterSpacing: 10, textTransform: "uppercase" }}>{monthOf(f, longDate)}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: O, fontSize: 40, letterSpacing: 12, textTransform: "uppercase", color: MAROON }}>{f.weekday}</div>
        <div style={{ fontFamily: A, fontSize: 340, lineHeight: 0.95 }}>{dayOf(f)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10 }}><Logo src={LM} size={80} ring="rgba(0,0,0,0.12)" /><Fit max={460} size={50} style={{ fontFamily: A, textTransform: "uppercase" }}>{vs(home)} {f.opp}</Fit><Logo src={oppLogo} size={80} ring="rgba(0,0,0,0.12)" fallback={f.opp[0]} /></div>
        <Fit max={680} size={30} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", marginTop: 18, opacity: 0.65 }}>{f.time} · {f.venue}</Fit>
      </div>
      <div style={{ background: GOLD, color: DEEP, textAlign: "center", padding: "14px 0", fontFamily: A, fontSize: 40, letterSpacing: 12, borderRadius: "0 0 18px 18px" }}>GAME DAY</div>
    </div>
  </Fill>
);

// 30. Boarding pass (road trips read best, works for home too).
const BoardingPass = ({ f, home, longDate }) => (
  <Fill style={{ background: `linear-gradient(160deg, ${MAROON}, ${DEEP})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 960, display: "flex", filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.5))", transform: "rotate(-3deg)" }}>
      <div style={{ flex: 1, background: "#fff", color: INK, borderRadius: "22px 0 0 22px", overflow: "hidden" }}>
        <div style={{ background: INK, color: "#fff", padding: "20px 34px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: A, fontSize: 40, letterSpacing: 4 }}>ACES <span style={{ color: GOLD }}>AIR</span></span><span style={{ fontFamily: O, fontSize: 20, letterSpacing: 6 }}>{home ? "HOME GAME" : "ROAD TRIP"} · GAME DAY</span></div>
        <div style={{ padding: "30px 34px", display: "flex", alignItems: "center", gap: 26 }}>
          <div><div style={{ fontFamily: O, fontSize: 18, letterSpacing: 5, opacity: 0.5 }}>FROM</div><div style={{ fontFamily: A, fontSize: 110, lineHeight: 1 }}>LM</div><div style={{ fontFamily: O, fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>Lower Merion</div></div>
          <div style={{ flex: 1, height: 3, background: `repeating-linear-gradient(90deg, ${MAROON} 0 14px, transparent 14px 26px)`, position: "relative" }}><div style={{ position: "absolute", left: "50%", top: -26, transform: "translateX(-50%)", fontFamily: A, fontSize: 40, color: MAROON }}>{vs(home)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: O, fontSize: 18, letterSpacing: 5, opacity: 0.5 }}>TO</div><div style={{ fontFamily: A, fontSize: 110, lineHeight: 1 }}>{initials(f.opp)}</div><Fit max={260} size={20} style={{ fontFamily: O, letterSpacing: 3, textTransform: "uppercase" }}>{f.opp}</Fit></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.6fr", gap: 20, padding: "0 34px 30px" }}>
          {[["Date", `${f.weekday.slice(0, 3)} ${f.dateLine}`], ["Tip-off", f.time], ["Gate", f.venue]].map(([k, v]) => (
            <div key={k}><div style={{ fontFamily: O, fontSize: 16, letterSpacing: 5, opacity: 0.5, textTransform: "uppercase" }}>{k}</div><Fit max={k === "Gate" ? 300 : 190} size={34} style={{ fontFamily: A, textTransform: "uppercase", marginTop: 2 }}>{v}</Fit></div>
          ))}
        </div>
      </div>
      <div style={{ width: 0, borderLeft: `5px dashed ${DEEP}`, background: "#fff" }} />
      <div style={{ width: 200, background: "#f4ecdc", color: INK, borderRadius: "0 22px 22px 0", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
        <img src={LM} alt="" style={{ width: 110 }} />
        <div style={{ fontFamily: A, fontSize: 30, letterSpacing: 4, textAlign: "center", lineHeight: 1.1 }}>SEAT<br /><span style={{ fontSize: 64, color: MAROON }}>FAN</span></div>
        <div style={{ width: "100%", height: 70, background: "repeating-linear-gradient(90deg, #111 0 3px, transparent 3px 6px, #111 6px 7px, transparent 7px 11px)" }} />
      </div>
    </div>
    <Meta style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", fontSize: 20 }}>{f.event || `${seasonOf(longDate)} Lower Merion Aces Basketball`}</Meta>
  </Fill>
);

// 31. Film strip.
const FilmStripGD = ({ f, photo, focus, zoom, home }) => {
  const holes = "repeating-linear-gradient(180deg, transparent 0 18px, #e9e4d8 18px 46px, transparent 46px 64px)";
  return (
    <Fill style={{ background: "#0d0d0f" }}>
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", fontFamily: O, fontSize: 26, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>Game Day · {f.weekday} {f.dateLine}</div>
      <div style={{ position: "absolute", top: 110, left: 140, width: 800, height: 820, background: "#000", padding: "20px 70px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20, transform: "rotate(2deg)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 26, background: holes }} />
        <div style={{ position: "absolute", right: 22, top: 0, bottom: 0, width: 26, background: holes }} />
        {[18, 50, 82].map((y, i) => <div key={i} style={{ flex: 1, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={{ x: focus.x, y }} zoom={zoom * (i === 1 ? 1 : 1.5)} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 70, textAlign: "center" }}>
        <Fit max={960} size={130} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{vs(home)} {f.opp}</Fit>
        <Fit max={960} size={34} style={{ fontFamily: O, textTransform: "uppercase", letterSpacing: 5, marginTop: 10, opacity: 0.8 }}>{f.time} · {f.venue}</Fit>
      </div>
    </Fill>
  );
};

// 32. TV "Up Next" lower third.
const UpNext = ({ f, photo, focus, zoom, home, recLine }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    <div style={{ position: "absolute", top: 50, left: 50, display: "flex", alignItems: "center", gap: 14, background: "#d6001c", padding: "10px 22px", fontFamily: O, fontWeight: 700, fontSize: 30, letterSpacing: 5 }}><span style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />UP NEXT</div>
    <div style={{ position: "absolute", top: 40, right: 50 }}><Logo src={LM} size={110} /></div>
    <div style={{ position: "absolute", left: 50, right: 50, bottom: 60, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ background: MAROON, padding: "0 26px", display: "flex", alignItems: "center", fontFamily: A, fontSize: 40, letterSpacing: 3 }}>ACES</div>
        <div style={{ flex: 1, background: "#fff", color: INK, padding: "16px 26px", minWidth: 0 }}>
          <Fit max={790} size={64} style={{ fontFamily: A, lineHeight: 1.05, textTransform: "uppercase" }}>Lower Merion {vs(home).toLowerCase() === "vs" ? "vs" : "at"} {f.opp}</Fit>
          <div style={{ fontFamily: A, fontSize: 70, lineHeight: 1, color: MAROON, marginTop: 6 }}>{f.weekday.slice(0, 3)} {f.dateLine} · {f.time}</div>
        </div>
      </div>
      <div style={{ background: "#14141a", padding: "12px 26px" }}><Fit max={920} size={24} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>{[f.event, f.venue, `Aces ${recLine} on the season`].filter(Boolean).join("  ·  ")}</Fit></div>
    </div>
  </Fill>
);

// 33. Center court matchup.
const CenterCourtGD = ({ f, home, oppLogo }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 50%, #a1063f 0%, ${MAROON} 45%, ${DEEP} 100%)` }}>
    <svg viewBox="0 0 1080 1080" style={{ position: "absolute", inset: 0 }} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6">
      <rect x="40" y="140" width="1000" height="800" /><line x1="540" y1="140" x2="540" y2="940" /><circle cx="540" cy="540" r="150" />
      <rect x="40" y="380" width="230" height="320" /><circle cx="270" cy="540" r="110" /><rect x="810" y="380" width="230" height="320" /><circle cx="810" cy="540" r="110" />
      <path d="M40 200 L120 200 A380 380 0 0 1 120 880 L40 880" /><path d="M1040 200 L960 200 A380 380 0 0 0 960 880 L1040 880" />
    </svg>
    <div style={{ position: "absolute", top: 36, left: 0, right: 0, textAlign: "center", fontFamily: A, fontSize: 80, letterSpacing: 14, color: GOLD }}>GAME DAY</div>
    <div style={{ position: "absolute", left: 140, top: 330 }}><Logo src={LM} size={250} ring={GOLD} /></div>
    <div style={{ position: "absolute", left: 690, top: 330 }}><Logo src={oppLogo} size={250} fallback={f.opp[0]} /></div>
    <div style={{ position: "absolute", left: 480, top: 420, width: 120, textAlign: "center", fontFamily: A, fontSize: 64 }}>{vs(home)}</div>
    <div style={{ position: "absolute", left: 80, right: 80, top: 720, textAlign: "center" }}><Fit max={920} size={60} style={{ fontFamily: A, letterSpacing: 2, textTransform: "uppercase" }}>Lower Merion {vs(home)} {f.opp}</Fit></div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 40, textAlign: "center" }}><Fit max={960} size={28} style={{ fontFamily: O, letterSpacing: 6, textTransform: "uppercase" }}>{f.weekday} {f.dateLine} · {f.time} · {f.venue}</Fit></div>
  </Fill>
);

// 34. Black and gold.
const BlackGoldGD = ({ f, home, longDate }) => (
  <Fill style={{ background: "#08080a", textAlign: "center" }}>
    <div style={{ position: "absolute", inset: 40, border: `2px solid ${GOLD}` }} />
    <div style={{ position: "absolute", inset: 54, border: "1px solid rgba(201,164,74,0.5)" }} />
    <img src={LM} alt="" style={{ position: "absolute", top: 96, left: 450, width: 180 }} />
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, fontFamily: P, fontStyle: "italic", fontSize: 110, color: GOLD }}>Game Day</div>
    <div style={{ position: "absolute", top: 450, left: 110, right: 110 }}><Fit max={860} size={120} style={{ fontFamily: P, fontWeight: 700, lineHeight: 1 }}>{home ? "vs." : "at"} {f.opp}</Fit></div>
    <div style={{ position: "absolute", top: 640, left: 460, width: 160, height: 2, background: GOLD }} />
    <div style={{ position: "absolute", top: 680, left: 0, right: 0, fontFamily: O, fontSize: 40, letterSpacing: 10, textTransform: "uppercase" }}>{f.weekday} {f.dateLine}</div>
    <div style={{ position: "absolute", top: 750, left: 0, right: 0, fontFamily: P, fontSize: 64, color: GOLD }}>{f.time}</div>
    <div style={{ position: "absolute", top: 860, left: 120, right: 120 }}><Fit max={840} size={22} style={{ fontFamily: O, letterSpacing: 7, textTransform: "uppercase", opacity: 0.6 }}>{f.venue}{f.event ? ` · ${f.event}` : ""}</Fit></div>
  </Fill>
);

// 35. Tile grid.
const TileGridGD = ({ f, photo, focus, zoom, home, oppLogo }) => (
  <Fill style={{ background: "#0b0b0d", padding: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "440px 1fr", gap: 20, boxSizing: "border-box" }}>
    <div style={{ background: MAROON, padding: "34px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 8, color: GOLD, textTransform: "uppercase" }}>Game Day</div>
      <div><div style={{ fontFamily: O, fontSize: 34, letterSpacing: 6, textTransform: "uppercase" }}>{f.weekday}</div><div style={{ fontFamily: A, fontSize: 150, lineHeight: 1 }}>{f.dateLine}</div></div>
      <div style={{ fontFamily: A, fontSize: 56, color: GOLD }}>{f.time}</div>
    </div>
    <div style={{ background: "#16161a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}><Logo src={LM} size={140} ring={GOLD} /><span style={{ fontFamily: A, fontSize: 44, opacity: 0.5 }}>{vs(home)}</span><Logo src={oppLogo} size={140} fallback={f.opp[0]} /></div>
      <Fit max={420} size={34} style={{ fontFamily: A, letterSpacing: 2, textTransform: "uppercase" }}>{f.opp}</Fit>
    </div>
    <div style={{ gridColumn: "1 / span 2", position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><div style={{ position: "absolute", left: 30, bottom: 24 }}><Fit max={900} size={24} style={{ fontFamily: O, letterSpacing: 5, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>@ {f.venue}{f.event ? ` · ${f.event}` : ""}</Fit></div></div>
  </Fill>
);

// 36. Gold seal medallion.
const SealGD = ({ f, photo, focus, zoom, home, longDate }) => {
  const ring = `LOWER MERION ACES  •  ${seasonOf(longDate)}  •  GAME DAY  •  `;
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "brightness(0.5)" }} />
      <div style={{ position: "absolute", left: 200, top: 130, width: 680, height: 680, borderRadius: "50%", background: `conic-gradient(from 200deg, #f3dc94, ${GOLD}, #8a6a22, ${GOLD}, #f3dc94)`, boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>
        <svg viewBox="0 0 680 680" style={{ position: "absolute", inset: 0 }}>
          <defs><path id="gdSealRing" d="M340,340 m-282,0 a282,282 0 1,1 564,0 a282,282 0 1,1 -564,0" /></defs>
          <text style={{ fontFamily: O, fontSize: 38, fontWeight: 700 }} fill={DEEP}><textPath href="#gdSealRing" textLength={1760} lengthAdjust="spacing">{ring}</textPath></text>
        </svg>
        <div style={{ position: "absolute", inset: 84, borderRadius: "50%", background: `radial-gradient(circle at 50% 35%, #a1063f, ${DEEP})`, border: `6px solid ${DEEP}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <img src={LM} alt="" style={{ width: 150 }} />
          <div style={{ fontFamily: A, fontSize: 60, letterSpacing: 4, color: GOLD, marginTop: 6 }}>{vs(home)}</div>
          <Fit max={400} size={64} style={{ fontFamily: A, textTransform: "uppercase", lineHeight: 1 }}>{f.opp}</Fit>
          <div style={{ fontFamily: O, fontSize: 30, letterSpacing: 5, marginTop: 12 }}>{f.time}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 60, right: 60, textAlign: "center" }}><Fit max={960} size={26} style={{ fontFamily: O, letterSpacing: 6, textTransform: "uppercase" }}>{f.weekday} {f.dateLine} · {f.venue}</Fit></div>
    </Fill>
  );
};

// 37. Big outline date over the photo.
const BigDate = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)" }} />
    <div style={{ position: "absolute", top: 50, left: 60, fontFamily: A, fontSize: 60, letterSpacing: 6, color: GOLD }}>GAME DAY</div>
    <img src={LM} alt="" style={{ position: "absolute", top: 40, right: 60, width: 120 }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, textAlign: "center" }}><Fit max={1000} size={420} style={{ fontFamily: A, lineHeight: 1, color: "transparent", WebkitTextStroke: "6px #fff" }}>{f.dateLine}</Fit></div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60 }}>
      <div style={{ fontFamily: O, fontSize: 34, letterSpacing: 10, textTransform: "uppercase" }}>{f.weekday} · {f.time}</div>
      <Fit max={960} size={96} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase", marginTop: 6 }}>{vs(home)} {f.opp}</Fit>
      <Fit max={960} size={22} style={{ fontFamily: O, letterSpacing: 5, textTransform: "uppercase", opacity: 0.7, marginTop: 8 }}>{f.venue}{f.event ? ` · ${f.event}` : ""}</Fit>
    </div>
  </Fill>
);

// 38. Editorial preview with an auto-written sentence.
const EditorialGD = ({ f, photo, focus, zoom, home, recLine }) => (
  <Fill style={{ background: CREAM, color: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 760, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
    <div style={{ flex: 1, padding: "40px 64px 50px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: MAROON }}><span>Game Day</span><span>{f.weekday} {f.dateLine}</span></div>
      <div style={{ fontFamily: P, fontWeight: 700, fontSize: 74, lineHeight: 1.08, marginTop: 16, letterSpacing: -1 }}>Aces {home ? "host" : "visit"} {f.opp} {cap(f.weekday)} {slotOf(f.time)}</div>
      <div style={{ fontFamily: SS, fontSize: 30, lineHeight: 1.45, marginTop: 18, color: "rgba(11,11,13,0.72)" }}>Tip-off is {f.time} at {f.venue}.{f.event ? ` ${f.event}.` : ""} Lower Merion is {recLine} on the season.</div>
      <div style={{ marginTop: "auto", borderTop: `2px solid ${INK}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: O, fontSize: 20, letterSpacing: 5, textTransform: "uppercase" }}>Lower Merion Aces Basketball</span><img src={LM} alt="" style={{ height: 54 }} />
      </div>
    </div>
  </Fill>
);

export const GAME_DAY_LAYOUTS = [
  { id: "tape-classic", name: "Tape Classic (IG)", w: PW, h: PH, Comp: TapeClassic },
  { id: "bulldog-banner", name: "Bulldog Banner", w: PW, h: PH, Comp: BulldogBanner },
  { id: "gd-matchup", name: "Matchup Logos", w: S, h: S, Comp: MatchupLogos },
  { id: "tonight", name: "Tonight", w: PW, h: PH, Comp: Tonight },
  { id: "ticket", name: "Ticket Stub", w: S, h: S, Comp: Ticket, noPhoto: true },
  { id: "gd-news", name: "Newspaper", w: S, h: S, Comp: Newspaper },
  { id: "gd-neon", name: "Neon", w: PW, h: PH, Comp: Neon },
  { id: "gd-vsplit", name: "Vertical Split", w: PW, h: PH, Comp: VerticalSplit },
  { id: "gd-diagonal", name: "Diagonal", w: S, h: S, Comp: Diagonal },
  { id: "gd-minimal", name: "Minimal", w: PW, h: PH, Comp: Minimal },
  { id: "gd-broadcast", name: "Broadcast Bug", w: S, h: S, Comp: Broadcast },
  { id: "gd-scoreboard", name: "Scoreboard", w: S, h: S, Comp: ScoreboardPreview, noPhoto: true },
  { id: "gd-polaroid", name: "Polaroid", w: S, h: S, Comp: Polaroid },
  { id: "gd-goldframe", name: "Gold Frame", w: PW, h: PH, Comp: GoldFrame },
  { id: "gd-circle", name: "Circle Photo", w: PW, h: PH, Comp: CirclePhoto },
  { id: "gd-duotone", name: "Duotone Outline", w: PW, h: PH, Comp: Duotone },
  { id: "gd-stacked", name: "Stacked Info", w: PW, h: PH, Comp: StackedInfo },
  { id: "gd-marquee", name: "Marquee", w: PW, h: PH, Comp: Marquee },
  { id: "gd-bigvs", name: "Big VS", w: S, h: S, Comp: BigVS },
  { id: "gd-card", name: "Next Up Card", w: PW, h: PH, Comp: ScheduleCard },
  { id: "gd-torn", name: "Torn Paper", w: PW, h: PH, Comp: TornPaper },
  { id: "gd-stripes", name: "Gold Band", w: S, h: S, Comp: StripesBand },
  { id: "gd-homeaway", name: "Home / Road", w: S, h: S, Comp: HomeAway, noPhoto: true },
  { id: "gd-pack", name: "Pack the Gym", w: PW, h: PH, Comp: PackTheGym },
  // batch 2
  { id: "gd-gymboard", name: "Gym Scoreboard", w: S, h: S, Comp: GymBoard, noPhoto: true },
  { id: "gd-jumbotron", name: "Jumbotron", w: PW, h: PH, Comp: JumbotronGD },
  { id: "gd-magazine", name: "Magazine Cover", w: PW, h: PH, Comp: MagazineGD },
  { id: "gd-swiss", name: "Swiss Grid", w: S, h: S, Comp: SwissGD },
  { id: "gd-calendar", name: "Calendar Page", w: S, h: S, Comp: CalendarPage },
  { id: "gd-boarding", name: "Boarding Pass", w: S, h: S, Comp: BoardingPass, noPhoto: true },
  { id: "gd-film", name: "Film Strip", w: PW, h: PH, Comp: FilmStripGD },
  { id: "gd-upnext", name: "Up Next (TV)", w: S, h: S, Comp: UpNext },
  { id: "gd-court", name: "Center Court", w: S, h: S, Comp: CenterCourtGD, noPhoto: true },
  { id: "gd-blackgold", name: "Black & Gold", w: S, h: S, Comp: BlackGoldGD, noPhoto: true },
  { id: "gd-tiles", name: "Tile Grid", w: S, h: S, Comp: TileGridGD },
  { id: "gd-seal", name: "Gold Seal", w: S, h: S, Comp: SealGD },
  { id: "gd-bigdate", name: "Big Date", w: PW, h: PH, Comp: BigDate },
  { id: "gd-editorial", name: "Editorial Preview", w: PW, h: PH, Comp: EditorialGD },
];
