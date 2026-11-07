// Offline tests for the Team Playbook: play validation, signed player sessions, and the
// real /api/playbook handler end to end against the in-memory Firestore fake. Zero network.
// Run: npm test   (or: node tests/playbook.test.mjs)

import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import { toFirestore } from '../api/_firestore.js';
import { SITE_TAG } from '../api/_site.js';
import { cleanPlay, cleanClip, cleanClipLink, cleanPlan, cleanPractice, cleanDrill, cleanNote, cleanGame, cleanPhoto, cleanDate, cleanFeeds, parseIcs, cleanEndgame, cleanTerm, SITUATION_KEYS, canSee, signSession, readSession, sessionMatches, normCode, newCode } from '../api/_playbook.js';
import playbook from '../api/playbook.js';

fake.install();

let pass = 0, fail = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => fake.assertClean()).then(
    () => { pass++; console.log('  ✓', name); },
    (e) => { fail++; console.log('  ✗', name, '\n       ', String(e && e.message || e).split('\n').join('\n       ')); }
  );
}
function group(title) { fake.reset(); console.log('\n' + title); }
function mockRes() {
  const r = { statusCode: 200, body: null, headers: {} };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (j) => { r.body = j; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; return r; };
  return r;
}
async function call(body, admin) {
  const res = mockRes();
  await playbook({ method: 'POST', headers: admin ? { 'x-admin-key': process.env.ADMIN_PASSWORD } : {}, body }, res);
  return res;
}
const PLAY = {
  name: 'Horns Flare', category: 'Offense', court: 'half', visible: true, notes: 'Run vs man.',
  frames: [
    { pos: { O1: [250, 330], O2: [460, 50], O3: [40, 50], O4: [175, 205], O5: [325, 205] }, ball: 'O1' },
    { pos: { O1: [250, 330], O2: [460, 50], O3: [40, 50], O4: [175, 205], O5: [325, 205] }, ball: 'O4', note: '1 hits 4' },
    { pos: { O1: [80, 240], O2: [460, 50], O3: [40, 50], O4: [175, 205], O5: [210, 290] }, ball: 'rim', moves: { O5: { t: 'screen', c: [270, 260] } } },
  ],
};

console.log('Team Playbook');
group('validation');
await test('a clean play survives intact', () => {
  const r = cleanPlay(PLAY);
  assert.equal(r.error, undefined);
  assert.equal(r.play.frames.length, 3);
  assert.equal(r.play.frames[2].ball, 'rim');
  assert.deepEqual(r.play.frames[2].moves.O5, { t: 'screen', c: [270, 260] });
});
await test('junk is stripped or rejected', () => {
  assert.equal(cleanPlay({ name: '', frames: PLAY.frames }).error, 'missing_name');
  assert.equal(cleanPlay({ name: 'x', frames: [] }).error, 'no_frames');
  const r = cleanPlay({ name: '<b>Hi</b>', category: 'Nope', court: 'moon', frames: [{ pos: { O1: [9999, -9999], Z9: [1, 1], O2: ['a', 2] }, ball: 'X3', moves: { O1: { t: 'teleport' } } }] });
  assert.equal(r.play.name, 'bHi/b');
  assert.equal(r.play.category, 'Offense');
  assert.equal(r.play.court, 'half');
  assert.deepEqual(r.play.frames[0].pos, { O1: [550, -50] });
  assert.equal(r.play.frames[0].ball, '');
  assert.deepEqual(r.play.frames[0].moves, {});
});
await test('lineups and scouting plays are kept, junk lineups dropped', () => {
  const r = cleanPlay(Object.assign({}, PLAY, { kind: 'scout', opponent: ' Radnor ', lineup: { O1: 'pbp_a', X3: 'pbp_b', O9: 'x', O2: '../x', O3: 7 } }));
  assert.equal(r.play.kind, 'scout');
  assert.equal(r.play.opponent, 'Radnor');
  assert.deepEqual(r.play.lineup, { O1: 'pbp_a', X3: 'pbp_b' });
  assert.equal(cleanPlay(Object.assign({}, PLAY, { kind: 'scout' })).error, 'missing_opponent');
  assert.equal(cleanPlay(Object.assign({}, PLAY, { kind: 'alien' })).play.kind, 'ours');
});
await test('video clips: only our Blob store or known video sites', () => {
  const good = { url: 'https://abc123.public.blob.vercel-storage.com/playbook/clips/play_1/horns-x9Y.mp4', name: 'horns.mp4', size: 12345, type: 'video/mp4' };
  assert.equal(cleanClip(good).url, good.url);
  assert.equal(cleanClip({ url: 'https://evil.com/playbook/clips/x.mp4' }), null);
  assert.equal(cleanClip({ url: 'https://abc.public.blob.vercel-storage.com/scores/live-ev/x' }), null, 'only the playbook folder');
  assert.equal(cleanClipLink('https://youtu.be/abc'), 'https://youtu.be/abc');
  assert.equal(cleanClipLink('https://www.hudl.com/video/3/123/abc'), 'https://www.hudl.com/video/3/123/abc');
  assert.equal(cleanClipLink('http://youtu.be/abc'), '');
  assert.equal(cleanClipLink('https://example.com/v.mp4'), '');
  const r = cleanPlay(Object.assign({}, PLAY, { clip: good, clip_link: 'javascript:alert(1)' }));
  assert.equal(r.play.clip.name, 'horns.mp4');
  assert.equal(r.play.clip_link, '');
  const t = cleanPlay(Object.assign({}, PLAY, { tips: '- Sprint the first cut\n\n• <b>Fake</b> the pass\n   ' }));
  assert.deepEqual(t.play.tips, ['Sprint the first cut', 'bFake/b the pass']);
  assert.deepEqual(cleanPlay(Object.assign({}, PLAY, { tips: ['a', 'b'] })).play.tips, ['a', 'b']);
});
await test('due dates, film moments, game plans, practices and notes are cleaned', () => {
  assert.equal(cleanDate('2026-11-14'), '2026-11-14'); assert.equal(cleanDate('11/14/26'), ''); assert.equal(cleanDate('2026-13-01'), '');
  const r = cleanPlay(Object.assign({}, PLAY, { due: '2026-11-14', marks: [{ t: 134.6, text: '5 late on the screen' }, { t: 12, text: '<b>Entry</b>' }, { t: 5, text: '' }] }));
  assert.equal(r.play.due, '2026-11-14');
  assert.deepEqual(r.play.marks, [{ t: 12, text: 'bEntry/b' }, { t: 135, text: '5 late on the screen' }]);
  const pl = cleanPlan({ opponent: ' Radnor ', date: '2026-11-14', where: 'away', keys: '1. Rebound\n- Run\n\n', our_plays: ['play_a', 'play_a', '../x'], matchups: [{ us: 'pbp_1', them: '#23 Smith', note: 'deny' }, { us: '', them: '' }], personnel: [{ num: '23', name: 'Smith', notes: 'lefty', guard: 'go under' }, { name: '' }], visible: true });
  assert.equal(pl.plan.opponent, 'Radnor'); assert.deepEqual(pl.plan.keys, ['Rebound', 'Run']); assert.deepEqual(pl.plan.our_plays, ['play_a']);
  assert.equal(pl.plan.matchups.length, 1); assert.equal(pl.plan.personnel.length, 1); assert.equal(pl.plan.where, 'away');
  assert.equal(cleanPlan({ opponent: '' }).error, 'missing_opponent');
  const pr = cleanPractice({ date: '2026-11-10', start: '15:30', blocks: [{ name: 'Warmup', minutes: '10.4', play_ids: ['play_a'] }, { name: '', minutes: 5 }, { name: 'Shell', minutes: 999 }] });
  assert.equal(pr.practice.blocks.length, 2); assert.equal(pr.practice.blocks[0].minutes, 10); assert.equal(pr.practice.blocks[1].minutes, 240); assert.equal(pr.practice.start, '15:30');
  assert.equal(cleanPractice({ date: 'soon' }).error, 'missing_date');
  const pb = cleanPractice({ date: '2026-11-10', focus: 'Closeouts', blocks: [{ name: 'Shell', minutes: 15, drill: 'shell-4on4', category: 'Defense', points: ['Talk', 'Hands up', ''], stations: [{ name: 'Guards', drill: 'Two ball' }, { name: '', drill: '' }] }, { name: 'Weird', category: 'Nope', drill: '../x' }] }).practice;
  assert.equal(pb.focus, 'Closeouts'); assert.deepEqual(pb.blocks[0].points, ['Talk', 'Hands up']); assert.equal(pb.blocks[0].stations.length, 1); assert.equal(pb.blocks[1].category, 'Other'); assert.equal(pb.blocks[1].drill, 'x');
  const dr = cleanDrill({ name: ' Coach D closeout ', category: 'Defense', minutes: '12.6', points: '- Short steps\n- High hands', run: 'x' }).drill;
  assert.equal(dr.name, 'Coach D closeout'); assert.equal(dr.minutes, 13); assert.deepEqual(dr.points, ['Short steps', 'High hands']);
  assert.equal(cleanDrill({ name: '' }).error, 'missing_name');
  assert.equal(cleanNote({ kind: 'absent', text: '' }).note.kind, 'absent');
  assert.equal(cleanNote({ kind: 'note', text: '' }).error, 'empty_note');
  assert.equal(cleanNote({ kind: 'party', text: 'x', date: 'bad' }).note.kind, 'note');
});
await test('box scores: stats clamp, points and rebounds fill in, headshots only from our store', () => {
  const g = cleanGame({ date: '2026-12-05', opponent: 'Radnor', where: 'away', us: '61', them: '55', source: 'hudl', lines: [
    { player_id: 'pbp_1', name: 'Israel Ingram', num: '5', min: '28', fgm: 7, fga: 12, tpm: 2, tpa: 5, ftm: 3, fta: 4, oreb: 1, dreb: 6, ast: 4, stl: 2, blk: 0, to: 3, pf: 2 },
    { name: '', player_id: '' }, { name: 'Bench Guy', pts: '999', min: '99', reb: 3 }] });
  assert.equal(g.error, undefined);
  assert.equal(g.game.lines.length, 2);
  assert.equal(g.game.lines[0].pts, 19); assert.equal(g.game.lines[0].reb, 7);
  assert.equal(g.game.lines[1].pts, 200); assert.equal(g.game.lines[1].min, 60);
  assert.equal(g.game.us, 61); assert.equal(g.game.source, 'hudl');
  assert.equal(cleanGame({ date: '2026-12-05' }).error, 'missing_opponent');
  assert.equal(cleanGame({ opponent: 'Radnor' }).error, 'missing_date');
  assert.equal(cleanPhoto('https://abc.public.blob.vercel-storage.com/playbook/photos/plan_1/smith-x9.jpg'), 'https://abc.public.blob.vercel-storage.com/playbook/photos/plan_1/smith-x9.jpg');
  assert.equal(cleanPhoto('https://abc.public.blob.vercel-storage.com/playbook/clips/plan_1/smith.jpg'), '');
  assert.equal(cleanPhoto('https://evil.com/x.jpg'), '');
  const pl = cleanPlan({ opponent: 'Radnor', things: 'They press after makes\nLefty #4\nBox out #32\nFourth thing', personnel: [{ name: 'Smith', photo: 'https://abc.public.blob.vercel-storage.com/playbook/photos/p/s.jpg' }, { name: 'Jones', photo: 'https://evil.com/x.jpg' }] }).plan;
  assert.deepEqual(pl.things, ['They press after makes', 'Lefty #4', 'Box out #32']);
  assert.equal(pl.personnel[0].photo.indexOf('https://abc'), 0); assert.equal(pl.personnel[1].photo, '');
});
await test('signals, calendar feeds and iCal parsing', () => {
  const r = cleanPlay(Object.assign({}, PLAY, { signal: { call: ' Fist ', photo: 'https://abc.public.blob.vercel-storage.com/playbook/photos/p/fist.jpg' } }));
  assert.deepEqual(r.play.signal, { call: 'Fist', photo: 'https://abc.public.blob.vercel-storage.com/playbook/photos/p/fist.jpg' });
  assert.deepEqual(cleanPlay(PLAY).play.signal, { call: '', photo: '' });
  const f = cleanFeeds([{ group: 'Varsity', url: 'webcal://script.google.com/macros/s/abc/exec?t=varsity&k=key' }, { url: 'ftp://x' }, { url: 'nope' }]);
  assert.equal(f.length, 1); assert.equal(f[0].url, 'https://script.google.com/macros/s/abc/exec?t=varsity&k=key'); assert.equal(f[0].group, 'Varsity');
  const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;TZID=America/New_York:20990112T153000\r\nSUMMARY:Varsity practice\r\nLOCATION:Kobe Bryant Gym\\, Ardmore\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20990110\r\nSUMMARY:Phoenix tournament\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20000101T120000Z\r\nSUMMARY:Old\r\nEND:VEVENT\r\nEND:VCALENDAR';
  const ev = parseIcs(ics, Date.parse('2099-01-01T00:00:00Z'));
  assert.equal(ev.length, 2); assert.equal(ev[0].title, 'Phoenix tournament'); assert.equal(ev[0].allDay, true);
  assert.equal(ev[1].title, 'Varsity practice'); assert.equal(ev[1].where, 'Kobe Bryant Gym, Ardmore'); assert.equal(ev[1].at, '2099-01-12T20:30:00.000Z', 'EST wall clock 3:30pm = 20:30Z');
});
await test('situations, end of game tree and glossary terms', () => {
  const r = cleanPlay(Object.assign({}, PLAY, { situations: ['blob', 'nope', 'blob', 'need3'] }));
  assert.deepEqual(r.play.situations, ['blob', 'need3']);
  assert.ok(SITUATION_KEYS.includes('press_break'));
  const eg = cleanEndgame({ ball_down3: { play_ids: ['p1', 'bad id', 'p1', 'p2'], note: ' Flare for 1 x ' }, def_up3: { foul: 'yes' }, junk: { play_ids: ['z'] } });
  assert.deepEqual(eg.ball_down3, { play_ids: ['p1', 'p2'], note: 'Flare for 1 x' });
  assert.equal(eg.def_up3.foul, true); assert.equal(eg.ball_tied.play_ids.length, 0); assert.equal(eg.junk, undefined);
  assert.equal(cleanTerm({ term: 'Ice', means: '' }).error, 'missing_meaning');
  assert.deepEqual(cleanTerm({ term: ' Ice ', means: 'Force the ball handler to the baseline on a side screen', kind: 'defense', play_id: 'p9' }).term, { term: 'Ice', means: 'Force the ball handler to the baseline on a side screen', play_id: 'p9', kind: 'defense' });
  assert.equal(cleanTerm({ term: 'X', means: 'y', kind: 'weird', play_id: 'bad id' }).term.kind, 'other');
});
await test('groups limit who can see a play', () => {
  const p = { visible: true, groups: ['Varsity'] };
  assert.equal(canSee(p, { group: 'Varsity' }), true);
  assert.equal(canSee(p, { group: 'JV' }), false);
  assert.equal(canSee({ visible: true, groups: [] }, { group: 'JV' }), true);
  assert.equal(canSee({ visible: false }, { group: '' }), false);
  assert.equal(canSee({ visible: true, archived: true }, { group: '' }), false);
});

group('sessions');
await test('a signed session round trips, and tampering or expiry kills it', () => {
  const pl = { id: 'pbp_1', code: 'ABC234', active: true };
  const t = signSession(pl);
  const s = readSession(t);
  assert.equal(s.p, 'pbp_1');
  assert.equal(sessionMatches(s, pl), true);
  assert.equal(sessionMatches(s, Object.assign({}, pl, { code: 'ZZZ999' })), false, 'new code ends old sessions');
  assert.equal(sessionMatches(s, Object.assign({}, pl, { active: false })), false, 'access off ends sessions');
  const [b, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ p: 'pbp_2', k: 'x', e: 9e15 })).toString('base64url') + '.' + sig;
  assert.equal(readSession(forged), null);
  assert.equal(readSession(t, Date.now() + 31 * 864e5), null);
  assert.equal(readSession(b), null);
});
await test('codes are 6 characters with no look-alikes', () => {
  for (let i = 0; i < 200; i++) assert.match(newCode(), /^[A-HJKMNP-Z2-9]{6}$/);
  assert.equal(normCode(' abc-234 '), 'ABC234');
});

group('handler: coach + player flow');
let codes, token, playId, jvPlayId;
await test('players and plays need the coach key', async () => {
  assert.equal((await call({ action: 'admin_list' })).statusCode, 401);
  assert.equal((await call({ action: 'save_play', play: PLAY })).statusCode, 401);
});
await test('coach adds players and saves plays', async () => {
  const r = await call({ action: 'add_players', players: [{ name: 'Israel Ingram', group: 'Varsity' }, { name: 'Sam JV', group: 'JV' }, { name: ' ' }] }, true);
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.added.length, 2);
  codes = r.body.added;
  const a = await call({ action: 'save_play', play: PLAY }, true);
  assert.equal(a.statusCode, 200); playId = a.body.id;
  const b = await call({ action: 'save_play', play: Object.assign({}, PLAY, { name: 'JV Secret', groups: ['JV'] }) }, true);
  jvPlayId = b.body.id;
  await call({ action: 'save_play', play: Object.assign({}, PLAY, { name: 'Draft', visible: false }) }, true);
});
await test('a wrong code is refused, the right code signs in', async () => {
  assert.equal((await call({ action: 'login', code: 'QQQQQQ' })).statusCode, 401);
  const r = await call({ action: 'login', code: codes[0].code.toLowerCase() });
  assert.equal(r.statusCode, 200);
  assert.equal(r.body.player.name, 'Israel Ingram');
  token = r.body.token;
});
await test('a player sees only visible plays for their group, with the lineup as names', async () => {
  await call({ action: 'save_play', id: playId, play: Object.assign({}, PLAY, { lineup: { O1: codes[0].id, O2: 'pbp_gone' } }) }, true);
  const r = await call({ action: 'plays', token });
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body.plays.map((p) => p.name), ['Horns Flare']);
  assert.deepEqual(r.body.plays[0].lineup, { O1: { id: codes[0].id, name: 'Israel Ingram' } });
  assert.equal(r.body.player.id, codes[0].id);
  assert.equal(r.body.plays[0].frames.length, 3);
  assert.equal((await call({ action: 'view', token, id: jvPlayId })).statusCode, 404);
});
await test('opening a play is logged once per 10 minutes', async () => {
  assert.equal((await call({ action: 'view', token, id: playId })).statusCode, 200);
  await call({ action: 'view', token, id: playId });
  const r = await call({ action: 'admin_list' }, true);
  assert.equal(r.body.views.length, 1);
  assert.equal(r.body.views[0].player_name, 'Israel Ingram');
  assert.equal(r.body.views[0].play_name, 'Horns Flare');
});
await test('turning access off, a new code, or closing the playbook locks the player out', async () => {
  const id = codes[0].id;
  await call({ action: 'update_player', id, active: false }, true);
  assert.equal((await call({ action: 'plays', token })).statusCode, 401);
  assert.equal((await call({ action: 'login', code: codes[0].code })).statusCode, 403);
  await call({ action: 'update_player', id, active: true }, true);
  assert.equal((await call({ action: 'plays', token })).statusCode, 200);
  const nc = await call({ action: 'new_code', id }, true);
  assert.notEqual(nc.body.code, codes[0].code);
  assert.equal((await call({ action: 'plays', token })).statusCode, 401, 'old session dies with the old code');
  const t2 = (await call({ action: 'login', code: nc.body.code })).body.token;
  await call({ action: 'set_open', open: false }, true);
  assert.equal((await call({ action: 'plays', token: t2 })).statusCode, 403);
  await call({ action: 'set_open', open: true }, true);
  assert.equal((await call({ action: 'plays', token: t2 })).statusCode, 200);
});
await test('archiving hides a play from players and can be undone', async () => {
  const t = (await call({ action: 'login', code: codes[1].code })).body.token;
  assert.equal((await call({ action: 'plays', token: t })).body.plays.length, 2);
  await call({ action: 'archive', id: jvPlayId }, true);
  assert.equal((await call({ action: 'plays', token: t })).body.plays.length, 1);
  await call({ action: 'restore', id: jvPlayId }, true);
  await call({ action: 'set_visible', id: jvPlayId, visible: true }, true);
  assert.equal((await call({ action: 'plays', token: t })).body.plays.length, 2);
});
await test('players ask questions on a play, the coach answers, the team sees answered ones', async () => {
  const me = (await call({ action: 'login', code: (await call({ action: 'new_code', id: codes[0].id }, true)).body.code })).body.token;
  const other = (await call({ action: 'add_players', players: [{ name: 'Teammate Two', group: 'Varsity' }] }, true)).body.added[0];
  const t2 = (await call({ action: 'login', code: other.code })).body.token;
  assert.equal((await call({ action: 'ask', token: me, id: playId, text: 'hi' })).statusCode, 400, 'too short');
  assert.equal((await call({ action: 'ask', token: me, id: jvPlayId, text: 'Can I see this one?' })).statusCode, 404, 'not their play');
  const a = await call({ action: 'ask', token: me, id: playId, text: '  Do I fade or <b>curl</b> if they switch?  ' });
  assert.equal(a.statusCode, 200);
  assert.equal(fake.state.mail.length, 1, 'coach emailed');
  assert.match(fake.state.mail[0].subject, /Israel Ingram/);
  let q = (await call({ action: 'questions', token: me, id: playId })).body.questions;
  assert.equal(q.length, 1); assert.equal(q[0].mine, true); assert.equal(q[0].text, 'Do I fade or bcurl/b if they switch?'); assert.equal(q[0].answer, '');
  assert.equal((await call({ action: 'questions', token: t2, id: playId })).body.questions.length, 0, 'unanswered questions stay private');
  const admin = (await call({ action: 'admin_list' }, true)).body;
  assert.equal(admin.questions.length, 1); assert.equal(admin.questions[0].player_name, 'Israel Ingram');
  assert.equal((await call({ action: 'answer', id: a.body.id, answer: '' }, true)).statusCode, 400);
  assert.equal((await call({ action: 'answer', id: a.body.id, answer: 'Fade. 5 will have the mismatch.' }, true)).statusCode, 200);
  q = (await call({ action: 'questions', token: t2, id: playId })).body.questions;
  assert.equal(q.length, 1); assert.equal(q[0].player_name, 'Israel Ingram'); assert.equal(q[0].answer, 'Fade. 5 will have the mismatch.');
  await call({ action: 'hide_question', id: a.body.id }, true);
  assert.equal((await call({ action: 'questions', token: t2, id: playId })).body.questions.length, 0, 'hidden from teammates');
  assert.equal((await call({ action: 'questions', token: me, id: playId })).body.questions.length, 1, 'still visible to the asker');
  for (let i = 0; i < 9; i++) await call({ action: 'ask', token: me, id: playId, text: 'Question number ' + i });
  assert.equal((await call({ action: 'ask', token: me, id: playId, text: 'One too many' })).statusCode, 429);
  await call({ action: 'remove_player', id: other.id }, true);
});
await test('quiz results, game plan, practice and progress reach the player', async () => {
  const tok = (await call({ action: 'login', code: (await call({ action: 'new_code', id: codes[0].id }, true)).body.code })).body.token;
  assert.equal((await call({ action: 'quiz_result', token: tok, id: jvPlayId, score: 1, total: 2 })).statusCode, 404, 'not their play');
  const q = await call({ action: 'quiz_result', token: tok, id: playId, score: 3, total: 4 });
  assert.equal(q.statusCode, 200); assert.equal(q.body.pct, 75);
  await call({ action: 'quiz_result', token: tok, id: playId, score: 9, total: 4 });   // clamped to 4/4
  const plan = await call({ action: 'save_plan', plan: { opponent: 'Radnor', date: '2099-01-10', keys: ['Rebound'], our_plays: [playId], matchups: [{ us: codes[0].id, them: '#23 Smith', note: 'deny' }], visible: true } }, true);
  assert.equal(plan.statusCode, 200);
  await call({ action: 'save_plan', plan: { opponent: 'Hidden', date: '2099-01-02', visible: false } }, true);
  const prac = await call({ action: 'save_practice', practice: { date: '2099-01-05', start: '15:30', blocks: [{ name: 'Shell', minutes: 15, play_ids: [playId] }], show_players: true } }, true);
  assert.equal(prac.statusCode, 200);
  await call({ action: 'save_practice', practice: { date: '2099-01-03', blocks: [{ name: 'Coaches only', minutes: 5 }], show_players: false } }, true);
  const r = (await call({ action: 'plays', token: tok })).body;
  assert.equal(r.plan.opponent, 'Radnor'); assert.equal(r.plan.matchups[0].us.name, 'Israel Ingram');
  assert.equal(r.practice.blocks[0].name, 'Shell');
  assert.deepEqual(r.done.viewed, [playId]); assert.equal(r.done.quiz[playId], 100);
  const n = await call({ action: 'add_note', player_id: codes[0].id, note: { kind: 'injury', text: 'ankle, limited' } }, true);
  assert.equal(n.statusCode, 200);
  const admin = (await call({ action: 'admin_list' }, true)).body;
  assert.equal(admin.quiz.length, 2); assert.equal(admin.plans.length, 2); assert.equal(admin.practices.length, 2); assert.equal(admin.notes[0].text, 'ankle, limited');
  const gm = await call({ action: 'save_game', game: { date: '2026-12-05', opponent: 'Radnor', us: 61, them: 55, lines: [{ player_id: codes[0].id, name: 'Israel Ingram', num: '5', pts: 19, reb: 7 }] } }, true);
  assert.equal(gm.statusCode, 200);
  const pr2 = (await call({ action: 'plays', token: tok })).body;
  assert.equal(pr2.games.length, 1); assert.equal(pr2.games[0].lines[0].pts, 19); assert.equal(pr2.plans.length, 1, 'visible plans come along for the opponent pages');
  assert.equal((await call({ action: 'update_player', id: codes[0].id, num: '5' }, true)).statusCode, 200);
  assert.equal((await call({ action: 'admin_list' }, true)).body.games.length, 1);
  assert.equal((await call({ action: 'delete_game', id: gm.body.id }, true)).statusCode, 200);
  const dr = await call({ action: 'save_drill', drill: { name: 'Coach D closeout', category: 'Defense', minutes: 10 } }, true);
  assert.equal(dr.statusCode, 200);
  assert.equal((await call({ action: 'admin_list' }, true)).body.drills.length, 1);
  assert.equal((await call({ action: 'save_drill', id: dr.body.id, drill: { name: 'Closeout v2', category: 'Defense', minutes: 8 } }, true)).statusCode, 200);
  assert.equal((await call({ action: 'delete_drill', id: dr.body.id }, true)).statusCode, 200);
  assert.equal((await call({ action: 'admin_list' }, true)).body.drills.length, 0);
  assert.equal((await call({ action: 'delete_note', id: n.body.id }, true)).statusCode, 200);
  assert.equal((await call({ action: 'delete_plan', id: plan.body.id }, true)).statusCode, 200);
  assert.equal((await call({ action: 'admin_list' }, true)).body.notes.length, 0);
  assert.equal((await call({ action: 'plays', token: tok })).body.plan, null, 'the hidden plan never shows');
  assert.equal((await call({ action: 'quiz_result', token: tok, id: 'signals', score: 4, total: 5 })).statusCode, 200);
  assert.equal((await call({ action: 'set_feeds', feeds: [{ group: 'Varsity', url: 'https://example.test/feed.ics' }] }, true)).statusCode, 200);
  const term = await call({ action: 'save_term', term: { term: 'Fist', means: 'Horns Flare', play_id: playId } }, true);
  assert.equal(term.statusCode, 200);
  assert.equal((await call({ action: 'set_endgame', leaves: { ball_down3: { play_ids: [playId], note: 'Flare' } } }, true)).statusCode, 200);
  const pl2 = await call({ action: 'plays', token: tok });
  assert.equal(pl2.statusCode, 200, JSON.stringify(pl2.body));
  assert.equal(pl2.body.terms.length, 1); assert.equal(pl2.body.terms[0].play_id, playId); assert.deepEqual(pl2.body.endgame.ball_down3.play_ids, [playId]); assert.equal(pl2.body.upcoming[0].title, 'Varsity practice');
  assert.equal((await call({ action: 'quiz_result', token: tok, id: 'terms', score: 3, total: 4 })).statusCode, 200);
  assert.equal((await call({ action: 'delete_term', id: term.body.id }, true)).statusCode, 200);
  assert.equal((await call({ action: 'update_player', id: codes[0].id, report_note: 'Great first month' }, true)).statusCode, 200);
  assert.equal((await call({ action: 'scout_report', opponent: 'Radnor' }, true)).statusCode, 404);
  fake.state.docs.set('scouting_reports/' + SITE_TAG + '_radnor', { fields: toFirestore({ site: SITE_TAG, opp: 'Radnor', keys: ['Box out'], personnel: [{ num: '23', name: 'Smith' }], matchups: [], plan: 'Run them.' }), createTime: 'x', updateTime: 'x' });
  const sr = await call({ action: 'scout_report', opponent: 'Radnor' }, true);
  assert.equal(sr.statusCode, 200); assert.deepEqual(sr.body.report.keys, ['Box out']);
});
await test('a removed player can no longer sign in', async () => {
  await call({ action: 'remove_player', id: codes[1].id }, true);
  assert.equal((await call({ action: 'login', code: codes[1].code })).statusCode, 401);
  const r = await call({ action: 'admin_list' }, true);
  assert.equal(r.body.players.length, 1);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
