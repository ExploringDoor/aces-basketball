// Builds public/playbook-library.js: the premade play library and scenario packs a coach can
// add to the playbook from the coach board ("Add from the library").
//   node tools/build-library.mjs
// Plays are written in a shorthand (named spots, cuts, screens, passes) and compiled to the
// same frames the editor saves. Every play is run through cleanPlay() before it is written.
// Court: tenths of a foot, 500 wide; half court 420 deep with the basket at the TOP (y grows
// toward half court); full court 840 deep, our basket at the top, we start at the bottom.
import { writeFileSync } from 'node:fs';
import { cleanPlay } from '../api/_playbook.js';

/* ---------- spots (half court, basket at top) ---------- */
const S = {
  rim: [250, 52], ft: [250, 200], nail: [250, 165], top: [250, 335], topDeep: [250, 385],
  lBlock: [195, 85], rBlock: [305, 85], lLow: [170, 110], rLow: [330, 110], lMidPost: [180, 140], rMidPost: [320, 140],
  lElbow: [180, 200], rElbow: [320, 200], lHigh: [185, 185], rHigh: [315, 185],
  lShort: [115, 62], rShort: [385, 62], lCorner: [40, 55], rCorner: [460, 55],
  lWing: [70, 240], rWing: [430, 240], lWingHigh: [95, 290], rWingHigh: [405, 290],
  lSlot: [160, 325], rSlot: [340, 325], lTop: [185, 345], rTop: [315, 345],
  lLane: [215, 120], rLane: [285, 120], lDunker: [150, 70], rDunker: [350, 70],
  inbL: [180, -25], inbR: [320, -25], inbMid: [300, -25], sideL: [-25, 250], sideR: [525, 250], sideLHigh: [-25, 330],
  lHash: [60, 160], rHash: [440, 160], lDeep: [80, 380], rDeep: [420, 380], lHalf: [120, 410], rHalf: [380, 410], midHalf: [250, 410],
};
/* full court spots: our basket top (y 0), their basket bottom (y 840); we inbound under their basket */
const FC = {
  inb: [300, 865], inbL: [200, 865], lowL: [120, 760], lowR: [380, 760], midL: [110, 640], midR: [390, 640], ftLow: [250, 640], centerLow: [250, 560],
  halfL: [100, 430], halfR: [400, 430], half: [250, 425], highL: [110, 300], highR: [390, 300], upFt: [250, 200], upTop: [250, 335], upRim: [250, 52],
  upLCorner: [40, 55], upRCorner: [460, 55], upLWing: [70, 240], upRWing: [430, 240], hashL: [60, 560], hashR: [440, 560], lowBlockL: [195, 760], lowBlockR: [305, 760], sideLow: [-25, 700],
};
const pt = (p, court) => (Array.isArray(p) ? p : (court === 'full' ? FC[p] : S[p]) || (() => { throw new Error('unknown spot ' + p); })());

/* ---------- compiler ----------
   play(name, category, opts, setup, steps)
   opts: { court, notes, tips[], sits[], d (defense setup), key, side, mirror }
   setup: { O1:'top', ... } plus optional X spots
   step:  { n:'note', b:'O4'|'rim', m:{ O5:['rElbow','screen'], O1:['rWing','cut',[372,345]] }, pf:true }   (pf = pass first, then move) */
const PLAYS = [];
function play(name, category, opts, setup, steps) {
  const court = opts.court || 'half';
  let pos = {};
  for (const k of Object.keys(setup)) pos[k] = pt(setup[k], court).slice();
  if (opts.d) for (const k of Object.keys(opts.d)) pos[k] = pt(opts.d[k], court).slice();
  const frames = [{ pos: { ...pos }, ball: opts.ball || 'O1', note: opts.first || 'Set up.', moves: {}, passFirst: false }];
  let ball = frames[0].ball;
  for (const st of steps) {
    const next = { ...pos };
    const moves = {};
    for (const [id, mv] of Object.entries(st.m || {})) {
      const [to, t, c] = mv;
      next[id] = pt(to, court).slice();
      const type = t || 'cut';
      moves[id] = c ? { t: type, c: pt(c, court).slice() } : { t: type };
    }
    if (st.b) ball = st.b;
    frames.push({ pos: next, ball, note: st.n || '', moves, passFirst: !!st.pf });
    pos = next;
  }
  const p = { key: opts.key || slug(name), name, category, court, notes: opts.notes || '', tips: opts.tips || [], situations: opts.sits || [], frames, visible: true, side: opts.side || '' };
  PLAYS.push(p);
  if (opts.mirror) PLAYS.push(mirror(p, opts.mirror));
  return p;
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
function mirror(p, names) {
  const flip = (xy) => [500 - xy[0], xy[1]];
  const q = JSON.parse(JSON.stringify(p));
  q.key = p.key + '-left';
  q.name = names[1] || p.name + ' (left)';
  if (names[0]) PLAYS[PLAYS.length - 1].name = names[0];
  q.frames.forEach((f) => { for (const id of Object.keys(f.pos)) f.pos[id] = flip(f.pos[id]); for (const id of Object.keys(f.moves)) if (f.moves[id].c) f.moves[id].c = flip(f.moves[id].c); });
  q.notes = (q.notes || '').replace(/\bright\b/g, '\u0000').replace(/\bleft\b/g, 'right').replace(/\u0000/g, 'left');
  q.frames.forEach((f) => { f.note = f.note.replace(/\bright\b/g, '\u0000').replace(/\bleft\b/g, 'right').replace(/\u0000/g, 'left'); });
  q.side = 'left';
  return q;
}
const man = (o) => { // standard man defenders, each sagging off their man toward the rim
  const d = {}; const map = { O1: 'X1', O2: 'X2', O3: 'X3', O4: 'X4', O5: 'X5' };
  for (const [id, x] of Object.entries(map)) { if (!o[id]) continue; const p = pt(o[id]); d[x] = [Math.round(p[0] + (250 - p[0]) * 0.22), Math.round(p[1] + (52 - p[1]) * 0.22)]; }
  return d;
};

/* ================================================================
   MAN OFFENSE
================================================================ */
const HORNS = { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'rCorner', O3: 'lCorner' };
play('Horns Flare', 'Offense', { notes: 'Our go to against man. Run it out of a timeout or when a shooter needs a clean look.', tips: ['1: fade, don\'t drift. Feet set behind the line before the catch.', '5: screen the top shoulder of 1\'s man, then dive hard.', '4: look at 5 on the dive first, then skip it to 1.'], sits: ['ato', 'need3'], mirror: ['Horns Flare (right)', 'Horns Flare (left)'], first: 'Horns. 4 and 5 at the elbows, 2 and 3 spaced to the corners.' }, HORNS, [
  { n: '1 hits 4 at the elbow.', b: 'O4' },
  { n: '5 sets the flare screen. 1 fades to the wing.', m: { O5: [[300, 282], 'screen'], O1: ['rWing', 'cut', [372, 345]] } },
  { n: '4 skips it to 1. 5 dives to the rim.', b: 'O1', m: { O5: ['rBlock', 'cut'] }, pf: true },
  { n: 'Catch and shoot. If they switch, 5 is open on the dive.', b: 'rim' }]);
play('Horns Twist', 'Offense', { notes: 'Two ball screens in a row. The second one catches the defense still recovering from the first.', tips: ['1: reject nothing. Use both screens, change speed between them.', '4 rolls, 5 pops. Read the low man.'], sits: ['ato'], mirror: ['Horns Twist (right)', 'Horns Twist (left)'], first: 'Horns set.' }, HORNS, [
  { n: '5 screens for 1. 1 comes off to the right.', m: { O5: [[290, 320], 'screen'], O1: [[345, 300], 'dribble'] } },
  { n: '1 turns back, 4 re-screens going left. 5 slips to the rim.', m: { O4: [[215, 300], 'screen'], O1: [[165, 285], 'dribble', [300, 350]], O5: ['rBlock', 'cut'] } },
  { n: '4 pops. 1 reads: layup, 4 for three, or 5 on the dive.', m: { O4: ['lWingHigh', 'cut'], O1: ['nail', 'dribble'] } },
  { n: 'Finish, or kick to 4.', b: 'rim' }]);
play('Horns Dive and Pop', 'Offense', { notes: 'Ball screen with one big rolling and the other spacing. The simplest read in basketball: roller or popper.', tips: ['5: roll with your hands up and seal the low man.', '4: pop to the elbow, not the three point line, so the pass is short.'], sits: ['ato', 'need2'], mirror: ['Horns Dive and Pop (right)', 'Horns Dive and Pop (left)'], first: 'Horns set.' }, HORNS, [
  { n: '5 screens for 1 going right.', m: { O5: [[295, 318], 'screen'], O1: [[350, 295], 'dribble'] } },
  { n: '5 rolls to the rim. 4 pops to the elbow.', m: { O5: ['rBlock', 'cut', [330, 200]], O4: ['lElbow', 'cut'] } },
  { n: '1 hits the roll if the low man stays home.', b: 'O5' },
  { n: 'Finish at the rim.', b: 'rim' }]);
play('Horns Split', 'Offense', { notes: 'Entry to the elbow, then the guard splits the two bigs. Good against teams that sit in the gaps.', tips: ['1: cut hard off 4\'s hip. If they go under, pop back for the handback.'], sits: ['ato'], first: 'Horns set.' }, HORNS, [
  { n: '1 passes to 4 at the elbow.', b: 'O4' },
  { n: '1 cuts between 4 and 5 to the rim.', m: { O1: ['rim', 'cut', [250, 210]] } },
  { n: '4 feeds 1 on the cut, or 1 clears to the corner and 4 drives.', b: 'O1' },
  { n: 'Layup.', b: 'rim' }]);
play('Horns Stagger', 'Offense', { notes: 'Both bigs screen for the corner shooter coming to the top. For your best shooter.', tips: ['2: wait for the second screen. Set your man up by taking him low first.', '4 and 5: shoulder to shoulder, no gap for the defender to slip through.'], sits: ['need3', 'ato'], mirror: ['Horns Stagger (right)', 'Horns Stagger (left)'], first: 'Horns set, 2 is the shooter in the right corner.' }, HORNS, [
  { n: '1 dribbles left. 4 and 5 drop to stagger for 2.', m: { O1: ['lSlot', 'dribble'], O4: [[300, 150], 'screen'], O5: [[330, 215], 'screen'] } },
  { n: '2 runs the stagger to the top.', m: { O2: ['rTop', 'cut', [400, 170]] } },
  { n: '1 throws it back to 2.', b: 'O2' },
  { n: 'Shot. If they chase, 2 curls and 5 pops.', b: 'rim' }]);
play('Horns Punch', 'Offense', { notes: 'A post up disguised as Horns. For a big who can score on the block.', tips: ['5: seal as 4 catches. Don\'t fight for position before the ball goes to the elbow.'], sits: ['need2'], first: 'Horns set.' }, HORNS, [
  { n: '1 hits 4 at the elbow and cuts away to the left wing.', b: 'O4', m: { O1: ['lWing', 'cut'] }, pf: true },
  { n: '5 ducks in and seals on the right block.', m: { O5: ['rBlock', 'cut'] } },
  { n: '4 feeds the post.', b: 'O5' },
  { n: 'Score on the block. 2 lifts for the kick out.', b: 'rim', m: { O2: ['rWing', 'cut'] } }]);
play('Horns Elbow Handoff', 'Offense', { notes: 'Entry to the elbow, guard follows the pass for a handback. Flows straight into a two man game.', tips: ['1: pass and go the same way. Catch the handoff on the move.'], sits: ['ato'], mirror: ['Horns Handoff (right)', 'Horns Handoff (left)'], first: 'Horns set.' }, HORNS, [
  { n: '1 hits 5 at the elbow.', b: 'O5' },
  { n: '1 follows the pass for the handoff.', b: 'O1', m: { O1: [[345, 215], 'cut', [310, 280]] } },
  { n: '5 turns and screens. 1 attacks. 4 dives.', m: { O5: [[335, 225], 'screen'], O1: [[300, 120], 'dribble'], O4: ['lBlock', 'cut'] } },
  { n: 'Score, or drop it to 5 rolling.', b: 'rim' }]);

const FOUR_OUT = { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rLow' };
play('Four Out Post Entry', 'Offense', { notes: 'Four out, one in. Wing entry to the post with a shooter relocating behind it.', tips: ['2: feed the post from the wing, then cut through to the corner. Never stand after the pass.'], sits: ['need2'], mirror: ['Four Out Post Entry (right)', 'Four Out Post Entry (left)'], first: 'Four out, 5 on the right block.' }, FOUR_OUT, [
  { n: '1 swings to 2 on the wing.', b: 'O2' },
  { n: '2 feeds 5 on the block, then cuts to the corner. 4 lifts.', b: 'O5', m: { O2: ['rCorner', 'cut', [410, 150]], O4: ['lWing', 'cut'], O3: ['lSlot', 'cut'] }, pf: true },
  { n: '5 scores or kicks to 2 in the corner.', b: 'rim' }]);
play('Four Out Drive and Kick', 'Offense', { notes: 'Nothing fancy: a gap drive with everybody spaced and the big in the dunker spot.', tips: ['Drive the gap, not the man. Two feet in the paint before you decide.', '5: stay below the ball in the dunker spot. Be a dunker, not a screener.'], first: 'Four out, 5 in the right dunker spot.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rDunker' }, [
  { n: '1 drives the left gap. 3 drifts to the corner, 4 lifts.', m: { O1: ['lLane', 'dribble'], O3: ['lCorner', 'cut'], O4: ['lWing', 'cut'] } },
  { n: 'Help comes: kick to 4, or dump to 5.', b: 'O4' },
  { n: '4 shoots or swings to 3.', b: 'rim' }]);
const FIVE_OUT = { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lCorner' };
play('Five Out Cut and Fill', 'Offense', { notes: 'Pass, basket cut, fill behind. The base of any five out motion.', tips: ['Cut all the way to the rim with your hands ready. Half cuts get nobody open.', 'Fill the spot the cutter left. Keep the floor even.'], first: 'Five out. Nobody inside.' }, FIVE_OUT, [
  { n: '1 passes to 2 and cuts to the rim.', b: 'O2', m: { O1: ['rim', 'cut', [290, 230]] }, pf: true },
  { n: '1 clears to the left corner. 3 fills the top, 5 fills the wing.', m: { O1: ['lCorner', 'cut'], O3: ['top', 'cut'], O5: ['lWing', 'cut'] } },
  { n: '2 swings to 3 and cuts. Same thing again.', b: 'O3', m: { O2: ['rim', 'cut', [330, 240]] }, pf: true },
  { n: 'Hit the cutter when his man turns his head.', b: 'O2' }, { n: 'Layup.', b: 'rim' }]);
play('Five Out Dribble Handoff', 'Offense', { notes: 'Handoffs around the horn until a defender goes under. Great for teams without a post.', tips: ['Handoff with the ball in two hands at the hip. The cutter takes it, you don\'t throw it.'], first: 'Five out.' }, FIVE_OUT, [
  { n: '1 dribbles at 2. 2 comes off the handoff.', b: 'O2', m: { O1: ['rWingHigh', 'dribble'], O2: ['rTop', 'cut', [430, 300]] } },
  { n: '2 dribbles at 3. 1 cuts backdoor behind it.', b: 'O3', m: { O2: ['lTop', 'dribble'], O3: ['lSlot', 'cut', [80, 300]], O1: ['rim', 'cut', [400, 160]] } },
  { n: '3 drives if his man went under, or hits 1 backdoor.', b: 'rim' }]);
play('Five Out Backdoor', 'Offense', { notes: 'When they deny the wing, the wing goes backdoor. Teach it as a rule, run it as a play.', tips: ['Take two hard steps toward the ball first. The backdoor only works if the denial is real.'], sits: ['vs_switch'], mirror: ['Five Out Backdoor (right)', 'Five Out Backdoor (left)'], first: 'Five out. 2 is being denied on the right wing.' }, FIVE_OUT, [
  { n: '2 steps up to the ball, then plants and goes backdoor.', m: { O2: ['rBlock', 'cut', [450, 170]] } },
  { n: '1 throws the bounce pass to the back hand.', b: 'O2' },
  { n: 'Layup. 4 lifts out of the corner in case of help.', b: 'rim', m: { O4: ['rWing', 'cut'] } }]);
play('UCLA Cut', 'Offense', { notes: 'Wing entry, then the passer cuts off the high post. The oldest good play in the book.', tips: ['1: set your man up by walking him toward the ball, then cut off 5\'s outside shoulder.'], mirror: ['UCLA Cut (right)', 'UCLA Cut (left)'], first: '1 at the top, 5 at the right elbow, 2 on the wing.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rElbow' }, [
  { n: '1 passes to 2 on the wing.', b: 'O2' },
  { n: '1 cuts off 5\'s back screen to the block.', m: { O5: [[305, 240], 'screen'], O1: ['rBlock', 'cut', [330, 250]] } },
  { n: '2 hits 1 on the cut, or 5 pops to the top for the reversal.', b: 'O1', m: { O5: ['top', 'cut'] } },
  { n: 'Layup.', b: 'rim' }]);
play('Floppy', 'Offense', { notes: 'The shooter starts under the rim and picks a side: single screen one way, double the other.', tips: ['2: read your defender. If he trails, curl. If he cheats over the top, fade.', 'Screeners: hold the screen until contact, then open to the ball.'], sits: ['need3', 'ato'], first: '2 under the basket. 4 single on the left, 3 and 5 stacked on the right.' }, { O1: 'top', O2: 'rim', O4: 'lBlock', O3: 'rLow', O5: 'rBlock' }, [
  { n: '2 picks the double. Runs off 5 and 3 to the right wing.', m: { O2: ['rWing', 'cut', [330, 110]] } },
  { n: '1 passes to 2.', b: 'O2' },
  { n: 'Shot. 4 flashes to the elbow if 2 is covered.', b: 'rim', m: { O4: ['lElbow', 'cut'] } }]);
play('Zipper', 'Offense', { notes: 'Guard zips up the lane off a down screen to receive at the top. Sets up a two man game or a quick shot.', tips: ['2: come off the screen shoulder to shoulder with 5 and catch on the move toward the ball.'], mirror: ['Zipper (right)', 'Zipper (left)'], first: '1 dribbles to the right wing. 2 at the right block, 5 at the right elbow.' }, { O1: 'rWingHigh', O2: 'rBlock', O3: 'lCorner', O4: 'lElbow', O5: 'rElbow' }, [
  { n: '5 down screens. 2 zips up the lane to the top.', m: { O5: [[300, 150], 'screen'], O2: ['top', 'cut', [290, 220]] } },
  { n: '1 passes to 2.', b: 'O2' },
  { n: '5 turns into a ball screen. 2 attacks, 4 lifts.', m: { O5: [[280, 320], 'screen'], O2: ['lLane', 'dribble', [220, 300]], O4: ['lWing', 'cut'] } },
  { n: 'Finish or kick.', b: 'rim' }]);
play('Pistol', 'Offense', { notes: 'Early offense: wing handoff straight into a ball screen before the defense is set.', tips: ['Run it fast. Pistol is a transition play, not a set.'], mirror: ['Pistol (right)', 'Pistol (left)'], first: '1 brings it up the right side. 2 ahead on the wing, 5 trailing.' }, { O1: 'rSlot', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'topDeep' }, [
  { n: '1 passes to 2 and follows for the handoff.', b: 'O2', m: { O1: ['rWingHigh', 'cut'] }, pf: true },
  { n: '2 hands back to 1. 5 arrives to ball screen.', b: 'O1', m: { O5: [[330, 300], 'screen'], O2: ['rCorner', 'cut'] } },
  { n: '1 turns the corner. 5 rolls, 3 lifts.', m: { O1: ['nail', 'dribble', [300, 250]], O5: ['rBlock', 'cut'], O3: ['lSlot', 'cut'] } },
  { n: 'Finish, roll, or skip to 3.', b: 'rim' }]);
play('Spain Pick and Roll', 'Offense', { notes: 'Ball screen, then a shooter back screens the roller\'s defender. Modern and hard to guard.', tips: ['2: screen the big\'s defender, then pop out. One of you is open.'], sits: ['ato', 'need2'], first: '1 at the top, 5 at the elbow, 2 on the nail behind him.' }, { O1: 'top', O5: 'rElbow', O2: 'ft', O3: 'lCorner', O4: 'rCorner' }, [
  { n: '5 ball screens for 1.', m: { O5: [[290, 318], 'screen'], O1: [[345, 295], 'dribble'] } },
  { n: '5 rolls. 2 back screens the roller\'s man, then pops to the top.', m: { O2: [[260, 150], 'screen'], O5: ['rim', 'cut', [300, 180]] } },
  { n: '1 lobs to 5 or throws back to 2 for three.', b: 'O5', m: { O2: ['top', 'cut'] } },
  { n: 'Finish.', b: 'rim' }]);
play('Chicago', 'Offense', { notes: 'Pin down into a dribble handoff. The shooter arrives with momentum and a screen already set.', tips: ['2: curl tight off the pin down, take the handoff going downhill.'], mirror: ['Chicago (right)', 'Chicago (left)'], first: '1 on the right slot with the ball, 5 at the top, 2 in the left corner, 4 on the left elbow.' }, { O1: 'rSlot', O5: 'top', O2: 'lCorner', O4: 'lElbow', O3: 'rCorner' }, [
  { n: '4 pins down for 2. 2 comes to the top.', m: { O4: [[110, 180], 'screen'], O2: ['lTop', 'cut', [120, 280]] } },
  { n: '5 hands off to 2 and screens. 1 spaces.', b: 'O2', m: { O5: [[235, 330], 'screen'], O1: ['rWing', 'cut'] } },
  { n: '2 attacks right. 5 rolls, 4 pops.', m: { O2: ['rLane', 'dribble', [300, 310]], O5: ['lBlock', 'cut'], O4: ['lWing', 'cut'] } },
  { n: 'Finish or kick.', b: 'rim' }]);
play('Flex', 'Offense', { notes: 'Baseline flex cut off a screen, then screen the screener. Continuity: it repeats side to side.', tips: ['Flex cut: rub shoulders with the screener. Go under if your man is over the top, over if he is under.', 'The second screen is the one that scores. Set it late.'], first: 'Flex: 1 and 2 up top, 4 and 5 on the blocks... 3 on the right wing with the ball.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lBlock', O5: 'rBlock' }, [
  { n: '3 swings to 2, 2 to 1.', b: 'O1', m: {} },
  { n: '5 flex screens for 4 along the baseline. 4 cuts to the ball side block.', m: { O5: [[270, 90], 'screen'], O4: ['lLow', 'cut', [250, 60]] } },
  { n: '1 looks at 4. 2 down screens for 5, 5 pops to the slot.', m: { O2: [[300, 170], 'screen'], O5: ['rSlot', 'cut', [330, 230]] } },
  { n: '1 hits 5 for the jumper, or 4 on the block.', b: 'O5' }, { n: 'Shot.', b: 'rim' }]);
play('Motion Weak', 'Offense', { notes: 'Pass to the wing, cut away, screen away. The weak side screen gets a shooter open while the ball side is quiet.', tips: ['Screen away with your back to the ball. The cutter decides curl or fade.'], mirror: ['Motion Weak (right)', 'Motion Weak (left)'], first: '1 at the top, wings filled, bigs on the blocks.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  { n: '1 passes to 2 and screens away for 3.', b: 'O2', m: { O1: [[125, 280], 'screen'], O3: ['top', 'cut', [140, 330]] }, pf: true },
  { n: '2 reverses to 3. 4 flashes to the elbow.', b: 'O3', m: { O4: ['lElbow', 'cut'] } },
  { n: '3 hits 4, or drives the open side.', b: 'O4' }, { n: 'Jumper from the elbow.', b: 'rim' }]);
play('Iverson Cut', 'Offense', { notes: 'Shooter cuts across the top of two high posts, then catches on the wing with a ball screen waiting.', tips: ['2: run the cut at full speed and plant on the wing. The ball should already be in the air.'], sits: ['ato'], mirror: ['Iverson Cut (right)', 'Iverson Cut (left)'], first: '1 at the top, 4 and 5 at the elbows, 2 and 3 in the corners.' }, HORNS, [
  { n: '3 runs the Iverson cut over both elbows to the right wing.', m: { O3: ['rWing', 'cut', [250, 215]] } },
  { n: '1 passes to 3. 5 follows to ball screen.', b: 'O3', m: { O5: [[400, 250], 'screen'] } },
  { n: '3 drives middle. 5 rolls, 4 pops to the top.', m: { O3: ['nail', 'dribble', [370, 200]], O5: ['rBlock', 'cut'], O4: ['top', 'cut'] } },
  { n: 'Finish or kick to 4.', b: 'rim' }]);
play('Elevator Doors', 'Offense', { notes: 'The shooter runs between two bigs who close the gap behind him. Against teams that chase shooters.', tips: ['4 and 5: close the doors a half second after 2 goes through. Early is a foul, late is useless.'], sits: ['need3', 'ato'], first: '1 at the top, 4 and 5 at the elbows with a gap, 2 under the rim.' }, { O1: 'top', O4: [205, 195], O5: [295, 195], O2: 'rim', O3: 'lCorner' }, [
  { n: '2 sprints up the lane between 4 and 5.', m: { O2: [[250, 300], 'cut'] } },
  { n: '4 and 5 close the doors. 1 passes to 2.', b: 'O2', m: { O4: [[232, 220], 'screen'], O5: [[268, 220], 'screen'] } },
  { n: 'Shot.', b: 'rim' }]);
play('Hammer', 'Offense', { notes: 'Baseline drive on one side, back screen for the corner shooter on the other. A corner three every time the help comes.', tips: ['1: drive baseline, not middle. The skip pass goes over the help.', '4: screen the corner defender\'s top shoulder as the drive starts.'], sits: ['need3'], mirror: ['Hammer (right)', 'Hammer (left)'], first: '1 on the right wing with the ball, 2 in the left corner, 4 at the left elbow.' }, { O1: 'rWing', O2: 'lCorner', O4: 'lElbow', O3: 'top', O5: 'rBlock' }, [
  { n: '1 drives baseline. 5 clears to the short corner.', m: { O1: ['rLane', 'dribble', [430, 110]], O5: ['rShort', 'cut'] } },
  { n: '4 back screens for 2. 2 slides to the left corner.', m: { O4: [[95, 120], 'screen'], O2: [[45, 62], 'cut'] } },
  { n: '1 skips it to 2.', b: 'O2' }, { n: 'Corner three.', b: 'rim' }]);
play('Box Double Cross', 'Offense', { notes: 'From a box, both low players cross screen for each other and the high players screen down. Three options off one action.', tips: ['Low screens first, then the down screens. Two separate actions, half a count apart.'], first: 'Box set, 1 at the top.' }, { O1: 'top', O2: 'rElbow', O3: 'lElbow', O4: 'lBlock', O5: 'rBlock' }, [
  { n: '4 and 5 cross screen for each other along the baseline.', m: { O4: ['rLow', 'cut', [250, 65]], O5: ['lLow', 'cut', [250, 110]] } },
  { n: '2 and 3 screen down for the bigs. 4 and 5 pop to the elbows.', m: { O2: [[320, 150], 'screen'], O3: [[180, 150], 'screen'], O4: ['rElbow', 'cut'], O5: ['lElbow', 'cut'] } },
  { n: '1 hits either elbow. 2 and 3 clear to the corners.', b: 'O4', m: { O2: ['rCorner', 'cut'], O3: ['lCorner', 'cut'] } },
  { n: 'Jumper, or high-low to the other big.', b: 'rim' }]);
play('1-4 High Backdoor', 'Offense', { notes: 'Everybody high, nobody in the lane. The wing goes backdoor the moment his man cheats.', tips: ['Wings: start at the three point line. One hard step to the ball, then go.'], sits: ['vs_switch'], mirror: ['1-4 High Backdoor (right)', '1-4 High Backdoor (left)'], first: '1-4 high. The lane is empty.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lElbow', O5: 'rElbow' }, [
  { n: '2 steps to the ball and cuts backdoor.', m: { O2: ['rBlock', 'cut', [450, 170]] } },
  { n: '1 bounce passes to 2, or hits 5 at the elbow who drops it to 2.', b: 'O2' },
  { n: 'Layup.', b: 'rim' }]);
play('1-4 High Post Entry', 'Offense', { notes: 'Entry to the high post, guards cut off either side. Hard to pressure, good late in the clock.', tips: ['5: catch at the elbow facing the rim. Read the cutters, then the shooter, then your own shot.'], first: '1-4 high.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lElbow', O5: 'rElbow' }, [
  { n: '1 passes to 5 at the elbow.', b: 'O5' },
  { n: '2 and 3 cut backdoor off the wings. 4 screens for 1.', m: { O2: ['rBlock', 'cut'], O3: ['lBlock', 'cut'], O4: [[210, 300], 'screen'], O1: ['lSlot', 'cut', [250, 300]] } },
  { n: '5 hits a cutter or faces up and shoots.', b: 'rim' }]);
play('Princeton Chin', 'Offense', { notes: 'Entry to the wing, back cut off the post, then a chin screen for the passer. Patient and lethal against aggressive teams.', tips: ['Read before you run. Every cut has a counter if they jump it.'], mirror: ['Chin (right)', 'Chin (left)'], first: '1 at the top, 5 at the top of the key, wings and corners filled.' }, { O1: 'top', O5: 'ft', O2: 'rWing', O3: 'lWing', O4: 'rCorner' }, [
  { n: '1 passes to 2 and cuts off 5 to the rim.', b: 'O2', m: { O1: ['rim', 'cut', [265, 160]] }, pf: true },
  { n: '1 clears to the left corner. 3 fills the top. 5 ball screens for 2.', m: { O1: ['lCorner', 'cut'], O3: ['top', 'cut'], O5: [[395, 265], 'screen'] } },
  { n: '2 drives middle off the screen. 5 rolls, 4 lifts.', m: { O2: ['nail', 'dribble', [380, 220]], O5: ['rBlock', 'cut'], O4: ['rWing', 'cut'] } },
  { n: 'Finish or kick.', b: 'rim' }]);
play('Stack Curl', 'Offense', { notes: 'Three in a stack on one side. The top of the stack curls to the rim, the next pops.', tips: ['First cutter curls tight, second cutter pops wide. Never the same cut twice.'], sits: ['ato'], mirror: ['Stack Curl (right)', 'Stack Curl (left)'], first: '1 at the top. 2, 3 and 4 stacked on the right lane line, 5 on the left block.' }, { O1: 'top', O2: [330, 210], O3: [330, 160], O4: [330, 110], O5: 'lBlock' }, [
  { n: '2 curls off 3 and 4 to the rim.', m: { O2: ['rim', 'cut', [380, 150]] } },
  { n: '3 pops to the right wing. 4 steps out to the elbow.', m: { O3: ['rWing', 'cut'], O4: ['rElbow', 'cut'] } },
  { n: '1 hits 2 on the curl or 3 on the pop.', b: 'O3' }, { n: 'Shot.', b: 'rim' }]);
play('Dribble Drive Loop', 'Offense', { notes: 'Attack the gap, if nothing is there the ball goes to the corner and the driver loops to the other side.', tips: ['Drive to score. The kick is the second option, not the plan.'], first: 'Four out, 5 on the weak side block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lBlock' }, [
  { n: '1 drives the right gap.', m: { O1: ['rLane', 'dribble'] } },
  { n: 'Help comes. 1 kicks to 4 in the corner and loops out to the left.', b: 'O4', m: { O1: ['lSlot', 'cut', [200, 220]], O2: ['top', 'cut'] }, pf: true },
  { n: '4 drives baseline. 5 stays home on the opposite block for the dump.', m: { O4: ['rLow', 'dribble', [440, 90]] } },
  { n: 'Finish or drop to 5.', b: 'rim' }]);

/* ================================================================
   ZONE OFFENSE
================================================================ */
const Z23 = { X1: [200, 262], X2: [300, 262], X3: [100, 130], X4: [400, 130], X5: [250, 92] };
play('Zone Overload', 'Offense', { notes: 'Against a 2-3. Put four players on one side and make two defenders guard three.', tips: ['The short corner is the key. Catch there and the bottom defender has to choose.'], sits: ['vs_zone'], d: Z23, mirror: ['Zone Overload (right)', 'Zone Overload (left)'], first: '1 at the top against a 2-3.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rShort', O5: 'rLow' }, [
  { n: '1 passes to 2. 3 cuts through to the right corner.', b: 'O2', m: { O3: ['rCorner', 'cut', [250, 130]] }, pf: true },
  { n: '2 hits 4 in the short corner. 5 seals the middle.', b: 'O4', m: { O5: ['rLane', 'cut'] } },
  { n: '4 scores, or finds 5 sealing, or 3 in the corner.', b: 'rim' }]);
play('Zone High Low', 'Offense', { notes: 'Against a 2-3. Flash to the high post and look low behind the zone.', tips: ['4: catch at the foul line and turn to face. The bottom of the zone can\'t guard both.'], sits: ['vs_zone'], d: Z23, first: 'Two guards up top, 5 behind the zone.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lCorner', O4: 'lShort', O5: 'rLow' }, [
  { n: '4 flashes to the foul line. 1 hits him.', b: 'O4', m: { O4: ['ft', 'cut'] } },
  { n: '5 seals the back of the zone. 4 drops it low.', b: 'O5', m: { O5: ['rBlock', 'cut'] } },
  { n: 'Score inside. 3 is the release in the corner.', b: 'rim' }]);
play('Zone Short Corner', 'Offense', { notes: 'Against a 2-3. Work the ball to the short corner and read the bottom defender.', tips: ['Catch in the short corner facing the rim. Shot, baseline drive, or the big sealing.'], sits: ['vs_zone'], d: Z23, mirror: ['Zone Short Corner (right)', 'Zone Short Corner (left)'], first: '1 up top, wings high, 5 in the middle.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rShort', O5: 'nail' }, [
  { n: '1 swings to 2 on the wing.', b: 'O2' },
  { n: '2 passes to 4 in the short corner. 5 dives behind the zone.', b: 'O4', m: { O5: ['lLane', 'cut'] } },
  { n: '4 shoots the short jumper or feeds 5 sealing.', b: 'rim' }]);
play('Zone Skip and Drive', 'Offense', { notes: 'Against any zone. Swing it twice, skip it once, then drive the gap before the zone recovers.', tips: ['Skip passes beat zones. Make the first skip early, when they lean.'], sits: ['vs_zone'], d: Z23, first: 'Four around the zone, 5 in the middle.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'nail' }, [
  { n: '1 passes to 2, 2 to 4 in the corner. The zone shifts.', b: 'O4', m: { X4: [[430, 90], 'cut'], X2: [[380, 220], 'cut'], X5: [[300, 95], 'cut'], X1: [[250, 240], 'cut'], X3: [[160, 120], 'cut'] } },
  { n: '4 skips it to 3 on the far wing.', b: 'O3' },
  { n: '3 drives the gap before the zone gets there. 5 posts the middle.', m: { O3: ['lLane', 'dribble', [110, 160]] } },
  { n: 'Finish, or dump to 5.', b: 'rim' }]);
play('Screen the Zone', 'Offense', { notes: 'Against a 2-3. Screen the top guard of the zone and bring a shooter into the gap.', tips: ['5: screen the guard who is guarding the ball side. Hold it: zone defenders don\'t expect it.'], sits: ['vs_zone', 'need3'], d: Z23, mirror: ['Screen the Zone (right)', 'Screen the Zone (left)'], first: '1 up top, 2 in the right corner, 5 at the elbow.' }, { O1: 'top', O2: 'rCorner', O3: 'lWing', O4: 'lShort', O5: 'rElbow' }, [
  { n: '1 dribbles left. 5 steps out and screens the right guard of the zone.', m: { O1: ['lSlot', 'dribble'], O5: [[318, 248], 'screen'] } },
  { n: '2 lifts from the corner to the wing behind the screen.', m: { O2: ['rWing', 'cut'] } },
  { n: '1 throws it back across to 2.', b: 'O2' }, { n: 'Three.', b: 'rim' }]);
const Z131 = { X1: [250, 300], X2: [110, 200], X3: [390, 200], X4: [250, 185], X5: [250, 75] };
play('Vs 1-3-1: Corners and Short Corner', 'Offense', { notes: 'Against a 1-3-1. Attack the corners and the short corner, the two spots the shape can\'t cover.', tips: ['Never dribble into the trap at the wing. Catch and pass in one motion.'], sits: ['vs_zone'], d: Z131, first: 'Two guards, two corners, 5 in the short corner.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lCorner', O4: 'rCorner', O5: 'rShort' }, [
  { n: '1 passes to 2, 2 to 4 in the corner.', b: 'O4', m: { X3: [[430, 120], 'cut'], X5: [[330, 75], 'cut'] } },
  { n: '5 slides along the baseline to the ball. 4 feeds him.', b: 'O5', m: { O5: [[380, 80], 'cut'] } },
  { n: 'Score, or skip to 3 in the far corner.', b: 'rim' }]);
const Z32 = { X1: [250, 290], X2: [120, 230], X3: [380, 230], X4: [170, 100], X5: [330, 100] };
play('Vs 3-2: High Post Flash', 'Offense', { notes: 'Against a 3-2. The middle of the foul line is open; flash there and play inside out.', tips: ['Catch at the foul line and look at the opposite block first.'], sits: ['vs_zone'], d: Z32, first: '1 up top, wings, two bigs low against a 3-2.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lLow', O5: 'rLow' }, [
  { n: '4 flashes to the foul line. 1 hits him.', b: 'O4', m: { O4: ['ft', 'cut'] } },
  { n: '5 seals the low man. 4 looks high-low or turns and shoots.', b: 'O5', m: { O5: ['rBlock', 'cut'] } },
  { n: 'Score.', b: 'rim' }]);

/* ================================================================
   BASELINE OUT OF BOUNDS (we inbound under our own basket)
================================================================ */
const BOX_BLOB = { O3: 'inbMid', O1: [180, 190], O2: [320, 190], O4: [180, 90], O5: [320, 90] };
play('Box Up', 'Baseline out', { notes: 'Under our basket. 3 inbounds. The bigs screen up, a guard pops to the corner and a guard curls to the rim.', tips: ['Inbounder: slap the ball and count out loud. Nobody moves until the slap.'], sits: ['blob'], first: 'Box set. 3 takes it out on the ball side.' }, BOX_BLOB, [
  { n: '4 and 5 screen up. 1 pops to the corner, 2 curls to the rim.', m: { O4: [[180, 165], 'screen'], O5: [[320, 165], 'screen'], O1: [[65, 40], 'cut', [90, 150]], O2: [[262, 72], 'cut', [350, 125]] } },
  { n: 'First look: 2 at the rim. Second: 1 in the corner.', b: 'O2' },
  { n: 'Lay it in.', b: 'rim' }]);
play('Box Screen the Screener', 'Baseline out', { notes: 'Under our basket. The guard screens the big, then gets a screen himself. The second action is the one that scores.', tips: ['5: after screening, open to the ball. Big to big screens get bigs open.'], sits: ['blob'], first: 'Box set, 3 out of bounds.' }, BOX_BLOB, [
  { n: '1 cross screens for 5. 5 cuts to the ball side block.', m: { O1: [[250, 95], 'screen'], O5: [[335, 65], 'cut', [280, 70]] } },
  { n: '4 screens down for 1. 1 pops to the elbow.', m: { O4: [[215, 150], 'screen'], O1: ['rElbow', 'cut', [250, 170]] } },
  { n: '3 hits 5 on the block or 1 at the elbow.', b: 'O5' }, { n: 'Score.', b: 'rim' }]);
play('Line Lob', 'Baseline out', { notes: 'Four in a line up the lane. The last man breaks to the corner for safety, the first man screens for a lob.', tips: ['The lob is thrown to the back of the rim, not to the player.'], sits: ['blob', 'need2'], first: 'Four in a line facing the inbounder. 5 is first, nearest the ball.' }, { O3: 'inbMid', O5: [250, 90], O4: [250, 140], O2: [250, 190], O1: [250, 240] }, [
  { n: '1 breaks to the far corner for safety. 2 pops to the wing.', m: { O1: ['lCorner', 'cut', [150, 250]], O2: ['rWing', 'cut'] } },
  { n: '5 back screens for 4. 4 goes to the rim for the lob.', m: { O5: [[270, 125], 'screen'], O4: ['rim', 'cut', [300, 110]] } },
  { n: '3 throws the lob, or hits 5 slipping to the ball side block.', b: 'O4' }, { n: 'Finish.', b: 'rim' }]);
play('Stack Diagonal', 'Baseline out', { notes: 'Stack on the ball side block. Top of the stack goes diagonal to the far corner, the rest peel off one at a time.', tips: ['Peel one at a time, half a count apart. If everyone goes at once nobody is open.'], sits: ['blob'], first: 'Stack of four on the ball side lane line.' }, { O3: 'inbMid', O1: [300, 100], O2: [300, 145], O4: [300, 190], O5: [300, 235] }, [
  { n: '1 goes diagonal to the far corner.', m: { O1: ['lCorner', 'cut', [200, 110]] } },
  { n: '2 cuts to the near corner. 4 steps to the rim, 5 pops to the top.', m: { O2: ['rCorner', 'cut'], O4: ['rim', 'cut'], O5: ['top', 'cut'] } },
  { n: '3 hits 4 at the rim, 2 in the corner, or 5 for the reversal.', b: 'O4' }, { n: 'Layup.', b: 'rim' }]);
play('Box Corner Three', 'Baseline out', { notes: 'Under our basket when we need a three. The shooter gets a double screen into the ball side corner.', tips: ['Shooter: start low in the box so the screens are ahead of you.'], sits: ['blob', 'need3'], first: 'Box set, 2 is the shooter at the high ball side spot.' }, BOX_BLOB, [
  { n: '4 and 5 set a double screen on the ball side. 2 cuts to the corner behind it.', m: { O4: [[330, 130], 'screen'], O5: [[360, 100], 'screen'], O2: ['rCorner', 'cut', [400, 160]] } },
  { n: '1 pops to the top as the safety.', m: { O1: ['top', 'cut'] } },
  { n: '3 hits 2 in the corner.', b: 'O2' }, { n: 'Three. 5 crashes for the rebound.', b: 'rim', m: { O5: ['rBlock', 'cut'] } }]);
play('Flat Backdoor', 'Baseline out', { notes: 'Four across the foul line. Everyone steps up, and one man goes backdoor behind the help.', tips: ['Step up hard together. The backdoor cut only works after a real step up.'], sits: ['blob'], first: 'Four across the foul line extended. 3 inbounds.' }, { O3: 'inbMid', O1: [60, 200], O4: [180, 200], O5: [320, 200], O2: [440, 200] }, [
  { n: 'Everyone steps up a step. 5 goes backdoor to the rim.', m: { O1: ['lWing', 'cut'], O4: [[180, 230], 'cut'], O2: ['rWing', 'cut'], O5: ['rim', 'cut', [330, 150]] } },
  { n: '3 hits 5, or 1 on the far wing if the defense sinks.', b: 'O5' }, { n: 'Layup.', b: 'rim' }]);
play('Flat Shooter', 'Baseline out', { notes: 'Four across. The bigs pinch and the shooter comes off a staggered screen to the ball side wing.', tips: ['Catch on the wing, not the corner. The angle is better and the help is further.'], sits: ['blob', 'need3'], first: 'Four across the foul line, 2 on the far side.' }, { O3: 'inbMid', O2: [60, 200], O4: [180, 200], O5: [320, 200], O1: [440, 200] }, [
  { n: '4 and 5 stagger for 2. 2 runs to the ball side wing.', m: { O4: [[200, 215], 'screen'], O5: [[320, 225], 'screen'], O2: ['rWing', 'cut', [260, 240]] } },
  { n: '1 drops to the corner. 3 hits 2.', b: 'O2', m: { O1: ['rCorner', 'cut'] } }, { n: 'Shot.', b: 'rim' }]);
play('Box Big Lob', 'Baseline out', { notes: 'Under our basket. Guards clear, big screens big, the roller goes up for a lob over a smaller defender.', tips: ['Only run it with a big who can catch above the rim. Otherwise run Box Up.'], sits: ['blob', 'need2'], first: 'Box set, 3 inbounds.' }, BOX_BLOB, [
  { n: '1 and 2 clear to the corners.', m: { O1: ['lCorner', 'cut'], O2: ['rCorner', 'cut'] } },
  { n: '4 back screens for 5. 5 goes to the rim.', m: { O4: [[280, 110], 'screen'], O5: ['rim', 'cut', [330, 90]] } },
  { n: 'Lob to 5. 4 steps out as the safety.', b: 'O5', m: { O4: ['ft', 'cut'] } }, { n: 'Dunk.', b: 'rim' }]);
play('Box vs Zone', 'Baseline out', { notes: 'Baseline out against a 2-3 zone. Overload the ball side and attack the bottom defender.', tips: ['Against a zone the inbounder steps in as a scorer. Don\'t forget him.'], sits: ['blob', 'vs_zone'], d: { X1: [200, 250], X2: [300, 250], X3: [110, 110], X4: [390, 110], X5: [250, 80] }, first: 'Box set against a 2-3.' }, BOX_BLOB, [
  { n: '2 pops to the ball side corner. 1 lifts to the wing. 5 steps to the short corner.', m: { O2: ['rCorner', 'cut'], O1: ['rWing', 'cut'], O5: ['rShort', 'cut'] } },
  { n: '3 hits 2 in the corner and steps in to the rim.', b: 'O2', m: { O3: ['rBlock', 'cut'] }, pf: true },
  { n: '2 shoots, or feeds 3 stepping in, or 5 in the short corner.', b: 'rim' }]);
play('Box Elevator', 'Baseline out', { notes: 'Baseline out when we need a three. The shooter runs through the elevator doors to the top of the key.', tips: ['The inbounder has five seconds. Shooter starts moving on the slap.'], sits: ['blob', 'need3'], first: 'Box set, 2 is the shooter at the high ball side spot.' }, { O3: 'inbMid', O1: [180, 190], O2: [320, 110], O4: [205, 150], O5: [295, 150] }, [
  { n: '2 runs between 4 and 5 to the top. 1 clears to the corner.', m: { O2: ['top', 'cut', [250, 165]], O1: ['lCorner', 'cut'] } },
  { n: '4 and 5 close the doors behind him.', m: { O4: [[232, 180], 'screen'], O5: [[268, 180], 'screen'] } },
  { n: '3 throws it to 2 at the top.', b: 'O2' }, { n: 'Three.', b: 'rim' }]);
play('BLOB Need Two: Lob or Corner', 'Late game', { notes: 'Under our basket, down two, seconds left. One look at the rim, one in the corner, no third option.', tips: ['If the lob isn\'t there in one count, hit the corner. Do not hold the ball.'], sits: ['blob', 'need2', 'last_shot'], first: 'Box set. 3 inbounds, 5 is our best finisher.' }, BOX_BLOB, [
  { n: '4 back screens for 5. 1 pops to the corner. 2 clears to the top.', m: { O4: [[280, 115], 'screen'], O5: ['rim', 'cut', [330, 95]], O1: ['rCorner', 'cut'], O2: ['top', 'cut'] } },
  { n: 'Lob to 5 if it is there, otherwise 1 in the corner.', b: 'O5' }, { n: 'Finish.', b: 'rim' }]);

/* ================================================================
   SIDELINE OUT OF BOUNDS
================================================================ */
const SLOB = { O3: 'sideL', O1: 'top', O2: [110, 140], O4: [230, 230], O5: [320, 110] };
play('Sideline Box', 'Sideline out', { notes: 'Sideline out in the front court. Safe entry first, then a shooter off a screen.', tips: ['Inbounder: the safety release is always the man at the top. Get it in first.'], sits: ['slob'], mirror: ['Sideline Box (left side)', 'Sideline Box (right side)'], first: '3 inbounds from the left sideline.' }, SLOB, [
  { n: '4 screens for 1. 1 comes to the ball as the release.', m: { O4: [[205, 300], 'screen'], O1: [[120, 290], 'cut', [200, 345]] } },
  { n: '5 down screens for 2. 2 pops to the corner.', m: { O5: [[130, 100], 'screen'], O2: ['lCorner', 'cut', [90, 70]] } },
  { n: '3 hits 1, or 2 in the corner.', b: 'O1' }, { n: '1 swings it and we are in offense.', b: 'O4', m: { O4: ['top', 'cut'] } }]);
play('Sideline Stack', 'Sideline out', { notes: 'Stack facing the inbounder. One pops back for safety, one goes to the rim, one to the corner.', tips: ['Last man in the stack is the safety. He goes last and he goes long.'], sits: ['slob'], first: 'Stack of four facing 3 on the sideline.' }, { O3: 'sideL', O1: [80, 250], O2: [130, 250], O4: [180, 250], O5: [230, 250] }, [
  { n: '1 cuts to the rim. 2 pops to the corner. 5 breaks back for safety.', m: { O1: ['rim', 'cut', [120, 150]], O2: ['lCorner', 'cut'], O5: ['topDeep', 'cut'] } },
  { n: '4 screens for 1 coming back, or 3 hits 2 in the corner.', b: 'O2' },
  { n: 'Shot, or swing to 5 and run offense.', b: 'rim' }]);
play('Sideline Need Three', 'Sideline out', { notes: 'Sideline out, down three, short clock. Shooter comes off a stagger to the top of the key.', tips: ['Shooter: your first step is away from the ball. Sell the corner, then come off the screens.'], sits: ['slob', 'need3', 'last_shot'], first: '3 inbounds on the left sideline. 2 is the shooter in the right corner.' }, { O3: 'sideL', O1: 'lSlot', O2: 'rCorner', O4: 'rElbow', O5: 'rLow' }, [
  { n: '1 cuts to the corner to clear. 4 and 5 stagger for 2.', m: { O1: ['lCorner', 'cut'], O4: [[330, 230], 'screen'], O5: [[360, 170], 'screen'] } },
  { n: '2 runs the stagger to the top of the key.', m: { O2: ['top', 'cut', [400, 300]] } },
  { n: '3 hits 2.', b: 'O2' }, { n: 'Three. 4 and 5 crash.', b: 'rim' }]);
play('Sideline Back Screen Lob', 'Sideline out', { notes: 'Sideline out near our basket. The big back screens for the wing and the lob comes in from the sideline.', tips: ['The lob from the sideline is a short pass. Throw it high and soft.'], sits: ['slob', 'need2'], first: '3 inbounds from the left sideline near the baseline.' }, { O3: [-25, 150], O1: 'top', O2: 'lWing', O4: 'rElbow', O5: 'lElbow' }, [
  { n: '5 back screens for 2. 2 goes to the rim.', m: { O5: [[110, 215], 'screen'], O2: ['rim', 'cut', [150, 110]] } },
  { n: '1 steps toward the ball as the safety. 3 lobs to 2 or hits 1.', b: 'O2', m: { O1: ['lSlot', 'cut'] } }, { n: 'Finish.', b: 'rim' }]);
play('Sideline Full Court Catch', 'Sideline out', { notes: 'Sideline out in the back court with a few seconds left. Long pass to a sprinter, catch and go.', tips: ['The sprinter runs the sideline, not the middle. The pass is thrown to the far hash, over the top.'], sits: ['slob', 'full_court_short', 'need2'], court: 'full', first: '3 inbounds from the sideline in the back court. 1 is our fastest player.' }, { O3: 'sideLow', O1: 'midL', O2: 'centerLow', O4: 'halfR', O5: 'highL' }, [
  { n: '5 screens for 1 at half court. 1 sprints the sideline. 2 comes back as a release.', m: { O5: ['halfL', 'screen'], O1: ['upLWing', 'cut', [60, 420]], O2: ['lowL', 'cut'] } },
  { n: '3 throws it long to 1.', b: 'O1' },
  { n: '1 attacks the rim. 4 trails to the top for a kick.', b: 'rim', m: { O1: ['upRim', 'dribble'], O4: ['upTop', 'cut'] } }]);
play('Sideline Hawk', 'Sideline out', { notes: 'Sideline out. The guard cuts off a high post back screen to the ball side block, then the post screens down.', tips: ['Hawk cut: go shoulder to shoulder with the screener. Finish at the block, not the rim.'], sits: ['slob'], first: '3 inbounds from the left sideline. 5 at the left elbow, 1 at the top.' }, { O3: 'sideL', O1: 'top', O5: 'lElbow', O2: 'rWing', O4: 'rBlock' }, [
  { n: '1 cuts off 5 to the ball side block.', m: { O5: [[200, 260], 'screen'], O1: ['lBlock', 'cut', [150, 250]] } },
  { n: '5 pops to the top. 3 hits 1 on the block or 5 at the top.', b: 'O5', m: { O5: ['top', 'cut'] } },
  { n: '5 swings to 2. 4 posts.', b: 'O2' }, { n: 'Feed the post or shoot.', b: 'rim' }]);

/* ================================================================
   PRESS BREAK (full court, we start at the bottom under their basket)
================================================================ */
const PB4 = { O4: 'inb', O1: [330, 700], O2: [110, 640], O3: [390, 520], O5: [250, 420] };
play('Press Break: Four Across', 'Press break', { notes: 'Against any full court press. Four across, inbound to the guard, reverse it, and the middle flashes.', tips: ['Never dribble into the corner trap. Ball reversal beats the press, not speed.', 'The middle man is open for a count. Hit him on the flash or move on.'], sits: ['press_break', 'vs_press'], court: 'full', first: '4 takes it out. Everyone else in a line, 1 closest.' }, PB4, [
  { n: '1 breaks to the ball. 4 inbounds to him.', b: 'O1', m: { O1: [[392, 772], 'cut'] } },
  { n: '5 flashes to the middle. 4 steps in as the reversal.', m: { O5: [[250, 565], 'cut'], O4: [[230, 790], 'cut'] } },
  { n: '1 hits 5 in the middle, or reverses to 4.', b: 'O5' },
  { n: '2 and 3 run wide. 5 looks ahead.', m: { O2: [[110, 330], 'cut'], O3: [[392, 250], 'cut'] } },
  { n: '5 hits 3 ahead for the layup.', b: 'O3', m: { O3: ['upRim', 'dribble', [380, 150]] } }, { n: 'Score.', b: 'rim' }]);
play('Press Break: One Up Two Back', 'Press break', { notes: 'Against a 2-2-1 or diamond. Two guards back for the inbound, one big at half court, one deep.', tips: ['The inbounder is the best passer, and after the pass he is the safety behind the ball.'], sits: ['press_break', 'vs_press'], court: 'full', first: '4 inbounds. 1 and 2 at the elbows, 5 at half court, 3 deep.' }, { O4: 'inb', O1: [320, 760], O2: [180, 760], O5: 'half', O3: 'upTop' }, [
  { n: '1 and 2 break opposite. 4 inbounds to 1.', b: 'O1', m: { O1: [[400, 720], 'cut'], O2: [[100, 700], 'cut'] } },
  { n: '4 steps in behind the ball. 5 comes to the middle.', m: { O4: [[250, 790], 'cut'], O5: ['centerLow', 'cut'] } },
  { n: '1 reverses to 4, 4 hits 2 up the far side.', b: 'O2', m: { O2: ['midL', 'cut'] } },
  { n: '2 attacks. 3 stays deep, 5 trails.', b: 'rim', m: { O2: ['upLWing', 'dribble', [90, 450]], O5: ['upFt', 'cut'] } }]);
play('Press Break: Sideline Trap Escape', 'Press break', { notes: 'When they trap the ball handler on the sideline. Three outlets form a triangle: back, middle, ahead.', tips: ['Trapped player: pivot away from the trap and find the man behind you. Never pick up your dribble early.'], sits: ['press_break', 'vs_press'], court: 'full', d: { X1: [360, 660], X2: [420, 600], X3: [250, 520], X4: [150, 430], X5: [250, 250] }, first: '1 is trapped on the right sideline past the foul line.' }, { O1: [400, 640], O4: [330, 780], O5: [250, 560], O2: [120, 560], O3: [390, 330] }, [
  { n: 'Outlets: 4 behind, 5 in the middle, 3 ahead on the sideline.', m: { O4: [[280, 740], 'cut'], O5: [[270, 590], 'cut'], O3: [[400, 380], 'cut'] } },
  { n: '1 pivots and hits 4 behind the ball.', b: 'O4' },
  { n: '4 reverses to 2 on the far side. 5 runs the middle.', b: 'O2', m: { O5: ['half', 'cut'] } },
  { n: '2 pushes it up the open side.', b: 'rim', m: { O2: ['upLWing', 'dribble', [90, 420]] } }]);
play('Press Break: Long Pass', 'Press break', { notes: 'Against a press that commits two to the ball. One man goes deep and the inbounder throws over the top.', tips: ['Only when the deep man has a step. If their safety is home, run Four Across.'], sits: ['press_break', 'vs_press', 'full_court_short'], court: 'full', first: '4 inbounds. 3 starts at half court.' }, { O4: 'inb', O1: [330, 720], O2: [170, 720], O5: 'centerLow', O3: 'half' }, [
  { n: '1 and 2 fake to the ball and clear. 3 sprints deep.', m: { O1: [[420, 640], 'cut'], O2: [[80, 640], 'cut'], O3: ['upRim', 'cut', [330, 250]] } },
  { n: '4 throws the long pass over the top.', b: 'O3' }, { n: 'Layup. 5 trails for the rebound.', b: 'rim', m: { O5: ['upFt', 'cut'] } }]);
play('Press Break: Middle Flash', 'Press break', { notes: 'Against a 1-2-1-1. The big flashes to the middle on every pass and the ball never stays on one side.', tips: ['Catch in the middle facing up court. Two dribbles max, then pass ahead.'], sits: ['press_break', 'vs_press'], court: 'full', first: '4 inbounds, 1 and 2 on the elbows, 5 at the foul line, 3 at half court.' }, { O4: 'inb', O1: [330, 740], O2: [170, 740], O5: 'ftLow', O3: 'half' }, [
  { n: '4 inbounds to 2. 5 flashes to the middle.', b: 'O2', m: { O2: [[110, 700], 'cut'], O5: [[220, 600], 'cut'] } },
  { n: '2 hits 5 in the middle. 1 and 3 run wide.', b: 'O5', m: { O1: [[420, 480], 'cut'], O3: [[80, 330], 'cut'] } },
  { n: '5 turns and hits 1 ahead.', b: 'O1' }, { n: '1 attacks. 3 fills the far corner.', b: 'rim', m: { O1: ['upRim', 'dribble', [400, 200]], O3: ['upLCorner', 'cut'] } }]);

/* ================================================================
   PRESSES (our defense, full court; the Xs are us, the Os are them)
================================================================ */
const THEM_INB = { O4: 'inb', O1: [330, 720], O2: [170, 720], O3: [390, 480], O5: 'half' };
play('Diamond Press 1-2-1-1', 'Press', { notes: 'Full court after a made basket. One on the ball, two wings trap the first pass, one in the middle, one safety.', tips: ['Trap after the catch, not before. Hands up, no reaching, make them throw over you.', 'Safety: never let anyone behind you. Give up the sideline, take away the deep ball.'], sits: ['vs_press'], court: 'full', first: 'They inbound under their basket. X1 on the ball, X2 and X3 the wings, X4 the middle, X5 the safety.' }, { ...THEM_INB, X1: [300, 800], X2: [140, 690], X3: [380, 690], X4: [250, 520], X5: [250, 260] }, [
  { n: 'They inbound to the right. X1 and X3 trap on the catch.', b: 'O1', m: { O1: [[400, 730], 'cut'], X1: [[370, 760], 'cut'], X3: [[420, 690], 'cut'] } },
  { n: 'X2 takes away the reversal. X4 reads the sideline pass. X5 covers deep.', m: { X2: [[230, 740], 'cut'], X4: [[380, 520], 'cut'], X5: [[300, 330], 'cut'] } },
  { n: 'Steal the sideline pass, or they throw it back and we set up in the half court.', b: 'O3' }]);
play('2-2-1 Zone Press', 'Press', { notes: 'Softer full court press. Two up, two in the middle, one back. Pushes the ball to the sideline and traps at half court.', tips: ['Front two: no trapping in the back court. Steer them to the sideline.', 'Trap comes at half court where the line is a sixth defender.'], sits: ['vs_press'], court: 'full', first: 'X1 and X2 up front, X3 and X4 at the hash marks, X5 back.' }, { ...THEM_INB, X1: [170, 700], X2: [330, 700], X3: [110, 520], X4: [390, 520], X5: [250, 250] }, [
  { n: 'They bring it up the right side. X2 steers to the sideline, X1 slides to the middle.', b: 'O1', m: { O1: [[400, 620], 'dribble'], X2: [[360, 640], 'cut'], X1: [[260, 650], 'cut'] } },
  { n: 'At half court X4 comes up and traps with X2. X3 takes the middle, X5 the deep sideline.', m: { O1: [[420, 450], 'dribble'], X4: [[430, 470], 'cut'], X2: [[380, 480], 'cut'], X3: [[250, 480], 'cut'], X5: [[330, 280], 'cut'] } },
  { n: 'Steal, or a bad pass. If they beat it, sprint back into the zone.', b: 'O1' }]);
play('1-3-1 Half Court Trap', 'Press', { notes: 'Half court trap. Force the ball to a wing, trap it with the point and the wing, and the baseline runner takes the corner.', tips: ['Point: send them to the sideline you want. The trap is on the wing, never the top.', 'Baseline runner: you cover both corners. Sprint, don\'t jog.'], sits: ['vs_press'], d: { X1: [250, 300], X2: [110, 200], X3: [390, 200], X4: [250, 185], X5: [250, 75] }, first: '1-3-1 set. They bring the ball to the top.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lLow' }, [
  { n: 'They pass to the right wing. X3 jumps it, X1 comes to trap.', b: 'O2', m: { X3: [[400, 235], 'cut'], X1: [[360, 270], 'cut'] } },
  { n: 'X4 fronts the high post. X5 takes the corner. X2 covers the middle.', m: { X4: [[300, 180], 'cut'], X5: [[420, 70], 'cut'], X2: [[220, 190], 'cut'] } },
  { n: 'Steal the skip, or they throw it out and we reset.', b: 'O1' }]);
play('Run and Jump', 'Press', { notes: 'Full court man pressure with surprise traps. A defender runs at the dribbler from the blind side and they switch.', tips: ['Jump when the dribbler is going full speed and looking down. Switch assignments, don\'t both chase.'], sits: ['vs_press'], court: 'full', first: 'Full court man to man after a made basket.' }, { O1: [330, 700], O2: [120, 640], O3: [380, 500], O4: 'inb', O5: 'half', X1: [330, 650], X2: [140, 600], X3: [370, 460], X4: [280, 800], X5: [250, 400] }, [
  { n: '1 brings it up the right side on the dribble.', m: { O1: [[400, 560], 'dribble'], X1: [[380, 520], 'cut'] } },
  { n: 'X3 jumps the dribbler from the blind side. X1 rotates to X3\'s man.', m: { X3: [[410, 540], 'cut'], X1: [[370, 470], 'cut'] } },
  { n: 'Pick up the dribble, deflection, or a rushed pass.', b: 'O1' }]);
play('Full Court Deny', 'Press', { notes: 'Full court man to man, deny every pass. For the last minute when you need the ball back.', tips: ['Deny with your back to the ball and a hand in the passing lane. Make the inbounder eat the five count.'], sits: ['vs_press'], court: 'full', first: 'They inbound. We deny every receiver.' }, { O4: 'inb', O1: [330, 740], O2: [170, 740], O3: [390, 520], O5: 'half', X1: [350, 760], X2: [190, 760], X3: [380, 560], X5: [260, 470], X4: [300, 820] }, [
  { n: 'Every receiver is face guarded. X4 shades the inbounder\'s strong hand.', m: { X1: [[345, 745], 'cut'], X2: [[185, 745], 'cut'] } },
  { n: 'Count out loud. Five seconds and the ball is ours.', b: 'O4' }]);

/* ================================================================
   DEFENSE (half court; the Os are them, the Xs are us)
================================================================ */
const THEM_HALF = { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'nail' };
play('2-3 Zone Slides', 'Defense', { notes: 'Every player moves on every pass. Talk.', tips: ['Guards: the ball is yours above the foul line. Bigs: nothing behind you.', 'Middle man fronts the high post. Never let the ball into the middle.'], sits: ['vs_zone'], d: Z23, first: 'Base 2-3. Hands up, X1 and X2 split the top.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'rLow' }, [
  { n: 'Ball to the wing. X2 takes the ball, X1 drops to the elbow, everyone shifts a step.', b: 'O2', m: { X2: [[392, 222], 'cut'], X1: [[262, 248], 'cut'], X5: [[290, 100], 'cut'], X3: [[150, 112], 'cut'] } },
  { n: 'Ball to the corner. X4 runs out, X5 fronts the block, X3 fills the middle.', b: 'O4', m: { X4: [[425, 88], 'cut'], X5: [[330, 72], 'cut'], X3: [[215, 92], 'cut'], X2: [[408, 178], 'cut'], X1: [[250, 212], 'cut'] } },
  { n: 'Skip pass: everyone sprints back the other way. X3 closes out, X1 drops.', b: 'O3', m: { X3: [[85, 225], 'cut'], X1: [[200, 262], 'cut'], X2: [[300, 262], 'cut'], X4: [[400, 130], 'cut'], X5: [[250, 92], 'cut'] } }]);
play('2-3 Zone vs High Post', 'Defense', { notes: 'The 2-3 is weakest at the high post. Here is who takes it and what everyone else does.', tips: ['X5 steps up to the high post only when the ball is there. Otherwise the middle man stays home.'], sits: ['vs_zone'], d: Z23, first: 'Base 2-3. Their 5 flashes to the foul line.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lLow' }, [
  { n: 'Their 5 flashes high. X5 steps up and plays behind him.', m: { O5: ['ft', 'cut'], X5: [[250, 160], 'cut'] } },
  { n: 'The ball goes in. X1 and X2 collapse on the ball, X3 and X4 pinch the blocks.', b: 'O5', m: { X1: [[215, 215], 'cut'], X2: [[285, 215], 'cut'], X3: [[150, 95], 'cut'], X4: [[350, 95], 'cut'] } },
  { n: 'He kicks it out. Guards sprint back to the top, bigs recover.', b: 'O2', m: { X1: [[200, 262], 'cut'], X2: [[380, 225], 'cut'], X4: [[400, 130], 'cut'], X3: [[100, 130], 'cut'], X5: [[250, 92], 'cut'] } }]);
play('1-3-1 Zone Slides', 'Defense', { notes: 'Long and active. The point steers, the wings trap, the baseline runner covers both corners.', tips: ['Baseline runner: you are never standing still. Corner to corner.'], sits: ['vs_zone'], d: Z131, first: 'Base 1-3-1.' }, THEM_HALF, [
  { n: 'Ball to the right wing. X3 takes it, X1 drops to the elbow, X5 slides toward the corner.', b: 'O2', m: { X3: [[400, 235], 'cut'], X1: [[290, 260], 'cut'], X5: [[340, 75], 'cut'], X4: [[300, 170], 'cut'] } },
  { n: 'Ball to the corner. X5 runs out. X4 drops to the block. X3 covers the wing.', b: 'O4', m: { X5: [[425, 72], 'cut'], X4: [[320, 100], 'cut'], X3: [[420, 180], 'cut'], X2: [[200, 190], 'cut'] } },
  { n: 'Skip to the far wing. X2 closes out, X5 sprints across the baseline.', b: 'O3', m: { X2: [[90, 230], 'cut'], X5: [[160, 75], 'cut'], X4: [[250, 185], 'cut'], X1: [[200, 290], 'cut'], X3: [[390, 200], 'cut'] } }]);
play('3-2 Zone Slides', 'Defense', { notes: 'Three across the top takes away the perimeter. The two bigs own the lane.', tips: ['Top three: no gaps. The gap between you is the shot they want.'], sits: ['vs_zone'], d: Z32, first: 'Base 3-2.' }, THEM_HALF, [
  { n: 'Ball to the right wing. X3 takes it, X1 slides to the elbow, X5 covers the short corner.', b: 'O2', m: { X3: [[405, 235], 'cut'], X1: [[300, 270], 'cut'], X5: [[360, 90], 'cut'] } },
  { n: 'Ball to the corner. X5 runs out, X4 slides to the ball side block, X2 drops to the far block.', b: 'O4', m: { X5: [[430, 70], 'cut'], X4: [[290, 95], 'cut'], X2: [[170, 150], 'cut'], X3: [[420, 170], 'cut'] } },
  { n: 'Skip to the far wing. X2 closes out, everyone recovers.', b: 'O3', m: { X2: [[90, 235], 'cut'], X1: [[250, 290], 'cut'], X4: [[170, 100], 'cut'], X5: [[330, 100], 'cut'], X3: [[380, 230], 'cut'] } }]);
play('Box and One', 'Defense', { notes: 'Four in a box zone, one defender face guards their best scorer everywhere he goes.', tips: ['Chaser: you never help. Your man never catches it. That is the whole job.'], sits: ['vs_zone'], d: { X1: [250, 290], X2: [190, 210], X3: [310, 210], X4: [180, 95], X5: [320, 95] }, first: 'Box and one. X1 is the chaser on their 2.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rLow' }, [
  { n: 'Their 2 runs off a screen to the corner. X1 chases through it, the box holds.', m: { O2: ['rCorner', 'cut', [430, 130]], X1: [[430, 85], 'cut', [430, 160]] } },
  { n: 'Ball to the left wing. X2 closes out, X4 covers the corner, the box shifts.', b: 'O3', m: { X2: [[95, 230], 'cut'], X4: [[110, 90], 'cut'], X3: [[250, 215], 'cut'], X5: [[270, 100], 'cut'] } }]);
play('Triangle and Two', 'Defense', { notes: 'Two defenders chase their two scorers, three play a triangle zone inside.', tips: ['Triangle: one at the foul line, two on the blocks. Rebound everything, you are outnumbered outside.'], sits: ['vs_zone'], d: { X1: [430, 245], X2: [75, 245], X3: [250, 190], X4: [185, 95], X5: [315, 95] }, first: 'X1 and X2 chase their 2 and 3. X3, X4 and X5 are the triangle.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lLow' }, [
  { n: 'Ball to the corner. X5 runs out, X3 drops to the ball side block, X4 covers the middle.', b: 'O4', m: { X5: [[430, 75], 'cut'], X3: [[300, 105], 'cut'], X4: [[240, 120], 'cut'] } },
  { n: 'Skip to the top. X3 steps back up, X5 recovers to the block.', b: 'O1', m: { X3: [[250, 190], 'cut'], X5: [[315, 95], 'cut'], X4: [[185, 95], 'cut'] } }]);
play('Shell: Help Side', 'Defense', { notes: 'Man to man positioning. Ball side denies, help side has one foot in the lane and sees ball and man.', tips: ['Two passes away: you are in the lane. One pass away: hand in the lane.', 'Jump to the ball on every pass. Move while it is in the air.'], d: man(THEM_HALF), first: 'Shell drill positions against their four out.' }, THEM_HALF, [
  { n: 'Ball to the right wing. X2 pressures, X1 denies the top, X3 drops to help side with a foot in the lane.', b: 'O2', m: { X2: [[400, 225], 'cut'], X1: [[270, 300], 'cut'], X3: [[185, 190], 'cut'], X4: [[420, 110], 'cut'], X5: [[260, 130], 'cut'] } },
  { n: 'Drive baseline. X4 steps up to stop the ball, X3 rotates to the block, X1 drops to the lane.', m: { O2: ['rLow', 'dribble', [445, 130]], X4: [[370, 95], 'cut'], X3: [[230, 100], 'cut'], X1: [[230, 230], 'cut'] } },
  { n: 'Kick out. Everyone closes out high hands, no fly bys.', b: 'O1', m: { X1: [[250, 300], 'cut'], X3: [[110, 215], 'cut'], X2: [[400, 225], 'cut'] } }]);
play('Ice the Side Pick and Roll', 'Defense', { notes: 'Side ball screen: the on ball defender jumps to the high side and forces the dribbler baseline, the big drops.', tips: ['On ball: your chest is on the sideline side. No middle, ever.', 'Big: sit at the level of the block and keep the roller in front of you.'], sits: ['vs_switch'], mirror: ['Ice (right side)', 'Ice (left side)'], d: { X2: [405, 225], X5: [320, 120], X1: [250, 300], X3: [190, 190], X4: [250, 130] }, first: 'Side ball screen coming on the right wing.' }, { O2: 'rWing', O5: [395, 265], O1: 'top', O3: 'lWing', O4: 'lCorner' }, [
  { n: 'X2 jumps to the high side and ices the screen. X5 drops to the block.', m: { X2: [[430, 265], 'cut'], X5: [[330, 100], 'cut'] } },
  { n: 'The ball goes baseline into X5. The roller is behind the ball. X3 tags the roll.', m: { O2: ['rLow', 'dribble', [450, 150]], O5: ['rBlock', 'cut'], X3: [[250, 110], 'cut'], X5: [[340, 95], 'cut'] } },
  { n: 'Contest the pull up, or they kick and X1 and X3 recover.', b: 'rim' }]);
play('Hedge the Pick and Roll', 'Defense', { notes: 'Middle ball screen: the big shows hard to turn the dribbler, then recovers to the roller.', tips: ['Hedge big: two hard steps out, then sprint back. The recovery is the hard part.', 'On ball: fight over the top. Go under and they will shoot it.'], sits: ['vs_switch'], d: { X1: [250, 300], X5: [295, 240], X2: [405, 225], X3: [95, 225], X4: [200, 110] }, first: 'High ball screen at the top from their 5.' }, { O1: 'top', O5: [290, 320], O2: 'rWing', O3: 'lWing', O4: 'lBlock' }, [
  { n: '1 comes off right. X5 hedges hard, X1 fights over.', m: { O1: [[350, 300], 'dribble'], X5: [[340, 320], 'cut'], X1: [[300, 330], 'cut'] } },
  { n: '5 rolls. X5 recovers, X4 bumps the roller until he gets there.', m: { O5: ['rBlock', 'cut', [320, 200]], X5: [[310, 150], 'cut'], X4: [[260, 110], 'cut'] } },
  { n: 'X1 is back on the ball, everyone home.', m: { X1: [[345, 265], 'cut'], X4: [[200, 110], 'cut'] } }]);
play('Switch Everything', 'Defense', { notes: 'Late in the clock or late in the game: switch every screen so nothing is open. Talk early.', tips: ['Call the switch before the screen arrives. Late switches are open shots.'], sits: ['vs_switch', 'run_clock'], d: { X1: [250, 300], X5: [295, 240], X2: [405, 225], X3: [95, 225], X4: [200, 110] }, first: 'High ball screen. We are switching.' }, { O1: 'top', O5: [290, 320], O2: 'rWing', O3: 'lWing', O4: 'lBlock' }, [
  { n: '1 comes off the screen. X5 switches onto the ball, X1 takes the roller.', m: { O1: [[350, 300], 'dribble'], X5: [[345, 310], 'cut'], X1: [[290, 270], 'cut'] } },
  { n: '5 rolls. X1 fronts him, X4 is ready to help from the weak side.', m: { O5: ['rBlock', 'cut', [320, 200]], X1: [[300, 110], 'cut'], X4: [[230, 100], 'cut'] } },
  { n: 'No open shot. Make them beat a contested one.', b: 'rim' }]);

/* ================================================================
   LATE GAME
================================================================ */
play('Need Three: Flare ATO', 'Late game', { notes: 'After a timeout, down three. Two flare screens on the same side so the shooter has two chances.', tips: ['Shooter: if the first screen is switched, keep going to the second one.'], sits: ['ato', 'need3', 'last_shot'], first: 'After a timeout. 2 is the shooter under the rim.' }, { O1: 'top', O2: 'rim', O4: 'lElbow', O5: 'rElbow', O3: 'lCorner' }, [
  { n: '2 comes up the lane. 5 flare screens him to the right wing.', m: { O5: [[335, 250], 'screen'], O2: ['rWing', 'cut', [300, 230]] } },
  { n: 'If he is covered, 4 sets a second flare and 2 keeps going to the corner.', m: { O4: [[400, 170], 'screen'], O2: ['rCorner', 'cut'] } },
  { n: '1 skips it to 2.', b: 'O2' }, { n: 'Three.', b: 'rim' }]);
play('Need Three: Double Drag', 'Late game', { notes: 'Two ball screens in a row at the top. The second big pops for three while the first rolls.', tips: ['1: come off both. Pass to the popper over the top of the roller\'s man.'], sits: ['need3', 'ato'], first: '1 at the top, 4 and 5 in a line above him, 2 and 3 in the corners.' }, { O1: 'topDeep', O4: [270, 320], O5: [310, 300], O2: 'rCorner', O3: 'lCorner' }, [
  { n: '1 comes off 4 then 5 going right.', m: { O1: [[360, 270], 'dribble', [300, 350]] } },
  { n: '4 rolls to the rim. 5 pops to the top.', m: { O4: ['rBlock', 'cut', [300, 220]], O5: ['top', 'cut'] } },
  { n: '1 throws back to 5 for three.', b: 'O5' }, { n: 'Three.', b: 'rim' }]);
play('Need Two: Iso at the Top', 'Late game', { notes: 'Down one or two, last possession. Clear out for your best driver with the clock in mind.', tips: ['Start the drive with 6 on the clock. Shot by 3. Rebounders inside.'], sits: ['need2', 'last_shot'], first: '1 has the ball at the top. Everyone else spaced to the corners and the weak side.' }, { O1: 'topDeep', O2: 'rCorner', O3: 'lCorner', O4: 'lWing', O5: 'rLow' }, [
  { n: '5 clears to the weak side block. 1 attacks right.', m: { O5: ['lBlock', 'cut'], O1: ['rLane', 'dribble', [330, 250]] } },
  { n: 'Score, or kick to 2 if his man helps.', b: 'rim' }]);
play('Need Two: High Ball Screen', 'Late game', { notes: 'Down one or two. A high ball screen with the floor spread gives the driver the whole lane.', tips: ['Screener: screen late, around 7 seconds, so the defense can\'t set up a switch.'], sits: ['need2', 'last_shot', 'ato'], first: '1 at the top, 5 on the nail, shooters in both corners and the weak wing.' }, { O1: 'topDeep', O5: 'nail', O2: 'rCorner', O3: 'lCorner', O4: 'lWing' }, [
  { n: '5 comes up and screens. 1 attacks right.', m: { O5: [[290, 350], 'screen'], O1: [[350, 300], 'dribble'] } },
  { n: '5 rolls. 1 gets downhill.', m: { O5: ['rim', 'cut', [300, 220]], O1: ['rLane', 'dribble'] } },
  { n: 'Layup, roll, or kick to the corner.', b: 'rim' }]);
play('Last Shot Tied: Spread', 'Late game', { notes: 'Tied, holding for the last shot. Spread the floor and go at 6 seconds. Overtime if we miss, never a shot the other way.', tips: ['Hold until 8. Make your move at 6. Shot by 2 so there is a tip but no rebound and run out.'], sits: ['last_shot'], first: '1 dribbling out the clock at the top. Four spaced to the corners and wings.' }, { O1: 'topDeep', O2: 'rCorner', O3: 'lCorner', O4: 'rWing', O5: 'lWing' }, [
  { n: 'At 6, 1 drives the middle. 4 and 5 drift to the corners for space.', m: { O1: ['ft', 'dribble'], O4: [[440, 130], 'cut'], O5: [[60, 130], 'cut'] } },
  { n: 'Pull up at 3, or kick if two come.', b: 'rim' }]);
play('Up Late: Four Corners', 'Late game', { notes: 'Up late, no shot clock. Four in the corners, the ball handler in the middle. Make them foul the guy who makes free throws.', tips: ['The corners come to the ball only when the dribbler is in trouble. Otherwise stay wide.', 'Best free throw shooter has the ball. Period.'], sits: ['run_clock'], first: 'Four corners. 1 is our best free throw shooter.' }, { O1: 'ft', O2: 'rCorner', O3: 'lCorner', O4: 'rDeep', O5: 'lDeep' }, [
  { n: '1 dribbles away from pressure. If trapped, 4 comes to the ball.', m: { O1: ['lSlot', 'dribble'], O4: ['rSlot', 'cut'] } },
  { n: '1 passes to 4 and replaces him in the corner.', b: 'O4', m: { O1: ['rDeep', 'cut'] }, pf: true },
  { n: '4 dribbles out the clock. Only a layup is a shot.', m: { O4: ['top', 'dribble'] } }]);
play('Up Late: Spread Delay', 'Late game', { notes: 'Up late with a shot clock or a little time left. Spread, pass and cut, take only layups.', tips: ['Catch, face, pass, cut. No dribbles unless it is to the rim.'], sits: ['run_clock'], first: 'Five out spread.' }, FIVE_OUT, [
  { n: '1 passes to 2 and cuts to the rim.', b: 'O2', m: { O1: ['rim', 'cut', [290, 230]] }, pf: true },
  { n: 'Nothing there. 1 fills the far corner, 3 fills the top.', m: { O1: ['lCorner', 'cut'], O3: ['top', 'cut'], O5: ['lWing', 'cut'] } },
  { n: '2 reverses to 3 and cuts. Keep going until they foul or give a layup.', b: 'O3', m: { O2: ['rim', 'cut', [330, 240]] }, pf: true }]);
play('Free Throw: Need the Miss', 'Late game', { notes: 'Down two or three, shooting the second free throw, no time to foul. Miss it off the rim and crash.', tips: ['Shooter: hard off the front rim so it comes back long. Rebounders: step in on the release, not the miss.'], sits: ['ft_miss'], first: '1 at the line. 4 and 5 on the low blocks, 2 and 3 above the break.' }, { O1: 'ft', O4: [170, 130], O5: [330, 130], O2: 'rWing', O3: 'lWing', X4: [200, 110], X5: [300, 110] }, [
  { n: '1 misses on purpose, hard off the rim. 4 and 5 step across their men as the ball hits.', m: { O4: [[225, 85], 'cut'], O5: [[275, 85], 'cut'] } },
  { n: 'Tip it in or tip it out to 2 for three.', b: 'O5' }, { n: 'Putback.', b: 'rim' }]);
play('Full Court Under Five', 'Late game', { notes: 'Inbounding the length of the floor with under five seconds. Two screens for the sprinter, pass to the far hash.', tips: ['Receiver: catch and shoot in one motion from the hash if that is all there is. No dribble past 2 seconds.'], sits: ['full_court_short', 'need2', 'need3'], court: 'full', first: '4 inbounds under their basket. 1 at the foul line, 2 and 5 at half court, 3 deep.' }, { O4: 'inb', O1: 'ftLow', O2: 'halfL', O5: 'half', O3: 'upRWing' }, [
  { n: '2 and 5 screen at half court. 1 sprints the right side.', m: { O2: [[200, 480], 'screen'], O5: [[300, 480], 'screen'], O1: ['hashR', 'cut', [330, 600]] } },
  { n: '4 throws it to the far hash. 3 clears to the corner.', b: 'O1', m: { O3: ['upRCorner', 'cut'] } },
  { n: 'One dribble and shoot.', b: 'rim', m: { O1: ['upRWing', 'dribble'] } }]);
play('Up Three: Foul Before the Shot', 'Late game', { notes: 'Up three, under five seconds, they have the ball. Foul before they can shoot a three, then rebound the free throw.', tips: ['Foul with the hands on the body, away from the arms. A shooting foul here loses the game.', 'Only under 5 seconds and only if they haven\'t started a shot.'], sits: ['run_clock'], d: { X1: [250, 290], X2: [405, 225], X3: [95, 225], X4: [185, 110], X5: [315, 110] }, first: 'Up three. They inbound and bring it up.' }, { O1: 'topDeep', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rLow' }, [
  { n: 'X1 picks up the ball at half court. The moment it crosses, grab and wrap.', m: { O1: ['top', 'dribble'], X1: [[255, 330], 'cut'] } },
  { n: 'Two free throws, not three. Box out on the second one.', b: 'O1' }]);

/* ================================================================
   SPECIAL
================================================================ */
play('Jump Ball: Tip to the Wing', 'Special', { notes: 'Opening tip. The jumper taps to the wing on his strong side, the far wing sprints for a layup.', tips: ['Jumper: tap on the way up, not at the top. The ball is yours a half second longer than you think.'], sits: ['tip'], first: 'Center circle. 5 jumps, 1 and 2 on the circle, 3 and 4 back.' }, { O5: [250, 395], O1: [170, 415], O2: [330, 415], O3: [120, 300], O4: [380, 300] }, [
  { n: '5 taps to 2 on the right. 3 releases toward our basket.', b: 'O2', m: { O3: ['lWing', 'cut'] } },
  { n: '2 throws ahead to 3.', b: 'O3' }, { n: 'Layup.', b: 'rim', m: { O3: ['rim', 'dribble'] } }]);
play('Jump Ball: Safe', 'Special', { notes: 'Opening tip when we are not sure we win it. Everyone tips back toward our own defenders so we never give up a layup.', tips: ['Lose the tip, don\'t lose the game. Two back always.'], sits: ['tip'], first: 'Center circle. 5 jumps. 1 and 2 on the circle, 3 and 4 back on our end.' }, { O5: [250, 395], O1: [170, 415], O2: [330, 415], O3: [160, 300], O4: [340, 300] }, [
  { n: '5 taps back to 1. 3 and 4 hold.', b: 'O1' },
  { n: 'We set up in offense. Nothing fast.', m: { O1: ['top', 'dribble'] } }]);
play('Elbow Handoff Fake', 'Special', { notes: 'A trick off the elbow handoff: the big fakes the handback and keeps it for a drive. Once a game.', tips: ['Sell the handoff with your eyes and shoulders. The guard runs through like he got it.'], mirror: ['Handoff Fake (right)', 'Handoff Fake (left)'], first: 'Horns set.' }, HORNS, [
  { n: '1 hits 5 at the elbow and follows for the handoff.', b: 'O5', m: { O1: [[345, 215], 'cut', [310, 280]] }, pf: true },
  { n: '5 fakes the handback and keeps it. 1 runs through to the corner.', m: { O1: ['rCorner', 'cut'] } },
  { n: '5 drives the open lane. 4 clears to the wing.', m: { O5: ['rim', 'dribble', [300, 140]], O4: ['lWing', 'cut'] } }, { n: 'Layup.', b: 'rim' }]);
play('Sideline Lob Tip', 'Special', { notes: 'Sideline out near our basket with one second left. The ball is thrown at the rim and tipped in.', tips: ['Inbounder: throw it to the top of the square. Tippers: go up with two hands.'], sits: ['slob', 'need2', 'last_shot'], first: '3 inbounds from the left sideline near the baseline. 4 and 5 at the blocks.' }, { O3: [-25, 120], O4: 'lBlock', O5: 'rBlock', O1: 'top', O2: 'rWing' }, [
  { n: '4 and 5 step up the lane, then crash the rim as the ball is thrown.', m: { O4: [[215, 70], 'cut', [190, 130]], O5: [[285, 70], 'cut', [310, 130]] } },
  { n: '3 throws it at the rim.', b: 'O5' }, { n: 'Tip in.', b: 'rim' }]);

/* ================================================================
   SCENARIO PACKS: a set of plays plus the end of game tree filled in
================================================================ */
const PACKS = [
  { key: 'late-down3', name: 'Late game: down 3', blurb: 'Two ways to get a three after a timeout, a baseline out for three, and what to do with no time.', plays: ['need-three-flare-ato', 'need-three-double-drag', 'box-elevator', 'sideline-need-three', 'full-court-under-five'],
    endgame: { ball_down3: { play_keys: ['need-three-flare-ato', 'need-three-double-drag'], note: 'Flare ATO first. If they switch everything, Double Drag.' }, inb_blob3: { play_keys: ['box-elevator'], note: 'Elevator. Shooter starts on the slap.' }, inb_slob: { play_keys: ['sideline-need-three'], note: '' }, inb_full: { play_keys: ['full-court-under-five'], note: 'Throw to the far hash, one dribble, shoot.' } } },
  { key: 'late-down12', name: 'Late game: down 1 or 2', blurb: 'A two point play with the floor spread, a high ball screen, a lob under the basket, and the free throw miss.', plays: ['need-two-iso-at-the-top', 'need-two-high-ball-screen', 'blob-need-two-lob-or-corner', 'sideline-back-screen-lob', 'free-throw-need-the-miss'],
    endgame: { ball_down2: { play_keys: ['need-two-high-ball-screen', 'need-two-iso-at-the-top'], note: 'Screen at 7, shot by 3.' }, ball_down1: { play_keys: ['need-two-iso-at-the-top'], note: 'Best driver, everyone else out of the way.' }, inb_blob2: { play_keys: ['blob-need-two-lob-or-corner'], note: 'Lob or corner, nothing else.' } } },
  { key: 'late-tied', name: 'Late game: tied', blurb: 'Hold for the last shot, and the defensive rule so we never lose at the buzzer.', plays: ['last-shot-tied-spread', 'switch-everything'],
    endgame: { ball_tied: { play_keys: ['last-shot-tied-spread'], note: 'Go at 6. Overtime beats a shot the other way.' }, def_tied: { play_keys: ['switch-everything'], note: 'Switch everything, no fouls, no threes.' } } },
  { key: 'protect-lead', name: 'Protect the lead', blurb: 'Run the clock, make them foul the right player, and the up three rule.', plays: ['up-late-four-corners', 'up-late-spread-delay', 'up-three-foul-before-the-shot', 'full-court-deny'],
    endgame: { ball_up12: { play_keys: ['up-late-spread-delay'], note: 'Layups only. Best free throw shooter handles.' }, ball_up3: { play_keys: ['up-late-four-corners'], note: '' }, def_up3: { play_keys: ['up-three-foul-before-the-shot'], note: 'Foul under 5 seconds before the shot goes up.', foul: true }, def_up12: { play_keys: ['switch-everything'], note: 'No fouls. Make them hit a contested two.' }, def_down: { play_keys: ['full-court-deny'], note: 'Deny the inbound, five count, foul the worst shooter if we must.' } } },
  { key: 'beat-the-press', name: 'Beat the press', blurb: 'Five press breaks: the base four across, two guards back, the trap escape, the middle flash, and the long ball.', plays: ['press-break-four-across', 'press-break-one-up-two-back', 'press-break-sideline-trap-escape', 'press-break-middle-flash', 'press-break-long-pass'] },
  { key: 'zone-attack', name: 'Zone attack', blurb: 'Seven ways to play against zones: overload, high low, short corner, skip and drive, screen the zone, and the 1-3-1 and 3-2 answers.', plays: ['zone-overload', 'zone-overload-left', 'zone-high-low', 'zone-short-corner', 'zone-skip-and-drive', 'screen-the-zone', 'vs-1-3-1-corners-and-short-corner', 'vs-3-2-high-post-flash', 'box-vs-zone'] },
  { key: 'inbounds-kit', name: 'Inbounds starter kit', blurb: 'Four baseline plays and three sideline plays that cover a season.', plays: ['box-up', 'box-screen-the-screener', 'line-lob', 'stack-diagonal', 'flat-backdoor', 'sideline-box', 'sideline-stack', 'sideline-hawk'] },
  { key: 'man-offense-kit', name: 'Man offense starter kit', blurb: 'Horns, Flex, a motion, five out and a two man game. Enough to run a season against man.', plays: ['horns-flare', 'horns-dive-and-pop', 'horns-stagger', 'flex', 'motion-weak', 'five-out-cut-and-fill', 'five-out-dribble-handoff', 'ucla-cut', 'pistol', 'spain-pick-and-roll'] },
  { key: 'defense-kit', name: 'Defense starter kit', blurb: 'Shell positioning, two pick and roll coverages, the 2-3 slides and a press.', plays: ['shell-help-side', 'ice-the-side-pick-and-roll', 'hedge-the-pick-and-roll', '2-3-zone-slides', '2-3-zone-vs-high-post', 'diamond-press-1-2-1-1'] },
  { key: 'shooter-pack', name: 'Get the shooter open', blurb: 'Six actions built for your best shooter: Floppy, Zipper, Elevator, Hammer, Horns Stagger, Chicago.', plays: ['floppy', 'zipper', 'elevator-doors', 'hammer', 'horns-stagger', 'chicago'] },
];


/* ================================================================
   WAVE TWO: quick hitters, transition, more inbounds, more zone, more
   defense, situational plays, specials
================================================================ */
play('Drag Screen', 'Offense', { notes: 'Transition ball screen from the trailing big before the defense is set. The first thing we look for after a rebound.', tips: ['5: sprint to the ball and screen on the run. No standing screens in transition.', '1: use the screen by the 3 point line, not inside it, so the defense has to decide early.'], sits: ['transition', 'quick'], mirror: ['Drag Screen (right)', 'Drag Screen (left)'], first: '1 pushes it up the right side. 5 trails. 2 and 3 run wide, 4 runs to the rim.' }, { O1: 'rSlot', O5: 'topDeep', O2: 'rCorner', O3: 'lCorner', O4: 'lBlock' }, [
  { n: '5 drags into a screen on the run. 1 comes off middle.', m: { O5: [[300, 330], 'screen'], O1: ['nail', 'dribble', [280, 310]] } },
  { n: '5 rolls, 4 lifts out of the dunker spot to the wing. Read the low man.', m: { O5: ['rBlock', 'cut', [330, 200]], O4: ['lWing', 'cut'] } },
  { n: 'Finish, roll, or kick to a corner.', b: 'rim' }]);
play('Secondary Break: Pitch and Post', 'Offense', { notes: 'Numbered break into early offense. Pitch ahead to the wing, the first big posts, the second big screens the wing.', tips: ['Run lanes, not toward the ball. The wings touch the sideline.', 'First big to the rim every time. He posts or he gets fouled.'], sits: ['transition'], mirror: ['Pitch and Post (right)', 'Pitch and Post (left)'], first: 'Numbered break: 1 middle, 2 and 3 wide, 4 rim runs, 5 trails.' }, { O1: 'topDeep', O2: 'rWing', O3: 'lWing', O4: 'rBlock', O5: [250, 400] }, [
  { n: '1 pitches ahead to 2 on the wing.', b: 'O2' },
  { n: '4 posts on the ball side block. 5 trails to the top.', m: { O5: ['top', 'cut'] } },
  { n: 'Post feed, or 5 reverses to 3 and screens for 1.', b: 'O4' }, { n: 'Score inside.', b: 'rim' }]);
play('Elbow Get', 'Offense', { notes: 'Quick hitter: pass to the elbow, get it right back with a handoff and a screen in one motion.', tips: ['Get action: catch the handoff going downhill. The big is already screening when you get there.'], sits: ['quick', 'need2'], mirror: ['Elbow Get (right)', 'Elbow Get (left)'], first: '1 at the top, 5 at the right elbow, shooters spaced.' }, { O1: 'top', O5: 'rElbow', O2: 'rCorner', O3: 'lWing', O4: 'lCorner' }, [
  { n: '1 passes to 5 and sprints to get it back.', b: 'O5', m: { O1: [[345, 225], 'cut', [310, 290]] }, pf: true },
  { n: 'Handoff and screen. 1 attacks the lane, 5 rolls.', b: 'O1', m: { O5: [[335, 230], 'screen'], O1: ['rLane', 'dribble'] } },
  { n: 'Layup, roll, or corner.', b: 'rim', m: { O5: ['rBlock', 'cut'] } }]);
play('Wide Pin Down', 'Offense', { notes: 'Quick hitter for a shooter: a big pins down on the wing and the shooter comes off for a catch and shoot or a curl.', tips: ['Shooter: read the trailer. Over the top means curl, under means pop.'], sits: ['quick', 'need3'], mirror: ['Wide Pin Down (right)', 'Wide Pin Down (left)'], first: '1 at the top with the ball. 2 in the right corner, 5 at the right elbow.' }, { O1: 'top', O2: 'rCorner', O5: 'rElbow', O3: 'lWing', O4: 'lBlock' }, [
  { n: '5 pins down on 2\'s man. 2 comes up to the wing.', m: { O5: [[430, 150], 'screen'], O2: ['rWing', 'cut', [470, 150]] } },
  { n: '1 hits 2. 5 rolls to the block.', b: 'O2', m: { O5: ['rBlock', 'cut'] } }, { n: 'Shot, or drive if he runs at you.', b: 'rim' }]);
play('Ram Screen', 'Offense', { notes: 'Screen the screener before a ball screen. The big\'s defender is late, so the ball screen gets a clean switch or a free roll.', tips: ['3: screen the big\'s man first. That is the whole trick.'], sits: ['quick', 'vs_switch'], mirror: ['Ram (right)', 'Ram (left)'], first: '1 at the top, 5 on the right block, 3 on the right wing.' }, { O1: 'top', O5: 'rBlock', O3: 'rWing', O2: 'lCorner', O4: 'lWing' }, [
  { n: '3 back screens for 5. 5 sprints up to ball screen.', m: { O3: [[320, 130], 'screen'], O5: [[295, 318], 'cut', [300, 220]] } },
  { n: '1 comes off the ball screen. 5 rolls, 3 pops to the wing.', m: { O1: [[350, 290], 'dribble'], O5: ['rim', 'cut', [300, 190]], O3: ['rWing', 'cut'] } },
  { n: 'Finish or roll.', b: 'rim' }]);
play('Stagger Away', 'Offense', { notes: 'Pass to the wing, then two players stagger screen for the corner shooter on the weak side.', tips: ['Staggers only work shoulder to shoulder. Close the gap.'], sits: ['quick', 'need3'], mirror: ['Stagger Away (right)', 'Stagger Away (left)'], first: '1 at the top, 2 on the right wing, 3 in the left corner, 4 and 5 at the elbows.' }, { O1: 'top', O2: 'rWing', O3: 'lCorner', O4: 'lElbow', O5: 'rElbow' }, [
  { n: '1 passes to 2. 4 and 5 go set a stagger for 3.', b: 'O2', m: { O4: [[110, 170], 'screen'], O5: [[150, 230], 'screen'] }, pf: true },
  { n: '3 comes off both screens to the top.', m: { O3: ['lTop', 'cut', [80, 290]] } },
  { n: '2 swings to 1, 1 to 3. Shot.', b: 'O3' }, { n: 'Three.', b: 'rim' }]);
play('Post Split', 'Offense', { notes: 'Feed the post, then the two perimeter players split off each other. A read, not a play: the cutter or the shooter.', tips: ['Passer screens away, screener comes to the ball. Big reads it late.'], sits: ['post_entry'], mirror: ['Post Split (right)', 'Post Split (left)'], first: '2 on the right wing with the ball, 5 on the block, 1 at the top.' }, { O2: 'rWing', O5: 'rBlock', O1: 'top', O3: 'lWing', O4: 'lBlock' }, [
  { n: '2 feeds 5 on the block.', b: 'O5' },
  { n: '2 screens for 1. 1 curls to the wing.', m: { O2: [[340, 300], 'screen'], O1: ['rWing', 'cut', [380, 320]] } },
  { n: '2 pops back to the top. 5 reads the cutter, then the popper.', m: { O2: ['top', 'cut'] } },
  { n: '5 scores, or kicks to whoever is open.', b: 'rim' }]);
play('High Low', 'Offense', { notes: 'Two bigs: one at the high post, one sealing low. The simplest way to get the ball inside against size.', tips: ['Low man seals on the catch high, not before. Hands up, target hand.'], sits: ['post_entry', 'need2'], mirror: ['High Low (right)', 'High Low (left)'], first: '4 at the right elbow, 5 on the left block, guards spaced.' }, { O1: 'top', O4: 'rElbow', O5: 'lBlock', O2: 'rCorner', O3: 'lWing' }, [
  { n: '1 hits 4 at the elbow. 5 seals his man high side.', b: 'O4', m: { O5: ['lLow', 'cut'] } },
  { n: '4 drops it to 5 over the top.', b: 'O5' }, { n: 'Power finish.', b: 'rim' }]);
play('Spread Pick and Roll', 'Offense', { notes: 'Four shooters, one screener, the whole lane open. Late clock offense that always produces a shot.', tips: ['Shooters: stay on the three point line until the ball is below the free throw line, then relocate.'], sits: ['short_clock', 'bonus'], mirror: ['Spread PNR (right)', 'Spread PNR (left)'], first: '1 at the top, 5 on the nail, shooters in both corners and the left wing.' }, { O1: 'topDeep', O5: 'nail', O2: 'rCorner', O3: 'lCorner', O4: 'lWing' }, [
  { n: '5 screens. 1 attacks right.', m: { O5: [[290, 350], 'screen'], O1: [[345, 300], 'dribble'] } },
  { n: '5 rolls. 4 lifts, 3 slides to the corner.', m: { O5: ['rim', 'cut', [300, 210]], O4: ['lSlot', 'cut'], O3: ['lCorner', 'cut'] } },
  { n: 'Finish, roll, or skip.', b: 'rim' }]);
play('Attack the Bonus', 'Offense', { notes: 'They are in the bonus. No jumpers for two minutes: drive, post, and get fouled.', tips: ['Drive to the body of the help defender. Contact wins free throws.'], sits: ['bonus'], first: 'Four out, best driver with the ball, big on the block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rBlock' }, [
  { n: '1 drives the left gap hard. Everyone stays spaced.', m: { O1: ['lLane', 'dribble'] } },
  { n: 'Jump stop in the lane. Score through contact or hit 5 if his man helps.', b: 'rim' }]);
play('Star Sits: Five Out Motion', 'Offense', { notes: 'When your best player is on the bench in foul trouble. Nobody has to make a play: pass, cut, fill, repeat until a layup comes.', tips: ['No dribbles except to the rim. Three passes before anyone shoots.'], sits: ['foul_trouble', 'run_clock'], first: 'Five out, the four remaining starters and a sub.' }, FIVE_OUT, [
  { n: 'Pass and cut. Fill behind.', b: 'O2', m: { O1: ['rim', 'cut', [290, 230]] }, pf: true },
  { n: '1 fills the far corner, everyone slides up one spot.', m: { O1: ['lCorner', 'cut'], O3: ['top', 'cut'], O5: ['lWing', 'cut'] } },
  { n: 'Backdoor the first man who overplays.', b: 'rim', m: { O4: ['rim', 'cut', [430, 120]] } }]);
play('Two for One', 'Offense', { notes: 'Under 40 seconds in a quarter: shoot in the first 8 so you get the ball back for the last shot.', tips: ['Push it. A decent shot now beats a good shot that gives them the last one.'], sits: ['two_for_one', 'end_quarter'], first: 'We rebound with 38 seconds left in the quarter.' }, { O1: 'topDeep', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lBlock' }, [
  { n: '1 pushes it. 5 drags into a quick screen.', m: { O5: [[290, 350], 'screen'], O1: [[340, 300], 'dribble'] } },
  { n: 'First open look, inside 8 seconds. Then get back and defend.', b: 'rim' }]);
play('Hold for the Quarter', 'Offense', { notes: 'Last 30 seconds of a quarter, we have the ball. Spread, hold to 8, attack at 6.', tips: ['No turnover is worth any shot here. Take care of it until 8.'], sits: ['end_quarter'], first: '1 holds at the top, four spread wide.' }, { O1: 'topDeep', O2: 'rCorner', O3: 'lCorner', O4: 'rWing', O5: 'lWing' }, [
  { n: 'At 8, 5 steps up and screens. 1 attacks at 6.', m: { O5: [[215, 350], 'screen'], O1: [[160, 300], 'dribble'] } },
  { n: 'Shot by 2 seconds. Two rebounders crash, three back.', b: 'rim' }]);
play('Down Big: Push and Three', 'Offense', { notes: 'Down 12 with four minutes. Every rebound is a sprint, every open three goes up, and we press after every make.', tips: ['Shoot threes early in the clock, not late. A quick three is worth it, a slow three is not.'], sits: ['down_big'], first: 'Rebound and go. Wings sprint to the corners.' }, { O1: 'topDeep', O2: 'rCorner', O3: 'lCorner', O4: 'rWing', O5: [250, 405] }, [
  { n: '1 pushes to the wing and kicks to the corner.', b: 'O2', m: { O1: ['rWing', 'dribble'] } },
  { n: 'Corner three, or drive and kick again. 5 crashes.', b: 'rim', m: { O5: ['rBlock', 'cut'] } }]);
play('Against Box and One: Screen for the Chased', 'Offense', { notes: 'When one defender face guards our shooter. Screen the chaser constantly and let the other four play four on four.', tips: ['Shooter: keep moving even when you are not getting it. You are taking a defender out of the game.'], sits: ['vs_box1'], mirror: ['Vs Box and One (right)', 'Vs Box and One (left)'], d: { X2: [440, 230], X1: [250, 290], X3: [190, 210], X4: [180, 95], X5: [320, 95] }, first: 'Their X2 is face guarding our 2 on the right wing.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  { n: '5 back screens the chaser. 2 cuts to the rim.', m: { O5: [[420, 200], 'screen'], O2: ['rim', 'cut', [400, 130]] } },
  { n: 'If 2 isn\'t open, 4 and 1 play two man game on the other side.', m: { O2: ['lCorner', 'cut'], O4: [[215, 300], 'screen'], O1: ['lLane', 'dribble'] } },
  { n: 'Score four on four, or 2 pops up for the skip.', b: 'rim' }]);
play('Against the Half Court Trap', 'Offense', { notes: 'When they trap the first pass past half court. Reverse before the trap sets, and flash the middle.', tips: ['Pass out of the trap over the top to the middle flash, not around it to the sideline.'], sits: ['vs_trap', 'vs_press'], d: { X1: [250, 300], X2: [110, 200], X3: [390, 200], X4: [250, 185], X5: [250, 75] }, first: 'They are in a 1-3-1 trap. 1 crosses half court on the right.' }, { O1: 'rSlot', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'nail' }, [
  { n: 'Trap comes at 1. 5 flashes to the ball side elbow, 3 lifts to the top.', m: { X1: [[320, 300], 'cut'], X3: [[380, 270], 'cut'], O5: ['rElbow', 'cut'], O3: ['top', 'cut'] } },
  { n: '1 hits 5 in the middle over the trap.', b: 'O5' },
  { n: '5 turns: 4 in the corner, 2 on the baseline, or his own shot.', b: 'O4' }, { n: 'Corner three.', b: 'rim' }]);
play('Against the Pack Line: Skip and Drive', 'Offense', { notes: 'When they pack the paint and dare you to shoot. Move the ball side to side twice, then drive the closeout.', tips: ['Drive the closeout, not the set defender. The pass makes the drive.'], sits: ['vs_pack'], first: 'Five out, defense packed inside the arc.' }, FIVE_OUT, [
  { n: '1 swings to 2, 2 skips to 3.', b: 'O3' },
  { n: '3 drives the closeout. 5 cuts to the rim from the corner.', m: { O3: ['lLane', 'dribble'], O5: ['rim', 'cut', [120, 110]] } },
  { n: 'Finish, dump, or kick to 4.', b: 'rim' }]);
play('Against Pressure: Backdoor Series', 'Offense', { notes: 'When they deny every pass. Three backdoor reads in a row off the same look.', tips: ['Two steps to the ball, plant, go. The passer throws it where you are going.'], sits: ['vs_pressure', 'vs_switch'], first: 'Four out, denial on both wings.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rLow' }, [
  { n: '2 steps up and goes backdoor. 1 bounce passes.', b: 'O2', m: { O2: ['rBlock', 'cut', [450, 170]] } },
  { n: 'Not there: 2 clears to the corner. 3 does the same on the left.', m: { O2: ['rCorner', 'cut'], O3: ['lBlock', 'cut', [50, 170]] } },
  { n: 'Not there: 5 flashes to the elbow and 1 goes backdoor off him.', b: 'O5', m: { O5: ['rElbow', 'cut'], O1: ['rim', 'cut', [200, 260]] } }, { n: 'Layup.', b: 'rim' }]);
/* zone, wave two */
play('1-2-2 Zone Attack', 'Offense', { notes: 'Against any even front zone. Point, two wings, two short corners: the gaps are always filled.', tips: ['Short corners: step in behind the bottom defenders the moment the ball is on the wing.'], sits: ['vs_zone'], d: Z23, first: '1 at the top, wings high, 4 and 5 in the short corners against a 2-3.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lShort', O5: 'rShort' }, [
  { n: '1 passes to 2. 5 steps in behind the zone.', b: 'O2', m: { O5: ['rLane', 'cut'] } },
  { n: '2 feeds 5 inside, or skips to 3.', b: 'O5' }, { n: 'Score, or 5 finds 4 flashing to the elbow.', b: 'rim', m: { O4: ['lElbow', 'cut'] } }]);
play('Runner Through the Zone', 'Offense', { notes: 'Against a 2-3. One player runs baseline corner to corner behind the zone. Every pass, he runs.', tips: ['Runner: you arrive as the ball arrives. Late is useless, early is covered.'], sits: ['vs_zone'], d: Z23, first: '1 up top, 2 and 3 on the wings, 4 at the high post, 5 is the runner in the right corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: 'rCorner' }, [
  { n: '1 passes to 3 on the left. 5 runs the baseline to the left corner.', b: 'O3', m: { O5: ['lCorner', 'cut', [250, 40]] } },
  { n: '3 hits 5 in the corner, or 4 steps in to the block.', b: 'O5', m: { O4: ['lLow', 'cut'] } }, { n: 'Three, or feed 4 inside.', b: 'rim' }]);
play('Zone: Dribble Push', 'Offense', { notes: 'Against a 2-3. Dribble at the top guard to drag him, the wing he leaves is open.', tips: ['Dribble at a defender, never between two.'], sits: ['vs_zone'], d: Z23, mirror: ['Dribble Push (right)', 'Dribble Push (left)'], first: '1 up top, wings, 5 at the high post, 4 in the short corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O5: 'ft', O4: 'rShort' }, [
  { n: '1 dribbles right at the top guard. 2 slides to the corner.', m: { O1: ['rSlot', 'dribble'], O2: ['rCorner', 'cut'], X2: [[350, 250], 'cut'] } },
  { n: 'The wing is open. 1 hits 2 in the corner as the bottom man runs out.', b: 'O2', m: { X4: [[430, 90], 'cut'] } },
  { n: '2 shoots, or feeds 4 in the short corner behind him.', b: 'rim' }]);
play('Zone BLOB: Line', 'Baseline out', { notes: 'Baseline out against a zone. Four in a line, the bottom of the zone can\'t match up.', tips: ['Against a zone the inbounder is open: step in after the pass.'], sits: ['blob', 'blob_zone', 'vs_zone'], d: { X1: [200, 250], X2: [300, 250], X3: [110, 110], X4: [390, 110], X5: [250, 80] }, first: 'Four in a line on the ball side lane line, 3 inbounds.' }, { O3: 'inbMid', O5: [300, 100], O4: [300, 145], O2: [300, 190], O1: [300, 235] }, [
  { n: '5 steps to the short corner, 4 to the block, 2 to the corner, 1 to the top.', m: { O5: ['rShort', 'cut'], O4: ['rBlock', 'cut'], O2: ['rCorner', 'cut'], O1: ['top', 'cut'] } },
  { n: '3 hits 2 in the corner or 5 in the short corner, then steps in.', b: 'O5', m: { O3: ['rLow', 'cut'] } }, { n: 'Score.', b: 'rim' }]);
/* inbounds, wave two */
play('Zipper BLOB', 'Baseline out', { notes: 'Baseline out. A guard zips up the lane off a down screen to the top, then the big dives.', tips: ['Safety first: the zipper cut gets the ball in. The dive is the score.'], sits: ['blob'], first: '3 inbounds. 1 on the ball side block, 5 at the ball side elbow, 2 and 4 weak side.' }, { O3: 'inbMid', O1: 'rBlock', O5: 'rElbow', O2: 'lWing', O4: 'lBlock' }, [
  { n: '5 screens down. 1 zips to the top.', m: { O5: [[300, 150], 'screen'], O1: ['top', 'cut', [300, 230]] } },
  { n: '3 hits 1. 5 dives to the rim, 4 lifts.', b: 'O1', m: { O5: ['rim', 'cut'], O4: ['lWing', 'cut'] } },
  { n: '1 hits 5 on the dive or runs offense.', b: 'O5' }, { n: 'Layup.', b: 'rim' }]);
play('Triangle BLOB', 'Baseline out', { notes: 'Three in a triangle under the rim, one safety. Two screens happen at once, the inbounder has three looks.', tips: ['Triangle players: everybody screens, everybody cuts. Decide who scores before the slap.'], sits: ['blob', 'need2'], first: '3 inbounds. 4 and 5 on the blocks, 2 at the foul line, 1 at the top.' }, { O3: 'inbMid', O4: 'lBlock', O5: 'rBlock', O2: 'ft', O1: 'top' }, [
  { n: '2 screens for 4. 4 cuts under it to the ball side.', m: { O2: [[215, 110], 'screen'], O4: ['rLow', 'cut', [250, 70]] } },
  { n: '5 steps up and screens for 2. 2 pops to the wing.', m: { O5: [[260, 150], 'screen'], O2: ['rWing', 'cut', [300, 180]] } },
  { n: '3 hits 4 at the rim, 2 on the wing, or 1 for safety.', b: 'O4' }, { n: 'Layup.', b: 'rim' }]);
play('Box Screen Away', 'Baseline out', { notes: 'Baseline out. The weak side screens away and the ball side opens for a layup off a single screen.', tips: ['The first cutter is the decoy. Sell it.'], sits: ['blob'], first: 'Box set, 3 inbounds.' }, BOX_BLOB, [
  { n: '1 screens away for 2. 2 comes to the ball side elbow.', m: { O1: [[280, 190], 'screen'], O2: [[340, 200], 'cut', [330, 230]] } },
  { n: '4 screens down for 1. 1 pops to the far corner. 5 seals to the rim.', m: { O4: [[200, 150], 'screen'], O1: ['lCorner', 'cut'], O5: ['rim', 'cut'] } },
  { n: '3 hits 5 at the rim or 2 at the elbow.', b: 'O5' }, { n: 'Layup.', b: 'rim' }]);
play('Stack vs Man: Pop and Dive', 'Baseline out', { notes: 'Baseline out against man. Stack of three on the ball side, the top pops, the bottom dives, the middle screens both.', tips: ['Middle man sets two screens with one body. Face the inbounder.'], sits: ['blob'], first: '3 inbounds. Stack of 1, 4, 5 on the ball side lane line, 2 at the top.' }, { O3: 'inbMid', O1: [305, 100], O4: [305, 145], O5: [305, 190], O2: 'top' }, [
  { n: '1 dives under 4 to the far block. 5 pops to the corner. 4 holds.', m: { O1: ['lBlock', 'cut', [250, 70]], O5: ['rCorner', 'cut'] } },
  { n: '4 steps to the ball side. 3 hits 4 or 5.', b: 'O4', m: { O4: ['rLow', 'cut'] } }, { n: 'Score.', b: 'rim' }]);
play('Sideline Stagger Shooter', 'Sideline out', { notes: 'Sideline out in the front court. Two screens on the weak side for the shooter coming to the top.', tips: ['Inbounder passes to the top as the shooter arrives, not after.'], sits: ['slob', 'need3'], first: '3 inbounds from the left. 2 is the shooter on the right block.' }, { O3: 'sideL', O1: 'lSlot', O2: 'rBlock', O4: 'rElbow', O5: 'rWing' }, [
  { n: '4 and 5 stagger for 2. 2 comes to the top. 1 drifts to the corner.', m: { O4: [[330, 180], 'screen'], O5: [[320, 260], 'screen'], O2: ['top', 'cut', [380, 230]], O1: ['lCorner', 'cut'] } },
  { n: '3 hits 2.', b: 'O2' }, { n: 'Three.', b: 'rim' }]);
play('Sideline Backcourt Safe', 'Sideline out', { notes: 'Sideline out in the back court against pressure. Two options short, one long, and the inbounder gets it back.', tips: ['Get it in, then get it back to the inbounder stepping in behind the play. He is the only one nobody guards.'], sits: ['slob', 'slob_backcourt', 'vs_press'], court: 'full', first: '3 inbounds from the left sideline in the back court.' }, { O3: 'sideLow', O1: [120, 640], O2: [220, 700], O4: [120, 780], O5: 'half' }, [
  { n: '4 screens for 1. 1 comes back to the ball. 2 clears to the middle.', m: { O4: [[150, 690], 'screen'], O1: [[70, 720], 'cut', [120, 700]], O2: ['centerLow', 'cut'] } },
  { n: '3 hits 1 and steps in. 1 returns it to 3 in the middle.', b: 'O3', m: { O3: [[150, 650], 'cut'] } },
  { n: '3 pushes it up. 5 comes back to help if trapped.', m: { O3: ['halfL', 'dribble'], O5: [[250, 520], 'cut'] } }]);
play('Up Late: Inbound and Get Fouled', 'Sideline out', { notes: 'Up two, under 20 seconds, they must foul. Get the ball to your best free throw shooter and let them.', tips: ['Shooter breaks to the ball late and hard. Catch it with two hands and get fouled, don\'t dribble into a trap.'], sits: ['up_inbound', 'run_clock', 'slob'], court: 'full', first: '3 inbounds under their basket. 1 is our best free throw shooter.' }, { O3: 'inb', O1: [250, 720], O2: [110, 640], O4: [390, 640], O5: 'half' }, [
  { n: '4 screens for 1. 1 breaks to the corner for the catch. 2 and 5 clear deep.', m: { O4: [[300, 740], 'screen'], O1: [[430, 760], 'cut', [330, 700]], O2: ['highL', 'cut'], O5: ['upTop', 'cut'] } },
  { n: '3 hits 1. 1 catches, pivots away, and takes the foul.', b: 'O1' }]);
/* defense and presses, wave two */
play('Full Court Man Principles', 'Defense', { notes: 'Picking up full court. Turn the ball handler twice before half court, no reaching, sprint back on any pass over your head.', tips: ['Force the dribbler to change direction. Every turn costs them two seconds.'], sits: ['vs_press'], court: 'full', first: 'They inbound, we pick up man to man full court.' }, { O4: 'inb', O1: [330, 720], O2: [120, 640], O3: [390, 480], O5: 'half', X1: [330, 680], X2: [140, 600], X3: [370, 440], X5: [250, 400], X4: [300, 820] }, [
  { n: 'X1 turns the ball handler toward the sideline.', m: { O1: [[420, 620], 'dribble'], X1: [[400, 590], 'cut'] } },
  { n: 'And turns him again at half court. Everyone else denies one pass away, help side sees the ball.', m: { O1: [[330, 470], 'dribble'], X1: [[320, 440], 'cut'], X3: [[380, 400], 'cut'] } }]);
play('Deny the Post', 'Defense', { notes: 'How we guard a dominant post: three quarter front from the top side, help from the weak side on the lob.', tips: ['Post defender: arm bar, hand in the passing lane, never behind him.', 'Weak side: you are the lob help. See it coming.'], sits: ['post_entry'], d: { X5: [280, 95], X1: [250, 300], X2: [405, 225], X3: [150, 190], X4: [200, 110] }, first: 'Ball on the right wing, their 5 posting on the right block.' }, { O2: 'rWing', O5: 'rBlock', O1: 'top', O3: 'lWing', O4: 'lBlock' }, [
  { n: 'X5 three quarter fronts from the high side. X3 drops to the lane for lob help.', m: { X5: [[295, 70], 'cut'], X3: [[220, 120], 'cut'] } },
  { n: 'They lob. X3 takes it away, X5 recovers behind.', m: { O2: ['rWing', 'cut'], X3: [[265, 85], 'cut'] } }]);
play('2-3 Trap the Corner', 'Defense', { notes: 'Out of the 2-3 zone: when the ball goes to the corner, trap it with the bottom man and the guard, and rotate behind.', tips: ['Trap after the catch with hands high. The skip pass is the one steal we want.'], sits: ['vs_zone'], d: Z23, first: 'Base 2-3. The ball goes to the right corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lLow' }, [
  { n: 'X4 and X2 trap the corner. X5 fronts the block, X1 takes the wing, X3 the middle.', b: 'O4', m: { X4: [[440, 75], 'cut'], X2: [[420, 110], 'cut'], X5: [[320, 80], 'cut'], X1: [[380, 220], 'cut'], X3: [[230, 120], 'cut'] } },
  { n: 'Skip pass: X3 sprints to it, X1 drops, everyone recovers.', b: 'O3', m: { X3: [[85, 225], 'cut'], X1: [[200, 262], 'cut'], X2: [[300, 262], 'cut'], X4: [[400, 130], 'cut'], X5: [[250, 92], 'cut'] } }]);
play('1-2-2 Three Quarter Press', 'Press', { notes: 'Picks up at the top of their key, not the baseline. Funnels to the sideline and traps at half court with two.', tips: ['Front man: no steals, just steer. The trap is at the line.'], sits: ['vs_press'], court: 'full', first: 'X1 at the foul line extended, X2 and X3 at the hash marks, X4 and X5 back.' }, { ...THEM_INB, X1: [250, 620], X2: [120, 500], X3: [380, 500], X4: [150, 300], X5: [350, 300] }, [
  { n: 'They bring it up the right. X1 steers to the sideline, X3 waits at the line.', b: 'O1', m: { O1: [[400, 540], 'dribble'], X1: [[340, 560], 'cut'] } },
  { n: 'Trap at half court with X1 and X3. X5 takes the sideline pass, X2 the middle, X4 deep.', m: { O1: [[420, 440], 'dribble'], X3: [[430, 470], 'cut'], X1: [[380, 470], 'cut'], X5: [[400, 300], 'cut'], X2: [[250, 440], 'cut'], X4: [[250, 200], 'cut'] } },
  { n: 'Steal or a five count. If they beat it, sprint back.', b: 'O1' }]);
play('Press After a Made Free Throw', 'Press', { notes: 'The best time to press: after we make a free throw, our shooter is already back and their inbounder is slow.', tips: ['Shooter: you are the safety. Everyone else picks up on the make.'], sits: ['ft_make', 'vs_press'], court: 'full', first: 'We just made the free throw. They inbound under their basket.' }, { ...THEM_INB, X1: [300, 800], X2: [140, 690], X3: [380, 690], X4: [250, 520], X5: [250, 300] }, [
  { n: 'X1 on the inbounder. X2 and X3 deny the guards.', m: { X2: [[160, 710], 'cut'], X3: [[350, 710], 'cut'] } },
  { n: 'Inbound to the right. X3 and X1 trap. X4 reads the sideline.', b: 'O1', m: { O1: [[400, 730], 'cut'], X1: [[370, 760], 'cut'], X3: [[420, 690], 'cut'], X4: [[380, 520], 'cut'] } }]);
/* late game and specials, wave two */
play('Seven Seconds: Drag to a Shot', 'Late game', { notes: 'Seven seconds or less, no timeout. Push, drag screen at the arc, shot by two.', tips: ['Do not call timeout. The defense is worse now than it will be after one.'], sits: ['short_clock', 'need2', 'last_shot'], court: 'full', first: 'We rebound with 7 seconds left. 1 pushes.' }, { O1: 'centerLow', O5: 'ftLow', O2: 'hashL', O3: 'hashR', O4: 'upLWing' }, [
  { n: '1 sprints it up the middle. 5 trails.', m: { O1: ['half', 'dribble'], O5: [[250, 520], 'cut'], O2: ['upLCorner', 'cut'], O3: ['upRCorner', 'cut'] } },
  { n: '5 drags into a screen at the arc. 1 turns the corner.', m: { O5: [[290, 350], 'screen'], O1: [[330, 290], 'dribble', [260, 400]] } },
  { n: 'Pull up or layup. Shot by 2.', b: 'rim', m: { O1: ['upFt', 'dribble'] } }]);
play('Technical Foul Free Throws', 'Special', { notes: 'Who shoots, who stays back, and what we run after. Decide now, not when the ref hands over the ball.', tips: ['Best free throw shooter shoots both. Everyone else lines up at half court, no rebound to fight for.'], sits: ['tech_ft'], first: '1 at the line alone. Four at half court, ready to run the next play.' }, { O1: 'ft', O2: 'lHalf', O3: 'midHalf', O4: 'rHalf', O5: [330, 410] }, [
  { n: '1 shoots both. The others walk to our end for the inbound.', b: 'rim' },
  { n: 'Then we run the sideline play we called in the huddle.', b: 'O1' }]);
play('Held Ball: Arrow Set', 'Special', { notes: 'When the possession arrow gives us a sideline inbound. The same quick set every time, so nobody has to think.', tips: ['Know the arrow before the whistle. The bench calls it out.'], sits: ['slob', 'quick'], first: 'Arrow is ours. 3 inbounds from the left sideline.' }, SLOB, [
  { n: '4 screens for 1 coming to the ball. 5 back screens for 2 to the rim.', m: { O4: [[205, 300], 'screen'], O1: [[120, 290], 'cut', [200, 345]], O5: [[140, 150], 'screen'], O2: ['rim', 'cut', [170, 90]] } },
  { n: '3 hits 2 at the rim or 1 for safety.', b: 'O1' }, { n: 'Run offense.', b: 'O4', m: { O4: ['top', 'cut'] } }]);
play('Last Second Heave', 'Special', { notes: 'Under two seconds, full court. Long inbound to half court, catch and shoot in one motion.', tips: ['Inbounder: throw it to the top of the key, chest high. Receiver: catch and shoot, no dribble.'], sits: ['full_court_short', 'need3', 'need2'], court: 'full', first: '4 inbounds under their basket. 1 is our best shooter at half court, 5 screens his man.' }, { O4: 'inb', O1: 'half', O5: [250, 470], O2: 'highL', O3: 'highR' }, [
  { n: '5 screens for 1. 1 flashes to the top of our key.', m: { O5: [[270, 450], 'screen'], O1: ['upTop', 'cut'] } },
  { n: '4 throws it the length of the floor.', b: 'O1' }, { n: 'Catch and shoot.', b: 'rim' }]);
play('Fake Timeout Backdoor', 'Special', { notes: 'A trick for once a season. The point guard walks toward the bench like he is calling timeout, and the wing goes backdoor.', tips: ['Sell it with your voice. Say "time" without saying "timeout".'], sits: ['quick'], first: 'Dead ball situation is over, 1 has the ball at the top, defense relaxed.' }, { O1: 'topDeep', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  { n: '1 turns toward the bench. 2 goes backdoor behind a relaxed defender.', m: { O1: ['lSlot', 'dribble'], O2: ['rim', 'cut', [450, 170]] } },
  { n: '1 whips the pass.', b: 'O2' }, { n: 'Layup.', b: 'rim' }]);

PACKS.push(
  { key: 'quick-hitters', name: 'Quick hitters', blurb: 'Eight one action plays for the first six seconds of a possession: get, pin down, ram, stagger away, drag.', plays: ['elbow-get', 'elbow-get-left', 'wide-pin-down', 'ram-screen', 'stagger-away', 'drag-screen', 'spread-pick-and-roll', 'held-ball-arrow-set'] },
  { key: 'transition', name: 'Transition and early offense', blurb: 'Numbered break into early offense, the drag screen, and the two for one.', plays: ['secondary-break-pitch-and-post', 'secondary-break-pitch-and-post-left', 'drag-screen', 'drag-screen-left', 'two-for-one'] },
  { key: 'end-of-quarter', name: 'End of quarter', blurb: 'Two for one, hold for the last shot, and the seven second play with no timeout.', plays: ['two-for-one', 'hold-for-the-quarter', 'seven-seconds-drag-to-a-shot'] },
  { key: 'star-in-foul-trouble', name: 'Star in foul trouble', blurb: 'Offense that needs nobody special: five out motion, the backdoor series, high low, and attacking the bonus.', plays: ['star-sits-five-out-motion', 'against-pressure-backdoor-series', 'high-low', 'attack-the-bonus', 'five-out-cut-and-fill'] },
  { key: 'junk-defenses', name: 'Against junk defenses and traps', blurb: 'Box and one on your shooter, half court traps, and the pack line that dares you to shoot.', plays: ['against-box-and-one-screen-for-the-chased', 'against-box-and-one-screen-for-the-chased-left', 'against-the-half-court-trap', 'against-the-pack-line-skip-and-drive', 'against-pressure-backdoor-series'] },
  { key: 'zone-blob', name: 'Zone offense, wave two', blurb: 'The 1-2-2 attack, the baseline runner, the dribble push, and a baseline out against a zone.', plays: ['1-2-2-zone-attack', 'runner-through-the-zone', 'zone-dribble-push', 'zone-dribble-push-left', 'zone-blob-line'] },
  { key: 'inbounds-two', name: 'Inbounds, wave two', blurb: 'Zipper, Triangle, Box screen away, Stack pop and dive, the sideline stagger, and the back court safe play.', plays: ['zipper-blob', 'triangle-blob', 'box-screen-away', 'stack-vs-man-pop-and-dive', 'sideline-stagger-shooter', 'sideline-backcourt-safe'] },
  { key: 'close-it-out', name: 'Close it out', blurb: 'Up late with the ball: inbound and get fouled, the delay game, four corners, and the up three foul rule.', plays: ['up-late-inbound-and-get-fouled', 'up-late-spread-delay', 'up-late-four-corners', 'up-three-foul-before-the-shot', 'press-after-a-made-free-throw'],
    endgame: { ball_up12: { play_keys: ['up-late-inbound-and-get-fouled', 'up-late-spread-delay'], note: 'Best free throw shooter gets it. Let them foul.' }, ball_up3: { play_keys: ['up-late-four-corners'], note: '' }, def_up3: { play_keys: ['up-three-foul-before-the-shot'], note: 'Foul under 5 seconds, before the shot.', foul: true } } },
  { key: 'down-big', name: 'Down big', blurb: 'Speed it up: push and three, press after every make, trap, and the quick hitters that get a shot in six seconds.', plays: ['down-big-push-and-three', 'press-after-a-made-free-throw', 'diamond-press-1-2-1-1', 'drag-screen', 'spread-pick-and-roll'] },
  { key: 'defense-two', name: 'Defense, wave two', blurb: 'Full court man rules, post denial, the corner trap out of the 2-3, and the three quarter 1-2-2 press.', plays: ['full-court-man-principles', 'deny-the-post', '2-3-trap-the-corner', '1-2-2-three-quarter-press'] },
  { key: 'specials', name: 'Specials', blurb: 'Technical foul free throws, the held ball set, the last second heave, the fake timeout, and the two jump ball plays.', plays: ['technical-foul-free-throws', 'held-ball-arrow-set', 'last-second-heave', 'fake-timeout-backdoor', 'jump-ball-tip-to-the-wing', 'jump-ball-safe'] }
);


/* ================================================================
   BUILD MY PLAYBOOK: the wizard. Six answers pick a starter playbook from the plays above.
   Every key is checked against PLAYS at build time.
================================================================ */
const WIZARD = {
  questions: [
    { key: 'defense', q: 'What do you see most from the other team?', opts: [['man', 'Man to man'], ['zone', 'Zone'], ['both', 'A mix of both']] },
    { key: 'post', q: 'Do you have a post player who can score inside?', opts: [['yes', 'Yes'], ['no', 'Not really']] },
    { key: 'press', q: 'How often do teams press you?', opts: [['often', 'Most games'], ['some', 'Now and then'], ['rare', 'Almost never']] },
    { key: 'star', q: 'Your best player is a', opts: [['guard', 'Guard'], ['wing', 'Wing'], ['big', 'Big']] },
    { key: 'base_d', q: 'Your base defense', opts: [['man', 'Man to man'], ['zone', '2-3 zone'], ['press', 'We press']] },
    { key: 'level', q: 'Level', opts: [['youth', 'Youth, 5th and 6th'], ['ms', 'Middle school'], ['jv', 'JV or freshman'], ['varsity', 'Varsity or club']] },
  ],
  // how many plays each level gets, and the actions youth teams skip
  caps: { youth: 12, ms: 16, jv: 20, varsity: 26 },
  skip_youth: ['spain-pick-and-roll', 'elevator-doors', 'chicago', 'princeton-chin', 'iverson-cut', 'hammer', 'ram-screen', 'horns-twist', 'box-elevator', 'need-three-double-drag', 'pistol'],
  // rules, in priority order. when: every listed answer must match (array = any of). add: keys, highest priority first.
  rules: [
    { why: 'Every team needs a baseline and a sideline play', add: ['box-up', 'line-lob', 'sideline-box', 'sideline-stack'] },
    { why: 'Late game basics', add: ['need-three-flare-ato', 'need-two-high-ball-screen', 'last-shot-tied-spread', 'up-late-four-corners', 'free-throw-need-the-miss', 'up-three-foul-before-the-shot'] },
    { when: { defense: ['man', 'both'] }, why: 'Man to man offense', add: ['horns-flare', 'horns-dive-and-pop', 'five-out-cut-and-fill', 'four-out-drive-and-kick', 'ucla-cut', 'flex'] },
    { when: { defense: ['zone', 'both'] }, why: 'Zone offense', add: ['zone-overload', 'zone-high-low', 'zone-short-corner', '1-2-2-zone-attack', 'runner-through-the-zone', 'box-vs-zone', 'zone-blob-line'] },
    { when: { post: 'yes' }, why: 'You have a post, so get him the ball', add: ['horns-punch', 'high-low', 'four-out-post-entry', 'post-split', 'box-big-lob'] },
    { when: { post: 'no' }, why: 'No post, so play with space and movement', add: ['five-out-dribble-handoff', 'five-out-backdoor', 'spread-pick-and-roll', 'dribble-drive-loop', 'motion-weak'] },
    { when: { press: 'often' }, why: 'Teams press you, so the whole press break', add: ['press-break-four-across', 'press-break-one-up-two-back', 'press-break-sideline-trap-escape', 'press-break-middle-flash', 'press-break-long-pass', 'sideline-backcourt-safe'] },
    { when: { press: 'some' }, why: 'A press break for when it comes', add: ['press-break-four-across', 'press-break-sideline-trap-escape'] },
    { when: { press: 'rare' }, why: 'One safe press break', add: ['press-break-four-across'] },
    { when: { star: 'guard' }, why: 'Your best player is a guard: ball screens and gets', add: ['elbow-get', 'drag-screen', 'need-two-iso-at-the-top', 'pistol', 'spain-pick-and-roll'] },
    { when: { star: 'wing' }, why: 'Your best player is a wing: screens to get him open', add: ['floppy', 'wide-pin-down', 'horns-stagger', 'stagger-away', 'hammer'] },
    { when: { star: 'big' }, why: 'Your best player is a big: lobs and post ups', add: ['horns-punch', 'high-low', 'line-lob', 'box-big-lob', 'sideline-back-screen-lob'] },
    { when: { base_d: 'man' }, why: 'Man to man defense rules', add: ['shell-help-side', 'ice-the-side-pick-and-roll', 'deny-the-post'] },
    { when: { base_d: 'zone' }, why: 'The 2-3 zone', add: ['2-3-zone-slides', '2-3-zone-vs-high-post', '2-3-trap-the-corner'] },
    { when: { base_d: 'press' }, why: 'Your press', add: ['diamond-press-1-2-1-1', '2-2-1-zone-press', 'press-after-a-made-free-throw', 'run-and-jump'] },
    { when: { level: ['jv', 'varsity'] }, why: 'Quick hitters and counters for older players', add: ['chicago', 'iverson-cut', 'zipper', 'two-for-one', 'against-pressure-backdoor-series'] },
    { when: { level: 'varsity' }, why: 'Varsity extras', add: ['elevator-doors', 'against-box-and-one-screen-for-the-chased', 'against-the-half-court-trap', 'seven-seconds-drag-to-a-shot', 'attack-the-bonus'] },
    { when: { level: ['youth', 'ms'] }, why: 'Simple and repeatable', add: ['jump-ball-safe', 'five-out-cut-and-fill', 'stack-vs-man-pop-and-dive'] },
  ],
  // the end of game tree gets filled from these packs, using whichever of their plays made the cut
  endgame_from: ['late-down3', 'late-down12', 'late-tied', 'protect-lead', 'close-it-out'],
};


/* ================================================================
   READS: "if they do X, we do Y", pinned to a step. Players get quizzed on them.
   Keyed by play key; the mirrored (-left) copy gets the same reads with left and right swapped.
================================================================ */
const READS = {
  'horns-flare': [{ when: 'They switch the flare screen', then: '5 slips to the rim and 4 hits him on the dive', frame: 2 }, { when: '1\'s man goes under the flare', then: '1 curls to the elbow instead of fading, 4 hits him there', frame: 2 }],
  'horns-twist': [{ when: 'The big hedges hard on the first screen', then: '1 turns back and uses 4\'s re-screen going the other way', frame: 1 }, { when: 'They switch the second screen', then: '5 slips to the rim before the switch settles', frame: 2 }],
  'horns-dive-and-pop': [{ when: 'The low man steps up to stop the roll', then: 'Kick to the corner shooter he left', frame: 2 }, { when: 'They switch the ball screen', then: '5 seals the smaller man on the roll and we throw it in', frame: 2 }],
  'horns-split': [{ when: 'They deny the cut through the elbows', then: '1 clears to the corner and 4 drives the open lane', frame: 2 }],
  'horns-stagger': [{ when: 'They chase 2 over both screens', then: '2 curls to the rim and 5 pops to the top', frame: 2 }, { when: 'They switch the stagger', then: '5 seals the little man and we post him', frame: 2 }],
  'horns-punch': [{ when: 'They front the post', then: '4 throws the lob over the top from the elbow', frame: 2 }, { when: 'They double the post', then: '5 kicks to 2 lifting on the wing', frame: 3 }],
  'horns-elbow-handoff': [{ when: 'They jump the handoff', then: '1 fakes the handoff and 5 drives the lane', frame: 1 }],
  'four-out-post-entry': [{ when: 'They deny the wing entry', then: '2 goes backdoor and 1 hits him', frame: 1 }, { when: 'Help comes from the corner on the post', then: '5 kicks to 2 in the corner he just cleared to', frame: 2 }],
  'four-out-drive-and-kick': [{ when: 'The low man helps on the drive', then: 'Dump it to 5 in the dunker spot', frame: 1 }, { when: 'The wing defender helps off 4', then: 'Kick to 4 for the lift three', frame: 1 }],
  'five-out-cut-and-fill': [{ when: 'Your man turns his head on your cut', then: 'Cut all the way to the rim with your hands ready', frame: 1 }, { when: 'They deny the fill pass', then: 'Backdoor the first man who overplays', frame: 2 }],
  'five-out-dribble-handoff': [{ when: 'The defender goes under the handoff', then: 'The receiver keeps it and shoots or drives, no handoff', frame: 1 }, { when: 'They switch the handoff', then: 'The handoff man slips to the rim', frame: 1 }],
  'five-out-backdoor': [{ when: 'They deny the wing with a foot in the lane', then: 'Two hard steps to the ball, plant, and go backdoor', frame: 1 }],
  'ucla-cut': [{ when: 'They switch the UCLA screen', then: '5 seals the guard on his back and we throw it in', frame: 2 }, { when: 'They deny the wing entry', then: '2 backdoors and 1 hits him', frame: 1 }],
  'floppy': [{ when: 'They chase the shooter over the single', then: 'Shooter curls to the lane, big pops', frame: 2 }, { when: 'They go under the staggered screens', then: 'Shooter stops short for the catch and shoot', frame: 2 }],
  'zipper': [{ when: 'They deny the zipper cut', then: 'The cutter backdoors off the screen to the rim', frame: 1 }],
  'pistol': [{ when: 'They switch the handoff', then: 'The big slips to the rim before the switch settles', frame: 2 }, { when: 'The handoff defender jumps it', then: 'Fake the handoff and drive the lane', frame: 1 }],
  'spain-pick-and-roll': [{ when: 'The low man steps up to the roller', then: 'The back screener pops to the top for three', frame: 2 }, { when: 'They switch the back screen', then: 'The roller gets a smaller man, throw it to him at the rim', frame: 2 }],
  'chicago': [{ when: 'They go under the pin down', then: 'The guard pops short for the catch and shoot', frame: 1 }, { when: 'They switch the handoff', then: 'The big slips to the rim', frame: 2 }],
  'flex': [{ when: 'They switch the flex screen', then: 'The screener seals the guard and we throw it in', frame: 2 }, { when: 'They deny the top', then: 'The screener slips the down screen to the rim', frame: 2 }],
  'motion-weak': [{ when: 'They chase over the pin down', then: 'Curl it to the rim', frame: 2 }],
  'iverson-cut': [{ when: 'They top lock the Iverson cut', then: 'Go backdoor off the second elbow', frame: 1 }],
  'elevator-doors': [{ when: 'They fight through the doors', then: 'The shooter fades to the corner and the bigs seal', frame: 2 }, { when: 'They switch onto the shooter', then: 'A big slips to the rim', frame: 2 }],
  'hammer': [{ when: 'The low man helps on the baseline drive', then: 'Skip it to the corner shooter coming off the hammer screen', frame: 2 }],
  'box-double-cross': [{ when: 'They switch the cross screens', then: 'Both bigs seal and the guard feeds the mismatch', frame: 1 }],
  '1-4-high-backdoor': [{ when: 'They deny the wing', then: 'The wing goes backdoor and the elbow big hits him', frame: 1 }],
  '1-4-high-post-entry': [{ when: 'They front the high post', then: 'Reverse it and feed the other elbow', frame: 1 }],
  'princeton-chin': [{ when: 'They deny the wing', then: 'Backdoor, the big at the elbow throws it', frame: 1 }, { when: 'They switch the back screen', then: 'The screener pops to the top', frame: 2 }],
  'stack-curl': [{ when: 'They chase the curl', then: 'Curl all the way to the rim', frame: 1 }, { when: 'They go under', then: 'Stop short and shoot', frame: 1 }],
  'dribble-drive-loop': [{ when: 'The help defender steps in on the drive', then: 'Drop it to the dunker or kick to the corner he left', frame: 1 }],
  'zone-overload': [{ when: 'The bottom man runs out to the corner', then: 'Feed the short corner behind him', frame: 2 }, { when: 'The guard drops to the short corner', then: 'Reverse to the top for the open three', frame: 2 }],
  'zone-high-low': [{ when: 'The middle man steps up on the high post', then: 'Drop it to the low post sealing behind him', frame: 2 }],
  'zone-short-corner': [{ when: 'The bottom defender takes the short corner', then: 'The ball side block is open, dive to it', frame: 1 }],
  'zone-skip-and-drive': [{ when: 'The zone is slow on the skip', then: 'Drive the closeout, don\'t shoot over a set man', frame: 2 }],
  'screen-the-zone': [{ when: 'The screened defender fights over', then: 'Flare to the corner instead of the wing', frame: 1 }],
  'box-up': [{ when: 'They switch the screen', then: 'The screener seals and we throw it in', frame: 1 }, { when: 'They face guard the first cutter', then: 'Hit the second option popping to the top', frame: 1 }],
  'line-lob': [{ when: 'They front the lob', then: 'The second man in line pops to the corner for three', frame: 1 }],
  'stack-diagonal': [{ when: 'They switch the diagonal screen', then: 'The screener seals on the block', frame: 1 }],
  'box-corner-three': [{ when: 'They chase the shooter to the corner', then: 'The shooter curls and the big pops', frame: 1 }],
  'flat-backdoor': [{ when: 'They deny the top', then: 'Backdoor from the flat, right now', frame: 1 }],
  'sideline-box': [{ when: 'They deny the first cut', then: 'Hit the safety at the top and run offense', frame: 1 }],
  'sideline-stack': [{ when: 'They switch the stack', then: 'The screener seals the smaller man', frame: 1 }],
  'press-break-four-across': [{ when: 'They trap the first pass', then: 'Pass back to the inbounder stepping in', frame: 1 }, { when: 'They deny the sideline', then: 'The middle flashes to the ball', frame: 1 }],
  'press-break-sideline-trap-escape': [{ when: 'The trap comes at the sideline', then: 'Reverse to the middle flash, never to the sideline', frame: 1 }],
  'press-break-middle-flash': [{ when: 'They take away the middle', then: 'Throw over the top to the long man', frame: 1 }],
  'need-three-flare-ato': [{ when: 'They switch the flare', then: 'Slip to the rim for the two and the foul if no three is there', frame: 2 }],
  'need-two-high-ball-screen': [{ when: 'They trap the ball screen', then: 'Roller to the rim, short pass over the trap', frame: 1 }, { when: 'They switch it', then: 'Attack the big on the switch', frame: 1 }],
  'last-shot-tied-spread': [{ when: 'They help off the corner', then: 'Kick to the corner shooter', frame: 1 }],
  'up-late-four-corners': [{ when: 'They trap the ball', then: 'Pass out of it to the middle man, no dribble', frame: 1 }],
  'drag-screen': [{ when: 'The big is late to the drag', then: 'Attack downhill before the screen, no waiting', frame: 1 }, { when: 'They switch the drag', then: 'Roll and seal the guard at the rim', frame: 2 }],
  'elbow-get': [{ when: 'They jump the get', then: 'Fake it, 5 keeps it and drives', frame: 1 }],
  'wide-pin-down': [{ when: 'They chase over the pin down', then: 'Curl it to the lane', frame: 1 }, { when: 'They go under', then: 'Pop short and shoot', frame: 1 }],
  'ram-screen': [{ when: 'They switch the ram screen', then: 'The big slips before the ball screen', frame: 1 }],
  'stagger-away': [{ when: 'They lock and trail the shooter', then: 'Curl to the rim, the second screener pops', frame: 1 }],
  'post-split': [{ when: 'They switch the split', then: 'The screener seals and the post hits him', frame: 2 }],
  'high-low': [{ when: 'They front the low post', then: 'Throw the lob from the elbow over the top', frame: 1 }],
  'spread-pick-and-roll': [{ when: 'The low man tags the roller', then: 'Kick to the corner he left', frame: 2 }, { when: 'They go under the ball screen', then: 'Pull up behind the screen', frame: 1 }],
  'against-box-and-one-screen-for-the-chased': [{ when: 'The chaser fights over the back screen', then: 'Curl to the rim and the screener pops', frame: 1 }],
  'against-the-half-court-trap': [{ when: 'The trap comes at the sideline', then: 'Over the top to the middle flash', frame: 1 }],
  'against-pressure-backdoor-series': [{ when: 'They deny the wing', then: 'Backdoor, bounce pass', frame: 1 }, { when: 'They deny the backdoor too', then: 'The big flashes to the elbow and the guard cuts off him', frame: 3 }],
  'two-for-one': [{ when: 'No open look in the first 8 seconds', then: 'Take the best shot available, get the ball back for the last one', frame: 2 }],
  'zone-blob-line': [{ when: 'The bottom man takes the short corner', then: 'Hit the corner shooter', frame: 1 }],
  'zipper-blob': [{ when: 'They deny the zipper', then: 'The cutter backdoors and the big pops to the top', frame: 1 }],
  'triangle-blob': [{ when: 'They switch the first screen', then: 'The screener seals and we throw it in', frame: 1 }],
};
const swapLR = (t) => t.replace(/\bright\b/g, '\u0000').replace(/\bleft\b/g, 'right').replace(/\u0000/g, 'left');
for (const p of PLAYS) {
  const base = p.key.replace(/-left$/, '');
  const rs = READS[p.key] || READS[base];
  if (!rs) continue;
  p.reads = rs.map((r) => ({ when: p.side === 'left' ? swapLR(r.when) : r.when, then: p.side === 'left' ? swapLR(r.then) : r.then, frame: Math.min(r.frame, p.frames.length - 1) }));
}
for (const k of Object.keys(READS)) if (!PLAYS.find((p) => p.key === k)) throw new Error('reads name unknown play ' + k);

/* ---------- validate and write ---------- */
const keys = new Set();
const out = [];
for (const p of PLAYS) {
  if (keys.has(p.key)) throw new Error('duplicate key ' + p.key);
  keys.add(p.key);
  const r = cleanPlay({ ...p, visible: true });
  if (r.error) throw new Error(p.name + ': ' + r.error);
  const clean = r.play;
  // keep what the editor saves, plus the library key and side
  out.push({ key: p.key, side: p.side, name: clean.name, category: clean.category, court: clean.court, notes: clean.notes, tips: clean.tips, situations: clean.situations, reads: clean.reads, frames: clean.frames, steps: clean.frames.length - 1 });
}
for (const pk of PACKS) for (const k of pk.plays) if (!keys.has(k)) throw new Error('pack ' + pk.key + ' names unknown play ' + k);
for (const pk of PACKS) for (const leaf of Object.values(pk.endgame || {})) for (const k of leaf.play_keys) if (!keys.has(k)) throw new Error('pack ' + pk.key + ' endgame names unknown play ' + k);
for (const r of WIZARD.rules) for (const k of r.add) if (!keys.has(k)) throw new Error('wizard rule "' + r.why + '" names unknown play ' + k);
for (const k of WIZARD.skip_youth) if (!keys.has(k)) throw new Error('wizard skip_youth names unknown play ' + k);
for (const k of WIZARD.endgame_from) if (!PACKS.find((p) => p.key === k)) throw new Error('wizard endgame_from names unknown pack ' + k);
const js = `/* Premade play library and scenario packs for the coach board ("Add from the library").
   GENERATED by tools/build-library.mjs, do not edit by hand. ${out.length} plays, ${PACKS.length} packs. */
window.PB_LIBRARY = ${JSON.stringify({ plays: out, packs: PACKS, wizard: WIZARD })};
`;
writeFileSync(new URL('../public/playbook-library.js', import.meta.url), js);
const byCat = {}; out.forEach((p) => (byCat[p.category] = (byCat[p.category] || 0) + 1));
console.log(out.length, 'plays', byCat, PACKS.length, 'packs', out.filter((p) => p.reads.length).length + ' with reads', Math.round(js.length / 1024) + 'KB');
