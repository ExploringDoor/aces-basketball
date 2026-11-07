// Vercel Serverless Function: /api/alerts
// Schedule change alerts for the Aces team calendars (pure helpers in api/_alerts.js).
//
// Storage: Firestore through the server login (api/_firestore.js).
//   alert_subs/<sha256(email) first 40>  { site, email, name, role, player, teams[], status, source, created_at, ... }
//   alert_sends/<sha of the update>      { site, team, subject, sent, failed, total, at }
//
// Public
//   POST { action: "subscribe", name, email, role, player?, teams[], hp }   hp = honeypot, must be empty
//   GET  ?u=<email>&t=<token>                       unsubscribe page with a button (a GET never unsubscribes)
//   POST { action: "unsubscribe", email, token }    JSON or the page's form post
// Apps Script (header x-alerts-key, or body.key)
//   POST { action: "notify", team, subject, html, text, skip[] }   skip = addresses the script already emailed
// Admin (header x-admin-key = ADMIN_PASSWORD)
//   GET  ?admin=1                                   { subscribers, sends, emailReady }
//   POST { action: "add", emails, teams[], role }   every address found in pasted text
//   POST { action: "remove", email }
//   POST { action: "test", to, team }               one sample alert to one address
//   POST { action: "key" }                          the key the Apps Script sends
//
// Keys: ALERTS_KEY, or derived from NEWSLETTER_SECRET / SENDGRID_API_KEY. Unsubscribe token =
// HMAC("alerts:" + email), base64url, 22 characters (never the same as a newsletter token).
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { fbAdminConfigured, fsGet, fsPatch, fsList, fsCreate } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { sendMail, emailConfigured } from './_email.js';
import { TEAMS, UNSUB_TAG, normEmail, validEmail, cleanSignup, cleanTeams, cleanRole, mergeTeams, extractEmails, cleanNotice, recipientsFor, footerHtml, footerText, welcomeEmail, unsubscribePageHtml } from './_alerts.js';

const SUBS = 'alert_subs';
const SENDS = 'alert_sends';
const SEND_CAP = 600;
const CONCURRENCY = 8;

function ctEq(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  if (!x.length || x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}
const baseSecret = () => process.env.NEWSLETTER_SECRET || process.env.SENDGRID_API_KEY || '';
const alertsKey = () => process.env.ALERTS_KEY || (baseSecret() ? createHmac('sha256', baseSecret()).update('aces-schedule-alerts-v1').digest('base64url').slice(0, 32) : '');
const isAdmin = (req) => !!process.env.ADMIN_PASSWORD && ctEq(req.headers['x-admin-key'], process.env.ADMIN_PASSWORD);
const isScript = (req, body) => !!alertsKey() && ctEq(req.headers['x-alerts-key'] || (body && body.key), alertsKey());
export function tokenFor(email) { return createHmac('sha256', baseSecret()).update('alerts:' + normEmail(email)).digest('base64url').slice(0, 22); }
const tokenOk = (email, t) => !!baseSecret() && ctEq(tokenFor(email), String(t || '').slice(0, 22));
const subPath = (email) => `${SUBS}/${createHash('sha256').update(normEmail(email)).digest('hex').slice(0, 40)}`;

function origin(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'aces-basketball.vercel.app';
  return `${proto}://${host}`;
}
const unsubUrl = (base, email) => `${base}/api/alerts?u=${encodeURIComponent(normEmail(email))}&t=${tokenFor(email)}`;
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const page = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(body); };

// A light per-IP limit on sign ups, in warm-instance memory: stops a loop, not a security boundary.
const hits = new Map();
function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'local').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 8;
}

async function listSubs() {
  let docs = [];
  try { docs = await fsList(SUBS); } catch (e) { docs = []; }
  return docs.filter((d) => d.site === SITE_TAG && d.status !== 'removed' && validEmail(d.email))
    .map((d) => ({ email: d.email, name: d.name || '', role: d.role || '', player: d.player || '', teams: cleanTeams(d.teams || []), status: d.status || 'active', source: d.source || '', created_at: d.created_at || '' }))
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}
async function listSends() {
  let docs = [];
  try { docs = await fsList(SENDS); } catch (e) { docs = []; }
  return docs.filter((d) => d.site === SITE_TAG)
    .map((d) => ({ team: d.team || '', subject: d.subject || '', sent: d.sent || 0, failed: d.failed || 0, total: d.total || 0, at: d.at || '' }))
    .sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 15);
}

/** Save a sign up. Returns { state, teams, added[] } where added = teams that are new for them. */
async function saveSub(s, source) {
  const now = new Date().toISOString();
  const cur = await fsGet(subPath(s.email));
  const mine = cur && cur.site === SITE_TAG;
  const wasActive = mine && cur.status === 'active';
  const had = wasActive ? cleanTeams(cur.teams || []) : [];
  const teams = mergeTeams(had, s.teams);
  const added = teams.filter((t) => !had.includes(t));
  const fields = { site: SITE_TAG, email: s.email, teams, status: 'active', source: (mine && cur.source) || source, updated_at: now };
  if (s.name || !mine) fields.name = s.name || (mine && cur.name) || '';
  if (s.role || !mine) fields.role = s.role || (mine && cur.role) || '';
  if (s.player || !mine) fields.player = s.player || (mine && cur.player) || '';
  if (!mine) fields.created_at = now;
  const r = await fsPatch(subPath(s.email), fields);
  if (r && r.error) throw new Error('save_failed');
  return { state: !mine ? 'added' : wasActive ? (added.length ? 'more_teams' : 'existing') : 'back', teams, added };
}

async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; await fn(items[k]); } });
  await Promise.all(workers);
}

/** Send one team's update to everyone on that team, each with their own unsubscribe link. */
async function deliver(base, n, subs) {
  const html = n.html ? n.html + footerHtml(n.team) : '';
  const text = (n.text || '') + footerText(n.team);
  let sent = 0, failed = 0;
  await pool(subs, CONCURRENCY, async (s) => {
    const u = unsubUrl(base, s.email);
    const ok = await sendMail({ to: s.email, subject: n.subject, html: html ? html.split(UNSUB_TAG).join(escAttr(u)) : undefined, text: text.split(UNSUB_TAG).join(u) });
    if (ok) sent++; else failed++;
  });
  return { sent, failed };
}

export default async function handler(req, res) {
  const url = new URL(req.url || '/', 'http://x');
  const q = url.searchParams;

  if (req.method === 'GET') {
    if (q.get('admin')) {
      if (!isAdmin(req)) return json(res, 401, { error: 'unauthorized' });
      if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
      const [subscribers, sends] = await Promise.all([listSubs(), listSends()]);
      return json(res, 200, { subscribers, sends, emailReady: emailConfigured(), teams: TEAMS });
    }
    const email = normEmail(q.get('u'));
    if (!email) return json(res, 400, { error: 'bad_request' });
    const t = String(q.get('t') || '');
    if (!validEmail(email) || !tokenOk(email, t)) return page(res, 200, unsubscribePageHtml({ email, token: '', state: 'bad' }));
    return page(res, 200, unsubscribePageHtml({ email, token: t, state: 'ask' }));
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  const ct = String(req.headers['content-type'] || '');
  if (typeof body === 'string') {
    if (ct.includes('x-www-form-urlencoded')) body = Object.fromEntries(new URLSearchParams(body));
    else { try { body = JSON.parse(body); } catch { body = null; } }
  }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  const action = String(body.action || '');
  const fromForm = ct.includes('x-www-form-urlencoded');

  if (action === 'subscribe') {
    if (String(body.hp || '').trim()) return json(res, 200, { ok: true, teams: [] }); // a bot filled the hidden field
    if (rateLimited(req)) return json(res, 429, { error: 'slow_down' });
    const s = cleanSignup(body);
    if (s.error) return json(res, 400, { error: s.error });
    if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
    let r;
    try { r = await saveSub(s, 'site'); } catch (e) { return json(res, 500, { error: 'save_failed' }); }
    // A welcome email only when something actually changed, so replaying the form can't spam anyone.
    if (r.added.length && emailConfigured()) {
      const w = welcomeEmail({ name: s.name, teams: r.teams, origin: origin(req) });
      const base = origin(req);
      await sendMail({ to: s.email, subject: w.subject, html: w.html + footerHtml(r.teams.join(', ').replace(/, ([^,]*)$/, ' and $1')).split(UNSUB_TAG).join(escAttr(unsubUrl(base, s.email))) });
    }
    return json(res, 200, { ok: true, teams: r.teams });
  }

  if (action === 'unsubscribe') {
    const email = normEmail(body.email);
    const ok = validEmail(email) && tokenOk(email, body.token);
    if (!ok) return fromForm ? page(res, 200, unsubscribePageHtml({ email, token: '', state: 'bad' })) : json(res, 400, { error: 'bad_token' });
    if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
    const cur = await fsGet(subPath(email));
    if (cur) {
      const r = await fsPatch(subPath(email), { status: 'unsubscribed', unsubscribed_at: new Date().toISOString() });
      if (r && r.error) return json(res, 500, { error: 'save_failed' });
    }
    return fromForm ? page(res, 200, unsubscribePageHtml({ email, token: '', state: 'done' })) : json(res, 200, { ok: true });
  }

  if (action === 'notify') {
    if (!isScript(req, body)) return json(res, 401, { error: 'unauthorized' });
    if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
    if (!emailConfigured()) return json(res, 503, { error: 'email_not_configured' });
    const n = cleanNotice(body);
    if (n.error) return json(res, 400, { error: n.error });
    // The same update twice (a retry) is sent once.
    const id = `${SITE_TAG}_${createHash('sha256').update(n.team + '\n' + n.subject + '\n' + n.html + '\n' + n.text).digest('hex').slice(0, 32)}`;
    const prior = await fsGet(`${SENDS}/${id}`);
    if (prior && prior.site === SITE_TAG) return json(res, 200, { ok: true, duplicate: true, sent: prior.sent || 0 });
    const subs = recipientsFor(await listSubs(), n.team, n.skip).slice(0, SEND_CAP);
    await fsCreate(SENDS, { site: SITE_TAG, team: n.team, subject: n.subject, sent: 0, failed: 0, total: subs.length, at: new Date().toISOString() }, id);
    const { sent, failed } = subs.length ? await deliver(origin(req), n, subs) : { sent: 0, failed: 0 };
    await fsPatch(`${SENDS}/${id}`, { sent, failed });
    return json(res, 200, { ok: true, team: n.team, sent, failed, total: subs.length });
  }

  if (!isAdmin(req)) return json(res, 401, { error: 'unauthorized' });
  if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });

  if (action === 'key') return json(res, 200, { ok: true, key: alertsKey() });

  if (action === 'add') {
    const emails = extractEmails(body.emails);
    const teams = cleanTeams(body.teams);
    if (!emails.length) return json(res, 400, { error: 'no_emails' });
    if (!teams.length) return json(res, 400, { error: 'pick_team' });
    const role = cleanRole(body.role);
    const counts = { added: 0, more_teams: 0, existing: 0, back: 0, failed: 0 };
    for (const email of emails) {
      try { counts[(await saveSub({ email, teams, role, name: '', player: '' }, 'admin')).state]++; } catch (e) { counts.failed++; }
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

  if (action === 'test') {
    const to = normEmail(body.to);
    const team = cleanTeams([body.team])[0] || 'Varsity';
    if (!validEmail(to)) return json(res, 400, { error: 'bad_email' });
    if (!emailConfigured()) return json(res, 503, { error: 'email_not_configured' });
    const sample = {
      team, subject: `[TEST] Aces ${team}: Changed ${team} Practice`,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111"><div style="background:#840036;color:#fff;padding:18px 20px;border-bottom:4px solid #c9a44a"><div style="font-size:12px;letter-spacing:2px;opacity:.85">LOWER MERION ACES</div><div style="font-size:22px;font-weight:bold;margin-top:4px">${team} Schedule Update</div></div><p style="font-size:15px;line-height:1.6;padding:16px 6px;margin:0">This is a test. A real alert lists each practice or game that was added, moved or canceled.</p></div>`,
      text: 'This is a test. A real alert lists each practice or game that was added, moved or canceled.',
    };
    const r = await deliver(origin(req), sample, [{ email: to }]);
    return json(res, r.sent ? 200 : 502, r.sent ? { ok: true } : { error: 'send_failed' });
  }

  return json(res, 400, { error: 'unknown_action' });
}
