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
export const LIMITS = { frames: 30, name: 60, notes: 1500, frameNote: 300, groups: 12, group: 30, playerName: 60, opponent: 60, tips: 12, tip: 200 };
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
  return {
    play: {
      name, court, category, groups, kind, opponent, lineup, clip: video, clip_link, tips,
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
export const CLIP_LINK_HOSTS = /(^|\.)(youtube\.com|youtu\.be|hudl\.com|vimeo\.com|drive\.google\.com)$/;
export function cleanClipLink(v) {
  if (typeof v !== 'string' || !v.trim()) return '';
  let u; try { u = new URL(v.trim()); } catch (e) { return ''; }
  if (u.protocol !== 'https:' || !CLIP_LINK_HOSTS.test(u.hostname)) return '';
  return clip(u.href, 400);
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
