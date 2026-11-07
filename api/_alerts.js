// Schedule change alerts: pure helpers (no I/O), shared by api/alerts.js and the tests.
//
// Players, parents and coaches sign up on /alerts.html for one or more teams. The
// "Aces Team Calendar" Apps Script (Adam's Google account) watches the three team
// calendars and, when an event is added, moved or canceled, POSTs one finished update
// per team to /api/alerts. The site sends it to every signed up person on that team,
// one message each, so every copy carries its own unsubscribe link.

export const TEAMS = ['Varsity', 'JV', '9th Grade'];
export const ROLES = ['Player', 'Parent', 'Coach'];
export const UNSUB_TAG = '%%UNSUB%%';
export const LIMITS = { name: 60, player: 60, subject: 200, html: 200000, text: 20000, skip: 40 };

const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '');
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

export function normEmail(e) { return String(e == null ? '' : e).trim().toLowerCase().slice(0, 120); }
export function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '')) && String(e).length <= 120; }
export function cleanName(n, max = LIMITS.name) { return clip(stripTags(n), max).replace(/\s+/g, ' '); }
export function cleanTeams(list) {
  const want = new Set((Array.isArray(list) ? list : [list]).map((t) => String(t || '').trim().toLowerCase()));
  return TEAMS.filter((t) => want.has(t.toLowerCase()));
}
export function cleanRole(r) {
  const x = String(r || '').trim().toLowerCase();
  return ROLES.find((v) => v.toLowerCase() === x) || '';
}

/** A sign up from the public form, tidied. Returns { error } when it can't be saved. */
export function cleanSignup(b) {
  const email = normEmail(b && b.email);
  if (!validEmail(email)) return { error: 'bad_email' };
  const teams = cleanTeams(b && b.teams);
  if (!teams.length) return { error: 'pick_team' };
  const role = cleanRole(b && b.role);
  if (!role) return { error: 'pick_role' };
  const name = cleanName(b && b.name);
  if (!name) return { error: 'missing_name' };
  const player = role === 'Parent' ? cleanName(b && b.player, LIMITS.player) : '';
  return { email, teams, role, name, player };
}

/** Teams after a new sign up: what they already had plus what they just picked. */
export function mergeTeams(had, add) { return cleanTeams([...(Array.isArray(had) ? had : []), ...(add || [])]); }

/** Every address in a pasted blob, once each, in the order first seen. */
export function extractEmails(text) {
  const out = [], seen = new Set();
  for (const m of String(text || '').matchAll(/[^\s<>,;:"'()\[\]]+@[^\s<>,;:"'()\[\]]+\.[a-z]{2,}/gi)) {
    const e = normEmail(m[0]);
    if (validEmail(e) && !seen.has(e)) { seen.add(e); out.push(e); }
  }
  return out;
}

/** The update the Apps Script posts, tidied. */
export function cleanNotice(b) {
  const team = cleanTeams([b && b.team])[0] || '';
  if (!team) return { error: 'bad_team' };
  const subject = clip(stripTags(b && b.subject), LIMITS.subject);
  const html = String((b && b.html) || '').slice(0, LIMITS.html);
  const text = String((b && b.text) || '').slice(0, LIMITS.text);
  if (!subject || (!html && !text)) return { error: 'empty' };
  const skip = (Array.isArray(b && b.skip) ? b.skip : []).map(normEmail).filter(validEmail).slice(0, LIMITS.skip);
  return { team, subject, html, text, skip };
}

/** Who gets one team's update: active, signed up for that team, not already emailed by the script. */
export function recipientsFor(subs, team, skip = []) {
  const no = new Set(skip.map(normEmail));
  const seen = new Set();
  return (subs || []).filter((s) => {
    const e = normEmail(s && s.email);
    if (!validEmail(e) || s.status !== 'active' || !Array.isArray(s.teams) || !s.teams.includes(team) || no.has(e) || seen.has(e)) return false;
    seen.add(e);
    return true;
  });
}

const MAROON = '#840036', GOLD = '#c9a44a', FONT = 'Helvetica,Arial,sans-serif';

/** The footer added under every alert: why you got it, and a one tap way out. */
export function footerHtml(team) {
  return `<div style="font-family:${FONT};max-width:560px;margin:8px auto 0;padding:14px 4px;border-top:1px solid #eee;font-size:12px;line-height:1.6;color:#777">` +
    `You get this because you signed up for Lower Merion Aces ${esc(team)} schedule alerts. ` +
    `<a href="${UNSUB_TAG}" style="color:${MAROON}">Stop these emails</a></div>`;
}
export function footerText(team) { return `\n\nYou get this because you signed up for Lower Merion Aces ${team} schedule alerts.\nStop these emails: ${UNSUB_TAG}`; }

export function welcomeEmail({ name, teams, origin }) {
  const list = teams.join(', ').replace(/, ([^,]*)$/, ' and $1');
  const first = String(name || '').split(' ')[0];
  const subject = `You're signed up: Aces ${list} schedule alerts`;
  const html = `<div style="font-family:${FONT};max-width:560px;margin:0 auto;color:#111">` +
    `<div style="background:${MAROON};color:#fff;padding:18px 20px;border-bottom:4px solid ${GOLD}">` +
      `<div style="font-size:12px;letter-spacing:2px;opacity:.85">LOWER MERION ACES</div>` +
      `<div style="font-size:22px;font-weight:bold;margin-top:4px">Schedule alerts are on</div></div>` +
    `<div style="padding:18px 6px;font-size:15px;line-height:1.6">` +
      `<p style="margin:0 0 12px">${first ? 'Hi ' + esc(first) + ', y' : 'Y'}ou're on the list for <b>${esc(list)}</b>.</p>` +
      `<p style="margin:0 0 12px">Anytime a practice or game is added, moved or canceled, you'll get an email like this one with exactly what changed.</p>` +
      `<p style="margin:0">Want another team too? Sign up again at <a href="${esc(origin)}/alerts" style="color:${MAROON}">${esc(origin.replace(/^https?:\/\//, ''))}/alerts</a> with the same email.</p>` +
    `</div></div>`;
  return { subject, html };
}

export function unsubscribePageHtml({ email, token, state }) {
  const h1 = (t) => `<h1 style="font-family:${FONT};font-size:24px;color:${MAROON};margin:0 0 10px">${t}</h1>`;
  const p = (t) => `<p style="font-family:${FONT};font-size:15px;line-height:1.6;color:#222;margin:0 0 18px">${t}</p>`;
  const inner = state === 'done'
    ? h1('You are unsubscribed') + p(`${esc(email)} will not get Aces schedule alerts any more. You can sign up again any time at the alerts page.`)
    : state === 'bad'
      ? h1('That link did not work') + p('Use the link at the bottom of the newest schedule alert, or reply to that email and we will take you off the list.')
      : h1('Stop schedule alerts?') + p(`${esc(email)} gets an email when an Aces practice or game changes. Press the button and they stop.`) +
        `<form method="post" action="/api/alerts"><input type="hidden" name="action" value="unsubscribe"><input type="hidden" name="email" value="${esc(email)}"><input type="hidden" name="token" value="${esc(token)}"><button type="submit" style="font-family:${FONT};font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#fff;background:${MAROON};border:0;border-radius:999px;padding:12px 24px;cursor:pointer">Stop these emails</button></form>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Aces Schedule Alerts</title></head>` +
    `<body style="margin:0;background:#f4f1ee"><div style="max-width:520px;margin:40px auto;padding:0 16px"><div style="background:#fff;border-radius:16px;padding:28px">` +
    `<div style="font-family:${FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${GOLD};font-weight:bold;margin-bottom:14px">Lower Merion Aces Basketball</div>${inner}</div></div></body></html>`;
}
