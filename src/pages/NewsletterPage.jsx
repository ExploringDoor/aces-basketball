// pages/NewsletterPage.jsx
// Admin tool (not in the menu): open /#newsletter, enter the admin password
// once, and write this week's Aces Weekly: pick the week, the games come in
// from the schedule with any live scores, add a note and a player of the game,
// switch sections on or off, watch the preview, send a test to yourself, then
// send to every family. The subscriber list lives on the same page.
// Sends go through /api/newsletter (Firestore + SendGrid, admin only).
import { useEffect, useMemo, useRef, useState } from "react";
import { Spade, allGames, teamLogos, loadLive } from "../shared";
import { LIMITS, weekLabelFor } from "../../api/_newsletter.js";

const KEY_STORE = "aces-admin-key";
const readLS = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
const writeLS = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* ignore */ } };
const NY = "America/New_York";
const dayLabel = (g) => (g && g.iso ? new Date(g.iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: NY }) : (g && g.date) || "");
const SITE = "https://aces-basketball.vercel.app";

const SANS = "'Source Sans 3',sans-serif";
const OSW = "'Oswald',sans-serif";
const label = { fontFamily: OSW, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" };
const input = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontFamily: SANS, fontSize: 15, outline: "none" };
const btn = (primary, small) => ({ fontFamily: OSW, fontSize: small ? 11 : 13, letterSpacing: 2, textTransform: "uppercase", padding: small ? "8px 12px" : "12px 18px", borderRadius: 9, cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.18)", color: primary ? "#1a0010" : "#fff", background: primary ? "linear-gradient(135deg, #c9a44a, #b3873a)" : "rgba(255,255,255,0.05)", fontWeight: 600, whiteSpace: "nowrap" });
const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 };
const hint = { fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" };
const ERR = { send_in_progress: "This issue is already going out. Give it a few minutes, then check Recent issues.", unauthorized: "That password didn't work.", not_configured: "The newsletter isn't switched on yet.", email_not_configured: "Email isn't set up on the server yet.", no_content: "Write a note or pick a game first.", no_subscribers: "Nobody is on the list yet.", no_emails: "No email addresses found in that text.", bad_email: "That email address doesn't look right.", send_failed: "The test email didn't go out.", save_failed: "Couldn't save. Try again in a moment." };

async function api(key, body, query = "") {
  const r = await fetch(`/api/newsletter${query}`, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", "x-admin-key": key }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || `http_${r.status}`); e.data = d; throw e; }
  return d;
}

// Dates as YYYY-MM-DD in New York, so "today" is the team's today.
const ymd = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: NY });
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(Date.now());
const gameDay = (g) => (g.iso ? ymd(new Date(g.iso)) : "");

/** The schedule rows the email can use, with any live score attached. */
function weekGames(from, to) {
  const lo = from, hi = addDays(to, 7);
  return allGames
    .filter((g) => !g.multi && !g.exhibition && g.iso)
    .filter((g) => { const d = gameDay(g); return d >= lo && d <= hi; })
    .map((g) => ({ opp: g.opp, date: g.date, time: g.time, iso: g.iso, home: !!g.home, neutral: !!g.neutral, conf: !!g.conf, venue: g.venue || "", logo: teamLogos[g.opp] || "", us: g.result ? g.result.us : null, them: g.result ? g.result.them : null }))
    .filter((g) => (g.us != null ? gameDay(g) <= to : true));
}

function Subscribers({ keyCode, data, setData, onAuthFail }) {
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const subs = (data && data.subscribers) || [];
  const active = subs.filter((s) => s.status === "active");
  const run = async (body, ok) => {
    setBusy(true); setMsg("");
    try { const r = await api(keyCode, body); setData((d) => ({ ...d, subscribers: r.subscribers })); setMsg(ok(r)); return true; }
    catch (e) { if (e.message === "unauthorized") onAuthFail(); setMsg(ERR[e.message] || "Couldn't save. Check your connection."); return false; }
    finally { setBusy(false); }
  };
  const rows = showAll ? subs : subs.slice(0, 12);
  const copyLink = async () => { try { await navigator.clipboard.writeText(`${SITE}/#news`); setMsg("Sign-up link copied."); } catch { setMsg("Couldn't copy. The link is " + SITE + "/#news"); } };
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <div style={label}>Subscribers</div>
        <div style={{ fontFamily: OSW, fontSize: 22, color: "var(--gold)" }}>{active.length}<span style={{ ...label, marginLeft: 8 }}>on the list</span></div>
      </div>
      <div style={hint}>Families sign up on the News page. You can also paste a list of addresses here, names and commas and all.</div>
      <div style={{ display: "grid", gap: 6 }}>
        {rows.map((s) => (
          <div key={s.email} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", fontFamily: SANS, fontSize: 14 }}>
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: s.status === "active" ? "#fff" : "rgba(255,255,255,0.4)", textDecoration: s.status === "active" ? "none" : "line-through" }}>{s.email}{s.name ? <span style={{ color: "rgba(255,255,255,0.45)" }}> {s.name}</span> : null}</span>
            <span style={{ ...label, color: s.status === "active" ? "rgba(255,255,255,0.45)" : "#f87171" }}>{s.status === "active" ? s.source || "site" : "unsubscribed"}</span>
            <button style={btn(false, true)} disabled={busy} onClick={() => { if (window.confirm(`Remove ${s.email} from the list?`)) run({ action: "remove", email: s.email }, () => "Removed."); }}>x</button>
          </div>
        ))}
        {!subs.length && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Nobody yet. Share the sign-up link.</div>}
        {subs.length > 12 && <div><button style={btn(false, true)} onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `Show all ${subs.length}`}</button></div>}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={label}>Add addresses</div>
        <textarea style={{ ...input, minHeight: 80, marginTop: 6, resize: "vertical" }} value={paste} placeholder={"Jane Doe <jane@example.com>, bob@example.com ..."} onChange={(e) => setPaste(e.target.value)} />
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button style={btn(true, true)} disabled={busy || !paste.trim()} onClick={async () => { if (await run({ action: "add", emails: paste }, (r) => `Found ${r.found}: ${r.added} added, ${r.existing} already on the list${r.unsubscribed ? `, ${r.unsubscribed} unsubscribed and left alone` : ""}.`)) setPaste(""); }}>Add to the list</button>
          <button style={btn(false, true)} onClick={copyLink}>Copy the sign-up link</button>
          <span style={{ fontFamily: SANS, fontSize: 13, color: /copied|added|Removed/i.test(msg) ? "var(--gold)" : "#f87171" }}>{msg}</span>
        </div>
      </div>
    </div>
  );
}

function Composer({ keyCode, data, setData, onAuthFail }) {
  const [from, setFrom] = useState(() => addDays(today(), -6));
  const [to, setTo] = useState(() => today());
  const [intro, setIntro] = useState("");
  const [pog, setPog] = useState({ name: "", line: "", photoUrl: "" });
  const [sections, setSections] = useState({ results: true, upcoming: true, player: true, fundraiser: true, store: false });
  const [skip, setSkip] = useState({});           // iso -> true when a game is unticked
  const [preview, setPreview] = useState(null);     // { subject, html }
  const [previewErr, setPreviewErr] = useState("");
  const [tick, setTick] = useState(0);
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const timer = useRef(null);
  useEffect(() => {
    loadLive(true);
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("aces-live", bump);
    return () => window.removeEventListener("aces-live", bump);
  }, []);
  const candidates = useMemo(() => weekGames(from, to), [from, to, tick]); // eslint-disable-line
  const games = candidates.filter((g) => !skip[g.iso]);
  const content = { from, to, intro, games, playerOfGame: pog, sections };
  const contentKey = JSON.stringify(content);
  const active = ((data && data.subscribers) || []).filter((s) => s.status === "active").length;
  const hasContent = !!(intro.trim() || games.length || pog.name.trim());

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { setPreview(await api(keyCode, { action: "preview", ...content })); setPreviewErr(""); }
      catch (e) { if (e.message === "unauthorized") onAuthFail(); setPreviewErr(ERR[e.message] || "Couldn't build the preview."); }
    }, 500);
    return () => clearTimeout(timer.current);
  }, [contentKey]); // eslint-disable-line

  const send = async (test) => {
    if (!test && !window.confirm(`Send this issue to ${active} ${active === 1 ? "family" : "families"} now?`)) return;
    setBusy(test ? "test" : "send"); setMsg("");
    try {
      const r = await api(keyCode, { action: "send", ...content, ...(test ? { testTo } : {}) });
      if (test) setMsg(`Test sent to ${testTo.trim().toLowerCase()}.`);
      else { setMsg(`Sent to ${r.sent} of ${r.total}${r.failed ? `, ${r.failed} failed` : ""}.${r.skipped ? ` ${r.skipped} newer sign-ups are past the 500 limit and did not get this issue.` : ""}`); setData((d) => ({ ...d, sends: r.sends })); }
    } catch (e) { if (e.message === "unauthorized") onAuthFail(); setMsg(ERR[e.message] || "Couldn't send. Check your connection."); }
    setBusy("");
  };
  const toggle = (k) => setSections((s) => ({ ...s, [k]: !s[k] }));
  const played = candidates.filter((g) => g.us != null), upcoming = candidates.filter((g) => g.us == null);
  const toggleRow = (k, text) => (
    <label style={{ ...label, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: sections[k] ? "var(--gold)" : "rgba(255,255,255,0.45)" }}><input type="checkbox" checked={!!sections[k]} onChange={() => toggle(k)} /> {text}</label>
  );
  const gameRow = (g) => (
    <label key={g.iso} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center", cursor: "pointer", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <input type="checkbox" checked={!skip[g.iso]} onChange={() => setSkip((s) => ({ ...s, [g.iso]: !s[g.iso] }))} />
      <span style={{ fontFamily: SANS, fontSize: 14, color: skip[g.iso] ? "rgba(255,255,255,0.4)" : "#fff" }}>{g.home || g.neutral ? "vs" : "at"} {g.opp}<span style={{ color: "rgba(255,255,255,0.45)" }}> {dayLabel(g)}{g.us == null ? `, ${g.time}` : ""}</span></span>
      {g.us != null && <span style={{ fontFamily: OSW, fontSize: 13, letterSpacing: 1.5, color: g.us > g.them ? "#4ade80" : "#f87171" }}>{g.us > g.them ? "W" : "L"} {g.us} to {g.them}</span>}
    </label>
  );
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={card}>
        <div style={label}>The week</div>
        <div style={hint}>Results from these dates, then the games in the seven days after. Untick any game you want to leave out.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "end" }}>
          <label><div style={label}>From</div><input style={input} type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} /></label>
          <label><div style={label}>Through</div><input style={input} type="date" value={to} onChange={(e) => e.target.value && setTo(e.target.value)} /></label>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button style={btn(false, true)} onClick={() => { setFrom(addDays(today(), -6)); setTo(today()); }}>Last 7 days</button>
          <button style={btn(false, true)} onClick={() => { setFrom(today()); setTo(addDays(today(), 6)); }}>This week</button>
          <span style={{ ...label, alignSelf: "center", color: "var(--gold)" }}>{weekLabelFor(from, to)}</span>
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
          {played.length > 0 && <div style={{ ...label, marginTop: 6 }}>Results</div>}
          {played.map(gameRow)}
          {upcoming.length > 0 && <div style={{ ...label, marginTop: 6 }}>Coming up</div>}
          {upcoming.map(gameRow)}
          {!candidates.length && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>No games in this window. Scores posted on the Scores page show up here.</div>}
        </div>
      </div>

      <div style={card}>
        <div style={label}>A note from the program</div>
        <div style={hint}>Opens the email. Practice changes, the bus, the booster meeting, a thank you.</div>
        <textarea style={{ ...input, minHeight: 130, lineHeight: 1.5, resize: "vertical" }} value={intro} maxLength={LIMITS.intro} placeholder="Aces families," onChange={(e) => setIntro(e.target.value)} />
      </div>

      <div style={card}>
        <div style={label}>Player of the game</div>
        <div style={hint}>Leave the name blank to skip the card. The photo is a link to a picture, or a site path like /players/first-last.jpg.</div>
        <div style={{ display: "grid", gap: 8 }}>
          <input style={input} value={pog.name} maxLength={LIMITS.playerName} placeholder="Name" onChange={(e) => setPog({ ...pog, name: e.target.value })} />
          <input style={input} value={pog.line} maxLength={LIMITS.playerLine} placeholder="24 points, 9 rebounds and the game winner against Chester" onChange={(e) => setPog({ ...pog, line: e.target.value })} />
          <input style={input} value={pog.photoUrl} maxLength={LIMITS.url} placeholder="Photo link (optional)" onChange={(e) => setPog({ ...pog, photoUrl: e.target.value })} />
        </div>
      </div>

      <div style={card}>
        <div style={label}>Sections</div>
        <div style={hint}>The Shoot-a-Thon bar uses the live totals and only shows while the event is open. The store tiles link to the shop page.</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {toggleRow("results", "Results")}
          {toggleRow("upcoming", "This week")}
          {toggleRow("player", "Player of the game")}
          {toggleRow("fundraiser", "Shoot-a-Thon")}
          {toggleRow("store", "Team store")}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
          <div style={label}>Preview</div>
          {preview && <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.6)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Subject: <span style={{ color: "#fff" }}>{preview.subject}</span></div>}
        </div>
        {previewErr && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171", marginTop: 6 }}>{previewErr}</div>}
        <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", background: "#f4f1ec", border: "1px solid rgba(255,255,255,0.1)" }}>
          <iframe title="Aces Weekly preview" srcDoc={preview ? preview.html : "<p style='font-family:Arial;color:#888;padding:20px'>Building the preview</p>"} sandbox="" style={{ width: "100%", height: 720, border: 0, display: "block", background: "#f4f1ec" }} />
        </div>
      </div>

      <div style={{ ...card, position: "sticky", bottom: 0, background: "rgba(10,0,5,0.96)", backdropFilter: "blur(6px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
          <input style={input} type="email" value={testTo} placeholder="Send a test to your own email" onChange={(e) => setTestTo(e.target.value)} />
          <button style={btn(false)} disabled={!!busy || !hasContent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim())} onClick={() => send(true)}>{busy === "test" ? "Sending" : "Send test"}</button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <button style={{ ...btn(true), opacity: busy || !hasContent || !active ? 0.6 : 1 }} disabled={!!busy || !hasContent || !active} onClick={() => send(false)}>{busy === "send" ? "Sending" : `Send to ${active} ${active === 1 ? "family" : "families"}`}</button>
          <span style={{ fontFamily: SANS, fontSize: 13, color: /^(Sent|Test sent)/.test(msg) ? "var(--gold)" : "#f87171" }}>{msg}</span>
          {!hasContent && <span style={{ ...label }}>Write a note or pick a game to send</span>}
        </div>
      </div>

      {data && data.sends && data.sends.length > 0 && (
        <div style={card}>
          <div style={label}>Recent issues</div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {data.sends.map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, fontFamily: SANS, fontSize: 14 }}>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subject}</span>
                <span style={{ ...label, color: s.failed ? "#f87171" : "rgba(255,255,255,0.45)" }}>{new Date(s.at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: NY })} · {s.sent} sent{s.failed ? `, ${s.failed} failed` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  const [keyCode, setKeyCode] = useState(() => readLS(KEY_STORE));
  const [data, setData] = useState(null);
  const [entry, setEntry] = useState("");
  const [err, setErr] = useState("");
  // The remembered password is checked on load, so a changed password asks
  // again instead of failing on every save.
  useEffect(() => {
    if (!keyCode) { setData(null); return; }
    api(keyCode, null, "?admin=1").then(setData).catch((e) => { if (e.message === "unauthorized") { writeLS(KEY_STORE, ""); setKeyCode(""); } else setErr(ERR[e.message] || "Couldn't load the list. Check your connection."); });
  }, [keyCode]);
  const signOut = () => { writeLS(KEY_STORE, ""); setKeyCode(""); setData(null); };
  const unlock = async (e) => {
    e.preventDefault(); setErr("");
    try { await api(entry.trim(), { action: "check" }); writeLS(KEY_STORE, entry.trim()); setKeyCode(entry.trim()); }
    catch (x) { setErr(ERR[x.message] || "Couldn't reach the site. Check your connection."); }
  };
  return (
    <section id="newsletter" style={{ background: "#0a0005", padding: "110px 5% 120px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="section-label"><Spade size={14} color="#840036" /> Admin Tools</div>
        <h2 className="section-title" style={{ fontSize: "clamp(40px,9vw,64px)" }}>Aces<br /><span style={{ color: "var(--gold)" }}>Weekly</span></h2>
        <div className="divider" />
        {!keyCode ? (
          <form onSubmit={unlock} style={{ marginTop: 26, display: "grid", gap: 12, maxWidth: 420 }}>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Enter the admin password. This device will remember it.</p>
            <input style={input} type="password" autoComplete="current-password" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Password" />
            <button style={btn(true)} type="submit">Unlock</button>
            {err && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{err}</div>}
          </form>
        ) : !data ? (
          <div style={{ marginTop: 26, fontFamily: SANS, color: err ? "#f87171" : "rgba(255,255,255,0.5)" }}>{err || "Loading the list"}</div>
        ) : (
          <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...label, color: "rgba(255,255,255,0.6)" }}>Signed in as <span style={{ color: "var(--gold)" }}>Admin</span>{data.emailReady === false ? <span style={{ color: "#f87171", marginLeft: 10 }}>Email is not set up on the server</span> : null}</span>
              <button style={btn(false, true)} onClick={signOut}>Sign out</button>
            </div>
            <Composer keyCode={keyCode} data={data} setData={setData} onAuthFail={signOut} />
            <Subscribers keyCode={keyCode} data={data} setData={setData} onAuthFail={signOut} />
          </div>
        )}
      </div>
    </section>
  );
}
