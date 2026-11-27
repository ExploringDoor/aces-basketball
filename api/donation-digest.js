// Vercel Serverless Function — /api/donation-digest   (nightly cron, see vercel.json)
// ONE Shoot-a-Thon email a night to ADMIN_EMAIL instead of a copy of every donor's email (Adam,
// 11/27: "i dont want emails for every donation ... at the end of every night i'll take 1 email
// saying how much has been donated"). It reports what happened since the last summary: gifts paid
// (card, cash, check, per throw pledges paid off), new per throw pledges, refunds, any change to
// earlier gifts, plus the running totals by team. A night with nothing new sends nothing.
//
// The marker doc (MARK) holds `sent_through`: everything up to that moment has been reported.
// It only moves forward AFTER the email went out (or the night was confirmed quiet), so a failed
// read, a failed send or a crash means the next night's summary simply covers both nights.
// Overlapping runs are kept apart by a short lease (`lock_until`) taken with a conditional write.
// `reported_raised_cents` is the total the last summary stated; a total that moved by more than
// the gifts and refunds in between means an earlier gift was edited, removed or put back, and the
// email says so.
//
// Auth: Vercel cron sends `Authorization: Bearer <CRON_SECRET>`; an admin may also call it with
// the x-admin-key header. GET ?preview=1 (admin) returns the email without sending or moving the marker.

import { fbConfigured, fbAdminConfigured, fsGet, fsGetMeta, fsCreate, fsPatchVerified, fsQueryStrict } from './_firestore.js';
import { SHOOTATHON, computePledgeCents } from './_shootathon.js';
import { sendMail, buildDonationDigestEmail, emailConfigured, ADMIN_EMAIL } from './_email.js';
import { buildSnapshot, targetOf, targetName } from './pledge.js';

const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const MARK_ID = '_digest_aces';                 // lives with the event docs (the rules already let the server write there)
const MARK = `shootathon/${MARK_ID}`;
const LAG_MS = 2 * MIN;                         // a gift stamped in the last 2 minutes waits for the next summary (its write may still be landing)
const MAX_LOOKBACK = 14 * DAY;                  // a marker from long ago never dumps a whole season into one email
const MIN_GAP = 6 * HOUR;                       // a second cron delivery the same night sends nothing
const LEASE_MS = 5 * MIN;                       // a run that dies holding the lease frees it after this
// The first summary starts here: donation emails stopped copying the admin with this release.
const FIRST_SINCE = Date.parse('2026-11-27T20:00:00.000Z');

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function isAdmin(req) { const a = process.env.ADMIN_PASSWORD || ''; return !!a && ctEq(req.headers['x-admin-key'] || '', a); }
function isCron(req) { const c = process.env.CRON_SECRET || ''; return !!c && ctEq(req.headers['authorization'] || '', `Bearer ${c}`); }
const ms = (iso) => { const t = Date.parse(String(iso || '')); return Number.isFinite(t) ? t : NaN; };
const inWin = (t, a, b) => Number.isFinite(t) && t > a && t <= b;
const paidAt = (p) => ms(p.recorded_at || p.paid_at);   // a cash/check gift typed in later counts the night it was entered
const giftValue = (p) => Math.max(0, (p.amount_paid_cents || p.amount_cents || 0) - (p.fee_cents || 0));   // what the thermometer counts

function howPaid(p) {
  if (p.kind === 'per_shot') return 'per throw pledge, paid' + (p.offline ? ' by ' + String(p.paid_via || 'cash').toLowerCase() : ' online');
  if (p.offline) return String(p.paid_via || 'Cash').toLowerCase() + (p.check_no ? ' #' + p.check_no : '');
  return 'one time gift, card';
}
const cents2 = (c) => '$' + ((c || 0) / 100).toFixed(2);
function etDay(t, opts) { return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: 'America/New_York' }, opts)).format(new Date(t)); }

// The records as they stood at `untilMs`: a gift paid after it is not counted yet, a refund after it
// has not happened yet. Keeps the total in line with the lists (and with the next night's math).
function asOf(pledges, untilMs) {
  return pledges.map((p) => {
    if (p.status === 'paid' && paidAt(p) > untilMs) return Object.assign({}, p, { status: 'pending' });
    if (p.status === 'refunded' && ms(p.refunded_at) > untilMs) return Object.assign({}, p, { status: 'paid' });
    return p;
  });
}

// Pure: everything the email says, for the window (sinceMs, untilMs]. `prevRaised` is the total the
// last summary stated (null before the first one). Exported for the tests.
export function digestFor(event, allPledges, sinceMs, untilMs, prevRaised = null) {
  const pledges = asOf(allPledges.filter((p) => p && p.event_id === SHOOTATHON.eventId), untilMs);
  const name = (p) => { const tg = targetOf(p); return targetName(event, tg.type, tg.slug); };
  const makes = {}; (event.players || []).forEach((pl) => { makes[pl.slug] = parseInt(pl.makes, 10) || 0; });
  const gifts = [], newPledges = [], refunds = [];
  let giftCents = 0, feeCents = 0, refundCents = 0, refundOfCounted = 0;
  let open = 0, openWithMakes = 0, openProjected = 0, invoiced = 0, invoicedCents = 0, orgGifts = 0;
  const openPlayers = new Set(), donors = new Set();
  for (const p of pledges) {
    const base = { donor_name: p.donor_name || '', anonymous: !!p.anonymous, supports: name(p) };
    const tg = targetOf(p);
    if (p.status === 'paid') {
      donors.add(String(p.donor_email || p.donor_name || p.id || '').trim().toLowerCase());
      if (tg.type === 'org') orgGifts += giftValue(p);
      if (inWin(paidAt(p), sinceMs, untilMs) && giftValue(p) > 0) {
        gifts.push(Object.assign(base, { cents: giftValue(p), how: howPaid(p), at: paidAt(p) }));
        giftCents += giftValue(p);
        if (!p.offline) feeCents += p.fee_cents || 0;
      }
    }
    if (p.kind === 'per_shot' && !['canceled', 'removed', 'error'].includes(p.status) && inWin(ms(p.created), sinceMs, untilMs)) {
      const cap = p.cap_cents > 0 ? ', up to ' + cents2(p.cap_cents) : '';
      newPledges.push(Object.assign({}, base, { rate: cents2(p.per_shot_cents) + ' a throw', detail: 'for ' + base.supports + cap, at: ms(p.created) }));
    }
    if (p.status === 'refunded' && inWin(ms(p.refunded_at), sinceMs, untilMs)) {
      const v = giftValue(p);   // the gift, without the card fee that went back with it (that is what the total had counted)
      refunds.push(Object.assign({}, base, { cents: v, at: ms(p.refunded_at) }));
      refundCents += v;
      if (paidAt(p) <= sinceMs) refundOfCounted += v;   // only a gift the last total had counted makes the total drop
    }
    if (p.status === 'pledged') {
      open++; openPlayers.add(tg.slug);
      if (tg.type === 'player' && makes[tg.slug] > 0) { openWithMakes++; openProjected += computePledgeCents(p, makes[tg.slug]); }
    }
    if (p.status === 'invoiced') { invoiced++; invoicedCents += p.amount_cents || 0; }
  }
  const byTime = (a, b) => a.at - b.at;
  gifts.sort(byTime); newPledges.sort(byTime); refunds.sort(byTime);
  const snap = buildSnapshot(event, pledges);
  const teamTotal = snap.teams.reduce((n, t) => n + t.raised_cents, 0);
  const raised = snap.org.raised_cents;
  // Anything the gifts and refunds above don't explain: an earlier gift edited, removed or put back.
  const adjust = prevRaised == null ? 0 : raised - (prevRaised + giftCents - refundOfCounted);
  const long = untilMs - sinceMs > 26 * HOUR;
  return {
    has: gifts.length + newPledges.length + refunds.length > 0 || adjust !== 0,
    window_label: long ? 'since ' + etDay(sinceMs, { weekday: 'long' }) : 'today',
    date_label: etDay(untilMs, { weekday: 'long', month: 'long', day: 'numeric' }),
    gifts, pledges: newPledges, refunds,
    gift_cents: giftCents, fee_cents: feeCents, refund_cents: refundCents, adjust_cents: adjust,
    raised_cents: raised, goal_cents: snap.org.goal_cents, donors: donors.size,
    teams: snap.teams.map((t) => ({ name: t.name, goal_cents: t.goal_cents, raised_cents: t.raised_cents })),
    program_cents: orgGifts,                                          // gifts to the whole program
    unteamed_cents: Math.max(0, raised - teamTotal - orgGifts),       // gifts to a player with no team (or one since taken off)
    open_pledges: open, open_players: openPlayers.size, open_with_makes: openWithMakes, open_projected_cents: openProjected,
    invoiced, invoiced_cents: invoicedCents,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const admin = isAdmin(req);
  if (!admin && !isCron(req)) return res.status(401).json({ error: 'unauthorized' });
  if (!(fbConfigured() && fbAdminConfigured())) return res.status(503).json({ error: 'not_configured' });
  const preview = admin && String((req.query || {}).preview || '') === '1';
  if (!preview && !(emailConfigured() && ADMIN_EMAIL)) return res.status(200).json({ ok: true, sent: false, skipped: 'email_not_configured' });

  const now = Date.now();
  const untilMs = now - LAG_MS;
  const meta = await fsGetMeta(MARK);
  const mk = (meta && meta.doc) || {};
  const last = ms(mk.sent_through);
  const sinceMs = Math.max(Number.isFinite(last) ? last : FIRST_SINCE, now - MAX_LOOKBACK);
  const prevRaised = Number.isFinite(last) && Number.isInteger(mk.reported_raised_cents) ? mk.reported_raised_cents : null;
  const since = new Date(sinceMs).toISOString(), until = new Date(untilMs).toISOString();

  if (preview) {
    const event = await fsGet(`shootathon/${SHOOTATHON.eventId}`);
    if (!event) return res.status(200).json({ ok: true, preview: true, skipped: 'no_event' });
    const d = digestFor(event, await fsQueryStrict('pledges', 'event_id', 'EQUAL', SHOOTATHON.eventId), sinceMs, untilMs, prevRaised);
    const out = d.has ? buildDonationDigestEmail(d) : { subject: '', html: '' };
    return res.status(200).json({ ok: true, preview: true, has: d.has, since, until, subject: out.subject, html: out.html, gifts: d.gifts.length, gift_cents: d.gift_cents, raised_cents: d.raised_cents });
  }
  if (Number.isFinite(last) && last > now - MIN_GAP) return res.status(200).json({ ok: true, sent: false, skipped: 'too_soon', sent_through: mk.sent_through });
  if (ms(mk.lock_until) > now) return res.status(200).json({ ok: true, sent: false, skipped: 'another_run' });

  // Take the lease. Only the run whose conditional write lands goes on.
  const lock = { lock_until: new Date(now + LEASE_MS).toISOString(), event_id: SHOOTATHON.eventId, ran_at: new Date(now).toISOString() };
  if (meta) {
    const c = await fsPatchVerified(MARK, lock, 1, { ifUpdateTime: meta.updateTime });
    if (!c.ok) {
      if (c.status === 400 || c.status === 412 || c.status === 409) return res.status(200).json({ ok: true, sent: false, skipped: 'another_run' });
      return res.status(503).json({ error: 'claim_failed' });
    }
  } else {
    const c = await fsCreate('shootathon', lock, MARK_ID);
    if (!(c && c.name)) {
      if (c && c.error && (c.error.code === 409 || c.error.status === 'ALREADY_EXISTS')) return res.status(200).json({ ok: true, sent: false, skipped: 'another_run' });
      return res.status(503).json({ error: 'claim_failed' });
    }
  }
  const release = (extra) => fsPatchVerified(MARK, Object.assign({ lock_until: '' }, extra || {}));

  let d;
  try {
    const event = await fsGet(`shootathon/${SHOOTATHON.eventId}`);
    if (!event) { await release(); return res.status(200).json({ ok: true, sent: false, skipped: 'no_event' }); }
    const pledges = await fsQueryStrict('pledges', 'event_id', 'EQUAL', SHOOTATHON.eventId);   // a failed read throws: nothing moves, tomorrow covers it
    d = digestFor(event, pledges, sinceMs, untilMs, prevRaised);
  } catch (e) {
    try { await release({ last_error: 'read_failed', last_error_at: new Date().toISOString() }); } catch (x) { /* the lease runs out on its own */ }
    return res.status(500).json({ error: 'read_failed' });
  }
  const counts = { gifts: d.gifts.length, gift_cents: d.gift_cents, pledges: d.pledges.length, refunds: d.refunds.length, adjust_cents: d.adjust_cents, raised_cents: d.raised_cents };
  const done = { sent_through: until, reported_raised_cents: d.raised_cents };

  if (!d.has) {
    const w = await release(done);
    return res.status(200).json(Object.assign({ ok: true, sent: false, quiet: true, since, until, saved: w.ok }, counts));
  }
  const { subject, html } = buildDonationDigestEmail(d);
  const ok = await sendMail({ to: ADMIN_EMAIL, subject, html });
  if (!ok) {
    // sent_through stays where it was, so tomorrow's summary still includes tonight.
    await release({ last_error: 'send_failed', last_error_at: new Date().toISOString() });
    return res.status(502).json({ error: 'send_failed' });
  }
  const w = await release(Object.assign({ last_sent_at: new Date().toISOString(), last_subject: subject, last_error: '' }, done));
  // If that write failed the email still went; tomorrow repeats tonight rather than skipping it.
  return res.status(200).json(Object.assign({ ok: true, sent: true, since, until, subject, saved: w.ok }, counts));
}
