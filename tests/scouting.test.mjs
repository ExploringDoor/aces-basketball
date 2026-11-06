// Opponent scouting: the pure template logic and the /api/scouting handler
// against the in-memory Firestore fake. Zero network.
// Run: npm test   (or: node tests/scouting.test.mjs)
import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import { opponentsFrom, cleanReport, cleanStaff, cleanAssignments, completeness, slugOf, printHtml, SECTIONS, LIMITS } from '../api/_scouting.js';
import handler from '../api/scouting.js';

fake.install();

let pass = 0, fail = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => fake.assertClean()).then(
    () => { pass++; console.log('  ✓', name); },
    (e) => { fail++; console.log('  ✗', name, '\n       ', String(e && e.message || e).split('\n').join('\n       ')); }
  );
}
async function call({ method = 'POST', body, query = '', key = 'admin-pass', user = 'Matt' } = {}) {
  const req = { method, url: `/api/scouting${query}`, headers: { 'x-scouting-key': key, 'x-scouting-user': user }, body };
  const out = { status: 0, headers: {}, body: null };
  const res = { set statusCode(c) { out.status = c; }, get statusCode() { return out.status; }, setHeader(k, v) { out.headers[k] = v; }, end(b) { out.body = JSON.parse(b); } };
  await handler(req, res);
  return out;
}

const games = [
  { date: 'Dec 4', opp: 'Chester', home: true, time: '7:00 PM', iso: '2026-12-04T19:00:00-05:00', result: null },
  { date: 'Dec 8', opp: 'Conestoga', home: true, time: '7:00 PM', iso: '2026-12-08T19:00:00-05:00', conf: true, result: null },
  { date: 'Dec 26–31', opp: 'Cactus Jam', multi: true, iso: '2026-12-26T12:00:00-05:00' },
  { date: 'Jan 22', opp: 'Conestoga', home: false, time: '7:00 PM', iso: '2027-01-22T19:00:00-05:00', conf: true, result: null },
  { date: 'Nov 20', opp: 'Scrimmage U', exhibition: true, iso: '2026-11-20T18:00:00-05:00' },
];

await test('opponents come from the schedule, once each, tournaments and scrimmages left out', () => {
  const now = new Date('2026-12-09T12:00:00-05:00').getTime();
  const o = opponentsFrom(games, now);
  assert.deepEqual(o.map((x) => x.opp), ['Conestoga', 'Chester']);
  const c = o[0];
  assert.equal(c.slug, 'conestoga');
  assert.equal(c.games.length, 2);
  assert.equal(c.next.date, 'Jan 22');
  assert.equal(c.conf, true);
  assert.equal(o[1].next, null);
});

await test('a report is clipped to the template and nothing else gets through', () => {
  const r = cleanReport({
    overview: '<b>Fast</b> team ' + 'x'.repeat(5000),
    bogus: 'no',
    personnel: [
      { num: '23', name: 'J. Smith', pos: 'G', ht: "6'2", yr: 'Sr', role: 'Starter', hand: 'l', notes: 'Goes right', guard: 'Force left' },
      { num: '', name: '' },
      ...Array.from({ length: 30 }, (_, i) => ({ num: String(i), name: 'P' + i })),
    ],
    keys: ['Rebound', '', 'Run', 'a', 'b', 'c', 'd', 'e', 'f', 'g'],
    matchups: [{ ours: 'Player One', theirs: 'J. Smith', note: 'Deny' }, { ours: '', theirs: '' }],
    links: ['https://hudl.com/x', 'javascript:alert(1)', 'not a link'],
  }, 'Conestoga');
  assert.equal(r.opp, 'Conestoga');
  assert.equal(r.bogus, undefined);
  assert.equal(r.overview.length, LIMITS.section);
  assert.ok(!r.overview.includes('<'));
  assert.equal(r.personnel.length, LIMITS.personnel);
  assert.equal(r.personnel[0].hand, 'L');
  assert.deepEqual(r.keys, ['Rebound', 'Run', 'a', 'b', 'c', 'd', 'e', 'f']);
  assert.equal(r.matchups.length, 1);
  assert.deepEqual(r.links, ['https://hudl.com/x']);
  for (const s of SECTIONS) assert.equal(typeof r[s.key], 'string');
});

await test('staff and assignments are tidy', () => {
  assert.deepEqual(cleanStaff(['Matt', ' matt ', 'Eric', '', 42, 'Sam Chalal']), ['Matt', 'Eric', 'Sam Chalal']);
  const a = cleanAssignments({ conestoga: { scout: 'Matt', helper: 'Sam Chalal', status: 'in_progress' }, nope: { scout: 'X' }, chester: { status: 'weird' } }, ['conestoga', 'chester']);
  assert.deepEqual(a, { conestoga: { scout: 'Matt', helper: 'Sam Chalal', status: 'in_progress' } });
  assert.equal(slugOf("St. Joe's Prep"), 'st-joe-s-prep');
});

await test('completeness and the printable page', () => {
  assert.equal(completeness(null), 0);
  const r = cleanReport({ overview: 'a', offense: 'b', defense: 'c', special: 'd', plan: 'e', keys: ['1', '2', '3'], personnel: Array.from({ length: 5 }, (_, i) => ({ num: String(i + 1), name: 'P' + i })) }, 'Chester');
  assert.equal(completeness(r), 100);
  const html = printHtml(r, 'Chester', { date: 'Dec 4', time: '7:00 PM', home: true });
  assert.ok(html.includes('vs Chester'));
  assert.ok(html.includes('Keys to the game'));
  assert.ok(!html.includes('<b>a</b>'));
  // Nothing a player should not see: the overview and defense sections stay off the handout.
  assert.ok(!html.includes('>b<') && !html.includes('>c<'));
});

await test('the passcode gates everything', async () => {
  const r = await call({ body: { action: 'check' }, key: 'nope' });
  assert.equal(r.status, 401);
  const ok = await call({ body: { action: 'check' } });
  assert.equal(ok.status, 200);
});

await test('board: default staff, then staff and assignments saved and read back', async () => {
  let r = await call({ method: 'GET' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.staff, ['Matt', 'Eric', 'Sam Chalal']);
  assert.deepEqual(r.body.assignments, {});
  r = await call({ body: { action: 'staff', names: ['Matt', 'Eric', 'Sam Chalal', 'Coach D'] } });
  assert.equal(r.status, 200);
  r = await call({ body: { action: 'assign', slug: 'conestoga', scout: 'Matt', helper: 'Sam Chalal', status: 'in_progress' } });
  assert.equal(r.status, 200);
  r = await call({ body: { action: 'assign', slug: 'bad slug!', scout: 'Matt' } });
  assert.equal(r.status, 400);
  r = await call({ method: 'GET' });
  assert.deepEqual(r.body.staff, ['Matt', 'Eric', 'Sam Chalal', 'Coach D']);
  assert.deepEqual(r.body.assignments, { conestoga: { scout: 'Matt', helper: 'Sam Chalal', status: 'in_progress' } });
  // Clearing an assignment removes the row.
  r = await call({ body: { action: 'assign', slug: 'conestoga', scout: '', helper: '', status: 'not_started' } });
  assert.deepEqual(r.body.assignments, {});
});

await test('report: save, read back, summary on the board, and a stale save is refused', async () => {
  let r = await call({ body: { action: 'save', slug: 'conestoga', opp: 'Conestoga', expect: '', report: { overview: 'Fast', keys: ['Rebound'], personnel: [{ num: '3', name: 'A' }] } }, user: 'Eric' });
  assert.equal(r.status, 200);
  const first = r.body.report.updated_at;
  assert.equal(r.body.report.updated_by, 'Eric');
  r = await call({ method: 'GET', query: '?opp=conestoga' });
  assert.equal(r.body.report.overview, 'Fast');
  assert.equal(r.body.report.personnel[0].name, 'A');
  r = await call({ method: 'GET' });
  assert.equal(r.body.reports.conestoga.updated_by, 'Eric');
  assert.ok(r.body.reports.conestoga.pct > 0);
  // Matt loaded the old version and saves over Eric's newer one: refused with the current copy.
  r = await call({ body: { action: 'save', slug: 'conestoga', opp: 'Conestoga', expect: 'something-old', report: { overview: 'Slow' } }, user: 'Matt' });
  assert.equal(r.status, 409);
  assert.equal(r.body.error, 'stale');
  assert.equal(r.body.report.overview, 'Fast');
  // With the right expect it goes through.
  r = await call({ body: { action: 'save', slug: 'conestoga', opp: 'Conestoga', expect: first, report: { overview: 'Slow' } }, user: 'Matt' });
  assert.equal(r.status, 200);
  r = await call({ method: 'GET', query: '?opp=conestoga' });
  assert.equal(r.body.report.overview, 'Slow');
  assert.equal(r.body.report.updated_by, 'Matt');
  // Slug and opponent must agree, and a slug has to be a slug.
  r = await call({ body: { action: 'save', slug: 'conestoga', opp: 'Ridley', expect: '', report: {} } });
  assert.equal(r.status, 400);
  r = await call({ method: 'GET', query: '?opp=../admins' });
  assert.equal(r.status, 400);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
