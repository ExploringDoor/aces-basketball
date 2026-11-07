// pages/PracticePage.jsx
// Coach tool (not in the menu): open /#practice, enter YOUR OWN password once
// (the same one as scouting; the admin hands them out on /#scouting), and the
// planner shows each team's practices by week. Open a day to build it from the
// drill library: blocks with a running clock, who leads each one, groups and
// notes. Print makes the clipboard sheet. Saves go to /api/practice
// (Firestore, staff only).
import { useEffect, useMemo, useState } from "react";
import { Spade } from "../shared";
import { TEAMS, CATS, LIMITS, catLabel, cleanPlan, emptyPlan, planTotals, planId, printHtml, fmtTime, fmtDate, addDays, todayYmd } from "../../api/_practice.js";

const KEY_STORE = "aces-scouting-key"; // one coach password for both coach tools, remembered on this phone
const readLS = (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
const writeLS = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* ignore */ } };
const NY = "America/New_York";

const SANS = "'Source Sans 3',sans-serif";
const OSW = "'Oswald',sans-serif";
const label = { fontFamily: OSW, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" };
const input = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", padding: "10px 12px", fontFamily: SANS, fontSize: 15, outline: "none", colorScheme: "dark" };
const select = { ...input, appearance: "none", WebkitAppearance: "none", cursor: "pointer" };
const btn = (primary, small) => ({ fontFamily: OSW, fontSize: small ? 11 : 13, letterSpacing: 2, textTransform: "uppercase", padding: small ? "8px 12px" : "12px 18px", borderRadius: 9, cursor: "pointer", border: primary ? "none" : "1px solid rgba(255,255,255,0.18)", color: primary ? "#1a0010" : "#fff", background: primary ? "linear-gradient(135deg, #c9a44a, #b3873a)" : "rgba(255,255,255,0.05)", fontWeight: 600, whiteSpace: "nowrap" });
const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14 };
const hint = { fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "4px 0 10px" };
const ERR = { too_many_tries: "Too many wrong passwords from this connection. Wait ten minutes and try again.", wrong_passcode: "That password didn't work.", not_configured: "Practice plans aren't switched on yet.", stale: "Someone saved this plan after you opened it.", save_failed: "Couldn't save. Try again in a moment.", bad_date: "Pick a date first.", bad_id: "That plan doesn't exist.", no_such_plan: "That plan doesn't exist.", exists: "That day already has a plan for this team.", same_day: "Pick a different day to copy to.", already_there: "That drill is already in the library.", no_name: "Give the drill a name.", library_full: "The custom drill list is full.", no_such_drill: "That drill is already gone." };
const CAT_COLOR = { warmup: "#9ca3af", ballhandling: "#60a5fa", shooting: "#c9a44a", passing: "#34d399", offense: "#f59e0b", defense: "#f87171", transition: "#a78bfa", rebounding: "#fb923c", special: "#e879f9", conditioning: "#22d3ee", scrimmage: "#ffffff" };

async function api(key, body, query = "") {
  const r = await fetch(`/api/practice${query}`, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", "x-scouting-key": key }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || `http_${r.status}`); e.data = d; throw e; }
  return d;
}
const weekStart = (ymd) => { const d = new Date(`${ymd}T12:00:00Z`); const dow = (d.getUTCDay() + 6) % 7; return addDays(ymd, -dow); };
const stamp = (iso) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: NY }) : "");

/** Minutes per category as small bars. */
function CatBars({ cats, title, empty }) {
  const rows = CATS.map((c) => ({ ...c, min: cats[c.key] || 0 })).filter((c) => c.min > 0);
  const max = Math.max(1, ...rows.map((r) => r.min));
  const total = rows.reduce((s, r) => s + r.min, 0);
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div style={label}>{title}</div>
        {total > 0 && <div style={{ ...label, color: "var(--gold)" }}>{total} min</div>}
      </div>
      {!rows.length ? <div style={{ ...hint, margin: "8px 0 0" }}>{empty}</div> : (
        <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
          {rows.map((r) => (
            <div key={r.key} style={{ display: "grid", gridTemplateColumns: "118px 1fr 38px", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
              <span style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${Math.round((r.min / max) * 100)}%`, background: CAT_COLOR[r.key] || "#fff", opacity: 0.85 }} /></span>
              <span style={{ ...label, textAlign: "right", color: "rgba(255,255,255,0.7)" }}>{r.min}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrillLibrary({ keyCode, drills, custom, onChange }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ name: "", cat: "offense", minutes: 10, note: "" });
  const [msg, setMsg] = useState("");
  const act = async (body) => {
    try { const r = await api(keyCode, body); onChange(r); setMsg(""); return true; }
    catch (e) { setMsg(ERR[e.message] || "Couldn't save the drill."); return false; }
  };
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={label}>Drill library</div>
          <div style={{ ...hint, margin: "4px 0 0" }}>{drills.length} drills, {custom.length} of them yours. Anything you add shows up in every coach's picker.</div>
        </div>
        <button style={btn(false, true)} onClick={() => setOpen(!open)}>{open ? "Close" : "Add a drill"}</button>
      </div>
      {open && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 6 }}>
            <input style={input} value={d.name} maxLength={LIMITS.drill} placeholder="Drill name" onChange={(e) => setD({ ...d, name: e.target.value })} />
            <select style={select} value={d.cat} onChange={(e) => setD({ ...d, cat: e.target.value })}>{CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
            <input style={input} type="number" min={1} max={LIMITS.minutes} value={d.minutes} onChange={(e) => setD({ ...d, minutes: e.target.value })} />
          </div>
          <input style={input} value={d.note} maxLength={LIMITS.drillNote} placeholder="How it runs, in a line" onChange={(e) => setD({ ...d, note: e.target.value })} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={btn(true, true)} disabled={!d.name.trim()} onClick={async () => { if (await act({ action: "drill_add", drill: d })) setD({ name: "", cat: d.cat, minutes: 10, note: "" }); }}>Add to the library</button>
            {msg && <span style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{msg}</span>}
          </div>
          {custom.length > 0 && (
            <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
              <div style={label}>Your drills</div>
              {custom.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: SANS, fontSize: 14 }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{c.name} <span style={{ ...label, marginLeft: 6 }}>{catLabel(c.cat)} · {c.minutes} min</span></span>
                  <button style={btn(false, true)} onClick={() => { if (window.confirm(`Remove ${c.name} from the library? Plans that already use it keep it.`)) act({ action: "drill_remove", id: c.id }); }}>x</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Planner({ keyCode, user, team, setTeam, drills, custom, onDrills, onOpen, onAuthFail }) {
  const today = todayYmd();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [newDate, setNewDate] = useState(today);
  const [newStart, setNewStart] = useState("15:30");
  const [copyFrom, setCopyFrom] = useState("");
  const [copyTo, setCopyTo] = useState(addDays(today, 1));
  const [busy, setBusy] = useState(false);
  const load = async () => { try { setData(await api(keyCode, null)); setErr(""); } catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setErr(ERR[e.message] || "Couldn't load the plans. Check your connection."); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const all = (data && data.plans) || [];
  const plans = all.filter((p) => p.team === team);
  const weeks = useMemo(() => {
    const m = new Map();
    for (const p of plans) { const w = weekStart(p.date); if (!m.has(w)) m.set(w, []); m.get(w).push(p); }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [plans]);
  const lastWeek = useMemo(() => {
    const from = addDays(today, -6);
    const out = {};
    for (const p of plans) if (p.date >= from && p.date <= today) for (const [k, v] of Object.entries(p.cats || {})) out[k] = (out[k] || 0) + v;
    return out;
  }, [plans, today]);
  const existing = plans.find((p) => p.date === newDate);
  const startNew = () => {
    if (existing) { onOpen({ id: existing.id }); return; }
    onOpen({ fresh: emptyPlan(team, newDate, newStart) });
  };
  const copy = async () => {
    if (!copyFrom) return;
    setBusy(true); setErr("");
    try { const r = await api(keyCode, { action: "copy", id: copyFrom, date: copyTo, team }); onOpen({ id: r.plan.id }); }
    catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setErr(ERR[e.message] || "Couldn't copy that plan."); }
    setBusy(false);
  };
  const copyChoices = all.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TEAMS.map((t) => <button key={t} style={{ ...btn(t === team, true), padding: "9px 14px" }} onClick={() => setTeam(t)}>{t}</button>)}
      </div>
      {err && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div style={card}>
          <div style={label}>New plan</div>
          <div style={hint}>{team} on this day. If the day already has one, it opens.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <label><div style={label}>Date</div><input style={input} type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} /></label>
            <label><div style={label}>Start</div><input style={input} type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} /></label>
          </div>
          <div style={{ marginTop: 10 }}><button style={btn(true, true)} disabled={!newDate} onClick={startNew}>{existing ? "Open that day" : "Start the plan"}</button></div>
        </div>
        <div style={card}>
          <div style={label}>Copy from another day</div>
          <div style={hint}>Reuse a plan from any team as the {team} plan for a new date, then edit it.</div>
          <div style={{ display: "grid", gap: 6 }}>
            <select style={select} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
              <option value="">Pick a plan</option>
              {copyChoices.map((p) => <option key={p.id} value={p.id}>{p.team} · {fmtDate(p.date)}{p.title ? ` · ${p.title}` : ""}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
              <input style={input} type="date" value={copyTo} onChange={(e) => setCopyTo(e.target.value)} />
              <button style={btn(true, true)} disabled={!copyFrom || !copyTo || busy} onClick={copy}>Copy</button>
            </div>
          </div>
        </div>
      </div>

      <CatBars cats={lastWeek} title={`Last 7 days, ${team}`} empty={`No ${team} practice logged since ${fmtDate(addDays(today, -6))}.`} />

      {!data ? <div style={{ fontFamily: SANS, color: "rgba(255,255,255,0.5)" }}>Loading…</div> : !weeks.length ? (
        <div style={{ ...hint, margin: 0 }}>No {team} plans between {fmtDate(data.from)} and {fmtDate(data.to)} yet.</div>
      ) : weeks.map(([w, rows]) => (
        <div key={w} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={label}>Week of {fmtDate(w, { weekday: undefined })}</div>
            <div style={label}>{rows.reduce((s, p) => s + p.totals.minutes, 0)} min</div>
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {rows.map((p) => {
              const isToday = p.date === today;
              return (
                <button key={p.id} onClick={() => onOpen({ id: p.id })} style={{ display: "grid", gridTemplateColumns: "92px 1fr auto", gap: 10, alignItems: "center", textAlign: "left", background: isToday ? "rgba(201,164,74,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${isToday ? "rgba(201,164,74,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "10px 12px", color: "#fff", cursor: "pointer" }}>
                  <span>
                    <span style={{ fontFamily: OSW, fontSize: 15, letterSpacing: 1, color: isToday ? "var(--gold)" : "#fff" }}>{fmtDate(p.date)}</span>
                    <span style={{ ...label, display: "block", marginTop: 2 }}>{fmtTime(p.start)}</span>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: SANS, fontSize: 15, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title || "Untitled practice"}</span>
                    <span style={{ ...label, display: "block", marginTop: 2 }}>{p.blocks} {p.blocks === 1 ? "block" : "blocks"}{p.updated_by ? ` · ${p.updated_by}` : ""}</span>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: OSW, fontSize: 18, color: "var(--gold)" }}>{p.totals.minutes}</span>
                    <span style={{ ...label, display: "block" }}>min</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <DrillLibrary keyCode={keyCode} drills={drills} custom={custom} onChange={onDrills} />
    </div>
  );
}

/** Search the library, grouped by category, or type a name of your own. */
function DrillPicker({ drills, onPick }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const query = q.trim().toLowerCase();
  const shown = !query && !cat ? [] : drills.filter((d) => (!cat || d.cat === cat) && (!query || d.name.toLowerCase().includes(query) || (d.note || "").toLowerCase().includes(query)));
  const groups = CATS.map((c) => ({ ...c, items: shown.filter((d) => d.cat === c.key) })).filter((g) => g.items.length);
  const pick = (d) => { onPick(d); setQ(""); };
  return (
    <div style={{ ...card, borderStyle: "dashed" }}>
      <div style={label}>Add a block</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
        {CATS.map((c) => <button key={c.key} style={{ ...btn(cat === c.key, true), padding: "5px 9px", fontSize: 10 }} onClick={() => setCat(cat === c.key ? "" : c.key)}>{c.label}</button>)}
      </div>
      <input style={input} value={q} placeholder="Search the library or type your own drill" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && query) { e.preventDefault(); if (shown.length === 1) pick(shown[0]); else pick({ name: q.trim(), cat: cat || "offense", minutes: 10, note: "" }); } }} />
      {(groups.length > 0 || query) && (
        <div style={{ display: "grid", gap: 8, marginTop: 10, maxHeight: 320, overflowY: "auto" }}>
          {groups.map((g) => (
            <div key={g.key}>
              <div style={{ ...label, color: CAT_COLOR[g.key], marginBottom: 4 }}>{g.label}</div>
              {g.items.map((d) => (
                <button key={d.id} onClick={() => pick(d)} style={{ display: "flex", gap: 10, width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "7px 2px", color: "#fff", cursor: "pointer", alignItems: "baseline" }}>
                  <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" }}>{d.name}</span>
                  <span style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.5)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.note}</span>
                  <span style={{ ...label, color: "var(--gold)" }}>{d.minutes} min</span>
                </button>
              ))}
            </div>
          ))}
          {query && <button style={{ ...btn(false, true), justifySelf: "start" }} onClick={() => pick({ name: q.trim(), cat: cat || "offense", minutes: 10, note: "" })}>Add "{q.trim()}" as its own block</button>}
        </div>
      )}
    </div>
  );
}

function Editor({ keyCode, user, drills, staff, open, onBack, onDone, onAuthFail }) {
  const [plan, setPlan] = useState(open.fresh ? { ...open.fresh } : null);
  const [saved, setSaved] = useState(!open.fresh);
  const [expect, setExpect] = useState("");
  const [meta, setMeta] = useState(null);
  const [dirty, setDirty] = useState(!!open.fresh);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [stale, setStale] = useState(null);
  const [copyTo, setCopyTo] = useState("");
  const load = async () => {
    try {
      const id = open.id || planId(plan.team, plan.date);
      const d = await api(keyCode, null, `?id=${encodeURIComponent(id)}`);
      if (!d.plan) { setMsg(ERR.no_such_plan); setPlan(null); return; }
      setPlan(d.plan); setSaved(true); setExpect(d.plan.updated_at); setMeta({ at: d.plan.updated_at, by: d.plan.updated_by }); setDirty(false); setStale(null);
    } catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't load the plan."); }
  };
  useEffect(() => { if (open.id) load(); }, [open.id]); // eslint-disable-line
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const edit = (k, v) => { setPlan((p) => ({ ...p, [k]: v })); setDirty(true); setMsg(""); };
  const editBlock = (i, patch) => edit("blocks", plan.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= plan.blocks.length) return; const next = plan.blocks.slice(); [next[i], next[j]] = [next[j], next[i]]; edit("blocks", next); };
  const addBlock = (d) => { if (plan.blocks.length >= LIMITS.blocks) { setMsg(`A plan holds ${LIMITS.blocks} blocks at most.`); return; } edit("blocks", [...plan.blocks, { drill: d.name, cat: d.cat, minutes: d.minutes, who: "", groups: "", notes: "" }]); };
  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const d = await api(keyCode, { action: "save", plan, expect });
      setPlan(d.plan); setSaved(true); setExpect(d.plan.updated_at); setMeta({ at: d.plan.updated_at, by: d.plan.updated_by }); setDirty(false); setMsg("Saved.");
    } catch (e) {
      if (e.message === "wrong_passcode") onAuthFail();
      if (e.message === "stale") setStale(e.data && e.data.plan);
      // A new plan on a day that already has one: the day's plan is what is stale, not a coach's edit.
      setMsg(e.message === "stale" && !saved ? ERR.exists : ERR[e.message] || "Couldn't save. Check your connection.");
    }
    setBusy(false);
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) { setMsg("Allow pop-ups to print."); return; }
    w.document.open(); w.document.write(printHtml(plan)); w.document.close();
  };
  const copy = async () => {
    if (!copyTo) return;
    if (dirty && !window.confirm("Copy the saved version? Your unsaved changes here stay on this page.")) return;
    setBusy(true); setMsg("");
    try { const r = await api(keyCode, { action: "copy", id: planId(plan.team, plan.date), date: copyTo }); onDone({ id: r.plan.id }); }
    catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't copy the plan."); }
    setBusy(false);
  };
  const remove = async () => {
    if (!window.confirm(`Delete the ${plan.team} plan for ${fmtDate(plan.date)}? This cannot be undone.`)) return;
    setBusy(true);
    try { await api(keyCode, { action: "delete", id: planId(plan.team, plan.date) }); setDirty(false); onBack(); }
    catch (e) { if (e.message === "wrong_passcode") onAuthFail(); setMsg(ERR[e.message] || "Couldn't delete the plan."); }
    setBusy(false);
  };
  if (!plan) return <div style={{ display: "grid", gap: 10 }}><button style={{ ...btn(false, true), justifySelf: "start" }} onClick={onBack}>Back</button><div style={{ fontFamily: SANS, color: "rgba(255,255,255,0.5)" }}>{msg || "Loading…"}</div></div>;
  const totals = planTotals(plan);
  const textarea = { ...input, minHeight: 80, lineHeight: 1.5, resize: "vertical", fontFamily: SANS };
  const cell = { ...input, padding: "8px 10px", fontSize: 14, borderRadius: 8 };
  const tiny = { ...btn(false, true), padding: "6px 9px", fontSize: 10 };
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <datalist id="practice-staff">{staff.map((s) => <option key={s} value={s} />)}</datalist>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button style={btn(false, true)} onClick={() => { if (!dirty || window.confirm("Leave without saving?")) onBack(); }}>Back</button>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontFamily: OSW, fontSize: 22, textTransform: "uppercase", letterSpacing: 1 }}>{plan.team} · {fmtDate(plan.date) || "No date"}</div>
          <div style={label}>{fmtTime(plan.start)} to {fmtTime(totals.end)} · {totals.minutes} min · {plan.blocks.length} {plan.blocks.length === 1 ? "block" : "blocks"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {meta ? <div style={label}>{meta.by} · {stamp(meta.at)}</div> : <div style={label}>New plan</div>}
        </div>
      </div>

      {stale && (
        <div style={{ ...card, borderColor: "#f87171" }}>
          <div style={{ fontFamily: SANS, fontSize: 14, color: "#fff" }}>{saved ? `${stale.updated_by} saved this plan after you opened it.` : `${stale.updated_by} already built this day's plan.`} Reload to see their version (your changes here will be lost), or print yours first.</div>
          <div style={{ marginTop: 8 }}><button style={btn(true, true)} onClick={load}>Reload their version</button></div>
        </div>
      )}

      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <label><div style={label}>Team</div>
            {saved ? <div style={{ ...input, color: "rgba(255,255,255,0.6)" }}>{plan.team}</div> : <select style={select} value={plan.team} onChange={(e) => edit("team", e.target.value)}>{TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}</select>}
          </label>
          <label><div style={label}>Date</div>
            {saved ? <div style={{ ...input, color: "rgba(255,255,255,0.6)" }}>{fmtDate(plan.date)}</div> : <input style={input} type="date" value={plan.date} onChange={(e) => edit("date", e.target.value)} />}
          </label>
          <label><div style={label}>Start</div><input style={input} type="time" value={plan.start} onChange={(e) => edit("start", e.target.value)} /></label>
        </div>
        {saved && <div style={{ ...hint, margin: "6px 0 0" }}>Team and date are fixed once a plan is saved. Use Copy to date to move it.</div>}
        <div style={{ marginTop: 10 }}><div style={label}>Title</div><input style={input} value={plan.title} maxLength={LIMITS.title} placeholder="Install the shell, press break day" onChange={(e) => edit("title", e.target.value)} /></div>
        <div style={{ marginTop: 10 }}><div style={label}>Focus</div><textarea style={textarea} value={plan.focus} maxLength={LIMITS.focus} placeholder="What today is about. Goes at the top of the sheet." onChange={(e) => edit("focus", e.target.value)} /></div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {plan.blocks.map((b, i) => (
          <div key={i} style={card}>
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 64px auto", gap: 6, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: OSW, fontSize: 16, color: "var(--gold)", letterSpacing: 1 }}>{fmtTime(totals.clock[i]).replace(/ [AP]M$/, "")}</div>
                <div style={label}>{i + 1}</div>
              </div>
              <input style={cell} value={b.drill} maxLength={LIMITS.drill} placeholder="Drill" onChange={(e) => editBlock(i, { drill: e.target.value })} />
              <input style={{ ...cell, textAlign: "center" }} type="number" min={1} max={LIMITS.minutes} value={b.minutes} onChange={(e) => editBlock(i, { minutes: e.target.value })} onBlur={(e) => editBlock(i, { minutes: Math.min(LIMITS.minutes, Math.max(1, Math.round(Number(e.target.value) || 1))) })} />
              <div style={{ display: "flex", gap: 4 }}>
                <button style={tiny} disabled={i === 0} onClick={() => move(i, -1)} title="Move up">Up</button>
                <button style={tiny} disabled={i === plan.blocks.length - 1} onClick={() => move(i, 1)} title="Move down">Down</button>
                <button style={tiny} onClick={() => edit("blocks", plan.blocks.filter((_, j) => j !== i))} title="Remove">x</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 6, marginTop: 6 }}>
              <select style={{ ...select, ...cell, color: CAT_COLOR[b.cat] || "#fff" }} value={b.cat} onChange={(e) => editBlock(i, { cat: e.target.value })}>{CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
              <input style={cell} list="practice-staff" value={b.who} maxLength={LIMITS.who} placeholder="Who leads it" onChange={(e) => editBlock(i, { who: e.target.value })} />
              <input style={cell} value={b.groups} maxLength={LIMITS.groups} placeholder="Groups: guards with Matt, bigs with Gallman" onChange={(e) => editBlock(i, { groups: e.target.value })} />
            </div>
            <input style={{ ...cell, marginTop: 6 }} value={b.notes} maxLength={LIMITS.notes} placeholder="Notes for the sheet" onChange={(e) => editBlock(i, { notes: e.target.value })} />
          </div>
        ))}
        {!plan.blocks.length && <div style={{ ...hint, margin: 0 }}>No blocks yet. Pick drills below; each one starts where the last one ends.</div>}
        <DrillPicker drills={drills} onPick={addBlock} />
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div style={label}>Totals</div>
          <div style={{ fontFamily: OSW, fontSize: 16, letterSpacing: 1 }}>{totals.minutes} min · ends <span style={{ color: "var(--gold)" }}>{fmtTime(totals.end)}</span></div>
        </div>
        <div style={{ marginTop: 10 }}><div style={label}>Equipment</div><input style={input} value={plan.equipment} maxLength={LIMITS.equipment} placeholder="Cones, 6 balls, chairs, pinnies" onChange={(e) => edit("equipment", e.target.value)} /></div>
        <div style={{ marginTop: 10 }}><div style={label}>After practice</div><textarea style={textarea} value={plan.after} maxLength={LIMITS.after} placeholder="What worked, what did not, who stood out. The sheet leaves a box for this." onChange={(e) => edit("after", e.target.value)} /></div>
      </div>

      {saved && (
        <div style={{ ...card, display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
          <label style={{ flex: 1, minWidth: 160 }}><div style={label}>Copy to date</div><input style={input} type="date" value={copyTo} onChange={(e) => setCopyTo(e.target.value)} /></label>
          <button style={btn(false)} disabled={!copyTo || busy} onClick={copy}>Copy</button>
          <button style={{ ...btn(false), color: "#f87171", marginLeft: "auto" }} disabled={busy} onClick={remove}>Delete</button>
        </div>
      )}

      <div style={{ position: "sticky", bottom: 0, background: "rgba(10,0,5,0.92)", backdropFilter: "blur(6px)", padding: "12px 0", display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
        <button style={{ ...btn(true), opacity: busy || !dirty ? 0.6 : 1 }} disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : dirty ? "Save plan" : "Saved"}</button>
        <button style={btn(false)} onClick={print}>Print sheet</button>
        <span style={{ fontFamily: SANS, fontSize: 13, color: msg === "Saved." ? "var(--gold)" : "#f87171" }}>{msg}</span>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [keyCode, setKeyCode] = useState(() => readLS(KEY_STORE));
  const [me, setMe] = useState(null);
  const [entry, setEntry] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);
  const [team, setTeam] = useState(TEAMS[0]);
  const [lib, setLib] = useState({ drills: [], custom: [] });
  const [staff, setStaff] = useState([]);
  // A remembered password is checked on load, so a coach whose password was
  // changed is asked for the new one instead of seeing errors on every save.
  useEffect(() => {
    if (!keyCode) { setMe(null); return; }
    api(keyCode, { action: "check" }).then((d) => { setMe(d.me); setStaff(d.staff || []); }).catch((e) => { if (e.message === "wrong_passcode") { writeLS(KEY_STORE, ""); setKeyCode(""); } });
  }, [keyCode]);
  useEffect(() => {
    if (!me) return;
    api(keyCode, null, "?drills=1").then((d) => setLib({ drills: d.drills || [], custom: d.custom || [] })).catch(() => {});
  }, [me]); // eslint-disable-line
  const signOut = () => { writeLS(KEY_STORE, ""); setKeyCode(""); setMe(null); setOpen(null); };
  const unlock = async (e) => {
    e.preventDefault(); setErr("");
    try { const d = await api(entry.trim(), { action: "check" }); writeLS(KEY_STORE, entry.trim()); setKeyCode(entry.trim()); setMe(d.me); setStaff(d.staff || []); }
    catch (x) { setErr(ERR[x.message] || "Couldn't reach the site. Check your connection."); }
  };
  const user = me ? me.name : "";
  return (
    <section id="practice" style={{ background: "#0a0005", padding: "110px 5% 120px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="section-label"><Spade size={14} color="#840036" /> Coach Tools</div>
        <h2 className="section-title" style={{ fontSize: "clamp(40px,9vw,64px)" }}>Practice<br /><span style={{ color: "var(--gold)" }}>Plans</span></h2>
        <div className="divider" />
        {!keyCode ? (
          <form onSubmit={unlock} style={{ marginTop: 26, display: "grid", gap: 12, maxWidth: 420 }}>
            <p style={{ fontFamily: SANS, fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Enter your coach password, the same one as scouting. This phone will remember it.</p>
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
            {open
              ? <Editor key={open.id || "new"} keyCode={keyCode} user={user} drills={lib.drills} staff={staff} open={open} onBack={() => setOpen(null)} onDone={(o) => setOpen(o)} onAuthFail={signOut} />
              : <Planner keyCode={keyCode} user={user} team={team} setTeam={setTeam} drills={lib.drills} custom={lib.custom} onDrills={(r) => setLib({ drills: r.drills || [], custom: r.custom || [] })} onOpen={setOpen} onAuthFail={signOut} />}
          </div>
        )}
      </div>
    </section>
  );
}
