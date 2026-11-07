import assert from 'node:assert/strict';
import { cleanSignup, cleanTeams, mergeTeams, cleanNotice, recipientsFor, extractEmails, footerHtml, UNSUB_TAG, welcomeEmail } from '../api/_alerts.js';

let n = 0; const t = (name, fn) => { fn(); n++; };

t('signup ok', () => {
  const s = cleanSignup({ email: ' Mom@Example.COM ', teams: ['jv', 'Varsity', 'nope'], role: 'parent', name: ' Pat  Lee ', player: 'Sam' });
  assert.deepEqual(s, { email: 'mom@example.com', teams: ['Varsity', 'JV'], role: 'Parent', name: 'Pat Lee', player: 'Sam' });
});
t('signup errors', () => {
  assert.equal(cleanSignup({ email: 'x', teams: ['JV'], role: 'Player', name: 'a' }).error, 'bad_email');
  assert.equal(cleanSignup({ email: 'a@b.co', teams: [], role: 'Player', name: 'a' }).error, 'pick_team');
  assert.equal(cleanSignup({ email: 'a@b.co', teams: ['JV'], role: 'Fan', name: 'a' }).error, 'pick_role');
  assert.equal(cleanSignup({ email: 'a@b.co', teams: ['JV'], role: 'Coach', name: '<b></b>' }).error, 'missing_name');
});
t('player name only for parents', () => {
  assert.equal(cleanSignup({ email: 'a@b.co', teams: ['JV'], role: 'Player', name: 'Al', player: 'X' }).player, '');
});
t('teams merge in order', () => { assert.deepEqual(mergeTeams(['9th Grade'], ['Varsity']), ['Varsity', '9th Grade']); assert.deepEqual(cleanTeams('9th grade'), ['9th Grade']); });
t('notice', () => {
  assert.equal(cleanNotice({ team: 'x', subject: 's', html: 'h' }).error, 'bad_team');
  assert.equal(cleanNotice({ team: 'JV', subject: '', html: 'h' }).error, 'empty');
  const n2 = cleanNotice({ team: 'jv', subject: 'Aces JV', html: '<b>x</b>', skip: ['A@B.co', 'bad'] });
  assert.equal(n2.team, 'JV'); assert.deepEqual(n2.skip, ['a@b.co']);
});
t('recipients', () => {
  const subs = [
    { email: 'a@b.co', status: 'active', teams: ['JV'] },
    { email: 'c@d.co', status: 'unsubscribed', teams: ['JV'] },
    { email: 'e@f.co', status: 'active', teams: ['Varsity'] },
    { email: 'coach@x.co', status: 'active', teams: ['JV', 'Varsity'] },
    { email: 'A@b.co', status: 'active', teams: ['JV'] },
  ];
  assert.deepEqual(recipientsFor(subs, 'JV', ['coach@x.co']).map((s) => s.email), ['a@b.co']);
  assert.deepEqual(recipientsFor(subs, 'Varsity').map((s) => s.email), ['e@f.co', 'coach@x.co']);
});
t('extract', () => { assert.deepEqual(extractEmails('Jo <jo@x.com>, BOB@y.org; jo@x.com nope@'), ['jo@x.com', 'bob@y.org']); });
t('footer has unsub tag and escapes', () => { const f = footerHtml('<JV>'); assert.ok(f.includes(UNSUB_TAG)); assert.ok(f.includes('&lt;JV&gt;')); });
t('welcome', () => { const w = welcomeEmail({ name: 'Pat Lee', teams: ['Varsity', 'JV'], origin: 'https://x.app' }); assert.ok(w.subject.includes('Varsity and JV')); assert.ok(w.html.includes('Hi Pat')); });
console.log(`alerts: ${n} tests passed`);
