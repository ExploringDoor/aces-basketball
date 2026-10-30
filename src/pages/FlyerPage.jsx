// pages/FlyerPage.jsx
// Coach tool: builds Instagram-ready Game Day and Final Score graphics from the
// live schedule. Not in the public nav; open it at /#flyers. Nothing is
// uploaded anywhere: photos stay on the device and the PNG renders in-browser.
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Spade, allGames, nextGame, gameTime, homeVenue, computeRecord } from "../shared";
import { FINAL_LAYOUTS, oppLogoFor } from "./flyers/finalLayouts";
import { GAME_DAY_LAYOUTS } from "./flyers/gameDayLayouts";

// Most /ig/*.jpg files are last season's finished flyers, not raw photos, so
// only the two real photographs qualify as presets. Upload is the main path.
const PHOTOS = [
  { src: "/ig/tunnel.jpg", label: "Huddle" },
  { src: "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg", label: "Celebration" },
];

const NY = "America/New_York";
const GAMES = allGames.filter((g) => !g.exhibition);
const OPENER = GAMES.find((g) => !g.multi);
const LAYOUTS = { gameday: GAME_DAY_LAYOUTS, final: FINAL_LAYOUTS };
const STORE_KEY = { gameday: "aces-gameday-layout", final: "aces-final-layout" };

const weekdayOf = (g) => (g.iso ? new Date(g.iso).toLocaleDateString("en-US", { weekday: "long", timeZone: NY }).toUpperCase() : "");
const shortDateOf = (g) => (g.iso ? new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric", timeZone: NY }).format(new Date(g.iso)) : g.date || "");
const longDateOf = (g) => (g.iso ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: NY }).format(new Date(g.iso)).toUpperCase() : g.date || "");
const hourOf = (g) => (g.iso ? Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: NY }).format(new Date(g.iso))) : 19);
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const defaultEvent = (g, mode) => {
  if (!g) return "";
  if (g.multi) return g.tag || "";
  if (mode === "gameday" && OPENER && g.iso === OPENER.iso) return "Season Opener";
  if (g.tag && g.tag !== "Rescheduled") return g.tag;
  if (g.conf) return "Central League";
  return "";
};

const prefill = (g, mode) => ({
  opp: g.opp,
  weekday: weekdayOf(g),
  dateLine: shortDateOf(g),
  time: g.multi ? "" : g.time,
  venue: g.venue || (g.home ? homeVenue : g.opp),
  event: defaultEvent(g, mode),
  us: g.result ? String(g.result.us) : "",
  them: g.result ? String(g.result.them) : "",
});

function buildCaption(mode, f, g) {
  if (mode === "gameday") {
    const slot = hourOf(g) >= 17 ? "night" : "afternoon";
    const where = g.home ? "at the Bryant Gymnasium" : `at ${f.venue}`;
    const lead = f.event ? `${f.event}. ` : "";
    const closer = g.home ? "Pack the gym!" : "Come out and support the Aces!";
    return `${lead}The Aces ${g.home ? "host" : "take on"} ${f.opp} ${titleCase(f.weekday)} ${slot} ${where}. Tip-off at ${f.time}. ${closer}\n\nLet's Go Aces!`;
  }
  const win = Number(f.us) > Number(f.them);
  const where = g.home ? "at the Bryant Gymnasium" : `at ${f.venue}`;
  return `Final: Lower Merion ${win ? "defeats" : "falls to"} ${f.opp} ${f.us}-${f.them} ${where}.\n\nLet's Go Aces!`;
}

const defaultIdx = (mode, now) => {
  if (mode === "final") {
    let last = -1;
    GAMES.forEach((g, i) => { if (gameTime(g) <= now) last = i; });
    return last >= 0 ? last : 0;
  }
  const ng = nextGame(now);
  const i = GAMES.findIndex((g) => ng && g.iso === ng.iso);
  return i < 0 ? 0 : i;
};

// Season record as it will read once this game is posted.
const projectedRecord = (g, us, them) => {
  const r = computeRecord();
  if (g.result || us === "" || them === "" || g.multi) return `${r.w}-${r.l}`;
  const win = Number(us) > Number(them), loss = Number(them) > Number(us);
  return `${r.w + (win ? 1 : 0)}-${r.l + (loss ? 1 : 0)}`;
};

const readStored = (mode) => { try { return localStorage.getItem(STORE_KEY[mode]); } catch { return null; } };
const pickDefault = (mode) => { const s = readStored(mode); return LAYOUTS[mode].some((l) => l.id === s) ? s : LAYOUTS[mode][0].id; };

// ── Control styles ────────────────────────────────────────────────
const label = { fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6, display: "block" };
const input = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "10px 12px", fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, outline: "none" };
const btn = (primary) => ({ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", padding: "13px 18px", borderRadius: 8, cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.18)", color: primary ? "#1a0010" : "#fff", background: primary ? "linear-gradient(135deg, #c9a44a, #b3873a)" : "rgba(255,255,255,0.05)", fontWeight: 600 });
const Field = ({ l, children }) => <div><span style={label}>{l}</span>{children}</div>;

export default function FlyerPage() {
  const now = Date.now();
  const [mode, setMode] = useState("gameday");
  const [idx, setIdx] = useState(() => defaultIdx("gameday", now));
  const g = GAMES[idx] || GAMES[0];
  const [f, setF] = useState(() => prefill(GAMES[defaultIdx("gameday", now)] || GAMES[0], "gameday"));
  const [layoutIds, setLayoutIds] = useState(() => ({ gameday: pickDefault("gameday"), final: pickDefault("final") }));
  const [photo, setPhoto] = useState(PHOTOS[0].src);
  const [focus, setFocus] = useState({ x: 50, y: 30 });
  const [zoom, setZoom] = useState(1);
  const [caption, setCaption] = useState("");
  const [captionDirty, setCaptionDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [scale, setScale] = useState(0.35);
  const [canShare, setCanShare] = useState(false);

  const boardRef = useRef(null);
  const holderRef = useRef(null);
  const fileRef = useRef(null);

  const list = LAYOUTS[mode];
  const layout = list.find((l) => l.id === layoutIds[mode]) || list[0];
  const W = layout.w, H = layout.h;

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const switchMode = (m) => { setMode(m); setIdx(defaultIdx(m, Date.now())); };
  const pickLayout = (id) => { setLayoutIds((p) => ({ ...p, [mode]: id })); try { localStorage.setItem(STORE_KEY[mode], id); } catch { /* ignore */ } };
  const shuffle = () => { const others = list.filter((l) => l.id !== layout.id); pickLayout(others[Math.floor(Math.random() * others.length)].id); };

  useEffect(() => { setF(prefill(g, mode)); setCaptionDirty(false); }, [idx, mode]); // eslint-disable-line
  useEffect(() => { if (!captionDirty) setCaption(buildCaption(mode, f, g)); }, [f, mode, g, captionDirty]);
  useEffect(() => {
    try { setCanShare(!!(navigator.canShare && navigator.canShare({ files: [new File([""], "t.png", { type: "image/png" })] }))); } catch { setCanShare(false); }
  }, []);
  useEffect(() => {
    const el = holderRef.current; if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / W));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, [W]);

  const us = f.us || "0", them = f.them || "0";
  const win = Number(us) > Number(them), tie = Number(us) === Number(them);
  const art = { f, photo, focus, zoom, us, them, win, tie, home: !!g.home, recLine: projectedRecord(g, f.us, f.them), longDate: longDateOf(g), dateLine: f.dateLine, oppLogo: oppLogoFor(f.opp) };

  const fileName = () => `aces-${mode === "gameday" ? "gameday" : "final"}-${layout.id}-${f.dateLine.replace("/", "-")}-${f.opp.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  const render = async () => {
    await document.fonts.ready;
    await Promise.all(["'Sedgwick Ave Display'", "'Permanent Marker'", "'Bebas Neue'", "Bangers", "Anton", "Oswald", "'Playfair Display'"].map((fam) => document.fonts.load(`40px ${fam}`).catch(() => {})));
    const opts = { pixelRatio: 1, cacheBust: true, width: W, height: H };
    await toPng(boardRef.current, opts); // warm-up pass: Safari drops fonts/images on the first render
    return toPng(boardRef.current, opts);
  };

  const download = async () => {
    setBusy("download"); setNote("");
    try {
      const url = await render();
      const a = document.createElement("a"); a.href = url; a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
      setNote("Saved. On iPhone, open the image and tap Share to post it.");
    } catch (e) { setNote("Could not render the image. Try again or use a different photo."); }
    setBusy("");
  };

  const share = async () => {
    setBusy("share"); setNote("");
    try {
      const url = await render();
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName(), { type: "image/png" });
      await navigator.share({ files: [file], title: "Aces" });
    } catch (e) { if (e && e.name !== "AbortError") setNote("Share did not open. Use Download instead."); }
    setBusy("");
  };

  const copyCaption = async () => {
    try { await navigator.clipboard.writeText(caption); setNote("Caption copied."); } catch { setNote("Select the caption text and copy it."); }
  };

  const onUpload = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    setPhoto(URL.createObjectURL(file)); setFocus({ x: 50, y: 30 }); setZoom(1);
  };

  const Layout = layout.Comp;

  return (
    <section id="flyers" style={{ background: "#0a0005", padding: "110px 5% 120px", minHeight: "100vh" }}>
      <style>{`
        .flyer-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 980px) { .flyer-grid { grid-template-columns: minmax(0, 1fr) 400px; align-items: start; } }
        .flyer-thumbs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .flyer-thumbs button { aspect-ratio: 1; border-radius: 8px; overflow: hidden; padding: 0; border: 2px solid transparent; background: #000; cursor: pointer; }
        .flyer-thumbs button.on { border-color: var(--gold); }
        .flyer-thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .flyer-range { width: 100%; accent-color: #c9a44a; }
        .flyer-seg { display: flex; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; overflow: hidden; }
        .flyer-seg button { flex: 1; padding: 12px; background: none; border: none; color: rgba(255,255,255,0.55); font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; }
        .flyer-seg button.on { background: rgba(132,0,54,0.55); color: #fff; }
        .flyer-layouts { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 8px; max-height: 420px; overflow-y: auto; padding: 2px; }
        .flyer-layouts button { background: #000; border: 2px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0; cursor: pointer; overflow: hidden; text-align: left; }
        .flyer-layouts button.on { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(201,164,74,0.25); }
        .flyer-layouts .lname { display: block; padding: 5px 6px; font-family: 'Oswald', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: #0a0005; }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="section-label"><Spade size={14} color="#840036" /> Coach Tools</div>
        <h2 className="section-title" style={{ fontSize: "clamp(40px,6vw,64px)" }}>Flyer<br /><span style={{ color: "var(--gold)" }}>Studio</span></h2>
        <div className="divider" />
        <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14.5, color: "rgba(255,255,255,0.55)", marginTop: 16, maxWidth: 640, lineHeight: 1.7 }}>
          Pick the game, pick a layout, pick a photo, download. The next game is already filled in from the schedule. Photos you choose from your phone never leave it.
        </p>

        <div className="flyer-grid" style={{ marginTop: 30 }}>
          {/* Preview */}
          <div ref={holderRef} style={{ width: "100%", minWidth: 0 }}>
            <div style={{ width: W * scale, height: H * scale, position: "relative", overflow: "hidden", borderRadius: 10, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", margin: "0 auto" }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <div ref={boardRef} style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0a0005", color: "#fff" }}>
                  <Layout {...art} />
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              {layout.name} · {W} × {H} · Instagram {H > W ? "portrait" : "square"}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "grid", gap: 18 }}>
            <div className="flyer-seg">
              <button className={mode === "gameday" ? "on" : ""} onClick={() => switchMode("gameday")}>Game Day</button>
              <button className={mode === "final" ? "on" : ""} onClick={() => switchMode("final")}>Final Score</button>
            </div>

            <Field l="Game">
              <select style={input} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
                {GAMES.map((x, i) => <option key={x.iso || i} value={i} style={{ color: "#000" }}>{x.date} · {x.home ? "vs" : "@"} {x.opp}</option>)}
              </select>
            </Field>

            {mode === "final" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field l="Aces"><input style={{ ...input, fontSize: 22, fontFamily: "'Oswald',sans-serif" }} inputMode="numeric" value={f.us} onChange={set("us")} placeholder="0" /></Field>
                <Field l={f.opp}><input style={{ ...input, fontSize: 22, fontFamily: "'Oswald',sans-serif" }} inputMode="numeric" value={f.them} onChange={set("them")} placeholder="0" /></Field>
              </div>
            )}

            <Field l={`Layout · ${list.length} styles`}>
              <div className="flyer-layouts">
                {list.map((l) => {
                  const s = 78 / l.w;
                  return (
                    <button key={l.id} className={l.id === layout.id ? "on" : ""} onClick={() => pickLayout(l.id)} title={l.name}>
                      <div style={{ width: 78, height: Math.round(l.h * s), overflow: "hidden", margin: "0 auto", pointerEvents: "none" }}>
                        <div style={{ transform: `scale(${s})`, transformOrigin: "top left", width: l.w, height: l.h, position: "relative", overflow: "hidden", background: "#0a0005", color: "#fff" }}>
                          <l.Comp {...art} />
                        </div>
                      </div>
                      <span className="lname">{l.name}</span>
                    </button>
                  );
                })}
              </div>
              <button style={{ ...btn(false), width: "100%", marginTop: 8, padding: "10px" }} onClick={shuffle}>Shuffle layout</button>
            </Field>

            <Field l="Photo">
              <div className="flyer-thumbs">
                <button className={!PHOTOS.some((p) => p.src === photo) ? "on" : ""} onClick={() => fileRef.current && fileRef.current.click()} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--gold)", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: "rgba(201,164,74,0.1)", border: "2px dashed rgba(201,164,74,0.45)" }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>Your photo
                </button>
                {PHOTOS.map((p) => (
                  <button key={p.src} className={photo === p.src ? "on" : ""} onClick={() => { setPhoto(p.src); setFocus({ x: 50, y: 30 }); setZoom(1); }} title={p.label}>
                    <img src={p.src} alt={p.label} loading="lazy" />
                  </button>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
              {layout.noPhoto && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>This layout doesn't use a photo.</div>}
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field l={`Left / Right ${focus.x}%`}><input className="flyer-range" type="range" min={0} max={100} value={focus.x} onChange={(e) => setFocus((p) => ({ ...p, x: Number(e.target.value) }))} /></Field>
              <Field l={`Up / Down ${focus.y}%`}><input className="flyer-range" type="range" min={0} max={100} value={focus.y} onChange={(e) => setFocus((p) => ({ ...p, y: Number(e.target.value) }))} /></Field>
              <Field l={`Zoom ${zoom.toFixed(2)}×`}><input className="flyer-range" type="range" min={1} max={2.2} step={0.02} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field l="Opponent"><input style={input} value={f.opp} onChange={set("opp")} /></Field>
              <Field l="Date"><input style={input} value={f.dateLine} onChange={set("dateLine")} /></Field>
              {mode === "gameday" && <Field l="Day"><input style={input} value={f.weekday} onChange={set("weekday")} /></Field>}
              {mode === "gameday" && <Field l="Tip-off"><input style={input} value={f.time} onChange={set("time")} /></Field>}
              <Field l="Venue"><input style={input} value={f.venue} onChange={set("venue")} /></Field>
              {mode === "gameday" && <Field l="Event line (optional)"><input style={input} value={f.event} onChange={set("event")} placeholder="Central League, Playoffs…" /></Field>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: canShare ? "1fr 1fr" : "1fr", gap: 10 }}>
              <button style={btn(true)} onClick={download} disabled={!!busy}>{busy === "download" ? "Rendering…" : "Download PNG"}</button>
              {canShare && <button style={btn(false)} onClick={share} disabled={!!busy}>{busy === "share" ? "Rendering…" : "Share / Save to Photos"}</button>}
            </div>

            <Field l="Caption">
              <textarea style={{ ...input, minHeight: 120, resize: "vertical", lineHeight: 1.5 }} value={caption} onChange={(e) => { setCaption(e.target.value); setCaptionDirty(true); }} />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...btn(false), padding: "9px 14px", fontSize: 11 }} onClick={copyCaption}>Copy caption</button>
                {captionDirty && <button style={{ ...btn(false), padding: "9px 14px", fontSize: 11 }} onClick={() => setCaptionDirty(false)}>Reset</button>}
              </div>
            </Field>

            {note && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "var(--gold)" }}>{note}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
