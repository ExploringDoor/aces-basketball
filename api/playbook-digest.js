// Vercel Cron: /api/playbook-digest   (Sunday night, see vercel.json)
// Emails the coach the week in the playbook: who studied, what's due, questions waiting.
// Auth: Vercel cron sends `Authorization: Bearer <CRON_SECRET>`; an admin may also hit it with
// x-admin-key (the Settings tab's "Send me this week's email now" uses the playbook action instead).
import { sendDigest } from './playbook.js';

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function authed(req) {
  const cron = process.env.CRON_SECRET || '';
  if (cron && ctEq(req.headers['authorization'] || '', `Bearer ${cron}`)) return true;
  const admin = process.env.ADMIN_PASSWORD || '';
  return !!admin && ctEq(req.headers['x-admin-key'] || '', admin);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!authed(req)) return res.status(401).json({ error: 'unauthorized' });
  try {
    const r = await sendDigest();
    return res.status(r.ok ? 200 : 502).json(r);
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
}
