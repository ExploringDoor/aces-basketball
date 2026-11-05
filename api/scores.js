// Vercel Serverless Function: /api/scores
// Live game scores + Central League standings, posted by coaches from a phone
// (the hidden /#scores page) instead of editing the site code.
//
// Storage: the "aces-scores" Vercel Blob store (BLOB_READ_WRITE_TOKEN is set
// by Vercel when the store is linked). Every save is its own NEW, never-changed
// file whose NAME carries the change, e.g.
//   scores/ev/1764892800000-ab12~set~2026-12-04T19.00.00-05.00~61~55
// Reading = list the files and apply them in time order. Nothing is ever
// overwritten, so two coaches saving at once can't lose each other's score.
// ⚠ Tested 11/4/26: overwriting one shared file is NOT safe on Blob (reads lag
// the write and ifMatch let concurrent saves through), so don't go back to that.
// Listing can lag a save by a few seconds; the saver's own response includes
// its change, and the public GET is cached ~10s anyway.
// GET  -> { games: { [iso]: { us, them, at } }, standings: { [team]: { confW, confL, w, l } }, updated }
// POST (header x-scores-key = SCORES_PASSCODE or ADMIN_PASSWORD)
//   { action: "check" }                        verify the passcode
//   { action: "set", iso, us, them }           save a final score
//   { action: "clear", iso }                   remove a score
//   { action: "standings", rows: { team: {...} } }   replace the league table
import { put, list } from "@vercel/blob";

const PREFIX = process.env.SCORES_PREFIX || "scores/live-"; // tests use their own prefix
const TEAMS = ["Lower Merion", "Conestoga", "Garnet Valley", "Harriton", "Haverford", "Marple Newtown", "Penncrest", "Radnor", "Ridley", "Springfield", "Strath Haven", "Upper Darby"];

function ctEq(a, b) {
  a = String(a || ""); b = String(b || "");
  if (!a || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const authed = (req) => {
  const k = req.headers["x-scores-key"] || "";
  return ctEq(k, process.env.SCORES_PASSCODE) || ctEq(k, process.env.ADMIN_PASSWORD);
};
const configured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const EV = () => `${PREFIX}ev/`;
const isoToName = (iso) => iso.replace(/:/g, ".");
const nameToIso = (n) => n.replace(/\./g, ":");
const encStandings = (rows) => TEAMS.map((t, i) => (rows[t] ? `${i}.${rows[t].confW}.${rows[t].confL}.${rows[t].w}.${rows[t].l}` : "")).filter(Boolean).join("_") || "none";
const decStandings = (s) => {
  const out = {};
  if (s === "none") return out;
  for (const part of s.split("_")) { const [i, a, b, c, d] = part.split(".").map(Number); if (TEAMS[i]) out[TEAMS[i]] = { confW: a, confL: b, w: c, l: d }; }
  return out;
};

// One change -> one file name (and back).
const eventName = (ev) => {
  const stamp = `${ev.t}-${Math.random().toString(36).slice(2, 8)}`;
  if (ev.type === "set") return `${EV()}${stamp}~set~${isoToName(ev.iso)}~${ev.us}~${ev.them}`;
  if (ev.type === "clear") return `${EV()}${stamp}~clear~${isoToName(ev.iso)}`;
  return `${EV()}${stamp}~standings~${encStandings(ev.rows)}`;
};
const parseEvent = (pathname) => {
  const name = pathname.slice(EV().length);
  const [stamp, type, ...rest] = name.split("~");
  const t = Number(stamp.split("-")[0]);
  if (!Number.isFinite(t)) return null;
  if (type === "set") return { t, stamp, type, iso: nameToIso(rest[0]), us: Number(rest[1]), them: Number(rest[2]) };
  if (type === "clear") return { t, stamp, type, iso: nameToIso(rest[0]) };
  if (type === "standings") return { t, stamp, type, rows: decStandings(rest[0] || "none") };
  return null;
};

async function events() {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix: EV(), cursor, limit: 1000 });
    for (const b of r.blobs) { const e = parseEvent(b.pathname); if (e) out.push(e); }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

function reduce(evs) {
  const d = { games: {}, standings: {}, updated: null };
  evs.sort((a, b) => a.t - b.t || a.stamp.localeCompare(b.stamp));
  for (const e of evs) {
    if (e.type === "set") d.games[e.iso] = { us: e.us, them: e.them, at: new Date(e.t).toISOString() };
    else if (e.type === "clear") delete d.games[e.iso];
    else if (e.type === "standings") d.standings = e.rows;
    d.updated = new Date(e.t).toISOString();
  }
  return d;
}

const readCurrent = async () => ({ data: reduce(await events()) });

// Save one change. The reply includes it even if the listing hasn't caught up yet.
async function save(ev) {
  ev.t = Date.now();
  const pathname = eventName(ev);
  await put(pathname, JSON.stringify(ev), { access: "public", addRandomSuffix: false, contentType: "application/json" });
  const evs = await events();
  const mine = parseEvent(pathname);
  if (!evs.some((e) => e.stamp === mine.stamp)) evs.push(mine);
  return reduce(evs);
}

const int = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 250 ? n : null; };
const validIso = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && s.length <= 40;

export default async function handler(req, res) {
  if (!configured()) return res.status(503).json({ error: "not_configured" });

  if (req.method === "GET") {
    try {
      const { data } = await readCurrent();
      res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
      return res.status(200).json(data);
    } catch (e) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "read_failed" });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  res.setHeader("Cache-Control", "no-store");
  if (!authed(req)) { await new Promise((r) => setTimeout(r, 600)); return res.status(401).json({ error: "wrong_passcode" }); }

  const b = (req.body && typeof req.body === "object") ? req.body : {};
  try {
    if (b.action === "check") return res.status(200).json({ ok: true });
    let out;
    if (b.action === "set") {
      const us = int(b.us), them = int(b.them);
      if (!validIso(b.iso) || us == null || them == null) return res.status(400).json({ error: "bad_score" });
      if (us === them) return res.status(400).json({ error: "tie_not_allowed" });
      out = await save({ type: "set", iso: b.iso, us, them });
    } else if (b.action === "clear") {
      if (!validIso(b.iso)) return res.status(400).json({ error: "bad_game" });
      out = await save({ type: "clear", iso: b.iso });
    } else if (b.action === "standings") {
      const rows = b.rows && typeof b.rows === "object" ? b.rows : {};
      const next = {};
      for (const t of TEAMS) {
        const r = rows[t]; if (!r) continue;
        const v = { confW: int(r.confW), confL: int(r.confL), w: int(r.w), l: int(r.l) };
        if (Object.values(v).some((x) => x == null)) return res.status(400).json({ error: "bad_standings", team: t });
        next[t] = v;
      }
      out = await save({ type: "standings", rows: next });
    }
    if (out) return res.status(200).json(out);
    return res.status(400).json({ error: "unknown_action" });
  } catch (e) {
    if (process.env.SCORES_DEBUG) console.error("scores save failed:", e && e.name, e && e.message);
    return res.status(502).json({ error: "save_failed" });
  }
}
