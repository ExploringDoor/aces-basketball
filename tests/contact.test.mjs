// /api/contact: the Support page form. In-memory SendGrid fake, zero network.
import './_env.js';
import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import handler, { CONTACT_TO } from '../api/contact.js';

fake.install();
let pass = 0, fail = 0;
async function test(name, fn) {
  fake.reset();
  try { await fn(); fake.assertClean(); pass++; console.log('  ✓', name); }
  catch (e) { fail++; console.log('  ✗', name, '\n       ', String(e && e.message || e)); }
}
async function call(body, ip = '198.51.100.' + Math.floor(Math.random() * 250)) {
  const out = { status: 0, body: null };
  const res = { set statusCode(c) { out.status = c; }, get statusCode() { return out.status; }, setHeader() {}, end(b) { try { out.body = JSON.parse(String(b)); } catch { out.body = null; } } };
  await handler({ method: 'POST', url: '/api/contact', headers: { 'x-forwarded-for': ip }, body }, res);
  return out;
}
const good = { name: 'Pat Parent', email: 'Pat@Example.com', phone: '610-555-0100', topic: 'Volunteering', message: 'I can help run the clock <b>Fridays</b>.' };

await test('a good message emails the Aces inbox, Reply-To is the sender, HTML is escaped', async () => {
  const r = await call(good);
  assert.equal(r.status, 200); assert.equal(r.body.ok, true);
  const m = fake.mails(); assert.equal(m.length, 1);
  assert.deepEqual(m[0].to, [CONTACT_TO]);
  assert.equal(m[0].reply_to.email, 'pat@example.com');
  assert.match(m[0].subject, /Volunteering from Pat Parent/);
  assert.ok(m[0].html.includes('&lt;b&gt;Fridays&lt;/b&gt;') && !m[0].html.includes('<b>Fridays'));
  assert.ok(m[0].text.includes('610-555-0100'));
});
await test('missing name, bad email or empty message is refused, nothing sent', async () => {
  assert.equal((await call({ ...good, name: '' })).body.error, 'bad_name');
  assert.equal((await call({ ...good, email: 'nope' })).body.error, 'bad_email');
  assert.equal((await call({ ...good, message: ' ' })).body.error, 'bad_message');
  assert.equal(fake.mails().length, 0);
});
await test('a bot that fills the honeypot gets ok but nothing is sent', async () => {
  const r = await call({ ...good, hp: 'http://spam' });
  assert.equal(r.status, 200); assert.equal(fake.mails().length, 0);
});
await test('an unknown topic falls back to General question; newlines in the name cannot inject headers', async () => {
  await call({ ...good, topic: 'Free money', name: 'Pat\r\nBcc: x@y.com' });
  const m = fake.mails()[0];
  assert.match(m.subject, /General question from Pat Bcc: x@y.com$/);
  assert.ok(!/[\r\n]/.test(m.subject));
});
await test('the 6th message in 10 minutes from one IP is slowed down', async () => {
  const ip = '192.0.2.77';
  for (let i = 0; i < 5; i++) assert.equal((await call(good, ip)).status, 200);
  assert.equal((await call(good, ip)).body.error, 'slow_down');
});
await test('an alumni update carries class year, college and the list choice', async () => {
  const r = await call({ ...good, topic: 'Alumni update', name: 'Sam Ace', classYear: '2013', played: 'West Chester (D-II)', alumniList: true, message: 'Teaching and coaching in Ardmore now.' });
  assert.equal(r.status, 200);
  const m = fake.mails()[0];
  assert.equal(m.subject, "Alumni update: Sam Ace '13");
  assert.ok(m.html.includes('Class of') && m.html.includes('2013') && m.html.includes('West Chester') && m.html.includes('Yes, add me'));
  assert.ok(m.text.includes('Alumni list: Yes, add me'));
});
await test('alumni fields are ignored on ordinary messages, and a bad class year is dropped', async () => {
  await call({ ...good, classYear: '2013', played: 'x', alumniList: true });
  assert.ok(!fake.mails()[0].html.includes('Class of'));
  fake.reset();
  await call({ ...good, topic: 'Alumni update', classYear: '13', alumniList: 'yes' });
  const m = fake.mails()[0];
  assert.equal(m.subject, 'Alumni update: Pat Parent');
  assert.ok(m.text.includes('Alumni list: No'));
});
await test('SendGrid down → 502 send_failed so the page can say so', async () => {
  fake.state.opts.fail.sendgrid = 500;
  const r = await call(good);
  fake.state.opts.fail.sendgrid = 0;
  assert.equal(r.status, 502); assert.equal(r.body.error, 'send_failed');
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
