// pages/flyers/spotlightLayouts.jsx
// Player Spotlight layouts for the Flyer Studio (Player of the Game, senior
// spotlight, milestones). Same board contract as the other layout files. Props:
//   sp { name, num, pos, grade, kicker, stats, note, showGame }   the player card
//   f  { opp, dateLine, ... }   the selected game (shown only when sp.showGame)
//   photo, focus, zoom, home, longDate
import { S, PW, PH, MAROON, DEEP, GOLD, CREAM, INK, A, O, P, M, B, SS, LM, BULL, Photo, Fill, Logo, Meta, Fit, seasonOf } from "./finalLayouts";

// ── helpers ───────────────────────────────────────────────────────
const LABELS = { PTS: "Points", PT: "Points", REB: "Rebounds", AST: "Assists", STL: "Steals", BLK: "Blocks", "3PM": "Threes", "3S": "Threes", FG: "Field Goals", FT: "Free Throws", TO: "Turnovers", MIN: "Minutes", DEF: "Defense" };
// "31 PTS · 8 REB · 4 AST" -> [{ v: "31", l: "PTS", long: "Points" }, ...]
export const parseStats = (s) => String(s || "").split(/\s*[·,;|\n]\s*/).map((x) => x.trim()).filter(Boolean).slice(0, 4).map((x) => {
  const m = x.match(/^([\d,.%/-]+)\s*(.*)$/);
  const v = m ? m[1] : x, l = m ? m[2].toUpperCase() : "";
  return { v, l, long: LABELS[l] || (l ? l.charAt(0) + l.slice(1).toLowerCase() : "") };
});
const nameParts = (n) => { const w = String(n || "").trim().split(/\s+/).filter(Boolean); if (!w.length) return ["", "Player Name"]; if (w.length === 1) return ["", w[0]]; return [w.slice(0, -1).join(" "), w[w.length - 1]]; };
const GRADE_ABBR = { Senior: "SR", Junior: "JR", Sophomore: "SO", Freshman: "FR" };
const classOf = (grade, longDate) => {
  const add = { Senior: 0, Junior: 1, Sophomore: 2, Freshman: 3 }[grade];
  const sea = seasonOf(longDate); if (add == null || !sea) return "";
  return String(Number(sea.slice(0, 4)) + 1 + add);
};
const metaLine = (sp) => [sp.num !== "" && sp.num != null ? `#${sp.num}` : "", sp.pos, sp.grade].filter(Boolean).join("  ·  ");
const gameLine = (sp, f, home) => (sp.showGame && f.opp ? `${home ? "vs" : "at"} ${f.opp} · ${f.dateLine}` : "");
const kick = (sp) => sp.kicker || "Player Spotlight";
const period = (t) => (t && !/[.!?"]$/.test(t.trim()) ? `${t.trim()}.` : t);
const statLine = (st) => st.map((s) => `${s.v} ${s.l}`.trim()).join("  ·  ");

const StatTiles = ({ st, size = 110, gap = 18, color = "#fff", label = GOLD, bg = "rgba(255,255,255,0.06)", border = "rgba(255,255,255,0.12)" }) => (
  <div style={{ display: "flex", gap }}>
    {st.map((s, i) => (
      <div key={i} style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "14px 10px 12px", textAlign: "center", minWidth: 0 }}>
        <Fit max={210} size={size} style={{ fontFamily: A, lineHeight: 1, color }}>{s.v}</Fit>
        <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: label, marginTop: 6 }}>{s.l || " "}</div>
      </div>
    ))}
  </div>
);

// 1. Big number: giant outline jersey number over the photo.
const BigNumber = ({ sp, f, home, photo, focus, zoom }) => {
  const [first, last] = nameParts(sp.name), st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 50%, rgba(10,0,5,0.92) 100%)" }} />
      {sp.num !== "" && <div style={{ position: "absolute", top: -40, right: 30, fontFamily: A, fontSize: 620, lineHeight: 1, color: "transparent", WebkitTextStroke: "7px rgba(255,255,255,0.85)", textShadow: "0 0 40px rgba(0,0,0,0.25)" }}>{sp.num}</div>}
      <img src={LM} alt="" style={{ position: "absolute", top: 50, left: 60, width: 120 }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60 }}>
        <div style={{ display: "inline-block", background: GOLD, color: INK, fontFamily: O, fontWeight: 700, fontSize: 26, letterSpacing: 7, padding: "6px 16px", textTransform: "uppercase" }}>{kick(sp)}</div>
        {first && <Fit max={960} size={64} style={{ fontFamily: O, textTransform: "uppercase", letterSpacing: 4, marginTop: 10 }}>{first}</Fit>}
        <Fit max={960} size={200} style={{ fontFamily: A, lineHeight: 0.95, textTransform: "uppercase" }}>{last}</Fit>
        <Meta style={{ fontSize: 24, marginTop: 12 }}>{[metaLine(sp), gameLine(sp, f, home)].filter(Boolean).join("  ·  ")}</Meta>
        {st.length > 0 && <div style={{ marginTop: 26 }}><StatTiles st={st} /></div>}
      </div>
    </Fill>
  );
};

// 2. Trading card.
const TradingCard = ({ sp, f, home, photo, focus, zoom, longDate }) => {
  const [first, last] = nameParts(sp.name), st = parseStats(sp.stats);
  return (
    <Fill style={{ background: `${DEEP} repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 20px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 860, height: 1200, background: `linear-gradient(135deg, #f3dc94, ${GOLD} 40%, #8a6a22 70%, ${GOLD})`, borderRadius: 30, padding: 22, boxSizing: "border-box", transform: "rotate(-2deg)", boxShadow: "0 50px 100px rgba(0,0,0,0.6)" }}>
        <div style={{ width: "100%", height: "100%", background: INK, borderRadius: 18, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 880, overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
          <div style={{ position: "absolute", top: 24, left: 24, width: 130, height: 130, borderRadius: "50%", background: MAROON, border: `5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: A, fontSize: 70 }}>{sp.num !== "" ? sp.num : "LM"}</div>
          <div style={{ position: "absolute", top: 30, right: 24, background: "rgba(0,0,0,0.7)", padding: "8px 18px", fontFamily: O, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: GOLD }}>{seasonOf(longDate)}</div>
          <div style={{ position: "absolute", left: -20, right: -20, top: 800, height: 160, background: MAROON, transform: "rotate(-4deg)", borderTop: `6px solid ${GOLD}`, borderBottom: `6px solid ${GOLD}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
            <div style={{ transform: "rotate(4deg)" }}>
              {first && <div style={{ fontFamily: O, fontSize: 30, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>{first}</div>}
              <Fit max={640} size={96} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{last}</Fit>
            </div>
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 34, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 5, textTransform: "uppercase", color: GOLD }}>{[sp.pos, sp.grade].filter(Boolean).join(" · ") || kick(sp)}</div>
              <Fit max={560} size={30} style={{ fontFamily: O, letterSpacing: 3, textTransform: "uppercase", marginTop: 6 }}>{st.length ? statLine(st) : gameLine(sp, f, home) || "Lower Merion Aces"}</Fit>
            </div>
            <img src={LM} alt="" style={{ width: 110, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </Fill>
  );
};

// 3. Player of the Game banner with stat tiles.
const POTG = ({ sp, f, home, photo, focus, zoom }) => {
  const st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 210, background: MAROON, display: "flex", alignItems: "center", gap: 26, padding: "0 50px", borderBottom: `8px solid ${GOLD}` }}>
        <img src={LM} alt="" style={{ height: 140 }} />
        <div style={{ minWidth: 0 }}>
          <Fit max={760} size={84} style={{ fontFamily: A, lineHeight: 1, color: GOLD, textTransform: "uppercase" }}>{kick(sp)}</Fit>
          <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", marginTop: 6 }}>{gameLine(sp, f, home) || "Lower Merion Aces Basketball"}</div>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(11,11,13,0.95) 100%)" }} /></div>
      <div style={{ padding: "0 50px 50px", marginTop: -90, position: "relative" }}>
        <Fit max={980} size={120} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit>
        <Meta style={{ fontSize: 24, marginTop: 8, color: GOLD, opacity: 1 }}>{metaLine(sp)}</Meta>
        {st.length > 0 && <div style={{ marginTop: 24 }}><StatTiles st={st} size={100} /></div>}
      </div>
    </Fill>
  );
};

// 4. Stat column beside the photo.
const StatColumn = ({ sp, f, home, photo, focus, zoom }) => {
  const [first, last] = nameParts(sp.name), st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 300, width: 660, overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 300, width: 420, background: `linear-gradient(180deg, ${MAROON}, ${DEEP})`, padding: "50px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: GOLD }}>{kick(sp)}</div>
        {sp.num !== "" && <div style={{ fontFamily: A, fontSize: 200, lineHeight: 1, marginTop: 10 }}>#{sp.num}</div>}
        <div style={{ marginTop: "auto" }}>
          {st.map((s, i) => (
            <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.2)", padding: "12px 0" }}>
              <Fit max={340} size={110} style={{ fontFamily: A, lineHeight: 1 }}>{s.v}</Fit>
              <div style={{ fontFamily: O, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: GOLD }}>{s.long || s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60 }}>
        {first && <div style={{ fontFamily: O, fontSize: 44, letterSpacing: 6, textTransform: "uppercase", opacity: 0.8 }}>{first}</div>}
        <Fit max={960} size={140} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{last}</Fit>
        <Meta style={{ fontSize: 22, marginTop: 10 }}>{[sp.pos, sp.grade, gameLine(sp, f, home)].filter(Boolean).join("  ·  ")}</Meta>
      </div>
    </Fill>
  );
};

// 5. Magazine cover.
const MagazineSpot = ({ sp, f, home, photo, focus, zoom, longDate }) => {
  const st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)" }} />
      <div style={{ position: "absolute", top: 46, left: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 22, letterSpacing: 6, textTransform: "uppercase" }}><span>Lower Merion Basketball</span><span>{seasonOf(longDate)} Season</span></div>
      <div style={{ position: "absolute", top: 70, left: 44, fontFamily: P, fontWeight: 700, fontSize: 330, lineHeight: 1, letterSpacing: -10, textShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>Aces</div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 70 }}>
        <div style={{ display: "inline-block", background: GOLD, color: INK, fontFamily: O, fontWeight: 700, fontSize: 24, letterSpacing: 6, padding: "6px 16px", textTransform: "uppercase" }}>{kick(sp)}</div>
        <Fit max={960} size={140} style={{ fontFamily: A, lineHeight: 1, marginTop: 14, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit>
        {(sp.note || st.length > 0) && <Fit max={960} size={48} style={{ fontFamily: P, fontStyle: "italic", marginTop: 10 }}>{sp.note || statLine(st)}</Fit>}
        {sp.note && st.length > 0 && <Fit max={960} size={30} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginTop: 12 }}>{statLine(st)}</Fit>}
        <Meta style={{ marginTop: 14, fontSize: 18, opacity: 0.6 }}>{[metaLine(sp), gameLine(sp, f, home)].filter(Boolean).join("  ·  ")}</Meta>
      </div>
    </Fill>
  );
};

// 6. TV lower third.
const LowerThird = ({ sp, f, home, photo, focus, zoom }) => {
  const st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <div style={{ position: "absolute", top: 40, right: 50 }}><Logo src={LM} size={110} /></div>
      <div style={{ position: "absolute", top: 50, left: 50, background: MAROON, padding: "10px 22px", fontFamily: O, fontWeight: 700, fontSize: 28, letterSpacing: 5, textTransform: "uppercase", borderLeft: `8px solid ${GOLD}` }}>{kick(sp)}</div>
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 60, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ background: MAROON, width: 170, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: A, fontSize: 90 }}>{sp.num !== "" ? sp.num : "LM"}</div>
          <div style={{ flex: 1, background: "#fff", color: INK, padding: "16px 26px", minWidth: 0 }}>
            <Fit max={720} size={76} style={{ fontFamily: A, lineHeight: 1.05, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit>
            <div style={{ fontFamily: O, fontSize: 28, letterSpacing: 5, textTransform: "uppercase", color: MAROON, marginTop: 4 }}>{[GRADE_ABBR[sp.grade] || sp.grade, sp.pos].filter(Boolean).join(" · ") || "Lower Merion Aces"}</div>
          </div>
        </div>
        <div style={{ background: "#14141a", padding: "14px 26px" }}>
          <Fit max={920} size={34} style={{ fontFamily: A, letterSpacing: 3, textTransform: "uppercase" }}>{[sp.showGame && f.opp ? `${home ? "vs" : "at"} ${f.opp}` : "", st.length ? statLine(st) : sp.note].filter(Boolean).join(":  ") || "Lower Merion Aces Basketball"}</Fit>
        </div>
      </div>
    </Fill>
  );
};

// 7. Editorial profile with an auto-written line.
const EditorialSpot = ({ sp, f, home, photo, focus, zoom }) => {
  const [, last] = nameParts(sp.name), st = parseStats(sp.stats);
  const auto = st.length ? `${last} finished with ${st.map((s) => `${s.v} ${(s.long || s.l).toLowerCase()}`).join(", ")}${sp.showGame && f.opp ? ` ${home ? "against" : "at"} ${f.opp}` : ""}.` : "";
  return (
    <Fill style={{ background: CREAM, color: INK, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 760, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ flex: 1, padding: "40px 64px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: O, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: MAROON }}><span>{kick(sp)}</span><span>{metaLine(sp)}</span></div>
        <Fit max={950} size={96} style={{ fontFamily: P, fontWeight: 700, lineHeight: 1.05, marginTop: 14, letterSpacing: -1 }}>{sp.name || "Player Name"}</Fit>
        <div style={{ fontFamily: SS, fontSize: 32, lineHeight: 1.45, marginTop: 16, color: "rgba(11,11,13,0.75)" }}>{sp.note ? <span style={{ fontFamily: P, fontStyle: "italic" }}>"{period(sp.note)}"</span> : null}{sp.note && auto ? " " : ""}{auto}</div>
        <div style={{ marginTop: "auto", borderTop: `2px solid ${INK}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: O, fontSize: 20, letterSpacing: 5, textTransform: "uppercase" }}>Lower Merion Aces Basketball</span><img src={LM} alt="" style={{ height: 54 }} />
        </div>
      </div>
    </Fill>
  );
};

// 8. Black and gold with a round portrait.
const BlackGoldSpot = ({ sp, photo, focus, zoom }) => {
  const st = parseStats(sp.stats);
  return (
    <Fill style={{ background: "#08080a", textAlign: "center" }}>
      <div style={{ position: "absolute", inset: 40, border: `2px solid ${GOLD}` }} />
      <div style={{ position: "absolute", inset: 54, border: "1px solid rgba(201,164,74,0.5)" }} />
      <div style={{ position: "absolute", top: 100, left: 340, width: 400, height: 400, borderRadius: "50%", overflow: "hidden", border: `6px solid ${GOLD}` }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ position: "absolute", top: 530, left: 0, right: 0, fontFamily: P, fontStyle: "italic", fontSize: 66, color: GOLD }}>{kick(sp)}</div>
      <div style={{ position: "absolute", top: 630, left: 110, right: 110 }}><Fit max={860} size={110} style={{ fontFamily: P, fontWeight: 700, lineHeight: 1 }}>{sp.name || "Player Name"}</Fit></div>
      <div style={{ position: "absolute", top: 770, left: 460, width: 160, height: 2, background: GOLD }} />
      <div style={{ position: "absolute", top: 800, left: 0, right: 0, fontFamily: O, fontSize: 30, letterSpacing: 8, textTransform: "uppercase" }}>{metaLine(sp) || "Lower Merion Aces"}</div>
      {st.length > 0 && <div style={{ position: "absolute", top: 870, left: 120, right: 120 }}><Fit max={840} size={44} style={{ fontFamily: P, color: GOLD }}>{statLine(st)}</Fit></div>}
    </Fill>
  );
};

// 9. Diagonal panel with the number.
const DiagonalSpot = ({ sp, f, home, photo, focus, zoom }) => {
  const [first, last] = nameParts(sp.name), st = parseStats(sp.stats);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: MAROON, clipPath: "polygon(0 52%, 100% 74%, 100% 100%, 0 100%)" }} />
      <Fill style={{ background: GOLD, clipPath: "polygon(0 49%, 100% 71%, 100% 74%, 0 52%)" }} />
      <div style={{ position: "absolute", left: 60, top: 40, fontFamily: O, fontSize: 26, letterSpacing: 8, textTransform: "uppercase", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>{kick(sp)}</div>
      <div style={{ position: "absolute", left: 60, bottom: 60, right: 60, display: "flex", alignItems: "flex-end", gap: 30 }}>
        {sp.num !== "" && <div style={{ fontFamily: A, fontSize: 300, lineHeight: 0.8, color: GOLD }}>{sp.num}</div>}
        <div style={{ minWidth: 0, flex: 1 }}>
          {first && <div style={{ fontFamily: O, fontSize: 40, letterSpacing: 6, textTransform: "uppercase" }}>{first}</div>}
          <Fit max={640} size={120} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{last}</Fit>
          <Fit max={640} size={26} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", marginTop: 8, opacity: 0.85 }}>{st.length ? statLine(st) : [sp.pos, sp.grade, gameLine(sp, f, home)].filter(Boolean).join(" · ")}</Fit>
        </div>
      </div>
    </Fill>
  );
};

// 10. Polaroid with a marker caption.
const Polaroid2 = ({ sp, photo, focus, zoom }) => {
  const st = parseStats(sp.stats);
  return (
    <Fill style={{ background: `${MAROON} repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 18px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, background: "#fdfcf8", padding: "34px 34px 150px", transform: "rotate(-4deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)", position: "relative" }}>
        <div style={{ width: "100%", height: 680, position: "relative", overflow: "hidden", background: "#222" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
        <div style={{ position: "absolute", left: 34, right: 34, bottom: 34, color: INK, fontFamily: M }}>
          <Fit max={690} size={50}>{sp.num !== "" ? `#${sp.num} ` : ""}{sp.name || "Player Name"}</Fit>
          {st.length > 0 && <Fit max={690} size={32} style={{ opacity: 0.7, marginTop: 4 }}>{statLine(st)}</Fit>}
        </div>
      </div>
      <div style={{ position: "absolute", top: 80, right: 90, width: 240, height: 240, borderRadius: "50%", background: GOLD, color: DEEP, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 30, boxSizing: "border-box", transform: "rotate(12deg)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
        <div style={{ fontFamily: A, fontSize: 40, lineHeight: 1.05, textTransform: "uppercase" }}>{kick(sp)}</div>
      </div>
    </Fill>
  );
};

// 11. Hero stat: the first stat is the headline.
const HeroStat = ({ sp, f, home, photo, focus, zoom }) => {
  const st = parseStats(sp.stats), hero = st[0], rest = st.slice(1);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "brightness(0.55)" }} />
      <Fill style={{ background: `linear-gradient(180deg, rgba(77,0,32,0.5) 0%, rgba(0,0,0,0) 40%, rgba(10,0,5,0.9) 100%)` }} />
      <div style={{ position: "absolute", top: 50, left: 60, fontFamily: O, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", color: GOLD }}>{kick(sp)}</div>
      <img src={LM} alt="" style={{ position: "absolute", top: 40, right: 60, width: 110 }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 200, textAlign: "center" }}>
        <Fit max={1000} size={520} style={{ fontFamily: A, lineHeight: 1, color: GOLD, textShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>{hero ? hero.v : sp.num !== "" ? `#${sp.num}` : "LM"}</Fit>
        <div style={{ fontFamily: O, fontSize: 56, letterSpacing: 16, textTransform: "uppercase", marginTop: -10 }}>{hero ? hero.long || hero.l : sp.pos || ""}</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, textAlign: "center" }}>
        <Fit max={960} size={110} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit>
        <Fit max={960} size={30} style={{ fontFamily: O, letterSpacing: 5, textTransform: "uppercase", marginTop: 12, opacity: 0.85 }}>{[rest.length ? statLine(rest) : metaLine(sp), gameLine(sp, f, home)].filter(Boolean).join("  ·  ")}</Fit>
      </div>
    </Fill>
  );
};

// 12. Class of: senior night / senior spotlight.
const ClassOf = ({ sp, photo, focus, zoom, longDate }) => {
  const yr = classOf(sp.grade, longDate), st = parseStats(sp.stats);
  return (
    <Fill style={{ background: `radial-gradient(circle at 50% 20%, #a1063f 0%, ${MAROON} 40%, ${DEEP} 100%)`, textAlign: "center" }}>
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, fontFamily: O, fontSize: 28, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>{kick(sp)}</div>
      <div style={{ position: "absolute", top: 120, left: 170, width: 740, height: 660, overflow: "hidden", border: `10px solid ${CREAM}`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      {yr && <div style={{ position: "absolute", top: 820, left: 0, right: 0, fontFamily: P, fontStyle: "italic", fontSize: 96, color: GOLD, textShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>Class of {yr}</div>}
      <div style={{ position: "absolute", top: yr ? 960 : 920, left: 80, right: 80 }}><Fit max={920} size={120} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit></div>
      <div style={{ position: "absolute", top: yr ? 1100 : 1060, left: 80, right: 80 }}><Fit max={920} size={30} style={{ fontFamily: O, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>{[metaLine(sp), st.length ? statLine(st) : ""].filter(Boolean).join("  ·  ")}</Fit></div>
      <img src={LM} alt="" style={{ position: "absolute", bottom: 50, left: 490, width: 100 }} />
    </Fill>
  );
};

// 13. Tile grid.
const TileGridSpot = ({ sp, photo, focus, zoom }) => {
  const st = parseStats(sp.stats), [first, last] = nameParts(sp.name);
  return (
    <Fill style={{ background: "#0b0b0d", padding: 30, display: "grid", gridTemplateColumns: "560px 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 20, boxSizing: "border-box" }}>
      <div style={{ gridRow: "1 / span 3", position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /></div>
      <div style={{ background: MAROON, padding: "24px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: O, fontSize: 20, letterSpacing: 6, color: GOLD, textTransform: "uppercase" }}>{kick(sp)}</div>
        <div style={{ fontFamily: A, fontSize: 150, lineHeight: 0.9 }}>{sp.num !== "" ? `#${sp.num}` : "LM"}</div>
      </div>
      <div style={{ background: "#16161a", padding: "24px 30px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        {first && <div style={{ fontFamily: O, fontSize: 30, letterSpacing: 5, textTransform: "uppercase", opacity: 0.8 }}>{first}</div>}
        <Fit max={380} size={84} style={{ fontFamily: A, lineHeight: 1, textTransform: "uppercase" }}>{last}</Fit>
        <div style={{ fontFamily: O, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: GOLD, marginTop: 8 }}>{[sp.pos, sp.grade].filter(Boolean).join(" · ")}</div>
      </div>
      <div style={{ background: GOLD, color: DEEP, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-around", gap: 10 }}>
        {(st.length ? st.slice(0, 3) : [{ v: "", l: "Lower Merion Aces" }]).map((s, i) => (
          <div key={i} style={{ textAlign: "center", minWidth: 0 }}>
            {s.v && <Fit max={140} size={90} style={{ fontFamily: A, lineHeight: 1 }}>{s.v}</Fit>}
            <div style={{ fontFamily: O, fontSize: s.v ? 20 : 26, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </Fill>
  );
};

// 14. LED stat board.
const LEDBoard = ({ sp, f, home, photo, focus, zoom }) => {
  const st = parseStats(sp.stats);
  const led = (c) => ({ fontFamily: B, color: c, textShadow: `0 0 18px ${c}, 0 0 4px ${c}`, lineHeight: 1 });
  return (
    <Fill style={{ background: "#050505", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 470, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, #050505 100%)" }} /></div>
      <div style={{ flex: 1, margin: "0 50px 50px", position: "relative", background: "#0a0a0a", border: "6px solid #1d1d1d", borderRadius: 14, padding: "24px 44px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Fit max={560} size={60} style={{ ...led("#ffb300"), letterSpacing: 6, textTransform: "uppercase" }}>{sp.name || "Player Name"}</Fit>
          <span style={{ ...led("#ff3030"), fontSize: 70 }}>{sp.num !== "" ? `#${sp.num}` : ""}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: st.length > 2 ? "1fr 1fr" : "1fr", gap: "4px 40px", marginTop: 14 }}>
          {(st.length ? st : [{ v: "", l: kick(sp).toUpperCase() }]).map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ ...led("#e8e8e8"), fontSize: 50, letterSpacing: 6, textShadow: "0 0 14px rgba(255,255,255,0.5)" }}>{s.l}</span>
              <span style={{ ...led("#ff3030"), fontSize: 120 }}>{s.v}</span>
            </div>
          ))}
        </div>
        <Fill style={{ background: "radial-gradient(circle, rgba(0,0,0,0) 52%, rgba(0,0,0,0.78) 58%) 0 0 / 9px 9px", pointerEvents: "none" }} />
      </div>
      <Meta style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontSize: 18, opacity: 0.5 }}>{[kick(sp), gameLine(sp, f, home)].filter(Boolean).join(" · ")}</Meta>
    </Fill>
  );
};

export const SPOTLIGHT_LAYOUTS = [
  { id: "sp-bignum", name: "Big Number", w: PW, h: PH, Comp: BigNumber },
  { id: "sp-potg", name: "Player of the Game", w: PW, h: PH, Comp: POTG },
  { id: "sp-card", name: "Trading Card", w: PW, h: PH, Comp: TradingCard },
  { id: "sp-column", name: "Stat Column", w: PW, h: PH, Comp: StatColumn },
  { id: "sp-hero", name: "Hero Stat", w: PW, h: PH, Comp: HeroStat },
  { id: "sp-magazine", name: "Magazine Cover", w: PW, h: PH, Comp: MagazineSpot },
  { id: "sp-tv", name: "TV Lower Third", w: S, h: S, Comp: LowerThird },
  { id: "sp-editorial", name: "Editorial Profile", w: PW, h: PH, Comp: EditorialSpot },
  { id: "sp-blackgold", name: "Black & Gold", w: S, h: S, Comp: BlackGoldSpot },
  { id: "sp-diagonal", name: "Diagonal", w: S, h: S, Comp: DiagonalSpot },
  { id: "sp-polaroid", name: "Polaroid", w: S, h: S, Comp: Polaroid2 },
  { id: "sp-classof", name: "Class Of", w: PW, h: PH, Comp: ClassOf },
  { id: "sp-tiles", name: "Tile Grid", w: S, h: S, Comp: TileGridSpot },
  { id: "sp-led", name: "LED Stat Board", w: S, h: S, Comp: LEDBoard },
];
