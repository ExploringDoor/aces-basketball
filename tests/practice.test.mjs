// Practice plans: the pure plan logic and the /api/practice handler against
// the in-memory Firestore fake. Zero network.
// Run: npm test   (or: node tests/practice.test.mjs)
import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import { TEAMS, CATS, DRILLS, LIMITS, cleanPlan, cleanDrill, cleanDrillList, planTotals, planId, printHtml, addMinutes, fmtTime, catMinutes, addDays, teamFromSlug } from '../api/_practice.js';
import handler from '../api/practice.js';

fake.install();

let pass = 0, fail = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => fake.assertClean()).then(
    () => { pass++; console.log('  ✓', name); },
    (e) => { fail++; console.log('  ✗', name, '\n       ', String(e && e.message || e).split('\n').join('\n       ')); }
  );
}
async function call({ method = 'POST', body, query = '', key = 'admin-pass' } = {}) {
  const req = { method, url: `/api/practice${query}`, headers: { 'x-scouting-key': key }, body };
  const out = { status: 0, headers: {}, body: null };
  const res = { set statusCode(c) { out.status = c; }, get statusCode() { return out.status; }, setHeader(k, v) { out.headers[k] = v; }, end(b) { out.body = JSON.parse(b); } };
  await handler(req, res);
  return out;
}

await test('the drill library is real and tidy', () => {
  assert.deepEqual(TEAMS, ['Varsity', 'JV', '9th Grade']);
  assert.ok(DRILLS.length >= 40);
  const ids = new Set(DRILLS.map((d) => d.id));
  assert.equal(ids.size, DRILLS.length);
  const cats = new Set(CATS.map((c) => c.key));
  for (const d of DRILLS) {
    assert.ok(cats.has(d.cat), d.id);
    assert.ok(d.minutes >= 1 && d.minutes <= LIMITS.minutes, d.id);
    assert.ok(d.name && d.note, d.id);
    assert.ok(!/shot clock/i.test(d.name));
  }
  // Every category has at least one drill.
  for (const c of CATS) assert.ok(DRILLS.some((d) => d.cat === c.key), c.key);
});

await test('a plan is clipped to the shape and nothing else gets through', () => {
  const p = cleanPlan({
    date: '2026-11-24', team: 'JV', title: '<b>Install</b> ' + 'x'.repeat(200), start: '15:30', focus: 'f'.repeat(1000), bogus: 1,
    blocks: [
      { drill: 'Shell drill', cat: 'defense', minutes: 500, who: 'Matt', notes: 'n'.repeat(400), groups: 'Guards with Matt, bigs with Gallman' },
      { drill: '', minutes: 5 },
      { drill: 'Odd', cat: 'nope', minutes: 'abc', who: 'x'.repeat(100) },
      { drill: 'Zero', cat: 'shooting', minutes: 0 },
      ...Array.from({ length: 40 }, (_, i) => ({ drill: 'D' + i, cat: 'offense', minutes: 5 })),
    ],
    equipment: 'e'.repeat(400), after: 'a'.repeat(2000),
  });
  assert.equal(p.bogus, undefined);
  assert.equal(p.team, 'JV');
  assert.equal(p.date, '2026-11-24');
  assert.equal(p.start, '15:30');
  assert.ok(!p.title.includes('<'));
  assert.equal(p.title.length, LIMITS.title);
  assert.equal(p.focus.length, LIMITS.focus);
  assert.equal(p.blocks.length, LIMITS.blocks);
  assert.equal(p.blocks[0].minutes, LIMITS.minutes);
  assert.equal(p.blocks[0].notes.length, LIMITS.notes);
  assert.equal(p.blocks[0].groups, 'Guards with Matt, bigs with Gallman');
  assert.equal(p.blocks[1].drill, 'Odd');
  assert.equal(p.blocks[1].cat, 'offense');
  assert.equal(p.blocks[1].minutes, 10);
  assert.equal(p.blocks[1].who.length, LIMITS.who);
  assert.equal(p.blocks[2].minutes, 1);
  assert.equal(p.equipment.length, LIMITS.equipment);
  assert.equal(p.after.length, LIMITS.after);
  // Bad inputs fall back rather than blow up.
  const q = cleanPlan({ date: '2026-02-30', team: 'Freshmen', start: '25:00' });
  assert.equal(q.date, '');
  assert.equal(q.team, 'Varsity');
  assert.equal(q.start, '15:30');
  assert.deepEqual(q.blocks, []);
  assert.equal(planId('9th Grade', '2026-11-24'), '9th-grade_2026-11-24');
  assert.equal(planId('Varsity', '2026-11-24'), 'varsity_2026-11-24');
  assert.equal(teamFromSlug('jv'), 'JV');
  assert.equal(addDays('2026-11-30', 2), '2026-12-02');
});

await test('custom drills are tidy and never shadow the library', () => {
  const d = cleanDrill({ name: 'Grugan closeout game', cat: 'defense', minutes: 7, note: 'n' });
  assert.deepEqual(d, { id: 'c-grugan-closeout-game', name: 'Grugan closeout game', cat: 'defense', minutes: 7, note: 'n' });
  const list = cleanDrillList([d, d, { name: '' }, { name: 'Odd one', cat: 'nope', minutes: 200 }]);
  assert.equal(list.length, 2);
  assert.equal(list[1].cat, 'offense');
  assert.equal(list[1].minutes, LIMITS.minutes);
});

await test('totals, the running clock and the printable sheet', () => {
  const p = cleanPlan({ date: '2026-11-24', team: 'Varsity', start: '15:30', focus: 'Shell and closeouts', blocks: [
    { drill: 'Dynamic warmup', cat: 'warmup', minutes: 10 },
    { drill: 'Shell drill', cat: 'defense', minutes: 25, who: 'Eric', groups: 'Guards with Matt, bigs with Gallman', notes: 'Add cutters' },
    { drill: 'Free throws', cat: 'shooting', minutes: 35 },
  ], equipment: 'Cones, 6 balls' });
  const t = planTotals(p);
  assert.equal(t.minutes, 70);
  assert.equal(t.end, '16:40');
  assert.deepEqual(t.clock, ['15:30', '15:40', '16:05']);
  assert.equal(addMinutes('23:50', 20), '00:10');
  assert.equal(fmtTime('15:30'), '3:30 PM');
  assert.equal(fmtTime('00:05'), '12:05 AM');
  assert.deepEqual(catMinutes(p), { warmup: 10, defense: 25, shooting: 35 });
  assert.deepEqual(planTotals({}), { minutes: 0, end: '00:00', clock: [] });
  const html = printHtml({ ...p, after: '<script>x</script>' });
  assert.ok(html.includes('Varsity practice'));
  assert.ok(html.includes('Tuesday, Nov 24, 2026'));
  assert.ok(html.includes('3:30 PM to 4:40 PM'));
  assert.ok(html.includes('70 minutes'));
  assert.ok(html.includes('Shell and closeouts'));
  assert.ok(html.includes('4:05 PM'));
  assert.ok(html.includes('Guards with Matt, bigs with Gallman'));
  assert.ok(html.includes('Cones, 6 balls'));
  assert.ok(html.includes('After practice'));
  assert.ok(!html.includes('<script>x'));
  assert.ok(html.includes('window.print()'));
});

await test('coach codes sign in through the shared staff list; anything else is refused', async () => {
  let r = await call({ body: { action: 'check' }, key: 'nope' });
  assert.equal(r.status, 401);
  r = await call({ body: { action: 'check' }, key: '' });
  assert.equal(r.status, 401);
  r = await call({ body: { action: 'check' } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.me, { name: 'Admin', role: 'admin' });
  assert.deepEqual(r.body.staff, ['Matt', 'Eric', 'Gallman', 'Grugan', 'Downer', 'Adam']);
  // The staff list was bootstrapped by that first visit, in scouting_meta where /api/scouting reads it too.
  const staff = fake.doc('scouting_meta/aces_staff').staff;
  assert.deepEqual(staff.map((c) => c.name), ['Matt', 'Eric', 'Gallman', 'Grugan', 'Downer', 'Adam']);
  r = await call({ body: { action: 'check' }, key: ` ${staff[0].code.toLowerCase()} ` });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.me, { name: 'Matt', role: 'coach' });
  r = await call({ method: 'GET', key: staff[0].code });
  assert.equal(r.body.me.name, 'Matt');
  assert.deepEqual(r.body.staff, ['Matt', 'Eric', 'Gallman', 'Grugan', 'Downer', 'Adam']);
  assert.deepEqual(r.body.plans, []);
  r = await call({ method: 'GET', query: '?drills=1', key: staff[0].code });
  assert.equal(r.body.drills.length, DRILLS.length);
  assert.deepEqual(r.body.custom, []);
});

await test('plan: save, read back, list by range and team, stale 409, copy, delete', async () => {
  const staff = fake.doc('scouting_meta/aces_staff').staff;
  const code = (n) => staff.find((c) => c.name === n).code;
  const plan = { date: '2026-11-24', team: 'Varsity', title: 'Install shell', start: '15:30', focus: 'Defense', blocks: [{ drill: 'Shell drill', cat: 'defense', minutes: 20, who: 'Eric' }, { drill: 'Seventeens', cat: 'conditioning', minutes: 6 }] };
  let r = await call({ body: { action: 'save', plan, expect: '' }, key: code('Eric') });
  assert.equal(r.status, 200);
  assert.equal(r.body.plan.id, 'varsity_2026-11-24');
  assert.equal(r.body.plan.updated_by, 'Eric');
  const first = r.body.plan.updated_at;
  assert.equal(fake.doc('practice_plans/aces_varsity_2026-11-24').site, 'aces');
  r = await call({ method: 'GET', query: '?id=varsity_2026-11-24', key: code('Matt') });
  assert.equal(r.body.plan.title, 'Install shell');
  assert.equal(r.body.plan.blocks.length, 2);
  assert.equal(r.body.plan.updated_at, first);
  r = await call({ method: 'GET', query: '?id=varsity_2026-12-01' });
  assert.equal(r.body.plan, null);
  r = await call({ method: 'GET', query: '?id=../admins' });
  assert.equal(r.status, 400);
  // A JV plan the same day, then the list.
  r = await call({ body: { action: 'save', plan: { ...plan, team: 'JV', title: 'JV day' }, expect: '' }, key: code('Matt') });
  assert.equal(r.status, 200);
  r = await call({ method: 'GET', query: '?from=2026-11-20&to=2026-11-30' });
  assert.deepEqual(r.body.plans.map((p) => p.id), ['jv_2026-11-24', 'varsity_2026-11-24']);
  const row = r.body.plans[1];
  assert.equal(row.title, 'Install shell');
  assert.equal(row.blocks, 2);
  assert.equal(row.totals.minutes, 26);
  assert.equal(row.totals.end, '15:56');
  assert.deepEqual(row.cats, { defense: 20, conditioning: 6 });
  assert.equal(row.updated_by, 'Eric');
  r = await call({ method: 'GET', query: '?from=2026-11-20&to=2026-11-30&team=JV' });
  assert.deepEqual(r.body.plans.map((p) => p.id), ['jv_2026-11-24']);
  r = await call({ method: 'GET', query: '?from=2026-11-25&to=2026-11-30' });
  assert.deepEqual(r.body.plans, []);
  // The default window: four weeks back through two weeks ahead of today.
  await fake.withNow('2026-11-25T18:00:00Z', async () => {
    r = await call({ method: 'GET' });
    assert.equal(r.body.from, '2026-10-28');
    assert.equal(r.body.to, '2026-12-09');
    assert.equal(r.body.plans.length, 2);
  });
  // Matt loaded the old version and saves over Eric's newer one: refused with the current copy.
  r = await call({ body: { action: 'save', plan: { ...plan, title: 'Changed' }, expect: 'something-old' }, key: code('Matt') });
  assert.equal(r.status, 409);
  assert.equal(r.body.error, 'stale');
  assert.equal(r.body.plan.title, 'Install shell');
  r = await call({ body: { action: 'save', plan: { ...plan, title: 'Changed' }, expect: first }, key: code('Matt') });
  assert.equal(r.status, 200);
  assert.equal(r.body.plan.updated_by, 'Matt');
  r = await call({ body: { action: 'save', plan: { ...plan, date: 'soon' }, expect: '' } });
  assert.equal(r.status, 400);
  // Copy to another day; the same day and a day that already has a plan are refused.
  r = await call({ body: { action: 'copy', id: 'varsity_2026-11-24', date: '2026-11-25' }, key: code('Eric') });
  assert.equal(r.status, 200);
  assert.equal(r.body.plan.id, 'varsity_2026-11-25');
  assert.equal(r.body.plan.title, 'Changed');
  assert.equal(r.body.plan.blocks.length, 2);
  assert.equal(r.body.plan.updated_by, 'Eric');
  r = await call({ body: { action: 'copy', id: 'varsity_2026-11-24', date: '2026-11-25' } });
  assert.equal(r.status, 409);
  assert.equal(r.body.error, 'exists');
  r = await call({ body: { action: 'copy', id: 'varsity_2026-11-24', date: '2026-11-24' } });
  assert.equal(r.status, 400);
  r = await call({ body: { action: 'copy', id: 'varsity_2026-11-24', date: '2026-11-26', team: '9th Grade' } });
  assert.equal(r.body.plan.id, '9th-grade_2026-11-26');
  r = await call({ body: { action: 'copy', id: 'varsity_2026-12-31', date: '2026-11-26' } });
  assert.equal(r.status, 404);
  // Delete.
  r = await call({ body: { action: 'delete', id: 'varsity_2026-11-25' }, key: code('Matt') });
  assert.equal(r.status, 200);
  assert.equal(fake.doc('practice_plans/aces_varsity_2026-11-25'), null);
  r = await call({ method: 'GET', query: '?from=2026-11-20&to=2026-11-30' });
  assert.deepEqual(r.body.plans.map((p) => p.id), ['jv_2026-11-24', 'varsity_2026-11-24', '9th-grade_2026-11-26']);
  r = await call({ body: { action: 'delete', id: 'bad id' } });
  assert.equal(r.status, 400);
});

await test('any coach adds or removes a custom drill; the library is not duplicated', async () => {
  const staff = fake.doc('scouting_meta/aces_staff').staff;
  const matt = staff[0].code;
  let r = await call({ body: { action: 'drill_add', drill: { name: 'Grugan closeout game', cat: 'defense', minutes: 7, note: 'Three closeouts then live' } }, key: matt });
  assert.equal(r.status, 200);
  assert.equal(r.body.custom.length, 1);
  assert.equal(r.body.custom[0].id, 'c-grugan-closeout-game');
  assert.equal(r.body.drills.length, DRILLS.length + 1);
  assert.equal(fake.doc('practice_meta/aces_drills').updated_by, 'Matt');
  r = await call({ body: { action: 'drill_add', drill: { name: 'grugan closeout game', cat: 'defense' } } });
  assert.equal(r.body.error, 'already_there');
  r = await call({ body: { action: 'drill_add', drill: { name: 'Shell drill', cat: 'defense' } } });
  assert.equal(r.body.error, 'already_there');
  r = await call({ body: { action: 'drill_add', drill: { name: '' } } });
  assert.equal(r.status, 400);
  r = await call({ method: 'GET', query: '?drills=1' });
  assert.equal(r.body.drills.length, DRILLS.length + 1);
  r = await call({ body: { action: 'drill_remove', id: 'c-grugan-closeout-game' }, key: matt });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.custom, []);
  r = await call({ body: { action: 'drill_remove', id: 'c-grugan-closeout-game' } });
  assert.equal(r.status, 404);
  r = await call({ body: { action: 'nope' } });
  assert.equal(r.status, 400);
  r = await call({ method: 'PUT' });
  assert.equal(r.status, 405);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
