// Aces Newsletter: the pure email builder and the /api/newsletter handler against
// the in-memory Firestore and SendGrid fakes. Zero network.
// Run: npm test   (or: node tests/newsletter.test.mjs)
import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import { SITE_TAG } from '../api/_site.js';
import { SHOOTATHON } from '../api/_shootathon.js';
import { UNSUB_TAG, buildNewsletterHtml, subjectFor, extractEmails, cleanContent, hasContent, cleanGame, weekLabelFor, unsubscribePageHtml } from '../api/_newsletter.js';
import handler, { tokenFor } from '../api/newsletter.js';

fake.install();

let pass = 0, fail = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => fake.assertClean()).then(
    () => { pass++; console.log('  ✓', name); },
    (e) => { fail++; console.log('  ✗', name, '\n       ', String(e && e.message || e).split('\n').join('\n       ')); }
  );
}
// Same shape as tests/scouting.test.mjs, with the body kept raw when the
// handler answers HTML (the unsubscribe page) and an optional content type
// for the page's form post. key: 'admin-pass' is ADMIN_PASSWORD in tests/_env.js.
async function call({ method = 'POST', body, query = '', key = 'admin-pass', ip = '203.0.113.9', form = false } = {}) {
  const headers = { 'x-forwarded-for': ip };
  if (key) headers['x-admin-key'] = key;
  if (form) headers['content-type'] = 'application/x-www-form-urlencoded';
  const req = { method, url: `/api/newsletter${query}`, headers, body };
  const out = { status: 0, headers: {}, body: null, text: '' };
  const res = { set statusCode(c) { out.status = c; }, get statusCode() { return out.status; }, setHeader(k, v) { out.headers[k] = v; }, end(b) { out.text = String(b || ''); try { out.body = JSON.parse(out.text); } catch { out.body = null; } } };
  await handler(req, res);
  return out;
}

const ORIGIN = 'https://dba.test'; // SITE_URL in tests/_env.js
const games = [
  { date: 'Dec 4', opp: 'Chester', home: true, time: '7:00 PM', iso: '2026-12-04T19:00:00-05:00', venue: 'Kobe Bryant Gymnasium', logo: '/logos/chester.png', us: 61, them: 55 },
  { date: 'Dec 8', opp: 'Conestoga', home: true, time: '7:00 PM', iso: '2026-12-08T19:00:00-05:00', venue: 'Kobe Bryant Gymnasium', conf: true, logo: '/logos/conestoga.png', us: 48, them: 52 },
  { date: 'Dec 15', opp: 'Haverford', home: false, time: '6:00 PM', iso: '2026-12-15T18:00:00-05:00', venue: 'Haverford HS', conf: true, logo: '/logos/haverford.png' },
  { date: 'Dec 17', opp: 'Upper Darby', home: false, time: '5:15 PM', iso: '2026-12-17T17:15:00-05:00', venue: 'Upper Darby HS', conf: true, logo: '/logos/upper-darby.png' },
];
const full = {
  origin: ORIGIN, weekLabel: 'Dec 1 to Dec 7, 2026', intro: 'What a week.\nSee you Tuesday.',
  results: games.slice(0, 2), upcoming: games.slice(2),
  playerOfGame: { name: 'Jimmy D', line: '24 points and 9 boards against Chester', photoUrl: '/players/jimmy-d.jpg' },
  fundraiser: { raisedCents: 1234500, goalCents: 3000000, makes: 412, url: ORIGIN + '/donate.html' },
  store: { items: [{ name: 'Aces Hoodie', priceCents: 4500, imageUrl: ORIGIN + '/Bulldog.png', url: ORIGIN + '/store' }, { name: 'Winter Beanie', priceCents: 2200, imageUrl: ORIGIN + '/Bulldog.png', url: ORIGIN + '/store' }, { name: 'Practice Shorts', priceCents: 3000, imageUrl: ORIGIN + '/Bulldog.png', url: ORIGIN + '/store' }]},
};

await test('the builder renders every section, table based, with absolute images and the unsubscribe placeholder', () => {
  const h = buildNewsletterHtml(full);
  for (const s of ['Aces Newsletter', 'Dec 1 to Dec 7, 2026', 'What a week.<br>See you Tuesday.', 'Results', 'Coming up', 'Player of the game', 'Shoot-a-Thon', 'From the team store']) assert.ok(h.includes(s), 'missing ' + s);
  assert.ok(h.includes(`${ORIGIN}/LM_Logo.png`) && h.includes(`${ORIGIN}/Bulldog.png`) && h.includes(`${ORIGIN}/logos/chester.png`) && h.includes(`${ORIGIN}/players/jimmy-d.jpg`));
  assert.ok(!/src="\/(?!\/)/.test(h), 'a relative image slipped through');
  // The win shows the Aces score in gold; the loss does not.
  assert.ok(/color:#c9a44a;[^"]*">61</.test(h) && /color:#ffffff;[^"]*">48</.test(h) && /color:#ffffff;[^"]*">55</.test(h));
  assert.ok(h.includes('Aces win') && h.includes('Aces fall'));
  assert.ok(h.includes('Fri, Dec 4 at Kobe Bryant Gymnasium'));
  assert.ok(h.includes('at Haverford') && h.includes('6:00 PM, Haverford HS'));
  assert.ok(h.includes('$12,345') && h.includes('of $30,000 raised') && h.includes('41% of the way there') && h.includes('412 free throws made'));
  assert.ok(h.includes('Give to the Shoot-a-Thon') && h.includes(`${ORIGIN}/store`) && h.includes('$45'));
  assert.ok(h.includes(UNSUB_TAG) && h.includes('www.aceshoops.com'));
  assert.ok(!/<div[^>]*class=/.test(h) && h.includes('role="presentation"'));
  assert.ok(Buffer.byteLength(h, 'utf8') < 100 * 1024, 'over 100KB');
  // Owner's copy rules: no exclamation marks, no dashes in the text itself.
  const text = h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  assert.ok(!text.includes('!'), 'exclamation mark in the email copy');
  assert.ok(!/\s[-–—]\s/.test(text), 'a dash used as punctuation');
  assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(h), 'emoji');
});

await test('empty sections are left out and the subject follows the week', () => {
  const h = buildNewsletterHtml({ origin: ORIGIN, weekLabel: 'Dec 1 to Dec 7, 2026', intro: 'Just a note.' });
  for (const s of ['Results', 'Coming up', 'Player of the game', 'Shoot-a-Thon', 'From the team store']) assert.ok(!h.includes(`>${s}<`), 'should omit ' + s);
  assert.ok(h.includes('Just a note.'));
  // A player card without a name, a fundraiser with no numbers, a store with no items: all omitted.
  const h2 = buildNewsletterHtml({ origin: ORIGIN, playerOfGame: { name: '', line: 'x' }, fundraiser: { raisedCents: 0, goalCents: 0 }, store: { items: [] }, upcoming: [games[2]] });
  assert.ok(!h2.includes('Player of the game') && !h2.includes('Shoot-a-Thon') && !h2.includes('From the team store') && h2.includes('Coming up'));
  assert.equal(subjectFor({ weekLabel: 'Dec 1 to Dec 7, 2026', results: [games[0]] }), 'Aces Newsletter, Dec 1 to Dec 7, 2026: Aces beat Chester 61 to 55');
  assert.equal(subjectFor({ weekLabel: 'Dec 1 to Dec 7, 2026', results: games.slice(0, 2) }), 'Aces Newsletter, Dec 1 to Dec 7, 2026: 1 and 1 on the week');
  assert.equal(subjectFor({ weekLabel: '', upcoming: [games[2]] }), 'Aces Newsletter: at Haverford Tuesday');
  assert.equal(subjectFor({ results: [{ ...games[1] }] }), 'Aces Newsletter: Aces fall to Conestoga 52 to 48');
  assert.equal(weekLabelFor('2026-12-01', '2026-12-07'), 'Dec 1 to Dec 7, 2026');
  assert.equal(weekLabelFor('2026-12-07', '2026-12-07'), 'Dec 7, 2026');
});

await test('content from the page is tidied: games split by score, bad rows dropped, toggles honoured', () => {
  const c = cleanContent({ from: '2026-12-01', to: '2026-12-07', intro: '<b>Hi</b>', games: [...games, { opp: '', iso: 'x' }, { opp: 'Nobody' }, { opp: 'Half', iso: '2026-12-20T19:00:00-05:00', us: 50 }], playerOfGame: { name: 'Jimmy D', line: 'x', photoUrl: 'javascript:alert(1)' }, sections: { store: true } });
  assert.equal(c.intro, 'bHi/b');
  assert.deepEqual(c.results.map((g) => g.opp), ['Chester', 'Conestoga']);
  assert.deepEqual(c.upcoming.map((g) => g.opp), ['Haverford', 'Upper Darby', 'Half']);
  assert.equal(c.playerOfGame.photoUrl, '');
  assert.equal(c.wantStore, true);
  assert.equal(c.wantFundraiser, true);
  const off = cleanContent({ games, sections: { results: false, upcoming: false, player: false, fundraiser: false } });
  assert.equal(off.results.length + off.upcoming.length, 0);
  assert.equal(off.playerOfGame, null);
  assert.ok(!hasContent(off) && hasContent(c) && hasContent({ intro: 'x' }) && !hasContent({ intro: '' }));
  assert.equal(cleanGame({ opp: 'Chester', date: 'Dec 4', us: '61', them: '55', logo: 'https://evil/x.png' }).logo, '');
  assert.equal(cleanGame({ opp: 'Chester', date: 'Dec 4', us: 300, them: 55 }).us, null);
  assert.equal(cleanGame(cleanGame({ opp: 'Haverford', date: 'Dec 15' })).us, null);
  assert.deepEqual(extractEmails('Jane Doe <Jane@X.com>, bob@y.org; "Q" <jane@x.com>\nnot-an-email, c@d.io.'), ['jane@x.com', 'bob@y.org', 'c@d.io']);
});

await test('a family signs up from the site; the honeypot and the rate limit hold', async () => {
  fake.reset();
  let r = await call({ body: { action: 'subscribe', email: 'Pat@Example.com', name: ' Pat  Q ' }, key: '' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });
  const subs = fake.docs('newsletter_subs');
  assert.equal(subs.length, 1);
  assert.equal(subs[0].email, 'pat@example.com');
  assert.equal(subs[0].name, 'Pat Q');
  assert.equal(subs[0].status, 'active');
  assert.equal(subs[0].source, 'site');
  assert.equal(subs[0].site, SITE_TAG);
  assert.ok(subs[0].created_at);
  // Signing up twice does not duplicate and does not say it was already there.
  r = await call({ body: { action: 'subscribe', email: 'pat@example.com' }, key: '' });
  assert.deepEqual(r.body, { ok: true });
  assert.equal(fake.docs('newsletter_subs').length, 1);
  // A bot that fills the hidden field is told ok and stored nowhere.
  r = await call({ body: { action: 'subscribe', email: 'bot@example.com', hp: 'http://spam' }, key: '' });
  assert.deepEqual(r.body, { ok: true });
  assert.equal(fake.docs('newsletter_subs').length, 1);
  r = await call({ body: { action: 'subscribe', email: 'nope' }, key: '' });
  assert.equal(r.status, 400);
  // Ten a minute per address, then 429.
  for (let i = 0; i < 10; i++) await call({ body: { action: 'subscribe', email: `f${i}@example.com` }, key: '', ip: '198.51.100.7' });
  r = await call({ body: { action: 'subscribe', email: 'f11@example.com' }, key: '', ip: '198.51.100.7' });
  assert.equal(r.status, 429);
  // Nothing admin-only is reachable without the password.
  r = await call({ method: 'GET', query: '?admin=1', key: '' });
  assert.equal(r.status, 401);
  r = await call({ body: { action: 'add', emails: 'x@y.com' }, key: 'wrong' });
  assert.equal(r.status, 401);
});

await test('unsubscribe: the token verifies, a GET only shows the button, a POST (JSON or the form) stops the emails', async () => {
  fake.reset();
  await call({ body: { action: 'subscribe', email: 'pat@example.com', name: 'Pat' }, key: '' });
  const t = tokenFor('Pat@Example.com');
  assert.match(t, /^[A-Za-z0-9_-]{22}$/);
  assert.equal(t, tokenFor('pat@example.com'));
  // The link a scanner opens: a page with a button, nothing changed.
  let r = await call({ method: 'GET', query: `?u=${encodeURIComponent('pat@example.com')}&t=${t}`, key: '' });
  assert.equal(r.status, 200);
  assert.ok(r.headers['Content-Type'].startsWith('text/html'));
  assert.ok(r.text.includes('Stop these emails') && r.text.includes(`value="${t}"`));
  assert.equal(fake.doc('newsletter_subs/' + fake.docs('newsletter_subs')[0].id).status, 'active');
  // A bad token gets a polite page and no change; a JSON post with a bad token is refused.
  r = await call({ method: 'GET', query: `?u=${encodeURIComponent('pat@example.com')}&t=AAAAAAAAAAAAAAAAAAAAAA`, key: '' });
  assert.ok(r.text.includes('That link did not work'));
  r = await call({ body: { action: 'unsubscribe', email: 'pat@example.com', token: 'AAAAAAAAAAAAAAAAAAAAAA' }, key: '' });
  assert.equal(r.status, 400);
  assert.equal(fake.docs('newsletter_subs')[0].status, 'active');
  // The page's form post.
  r = await call({ body: { action: 'unsubscribe', email: 'pat@example.com', token: t }, key: '', form: true });
  assert.equal(r.status, 200);
  assert.ok(r.text.includes('You are unsubscribed'));
  assert.equal(fake.docs('newsletter_subs')[0].status, 'unsubscribed');
  // The public form cannot put them back (anyone can replay it); a JSON unsubscribe still answers ok.
  r = await call({ body: { action: 'subscribe', email: 'pat@example.com' }, key: '' });
  assert.deepEqual(r.body, { ok: true });
  assert.equal(fake.docs('newsletter_subs')[0].status, 'unsubscribed');
  r = await call({ body: { action: 'unsubscribe', email: 'pat@example.com', token: t }, key: '' });
  assert.deepEqual(r.body, { ok: true });
  assert.equal(fake.docs('newsletter_subs')[0].status, 'unsubscribed');
  // The admin brings a family back on purpose: remove the row, then add the address again.
  await call({ body: { action: 'remove', email: 'pat@example.com' } });
  await call({ body: { action: 'add', emails: 'pat@example.com' } });
  assert.equal(fake.docs('newsletter_subs')[0].status, 'active');
  assert.ok(unsubscribePageHtml({ email: 'a@b.co', token: 'x', state: 'ask' }).includes('method="post"'));
});

await test('admin: pasted text becomes subscribers, the list reads back, remove works, an unsubscribed family stays out', async () => {
  fake.reset();
  await call({ body: { action: 'subscribe', email: 'gone@example.com' }, key: '' });
  await call({ body: { action: 'unsubscribe', email: 'gone@example.com', token: tokenFor('gone@example.com') }, key: '' });
  let r = await call({ body: { action: 'add', emails: 'Coach Matt <matt@lmsd.org>, "Eric" eric@lmsd.org; gone@example.com\nmatt@LMSD.org junk' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.found, 3);
  assert.equal(r.body.added, 2);
  assert.equal(r.body.unsubscribed, 1);
  r = await call({ body: { action: 'add', emails: 'eric@lmsd.org' } });
  assert.equal(r.body.existing, 1);
  r = await call({ body: { action: 'add', emails: 'nothing here' } });
  assert.equal(r.status, 400);
  r = await call({ method: 'GET', query: '?admin=1' });
  assert.equal(r.status, 200);
  const emails = r.body.subscribers.map((s) => s.email).sort();
  assert.deepEqual(emails, ['eric@lmsd.org', 'gone@example.com', 'matt@lmsd.org']);
  assert.equal(r.body.subscribers.find((s) => s.email === 'matt@lmsd.org').source, 'admin');
  assert.equal(r.body.subscribers.find((s) => s.email === 'gone@example.com').status, 'unsubscribed');
  assert.deepEqual(r.body.sends, []);
  r = await call({ body: { action: 'remove', email: 'ERIC@lmsd.org' } });
  assert.deepEqual(r.body.subscribers.map((s) => s.email).sort(), ['gone@example.com', 'matt@lmsd.org']);
});

await test('preview: the fundraiser bar comes from the live pledges and the store from the catalog', async () => {
  fake.reset();
  fake.seed(`shootathon/${SHOOTATHON.eventId}`, { title: 'Aces Shoot-a-Thon', open: true, org_goal_cents: 3000000, teams: [], players: [{ slug: 'jimmy-d', name: 'Jimmy D', team: '', goal_cents: 100000, makes: 40 }] });
  fake.seed('pledges/p1', { event_id: SHOOTATHON.eventId, site: SITE_TAG, kind: 'flat', target_type: 'org', status: 'paid', amount_cents: 10000, amount_paid_cents: 10000, fee_cents: 0, donor_name: 'Sam D', created: '2026-11-01T00:00:00Z' });
  fake.seed('pledges/p2', { event_id: SHOOTATHON.eventId, site: SITE_TAG, kind: 'flat', target_type: 'org', status: 'canceled', amount_cents: 99900, donor_name: 'No', created: '2026-11-01T00:00:00Z' });
  let r = await call({ body: { action: 'preview', from: '2026-12-01', to: '2026-12-07', intro: 'Hi all', games, playerOfGame: { name: 'Jimmy D', line: 'Big night' }, sections: { store: true } } });
  assert.equal(r.status, 200);
  assert.equal(r.body.subject, 'Aces Newsletter, Dec 1 to Dec 7, 2026: 1 and 1 on the week');
  const h = r.body.html;
  assert.ok(h.includes('Shoot-a-Thon') && h.includes('$100') && h.includes('of $30,000 raised') && h.includes('40 free throws made') && h.includes(`${ORIGIN}/donate.html`));
  assert.ok(h.includes('From the team store') && h.includes('Aces Hoodie') && h.includes('$45') && h.includes(`${ORIGIN}/store`));
  assert.ok(!h.includes(UNSUB_TAG) && h.includes('/api/newsletter?u=family%40example.com&amp;t='));
  assert.ok(h.includes('Jimmy D') && h.includes('Results') && h.includes('Coming up'));
  // Event closed: the fundraiser section goes away on its own.
  fake.seed(`shootathon/${SHOOTATHON.eventId}`, { open: false, org_goal_cents: 3000000, players: [] });
  r = await call({ body: { action: 'preview', intro: 'Hi all', games } });
  assert.ok(!r.body.html.includes('Shoot-a-Thon'));
  assert.ok(!r.body.html.includes('From the team store'));
});

await test('send: one email per active subscriber with its own unsubscribe link, a send record, and the unsubscribed skipped', async () => {
  fake.reset();
  await call({ body: { action: 'add', emails: 'a@x.com b@x.com c@x.com' } });
  await call({ body: { action: 'unsubscribe', email: 'c@x.com', token: tokenFor('c@x.com') }, key: '' });
  // Nothing to say: refused before anything goes out.
  let r = await call({ body: { action: 'send', games: [], intro: '' } });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'no_content');
  assert.equal(fake.mails().length, 0);
  r = await call({ body: { action: 'send', from: '2026-12-01', to: '2026-12-07', intro: 'Hi all', games } });
  assert.equal(r.status, 200);
  assert.equal(r.body.sent, 2);
  assert.equal(r.body.failed, 0);
  assert.equal(r.body.total, 2);
  const mails = fake.mails();
  assert.deepEqual(mails.map((m) => m.to[0]).sort(), ['a@x.com', 'b@x.com']);
  for (const m of mails) {
    assert.equal(m.subject, 'Aces Newsletter, Dec 1 to Dec 7, 2026: 1 and 1 on the week');
    assert.ok(!m.html.includes(UNSUB_TAG));
    assert.ok(m.html.includes(`/api/newsletter?u=${encodeURIComponent(m.to[0])}&amp;t=${tokenFor(m.to[0])}`));
    assert.ok(m.text.includes('Aces Newsletter') && !m.text.includes('<'));
  }
  const sends = fake.docs('newsletter_sends').filter((d) => !d.lock);
  assert.equal(sends.length, 1);
  // The send lock is released when the run finishes.
  const lock = fake.docs('newsletter_sends').find((d) => d.lock);
  assert.ok(lock && lock.at === '');
  assert.equal(sends[0].site, SITE_TAG);
  assert.equal(sends[0].sent, 2);
  assert.equal(sends[0].by, 'admin');
  assert.ok(sends[0].at && sends[0].subject.startsWith('Aces Newsletter'));
  assert.equal(r.body.sends[0].sent, 2);
  // A failed SendGrid call is counted, not hidden.
  fake.state.opts.fail.sendgrid = 500;
  r = await call({ body: { action: 'send', intro: 'Again', games } });
  fake.state.opts.fail.sendgrid = 0;
  assert.equal(r.body.sent, 0);
  assert.equal(r.body.failed, 2);
});

await test('a test send goes to one address only, marked [TEST], and leaves no send record', async () => {
  fake.reset();
  await call({ body: { action: 'add', emails: 'a@x.com b@x.com' } });
  const r = await call({ body: { action: 'send', intro: 'Draft', games, testTo: 'Adam@Example.com' } });
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.test, r.body.sent], [true, 1]);
  const mails = fake.mails();
  assert.equal(mails.length, 1);
  assert.deepEqual(mails[0].to, ['adam@example.com']);
  assert.ok(mails[0].subject.startsWith('[TEST] Aces Newsletter'));
  assert.ok(mails[0].html.includes(`/api/newsletter?u=adam%40example.com&amp;t=${tokenFor('adam@example.com')}`));
  assert.equal(fake.docs('newsletter_sends').length, 0);
  const bad = await call({ body: { action: 'send', intro: 'Draft', games, testTo: 'nope' } });
  assert.equal(bad.status, 400);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
