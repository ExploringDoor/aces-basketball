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
export const LIMITS = { frames: 30, name: 60, notes: 1500, frameNote: 300, groups: 12, group: 30, playerName: 60, opponent: 60, tips: 12, tip: 200, marks: 20, mark: 160, keys: 10, key: 200, matchups: 12, personnel: 15, blocks: 24, note: 600, points: 6, point: 160, stations: 4, reads: 8, read: 160 };
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
  const situations = [...new Set((Array.isArray(p.situations) ? p.situations : []).map(String).filter((k) => SITUATION_KEYS.includes(k)))].slice(0, 6);
  const audio = cleanAudio(p.audio);
  const signal = { call: cleanName(p.signal && p.signal.call, 30), photo: cleanPhoto(p.signal && p.signal.photo) };
  // Film moments: "2:14 5 was late on the screen". Seconds into the clip plus a note.
  const marks = (Array.isArray(p.marks) ? p.marks : []).map((m) => ({ t: Math.max(0, Math.min(36000, Math.round(Number(m && m.t) || 0))), text: clip(stripTags(String((m && m.text) || '').trim()), LIMITS.mark) }))
    .filter((m) => m.text).sort((a, b) => a.t - b.t).slice(0, LIMITS.marks);
  // Reads: "if they do X, we do Y", pinned to a step. Players get quizzed on them (Read the defense).
  const reads = (Array.isArray(p.reads) ? p.reads : []).map((r) => ({
    when: clip(stripTags(String((r && r.when) || '').trim()), LIMITS.read),
    then: clip(stripTags(String((r && r.then) || '').trim()), LIMITS.read),
    frame: Math.max(0, Math.min(out.length - 1, Math.round(Number(r && r.frame) || 0))),
  })).filter((r) => r.when && r.then).slice(0, LIMITS.reads);
  return {
    play: {
      name, court, category, groups, kind, opponent, lineup, clip: video, clip_link, tips, due, marks, signal, situations, audio, reads,
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
// Coach's voice note: a WAV on the Blob store under playbook/audio/, plus its length.
export function cleanAudio(a) {
  if (!a || typeof a !== 'object' || typeof a.url !== 'string' || !a.url) return null;
  let u; try { u = new URL(a.url); } catch (e) { return null; }
  if (u.protocol !== 'https:' || !/\.public\.blob\.vercel-storage\.com$/.test(u.hostname) || !/^\/playbook\/audio\//.test(u.pathname)) return null;
  return { url: clip(u.href, 400), seconds: Math.max(0, Math.min(180, Math.round(Number(a.seconds) || 0))) };
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
    opponent, date: cleanDate(p.date), title: cleanName(p.title, 80), group: cleanGroup(p.group),
    where: ['home', 'away', 'neutral'].includes(p.where) ? p.where : '',
    keys: lines(p.keys, LIMITS.key, LIMITS.keys),
    our_plays: [...new Set((Array.isArray(p.our_plays) ? p.our_plays : []).filter(idOk))].slice(0, 30),
    their_plays: [...new Set((Array.isArray(p.their_plays) ? p.their_plays : []).filter(idOk))].slice(0, 30),
    matchups: (Array.isArray(p.matchups) ? p.matchups : []).map((m) => ({ us: idOk(m && m.us) ? m.us : '', them: cleanName(m && m.them, 60), note: clip(stripTags(String((m && m.note) || '').trim()), LIMITS.key) })).filter((m) => m.us || m.them).slice(0, LIMITS.matchups),
    personnel: (Array.isArray(p.personnel) ? p.personnel : []).map((x) => ({ num: clip(stripTags(String((x && x.num) || '').trim()), 3), name: cleanName(x && x.name, 40), pos: clip(stripTags(String((x && x.pos) || '').trim()), 4), notes: clip(stripTags(String((x && x.notes) || '').trim()), 300), guard: clip(stripTags(String((x && x.guard) || '').trim()), 300), photo: cleanPhoto(x && x.photo) })).filter((x) => x.name || x.num).slice(0, LIMITS.personnel),
    things: lines(p.things, LIMITS.key, 3),   // the three things every player must know about them
    quiz: cleanPrepQuiz(p.quiz),
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
    date, title: cleanName(p.title, 80), group: cleanGroup(p.group), start: /^\d{2}:\d{2}$/.test(String(p.start || '')) ? String(p.start) : '',
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
    date, opponent, group: cleanGroup(g.group), where: ['home', 'away', 'neutral'].includes(g.where) ? g.where : '',
    us: statInt(g.us, 200), them: statInt(g.them, 200),
    kind: ['game', 'scrimmage', 'tournament'].includes(g.kind) ? g.kind : 'game',
    source: ['hudl', 'manual', 'maxpreps', 'other'].includes(g.source) ? g.source : 'manual',
    notes: clip(stripTags(String(g.notes || '').trim()), 300),
    lines,
  } };
}

// Situations a play can be tagged with (the Situations library groups plays by these).
export const SITUATIONS = [
  { key: 'blob', label: 'Baseline out of bounds', group: 'Inbounds' },
  { key: 'slob', label: 'Sideline out of bounds', group: 'Inbounds' },
  { key: 'press_break', label: 'Press break', group: 'Inbounds' },
  { key: 'full_court_short', label: 'Full court, short clock', group: 'Inbounds' },
  { key: 'ato', label: 'After a timeout', group: 'Inbounds' },
  { key: 'need3', label: 'Need a 3', group: 'Score and clock' },
  { key: 'need2', label: 'Need a 2', group: 'Score and clock' },
  { key: 'last_shot', label: 'Last shot, tied', group: 'Score and clock' },
  { key: 'run_clock', label: 'Up late, run the clock', group: 'Score and clock' },
  { key: 'ft_miss', label: 'Free throw, need the miss', group: 'Score and clock' },
  { key: 'vs_zone', label: 'Against a zone', group: 'Against' },
  { key: 'vs_press', label: 'Against a press', group: 'Against' },
  { key: 'vs_switch', label: 'When they switch', group: 'Against' },
  { key: 'tip', label: 'Jump ball', group: 'Against' },
  { key: 'blob_zone', label: 'Baseline out against a zone', group: 'Inbounds' },
  { key: 'slob_backcourt', label: 'Sideline out in the back court', group: 'Inbounds' },
  { key: 'up_inbound', label: 'Up late, inbounding against pressure', group: 'Inbounds' },
  { key: 'two_for_one', label: 'Two for one', group: 'Score and clock' },
  { key: 'end_quarter', label: 'Last shot of the quarter', group: 'Score and clock' },
  { key: 'short_clock', label: 'Seven seconds or less', group: 'Score and clock' },
  { key: 'down_big', label: 'Down big, speed it up', group: 'Score and clock' },
  { key: 'ft_make', label: 'Free throw, make and press', group: 'Score and clock' },
  { key: 'vs_box1', label: 'Box and one on our shooter', group: 'Against' },
  { key: 'vs_trap', label: 'Against a half court trap', group: 'Against' },
  { key: 'vs_pack', label: 'They pack the paint', group: 'Against' },
  { key: 'vs_pressure', label: 'Tight ball pressure and denial', group: 'Against' },
  { key: 'transition', label: 'Secondary break', group: 'Game flow' },
  { key: 'quick', label: 'Quick hitter', group: 'Game flow' },
  { key: 'foul_trouble', label: 'Star in foul trouble', group: 'Game flow' },
  { key: 'bonus', label: 'In the bonus, attack the rim', group: 'Game flow' },
  { key: 'tech_ft', label: 'Technical foul free throws', group: 'Game flow' },
  { key: 'post_entry', label: 'Get the ball inside', group: 'Game flow' },
];
export const SITUATION_KEYS = SITUATIONS.map((s) => s.key);
// End of game decision tree: fixed leaves, the coach fills in the play(s) and a note for each.
export const ENDGAME_LEAVES = [
  { key: 'ball_down3', side: 'ball', label: 'Down 3' }, { key: 'ball_down2', side: 'ball', label: 'Down 2' }, { key: 'ball_down1', side: 'ball', label: 'Down 1' },
  { key: 'ball_tied', side: 'ball', label: 'Tied' }, { key: 'ball_up12', side: 'ball', label: 'Up 1 or 2' }, { key: 'ball_up3', side: 'ball', label: 'Up 3 or more' },
  { key: 'def_down', side: 'def', label: 'We are down, need a stop' }, { key: 'def_tied', side: 'def', label: 'Tied' }, { key: 'def_up12', side: 'def', label: 'Up 1 or 2' }, { key: 'def_up3', side: 'def', label: 'Up 3' },
  { key: 'inb_blob2', side: 'inb', label: 'Baseline, need a 2' }, { key: 'inb_blob3', side: 'inb', label: 'Baseline, need a 3' }, { key: 'inb_slob', side: 'inb', label: 'Sideline' }, { key: 'inb_full', side: 'inb', label: 'Full court, under 5 seconds' },
];
export function cleanEndgame(obj) {
  const src = (obj && typeof obj === 'object') ? obj : {};
  const leaves = {};
  for (const l of ENDGAME_LEAVES) {
    const v = src[l.key] || {};
    const ids = [...new Set((Array.isArray(v.play_ids) ? v.play_ids : []).map(String).filter((id) => /^[A-Za-z0-9_-]{1,128}$/.test(id)))].slice(0, 4);
    const leaf = { play_ids: ids, note: clip(stripTags(String(v.note || '').trim()), 300) };
    if (l.key === 'def_up3') leaf.foul = v.foul === true || v.foul === 'yes';
    leaves[l.key] = leaf;
  }
  return leaves;
}
// Bench call log: one row per play called in a game and what came of it.
export const CALL_RESULTS = ['score', 'miss', 'foul', 'to'];
export function cleanCall(c) {
  if (!c || typeof c !== 'object') return { error: 'bad_call' };
  const play_id = /^[A-Za-z0-9_-]{1,128}$/.test(String(c.play_id || '')) ? String(c.play_id) : '';
  if (!play_id) return { error: 'missing_play' };
  if (!CALL_RESULTS.includes(c.result)) return { error: 'bad_result' };
  const opponent = cleanName(c.opponent, 60);
  if (!opponent) return { error: 'missing_opponent' };
  return { call: { play_id, result: c.result, opponent, date: cleanDate(c.date) || '', quarter: ['1', '2', '3', '4', 'OT'].includes(String(c.quarter)) ? String(c.quarter) : '', situation: SITUATION_KEYS.includes(c.situation) ? c.situation : '' } };
}
// Opponent prep quiz on a game plan: up to 6 multiple choice questions, 2 to 4 options each.
export function cleanPrepQuiz(list) {
  return (Array.isArray(list) ? list : []).map((q) => {
    if (!q || typeof q !== 'object') return null;
    const text = clip(stripTags(String(q.q || '').trim()), 160);
    const raw = (Array.isArray(q.options) ? q.options : []).slice(0, 4).map((o) => clip(stripTags(String(o || '').trim()), 80));
    const ai = Math.round(Number(q.answer) || 0);
    const options = raw.filter(Boolean);
    const answer = raw[ai] ? options.indexOf(raw[ai]) : 0;   // the index moves when blanks are dropped
    if (!text || options.length < 2) return null;
    return { q: text, options, answer };
  }).filter(Boolean).slice(0, 6);
}
// Saved lineups: a name plus who plays each spot (O1..O5, token id → roster player id), so a
// coach can drop the same five names onto every play he draws in one tap.
export function cleanLineups(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).map((l) => {
    if (!l || typeof l !== 'object') return null;
    const name = clip(stripTags(String(l.name || '').trim()), 40);
    if (!name || seen.has(name.toLowerCase())) return null;
    const spots = {};
    for (const id of TOKENS.slice(0, 5)) {
      const v = l.spots && l.spots[id];
      if (typeof v === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(v)) spots[id] = v;
    }
    if (!Object.keys(spots).length) return null;
    seen.add(name.toLowerCase());
    return { name, spots };
  }).filter(Boolean).slice(0, 10);
}

// Season goals: a metric from the box scores and a target. `dir` says which way is good.
export const GOAL_METRICS = {
  wins: { label: 'Wins', dir: 'over', fmt: 'int' }, ppg: { label: 'Points per game', dir: 'over', fmt: 'dec' }, allowed: { label: 'Points allowed per game', dir: 'under', fmt: 'dec' },
  ftp: { label: 'Free throw %', dir: 'over', fmt: 'pct' }, fgp: { label: 'Field goal %', dir: 'over', fmt: 'pct' }, tpp: { label: 'Three point %', dir: 'over', fmt: 'pct' },
  to: { label: 'Turnovers per game', dir: 'under', fmt: 'dec' }, ast: { label: 'Assists per game', dir: 'over', fmt: 'dec' }, reb: { label: 'Rebounds per game', dir: 'over', fmt: 'dec' },
  oreb: { label: 'Offensive rebounds per game', dir: 'over', fmt: 'dec' }, stl: { label: 'Steals per game', dir: 'over', fmt: 'dec' }, ato: { label: 'Assist to turnover ratio', dir: 'over', fmt: 'dec' },
};
export function cleanGoals(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).map((g) => {
    if (!g || !Object.hasOwn(GOAL_METRICS, String(g.metric)) || seen.has(g.metric)) return null;
    const target = Number(g.target); if (!isFinite(target) || target <= 0) return null;
    seen.add(g.metric);
    return { metric: g.metric, target: Math.round(target * 10) / 10, label: clip(stripTags(String(g.label || '').trim()), 60) || GOAL_METRICS[g.metric].label };
  }).filter(Boolean).slice(0, 8);
}
// Current value of a goal metric from the box scores (team totals = the sum of every line).
export function goalValue(metric, games) {
  const gs = (games || []).filter((g) => (g.kind || 'game') === 'game'), gp = gs.length;
  if (!gp) return null;
  const t = {}; ['ftm', 'fta', 'fgm', 'fga', 'tpm', 'tpa', 'to', 'ast', 'reb', 'oreb', 'stl'].forEach((k) => { t[k] = 0; });
  gs.forEach((g) => (g.lines || []).forEach((l) => { Object.keys(t).forEach((k) => { t[k] += Number(l[k]) || 0; }); }));
  const per = (k) => Math.round(t[k] / gp * 10) / 10, pct = (m, a) => (a ? Math.round(m / a * 1000) / 10 : null);
  switch (metric) {
    case 'wins': return gs.filter((g) => (g.us || 0) > (g.them || 0)).length;
    case 'ppg': return Math.round(gs.reduce((a, g) => a + (g.us || 0), 0) / gp * 10) / 10;
    case 'allowed': return Math.round(gs.reduce((a, g) => a + (g.them || 0), 0) / gp * 10) / 10;
    case 'ftp': return pct(t.ftm, t.fta); case 'fgp': return pct(t.fgm, t.fga); case 'tpp': return pct(t.tpm, t.tpa);
    case 'ato': return t.to ? Math.round(t.ast / t.to * 100) / 100 : null;
    default: return per(metric);
  }
}
export const TERM_KINDS = ['call', 'offense', 'defense', 'action', 'other'];
// Glossary: one team word, what it means, optionally the play it points at.
export function cleanTerm(t) {
  if (!t || typeof t !== 'object') return { error: 'bad_term' };
  const term = cleanName(t.term, 40);
  const means = clip(stripTags(String(t.means || '').trim()), 300);
  if (!term) return { error: 'missing_term' };
  if (!means) return { error: 'missing_meaning' };
  const play_id = /^[A-Za-z0-9_-]{1,128}$/.test(String(t.play_id || '')) ? String(t.play_id) : '';
  return { term: { term, means, play_id, kind: TERM_KINDS.includes(t.kind) ? t.kind : 'other' } };
}

// Calendar feeds: one private iCal URL per group (Varsity, JV). Google's or our Apps Script feed.
export function cleanFeeds(list) {
  return (Array.isArray(list) ? list : []).map((f) => {
    let u; try { u = new URL(String((f && f.url) || '').trim().replace(/^webcal:/i, 'https:')); } catch (e) { return null; }
    if (u.protocol !== 'https:') return null;
    return { group: cleanGroup(f && f.group), url: clip(u.href, 600) };
  }).filter(Boolean).slice(0, 6);
}
// iCal parse: VEVENT summary, location, start (date or datetime, with or without Z). Recurring
// events (RRULE FREQ=WEEKLY or DAILY, with INTERVAL / BYDAY / UNTIL / COUNT, minus EXDATEs) are
// expanded for the next `horizonDays`; that is how Google Calendar exports a weekly practice.
export function parseIcs(text, now = Date.now(), limit = 8, horizonDays = 21) {
  const out = [], horizon = now + horizonDays * 864e5;
  const blocks = String(text || '').replace(/\r?\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1);
  const DOW = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
  for (const b of blocks) {
    const get = (k) => { const m = new RegExp('^' + k + '(?:;[^:\\n]*)?:(.*)$', 'm').exec(b); return m ? m[1].trim() : ''; };
    const ds = get('DTSTART'); if (!ds) continue;
    const allDay = /^\d{8}$/.test(ds);
    const toMs = (v) => {
      const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/.exec(v); if (!m) return null;
      if (m[7]) return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
      if (!m[4]) return Date.UTC(+m[1], +m[2] - 1, +m[3], 12);
      const local = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)); return local + easternOffsetMs(local);   // floating / TZID times are Eastern
    };
    const t0 = toMs(ds); if (t0 == null) continue;
    const tzid = (/DTSTART;[^:]*TZID=([^:;]+)/.exec(b) || [])[1] || '';
    const ev = { allDay, title: get('SUMMARY').replace(/\\,/g, ',').replace(/\\n/g, ' ').slice(0, 120), where: get('LOCATION').replace(/\\,/g, ',').slice(0, 160), tz: tzid };
    const starts = [];
    const rrule = get('RRULE');
    if (!rrule) starts.push(t0);
    else {
      const R = {}; rrule.split(';').forEach((kv) => { const i = kv.indexOf('='); if (i > 0) R[kv.slice(0, i).toUpperCase()] = kv.slice(i + 1); });
      const freq = R.FREQ, interval = Math.max(1, parseInt(R.INTERVAL, 10) || 1);
      const until = R.UNTIL ? toMs(R.UNTIL) : null, count = parseInt(R.COUNT, 10) || 0;
      const exdates = new Set(); for (const m of b.matchAll(/^EXDATE(?:;[^:\n]*)?:(.*)$/gm)) m[1].split(',').forEach((v) => { const x = toMs(v.trim()); if (x != null) exdates.add(Math.floor((allDay || /Z$/.test(v.trim()) ? x : x - easternOffsetMs(x)) / 864e5)); });
      const sameWall = (base, dayShift) => { // keep the wall-clock time across DST: shift by days in Eastern terms
        const d = base + dayShift * 864e5; return allDay || /Z$/.test(ds) ? d : d + (easternOffsetMs(d) - easternOffsetMs(base));
      };
      if (freq === 'WEEKLY' || freq === 'DAILY') {
        const wall = (t) => allDay || /Z$/.test(ds) ? t : t - easternOffsetMs(t);   // the clock on the gym wall, for weekdays and dates
        const dow = (t) => new Date(wall(t)).getUTCDay();
        const days = freq === 'WEEKLY' ? (R.BYDAY ? R.BYDAY.split(',').map((x) => DOW[x.slice(-2)]).filter((x) => x != null) : [dow(t0)]) : null;
        let n = 0;
        for (let k = 0; k < 400 && (until == null || sameWall(t0, k) <= until) && sameWall(t0, k) <= horizon; k++) {
          const t = sameWall(t0, k);
          const ok = freq === 'DAILY' ? k % interval === 0 : (days.includes(dow(t)) && Math.floor((k + dow(t0)) / 7) % interval === 0);
          if (!ok) continue;
          n++; if (count && n > count) break;
          if (!exdates.has(Math.floor(wall(t) / 864e5))) starts.push(t);
        }
      } else starts.push(t0);   // monthly/yearly: just the first one
    }
    for (const t of starts) { if (t < now - 3 * 36e5 || (rrule && t > horizon)) continue; out.push(Object.assign({ at: new Date(t).toISOString() }, ev)); }   // one-off events keep showing however far out
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
