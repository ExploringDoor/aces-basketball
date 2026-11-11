// Vercel Cron: /api/playbook-feedwatch, every 15 minutes (vercel.json).
// Re-reads the playbook's calendar feeds, compares them with the last copy, and on a change
// posts a card to every player's home screen and (if the coach turned it on in Settings)
// emails the alert subscribers for that group through /api/alerts.
// Auth: Vercel cron sends `Authorization: Bearer <CRON_SECRET>`; an admin may hit it with x-admin-key.
import { runFeedWatch } from './playbook.js';

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
    const r = await runFeedWatch();
    return res.status(200).json(r);
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
}
