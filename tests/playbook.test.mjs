// Offline tests for the Team Playbook: play validation, signed player sessions, and the
// real /api/playbook handler end to end against the in-memory Firestore fake. Zero network.
// Run: npm test   (or: node tests/playbook.test.mjs)

import assert from 'node:assert/strict';
import * as fake from './_fake.js';
import { cleanPlay, cleanClip, cleanClipLink, canSee, signSession, readSession, sessionMatches, normCode, newCode } from '../api/_playbook.js';
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
await test('a removed player can no longer sign in', async () => {
  await call({ action: 'remove_player', id: codes[1].id }, true);
  assert.equal((await call({ action: 'login', code: codes[1].code })).statusCode, 401);
  const r = await call({ action: 'admin_list' }, true);
  assert.equal(r.body.players.length, 1);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
