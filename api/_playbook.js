// Team Playbook: shared pure logic (validation + player session tokens), unit tested.
//
// A play is a list of FRAMES. Frame 0 is the starting setup; every later frame is where
// everyone ends up after that action. The viewer animates frame i-1 → frame i, so a move,
// a dribble, a screen, a pass (ball holder changes) and a shot (ball → 'rim') all come from
// the difference between two frames. Nothing is stored twice.

import crypto from 'node:crypto';
import { clip, stripTags } from './_clinic.js';

export const CATEGORIES = ['Offense', 'Defense', 'Baseline out', 'Sideline out', 'Press break', 'Press', 'Late game', 'Special'];
export const TOKENS = ['O1', 'O2', 'O3', 'O4', 'O5', 'X1', 'X2', 'X3', 'X4', 'X5'];
export const MOVE_TYPES = ['cut', 'dribble', 'screen'];
export const LIMITS = { frames: 30, name: 60, notes: 1500, frameNote: 300, groups: 12, group: 30, playerName: 60, opponent: 60, tips: 12, tip: 200, marks: 20, mark: 160, keys: 10, key: 200, matchups: 12, personnel: 15, blocks: 24, note: 600, points: 6, point: 160, stations: 4 };
export const DRILL_CATEGORIES = ['Warmup', 'Ballhandling', 'Passing', 'Shooting', 'Finishing', 'Defense', 'Rebounding', 'Transition', 'Press', 'Plays', 'Special situations', 'Competitive', 'Conditioning', 'Team', 'Other'];
export const KINDS = ['ours', 'scout'];   // our play, or an opponent's play we are scouting
// Court units are tenths of a foot. Half court 50 x 42 ft (high school), full 50 x 84.
// Tokens may sit up to 5 ft out of bounds (inbounders).
export const COURT = { half: { w: 500, h: 420 }, full: { w: 500, h: 840 }, margin: 50 };
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L

export function newCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return s;
}
export function normCode(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); }

function num(v, lo, hi) { const n = Number(v); if (!Number.isFinite(n)) return null; return Math.round(Math.min(hi, Math.max(lo, n)) * 10) / 10; }
function pt(v, court) {
  if (!Array.isArray(v) || v.length !== 2) return null;
  const m = COURT.margin, c = COURT[court];
  const x = num(v[0], -m, c.w + m), y = num(v[1], -m, c.h + m);
  return x == null || y == null ? null : [x, y];
}
export function cleanGroup(g) { return clip(stripTags(String(g || '').trim()), LIMITS.group); }
export function cleanName(n, max = LIMITS.name) { return clip(stripTags(String(n || '').replace(/\s+/g, ' ').trim()), max); }

// Returns { play } or { error }. Never trusts the browser's shape.
export function cleanPlay(p) {
  if (!p || typeof p !== 'object') return { error: 'bad_play' };
  const name = cleanName(p.name);
  if (!name) return { error: 'missing_name' };
  const court = p.court === 'full' ? 'full' : 'half';
  const category = CATEGORIES.includes(p.category) ? p.category : 'Offense';
  const frames = Array.isArray(p.frames) ? p.frames.slice(0, LIMITS.frames) : [];
  if (!frames.length) return { error: 'no_frames' };
  const out = [];
  for (const f of frames) {
    const pos = {};
    for (const id of TOKENS) {
      const v = f && f.pos ? pt(f.pos[id], court) : null;
      if (v) pos[id] = v;
    }
    const moves = {};
    for (const id of Object.keys(pos)) {
      const m = f.moves && f.moves[id];
      if (!m) continue;
      const t = MOVE_TYPES.includes(m.t) ? m.t : 'cut';
      const c = m.c ? pt(m.c, court) : null;
      if (t !== 'cut' || c) moves[id] = c ? { t, c } : { t };
    }
    let ball = f && f.ball;
    if (ball !== 'rim' && !(ball && pos[ball])) ball = '';
    out.push({
      pos, moves, ball,
      passFirst: !!(f && f.passFirst),
      note: clip(stripTags(String((f && f.note) || '').trim()), LIMITS.frameNote),
    });
  }
  if (!Object.keys(out[0].pos).length) return { error: 'empty_court' };
  const groups = [...new Set((Array.isArray(p.groups) ? p.groups : []).map(cleanGroup).filter(Boolean))].slice(0, LIMITS.groups);
  const kind = KINDS.includes(p.kind) ? p.kind : 'ours';
  const opponent = kind === 'scout' ? cleanName(p.opponent, LIMITS.opponent) : '';
  if (kind === 'scout' && !opponent) return { error: 'missing_opponent' };
  // Who plays each spot: token id → roster player id. Our plays fill the O spots, a scouted
  // play can name our defenders on the X spots. Names are resolved when the play is read.
  const lineup = {};
  for (const id of TOKENS) {
    const v = p.lineup && p.lineup[id];
    if (typeof v === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(v)) lineup[id] = v;
  }
  // A video of the play being run: either a clip the coach uploaded to our Blob store, or a
  // link to YouTube / Hudl / Vimeo / Google Drive. Anything else is dropped.
  const video = cleanClip(p.clip);
  const clip_link = cleanClipLink(p.clip_link);
  // Coach's tips: short bullets shown in their own box, one per line in the editor.
  const tips = (Array.isArray(p.tips) ? p.tips : String(p.tips || '').split('\n'))
    .map((t) => clip(stripTags(String(t || '').replace(/^\s*[-•*]\s*/, '').trim()), LIMITS.tip)).filter(Boolean).slice(0, LIMITS.tips);
  const due = cleanDate(p.due);
  // Sideline signal: the call word and a photo of the hand signal (Blob playbook/photos/...).
  const signal = { call: cleanName(p.signal && p.signal.call, 30), photo: cleanPhoto(p.signal && p.signal.photo) };
  // Film moments: "2:14 5 was late on the screen". Seconds into the clip plus a note.
  const marks = (Array.isArray(p.marks) ? p.marks : []).map((m) => ({ t: Math.max(0, Math.min(36000, Math.round(Number(m && m.t) || 0))), text: clip(stripTags(String((m && m.text) || '').trim()), LIMITS.mark) }))
    .filter((m) => m.text).sort((a, b) => a.t - b.t).slice(0, LIMITS.marks);
  return {
    play: {
      name, court, category, groups, kind, opponent, lineup, clip: video, clip_link, tips, due, marks, signal,
      notes: clip(stripTags(String(p.notes || '').trim()), LIMITS.notes),
      visible: !!p.visible,
      frames: out,
    },
  };
}

export function cleanClip(c) {
  if (!c || typeof c !== 'object' || typeof c.url !== 'string') return null;
  let u; try { u = new URL(c.url); } catch (e) { return null; }
  if (u.protocol !== 'https:' || !/\.public\.blob\.vercel-storage\.com$/.test(u.hostname) || !/^\/playbook\/clips\//.test(u.pathname)) return null;
  return { url: u.href, pathname: clip(String(c.pathname || u.pathname.slice(1)), 300), name: cleanName(c.name, 120), size: Math.max(0, Math.round(Number(c.size) || 0)), type: clip(String(c.type || ''), 60) };
}
// A headshot the coach uploaded to our Blob store (playbook/photos/...). Anything else is dropped.
export function cleanPhoto(v) {
  if (typeof v !== 'string' || !v) return '';
  let u; try { u = new URL(v); } catch (e) { return ''; }
  if (u.protocol !== 'https:' || !/\.public\.blob\.vercel-storage\.com$/.test(u.hostname) || !/^\/playbook\/photos\//.test(u.pathname)) return '';
  return clip(u.href, 400);
}
export const CLIP_LINK_HOSTS = /(^|\.)(youtube\.com|youtu\.be|hudl\.com|vimeo\.com|drive\.google\.com)$/;
export function cleanClipLink(v) {
  if (typeof v !== 'string' || !v.trim()) return '';
  let u; try { u = new URL(v.trim()); } catch (e) { return ''; }
  if (u.protocol !== 'https:' || !CLIP_LINK_HOSTS.test(u.hostname)) return '';
  return clip(u.href, 400);
}

export function cleanDate(v) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || '').trim()); return m && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1 && +m[3] <= 31 ? m[0] : ''; }
const idOk = (v) => typeof v === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(v);
const lines = (v, n, max) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((t) => clip(stripTags(String(t || '').replace(/^\s*[-•*\d.)]+\s*/, '').trim()), n)).filter(Boolean).slice(0, max);

// A game plan for one opponent: the plays to know, their guys, matchups and keys.
export function cleanPlan(p) {
  if (!p || typeof p !== 'object') return { error: 'bad_plan' };
  const opponent = cleanName(p.opponent, LIMITS.opponent);
  if (!opponent) return { error: 'missing_opponent' };
  return { plan: {
    opponent, date: cleanDate(p.date), title: cleanName(p.title, 80),
    where: ['home', 'away', 'neutral'].includes(p.where) ? p.where : '',
    keys: lines(p.keys, LIMITS.key, LIMITS.keys),
    our_plays: [...new Set((Array.isArray(p.our_plays) ? p.our_plays : []).filter(idOk))].slice(0, 30),
    their_plays: [...new Set((Array.isArray(p.their_plays) ? p.their_plays : []).filter(idOk))].slice(0, 30),
    matchups: (Array.isArray(p.matchups) ? p.matchups : []).map((m) => ({ us: idOk(m && m.us) ? m.us : '', them: cleanName(m && m.them, 60), note: clip(stripTags(String((m && m.note) || '').trim()), LIMITS.key) })).filter((m) => m.us || m.them).slice(0, LIMITS.matchups),
    personnel: (Array.isArray(p.personnel) ? p.personnel : []).map((x) => ({ num: clip(stripTags(String((x && x.num) || '').trim()), 3), name: cleanName(x && x.name, 40), pos: clip(stripTags(String((x && x.pos) || '').trim()), 4), notes: clip(stripTags(String((x && x.notes) || '').trim()), 300), guard: clip(stripTags(String((x && x.guard) || '').trim()), 300), photo: cleanPhoto(x && x.photo) })).filter((x) => x.name || x.num).slice(0, LIMITS.personnel),
    things: lines(p.things, LIMITS.key, 3),   // the three things every player must know about them
    notes: clip(stripTags(String(p.notes || '').trim()), LIMITS.notes),
    visible: !!p.visible,
  } };
}

// A practice plan: blocks of minutes, each with the plays it works on.
export function cleanPractice(p) {
  if (!p || typeof p !== 'object') return { error: 'bad_practice' };
  const date = cleanDate(p.date);
  if (!date) return { error: 'missing_date' };
  const blocks = (Array.isArray(p.blocks) ? p.blocks : []).map((b) => ({
    name: cleanName(b && b.name, 80),
    minutes: Math.max(0, Math.min(240, Math.round(Number(b && b.minutes) || 0))),
    notes: clip(stripTags(String((b && b.notes) || '').trim()), LIMITS.note),
    play_ids: [...new Set((Array.isArray(b && b.play_ids) ? b.play_ids : []).filter(idOk))].slice(0, 12),
    drill: clip(String((b && b.drill) || '').replace(/[^A-Za-z0-9_-]/g, ''), 60),   // library key or custom drill id
    category: DRILL_CATEGORIES.includes(b && b.category) ? b.category : 'Other',
    points: lines(b && b.points, LIMITS.point, LIMITS.points),
    // Split the gym: guards on one drill, bigs on another, running at the same time.
    stations: (Array.isArray(b && b.stations) ? b.stations : []).map((st) => ({ name: cleanName(st && st.name, 40), drill: cleanName(st && st.drill, 80), notes: clip(stripTags(String((st && st.notes) || '').trim()), 200) })).filter((st) => st.name || st.drill).slice(0, LIMITS.stations),
  })).filter((b) => b.name).slice(0, LIMITS.blocks);
  return { practice: {
    date, title: cleanName(p.title, 80), start: /^\d{2}:\d{2}$/.test(String(p.start || '')) ? String(p.start) : '',
    focus: clip(stripTags(String(p.focus || '').trim()), 300),
    blocks, notes: clip(stripTags(String(p.notes || '').trim()), LIMITS.notes),
    show_players: !!p.show_players,
  } };
}

// A coach's own drill, saved next to the built-in library.
export function cleanDrill(d) {
  if (!d || typeof d !== 'object') return { error: 'bad_drill' };
  const name = cleanName(d.name, 80);
  if (!name) return { error: 'missing_name' };
  return { drill: {
    name, category: DRILL_CATEGORIES.includes(d.category) ? d.category : 'Other',
    minutes: Math.max(1, Math.min(120, Math.round(Number(d.minutes) || 10))),
    players: clip(stripTags(String(d.players || '').trim()), 30),
    equipment: clip(stripTags(String(d.equipment || '').trim()), 120),
    setup: clip(stripTags(String(d.setup || '').trim()), 600),
    run: clip(stripTags(String(d.run || '').trim()), 900),
    points: lines(d.points, LIMITS.point, LIMITS.points),
    variations: clip(stripTags(String(d.variations || '').trim()), 600),
  } };
}

// A game's box score, typed in or imported from Hudl. One line per player.
export const STAT_KEYS = ['min', 'pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'oreb', 'dreb', 'reb', 'ast', 'stl', 'blk', 'to', 'pf'];
export const STAT_LABELS = { min: 'MIN', pts: 'PTS', fgm: 'FGM', fga: 'FGA', tpm: '3PM', tpa: '3PA', ftm: 'FTM', fta: 'FTA', oreb: 'OREB', dreb: 'DREB', reb: 'REB', ast: 'AST', stl: 'STL', blk: 'BLK', to: 'TO', pf: 'PF' };
const statInt = (v, max) => { const n = Math.round(Number(String(v == null ? '' : v).replace(/[^0-9.-]/g, '')) || 0); return Math.max(0, Math.min(max, n)); };
export function cleanGame(g) {
  if (!g || typeof g !== 'object') return { error: 'bad_game' };
  const date = cleanDate(g.date);
  if (!date) return { error: 'missing_date' };
  const opponent = cleanName(g.opponent, LIMITS.opponent);
  if (!opponent) return { error: 'missing_opponent' };
  const lines = (Array.isArray(g.lines) ? g.lines : []).map((l) => {
    const row = { player_id: idOk(l && l.player_id) ? l.player_id : '', name: cleanName(l && l.name, 60), num: clip(stripTags(String((l && l.num) || '').trim()), 3) };
    STAT_KEYS.forEach((k) => { row[k] = statInt(l && l[k], k === 'min' ? 60 : 200); });
    if (!row.reb && (row.oreb || row.dreb)) row.reb = row.oreb + row.dreb;
    if (!row.pts && (row.fgm || row.ftm)) row.pts = 2 * (row.fgm - row.tpm) + 3 * row.tpm + row.ftm;
    return row;
  }).filter((l) => l.name || l.player_id).slice(0, 20);
  return { game: {
    date, opponent, where: ['home', 'away', 'neutral'].includes(g.where) ? g.where : '',
    us: statInt(g.us, 200), them: statInt(g.them, 200),
    kind: ['game', 'scrimmage', 'tournament'].includes(g.kind) ? g.kind : 'game',
    source: ['hudl', 'manual', 'maxpreps', 'other'].includes(g.source) ? g.source : 'manual',
    notes: clip(stripTags(String(g.notes || '').trim()), 300),
    lines,
  } };
}

// Calendar feeds: one private iCal URL per group (Varsity, JV). Google's or our Apps Script feed.
export function cleanFeeds(list) {
  return (Array.isArray(list) ? list : []).map((f) => {
    let u; try { u = new URL(String((f && f.url) || '').trim().replace(/^webcal:/i, 'https:')); } catch (e) { return null; }
    if (u.protocol !== 'https:') return null;
    return { group: cleanGroup(f && f.group), url: clip(u.href, 600) };
  }).filter(Boolean).slice(0, 6);
}
// Minimal iCal parse: VEVENT summary, location, start (date or datetime, with or without Z).
export function parseIcs(text, now = Date.now(), limit = 8) {
  const out = [];
  const blocks = String(text || '').replace(/\r\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1);
  for (const b of blocks) {
    const get = (k) => { const m = new RegExp('^' + k + '(?:;[^:\\n]*)?:(.*)$', 'm').exec(b); return m ? m[1].trim() : ''; };
    const ds = get('DTSTART'); if (!ds) continue;
    const allDay = /^\d{8}$/.test(ds);
    const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/.exec(ds); if (!m) continue;
    const tzid = (/DTSTART;[^:]*TZID=([^:;]+)/.exec(b) || [])[1] || '';
    // Floating/TZID times are read as US Eastern (the team's zone); Z times are UTC.
    let t;
    if (m[7]) t = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
    else if (allDay) t = Date.UTC(+m[1], +m[2] - 1, +m[3], 12);
    else { const local = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)); t = local + easternOffsetMs(local); }
    if (t < now - 3 * 36e5) continue;
    out.push({ at: new Date(t).toISOString(), allDay, title: get('SUMMARY').replace(/\\,/g, ',').replace(/\\n/g, ' ').slice(0, 120), where: get('LOCATION').replace(/\\,/g, ',').slice(0, 160), tz: tzid });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at)).slice(0, limit);
}
// How many ms to ADD to a naive Eastern wall-clock time to get UTC (EST +5h, EDT +4h).
export function easternOffsetMs(utcGuess) {
  const d = new Date(utcGuess);
  const y = d.getUTCFullYear();
  const second = (m, dow) => { const first = new Date(Date.UTC(y, m, 1)); const off = (dow - first.getUTCDay() + 7) % 7; return Date.UTC(y, m, 1 + off + 7, 7); };   // 2am local ≈ 7 UTC
  const first = (m, dow) => { const f = new Date(Date.UTC(y, m, 1)); const off = (dow - f.getUTCDay() + 7) % 7; return Date.UTC(y, m, 1 + off, 6); };
  const dstStart = second(2, 0), dstEnd = first(10, 0);
  return (utcGuess >= dstStart && utcGuess < dstEnd) ? 4 * 36e5 : 5 * 36e5;
}

export const NOTE_KINDS = ['note', 'injury', 'absent', 'late', 'kudos'];
export function cleanNote(n) {
  if (!n || typeof n !== 'object') return { error: 'bad_note' };
  const text = clip(stripTags(String(n.text || '').replace(/\s+/g, ' ').trim()), LIMITS.note);
  const kind = NOTE_KINDS.includes(n.kind) ? n.kind : 'note';
  if (!text && kind === 'note') return { error: 'empty_note' };
  return { note: { kind, text, date: cleanDate(n.date) || new Date().toISOString().slice(0, 10) } };
}

// Can this player see this play?
export function canSee(play, player) {
  if (!play || play.archived || !play.visible) return false;
  const g = Array.isArray(play.groups) ? play.groups : [];
  return !g.length || g.includes(player.group || '');
}

// ── Player session tokens ───────────────────────────────────────────────
// HMAC signed, so the browser can't forge one. The player doc is re-read on every request,
// so turning a player's access off (or giving them a new code) takes effect immediately:
// the token carries the code it was issued for and stops working when the code changes.
export const SESSION_DAYS = 30;
function secret() {
  const base = process.env.PLAYBOOK_SECRET || process.env.ADMIN_PASSWORD || '';
  return base ? crypto.createHmac('sha256', base).update('aces-playbook-session-v1').digest() : null;
}
const b64 = (s) => Buffer.from(s).toString('base64url');
function codeTag(code) { return crypto.createHash('sha256').update('pb:' + code).digest('base64url').slice(0, 10); }
export function signSession(player, now = Date.now()) {
  const key = secret(); if (!key) return null;
  const body = b64(JSON.stringify({ p: player.id, k: codeTag(player.code), e: now + SESSION_DAYS * 864e5 }));
  return body + '.' + crypto.createHmac('sha256', key).update(body).digest('base64url');
}
export function readSession(token, now = Date.now()) {
  const key = secret(); if (!key) return null;
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const want = crypto.createHmac('sha256', key).update(body).digest('base64url');
  if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  let d; try { d = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!d || typeof d.p !== 'string' || !(d.e > now)) return null;
  return d;
}
export function sessionMatches(sess, player) {
  return !!(sess && player && player.active && !player.removed && sess.k === codeTag(player.code));
}
