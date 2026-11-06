// Vercel Serverless Function: /api/playbook   (Team Playbook)
//
// Players never touch Firestore. They sign in with their own code and get a signed session;
// every play they open is logged with their name. Coaches (ADMIN_PASSWORD in x-admin-key)
// draw plays, choose who sees them, hand out codes and read the view log.
//
// POST { action, ... }
//   Player:  login { code } · plays { token } · view { token, id }
//            ask { token, id, text } · questions { token, id }   (their own questions + the
//            team's answered ones on that play)
//   Coach:   admin_list · save_play { play, id? } · set_visible { id, visible }
//            archive { id } · restore { id } · add_players { players:[{name,group}] }
//            update_player { id, name?, group?, active? } · new_code { id } · remove_player { id }
//            set_open { open } · remove_clip { id } · drop_clip { url }   (delete an uploaded video)
//            answer { id, answer } · hide_question { id } · unhide_question { id }

import { fbAdminConfigured, fsGet, fsCreate, fsPatch, fsPatchVerified, fsList, fsQuery } from './_firestore.js';
import { cleanPlay, cleanClip, canSee, newCode, normCode, cleanName, cleanGroup, signSession, readSession, sessionMatches, LIMITS } from './_playbook.js';
import { SITE_TAG } from './_site.js';
import { del as blobDel } from '@vercel/blob';
import { sendMail, emailConfigured, ADMIN_EMAIL } from './_email.js';
import { clip, stripTags } from './_clinic.js';

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function authed(req) { const want = process.env.ADMIN_PASSWORD || ''; return !!want && ctEq(req.headers['x-admin-key'] || '', want); }
function safeId(id) { return /^[A-Za-z0-9_-]{1,128}$/.test(String(id || '')); }
function rid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
const SETTINGS = 'playbook_meta/settings';
const PLAYER_ACTIONS = new Set(['login', 'plays', 'view', 'ask', 'questions']);
const QUESTION_MAX = 500;

async function loadSettings() { const s = await fsGet(SETTINGS); return { open: !s || s.open !== false }; }
async function loadPlays() { return (await fsList('playbook_plays')).filter((p) => p.site === SITE_TAG); }
async function loadPlayers() { return (await fsList('playbook_players')).filter((p) => p.site === SITE_TAG && !p.removed); }
async function loadQuestions() { return (await fsList('playbook_questions')).filter((q) => q.site === SITE_TAG); }
// What a player may see of a question: their own, or a teammate's once the coach answered it.
function questionFor(q, player) {
  const mine = q.player_id === player.id;
  if (!mine && (!q.answer || q.hidden)) return null;
  return { id: q.id, mine, player_name: mine ? 'You' : q.player_name, text: q.text, answer: q.answer || '', created: q.created, answered_at: q.answered_at || '' };
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }
async function notifyCoach(player, play, text, base) {
  if (!emailConfigured() || !ADMIN_EMAIL) return;
  const link = `${base}/playbook-admin.html#questions`;
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `Playbook question from ${player.name}: ${play.name}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222"><h2 style="margin:0 0 6px;color:#840036">${esc(player.name)} has a question</h2><p style="color:#555;margin:0 0 14px">On <strong>${esc(play.name)}</strong>${player.group ? ` (${esc(player.group)})` : ''}:</p><blockquote style="margin:0 0 18px;padding:12px 16px;background:#fbf6e9;border-left:3px solid #c9a44a;font-size:16px;line-height:1.5">${esc(text)}</blockquote><p><a href="${esc(link)}" style="display:inline-block;background:#840036;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Answer it in the playbook &rarr;</a></p><p style="color:#888;font-size:12px">Your answer shows to ${esc(player.name)} and, once answered, to everyone on the team who can see the play.</p></div>`,
  }).catch(() => false);
}
// What a player sees. The lineup goes out as names, never roster ids.
function publicPlay(p, byId) {
  const lineup = {};
  for (const [tok, pid] of Object.entries(p.lineup || {})) { const pl = byId[pid]; if (pl) lineup[tok] = { id: pl.id, name: pl.name }; }
  return { id: p.id, name: p.name, kind: p.kind || 'ours', opponent: p.opponent || '', category: p.category, court: p.court, notes: p.notes || '', tips: p.tips || [], lineup, clip: p.clip || null, clip_link: p.clip_link || '', frames: p.frames || [], updated: p.updated || p.created || '' };
}
function sortPlays(a, b) { return String(a.kind || 'ours').localeCompare(String(b.kind || 'ours')) || String(a.opponent || '').localeCompare(String(b.opponent || '')) || String(a.category).localeCompare(String(b.category)) || String(a.name).localeCompare(String(b.name)); }

async function dropClip(c) { try { if (c && c.url && process.env.BLOB_READ_WRITE_TOKEN) await blobDel(c.url); } catch (e) { /* best effort: the play no longer points at it */ } }

async function uniqueCode() {
  for (let i = 0; i < 6; i++) {
    const code = newCode();
    const hit = await fsQuery('playbook_players', 'code', 'EQUAL', code);
    if (!hit.length) return code;
  }
  throw new Error('code_collision');
}

// ── Player side ──────────────────────────────────────────────────────────
function baseUrl(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}
async function sessionPlayer(token) {
  const sess = readSession(token);
  if (!sess || !safeId(sess.p)) return { error: 'signed_out' };
  const player = await fsGet(`playbook_players/${sess.p}`);
  if (!player || player.site !== SITE_TAG || !sessionMatches(sess, player)) return { error: 'signed_out' };
  const settings = await loadSettings();
  if (!settings.open) return { error: 'closed' };
  return { player };
}
const who = (pl) => ({ id: pl.id, name: pl.name, group: pl.group || '' });

async function playerAction(action, body, req) {
  if (action === 'login') {
    const code = normCode(body.code);
    if (code.length < 4) return { status: 400, body: { error: 'bad_code' } };
    const hits = (await fsQuery('playbook_players', 'code', 'EQUAL', code)).filter((p) => p.site === SITE_TAG && !p.removed);
    if (!hits.length) { await new Promise((r) => setTimeout(r, 400)); return { status: 401, body: { error: 'bad_code' } }; }
    const player = hits[0];
    if (!player.active) return { status: 403, body: { error: 'access_off' } };
    if (!(await loadSettings()).open) return { status: 403, body: { error: 'closed' } };
    const token = signSession(player);
    if (!token) return { status: 503, body: { error: 'not_configured' } };
    await fsPatch(`playbook_players/${player.id}`, { last_login: new Date().toISOString(), logins: (player.logins || 0) + 1 });
    return { status: 200, body: { token, player: who(player) } };
  }
  const s = await sessionPlayer(body.token);
  if (s.error) return { status: s.error === 'closed' ? 403 : 401, body: { error: s.error } };
  const player = s.player;
  if (action === 'plays') {
    const roster = await loadPlayers();
    const byId = {}; roster.forEach((r) => { byId[r.id] = r; });
    const plays = (await loadPlays()).filter((p) => canSee(p, player)).sort(sortPlays).map((p) => publicPlay(p, byId));
    return { status: 200, body: { player: who(player), plays } };
  }
  if (action === 'view') {
    if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
    const play = await fsGet(`playbook_plays/${body.id}`);
    if (!play || play.site !== SITE_TAG || !canSee(play, player)) return { status: 404, body: { error: 'not_found' } };
    // One log row per player, play and 10 minutes: replaying a play doesn't flood the log.
    const now = Date.now();
    const docId = `${player.id}_${play.id}_${Math.floor(now / 6e5)}`;
    await fsCreate('playbook_views', {
      site: SITE_TAG, player_id: player.id, player_name: player.name, group: player.group || '',
      play_id: play.id, play_name: play.name, at: new Date(now).toISOString(),
      device: String(req.headers['user-agent'] || '').slice(0, 160),
    }, docId);
    await fsPatch(`playbook_players/${player.id}`, { last_seen: new Date(now).toISOString() });
    return { status: 200, body: { ok: true } };
  }
  if (action === 'questions' || action === 'ask') {
    if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
    const play = await fsGet(`playbook_plays/${body.id}`);
    if (!play || play.site !== SITE_TAG || !canSee(play, player)) return { status: 404, body: { error: 'not_found' } };
    if (action === 'ask') {
      const text = clip(stripTags(String(body.text || '').replace(/\s+/g, ' ').trim()), QUESTION_MAX);
      if (text.length < 3) return { status: 400, body: { error: 'empty_question' } };
      const now = Date.now();
      const mine = (await fsQuery('playbook_questions', 'player_id', 'EQUAL', player.id)).filter((q) => now - Date.parse(q.created || 0) < 864e5);
      if (mine.length >= 10) return { status: 429, body: { error: 'too_many' } };
      const id = rid('q');
      const w = await fsCreate('playbook_questions', {
        site: SITE_TAG, play_id: play.id, play_name: play.name, player_id: player.id, player_name: player.name, group: player.group || '',
        text, answer: '', answered_at: '', hidden: false, created: new Date(now).toISOString(),
      }, id);
      if (w.error) return { status: 502, body: { error: 'save_failed' } };
      await notifyCoach(player, play, text, baseUrl(req));
      return { status: 200, body: { ok: true, id } };
    }
    const list = (await fsQuery('playbook_questions', 'play_id', 'EQUAL', play.id)).filter((q) => q.site === SITE_TAG)
      .map((q) => questionFor(q, player)).filter(Boolean).sort((a, b) => String(b.created).localeCompare(String(a.created)));
    return { status: 200, body: { questions: list } };
  }
  return { status: 400, body: { error: 'unknown_action' } };
}

// ── Coach side ───────────────────────────────────────────────────────────
async function adminList() {
  const [plays, players, views, settings, questions] = await Promise.all([
    loadPlays(), loadPlayers(),
    fsList('playbook_views').then((v) => v.filter((x) => x.site === SITE_TAG)),
    loadSettings(), loadQuestions(),
  ]);
  views.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  questions.sort((a, b) => String(b.created).localeCompare(String(a.created)));
  return { status: 200, body: { settings, plays: plays.sort(sortPlays), players: players.sort((a, b) => String(a.name).localeCompare(String(b.name))), views: views.slice(0, 2000), questions } };
}

async function adminAction(action, body) {
  const now = new Date().toISOString();
  switch (action) {
    case 'admin_list': return adminList();
    case 'save_play': {
      const r = cleanPlay(body.play);
      if (r.error) return { status: 400, body: { error: r.error } };
      if (body.id) {
        if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
        const cur = await fsGet(`playbook_plays/${body.id}`);
        if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
        const w = await fsPatchVerified(`playbook_plays/${body.id}`, Object.assign({}, r.play, { updated: now }));
        if (!w.ok) return { status: 502, body: { error: 'save_failed' } };
        // A replaced or dropped clip is deleted from storage so it can't linger at its old address.
        if (cur.clip && cur.clip.url && (!r.play.clip || r.play.clip.url !== cur.clip.url)) await dropClip(cur.clip);
        return { status: 200, body: { ok: true, id: body.id } };
      }
      const id = rid('play');
      const w = await fsCreate('playbook_plays', Object.assign({}, r.play, { site: SITE_TAG, archived: false, created: now, updated: now }), id);
      if (w.error) return { status: 502, body: { error: 'save_failed' } };
      return { status: 200, body: { ok: true, id } };
    }
    case 'set_visible': case 'archive': case 'restore': {
      if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
      const cur = await fsGet(`playbook_plays/${body.id}`);
      if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      const patch = action === 'set_visible' ? { visible: !!body.visible }
        : action === 'archive' ? { archived: true, visible: false, archived_at: now } : { archived: false };
      const w = await fsPatchVerified(`playbook_plays/${body.id}`, patch);
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'add_players': {
      const list = (Array.isArray(body.players) ? body.players : []).slice(0, 60)
        .map((p) => ({ name: cleanName(p && p.name, LIMITS.playerName), group: cleanGroup(p && p.group) })).filter((p) => p.name);
      if (!list.length) return { status: 400, body: { error: 'missing_name' } };
      const added = [];
      for (const p of list) {
        const id = rid('pbp');
        const code = await uniqueCode();
        const w = await fsCreate('playbook_players', { site: SITE_TAG, name: p.name, group: p.group, code, active: true, removed: false, created: now }, id);
        if (w.error) return { status: 502, body: { error: 'save_failed', added } };
        added.push({ id, name: p.name, group: p.group, code });
      }
      return { status: 200, body: { ok: true, added } };
    }
    case 'update_player': case 'new_code': case 'remove_player': {
      if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
      const cur = await fsGet(`playbook_players/${body.id}`);
      if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      let patch;
      if (action === 'new_code') patch = { code: await uniqueCode(), code_changed: now };
      else if (action === 'remove_player') patch = { removed: true, active: false, removed_at: now };
      else {
        patch = {};
        if (body.name !== undefined) { const n = cleanName(body.name, LIMITS.playerName); if (!n) return { status: 400, body: { error: 'missing_name' } }; patch.name = n; }
        if (body.group !== undefined) patch.group = cleanGroup(body.group);
        if (body.active !== undefined) patch.active = !!body.active;
        if (!Object.keys(patch).length) return { status: 400, body: { error: 'nothing_to_change' } };
      }
      const w = await fsPatchVerified(`playbook_players/${body.id}`, patch);
      return w.ok ? { status: 200, body: { ok: true, code: patch.code } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'remove_clip': {
      if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
      const cur = await fsGet(`playbook_plays/${body.id}`);
      if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      if (cur.clip) await dropClip(cur.clip);
      const w = await fsPatchVerified(`playbook_plays/${body.id}`, { clip: null, updated: now });
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'drop_clip': {   // an upload the coach backed out of before saving the play
      const c = cleanClip({ url: body.url });
      if (!c) return { status: 400, body: { error: 'bad_clip' } };
      await dropClip(c);
      return { status: 200, body: { ok: true } };
    }
    case 'answer': case 'hide_question': case 'unhide_question': {
      if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
      const q = await fsGet(`playbook_questions/${body.id}`);
      if (!q || q.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      let patch;
      if (action === 'answer') {
        const answer = clip(stripTags(String(body.answer || '').trim()), 2000);
        if (!answer) return { status: 400, body: { error: 'empty_answer' } };
        patch = { answer, answered_at: now, hidden: false };
      } else patch = { hidden: action === 'hide_question' };
      const w = await fsPatchVerified(`playbook_questions/${body.id}`, patch);
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_open': {
      const w = await fsPatchVerified(SETTINGS, { open: !!body.open, updated: now });
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
  }
  return { status: 400, body: { error: 'unknown_action' } };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!fbAdminConfigured()) return res.status(503).json({ error: 'not_configured' });
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const action = String(body.action || '');
  try {
    let r;
    if (PLAYER_ACTIONS.has(action)) r = await playerAction(action, body, req);
    else if (!authed(req)) r = { status: 401, body: { error: 'unauthorized' } };
    else r = await adminAction(action, body);
    return res.status(r.status).json(r.body);
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
}
