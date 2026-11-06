// Aces Weekly, the family newsletter: subscriber tidying and the email itself.
//
// Pure: no network, no env, no node imports. api/newsletter.js sends what this
// builds, and the hidden /#newsletter page imports the same limits and the
// same game tidying so the composer and the server never disagree.
//
// The email is table based with inline styles and absolute image URLs, the
// way email clients want it. It stays well under 100KB. Every section is
// left out when it has nothing to show. The unsubscribe link is a literal
// placeholder (UNSUB_TAG) that the server swaps for each recipient's own
// link right before sending.

export const UNSUB_TAG = '%%ACES_UNSUBSCRIBE_URL%%';

export const LIMITS = {
  name: 60,
  intro: 3000,
  playerName: 60,
  playerLine: 300,
  url: 500,
  opp: 40,
  venue: 80,
  date: 20,
  time: 16,
  games: 40,
  storeItems: 6,
  pasteEmails: 500,
};

export const SITE_HOST = 'aces-basketball.vercel.app';

export function clip(v, n) { return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n); }
export function normEmail(e) { return String(e == null ? '' : e).trim().toLowerCase().slice(0, 120); }
export function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '')); }
export function cleanName(n) { return clip(n, LIMITS.name).replace(/\s+/g, ' '); }

/** Every address in a pasted blob ("Jane Doe <jane@x.com>, bob@y.org; ..."),
 *  lower cased, once each, in the order first seen. */
export function extractEmails(text) {
  const out = [];
  const seen = new Set();
  const re = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  for (const m of String(text || '').matchAll(re)) {
    const e = normEmail(m[0]).replace(/[.]+$/, '');
    if (!validEmail(e) || seen.has(e)) continue;
    seen.add(e);
    out.push(e);
    if (out.length >= LIMITS.pasteEmails) break;
  }
  return out;
}

const isHttp = (u) => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || ''));
const isPath = (p) => /^\/[A-Za-z0-9._\-/]*$/.test(String(p || ''));
const score = (v) => { if (v == null || v === '') return null; const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 250 ? n : null; };

/** One schedule row from the page, trimmed to what the email needs.
 *  Returns null when there is no opponent or no date. `logo` is a site path
 *  like /logos/conestoga.png; the builder makes it absolute. */
export function cleanGame(g) {
  if (!g || typeof g !== 'object') return null;
  const opp = clip(g.opp, LIMITS.opp);
  const date = clip(g.date, LIMITS.date);
  const iso = typeof g.iso === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(g.iso) ? g.iso.slice(0, 40) : '';
  if (!opp || !(date || iso)) return null;
  const us = score(g.us), them = score(g.them);
  return {
    opp, date, iso,
    time: clip(g.time, LIMITS.time),
    venue: clip(g.venue, LIMITS.venue),
    home: !!g.home,
    neutral: !!g.neutral,
    conf: !!g.conf,
    logo: isPath(g.logo) ? String(g.logo).slice(0, 120) : '',
    us: us != null && them != null ? us : null,
    them: us != null && them != null ? them : null,
  };
}
export function cleanGames(list) {
  const out = [];
  for (const g of Array.isArray(list) ? list : []) { const c = cleanGame(g); if (c) out.push(c); if (out.length >= LIMITS.games) break; }
  return out;
}
export const isPlayed = (g) => g && g.us != null && g.them != null;

const NY = 'America/New_York';
export function fmtDay(iso, opts) {
  if (!iso) return '';
  try { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { timeZone: NY, ...(opts || { month: 'short', day: 'numeric' }) }); } catch (e) { return ''; }
}
export function weekLabelFor(from, to) {
  const a = /^\d{4}-\d{2}-\d{2}$/.test(String(from || '')) ? from : '';
  const b = /^\d{4}-\d{2}-\d{2}$/.test(String(to || '')) ? to : '';
  const day = (s, year) => fmtDay(s + 'T12:00:00-05:00', year ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });
  if (a && b) return a === b ? day(a, true) : `${day(a)} to ${day(b, true)}`;
  return day(a || b, true);
}

/** What the composer sends with a preview or a send, tidied. */
export function cleanContent(body) {
  const b = body && typeof body === 'object' ? body : {};
  const games = cleanGames(b.games);
  const sections = b.sections && typeof b.sections === 'object' ? b.sections : {};
  const on = (k, dflt) => (sections[k] == null ? dflt : !!sections[k]);
  const pog = b.playerOfGame && typeof b.playerOfGame === 'object' ? b.playerOfGame : {};
  const photo = String(pog.photoUrl || '').trim().slice(0, LIMITS.url);
  return {
    from: /^\d{4}-\d{2}-\d{2}$/.test(String(b.from || '')) ? b.from : '',
    to: /^\d{4}-\d{2}-\d{2}$/.test(String(b.to || '')) ? b.to : '',
    intro: String(b.intro == null ? '' : b.intro).replace(/[<>]/g, '').trim().slice(0, LIMITS.intro),
    results: on('results', true) ? games.filter(isPlayed) : [],
    upcoming: on('upcoming', true) ? games.filter((g) => !isPlayed(g)) : [],
    playerOfGame: on('player', true) && clip(pog.name, LIMITS.playerName)
      ? { name: clip(pog.name, LIMITS.playerName), line: clip(pog.line, LIMITS.playerLine), photoUrl: isHttp(photo) || isPath(photo) ? photo : '' }
      : null,
    wantFundraiser: on('fundraiser', true),
    wantStore: on('store', false),
  };
}
/** True when there is something to send. A fundraiser bar or store tiles on
 *  their own are not a newsletter. */
export function hasContent(c) {
  return !!(c && (c.intro || (c.results && c.results.length) || (c.upcoming && c.upcoming.length) || c.playerOfGame));
}

// ── The email ──────────────────────────────────────────────────────────
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const money = (c) => '$' + Math.round((c || 0) / 100).toLocaleString('en-US');
const MAROON = '#840036', GOLD = '#c9a44a', INK = '#0a0005', PAPER = '#f4f1ec', TEXT = '#1f1a1c', MUTED = '#6b6366';
const FONT = "Arial, Helvetica, sans-serif";

function absUrl(origin, p) {
  if (!p) return '';
  if (isHttp(p)) return p;
  return String(origin || '').replace(/\/+$/, '') + (p.startsWith('/') ? p : '/' + p);
}
function section(title, inner) {
  return `<tr><td style="padding:26px 24px 0 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${FONT};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${MAROON};font-weight:bold;padding-bottom:10px;border-bottom:2px solid ${GOLD}">${esc(title)}</td>
    </tr></table>
    ${inner}
  </td></tr>`;
}
function logoCell(src, alt, size) {
  const s = size || 56;
  if (!src) return `<td width="${s}" align="center" valign="middle" style="width:${s}px;height:${s}px;background:#ffffff;border-radius:12px;font-family:${FONT};font-size:14px;font-weight:bold;color:${MAROON}">${esc(String(alt || '').slice(0, 2).toUpperCase())}</td>`;
  return `<td width="${s}" align="center" valign="middle" style="width:${s}px;height:${s}px;background:#ffffff;border-radius:12px"><img src="${esc(src)}" alt="${esc(alt)}" width="${s - 10}" height="${s - 10}" style="display:block;width:${s - 10}px;height:${s - 10}px;border:0;outline:none"></td>`;
}
function pill(text, dark) {
  return `<span style="display:inline-block;font-family:${FONT};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${dark ? '#ffffff' : MAROON};background:${dark ? 'rgba(255,255,255,0.12)' : '#fbeff3'};border:1px solid ${dark ? 'rgba(255,255,255,0.25)' : '#f0c9d6'};border-radius:999px;padding:4px 10px">${esc(text)}</span>`;
}
function button(href, text) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${MAROON};border-radius:999px"><a href="${esc(href)}" style="display:inline-block;font-family:${FONT};font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#ffffff;text-decoration:none;padding:12px 24px">${esc(text)}</a></td></tr></table>`;
}
const whereWord = (g) => (g.home || g.neutral ? 'vs' : 'at');
const gameDay = (g) => (g.iso ? fmtDay(g.iso, { weekday: 'short', month: 'short', day: 'numeric' }) : g.date);

function resultCard(origin, g) {
  const win = g.us > g.them;
  const acesLogo = absUrl(origin, '/Bulldog.png');
  const oppLogo = absUrl(origin, g.logo);
  const meta = [gameDay(g), g.venue].filter(Boolean).join(' at ');
  const scoreStyle = (mine) => `font-family:${FONT};font-size:34px;line-height:1;font-weight:bold;color:${mine && win ? GOLD : '#ffffff'}`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:${INK};border-radius:14px">
    <tr><td style="padding:16px 18px 6px 18px">${pill(`Final, ${win ? 'Aces win' : 'Aces fall'}`, true)}</td></tr>
    <tr><td style="padding:4px 18px 14px 18px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${logoCell(acesLogo, 'Lower Merion Aces', 56)}
        <td style="padding-left:12px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:1px">Aces</td>
        <td align="right" style="${scoreStyle(true)};padding-right:12px">${g.us}</td>
        <td width="1" style="width:1px;background:rgba(255,255,255,0.18)"></td>
        <td align="left" style="${scoreStyle(false)};padding-left:12px">${g.them}</td>
        <td align="right" style="padding-right:12px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:1px">${esc(g.opp)}</td>
        ${logoCell(oppLogo, g.opp, 56)}
      </tr></table>
    </td></tr>
    <tr><td style="padding:0 18px 16px 18px;font-family:${FONT};font-size:12px;color:rgba(255,255,255,0.6)">${esc(meta)}</td></tr>
  </table>`;
}
function upcomingRow(origin, g) {
  const oppLogo = absUrl(origin, g.logo);
  const detail = [g.time, g.venue].filter(Boolean).join(', ');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#ffffff;border:1px solid #e8e2dc;border-radius:12px">
    <tr>
      <td style="padding:14px 16px;vertical-align:middle">${pill(gameDay(g))}</td>
      <td style="padding:14px 8px;font-family:${FONT};font-size:17px;font-weight:bold;color:${TEXT};vertical-align:middle">${whereWord(g)} ${esc(g.opp)}${g.conf ? `<span style="font-size:11px;font-weight:normal;letter-spacing:2px;text-transform:uppercase;color:${MUTED}"> &nbsp;League</span>` : ''}<div style="font-size:13px;font-weight:normal;color:${MUTED};padding-top:3px">${esc(detail)}</div></td>
      <td style="padding:10px 14px 10px 0;vertical-align:middle" align="right"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${logoCell(oppLogo, g.opp, 48)}</tr></table></td>
    </tr>
  </table>`;
}
function playerCard(origin, p) {
  const photo = absUrl(origin, p.photoUrl);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#ffffff;border:1px solid #e8e2dc;border-radius:14px">
    <tr>
      ${photo ? `<td width="120" style="width:120px;padding:14px 0 14px 14px;vertical-align:top"><img src="${esc(photo)}" alt="${esc(p.name)}" width="120" style="display:block;width:120px;height:auto;border-radius:10px;border:0"></td>` : ''}
      <td style="padding:16px 16px 16px ${photo ? 16 : 16}px;vertical-align:top">
        <div style="font-family:${FONT};font-size:22px;font-weight:bold;color:${MAROON};text-transform:uppercase;letter-spacing:1px">${esc(p.name)}</div>
        ${p.line ? `<div style="font-family:${FONT};font-size:15px;line-height:1.6;color:${TEXT};padding-top:6px">${esc(p.line)}</div>` : ''}
      </td>
    </tr>
  </table>`;
}
function fundraiserBlock(f) {
  const goal = Math.max(0, f.goalCents || 0), raised = Math.max(0, f.raisedCents || 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const fill = Math.max(pct, raised > 0 ? 2 : 0);
  const makes = f.makes > 0 ? `<div style="font-family:${FONT};font-size:13px;color:${MUTED};padding-top:4px">${f.makes.toLocaleString('en-US')} free throws made so far</div>` : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;background:#ffffff;border:1px solid #e8e2dc;border-radius:14px">
    <tr><td style="padding:18px 18px 6px 18px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${FONT};font-size:26px;font-weight:bold;color:${MAROON}">${money(raised)}</td>
        <td align="right" style="font-family:${FONT};font-size:14px;color:${MUTED}">${goal > 0 ? `of ${money(goal)} raised` : 'raised'}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:6px 18px 0 18px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ebe6e0;border-radius:999px"><tr>
        ${fill > 0 ? `<td width="${fill}%" style="width:${fill}%;height:14px;background:${GOLD};border-radius:999px;font-size:1px;line-height:14px">&nbsp;</td>` : ''}
        ${fill < 100 ? `<td style="height:14px;font-size:1px;line-height:14px">&nbsp;</td>` : ''}
      </tr></table>
      <div style="font-family:${FONT};font-size:13px;color:${MUTED};padding-top:8px">${goal > 0 ? `${pct}% of the way there` : 'Every gift goes to the players'}</div>
      ${makes}
    </td></tr>
    ${f.url ? `<tr><td style="padding:16px 18px 18px 18px">${button(f.url, 'Give to the Shoot-a-Thon')}</td></tr>` : '<tr><td style="padding:0 0 18px 0"></td></tr>'}
  </table>`;
}
function storeTiles(items) {
  const tile = (it) => `<td width="50%" valign="top" style="width:50%;padding:12px 6px 0 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e8e2dc;border-radius:14px">
      ${it.imageUrl ? `<tr><td align="center" style="padding:18px 18px 0 18px"><img src="${esc(it.imageUrl)}" alt="${esc(it.name)}" width="110" style="display:block;width:110px;height:auto;border:0"></td></tr>` : ''}
      <tr><td align="center" style="padding:12px 14px 2px 14px;font-family:${FONT};font-size:16px;font-weight:bold;color:${TEXT}">${esc(it.name)}</td></tr>
      <tr><td align="center" style="padding:0 14px 12px 14px;font-family:${FONT};font-size:15px;color:${MAROON};font-weight:bold">${money(it.priceCents)}</td></tr>
      <tr><td align="center" style="padding:0 14px 16px 14px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" style="background:${MAROON};border-radius:999px"><a href="${esc(it.url)}" style="display:inline-block;font-family:${FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#ffffff;text-decoration:none;padding:9px 18px">Shop</a></td></tr></table></td></tr>
    </table>
  </td>`;
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i], b = items[i + 1];
    rows.push(`<tr>${tile(a)}${b ? tile(b) : '<td width="50%" style="width:50%"></td>'}</tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -6px">${rows.join('')}</table>`;
}

/**
 * The whole email. Sections with nothing in them are left out.
 *   origin        https://aces-basketball.vercel.app (images and links hang off it)
 *   weekLabel     "Dec 1 to Dec 7, 2026"
 *   intro         plain text, newlines kept
 *   results[]     cleanGame rows with us/them
 *   upcoming[]    cleanGame rows without a score
 *   playerOfGame  { name, line, photoUrl } or null
 *   fundraiser    { raisedCents, goalCents, makes, url } or null
 *   store         { items: [{ name, priceCents, imageUrl, url }] } or null
 *   unsubscribeTag the placeholder the server swaps per recipient (defaults to UNSUB_TAG)
 */
export function buildNewsletterHtml(o) {
  const origin = String((o && o.origin) || `https://${SITE_HOST}`).replace(/\/+$/, '');
  const weekLabel = clip(o && o.weekLabel, 60);
  const intro = String((o && o.intro) || '').trim();
  const results = (o && Array.isArray(o.results) ? o.results : []).map(cleanGame).filter(isPlayed);
  const upcoming = (o && Array.isArray(o.upcoming) ? o.upcoming : []).map(cleanGame).filter((g) => g && !isPlayed(g));
  const pog = o && o.playerOfGame && clip(o.playerOfGame.name, LIMITS.playerName) ? o.playerOfGame : null;
  const fund = o && o.fundraiser && (o.fundraiser.raisedCents > 0 || o.fundraiser.goalCents > 0) ? o.fundraiser : null;
  const storeItems = o && o.store && Array.isArray(o.store.items) ? o.store.items.filter((it) => it && it.name && it.priceCents > 0).slice(0, LIMITS.storeItems) : [];
  const unsub = (o && o.unsubscribeTag) || UNSUB_TAG;
  const logo = absUrl(origin, '/LM_Logo.png');
  const site = absUrl(origin, '/');

  const parts = [];
  if (intro) parts.push(`<tr><td style="padding:26px 24px 0 24px;font-family:${FONT};font-size:16px;line-height:1.7;color:${TEXT}">${esc(intro).replace(/\r?\n/g, '<br>')}</td></tr>`);
  if (results.length) parts.push(section('Results', results.map((g) => resultCard(origin, g)).join('')));
  if (upcoming.length) parts.push(section('This week', upcoming.map((g) => upcomingRow(origin, g)).join('')));
  if (pog) parts.push(section('Player of the game', playerCard(origin, pog)));
  if (fund) parts.push(section('Shoot-a-Thon', fundraiserBlock(fund)));
  if (storeItems.length) parts.push(section('From the team store', storeTiles(storeItems)));

  const preheader = intro ? esc(intro.slice(0, 140)) : (results.length ? `Results, this week's games and more from the Aces` : 'This week with the Aces');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aces Weekly</title></head>
<body style="margin:0;padding:0;background:${PAPER}">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${PAPER}">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER}"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#fbfaf8;border-radius:18px;overflow:hidden">
  <tr><td style="background:${MAROON};padding:26px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="72" style="width:72px;vertical-align:middle"><a href="${esc(site)}" style="text-decoration:none"><img src="${esc(logo)}" alt="Lower Merion" width="72" height="72" style="display:block;width:72px;height:72px;border:0"></a></td>
      <td style="padding-left:18px;vertical-align:middle">
        <div style="font-family:${FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${GOLD};font-weight:bold">Lower Merion Aces Basketball</div>
        <div style="font-family:${FONT};font-size:34px;line-height:1.05;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:1px;padding-top:4px">Aces Weekly</div>
        ${weekLabel ? `<div style="font-family:${FONT};font-size:13px;color:#f0d0d6;padding-top:6px">${esc(weekLabel)}</div>` : ''}
      </td>
    </tr></table>
  </td></tr>
  ${parts.join('')}
  <tr><td style="padding:30px 24px 26px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e3ddd6"><tr><td style="padding-top:16px;font-family:${FONT};font-size:12px;line-height:1.7;color:${MUTED}">
      Lower Merion Aces Basketball, Ardmore, PA<br>
      <a href="${esc(site)}" style="color:${MAROON};text-decoration:none">${SITE_HOST}</a><br>
      You are getting Aces Weekly because you signed up for it on the Aces site. <a href="${unsub}" style="color:${MUTED};text-decoration:underline">Unsubscribe</a>
    </td></tr></table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function subjectFor(o) {
  const weekLabel = clip(o && o.weekLabel, 60);
  const results = (o && Array.isArray(o.results) ? o.results : []).filter(isPlayed);
  const upcoming = (o && Array.isArray(o.upcoming) ? o.upcoming : []);
  let tail = '';
  if (results.length === 1) {
    const g = results[0];
    tail = g.us > g.them ? `Aces beat ${g.opp} ${g.us} to ${g.them}` : `Aces fall to ${g.opp} ${g.them} to ${g.us}`;
  } else if (results.length > 1) {
    const w = results.filter((g) => g.us > g.them).length;
    tail = `${w} and ${results.length - w} on the week`;
  } else if (upcoming.length) {
    const g = upcoming[0];
    tail = `${whereWord(g)} ${g.opp} ${g.iso ? fmtDay(g.iso, { weekday: 'long' }) : g.date}`;
  }
  return `Aces Weekly${weekLabel ? `, ${weekLabel}` : ''}${tail ? `: ${tail}` : ''}`;
}

/** The page behind an unsubscribe link. GET shows the button; the button
 *  POSTs. `state` is 'ask', 'done' or 'bad'. */
export function unsubscribePageHtml({ email, token, state }) {
  const inner = state === 'done'
    ? `<h1 style="font-family:${FONT};font-size:24px;color:${MAROON};margin:0 0 10px">You are unsubscribed</h1><p style="font-family:${FONT};font-size:15px;line-height:1.6;color:${TEXT};margin:0">${esc(email)} will not get Aces Weekly any more. You can sign up again any time on the site.</p>`
    : state === 'bad'
      ? `<h1 style="font-family:${FONT};font-size:24px;color:${MAROON};margin:0 0 10px">That link did not work</h1><p style="font-family:${FONT};font-size:15px;line-height:1.6;color:${TEXT};margin:0">Open the newest Aces Weekly and use the unsubscribe link at the bottom, or reply to the email and we will take you off the list.</p>`
      : `<h1 style="font-family:${FONT};font-size:24px;color:${MAROON};margin:0 0 10px">Stop Aces Weekly?</h1><p style="font-family:${FONT};font-size:15px;line-height:1.6;color:${TEXT};margin:0 0 18px">${esc(email)} gets the family newsletter. Press the button and it stops.</p>
        <form method="post" action="/api/newsletter"><input type="hidden" name="action" value="unsubscribe"><input type="hidden" name="email" value="${esc(email)}"><input type="hidden" name="token" value="${esc(token)}"><button type="submit" style="font-family:${FONT};font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#ffffff;background:${MAROON};border:0;border-radius:999px;padding:12px 24px;cursor:pointer">Stop these emails</button></form>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Aces Weekly</title></head>
<body style="margin:0;background:${PAPER}"><div style="max-width:520px;margin:40px auto;padding:0 16px"><div style="background:#fbfaf8;border-radius:16px;padding:28px"><div style="font-family:${FONT};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${GOLD};font-weight:bold;margin-bottom:14px">Lower Merion Aces Basketball</div>${inner}<p style="font-family:${FONT};font-size:12px;color:${MUTED};margin:22px 0 0"><a href="https://${SITE_HOST}/" style="color:${MAROON};text-decoration:none">${SITE_HOST}</a></p></div></div></body></html>`;
}
