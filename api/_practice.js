// Practice plans: the drill library, what a plan holds, the running clock and
// the printable clipboard sheet.
//
// Pure: no network, no env, no node imports. api/practice.js stores what this
// cleans and the hidden /practice page draws the same shapes, so the two
// cannot disagree about what a plan is. Everything typed by a coach is clipped
// here before it reaches Firestore.
//
// No shot clock in PIAA play (reference_aces_game_rules): nothing here
// assumes one. End-of-game work is about the clock and fouls, not 2-for-1s.

export const TEAMS = ['Varsity', 'JV', '9th Grade'];

export const CATS = [
  { key: 'warmup', label: 'Warmup' },
  { key: 'ballhandling', label: 'Ball handling' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'offense', label: 'Offense' },
  { key: 'defense', label: 'Defense' },
  { key: 'transition', label: 'Transition' },
  { key: 'rebounding', label: 'Rebounding' },
  { key: 'special', label: 'Special situations' },
  { key: 'conditioning', label: 'Conditioning' },
  { key: 'scrimmage', label: 'Scrimmage' },
];
export const CAT_KEYS = CATS.map((c) => c.key);
export const catLabel = (key) => (CATS.find((c) => c.key === key) || { label: 'Other' }).label;

// The default drill library. Minutes are a starting point the coach changes
// on the plan. Custom drills (practice_meta/aces_drills) are added on top.
export const DRILLS = [
  // Warmup
  { id: 'dynamic-warmup', name: 'Dynamic warmup', cat: 'warmup', minutes: 8, note: 'High knees, butt kicks, lunges, carioca, backpedal. Baseline to half court and back.' },
  { id: 'form-shooting', name: 'Form shooting', cat: 'warmup', minutes: 6, note: 'One hand, close to the rim, hold the follow through. Move out after 5 makes.' },
  { id: 'two-ball-warmup', name: 'Two ball dribble warmup', cat: 'warmup', minutes: 5, note: 'Stationary, then walking: together, alternating, one high one low.' },
  { id: 'three-man-weave', name: 'Three man weave', cat: 'warmup', minutes: 6, note: 'Full court, finish with a layup, no dribbles. Add a second trip back for a jumper.' },
  // Ball handling
  { id: 'stationary-handling', name: 'Stationary ball handling', cat: 'ballhandling', minutes: 6, note: 'Pound, crossover, between, behind, in and out. Eyes up, 30 seconds each.' },
  { id: 'full-court-moves', name: 'Full court change of direction', cat: 'ballhandling', minutes: 8, note: 'Cone every 15 feet: crossover down, between the legs back, behind the back, hesitation.' },
  { id: 'two-ball-full', name: 'Two ball full court', cat: 'ballhandling', minutes: 6, note: 'Down and back three times: same time, alternating, one crossover.' },
  { id: 'cone-chair-series', name: 'Chair series', cat: 'ballhandling', minutes: 8, note: 'Attack a chair at the elbow: one dribble pull up, crossover finish, step back.' },
  { id: 'pressure-dribble', name: 'Pressure dribble one on one', cat: 'ballhandling', minutes: 8, note: 'Full court, defender in the handler, no crossing half court until you beat him clean.' },
  // Shooting
  { id: 'five-spot-shooting', name: 'Five spot shooting', cat: 'shooting', minutes: 10, note: 'Corner, wing, top, wing, corner. Groups of three, one ball, keep score to 50.' },
  { id: 'catch-and-shoot', name: 'Catch and shoot off the pass', cat: 'shooting', minutes: 8, note: 'Passer at the top, shooter sprints to the wing, inside foot pivot, shot ready.' },
  { id: 'curl-fade-shooting', name: 'Curl and fade off screens', cat: 'shooting', minutes: 10, note: 'Read the chaser: curl if he trails, fade if he goes under, straight cut if he goes over.' },
  { id: 'free-throws-fatigue', name: 'Free throws under fatigue', cat: 'shooting', minutes: 6, note: 'Two shots after each sprint. Team must hit the number or run again.' },
  { id: 'star-shooting', name: 'Star shooting', cat: 'shooting', minutes: 8, note: 'Five lines, pass and cut to the next spot, shooter rebounds his own. Count makes in 4 minutes.' },
  { id: 'elbow-to-elbow', name: 'Elbow to elbow', cat: 'shooting', minutes: 5, note: 'One minute each: rebound, pass out, sprint to the other elbow, catch and shoot. Record makes.' },
  { id: 'pull-up-series', name: 'Pull up jumpers off the dribble', cat: 'shooting', minutes: 8, note: 'One dribble right, one dribble left from the wing. Then two dribbles from the top.' },
  // Passing
  { id: 'partner-passing', name: 'Partner passing', cat: 'passing', minutes: 5, note: 'Chest, bounce, overhead, off the dribble. Step and snap, target hand up.' },
  { id: 'four-corner-passing', name: 'Four corner passing', cat: 'passing', minutes: 6, note: 'Pass and follow, then pass and go opposite. Add a second ball once it is clean.' },
  { id: 'pass-against-pressure', name: 'Passing against pressure', cat: 'passing', minutes: 6, note: 'Two on one in the half court, defender in the passer. Pass fake, pivot, find the open man.' },
  { id: 'post-entry-passing', name: 'Post entry passing', cat: 'passing', minutes: 6, note: 'Wing to post, defender fronting or playing behind. Read it, bounce or lob.' },
  // Offense
  { id: 'five-out-motion', name: 'Five out motion breakdown', cat: 'offense', minutes: 12, note: 'Pass and cut, fill, back cut when overplayed. Three on none, then three on three.' },
  { id: 'pick-and-roll-reads', name: 'Pick and roll reads', cat: 'offense', minutes: 12, note: 'Two on two with a coach as the tagger: reject, split, pocket pass, roll or pop.' },
  { id: 'shell-offense-4v4', name: 'Four on four half court', cat: 'offense', minutes: 10, note: 'Run our sets against live defense. Reset on a score or a stop.' },
  { id: 'blob-slob', name: 'Baseline and sideline out of bounds', cat: 'offense', minutes: 10, note: 'Walk through, then live against the defense we expect this week.' },
  { id: 'zone-offense', name: 'Zone offense', cat: 'offense', minutes: 10, note: 'Gaps and short corner against a 2-3. Ball reversal, high post catch, look opposite.' },
  { id: 'press-break', name: 'Press break', cat: 'offense', minutes: 10, note: 'Inbounder, two short, one middle, one long. Beat the trap with the pass, not the dribble.' },
  // Defense
  { id: 'shell-drill', name: 'Shell drill', cat: 'defense', minutes: 12, note: 'Four on four. Ball, deny, help. Jump to the ball on every pass. Add drives, then cutters.' },
  { id: 'closeouts', name: 'Closeouts', cat: 'defense', minutes: 8, note: 'Sprint, chop, high hands. Contest the shot without fouling, take away the drive hand.' },
  { id: 'zigzag', name: 'Zigzag slides', cat: 'defense', minutes: 6, note: 'Full court, defender turns the handler at each hash. Nose on the ball, no reaching.' },
  { id: 'help-and-recover', name: 'Help and recover', cat: 'defense', minutes: 8, note: 'Three on three, driver attacks, help stops the ball, recover to the shooter on the kick.' },
  { id: 'post-defense', name: 'Post defense', cat: 'defense', minutes: 8, note: 'Three quarter front on the wing, full front on the baseline side. Work for the lob catch.' },
  { id: 'screen-defense', name: 'Defending screens', cat: 'defense', minutes: 10, note: 'On ball: hedge and recover. Off ball: chase or go under on a non shooter. Talk early.' },
  // Transition
  { id: 'three-on-two-two-on-one', name: 'Three on two, two on one', cat: 'transition', minutes: 10, note: 'Continuous. Attack the numbers, the defender who gives up the shot runs back.' },
  { id: 'eleven-man', name: 'Eleven man break', cat: 'transition', minutes: 12, note: 'Three on two both ways, outlets on the wings. Rebounders replace the shooters.' },
  { id: 'transition-defense', name: 'Transition defense', cat: 'transition', minutes: 8, note: 'Shooter touches the baseline after the shot. Stop the ball first, then find the shooters.' },
  { id: 'five-on-five-full', name: 'Five on five full court', cat: 'transition', minutes: 10, note: 'Make it take it. Score in 8 seconds or pull it out and run a set.' },
  // Rebounding
  { id: 'box-out-circle', name: 'Circle box outs', cat: 'rebounding', minutes: 6, note: 'Ball in the middle of the jump circle, hit, pivot, hold the box for three seconds.' },
  { id: 'war-rebounding', name: 'War rebounding', cat: 'rebounding', minutes: 8, note: 'Three on three in the lane, coach shoots, live until the offense scores or the defense gets it.' },
  { id: 'superman', name: 'Superman rebounding', cat: 'rebounding', minutes: 5, note: 'Toss off the glass, go get it outside the lane line on the other side. 10 each.' },
  // Special situations
  { id: 'end-of-game', name: 'End of game situations', cat: 'special', minutes: 12, note: 'Up 3 with 20 seconds, down 2 with 8 seconds, inbound under pressure. No shot clock, so decide when to hold the ball.' },
  { id: 'free-throw-lineups', name: 'Free throw line ups', cat: 'special', minutes: 6, note: 'Who boxes whom, who leaks out, what we do on a miss late in the game.' },
  { id: 'jump-ball-tips', name: 'Jump ball alignments', cat: 'special', minutes: 4, note: 'Where we tip and who protects the back.' },
  { id: 'foul-game', name: 'Foul game and the clock', cat: 'special', minutes: 8, note: 'Down late: who fouls, who we foul, calling timeouts to advance. Up late: inbound with the best free throw shooters.' },
  // Conditioning
  { id: 'seventeens', name: 'Seventeens', cat: 'conditioning', minutes: 6, note: 'Sideline to sideline 17 times in a minute. Three sets with a minute between.' },
  { id: 'suicides', name: 'Suicides', cat: 'conditioning', minutes: 6, note: 'Foul line, half court, far foul line, baseline. Under 30 seconds for guards, 32 for bigs.' },
  { id: 'defensive-slide-ladder', name: 'Slide ladder', cat: 'conditioning', minutes: 5, note: 'Slides along the lane for 20, 30, 40 seconds. Stay low the whole time.' },
  // Scrimmage
  { id: 'controlled-scrimmage', name: 'Controlled scrimmage', cat: 'scrimmage', minutes: 15, note: 'Stop and teach. Run the sets we installed today, coach calls the situation.' },
  { id: 'live-scrimmage', name: 'Live scrimmage with officials rules', cat: 'scrimmage', minutes: 15, note: 'Eight minute quarters on the game clock, keep score and fouls, no stopping.' },
];

export const LIMITS = { title: 80, focus: 600, blocks: 30, drill: 60, who: 40, notes: 300, groups: 120, equipment: 300, after: 1000, minutes: 90, drillNote: 200, customDrills: 60 };

export function clip(v, n) { return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n); }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const validDate = (d) => DATE_RE.test(String(d || '')) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
export const cleanDate = (d) => (validDate(d) ? String(d) : '');
export const cleanTime = (t) => (TIME_RE.test(String(t || '')) ? String(t) : '');
export const cleanTeam = (t) => (TEAMS.includes(t) ? t : TEAMS[0]);
export const cleanCat = (c) => (CAT_KEYS.includes(c) ? c : 'offense');
export function cleanMinutes(m, dflt = 10) {
  const n = Math.round(Number(m));
  if (!Number.isFinite(n)) return dflt;
  return Math.min(LIMITS.minutes, Math.max(1, n));
}

/** 'varsity_2026-11-24' from a team and a date. */
export function teamSlug(team) { return cleanTeam(team).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function planId(team, date) { return `${teamSlug(team)}_${cleanDate(date)}`; }
export const teamFromSlug = (slug) => TEAMS.find((t) => teamSlug(t) === slug) || '';

/** A custom drill as stored in practice_meta/aces_drills. */
export function cleanDrill(d) {
  const x = d && typeof d === 'object' ? d : {};
  const name = clip(x.name, LIMITS.drill);
  const base = clip(x.id, 60).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { id: base ? `c-${base.replace(/^c-/, '')}`.slice(0, 64) : '', name, cat: cleanCat(x.cat), minutes: cleanMinutes(x.minutes), note: clip(x.note, LIMITS.drillNote) };
}
export function cleanDrillList(list) {
  const out = [];
  const seen = new Set(DRILLS.map((d) => d.id));
  for (const raw of Array.isArray(list) ? list : []) {
    const d = cleanDrill(raw);
    if (!d.id || !d.name || seen.has(d.id)) continue;
    seen.add(d.id); out.push(d);
    if (out.length >= LIMITS.customDrills) break;
  }
  return out;
}

export function cleanBlock(b) {
  const x = b && typeof b === 'object' ? b : {};
  return { drill: clip(x.drill, LIMITS.drill), cat: cleanCat(x.cat), minutes: cleanMinutes(x.minutes), who: clip(x.who, LIMITS.who), notes: clip(x.notes, LIMITS.notes), groups: clip(x.groups, LIMITS.groups) };
}

export function emptyPlan(team, date, start) {
  return { date: cleanDate(date), team: cleanTeam(team), title: '', start: cleanTime(start) || '15:30', focus: '', blocks: [], equipment: '', after: '' };
}

/** What a plan holds and nothing else. Blocks without a drill name are dropped. */
export function cleanPlan(body) {
  const b = body && typeof body === 'object' ? body : {};
  const p = emptyPlan(b.team, b.date, b.start);
  p.title = clip(b.title, LIMITS.title);
  p.focus = clip(b.focus, LIMITS.focus);
  p.blocks = (Array.isArray(b.blocks) ? b.blocks : []).map(cleanBlock).filter((x) => x.drill).slice(0, LIMITS.blocks);
  p.equipment = clip(b.equipment, LIMITS.equipment);
  p.after = clip(b.after, LIMITS.after);
  return p;
}

/** '15:30' + 45 -> '16:15'. Wraps past midnight, which no practice reaches. */
export function addMinutes(hhmm, mins) {
  const t = cleanTime(hhmm) || '00:00';
  const [h, m] = t.split(':').map(Number);
  const total = (((h * 60 + m + Math.round(Number(mins) || 0)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
/** '15:30' -> '3:30 PM' */
export function fmtTime(hhmm) {
  const t = cleanTime(hhmm);
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}
/** 'Tue, Nov 24' from 'YYYY-MM-DD', without a timezone surprise. */
export function fmtDate(ymd, opts) {
  if (!validDate(ymd)) return '';
  const d = new Date(`${ymd}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC', ...(opts || {}) });
}
export function addDays(ymd, n) {
  const d = new Date(`${cleanDate(ymd) || '1970-01-01'}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Today's date in Philadelphia as 'YYYY-MM-DD'. */
export function todayYmd(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
}

/** Total minutes, the end time, and the running clock: the start time of each block. */
export function planTotals(plan) {
  const p = plan || {};
  const start = cleanTime(p.start) || '00:00';
  const clock = [];
  let t = 0;
  for (const b of Array.isArray(p.blocks) ? p.blocks : []) {
    clock.push(addMinutes(start, t));
    t += cleanMinutes(b && b.minutes);
  }
  return { minutes: t, end: addMinutes(start, t), clock };
}

/** Minutes per category in a plan, for the "last week" bars. */
export function catMinutes(plan) {
  const out = {};
  for (const b of (plan && Array.isArray(plan.blocks)) ? plan.blocks : []) {
    const c = cleanCat(b && b.cat);
    out[c] = (out[c] || 0) + cleanMinutes(b && b.minutes);
  }
  return out;
}

/** The clipboard sheet: light, printable, prints itself on load. */
export function printHtml(plan) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const p = cleanPlan(plan);
  const totals = planTotals(p);
  const rows = p.blocks.map((b, i) =>
    `<tr><td class="t">${esc(fmtTime(totals.clock[i]))}</td><td class="n">${b.minutes}</td><td><b>${esc(b.drill)}</b><span class="m"> ${esc(catLabel(b.cat))}</span></td><td>${esc(b.who)}</td><td>${esc(b.groups)}</td><td>${esc(b.notes)}</td></tr>`).join('');
  const title = `${p.team} practice, ${fmtDate(p.date, { weekday: 'long', year: 'numeric' })}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px;font-size:13px}h1{font-size:22px;margin:0;letter-spacing:.02em}h1 span{color:#840036}.when{color:#555;margin:4px 0 14px;font-size:14px}h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#840036;border-bottom:2px solid #c9a44a;padding-bottom:4px;margin:18px 0 8px}table{width:100%;border-collapse:collapse}td,th{text-align:left;vertical-align:top;padding:6px 6px;border-bottom:1px solid #ddd;font-size:12.5px}th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#555}td.t{width:62px;font-weight:700;white-space:nowrap}td.n{width:34px;color:#555}.m{color:#666;font-weight:400;font-size:11px;margin-left:6px}p{white-space:pre-wrap;margin:0;line-height:1.45}.box{border:1px solid #bbb;border-radius:6px;min-height:150px;margin-top:6px}.tot{margin-top:8px;color:#555;font-size:12px}@media print{body{margin:14px}}</style></head><body>
<h1>Lower Merion Aces <span>${esc(p.team)} practice</span>${p.title ? ` <span class="m" style="font-size:15px">${esc(p.title)}</span>` : ''}</h1>
<div class="when">${esc(fmtDate(p.date, { weekday: 'long', year: 'numeric' }))} · ${esc(fmtTime(p.start))} to ${esc(fmtTime(totals.end))} · ${totals.minutes} minutes</div>
${p.focus ? `<h2>Focus</h2><p>${esc(p.focus)}</p>` : ''}
<h2>Practice</h2><table><tr><th>Clock</th><th>Min</th><th>Drill</th><th>Who</th><th>Groups</th><th>Notes</th></tr>${rows || '<tr><td colspan="6">No blocks yet.</td></tr>'}</table>
<div class="tot">Ends ${esc(fmtTime(totals.end))}</div>
${p.equipment ? `<h2>Equipment</h2><p>${esc(p.equipment)}</p>` : ''}
<h2>After practice</h2>${p.after ? `<p>${esc(p.after)}</p>` : ''}<div class="box"></div>
<script>window.onload=function(){window.print()}</script></body></html>`;
}
