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
// Auth (api/_staffauth.js): header x-scouting-key = a coach's OWN code (from
// the staff list) or ADMIN_PASSWORD. Every save is stamped with the coach the code belongs to;
// the admin password is "Admin" and is the only one that manages the staff
// list and hands out codes. Adam, 11/6: "each coach to have their own
// password", replacing the shared scores passcode here.
//
// GET  ?opp=<slug>  -> { report, updated_at }      one report
// GET               -> { me, staff, assignments, reports: { [slug]: { updated_at, updated_by, pct } } }
//                      staff carries codes only for the admin
// POST { action: "check" }                                 -> { ok, me }
//      { action: "staff_add", name } | { action: "staff_code", name } | { action: "staff_set", name, code }
//      | { action: "staff_remove", name }                                                       admin only
//      { action: "assign", slug, scout, helper, status }
//      { action: "save", slug, opp, expect, report }   expect = updated_at the editor loaded;
//                                                       a newer save answers 409 stale
import { fbAdminConfigured, fsGet, fsPatch, fsList } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { LIMITS, normCode, codeKey, validCode, cleanAssignment, cleanReport, completeness, clip, slugOf, SECTIONS, cleanStaffList } from './_scouting.js';
// The staff list and the per-coach sign-in live in _staffauth.js, shared with
// /api/practice so one password opens both coach tools.
import { resolveAuth, newCode, saveStaff, staffFor } from './_staffauth.js';

const ASSIGN = `scouting_meta/${SITE_TAG}_assignments`;
const reportPath = (slug) => `scouting_reports/${SITE_TAG}_${slug}`;
const SLUG_RE = /^[a-z0-9-]{1,60}$/;

const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };

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
  if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
  const auth = await resolveAuth(req);
  if (auth && auth.role === 'blocked') return json(res, 429, { error: 'too_many_tries' });
  if (!auth) return json(res, 401, { error: 'wrong_passcode' });

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://x');
    const slug = url.searchParams.get('opp') || '';
    if (slug) {
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: 'bad_opp' });
      const d = await fsGet(reportPath(slug));
      return json(res, 200, { report: stripReport(d) });
    }
    const [assignments, reports] = await Promise.all([loadAssignments(), fsList('scouting_reports')]);
    const summary = {};
    for (const d of reports) {
      if (d.site !== SITE_TAG || typeof d.id !== 'string' || !d.id.startsWith(`${SITE_TAG}_`)) continue;
      summary[d.id.slice(SITE_TAG.length + 1)] = { updated_at: d.updated_at || '', updated_by: d.updated_by || '', pct: completeness(d) };
    }
    return json(res, 200, { me: { name: auth.name, role: auth.role }, staff: staffFor(auth), assignments, reports: summary });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  const now = new Date().toISOString();
  const by = auth.name;

  if (body.action === 'check') return json(res, 200, { ok: true, me: { name: auth.name, role: auth.role } });

  if (['staff_add', 'staff_code', 'staff_set', 'staff_remove'].includes(body.action)) {
    if (auth.role !== 'admin') return json(res, 403, { error: 'admin_only' });
    const name = clip(body.name, LIMITS.name);
    if (!name) return json(res, 400, { error: 'no_name' });
    let list = auth.staff.slice();
    const i = list.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
    if (body.action === 'staff_add') {
      if (i >= 0) return json(res, 400, { error: 'already_there' });
      if (list.length >= LIMITS.staff) return json(res, 400, { error: 'staff_full' });
      list.push({ name, code: newCode(name) });
    } else if (i < 0) {
      return json(res, 404, { error: 'no_such_coach' });
    } else if (body.action === 'staff_code') {
      list[i] = { name: list[i].name, code: newCode(list[i].name) };
    } else if (body.action === 'staff_set') {
      const code = normCode(body.code);
      if (!validCode(code)) return json(res, 400, { error: 'bad_code' });
      if (list.some((c, j) => j !== i && codeKey(c.code) === codeKey(code))) return json(res, 400, { error: 'code_taken' });
      list[i] = { name: list[i].name, code };
    } else {
      list.splice(i, 1);
    }
    list = cleanStaffList(list);
    if (!(await saveStaff(list, by))) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, staff: list });
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
