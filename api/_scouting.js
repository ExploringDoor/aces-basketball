// Opponent scouting: who scouts whom, and the report they fill in.
//
// Adam, 2026-11-06: "Matt and Eric are leads on scouting, Sam Chalal wants to
// do some of this work. Need to break down who is scouting who, and a
// scouting report breakdown template that they can fill out."
//
// Pure: no network, no env. api/scouting.js stores what this cleans, and the
// hidden /scouting page draws the same template, so the two cannot disagree
// about what a report holds. Everything typed by a coach is clipped here
// before it reaches Firestore.
//
// No shot clock in PIAA play (reference_aces_game_rules): the special
// situations section asks about holding the ball, not about 2-for-1s.

// Adam, 11/6: the coaching staff. Admins add or remove names from the page.
export const DEFAULT_STAFF = ['Matt', 'Eric', 'Gallman', 'Grugan', 'Downer', 'Adam'];

// Each coach has a password of their own (Adam, 11/6: "each coach and each
// player to have their own passwords ... very basic passwords please with a
// few numbers and !"). The generated shape is the coach's first name, two or
// three digits and an exclamation mark: Grugan47!. Compared case-insensitively
// and ignoring spaces, so "grugan47 !" typed on a phone still works. An admin
// can also set one by hand.
export const CODE_MIN = 4;
export const CODE_MAX = 24;
export function normCode(raw) {
  return String(raw == null ? '' : raw).replace(/\s+/g, '').slice(0, CODE_MAX);
}
export const codeKey = (c) => normCode(c).toLowerCase();
export function validCode(c) { const n = normCode(c); return n.length >= CODE_MIN && n.length <= CODE_MAX && !/[<>"']/.test(n); }
/** "Grugan47!" from a name and a random digit string the caller supplies. */
export function codeFor(name, digits) {
  const first = clip(name, LIMITS.name).split(/\s+/)[0].replace(/[^A-Za-z]/g, '') || 'Coach';
  return `${first.charAt(0).toUpperCase()}${first.slice(1)}${String(digits).replace(/\D/g, '').slice(0, 4) || '7'}!`;
}

/** The staff roster as stored: [{ name, code }]. Names unique, codes unique
 *  and well-formed; a coach without a valid code keeps the row but cannot
 *  sign in until an admin gives them one. */
export function cleanStaffList(list) {
  const seen = new Set();
  const codes = new Set();
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    if (typeof raw !== 'string' && !(raw && typeof raw === 'object')) continue;
    const name = clip(typeof raw === 'object' ? raw.name : raw, LIMITS.name);
    if (!name || seen.has(name.toLowerCase())) continue;
    let code = normCode(raw && typeof raw === 'object' ? raw.code : '');
    if (!validCode(code) || codes.has(codeKey(code))) code = '';
    seen.add(name.toLowerCase());
    if (code) codes.add(codeKey(code));
    out.push({ name, code });
    if (out.length >= LIMITS.staff) break;
  }
  return out;
}
export const STATUSES = ['not_started', 'in_progress', 'ready'];
export const STATUS_LABEL = { not_started: 'Not started', in_progress: 'In progress', ready: 'Ready' };

/** The free-text sections of a report, in the order they are filled in. */
export const SECTIONS = [
  { key: 'overview', label: 'Team overview', hint: 'Record, coach, style and pace. What they want to do every possession. Where they are better than us and where we are better than them.' },
  { key: 'offense', label: 'Offense', hint: 'Half-court sets and the calls you hear. Ball-screen action and who uses it. Post entries. Baseline and sideline out of bounds. Press break. What they run when they need a basket.' },
  { key: 'defense', label: 'Defense', hint: 'Base defense (man, 2-3, 1-3-1, match-up) and when they change. Press: when, what kind, where they trap. Ball-screen coverage. How they guard the post. Who boxes out and who leaks.' },
  { key: 'special', label: 'Special situations', hint: 'No shot clock: do they hold the ball with a lead, and who handles it. End of quarter plays. Best and worst free-throw shooters. Who they foul and who they want shooting late.' },
  { key: 'plan', label: 'Our game plan', hint: 'Keys to win go in the list below. Here: tempo, what we run against their defense, what we take away first, who starts, how we handle their press.' },
];

/** Columns of the personnel table. `size` is the character cap. */
export const PERSONNEL_FIELDS = [
  { key: 'num', label: '#', size: 3, width: 44 },
  { key: 'name', label: 'Name', size: 40, width: 150 },
  { key: 'pos', label: 'Pos', size: 4, width: 52 },
  { key: 'ht', label: 'Ht', size: 6, width: 56 },
  { key: 'yr', label: 'Yr', size: 3, width: 44 },
  { key: 'role', label: 'Role', size: 12, width: 84 },
  { key: 'hand', label: 'Hand', size: 1, width: 48 },
  { key: 'notes', label: 'Tendencies', size: 300, width: 220 },
  { key: 'guard', label: 'How we guard him', size: 300, width: 220 },
];

export const LIMITS = { section: 4000, personnel: 20, keys: 8, key: 160, matchups: 10, links: 10, link: 500, staff: 12, name: 40, opp: 60 };

export function clip(v, n) { return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n); }

/** "Garnet Valley" -> "garnet-valley". The report's document id. */
export function slugOf(opp) {
  return clip(opp, LIMITS.opp).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** The opponents on the schedule, one entry each, with their games and the
 *  next one still to play. Tournaments (`multi`) and scrimmages are not an
 *  opponent and are left out. */
export function opponentsFrom(games, now = Date.now()) {
  const by = new Map();
  for (const g of games || []) {
    if (!g || !g.opp || g.multi || g.exhibition) continue;
    const t = g.iso ? new Date(g.iso).getTime() : NaN;
    const slug = slugOf(g.opp);
    if (!by.has(slug)) by.set(slug, { slug, opp: g.opp, conf: !!g.conf, games: [], next: null });
    const o = by.get(slug);
    o.games.push({ iso: g.iso || '', date: g.date || '', time: g.time || '', home: !!g.home, neutral: !!g.neutral, venue: g.venue || '', result: g.result || null, t });
    if (g.conf) o.conf = true;
  }
  const out = [...by.values()];
  for (const o of out) {
    o.games.sort((a, b) => (a.t || 0) - (b.t || 0));
    o.next = o.games.find((x) => Number.isFinite(x.t) && x.t > now - 3 * 3600000) || null;
  }
  // Soonest next game first; opponents already played out go to the bottom.
  out.sort((a, b) => (a.next ? a.next.t : Infinity) - (b.next ? b.next.t : Infinity) || a.opp.localeCompare(b.opp));
  return out;
}

export function cleanStaff(list) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    if (typeof raw !== 'string') continue;
    const n = clip(raw, LIMITS.name);
    if (!n || seen.has(n.toLowerCase())) continue;
    seen.add(n.toLowerCase());
    out.push(n);
    if (out.length >= LIMITS.staff) break;
  }
  return out;
}

export function cleanAssignment(a) {
  const x = a && typeof a === 'object' ? a : {};
  const status = STATUSES.includes(x.status) ? x.status : 'not_started';
  return { scout: clip(x.scout, LIMITS.name), helper: clip(x.helper, LIMITS.name), status };
}

/** Only opponents that are on the schedule can be assigned. */
export function cleanAssignments(map, slugs) {
  const ok = new Set(slugs || []);
  const out = {};
  for (const [slug, a] of Object.entries(map && typeof map === 'object' ? map : {})) {
    if (!ok.has(slug)) continue;
    const c = cleanAssignment(a);
    if (c.scout || c.helper || c.status !== 'not_started') out[slug] = c;
  }
  return out;
}

export function emptyReport(opp) {
  const r = { opp: clip(opp, LIMITS.opp), personnel: [], keys: [], matchups: [], links: [] };
  for (const s of SECTIONS) r[s.key] = '';
  return r;
}

export function cleanReport(body, opp) {
  const b = body && typeof body === 'object' ? body : {};
  const r = emptyReport(opp);
  for (const s of SECTIONS) r[s.key] = String(b[s.key] == null ? '' : b[s.key]).replace(/[<>]/g, '').slice(0, LIMITS.section);
  r.personnel = (Array.isArray(b.personnel) ? b.personnel : []).map((p) => {
    const row = {};
    for (const f of PERSONNEL_FIELDS) row[f.key] = clip(p && p[f.key], f.size);
    if (f_hand(row.hand)) row.hand = row.hand.toUpperCase();
    return row;
  }).filter((p) => p.name || p.num).slice(0, LIMITS.personnel);
  r.keys = (Array.isArray(b.keys) ? b.keys : []).map((k) => clip(k, LIMITS.key)).filter(Boolean).slice(0, LIMITS.keys);
  r.matchups = (Array.isArray(b.matchups) ? b.matchups : []).slice(0, LIMITS.matchups)
    .map((m) => ({ ours: clip(m && m.ours, LIMITS.name), theirs: clip(m && m.theirs, LIMITS.name), note: clip(m && m.note, LIMITS.key) }))
    .filter((m) => m.ours || m.theirs);
  r.links = (Array.isArray(b.links) ? b.links : []).map((l) => clip(l, LIMITS.link)).filter((l) => /^https?:\/\//i.test(l)).slice(0, LIMITS.links);
  return r;
}
function f_hand(h) { return h === 'l' || h === 'r'; }

/** How much of a report is filled in, 0 to 100, so the board can show it. */
export function completeness(r) {
  if (!r) return 0;
  let n = 0;
  for (const s of SECTIONS) if (String(r[s.key] || '').trim()) n++;
  if ((r.personnel || []).length >= 5) n++;
  if ((r.keys || []).length >= 3) n++;
  return Math.round((n / (SECTIONS.length + 2)) * 100);
}

/** The printable one-pager for players: personnel and keys, nothing a
 *  player should not be reading. Plain HTML, light, no scripts. */
export function printHtml(report, opp, next) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r = report || emptyReport(opp);
  const when = next ? `${next.date} · ${next.time} · ${next.home ? 'Kobe Bryant Gymnasium' : next.venue}` : '';
  const rows = (r.personnel || []).map((p) =>
    `<tr><td class="n">${esc(p.num)}</td><td><b>${esc(p.name)}</b>${p.pos || p.ht || p.yr ? `<span class="m"> ${[p.pos, p.ht, p.yr].filter(Boolean).map(esc).join(' · ')}</span>` : ''}${p.hand ? `<span class="m"> · ${esc(p.hand)}H</span>` : ''}</td><td>${esc(p.notes)}</td><td>${esc(p.guard)}</td></tr>`).join('');
  const keys = (r.keys || []).map((k) => `<li>${esc(k)}</li>`).join('');
  const matchups = (r.matchups || []).map((m) => `<tr><td><b>${esc(m.ours)}</b></td><td>${esc(m.theirs)}</td><td>${esc(m.note)}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Scouting: ${esc(opp)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px;font-size:13px}h1{font-size:24px;margin:0;letter-spacing:.02em}h1 span{color:#840036}.when{color:#555;margin:4px 0 16px}h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#840036;border-bottom:2px solid #c9a44a;padding-bottom:4px;margin:18px 0 8px}table{width:100%;border-collapse:collapse}td,th{text-align:left;vertical-align:top;padding:5px 6px;border-bottom:1px solid #ddd;font-size:12.5px}th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#555}td.n{width:28px;font-weight:700}.m{color:#666;font-weight:400}ol{margin:0;padding-left:20px}ol li{margin:3px 0;font-size:14px}p{white-space:pre-wrap;margin:0}@media print{body{margin:14px}}</style></head><body>
<h1>Lower Merion <span>vs ${esc(opp)}</span></h1><div class="when">${esc(when)}</div>
${keys ? `<h2>Keys to the game</h2><ol>${keys}</ol>` : ''}
${rows ? `<h2>Their personnel</h2><table><tr><th>#</th><th>Player</th><th>Tendencies</th><th>How we guard him</th></tr>${rows}</table>` : ''}
${matchups ? `<h2>Matchups</h2><table><tr><th>Aces</th><th>Them</th><th>Note</th></tr>${matchups}</table>` : ''}
<script>window.onload=function(){window.print()}</script></body></html>`;
}
