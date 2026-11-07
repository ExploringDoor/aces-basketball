// Vercel Serverless Function: /api/practice
// Practice plans for the coaching staff, edited from the hidden /#practice page.
// One plan per team per day, built from the drill library in api/_practice.js.
//
// Storage: Firestore, through the same server login as registrations.
//   practice_plans/aces_<team>_<date>   { site, date, team, title, start, focus, blocks, equipment, after, updated_at, updated_by }
//   practice_meta/aces_drills           { site, drills: [{ id, name, cat, minutes, note }], updated_at, updated_by }
//
// Auth (api/_staffauth.js, shared with /api/scouting): header x-scouting-key =
// a coach's own password or ADMIN_PASSWORD. Every save is stamped with the
// coach it belongs to. Any coach may edit any plan and the drill library.
//
// GET  ?team=&from=&to=   -> { me, staff, from, to, plans: [{ id, date, team, title, start, totals, blocks, cats, updated_at, updated_by }] }
//                            default range: 4 weeks back through 2 weeks ahead
// GET  ?id=<planId>       -> { plan } (null when there is none yet)
// GET  ?drills=1          -> { drills, custom }   library plus the custom drills
// POST { action: "check" }                       -> { ok, me, staff }   staff = names, for the who dropdown
//      { action: "save", plan, expect }          expect = updated_at the editor loaded; a newer save answers 409 stale
//      { action: "copy", id, date, team? }       copies a plan to another day (409 exists if that day already has one)
//      { action: "delete", id }
//      { action: "drill_add", drill } | { action: "drill_remove", id }
import { fbAdminConfigured, fsGet, fsPatch, fsList, fsDelete } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { resolveAuth } from './_staffauth.js';
import { DRILLS, cleanPlan, cleanDrill, cleanDrillList, planTotals, catMinutes, planId, cleanDate, cleanTeam, addDays, todayYmd, teamFromSlug, TEAMS } from './_practice.js';

const DRILLS_PATH = `practice_meta/${SITE_TAG}_drills`;
const ID_RE = /^[a-z0-9-]{1,20}_\d{4}-\d{2}-\d{2}$/;
const planPath = (id) => `practice_plans/${SITE_TAG}_${id}`;
const json = (res, code, body) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };

const validId = (id) => ID_RE.test(String(id || '')) && !!teamFromSlug(String(id).split('_')[0]) && !!cleanDate(String(id).split('_')[1]);
/** What the editor gets back: the clean plan plus who touched it last. */
const stripPlan = (d, id) => {
  if (!d) return null;
  const p = cleanPlan(d);
  return { ...p, id: id || planId(p.team, p.date), updated_at: d.updated_at || '', updated_by: d.updated_by || '' };
};
const rowOf = (d, id) => {
  const p = cleanPlan(d);
  return { id, date: p.date, team: p.team, title: p.title, start: p.start, totals: planTotals(p), blocks: p.blocks.length, cats: catMinutes(p), updated_at: d.updated_at || '', updated_by: d.updated_by || '' };
};
async function loadCustomDrills() {
  const d = await fsGet(DRILLS_PATH);
  return d && Array.isArray(d.drills) ? cleanDrillList(d.drills) : [];
}

export default async function handler(req, res) {
  if (!fbAdminConfigured()) return json(res, 503, { error: 'not_configured' });
  const auth = await resolveAuth(req);
  if (auth && auth.role === 'blocked') return json(res, 429, { error: 'too_many_tries' });
  if (!auth) return json(res, 401, { error: 'wrong_passcode' });
  const me = { name: auth.name, role: auth.role };
  const staff = auth.staff.map((c) => c.name);

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://x');
    const id = url.searchParams.get('id') || '';
    if (id) {
      if (!validId(id)) return json(res, 400, { error: 'bad_id' });
      const d = await fsGet(planPath(id));
      return json(res, 200, { plan: stripPlan(d, id) });
    }
    if (url.searchParams.get('drills')) {
      const custom = await loadCustomDrills();
      return json(res, 200, { drills: [...DRILLS, ...custom], custom });
    }
    const today = todayYmd();
    const from = cleanDate(url.searchParams.get('from')) || addDays(today, -28);
    const to = cleanDate(url.searchParams.get('to')) || addDays(today, 14);
    const teamQ = url.searchParams.get('team') || '';
    const team = TEAMS.includes(teamQ) ? teamQ : '';
    const docs = await fsList('practice_plans');
    const plans = [];
    for (const d of docs) {
      if (d.site !== SITE_TAG || typeof d.id !== 'string' || !d.id.startsWith(`${SITE_TAG}_`)) continue;
      const pid = d.id.slice(SITE_TAG.length + 1);
      if (!validId(pid)) continue;
      const date = cleanDate(d.date);
      if (!date || date < from || date > to) continue;
      if (team && cleanTeam(d.team) !== team) continue;
      plans.push(rowOf(d, pid));
    }
    plans.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.team.localeCompare(b.team)));
    return json(res, 200, { me, staff, from, to, plans });
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'bad_json' });
  const now = new Date().toISOString();
  const by = auth.name;

  if (body.action === 'check') return json(res, 200, { ok: true, me, staff });

  if (body.action === 'save') {
    const plan = cleanPlan(body.plan);
    if (!plan.date) return json(res, 400, { error: 'bad_date' });
    const id = planId(plan.team, plan.date);
    const current = await fsGet(planPath(id));
    const expect = typeof body.expect === 'string' ? body.expect : '';
    // Two coaches in one plan: the second save would silently wipe the
    // first. Refuse it and hand back what is there now.
    if (current && (current.updated_at || '') !== expect) return json(res, 409, { error: 'stale', plan: stripPlan(current, id) });
    const r = await fsPatch(planPath(id), { site: SITE_TAG, ...plan, updated_at: now, updated_by: by });
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, plan: { ...plan, id, updated_at: now, updated_by: by } });
  }

  if (body.action === 'copy') {
    const id = String(body.id || '');
    const date = cleanDate(body.date);
    if (!validId(id)) return json(res, 400, { error: 'bad_id' });
    if (!date) return json(res, 400, { error: 'bad_date' });
    const src = await fsGet(planPath(id));
    if (!src) return json(res, 404, { error: 'no_such_plan' });
    const plan = cleanPlan({ ...src, date, team: TEAMS.includes(body.team) ? body.team : src.team });
    const nid = planId(plan.team, plan.date);
    if (nid === id) return json(res, 400, { error: 'same_day' });
    const there = await fsGet(planPath(nid));
    if (there) return json(res, 409, { error: 'exists', plan: stripPlan(there, nid) });
    const r = await fsPatch(planPath(nid), { site: SITE_TAG, ...plan, updated_at: now, updated_by: by });
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, plan: { ...plan, id: nid, updated_at: now, updated_by: by } });
  }

  if (body.action === 'delete') {
    const id = String(body.id || '');
    if (!validId(id)) return json(res, 400, { error: 'bad_id' });
    const ok = (await fsDelete(planPath(id))).ok;
    if (!ok) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, id });
  }

  if (body.action === 'drill_add' || body.action === 'drill_remove') {
    const custom = await loadCustomDrills();
    let next;
    if (body.action === 'drill_add') {
      const d = cleanDrill(body.drill);
      if (!d.id || !d.name) return json(res, 400, { error: 'no_name' });
      if (DRILLS.some((x) => x.id === d.id || x.name.toLowerCase() === d.name.toLowerCase()) || custom.some((x) => x.id === d.id || x.name.toLowerCase() === d.name.toLowerCase())) return json(res, 400, { error: 'already_there' });
      next = cleanDrillList([...custom, d]);
      if (next.length === custom.length) return json(res, 400, { error: 'library_full' });
    } else {
      const id = String(body.id || '');
      next = custom.filter((x) => x.id !== id);
      if (next.length === custom.length) return json(res, 404, { error: 'no_such_drill' });
    }
    const r = await fsPatch(DRILLS_PATH, { site: SITE_TAG, drills: next, updated_at: now, updated_by: by });
    if (r && r.error) return json(res, 500, { error: 'save_failed' });
    return json(res, 200, { ok: true, drills: [...DRILLS, ...next], custom: next });
  }

  return json(res, 400, { error: 'unknown_action' });
}
