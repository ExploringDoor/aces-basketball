// pages/flyers/scheduleLayouts.jsx
// "This Week" and "Season Schedule" layouts for the Flyer Studio. Both read
// the live schedule, so played games show their result (W 64-58) and the
// season poster doubles as a results tracker. Props:
//   week   { label, title, games: [row], played, total }
//   season { label, months: [{ month, games: [row] }], rows: [row], record }
//   row    { md, wd, opp, home, neutral, time, venue, conf, multi, tag, result, logo }
//   photo, focus, zoom
import { S, PW, PH, MAROON, DEEP, GOLD, CREAM, INK, A, O, P, B, SS, LM, BULL, Photo, Fill, Logo, Meta, Fit, initials } from "./finalLayouts";

const vsAt = (r) => (r.multi ? "" : r.home || r.neutral ? "vs" : "@");
const resultOf = (r) => (r.result ? `${r.result.us > r.result.them ? "W" : "L"} ${r.result.us}-${r.result.them}` : "");
const whenOf = (r) => resultOf(r) || r.time;
const won = (r) => r.result && r.result.us > r.result.them;
const place = (r) => (r.multi ? r.tag || r.venue : r.home ? "Home" : r.neutral ? r.venue : "Away");

// ── THIS WEEK ─────────────────────────────────────────────────────

// 1. Photo header + game rows.
const WeekList = ({ week, photo, focus, zoom }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 520, position: "relative", overflow: "hidden" }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(11,11,13,1) 100%)" }} />
      <img src={LM} alt="" style={{ position: "absolute", top: 40, left: 50, width: 120 }} />
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 10 }}>
        <div style={{ fontFamily: O, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", color: GOLD }}>{week.label}</div>
        <div style={{ fontFamily: A, fontSize: 150, lineHeight: 1, textTransform: "uppercase" }}>{week.title}</div>
      </div>
    </div>
    <div style={{ flex: 1, padding: "20px 50px 50px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
      {week.games.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderLeft: `8px solid ${r.result ? (won(r) ? GOLD : "rgba(255,255,255,0.3)") : MAROON}`, borderRadius: 12, padding: "18px 24px" }}>
          <div style={{ width: 120, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 5, color: GOLD }}>{r.wd}</div>
            <Fit max={120} size={50} style={{ fontFamily: A, lineHeight: 1 }}>{r.md}</Fit>
          </div>
          <Logo src={r.logo} size={90} fallback={r.opp[0]} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Fit max={480} size={52} style={{ fontFamily: A, lineHeight: 1.05, textTransform: "uppercase" }}>{vsAt(r)} {r.opp}</Fit>
            <Fit max={480} size={22} style={{ fontFamily: O, letterSpacing: 4, textTransform: "uppercase", opacity: 0.6, marginTop: 4 }}>{r.multi ? r.venue : r.venue}{r.conf ? " · League" : ""}</Fit>
          </div>
          <div style={{ fontFamily: A, fontSize: 44, color: r.result ? (won(r) ? GOLD : "#fff") : "#fff", whiteSpace: "nowrap" }}>{whenOf(r)}</div>
        </div>
      ))}
    </div>
  </Fill>
);

// 2. Mon to Sun calendar strip.
const WeekStrip = ({ week, photo, focus, zoom }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "brightness(0.35)" }} />
    <div style={{ position: "absolute", top: 60, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><div style={{ fontFamily: O, fontSize: 26, letterSpacing: 10, color: GOLD, textTransform: "uppercase" }}>{week.label}</div><div style={{ fontFamily: A, fontSize: 120, lineHeight: 1, textTransform: "uppercase" }}>{week.title}</div></div>
      <img src={LM} alt="" style={{ width: 130 }} />
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 330, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
      {week.days.map((d, i) => (
        <div key={i} style={{ height: 600, borderRadius: 14, background: d.game ? `linear-gradient(180deg, ${MAROON}, ${DEEP})` : "rgba(255,255,255,0.05)", border: d.game ? `2px solid ${GOLD}` : "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 6px", boxSizing: "border-box", textAlign: "center" }}>
          <div style={{ fontFamily: O, fontSize: 24, letterSpacing: 3, color: d.game ? GOLD : "rgba(255,255,255,0.45)" }}>{d.wd}</div>
          <div style={{ fontFamily: A, fontSize: 64, lineHeight: 1, color: d.game ? "#fff" : "rgba(255,255,255,0.35)" }}>{d.day}</div>
          {d.game && <>
            <div style={{ marginTop: 40 }}><Logo src={d.game.logo} size={96} fallback={d.game.opp[0]} /></div>
            <div style={{ fontFamily: A, fontSize: 30, marginTop: 18 }}>{d.game.multi ? "" : vsAt(d.game).toUpperCase()}</div>
            <Fit max={128} size={36} style={{ fontFamily: A, lineHeight: 1.1 }}>{initials(d.game.opp)}</Fit>
            <div style={{ marginTop: "auto", fontFamily: O, fontSize: 22, letterSpacing: 1, color: d.game.result ? (won(d.game) ? GOLD : "#fff") : GOLD }}>{d.game.result ? resultOf(d.game) : d.game.time}</div>
          </>}
        </div>
      ))}
    </div>
    <Meta style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", fontSize: 22 }}>Lower Merion Aces Basketball</Meta>
  </Fill>
);

// 3. Stacked ticket cards.
const WeekTickets = ({ week }) => (
  <Fill style={{ background: `${DEEP} repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 20px)`, padding: "70px 70px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div><div style={{ fontFamily: O, fontSize: 26, letterSpacing: 10, color: GOLD, textTransform: "uppercase" }}>{week.label}</div><div style={{ fontFamily: A, fontSize: 120, lineHeight: 1, textTransform: "uppercase" }}>{week.title}</div></div>
      <img src={BULL} alt="" style={{ height: 170 }} />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
      {week.games.map((r, i) => (
        <div key={i} style={{ display: "flex", height: 210, transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`, filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.45))" }}>
          <div style={{ flex: 1, background: CREAM, color: INK, borderRadius: "16px 0 0 16px", padding: "24px 30px", display: "flex", alignItems: "center", gap: 24, minWidth: 0 }}>
            <Logo src={r.logo} size={110} ring="rgba(0,0,0,0.12)" fallback={r.opp[0]} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: O, fontSize: 20, letterSpacing: 6, color: MAROON, textTransform: "uppercase" }}>{place(r)}{r.conf ? " · League" : ""}</div>
              <Fit max={430} size={60} style={{ fontFamily: A, lineHeight: 1.05, textTransform: "uppercase" }}>{vsAt(r)} {r.opp}</Fit>
              <Fit max={430} size={22} style={{ fontFamily: O, letterSpacing: 3, textTransform: "uppercase", opacity: 0.6 }}>{r.venue}</Fit>
            </div>
          </div>
          <div style={{ width: 0, borderLeft: `4px dashed ${DEEP}` }} />
          <div style={{ width: 230, background: GOLD, color: DEEP, borderRadius: "0 16px 16px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: O, fontSize: 26, letterSpacing: 6 }}>{r.wd}</div>
            <Fit max={200} size={64} style={{ fontFamily: A, lineHeight: 1 }}>{r.md}</Fit>
            <Fit max={200} size={30} style={{ fontFamily: A, marginTop: 6 }}>{whenOf(r)}</Fit>
          </div>
        </div>
      ))}
    </div>
  </Fill>
);

// 4. Black and gold.
const WeekBlackGold = ({ week }) => (
  <Fill style={{ background: "#08080a", textAlign: "center" }}>
    <div style={{ position: "absolute", inset: 40, border: `2px solid ${GOLD}` }} />
    <div style={{ position: "absolute", inset: 54, border: "1px solid rgba(201,164,74,0.5)" }} />
    <img src={LM} alt="" style={{ position: "absolute", top: 100, left: 465, width: 150 }} />
    <div style={{ position: "absolute", top: 270, left: 0, right: 0, fontFamily: P, fontStyle: "italic", fontSize: 90, color: GOLD }}>{week.title.charAt(0) + week.title.slice(1).toLowerCase()}</div>
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, fontFamily: O, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", opacity: 0.7 }}>{week.label}</div>
    <div style={{ position: "absolute", top: 460, left: 130, right: 130, display: "flex", flexDirection: "column", gap: 0 }}>
      {week.games.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, padding: "22px 0", borderBottom: "1px solid rgba(201,164,74,0.35)" }}>
          <span style={{ fontFamily: O, fontSize: 30, letterSpacing: 4, color: GOLD, width: 170, textAlign: "left", flexShrink: 0 }}>{r.wd} {r.md}</span>
          <Fit max={440} size={50} style={{ fontFamily: P, fontWeight: 700, flex: 1, textAlign: "left" }}>{r.multi ? r.opp : `${r.home || r.neutral ? "vs." : "at"} ${r.opp}`}</Fit>
          <span style={{ fontFamily: P, fontSize: 36, color: r.result ? GOLD : "#fff", whiteSpace: "nowrap" }}>{whenOf(r)}</span>
        </div>
      ))}
    </div>
  </Fill>
);

// 5. LED scoreboard rows.
const WeekLED = ({ week, photo, focus, zoom }) => {
  const led = (c) => ({ fontFamily: B, color: c, textShadow: `0 0 16px ${c}, 0 0 3px ${c}`, lineHeight: 1 });
  return (
    <Fill style={{ background: "#050505", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 380, position: "relative", overflow: "hidden" }}><Photo src={photo} focus={focus} zoom={zoom} /><Fill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, #050505 100%)" }} /></div>
      <div style={{ flex: 1, margin: "0 50px 50px", position: "relative", background: "#0a0a0a", border: "6px solid #1d1d1d", borderRadius: 14, padding: "26px 40px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ ...led("#ffb300"), fontSize: 80, letterSpacing: 8 }}>{week.title}</span><span style={{ ...led("#ff3030"), fontSize: 40, letterSpacing: 4 }}>{week.label}</span></div>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {week.games.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "190px 1fr auto", alignItems: "baseline", gap: 20 }}>
              <span style={{ ...led("#ff3030"), fontSize: 52 }}>{r.wd} {r.md}</span>
              <Fit max={420} size={58} style={{ ...led("#e8e8e8"), textShadow: "0 0 14px rgba(255,255,255,0.5)", letterSpacing: 3, textTransform: "uppercase" }}>{r.multi ? r.opp : `${vsAt(r)} ${r.opp}`}</Fit>
              <span style={{ ...led("#ffb300"), fontSize: 52, whiteSpace: "nowrap" }}>{whenOf(r)}</span>
            </div>
          ))}
        </div>
        <Fill style={{ background: "radial-gradient(circle, rgba(0,0,0,0) 52%, rgba(0,0,0,0.78) 58%) 0 0 / 9px 9px", pointerEvents: "none" }} />
      </div>
    </Fill>
  );
};

// 6. Bold "game week" poster.
const GameWeek = ({ week, photo, focus, zoom }) => (
  <Fill style={{ background: INK }}>
    <Photo src={photo} focus={focus} zoom={zoom} />
    <Fill style={{ background: `linear-gradient(90deg, rgba(10,0,5,0.95) 0%, rgba(10,0,5,0.75) 55%, rgba(10,0,5,0.2) 100%)` }} />
    <div style={{ position: "absolute", top: 60, left: 60 }}>
      <div style={{ fontFamily: O, fontSize: 28, letterSpacing: 10, color: GOLD, textTransform: "uppercase" }}>{week.label}</div>
      <div style={{ fontFamily: A, fontSize: 210, lineHeight: 0.9, textTransform: "uppercase", marginTop: 10 }}>{week.played === week.total && week.total ? "Week" : "Game"}<br /><span style={{ color: GOLD }}>{week.played === week.total && week.total ? "Recap" : "Week"}</span></div>
      <div style={{ fontFamily: O, fontSize: 34, letterSpacing: 8, textTransform: "uppercase", marginTop: 14, opacity: 0.8 }}>{week.total} {week.total === 1 ? "game" : "games"}{week.played ? ` · ${week.wins}-${week.played - week.wins} this week` : ""}</div>
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 60, display: "flex", flexDirection: "column", gap: 12 }}>
      {week.games.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, borderTop: "2px solid rgba(201,164,74,0.5)", paddingTop: 14 }}>
          <span style={{ fontFamily: A, fontSize: 50, color: GOLD, width: 230, flexShrink: 0 }}>{r.wd} {r.md}</span>
          <Fit max={500} size={56} style={{ fontFamily: A, textTransform: "uppercase", flex: 1 }}>{r.multi ? r.opp : `${vsAt(r)} ${r.opp}`}</Fit>
          <span style={{ fontFamily: O, fontSize: 34, letterSpacing: 2, whiteSpace: "nowrap", color: r.result ? (won(r) ? GOLD : "#fff") : "#fff" }}>{whenOf(r)}</span>
        </div>
      ))}
    </div>
  </Fill>
);

// ── SEASON SCHEDULE ────────────────────────────────────────────────
const Row = ({ r, dark = true, size = 30 }) => (
  <div style={{ display: "grid", gridTemplateColumns: "104px 54px 1fr auto", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}` }}>
    <span style={{ fontFamily: A, fontSize: size, color: dark ? GOLD : MAROON, whiteSpace: "nowrap" }}>{r.multi ? r.md.replace(/^(\w+) /, "$1 ") : r.md}</span>
    <span style={{ fontFamily: O, fontSize: size * 0.62, letterSpacing: 2, opacity: 0.6 }}>{r.wd}</span>
    <Fit max={300} size={size} style={{ fontFamily: A, textTransform: "uppercase" }}>{r.multi ? r.opp : `${vsAt(r)} ${r.opp}`}{r.conf ? <span style={{ color: dark ? GOLD : MAROON }}> *</span> : null}</Fit>
    <span style={{ fontFamily: O, fontSize: size * 0.7, letterSpacing: 1, whiteSpace: "nowrap", color: r.result ? (won(r) ? (dark ? GOLD : MAROON) : dark ? "#fff" : INK) : dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)", fontWeight: r.result ? 700 : 400 }}>{r.multi ? "" : whenOf(r)}</span>
  </div>
);
const twoCols = (rows) => { const h = Math.ceil(rows.length / 2); return [rows.slice(0, h), rows.slice(h)]; };
const Legend = ({ dark = true }) => <span style={{ fontFamily: O, fontSize: 18, letterSpacing: 4, textTransform: "uppercase", opacity: 0.6, color: dark ? "#fff" : INK }}>* Central League</span>;

// 1. Classic poster: photo band + two columns.
const SeasonClassic = ({ season, photo, focus, zoom }) => (
  <Fill style={{ background: INK, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 380, position: "relative", overflow: "hidden" }}>
      <Photo src={photo} focus={focus} zoom={zoom} />
      <Fill style={{ background: `linear-gradient(180deg, rgba(77,0,32,0.35) 0%, rgba(11,11,13,0.2) 40%, rgba(11,11,13,1) 100%)` }} />
      <img src={LM} alt="" style={{ position: "absolute", top: 40, left: 50, width: 120 }} />
      <div style={{ position: "absolute", left: 50, bottom: 14 }}>
        <div style={{ fontFamily: O, fontSize: 28, letterSpacing: 10, color: GOLD }}>{season.label} VARSITY</div>
        <div style={{ fontFamily: A, fontSize: 130, lineHeight: 1 }}>SCHEDULE</div>
      </div>
      {season.record.played > 0 && <div style={{ position: "absolute", right: 50, bottom: 30, textAlign: "right" }}><div style={{ fontFamily: O, fontSize: 22, letterSpacing: 6, color: GOLD }}>RECORD</div><div style={{ fontFamily: A, fontSize: 80, lineHeight: 1 }}>{season.record.w}-{season.record.l}</div></div>}
    </div>
    <div style={{ flex: 1, padding: "16px 46px 30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      {twoCols(season.rows).map((col, i) => <div key={i}>{col.map((r, j) => <Row key={j} r={r} size={28} />)}</div>)}
    </div>
    <div style={{ padding: "0 46px 34px", display: "flex", justifyContent: "space-between" }}><Legend /><Meta style={{ fontSize: 18 }}>Home: Kobe Bryant Gymnasium</Meta></div>
  </Fill>
);

// 2. Home games only.
const SeasonHome = ({ season, photo, focus, zoom }) => {
  const rows = season.rows.filter((r) => r.home && !r.multi);
  return (
    <Fill style={{ background: INK }}>
      <Photo src={photo} focus={focus} zoom={zoom} style={{ filter: "brightness(0.3)" }} />
      <div style={{ position: "absolute", top: 60, left: 60, right: 60 }}>
        <div style={{ fontFamily: O, fontSize: 28, letterSpacing: 10, color: GOLD, textTransform: "uppercase" }}>{season.label} Home Schedule</div>
        <div style={{ fontFamily: A, fontSize: 150, lineHeight: 0.92, marginTop: 8 }}>PACK<br />THE GYM</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ background: "rgba(132,0,54,0.55)", border: "1px solid rgba(201,164,74,0.4)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center", width: 96, flexShrink: 0 }}><div style={{ fontFamily: O, fontSize: 20, letterSpacing: 4, color: GOLD }}>{r.wd}</div><div style={{ fontFamily: A, fontSize: 44, lineHeight: 1 }}>{r.md}</div></div>
            <div style={{ minWidth: 0 }}><Fit max={300} size={40} style={{ fontFamily: A, textTransform: "uppercase", lineHeight: 1.05 }}>{r.opp}</Fit><div style={{ fontFamily: O, fontSize: 22, letterSpacing: 2, color: r.result ? GOLD : "rgba(255,255,255,0.75)" }}>{whenOf(r)}{r.conf ? " · League" : ""}</div></div>
          </div>
        ))}
      </div>
      <Meta style={{ position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center", fontSize: 22 }}>Kobe Bryant Gymnasium · Lower Merion High School</Meta>
    </Fill>
  );
};

// 3. Month calendars with game days marked.
const MONTH_IDX = { January: 0, February: 1, March: 2, November: 10, December: 11 };
const SeasonCalendar = ({ season }) => (
  <Fill style={{ background: `radial-gradient(circle at 50% 0%, #a1063f 0%, ${MAROON} 35%, ${DEEP} 100%)`, padding: "60px 60px", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><div style={{ fontFamily: O, fontSize: 26, letterSpacing: 10, color: GOLD }}>{season.label} VARSITY</div><div style={{ fontFamily: A, fontSize: 110, lineHeight: 1 }}>SCHEDULE</div></div>
      <img src={LM} alt="" style={{ width: 120 }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 30 }}>
      {season.months.map((m) => {
        const [name, yr] = m.month.split(" "); const mi = MONTH_IDX[name]; const y = Number(yr);
        if (mi == null) return null;
        const first = new Date(Date.UTC(y, mi, 1)).getUTCDay(); const days = new Date(Date.UTC(y, mi + 1, 0)).getUTCDate();
        const byDay = {};
        m.games.forEach((g) => {
          if (g.multi) { const n = (String(g.md).match(/\d+/g) || []).map(Number); for (let d = n[0]; n[0] && d <= (n[1] || n[0]); d++) byDay[d] = g; return; }
          const d = Number(String(g.md).split("/")[1]); if (d) byDay[d] = g;
        });
        const cells = []; for (let i = 0; i < first; i++) cells.push(null); for (let d = 1; d <= days; d++) cells.push(d);
        return (
          <div key={m.month} style={{ display: "flex", gap: 26 }}>
            <div style={{ width: 150, fontFamily: A, fontSize: 52, lineHeight: 1, color: GOLD, textTransform: "uppercase", paddingTop: 6 }}>{name.slice(0, 3)}<div style={{ fontFamily: O, fontSize: 20, letterSpacing: 4, color: "#fff", opacity: 0.6 }}>{yr}</div></div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {cells.map((d, i) => { const g = d && byDay[d]; return (
                <div key={i} style={{ height: 50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: O, fontSize: 22, background: g ? (g.home ? GOLD : "rgba(255,255,255,0.12)") : "transparent", border: g && !g.home ? `2px solid ${GOLD}` : "none", color: g ? (g.home ? DEEP : "#fff") : d ? "rgba(255,255,255,0.35)" : "transparent", fontWeight: g ? 700 : 400, boxSizing: "border-box" }}>{d ? (g ? initials(g.opp) : d) : ""}</div>
              ); })}
            </div>
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 50, display: "flex", justifyContent: "center", gap: 40, fontFamily: O, fontSize: 22, letterSpacing: 4, textTransform: "uppercase" }}>
      <span><span style={{ display: "inline-block", width: 22, height: 22, background: GOLD, borderRadius: 4, verticalAlign: "middle", marginRight: 10 }} />Home</span>
      <span><span style={{ display: "inline-block", width: 22, height: 22, border: `2px solid ${GOLD}`, borderRadius: 4, verticalAlign: "middle", marginRight: 10, boxSizing: "border-box" }} />Away</span>
    </div>
  </Fill>
);

// 4. Cream editorial list.
const SeasonCream = ({ season }) => (
  <Fill style={{ background: CREAM, color: INK, padding: "60px 64px 40px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `3px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: "12px 0", fontFamily: O, fontSize: 20, letterSpacing: 5, textTransform: "uppercase" }}><span>Lower Merion Aces Basketball</span><span>{season.label}</span></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
      <div style={{ fontFamily: P, fontWeight: 700, fontSize: 130, lineHeight: 0.95, letterSpacing: -3, color: MAROON }}>The Schedule.</div>
      <img src={LM} alt="" style={{ width: 110 }} />
    </div>
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 24 }}>
      {twoCols(season.rows).map((col, i) => <div key={i}>{col.map((r, j) => <Row key={j} r={r} dark={false} size={28} />)}</div>)}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${INK}`, paddingTop: 10 }}><Legend dark={false} /><span style={{ fontFamily: SS, fontSize: 20 }}>{season.record.played ? `Record ${season.record.w}-${season.record.l}` : "Home games at the Kobe Bryant Gymnasium"}</span></div>
  </Fill>
);

// 5. Tile grid: one tile per game.
const SeasonTiles = ({ season }) => {
  const rows = season.rows;
  const cols = 4;
  return (
    <Fill style={{ background: "#0b0b0d", padding: "50px 44px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div><div style={{ fontFamily: O, fontSize: 24, letterSpacing: 10, color: GOLD }}>{season.label} VARSITY</div><div style={{ fontFamily: A, fontSize: 100, lineHeight: 1 }}>SCHEDULE</div></div>
        <img src={LM} alt="" style={{ width: 110 }} />
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr", gap: 12 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ background: r.home && !r.multi ? MAROON : "#18181d", border: r.result ? `2px solid ${won(r) ? GOLD : "rgba(255,255,255,0.25)"}` : "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontFamily: A, fontSize: 32, color: GOLD }}>{r.multi ? "DEC" : r.md}</span><span style={{ fontFamily: O, fontSize: 16, letterSpacing: 2, opacity: 0.6 }}>{r.multi ? "" : r.home ? "HOME" : r.neutral ? "NEUTRAL" : "AWAY"}</span></div>
            <Fit max={200} size={36} style={{ fontFamily: A, textTransform: "uppercase", lineHeight: 1.05 }}>{r.multi ? r.opp : `${vsAt(r)} ${r.opp}`}</Fit>
            <div style={{ fontFamily: O, fontSize: 18, letterSpacing: 1, color: r.result ? GOLD : "rgba(255,255,255,0.7)" }}>{r.multi ? r.md : whenOf(r)}</div>
          </div>
        ))}
      </div>
    </Fill>
  );
};

// 6. Black and gold list.
const SeasonBlackGold = ({ season }) => (
  <Fill style={{ background: "#08080a", padding: "70px 80px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
    <div style={{ position: "absolute", inset: 36, border: `2px solid ${GOLD}` }} />
    <div style={{ textAlign: "center" }}>
      <img src={LM} alt="" style={{ width: 120 }} />
      <div style={{ fontFamily: P, fontStyle: "italic", fontSize: 70, color: GOLD, marginTop: 6 }}>{season.label} Schedule</div>
    </div>
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 46, marginTop: 20 }}>
      {twoCols(season.rows).map((col, i) => (
        <div key={i}>{col.map((r, j) => (
          <div key={j} style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "17px 0", borderBottom: "1px solid rgba(201,164,74,0.3)" }}>
            <span style={{ fontFamily: O, fontSize: 24, letterSpacing: 2, color: GOLD, width: 100, flexShrink: 0 }}>{r.multi ? "DEC 26" : r.md}</span>
            <Fit max={250} size={32} style={{ fontFamily: P, fontWeight: 700, flex: 1 }}>{r.multi ? r.opp : `${r.home || r.neutral ? "vs." : "at"} ${r.opp}`}</Fit>
            <span style={{ fontFamily: P, fontSize: 22, color: r.result ? GOLD : "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>{r.multi ? "AZ" : whenOf(r)}</span>
          </div>
        ))}</div>
      ))}
    </div>
  </Fill>
);

export const WEEK_LAYOUTS = [
  { id: "wk-list", name: "This Week List", w: PW, h: PH, Comp: WeekList },
  { id: "wk-strip", name: "Week Calendar", w: S, h: S, Comp: WeekStrip },
  { id: "wk-tickets", name: "Ticket Stack", w: PW, h: PH, Comp: WeekTickets, noPhoto: true },
  { id: "wk-gameweek", name: "Game Week", w: PW, h: PH, Comp: GameWeek },
  { id: "wk-led", name: "LED Board", w: S, h: S, Comp: WeekLED },
  { id: "wk-blackgold", name: "Black & Gold", w: S, h: S, Comp: WeekBlackGold, noPhoto: true },
];

export const SEASON_LAYOUTS = [
  { id: "ss-classic", name: "Classic Poster", w: PW, h: PH, Comp: SeasonClassic },
  { id: "ss-calendar", name: "Month Calendars", w: PW, h: PH, Comp: SeasonCalendar, noPhoto: true },
  { id: "ss-home", name: "Home Games", w: PW, h: PH, Comp: SeasonHome },
  { id: "ss-cream", name: "Newspaper List", w: PW, h: PH, Comp: SeasonCream, noPhoto: true },
  { id: "ss-tiles", name: "Game Tiles", w: PW, h: PH, Comp: SeasonTiles, noPhoto: true },
  { id: "ss-blackgold", name: "Black & Gold", w: PW, h: PH, Comp: SeasonBlackGold, noPhoto: true },
];
