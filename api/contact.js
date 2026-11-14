// Vercel Serverless Function: /api/contact
// The "Get in touch" form on the Support page. Emails the message to the Aces
// inbox with Reply-To set to the sender, so hitting Reply answers them.
//
//   POST { name, email, phone?, topic, message, hp }   hp is a honeypot and must be empty.
//   Alumni sign up (Next Level and Alumni pages) adds: topic 'Alumni update', classYear, played, alumniList.
//   -> { ok } | 400 { error: bad_name | bad_email | bad_message } | 429 slow_down | 502 send_failed
import { sendMail, emailConfigured } from './_email.js';

export const CONTACT_TO = 'aceshoops@gmail.com';
export const TOPICS = ['Donating', 'Volunteering', 'Sponsorship', 'General question', 'Alumni update'];

const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const oneLine = (s, n) => String(s || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

// A light per-IP limit in warm-instance memory: 5 messages per 10 minutes.
const hits = new Map();
function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'local').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 600000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}

export function cleanContact(body) {
  const name = oneLine(body.name, 80);
  const email = oneLine(body.email, 160).toLowerCase();
  const phone = oneLine(body.phone, 30);
  const topic = TOPICS.includes(body.topic) ? body.topic : 'General question';
  const message = String(body.message || '').replace(/\r\n?/g, '\n').trim().slice(0, 4000);
  const c = { name, email, phone, topic, message };
  if (topic === 'Alumni update') {
    const y = oneLine(body.classYear, 4);
    c.classYear = /^(19|20)\d\d$/.test(y) ? y : '';
    c.played = oneLine(body.played, 200);
    c.alumniList = body.alumniList === true;
  }
  return c;
}

export function contactEmail(c) {
  const alum = c.topic === 'Alumni update';
  const subject = alum ? `Alumni update: ${c.name}${c.classYear ? ` '${c.classYear.slice(2)}` : ''}` : `Website message: ${c.topic} from ${c.name}`;
  const row = (k, v) => v ? `<tr><td style="padding:6px 14px 6px 0;color:#888;font-size:13px;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:15px;color:#222">${v}</td></tr>` : '';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px">
<div style="background:#840036;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;font-size:18px;font-weight:bold">New message from aceshoops.com</div>
<div style="border:1px solid #e5e0d8;border-top:0;padding:18px 20px;border-radius:0 0 8px 8px">
<table style="border-collapse:collapse">${row('Name', esc(c.name))}${row('Email', esc(c.email))}${row('Phone', esc(c.phone))}${row('About', esc(c.topic))}${alum ? row('Class of', esc(c.classYear)) + row('Played after LM', esc(c.played)) + row('Alumni list', c.alumniList ? 'Yes, add me' : 'No') : ''}</table>
<div style="margin-top:14px;padding:14px 16px;background:#f7f4ef;border-radius:6px;font-size:15px;line-height:1.6;color:#222;white-space:pre-wrap">${esc(c.message)}</div>
<p style="color:#888;font-size:12px;margin:16px 0 0">Hit Reply to answer ${esc(c.name)} directly.</p>
</div></div>`;
  const text = `New message from aceshoops.com\n\nName: ${c.name}\nEmail: ${c.email}\n${c.phone ? `Phone: ${c.phone}\n` : ''}About: ${c.topic}\n${alum ? `Class of: ${c.classYear}\nPlayed after LM: ${c.played}\nAlumni list: ${c.alumniList ? 'Yes, add me' : 'No'}\n` : ''}\n${c.message}\n`;
  return { subject, html, text };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  if (String(body.hp || '').trim()) return json(res, 200, { ok: true }); // a bot filled the hidden field
  const c = cleanContact(body);
  if (c.name.length < 2) return json(res, 400, { error: 'bad_name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return json(res, 400, { error: 'bad_email' });
  if (c.message.length < 5) return json(res, 400, { error: 'bad_message' });
  if (rateLimited(req)) return json(res, 429, { error: 'slow_down' });
  if (!emailConfigured()) return json(res, 503, { error: 'not_configured' });
  const m = contactEmail(c);
  const ok = await sendMail({ to: CONTACT_TO, subject: m.subject, html: m.html, text: m.text, replyTo: c.email, replyName: c.name });
  return ok ? json(res, 200, { ok: true }) : json(res, 502, { error: 'send_failed' });
}
