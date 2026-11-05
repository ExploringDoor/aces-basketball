// pages/ScoresPage.jsx
// Coach tool (not in the menu): open /#scores on a phone, enter the passcode
// once, then post final scores and the Central League table. Saves go to
// /api/scores and show up across the site within about a minute (instantly on
// this phone). Each game can jump straight to a Final Score graphic.
import { useEffect, useState } from "react";
import { Spade, allGames, standings, applyLive, live, gameTime, computeRecord, loadLive } from "../shared";

const KEY_STORE = "aces-scores-key";
const readKey = () => { try { return localStorage.getItem(KEY_STORE) || ""; } catch { return ""; } };
const NY = "America/New_York";
const dayLabel = (g) => (g.iso ? new Date(g.iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: NY }) : g.date);

const label = { fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" };
const input = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", padding: "12px", fontFamily: "'Oswald',sans-serif", fontSize: 22, textAlign: "center", outline: "none" };
const btn = (primary, small) => ({ fontFamily: "'Oswald',sans-serif", fontSize: small ? 11 : 13, letterSpacing: 2, textTransform: "uppercase", padding: small ? "9px 12px" : "13px 18px", borderRadius: 9, cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.18)", color: primary ? "#1a0010" : "#fff", background: primary ? "linear-gradient(135deg, #c9a44a, #b3873a)" : "rgba(255,255,255,0.05)", fontWeight: 600 });
const ERR = { wrong_passcode: "That passcode didn't work.", bad_score: "Enter both scores as whole numbers.", tie_not_allowed: "Basketball games can't end in a tie. Check the score.", not_configured: "Score saving isn't switched on yet.", save_failed: "Couldn't save. Try again in a moment." };

async function api(key, body) {
  const r = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json", "x-scores-key": key }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `http_${r.status}`);
  return d;
}

function GameRow({ g, keyCode, onAuthFail }) {
  const [us, setUs] = useState(g.result ? String(g.result.us) : "");
  const [them, setThem] = useState(g.result ? String(g.result.them) : "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setUs(g.result ? String(g.result.us) : ""); setThem(g.result ? String(g.result.them) : ""); }, [g.result && g.result.us, g.result && g.result.them]); // eslint-disable-line
  const saved = !!g.result;
  const dirty = us !== (saved ? String(g.result.us) : "") || them !== (saved ? String(g.result.them) : "");
  const run = async (body, ok) => {
    setBusy(true); setMsg("");
    try { applyLive(await api(keyCode, body)); setMsg(ok); }
    catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't save. Check your connection."); }
    setBusy(false);
  };
  const win = saved && g.result.us > g.result.them;
  const toFlyer = () => { try { sessionStorage.setItem("aces-flyer-handoff", JSON.stringify({ mode: "final", iso: g.iso })); } catch { /* ignore */ } window.location.hash = "flyers"; };
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${saved ? "rgba(201,164,74,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 14px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, textTransform: "uppercase", letterSpacing: 1 }}>{g.home || g.neutral ? "vs" : "@"} {g.opp}</div>
          <div style={{ ...label, marginTop: 2 }}>{dayLabel(g)} · {g.time}{g.conf ? " · League" : ""}</div>
        </div>
        {saved && <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2, color: win ? "#4ade80" : "#f87171", whiteSpace: "nowrap" }}>{win ? "W" : "L"} {g.result.us}-{g.result.them}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginTop: 12, alignItems: "end" }}>
        <label><div style={label}>Aces</div><input style={input} inputMode="numeric" pattern="[0-9]*" value={us} onChange={(e) => setUs(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="0" /></label>
        <label><div style={label}>{g.opp}</div><input style={input} inputMode="numeric" pattern="[0-9]*" value={them} onChange={(e) => setThem(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="0" /></label>
        <button style={{ ...btn(true), opacity: busy || !dirty || us === "" || them === "" ? 0.5 : 1, height: 50 }} disabled={busy || !dirty || us === "" || them === ""} onClick={() => run({ action: "set", iso: g.iso, us: Number(us), them: Number(them) }, "Saved. The site shows it within a minute.")}>{busy ? "…" : "Save"}</button>
      </div>
      {(saved || msg) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: msg.startsWith("Saved") || msg.startsWith("Cleared") ? "var(--gold)" : msg ? "#f87171" : "rgba(255,255,255,0.4)" }}>{msg}</span>
          {saved && <span style={{ display: "flex", gap: 8 }}>
            <button style={btn(false, true)} onClick={toFlyer}>Make the graphic</button>
            <button style={btn(false, true)} disabled={busy} onClick={() => { if (window.confirm(`Remove the ${g.opp} score?`)) run({ action: "clear", iso: g.iso }, "Cleared."); }}>Clear</button>
          </span>}
        </div>
      )}
    </div>
  );
}

function StandingsEditor({ keyCode, onAuthFail }) {
  const rec = computeRecord();
  const [rows, setRows] = useState(() => Object.fromEntries(standings.map((t) => [t.team, { confW: String(t.confW), confL: String(t.confL), w: String(t.w), l: String(t.l) }])));
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const set = (team, k) => (e) => setRows((p) => ({ ...p, [team]: { ...p[team], [k]: e.target.value.replace(/\D/g, "").slice(0, 2) } }));
  const save = async () => {
    setBusy(true); setMsg("");
    const out = {};
    for (const [t, r] of Object.entries(rows)) out[t] = { confW: Number(r.confW || 0), confL: Number(r.confL || 0), w: Number(r.w || 0), l: Number(r.l || 0) };
    try { applyLive(await api(keyCode, { action: "standings", rows: out })); setMsg("Standings saved."); }
    catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't save. Check your connection."); }
    setBusy(false);
  };
  const cell = { ...input, fontSize: 16, padding: "9px 4px" };
  return (
    <div>
      <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 14px" }}>
        Update the other teams' records after a league night. Lower Merion's row fills itself in from the scores you post.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 46px 46px 46px 46px", gap: 6, alignItems: "center" }}>
        <span style={label}>Team</span><span style={{ ...label, textAlign: "center" }}>LG W</span><span style={{ ...label, textAlign: "center" }}>LG L</span><span style={{ ...label, textAlign: "center" }}>All W</span><span style={{ ...label, textAlign: "center" }}>All L</span>
        {standings.map((t) => {
          const lm = t.team === "Lower Merion" && rec.played > 0;
          const r = lm ? { confW: rec.cw, confL: rec.cl, w: rec.w, l: rec.l } : rows[t.team];
          return [
            <span key={t.team + "n"} style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: t.team === "Lower Merion" ? "var(--gold)" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.team}</span>,
            ...["confW", "confL", "w", "l"].map((k) => <input key={t.team + k} style={{ ...cell, opacity: lm ? 0.5 : 1 }} inputMode="numeric" disabled={lm} value={r[k]} onChange={set(t.team, k)} />),
          ];
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <button style={btn(true)} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save standings"}</button>
        <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: msg.startsWith("Standings") ? "var(--gold)" : "#f87171" }}>{msg}</span>
      </div>
    </div>
  );
}

export default function ScoresPage() {
  const [keyCode, setKeyCode] = useState(readKey);
  const [entry, setEntry] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("scores");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { loadLive(true); }, []);

  const signOut = () => { try { localStorage.removeItem(KEY_STORE); } catch { /* ignore */ } setKeyCode(""); };
  const unlock = async (e) => {
    e.preventDefault(); setErr("");
    try { await api(entry.trim(), { action: "check" }); try { localStorage.setItem(KEY_STORE, entry.trim()); } catch { /* ignore */ } setKeyCode(entry.trim()); }
    catch (x) { setErr(ERR[x.message] || "Couldn't reach the site. Check your connection."); }
  };

  const now = Date.now();
  const games = allGames.filter((g) => !g.exhibition && !g.multi && Number.isFinite(gameTime(g))).sort((a, b) => gameTime(a) - gameTime(b));
  const started = games.filter((g) => gameTime(g) <= now + 6 * 3600000).reverse();
  const upcoming = games.filter((g) => gameTime(g) > now + 6 * 3600000);
  const shown = showAll ? [...started, ...upcoming] : started.length ? started : upcoming.slice(0, 1);
  const rec = computeRecord();

  return (
    <section id="scores" style={{ background: "#0a0005", padding: "110px 5% 120px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="section-label"><Spade size={14} color="#840036" /> Coach Tools</div>
        <h2 className="section-title" style={{ fontSize: "clamp(40px,9vw,64px)" }}>Post<br /><span style={{ color: "var(--gold)" }}>Scores</span></h2>
        <div className="divider" />

        {!keyCode ? (
          <form onSubmit={unlock} style={{ marginTop: 26, display: "grid", gap: 12 }}>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Enter the coaches' passcode. This phone will remember it.</p>
            <input style={{ ...input, fontFamily: "'Source Sans 3',sans-serif", fontSize: 17, textAlign: "left" }} type="password" autoComplete="current-password" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Passcode" />
            <button style={btn(true)} type="submit">Unlock</button>
            {err && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "#f87171" }}>{err}</div>}
          </form>
        ) : (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Aces {rec.w}-{rec.l} <span style={{ opacity: 0.5 }}>· League {rec.cw}-{rec.cl}</span></div>
              <button style={btn(false, true)} onClick={signOut}>Sign out</button>
            </div>
            <div className="flyer-seg" style={{ display: "flex", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
              {[["scores", "Scores"], ["standings", "League table"]].map(([id, l]) => (
                <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: 12, border: "none", cursor: "pointer", fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", background: tab === id ? "rgba(132,0,54,0.55)" : "none", color: tab === id ? "#fff" : "rgba(255,255,255,0.55)" }}>{l}</button>
              ))}
            </div>
            {tab === "scores" ? (
              <div style={{ display: "grid", gap: 12 }}>
                {!started.length && !showAll && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.5)" }}>No games played yet. The next game is below; it moves to the top once it tips off.</div>}
                {shown.map((g) => <GameRow key={g.iso} g={g} keyCode={keyCode} onAuthFail={signOut} />)}
                <button style={btn(false)} onClick={() => setShowAll((v) => !v)}>{showAll ? "Show recent games only" : `Show the whole schedule (${games.length})`}</button>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                  Scrimmages and the Cactus Jam tournament aren't listed here.{live.updated ? ` Last saved ${new Date(live.updated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: NY })}.` : ""}
                </div>
              </div>
            ) : (
              <StandingsEditor keyCode={keyCode} onAuthFail={signOut} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
