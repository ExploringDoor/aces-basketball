// Who is calling a coach tool. One staff list, one password per coach, shared
// by /api/scouting and /api/practice so a coach signs in the same way on both
// hidden pages (and the phone remembers one password, localStorage
// aces-scouting-key, for both).
//
//   scouting_meta/aces_staff   { site, staff: [{ name, code }], updated_at, updated_by }
//
// Header x-scouting-key = a coach's OWN code (from the staff list) or
// ADMIN_PASSWORD. The header name is historical: it stays so coaches'
// remembered passwords keep working. The staff list is read on every call so
// a removed code stops working at once.
import { randomInt } from 'node:crypto';
import { fsGet, fsPatch } from './_firestore.js';
import { SITE_TAG } from './_site.js';
import { DEFAULT_STAFF, cleanStaffList, normCode, codeKey, codeFor } from './_scouting.js';

export const STAFF_PATH = `scouting_meta/${SITE_TAG}_staff`;

/** Constant-time string compare so a password check leaks nothing by timing. */
export function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
/** Grugan47!: the coach's first name, two or three digits, a bang. */
// Four digits (Grugan4472!): still a basic password to read out, but 9,000 guesses per coach
// instead of 900, behind the throttle below.
export const newCode = (name) => codeFor(name, String(randomInt(1000, 9999)));

// Wrong-password throttle, per IP, in warm-instance memory. Review 11/6: the code shape and the
// coach names are visible in the public bundle, so without this a loop could try every code in a
// minute. Eight misses in ten minutes locks that IP out for ten minutes; every miss also waits
// 400 ms so a loop crawls rather than runs.
const misses = new Map();
const ipOf = (req) => String((req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || 'local').split(',')[0].trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function throttled(req) {
  const m = misses.get(ipOf(req));
  return !!(m && m.count >= 8 && Date.now() - m.first < 600000);
}
async function noteMiss(req) {
  const ip = ipOf(req), now = Date.now();
  const m = misses.get(ip);
  if (!m || now - m.first >= 600000) misses.set(ip, { first: now, count: 1 }); else m.count++;
  if (misses.size > 5000) misses.clear();
  await sleep(400);
}
export const isAdminKey = (k) => ctEq(k, process.env.ADMIN_PASSWORD);

/** The staff list, bootstrapped from DEFAULT_STAFF with fresh codes the first
 *  time anyone asks, so Adam's first admin visit already has codes to hand out. */
export async function loadStaff() {
  const d = await fsGet(STAFF_PATH);
  // Only a MISSING document bootstraps. An admin who removes everyone to rebuild the list must
  // not have the six defaults come back on the next request.
  if (d && Array.isArray(d.staff)) return cleanStaffList(d.staff);
  const fresh = cleanStaffList(DEFAULT_STAFF.map((name) => ({ name, code: newCode(name) })));
  await fsPatch(STAFF_PATH, { site: SITE_TAG, staff: fresh, updated_at: new Date().toISOString(), updated_by: 'setup' });
  return fresh;
}
export async function saveStaff(list, by) {
  const r = await fsPatch(STAFF_PATH, { site: SITE_TAG, staff: list, updated_at: new Date().toISOString(), updated_by: by });
  return !(r && r.error);
}

/** Who is calling: the admin, a coach by their own code, or null for nobody.
 *  { role: 'admin' | 'coach', name, staff } */
export async function resolveAuth(req) {
  if (throttled(req)) return { role: 'blocked' };
  const k = String((req.headers && req.headers['x-scouting-key']) || '');
  if (isAdminKey(k)) return { role: 'admin', name: 'Admin', staff: await loadStaff() };
  const code = normCode(k);
  if (!code) return null;
  const staff = await loadStaff();
  const hit = staff.find((c) => c.code && ctEq(codeKey(c.code), codeKey(code)));
  if (hit) return { role: 'coach', name: hit.name, staff };
  await noteMiss(req);
  return null;
}

/** What a caller may see of the staff list: names always, codes only for the admin. */
export const staffFor = (auth) => auth.staff.map((c) => (auth.role === 'admin' ? { name: c.name, code: c.code } : { name: c.name }));

/** A coach's own staff code used somewhere other than scouting (the Team Playbook coach page).
 *  Returns the coach's name, or '' (counting the miss against the same per-IP throttle). */
export async function staffCodeName(req, key) {
  if (throttled(req)) return '';
  const code = normCode(key);
  if (!code) return '';
  const staff = await loadStaff().catch(() => []);
  const hit = staff.find((c) => c.code && ctEq(codeKey(c.code), codeKey(code)));
  if (hit) return hit.name;
  await noteMiss(req);
  return '';
}
