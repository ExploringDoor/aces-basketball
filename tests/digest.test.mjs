// Offline tests for the nightly Shoot-a-Thon summary (api/donation-digest.js) and for the donor
// emails no longer copying the admin. The REAL handlers run against the in-memory Firestore /
// Stripe / SendGrid fakes, with the clock pinned. Zero network.
// Run: node tests/digest.test.mjs

import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import * as fake from './_fake.js';
import { SHOOTATHON } from '../api/_shootathon.js';
import digest, { digestFor } from '../api/donation-digest.js';
import { buildDonationDigestEmail } from '../api/_email.js';
import pledge from '../api/pledge.js';
import shootathon from '../api/shootathon.js';
import webhook from '../api/webhook-stripe.js';

fake.install();

let pass = 0, fail = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => fake.assertClean()).then(
    () => { pass++; console.log('  ✓', name); },
    (e) => { fail++; console.log('  ✗', name, '\n       ', String(e && e.stack || e).split('\n').slice(0, 6).join('\n       ')); }
  );
}
function group(title) { fake.reset(); console.log('\n' + title); }
function mockRes() {
  const r = { statusCode: 200, body: null, headers: {} };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (j) => { r.body = j; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; return r; };
  r.end = () => r;
  return r;
}
function mockReq(o) { return Object.assign({ method: 'GET', headers: {}, query: {}, body: {} }, o); }
async function call(handler, o) { const res = mockRes(); await handler(mockReq(o), res); return res; }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const CRON = { authorization: `Bearer ${process.env.CRON_SECRET}` };
const ADMIN = { 'x-admin-key': process.env.ADMIN_PASSWORD };
const EV = SHOOTATHON.eventId;
const MARK = 'shootathon/_digest_aces';
// 11 PM Eastern on Thu Dec 3 2026 = 04:00 UTC Fri Dec 4 (the cron's time).
const NIGHT = '2026-12-04T04:00:00.000Z';
const H = 3600 * 1000;
const at = (hoursBeforeNight) => new Date(Date.parse(NIGHT) - hoursBeforeNight * H).toISOString();

function seedEvent() {
  fake.seed(`shootathon/${EV}`, {
    title: 'Aces Shoot-a-Thon', open: true, org_goal_cents: 3900000,
    teams: [{ slug: 'varsity', name: 'Varsity', goal_cents: 1600000 }, { slug: 'jv', name: 'JV', goal_cents: 1100000 }],
    players: [
      { slug: 'nile-r', name: 'Nile R', team: 'varsity', goal_cents: 100000, makes: 0 },
      { slug: 'kyle-p', name: 'Kyle P', team: 'jv', goal_cents: 100000, makes: 0 },
    ],
  });
}
let n = 0;
function seedPledge(o) {
  const id = 'pl' + (++n);
  const who = (o && o.donor_name) || 'Pat Donor';
  fake.seed('pledges/' + id, Object.assign({ event_id: EV, site: 'aces', kind: 'flat', target_type: 'player', target_slug: 'nile-r', donor_name: who, donor_email: who.toLowerCase().replace(/[^a-z0-9]+/g, '.') + '@x.com', anonymous: false, fee_cents: 0, cover_fee: false }, o));
  return id;
}
// A realistic night: what should and should not be in it.
function seedNight() {
  fake.reset();
  seedEvent();
  const ids = {};
  ids.cardToday = seedPledge({ donor_name: 'Mary Smith', status: 'paid', flat_cents: 5000, amount_cents: 5181, fee_cents: 181, amount_paid_cents: 5181, created: at(5), paid_at: at(5) });   // $50 gift + $1.81 fee covered
  ids.teamToday = seedPledge({ donor_name: 'Joe Fan', anonymous: true, status: 'paid', target_type: 'team', target_slug: 'jv', flat_cents: 2500, amount_cents: 2500, amount_paid_cents: 2500, created: at(3), paid_at: at(3) });
  ids.orgToday = seedPledge({ donor_name: 'Grandma G', status: 'paid', target_type: 'org', target_slug: '', flat_cents: 10000, amount_cents: 10000, amount_paid_cents: 10000, created: at(1), paid_at: at(1) });
  ids.cashBackdated = seedPledge({ donor_name: 'Cash Dad', status: 'paid', offline: true, paid_via: 'Check', check_no: '1042', flat_cents: 2000, amount_cents: 2000, amount_paid_cents: 2000, created: '2026-11-20T12:00:00.000Z', paid_at: '2026-11-20T12:00:00.000Z', recorded_at: at(2) });
  ids.oldGift = seedPledge({ donor_name: 'Last Week', status: 'paid', flat_cents: 30000, amount_cents: 30000, amount_paid_cents: 30000, created: at(30), paid_at: at(30) });
  ids.perThrowToday = seedPledge({ donor_name: 'Uncle Bob', kind: 'per_shot', status: 'pledged', per_shot_cents: 100, cap_cents: 5000, flat_cents: 0, amount_cents: 0, amount_paid_cents: 0, created: at(4) });
  ids.perThrowOld = seedPledge({ donor_name: 'Aunt Sue', kind: 'per_shot', status: 'pledged', per_shot_cents: 50, cap_cents: 0, flat_cents: 0, amount_cents: 0, amount_paid_cents: 0, created: at(40) });
  ids.abandoned = seedPledge({ donor_name: 'Never Paid', status: 'pending', flat_cents: 9900, amount_cents: 9900, amount_paid_cents: 0, created: at(2) });
  ids.removed = seedPledge({ donor_name: 'Test Entry', status: 'removed', offline: true, flat_cents: 100000, amount_cents: 100000, amount_paid_cents: 100000, created: at(2), paid_at: at(2), recorded_at: at(2) });
  ids.refundedToday = seedPledge({ donor_name: 'Oops Person', status: 'refunded', flat_cents: 4000, amount_cents: 4000, amount_paid_cents: 4000, amount_refunded_cents: 4000, created: at(50), paid_at: at(50), refunded_at: at(6) });
  ids.otherEvent = seedPledge({ event_id: 'spring-2027', donor_name: 'Other Event', status: 'paid', flat_cents: 7700, amount_cents: 7700, amount_paid_cents: 7700, created: at(2), paid_at: at(2) });
  seedMarker(at(24), 34000);
  ids.tooFresh = seedPledge({ donor_name: 'Just Now', status: 'paid', flat_cents: 1500, amount_cents: 1500, amount_paid_cents: 1500, created: at(0.01), paid_at: at(0.01) });   // 36 s before the run: next night
  return ids;
}
const send = () => fake.withNow(NIGHT, () => call(digest, { headers: CRON }));
const runAt = (iso) => fake.withNow(iso, () => call(digest, { headers: CRON }));
const later = (h) => new Date(Date.parse(NIGHT) + h * H).toISOString();
// The marker as the previous night's summary left it.
function seedMarker(sentThrough, raised) { fake.seed(MARK, { sent_through: sentThrough, reported_raised_cents: raised, lock_until: '' }); }
// Make only the requests matching `pred` fail with `status` (everything else goes to the fake).
async function failing(pred, status, fn) {
  const inner = globalThis.fetch;
  globalThis.fetch = async (url, init) => (pred(String(url), (init && init.method) || 'GET') ? new Response(JSON.stringify([{ error: { code: status, status: 'UNAVAILABLE', message: 'forced' } }]), { status, headers: { 'content-type': 'application/json' } }) : inner(url, init));
  try { return await fn(); } finally { globalThis.fetch = inner; }
}
const isQuery = (u) => u.includes(':runQuery');
const isMarkPatch = (u, m) => m === 'PATCH' && u.includes('_digest_aces');

group('1. Who may run it');
await test('no auth → 401, nothing read or sent', async () => {
  seedNight();
  const res = await fake.withNow(NIGHT, () => call(digest, {}));
  assert.equal(res.statusCode, 401);
  assert.equal(fake.mails().length, 0);
});
await test('wrong cron secret → 401', async () => {
  const res = await fake.withNow(NIGHT, () => call(digest, { headers: { authorization: 'Bearer nope' } }));
  assert.equal(res.statusCode, 401);
});

group('2. One email a night, with the right numbers');
await test('a normal night: ONE email to the admin, no BCC, everything since the last summary', async () => {
  seedNight();
  const res = await send();
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  assert.equal(res.body.sent, true);
  const m = fake.mails();
  assert.equal(m.length, 1);
  assert.deepEqual(m[0].to, [ADMIN_EMAIL]);
  assert.deepEqual(m[0].bcc, []);
  // today = $50 (fee left out) + $25 + $100 + $20 check entered today = $195
  assert.equal(res.body.gift_cents, 19500);
  assert.equal(res.body.gifts, 4);
  assert.equal(res.body.pledges, 1);
  assert.equal(res.body.refunds, 1);
  assert.equal(res.body.adjust_cents, 0, 'nothing unexplained');
  // total as of the run = last week's $300 + today's $195 (the $15 from 36 s ago waits for tomorrow)
  assert.equal(res.body.raised_cents, 49500);
  assert.equal(m[0].subject, 'Shoot-a-Thon: $195 raised today, $495 total');
  const h = m[0].html;
  for (const x of ['Mary Smith', 'Joe Fan', '(shows as Anonymous)', 'Grandma G', 'Cash Dad', 'check #1042', 'Uncle Bob', '$1.00 a throw', 'for Nile R, up to $50.00', 'Oops Person', 'Varsity', 'JV', 'Whole program', 'Thursday, December 3', '$1.81 in card fees', 'from 5 donors']) assert.ok(h.includes(x), 'email should mention ' + x);
  for (const x of ['Last Week', 'Aunt Sue', 'Never Paid', 'Test Entry', 'Other Event', 'Just Now', 'went up', 'went down']) assert.ok(!h.includes(x), 'email must NOT show ' + x);
  assert.ok(/Oops Person[\s\S]*?\$40</.test(h), 'the refund shows the $40 gift');
  assert.ok(h.includes('2 per throw pledges for 1 player, billed after the event.'));
  assert.ok(!/[–—]/.test(m[0].subject + m[0].text), 'no dashes in the summary text');
  const mk = fake.doc(MARK);
  assert.equal(mk.sent_through, new Date(Date.parse(NIGHT) - 2 * 60 * 1000).toISOString());
  assert.equal(mk.reported_raised_cents, 49500);
  assert.equal(mk.lock_until, '');
  assert.equal(mk.last_subject, m[0].subject);
});
await test('team totals match the donate page thermometers', async () => {
  seedNight();
  const event = fake.doc(`shootathon/${EV}`);
  const d = digestFor(event, fake.docs('pledges'), Date.parse(NIGHT) - 24 * H, Date.parse(NIGHT) + H);   // after every record, so "as of" = now
  const page = await call(pledge, {});
  assert.deepEqual(Object.fromEntries(d.teams.map((t) => [t.name, t.raised_cents])), Object.fromEntries(page.body.teams.map((t) => [t.name, t.raised_cents])));
  assert.equal(d.raised_cents, page.body.org.raised_cents);
  assert.equal(d.program_cents, 10000, 'the $100 program gift');
  assert.equal(d.unteamed_cents, 0);
});
await test('the cron firing twice the same night sends nothing the second time', async () => {
  seedNight();
  await send();
  const again = await runAt(later(5 / 60));
  assert.equal(again.body.skipped, 'too_soon');
  assert.equal(fake.mails().length, 1);
});
await test('two runs at the same moment: only one email', async () => {
  seedNight();
  const [a, b] = await fake.withNow(NIGHT, () => Promise.all([call(digest, { headers: CRON }), call(digest, { headers: CRON })]));
  assert.equal(fake.mails().length, 1, JSON.stringify([a.body, b.body]));
  assert.deepEqual([a.body.sent, b.body.sent].sort(), [false, true]);
});
await test('next night: only what is new, and the totals add up night to night', async () => {
  seedNight();
  await send();
  seedPledge({ donor_name: 'Friday Giver', status: 'paid', flat_cents: 3000, amount_cents: 3000, amount_paid_cents: 3000, created: later(21), paid_at: later(21) });
  const res = await runAt(later(24));
  assert.equal(res.body.sent, true, JSON.stringify(res.body));
  const m = fake.mails()[1];
  assert.ok(m.html.includes('Friday Giver') && m.html.includes('Just Now'));
  assert.ok(!m.html.includes('Mary Smith'), 'last night\'s gifts are not repeated');
  assert.equal(res.body.gift_cents, 4500);
  assert.equal(res.body.adjust_cents, 0);
  assert.equal(m.subject, 'Shoot-a-Thon: $45 raised today, $540 total', '$495 + $45');
});
await test('a quiet night sends nothing but still moves the marker', async () => {
  seedNight();
  await send();
  await runAt(later(24));                     // picks up the 36 s old gift
  const res = await runAt(later(48));
  assert.equal(res.body.sent, false);
  assert.equal(res.body.quiet, true);
  assert.equal(fake.mails().length, 2);
  assert.equal(fake.doc(MARK).sent_through, new Date(Date.parse(later(48)) - 2 * 60 * 1000).toISOString());
});
await test('only new pledges (no money yet): subject says so', async () => {
  fake.reset(); seedEvent(); seedMarker(at(24), 0);
  seedPledge({ donor_name: 'Uncle Bob', kind: 'per_shot', status: 'pledged', per_shot_cents: 200, cap_cents: 0, flat_cents: 0, amount_cents: 0, amount_paid_cents: 0, created: at(4) });
  const res = await send();
  assert.equal(res.body.sent, true);
  assert.equal(fake.mails()[0].subject, 'Shoot-a-Thon: 1 new pledge today, $0 raised so far');
});
await test('the very first summary starts when the per gift copies stopped, not 24 hours back', async () => {
  fake.reset(); seedEvent();
  seedPledge({ donor_name: 'Before Cutover', status: 'paid', flat_cents: 1000, amount_cents: 1000, amount_paid_cents: 1000, created: '2026-11-27T19:00:00.000Z', paid_at: '2026-11-27T19:00:00.000Z' });
  seedPledge({ donor_name: 'After Cutover', status: 'paid', flat_cents: 2000, amount_cents: 2000, amount_paid_cents: 2000, created: '2026-11-27T22:00:00.000Z', paid_at: '2026-11-27T22:00:00.000Z' });
  const res = await runAt('2026-11-28T04:00:00.000Z');
  assert.equal(res.body.sent, true, JSON.stringify(res.body));
  const m = fake.mails()[0];
  assert.ok(m.html.includes('After Cutover') && !m.html.includes('Before Cutover'));
  assert.equal(m.subject, 'Shoot-a-Thon: $20 raised today, $30 total');
});

group('3. Nothing gets lost when something fails');
await test('the pledge read fails: 500, marker untouched, next night covers both nights', async () => {
  seedNight();
  const before = fake.doc(MARK).sent_through;
  const res = await failing(isQuery, 503, () => send());
  assert.equal(res.statusCode, 500, JSON.stringify(res.body));
  assert.equal(fake.mails().length, 0);
  assert.equal(fake.doc(MARK).sent_through, before);
  assert.equal(fake.doc(MARK).lock_until, '', 'lease handed back');
  const res2 = await runAt(later(24));
  assert.equal(res2.body.sent, true, JSON.stringify(res2.body));
  const m = fake.mails()[0];
  assert.ok(m.html.includes('Mary Smith'), 'the failed night\'s gifts are in the next summary');
  assert.match(m.subject, / since Wednesday, /);
});
await test('a 200 query with an error inside also counts as a failed read', async () => {
  seedNight();
  const inner = globalThis.fetch;
  globalThis.fetch = async (url, init) => (isQuery(String(url)) ? new Response(JSON.stringify([{ readTime: 'x' }, { error: { code: 503 } }]), { status: 200 }) : inner(url, init));
  let res; try { res = await send(); } finally { globalThis.fetch = inner; }
  assert.equal(res.statusCode, 500);
  assert.equal(fake.mails().length, 0);
});
await test('the email fails: marker stays, tomorrow\'s summary includes tonight', async () => {
  seedNight();
  fake.state.opts.fail.sendgrid = 500;
  const res = await send();
  fake.state.opts.fail.sendgrid = 0;
  assert.equal(res.statusCode, 502);
  assert.equal(fake.doc(MARK).sent_through, at(24));
  assert.equal(fake.doc(MARK).last_error, 'send_failed');
  const res2 = await runAt(later(24));
  assert.equal(res2.body.sent, true, JSON.stringify(res2.body));
  assert.ok(fake.mails()[0].html.includes('Mary Smith'));
});
await test('the email fails AND the marker write fails: the lease runs out and tomorrow still covers it', async () => {
  seedNight();
  fake.state.opts.fail.sendgrid = 500;
  let calls = 0;
  const res = await failing((u, m) => isMarkPatch(u, m) && ++calls > 1, 503, () => send());   // the claim lands, every later marker write fails
  fake.state.opts.fail.sendgrid = 0;
  assert.equal(res.statusCode, 502);
  assert.ok(fake.doc(MARK).lock_until, 'the lease was never handed back');
  assert.equal(fake.doc(MARK).sent_through, at(24));
  const res2 = await runAt(later(24));
  assert.equal(res2.body.sent, true, JSON.stringify(res2.body));
  assert.ok(fake.mails()[0].html.includes('Mary Smith'));
});
await test('a run that died holding the lease: the next run within 5 minutes waits, a later one goes', async () => {
  seedNight();
  fake.seed(MARK, Object.assign(fake.doc(MARK), { lock_until: later(3 / 60) }));
  const r1 = await send();
  assert.equal(r1.body.skipped, 'another_run');
  const r2 = await runAt(later(10 / 60));
  assert.equal(r2.body.sent, true, JSON.stringify(r2.body));
});
await test('first ever run cannot create the marker (Firestore 503): an error, not "another run"', async () => {
  fake.reset(); seedEvent();
  seedPledge({ donor_name: 'Mary Smith', status: 'paid', flat_cents: 5000, amount_cents: 5000, amount_paid_cents: 5000, created: at(3), paid_at: at(3) });
  const res = await failing((u, m) => m === 'POST' && u.includes('documentId=_digest_aces'), 503, () => send());
  assert.equal(res.statusCode, 503);
  assert.equal(fake.mails().length, 0);
  assert.equal(fake.doc(MARK), null);
});
await test('admin preview shows the email without sending or touching the marker', async () => {
  seedNight();
  const before = fake.meta(MARK).updateTime;
  const res = await fake.withNow(NIGHT, () => call(digest, { headers: ADMIN, query: { preview: '1' } }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.preview, true);
  assert.ok(res.body.html.includes('Mary Smith'));
  assert.equal(fake.mails().length, 0);
  assert.equal(fake.meta(MARK).updateTime, before);
});
await test('no event set up yet: nothing sent', async () => {
  fake.reset();
  const res = await send();
  assert.equal(res.body.skipped, 'no_event');
  assert.equal(fake.mails().length, 0);
});

group('4. Money details');
await test('an edited earlier gift is explained, even on a night with nothing else', async () => {
  seedNight();
  await send();
  const id = fake.docs('pledges').find((p) => p.donor_name === 'Cash Dad').id;
  fake.seed('pledges/' + id, Object.assign(fake.doc('pledges/' + id), { amount_cents: 20000, amount_paid_cents: 20000, flat_cents: 20000, edited_at: later(20) }));
  const res = await runAt(later(24));
  assert.equal(res.body.sent, true, JSON.stringify(res.body));
  assert.equal(res.body.adjust_cents, 18000);
  const m = fake.mails()[1];
  assert.ok(m.html.includes('went up $180 from changes to earlier gifts'), m.html);
  assert.equal(m.subject, 'Shoot-a-Thon: $15 raised today, $690 total', '$495 + $15 just now + $180 fix');
});
await test('a removed earlier gift is explained', async () => {
  seedNight();
  await send();
  const id = fake.docs('pledges').find((p) => p.donor_name === 'Grandma G').id;
  fake.seed('pledges/' + id, Object.assign(fake.doc('pledges/' + id), { status: 'removed', status_before_remove: 'paid', removed_at: later(20) }));
  const res = await runAt(later(24));
  assert.equal(res.body.sent, true, JSON.stringify(res.body));
  assert.equal(res.body.adjust_cents, -10000);
  const m = fake.mails()[1];
  assert.ok(m.html.includes('went down $100 from changes to earlier gifts'));
  assert.equal(m.subject, 'Shoot-a-Thon: $15 raised today, $410 total', '$495 + $15 just now, minus the removed $100');
});
await test('a night with only a change to an earlier gift still sends, and says so', async () => {
  fake.reset(); seedEvent(); seedMarker(at(24), 0);
  seedPledge({ donor_name: 'Put Back', status: 'paid', offline: true, paid_via: 'Cash', flat_cents: 10000, amount_cents: 10000, amount_paid_cents: 10000, created: at(50), paid_at: at(50), recorded_at: at(50) });
  const res = await send();
  assert.equal(res.body.sent, true, JSON.stringify(res.body));
  assert.equal(fake.mails()[0].subject, 'Shoot-a-Thon: Total changed today, $100 raised so far');
  assert.ok(fake.mails()[0].html.includes('went up $100'));
});
await test('a gift paid and refunded the same day is not an unexplained change', async () => {
  fake.reset(); seedEvent(); seedMarker(at(24), 0);
  seedPledge({ donor_name: 'Same Day', status: 'refunded', flat_cents: 5000, amount_cents: 5181, fee_cents: 181, amount_paid_cents: 5181, amount_refunded_cents: 5181, created: at(5), paid_at: at(5), refunded_at: at(2) });
  const res = await send();
  assert.equal(res.body.adjust_cents, 0);
  assert.ok(/Same Day[\s\S]*?\$50</.test(fake.mails()[0].html), 'refund shows the $50 gift, not $51.81');
});
await test('donors are counted once each, and unpaid checkouts are not donors', async () => {
  fake.reset(); seedEvent();
  seedPledge({ donor_email: 'a@x.com', status: 'paid', flat_cents: 1000, amount_cents: 1000, amount_paid_cents: 1000, created: at(3), paid_at: at(3) });
  seedPledge({ donor_email: 'A@x.com', status: 'paid', flat_cents: 1000, amount_cents: 1000, amount_paid_cents: 1000, created: at(2), paid_at: at(2) });
  seedPledge({ donor_email: 'b@x.com', status: 'pending', flat_cents: 1000, amount_cents: 1000, created: at(2) });
  seedPledge({ donor_email: 'c@x.com', status: 'error', flat_cents: 1000, amount_cents: 1000, created: at(2) });
  const d = digestFor(fake.doc(`shootathon/${EV}`), fake.docs('pledges'), Date.parse(NIGHT) - 24 * H, Date.parse(NIGHT));
  assert.equal(d.donors, 1);
});
await test('per throw pledges on several players: no summed rate; once makes are in, the real projection', async () => {
  fake.reset(); seedEvent();
  seedPledge({ kind: 'per_shot', status: 'pledged', target_slug: 'nile-r', per_shot_cents: 500, cap_cents: 1000, flat_cents: 0, amount_cents: 0, created: at(3) });
  seedPledge({ kind: 'per_shot', status: 'pledged', target_slug: 'kyle-p', per_shot_cents: 200, cap_cents: 0, flat_cents: 0, amount_cents: 0, created: at(3) });
  let d = digestFor(fake.doc(`shootathon/${EV}`), fake.docs('pledges'), Date.parse(NIGHT) - 24 * H, Date.parse(NIGHT));
  assert.equal(d.open_players, 2);
  const { html } = buildDonationDigestEmail(d);
  assert.ok(html.includes('2 per throw pledges for 2 players, billed after the event.'));
  const ev = fake.doc(`shootathon/${EV}`);
  ev.players = ev.players.map((p) => Object.assign({}, p, { makes: p.slug === 'nile-r' ? 40 : 30 }));
  d = digestFor(ev, fake.docs('pledges'), Date.parse(NIGHT) - 24 * H, Date.parse(NIGHT));
  assert.equal(d.open_projected_cents, 1000 + 6000, '$5 x 40 capped at $10, plus $2 x 30');
  assert.ok(buildDonationDigestEmail(d).html.includes('about $70'));
});
await test('a gift to a player on no team gets its own row, not "Whole program"', async () => {
  fake.reset();
  fake.seed(`shootathon/${EV}`, { open: true, org_goal_cents: 100000, teams: [{ slug: 'varsity', name: 'Varsity', goal_cents: 50000 }], players: [{ slug: 'solo', name: 'Solo P', team: '' }] });
  seedPledge({ target_slug: 'solo', status: 'paid', flat_cents: 3000, amount_cents: 3000, amount_paid_cents: 3000, created: at(3), paid_at: at(3) });
  const d = digestFor(fake.doc(`shootathon/${EV}`), fake.docs('pledges'), Date.parse(NIGHT) - 24 * H, Date.parse(NIGHT));
  assert.equal(d.program_cents, 0);
  assert.equal(d.unteamed_cents, 3000);
  assert.ok(buildDonationDigestEmail(d).html.includes('Players not on a team'));
});
await test('a donor name with markup is shown as text, never as HTML', async () => {
  fake.reset(); seedEvent(); seedMarker(at(24), 0);
  seedPledge({ donor_name: '<img src=x onerror=alert(1)>Evil', status: 'paid', flat_cents: 1000, amount_cents: 1000, amount_paid_cents: 1000, created: at(3), paid_at: at(3) });
  await send();
  const h = fake.mails()[0].html;
  assert.ok(!h.includes('<img') && h.includes('&lt;img'));
});
await test('a very long night stays under Gmail\'s clipping size and keeps the totals first', async () => {
  fake.reset(); seedEvent(); seedMarker(at(24), 0);
  for (let i = 0; i < 300; i++) seedPledge({ donor_name: 'Donor Number ' + i, status: 'paid', flat_cents: 1000, amount_cents: 1000, amount_paid_cents: 1000, created: at(10 - i / 100), paid_at: at(10 - i / 100) });
  await send();
  const h = fake.mails()[0].html;
  assert.ok(h.length < 60000, 'html ' + h.length + ' bytes');
  assert.ok(h.includes('and 240 more on the Shoot-a-Thon admin page'));
  assert.ok(h.indexOf('By team') < h.indexOf('Came in today'));
});

group('5. Donor emails no longer copy the admin');
await test('per throw pledge confirmation goes to the donor only', async () => {
  fake.reset(); seedEvent();
  const res = await call(pledge, { method: 'POST', headers: { 'x-forwarded-for': '1.2.3.4' }, body: { kind: 'per_shot', target_type: 'player', target_slug: 'nile-r', per_shot_cents: 100, donor_name: 'Uncle Bob', donor_email: 'bob@x.com' } });
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  const m = fake.mails();
  assert.equal(m.length, 1);
  assert.deepEqual(m[0].to, ['bob@x.com']);
  assert.deepEqual(m[0].bcc, []);
});
await test('one time gift paid (webhook) → receipt to the donor only', async () => {
  fake.reset(); seedEvent();
  const res = await call(pledge, { method: 'POST', headers: { 'x-forwarded-for': '1.2.3.5' }, body: { kind: 'flat', target_type: 'player', target_slug: 'nile-r', flat_cents: 5000, donor_name: 'Mary Smith', donor_email: 'mary@x.com' } });
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  const id = res.body.id;
  const p = fake.doc('pledges/' + id);
  fake.stripe.pay(p.stripe_session_id);
  const raw = JSON.stringify({ id: 'evt_' + id, object: 'event', type: 'checkout.session.completed', data: { object: { id: p.stripe_session_id, object: 'checkout.session', client_reference_id: id, metadata: { kind: 'donation', pledge_id: id, site: 'aces' }, payment_status: 'paid' } } });
  const t = Math.floor(Date.now() / 1000);
  const sig = `t=${t},v1=${createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${t}.`).update(raw).digest('hex')}`;
  const w = await call(webhook, { method: 'POST', headers: { 'stripe-signature': sig, 'content-type': 'application/json' }, body: raw });
  assert.equal(fake.doc('pledges/' + id).status, 'paid', JSON.stringify(w.body));
  const m = fake.mails();
  assert.equal(m.length, 1, 'just the receipt');
  assert.deepEqual(m[0].to, ['mary@x.com']);
  assert.deepEqual(m[0].bcc, []);
});
await test('cash gift typed in by the admin is stamped with when it was entered', async () => {
  fake.reset(); seedEvent();
  const res = await fake.withNow(NIGHT, () => call(shootathon, { method: 'POST', headers: ADMIN, body: { action: 'add_offline', donor_name: 'Cash Dad', amount_cents: 2000, method: 'check', date: '2026-11-20', target_type: 'player', target_slug: 'nile-r' } }));
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  const d = fake.doc('pledges/' + res.body.id);
  assert.equal(d.paid_at, '2026-11-20T12:00:00.000Z');
  assert.equal(d.recorded_at, NIGHT);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
