// Vercel Serverless Function: /api/scouting
// Opponent scouting for the coaching staff: who is scouting whom, and the
// report on each opponent, edited from the hidden /#scouting page.
//
// Storage: Firestore, through the same server login as registrations
// (api/_firestore.js). Reports are not public: an opponent's tendencies in a
// public Blob would be readable by anyone with the link.
//   scouting_meta/aces_staff          { site, names: [...] }
//   scouting_meta/aces_assignments    { site, map: { [slug]: { scout, helper, status } } }
//   scouting_reports/aces_<slug>      { site, opp, <sections>, personnel, keys, matchups, links, updated_at, updated_by }
//
// Auth: header x-scouting-key = SCORES_PASSCODE or ADMIN_PASSWORD (the same
// coaches' passcode as /#scores). x-scouting-user names who is editing.
//
// GET  ?opp=<slug>  -> { report, updated_at }      one report
// GET               -> { staff, assignments, reports: { [slug]: { updated_at, updated_by, pct } } }
// POST { action: "check" }
//      { action: "staff", names: [...] }
//      { action: "assign", slug, scout, helper, status }
//      { action: "save", slug, opp, expect, report }   expect = updated_at the editor loaded;
//                                                       a newer save answers 409 stale
import { fbAdminConfigured, fsGet, fsPatch, fsList } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { DEFAULT_STAFF, LIMITS, cleanStaff, cleanAssignment, cleanReport, completeness, clip, slugOf, SECTIONS } from './_scouting.js';

const STAFF = `scouting_meta/${SITE_TAG}_staff`;
const ASSIGN = `scouting_meta/${SITE_TAG}_assignments`;
const reportPath = (slug) => `scouting_reports/${SITE_TAG}_${slug}`;
const SLUG_RE = /^[a-z0-9-]{1,60}$/;

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const authed = (req) => {
  const k = req.headers['x-scouting-key'] || '';
  return ctEq(k, process.env.SCORES_PASSCODE) || ctEq(k, process.env.ADMIN_PASSWORD);
};
const who = (req) => clip(req.headers['x-scouting-user'], LIMITS.name) || 'a coach';
const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };

async function loadStaff() {
  const d = await fsGet(STAFF);
  const names = d && Array.isArray(d.names) ? cleanStaff(d.names) : [];
  return names.length ? names : DEFAULT_STAFF.slice();
}
async function loadAssignments() {
  const d = await fsGet(ASSIGN);
  const map = d && d.map && typeof d.map === 'object' ? d.map : {};
  const out = {};
  for (const [slug, a] of Object.entries(map)) if (SLUG_RE.test(slug)) out[slug] = cleanAssignment(a);
  return out;
}
const stripReport = (d) => {
  if (!d) return null;
  const r = cleanReport(d, d.opp);
  return { ...r, updated_at: d.updated_at || '', updated_by: d.updated_by || '' };
};

export default async function handler(req, res) {
  if (!authed(req)) return json(res, 401, { error: 'wrong_passcode' });
  if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://x');
    const slug = url.searchParams.get('opp') || '';
    if (slug) {
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: 'bad_opp' });
      const d = await fsGet(reportPath(slug));
      return json(res, 200, { report: stripReport(d) });
    }
    const [staff, assignments, reports] = await Promise.all([loadStaff(), loadAssignments(), fsList('scouting_reports')]);
    const summary = {};
    for (const d of reports) {
      if (d.site !== SITE_TAG || typeof d.id !== 'string' || !d.id.startsWith(`${SITE_TAG}_`)) continue;
      summary[d.id.slice(SITE_TAG.length + 1)] = { updated_at: d.updated_at || '', updated_by: d.updated_by || '', pct: completeness(d) };
    }
    return json(res, 200, { staff, assignments, reports: summary });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  const now = new Date().toISOString();
  const by = who(req);

  if (body.action === 'check') return json(res, 200, { ok: true });

  if (body.action === 'staff') {
    const names = cleanStaff(body.names);
    if (!names.length) return json(res, 400, { error: 'no_names' });
    const r = await fsPatch(STAFF, { site: SITE_TAG, names, updated_at: now, updated_by: by });
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, staff: names });
  }

  if (body.action === 'assign') {
    const slug = String(body.slug || '');
    if (!SLUG_RE.test(slug)) return json(res, 400, { error: 'bad_opp' });
    const map = await loadAssignments();
    const next = cleanAssignment(body);
    if (next.scout || next.helper || next.status !== 'not_started') map[slug] = next; else delete map[slug];
    const r = await fsPatch(ASSIGN, { site: SITE_TAG, map, updated_at: now, updated_by: by });
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, assignments: map });
  }

  if (body.action === 'save') {
    const opp = clip(body.opp, LIMITS.opp);
    const slug = String(body.slug || slugOf(opp));
    if (!opp || !SLUG_RE.test(slug) || slugOf(opp) !== slug) return json(res, 400, { error: 'bad_opp' });
    const current = await fsGet(reportPath(slug));
    const expect = typeof body.expect === 'string' ? body.expect : '';
    // Two coaches in one report: the second save would silently wipe the
    // first. Refuse it and hand back what is there now.
    if (current && (current.updated_at || '') !== expect) return json(res, 409, { error: 'stale', report: stripReport(current) });
    const report = cleanReport(body.report, opp);
    const fields = { site: SITE_TAG, ...report, updated_at: now, updated_by: by };
    const r = await fsPatch(reportPath(slug), fields);
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, report: { ...report, updated_at: now, updated_by: by } });
  }

  return json(res, 400, { error: 'unknown_action', sections: SECTIONS.map((s) => s.key) });
}
