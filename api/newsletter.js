// Vercel Serverless Function: /api/newsletter
// Aces Weekly, the family newsletter. Families sign up on /#news, the admin
// writes and sends it from the hidden /#newsletter page.
//
// Storage: Firestore through the server login (api/_firestore.js).
//   newsletter_subs/<sha256(email) first 40>   { site, email, name, status, source, created_at, ... }
//   newsletter_sends/<id>                       { site, subject, sent, failed, at, by }
// Email: api/_email.js sendMail, one message per family so each carries its
// own unsubscribe link.
//
// Public
//   POST { action: "subscribe", email, name, hp }   hp is a honeypot and must be empty.
//                                                    Answers { ok } for any valid email,
//                                                    never says whether it was already there.
//   GET  ?u=<email>&t=<token>                       the unsubscribe page with a button; a GET
//                                                    never unsubscribes (mail scanners open links)
//   POST { action: "unsubscribe", email, token }    JSON or the page's form post
// Admin (header x-admin-key = ADMIN_PASSWORD)
//   GET  ?admin=1                                   { subscribers, sends }
//   POST { action: "preview", ...content }          { subject, html }
//   POST { action: "add", emails }                  every address found in pasted text
//   POST { action: "remove", email }
//   POST { action: "send", ...content, testTo? }    testTo: one [TEST] email; else every active subscriber
//
// Content (preview and send): { from, to, intro, games[], playerOfGame, sections }.
// The page sends the week's games with any live scores; the server never
// imports the schedule (it lives in src/shared/index.jsx, which is JSX).
//
// Token = HMAC-SHA256(email) with NEWSLETTER_SECRET (or SENDGRID_API_KEY when
// that is not set), base64url, 22 characters.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { fbAdminConfigured, fsGet, fsPatch, fsList, fsCreate } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { sendMail, emailConfigured } from './_email.js';
import { PRODUCTS } from './_store.js';
import { fundraiserSnapshot } from './pledge.js';
import { UNSUB_TAG, LIMITS, normEmail, validEmail, cleanName, extractEmails, cleanContent, hasContent, weekLabelFor, buildNewsletterHtml, subjectFor, unsubscribePageHtml } from './_newsletter.js';

const SUBS = 'newsletter_subs';
const SENDS = 'newsletter_sends';
const SEND_CAP = 500;
const CONCURRENCY = 4;
const RATE = { perMinute: 10 };

function ctEq(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  if (!x.length || x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}
const isAdmin = (req) => !!process.env.ADMIN_PASSWORD && ctEq(req.headers['x-admin-key'], process.env.ADMIN_PASSWORD);
const secret = () => process.env.NEWSLETTER_SECRET || process.env.SENDGRID_API_KEY || '';
export function tokenFor(email) { return createHmac('sha256', secret()).update(normEmail(email)).digest('base64url').slice(0, 22); }
const tokenOk = (email, t) => !!secret() && ctEq(tokenFor(email), String(t || '').slice(0, 22));
const subId = (email) => createHash('sha256').update(normEmail(email)).digest('hex').slice(0, 40);
const subPath = (email) => `${SUBS}/${subId(email)}`;

function origin(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'aces-basketball.vercel.app';
  return `${proto}://${host}`;
}
const unsubUrl = (base, email) => `${base}/api/newsletter?u=${encodeURIComponent(normEmail(email))}&t=${tokenFor(email)}`;
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const html = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(body); };

// A light per-IP limit on sign-ups, in warm-instance memory: enough to stop a
// loop from filling the list, not a security boundary.
const hits = new Map();
function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'local').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE.perMinute;
}

async function listSubs() {
  let docs = [];
  try { docs = await fsList(SUBS); } catch (e) { docs = []; }
  return docs.filter((d) => d.site === SITE_TAG && d.status !== 'removed' && validEmail(d.email))
    .map((d) => ({ email: d.email, name: d.name || '', status: d.status || 'active', source: d.source || '', created_at: d.created_at || '' }))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}
async function listSends() {
  let docs = [];
  try { docs = await fsList(SENDS); } catch (e) { docs = []; }
  return docs.filter((d) => d.site === SITE_TAG)
    .map((d) => ({ id: d.id, subject: d.subject || '', sent: d.sent || 0, failed: d.failed || 0, at: d.at || '', by: d.by || '' }))
    .sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 10);
}
/** Create or revive a subscriber. An unsubscribed family that signs up again
 *  on the site is active again; an admin paste leaves their choice alone. */
async function upsertSub(email, name, source) {
  const now = new Date().toISOString();
  const cur = await fsGet(subPath(email));
  if (cur && cur.site === SITE_TAG && cur.status === 'unsubscribed' && source === 'admin') return 'unsubscribed';
  if (cur && cur.site === SITE_TAG && cur.status === 'active') {
    if (name && !cur.name) await fsPatch(subPath(email), { name });
    return 'existing';
  }
  const fields = { site: SITE_TAG, email: normEmail(email), name: name || (cur && cur.name) || '', status: 'active', source, updated_at: now };
  if (!cur) fields.created_at = now;
  const r = await fsPatch(subPath(email), fields);
  if (r && r.error) throw new Error('save_failed');
  return 'added';
}
async function unsubscribe(email) {
  const cur = await fsGet(subPath(email));
  if (!cur) return true;
  const r = await fsPatch(subPath(email), { status: 'unsubscribed', unsubscribed_at: new Date().toISOString() });
  return !(r && r.error);
}

/** Everything the builder needs for one issue: the tidied content, plus the
 *  live fundraiser numbers and the store catalog when those sections are on. */
async function compose(req, body) {
  const base = origin(req);
  const c = cleanContent(body);
  let fundraiser = null;
  if (c.wantFundraiser) {
    try {
      const f = await fundraiserSnapshot();
      if (f) fundraiser = { raisedCents: f.raised_cents, goalCents: f.goal_cents, makes: f.makes, url: `${base}/donate.html` };
    } catch (e) { fundraiser = null; }
  }
  const store = c.wantStore
    ? { items: Object.entries(PRODUCTS).map(([id, p]) => ({ name: p.name, priceCents: p.cents, imageUrl: `${base}/Bulldog.png`, url: `${base}/#store` })) }
    : null;
  const o = { origin: base, weekLabel: weekLabelFor(c.from, c.to), intro: c.intro, results: c.results, upcoming: c.upcoming, playerOfGame: c.playerOfGame, fundraiser, store };
  return { content: c, subject: subjectFor(o), html: buildNewsletterHtml(o), base };
}

async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; await fn(items[k]); } });
  await Promise.all(workers);
}

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'http://x');
  const q = url.searchParams;

  if (req.method === 'GET') {
    if (q.get('admin')) {
      if (!isAdmin(req)) return json(res, 401, { error: 'unauthorized' });
      if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
      const [subscribers, sends] = await Promise.all([listSubs(), listSends()]);
      return json(res, 200, { subscribers, sends, emailReady: emailConfigured() });
    }
    const email = normEmail(q.get('u'));
    if (!email) return json(res, 400, { error: 'bad_request' });
    const t = String(q.get('t') || '');
    if (!validEmail(email) || !tokenOk(email, t)) return html(res, 200, unsubscribePageHtml({ email, token: '', state: 'bad' }));
    return html(res, 200, unsubscribePageHtml({ email, token: t, state: 'ask' }));
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  if (typeof body === 'string') {
    const ct = String(req.headers['content-type'] || '');
    if (ct.includes('x-www-form-urlencoded')) body = Object.fromEntries(new URLSearchParams(body));
    else { try { body = JSON.parse(body); } catch { body = null; } }
  }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  const action = String(body.action || '');
  const fromForm = String(req.headers['content-type'] || '').includes('x-www-form-urlencoded');

  if (action === 'subscribe') {
    if (String(body.hp || '').trim()) return json(res, 200, { ok: true }); // a bot filled the hidden field
    if (rateLimited(req)) return json(res, 429, { error: 'slow_down' });
    const email = normEmail(body.email);
    if (!validEmail(email)) return json(res, 400, { error: 'bad_email' });
    if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
    try { await upsertSub(email, cleanName(body.name), 'site'); } catch (e) { return json(res, 500, { error: 'save_failed' }); }
    return json(res, 200, { ok: true });
  }

  if (action === 'unsubscribe') {
    const email = normEmail(body.email);
    const ok = validEmail(email) && tokenOk(email, body.token);
    if (!ok) return fromForm ? html(res, 200, unsubscribePageHtml({ email, token: '', state: 'bad' })) : json(res, 400, { error: 'bad_token' });
    if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
    const done = await unsubscribe(email);
    if (!done) return json(res, 500, { error: 'save_failed' });
    return fromForm ? html(res, 200, unsubscribePageHtml({ email, token: '', state: 'done' })) : json(res, 200, { ok: true });
  }

  if (!isAdmin(req)) return json(res, 401, { error: 'unauthorized' });
  if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });

  if (action === 'check') return json(res, 200, { ok: true });

  if (action === 'preview') {
    const { subject, html: h, base } = await compose(req, body);
    return json(res, 200, { subject, html: h.split(UNSUB_TAG).join(escAttr(unsubUrl(base, 'family@example.com'))) });
  }

  if (action === 'add') {
    const emails = extractEmails(body.emails);
    if (!emails.length) return json(res, 400, { error: 'no_emails' });
    const counts = { added: 0, existing: 0, unsubscribed: 0, failed: 0 };
    for (const e of emails) {
      try { counts[await upsertSub(e, '', 'admin')]++; } catch (x) { counts.failed++; }
    }
    return json(res, 200, { ok: true, found: emails.length, ...counts, subscribers: await listSubs() });
  }

  if (action === 'remove') {
    const email = normEmail(body.email);
    if (!validEmail(email)) return json(res, 400, { error: 'bad_email' });
    const cur = await fsGet(subPath(email));
    if (cur) { const r = await fsPatch(subPath(email), { status: 'removed', removed_at: new Date().toISOString() }); if (r && r.error) return json(res, 500, { error: 'save_failed' }); }
    return json(res, 200, { ok: true, subscribers: await listSubs() });
  }

  if (action === 'send') {
    const { content, subject, html: h, base } = await compose(req, body);
    if (!hasContent(content)) return json(res, 400, { error: 'no_content' });
    if (!emailConfigured()) return json(res, 503, { error: 'email_not_configured' });
    const personal = (email) => h.split(UNSUB_TAG).join(escAttr(unsubUrl(base, email)));
    const testTo = normEmail(body.testTo);
    if (testTo) {
      if (!validEmail(testTo)) return json(res, 400, { error: 'bad_email' });
      const ok = await sendMail({ to: testTo, subject: `[TEST] ${subject}`, html: personal(testTo) });
      return json(res, ok ? 200 : 502, ok ? { ok: true, test: true, sent: 1, failed: 0, subject } : { error: 'send_failed' });
    }
    const subs = (await listSubs()).filter((s) => s.status === 'active').slice(0, SEND_CAP);
    if (!subs.length) return json(res, 400, { error: 'no_subscribers' });
    let sent = 0, failed = 0;
    await pool(subs, CONCURRENCY, async (s) => { if (await sendMail({ to: s.email, subject, html: personal(s.email) })) sent++; else failed++; });
    const at = new Date().toISOString();
    const id = `${SITE_TAG}_${Date.now()}`;
    await fsCreate(SENDS, { site: SITE_TAG, subject: String(subject).slice(0, 200), sent, failed, total: subs.length, at, by: 'admin', week: `${content.from || ''}..${content.to || ''}` }, id);
    return json(res, 200, { ok: true, sent, failed, total: subs.length, subject, sends: await listSends() });
  }

  return json(res, 400, { error: 'unknown_action' });
}
