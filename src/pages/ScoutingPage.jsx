// pages/ScoutingPage.jsx
// Coach tool (not in the menu): open /scouting, enter YOUR OWN password once
// (Grugan47!: the admin hands them out from this page), and the board shows
// every opponent on the schedule with who is scouting them. Open an opponent to
// fill in the report: overview, personnel, offense, defense, special
// situations, keys to win, matchups, film links. Print makes the one-page
// handout for players. Saves go to /api/scouting (Firestore, staff only).
import { useEffect, useMemo, useState } from "react";
import { Spade, allGames, roster, teamLogos } from "../shared";
import { DEFAULT_STAFF, STATUSES, STATUS_LABEL, SECTIONS, PERSONNEL_FIELDS, LIMITS, opponentsFrom, emptyReport, completeness, printHtml } from "../../api/_scouting.js";

const KEY_STORE = "aces-scouting-key"; // this coach's own password, remembered on this phone
const readLS = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
const writeLS = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* ignore */ } };
const NY = "America/New_York";
const dayLabel = (g) => (g && g.iso ? new Date(g.iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: NY }) : (g && g.date) || "");

const SANS = "'Source Sans 3',sans-serif";
const OSW = "'Oswald',sans-serif";
const label = { fontFamily: OSW, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" };
const input = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontFamily: SANS, fontSize: 15, outline: "none" };
const select = { ...input, appearance: "none", WebkitAppearance: "none", cursor: "pointer" };
const btn = (primary, small) => ({ fontFamily: OSW, fontSize: small ? 11 : 13, letterSpacing: 2, textTransform: "uppercase", padding: small ? "8px 12px" : "12px 18px", borderRadius: 9, cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.18)", color: primary ? "#1a0010" : "#fff", background: primary ? "linear-gradient(135deg, #c9a44a, #b3873a)" : "rgba(255,255,255,0.05)", fontWeight: 600, whiteSpace: "nowrap" });
const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 };
const STATUS_COLOR = { not_started: "rgba(255,255,255,0.35)", in_progress: "#fbbf24", ready: "#4ade80" };
const ERR = { too_many_tries: "Too many wrong passwords from this connection. Wait ten minutes and try again.", wrong_passcode: "That password didn't work.", not_configured: "Scouting isn't switched on yet.", stale: "Someone saved this report after you opened it.", save_failed: "Couldn't save. Try again in a moment.", bad_opp: "That opponent isn't on the schedule.", admin_only: "Only the admin can change the staff list.", already_there: "That coach is already on the list.", bad_code: "A password needs 4 to 24 characters.", code_taken: "Another coach already has that password.", staff_full: "The staff list is full." };

async function api(key, user, body, query = "") {
  const r = await fetch(`/api/scouting${query}`, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", "x-scouting-key": key }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || `http_${r.status}`); e.data = d; throw e; }
  return d;
}

function Logo({ opp, size = 36 }) {
  const src = teamLogos[opp];
  return (
    <span style={{ width: size, height: size, borderRadius: 10, background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {src ? <img src={src} alt="" style={{ width: size - 6, height: size - 6, objectFit: "contain" }} /> : <span style={{ fontFamily: OSW, fontSize: 12, color: "#840036", fontWeight: 700 }}>{opp.slice(0, 2).toUpperCase()}</span>}
    </span>
  );
}

function Board({ keyCode, user, onOpen, onAuthFail }) {
  const opponents = useMemo(() => opponentsFrom(allGames), []);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [mine, setMine] = useState(false);
  const [editStaff, setEditStaff] = useState(false);
  const [newName, setNewName] = useState("");
  const [setting, setSetting] = useState({});
  const load = async () => { try { setData(await api(keyCode, user)); setErr(""); } catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setErr(ERR[e.message] || "Couldn't load the board. Check your connection."); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const staffRows = (data && data.staff) || DEFAULT_STAFF.map((name) => ({ name }));
  const staff = staffRows.map((c) => c.name);
  const isAdmin = !!(data && data.me && data.me.role === "admin");
  const assign = async (slug, patch) => {
    const cur = (data && data.assignments && data.assignments[slug]) || { scout: "", helper: "", status: "not_started" };
    const next = { ...cur, ...patch };
    setData((d) => ({ ...d, assignments: { ...(d ? d.assignments : {}), [slug]: next } }));
    try { const r = await api(keyCode, user, { action: "assign", slug, ...next }); setData((d) => ({ ...d, assignments: r.assignments })); }
    catch (e) { setErr(ERR[e.message] || "Couldn't save that."); load(); }
  };
  const staffAction = async (body) => {
    try { const r = await api(keyCode, user, body); setData((d) => ({ ...d, staff: r.staff })); setErr(""); return true; }
    catch (e) { setErr(ERR[e.message] || "Couldn't save the staff list."); return false; }
  };
  const shareText = () => staffRows.filter((c) => c.code).map((c) => `${c.name}: ${c.code}`).join("\n");
  const copyCodes = async () => { try { await navigator.clipboard.writeText(`Aces scouting, aceshoops.com/scouting\n${shareText()}`); setErr(""); } catch { setErr("Couldn't copy. Select the list and copy it by hand."); } };
  const rows = opponents.filter((o) => !mine || [(data && data.assignments && data.assignments[o.slug]) || {}].some((a) => a.scout === user || a.helper === user));
  const counts = {};
  for (const o of opponents) { const a = data && data.assignments && data.assignments[o.slug]; if (a && a.scout) counts[a.scout] = (counts[a.scout] || 0) + 1; }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
      <style>{`@media (max-width: 600px) { .sc-ctl { grid-template-columns: 1fr 1fr 1fr !important; } .sc-ctl > button { grid-column: 1 / -1; } .sc-ctl select { padding: 10px 8px !important; font-size: 14px !important; } }`}</style>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {staff.map((s) => <span key={s} style={{ ...label, color: s === user ? "var(--gold)" : "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 10px" }}>{s} · {counts[s] || 0}</span>)}
        {isAdmin && <button style={btn(false, true)} onClick={() => setEditStaff(!editStaff)}>{editStaff ? "Close" : "Staff and passwords"}</button>}
        <label style={{ ...label, display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", cursor: "pointer" }}><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Just mine</label>
      </div>
      {editStaff && isAdmin && (
        <div style={card}>
          <div style={label}>Staff and passwords</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" }}>Each coach signs in with their own password. Hand these out one to one. New code makes a fresh one; you can also type one in and Set it.</div>
          <div style={{ display: "grid", gap: 8 }}>
            {staffRows.map((c) => (
              <div key={c.name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto auto", gap: 6, alignItems: "center" }}>
                <span style={{ fontFamily: SANS, fontSize: 15, color: c.name === user ? "var(--gold)" : "#fff" }}>{c.name}</span>
                <input style={{ ...input, padding: "7px 10px", fontFamily: OSW, letterSpacing: 1 }} value={setting[c.name] != null ? setting[c.name] : (c.code || "")} placeholder="no password yet" onChange={(e) => setSetting((p) => ({ ...p, [c.name]: e.target.value }))} />
                <button style={btn(false, true)} disabled={setting[c.name] == null || setting[c.name] === c.code} onClick={async () => { if (await staffAction({ action: "staff_set", name: c.name, code: setting[c.name] })) setSetting((p) => { const n = { ...p }; delete n[c.name]; return n; }); }}>Set</button>
                <button style={btn(false, true)} onClick={() => { if (window.confirm(`Give ${c.name} a new password? The old one stops working.`)) staffAction({ action: "staff_code", name: c.name }); }}>New</button>
                <button style={btn(false, true)} onClick={() => { if (window.confirm(`Remove ${c.name} from the staff list?`)) staffAction({ action: "staff_remove", name: c.name }); }}>x</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6 }}>
              <input style={input} value={newName} placeholder="Add a coach" maxLength={LIMITS.name} onChange={(e) => setNewName(e.target.value)} />
              <button style={btn(true, true)} disabled={!newName.trim()} onClick={async () => { if (await staffAction({ action: "staff_add", name: newName.trim() })) setNewName(""); }}>Add</button>
            </div>
            <div><button style={btn(false, true)} onClick={copyCodes}>Copy the list to share</button></div>
          </div>
        </div>
      )}
      {err && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{err}</div>}
      {rows.map((o) => {
        const a = (data && data.assignments && data.assignments[o.slug]) || { scout: "", helper: "", status: "not_started" };
        const rep = data && data.reports && data.reports[o.slug];
        const past = !o.next;
        return (
          <div key={o.slug} style={{ ...card, opacity: past ? 0.55 : 1 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Logo opp={o.opp} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: OSW, fontSize: 18, textTransform: "uppercase", letterSpacing: 1 }}>{o.opp}{o.conf ? <span style={{ ...label, marginLeft: 8 }}>League</span> : null}</div>
                <div style={{ ...label, marginTop: 2 }}>{o.next ? `${o.next.home ? "vs" : o.next.neutral ? "vs" : "@"} · ${dayLabel(o.next)} · ${o.next.time}` : "Season series done"}{o.games.length > 1 ? ` · ${o.games.length} games` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: OSW, fontSize: 12, letterSpacing: 1.5, color: STATUS_COLOR[a.status] }}>{STATUS_LABEL[a.status]}</div>
                {rep && rep.updated_at ? <div style={{ ...label, marginTop: 2 }}>{rep.pct}% · {rep.updated_by}</div> : null}
              </div>
            </div>
            <div className="sc-ctl" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginTop: 12, alignItems: "end" }}>
              <label><div style={label}>Scout</div><select style={select} value={a.scout} onChange={(e) => assign(o.slug, { scout: e.target.value })}><option value="">Unassigned</option>{staff.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label><div style={label}>Helper</div><select style={select} value={a.helper} onChange={(e) => assign(o.slug, { helper: e.target.value })}><option value="">None</option>{staff.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label><div style={label}>Status</div><select style={select} value={a.status} onChange={(e) => assign(o.slug, { status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
              <button style={{ ...btn(true), height: 44 }} onClick={() => onOpen(o)}>Report</button>
            </div>
          </div>
        );
      })}
      {!rows.length && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Nothing assigned to you yet.</div>}
    </div>
  );
}

function Personnel({ rows, onChange }) {
  const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const blank = () => Object.fromEntries(PERSONNEL_FIELDS.map((f) => [f.key, ""]));
  const cell = { ...input, padding: "7px 8px", fontSize: 14, borderRadius: 7 };
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "0 -14px", padding: "0 14px" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 4, minWidth: 940 }}>
        <thead><tr>{PERSONNEL_FIELDS.map((f) => <th key={f.key} style={{ ...label, textAlign: "left", padding: "0 4px", width: f.width }}>{f.label}</th>)}<th /></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {PERSONNEL_FIELDS.map((f) => (
                <td key={f.key} style={{ width: f.width }}>
                  {f.key === "hand" ? (
                    <select style={{ ...cell, appearance: "none" }} value={r.hand || ""} onChange={(e) => set(i, "hand", e.target.value)}><option value="">?</option><option value="R">R</option><option value="L">L</option></select>
                  ) : f.key === "role" ? (
                    <select style={{ ...cell, appearance: "none" }} value={r.role || ""} onChange={(e) => set(i, "role", e.target.value)}><option value="">?</option><option>Starter</option><option>Rotation</option><option>Bench</option><option>Injured</option></select>
                  ) : (
                    <input style={{ ...cell, width: f.width }} value={r[f.key] || ""} maxLength={f.size} placeholder={f.key === "notes" ? "Shooter, drives right, posts up" : f.key === "guard" ? "Go under, force left, no help" : ""} onChange={(e) => set(i, f.key, e.target.value)} />
                  )}
                </td>
              ))}
              <td><button style={btn(false, true)} onClick={() => onChange(rows.filter((_, j) => j !== i))} title="Remove">x</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length < LIMITS.personnel && <button style={{ ...btn(false, true), marginTop: 6 }} onClick={() => onChange([...rows, blank()])}>Add player</button>}
    </div>
  );
}

function ListEditor({ items, onChange, placeholder, max, numbered }) {
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {items.map((k, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {numbered && <span style={{ ...label, width: 18 }}>{i + 1}.</span>}
          <input style={input} value={k} maxLength={LIMITS.key} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
          <button style={btn(false, true)} onClick={() => onChange(items.filter((_, j) => j !== i))}>x</button>
        </div>
      ))}
      {items.length < max && <div><button style={btn(false, true)} onClick={() => onChange([...items, ""])}>Add</button></div>}
    </div>
  );
}

function Report({ keyCode, user, opp, onBack, onAuthFail }) {
  const [report, setReport] = useState(null);
  const [expect, setExpect] = useState("");
  const [meta, setMeta] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [stale, setStale] = useState(null);
  const load = async () => {
    try {
      const d = await api(keyCode, user, null, `?opp=${encodeURIComponent(opp.slug)}`);
      const r = d.report || emptyReport(opp.opp);
      setReport(r); setExpect(d.report ? d.report.updated_at : ""); setMeta(d.report ? { at: d.report.updated_at, by: d.report.updated_by } : null); setDirty(false); setStale(null);
    } catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't load the report."); }
  };
  useEffect(() => { load(); }, [opp.slug]); // eslint-disable-line
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const edit = (k, v) => { setReport((r) => ({ ...r, [k]: v })); setDirty(true); setMsg(""); };
  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const d = await api(keyCode, user, { action: "save", slug: opp.slug, opp: opp.opp, expect, report });
      setReport(d.report); setExpect(d.report.updated_at); setMeta({ at: d.report.updated_at, by: d.report.updated_by }); setDirty(false); setMsg("Saved.");
    } catch (e) {
      if (e.message === "wrong_passcode") onAuthFail();
      if (e.message === "stale") setStale(e.data && e.data.report);
      setMsg(ERR[e.message] || "Couldn't save. Check your connection.");
    }
    setBusy(false);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) { setMsg("Allow pop-ups to print."); return; }
    w.document.open(); w.document.write(printHtml(report, opp.opp, opp.next)); w.document.close();
  };
  if (!report) return <div style={{ fontFamily: SANS, color: "rgba(255,255,255,0.5)" }}>{msg || "Loading…"}</div>;
  const pct = completeness(report);
  const textarea = { ...input, minHeight: 120, lineHeight: 1.5, resize: "vertical", fontFamily: SANS };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
      <style>{`@media (max-width: 600px) { .sc-mu { grid-template-columns: 1fr 1fr auto !important; } .sc-mu input { grid-column: 1 / 3; grid-row: 2; } }`}</style>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button style={btn(false, true)} onClick={() => { if (!dirty || window.confirm("Leave without saving?")) onBack(); }}>Back</button>
        <Logo opp={opp.opp} size={44} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontFamily: OSW, fontSize: 22, textTransform: "uppercase", letterSpacing: 1 }}>{opp.opp}</div>
          <div style={label}>{opp.games.map((g) => `${g.home ? "vs" : g.neutral ? "vs" : "@"} ${dayLabel(g)}${g.result ? ` (${g.result.us}-${g.result.them})` : ""}`).join(" · ")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: OSW, fontSize: 13, letterSpacing: 1.5, color: "var(--gold)" }}>{pct}% complete</div>
          {meta ? <div style={label}>{meta.by} · {new Date(meta.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: NY })}</div> : <div style={label}>New report</div>}
        </div>
      </div>

      {stale && (
        <div style={{ ...card, borderColor: "#f87171" }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: "#fff" }}>{stale.updated_by} saved this report after you opened it. Reload to see their version (your changes here will be lost), or copy what you wrote first.</div>
          <div style={{ marginTop: 8 }}><button style={btn(true, true)} onClick={load}>Reload their version</button></div>
        </div>
      )}

      <div style={card}>
        <div style={label}>Their personnel</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" }}>Starters first. Tendencies are what he does; how we guard him is what we do about it. This table goes on the players' handout.</div>
        <Personnel rows={report.personnel} onChange={(v) => edit("personnel", v)} />
      </div>

      {SECTIONS.map((s) => (
        <div key={s.key} style={card}>
          <div style={label}>{s.label}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" }}>{s.hint}</div>
          <textarea style={textarea} value={report[s.key]} maxLength={LIMITS.section} onChange={(e) => edit(s.key, e.target.value)} />
        </div>
      ))}

      <div style={card}>
        <div style={label}>Keys to the game</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" }}>Three to five. These lead the players' handout.</div>
        <ListEditor items={report.keys} onChange={(v) => edit("keys", v)} placeholder="Keep #23 off the glass" max={LIMITS.keys} numbered />
      </div>

      <div style={card}>
        <div style={label}>Matchups</div>
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
          {report.matchups.map((m, i) => (
            <div key={i} className="sc-mu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto", gap: 6 }}>
              <select style={select} value={m.ours} onChange={(e) => edit("matchups", report.matchups.map((x, j) => (j === i ? { ...x, ours: e.target.value } : x)))}><option value="">Aces</option>{roster.map((p) => <option key={p.number} value={`#${p.number} ${p.name}`}>#{p.number} {p.name}</option>)}</select>
              <select style={select} value={m.theirs} onChange={(e) => edit("matchups", report.matchups.map((x, j) => (j === i ? { ...x, theirs: e.target.value } : x)))}><option value="">Them</option>{report.personnel.filter((p) => p.name).map((p) => <option key={p.num + p.name} value={`#${p.num} ${p.name}`}>#{p.num} {p.name}</option>)}</select>
              <input style={input} value={m.note} maxLength={LIMITS.key} placeholder="Note" onChange={(e) => edit("matchups", report.matchups.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
              <button style={btn(false, true)} onClick={() => edit("matchups", report.matchups.filter((_, j) => j !== i))}>x</button>
            </div>
          ))}
          {report.matchups.length < LIMITS.matchups && <div><button style={btn(false, true)} onClick={() => edit("matchups", [...report.matchups, { ours: "", theirs: "", note: "" }])}>Add matchup</button></div>}
        </div>
      </div>

      <div style={card}>
        <div style={label}>Film and links</div>
        <div style={{ marginTop: 10 }}><ListEditor items={report.links} onChange={(v) => edit("links", v)} placeholder="https://hudl.com/..." max={LIMITS.links} /></div>
        {report.links.filter((l) => /^https?:\/\//.test(l)).length > 0 && <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>{report.links.filter((l) => /^https?:\/\//.test(l)).map((l, i) => <a key={i} href={l} target="_blank" rel="noreferrer" style={{ ...btn(false, true), textDecoration: "none" }}>Open link {i + 1}</a>)}</div>}
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "rgba(10,0,5,0.92)", backdropFilter: "blur(6px)", padding: "12px 0", display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button style={{ ...btn(true), opacity: busy || !dirty ? 0.6 : 1 }} disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : dirty ? "Save report" : "Saved"}</button>
        <button style={btn(false)} onClick={print}>Print handout</button>
        <span style={{ fontFamily: SANS, fontSize: 13, color: msg === "Saved." ? "var(--gold)" : "#f87171" }}>{msg}</span>
      </div>
    </div>
  );
}

export default function ScoutingPage() {
  const [keyCode, setKeyCode] = useState(() => readLS(KEY_STORE));
  const [me, setMe] = useState(null);
  const [entry, setEntry] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  // A remembered password is checked on load, so a coach whose password was
  // changed is asked for the new one instead of seeing errors on every save.
  useEffect(() => {
    if (!keyCode) { setMe(null); return; }
    api(keyCode, "", { action: "check" }).then((d) => setMe(d.me)).catch((e) => { if (e.message === "wrong_passcode") { writeLS(KEY_STORE, ""); setKeyCode(""); } });
  }, [keyCode]);
  const signOut = () => { writeLS(KEY_STORE, ""); setKeyCode(""); setMe(null); setOpen(null); };
  const unlock = async (e) => {
    e.preventDefault(); setErr("");
    try { const d = await api(entry.trim(), "", { action: "check" }); writeLS(KEY_STORE, entry.trim()); setKeyCode(entry.trim()); setMe(d.me); }
    catch (x) { setErr(ERR[x.message] || "Couldn't reach the site. Check your connection."); }
  };
  const user = me ? me.name : "";
  return (
    <section id="scouting" style={{ background: "#0a0005", padding: "110px 5% 120px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="section-label"><Spade size={14} color="#840036" /> Coach Tools</div>
        <h2 className="section-title" style={{ fontSize: "clamp(40px,9vw,64px)" }}>Opponent<br /><span style={{ color: "var(--gold)" }}>Scouting</span></h2>
        <div className="divider" />
        {!keyCode ? (
          <form onSubmit={unlock} style={{ marginTop: 26, display: "grid", gap: 12, maxWidth: 420 }}>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Enter your scouting password. This phone will remember it.</p>
            <input style={input} type="password" autoComplete="current-password" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Password" />
            <button style={btn(true)} type="submit">Unlock</button>
            {err && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{err}</div>}
          </form>
        ) : !me ? (
          <div style={{ marginTop: 26, fontFamily: SANS, color: "rgba(255,255,255,0.5)" }}>Checking your password…</div>
        ) : (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ ...label, color: "rgba(255,255,255,0.6)" }}>Signed in as <span style={{ color: "var(--gold)" }}>{user}</span></span>
              <button style={btn(false, true)} onClick={signOut}>Sign out</button>
            </div>
            {open ? <Report keyCode={keyCode} user={user} opp={open} onBack={() => setOpen(null)} onAuthFail={signOut} /> : <Board keyCode={keyCode} user={user} onOpen={setOpen} onAuthFail={signOut} />}
          </div>
        )}
      </div>
    </section>
  );
}
