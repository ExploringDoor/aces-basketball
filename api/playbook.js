// Vercel Serverless Function: /api/playbook   (Team Playbook)
//
// Players never touch Firestore. They sign in with their own code and get a signed session;
// every play they open is logged with their name. Coaches (ADMIN_PASSWORD in x-admin-key)
// draw plays, choose who sees them, hand out codes and read the view log.
//
// POST { action, ... }
//   Player:  login { code } · plays { token } · view { token, id }
//            ask { token, id, text } · questions { token, id }   (their own questions + the
//            team's answered ones on that play) · quiz_result { token, id, score, total }
//            `plays` also returns the current game plan, today's practice (if shared) and what
//            this player has already watched / passed.
//   Coach:   admin_list · save_play { play, id? } · set_visible { id, visible }
//            archive { id } · restore { id } · add_players { players:[{name,group}] }
//            update_player { id, name?, group?, active? } · new_code { id } · remove_player { id }
//            set_open { open } · set_attitude { share } · set_feeds { feeds } · test_feed { url }
//            set_endgame { leaves } · save_term { id?, term } · delete_term { id }
//            log_call { call } · delete_call { id } · send_digest {}   (cron: /api/playbook-digest)
//            set_board { id, step, on }   (players poll `board { token }` and follow it)
//            set_goals { goals }   · set_lineups { lineups }  (saved lineups for the editor)
//              · game plans carry a prep quiz, scored as quiz_result 'prep_<planId>'
//            remove_clip { id } · drop_clip { url }
//            answer { id, answer } · hide_question { id } · unhide_question { id }
//            save_plan { id?, plan } · delete_plan { id } · save_practice { id?, practice }
//            delete_practice { id } · add_note { player_id, note } · delete_note { id }
//            scout_report { opponent }   (reads the coaches' scouting report for the handoff)
//            save_drill { id?, drill } · delete_drill { id }   (the coach's own drills)
//            save_game { id?, game } · delete_game { id }   (box scores, typed or from a Hudl export)

import { fbAdminConfigured, fsGet, fsCreate, fsPatch, fsPatchVerified, fsList, fsQuery, fsDelete } from './_firestore.js';
import { cleanPlay, cleanClip, cleanPlan, cleanPractice, cleanDrill, cleanNote, cleanGame, cleanFeeds, parseIcs, cleanEndgame, cleanTerm, cleanCall, cleanGoals, cleanLineups, canSee, newCode, normCode, cleanName, cleanGroup, signSession, readSession, sessionMatches, LIMITS } from './_playbook.js';
import { SITE_TAG } from './_site.js';
import { del as blobDel } from '@vercel/blob';
import { sendMail, emailConfigured, ADMIN_EMAIL } from './_email.js';
import { clip, stripTags } from './_clinic.js';
import { slugOf as scoutSlug } from './_scouting.js';

function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function authed(req) { const want = process.env.ADMIN_PASSWORD || ''; return !!want && ctEq(req.headers['x-admin-key'] || '', want); }
// Who is on the coach board: the head coach (ADMIN_PASSWORD) or an assistant (a second code the
// coach sets under Settings, stored hashed). Assistants run the bench, they don't edit the book.
const assistantHash = (code) => _fwHash('sha256').update('aces-playbook-assistant:' + String(code || '')).digest('hex');
async function roleOf(req) {
  if (authed(req)) return 'coach';
  const key = String(req.headers['x-admin-key'] || '');
  if (!key) return '';
  const s = await loadSettings();
  return s.assistant_hash && ctEq(assistantHash(key), s.assistant_hash) ? 'assistant' : '';
}
const ASSISTANT_ACTIONS = new Set(['admin_list', 'set_board', 'log_call', 'delete_call', 'add_note', 'save_game', 'answer', 'hide_question', 'unhide_question', 'set_tonight', 'save_practice', 'save_plan', 'scout_report']);
function publicSettings(s) { const o = Object.assign({}, s); delete o.assistant_hash; o.assistant_set = !!s.assistant_hash; return o; }
function safeId(id) { return /^[A-Za-z0-9_-]{1,128}$/.test(String(id || '')); }
function rid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
const SETTINGS = 'playbook_meta/settings';
const PLAYER_ACTIONS = new Set(['login', 'plays', 'view', 'ask', 'questions', 'quiz_result', 'board']);
const QUESTION_MAX = 500;

let settingsMemo = null;   // per warm instance, 5 seconds: every player request checks `open`
async function loadSettings() {
  if (settingsMemo && Date.now() - settingsMemo.at < 5000) return settingsMemo.v;
  const v = await loadSettingsNow(); settingsMemo = { at: Date.now(), v }; return v;
}
const shareOk = (v) => typeof v === 'string' && /^[a-z0-9]{12,32}$/.test(v);
async function loadSettingsNow() { const s = await fsGet(SETTINGS);
  const shares = {}; for (const [g, v] of Object.entries((s && s.attitude_shares) || {})) if (cleanGroup(g) && shareOk(v)) shares[cleanGroup(g)] = v;
  return { open: !s || s.open !== false, attitude_share: shareOk(s && s.attitude_share) ? s.attitude_share : '', attitude_shares: shares, feeds: cleanFeeds(s && s.feeds), feed_alerts: !!(s && s.feed_alerts), feed_last: (s && s.feed_last) || null,
    assistant_hash: (s && typeof s.assistant_hash === 'string' && /^[a-f0-9]{64}$/.test(s.assistant_hash)) ? s.assistant_hash : '',
    teams: [...new Set((Array.isArray(s && s.teams) ? s.teams : []).map(cleanGroup).filter(Boolean))].slice(0, 12) }; }
// Upcoming events from the group's calendar feed, cached per warm instance for 10 minutes.
const feedCache = new Map();
async function upcomingFor(feeds, group) {
  // a group's own feed, else the feed for everyone; never another group's calendar
  const f = feeds.find((x) => x.group && group && x.group.toLowerCase() === group.toLowerCase()) || feeds.find((x) => !x.group);
  if (!f) return { events: [], url: '' };
  const hit = feedCache.get(f.url);
  if (hit && Date.now() - hit.at < 6e5) return { events: hit.events, url: f.url };
  try {
    const r = await fetch(f.url, { headers: { 'User-Agent': 'aces-playbook' }, signal: AbortSignal.timeout(4000) });   // a slow calendar host must not stall the playbook
    const text = r.ok ? (await r.text()).slice(0, 2e6) : '';
    const events = parseIcs(text);
    feedCache.set(f.url, { at: Date.now(), events });
    return { events, url: f.url };
  } catch (e) { return { events: hit ? hit.events : [], url: f.url }; }
}
async function loadPlays() { return (await fsList('playbook_plays')).filter((p) => p.site === SITE_TAG); }
async function loadPlayers() { return (await fsList('playbook_players')).filter((p) => p.site === SITE_TAG && !p.removed); }
async function loadSite(coll) { return (await fsList(coll)).filter((x) => x.site === SITE_TAG); }
const today = () => new Date(Date.now() - 5 * 36e5).toISOString().slice(0, 10);   // Eastern-ish day boundary
// The game plan players should see now: the soonest dated one on or after today, else the latest.
function currentPlan(plans) {
  const vis = plans.filter((p) => p.visible);
  const t = today();
  const up = vis.filter((p) => p.date && p.date >= t).sort((a, b) => a.date.localeCompare(b.date));
  if (up.length) return up[0];
  return vis.sort((a, b) => String(b.date || b.updated).localeCompare(String(a.date || a.updated)))[0] || null;
}
function currentPractice(list) {
  const t = today();
  return list.filter((p) => p.show_players && p.date >= t).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}
function publicPlan(p, byId) {
  return { id: p.id, opponent: p.opponent, date: p.date || '', title: p.title || '', group: p.group || '', where: p.where || '', keys: p.keys || [], things: p.things || [], our_plays: p.our_plays || [], their_plays: p.their_plays || [],
    matchups: (p.matchups || []).map((m) => ({ us: m.us && byId[m.us] ? { id: m.us, name: byId[m.us].name } : null, them: m.them, note: m.note })),
    personnel: p.personnel || [], notes: p.notes || '', quiz: p.quiz || [] };
}
function publicGame(g) { return { id: g.id, date: g.date, opponent: g.opponent, group: g.group || '', where: g.where || '', us: g.us || 0, them: g.them || 0, kind: g.kind || 'game', lines: g.lines || [] }; }
function publicPractice(p) { return { id: p.id, date: p.date, title: p.title || '', group: p.group || '', start: p.start || '', focus: p.focus || '', blocks: (p.blocks || []).map((b) => ({ name: b.name, minutes: b.minutes, category: b.category || '', play_ids: b.play_ids || [], stations: b.stations || [] })) }; }
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
  return { id: p.id, name: p.name, kind: p.kind || 'ours', opponent: p.opponent || '', category: p.category, court: p.court, notes: p.notes || '', tips: p.tips || [], due: p.due || '', marks: p.marks || [], signal: p.signal || { call: '', photo: '' }, situations: p.situations || [], reads: p.reads || [], audio: p.audio || null, lineup, clip: p.clip || null, clip_link: p.clip_link || '', frames: p.frames || [], updated: p.updated || p.created || '' };
}
let boardMemo = null; const playMemo = new Map();   // per warm instance, for the Board polling
// Quizzes that are not about one play: scored under a fixed id in playbook_quiz.
const SPECIAL_QUIZ = { signals: 'Sideline signals', terms: 'Team glossary', whereami: 'Where am I drill', reads: 'Read the defense' };
// Tonight's plays: the coach stars a handful before a game, players see them on top.
function cleanTonight(t) {
  t = t && typeof t === 'object' ? t : {};
  const play_ids = [...new Set((Array.isArray(t.play_ids) ? t.play_ids : []).filter(safeId))].slice(0, 12);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(t.date || '')) ? String(t.date) : '';
  return { on: !!t.on && play_ids.length > 0, play_ids, label: String(t.label || '').replace(/<[^>]*>/g, '').trim().slice(0, 80), date };
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
const who = (pl) => ({ id: pl.id, name: pl.name, group: pl.group || '', num: pl.num || '' });

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
    const ids = new Set(plays.map((p) => p.id));
    let [plans, practices, vsum, quiz, games, termsRaw, endgameRaw, goalsRaw] = await Promise.all([
      loadSite('playbook_plans'), loadSite('playbook_practices'),
      fsGet(`playbook_vsum/${player.id}`), fsQuery('playbook_quiz', 'player_id', 'EQUAL', player.id),
      loadSite('playbook_games'),
      loadSite('playbook_terms'), fsGet('playbook_meta/endgame'), fsGet('playbook_meta/goals'),
    ]);
    const tonightRaw = cleanTonight(await fsGet('playbook_meta/tonight'));
    const tonight = tonightRaw.on ? Object.assign({}, tonightRaw, { play_ids: tonightRaw.play_ids.filter((id) => ids.has(id)) }) : null;
    // glossary + end of game tree, with play links limited to plays this player can see
    // a team's plans, practices and games go to that team; untagged ones go to everyone
    const forTeam = (x) => !x.group || x.group === (player.group || '');
    plans = plans.filter(forTeam); practices = practices.filter(forTeam); games = games.filter(forTeam);
    const terms = termsRaw.map((t) => ({ id: t.id, term: t.term, means: t.means, kind: t.kind || 'other', play_id: ids.has(t.play_id) ? t.play_id : '' })).sort((a, b) => a.term.localeCompare(b.term));
    const egLeaves = cleanEndgame(endgameRaw && endgameRaw.leaves);
    for (const k of Object.keys(egLeaves)) egLeaves[k].play_ids = egLeaves[k].play_ids.filter((id) => ids.has(id));
    const plan = currentPlan(plans);
    const practice = currentPractice(practices);
    const best = {};
    const planIds = new Set(plans.filter((x) => x.visible).map((x) => 'prep_' + x.id));
    quiz.forEach((q) => { if ((ids.has(q.play_id) || Object.hasOwn(SPECIAL_QUIZ, String(q.play_id)) || planIds.has(q.play_id) || (/^reads_/.test(String(q.play_id)) && ids.has(String(q.play_id).slice(6)))) && (best[q.play_id] == null || q.pct > best[q.play_id])) best[q.play_id] = q.pct; });
    const done = { viewed: Object.keys((vsum && vsum.plays) || {}).filter((id) => ids.has(id)), quiz: best };
    const settings = await loadSettings();
    const visiblePlans = plans.filter((p) => p.visible).map((p) => publicPlan(p, byId)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    games.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const cal = await upcomingFor(settings.feeds, player.group || '');
    return { status: 200, body: { player: who(player), plays, plan: plan ? publicPlan(plan, byId) : null, plans: visiblePlans, practice: practice ? publicPractice(practice) : null, games: games.map(publicGame), done, attitude_share: (settings.attitude_shares || {})[player.group || ''] || settings.attitude_share, notices: await recentNotices(), upcoming: cal.events, calendar_url: cal.url, terms, endgame: egLeaves, goals: cleanGoals(goalsRaw && goalsRaw.goals), tonight } };
  }
  if (action === 'board') {   // what coach has on the Board right now (players' phones follow it)
    let b = boardMemo && Date.now() - boardMemo.at < 3000 ? boardMemo.v : null;
    if (!b) { b = (await fsGet('playbook_meta/board')) || { on: false }; boardMemo = { at: Date.now(), v: b }; }
    const fresh = b && b.on && Date.parse(b.updated || '') > Date.now() - 2 * 36e5;
    if (!fresh) return { status: 200, body: { on: false } };
    let play = playMemo.get(b.play_id);
    if (!play || Date.now() - play.at > 15000) { play = { at: Date.now(), v: b.play_id ? await fsGet(`playbook_plays/${b.play_id}`) : null }; playMemo.set(b.play_id, play); }
    play = play.v;
    if (!play || play.site !== SITE_TAG || !canSee(play, player)) return { status: 200, body: { on: false } };
    return { status: 200, body: { on: true, id: play.id, name: play.name, step: typeof b.step === 'number' ? b.step : null, updated: b.updated } };
  }
  if (action === 'view') {
    if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
    const play = await fsGet(`playbook_plays/${body.id}`);
    if (!play || play.site !== SITE_TAG || !canSee(play, player)) return { status: 404, body: { error: 'not_found' } };
    // One log row per player, play and 10 minutes: replaying a play doesn't flood the log.
    const now = Date.now();
    const docId = `${player.id}_${play.id}_${Math.floor(now / 6e5)}`;
    const created = await fsCreate('playbook_views', {
      site: SITE_TAG, player_id: player.id, player_name: player.name, group: player.group || '',
      play_id: play.id, play_name: play.name, at: new Date(now).toISOString(),
      device: String(req.headers['user-agent'] || '').slice(0, 160),
    }, docId);
    await fsPatch(`playbook_players/${player.id}`, { last_seen: new Date(now).toISOString() });
    if (created && created.error) return { status: 200, body: { ok: true } };   // same play inside 10 minutes: already counted
    // Per-player summary: totals per play plus the newest 80 openings. The coach's lists read these
    // (one doc per player) instead of the whole view log, which grows all season.
    const at = new Date(now).toISOString(), device = String(req.headers['user-agent'] || '').slice(0, 160);
    const sum = (await fsGet(`playbook_vsum/${player.id}`)) || null;
    const plays = Object.assign({}, (sum && sum.plays) || {}); plays[play.id] = (plays[play.id] || 0) + 1;
    const recent = [{ play_id: play.id, play_name: play.name, at, device }].concat((sum && sum.recent) || []).slice(0, 80);
    const doc = { site: SITE_TAG, player_id: player.id, player_name: player.name, group: player.group || '', n: ((sum && sum.n) || 0) + 1, plays, recent, last_at: at, last_play: play.name };
    if (sum) await fsPatch(`playbook_vsum/${player.id}`, doc); else await fsCreate('playbook_vsum', doc, player.id);
    return { status: 200, body: { ok: true } };
  }
  if (action === 'quiz_result') {
    if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
    let play;
    if (Object.hasOwn(SPECIAL_QUIZ, String(body.id))) play = { id: body.id, name: SPECIAL_QUIZ[body.id] };
    else if (/^prep_[A-Za-z0-9_-]{1,128}$/.test(body.id)) {   // the opponent prep quiz on a game plan
      const plan = await fsGet(`playbook_plans/${body.id.slice(5)}`);
      if (!plan || plan.site !== SITE_TAG || !plan.visible) return { status: 404, body: { error: 'not_found' } };
      play = { id: body.id, name: 'Prep: vs ' + plan.opponent };
    } else if (/^reads_[A-Za-z0-9_-]{1,128}$/.test(body.id)) {   // "read the defense" on one play
      const base = await fsGet(`playbook_plays/${body.id.slice(6)}`);
      if (!base || base.site !== SITE_TAG || !canSee(base, player)) return { status: 404, body: { error: 'not_found' } };
      play = { id: body.id, name: 'Reads: ' + base.name };
    } else {
      play = await fsGet(`playbook_plays/${body.id}`);
      if (!play || play.site !== SITE_TAG || !canSee(play, player)) return { status: 404, body: { error: 'not_found' } };
    }
    const total = Math.max(1, Math.min(60, Math.round(Number(body.total) || 0)));
    const score = Math.max(0, Math.min(total, Math.round(Number(body.score) || 0)));
    const pct = Math.round(score / total * 100);
    const now = new Date().toISOString();
    const w = await fsCreate('playbook_quiz', { site: SITE_TAG, player_id: player.id, player_name: player.name, group: player.group || '', play_id: play.id, play_name: play.name, score, total, pct, at: now }, rid('qz'));
    if (w.error) return { status: 502, body: { error: 'save_failed' } };
    return { status: 200, body: { ok: true, pct } };
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

// ── Weekly digest (Sunday night email to the coach; also the send_digest action) ──
function fmtD(d) { if (!d) return ''; const x = new Date(d + 'T12:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
export function buildDigest(d, nowMs = Date.now()) {
  const week = nowMs - 7 * 864e5, soon = nowMs + 7 * 864e5;
  const ours = d.plays.filter((p) => !p.archived && p.visible !== false && (p.kind || 'ours') === 'ours');
  const active = d.players.filter((p) => p.active !== false);
  const sees = (pl, play) => !(play.groups || []).length || (play.groups || []).includes(pl.group || '');
  const opened = {}; d.views.forEach((v) => { if (Date.parse(v.at || '') >= week) (opened[v.player_id] = opened[v.player_id] || new Set()).add(v.play_id); });
  const studied = active.filter((p) => opened[p.id]).map((p) => ({ name: p.name, n: opened[p.id].size })).sort((a, b) => b.n - a.n);
  const idle = active.filter((p) => !opened[p.id]).map((p) => p.name);
  const qz = d.quiz.filter((q) => Date.parse(q.at || '') >= week);
  const avg = qz.length ? Math.round(qz.reduce((a, q) => a + (q.pct || 0), 0) / qz.length) : null;
  const best = {}; d.quiz.forEach((q) => { const k = q.player_id + '|' + q.play_id; if (best[k] == null || q.pct > best[k]) best[k] = q.pct; });
  const due = ours.filter((p) => p.due && Date.parse(p.due + 'T12:00:00') >= nowMs - 864e5 && Date.parse(p.due + 'T12:00:00') <= soon).sort((a, b) => a.due.localeCompare(b.due))
    .map((p) => { const who = active.filter((pl) => sees(pl, p)); const passed = who.filter((pl) => best[pl.id + '|' + p.id] >= 80); return { name: p.name, due: p.due, passed: passed.length, of: who.length, missing: who.filter((pl) => !(best[pl.id + '|' + p.id] >= 80)).map((pl) => pl.name) }; });
  const open = d.questions.filter((q) => !q.answer && !q.hidden);
  const games = d.games.filter((g) => Date.parse(g.updated || g.created || '') >= week);
  const events = (d.upcoming || []).filter((e) => Date.parse(e.at) <= soon);
  const calls = (d.calls || []).filter((c) => Date.parse(c.at || '') >= week);
  const lines = [];
  lines.push(`Studied this week: ${studied.length} of ${active.length} players` + (studied.length ? ' (' + studied.slice(0, 6).map((x) => `${x.name} ${x.n}`).join(', ') + (studied.length > 6 ? ', ...' : '') + ')' : ''));
  if (idle.length) lines.push(`Did not open the playbook: ${idle.join(', ')}`);
  lines.push(`Quizzes: ${qz.length} taken` + (avg != null ? `, team average ${avg}%` : ''));
  due.forEach((x) => lines.push(`Must know by ${fmtD(x.due)}: ${x.name}, ${x.passed} of ${x.of} passed` + (x.missing.length ? ` (still owe it: ${x.missing.slice(0, 8).join(', ')}${x.missing.length > 8 ? ', ...' : ''})` : '')));
  if (open.length) lines.push(`Questions waiting on you: ${open.length}` + ' (' + open.slice(0, 3).map((q) => `${q.player_name}: ${String(q.text || '').slice(0, 60)}`).join(' | ') + ')');
  if (games.length) lines.push(`Box scores added: ${games.map((g) => `${g.opponent} ${g.us}-${g.them}`).join(', ')}`);
  if (calls.length) { const sc = calls.filter((c) => c.result === 'score').length; lines.push(`Bench calls logged: ${calls.length}, scored on ${sc}`); }
  if (events.length) lines.push(`This week: ${events.map((e) => `${fmtD(e.at.slice(0, 10))} ${e.title}`).join('; ')}`);
  const row = (t) => `<li style="margin:0 0 8px">${esc(t)}</li>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222"><div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#777">Aces playbook · week ending ${esc(new Date(nowMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}</div><h2 style="margin:4px 0 14px;color:#840036">Who studied, what's due, what's waiting</h2><ul style="padding-left:18px;font-size:15px;line-height:1.45">${lines.map(row).join('')}</ul><p style="margin-top:18px"><a href="${esc(d.base)}/playbook-admin.html#activity" style="color:#840036;font-weight:bold">Open Who's studying</a></p><p style="color:#888;font-size:12px">Sent every Sunday night from the team playbook.</p></div>`;
  return { subject: `Aces playbook: ${studied.length} of ${active.length} studied, ${open.length} question${open.length === 1 ? '' : 's'} waiting`, html, text: lines.join('\n') };
}
export async function sendDigest() {
  if (!emailConfigured() || !ADMIN_EMAIL) return { ok: false, error: 'email_not_configured' };
  const [plays, players, vsumRows, quiz, questions, games, calls, settings] = await Promise.all([loadPlays(), loadPlayers(), loadSite('playbook_vsum'), loadSite('playbook_quiz'), loadQuestions(), loadSite('playbook_games'), loadSite('playbook_calls'), loadSettings()]);
  const views = []; vsumRows.forEach((r) => (r.recent || []).forEach((v) => views.push({ player_id: r.player_id, play_id: v.play_id, at: v.at })));
  const cal = await upcomingFor(settings.feeds, '');
  const m = buildDigest({ plays, players, views, quiz, questions, games, calls, upcoming: cal.events, base: process.env.SITE_URL ? String(process.env.SITE_URL).replace(/\/+$/, '') : 'https://aces-basketball.vercel.app' });
  const ok = await sendMail({ to: ADMIN_EMAIL, subject: m.subject, html: m.html, text: m.text }).catch(() => false);
  return ok ? { ok: true, sent: ADMIN_EMAIL } : { ok: false, error: 'send_failed' };
}

// ── Coach side ───────────────────────────────────────────────────────────
async function adminList() {
  const [plays, players, vsumRows, settings, questions, quiz, plans, practices, notes, drills, games, terms, endgameRaw, calls, goalsRaw, lineupsRaw] = await Promise.all([
    loadPlays(), loadPlayers(), loadSite('playbook_vsum'), loadSettings(), loadQuestions(),
    loadSite('playbook_quiz'), loadSite('playbook_plans'), loadSite('playbook_practices'), loadSite('playbook_notes'), loadSite('playbook_drills'), loadSite('playbook_games'),
    loadSite('playbook_terms'), fsGet('playbook_meta/endgame'), loadSite('playbook_calls'), fsGet('playbook_meta/goals'), fsGet('playbook_meta/lineups'),
  ]);
  games.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  // views = the newest openings across the roster (for the log and this-week counts); vsum = totals per player
  const vsum = {}; const views = [];
  vsumRows.forEach((r) => { vsum[r.player_id] = { n: r.n || 0, plays: r.plays || {}, last_at: r.last_at || '', last_play: r.last_play || '' }; (r.recent || []).forEach((v) => views.push({ player_id: r.player_id, player_name: r.player_name, group: r.group || '', play_id: v.play_id, play_name: v.play_name, at: v.at, device: v.device || '' })); });
  views.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  questions.sort((a, b) => String(b.created).localeCompare(String(a.created)));
  quiz.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  plans.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  practices.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  notes.sort((a, b) => String(b.date + b.created).localeCompare(String(a.date + a.created)));
  return { status: 200, body: { settings: publicSettings(settings), plays: plays.sort(sortPlays), players: players.sort((a, b) => String(a.name).localeCompare(String(b.name))), views, vsum, questions, quiz: quiz.slice(0, 6000), plans, practices, notes, drills, games, terms: terms.sort((a, b) => String(a.term).localeCompare(String(b.term))), endgame: cleanEndgame(endgameRaw && endgameRaw.leaves), calls: calls.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 2000), goals: cleanGoals(goalsRaw && goalsRaw.goals), lineups: cleanLineups(lineupsRaw && lineupsRaw.lineups), tonight: cleanTonight(await fsGet('playbook_meta/tonight')) } };
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
        if (cur.audio && cur.audio.url && (!r.play.audio || r.play.audio.url !== cur.audio.url)) await dropClip(cur.audio);
        if (cur.signal && cur.signal.photo && (!r.play.signal || r.play.signal.photo !== cur.signal.photo)) await dropClip({ url: cur.signal.photo });
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
        .map((p) => ({ name: cleanName(p && p.name, LIMITS.playerName), group: cleanGroup(p && p.group), num: clip(stripTags(String((p && p.num) || '').trim()), 3) })).filter((p) => p.name);
      if (!list.length) return { status: 400, body: { error: 'missing_name' } };
      const added = [];
      for (const p of list) {
        const id = rid('pbp');
        const code = await uniqueCode();
        const w = await fsCreate('playbook_players', { site: SITE_TAG, name: p.name, group: p.group, num: p.num, code, active: true, removed: false, created: now }, id);
        if (w.error) return { status: 502, body: { error: 'save_failed', added } };
        added.push({ id, name: p.name, group: p.group, num: p.num, code });
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
        if (body.num !== undefined) patch.num = clip(stripTags(String(body.num || '').trim()), 3);
        if (body.active !== undefined) patch.active = !!body.active;
        if (body.report_note !== undefined) patch.report_note = clip(stripTags(String(body.report_note || '').trim()), 600);
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
    case 'save_plan': case 'save_practice': {
      const r = action === 'save_plan' ? cleanPlan(body.plan) : cleanPractice(body.practice);
      if (r.error) return { status: 400, body: { error: r.error } };
      const coll = action === 'save_plan' ? 'playbook_plans' : 'playbook_practices';
      const doc = r.plan || r.practice;
      if (body.id) {
        if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
        const cur = await fsGet(`${coll}/${body.id}`);
        if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
        const w = await fsPatchVerified(`${coll}/${body.id}`, Object.assign({}, doc, { updated: now }));
        return w.ok ? { status: 200, body: { ok: true, id: body.id } } : { status: 502, body: { error: 'save_failed' } };
      }
      const id = rid(action === 'save_plan' ? 'plan' : 'prac');
      const w = await fsCreate(coll, Object.assign({}, doc, { site: SITE_TAG, created: now, updated: now }), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'set_endgame': {   // the end of game decision tree, see ENDGAME_LEAVES
      const leaves = cleanEndgame(body.leaves);
      const cur = await fsGet('playbook_meta/endgame');
      const w = cur ? await fsPatchVerified('playbook_meta/endgame', { leaves, updated: now }) : await fsCreate('playbook_meta', { site: SITE_TAG, leaves, updated: now }, 'endgame');
      return (w.ok || (!cur && !w.error)) ? { status: 200, body: { ok: true, leaves } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'log_call': {   // bench call log: what we ran and what came of it
      const r = cleanCall(body.call);
      if (r.error) return { status: 400, body: { error: r.error } };
      const play = await fsGet(`playbook_plays/${r.call.play_id}`);
      if (!play || play.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      const id = rid('call');
      const w = await fsCreate('playbook_calls', Object.assign({}, r.call, { play_name: play.name, site: SITE_TAG, at: now }), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'set_tonight': {   // tonight's plays: the starred list players see on top of the playbook
      const t = cleanTonight(body.tonight);
      const cur = await fsGet('playbook_meta/tonight');
      const doc = Object.assign({}, t, { updated: now });
      const w = cur ? await fsPatchVerified('playbook_meta/tonight', doc) : await fsCreate('playbook_meta', Object.assign({ site: SITE_TAG }, doc), 'tonight');
      return (w.ok || (!cur && !w.error)) ? { status: 200, body: { ok: true, tonight: t } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_board': {   // the Board: which play is up, and the step it is held on (null = looping)
      const on = body.on !== false;
      const play_id = on && safeId(body.id) ? body.id : '';
      if (on) { const play = play_id ? await fsGet(`playbook_plays/${play_id}`) : null; if (!play || play.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } }; }
      const step = Number.isInteger(body.step) && body.step >= 0 && body.step < 60 ? body.step : null;
      const cur = await fsGet('playbook_meta/board');
      const doc = { on: on && !!play_id, play_id, step, updated: now };
      boardMemo = null;
      const w = cur ? await fsPatchVerified('playbook_meta/board', doc) : await fsCreate('playbook_meta', Object.assign({ site: SITE_TAG }, doc), 'board');
      return (w.ok || (!cur && !w.error)) ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_goals': {   // season goals, see GOAL_METRICS
      const goals = cleanGoals(body.goals);
      const cur = await fsGet('playbook_meta/goals');
      const w = cur ? await fsPatchVerified('playbook_meta/goals', { goals, updated: now }) : await fsCreate('playbook_meta', { site: SITE_TAG, goals, updated: now }, 'goals');
      return (w.ok || (!cur && !w.error)) ? { status: 200, body: { ok: true, goals } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_lineups': {   // saved lineups for the play editor, see cleanLineups
      const lineups = cleanLineups(body.lineups);
      const cur = await fsGet('playbook_meta/lineups');
      const w = cur ? await fsPatchVerified('playbook_meta/lineups', { lineups, updated: now }) : await fsCreate('playbook_meta', { site: SITE_TAG, lineups, updated: now }, 'lineups');
      return (w.ok || (!cur && !w.error)) ? { status: 200, body: { ok: true, lineups } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'send_digest': {   // the Sunday email, on demand
      const r = await sendDigest();
      return r.ok ? { status: 200, body: { ok: true, sent: r.sent } } : { status: 502, body: { error: r.error || 'send_failed' } };
    }
    case 'save_term': {
      const r = cleanTerm(body.term);
      if (r.error) return { status: 400, body: { error: r.error } };
      if (body.id) {
        if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
        const cur = await fsGet(`playbook_terms/${body.id}`);
        if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
        const w = await fsPatchVerified(`playbook_terms/${body.id}`, Object.assign({}, r.term, { updated: now }));
        return w.ok ? { status: 200, body: { ok: true, id: body.id } } : { status: 502, body: { error: 'save_failed' } };
      }
      const id = rid('term');
      const w = await fsCreate('playbook_terms', Object.assign({}, r.term, { site: SITE_TAG, created: now, updated: now }), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'save_drill': {
      const r = cleanDrill(body.drill);
      if (r.error) return { status: 400, body: { error: r.error } };
      if (body.id) {
        if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
        const cur = await fsGet(`playbook_drills/${body.id}`);
        if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
        const w = await fsPatchVerified(`playbook_drills/${body.id}`, Object.assign({}, r.drill, { updated: now }));
        return w.ok ? { status: 200, body: { ok: true, id: body.id } } : { status: 502, body: { error: 'save_failed' } };
      }
      const id = rid('drill');
      const w = await fsCreate('playbook_drills', Object.assign({}, r.drill, { site: SITE_TAG, created: now, updated: now }), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'save_game': {
      const r = cleanGame(body.game);
      if (r.error) return { status: 400, body: { error: r.error } };
      if (body.id) {
        if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
        const cur = await fsGet(`playbook_games/${body.id}`);
        if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
        const w = await fsPatchVerified(`playbook_games/${body.id}`, Object.assign({}, r.game, { updated: now }));
        return w.ok ? { status: 200, body: { ok: true, id: body.id } } : { status: 502, body: { error: 'save_failed' } };
      }
      const id = rid('game');
      const w = await fsCreate('playbook_games', Object.assign({}, r.game, { site: SITE_TAG, created: now, updated: now }), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'delete_plan': case 'delete_practice': case 'delete_note': case 'delete_drill': case 'delete_game': case 'delete_term': case 'delete_call': {
      if (!safeId(body.id)) return { status: 400, body: { error: 'bad_id' } };
      const coll = action === 'delete_plan' ? 'playbook_plans' : action === 'delete_practice' ? 'playbook_practices' : action === 'delete_drill' ? 'playbook_drills' : action === 'delete_game' ? 'playbook_games' : action === 'delete_term' ? 'playbook_terms' : action === 'delete_call' ? 'playbook_calls' : 'playbook_notes';
      const cur = await fsGet(`${coll}/${body.id}`);
      if (!cur || cur.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      const w = await fsDelete(`${coll}/${body.id}`);
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'add_note': {
      if (!safeId(body.player_id)) return { status: 400, body: { error: 'bad_id' } };
      const pl = await fsGet(`playbook_players/${body.player_id}`);
      if (!pl || pl.site !== SITE_TAG) return { status: 404, body: { error: 'not_found' } };
      const r = cleanNote(body.note);
      if (r.error) return { status: 400, body: { error: r.error } };
      const id = rid('note');
      const w = await fsCreate('playbook_notes', Object.assign({ site: SITE_TAG, player_id: pl.id, player_name: pl.name, created: now }, r.note), id);
      return w.error ? { status: 502, body: { error: 'save_failed' } } : { status: 200, body: { ok: true, id } };
    }
    case 'scout_report': {
      // The coaches' scouting report (api/scouting.js) for this opponent, trimmed to what a
      // game plan can use. Players never call this; the coach decides what to carry over.
      const slug = scoutSlug(body.opponent || '');
      if (!slug) return { status: 400, body: { error: 'missing_opponent' } };
      const r = await fsGet(`scouting_reports/${SITE_TAG}_${slug}`);
      if (!r) return { status: 404, body: { error: 'no_report' } };
      return { status: 200, body: { report: { opp: r.opp || body.opponent, keys: r.keys || [], matchups: r.matchups || [], personnel: r.personnel || [], plan: r.plan || '', overview: r.overview || '', updated_at: r.updated_at || '', updated_by: r.updated_by || '' } } };
    }
    case 'set_feeds': {   // calendar feeds per group, see cleanFeeds
      const feeds = cleanFeeds(body.feeds);
      const w = await fsPatchVerified(SETTINGS, { feeds, updated: now });
      feedCache.clear(); settingsMemo = null;
      return w.ok ? { status: 200, body: { ok: true, feeds } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_feed_alerts': {   // email alert subscribers when a feed changes (the home screen card is always on)
      const w = await fsPatchVerified(SETTINGS, { feed_alerts: !!body.on, updated: now });
      settingsMemo = null;
      return w.ok ? { status: 200, body: { ok: true, on: !!body.on } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'feed_check': {   // run the watcher right now and report what it saw
      const r = await runFeedWatch();
      return { status: 200, body: r };
    }
    case 'test_feed': {   // fetch a feed once so the coach sees it works
      const feeds = cleanFeeds([{ group: '', url: body.url }]);
      if (!feeds.length) return { status: 400, body: { error: 'bad_url' } };
      feedCache.delete(feeds[0].url);
      const cal = await upcomingFor(feeds, '');
      return { status: 200, body: { events: cal.events } };
    }
    case 'set_attitude': { settingsMemo = null;   // the Attitude Board read-only share id, shown to players as the Hustle tab (one per team, or one for all)
      const v = String(body.share || '').trim().toLowerCase();
      if (v && !/^[a-z0-9]{12,32}$/.test(v)) return { status: 400, body: { error: 'bad_share' } };
      const group = cleanGroup(body.group);
      let patch = { attitude_share: v, updated: now };
      if (group) { const cur = await loadSettingsNow(); const shares = Object.assign({}, cur.attitude_shares); if (v) shares[group] = v; else delete shares[group]; patch = { attitude_shares: shares, updated: now }; }
      const w = await fsPatchVerified(SETTINGS, patch);
      return w.ok ? { status: 200, body: { ok: true } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_assistant': { settingsMemo = null;   // a second code for assistants (bench, scorer, notes; no editing the book). Empty clears it.
      const code = String(body.code || '').trim();
      if (code && code.length < 6) return { status: 400, body: { error: 'short_code' } };
      if (code && ctEq(code, process.env.ADMIN_PASSWORD || '')) return { status: 400, body: { error: 'same_code' } };
      const w = await fsPatchVerified(SETTINGS, { assistant_hash: code ? assistantHash(code) : '', updated: now });
      return w.ok ? { status: 200, body: { ok: true, set: !!code } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_teams': { settingsMemo = null;   // the program's teams (Varsity, JV, 14U...). Players' groups and play visibility use the same names.
      const teams = [...new Set((Array.isArray(body.teams) ? body.teams : []).map(cleanGroup).filter(Boolean))].slice(0, 12);
      const w = await fsPatchVerified(SETTINGS, { teams, updated: now });
      return w.ok ? { status: 200, body: { ok: true, teams } } : { status: 502, body: { error: 'save_failed' } };
    }
    case 'set_open': { settingsMemo = null;
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
    else {
      const role = await roleOf(req);
      if (!role) r = { status: 401, body: { error: 'unauthorized' } };
      else if (role === 'assistant' && !ASSISTANT_ACTIONS.has(action)) r = { status: 403, body: { error: 'coaches_only' } };
      else { r = await adminAction(action, body); if (action === 'admin_list' && r.body) r.body.role = role; }
    }
    return res.status(r.status).json(r.body);
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
}


/* ================================================================
   Schedule change watch (cron api/playbook-feedwatch.js, admin action feed_check)
   Snapshot of each feed's next 14 days in playbook_meta/feedsnap; changes become a
   card on every player's home screen (playbook_meta/notices) and, when Settings has
   "email schedule changes" on, an email to /api/alerts subscribers of that group.
================================================================ */
import { createHash as _fwHash, createHmac as _fwHmac } from 'node:crypto';
import { windowEvents as fwWindow, diffEvents as fwDiff, hasChanges as fwHas, describeChanges as fwDescribe, teamsForGroup as fwTeams, changeEmail as fwEmail } from './_feedwatch.js';
const FEEDSNAP = 'playbook_meta/feedsnap';
const NOTICES = 'playbook_meta/notices';
const FW_TEAMS = ['Varsity', 'JV', '9th Grade'];
let noticesMemo = null;
export async function recentNotices() {
  if (noticesMemo && Date.now() - noticesMemo.at < 60000) return noticesMemo.v;
  const d = await fsGet(NOTICES).catch(() => null);
  const cut = Date.now() - 14 * 86400000;
  const v = ((d && Array.isArray(d.list)) ? d.list : []).filter((n) => n && Date.parse(n.ts) > cut).slice(0, 5)
    .map((n) => ({ id: String(n.id || ''), ts: String(n.ts || ''), group: String(n.group || ''), lines: (Array.isArray(n.lines) ? n.lines : []).map((l) => String(l).slice(0, 200)).slice(0, 12) }));
  noticesMemo = { at: Date.now(), v };
  return v;
}
async function fetchFeedText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'playbook-feedwatch/1' } });
    if (!r.ok) throw new Error('http_' + r.status);
    const text = await r.text();
    if (text.length > 2000000) throw new Error('too_big');
    return text;
  } finally { clearTimeout(t); }
}
function siteBase() {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return 'https://aces-basketball.vercel.app';
}
function alertsKeyLocal() {
  const base = process.env.NEWSLETTER_SECRET || process.env.SENDGRID_API_KEY || '';
  return process.env.ALERTS_KEY || (base ? _fwHmac('sha256', base).update('aces-schedule-alerts-v1').digest('base64url').slice(0, 32) : '');
}
export async function runFeedWatch() {
  const settings = await loadSettingsNow();
  const feeds = settings.feeds || [];
  const now = Date.now();
  if (!feeds.length) return { ok: true, checked: 0, changes: [], note: 'no_feeds' };
  const snap = (await fsGet(FEEDSNAP).catch(() => null)) || {};
  const nextSnap = {};
  const changes = [], errors = [];
  for (const f of feeds) {
    const key = 'f' + _fwHash('sha1').update(f.url).digest('hex').slice(0, 16);
    let events;
    try { events = fwWindow(parseIcs(await fetchFeedText(f.url)), now, 14); }
    catch (e) { errors.push({ group: f.group, error: String(e && e.message || e).slice(0, 60) }); if (snap[key]) nextSnap[key] = snap[key]; continue; }
    const prev = snap[key];
    nextSnap[key] = { group: f.group, events, at: new Date(now).toISOString() };
    if (!prev || !Array.isArray(prev.events)) continue; // first look: remember it, alert nobody
    const diff = fwDiff(prev.events, events);
    if (fwHas(diff)) changes.push({ group: f.group, lines: fwDescribe(diff) });
  }
  await fsPatchVerified(FEEDSNAP, nextSnap).catch(() => {});
  let emailed = 0;
  if (changes.length) {
    const cur = (await fsGet(NOTICES).catch(() => null)) || {};
    const list = (Array.isArray(cur.list) ? cur.list : []).slice(0, 11);
    const fresh = changes.map((c, i) => ({ id: 'n' + now.toString(36) + i, ts: new Date(now).toISOString(), group: c.group, lines: c.lines }));
    await fsPatchVerified(NOTICES, { list: fresh.concat(list), updated: now }).catch(() => {});
    noticesMemo = null;
    if (settings.feed_alerts) {
      const key = alertsKeyLocal();
      const base = siteBase();
      for (const c of changes) {
        const mail = fwEmail({ group: c.group, lines: c.lines, siteUrl: base, teamName: process.env.TEAM_NAME || 'Aces' });
        const skip = [];
        for (const team of fwTeams(c.group, FW_TEAMS)) {
          try {
            const r = await fetch(base + '/api/alerts', { method: 'POST', headers: { 'content-type': 'application/json', 'x-alerts-key': key }, body: JSON.stringify({ action: 'notify', team, subject: mail.subject, html: mail.html, text: mail.text, skip }) });
            const j = await r.json().catch(() => ({}));
            if (r.ok) { emailed += Number(j.sent || 0); (j.to || []).forEach((e) => skip.push(e)); }
          } catch (e) { /* mail is best effort; the home screen card already went out */ }
        }
      }
    }
  }
  await fsPatchVerified(SETTINGS, { feed_last: { at: new Date(now).toISOString(), checked: feeds.length, changes: changes.length, emailed, errors } }).catch(() => {});
  settingsMemo = null;
  return { ok: true, checked: feeds.length, changes, emailed, errors };
}
