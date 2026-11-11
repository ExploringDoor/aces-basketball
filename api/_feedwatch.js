// Schedule change detection for the playbook's calendar feeds. Pure functions, tested in
// tests/feedwatch.test.mjs. The cron in api/playbook-feedwatch.js and the admin "Check now"
// button both run runFeedWatch() in api/playbook.js, which uses these.
const DAY = 86400000;

export function windowEvents(events, now = Date.now(), days = 14) {
  const lo = now - 3 * 36e5, hi = now + days * DAY;
  return (events || []).map((e) => ({ at: String(e.at || ''), title: String(e.title || '').trim().slice(0, 120), where: String(e.where || '').trim().slice(0, 160), allDay: !!e.allDay }))
    .filter((e) => { const t = Date.parse(e.at); return isFinite(t) && t >= lo && t <= hi && e.title; })
    .sort((a, b) => a.at.localeCompare(b.at));
}
export const keyOf = (e) => e.at + '|' + e.title.toLowerCase();

/* added / removed / moved (same title, different time within 3 days) / relocated (same slot, new place) */
export function diffEvents(oldList, newList) {
  const oldMap = new Map((oldList || []).map((e) => [keyOf(e), e]));
  const newMap = new Map((newList || []).map((e) => [keyOf(e), e]));
  const added = [], removed = [], relocated = [], moved = [];
  newMap.forEach((e, k) => { const o = oldMap.get(k); if (!o) added.push(e); else if ((o.where || '') !== (e.where || '')) relocated.push({ from: o, to: e }); });
  oldMap.forEach((e, k) => { if (!newMap.has(k)) removed.push(e); });
  // pair a removed and an added event with the same title inside 3 days: that is a time change
  const usedAdd = new Set();
  const stillRemoved = [];
  removed.forEach((r) => {
    const i = added.findIndex((a, idx) => !usedAdd.has(idx) && a.title.toLowerCase() === r.title.toLowerCase() && Math.abs(Date.parse(a.at) - Date.parse(r.at)) <= 3 * DAY);
    if (i >= 0) { usedAdd.add(i); moved.push({ from: r, to: added[i] }); } else stillRemoved.push(r);
  });
  return { added: added.filter((_, i) => !usedAdd.has(i)), removed: stillRemoved, moved, relocated };
}
export const hasChanges = (d) => !!(d && (d.added.length || d.removed.length || d.moved.length || d.relocated.length));

const TZ = 'America/New_York';
export function fmtWhen(e) {
  const d = new Date(e.at);
  if (!isFinite(d)) return e.at;
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ });
  if (e.allDay) return day;
  return day + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).toLowerCase();
}
export function fmtTime(e) {
  const d = new Date(e.at);
  return e.allDay || !isFinite(d) ? 'all day' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).toLowerCase();
}
const sameDay = (a, b) => new Date(a.at).toLocaleDateString('en-US', { timeZone: TZ }) === new Date(b.at).toLocaleDateString('en-US', { timeZone: TZ });

/* plain sentences a player or parent reads in one glance */
export function describeChanges(diff) {
  const lines = [];
  diff.moved.forEach(({ from, to }) => lines.push(sameDay(from, to)
    ? `${to.title} on ${fmtWhen(to).replace(/ \d.*$/, '')} moved from ${fmtTime(from)} to ${fmtTime(to)}` + (to.where ? ` at ${to.where}` : '')
    : `${to.title} moved from ${fmtWhen(from)} to ${fmtWhen(to)}` + (to.where ? ` at ${to.where}` : '')));
  diff.relocated.forEach(({ from, to }) => lines.push(`${to.title} on ${fmtWhen(to)} is now at ${to.where}` + (from.where ? ` instead of ${from.where}` : '')));
  diff.added.forEach((e) => lines.push(`Added: ${e.title}, ${fmtWhen(e)}` + (e.where ? ` at ${e.where}` : '')));
  diff.removed.forEach((e) => lines.push(`Cancelled: ${e.title}, ${fmtWhen(e)}`));
  return lines.slice(0, 12);
}

/* which alert audience a playbook group maps to (the alerts module's teams) */
export function teamsForGroup(group, teams) {
  const g = String(group || '').toLowerCase();
  if (!g) return teams.slice();
  if (/jv|junior/.test(g)) return teams.filter((t) => /jv/i.test(t));
  if (/9|fresh|frosh/.test(g)) return teams.filter((t) => /9|fresh/i.test(t));
  if (/^v|varsity/.test(g)) return teams.filter((t) => /varsity/i.test(t));
  const hit = teams.filter((t) => t.toLowerCase() === g);
  return hit.length ? hit : teams.slice();
}

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
export function changeEmail({ group, lines, siteUrl, teamName }) {
  const who = group ? `${group} schedule` : 'Schedule';
  const subject = lines.length === 1 ? `${who} change: ${lines[0].slice(0, 90)}` : `${who}: ${lines.length} changes`;
  const text = `${who} update from the ${teamName || 'team'} playbook:\n\n` + lines.map((l) => '• ' + l).join('\n') + `\n\nThe Upcoming list in the playbook is always current: ${siteUrl}/playbook\nIf you subscribed to the calendar on your phone it will catch up on its own, usually within a few hours.\n`;
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#16161a">` +
    `<p style="margin:0 0 10px"><b>${esc(who)} update</b> from the ${esc(teamName || 'team')} playbook.</p>` +
    `<ul style="margin:0 0 14px;padding-left:20px">` + lines.map((l) => `<li style="margin:4px 0">${esc(l)}</li>`).join('') + `</ul>` +
    `<p style="margin:0 0 6px"><a href="${esc(siteUrl)}/playbook" style="color:#840036;font-weight:700">Open the playbook</a>, the Upcoming list there is always current.</p>` +
    `<p style="margin:0;color:#6e6e7a;font-size:13px">If you subscribed to the calendar on your phone it will catch up on its own, usually within a few hours.</p></div>`;
  return { subject, text, html };
}
