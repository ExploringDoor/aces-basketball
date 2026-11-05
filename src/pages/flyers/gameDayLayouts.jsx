// pages/flyers/gameDayLayouts.jsx
// 25 Game Day layouts for the Flyer Studio. Same contract as finalLayouts:
// each renders inside a fixed W×H board owned by the page. Props:
//   f { opp, weekday, dateLine, time, venue, event }, photo, focus, zoom,
//   oppLogo, longDate, home (true = Aces host)
import { S, PW, PH, MAROON, DEEP, GOLD, CREAM, INK, A, O, P, M, G, B, BG, SS, LM, BULL, Photo, Fill, Logo, Meta, Tape } from "./finalLayouts";

const vs = (home) => (home ? "VS" : "@");
const Strip = ({ style, lines, size, align = "left" }) => (
  <div style={{ position: "absolute", ...style, background: "#0a0a0a", padding: "12px 28px 16px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", textAlign: align, fontFamily: M }}>
    {lines.map((l, i) => <div key={i} style={{ fontSize: size, lineHeight: 1.05, color: "#fff", whiteSpace: "nowrap" }}>{l}</div>)}
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
      <Strip style={{ left: 40, bottom: stripBottom, transform: "rotate(-5deg)" }} lines={[f.weekday, f.dateLine]} size={70} />
      <Strip style={{ right: 40, bottom: stripBottom + 10, transform: "rotate(4deg)" }} lines={["VS.", f.opp.toUpperCase()]} size={oppSize} align="right" />
      {f.event && <Strip style={{ left: "50%", bottom: 118, transform: "translateX(-50%) rotate(-3deg)" }} lines={[f.event.toUpperCase()]} size={f.event.length > 18 ? 54 : 70} />}
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
      <div><div style={{ fontFamily: A, fontSize: 96, lineHeight: 1 }}>{vs(home)} {f.opp.toUpperCase()}</div><Details f={f} style={{ marginTop: 12 }} /></div>
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
    <Fill style={{ background: MAROON, clipPath: "polygon(0 100%, 100% 42%, 100% 100%)" }} />
    <Fill style={{ background: GOLD, clipPath: "polygon(0 100%, 100% 42%, 100% 45%, 0 103%)" }} />
    <div style={{ position: "absolute", right: 60, bottom: 56, textAlign: "right" }}>
      <div style={{ fontFamily: A, fontSize: 130, lineHeight: 1, color: GOLD }}>GAME DAY</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20, marginTop: 16, fontFamily: A, fontSize: 70 }}><Logo src={LM} size={90} />{vs(home)}<Logo src={oppLogo} size={90} fallback={f.opp[0]} />{f.opp.toUpperCase()}</div>
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
    <div style={{ position: "absolute", top: 44, left: 48, fontFamily: A, fontSize: 64, letterSpacing: 4, color: GOLD }}>GAME DAY</div>
    <div style={{ position: "absolute", left: 48, right: 48, bottom: 56, display: "flex", height: 150, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 220, background: MAROON, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: A, fontSize: 40, letterSpacing: 3, lineHeight: 1.1 }}>{f.weekday.slice(0, 3)}<span style={{ fontSize: 28, color: GOLD }}>{f.dateLine}</span></div>
      <div style={{ flex: 1, background: "#fff", color: INK, display: "flex", alignItems: "center", padding: "0 30px", gap: 22 }}>
        <Logo src={LM} size={92} ring="rgba(0,0,0,0.1)" /><span style={{ fontFamily: O, fontSize: 44, fontWeight: 700, textTransform: "uppercase" }}>LM</span>
        <span style={{ fontFamily: A, fontSize: 40, opacity: 0.5 }}>{vs(home)}</span>
        <Logo src={oppLogo} size={92} ring="rgba(0,0,0,0.1)" fallback={f.opp[0]} /><span style={{ fontFamily: O, fontSize: 44, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.opp}</span>
        <span style={{ marginLeft: "auto", fontFamily: A, fontSize: 60, color: MAROON, whiteSpace: "nowrap" }}>{f.time}</span>
      </div>
    </div>
  </Fill>
);

const ScoreboardPreview = ({ f, home, oppLogo, longDate }) => (
  <Fill style={{ background: "radial-gradient(ellipse at 50% 0%, #1b1b22 0%, #050507 70%)", padding: "70px 70px 60px", display: "flex", flexDirection: "column", gap: 26 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: B, fontSize: 110, color: "#ff3b3b", textShadow: "0 0 26px rgba(255,59,59,0.8)", letterSpacing: 8, lineHeight: 1 }}>TIP-OFF</div><div style={{ fontFamily: B, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>{longDate}</div></div>
    {[[home ? oppLogo : LM, home ? f.opp : "Lower Merion", "AWAY"], [home ? LM : oppLogo, home ? "Lower Merion" : f.opp, "HOME"]].map(([lg, n, tag]) => (
      <div key={tag} style={{ display: "flex", alignItems: "center", gap: 36, padding: "30px 44px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
        <Logo src={lg} size={120} fallback={n[0]} /><div style={{ fontFamily: B, fontSize: 84, letterSpacing: 4, flex: 1 }}>{n.toUpperCase()}</div><div style={{ fontFamily: B, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.4)" }}>{tag}</div>
      </div>
    ))}
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, color: "#ffb13b", textShadow: "0 0 30px rgba(255,177,59,0.6)" }}>{f.time}</div><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>@{f.venue}</div></div>
  </Fill>
);

const Polaroid = ({ f, photo, focus, zoom, home }) => (
  <Fill style={{ background: `${MAROON} repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 18px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 760, background: "#fdfcf8", padding: "34px 34px 150px", transform: "rotate(-4deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ width: "100%", height: 680, position: "relative", overflow: "hidden", background: "#222" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, display: "flex", justifyContent: "space-between", alignItems: "baseline", color: INK, fontFamily: M }}><span style={{ fontSize: 42 }}>{vs(home)} {f.opp} · {f.time}</span><span style={{ fontSize: 30, opacity: 0.6 }}>{f.dateLine}</span></div>
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
];
