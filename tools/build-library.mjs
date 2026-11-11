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
  const p = { key: opts.key || slug(name), name, category, court, notes: opts.notes || '', tips: opts.tips || [], situations: opts.sits || [], reads: opts.reads || [], call: opts.call || '', frames, visible: true, side: opts.side || '' };
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
    { when: { level: 'varsity' }, why: 'Varsity extras', add: ['elevator-doors', 'against-box-and-one-screen-for-the-chased', 'against-the-half-court-trap', 'seven-seconds-drag-to-a-shot', 'attack-the-bonus', 'horns-spain', 'delay-chicago', 'zoom-wing', 'drag-77', 'box-celtics-winner'] },
    { when: { level: ['jv', 'varsity'], star: 'guard' }, why: 'Pro ball screen actions for a guard', add: ['pistol-21-dribble', 'drag-step-up', 'drag-veer', 'elbow-get'] },
    { when: { level: ['jv', 'varsity'], star: 'wing' }, why: 'Pro screens for a wing', add: ['floppy-single-double', 'zipper-flare', 'horns-down', 'elbow-zoom'] },
    { when: { level: ['jv', 'varsity'], star: 'big' }, why: 'Pro post actions for a big', add: ['horns-duck-in', 'stack-curl-and-post', 'horns-fire', 'zone-runner-pin'] },
    { when: { level: ['youth', 'ms'] }, why: 'Simple and repeatable', add: ['jump-ball-safe', 'five-out-cut-and-fill', 'stack-vs-man-pop-and-dive'] },
  ],
  // the end of game tree gets filled from these packs, using whichever of their plays made the cut
  endgame_from: ['late-down3', 'late-down12', 'late-tied', 'protect-lead', 'close-it-out'],
};


/* ================================================================
   ACTION ENGINE: named sets written as a formation plus a chain of actions.
   Each helper returns one step (or a few). Notes are written from the spots
   when a recipe does not give its own. set() compiles to play().
================================================================ */
const WORDS = {
  rim: 'the rim', ft: 'the foul line', nail: 'the nail', top: 'the top', topDeep: 'the top',
  lBlock: 'the left block', rBlock: 'the right block', lLow: 'the left low post', rLow: 'the right low post', lMidPost: 'the left mid post', rMidPost: 'the right mid post',
  lElbow: 'the left elbow', rElbow: 'the right elbow', lHigh: 'the left high post', rHigh: 'the right high post',
  lShort: 'the left short corner', rShort: 'the right short corner', lCorner: 'the left corner', rCorner: 'the right corner',
  lWing: 'the left wing', rWing: 'the right wing', lWingHigh: 'the left wing', rWingHigh: 'the right wing',
  lSlot: 'the left slot', rSlot: 'the right slot', lTop: 'the top left', rTop: 'the top right',
  lLane: 'the lane', rLane: 'the lane', lDunker: 'the left dunker spot', rDunker: 'the right dunker spot',
  inbL: 'the baseline', inbR: 'the baseline', inbMid: 'the baseline', sideL: 'the sideline', sideR: 'the sideline', sideLHigh: 'the sideline',
  lHash: 'the left hash', rHash: 'the right hash', lDeep: 'the left side', rDeep: 'the right side', lHalf: 'half court', rHalf: 'half court', midHalf: 'half court',
};
const SPOT_LIST = Object.keys(S).map((k) => [k, S[k]]);
function nearSpot(p) { let best = null, bd = 1e9; for (const [k, v] of SPOT_LIST) { const d = (v[0] - p[0]) ** 2 + (v[1] - p[1]) ** 2; if (d < bd) { bd = d; best = k; } } return bd < 55 * 55 ? best : null; }
function where(p) { if (Array.isArray(p)) { const k = nearSpot(p); return k ? WORDS[k] || 'the spot' : (p[1] < 130 ? 'the paint' : p[1] > 300 ? 'the top' : (p[0] < 250 ? 'the left side' : 'the right side')); } return WORDS[p] || 'the spot'; }
const num = (id) => (id[0] === 'X' ? 'X' + id[1] : id[1]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/* step helpers: every one returns a step object the compiler understands */
const pass = (from, to, n) => ({ b: to, n: n || `${num(from)} passes to ${num(to)}.`, _pass: [from, to] });
const shot = (who, n) => ({ b: 'rim', n: n || `${num(who)} shoots.` });
const mv = (m, n, extra) => Object.assign({ m, n: n || '' }, extra || {});
const cut = (id, to, via, n) => mv({ [id]: [to, 'cut', via] }, n || `${num(id)} cuts to ${where(to)}.`);
const drib = (id, to, via, n) => mv({ [id]: [to, 'dribble', via] }, n || `${num(id)} dribbles to ${where(to)}.`);
const screen = (scr, cutter, at, to, via, n, kind) => mv({ [scr]: [at, 'screen'], [cutter]: [to, 'cut', via] }, n || `${num(scr)} ${kind || 'screens'} for ${num(cutter)}. ${num(cutter)} comes to ${where(to)}.`);
const pin = (scr, cutter, at, to, via, n) => screen(scr, cutter, at, to, via, n, 'pins down');
const flare = (scr, cutter, at, to, via, n) => screen(scr, cutter, at, to, via, n || `${num(scr)} sets the flare screen. ${num(cutter)} fades to ${where(to)}.`);
const back = (scr, cutter, at, to, via, n) => screen(scr, cutter, at, to, via, n || `${num(scr)} back screens for ${num(cutter)}. ${num(cutter)} cuts to ${where(to)}.`);
const cross = (scr, cutter, at, to, via, n) => screen(scr, cutter, at, to, via, n || `${num(scr)} cross screens for ${num(cutter)}. ${num(cutter)} comes across to ${where(to)}.`);
const stagger = (s1, s2, cutter, at1, at2, to, via, n) => mv({ [s1]: [at1, 'screen'], [s2]: [at2, 'screen'], [cutter]: [to, 'cut', via] }, n || `${num(s1)} and ${num(s2)} stagger for ${num(cutter)}. ${num(cutter)} comes off both to ${where(to)}.`);
const dbl = (s1, s2, cutter, at1, at2, to, via, n) => mv({ [s1]: [at1, 'screen'], [s2]: [at2, 'screen'], [cutter]: [to, 'cut', via] }, n || `${num(s1)} and ${num(s2)} set the double. ${num(cutter)} comes off to ${where(to)}.`);
/* ball screen: screen + drive in one step, then the roll (and pop) in the next */
const pnr = (scr, handler, at, driveTo, rollTo, popper, popTo, n1, n2) => [
  mv({ [scr]: [at, 'screen'], [handler]: [driveTo, 'dribble'] }, n1 || `${num(scr)} screens the ball. ${num(handler)} comes off toward ${where(driveTo)}.`),
  mv(Object.assign({ [scr]: [rollTo, 'cut'] }, popper ? { [popper]: [popTo, 'cut'] } : {}), n2 || `${num(scr)} rolls to ${where(rollTo)}${popper ? `, ${num(popper)} pops to ${where(popTo)}` : ''}.`),
];
const pnp = (scr, handler, at, driveTo, popTo, n1, n2) => [
  mv({ [scr]: [at, 'screen'], [handler]: [driveTo, 'dribble'] }, n1 || `${num(scr)} screens the ball. ${num(handler)} comes off toward ${where(driveTo)}.`),
  mv({ [scr]: [popTo, 'cut'] }, n2 || `${num(scr)} pops to ${where(popTo)}.`),
];
/* dribble handoff: receiver comes to the ball, then takes it going the other way; giver screens on it */
const dho = (giver, recv, meet, driveTo, via, n1, n2) => [
  mv({ [recv]: [meet, 'cut', via] }, n1 || `${num(recv)} comes to ${num(giver)} for the handoff.`),
  Object.assign(mv({ [recv]: [driveTo, 'dribble'], [giver]: [meet, 'screen'] }, n2 || `Handoff. ${num(recv)} attacks ${where(driveTo)}, ${num(giver)} screens on it.`), { b: recv }),
];
const post = (id, spot, n) => cut(id, spot, null, n || `${num(id)} posts up at ${where(spot)}.`);
const seal = (id, spot, n) => cut(id, spot, null, n || `${num(id)} seals at ${where(spot)}.`);
const lift = (id, to, n) => cut(id, to, null, n || `${num(id)} lifts to ${where(to)}.`);
const drift = (id, to, n) => cut(id, to, null, n || `${num(id)} drifts to ${where(to)}.`);
const relocate = (m, n) => mv(m, n || 'Spacing: everyone relocates.');
const passFirst = (st) => Object.assign({}, st, { pf: true });
/* merge several helpers into ONE step (the moves happen at the same time) */
function together(...steps) { const out = { m: {}, n: '' }; const notes = []; for (const st of steps.flat()) { Object.assign(out.m, st.m || {}); if (st.b) out.b = st.b; if (st.pf) out.pf = true; if (st.n) notes.push(st.n); } out.n = notes.join(' '); return out; }
/* set(): formation + actions → play(). opts as play() plus family (prefix for the key) */
function set(name, category, opts, formation, actions) {
  const steps = actions.flat().map((st) => Object.assign({}, st, { n: st.n ? cap(st.n) : '' }));
  return play(name, category, opts, formation, steps);
}
/* formations */
const F = {
  HORNS, FOUR_OUT, FIVE_OUT,
  ELBOW: { O1: 'top', O5: 'rElbow', O2: 'rCorner', O3: 'lWing', O4: 'lCorner' },
  ELBOW_L: { O1: 'top', O5: 'lElbow', O2: 'lCorner', O3: 'rWing', O4: 'rCorner' },
  DELAY: { O5: 'top', O1: 'rSlot', O2: 'rCorner', O3: 'lSlot', O4: 'lCorner' },
  ZIP: { O1: 'top', O2: 'rBlock', O5: 'rElbow', O3: 'lWing', O4: 'lBlock' },
  FLOPPY: { O1: 'top', O2: [250, 85], O4: 'lBlock', O5: 'rBlock', O3: 'lWing' },
  PISTOL: { O1: 'rSlot', O2: 'rWing', O5: [250, 390], O3: 'lCorner', O4: 'lWing' },
  SPREAD: { O1: 'topDeep', O5: 'nail', O2: 'rCorner', O3: 'lCorner', O4: 'lWing' },
  STACK: { O1: 'top', O4: 'rBlock', O5: 'rMidPost', O2: 'lCorner', O3: 'lWing' },
  DIAMOND: { O1: 'top', O5: 'ft', O2: 'rWing', O3: 'lWing', O4: [250, 85] },
  HIGH14: { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'rWing', O3: 'lWing' },
  BOX: { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'lBlock', O3: 'rBlock' },
  TWO_GUARD: { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'ft' },
  TRIANGLE: { O1: 'rWing', O2: 'rCorner', O5: 'rBlock', O3: 'top', O4: 'lElbow' },
  FLEX: { O1: 'lSlot', O2: 'rSlot', O3: 'lCorner', O4: 'lBlock', O5: 'rBlock' },
  WIDE: { O1: 'top', O2: 'rCorner', O3: 'lCorner', O4: 'lBlock', O5: 'rBlock' },
  LOW: { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' },
  ONE_FOUR_LOW: { O1: 'top', O2: 'rCorner', O3: 'lCorner', O4: 'lLow', O5: 'rLow' },
  BLOB_BOX: BOX_BLOB,
  BLOB_LINE: { O3: 'inbMid', O5: [300, 100], O4: [300, 145], O2: [300, 190], O1: [300, 235] },
  BLOB_STACK: { O3: 'inbMid', O1: [305, 100], O4: [305, 145], O5: [305, 190], O2: 'top' },
  BLOB_FLAT: { O3: 'inbMid', O1: [130, 200], O4: [210, 200], O5: [290, 200], O2: [370, 200] },
  BLOB_DIAMOND: { O3: 'inbMid', O5: [250, 95], O1: [180, 160], O2: [320, 160], O4: [250, 240] },
  BLOB_TRIANGLE: { O3: 'inbMid', O4: 'lBlock', O5: 'rBlock', O2: 'ft', O1: 'top' },
  SLOB_BOX: SLOB,
  SLOB_STACK: { O3: 'sideL', O1: [150, 250], O2: [150, 205], O4: [150, 160], O5: [150, 115] },
  SLOB_LINE: { O3: 'sideL', O5: [120, 290], O4: [200, 290], O2: [280, 290], O1: [360, 290] },
  SLOB_14: { O3: 'sideL', O1: 'lElbow', O5: 'rElbow', O2: 'lBlock', O4: 'rBlock' },
  SLOB_SPREAD: { O3: 'sideL', O1: 'top', O2: 'rWing', O4: 'lBlock', O5: 'rBlock' },
  ZONE_121: { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: 'rShort' },
  ZONE_OVERLOAD: { O1: 'rSlot', O2: 'rWing', O3: 'rCorner', O4: 'rShort', O5: 'rElbow' },
  ZONE_2GUARD: { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'ft' },
  ZONE_13_1: { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: [250, 80] },
};

/* ================================================================
   NAMED SETS, batch one: NBA and college half court families, written
   with the action engine. Horns, Elbow, Delay, Zipper, Floppy, Pistol,
   Spain and drag, Zoom, Chicago, Iverson, Hawk, Rip, Wedge, Ram, Loop,
   Veer, Stack, Diamond, 1-4 High, Box, five out, Princeton, Triangle,
   Flex, Swing, Shuffle, Wheel, UCLA.
================================================================ */
const H = F.HORNS;
/* ---- Horns ---- */
set('Horns: Chest', 'Offense', { notes: 'Horns entry to the elbow, then screen the screener: the passer\'s big screens across for the other big, who flashes to the ball for a high low.', tips: ['The second big waits for the screen, then comes hard. Hands up on the catch.'], sits: ['ato', 'get_big', 'post_entry'], reads: [{ when: 'they switch the big to big screen', then: 'The screener seals the smaller man at the rim and we throw it in', frame: 2 }], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), cut('O1', 'lWing', [190, 300], '1 cuts off 4 to the left wing.'),
  screen('O4', 'O5', [295, 160], 'lLane', [330, 125], '4 screens across for 5. 5 flashes to the lane.'),
  pass('O4', 'O5', '4 feeds 5 in the lane.'), shot('O5', 'Score over the top, or kick to 3 if the help comes.')]);
set('Horns: Down', 'Offense', { notes: 'Both bigs screen down for the corner shooters at the same time. Two shooters coming to the wings, the guard picks the open one.', tips: ['Shooters: set your man up low before you come off. Arrive on the catch, not before.'], sits: ['need3', 'get_shooter', 'ato'], reads: [{ when: 'they go under both screens', then: 'Both shooters stop short and catch and shoot', frame: 1 }, { when: 'they switch the down screens', then: 'The bigs seal the little man and we feed the post', frame: 1 }], first: 'Horns set. Shooters in both corners.' }, H, [
  together(pin('O4', 'O3', [150, 150], 'lWing', [70, 130]), pin('O5', 'O2', [350, 150], 'rWing', [430, 130])),
  pass('O1', 'O2', '1 hits the open shooter.'), cut('O5', 'rBlock', null, '5 rolls to the block after the screen.'), shot('O2')]);
set('Horns: Out', 'Offense', { notes: 'Horns entry, then the opposite big pops out for a flare while the ball side big dives. The pass goes over the top to the flare.', tips: ['Passer: look at the dive first. That freezes the help and opens the flare.'], sits: ['ato', 'need3'], reads: [{ when: 'they jump out on the flare', then: 'The diving big is open at the rim', frame: 2 }], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), flare('O5', 'O1', [300, 290], 'rWing', [372, 345]), cut('O5', 'rBlock', null, '5 dives after the screen.'),
  pass('O4', 'O1', '4 throws it over the top to 1.'), shot('O1')]);
set('Horns: Flex', 'Offense', { notes: 'Horns entry to the elbow, the other big flex screens along the baseline for a corner shooter, then gets a down screen himself.', tips: ['Flex screen is set on the baseline side of the defender. Cutter goes over the top.'], sits: ['ato', 'need2', 'get_shooter'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), screen('O5', 'O2', [330, 100], 'lBlock', [320, 70], '5 flex screens on the baseline. 2 cuts to the ball side block.'),
  pin('O1', 'O5', [320, 180], 'rElbow', [360, 150], '1 screens down for 5. 5 pops to the elbow.'),
  pass('O4', 'O2', '4 feeds 2 on the block, or 5 at the elbow.'), shot('O2')]);
set('Horns: Rip', 'Offense', { notes: 'The guard passes to the elbow and gets a back screen from the other big. A rip screen for a layup, with the big popping for three if the help comes.', tips: ['Cut off the screen shoulder to shoulder. The lob is there if they switch late.'], sits: ['ato', 'need2', 'first_play'], reads: [{ when: 'they switch the rip screen', then: 'The screener pops to the top for three', frame: 1 }], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), back('O5', 'O1', [290, 300], 'rim', [320, 230], '5 rip screens for 1. 1 cuts to the rim.'),
  pass('O4', 'O1', '4 hits 1 on the cut.'), shot('O1', 'Layup. If they switch, 5 pops and 4 kicks it out.')]);
set('Horns: Elbow Get', 'Offense', { notes: 'Pass to the elbow and go get it right back: a handoff with the big turning into a ball screen, straight into a two man game with the other big spacing.', tips: ['Catch the handoff going downhill. The big is already screening when you get there.'], sits: ['quick', 'need2', 'get_pg'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O5'), dho('O5', 'O1', [345, 225], 'rLane', [310, 290]), cut('O5', 'rBlock', [330, 200], '5 rolls.'), cut('O4', 'lWingHigh', null, '4 pops out for the kick.'), shot('O1', 'Finish, roll, or 4.')]);
set('Horns: Spain', 'Offense', { notes: 'Horns into a Spain pick and roll: 5 screens the ball, 2 lifts from the corner and back screens the roller\'s defender, then pops.', tips: ['2: screen the big\'s man, not the big. Then get out to the arc.'], sits: ['ato', 'cov_drop', 'need2'], reads: [{ when: 'the low man steps up to the roller', then: '2 pops to the top for three', frame: 3 }], mirror: true, first: 'Horns set. 2 is the shooter in the right corner.' }, H, [
  cut('O4', 'lWing', null, '4 clears to the left wing.'),
  pnr('O5', 'O1', [290, 320], [330, 280], 'rim'),
  back('O2', 'O5', [285, 200], 'rim', [300, 240], '2 lifts and back screens the roller\'s man.'), cut('O2', 'top', null, '2 pops to the top.'),
  pass('O1', 'O5', 'Lob or bounce pass to the roller.'), shot('O5')]);
set('Horns: Zipper', 'Offense', { notes: 'A big screens down the lane for the point guard who has cut through; the other guard brings it up and hits the zipper cut at the top.', tips: ['Zipper cut: straight up the lane line, shoulder off the screen.'], sits: ['ato', 'get_pg', 'vs_pressure'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O2', '1 hits 2 lifting from the corner.'), cut('O1', 'rBlock', [330, 260], '1 cuts through to the right block.'),
  pin('O5', 'O1', [310, 160], 'top', [300, 230], '5 zippers 1 back up to the top.'),
  pass('O2', 'O1'), pnr('O5', 'O1', [220, 320], [170, 290], 'rim'), shot('O1', 'Attack the second ball screen.')]);
set('Horns: 45 Cut', 'Offense', { notes: 'Entry to the elbow and the passer cuts at a 45 degree angle to the opposite block. The weak side big then ball screens for the shooter lifting to the top.', tips: ['The 45 cut is a scoring cut. Look for it first.'], sits: ['ato', 'vs_set_defense'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), cut('O1', 'rBlock', [280, 250], '1 cuts 45 to the right block.'),
  cut('O3', 'lSlot', null, '3 lifts from the corner.'), pass('O4', 'O3'),
  pnr('O5', 'O3', [200, 320], [250, 280], 'rim'), shot('O3')]);
set('Horns: Hammer', 'Offense', { notes: 'Horns ball screen going right, the ball handler drives baseline and the weak side big hammer screens for the corner shooter. The skip pass is the shot.', tips: ['Drive to the baseline, not the middle. The hammer only works off a baseline drive.'], sits: ['need3', 'ato', 'get_shooter'], mirror: true, first: 'Horns set. 3 is the shooter in the left corner.' }, H, [
  pnr('O5', 'O1', [290, 320], 'rWing', 'rBlock'), drib('O1', 'rShort', [460, 150], '1 drives baseline.'),
  flare('O4', 'O3', [120, 100], 'lCorner', [60, 130], '4 hammer screens for 3 along the baseline.'),
  pass('O1', 'O3', 'Skip pass to the corner.'), shot('O3')]);
set('Horns: Flip', 'Offense', { notes: 'Fake the ball screen one way and flip it to the other side: the big turns and re-screens, the guard changes direction into open floor.', tips: ['Sell the first direction with a hard dribble. The flip screen is what gets you free.'], sits: ['cov_ice', 'cov_hedge', 'quick'], mirror: true, first: 'Horns set.' }, H, [
  mv({ O5: [[295, 320], 'screen'], O1: [[300, 300], 'dribble'] }, '1 starts right off 5.'),
  mv({ O5: [[235, 310], 'screen'], O1: [[180, 285], 'dribble', [280, 330]] }, '5 flips the screen. 1 crosses back left.'),
  together(cut('O5', 'rim', [260, 220], '5 rolls.'), cut('O4', 'lWingHigh', null, '4 pops.')), shot('O1', 'Finish, roll, or 4.')]);
set('Horns: Double Stagger', 'Offense', { notes: 'The ball handler dribbles one way and both bigs run a stagger for the opposite corner shooter coming to the top.', tips: ['Second screener is the key. Set it two steps behind the first.'], sits: ['need3', 'get_shooter', 'ato'], mirror: true, first: 'Horns set. 2 is the shooter in the right corner.' }, H, [
  drib('O1', 'lSlot', null, '1 dribbles left.'),
  stagger('O4', 'O5', 'O2', [300, 160], [330, 230], 'rTop', [410, 180]),
  pass('O1', 'O2'), shot('O2', 'Shot. If they chase, curl it and 5 pops.')]);
/* ---- Elbow series ---- */
const EL = F.ELBOW;
set('Elbow: Chase', 'Offense', { notes: 'Entry to the elbow and the passer chases his pass for a handback, with the corner shooter running off a pin down on the other side at the same time.', tips: ['Two options at once: the handback and the pin down. The big reads which one the defense gives.'], sits: ['quick', 'ato'], mirror: true, first: '5 at the right elbow, shooters spaced.' }, EL, [
  pass('O1', 'O5'), together(dho('O5', 'O1', [345, 225], 'rLane', [310, 290])[0], pin('O4', 'O3', [100, 180], 'lWing', [60, 160])),
  Object.assign(mv({ O1: ['rLane', 'dribble'], O5: [[335, 225], 'screen'] }, 'Handback. 1 turns the corner, or 5 skips to 3 instead.'), { b: 'O1' }),
  shot('O1')]);
set('Elbow: Rip', 'Offense', { notes: 'Pass to the elbow, the wing sets a back screen for the passer, the passer cuts to the rim and the wing pops.', tips: ['The back screen is set on the ball side hip. Cutter goes low, screener pops high.'], sits: ['need2', 'ato'], reads: [{ when: 'they switch the back screen', then: 'The screener pops to the three point line and 5 hits him', frame: 2 }], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), back('O2', 'O1', [330, 300], 'rim', [330, 230], '2 lifts and back screens for 1. 1 cuts to the rim.'),
  cut('O2', 'rWingHigh', null, '2 pops.'), pass('O5', 'O1', '5 drops it to 1.'), shot('O1')]);
set('Elbow: Flare', 'Offense', { notes: 'Entry to the elbow, the passer drifts and gets a flare screen from the weak side wing coming up. The skip from the elbow is the shot.', tips: ['Flare screener: screen the top shoulder, then slip to the rim if the switch comes.'], sits: ['need3', 'ato'], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), flare('O3', 'O1', [190, 300], 'lWing', [230, 345]),
  cut('O3', 'lBlock', [170, 230], '3 slips after the screen.'), pass('O5', 'O1', '5 skips it to 1.'), shot('O1')]);
set('Elbow: Zoom', 'Offense', { notes: 'Pin down into a handoff in one motion: the corner shooter comes off the wing\'s pin down straight into a handoff from the elbow big.', tips: ['Zoom is one continuous motion. No stop between the pin down and the handoff.'], sits: ['get_shooter', 'quick', 'cov_under'], reads: [{ when: 'the defender goes under the pin down', then: 'The shooter stops at the wing and shoots the catch', frame: 1 }], mirror: true, first: '5 at the right elbow, 2 in the right corner.' }, EL, [
  pass('O1', 'O5'), pin('O3', 'O2', [430, 150], 'rWingHigh', [470, 130], '3 runs over and pins down for 2. 2 comes off toward the elbow.'),
  dho('O5', 'O2', [350, 230], 'lLane', [400, 250]), cut('O5', 'rBlock', null, '5 rolls.'), shot('O2', 'Pull up, finish, or drop to 5.')]);
set('Elbow: Pitch and Rescreen', 'Offense', { notes: 'The elbow big pitches to the wing and immediately follows to ball screen. If the first screen is covered, he re-screens going the other way.', tips: ['Follow your pass with a screen every time in this series.'], sits: ['cov_ice', 'need2'], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), cut('O2', 'rWing', null, '2 lifts to the wing.'), pass('O5', 'O2'),
  pnr('O5', 'O2', [420, 270], [360, 300], 'rim'),
  mv({ O5: [[395, 230], 'screen'], O2: [[450, 190], 'dribble', [400, 320]] }, 'If they ice it, 5 re-screens and 2 goes baseline.'), shot('O2')]);
set('Elbow: Post Split', 'Offense', { notes: 'Elbow entry, then the two guards split off each other on the ball side. Passer screens away, screener comes to the ball.', tips: ['Read the defender on the split. If he cheats to the screen, the screener slips to the rim.'], sits: ['post_entry', 'vs_switch'], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), screen('O1', 'O2', [400, 230], 'top', [430, 290], '1 screens away for 2. 2 comes to the top.'),
  cut('O1', 'rCorner', null, '1 pops back to the corner.'), pass('O5', 'O2'), shot('O2', 'Shot, or 2 drives the gap.')]);
set('Elbow: Dive and Lob', 'Offense', { notes: 'The weak side wing cuts to the elbow big for a handoff fake, then the big dives for a lob as the weak side empties.', tips: ['Sell the handoff with your eyes and hands. The dive comes right after the fake.'], sits: ['need2', 'get_big'], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), cut('O3', [350, 230], [280, 300], '3 cuts to 5 like a handoff is coming.'),
  Object.assign(mv({ O3: ['rWingHigh', 'dribble'], O5: ['rim', 'cut', [300, 160]] }, 'Handoff to 3, and 5 dives to the rim.'), { b: 'O3' }),
  pass('O3', 'O5', 'Lob.'), shot('O5')]);
set('Elbow: Away Pin Down', 'Offense', { notes: 'Elbow entry and the passer screens away for the opposite corner. A simple two sided action for a team learning to play off the elbow.', tips: ['Screen away on the inside shoulder. The shooter curls or pops based on the chaser.'], sits: ['young_lineup', 'get_shooter'], mirror: true, first: '5 at the elbow.' }, EL, [
  pass('O1', 'O5'), pin('O1', 'O4', [120, 180], 'lWing', [60, 150], '1 screens away for 4. 4 comes up to the wing.'),
  pass('O5', 'O4'), shot('O4', 'Shot, or drive if he runs at you.')]);
/* ---- Delay series (5 at the top with the ball) ---- */
const DL = F.DELAY;
set('Delay: Chicago', 'Offense', { notes: 'The big has it at the top. The corner shooter comes off a pin down from the slot guard straight into a handoff from the big. Pin down into handoff: Chicago.', tips: ['Pin down screener: screen, then space to the corner the shooter left.'], sits: ['get_shooter', 'quick', 'cov_under'], reads: [{ when: 'they go under the pin down', then: 'The shooter stops behind the screen and shoots', frame: 1 }], ball: 'O5', mirror: true, first: '5 at the top with the ball. Delay.' }, DL, [
  pin('O1', 'O2', [420, 160], 'rWingHigh', [470, 140], '1 pins down for 2. 2 sprints up.'),
  dho('O5', 'O2', [300, 330], 'lLane', [370, 320]), cut('O5', 'rim', [280, 230], '5 rolls.'), cut('O1', 'rCorner', null, '1 fills the corner.'), shot('O2', 'Finish, roll, or kick.')]);
set('Delay: Get', 'Offense', { notes: 'The big pitches to the slot and gets it back with a handoff and screen in one motion, then rolls.', tips: ['Get action: the pass and the follow are one move. No pause.'], sits: ['quick', 'get_pg'], ball: 'O5', mirror: true, first: 'Delay set.' }, DL, [
  pass('O5', 'O1'), mv({ O5: [[320, 320], 'screen'] }, '5 follows his pass into a ball screen.'),
  pnr('O5', 'O1', [320, 320], 'nail', 'rim')[1], drib('O1', 'nail', null, '1 turns the corner.'), shot('O1')]);
set('Delay: Chin', 'Offense', { notes: 'The slot guard passes to the big and cuts off him to the rim (a chin cut), then the other slot comes off a pin down into a handoff.', tips: ['Chin cut is a scoring cut: brush the big\'s hip and read the help.'], sits: ['vs_set_defense', 'ato'], ball: 'O5', mirror: true, first: 'Delay set, 1 has just passed to 5.' }, DL, [
  cut('O1', 'rim', [280, 280], '1 chin cuts off 5 to the rim.'), cut('O1', 'rCorner', null, '1 clears to the corner, 2 lifts.'),
  cut('O2', 'rWing', null, '2 lifts to the wing.'), dho('O5', 'O3', [230, 330], 'rLane', [180, 320]), shot('O3')]);
set('Delay: Handback Flare', 'Offense', { notes: 'Handoff to the slot, then the big turns and flare screens for the guard who just gave it up.', tips: ['Give it, then set the flare two steps away. The skip is the shot.'], sits: ['need3', 'get_shooter'], ball: 'O5', mirror: true, first: 'Delay set.' }, DL, [
  dho('O5', 'O1', [300, 330], 'lSlot', [330, 300]), flare('O5', 'O3', [230, 300], 'lWing', [190, 330]),
  pass('O1', 'O3', 'Skip to 3 off the flare.'), shot('O3')]);
set('Delay: Dribble Weave', 'Offense', { notes: 'Weave handoffs around the top until a defender goes under, then the receiver keeps it and attacks.', tips: ['Handoffs at the arc, not inside it. Keep the floor wide.'], sits: ['no_big', 'five_shooters', 'vs_switch'], ball: 'O5', first: 'Delay set.' }, DL, [
  dho('O5', 'O1', [310, 330], 'lSlot', [330, 300]), dho('O1', 'O3', [190, 320], 'rSlot', [160, 300]), drib('O3', 'rLane', null, 'If his man goes under, 3 keeps it and drives.'), shot('O3')]);
set('Delay: Double Drag', 'Offense', { notes: 'Out of Delay the guard brings it up into two staggered ball screens from the bigs. First big rolls, second pops.', tips: ['Use both screens. Change speed between them.'], sits: ['transition', 'early_offense', 'need2'], ball: 'O1', mirror: true, first: '1 has it in the right slot, 5 and 4 trail into screens.' }, { O1: 'rSlot', O5: [300, 350], O4: [230, 360], O2: 'rCorner', O3: 'lCorner' }, [
  mv({ O5: [[310, 330], 'screen'], O4: [[250, 335], 'screen'], O1: [[200, 300], 'dribble', [290, 330]] }, '5 and 4 set the double drag. 1 comes off both going left.'),
  together(cut('O5', 'rim', [280, 230], '5 rolls.'), cut('O4', 'lWingHigh', null, '4 pops.')), shot('O1', 'Finish, roll, or pop.')]);
set('Delay: Ghost', 'Offense', { notes: 'The big sprints up like a ball screen is coming and slips out to the three point line without touching anyone. The defense is stuck between two covers.', tips: ['Ghost it at full speed. The slip is the screen.'], sits: ['cov_switch', 'cov_blitz', 'vs_switch'], ball: 'O1', mirror: true, first: '1 at the top, 5 trailing.' }, { O1: 'top', O5: [250, 390], O2: 'rCorner', O3: 'lCorner', O4: 'lWing' }, [
  mv({ O5: [[300, 320], 'cut'], O1: [[200, 310], 'dribble'] }, '5 runs at the ball like he is going to screen.'),
  cut('O5', 'rWingHigh', null, '5 ghosts to the wing instead.'), pass('O1', 'O5'), shot('O5')]);
set('Delay: Snug Post', 'Offense', { notes: 'A snug ball screen set low on the wing by the big, who then seals in the post for the dump down.', tips: ['Snug screen is set inside the arc. The roll is one step.'], sits: ['get_big', 'post_entry', 'cov_switch'], ball: 'O1', mirror: true, first: '1 on the right wing, 5 at the right block.' }, { O1: 'rWing', O5: 'rBlock', O2: 'rCorner', O3: 'lWing', O4: 'lCorner' }, [
  mv({ O5: [[410, 200], 'screen'], O1: [[360, 240], 'dribble'] }, '5 steps up for the snug screen. 1 comes off.'),
  seal('O5', 'rLow', '5 rolls one step and seals.'), pass('O1', 'O5', 'Dump it down.'), shot('O5')]);
/* ---- Zipper series ---- */
const ZP = F.ZIP;
set('Zipper: Flare', 'Offense', { notes: 'Zipper cut up the lane to the top, then the big who screened turns and flares for the point guard who passed it.', tips: ['Two screens by the same big: down, then flare. Set them with your chest to the cutter.'], sits: ['need3', 'ato'], mirror: true, first: 'Zipper: 2 on the right block, 5 at the elbow.' }, ZP, [
  pin('O5', 'O2', [310, 160], 'top', [300, 230], '5 zippers 2 to the top.'), pass('O1', 'O2'),
  flare('O5', 'O1', [310, 300], 'rWing', [340, 350]), pass('O2', 'O1', '2 skips to 1.'), shot('O1')]);
set('Zipper: Pick and Roll', 'Offense', { notes: 'Zipper cut up for the catch, straight into a ball screen from the big who screened.', tips: ['Catch the zipper on the move. The ball screen is already there.'], sits: ['get_pg', 'need2'], mirror: true, first: 'Zipper set.' }, ZP, [
  pin('O5', 'O2', [310, 160], 'top', [300, 230]), pass('O1', 'O2'), cut('O1', 'rWing', null, '1 clears to the wing.'),
  pnr('O5', 'O2', [220, 320], [170, 290], 'rim'), shot('O2')]);
set('Zipper: Post Up', 'Offense', { notes: 'Zipper the guard up, swing it, and the big who screened posts up on the ball side with a clean seal.', tips: ['Big: after the down screen, pin the defender on your back as the ball swings.'], sits: ['post_entry', 'get_big'], mirror: true, first: 'Zipper set.' }, ZP, [
  pin('O5', 'O2', [310, 160], 'top', [300, 230]), pass('O1', 'O2'), cut('O1', 'rWing', null, '1 fills the right wing.'),
  pass('O2', 'O1'), seal('O5', 'rLow', '5 seals on the block.'), pass('O1', 'O5'), shot('O5')]);
set('Zipper: Zoom', 'Offense', { notes: 'Zipper cut into a handoff with the trailing big, a two man game at the top with shooters wide.', tips: ['The handoff man sets it like a screen: feet set, ball at the hip.'], sits: ['quick', 'get_shooter'], mirror: true, first: 'Zipper set.' }, ZP, [
  pin('O5', 'O2', [310, 160], [320, 280], [320, 230], '5 screens down. 2 comes up to the slot.'),
  pass('O1', 'O5', '1 hits 5 popping to the top.'), cut('O5', 'top', null, ''), dho('O5', 'O2', [280, 330], 'lLane', [320, 300]), shot('O2')]);
set('Zipper: Back Door', 'Offense', { notes: 'When they top lock the zipper cut, the cutter plants and goes back door off the big\'s hip. The point guard throws the bounce pass.', tips: ['Two hard steps up, then plant. Do not telegraph it.'], sits: ['cov_top_lock', 'vs_deny'], mirror: true, first: 'Zipper set, 2 is being denied.' }, ZP, [
  mv({ O5: [[310, 160], 'screen'], O2: [[315, 200], 'cut'] }, '2 starts the zipper cut, his man top locks it.'),
  cut('O2', 'rim', [330, 140], '2 plants and goes back door.'), pass('O1', 'O2', 'Bounce pass.'), shot('O2')]);
set('Zipper: Double', 'Offense', { notes: 'The zipper cutter comes up, then both bigs stagger for him on the other side for a shot coming off two.', tips: ['Shooter: run the stagger shoulder to shoulder with the screens.'], sits: ['need3', 'get_shooter', 'ato'], mirror: true, first: 'Zipper set.' }, ZP, [
  pin('O5', 'O2', [310, 160], 'top', [300, 230]), pass('O1', 'O2'), cut('O1', 'rCorner', null, '1 clears to the corner.'),
  stagger('O4', 'O5', 'O1', [360, 150], [330, 230], 'rTop', [420, 180], '4 and 5 stagger for 1 coming back up.'), pass('O2', 'O1'), shot('O1')]);
/* ---- Floppy series ---- */
const FP = F.FLOPPY;
set('Floppy: Single Double', 'Offense', { notes: 'The shooter under the rim picks a side: a single screen one way, a double screen the other. The point guard hits whichever side he comes out.', tips: ['Shooter: read your defender. Go away from where he cheats.'], sits: ['get_shooter', 'need3', 'ato'], reads: [{ when: 'they chase over the single', then: 'Curl it to the lane and the big pops', frame: 1 }, { when: 'they go under', then: 'Stop short for the catch and shoot', frame: 1 }], first: 'Floppy: 2 under the rim, bigs on the blocks, 3 on the left wing.' }, FP, [
  together(mv({ O4: [[180, 120], 'screen'], O3: [[140, 170], 'screen'] }, '4 and 3 form the double on the left.'), screen('O5', 'O2', [330, 120], 'rWing', [330, 90], '5 sets the single on the right. 2 picks the single.')),
  pass('O1', 'O2'), cut('O5', 'rBlock', null, '5 rolls back to the block.'), shot('O2', 'Catch and shoot, or curl.')]);
set('Floppy: Double Side', 'Offense', { notes: 'Floppy where the shooter takes the double. The two screeners then split: one pops, one dives.', tips: ['Off the double, the shooter curls tight or fades wide. Never in between.'], sits: ['get_shooter', 'need3'], mirror: true, first: 'Floppy set.' }, FP, [
  dbl('O4', 'O3', 'O2', [180, 120], [140, 170], 'lWing', [180, 80], '4 and 3 double for 2. 2 comes off to the left wing.'),
  pass('O1', 'O2'), together(cut('O3', 'lSlot', null, '3 pops.'), cut('O4', 'lBlock', null, '4 dives.')), shot('O2')]);
set('Floppy: Curl and Dive', 'Offense', { notes: 'The shooter curls the single screen into the lane and the screener dives behind him for the second option.', tips: ['Curl when the chaser is on your back. The dive is open when the big helps on the curl.'], sits: ['cov_over', 'need2'], mirror: true, first: 'Floppy set.' }, FP, [
  screen('O5', 'O2', [330, 120], 'rElbow', [360, 110], '5 screens. 2 curls to the elbow.'),
  pass('O1', 'O2'), cut('O5', 'rim', null, '5 dives.'), shot('O2', 'Pull up, or drop it to 5.')]);
set('Floppy: Flare Back', 'Offense', { notes: 'The shooter comes off the single, the ball swings away, and the same screener flares him back for the skip.', tips: ['Shooter: after the first catch, pass and relocate. The flare comes on the second side.'], sits: ['need3', 'vs_switch'], mirror: true, first: 'Floppy set.' }, FP, [
  screen('O5', 'O2', [330, 120], 'rWing', [330, 90]), pass('O1', 'O2'), pass('O2', 'O1', '2 gives it back.'),
  flare('O5', 'O2', [400, 200], 'rCorner', [430, 180]), pass('O1', 'O2', 'Skip to the corner.'), shot('O2')]);
set('Floppy: Pin and Post', 'Offense', { notes: 'Floppy for the shooter, then the screener posts up on the block with the shooter ready to feed it.', tips: ['Big: screen, then turn and seal before the ball arrives on the wing.'], sits: ['post_entry', 'get_big'], mirror: true, first: 'Floppy set.' }, FP, [
  screen('O5', 'O2', [330, 120], 'rWing', [330, 90]), pass('O1', 'O2'), seal('O5', 'rLow'), pass('O2', 'O5'), shot('O5')]);
set('Floppy: Elevator', 'Offense', { notes: 'Floppy look, but the shooter runs between the two bigs who close the doors behind him at the top.', tips: ['Bigs: close the doors the moment the shooter clears your hips.'], sits: ['need3', 'ato', 'get_shooter'], first: 'Floppy set, bigs at the elbows this time.' }, { O1: 'top', O2: [250, 85], O4: 'lElbow', O5: 'rElbow', O3: 'lWing' }, [
  cut('O2', 'ft', null, '2 runs up the lane toward the elbows.'),
  mv({ O2: [[250, 290], 'cut'], O4: [[225, 200], 'screen'], O5: [[275, 200], 'screen'] }, '2 goes through the doors. 4 and 5 close them.'),
  pass('O1', 'O2'), shot('O2')]);
/* ---- Pistol / 21 ---- */
const PI = F.PISTOL;
set('Pistol: 21 Dribble', 'Offense', { notes: 'Pistol: the guard and wing pitch and follow on the side, then the trailing big ball screens. Three actions in four seconds.', tips: ['Pitch it ahead early. The whole thing works because the defense is not set.'], sits: ['transition', 'early_offense', 'quick'], mirror: true, first: 'Pistol: 1 in the right slot, 2 on the right wing, 5 trailing.' }, PI, [
  pass('O1', 'O2'), dho('O2', 'O1', [400, 270], 'rSlot', [380, 300]),
  pnr('O5', 'O1', [310, 330], 'nail', 'rim'), shot('O1')]);
set('Pistol: Fan', 'Offense', { notes: 'Pistol pitch ahead, then the guard fans out to the wing while the big screens for the wing coming to the middle.', tips: ['The fan opens the drive. The big screens toward the middle.'], sits: ['transition', 'early_offense'], mirror: true, first: 'Pistol set.' }, PI, [
  pass('O1', 'O2'), cut('O1', 'rCorner', null, '1 fans to the corner.'), pnr('O5', 'O2', [400, 270], 'nail', 'rim'), shot('O2')]);
set('Pistol: Flip', 'Offense', { notes: 'The wing comes to the guard for a handoff, then the big flips a screen right behind it for the new ball handler.', tips: ['Handoff and ball screen back to back. The defense has to switch twice.'], sits: ['transition', 'vs_switch'], mirror: true, first: 'Pistol set.' }, PI, [
  dho('O1', 'O2', [370, 310], 'top', [420, 260]), pnr('O5', 'O2', [230, 330], 'lSlot', 'rim'), shot('O2')]);
set('Pistol: Pop', 'Offense', { notes: 'Pistol pitch ahead into a ball screen from the trailing big who pops instead of rolling, with the weak side wing drifting.', tips: ['Popper: get behind the line. Trail three.'], sits: ['transition', 'trail_three'], mirror: true, first: 'Pistol set.' }, PI, [
  pass('O1', 'O2'), pnp('O5', 'O2', [400, 280], 'nail', 'rTop'), pass('O2', 'O5'), shot('O5')]);
set('Pistol: Reject', 'Offense', { notes: 'The wing fakes the handoff and rejects it baseline while the guard clears. A counter to teams that jump the Pistol handoff.', tips: ['Reject when the defender cheats over the top of the handoff.'], sits: ['cov_over', 'transition'], mirror: true, first: 'Pistol set.' }, PI, [
  pass('O1', 'O2'), mv({ O1: [[400, 270], 'cut'] }, '1 comes at 2 like a handoff is coming.'),
  mv({ O2: ['rShort', 'dribble', [470, 180]], O1: ['top', 'cut'] }, '2 rejects it baseline. 1 clears to the top.'), shot('O2')]);
set('Pistol: Double Drag', 'Offense', { notes: 'Pistol look that flows into two drag screens when the first pitch is denied.', tips: ['If the pitch ahead is not there, keep dribbling into the drags.'], sits: ['transition', 'vs_deny'], mirror: true, first: 'Pistol set, the wing is denied.' }, PI, [
  cut('O2', 'rCorner', null, '2 is denied and clears to the corner.'),
  mv({ O5: [[310, 330], 'screen'], O4: [[230, 335], 'screen'], O1: [[180, 300], 'dribble', [280, 330]] }, '5 and 4 drag. 1 uses both.'),
  together(cut('O5', 'rim', [280, 230], '5 rolls.'), cut('O4', 'lWingHigh', null, '4 pops.')), shot('O1')]);
/* ---- Spain, drag and ball screen specials ---- */
const SP = F.SPREAD;
set('Spain: Flare', 'Offense', { notes: 'Spain pick and roll with a flare for the back screener instead of a pop. The weak side wing flares him to the corner.', tips: ['Back screener: after you screen the roller\'s man, run to the flare.'], sits: ['need3', 'cov_drop', 'ato'], mirror: true, first: 'Spread, 5 at the nail.' }, SP, [
  pnr('O5', 'O1', [290, 350], [340, 300], 'rim'),
  back('O2', 'O5', [280, 200], 'rim', null, '2 lifts and back screens the roller\'s man.'),
  flare('O4', 'O2', [160, 180], 'lCorner', [120, 220], '4 flares 2 to the opposite corner.'),
  pass('O1', 'O2', 'Skip to 2.'), shot('O2')]);
set('Spain: Double', 'Offense', { notes: 'Both corners lift to back screen the roller\'s defender, then split to both wings. Two shooters pop, one big rolls.', tips: ['Second back screener arrives a beat late so the switch cannot find him.'], sits: ['need2', 'cov_drop'], first: 'Spread, 5 at the nail, shooters in both corners.' }, SP, [
  pnr('O5', 'O1', [250, 350], 'nail', 'rim'),
  mv({ O2: [[280, 200], 'screen'], O3: [[220, 200], 'screen'] }, '2 and 3 both lift and back screen the roller\'s man.'),
  together(cut('O2', 'rWing', null, '2 pops right.'), cut('O3', 'lWing', null, '3 pops left.')),
  pass('O1', 'O5', 'Lob to 5, or either wing.'), shot('O5')]);
set('Drag: Step Up', 'Offense', { notes: 'A step up ball screen in transition: the big screens from below the ball toward the baseline, sending the guard to the sideline side.', tips: ['Step up screens attack the ice coverage. Go baseline with pace.'], sits: ['transition', 'cov_ice', 'drag'], mirror: true, first: '1 on the right wing in early offense, 5 on the block.' }, { O1: 'rWing', O5: 'rBlock', O2: 'lCorner', O3: 'lWing', O4: 'top' }, [
  mv({ O5: [[430, 190], 'screen'], O1: ['rShort', 'dribble', [470, 170]] }, '5 steps up. 1 goes baseline off it.'),
  cut('O5', 'rLane', null, '5 rolls to the lane.'), shot('O1', 'Finish, or drop to 5.')]);
set('Drag: Angle', 'Offense', { notes: 'An angle ball screen at the slot that sends the handler to the middle of the floor, with the weak side big spacing to the corner.', tips: ['Angle screen: screener faces the sideline so the handler comes off into the middle.'], sits: ['transition', 'get_pg'], mirror: true, first: '1 in the right slot, 5 trailing.' }, { O1: 'rSlot', O5: [300, 370], O2: 'rCorner', O3: 'lCorner', O4: 'lWing' }, [
  mv({ O5: [[330, 320], 'screen'], O1: ['nail', 'dribble', [300, 310]] }, '5 angles the screen. 1 comes off to the middle.'),
  cut('O5', 'rBlock', [330, 240], '5 rolls down the right side.'), shot('O1', 'Finish, roll, or kick.')]);
set('Drag: Veer', 'Offense', { notes: 'The ball screener rolls and then veers off to screen the weak side shooter instead of finishing the roll. The skip pass is the shot.', tips: ['Veer when the low man is tagging you. Go screen the man who is helping.'], sits: ['need3', 'cov_drop'], mirror: true, first: '1 at the top, 5 at the nail, 3 in the left corner.' }, SP, [
  pnr('O5', 'O1', [290, 350], [340, 300], 'lLane'),
  flare('O5', 'O3', [140, 130], 'lWing', [90, 110], '5 veers off and screens for 3 lifting.'),
  pass('O1', 'O3', 'Skip to 3.'), shot('O3')]);
set('Drag: Gortat', 'Offense', { notes: 'The screener rolls and then screens the help defender under the rim, clearing the lane for the driving guard.', tips: ['Roll, then find the help. Screen him with your chest.'], sits: ['need2', 'cov_drop', 'get_pg'], mirror: true, first: 'Spread, 5 at the nail.' }, SP, [
  pnr('O5', 'O1', [290, 350], [340, 300], 'rLane'),
  mv({ O5: [[260, 110], 'screen'], O1: ['rim', 'dribble', [330, 200]] }, '5 screens the help under the rim. 1 drives to the rim.'), shot('O1')]);
set('Drag: Twirl', 'Offense', { notes: 'A pin down for the shooter who then turns and ball screens for the point guard in one motion. Guard to guard screen into a drive.', tips: ['The shooter\'s man usually does not want to switch. Attack him.'], sits: ['cov_switch', 'need2'], mirror: true, first: '1 at the top, 2 in the right corner, 5 at the right block.' }, { O1: 'top', O2: 'rCorner', O5: 'rBlock', O3: 'lWing', O4: 'lCorner' }, [
  pin('O5', 'O2', [430, 150], 'rWingHigh', [470, 130]),
  mv({ O2: [[300, 320], 'screen'], O1: [[220, 290], 'dribble'] }, '2 twirls into a ball screen for 1. 1 goes left.'),
  cut('O2', 'rTop', null, '2 pops.'), shot('O1', 'Attack, or kick to 2.')]);
set('Drag: Ram Roll', 'Offense', { notes: 'The wing back screens the big who then sprints into a ball screen. The big\'s defender is a step late, so the roll is clean.', tips: ['Ram: screen the big\'s man first. That is the whole trick.'], sits: ['cov_switch', 'need2', 'vs_bigger'], mirror: true, first: '1 at the top, 5 on the block, 3 on the wing.' }, { O1: 'top', O5: 'rBlock', O3: 'rWing', O2: 'lCorner', O4: 'lWing' }, [
  back('O3', 'O5', [320, 130], [295, 318], [300, 220], '3 back screens for 5. 5 sprints up to screen the ball.'),
  pnr('O5', 'O1', [295, 318], [350, 290], 'rim', 'O3', 'rWing'), shot('O1', 'Finish or roll.')]);
set('Drag: Wedge Roll', 'Offense', { notes: 'A guard screens the big\'s defender in the lane (a wedge), then the big comes up and ball screens. Rolls to the rim.', tips: ['Wedge screen is set below the big. He comes off it going uphill.'], sits: ['cov_switch', 'need2'], mirror: true, first: '1 at the top, 5 on the block, 2 at the elbow.' }, { O1: 'top', O5: 'rBlock', O2: 'rElbow', O3: 'lCorner', O4: 'lWing' }, [
  mv({ O2: [[310, 130], 'screen'], O5: [[295, 318], 'cut', [300, 220]] }, '2 wedges for 5. 5 comes up to screen.'),
  cut('O2', 'rCorner', null, '2 clears to the corner.'), pnr('O5', 'O1', [295, 318], [350, 290], 'rim'), shot('O1')]);
set('Drag: Wedge Flare', 'Offense', { notes: 'Wedge screen into a ball screen, and the wedge screener gets a flare from the weak side big as the guard comes off.', tips: ['Three screens in one play. Everyone screens somebody.'], sits: ['need3', 'ato'], mirror: true, first: '1 at the top, 5 on the block, 2 at the elbow, 4 on the left wing.' }, { O1: 'top', O5: 'rBlock', O2: 'rElbow', O3: 'lCorner', O4: 'lWing' }, [
  mv({ O2: [[310, 130], 'screen'], O5: [[295, 318], 'cut', [300, 220]] }, '2 wedges for 5. 5 comes up to screen.'),
  together(pnr('O5', 'O1', [295, 318], [350, 290], 'rim')[0], flare('O4', 'O2', [180, 180], 'lWing', [230, 170], '4 flares 2 to the left wing.')),
  pass('O1', 'O2', 'Skip to 2.'), shot('O2')]);
set('Drag: 77', 'Offense', { notes: 'Two bigs set back to back ball screens at the top, both on the same side. Seventy seven: double high.', tips: ['First big rolls, second big pops. Never both roll.'], sits: ['transition', 'need2'], mirror: true, first: '1 at the top, 4 and 5 stacked at the top of the key.' }, { O1: 'topDeep', O5: [270, 330], O4: [230, 345], O2: 'rCorner', O3: 'lCorner' }, [
  mv({ O5: [[290, 330], 'screen'], O4: [[250, 340], 'screen'], O1: [[200, 300], 'dribble', [290, 345]] }, '1 comes off both screens going left.'),
  together(cut('O5', 'rim', [270, 230], '5 rolls.'), cut('O4', 'rTop', null, '4 pops.')), shot('O1')]);
set('Drag: Snug Reject', 'Offense', { notes: 'The guard rejects the snug ball screen and drives the other way while the big seals the lane.', tips: ['Reject when the defender shades to the screen side.'], sits: ['cov_ice', 'cov_over'], mirror: true, first: '1 on the right wing, 5 on the block.' }, { O1: 'rWing', O5: 'rBlock', O2: 'rCorner', O3: 'lWing', O4: 'lCorner' }, [
  mv({ O5: [[410, 200], 'screen'], O1: ['rLane', 'dribble', [430, 170]] }, '5 steps up to screen. 1 rejects it and drives the other way into the lane.'),
  seal('O5', 'rLow'), shot('O1', 'Finish, or dump to 5 on the seal.')]);
/* ---- Zoom, Chicago, Iverson, Hawk, Rip, Loop, UCLA ---- */
set('Zoom: Wing', 'Offense', { notes: 'Pin down into a handoff on the wing: the corner shooter comes off the big\'s pin down and takes a handoff from the wing in one motion.', tips: ['No gap between the two screens. It is one action.'], sits: ['get_shooter', 'quick', 'cov_under'], mirror: true, first: '2 on the right wing with the ball, 5 at the block, 3 in the corner.' }, { O2: 'rWing', O5: 'rBlock', O3: 'rCorner', O1: 'top', O4: 'lWing' }, [
  pin('O5', 'O3', [430, 150], [420, 220], [470, 160], '5 pins down. 3 comes up to 2.'),
  dho('O2', 'O3', [420, 230], 'nail', [440, 260]), cut('O5', 'rim', null, '5 rolls behind it.'), shot('O3')]);
set('Zoom: Top', 'Offense', { notes: 'Zoom action at the top: a pin down from the slot into a handoff from the point guard, then the ball handler attacks a spread floor.', tips: ['The handoff man screens as he hands it off. The guard reads the defender going under.'], sits: ['quick', 'get_shooter'], mirror: true, first: '1 at the top, 2 in the right corner, 3 in the right slot.' }, { O1: 'top', O2: 'rCorner', O3: 'rSlot', O4: 'lCorner', O5: 'lBlock' }, [
  pin('O3', 'O2', [430, 160], 'rWingHigh', [470, 140]), dho('O1', 'O2', [310, 320], 'lLane', [360, 300]), shot('O2')]);
set('Iverson: Rip', 'Offense', { notes: 'The wing runs the Iverson cut across both elbows, catches, and the elbow big back screens for the passer who cuts to the rim.', tips: ['Iverson cut is two screens. Rub both shoulders.'], sits: ['get_shooter', 'ato'], mirror: true, first: '1 at the top, 4 and 5 at the elbows, 2 on the left wing.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'lWing', O3: 'rCorner' }, [
  mv({ O2: ['rWing', 'cut', [250, 215]] }, '2 runs the Iverson cut across the elbows.'), pass('O1', 'O2'),
  back('O4', 'O1', [230, 300], 'rim', [250, 230], '4 back screens for 1. 1 cuts to the rim.'), pass('O2', 'O1'), shot('O1')]);
set('Iverson: Pick and Roll', 'Offense', { notes: 'Iverson cut for the catch, then the ball side elbow big turns and ball screens. The other big slips to the rim.', tips: ['Catch the Iverson cut on the move and keep going into the ball screen.'], sits: ['need2', 'get_shooter'], mirror: true, first: 'Iverson set.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'lWing', O3: 'rCorner' }, [
  mv({ O2: ['rWing', 'cut', [250, 215]] }, '2 runs the Iverson cut.'), pass('O1', 'O2'),
  together(pnr('O5', 'O2', [420, 270], 'nail', 'rim')[0], cut('O4', 'lBlock', null, '4 dives to the weak side block.')),
  cut('O5', 'rim', null, '5 rolls.'), shot('O2')]);
set('Iverson: Flare', 'Offense', { notes: 'Iverson cut, then the passer flares off the opposite elbow big for the skip pass.', tips: ['Flare and set your feet. The skip is the shot.'], sits: ['need3', 'ato'], mirror: true, first: 'Iverson set.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'lWing', O3: 'rCorner' }, [
  mv({ O2: ['rWing', 'cut', [250, 215]] }, '2 runs the Iverson cut.'), pass('O1', 'O2'),
  flare('O4', 'O1', [200, 300], 'lWing', [230, 345]), pass('O2', 'O1', 'Skip to 1.'), shot('O1')]);
set('Hawk: Post', 'Offense', { notes: 'The Hawk cut: the wing cuts off the high post to the ball side block, then posts. The weak side fills behind.', tips: ['Hawk cut goes over the top of the post man, not under.'], sits: ['post_entry', 'get_big'], mirror: true, first: '1 at the top, 5 at the right elbow, 2 on the right wing, 4 on the left block.' }, { O1: 'top', O5: 'rElbow', O2: 'rWing', O3: 'lWing', O4: 'lBlock' }, [
  screen('O5', 'O2', [320, 200], 'rBlock', [310, 170], '2 hawk cuts off 5 to the block.'), pass('O1', 'O2', '1 feeds the post.'),
  cut('O5', 'rWingHigh', null, '5 pops out for the kick.'), shot('O2')]);
set('Hawk: Pick and Roll', 'Offense', { notes: 'Hawk cut to clear the wing, then the high post big steps out and ball screens for the point guard on the emptied side.', tips: ['The Hawk cut empties the side. Attack the empty side.'], sits: ['need2', 'get_pg'], mirror: true, first: 'Hawk set.' }, { O1: 'top', O5: 'rElbow', O2: 'rWing', O3: 'lWing', O4: 'lBlock' }, [
  screen('O5', 'O2', [320, 200], 'lCorner', [310, 170], '2 hawk cuts off 5 and clears to the far corner.'),
  pnr('O5', 'O1', [295, 318], 'rWing', 'rim'), shot('O1')]);
set('Loop: Pin Down', 'Offense', { notes: 'The point guard passes to the wing and loops under the rim to the other side, coming off a pin down for a shot.', tips: ['Loop at full speed. The screen is waiting, do not wait for it.'], sits: ['get_shooter', 'get_pg', 'need3'], mirror: true, first: '1 at the top, 2 and 3 on the wings, bigs on the blocks.' }, F.LOW, [
  pass('O1', 'O2'), cut('O1', 'lBlock', [250, 100], '1 loops under the rim.'),
  pin('O4', 'O1', [110, 170], 'lWing', [60, 150], '4 pins down for 1.'), pass('O2', 'O3', '2 swings to 3.'), pass('O3', 'O1'), shot('O1')]);
set('Loop: Back Screen', 'Offense', { notes: 'The point guard passes and loops, but the weak side wing back screens the big for a lob as the loop pulls the defense.', tips: ['The loop is the decoy. The lob is the shot.'], sits: ['need2', 'get_big'], mirror: true, first: 'Loop set.' }, F.LOW, [
  pass('O1', 'O2'), cut('O1', 'lWing', [250, 100], '1 loops under the rim to the left wing.'),
  back('O3', 'O4', [130, 150], 'rim', [170, 130], '3 back screens 4 for the lob.'), pass('O2', 'O4', 'Lob.'), shot('O4')]);
set('UCLA: Pick and Roll', 'Offense', { notes: 'UCLA cut off the high post, then the post steps out and ball screens the wing on the emptied side.', tips: ['Cutter: go all the way to the block. That is what empties the side.'], sits: ['need2', 'get_pg'], mirror: true, first: '1 at the top, 2 on the right wing, 5 at the right elbow.' }, { O1: 'top', O2: 'rWing', O5: 'rElbow', O3: 'lWing', O4: 'lBlock' }, [
  pass('O1', 'O2'), screen('O5', 'O1', [320, 200], 'rBlock', [300, 170], '1 UCLA cuts off 5 to the block.'),
  cut('O1', 'lCorner', [250, 90], '1 clears to the far corner.'), pnr('O5', 'O2', [420, 270], 'nail', 'rim'), shot('O2')]);
set('UCLA: Flex', 'Offense', { notes: 'UCLA cut to the block, then that cutter flex screens across for the weak side big, who gets a down screen after.', tips: ['Flex screen, then screen the screener. Two shots from one cut.'], sits: ['vs_set_defense', 'need2'], mirror: true, first: 'UCLA set.' }, { O1: 'top', O2: 'rWing', O5: 'rElbow', O3: 'lWing', O4: 'lBlock' }, [
  pass('O1', 'O2'), screen('O5', 'O1', [320, 200], 'rBlock', [300, 170], '1 UCLA cuts to the block.'),
  cross('O1', 'O4', [230, 95], 'rLow', [250, 70], '1 cross screens for 4. 4 comes to the ball side.'),
  pin('O5', 'O1', [220, 170], 'lElbow', [200, 130], '5 screens down for 1.'), pass('O2', 'O4', 'Feed 4, or hit 1 at the elbow.'), shot('O4')]);
set('UCLA: Stagger', 'Offense', { notes: 'UCLA cut, then both bigs stagger for the cutter coming back to the top for a three.', tips: ['Cutter: touch the block, then come off the stagger at full speed.'], sits: ['need3', 'get_shooter'], mirror: true, first: 'UCLA set.' }, { O1: 'top', O2: 'rWing', O5: 'rElbow', O3: 'lWing', O4: 'lBlock' }, [
  pass('O1', 'O2'), screen('O5', 'O1', [320, 200], 'lBlock', [300, 170], '1 UCLA cuts across to the left block.'),
  stagger('O4', 'O5', 'O1', [150, 160], [200, 240], 'lTop', [100, 200], '4 and 5 stagger for 1.'), pass('O2', 'O1'), shot('O1')]);

/* ================================================================
   NAMED SETS, batch two: baseline and sideline out of bounds, zone sets,
   press breaks.
================================================================ */
const BB = F.BLOB_BOX, BL = F.BLOB_LINE, BS = F.BLOB_STACK, BF = F.BLOB_FLAT, BD = F.BLOB_DIAMOND, BT = F.BLOB_TRIANGLE;
const bl = (name, opts, form, acts) => set(name, 'Baseline out', Object.assign({ ball: 'O3' }, opts), form, acts);
/* ---- Box BLOBs ---- */
bl('Box: Cross and Down', { notes: 'The classic. The ball side low man screens across for the weak side low man, then gets a down screen from the elbow. Two looks at the rim and one at the elbow.', tips: ['Inbounder: first look is the cross screen cutter, second is the screener popping.'], sits: ['blob', 'blob_vs_man', 'need2'], reads: [{ when: 'they switch the cross screen', then: 'The screener seals the switch and we throw it in', frame: 1 }], first: 'Box set, 3 inbounds.' }, BB, [
  cross('O4', 'O5', [250, 95], 'rLow', [250, 70], '4 cross screens for 5. 5 comes to the ball side block.'),
  pin('O1', 'O4', [185, 150], 'lElbow', [160, 120], '1 screens down for 4. 4 pops to the elbow.'), cut('O2', 'top', null, '2 is the safety at the top.'),
  pass('O3', 'O5', '3 hits 5 on the block, or 4 at the elbow.'), shot('O5')]);
bl('Box: Elbow Pop Three', { notes: 'Box set, both low men screen for the elbows who pop to the corners for threes. For a team with two shooting bigs or four guards.', tips: ['Elbows: wait for the screen, then sprint to the corner with hands ready.'], sits: ['blob', 'blob_need3', 'need3'], first: 'Box set, 3 inbounds.' }, BB, [
  together(pin('O4', 'O1', [180, 150], 'lCorner', [150, 190], '4 screens for 1. 1 pops to the left corner.'), pin('O5', 'O2', [320, 150], 'rCorner', [350, 190], '5 screens for 2. 2 pops to the right corner.')),
  pass('O3', 'O2', '3 hits the open corner.'), shot('O2')]);
bl('Box: Lob', { notes: 'The elbow man back screens the ball side low man\'s defender and the low man cuts to the rim for the lob. The other side screens away as the decoy.', tips: ['The lob is thrown to the rim, not the player. He goes and gets it.'], sits: ['blob', 'need2', 'get_big'], first: 'Box set, 3 inbounds.' }, BB, [
  together(back('O2', 'O5', [320, 120], 'rim', [300, 110], '2 back screens for 5. 5 goes to the rim.'), pin('O1', 'O4', [185, 150], 'lWing', [150, 120], '1 screens for 4 on the other side.')),
  pass('O3', 'O5', 'Lob to 5.'), shot('O5')]);
bl('Box: Stagger to the Corner', { notes: 'Both elbows drop and stagger screen for the weak side low man coming to the ball side corner for three.', tips: ['Shooter: run the baseline, come off the stagger, square up on the catch.'], sits: ['blob', 'blob_need3', 'get_shooter'], first: 'Box set, 3 inbounds, 4 is the shooter on the weak side block.' }, BB, [
  stagger('O2', 'O5', 'O4', [300, 150], [360, 110], 'rCorner', [250, 70], '2 and 5 stagger. 4 runs the baseline to the right corner.'),
  cut('O1', 'top', null, '1 is the safety.'), pass('O3', 'O4'), shot('O4')]);
bl('Box: Pop Out Safe', { notes: 'The safe inbound: both elbows pop to the wings, both low men step to the blocks. Get it in, then run offense.', tips: ['Against pressure, this is the one. Four options, no screens to mess up.'], sits: ['inb_safe', 'blob', 'young_lineup'], first: 'Box set, 3 inbounds.' }, BB, [
  mv({ O1: ['lWing', 'cut'], O2: ['rWing', 'cut'], O4: ['lBlock', 'cut'], O5: ['rBlock', 'cut'] }, 'Everyone pops: wings and blocks.'),
  pass('O3', 'O2'), cut('O3', 'rCorner', null, '3 steps in to the corner. Run offense.')]);
bl('Box: Flare the Inbounder', { notes: 'Get it in to the elbow man popping out, then flare screen the inbounder stepping in for a corner three.', tips: ['Inbounder: step in, then set up the flare. You are the shooter, not the passer.'], sits: ['blob', 'blob_need3', 'get_shooter'], first: 'Box set, 3 inbounds and is the shooter.' }, BB, [
  cut('O2', 'rWing', null, '2 pops to the wing.'), pass('O3', 'O2'), cut('O3', 'rLow', null, '3 steps in.'),
  flare('O5', 'O3', [400, 110], 'rCorner', [360, 80], '5 flares 3 to the corner.'), pass('O2', 'O3'), shot('O3')]);
bl('Box: Zipper Up', { notes: 'The ball side low man zippers up off the elbow man\'s down screen to the top. Safe entry, and the screener dives after.', tips: ['Zipper cutter: catch at the top facing the rim.'], sits: ['blob', 'inb_safe', 'vs_pressure'], first: 'Box set, 3 inbounds.' }, BB, [
  pin('O2', 'O5', [320, 150], 'top', [320, 120], '2 screens down. 5 zippers to the top.'), pass('O3', 'O5'),
  cut('O2', 'rim', null, '2 dives after the screen.'), pass('O5', 'O2', 'Hit the dive if it is there.'), shot('O2')]);
bl('Box: Cross and Curl', { notes: 'Low men cross on the baseline, the weak side elbow curls off the ball side elbow to the rim behind it.', tips: ['The curl comes second. Let the cross screen pull the defense first.'], sits: ['blob', 'need2'], first: 'Box set, 3 inbounds.' }, BB, [
  cross('O4', 'O5', [250, 95], 'rLow', [250, 70]),
  screen('O2', 'O1', [300, 170], 'rim', [280, 150], '2 screens at the elbow. 1 curls to the rim.'),
  pass('O3', 'O1', '3 hits 1 on the curl, or 5 on the block.'), shot('O1')]);
bl('Box: Elevator Doors', { notes: 'Elevator doors from a box: the shooter runs from the weak side block between the two elbows who close behind him at the top of the key.', tips: ['Shooter: sprint the first step, then shuffle through so the doors close on time.'], sits: ['blob', 'blob_need3', 'need3'], first: 'Box set, 3 inbounds, 4 is the shooter on the weak side block.' }, BB, [
  mv({ O4: [[250, 240], 'cut', [250, 170]], O1: [[225, 200], 'screen'], O2: [[275, 200], 'screen'] }, '4 runs up the lane. 1 and 2 close the doors.'),
  cut('O5', 'rLow', null, '5 steps to the ball side block.'), pass('O3', 'O4'), shot('O4')]);
bl('Box: Double Low', { notes: 'The weak side pair sets a double screen on the baseline for the ball side low man who comes off it to the weak side corner.', tips: ['Cutter: go under both screens, square to the inbounder on the catch.'], sits: ['blob', 'blob_need3'], first: 'Box set, 3 inbounds.' }, BB, [
  mv({ O1: [[185, 110], 'screen'], O4: [[150, 95], 'screen'], O5: ['lCorner', 'cut', [250, 70]] }, '1 drops and joins 4 for the double. 5 runs the baseline off it.'),
  cut('O2', 'rWing', null, '2 pops for the safety.'), pass('O3', 'O5'), shot('O5')]);
/* ---- Line BLOBs ---- */
bl('Line: Break', { notes: 'Four in a line on the lane line. On the slap they break four ways: top, corner, block, short corner. Simple and almost impossible to deny all four.', tips: ['Break hard and on the slap. Hesitation lets the defense match up.'], sits: ['blob', 'inb_safe', 'young_lineup'], first: 'Four in a line, 3 inbounds.' }, BL, [
  mv({ O1: ['top', 'cut'], O2: ['rCorner', 'cut'], O4: ['rLow', 'cut'], O5: ['rShort', 'cut'] }, 'Break: 1 top, 2 corner, 4 block, 5 short corner.'),
  pass('O3', 'O4', '3 hits the open man.'), shot('O4')]);
bl('Line: Screen the Last Man', { notes: 'The front three screen for the last man in line, who comes off all three to the top for a three.', tips: ['Three screens in a row. The cutter runs the gauntlet at full speed.'], sits: ['blob', 'blob_need3'], first: 'Four in a line, 3 inbounds, 1 is last in line.' }, BL, [
  mv({ O5: [[300, 110], 'screen'], O4: [[300, 155], 'screen'], O2: [[300, 200], 'screen'], O1: ['top', 'cut', [270, 220]] }, '1 comes off three screens to the top.'),
  pass('O3', 'O1'), shot('O1')]);
bl('Line: Curl Under', { notes: 'The first man in line curls under the rest of the line to the weak side block while the others step out. A layup when the defense bunches.', tips: ['Curl low and tight. The defense is looking at the breakers.'], sits: ['blob', 'need2'], first: 'Four in a line, 3 inbounds.' }, BL, [
  mv({ O5: ['lBlock', 'cut', [270, 80]], O4: ['rLow', 'cut'], O2: ['rCorner', 'cut'], O1: ['top', 'cut'] }, '5 curls under the line to the weak side block. The rest break out.'),
  pass('O3', 'O5', 'Bounce pass under the rim.'), shot('O5')]);
bl('Line: Flare the Top', { notes: 'The last man pops to the top for the safe catch, then the second man flares him to the wing for a shot as the inbounder steps in.', tips: ['Get it in first. The flare is the second pass.'], sits: ['blob', 'blob_need3'], first: 'Four in a line, 3 inbounds.' }, BL, [
  mv({ O1: ['top', 'cut'], O5: ['rLow', 'cut'], O4: ['rShort', 'cut'] }, '1 pops to the top, 5 and 4 step to the ball side.'),
  pass('O3', 'O1'), cut('O3', 'rCorner', null, '3 steps in to the corner.'),
  flare('O2', 'O1', [330, 290], 'lWing', [250, 345], '2 flares 1 to the left wing.'), pass('O3', 'O1', '3 skips it to 1.'), shot('O1')]);
bl('Line: Stack Lob', { notes: 'The line slides to the block together, then the big at the front seals and the others clear. Lob over the top to the sealed big.', tips: ['Big: seal with your back, hands high. The pass goes up, not out.'], sits: ['blob', 'need2', 'vs_bigger'], first: 'Four in a line, 3 inbounds, 5 at the front.' }, BL, [
  mv({ O4: ['rCorner', 'cut'], O2: ['top', 'cut'], O1: ['lWing', 'cut'] }, '4, 2 and 1 clear three ways.'),
  seal('O5', 'rLow', '5 seals his man under the rim.'), pass('O3', 'O5', 'Lob.'), shot('O5')]);
/* ---- Stack BLOBs ---- */
bl('Stack: Pop and Dive', { notes: 'Stack of three on the ball side lane line. Top pops, bottom dives, middle screens both.', tips: ['Middle man sets two screens with one body.'], sits: ['blob', 'need2'], first: 'Stack of 1, 4, 5 on the lane line, 2 at the top, 3 inbounds.' }, BS, [
  mv({ O1: ['lBlock', 'cut', [250, 70]], O5: ['rCorner', 'cut'] }, '1 dives under 4 to the far block. 5 pops to the corner.'),
  cut('O4', 'rLow', null, '4 steps to the ball.'), pass('O3', 'O4', '3 hits 4, 5 or 1.'), shot('O4')]);
bl('Stack: Three Corner', { notes: 'The stack peels toward the top one by one, and the last man comes off all three to the ball side corner.', tips: ['Peel in order: top first, then middle, then the shooter last.'], sits: ['blob', 'blob_need3'], first: 'Stack on the lane line, 3 inbounds, 5 is the shooter at the bottom.' }, BS, [
  mv({ O1: ['top', 'cut'], O4: ['rWing', 'cut'] }, '1 and 4 peel up.'),
  cut('O5', 'rCorner', [330, 120], '5 comes off the backs of both to the corner.'), pass('O3', 'O5'), shot('O5')]);
bl('Stack: Back Screen the Big', { notes: 'The top of the stack back screens the big at the bottom, who steps out and cuts to the rim. The inbounder has the lob or the safety at the top.', tips: ['Back screen then pop. The screener is the second option every time.'], sits: ['blob', 'need2'], first: 'Stack set, 3 inbounds.' }, BS, [
  back('O1', 'O5', [320, 160], 'rim', [340, 130], '1 back screens 5. 5 cuts to the rim.'),
  cut('O1', 'rWing', null, '1 pops.'), pass('O3', 'O5', 'Lob or bounce pass.'), shot('O5')]);
bl('Stack: Weak Side Runner', { notes: 'The stack holds while the lone weak side player runs the baseline behind it for a corner three, then the stack breaks.', tips: ['Runner: wait for the slap. Arrive as the ball arrives.'], sits: ['blob', 'blob_need3', 'blob_zone'], first: 'Stack on the lane line, 2 alone on the weak side wing, 3 inbounds.' }, { O3: 'inbMid', O1: [305, 100], O4: [305, 145], O5: [305, 190], O2: 'lWing' }, [
  cut('O2', 'rCorner', [250, 60], '2 runs the baseline under the stack to the corner.'),
  mv({ O1: ['rLow', 'cut'], O4: ['top', 'cut'], O5: ['lBlock', 'cut'] }, 'Then the stack breaks.'), pass('O3', 'O2'), shot('O2')]);
/* ---- Flat and diamond BLOBs ---- */
bl('Flat: Screen Away', { notes: 'Four across the foul line. The two inside men screen away for the outside men who come to the blocks. The inbounder picks a side.', tips: ['Screen away with your chest to the sideline. The cutter reads over or under.'], sits: ['blob', 'need2', 'blob_vs_man'], first: 'Four across the foul line, 3 inbounds.' }, BF, [
  together(screen('O4', 'O1', [160, 170], 'lBlock', [130, 160], '4 screens for 1. 1 cuts to the left block.'), screen('O5', 'O2', [340, 170], 'rBlock', [370, 160], '5 screens for 2. 2 cuts to the right block.')),
  mv({ O4: ['lWing', 'cut'], O5: ['rWing', 'cut'] }, 'Screeners pop to the wings.'), pass('O3', 'O2'), shot('O2')]);
bl('Flat: Lob Back Screen', { notes: 'Four across. The ball side guard back screens the big next to him, the big dives for the lob, the guard pops out for the safety.', tips: ['Set the back screen one step higher than you think.'], sits: ['blob', 'need2', 'get_big'], first: 'Four across the foul line, 3 inbounds.' }, BF, [
  back('O2', 'O5', [310, 190], 'rim', [320, 150], '2 back screens 5. 5 dives.'),
  cut('O2', 'rWing', null, '2 pops.'), pass('O3', 'O5', 'Lob.'), shot('O5')]);
bl('Flat: Corner Three', { notes: 'Four across. The weak side pair double screens for the ball side outside man running along the foul line to the weak side corner.', tips: ['Shooter: run the line, turn the corner tight off the second screen.'], sits: ['blob', 'blob_need3'], first: 'Four across the foul line, 3 inbounds, 2 is the shooter on the ball side.' }, BF, [
  dbl('O4', 'O1', 'O2', [200, 190], [150, 190], 'lCorner', [250, 230], '4 and 1 double. 2 runs over the top to the left corner.'),
  cut('O5', 'rLow', null, '5 steps to the block for the safety.'), pass('O3', 'O2'), shot('O2')]);
bl('Diamond: Point Pop', { notes: 'Diamond under the rim. The point man back screens the wing, the wing cuts to the rim, the point pops to the top.', tips: ['Diamond is for the lob first, the pop second.'], sits: ['blob', 'need2'], first: 'Diamond: 5 under the rim, 1 and 2 on the elbows, 4 at the top, 3 inbounds.' }, BD, [
  back('O4', 'O2', [300, 190], 'rim', [330, 140], '4 back screens 2. 2 cuts to the rim.'),
  cut('O4', 'top', null, '4 pops.'), pass('O3', 'O2', 'Hit 2 at the rim, or 4 for safety.'), shot('O2')]);
bl('Diamond: Big Seal', { notes: 'Diamond under the rim. The three outside men clear and the big under the rim seals for the quick pass.', tips: ['Big: seal as the others clear. Target hand up.'], sits: ['blob', 'need2', 'blob_short'], first: 'Diamond, 3 inbounds, 5 under the rim.' }, BD, [
  mv({ O1: ['lWing', 'cut'], O2: ['rWing', 'cut'], O4: ['top', 'cut'] }, 'Three clear out.'), seal('O5', 'rLow'), pass('O3', 'O5'), shot('O5')]);
bl('Diamond: Shooter Off Two', { notes: 'The elbows pinch and screen for the big under the rim, who comes off both to the ball side corner. For a big who can shoot, or swap in your shooter.', tips: ['Elbow screens are set shoulder to shoulder, facing the baseline.'], sits: ['blob', 'blob_need3'], first: 'Diamond, 3 inbounds.' }, BD, [
  dbl('O1', 'O2', 'O5', [290, 130], [330, 110], 'rCorner', [300, 70], '1 and 2 screen for 5. 5 comes off both to the corner.'),
  cut('O4', 'top', null, '4 stays as safety.'), pass('O3', 'O5'), shot('O5')]);
bl('Triangle: Screen Across', { notes: 'Two on the blocks, one at the foul line. The foul line man screens for the weak side block, who cuts to the ball side. Then the ball side block screens the screener.', tips: ['Foul line man: screen, then pop high. You are the safety.'], sits: ['blob', 'need2'], first: 'Triangle: 4 and 5 on the blocks, 2 at the foul line, 1 at the top, 3 inbounds.' }, BT, [
  screen('O2', 'O4', [215, 110], 'rLow', [250, 70], '2 screens for 4. 4 cuts under to the ball side.'),
  pin('O5', 'O2', [260, 150], 'rWing', [300, 180], '5 screens for 2. 2 pops to the wing.'), pass('O3', 'O4', 'Hit 4 at the rim, 2 on the wing, or 1.'), shot('O4')]);
bl('Under 3 Seconds: Lob or Nothing', { notes: 'Under three seconds on the baseline. One screen, one lob, everybody else clears. If it is not there, throw it off a defender\'s leg.', tips: ['The lob is thrown on the slap. No reading.'], sits: ['blob_short', 'blob', 'need2'], first: 'Box set, under 3 seconds, 3 inbounds.' }, BB, [
  together(back('O2', 'O5', [320, 120], 'rim', [300, 110], '2 back screens 5. 5 goes.'), mv({ O1: ['lWing', 'cut'], O4: ['lCorner', 'cut'] }, 'Everyone else clears.')),
  pass('O3', 'O5', 'Lob.'), shot('O5')]);
bl('Under 3 Seconds: Corner Flare', { notes: 'Under three seconds, need a three. The shooter flares to the corner off one screen, the other three clear the other way.', tips: ['Shooter: catch and shoot, no dribble. Feet set behind the line.'], sits: ['blob_short', 'blob_need3', 'need3'], first: 'Box set, 3 inbounds, 2 is the shooter at the ball side elbow.' }, BB, [
  together(flare('O5', 'O2', [370, 140], 'rCorner', [380, 190], '5 flares 2 to the corner.'), mv({ O1: ['lWing', 'cut'], O4: ['lCorner', 'cut'] }, 'The rest clear left.')),
  pass('O3', 'O2'), shot('O2')]);
/* ---- SLOBs ---- */
const SB = F.SLOB_BOX, SS = F.SLOB_STACK, SL = F.SLOB_LINE, S14 = F.SLOB_14, SSP = F.SLOB_SPREAD;
const sl = (name, opts, form, acts) => set(name, 'Sideline out', Object.assign({ ball: 'O3' }, opts), form, acts);
sl('Sideline Box: Rip and Pop', { notes: 'Box on the ball side. The low man back screens for the high man who cuts to the rim, then the screener pops to the ball for safety.', tips: ['Inbounder: look rim first, then the pop.'], sits: ['slob', 'need2'], first: 'Sideline box, 3 inbounds from the left.' }, SB, [
  back('O2', 'O4', [200, 200], 'rim', [160, 160], '2 back screens 4. 4 cuts to the rim.'), cut('O2', 'lWing', null, '2 pops to the ball.'),
  pass('O3', 'O4', 'Hit 4 at the rim, or 2.'), shot('O4')]);
sl('Sideline Box: Stagger Three', { notes: 'The two bigs stagger for the shooter coming from the far block to the top for three.', tips: ['Shooter: come off the second screen with your feet already turned.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline box, 3 inbounds, 2 is the shooter on the far block.' }, { O3: 'sideL', O1: 'lSlot', O2: 'rBlock', O4: 'rElbow', O5: 'rWing' }, [
  stagger('O4', 'O5', 'O2', [330, 180], [320, 260], 'top', [380, 230], '4 and 5 stagger for 2. 2 comes to the top.'),
  cut('O1', 'lCorner', null, '1 drifts to the corner.'), pass('O3', 'O2'), shot('O2')]);
sl('Sideline Box: Hammer', { notes: 'Inbound to the top, drive baseline, and the weak side big hammer screens for the inbounder who has stepped in to the far corner.', tips: ['Inbounder: step in and go to the far corner. The hammer finds you.'], sits: ['slob', 'slob_need3'], first: 'Sideline box, 3 inbounds from the left.' }, SB, [
  pass('O3', 'O1'), cut('O3', 'lCorner', null, '3 steps in to the near corner.'), drib('O1', 'rShort', [420, 250], '1 drives baseline on the right.'),
  flare('O4', 'O3', [120, 100], 'lCorner', [60, 130], '4 hammer screens for 3.'), pass('O1', 'O3', 'Skip to the corner.'), shot('O3')]);
sl('Sideline Stack: Peel', { notes: 'Stack of four facing the inbounder. They peel in order: first to the corner, second to the rim, third to the top, last back to the ball.', tips: ['Peel on the slap, in order, all at once.'], sits: ['slob', 'inb_safe', 'young_lineup'], first: 'Stack of four facing the sideline, 3 inbounds.' }, SS, [
  mv({ O1: ['lCorner', 'cut'], O2: ['rim', 'cut'], O4: ['top', 'cut'], O5: [[120, 250], 'cut'] }, 'Peel: 1 corner, 2 rim, 4 top, 5 to the ball.'),
  pass('O3', 'O2', 'Hit 2 at the rim or whoever is open.'), shot('O2')]);
sl('Sideline Stack: Lob', { notes: 'The stack opens like a door and the big at the back cuts to the rim off a back screen from the front man.', tips: ['Front man screens the big\'s defender, who is usually watching the ball.'], sits: ['slob', 'need2', 'get_big'], first: 'Stack facing the sideline, 3 inbounds, 5 at the back.' }, SS, [
  mv({ O1: ['lCorner', 'cut'], O2: ['top', 'cut'], O4: [[180, 150], 'screen'], O5: ['rim', 'cut', [200, 120]] }, '1 and 2 open the door. 4 back screens for 5. 5 goes to the rim.'),
  pass('O3', 'O5', 'Lob.'), shot('O5')]);
sl('Sideline Stack: Shooter Last', { notes: 'The first three peel away and the shooter at the back comes off all three to the ball side wing for a catch and shoot.', tips: ['Shooter: the three peels are your screens. Trail them.'], sits: ['slob', 'slob_need3'], first: 'Stack facing the sideline, 3 inbounds, 2 is the shooter at the back.' }, { O3: 'sideL', O1: [150, 250], O4: [150, 205], O5: [150, 160], O2: [150, 115] }, [
  mv({ O1: ['lCorner', 'cut'], O4: ['top', 'cut'], O5: ['rBlock', 'cut'] }, '1, 4 and 5 peel.'),
  cut('O2', 'lWingHigh', [120, 200], '2 comes up the line to the wing.'), pass('O3', 'O2'), shot('O2')]);
sl('Sideline Line: Flare', { notes: 'Four in a line across the foul line extended. The far man flares off the next man to the far wing for the long inbound pass.', tips: ['A long pass, so the inbounder fakes short first.'], sits: ['slob', 'slob_need3'], first: 'Four in a line across the foul line, 3 inbounds from the left.' }, SL, [
  together(flare('O2', 'O1', [340, 280], 'rWing', [400, 320], '2 flares 1 to the far wing.'), mv({ O5: ['lWing', 'cut'], O4: ['lBlock', 'cut'] }, '5 and 4 come to the ball.')),
  pass('O3', 'O1', 'Fake short, throw it to 1.'), shot('O1')]);
sl('Sideline Line: Curl', { notes: 'The near man in the line curls to the rim off the next man while the far two come to the ball. Layup or safety.', tips: ['Curl tight. The defender is between you and the ball, not between you and the rim.'], sits: ['slob', 'need2'], first: 'Four in a line, 3 inbounds.' }, SL, [
  together(screen('O4', 'O5', [190, 280], 'rim', [170, 220], '5 curls off 4 to the rim.'), mv({ O2: ['lWingHigh', 'cut'], O1: ['top', 'cut'] }, '2 and 1 come to the ball.')),
  pass('O3', 'O5', 'Hit 5 at the rim, or 2.'), shot('O5')]);
sl('Sideline 1-4: Elbow Entry', { notes: 'Four across the lane. The near elbow pops to the ball, catches, and the near block back screens the far elbow for a cut to the rim.', tips: ['The elbow catch is the trigger. Everything moves on the catch.'], sits: ['slob', 'need2', 'ato'], first: 'Sideline 1-4: 1 and 5 at the elbows, 2 and 4 on the blocks, 3 inbounds from the left.' }, S14, [
  cut('O1', 'lWing', null, '1 pops to the ball.'), pass('O3', 'O1'),
  back('O2', 'O5', [280, 180], 'rim', [320, 150], '2 back screens for 5. 5 cuts to the rim.'), pass('O1', 'O5'), shot('O5')]);
sl('Sideline 1-4: Double Pop', { notes: 'Both blocks screen up for both elbows, who pop to the wings. Two targets, both open for a second.', tips: ['Elbows: sell going to the rim first, then pop.'], sits: ['slob', 'inb_safe', 'vs_pressure'], first: 'Sideline 1-4, 3 inbounds.' }, S14, [
  together(pin('O2', 'O1', [190, 150], 'lWing', [150, 120], '2 screens for 1. 1 pops to the near wing.'), pin('O4', 'O5', [310, 150], 'rWing', [350, 120], '4 screens for 5. 5 pops to the far wing.')),
  pass('O3', 'O1'), shot('O1', 'Run offense from here.')]);
sl('Sideline 1-4: Flare Three', { notes: 'Entry to the top, then the near block comes up and flares the near elbow man back to the wing for three. Two passes, one shot.', tips: ['Entry first, flare second. Two passes, one shot.'], sits: ['slob', 'slob_need3'], first: 'Sideline 1-4, 3 inbounds.' }, S14, [
  cut('O5', 'top', null, '5 pops to the top.'), pass('O3', 'O5'), cut('O3', 'lCorner', null, '3 steps in to the corner.'),
  flare('O2', 'O1', [160, 250], 'lWing', [200, 290], '2 flares 1 to the wing.'), pass('O5', 'O1'), shot('O1')]);
sl('Sideline Spread: Pick and Roll', { notes: 'Inbound to the point, then the near big ball screens him going away from the inbound side. Straight into a spread pick and roll.', tips: ['Get it in, then play. No standing around after the catch.'], sits: ['slob', 'need2', 'quick'], first: 'Sideline spread, 3 inbounds from the left.' }, SSP, [
  pass('O3', 'O1'), cut('O3', 'lCorner', null, '3 steps in to the corner.'), pnr('O5', 'O1', [290, 320], [340, 290], 'rim'), shot('O1')]);
sl('Sideline Spread: Back Door', { notes: 'When they deny the sideline inbound, the top man fakes to the ball and goes back door, and the big flashes to the elbow as the safety.', tips: ['Two steps to the ball, plant, go. The big is the outlet if it is not there.'], sits: ['slob_vs_denial', 'vs_deny', 'slob'], first: 'Sideline spread, 3 inbounds, 1 is denied.' }, SSP, [
  together(cut('O1', 'rim', [170, 290], '1 fakes to the ball and goes back door.'), cut('O4', 'lElbow', null, '4 flashes to the elbow.')),
  pass('O3', 'O1', 'Bounce pass to 1, or 4 at the elbow.'), shot('O1')]);
sl('Sideline Spread: Screen the Inbounder', { notes: 'Get it in to the top, then the near big screens for the inbounder stepping in. The inbounder curls to the rim or pops to the corner.', tips: ['Inbounder is the hardest man to guard. Use him.'], sits: ['slob', 'need2', 'slob_need3'], first: 'Sideline spread, 3 inbounds.' }, SSP, [
  pass('O3', 'O1'), screen('O4', 'O3', [120, 200], 'rim', [110, 160], '4 screens for 3 stepping in. 3 curls to the rim.'),
  pass('O1', 'O3', 'Hit the curl.'), shot('O3')]);
sl('Sideline Zone: Overload', { notes: 'Sideline inbound against a zone: overload the ball side with three, short corner and corner, and skip to the lone weak side man if they shift.', tips: ['Against a zone, the inbounder steps in to the open spot. He is the fourth man on the overload.'], sits: ['slob_zone', 'vs_zone', 'slob'], d: Z23, first: 'Sideline against a 2-3, 3 inbounds from the left.' }, { O3: 'sideL', O1: 'lSlot', O2: 'lCorner', O4: 'lShort', O5: 'lElbow' }, [
  pass('O3', 'O1'), cut('O3', 'lWing', null, '3 steps in to the wing.'), pass('O1', 'O3'),
  pass('O3', 'O4', 'Feed the short corner, or 2 in the corner.'), shot('O4')]);
sl('Sideline Under 3: Flare', { notes: 'Sideline out, under three seconds, need a three. One flare screen for the shooter to the near wing, everyone else clears.', tips: ['Catch and shoot. If it is covered, hit the safety and foul.'], sits: ['slob_short', 'slob_need3', 'need3'], first: 'Sideline, under 3 seconds, 2 is the shooter at the near elbow.' }, { O3: 'sideL', O2: 'lElbow', O5: 'lBlock', O1: 'top', O4: 'rBlock' }, [
  together(flare('O5', 'O2', [120, 210], 'lWingHigh', [140, 260], '5 flares 2 to the wing.'), mv({ O1: ['rSlot', 'cut'], O4: ['rCorner', 'cut'] }, 'The rest clear right.')),
  pass('O3', 'O2'), shot('O2')]);
sl('Sideline Under 3: Lob', { notes: 'Sideline out, under three seconds, need a two. Back screen for the big, lob at the rim.', tips: ['Throw it to the square. He goes and gets it.'], sits: ['slob_short', 'slob_need2', 'need2'], first: 'Sideline, under 3 seconds, 3 inbounds.' }, SB, [
  together(back('O2', 'O5', [280, 140], 'rim', [300, 120], '2 back screens 5. 5 goes.'), mv({ O1: ['lCorner', 'cut'], O4: ['rWing', 'cut'] }, 'The rest clear.')),
  pass('O3', 'O5', 'Lob.'), shot('O5')]);
/* ---- Zone sets ---- */
const ZO = F.ZONE_121, ZL = F.ZONE_OVERLOAD, Z2 = F.ZONE_2GUARD, Z13 = F.ZONE_13_1;
const zn = (name, opts, form, acts) => set(name, 'Offense', Object.assign({ d: Z23 }, opts), form, acts);
zn('Zone: 1-2-2 Gap Attack', { notes: 'Against an even front zone, put the point guard in the gap between the top two and the wings in the gaps below. Every pass makes two defenders move.', tips: ['Catch in the gap, not in front of a defender.'], sits: ['vs_zone', 'vs_23'], first: '1-2-2 against a 2-3: 1 in the top gap, wings in the gaps, bigs in the short corners.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lShort', O5: 'rShort' }, [
  pass('O1', 'O2'), cut('O5', 'rLane', null, '5 steps in behind the zone.'), pass('O2', 'O5', 'Feed 5 inside.'), shot('O5')]);
zn('Zone: Overload Baseline Runner', { notes: 'Overload the right side and run one player along the baseline corner to corner. Every pass, he runs.', tips: ['Runner: arrive as the ball arrives.'], sits: ['vs_zone', 'vs_23'], first: 'Overload right: 1 slot, 2 wing, 3 corner, 4 short corner, 5 elbow.' }, ZL, [
  pass('O1', 'O2'), pass('O2', 'O3'), cut('O5', 'rLane', null, '5 drops to the block as 3 catches.'),
  pass('O3', 'O1', '3 swings it back out.'), cut('O3', 'lCorner', [250, 45], '3 runs the baseline to the other corner.'), pass('O1', 'O3', 'Skip to 3.'), shot('O3')]);
zn('Zone: High Post Flash', { notes: 'Against a 2-3 the high post is the hole. Flash a big to the foul line on every wing catch and play high low.', tips: ['Flash to the ball side elbow, catch and look low first.'], sits: ['vs_zone', 'vs_23', 'get_big'], first: '1 at the top, wings, 4 and 5 on the blocks.' }, F.LOW, [
  pass('O1', 'O2'), cut('O4', 'rElbow', null, '4 flashes to the elbow.'), pass('O2', 'O4'),
  seal('O5', 'rLow', '5 seals the bottom man.'), pass('O4', 'O5', 'High low.'), shot('O5')]);
zn('Zone: Skip and Short Corner', { notes: 'Swing it side to side, and when the skip comes the ball side big steps to the short corner behind the zone.', tips: ['The short corner man steps in as the ball is in the air.'], sits: ['vs_zone', 'vs_23'], first: '1 at the top, wings, 4 and 5 on the blocks.' }, F.LOW, [
  pass('O1', 'O2'), pass('O2', 'O1'), pass('O1', 'O3', 'Skip to 3.'), cut('O4', 'lShort', null, '4 steps to the short corner.'), pass('O3', 'O4'), shot('O4', 'Short corner jumper, or 5 ducks in.')]);
zn('Zone: Screen the Bottom', { notes: 'Screen the zone: the ball side big screens the bottom defender so the corner shooter is open on the swing.', tips: ['Screen the man who would close out, not the man guarding the ball.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: '1 at the top, 2 on the right wing, 5 at the right block, 3 in the left corner.' }, { O1: 'top', O2: 'rWing', O5: 'rBlock', O3: 'lCorner', O4: 'lElbow' }, [
  pass('O1', 'O2'), mv({ O5: [[400, 110], 'screen'], O4: ['rCorner', 'cut', [330, 90]] }, '5 screens the bottom man. 4 runs to the corner behind it.'),
  pass('O2', 'O4'), shot('O4')]);
zn('Zone: Dribble Push and Fill', { notes: 'Dribble at the top guard to drag him, the wing he leaves slides to the corner, the weak side fills behind. A simple way to make the zone move.', tips: ['Dribble at a defender, never between two.'], sits: ['vs_zone', 'vs_23'], mirror: true, first: '1 at the top, wings, 5 at the foul line, 4 in the short corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O5: 'ft', O4: 'rShort' }, [
  mv({ O1: ['rSlot', 'dribble'], O2: ['rCorner', 'cut'], O3: ['top', 'cut'] }, '1 dribbles right. 2 slides to the corner, 3 fills the top.'),
  pass('O1', 'O2'), shot('O2', 'Corner three, or feed 4 behind.')]);
zn('Zone: 2 Guard Front Reverse', { notes: 'Two guards on top against a 2-3, bigs at the elbow and block. Reverse it twice fast and the second side wing is open.', tips: ['Two reversals in four seconds. The zone cannot keep up with a quick ball.'], sits: ['vs_zone', 'vs_23', 'vs_matchup'], first: '2 guard front: 1 and 2 in the slots, 3 and 4 on the wings, 5 at the foul line.' }, Z2, [
  pass('O1', 'O2'), pass('O2', 'O3'), pass('O3', 'O2', 'Back out.'), pass('O2', 'O1'), pass('O1', 'O4', 'Second side.'), shot('O4')]);
zn('Zone: Corner Trap Escape', { notes: 'When the zone traps the corner, the short corner man flashes to the elbow and the opposite wing lifts. Pass out of the trap over the top, never along the sideline.', tips: ['Pass fake baseline, throw to the elbow.'], sits: ['vs_zone', 'vs_hc_zone_trap', 'vs_trap'], mirror: true, first: '2 has it in the right corner and the zone traps.' }, { O2: 'rCorner', O1: 'rSlot', O3: 'lWing', O4: 'rShort', O5: 'lBlock' }, [
  mv({ X4: [[440, 75], 'cut'], X2: [[420, 110], 'cut'], O4: ['rElbow', 'cut'], O3: ['top', 'cut'] }, 'Trap comes. 4 flashes to the elbow, 3 lifts.'),
  pass('O2', 'O4', 'Over the top to 4.'), pass('O4', 'O5', '4 finds 5 behind the zone.'), shot('O5')]);
zn('Zone: Lob Over the Back', { notes: 'Against a zone that fronts the post, reverse the ball and throw the lob over the back of the bottom defender.', tips: ['The lob comes from the top, not the wing. It is a two handed pass over the defender.'], sits: ['vs_zone', 'cov_front_post', 'get_big'], mirror: true, first: '1 at the top, 2 on the right wing, 5 on the right block being fronted.' }, { O1: 'top', O2: 'rWing', O5: 'rBlock', O3: 'lWing', O4: 'lElbow' }, [
  pass('O1', 'O2'), pass('O2', 'O1', 'Back to the top.'), seal('O5', 'rLane', '5 seals the fronting man.'), pass('O1', 'O5', 'Lob over the back.'), shot('O5')]);
zn('Zone: Four Across Flash', { notes: 'Four across the foul line extended against a 2-3, the lone big under the rim. The middle two flash in turn to the high post.', tips: ['Flash one at a time. If the first is covered the second goes.'], sits: ['vs_zone', 'vs_23'], first: 'Four across, 5 under the rim.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lWing', O4: 'rWing', O5: [250, 85] }, [
  cut('O2', 'ft', null, '2 flashes to the foul line.'), pass('O1', 'O2'), seal('O5', 'rLow'), pass('O2', 'O5'), shot('O5')]);
set('Zone: 1-3-1 Wings and Corners', 'Offense', { notes: 'Against a 1-3-1, play with two guards and both corners filled. The wings of the zone cannot cover the corner and the wing at once.', tips: ['Corners stay deep. The 1-3-1 hates the corners.'], sits: ['vs_zone', 'vs_131'], d: Z131, first: 'Two guards, two corners, 5 at the high post.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lCorner', O4: 'rCorner', O5: 'ft' }, [
  pass('O1', 'O2'), pass('O2', 'O4', 'To the corner.'), cut('O5', 'rLow', null, '5 drops to the block.'), pass('O4', 'O5', 'Feed 5 inside.'), shot('O5')]);
set('Zone: 1-3-1 Short Corner Flash', 'Offense', { notes: 'Against a 1-3-1 the short corners are open. Put a big there, swing it, and feed him when the baseline runner leaves.', tips: ['Short corner man: stay behind the baseline runner, step to the ball late.'], sits: ['vs_zone', 'vs_131'], d: Z131, mirror: true, first: 'Two guards, 5 in the right short corner.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lWing', O4: 'rWing', O5: 'rShort' }, [
  pass('O1', 'O2'), pass('O2', 'O4'), pass('O4', 'O5', 'Feed the short corner.'), cut('O3', 'lBlock', null, '3 dives to the weak side block.'), shot('O5', 'Shoot, or find 3 on the dive.')]);
set('Zone: 3-2 High Post Entry', 'Offense', { notes: 'Against a 3-2, the high post is open. Enter it, and the two low men flash to the blocks for the high low.', tips: ['High post catches facing the rim. Low men move as the ball arrives.'], sits: ['vs_zone', 'vs_32'], d: Z32, first: '1 at the top, wings, 5 at the foul line, 4 on the weak side block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O5: 'ft', O4: 'lBlock' }, [
  pass('O1', 'O5', 'Into the high post.'), together(seal('O4', 'lLow'), cut('O2', 'rCorner', null, '2 drifts to the corner.')), pass('O5', 'O4', 'High low.'), shot('O4')]);
set('Zone: 3-2 Corner Skip', 'Offense', { notes: 'Against a 3-2, fill both corners and skip corner to corner. The bottom two cannot cover both.', tips: ['Skip over the top with two hands, chest high.'], sits: ['vs_zone', 'vs_32', 'need3'], d: Z32, first: 'Point, two wings deep in the corners, two bigs on the blocks.' }, { O1: 'top', O2: 'rCorner', O3: 'lCorner', O4: 'lBlock', O5: 'rBlock' }, [
  pass('O1', 'O2'), cut('O5', 'rShort', null, '5 steps to the short corner.'), pass('O2', 'O1', 'Back out.'), pass('O1', 'O3', 'Skip to the other corner.'), shot('O3')]);
set('Zone: Matchup Cut Through', 'Offense', { notes: 'Against a matchup zone, cut through on every pass like it is man. Matchup zones hate cutters.', tips: ['Pass, cut to the rim, fill the open spot. Keep the floor moving.'], sits: ['vs_zone', 'vs_matchup'], d: Z23, first: 'Five out against a matchup zone.' }, FIVE_OUT, [
  pass('O1', 'O2'), cut('O1', 'rim', [290, 230], '1 cuts through.'), cut('O1', 'lCorner', null, '1 fills the far corner, 3 and 5 slide up.'),
  mv({ O3: ['top', 'cut'], O5: ['lWing', 'cut'] }, 'Fill the spots.'), pass('O2', 'O3'), cut('O2', 'rim', [330, 240], '2 cuts through.'), pass('O3', 'O2', 'Hit the cutter.'), shot('O2')]);
set('Zone: Box and One Screen the Chaser', 'Offense', { notes: 'Against a box and one, the four zone defenders stay home, so screen the chaser over and over and let the other four play.', tips: ['Chased player: run your man through three screens, then you are open or someone else is.'], sits: ['vs_box1', 'vs_faceguard'], d: { X2: [440, 230], X1: [250, 290], X3: [190, 210], X4: [180, 95], X5: [320, 95] }, mirror: true, first: 'Their X2 chases our 2 on the right wing.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  back('O5', 'O2', [420, 200], 'rim', [400, 130], '5 back screens the chaser. 2 cuts to the rim.'),
  pin('O4', 'O2', [160, 120], 'lCorner', [200, 90], '4 screens him again as 2 runs out to the left corner.'), pass('O1', 'O3'), pass('O3', 'O2'), shot('O2')]);
set('Zone: Triangle and Two Post Up', 'Offense', { notes: 'Against a triangle and two, the two chased players clear and the other three play three on three against a triangle. Post the triangle.', tips: ['Chased players: go stand in the corners and take your man with you.'], sits: ['vs_tri2'], d: { X1: [250, 250], X4: [180, 100], X5: [320, 100], X2: [440, 230], X3: [70, 230] }, first: 'Their X2 and X3 chase our 2 and 3.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lElbow', O5: 'rBlock' }, [
  mv({ O2: ['rCorner', 'cut'], O3: ['lCorner', 'cut'] }, '2 and 3 clear to the corners with their men.'),
  pass('O1', 'O4', '1 hits 4 at the elbow.'), seal('O5', 'rLow'), pass('O4', 'O5', 'High low.'), shot('O5')]);
set('Zone: Diamond and One Flash', 'Offense', { notes: 'Against a diamond and one, the middle of the diamond is open on the flash. Flash the big every time the ball goes to the wing.', tips: ['Flash to the elbow with hands up. Catch and face.'], sits: ['vs_diamond1', 'vs_zone'], d: { X1: [250, 300], X2: [120, 180], X3: [380, 180], X4: [250, 80], X5: [440, 230] }, first: 'Diamond and one on our 2.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  pass('O1', 'O3'), cut('O5', 'lElbow', [300, 170], '5 flashes to the ball side elbow.'), pass('O3', 'O5'), seal('O4', 'lLow'), pass('O5', 'O4'), shot('O4')]);
/* ---- Press breaks ---- */
const pb = (name, opts, form, acts) => set(name, 'Press break', Object.assign({ court: 'full', ball: 'O4' }, opts), form, acts);
pb('Press Break: 2-1-2', { notes: 'Two guards on the blocks, one in the middle, two deep. The guards screen for each other, the middle flashes, the deep men stretch the press.', tips: ['Inbounder: the middle flash is your bail out. Look there second, not last.'], sits: ['press_break', 'vs_press', 'vs_zone_press'], first: '4 inbounds. 1 and 2 on the blocks, 5 at the foul line, 3 deep at half court.' }, { O4: 'inb', O1: 'lowBlockL', O2: 'lowBlockR', O5: 'ftLow', O3: 'half' }, [
  screen('O2', 'O1', [260, 730], [380, 700], [230, 760], '2 screens for 1. 1 comes to the right side.'), cut('O2', [120, 700], null, '2 pops to the left.'),
  pass('O4', 'O1'), cut('O4', [250, 760], null, '4 steps in behind the ball.'), cut('O5', 'centerLow', null, '5 flashes to the middle.'), pass('O1', 'O5', 'Middle.'), drib('O5', 'half', null, '5 pushes it up the floor.')]);
pb('Press Break: Line', { notes: 'Four in a line up the middle of the floor. They break in order: short, middle, long, longest. The inbounder has a target every ten feet.', tips: ['Break in order, each one two steps after the last.'], sits: ['press_break', 'vs_man_press', 'vs_press'], first: '4 inbounds, the other four in a line up the middle.' }, { O4: 'inb', O1: [250, 740], O2: [250, 660], O5: [250, 580], O3: [250, 480] }, [
  mv({ O1: [[380, 720], 'cut'], O2: [[120, 660], 'cut'], O5: [[380, 540], 'cut'], O3: [[120, 420], 'cut'] }, 'Break: 1 right short, 2 left, 5 right long, 3 left longest.'),
  pass('O4', 'O1'), cut('O4', [200, 740], null, '4 steps in.'), pass('O1', 'O4', 'Back to 4 in the middle.'), drib('O4', 'centerLow', null, '4 attacks the middle.')]);
pb('Press Break: Screen the Inbounder', { notes: 'Get it in, then screen for the inbounder stepping in. He is the one man they are not guarding, and he gets the ball back in the middle.', tips: ['The return pass to the inbounder beats every press ever invented.'], sits: ['press_break', 'vs_press'], first: '4 inbounds. 1 and 2 at the elbows, 5 at half, 3 deep.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: 'half', O3: 'highL' }, [
  cut('O1', [130, 740], null, '1 comes to the ball on the left.'), pass('O4', 'O1'),
  screen('O2', 'O4', [260, 760], [320, 700], [250, 800], '2 screens for 4 stepping in. 4 comes to the middle right.'),
  pass('O1', 'O4', 'Back to the inbounder.'), drib('O4', 'centerLow', null, '4 pushes it.')]);
pb('Press Break: Long Pass Over the Top', { notes: 'When they put two on the ball and deny everything short, the deep man sprints to the far foul line and the inbounder throws it long.', tips: ['Fake short, throw long. The deep man runs on the fake.'], sits: ['press_break', 'vs_man_press', 'down_big'], first: '4 inbounds, 3 at half court, the others short.' }, { O4: 'inb', O1: [330, 700], O2: [170, 700], O5: [250, 600], O3: 'half' }, [
  mv({ O1: [[400, 680], 'cut'], O2: [[100, 680], 'cut'], O3: ['upFt', 'cut'] }, '1 and 2 pull their men wide. 3 sprints to the far foul line.'),
  pass('O4', 'O3', 'Over the top.'), shot('O3', 'Layup or two on one.')]);
pb('Press Break: Diamond Middle', { notes: 'A diamond press break: one short, two on the sides, one deep. The short man gets it, the middle man flashes behind the first line.', tips: ['Middle flash comes as the first pass is caught, not before.'], sits: ['press_break', 'vs_zone_press', 'vs_press'], first: '4 inbounds. 1 short at the foul line, 2 and 5 wide, 3 deep.' }, { O4: 'inb', O1: 'ftLow', O2: [110, 620], O5: [390, 620], O3: 'half' }, [
  cut('O1', [320, 740], null, '1 comes to the ball.'), pass('O4', 'O1'),
  cut('O5', [250, 600], null, '5 flashes to the middle behind the first line.'), pass('O1', 'O5'), drib('O5', 'centerLow', null, '5 looks up and attacks.')]);
pb('Press Break: Sideline Reverse', { notes: 'Inbound to the sideline, and when the trap comes reverse it through the inbounder to the other sideline. The press shifts and the middle opens.', tips: ['Never dribble into the trap. Reverse it before it gets there.'], sits: ['press_break', 'vs_trap', 'vs_zone_press'], first: '4 inbounds, 1 and 2 wide, 5 in the middle, 3 deep.' }, { O4: 'inb', O1: [400, 720], O2: [100, 720], O5: 'ftLow', O3: 'half' }, [
  pass('O4', 'O1'), cut('O4', [250, 790], null, '4 steps in.'), pass('O1', 'O4', 'Trap comes, back to 4.'), pass('O4', 'O2', 'Reverse to 2.'),
  cut('O5', [220, 580], null, '5 flashes to the middle.'), pass('O2', 'O5'), drib('O5', 'half', null, '5 pushes.')]);
pb('Press Break: Guard Stack', { notes: 'The two guards stack at the foul line. One pops short, the other goes long off his back. Simple read for the inbounder.', tips: ['Stack is tight. The first one out takes the defender with him.'], sits: ['press_break', 'vs_man_press'], first: '4 inbounds, 1 and 2 stacked at the foul line, bigs deep.' }, { O4: 'inb', O1: [250, 650], O2: [250, 620], O5: 'hashL', O3: 'hashR' }, [
  mv({ O1: [[360, 740], 'cut'], O2: [[150, 560], 'cut'] }, '1 pops short to the right, 2 goes long off his back to the left.'),
  pass('O4', 'O1', 'Short, or long to 2.'), cut('O4', [250, 760], null, '4 steps in.'), pass('O1', 'O4'), drib('O4', 'centerLow', null, 'Attack the middle.')]);
pb('Press Break: Big Back', { notes: 'Against a press that traps the first dribble, the big comes back to the ball as the outlet behind the play.', tips: ['Big: you are the safety valve behind the ball. Catch it and look up the floor.'], sits: ['press_break', 'vs_trap', 'vs_press'], first: '1 has it on the right side after the inbound, trap coming.' }, { O1: [380, 640], O4: 'inb', O5: [250, 560], O2: [110, 600], O3: 'half', X1: [350, 620], X2: [400, 600] }, [
  mv({ O5: [[300, 700], 'cut'], X1: [[360, 640], 'cut'] }, 'Trap comes. 5 comes back behind the ball.'),
  pass('O1', 'O5', 'Back to 5.'), pass('O5', 'O2', '5 swings it to 2 on the far side.'), drib('O2', 'halfL', null, '2 pushes up the open side.')]);

/* ================================================================
   NAMED SETS, batch three A: more Horns from the pro catalog, Stack,
   Diamond, 1-4 High, Box, Princeton, Triangle, continuity offenses,
   transition and late game specials.
================================================================ */
set('Horns: Circle', 'Offense', { notes: 'Horns entry to the elbow, the passer circles around the other big to the weak corner, the corner lifts, the ball reverses and the big ball screens going middle.', tips: ['The circle cut empties the ball side. Everything after it is downhill.'], sits: ['quick', 'cov_switch', 'ato'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), cut('O1', 'lCorner', [160, 260], '1 circles around 5 to the left corner.'), cut('O2', 'rWing', null, '2 lifts from the corner.'),
  pass('O4', 'O2'), pnr('O5', 'O2', [420, 270], 'nail', 'rim'), shot('O2')]);
set('Horns: Duck In', 'Offense', { notes: 'The guard dribbles to a wing, the ball side big rolls to the block, the other pops to the top. On the reversal the block man ducks in across the lane.', tips: ['Duck in as the pass is in the air, not after the catch.'], sits: ['post_entry', 'get_big', 'cov_front_post'], reads: [{ when: 'they front the duck in', then: '4 throws the lob over the top from the top of the key', frame: 3 }], mirror: true, first: 'Horns set.' }, H, [
  together(drib('O1', 'rWing', null, '1 dribbles to the right wing.'), cut('O5', 'rBlock', null, '5 dives to the block.'), cut('O4', 'top', null, '4 pops to the top.')),
  pass('O1', 'O4', 'Reverse to 4.'), seal('O5', 'lLow', '5 ducks in across the lane.'), pass('O4', 'O5'), shot('O5')]);
set('Horns: Fire', 'Offense', { notes: 'Real Madrid\'s Horns Fire: entry to the elbow, the corner shooter comes off the other big\'s baseline screen to the wing, the elbow big hands it off and the screener posts the mismatch.', tips: ['Screener: the moment they switch, you have a guard on your back. Seal him.'], sits: ['quick', 'post_entry', 'cov_switch'], mirror: true, first: 'Horns set, 2 is the shooter in the right corner.' }, H, [
  pass('O1', 'O4'), screen('O5', 'O2', [430, 110], 'rWing', [470, 130], '5 drops and screens for 2 on the baseline. 2 comes up to the wing.'),
  pass('O4', 'O2'), seal('O5', 'rLow', '5 posts the switch.'), pass('O2', 'O5', 'Feed the post, or shoot it.'), shot('O5')]);
set('Horns: Euro Chicago Stagger', 'Offense', { notes: 'Horns ball screen, the other big flashes to the elbow for the pitch, then the weak corner runs a pin down into a handoff with him while the first big and guard stagger for the other shooter.', tips: ['Three actions in a row. Nobody stands.'], sits: ['ato', 'get_shooter', 'vs_set_defense'], mirror: true, first: 'Horns set.' }, H, [
  pnr('O5', 'O1', [295, 318], [350, 290], 'rBlock')[0], cut('O4', 'lElbow', null, '4 flashes to the left elbow.'), pass('O1', 'O4'),
  pin('O5', 'O3', [100, 150], [150, 230], [60, 130], '5 sprints over and pins for 3. 3 comes up to 4.'),
  dho('O4', 'O3', [170, 230], 'rLane', [120, 260]), shot('O3', 'Attack, or 4 rolls.')]);
set('Horns: Zoom Pin', 'Offense', { notes: 'The Lakers\' Horns Zoom Pin: entry to the elbow, the passer cuts to the weak corner, the other big pins for the strong corner who comes into a handoff with the elbow big, then the first big pins for the weak corner.', tips: ['Two pin downs, one handoff. The second pin is the kick out.'], sits: ['ato', 'get_shooter', 'quick'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), cut('O1', 'lCorner', [200, 300], '1 cuts to the weak corner.'),
  pin('O5', 'O2', [430, 150], [360, 230], [470, 140], '5 pins down for 2. 2 comes up to 4.'),
  dho('O4', 'O2', [330, 220], 'lLane', [360, 250]), pin('O5', 'O1', [110, 150], 'lWing', [60, 140], '5 runs to pin for 1 on the other side.'), pass('O2', 'O1', 'Kick to 1.'), shot('O1')]);
set('Horns: Stagger Split', 'Offense', { notes: 'Entry to the elbow and the guard and other big split off each other in front of the ball. The post hands it to whoever comes open.', tips: ['Split with purpose: one screens, one cuts, the screener slips if they switch.'], sits: ['post_entry', 'cov_switch_offball'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O5'), screen('O1', 'O4', [230, 270], [300, 290], [180, 300], '1 screens for 4. 4 comes to the ball.'), cut('O1', 'lWing', null, '1 pops to the wing.'),
  dho('O5', 'O4', [320, 250], 'lLane', [340, 280]), shot('O4')]);
set('Horns: Push Gate', 'Offense', { notes: 'The point guard dribbles at the wing, who cuts through. Both bigs then close a gate screen for him coming back to the top.', tips: ['Gate screens are side by side, not staggered. Close it the moment he is through.'], sits: ['need3', 'ato', 'get_shooter'], mirror: true, first: 'Horns set, 2 lifted to the right wing.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'rWing', O3: 'lCorner' }, [
  mv({ O1: ['rSlot', 'dribble'], O2: ['rBlock', 'cut', [430, 150]] }, '1 dribbles at 2. 2 cuts through to the block.'),
  mv({ O2: ['top', 'cut', [250, 160]], O4: [[225, 230], 'screen'], O5: [[275, 230], 'screen'] }, '2 comes back up through the gate. 4 and 5 close it.'),
  pass('O1', 'O2'), shot('O2')]);
set('Horns: Rub Lob', 'Offense', { notes: 'Entry to the elbow, the passer rubs off the other big to the weak corner, and that big turns and back screens for the strong corner coming up for the lob.', tips: ['The rub cut sells it. The back screen is the play.'], sits: ['need2', 'ato', 'get_big'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), cut('O1', 'lCorner', [290, 290], '1 rubs off 5 and clears to the weak corner.'),
  back('O5', 'O2', [380, 170], 'rim', [420, 140], '5 back screens 2 coming out of the corner. 2 cuts to the rim.'), pass('O4', 'O2', 'Lob.'), shot('O2')]);
set('Horns: Away', 'Offense', { notes: 'Entry to the elbow, the passer screens away for the weak corner, who comes to the top for the reversal and a ball screen from the other big.', tips: ['Screen away, then space. The ball screen is for the new man.'], sits: ['quick', 'cov_hedge'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), pin('O1', 'O3', [120, 190], 'top', [100, 240], '1 screens away for 3. 3 comes to the top.'), cut('O1', 'lCorner', null, '1 fills the corner.'),
  pass('O4', 'O3'), pnr('O5', 'O3', [295, 318], [350, 290], 'rim'), shot('O3')]);
set('Horns: Wall', 'Offense', { notes: 'Both bigs set a wall, a double ball screen side by side at the elbow. The guard turns the corner, one rolls, one pops.', tips: ['The wall is set shoulder to shoulder. No gap to slip through.'], sits: ['need2', 'cov_drop', 'get_pg'], mirror: true, first: 'Horns set.' }, H, [
  mv({ O4: [[270, 300], 'screen'], O5: [[310, 300], 'screen'], O1: [[360, 270], 'dribble'] }, '4 and 5 set the wall. 1 comes off it right.'),
  together(cut('O5', 'rim', [320, 220], '5 rolls.'), cut('O4', 'lWingHigh', null, '4 pops.')), shot('O1', 'Finish, roll, or 4.')]);
set('Horns: Brush', 'Offense', { notes: 'Entry to the elbow, the passer brushes off the other big to the strong corner as the corner man lifts for a handoff. The first big flares the passer after.', tips: ['Brush, handoff, flare. Three looks in four seconds.'], sits: ['quick', 'ato'], mirror: true, first: 'Horns set.' }, H, [
  pass('O1', 'O4'), together(cut('O1', 'lCorner', [200, 290], '1 brushes off 5 to the corner.'), cut('O3', 'lWing', null, '3 lifts.')),
  dho('O4', 'O3', [190, 230], 'rLane', [130, 260]), flare('O5', 'O1', [120, 150], 'lWing', [80, 120], '5 flares 1 up to the wing.'), pass('O3', 'O1', 'Kick to 1.'), shot('O1')]);
set('Horns: Iverson', 'Offense', { notes: 'The wing runs an Iverson cut across both elbow bigs, catches on the other wing, and the near big follows into a ball screen.', tips: ['Rub both shoulders on the cut. Catch on the move.'], sits: ['quick', 'get_shooter'], mirror: true, first: 'Horns set, 2 on the left wing.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'lWing', O3: 'rCorner' }, [
  mv({ O2: ['rWing', 'cut', [250, 215]] }, '2 Iverson cuts across the elbows.'), pass('O1', 'O2'),
  pnr('O5', 'O2', [420, 270], 'nail', 'rim', 'O4', 'lSlot'), shot('O2')]);
set('Horns: Re-screen', 'Offense', { notes: 'Ball screen toward the wing, the guard comes back and the big re-screens the other way. The second screen is the one that works.', tips: ['Come back at the same speed you left.'], sits: ['cov_over', 'cov_hedge'], mirror: true, first: 'Horns set.' }, H, [
  mv({ O5: [[295, 318], 'screen'], O1: [[345, 300], 'dribble'] }, '5 screens. 1 goes right.'),
  mv({ O5: [[230, 315], 'screen'], O1: [[185, 285], 'dribble', [300, 335]] }, '1 comes back. 5 re-screens going left.'),
  cut('O5', 'rim', [260, 220], '5 rolls.'), cut('O4', 'top', null, '4 fills the top.'), shot('O1')]);
/* ---- Stack, Diamond, 1-4 High, Box ---- */
const ST = F.STACK, DM = F.DIAMOND, H14 = F.HIGH14, BX = F.BOX;
set('Stack: Curl and Post', 'Offense', { notes: 'Double stack low. The guard curls over the big\'s screen to the wing, catches, and the big posts right behind the screen while the other big flashes to the elbow.', tips: ['Curl tight. Your man is on your back and the post is already sealed.'], sits: ['post_entry', 'get_big', 'cov_switch'], mirror: true, first: 'Stack: 4 and 5 stacked on the right lane line, 2 in the left corner, 3 on the left wing.' }, ST, [
  screen('O5', 'O2', [320, 150], 'rWing', [250, 80], '2 runs the baseline and curls over 5 to the right wing.'), pass('O1', 'O2'),
  together(seal('O4', 'rLow'), cut('O5', 'rElbow', null, '5 flashes to the elbow.')), pass('O2', 'O4', 'Post feed, or 5 high low.'), shot('O4')]);
set('Stack: Bunch 43', 'Offense', { notes: 'The stack pops to the same side: the big to the elbow, the guard to the corner. Entry to the elbow, the guard cuts off him to the rim.', tips: ['The elbow catch is the trigger. Cut the moment he turns.'], sits: ['quick', 'need2'], mirror: true, first: 'Stack set.' }, ST, [
  together(cut('O4', 'rElbow', null, '4 pops to the elbow.'), cut('O5', 'rCorner', null, '5 clears to the corner.')), pass('O1', 'O4'),
  cut('O1', 'rim', [300, 250], '1 cuts off 4 to the rim.'), pass('O4', 'O1'), shot('O1')]);
set('Stack: Shocker', 'Offense', { notes: 'Wichita State\'s Shocker: the shooter pops off the stack to the wing, the big posts, and the other two stagger for the point guard on the weak side for the swing and shoot.', tips: ['Point guard: pass and go. The stagger is already being set.'], sits: ['need3', 'get_shooter'], mirror: true, first: 'Stack set.' }, ST, [
  screen('O5', 'O3', [320, 150], 'rWing', [300, 100], '3 comes off the stack to the right wing.'), pass('O1', 'O3'),
  stagger('O5', 'O2', 'O1', [220, 200], [150, 230], 'lWing', [230, 300], '5 and 2 stagger for 1 going left.'), pass('O3', 'O1', 'Swing to 1.'), shot('O1')]);
set('Stack: Lob', 'Offense', { notes: 'The guard pops off the stack to the wing, catches, and the top of the stack back screens the big for the lob.', tips: ['Lob is thrown to the rim. The big goes and gets it.'], sits: ['need2', 'get_big'], mirror: true, first: 'Stack set.' }, ST, [
  cut('O2', 'rWing', [330, 100], '2 comes off the stack to the wing.'), pass('O1', 'O2'),
  back('O5', 'O4', [330, 130], 'rim', [350, 100], '5 back screens 4. 4 cuts to the rim.'), pass('O2', 'O4', 'Lob.'), shot('O4')]);
set('Diamond: Pop and Rip', 'Offense', { notes: 'Diamond with the big under the rim. The high post pops to the top for the catch, and a wing rips the big to the rim.', tips: ['Rip screen on the baseline side so the big comes up the middle.'], sits: ['need2', 'ato'], mirror: true, first: 'Diamond: 5 at the foul line, 4 under the rim, wings.' }, DM, [
  cut('O5', 'top', null, '5 pops to the top.'), pass('O1', 'O5'), back('O2', 'O4', [310, 110], 'rim', [330, 90], '2 rips 4 to the rim.'),
  pass('O5', 'O4', 'Lob or bounce pass.'), shot('O4')]);
set('Diamond: High Post Split', 'Offense', { notes: 'Entry to the high post, the two wings split off each other, and the big under the rim seals the help.', tips: ['Split tight. Shoulder to shoulder so the switch is late.'], sits: ['post_entry', 'cov_switch_offball'], first: 'Diamond set.' }, DM, [
  pass('O1', 'O5'), screen('O2', 'O3', [300, 230], 'rWing', [250, 260], '2 screens for 3. 3 comes off to the right wing.'), cut('O2', 'lWing', null, '2 pops the other way.'),
  pass('O5', 'O3'), shot('O3', 'Shot, or feed 4 sealing low.')]);
set('Diamond: Corner Stagger', 'Offense', { notes: 'The big under the rim and the high post stagger along the lane for the weak wing who runs to the strong corner.', tips: ['Shooter: start high, go low, then come off the stagger to the corner.'], sits: ['need3', 'get_shooter'], mirror: true, first: 'Diamond set.' }, DM, [
  stagger('O4', 'O5', 'O3', [330, 110], [370, 150], 'rCorner', [250, 200], '4 and 5 stagger. 3 runs to the right corner.'),
  pass('O1', 'O2'), pass('O2', 'O3'), shot('O3')]);
set('1-4 High: Georgetown', 'Offense', { notes: 'Wing entry, the weak elbow back screens the point guard to the weak block, the strong elbow flashes to the high post, and the wing feeds high low.', tips: ['Back screen the passer every time he passes. Nobody guards the passer.'], sits: ['post_entry', 'vs_set_defense'], mirror: true, first: '1-4 high: bigs at the elbows, wings.' }, H14, [
  pass('O1', 'O2'), back('O4', 'O1', [230, 300], 'lBlock', [220, 230], '4 back screens 1. 1 cuts to the weak block.'),
  cut('O5', 'rHigh', null, '5 flashes to the high post.'), pass('O2', 'O5'), pass('O5', 'O1', 'High low to 1.'), shot('O1')]);
set('1-4 High: Alabama', 'Offense', { notes: 'Wing entry, the point guard cuts through to the weak corner, the strong elbow big ball screens the wing going middle, the weak big pops.', tips: ['Cut through hard. The ball screen comes right behind you.'], sits: ['need2', 'cov_drop'], mirror: true, first: '1-4 high.' }, H14, [
  pass('O1', 'O2'), cut('O1', 'lCorner', [320, 250], '1 cuts through to the far corner.'),
  pnr('O5', 'O2', [420, 270], 'nail', 'rim', 'O4', 'lWingHigh'), shot('O2', 'Finish, roll, or 4 popping.')]);
set('1-4 High: Demon', 'Offense', { notes: 'Wing entry and the weak elbow back screens the weak wing for a lob. The screener pops after.', tips: ['Back screen the wing\'s man on the top side.'], sits: ['need2', 'get_big'], mirror: true, first: '1-4 high.' }, H14, [
  pass('O1', 'O2'), back('O4', 'O3', [110, 230], 'rim', [130, 170], '4 back screens 3. 3 cuts to the rim.'),
  cut('O4', 'lWingHigh', null, '4 pops.'), pass('O2', 'O3', 'Lob.'), shot('O3')]);
set('1-4 High: Blazer', 'Offense', { notes: 'Wing entry, the point guard cuts off the elbow, fakes coming back for the ball, and goes back door off a second screen from the other big.', tips: ['Two steps back toward the ball before the back door.'], sits: ['need2', 'vs_deny'], mirror: true, first: '1-4 high.' }, H14, [
  pass('O1', 'O2'), screen('O5', 'O1', [320, 200], [300, 260], [300, 230], '1 cuts off 5 and comes back toward the ball.'),
  screen('O4', 'O1', [220, 200], 'rim', [230, 240], '4 screens. 1 goes back door off it.'), pass('O2', 'O1'), shot('O1')]);
set('1-4 High: 45 Pick and Roll', 'Offense', { notes: 'Wing entry, the near big steps out to ball screen the wing while the other big drops to the weak block. The wing drives middle.', tips: ['Weak big: drop early so the roller has the lane.'], sits: ['need2', 'get_pg'], mirror: true, first: '1-4 high.' }, H14, [
  pass('O1', 'O2'), cut('O4', 'lBlock', null, '4 drops to the weak block.'), pnr('O5', 'O2', [420, 270], 'nail', 'rim'), shot('O2', 'Finish, roll, or dump to 4.')]);
set('1-4 High: Zip Loop Hammer', 'Offense', { notes: 'A zipper cut up to the top, the point guard loops to the wing, the new ball handler drives baseline and the weak big hammers the corner.', tips: ['Three actions, one shot: the hammer three.'], sits: ['need3', 'ato'], mirror: true, first: '1-4 high, 2 on the right block.' }, { O1: 'top', O4: 'lElbow', O5: 'rElbow', O2: 'rBlock', O3: 'lWing' }, [
  pin('O5', 'O2', [310, 160], 'top', [300, 230], '2 zippers up.'), pass('O1', 'O2'), cut('O1', 'rWing', [330, 290], '1 loops to the right wing.'),
  drib('O2', 'rShort', [460, 150], '2 drives baseline.'), flare('O4', 'O3', [120, 100], 'lCorner', [60, 130], '4 hammers 3 to the corner.'), pass('O2', 'O3', 'Skip.'), shot('O3')]);
set('1-4 High: Out Over Up', 'Offense', { notes: 'Pass out to the wing, cut over the high post, come back up off a down screen for the reversal and the shot.', tips: ['Out, over, up. Three cuts, one three.'], sits: ['need3', 'get_pg'], mirror: true, first: '1-4 high.' }, H14, [
  pass('O1', 'O2'), screen('O5', 'O1', [320, 200], 'lBlock', [300, 230], '1 cuts over 5 to the weak block.'),
  pin('O4', 'O1', [180, 170], 'lWing', [150, 130], '4 screens down. 1 comes up to the wing.'), pass('O2', 'O1', 'Reverse.'), shot('O1')]);
set('Box: Buckeye', 'Offense', { notes: 'Ohio State\'s Buckeye: the guard dribbles to a wing, the near elbow clears to the corner, the bigs cross low and the far elbow pops.', tips: ['Cross screen low with your chest to the ball side.'], sits: ['post_entry', 'need2'], mirror: true, first: 'Box set: elbows and blocks.' }, BX, [
  together(drib('O1', 'rWing', null, '1 dribbles to the right wing.'), cut('O5', 'rCorner', null, '5 clears to the corner.')),
  cross('O3', 'O2', [250, 95], 'rLow', [250, 70], '3 cross screens 2. 2 comes to the ball side block.'), cut('O4', 'top', null, '4 pops.'), pass('O1', 'O2'), shot('O2')]);
set('Box: Celtics Winner', 'Offense', { notes: 'Brad Stevens\' Winner: the elbows back screen and the blocks cross, then the big re-screens for the shooter coming back for three.', tips: ['Second screen is the play. The first is to move the defense.'], sits: ['need3', 'ato', 'down3_last'], mirror: true, first: 'Box set, 2 is the shooter on the right block.' }, BX, [
  together(back('O4', 'O1', [230, 280], 'rim', [250, 230], '4 back screens 1.'), cross('O3', 'O2', [250, 95], 'lLow', [250, 70], '3 cross screens 2.')),
  pass('O1', 'O2', 'Nothing there. 1 pops back out and the ball goes to the top, then 2 comes back.'),
  pin('O3', 'O2', [200, 140], 'lWing', [160, 110], '3 re-screens 2 out to the wing.'), shot('O2')]);
set('Box: Cross Screen Flare', 'Offense', { notes: 'The low men cross, and the elbow flares to the three point line for the skip while the cross cutter posts.', tips: ['Flare and the post happen together. The passer reads the help.'], sits: ['need3', 'post_entry'], mirror: true, first: 'Box set.' }, BX, [
  together(cross('O2', 'O3', [250, 95], 'lLow', [250, 70], '2 cross screens 3.'), flare('O5', 'O4', [230, 230], 'lWing', [200, 260], '5 flares 4 to the wing.')),
  pass('O1', 'O4', 'Skip to 4, or feed 3.'), shot('O4')]);
set('Box: Warrior Split', 'Offense', { notes: 'Feed the big at the elbow and the two guards split: one screens, the other curls to the rim or pops.', tips: ['Screener slips when they switch. Cutter curls when they chase.'], sits: ['post_entry', 'quick'], mirror: true, first: 'Box set.' }, BX, [
  pass('O1', 'O5'), cut('O3', 'rWing', null, '3 lifts to the wing.'), screen('O1', 'O3', [400, 260], 'rim', [430, 220], '1 screens for 3. 3 curls to the rim.'),
  cut('O1', 'rTop', null, '1 pops.'), pass('O5', 'O3', 'Hit the curl, or 1 popping.'), shot('O3')]);
/* ---- Princeton ---- */
const PR_ = { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'rBlock' };
set('Princeton: Point Over', 'Offense', { notes: 'Feed the high post and cut over the ball. Fake a screen for the wing, who back cuts, and pop for the return if the back door is not there.', tips: ['Fake the screen like you mean it. The back cut lives off the fake.'], sits: ['vs_deny', 'vs_pressure', 'young_lineup'], mirror: true, first: 'Princeton: two guards up, 5 at the high post.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'ft' }, [
  pass('O1', 'O5'), cut('O1', [160, 230], [220, 250], '1 cuts over the ball toward 4.'),
  mv({ O1: [[120, 210], 'screen'], O4: ['rim', 'cut', [90, 170]] }, '1 fakes the screen. 4 back cuts.'), pass('O5', 'O4', 'Bounce pass.'), shot('O4')]);
set('Princeton: Point Under', 'Offense', { notes: 'Feed the high post and cut under to the rim. If covered, the weak big screens the cutter out to the wing and posts up himself.', tips: ['Cut to score. The screen out is the second read.'], sits: ['vs_deny', 'post_entry'], mirror: true, first: 'Princeton set, 5 at the high post, 4 on the left block.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lBlock', O5: 'ft' }, [
  pass('O1', 'O5'), cut('O1', 'rim', [230, 230], '1 cuts under to the rim.'),
  pin('O4', 'O1', [150, 150], 'lWing', [190, 90], 'Not open: 4 screens 1 out to the wing.'), seal('O4', 'lLow', '4 posts.'), pass('O5', 'O1'), pass('O1', 'O4'), shot('O4')]);
set('Princeton: Point Away', 'Offense', { notes: 'Feed the high post, cut away and fake a screen for the far wing, who back cuts or curls. Come back for the ball if neither is there.', tips: ['Back cut when he overplays, curl when he trails.'], sits: ['vs_deny', 'cov_top_lock'], mirror: true, first: 'Princeton set.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'ft' }, [
  pass('O1', 'O5'), cut('O1', [360, 240], [300, 280], '1 cuts away toward 3.'),
  mv({ O1: [[390, 220], 'screen'], O3: ['rim', 'cut', [410, 170]] }, '1 fakes the screen. 3 back cuts.'), pass('O5', 'O3'), shot('O3')]);
set('Princeton: Low', 'Offense', { notes: 'Wing feeds the low post, the high post and guard split in front of it, and the passer cuts off the split or Laker cuts baseline.', tips: ['Laker cut goes baseline when your man turns his head to the post.'], sits: ['post_entry', 'get_big'], mirror: true, first: 'Princeton low: 3 on the right wing, 5 on the right block, 4 at the high post.' }, { O3: 'rWing', O5: 'rBlock', O4: 'ft', O1: 'lSlot', O2: 'lWing' }, [
  pass('O3', 'O5'), screen('O4', 'O3', [380, 190], 'rElbow', [420, 190], '4 screens for 3. 3 curls to the elbow.'), cut('O4', 'rWing', null, '4 pops to the wing.'),
  shot('O5', '5 scores, or hits 3 at the elbow or 4 on the wing.')]);
set('Princeton: Twirl', 'Offense', { notes: 'The point guard dribbles at the wing, who sprints under to the other side on a twirl and comes off a down screen from the far big.', tips: ['Twirl at full speed. The screen is waiting.'], sits: ['get_shooter', 'quick'], mirror: true, first: 'Princeton set, bigs on the blocks.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lBlock', O5: 'rBlock' }, [
  mv({ O1: ['rSlot', 'dribble'], O2: ['lBlock', 'cut', [330, 90]] }, '1 dribbles at 2. 2 twirls under the rim to the other side.'),
  pin('O4', 'O2', [130, 160], 'lWing', [100, 130], '4 screens down. 2 comes up to the wing.'), pass('O1', 'O2'), pnr('O4', 'O2', [100, 270], 'nail', 'rim'), shot('O2')]);
set('Princeton: Chin Series', 'Offense', { notes: 'The Chin series: handoff on top while the weak side exchanges, the big fills the strong elbow, the ball swings and the wing back cuts off the big when the ball leaves him.', tips: ['Every pass has a cut behind it. Nobody watches.'], sits: ['vs_set_defense', 'vs_pressure'], mirror: true, first: 'Chin: 5 on the right block, 3 and 4 above the foul line extended, 1 and 2 up top.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'rBlock' }, [
  dho('O1', 'O4', [170, 300], 'top', [120, 270]), cut('O5', 'rElbow', null, '5 fills the strong elbow.'),
  pass('O4', 'O2'), pass('O2', 'O3'), back('O5', 'O2', [340, 240], 'rim', [330, 200], '5 back screens 2 when the ball leaves him. 2 cuts.'), pass('O3', 'O2'), shot('O2')]);
/* ---- Triangle ---- */
const TR = F.TRIANGLE;
set('Triangle: Sideline Post Split', 'Offense', { notes: 'The sideline triangle: wing feeds the post, the wing and corner split, the weak big ducks in on the feed.', tips: ['Split off the passer: he screens, the corner comes to the ball.'], sits: ['post_entry', 'get_big'], mirror: true, first: 'Sideline triangle on the right: 1 wing with the ball, 2 corner, 5 block. 3 top, 4 weak elbow.' }, TR, [
  pass('O1', 'O5'), screen('O1', 'O2', [430, 150], 'rWing', [470, 170], '1 screens for 2. 2 comes up to the wing.'), cut('O1', 'rCorner', null, '1 pops to the corner.'),
  seal('O4', 'lLow', '4 ducks in on the weak side.'), shot('O5', '5 scores, or finds 4 ducking in or 2.')]);
set('Triangle: Blind Pig', 'Offense', { notes: 'When the wing is denied, the weak elbow flashes to the ball side elbow for the catch and the denied wing goes back door.', tips: ['The deny is the read. The flash comes the moment the wing is top locked.'], sits: ['vs_deny', 'cov_top_lock', 'vs_pressure'], mirror: true, first: 'Triangle, 3 has it at the top, 1 is denied on the right wing.' }, { O3: 'top', O1: 'rWing', O2: 'rCorner', O5: 'rBlock', O4: 'lElbow' }, [
  cut('O4', 'rElbow', null, '4 flashes to the ball side elbow.'), pass('O3', 'O4'),
  cut('O1', 'rim', [450, 180], '1 goes back door.'), pass('O4', 'O1', 'Bounce pass.'), shot('O1')]);
set('Triangle: Pinch Post', 'Offense', { notes: 'Feed the weak elbow and cut off him for the handoff. He fakes it, the cutter continues, and the next cutter comes off the other side.', tips: ['Pinch post man: catch, face, and read the first cutter\'s defender.'], sits: ['post_entry', 'vs_switch'], mirror: true, first: 'Triangle, 3 at the top, 4 at the left elbow.' }, { O3: 'top', O1: 'rWing', O2: 'rCorner', O5: 'rBlock', O4: 'lElbow' }, [
  pass('O3', 'O4'), cut('O3', 'lWing', [230, 230], '3 cuts off 4 for a handoff that 4 fakes.'),
  cut('O1', 'rim', [300, 250], '1 cuts off the other side of 4 to the rim.'), pass('O4', 'O1', 'Hit 1, or 4 drives.'), shot('O1')]);
set('Triangle: Solo Cut', 'Offense', { notes: 'Wing feeds the post and cuts alone to the weak corner. The corner and post play two man game on the strong side.', tips: ['Solo cut clears the help. The two man game is the point.'], sits: ['post_entry', 'mismatch'], mirror: true, first: 'Sideline triangle on the right.' }, TR, [
  pass('O1', 'O5'), cut('O1', 'lCorner', [250, 110], '1 solo cuts to the weak corner.'),
  cut('O2', 'rWing', null, '2 lifts to the wing.'), pass('O5', 'O2'), pnr('O5', 'O2', [420, 200], 'nail', 'rim'), shot('O2')]);
/* ---- Continuity ---- */
set('Flex: Reversal', 'Offense', { notes: 'The flex continuity: guard to guard, the corner flex cuts off the block screen, the passer screens down for the screener. Repeat the other way.', tips: ['Flex cut over the top. Down screen the screener with your chest.'], sits: ['vs_set_defense', 'second_unit'], mirror: true, first: 'Flex: 1 and 2 up, 3 in the left corner, 4 on the left block, 5 on the right block.' }, F.FLEX, [
  pass('O1', 'O2'), cross('O4', 'O3', [230, 95], 'rLow', [250, 70], '4 flex screens on the baseline. 3 cuts to the ball side block.'),
  pin('O1', 'O4', [190, 170], 'lElbow', [170, 130], '1 screens down for 4. 4 pops to the elbow.'), pass('O2', 'O3', 'Feed 3, or 4 at the elbow.'), shot('O3')]);
set('Swing: UCLA Reversal', 'Offense', { notes: 'Wisconsin\'s swing: the wing passes to the point, the ball swings to the far wing, the passing wing UCLA cuts to the block and the post flashes and back screens.', tips: ['Swing, cut, screen. Then the screener gets screened.'], sits: ['vs_set_defense', 'kill_clock'], mirror: true, first: 'Swing: 2 on the right wing with the ball, 1 at the top, 3 on the left wing, 5 on the right block, 4 at the left elbow.' }, { O2: 'rWing', O1: 'top', O3: 'lWing', O5: 'rBlock', O4: 'lElbow' }, [
  pass('O2', 'O1'), pass('O1', 'O3', 'Swing it.'), screen('O5', 'O2', [320, 200], 'rBlock', [330, 170], '5 flashes high and screens. 2 UCLA cuts to the block.'),
  pin('O1', 'O5', [300, 250], 'top', [340, 230], '1 screens down for 5. 5 pops.'), pass('O3', 'O4'), pass('O4', 'O5'), shot('O5')]);
set('Shuffle: Cut', 'Offense', { notes: 'The shuffle cut: the weak corner cuts off the high post screen to the ball side block, the wing reverses to the high post stepping out, and the passer screens down for the weak block.', tips: ['Shuffle cut goes over the top of the high post, low to the block.'], sits: ['vs_set_defense', 'post_entry'], mirror: true, first: 'Shuffle: 1 top left, 2 right wing, 3 left corner, 4 high post, 5 left block.' }, { O1: 'lSlot', O2: 'rWing', O3: 'lCorner', O4: 'ft', O5: 'lBlock' }, [
  pass('O1', 'O2'), screen('O4', 'O3', [230, 190], 'rLow', [200, 150], '3 shuffle cuts off 4 to the ball side block.'),
  cut('O4', 'top', null, '4 steps out to the top.'), pass('O2', 'O4', 'Reverse.'), pin('O1', 'O5', [150, 160], 'lWing', [110, 130], '1 screens down for 5. 5 pops to the wing.'), pass('O4', 'O5'), shot('O5')]);
set('Wheel: Curl Chain', 'Offense', { notes: 'The wheel: wing feeds the post, the first cutter curls over the high post to the block, the next cutter follows behind him, and the ball reverses to the point to keep it turning.', tips: ['One cutter at a time, each one a beat behind the last.'], sits: ['vs_set_defense', 'kill_clock'], mirror: true, first: 'Wheel: 2 on the right wing with the ball, 5 on the right block, 4 at the high post, 1 top, 3 left wing.' }, { O2: 'rWing', O5: 'rBlock', O4: 'ft', O1: 'top', O3: 'lWing' }, [
  pass('O2', 'O5'), screen('O4', 'O1', [240, 190], 'lBlock', [260, 160], '1 curls over 4 to the far block.'),
  screen('O4', 'O3', [240, 190], 'lLow', [230, 230], '3 follows behind him off the same screen.'), cut('O4', 'top', null, '4 pops to the top.'), pass('O5', 'O4', 'Reverse to keep the wheel turning.'), pass('O4', 'O3'), shot('O3')]);
set('Motion Strong: Cross and Down', 'Offense', { notes: 'Knight\'s motion strong: wing entry, the weak big cross screens for the strong big, then the passer screens down for the cross screener.', tips: ['Screen the screener every time. The second man is the one who scores.'], sits: ['vs_set_defense', 'post_entry'], mirror: true, first: 'Motion: 1 top, 2 and 3 wings, bigs on the blocks.' }, F.LOW, [
  pass('O1', 'O2'), cross('O4', 'O5', [250, 95], 'rLow', [250, 70], '4 cross screens for 5.'),
  pin('O1', 'O4', [200, 170], 'lElbow', [170, 130], '1 screens down for 4. 4 pops.'), pass('O2', 'O5', 'Feed the post, or swing to 4.'), shot('O5')]);
set('Dribble Drive: Kick Back', 'Offense', { notes: 'The drive cannot turn the corner, so the ball kicks back to the guard lifting behind and he attacks the open gap.', tips: ['Kick back, then relocate. Never stand after the pass.'], sits: ['get_pg', 'vs_pack'], mirror: true, first: 'Dribble drive spacing: wings wide, 4 in the weak corner, 5 on the weak block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'lBlock' }, [
  mv({ O1: [[330, 200], 'dribble'], O2: ['rCorner', 'cut'] }, '1 drives the right gap. 2 drifts to the corner.'),
  cut('O3', 'top', null, '3 lifts behind the play.'), pass('O1', 'O3', 'Kick back to 3.'), drib('O3', 'lLane', null, '3 attacks the open gap.'), shot('O3', 'Finish, or dump to 5.')]);
set('Dribble Drive: Drag Zone Kick', 'Offense', { notes: 'The wing drifts to the corner as the guard drives his side (the drag zone), and the kick to the drifting shooter is the shot.', tips: ['Drift to the corner as he drives, not before.'], sits: ['need3', 'vs_pack', 'get_shooter'], mirror: true, first: 'Dribble drive spacing.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'lBlock' }, [
  mv({ O1: ['rLane', 'dribble'], O2: ['rCorner', 'cut'] }, '1 drives the right side. 2 drifts to the corner.'),
  pass('O1', 'O2', 'Kick to the drift.'), shot('O2')]);
set('Euro: Ball Screen Continuity', 'Offense', { notes: 'The European ball screen continuity: drag one side, the other big flashes to the far elbow for the reversal, and he hands off or ball screens the wing on the new side.', tips: ['The big who did not screen flashes high. Always.'], sits: ['vs_set_defense', 'cov_hedge'], mirror: true, first: 'Bigs at the elbows, 1 at the top, wings.' }, H14, [
  pnr('O5', 'O1', [295, 318], [350, 290], 'rBlock'), cut('O4', 'lElbow', null, '4 flashes to the far elbow.'), pass('O1', 'O4', 'Reverse.'),
  dho('O4', 'O3', [170, 240], 'rLane', [110, 270]), shot('O3', 'Attack the second side.')]);
/* ---- Transition and early offense ---- */
const tr = (name, opts, form, acts) => set(name, 'Offense', Object.assign({ court: 'full' }, opts), form, acts);
tr('Secondary: Carolina', { notes: 'The Carolina secondary break: push to the wing, the first big posts, reverse to the trailer, trailer to the weak wing, and the post cross screens across to the new side.', tips: ['Run lanes, not toward the ball. The wings touch the sideline.'], sits: ['secondary', 'transition', 'post_entry'], first: 'Numbered break: 1 middle, 2 and 3 wide, 5 rim runs, 4 trails.' }, { O1: 'centerLow', O2: 'hashR', O3: 'hashL', O5: 'ftLow', O4: [250, 650] }, [
  mv({ O1: ['upRWing', 'dribble'], O2: ['upRCorner', 'cut'], O3: ['upLWing', 'cut'], O5: [[305, 85], 'cut'], O4: ['upTop', 'cut'] }, '1 pushes to the right wing. 5 posts, 4 trails to the top.'),
  pass('O1', 'O4', 'Reverse to the trailer.'), pass('O4', 'O3'), mv({ O2: [[250, 95], 'screen'], O5: [[195, 85], 'cut', [250, 70]] }, '2 cross screens. 5 comes across to the new side.'), pass('O3', 'O5'), shot('O5')]);
tr('Secondary: Pitch Ahead Drag', { notes: 'Throw it ahead to the wing and the trailing big drags for him. The point guard fills behind.', tips: ['Throw ahead early. The drag is only good before the defense sets.'], sits: ['pitch_ahead', 'drag', 'transition'], mirror: true, first: '1 outlets, 2 runs the right lane, 5 trails.' }, { O1: 'centerLow', O2: 'hashR', O3: 'hashL', O5: [250, 620], O4: [110, 700] }, [
  together(pass('O1', 'O2', '1 throws ahead to 2.'), cut('O2', 'upRWing', null, '')),
  mv({ O5: [[420, 290], 'screen'], O2: ['upFt', 'dribble', [430, 240]] }, '5 drags for 2. 2 comes off toward the middle.'), cut('O5', 'upRim', null, '5 rolls.'), cut('O1', 'upTop', null, '1 fills behind.'), shot('O2')]);
tr('Secondary: Rim Run Seal', { notes: 'The big sprints rim to rim and seals in the lane while the point guard looks ahead. Early post or lob before the help arrives.', tips: ['Rim run every possession. Even when it is not there it moves the defense.'], sits: ['rim_run', 'transition', 'get_big'], first: '5 sprints ahead, 1 pushes.' }, { O1: 'centerLow', O5: [250, 480], O2: 'hashR', O3: 'hashL', O4: [250, 700] }, [
  mv({ O5: [[250, 100], 'cut'], O1: ['upTop', 'dribble'], O2: ['upRWing', 'cut'], O3: ['upLWing', 'cut'] }, '5 rim runs and seals. 1 pushes to the top.'),
  pass('O1', 'O5', 'Early post feed or lob.'), shot('O5')]);
tr('Secondary: Trailer Three', { notes: 'Push it to the wing, the wing drives baseline, and the trailing big stops at the top of the key for the trail three.', tips: ['Trailer: stop behind the line. Do not drift inside it.'], sits: ['trail_three', 'transition', 'need3'], mirror: true, first: '1 pushes right, 4 trails.' }, { O1: 'centerLow', O2: 'hashR', O3: 'hashL', O5: [250, 480], O4: [250, 700] }, [
  mv({ O1: ['upRWing', 'dribble'], O2: ['upRCorner', 'cut'], O3: ['upLWing', 'cut'], O5: [[305, 85], 'cut'], O4: ['upTop', 'cut'] }, 'Push. 4 trails to the top.'),
  drib('O1', [430, 120], null, '1 drives baseline.'), pass('O1', 'O4', 'Kick to the trailer.'), shot('O4')]);
tr('Secondary: Miami', { notes: 'The wing hands off to the filling guard and the big immediately ball screens the receiver. Handoff into pick and roll before the defense sets.', tips: ['Handoff and screen are one motion. No pause.'], sits: ['transition', 'early_offense', 'quick'], mirror: true, first: '2 has it on the right wing, 1 fills behind, 5 trails.' }, { O2: 'upRWing', O1: [330, 480], O5: [250, 520], O3: 'upLWing', O4: 'upLCorner' }, [
  dho('O2', 'O1', [400, 290], 'upTop', [380, 400]), mv({ O5: [[300, 330], 'screen'], O1: [[200, 300], 'dribble'] }, '5 ball screens 1 right behind it.'), cut('O5', 'upRim', null, '5 rolls.'), shot('O1')]);
tr('Secondary: Boomerang', { notes: 'The Nuggets\' boomerang: pass to a teammate and get it right back, so the defender who switched onto you is now the one on the ball.', tips: ['Use it when they switch everything in transition. Pick your matchup.'], sits: ['cov_switch', 'mismatch', 'transition'], mirror: true, first: '1 at the top in early offense, 5 on the right wing.' }, { O1: 'upTop', O5: 'upRWing', O2: 'upRCorner', O3: 'upLWing', O4: 'upLCorner' }, [
  pass('O1', 'O5'), pass('O5', 'O1', 'Right back.'), drib('O1', [330, 200], null, '1 attacks the new matchup.'), shot('O1')]);
tr('Secondary: Corner Exit', { notes: 'The low big screens the corner man\'s defender toward the corner so the guard exits to the corner clean for the drive and kick.', tips: ['Exit screen angle: face the corner, let him run past your hip.'], sits: ['transition', 'need3', 'get_shooter'], mirror: true, first: '1 at the top, 5 on the right block, 2 on the right wing.' }, { O1: 'upTop', O5: [305, 85], O2: 'upRWing', O3: 'upLWing', O4: 'upLCorner' }, [
  screen('O5', 'O2', [400, 120], 'upRCorner', [440, 170], '5 exit screens for 2. 2 runs to the corner.'),
  drib('O1', [330, 200], null, '1 drives right.'), pass('O1', 'O2', 'Kick to the corner.'), shot('O2')]);
tr('Secondary: Early Hammer', { notes: 'Push to the wing, drive baseline early, and the trailing big hammers the weak corner shooter for the skip.', tips: ['Baseline drive, then the skip. Never the middle.'], sits: ['transition', 'need3'], mirror: true, first: '1 pushes right, 3 fills the left corner, 4 trails left.' }, { O1: 'upRWing', O2: 'upRCorner', O3: 'upLCorner', O4: [150, 400], O5: [305, 85] }, [
  drib('O1', [450, 120], null, '1 drives baseline.'), flare('O4', 'O3', [120, 100], 'upLCorner', [60, 130], '4 hammers 3.'), pass('O1', 'O3', 'Skip.'), shot('O3')]);
tr('Secondary: Flip', { notes: 'Two wings at the top flip a handoff at the arc and the receiver attacks the other side while the big screens.', tips: ['Flip at the three point line. The receiver goes downhill immediately.'], sits: ['transition', 'early_offense'], mirror: true, first: '1 and 2 at the top in early offense, 5 trailing.' }, { O1: 'upTop', O2: [330, 380], O5: [250, 520], O3: 'upLWing', O4: 'upRCorner' }, [
  dho('O1', 'O2', [280, 345], [170, 290], [300, 400]), mv({ O5: [[200, 300], 'screen'] }, '5 screens the new handler.'), cut('O5', 'upRim', null, '5 rolls.'), shot('O2')]);
tr('Secondary: Stagger Away', { notes: 'Push to the wing, and the point guard and trailer stagger away for the weak wing coming to the top.', tips: ['Stagger as the ball goes to the wing. Second screener trails by two steps.'], sits: ['transition', 'need3', 'get_shooter'], mirror: true, first: '1 pushes right, 3 on the left wing, 4 trails.' }, { O1: 'upTop', O2: 'upRWing', O3: 'upLWing', O4: [250, 520], O5: [305, 85] }, [
  pass('O1', 'O2'), stagger('O1', 'O4', 'O3', [150, 260], [200, 320], 'upTop', [90, 300], '1 and 4 stagger away for 3. 3 comes to the top.'),
  pass('O2', 'O3'), shot('O3')]);
tr('Secondary: Drag into Spain', { notes: 'Drag screen in transition, and the trailing shooter back screens the roller\'s man and pops. Spain action before the defense is set.', tips: ['Shooter: trail the play on purpose. You arrive as the roll starts.'], sits: ['transition', 'cov_drop', 'need3'], mirror: true, first: '1 pushes, 5 drags, 2 trails.' }, { O1: 'upTop', O5: [300, 420], O2: [250, 560], O3: 'upLCorner', O4: 'upRCorner' }, [
  mv({ O5: [[290, 350], 'screen'], O1: [[330, 290], 'dribble'] }, '5 drags. 1 comes off.'), cut('O5', 'upRim', [300, 220], '5 rolls.'),
  back('O2', 'O5', [280, 200], 'upRim', [300, 300], '2 back screens the roller\'s man.'), cut('O2', 'upTop', null, '2 pops.'), pass('O1', 'O5', 'Lob, or 2 at the top.'), shot('O5')]);
tr('Transition: Drag Reject', { notes: 'The big drags, the guard rejects it and drives the other way, and the big dives to the opposite block.', tips: ['Reject when the defender jumps to the screen side early.'], sits: ['transition', 'cov_over', 'drag'], mirror: true, first: '1 pushes, 5 drags from the right.' }, { O1: 'upTop', O5: [320, 400], O2: 'upRCorner', O3: 'upLCorner', O4: 'upLWing' }, [
  mv({ O5: [[300, 340], 'screen'], O1: [[180, 280], 'dribble'] }, '5 drags right. 1 rejects it and goes left.'),
  cut('O5', [195, 85], null, '5 dives to the left block.'), shot('O1', 'Finish, or dump to 5.')]);
tr('Transition: Numbers Three on Two', { notes: 'Three on two: the ball in the middle, wings wide and ahead. Stop at the foul line, read the top defender, pass or shoot.', tips: ['Middle man stops at the foul line. Never dribble into the second defender.'], sits: ['numbers', 'primary_break', 'after_steal'], d: { X1: [250, 150], X2: [250, 70] }, first: 'Three on two after a steal.' }, { O1: [250, 450], O2: [440, 380], O3: [60, 380] }, [
  mv({ O1: ['upFt', 'dribble'], O2: [[430, 120], 'cut'], O3: [[70, 120], 'cut'] }, '1 pushes to the foul line. Wings sprint wide to the blocks.'),
  pass('O1', 'O2', 'Top defender stops the ball: hit the wing.'), shot('O2', 'Layup, or back to 1 if the bottom man comes.')]);
tr('Transition: Two on One', { notes: 'Two on one: the ball handler attacks the elbow and makes the defender commit. Pass late, never early.', tips: ['Make him choose. If he stays on you, lay it up.'], sits: ['numbers', 'after_steal', 'primary_break'], d: { X1: [250, 120] }, first: 'Two on one after a steal.' }, { O1: [300, 450], O2: [120, 400] }, [
  mv({ O1: [[320, 200], 'dribble'], O2: [[140, 120], 'cut'] }, '1 attacks the elbow. 2 runs wide to the far block.'),
  pass('O1', 'O2', 'He commits to the ball: drop it off.'), shot('O2')]);
tr('Transition: Off a Made Basket', { notes: 'After their make, the big takes it out fast, the point guard comes back to the ball, the wings sprint. The first pass is in before they can set the press.', tips: ['Take it out of the net. Every second you wait is a second for them.'], sits: ['after_made', 'vs_press', 'early_offense'], first: 'They just scored. 5 grabs it out of the net.' }, { O5: 'inb', O1: [250, 740], O2: [110, 640], O3: [390, 640], O4: 'half' }, [
  pass('O5', 'O1', 'Quick inbound to 1.'), mv({ O1: ['centerLow', 'dribble'], O2: ['hashL', 'cut'], O3: ['hashR', 'cut'], O4: ['upTop', 'cut'] }, '1 pushes. Wings run, 4 to the top.'),
  cut('O5', [250, 560], null, '5 trails.'), pass('O1', 'O4', 'Ahead to 4, or keep going.'), shot('O4', 'Attack before they set.')]);
/* ---- Late game and full court specials ---- */
const sp = (name, cat, opts, form, acts) => set(name, cat, opts, form, acts);
sp('Full Court: Maryland', 'Special', { notes: 'Under three seconds, full court. Four flat across half court: one sprints long, one back screens for him, the inbounder throws it over the top.', tips: ['Fake the short pass. The long man goes on the fake.'], sits: ['full_court_short', 'full_court_1', 'need2', 'need3'], court: 'full', ball: 'O4', first: '4 inbounds under their basket. Four across half court.' }, { O4: 'inb', O1: [100, 440], O2: [200, 440], O3: [300, 440], O5: [400, 440] }, [
  back('O3', 'O2', [230, 420], 'upFt', [150, 350], '3 back screens for 2. 2 sprints long.'), mv({ O1: [[80, 560], 'cut'], O5: [[420, 560], 'cut'] }, '1 and 5 come back to the ball as decoys.'),
  pass('O4', 'O2', 'Over the top.'), shot('O2')]);
sp('Full Court: Duke', 'Special', { notes: 'Under three seconds. The big catches at half court, pivots, and hands to the guard sprinting past him for the pull up.', tips: ['Big: catch with two hands, pivot to the sideline, hand it off going by.'], sits: ['full_court_short', 'need2', 'full_court_catch'], court: 'full', ball: 'O4', first: '4 inbounds. 5 at half court, 1 behind him.' }, { O4: 'inb', O5: 'half', O1: [250, 560], O2: 'highL', O3: 'highR' }, [
  pass('O4', 'O5', 'Long pass to 5 at half.'), dho('O5', 'O1', [250, 440], 'upFt', [280, 520]), shot('O1', 'Pull up.')]);
sp('Full Court: Hail Mary', 'Special', { notes: 'One second left. Best jumper at the far foul line, two shooters at the arc for tips, baseball pass to the rim.', tips: ['Throw it to the rim. Jumper goes up, shooters stay for the tip out.'], sits: ['full_court_1', 'need2', 'need3'], court: 'full', ball: 'O4', first: '4 inbounds. 5 at the far foul line, 2 and 3 at the arc, 1 at half.' }, { O4: 'inb', O5: 'upFt', O2: 'upRWing', O3: 'upLWing', O1: 'half' }, [
  mv({ O5: ['upRim', 'cut'], O2: [[330, 150], 'cut'], O3: [[170, 150], 'cut'] }, '5 goes to the rim. 2 and 3 crash for the tip.'),
  pass('O4', 'O5', 'Baseball pass to the rim.'), shot('O5', 'Catch and finish, or tip out.')]);
sp('Full Court: Catch and Timeout', 'Special', { notes: 'Under five seconds, you have a timeout. Get it to half court and call it. Two screens up the sideline for the point guard.', tips: ['Catch, two feet, timeout. Do not try to be a hero with four seconds.'], sits: ['full_court_catch', 'full_court_short'], court: 'full', ball: 'O4', first: '4 inbounds. 1 at the foul line, 2 and 5 on the sideline above him.' }, { O4: 'inb', O1: 'ftLow', O2: [420, 600], O5: [420, 500], O3: 'highL' }, [
  stagger('O2', 'O5', 'O1', [400, 620], [400, 520], [430, 440], [330, 650], '2 and 5 stagger up the sideline. 1 comes off both to half court.'),
  pass('O4', 'O1', 'Catch it past half. Timeout.')]);
sp('Late: Brush Clear', 'Late game', { notes: 'Brad Stevens\' Brush Clear: the best driver catches, a guard brush screens him into a drive, the big down screens, the guard brushes again. Everyone else is in the corners.', tips: ['Brush screens are moving picks that are not picks. Get in the way and leave.'], sits: ['need2', 'iso', 'shot_clock_5'], mirror: true, first: '2 has it at the top, 1 next to him, 5 at the elbow, 3 and 4 in the corners.' }, { O2: 'top', O1: 'lSlot', O5: 'rElbow', O3: 'lCorner', O4: 'rCorner' }, [
  mv({ O1: [[290, 320], 'screen'], O2: [[340, 290], 'dribble'] }, '1 brushes 2 going right.'), pin('O5', 'O1', [230, 250], 'lWing', [200, 290], '5 screens down for 1.'),
  mv({ O1: [[300, 250], 'screen'], O2: ['rLane', 'dribble', [380, 240]] }, '1 comes back and brushes again. 2 drives.'), shot('O2', 'Finish, or kick to a corner.')]);
sp('Late: Tap Head Special', 'Late game', { notes: 'Fratello\'s Tap Head Special: bigs at the elbows with the guards behind them. The guards screen each other, then the shooter comes over and around the big to the wing.', tips: ['Save it. Once a season, for the shot you need most.'], sits: ['need3', 'ato', 'down3_last'], mirror: true, first: '4 and 5 at the elbows, 1 behind 4, 2 behind 5, 3 has it at the top.' }, { O3: 'topDeep', O4: 'lElbow', O5: 'rElbow', O1: [180, 250], O2: [320, 250] }, [
  mv({ O2: [[240, 250], 'screen'], O1: ['rWing', 'cut', [250, 180]] }, '2 screens for 1. 1 rubs around 5 to the right wing.'),
  mv({ O1: [[300, 200], 'screen'], O2: ['lWing', 'cut', [250, 200]] }, '1 turns and screens for 2. 2 comes around 4 to the left wing.'),
  pass('O3', 'O2'), shot('O2')]);
sp('Late: Need Two, Foul Game', 'Late game', { notes: 'Down 2 with 25 seconds and the ball. Score quick with a drive, then foul immediately. The play is a spread drive for the best finisher, not a jumper.', tips: ['Two points fast. A layup at 18 seconds is better than a three at 4.'], sits: ['need_quick2', 'down4_late', 'bonus'], first: 'Spread, best driver at the top.' }, SP, [
  pnr('O5', 'O1', [290, 350], [340, 300], 'rim'), drib('O1', 'rLane', null, '1 turns the corner and gets to the rim.'), shot('O1', 'Finish. Then foul right away.')]);
sp('Late: Three and a Stop', 'Late game', { notes: 'Down 3, under a minute, you need a three AND a stop. Run the flare for your shooter early so there is clock left to defend.', tips: ['Shoot it with 30 seconds left, not 5. You need two possessions.'], sits: ['need_3_and_stop', 'down3_last', 'need3'], mirror: true, first: 'Horns set, 2 is the shooter.' }, H, [
  pass('O1', 'O4'), stagger('O5', 'O1', 'O2', [330, 150], [340, 240], 'rTop', [430, 170], '5 and 1 stagger for 2 out of the corner.'), pass('O4', 'O2'), shot('O2', 'Three. Then press.')]);
sp('Late: Up Three, Take the Foul Shots', 'Late game', { notes: 'Up 3, they must foul. Spread the floor, best free throw shooters handle, and when they foul, make them. No threes, no jumpers, no turnovers.', tips: ['Catch it with two hands away from the sideline. Turn and take the foul.'], sits: ['up3_late', 'run_clock', 'kill_clock'], first: 'Spread, 1 has it.' }, { O1: 'topDeep', O2: 'rWing', O3: 'lWing', O4: 'rCorner', O5: 'lCorner' }, [
  mv({ O1: ['lSlot', 'dribble'], O2: ['top', 'cut'] }, '1 dribbles away from the trap. 2 lifts for the outlet.'), pass('O1', 'O2', 'Pass before the trap closes. 2 takes the foul.')]);
sp('Late: Start of Overtime Tip', 'Special', { notes: 'Overtime jump ball. Tip to the strong side wing, the weak side wing sprints to the rim for the long pass.', tips: ['Know who is jumping before the ref gets there. Call it out.'], sits: ['ot_start', 'tip', 'jump_ball_win'], court: 'full', ball: 'O5', first: 'Jump ball at half court to start overtime. 5 jumps.' }, { O5: [250, 430], O1: [330, 480], O2: [170, 480], O3: [250, 560], O4: [250, 300] }, [
  pass('O5', 'O1', '5 tips to 1.'), cut('O4', 'upRim', null, '4 sprints to the rim.'), pass('O1', 'O4', 'Long pass.'), shot('O4')]);
sp('Dead Ball: Their Free Throw, Push', 'Offense', { notes: 'They miss the free throw: the big outlets to the point guard on the sideline, the wings run, the shooter trails for three.', tips: ['Outlet to the sideline, not the middle. The middle is where the steal is.'], sits: ['ft_they_miss_push', 'ft_they_shoot', 'primary_break'], court: 'full', ball: 'O5', first: 'Their miss. 5 rebounds at the far end.' }, { O5: [250, 760], O1: [400, 700], O2: [120, 620], O3: [380, 560], O4: [250, 650] }, [
  pass('O5', 'O1', 'Outlet to the sideline.'), mv({ O1: ['halfR', 'dribble'], O2: ['hashL', 'cut'], O3: ['upRCorner', 'cut'], O4: [[250, 450], 'cut'] }, '1 pushes. 2 and 3 run wide, 4 rim runs.'),
  pass('O1', 'O3', 'Ahead to the corner.'), shot('O3')]);
sp('Dead Ball: Free Throw Block Out', 'Defense', { notes: 'Their free throw: inside men pinch the shooter\'s teammates, the third man takes the shooter, the guard releases on the make for the outlet.', tips: ['Step across on the release, not the bounce. Hands up, hips low.'], sits: ['ft_block_out', 'ft_they_shoot'], first: 'They shoot a free throw. X4 and X5 inside, X3 on the shooter.' }, { O1: 'ft', O2: [195, 110], O3: [305, 110], O4: [180, 160], O5: 'top', X4: [220, 85], X5: [280, 85], X3: [250, 170], X1: [170, 200], X2: [330, 200] }, [
  mv({ X4: [[195, 125], 'cut'], X5: [[305, 125], 'cut'], X3: [[250, 190], 'cut'] }, 'On the release: X4 and X5 step across and seal, X3 steps into the shooter.'),
  mv({ X1: [[80, 300], 'cut'], X2: [[420, 300], 'cut'] }, 'Guards release wide for the outlet.')]);
sp('Dead Ball: Held Ball, Arrow Ours', 'Sideline out', { notes: 'The possession arrow gives us the ball on the side. Same quick set every time: back screen to the rim, safety to the top.', tips: ['Bench calls the arrow before the whistle. Nobody is surprised.'], sits: ['held_ball', 'slob', 'dead_ball'], ball: 'O3', first: 'Arrow ours, 3 inbounds from the left sideline.' }, SLOB, [
  back('O5', 'O2', [140, 150], 'rim', [170, 90], '5 back screens 2. 2 cuts to the rim.'), cut('O1', 'lWing', null, '1 comes to the ball.'), pass('O3', 'O2', 'Rim, or 1 for safety.'), shot('O2')]);
sp('Dead Ball: After a Technical', 'Special', { notes: 'After the technical free throws we get the ball at half court. The same sideline set every time: pin down for the shooter, big to the ball.', tips: ['Decide who shoots the technicals before the season. Then run this.'], sits: ['after_tech', 'tech_ft', 'slob'], ball: 'O3', first: 'Ball at half court after a technical, 3 inbounds from the left sideline.' }, { O3: 'sideLHigh', O1: 'lSlot', O2: 'lBlock', O5: 'lElbow', O4: 'rWing' }, [
  pin('O5', 'O2', [120, 160], 'lWing', [80, 130], '5 pins down for 2. 2 comes to the wing.'), cut('O5', 'top', null, '5 pops to the ball.'), pass('O3', 'O2'), shot('O2', 'Shot, or run offense.')]);
sp('First Possession: Simple Horns', 'Offense', { notes: 'The first play of the game. Something you have run a thousand times: Horns dive and pop. Get the ball in the paint and everybody a touch.', tips: ['First possession is about rhythm, not the scouting report.'], sits: ['first_poss', 'first_play', 'cold_start'], mirror: true, first: 'Horns set, tip off just happened.' }, H, [
  pnr('O5', 'O1', [295, 318], [350, 295], 'rBlock', 'O4', 'lElbow'), pass('O1', 'O5', 'Hit the roll.'), shot('O5')]);
sp('Start of Half: Post Touch', 'Offense', { notes: 'First possession of the second half. Get the big a touch on the block to see how they are guarding him after the break.', tips: ['Watch for the double. Where it comes from tells you the second half plan.'], sits: ['start_half', 'post_entry', 'get_big'], mirror: true, first: 'Four out, 5 on the right block.' }, FOUR_OUT, [
  pass('O1', 'O2'), cut('O1', 'lSlot', null, '1 slides away.'), pass('O2', 'O5', 'Feed the post.'), shot('O5', 'Score, or kick where the double came from.')]);
sp('Stop the Run: Slow It Down', 'Offense', { notes: 'They are on a 10 to 0 run and you are out of timeouts. Walk it up, run the full shot clock, and get the ball inside. No threes.', tips: ['Four passes before anyone shoots. Make them guard for 25 seconds.'], sits: ['stop_run', 'kill_clock', 'vs_set_defense'], first: 'Walk it up. Five out spacing.' }, FIVE_OUT, [
  pass('O1', 'O2'), cut('O1', 'rim', [290, 230], '1 cuts through.'), cut('O1', 'lCorner', null, '1 fills the far corner.'), mv({ O3: ['top', 'cut'], O5: ['lWing', 'cut'] }, 'Fill.'),
  pass('O2', 'O3'), pass('O3', 'O5'), cut('O4', 'rLow', [430, 120], '4 posts late in the clock.'), pass('O5', 'O1'), pass('O1', 'O4'), shot('O4', 'Score inside with 5 on the clock.')]);
sp('Personnel: No Point Guard', 'Offense', { notes: 'The point guard is on the bench. Bring it up with the big in the middle of the floor and play Delay: nobody has to dribble through pressure.', tips: ['Wings get open with cuts, not dribbles. The big is the passer.'], sits: ['no_pg', 'vs_pressure', 'second_unit'], ball: 'O5', first: 'Delay set with 5 bringing it up.' }, DL, [
  cut('O1', 'rim', [280, 280], '1 cuts off 5 to the rim.'), cut('O1', 'rCorner', null, '1 clears.'), dho('O5', 'O3', [230, 330], 'rLane', [180, 320]), shot('O3')]);
sp('Personnel: Five Shooters', 'Offense', { notes: 'Small lineup, five shooters. Spread pick and roll with the slip: the screener never actually screens, he slips to the arc and the lane is empty.', tips: ['Nobody inside the arc except the driver. Space is the big man.'], sits: ['five_shooters', 'small_ball', 'no_big'], mirror: true, first: 'Five out, 4 is the smallest big.' }, FIVE_OUT, [
  mv({ O4: [[300, 320], 'cut'], O1: [[200, 310], 'dribble'] }, '4 comes to ghost the screen.'), cut('O4', 'rWingHigh', null, '4 slips to the wing.'),
  drib('O1', 'lLane', null, '1 drives the empty lane.'), shot('O1', 'Layup, or kick to 4 if his man helps.')]);
sp('Personnel: Two Bigs High Low', 'Offense', { notes: 'Two bigs on the floor. Play them high low with the guards spaced wide: the high post catches, the low post seals.', tips: ['High post: catch above the elbow so the low man has room to seal.'], sits: ['two_bigs', 'vs_bigger', 'post_entry'], mirror: true, first: '1 at the top, 4 at the right elbow, 5 on the left block, shooters wide.' }, { O1: 'top', O4: 'rElbow', O5: 'lBlock', O2: 'rCorner', O3: 'lWing' }, [
  pass('O1', 'O4'), seal('O5', 'lLow'), pass('O4', 'O5', 'High low.'), shot('O5', 'Score, or kick to 3 if the help comes.')]);
sp('Personnel: Attack the Mismatch', 'Offense', { notes: 'They switched and now a guard is on your big. Clear the side and throw it in before they can double.', tips: ['Seal first, then call for it. The pass is a lob over the little man.'], sits: ['mismatch', 'cov_switch', 'post_entry'], mirror: true, first: 'After a switch, 5 has a guard on him on the right block.' }, { O1: 'rWing', O5: 'rBlock', O2: 'lCorner', O3: 'lWing', O4: 'top' }, [
  mv({ O2: ['lCorner', 'cut'], O3: ['lWing', 'cut'], O4: ['lSlot', 'cut'] }, 'Everyone clears to the weak side.'), seal('O5', 'rLow'), pass('O1', 'O5', 'Throw it in over the top.'), shot('O5')]);
sp('Personnel: Hot Hand Iso', 'Offense', { notes: 'He has made four in a row. Clear a side, get him the ball on the wing, and let him go one on one with a shooter spaced behind.', tips: ['Everyone else: stand still. Moving brings help.'], sits: ['hot_hand', 'iso', 'get_shooter'], mirror: true, first: '2 is hot. He has it on the right wing, the side is cleared.' }, { O2: 'rWing', O1: 'top', O3: 'lWing', O4: 'lCorner', O5: 'lBlock' }, [
  drib('O2', 'rLane', null, '2 goes to work.'), shot('O2', 'Score. If the help comes, 1 is behind him.')]);

/* ================================================================
   NAMED SETS, batch three B: more BLOBs and SLOBs from the pro and
   college catalog, zone plays, press breaks.
================================================================ */
bl('Box 1: Down and Back', { notes: 'The classic Box 1: the blocks screen down for the elbows who pop out, the ball goes to the wing, then the big back screens the top man to the rim.', tips: ['Get it in first. The back screen is the score.'], sits: ['blob', 'blob_vs_man', 'need2'], first: 'Box set, 3 inbounds.' }, BB, [
  together(pin('O4', 'O1', [180, 150], 'lWing', [150, 120], '4 screens down for 1.'), pin('O5', 'O2', [320, 150], 'rWing', [350, 120], '5 screens down for 2.')),
  pass('O3', 'O2'), back('O5', 'O1', [230, 230], 'rim', [180, 200], '5 back screens 1. 1 cuts to the rim.'), pass('O2', 'O1'), shot('O1')]);
bl('Box 2: Shooter Off the Stagger', { notes: 'Box 2: the shooter screens down first, then comes off a stagger from both bigs. Screen the screener for a three.', tips: ['Against a zone, the shooter curls under instead of coming off the stagger.'], sits: ['blob', 'blob_need3', 'need3'], first: 'Box set, 3 inbounds, 2 is the shooter at the ball side elbow.' }, BB, [
  pin('O2', 'O1', [320, 150], 'rWing', [350, 120], '2 screens down for 1. 1 pops to the wing.'),
  stagger('O5', 'O4', 'O2', [300, 110], [230, 150], 'lWing', [300, 80], '5 and 4 stagger. 2 comes off both to the left wing.'), pass('O3', 'O2'), shot('O2')]);
bl('Box Gator', { notes: 'Inbound to the corner, then the shooter cuts up the lane and the two bigs close the gate behind him at the top of the key.', tips: ['The gate closes as his hips clear. Not before.'], sits: ['blob', 'blob_need3'], first: 'Box set, 3 inbounds, 2 is the shooter on the weak block.' }, BB, [
  cut('O1', 'rCorner', null, '1 pops to the corner.'), pass('O3', 'O1'), mv({ O2: ['top', 'cut', [250, 170]], O4: [[225, 215], 'screen'], O5: [[275, 215], 'screen'] }, '2 runs up the lane. 4 and 5 close the gate.'), pass('O1', 'O2'), shot('O2')]);
bl('Box 54: Cross and Seal', { notes: 'The ball side big cross screens the weak side big, who comes to the ball side block. The screener seals and steps to the ball second.', tips: ['Screener: seal the moment the cutter clears you. You are the second look.'], sits: ['blob', 'need2', 'get_big'], first: 'Box set, 3 inbounds.' }, BB, [
  cross('O5', 'O4', [250, 95], 'rLow', [250, 70], '5 cross screens 4. 4 comes to the ball.'), mv({ O1: ['lWing', 'cut'], O2: ['top', 'cut'] }, 'Elbows pop for safety.'),
  seal('O5', 'lLow', '5 seals after the screen.'), pass('O3', 'O4', 'Hit 4, or 5 on the seal.'), shot('O4')]);
bl('Box Around', { notes: 'The weak elbow loops around the box to the ball side corner, screened by both low men on the way. The ball side big seals after.', tips: ['Loop at full speed. The screens happen as you pass them.'], sits: ['blob', 'blob_need3'], first: 'Box set, 3 inbounds, 1 is the shooter at the weak elbow.' }, BB, [
  mv({ O1: ['rCorner', 'cut', [250, 120]], O4: [[200, 110], 'screen'], O5: [[320, 110], 'screen'] }, '1 loops around the box to the corner off both screens.'),
  seal('O5', 'rLow'), pass('O3', 'O1'), shot('O1')]);
bl('Box Wide: Inbounder Three', { notes: 'A wide box. One pops to the corner for the safe entry, the big back screens the top man to the rim, and the inbounder steps in off a screen for his own shot.', tips: ['Inbounder: the whole play is designed to get you the ball back.'], sits: ['blob', 'blob_need3', 'get_shooter'], first: 'Wide box: 1 and 2 at the elbows extended, 4 and 5 in the short corners. 3 inbounds and is the shooter.' }, { O3: 'inbMid', O1: [150, 210], O2: [350, 210], O4: 'lShort', O5: 'rShort' }, [
  cut('O2', 'rCorner', null, '2 pops to the corner.'), pass('O3', 'O2'), back('O5', 'O1', [230, 230], 'rim', [180, 200], '5 back screens 1 to the rim.'),
  pin('O4', 'O3', [330, 100], 'rWing', [360, 60], '4 screens for 3 stepping in. 3 comes up to the wing.'), pass('O2', 'O3'), shot('O3')]);
bl('VanDerveer Box 1', { notes: 'Stanford\'s Box 1: the blocks up screen for the elbows, the ball goes to the corner cutter, and the inbounder steps in through an elevator from the two screeners.', tips: ['Inbounder: step in and run straight through the doors.'], sits: ['blob', 'blob_need3', 'get_shooter'], first: 'Box set, 3 inbounds and is the shooter.' }, BB, [
  together(back('O4', 'O1', [180, 150], 'lWing', [150, 120], '4 up screens 1.'), back('O5', 'O2', [320, 150], 'rCorner', [360, 130], '5 up screens 2. 2 to the corner.')),
  pass('O3', 'O2'), mv({ O3: ['top', 'cut', [250, 150]], O4: [[225, 210], 'screen'], O5: [[275, 210], 'screen'] }, '3 steps in and runs through the elevator.'), pass('O2', 'O3'), shot('O3')]);
bl('VanDerveer Box 2', { notes: 'Stanford\'s Box 2: up screens send one elbow to the corner and one across, the inbounder diagonal screens the diver to the block, then both elbows stagger for the opposite corner.', tips: ['Three looks in order: corner, block, far corner.'], sits: ['blob', 'need2', 'blob_need3'], first: 'Box set, 3 inbounds.' }, BB, [
  together(back('O5', 'O2', [320, 150], 'rCorner', [360, 130], '5 up screens 2 to the corner.'), back('O4', 'O1', [180, 150], 'lCorner', [150, 120], '4 up screens 1 to the far corner.')),
  pass('O3', 'O2'), screen('O3', 'O5', [280, 120], 'rLow', [300, 150], '3 steps in and diagonal screens 5 to the block.'), pass('O2', 'O5', 'Feed 5, or 1 in the far corner.'), shot('O5')]);
bl('Stack 2: Sideline Runner', { notes: 'Stack on the lane line. The first man screens for the second who runs the sideline for the pass, then the big back screens the other big for the lob on the weak side.', tips: ['Sideline runner catches on the move. The lob is behind him.'], sits: ['blob', 'need2'], first: 'Stack of 1, 2, 4, 5 on the lane line, 3 inbounds.' }, { O3: 'inbMid', O1: [305, 100], O2: [305, 140], O4: [305, 180], O5: [305, 220] }, [
  screen('O1', 'O2', [320, 120], 'rCorner', [350, 110], '1 screens for 2. 2 runs the sideline to the corner.'),
  back('O5', 'O4', [260, 190], 'lBlock', [230, 160], '5 back screens 4. 4 cuts to the weak block.'), pass('O3', 'O2', 'Corner, or the lob to 4.'), shot('O2')]);
bl('Stack Rub', { notes: 'Line of four. The first man rubs off the line to the ball side corner, the last man curls to the rim, the big seals in between.', tips: ['Rub shoulders with the line. Your man has to go around.'], sits: ['blob', 'need2', 'blob_need3'], first: 'Four in a line, 3 inbounds, 5 at the front.' }, BL, [
  mv({ O5: ['rCorner', 'cut', [330, 90]], O1: ['rim', 'cut', [270, 220]], O2: ['top', 'cut'] }, '5 rubs to the corner, 1 curls to the rim, 2 to the top.'),
  seal('O4', 'rLow'), pass('O3', 'O1', 'Rim, corner, or 4.'), shot('O1')]);
bl('Wheel: Around the Stack', { notes: 'The wheel BLOB: the first cutter curls all the way around the stack for the layup, the second waits and curls to the ball side short corner, the big slides into the paint, the point goes to the top.', tips: ['Wheel and Back: the second cutter fakes the curl and back cuts.'], sits: ['blob', 'need2'], reads: [{ when: 'they jump the second curl', then: 'He fakes it and back cuts to the rim', frame: 2 }], first: 'Stack near the lane, 3 inbounds.' }, { O3: 'inbMid', O1: [305, 100], O2: [305, 140], O4: [305, 180], O5: [305, 220] }, [
  cut('O1', 'lBlock', [250, 70], '1 curls around the stack for the layup.'),
  mv({ O2: ['rShort', 'cut', [330, 100]], O4: ['rLane', 'cut'], O5: ['top', 'cut'] }, '2 curls to the short corner, 4 into the paint, 5 to the top.'), pass('O3', 'O2', 'Hit 2, or 4 in the paint.'), shot('O2')]);
bl('3 Down: Back Screen', { notes: 'Three low. The big back screens the guard to the rim. If they switch, the big seals the small man and rolls. The others clear for safety.', tips: ['Down and Back: the big fakes the screen and cuts to the ball himself.'], sits: ['blob', 'need2', 'cov_switch_offball'], first: 'Three across the lane low, 3 inbounds.' }, { O3: 'inbMid', O1: [200, 130], O4: [250, 110], O2: [310, 130], O5: 'top' }, [
  back('O4', 'O1', [220, 140], 'rim', [190, 100], '4 back screens 1. 1 cuts to the rim.'), mv({ O2: ['rCorner', 'cut'], O5: ['top', 'cut'] }, '2 to the corner, 5 stays as safety.'),
  seal('O4', 'rLow', 'If they switch, 4 seals.'), pass('O3', 'O1', 'Hit 1, or 4 on the seal.'), shot('O1')]);
bl('Pinball', { notes: 'The guard on the wing, shooter under, big at the elbow and block. The shooter fakes and cuts over the elbow screen to the corner, the block screens the elbow to the rim, then staggers for the shooter along the baseline.', tips: ['Against a zone, the third man cuts weak side to screen the back of the zone.'], sits: ['blob', 'blob_need3', 'blob_zone'], first: '1 on the ball side wing, 2 under the rim, 4 at the elbow, 5 on the block, 3 inbounds.' }, { O3: 'inbMid', O1: 'rWing', O2: [250, 85], O4: 'rElbow', O5: 'lBlock' }, [
  screen('O4', 'O2', [330, 160], 'rCorner', [300, 120], '2 fakes, then cuts over 4 to the corner.'),
  screen('O5', 'O4', [280, 130], 'rim', [330, 120], '5 screens 4 to the rim.'), pass('O3', 'O2', 'Corner first, rim second.'), shot('O2')]);
bl('Baylor Triple', { notes: 'Three across the paint. The shooter cuts around the triple screen for the short jumper, the point pops to the top, and if the big\'s man cheats to the shooter the big seals and steps in.', tips: ['Triple screen is a wall. The cutter comes around the end of it.'], sits: ['blob', 'need2'], first: '2 ball side, 4, 1 and 5 across the paint, 3 inbounds.' }, { O3: 'inbMid', O2: [330, 110], O4: [200, 150], O1: [250, 150], O5: [300, 150] }, [
  cut('O2', 'lShort', [260, 100], '2 runs under the triple to the far short corner.'), cut('O1', 'top', null, '1 pops to the top.'),
  seal('O5', 'rLow', '5 seals if his man cheats.'), pass('O3', 'O2', 'Hit 2, or 5 stepping in.'), shot('O2')]);
bl('Dallas', { notes: 'The Mavericks\' Dallas: the guard back screens the big to the weak block, cuts to the top for the inbound, then dribbles at the wing for a handoff and the attack.', tips: ['Back screen, then go get the ball. Two jobs for one man.'], sits: ['blob', 'quick'], first: '2 and 5 ball side, 1 in the corner, 4 inbounds.' }, { O4: 'inbMid', O2: [320, 150], O5: [320, 100], O1: 'rCorner', O3: 'lWing' }, [
  back('O2', 'O5', [300, 110], 'lBlock', [260, 90], '2 back screens 5 to the weak block.'), cut('O2', 'top', null, '2 cuts to the top.'), pass('O4', 'O2'),
  dho('O2', 'O3', [180, 300], 'rLane', [130, 260]), cut('O4', 'rShort', null, '4 steps in to the short corner.'), shot('O3', 'Attack, kick to 1, or 4 short corner.')]);
bl('13: Double to the Wing', { notes: 'The big back screens the other big to the rim, then joins the guard in a double screen for the shooter to the wing. On the switch the big slips inside.', tips: ['Back screen first, then the double. Same man, two screens.'], sits: ['blob', 'blob_need3', 'cov_switch_offball'], first: '1-3: 1 at the top, 2, 4, 5 across the lane, 3 inbounds.' }, { O3: 'inbMid', O1: 'top', O2: [200, 140], O4: [250, 100], O5: [300, 140] }, [
  back('O5', 'O4', [280, 110], 'rim', [320, 90], '5 back screens 4 to the rim.'),
  dbl('O5', 'O1', 'O2', [330, 180], [330, 230], 'rWing', [250, 190], '5 and 1 double for 2 to the wing.'), pass('O3', 'O2'), shot('O2')]);
bl('Hokie: Two Man Game', { notes: 'Virginia Tech\'s Hokie: the best perimeter player and the post play a two man game on the ball side, the other three clear.', tips: ['Clear fast. The two man game needs the whole side.'], sits: ['blob', 'need2', 'mismatch'], first: '1 and 5 ball side, the rest weak side, 3 inbounds.' }, { O3: 'inbMid', O1: 'rWing', O5: 'rBlock', O2: 'lWing', O4: 'lCorner' }, [
  pass('O3', 'O1'), cut('O3', 'lBlock', [250, 60], '3 clears to the weak side.'), pnr('O5', 'O1', [420, 200], 'nail', 'rim'), shot('O1')]);
bl('Heat: Rip Screen the Screener', { notes: 'The Heat\'s BLOB Rip STS: a guard rips the big to the rim for the lob, then a second player screens the rip screener, who pops for three.', tips: ['Rip, then get screened. The ripper is the shooter.'], sits: ['blob', 'need2', 'blob_need3'], first: 'Box set, 3 inbounds, 1 is the shooter at the ball side elbow.' }, BB, [
  back('O1', 'O5', [310, 130], 'rim', [330, 100], '1 rips 5 to the rim.'), pin('O2', 'O1', [230, 190], 'top', [280, 170], '2 screens the screener. 1 pops to the top.'),
  pass('O3', 'O5', 'Lob first, or 1 at the top.'), shot('O5')]);
bl('Pacers: Exit Rip', { notes: 'The Pacers\' Exit Rip STS: the shooter exits to the corner off a screen, the guard rips the big, and the ripper comes off a screen to the top.', tips: ['Three options in order: corner, rim, top.'], sits: ['blob', 'blob_need3', 'need2'], first: 'Box set, 3 inbounds, 2 is the shooter at the weak elbow.' }, BB, [
  pin('O4', 'O2', [180, 150], 'lCorner', [150, 120], '4 screens 2 out to the corner.'), back('O1', 'O5', [310, 130], 'rim', [330, 100], '1 rips 5 to the rim.'),
  pin('O4', 'O1', [230, 190], 'top', [280, 170], '4 comes back and screens 1 to the top.'), pass('O3', 'O2', 'Corner, rim, or top.'), shot('O2')]);
bl('Mercury: Rip Double Exit', { notes: 'The Mercury\'s Rip Double Exit: the shooter is the back screener. He rips the big, then exits off a double stagger to the wing for the three.', tips: ['Screen first, shoot second. The screen is what frees you.'], sits: ['blob', 'blob_need3', 'get_shooter'], first: 'Box set, 3 inbounds, 2 is the shooter at the ball side elbow.' }, BB, [
  back('O2', 'O5', [310, 130], 'rim', [330, 100], '2 rips 5 to the rim.'),
  stagger('O4', 'O1', 'O2', [200, 130], [170, 190], 'lWing', [260, 160], '4 and 1 stagger. 2 exits off both to the wing.'), pass('O3', 'O2'), shot('O2')]);
bl('Davidson: Zoom to Rip', { notes: 'Davidson\'s zoom to rip: a pin down into a handoff up top, then a rip cut from under the basket for the layup.', tips: ['The zoom pulls the defense up. The rip comes underneath it.'], sits: ['blob', 'need2'], first: '1 under the rim, 2 at the elbow, 4 and 5 high, 3 inbounds.' }, { O3: 'inbMid', O1: [250, 85], O2: 'rElbow', O4: 'lElbow', O5: 'top' }, [
  pin('O4', 'O2', [330, 240], 'top', [300, 280], '4 pins for 2 up to 5.'), together(back('O4', 'O1', [230, 130], 'rLow', [200, 110], '4 drops and rips 1 across to the ball side block.'), mv({ O5: ['rWing', 'cut'] }, '5 pops to the wing with 2 behind.')),
  pass('O3', 'O1', 'Hit 1 on the rip.'), shot('O1')]);
bl('Iowa 4 Across: Elevator', { notes: 'Iowa\'s four across, need a three: the shooter over cuts to one corner, comes back up the middle, and the elevator closes behind him.', tips: ['Over cut hard enough that his man follows. Then turn.'], sits: ['blob', 'blob_need3', 'down3_last'], first: 'Four across the foul line, 3 inbounds, 2 is the shooter.' }, BF, [
  cut('O2', 'rCorner', null, '2 over cuts to the corner.'), mv({ O2: ['top', 'cut', [250, 150]], O4: [[225, 215], 'screen'], O5: [[275, 215], 'screen'] }, '2 turns and comes up the middle. 4 and 5 close the doors.'),
  pass('O3', 'O2'), shot('O2')]);
bl('Point Loma: Two Up', { notes: 'Point Loma\'s Two Up: the top two stagger for the shooter to the corner, the top screener chops down to free him a second time, and the big seals.', tips: ['Two Blind: if the corner is denied, the shooter back doors into a zoom.'], sits: ['blob', 'blob_need3'], reads: [{ when: 'they deny the corner', then: 'The shooter back doors and the ball goes to the big', frame: 1 }], first: '5 on the block, 4 and 2 above him, 1 at the top, 3 inbounds.' }, { O3: 'inbMid', O5: 'rBlock', O4: [310, 150], O2: [310, 200], O1: 'top' }, [
  stagger('O4', 'O1', 'O2', [340, 130], [370, 100], 'rCorner', [250, 180], '4 and 1 stagger. 2 runs to the corner.'), seal('O5', 'rLow'), pass('O3', 'O2'), shot('O2')]);
bl('America\'s Play', { notes: 'The shooter curls off a staggered double from the two bigs to the top for the catch and shoot. The last screener slips.', tips: ['Chased: curl it to the rim. Switched: the last screener slips.'], sits: ['blob', 'blob_need3', 'need3'], first: '1 on the weak block, 4 and 5 stacked on the ball side lane line, 2 at the top, 3 inbounds.' }, { O3: 'inbMid', O1: 'lBlock', O4: [300, 110], O5: [300, 160], O2: 'rWing' }, [
  stagger('O4', 'O5', 'O1', [290, 120], [300, 180], 'top', [250, 100], '1 runs under and off the stagger to the top.'), cut('O5', 'rim', null, '5 slips after the screen.'), pass('O3', 'O1'), shot('O1')]);
bl('Pittsburgh: Screen the Screener', { notes: 'The big screens for the shooter, then the guard screens the big, who pops or dives. The inbounder has the shooter or the big.', tips: ['Second screen is the money. Set it with your chest.'], sits: ['blob', 'need2', 'blob_need3'], first: 'Box set, 3 inbounds.' }, BB, [
  pin('O5', 'O2', [320, 150], 'rWing', [350, 120], '5 screens for 2 to the wing.'), back('O1', 'O5', [280, 200], 'rim', [320, 180], '1 screens 5. 5 dives to the rim.'),
  pass('O3', 'O5', 'Dive first, 2 second.'), shot('O5')]);
bl('Screen Away Safe', { notes: 'The elbows screen away for each other and the low men pop to the corners. A safe entry with four options and no lob to miss.', tips: ['When you just need it in with no turnover, this is the call.'], sits: ['blob', 'inb_safe', 'young_lineup'], first: 'Box set, 3 inbounds.' }, BB, [
  together(screen('O1', 'O2', [250, 190], 'lWing', [250, 220], '1 screens away for 2.'), mv({ O4: ['lCorner', 'cut'], O5: ['rCorner', 'cut'] }, 'Low men pop to the corners.')),
  pass('O3', 'O5'), cut('O3', 'rLow', null, '3 steps in. Run offense.')]);
bl('Zone BLOB: Splitter', { notes: 'Against a 2-3 from the baseline: two players split the low defenders, the big seals the middle man, the inbounder throws into the gap.', tips: ['Split the bottom two with your bodies, not your words.'], sits: ['blob_zone', 'vs_zone', 'blob'], d: Z23, first: 'Box against a 2-3, 3 inbounds.' }, BB, [
  mv({ O1: [[150, 110], 'cut'], O2: [[350, 110], 'cut'], O4: [[250, 110], 'cut'] }, '1 and 2 split outside the bottom men. 4 seals the middle.'), cut('O5', 'rCorner', null, '5 to the corner.'),
  pass('O3', 'O4', 'Into the gap.'), shot('O4')]);
bl('Zone BLOB: 23 Stack', { notes: 'A stack against the 2-3: the stack screens the low wing defender, the shooter pops to the corner, the big seals the middle.', tips: ['Screen the zone like a man. He has to go around.'], sits: ['blob_zone', 'vs_zone', 'blob_need3'], d: Z23, first: 'Stack against a 2-3, 3 inbounds.' }, BS, [
  mv({ O4: [[390, 120], 'screen'], O5: ['rCorner', 'cut', [340, 90]], O1: [[250, 100], 'cut'] }, '4 screens the low man. 5 pops to the corner. 1 seals the middle.'),
  pass('O3', 'O5', 'Corner, or 1 inside.'), shot('O5')]);
bl('Zone BLOB: Cross', { notes: 'Against a zone, the low players cross and screen the bottom defender so the shooter is open in the corner.', tips: ['Cross and screen. The crosser is the decoy.'], sits: ['blob_zone', 'vs_zone', 'blob_need3'], d: Z23, first: 'Box against a 2-3, 3 inbounds.' }, BB, [
  mv({ O4: [[390, 115], 'screen'], O5: ['lLow', 'cut', [250, 75]], O1: ['rCorner', 'cut', [330, 170]] }, '4 crosses and screens the bottom man. 5 goes the other way. 1 runs to the corner.'),
  pass('O3', 'O1'), shot('O1')]);
bl('Zone BLOB: Barcelona', { notes: 'Barcelona\'s zone BLOB: shooters pull the zone wide, the big screens the back line, and a cutter comes to the rim behind it.', tips: ['Wide first. The screen only works when the zone is stretched.'], sits: ['blob_zone', 'vs_zone', 'need2'], d: Z23, first: 'Spread against a 2-3, 3 inbounds.' }, { O3: 'inbMid', O1: 'lCorner', O2: 'rCorner', O4: 'ft', O5: [330, 120] }, [
  mv({ O5: [[400, 110], 'screen'], O4: ['rim', 'cut', [300, 150]] }, '5 screens the back line man. 4 cuts to the rim behind it.'), pass('O3', 'O4'), shot('O4')]);
/* ---- SLOBs ---- */
sl('Sideline Box 1', { notes: 'The sideline Box 1: the bigs screen down for the guards, the ball goes in to the wing, and the big back screens the point guard to the rim.', tips: ['Entry first, then the back screen.'], sits: ['slob', 'need2'], first: 'Sideline box, 3 inbounds from the left.' }, { O3: 'sideL', O1: [150, 200], O2: [230, 200], O4: [150, 110], O5: [230, 110] }, [
  together(pin('O4', 'O1', [140, 160], 'lWing', [110, 150], '4 screens down for 1.'), pin('O5', 'O2', [230, 160], 'top', [260, 150], '5 screens down for 2.')),
  pass('O3', 'O1'), back('O5', 'O2', [230, 250], 'rim', [200, 200], '5 back screens 2 to the rim.'), pass('O1', 'O2'), shot('O2')]);
sl('Sideline Triangle: Three', { notes: 'The guard screens for the wing to the corner, then the big screens the guard down to the top for the three. On the switch the big seals for the layup.', tips: ['Screen, then get screened. The second man is the shooter.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline triangle, 3 inbounds from the left.' }, { O3: 'sideL', O2: [160, 170], O1: [230, 230], O5: [250, 120], O4: 'rWing' }, [
  screen('O2', 'O1', [200, 220], 'lCorner', [140, 230], '2 screens for 1 to the corner.'), pin('O5', 'O2', [200, 180], 'top', [170, 160], '5 screens 2 to the top.'),
  seal('O5', 'lLow', '5 seals on the switch.'), pass('O3', 'O2', '2 for three, or 5.'), shot('O2')]);
sl('Sideline Circle', { notes: 'The shooter curls around the double from the bigs to the far wing while the point guard follows for the inbound. Then the bigs sprint to stagger for the shooter again.', tips: ['Circle, then stagger. Two screens for the same shooter, ten seconds apart.'], sits: ['slob', 'slob_need3'], first: 'Sideline out, 4 and 5 together at the elbow, 2 is the shooter under them, 3 inbounds from the left.' }, { O3: 'sideL', O4: [200, 190], O5: [240, 190], O2: [220, 130], O1: 'lSlot' }, [
  cut('O2', 'rWing', [250, 240], '2 circles around the double to the far wing.'), cut('O1', 'lWing', null, '1 comes to the ball.'), pass('O3', 'O1'),
  stagger('O4', 'O5', 'O2', [330, 200], [320, 260], 'top', [400, 240], '4 and 5 sprint to stagger for 2 coming to the top.'), pass('O1', 'O2'), shot('O2')]);
sl('Sideline Pairs', { notes: 'Pairs: the big screens for the shooter over the top, the inbounder hits him, then the shooter feeds the big posting the switch. The other pair screens for the safety.', tips: ['Screen over the top near half court, under if farther up.'], sits: ['slob', 'cov_switch_offball', 'post_entry'], first: 'Sideline out, 4 with 2 near the ball, 5 with 1 far, 3 inbounds from the left.' }, { O3: 'sideL', O4: [160, 230], O2: [160, 170], O5: [330, 230], O1: [330, 170] }, [
  together(screen('O4', 'O2', [150, 210], 'lWingHigh', [110, 180], '4 screens 2 to the wing.'), screen('O5', 'O1', [320, 210], 'top', [280, 180], '5 screens 1 to the top for safety.')),
  pass('O3', 'O2'), seal('O4', 'lLow', '4 posts the switch.'), pass('O2', 'O4'), shot('O4')]);
sl('Sideline Kansas', { notes: 'Kansas: the guard pops for the inbound and dribbles to the top, the shooter curls around the big\'s screen for the pass. Second time you run it, the shooter fakes the curl and back cuts.', tips: ['Run it twice. The second one is the layup.'], sits: ['slob', 'get_shooter', 'need3'], reads: [{ when: 'they jump the curl the second time', then: 'The shooter fakes the curl and back cuts for the layup', frame: 2 }], first: 'Sideline out, 3 inbounds from the left.' }, { O3: 'sideL', O1: [150, 250], O5: 'rBlock', O2: 'rCorner', O4: 'lBlock' }, [
  pass('O3', 'O1'), drib('O1', 'top', null, '1 dribbles to the top.'), screen('O5', 'O2', [430, 150], 'rWing', [470, 130], '2 curls around 5 to the wing.'), pass('O1', 'O2'), shot('O2', 'Shoot, or 5 rolls.')]);
sl('Sideline Celtics', { notes: 'The Celtics: the big screens down for the point guard who cuts to the top for the inbound, the big posts quick, then the guard fakes the handoff and drives.', tips: ['Fake the handoff with your eyes. Then go.'], sits: ['slob', 'need2', 'quick'], first: 'Sideline out, 3 inbounds from the left, 4 at the elbow, 1 on the block.' }, { O3: 'sideL', O4: 'lElbow', O1: 'lBlock', O5: 'rBlock', O2: 'rWing' }, [
  pin('O4', 'O1', [150, 160], 'top', [130, 120], '4 screens down. 1 cuts to the top.'), pass('O3', 'O1'), seal('O4', 'lLow', '4 posts quick.'),
  mv({ O3: [[120, 290], 'cut'], O1: ['rLane', 'dribble', [220, 300]] }, '3 steps in like a handoff is coming. 1 fakes it and drives.'), shot('O1')]);
sl('Sideline 35', { notes: 'The big screens for the wing, who drives or gets the lob. Simple two man sideline play.', tips: ['Screen the top shoulder. The driver turns the corner.'], sits: ['slob', 'need2', 'quick'], first: 'Sideline out, 3 inbounds from the left, 5 and 2 on the ball side.' }, { O3: 'sideL', O5: [160, 190], O2: [160, 250], O1: 'top', O4: 'rBlock' }, [
  pass('O3', 'O2'), pnr('O5', 'O2', [150, 230], 'lLane', 'rim'), shot('O2', 'Finish, or lob to 5.')]);
sl('Sideline Runner', { notes: 'The shooter sprints the baseline off two screens and pops to the ball side corner for the inbound pass.', tips: ['Runner: arrive as the inbounder\'s arm comes up.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline out from the left, 2 is the shooter in the far corner, 4 and 5 on the blocks.' }, { O3: 'sideL', O2: 'rCorner', O4: 'rBlock', O5: 'lBlock', O1: 'top' }, [
  mv({ O4: [[350, 90], 'screen'], O5: [[170, 90], 'screen'], O2: ['lCorner', 'cut', [250, 60]] }, '2 runs the baseline off 4 and 5 to the near corner.'), pass('O3', 'O2'), shot('O2')]);
sl('Side Out Flash', { notes: 'Xavier\'s Side Out Flash: inbound to the point, a guard ball screens him while the wing cuts through, then the screener comes off a double flare from the bigs.', tips: ['Ball screen, then run to the flare. The screener is the shooter.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline out from the left, 3 inbounds.' }, { O3: 'sideL', O1: [150, 250], O2: 'top', O4: 'rElbow', O5: 'rWing' }, [
  pass('O3', 'O1'), mv({ O2: [[200, 270], 'screen'], O1: [[260, 300], 'dribble'], O3: ['lWing', 'cut'] }, '2 ball screens 1. 3 steps in to the wing.'),
  dbl('O4', 'O5', 'O2', [330, 210], [380, 230], 'rWing', [280, 240], '2 comes off the double flare from 4 and 5.'), pass('O1', 'O2'), shot('O2')]);
sl('Sparks Winner 2.0', { notes: 'The Sparks\' Winner 2.0: a zipper for the point guard, then two flare screens send the big to the far baseline for the skip.', tips: ['The skip is a long pass. Throw it high and early.'], sits: ['slob', 'slob_need3'], first: 'Sideline out from the left, 1 on the block, 4 at the elbow.' }, { O3: 'sideL', O1: 'lBlock', O4: 'lElbow', O2: 'top', O5: 'rBlock' }, [
  pin('O4', 'O1', [150, 160], 'lSlot', [130, 120], '4 zippers 1 up.'), pass('O3', 'O1'),
  flare('O2', 'O4', [230, 200], 'rCorner', [300, 150], '2 flares 4 to the far corner.'), pass('O1', 'O4', 'Skip.'), shot('O4')]);
sl('Michigan State: Ball Screen Flare', { notes: 'Michigan State: the point guard zippers up for the inbound, a guard ball screens him, then that guard comes off a double flare from the bigs.', tips: ['The ball screener becomes the shooter. Sprint from the screen to the flare.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline out from the left, 1 on the block, bigs at the elbows.' }, { O3: 'sideL', O1: 'lBlock', O4: 'lElbow', O5: 'rElbow', O2: 'rWing' }, [
  pin('O4', 'O1', [150, 160], 'lSlot', [130, 120], '1 zippers up.'), pass('O3', 'O1'), mv({ O2: [[220, 300], 'screen'], O1: [[300, 320], 'dribble'] }, '2 ball screens 1.'),
  dbl('O4', 'O5', 'O2', [160, 210], [200, 180], 'lWing', [120, 260], '2 comes off the double flare from 4 and 5.'), pass('O1', 'O2'), shot('O2')]);
sl('Sideline Elevator', { notes: 'A decoy to the corner, then the shooter comes up through the elevator from the two bigs at the elbows.', tips: ['Decoy runs hard. The shooter waits one count, then goes.'], sits: ['slob', 'slob_need3', 'down3_last'], first: 'Sideline out from the left, 2 under the rim, bigs at the elbows.' }, { O3: 'sideL', O2: [250, 85], O4: 'lElbow', O5: 'rElbow', O1: 'lWing' }, [
  cut('O1', 'lCorner', null, '1 cuts to the corner as the decoy.'), mv({ O2: ['top', 'cut', [250, 150]], O4: [[225, 215], 'screen'], O5: [[275, 215], 'screen'] }, '2 runs through the elevator.'),
  pass('O3', 'O2'), shot('O2')]);
sl('Sideline Floppy', { notes: 'The Jazz\'s sideline into floppy: inbound to the top, and the shooter under the rim picks the single or the double.', tips: ['Shooter: read your man before the slap.'], sits: ['slob', 'get_shooter', 'need3'], first: 'Sideline out from the left, 1 at the top, 2 under the rim, bigs on the blocks.' }, { O3: 'sideL', O1: 'top', O2: [250, 85], O4: 'lBlock', O5: 'rBlock' }, [
  pass('O3', 'O1'), cut('O3', 'lWing', null, '3 steps in.'),
  together(screen('O5', 'O2', [330, 120], 'rWing', [330, 90], '5 sets the single. 2 takes it.'), mv({ O4: [[180, 120], 'screen'], O3: [[140, 170], 'screen'] }, '4 and 3 form the double.')),
  pass('O1', 'O2'), shot('O2')]);
sl('Golden State: Pin Down Stagger', { notes: 'The Warriors\' sideline: decoy action to the ball side, then a stagger pin for the shooter on the weak side and the skip.', tips: ['Sell the ball side. The skip is thrown before the shooter is open.'], sits: ['slob', 'slob_need3', 'need3'], first: 'Sideline out from the left, 2 is the shooter on the right block.' }, { O3: 'sideL', O1: 'lSlot', O2: 'rBlock', O4: 'rElbow', O5: 'lBlock' }, [
  pass('O3', 'O1'), cut('O5', 'lWing', null, '5 pops to the ball side as the decoy.'),
  stagger('O4', 'O3', 'O2', [400, 150], [410, 220], 'rWing', [450, 130], '4 and 3 stagger for 2 up the right side.'), pass('O1', 'O2', 'Skip.'), shot('O2')]);
sl('Sideline Zoom: Nuggets', { notes: 'The Nuggets\' SLOB zoom: inbound to the big at the elbow, a pin down for the shooter into a handoff, the big rolls.', tips: ['Big: catch at the elbow facing the sideline, hand it off going toward the middle.'], sits: ['slob', 'get_shooter', 'quick'], first: 'Sideline out from the left, 5 at the left elbow, 2 under the rim, 1 on the wing.' }, { O3: 'sideL', O5: 'lElbow', O2: [250, 85], O1: 'lWing', O4: 'rCorner' }, [
  pass('O3', 'O5'), pin('O1', 'O2', [120, 150], [150, 200], [180, 100], '1 pins down. 2 comes up to 5.'),
  dho('O5', 'O2', [170, 210], 'rLane', [130, 250]), cut('O5', 'rim', null, '5 rolls.'), shot('O2')]);
sl('Sideline Step Up', { notes: 'Inbound to the wing and the big steps up from the block to screen the baseline side. The wing drives baseline, the big rolls middle.', tips: ['Step up screen beats the ice. Go baseline with pace.'], sits: ['slob', 'cov_ice', 'need2'], first: 'Sideline out from the left, 1 on the wing, 5 on the block.' }, { O3: 'sideL', O1: 'lWing', O5: 'lBlock', O2: 'rCorner', O4: 'top' }, [
  pass('O3', 'O1'), cut('O3', 'lSlot', null, '3 steps in high.'), mv({ O5: [[80, 190], 'screen'], O1: ['lShort', 'dribble', [40, 170]] }, '5 steps up. 1 drives baseline.'), cut('O5', 'lLane', null, '5 rolls middle.'), shot('O1', 'Finish, or 5.')]);
sl('Sideline Box: Back Screen Lob', { notes: 'Inbound to the top, then the weak block back screens the elbow man for the lob at the rim. The screener pops.', tips: ['Lob to the square. The screener is the second look.'], sits: ['slob', 'need2', 'slob_need2'], first: 'Sideline box, 3 inbounds from the left.' }, SB, [
  pass('O3', 'O1'), back('O2', 'O5', [280, 140], 'rim', [310, 110], '2 back screens 5. 5 cuts to the rim.'), cut('O2', 'rWing', null, '2 pops.'), pass('O1', 'O5', 'Lob.'), shot('O5')]);
/* ---- Zone plays ---- */
zn('Zone 2-3: Short Corner Base', { notes: 'The base 1-3-1 attack on a 2-3: the big runs short corner to short corner, the wing feeds him, and the high post dives to the ball side block.', tips: ['Short corner catch, high post dives. Every time.'], sits: ['vs_zone', 'vs_23'], mirror: true, first: '1 point, wings a step inside the arc, 4 high post, 5 in the right short corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: 'rShort' }, [
  pass('O1', 'O2'), pass('O2', 'O5', 'Feed the short corner.'), cut('O4', 'rLow', null, '4 dives to the ball side block.'), pass('O5', 'O4'), shot('O4', 'Power layup, or 3 in the corner.')]);
zn('Zone: Runner Pin', { notes: 'The runner sprints the baseline and the post pins the low defender so the corner three is open. If the low man fights through, the post ducks in.', tips: ['Pin the bottom man with your chest. He has to go around you.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: '1 top, 2 and 3 wings, 5 on the right block, 4 is the runner in the left corner.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O5: 'rBlock', O4: 'lCorner' }, [
  pass('O1', 'O2'), mv({ O5: [[400, 115], 'screen'], O4: ['rCorner', 'cut', [250, 45]] }, '5 pins the bottom man. 4 runs the baseline to the corner.'),
  pass('O2', 'O4'), shot('O4', 'Corner three, or 5 ducks in.')]);
zn('Zone 2 Guard: 45 and 54', { notes: 'Two guards against the zone. Guard to wing, the high big flashes to the elbow and the low big steps to the short corner. High low, or short corner. Reverse and swap them.', tips: ['Bigs swap jobs on every reversal. The zone never knows which one is high.'], sits: ['vs_zone', 'vs_23', 'two_bigs'], first: 'Two guards, two wings, 4 and 5 low.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lBlock', O5: 'rBlock', }, [
  pass('O2', 'O3'), together(cut('O4', 'rElbow', [250, 160], '4 flashes to the elbow.'), cut('O5', 'rShort', null, '5 steps to the short corner.')),
  pass('O3', 'O4'), seal('O5', 'rLow', '5 steps in behind.'), pass('O4', 'O5', 'High low.'), shot('O5')]);
zn('Zone 2 Guard: Back', { notes: 'Guard to wing, and the weak post back screens the back line defender so the weak wing can cut to the rim for the skip or lob.', tips: ['Screen the back line man as the ball goes to the wing, not after.'], sits: ['vs_zone', 'vs_23', 'need2'], mirror: true, first: 'Two guards, wings, bigs on the blocks.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'lBlock' }, [
  pass('O2', 'O3'), mv({ O5: [[120, 110], 'screen'], O4: ['rim', 'cut', [120, 150]] }, '5 back screens the back line. 4 cuts to the rim.'), pass('O3', 'O4', 'Skip or lob.'), shot('O4')]);
zn('Zone 2 Guard: Middle Cut', { notes: 'Guard to wing, and the passing guard cuts through the middle of the zone to the weak corner. The overload is built and the skip is the shot.', tips: ['Cut through the middle slowly. Make the middle man watch you.'], sits: ['vs_zone', 'vs_23', 'vs_matchup'], mirror: true, first: 'Two guards, wings, 5 at the foul line.' }, Z2, [
  pass('O1', 'O3'), cut('O1', 'rCorner', [250, 150], '1 cuts through the middle to the far corner.'), pass('O3', 'O2'), pass('O2', 'O1', 'Skip to the overload corner.'), shot('O1')]);
zn('Zone 2 Guard: Flex Cut', { notes: 'Reverse guard to guard, and the corner flex cuts along the baseline off the low post screen to the ball side block. The screener steps to the short corner.', tips: ['Flex cut the zone like it is man. The low defender has to decide.'], sits: ['vs_zone', 'vs_23', 'post_entry'], mirror: true, first: 'Two guards, 3 in the left corner, 4 and 5 on the blocks.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lCorner', O4: 'lBlock', O5: 'rBlock' }, [
  pass('O1', 'O2'), cross('O5', 'O3', [330, 100], 'rLow', [250, 65], '5 screens on the baseline. 3 flex cuts to the ball side block.'), cut('O5', 'rShort', null, '5 steps to the short corner.'), pass('O2', 'O3'), shot('O3')]);
set('Zone 1-3-1: Play 4', 'Offense', { notes: 'Against the 1-3-1: pass to the corner, the corner drives baseline, and the big screens the middle defender so it is two on one at the rim.', tips: ['Corner catch, one dribble baseline, read the middle.'], sits: ['vs_zone', 'vs_131'], d: Z131, mirror: true, first: '2 runs to the right corner, 4 at the foul line, 5 on the weak block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: 'lBlock' }, [
  cut('O2', 'rCorner', null, '2 drops to the corner.'), pass('O1', 'O2'), mv({ O4: [[260, 110], 'screen'], O2: ['rShort', 'dribble'] }, '4 screens the middle man. 2 drives baseline.'), pass('O2', 'O5', 'Two on one: finish or drop to 5.'), shot('O5')]);
set('Zone 1-3-1: Play 45 Skip', 'Offense', { notes: 'Against the 1-3-1: the guard dribbles to draw the top man, hits the corner, the big cuts to the block, and if it is covered the skip goes to the far wing.', tips: ['Skip from the corner is the hardest pass in the game. Throw it high.'], sits: ['vs_zone', 'vs_131', 'need3'], d: Z131, first: 'Two guards, 3 and 4 on the blocks, 5 at the foul line.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'lBlock', O4: 'rBlock', O5: 'ft' }, [
  drib('O1', 'lWing', null, '1 dribbles to draw the top man.'), cut('O4', 'lCorner', [250, 50], '4 runs to the corner.'), pass('O1', 'O4'),
  cut('O5', 'lLow', null, '5 cuts to the ball side block.'), pass('O4', 'O2', 'Covered: skip to 2 on the far side.'), shot('O2')]);
set('Zone 1-3-1: Gold', 'Offense', { notes: 'Gold against the 1-3-1: two guards pass back and forth, the corner man sprints in to back screen the wing defender, the post occupies the baseline runner, and the far forward back cuts for the layup.', tips: ['The back screen on the zone wing is set as the ball goes back to the first guard.'], sits: ['vs_zone', 'vs_131', 'need2'], d: Z131, first: '1 and 3 handle, 2 in the right corner, 5 posting, 4 on the left wing.' }, { O1: 'lSlot', O3: 'rSlot', O2: 'rCorner', O5: 'rBlock', O4: 'lWing' }, [
  pass('O1', 'O3'), pass('O3', 'O1', 'Back to 1.'), mv({ O2: [[120, 190], 'screen'], O4: ['rim', 'cut', [100, 150]] }, '2 sprints in and back screens the wing defender. 4 back cuts.'), pass('O1', 'O4'), shot('O4')]);
zn('Zone: Carolina Reversal', { notes: 'Carolina: guard to wing, the weak guard screens the top defender, and the reversal three is open.', tips: ['Screen the top of the zone from behind. He never sees it.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: 'Two guards, wings, 5 on the block.' }, { O1: 'lSlot', O2: 'rSlot', O3: 'rWing', O4: 'lWing', O5: 'lBlock' }, [
  pass('O2', 'O3'), mv({ O2: [[200, 240], 'screen'], O1: ['top', 'cut'] }, '2 screens the top defender. 1 slides over the top.'), pass('O3', 'O1', 'Reverse.'), shot('O1')]);
zn('Zone: Indiana Corner', { notes: 'Indiana: wing entry, the high post screens the low wing defender, and the corner shooter is open. The post seals after.', tips: ['Screen the low wing from the inside. The corner opens behind him.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: '1 top, 2 right wing, 4 high post, 3 right corner, 5 left block.' }, { O1: 'top', O2: 'rWing', O4: 'ft', O3: 'rCorner', O5: 'lBlock' }, [
  pass('O1', 'O2'), mv({ O4: [[390, 120], 'screen'] }, '4 screens the low wing defender.'), pass('O2', 'O3'), seal('O4', 'rLow'), shot('O3', 'Corner three, or 4 on the seal.')]);
zn('Zone: X Screen Lob', { notes: 'The post X screens the middle defender and the weak wing cuts behind him for the lob. The screener seals.', tips: ['X screen the middle man as the ball swings. Timing is everything.'], sits: ['vs_zone', 'vs_23', 'need2'], mirror: true, first: '1 top, wings, 4 high post, 5 right block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'ft', O5: 'rBlock' }, [
  pass('O1', 'O2'), mv({ O5: [[265, 100], 'screen'], O3: ['rim', 'cut', [150, 130]] }, '5 X screens the middle man. 3 cuts behind him.'), pass('O2', 'O3', 'Lob.'), shot('O3')]);
zn('Zone: Special Down', { notes: 'Wing dribble, the post screens the back line, the shooter sprints to the corner. Special Down: if the low man comes out, the post dives.', tips: ['Shooter to the corner, post to the rim. One of them is open.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: '1 top, 2 right wing, 5 right block, 3 left wing, 4 left block.' }, { O1: 'top', O2: 'rWing', O5: 'rBlock', O3: 'lWing', O4: 'lBlock' }, [
  drib('O1', 'rSlot', null, '1 dribbles toward the wing.'), mv({ O5: [[400, 115], 'screen'], O2: ['rCorner', 'cut'] }, '5 screens the back line. 2 sprints to the corner.'),
  pass('O1', 'O2'), cut('O5', 'rim', null, '5 dives if the low man comes out.'), shot('O2', 'Corner three, or 5 on the dive.')]);
zn('Zone: Corners 52', { notes: 'Four out against the zone: the post flashes high and the guard drops to the corner, the wing hits the high post, who feeds the corner or the diving big.', tips: ['Exchange on the pass. The zone matches up a beat late.'], sits: ['vs_zone', 'vs_23'], mirror: true, first: 'Four out, 5 on the right block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rBlock' }, [
  pass('O1', 'O2'), together(cut('O5', 'rElbow', null, '5 flashes high.'), cut('O1', 'rCorner', [380, 270], '1 drops to the corner.')), pass('O2', 'O5'), pass('O5', 'O1', '5 hits the corner.'), shot('O1')]);
zn('Zone: Wing Flash High Low', { notes: 'Four out against the zone: wing entry, the weak wing flashes to the high post, and the big ducks in for the high low.', tips: ['Flash from the weak side. The zone is looking at the ball.'], sits: ['vs_zone', 'vs_23', 'post_entry'], mirror: true, first: 'Four out, 5 on the right block.' }, { O1: 'top', O2: 'rWing', O3: 'lWing', O4: 'lCorner', O5: 'rBlock' }, [
  pass('O1', 'O2'), cut('O3', 'ft', null, '3 flashes to the high post.'), pass('O2', 'O3'), seal('O5', 'rLow'), pass('O3', 'O5', 'High low.'), shot('O5')]);
zn('Zone: Fist Down', { notes: 'Michigan State\'s Fist Down: wing entry, the post screens the low man, the weak wing cuts to the short corner, and the post ducks in.', tips: ['Screen the low man, then duck in. You are the second option.'], sits: ['vs_zone', 'vs_23', 'vs_32'], mirror: true, first: '1 top, 2 right wing, 5 right block, 3 left wing, 4 high post.' }, { O1: 'top', O2: 'rWing', O5: 'rBlock', O3: 'lWing', O4: 'ft' }, [
  pass('O1', 'O2'), mv({ O5: [[400, 115], 'screen'], O3: ['rShort', 'cut', [250, 60]] }, '5 screens the low man. 3 cuts to the short corner.'), pass('O2', 'O3'), seal('O5', 'rLow', '5 ducks in.'), pass('O3', 'O5'), shot('O5')]);
zn('Zone: Kansas Flare', { notes: 'Kansas\' zone flare: wing entry, the post comes up and flares the top defender for the point guard, and the skip is the three.', tips: ['Flare the zone\'s top man. He is the only one who can close.'], sits: ['vs_zone', 'vs_23', 'need3'], mirror: true, first: '1 top, 2 right wing, 4 high post, 3 left corner, 5 left block.' }, { O1: 'top', O2: 'rWing', O4: 'ft', O3: 'lCorner', O5: 'lBlock' }, [
  pass('O1', 'O2'), flare('O4', 'O1', [190, 260], 'lWing', [230, 320], '4 flares 1 to the left wing.'), pass('O2', 'O1', 'Skip.'), shot('O1')]);
zn('Zone: Elevator Top', { notes: 'Elevator against the zone: the shooter comes up the middle and the bigs close the doors on the top defender.', tips: ['Close the doors on the zone man, not your own.'], sits: ['vs_zone', 'vs_23', 'need3'], first: '1 top, 2 under the rim, 4 and 5 at the elbows, 3 on the left wing.' }, { O1: 'top', O2: [250, 85], O4: 'lElbow', O5: 'rElbow', O3: 'lWing' }, [
  mv({ O1: ['rSlot', 'dribble'] }, '1 dribbles right to pull the top man.'), mv({ O2: ['lTop', 'cut', [250, 170]], O4: [[205, 230], 'screen'], O5: [[255, 230], 'screen'] }, '2 comes up through the doors to the top left.'), pass('O1', 'O2'), shot('O2')]);
zn('Zone: Double Stack Pop', { notes: 'Double stack low against the zone: the shooters pop from the stacks to the corners, the bigs seal the low defenders, and the wing entry finds the high low or the corner.', tips: ['Pop as a pair. The zone has to pick a corner.'], sits: ['vs_zone', 'vs_23', 'need3'], first: 'Double stack: 2 and 4 on the left block, 3 and 5 on the right block, 1 at the top.' }, { O1: 'top', O2: [180, 110], O4: [200, 85], O3: [320, 110], O5: [300, 85] }, [
  together(cut('O2', 'lCorner', null, '2 pops to the left corner.'), cut('O3', 'rCorner', null, '3 pops to the right corner.')), mv({ O4: [[120, 110], 'screen'], O5: [[380, 110], 'screen'] }, '4 and 5 seal the low men.'),
  pass('O1', 'O3'), shot('O3', 'Corner three, or 5 on the seal.')]);
/* ---- Press breaks ---- */
pb('Press Break: 1-4 Across', { notes: 'The 1-4 across: wings break to the sidelines, middles to the elbows. Inbound to a sideline, the ball side middle flashes to the middle, the far middle goes long.', tips: ['Against a trap on the catch, reverse it through the inbounder.'], sits: ['press_break', 'vs_press', 'vs_zone_press', 'vs_man_press'], first: '4 inbounds, four across the foul line extended.' }, { O4: 'inb', O1: [120, 700], O2: [210, 700], O5: [290, 700], O3: [380, 700] }, [
  mv({ O1: [[60, 720], 'cut'], O3: [[440, 720], 'cut'], O2: [[200, 660], 'cut'], O5: [[300, 660], 'cut'] }, 'Wings to the sidelines, middles to the elbows.'),
  pass('O4', 'O3'), together(cut('O5', [300, 580], null, '5 flashes to the middle.'), cut('O2', 'half', null, '2 goes long.')), pass('O3', 'O5'), drib('O5', 'centerLow', null, '5 attacks.')]);
pb('Press Break: 1-4 Loops', { notes: '1-4 Loops: the bigs stagger for the point guard who loops over the top to the strong side for the inbound, then the bigs cut to the ball.', tips: ['Loop over the top of both screens. Arrive at full speed.'], sits: ['press_break', 'vs_man_press'], first: '4 inbounds. 1 on the weak side, 2 and 5 stacked in the middle.' }, { O4: 'inb', O1: [120, 680], O2: [250, 700], O5: [250, 650], O3: 'half' }, [
  stagger('O2', 'O5', 'O1', [230, 690], [250, 640], [400, 720], [200, 620], '2 and 5 stagger. 1 loops over the top to the strong side.'), pass('O4', 'O1'),
  mv({ O2: [[200, 740], 'cut'], O5: [[300, 600], 'cut'] }, '2 and 5 cut to the ball after screening.'), pass('O1', 'O5'), drib('O5', 'centerLow', null, '5 pushes.')]);
pb('Press Break: 1-4 Break', { notes: '1-4 Break: three sprint toward the baseline to pull their defenders, the inbound goes to the big, then a guard down screens the other guard who streaks long.', tips: ['Against a man press that gambles, the streak is a layup.'], sits: ['press_break', 'vs_man_press', 'after_made'], first: '4 inbounds. 1 and 2 at the elbows, 5 and 3 at half court.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: [200, 440], O3: [300, 440] }, [
  mv({ O1: [[120, 760], 'cut'], O5: [[380, 700], 'cut'], O3: [[250, 560], 'cut'] }, '1, 5 and 3 break toward the ball.'), pass('O4', 'O5'),
  pin('O2', 'O1', [160, 700], 'upFt', [100, 620], '2 screens down for 1. 1 streaks the length of the floor.'), pass('O5', 'O1', 'Long pass.'), shot('O1')]);
pb('Press Break: Loyola Slips', { notes: 'Loyola Slips: the guards screen up for the big, who rejects it and cuts weak side, the other big sprints to the center, and both guards slip to the ball.', tips: ['Slip the moment they switch the up screens.'], sits: ['press_break', 'cov_switch', 'vs_press'], first: '4 inbounds. 1 and 2 at the elbows, 5 and 3 at half court.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: [250, 520], O3: [120, 440] }, [
  mv({ O1: [[200, 600], 'screen'], O2: [[300, 600], 'screen'], O5: [[400, 620], 'cut'] }, '1 and 2 screen up for 5. 5 rejects and cuts weak side.'),
  together(cut('O3', 'centerLow', null, '3 sprints to the center.'), mv({ O1: [[150, 740], 'cut'], O2: [[350, 740], 'cut'] }, '1 and 2 slip to the ball.')), pass('O4', 'O2'), pass('O2', 'O3'), drib('O3', 'half', null, '3 pushes.')]);
pb('Press Break: Middle Go', { notes: 'Middle Go: the bigs sprint toward the baseline to pull their men, a guard screens the other guard to the baseline, then the screener sprints long for the pass over the top.', tips: ['Screen, then go. The go is the play.'], sits: ['press_break', 'vs_man_press', 'down_big'], first: '4 inbounds. 1 and 2 at the elbows, 5 and 3 at half court.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: [200, 440], O3: [300, 440] }, [
  mv({ O5: [[150, 620], 'cut'], O3: [[350, 620], 'cut'] }, '5 and 3 sprint toward the ball to pull their men.'), screen('O2', 'O1', [230, 690], [350, 760], [150, 720], '2 screens for 1 flashing to the baseline.'),
  cut('O2', 'upFt', null, '2 sprints long.'), pass('O4', 'O2', 'Over the top.'), shot('O2')]);
pb('Press Break: Diamond X Go', { notes: 'Diamond X Go: the two guards sprint at the big in the middle and cross to the corners, the other big sprints down, and the middle big goes long.', tips: ['Cross at the big\'s hips. The defense collides.'], sits: ['press_break', 'vs_press'], first: '4 inbounds. 5 at the foul line, 1 and 2 wide, 3 deep.' }, { O4: 'inb', O5: 'ftLow', O1: [110, 560], O2: [390, 560], O3: 'half' }, [
  mv({ O1: [[380, 740], 'cut', [260, 640]], O2: [[120, 740], 'cut', [240, 640]], O3: [[250, 560], 'cut'] }, '1 and 2 sprint at 5 and cross to the corners. 3 sprints down.'),
  cut('O5', 'upFt', null, '5 goes long.'), pass('O4', 'O1', 'Corner, or 5 long.'), drib('O1', 'halfR', null, '1 pushes up the sideline.')]);
pb('Press Break: Diamond Scissors', { notes: 'Diamond Scissors: the big screens the first guard over the top to the strong wing, then if denied screens the second guard to the other wing, and dives to the foul line himself.', tips: ['Three options off one screener: strong wing, weak wing, screener.'], sits: ['press_break', 'vs_press', 'vs_deny'], first: '4 inbounds. 5 at the foul line, 1 and 2 behind him, 3 deep.' }, { O4: 'inb', O5: 'ftLow', O1: [200, 600], O2: [300, 600], O3: 'half' }, [
  screen('O5', 'O1', [240, 650], [400, 720], [160, 680], '5 screens 1 over the top to the strong wing.'),
  screen('O5', 'O2', [260, 650], [100, 720], [340, 680], 'Denied: 5 screens 2 to the other wing.'), cut('O5', [250, 720], null, '5 dives to the foul line.'), pass('O4', 'O2', 'Hit 2, or 5.'), drib('O2', 'halfL', null, '2 pushes.')]);
pb('Press Break: Baseline Boomerang', { notes: 'After a made basket: the guard cuts out of bounds along the baseline to take the inbound, the inbounder steps in for the pass back, and the ball is in the middle of the floor before they set.', tips: ['The cutter must be fully out of bounds. Legal only after a made basket.'], sits: ['press_break', 'after_made', 'vs_man_press'], first: 'After their make. 4 takes it out. 1 and 2 stacked above the foul line.' }, { O4: 'inb', O1: [250, 640], O2: [250, 600], O5: 'half', O3: 'highL' }, [
  cut('O1', [120, 865], [150, 760], '1 runs out of bounds along the baseline.'), pass('O4', 'O1', 'Pass along the baseline.'), cut('O4', [250, 760], null, '4 steps in.'), pass('O1', 'O4', 'Back to 4 in the middle.'), drib('O4', 'centerLow', null, '4 pushes.')]);
pb('Press Break: Box Screen the Screener', { notes: 'A box press break: a guard diagonal screens the other guard to the wing, then the big screens the first guard to the strong wing and dives to the center as the safety.', tips: ['Diagonal screens in the back court are deadly. Nobody expects them.'], sits: ['press_break', 'vs_man_press'], first: '4 inbounds. 1 and 2 at the elbows, 5 and 3 at half court.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: [200, 440], O3: [300, 440] }, [
  screen('O1', 'O2', [260, 680], [120, 720], [340, 700], '1 diagonal screens 2 to the wing.'), screen('O5', 'O1', [220, 640], [400, 720], [160, 620], '5 screens 1 to the strong wing.'),
  cut('O5', 'centerLow', null, '5 dives to the center.'), pass('O4', 'O1'), pass('O1', 'O5'), drib('O5', 'half', null, '5 pushes.')]);
pb('Press Break: 2 Up Cross', { notes: 'Two up at the elbows, two deep. The guards cross at the elbows, the inbound goes to the open one, the other goes to the middle, the bigs stay deep as outlets.', tips: ['Cross tight. The defenders have to switch or collide.'], sits: ['press_break', 'vs_man_press', 'vs_pressure'], first: '4 inbounds. 1 and 2 at the elbows, 5 and 3 deep.' }, { O4: 'inb', O1: [180, 660], O2: [320, 660], O5: 'hashL', O3: 'hashR' }, [
  mv({ O1: [[380, 720], 'cut', [250, 680]], O2: [[120, 720], 'cut', [250, 660]] }, '1 and 2 cross at the elbows.'), pass('O4', 'O1'), cut('O2', [250, 600], null, '2 goes to the middle.'), pass('O1', 'O2'), drib('O2', 'centerLow', null, '2 pushes.')]);

/* ---- packs for the named set families (built from key prefixes, right side only) ---- */
const byPrefix = (pre, max) => PLAYS.filter((p) => p.key.startsWith(pre) && p.side !== 'left').map((p) => p.key).slice(0, max || 12);
PACKS.push(
  { key: 'horns-pro', name: 'Horns, the pro catalog', blurb: 'Fourteen Horns sets the way the NBA and college run them: Chest, Down, Out, Flex, Rip, Spain, Zoom Pin, Fire, Circle, Duck In, Wall, Brush and more.', plays: byPrefix('horns-', 14) },
  { key: 'elbow-delay', name: 'Elbow and Delay series', blurb: 'The five out big at the elbow or the top: Chicago, Zoom, Get, Chin, Ghost, Snug, Double Drag, the handback flare.', plays: byPrefix('elbow-', 8).concat(byPrefix('delay-', 8)) },
  { key: 'zipper-floppy', name: 'Zipper and Floppy', blurb: 'Twelve ways to get a shooter open off the lane line: zipper cuts, single double, curl and dive, elevator.', plays: byPrefix('zipper-', 6).concat(byPrefix('floppy-', 6)) },
  { key: 'pistol-drag', name: 'Pistol, drag and ball screen specials', blurb: 'Early offense before the defense sets: 21, Fan, Flip, Spain, Step Up, Angle, Veer, Gortat, Twirl, Ram, Wedge, 77.', plays: byPrefix('pistol-', 6).concat(byPrefix('drag-', 10)) },
  { key: 'princeton-triangle', name: 'Princeton and Triangle', blurb: 'Point Over, Under and Away, Low, Twirl, Chin, the sideline triangle, blind pig, pinch post, solo cut.', plays: byPrefix('princeton-', 6).concat(byPrefix('triangle-', 4)) },
  { key: 'continuity', name: 'Continuity offenses', blurb: 'Flex, Swing, Shuffle, Wheel, Motion Strong, dribble drive and the Euro ball screen continuity.', plays: ['flex-reversal', 'swing-ucla-reversal', 'shuffle-cut', 'wheel-curl-chain', 'motion-strong-cross-and-down', 'dribble-drive-kick-back', 'dribble-drive-drag-zone-kick', 'euro-ball-screen-continuity'] },
  { key: 'secondary-break', name: 'Secondary break', blurb: 'Carolina, pitch ahead drag, rim run seal, trailer three, Miami, boomerang, corner exit, early hammer, flip, stagger away, drag into Spain.', plays: byPrefix('secondary-', 12).concat(byPrefix('transition-', 4)) },
  { key: 'blob-pro', name: 'Baseline out, the pro catalog', blurb: 'Box 1 and 2, Gator, Box 54, Around, Wide, VanDerveer, Stack 2, Wheel, 3 Down, Pinball, Baylor Triple, Dallas, 13, Hokie, Heat, Pacers, Mercury, Davidson, Iowa, Point Loma.', plays: ['box-1-down-and-back', 'box-2-shooter-off-the-stagger', 'box-gator', 'box-54-cross-and-seal', 'box-around', 'box-wide-inbounder-three', 'vanderveer-box-1', 'vanderveer-box-2', 'stack-2-sideline-runner', 'wheel-around-the-stack', '3-down-back-screen', 'pinball', 'baylor-triple', 'dallas', '13-double-to-the-wing', 'hokie-two-man-game', 'heat-rip-screen-the-screener', 'pacers-exit-rip', 'mercury-rip-double-exit', 'davidson-zoom-to-rip', 'iowa-4-across-elevator', 'point-loma-two-up', 'america-s-play', 'pittsburgh-screen-the-screener'] },
  { key: 'blob-zone', name: 'Baseline out against a zone', blurb: 'Splitter, 23 Stack, Cross, Barcelona, Line, Pinball: six ways in when they sit in a zone under their own basket.', plays: ['zone-blob-splitter', 'zone-blob-23-stack', 'zone-blob-cross', 'zone-blob-barcelona', 'zone-blob-line', 'pinball'] },
  { key: 'slob-pro', name: 'Sideline out, the pro catalog', blurb: 'Box 1, Triangle, Circle, Pairs, Kansas, Celtics, 35, Runner, Side Out Flash, Sparks, Michigan State, Elevator, Floppy, Golden State, Nuggets Zoom, Step Up.', plays: byPrefix('sideline-', 24).concat(['side-out-flash', 'sparks-winner-2-0', 'michigan-state-ball-screen-flare', 'golden-state-pin-down-stagger']) },
  { key: 'zone-pro', name: 'Zone offense, the catalog', blurb: 'Short corner base, Runner Pin, 45 and 54, Back, Middle Cut, Flex Cut, 1-3-1 Play 4, 45 Skip and Gold, Carolina, Indiana, X Screen Lob, Special Down, Corners 52, Fist Down, Kansas Flare, Elevator, Double Stack.', plays: byPrefix('zone-', 30) },
  { key: 'press-break-kit', name: 'Press break kit', blurb: 'Every press break in the book: 1-4 Across, Loops, Break, Loyola Slips, Middle Go, Diamond X Go and Scissors, Baseline Boomerang, Box STS, 2 Up, 2-1-2, Line, Long Pass, Big Back.', plays: byPrefix('press-break-', 20) },
  { key: 'buzzer', name: 'Full court and buzzer beaters', blurb: 'Maryland, Duke, Hail Mary, catch and timeout, the last second heave, Tap Head Special, Brush Clear, Celtics Winner.', plays: ['full-court-maryland', 'full-court-duke', 'full-court-hail-mary', 'full-court-catch-and-timeout', 'last-second-heave', 'late-tap-head-special', 'late-brush-clear', 'box-celtics-winner'] },
  { key: 'dead-balls', name: 'Dead balls and personnel', blurb: 'Their free throw push, the block out, held ball, after a technical, first possession, start of the half, no point guard, five shooters, two bigs, the mismatch, the hot hand, stop the run.', plays: ['dead-ball-their-free-throw-push', 'dead-ball-free-throw-block-out', 'dead-ball-held-ball-arrow-ours', 'dead-ball-after-a-technical', 'first-possession-simple-horns', 'start-of-half-post-touch', 'personnel-no-point-guard', 'personnel-five-shooters', 'personnel-two-bigs-high-low', 'personnel-attack-the-mismatch', 'personnel-hot-hand-iso', 'stop-the-run-slow-it-down', 'late-start-of-overtime-tip'] }
);

/* ---- suggested sideline calls: the word a coach yells for the family, unless a recipe names its own ---- */
const CALLS = [['horns-flare', 'Fist'], ['horns-', 'Horns'], ['elbow-', 'Elbow'], ['delay-', 'Delay'], ['zipper-', 'Zip'], ['floppy-', 'Floppy'], ['pistol-', '21'], ['spain-', 'Spain'], ['drag-77', '77'], ['drag-', 'Drag'], ['zoom-', 'Zoom'], ['iverson-', 'AI'], ['hawk-', 'Hawk'], ['loop-', 'Loop'], ['ucla-', 'UCLA'], ['stack-', 'Stack'], ['diamond-', 'Diamond'], ['1-4-high-', 'High'], ['box-', 'Box'], ['princeton-', 'Chin'], ['triangle-', 'Triangle'], ['flex', 'Flex'], ['swing-', 'Swing'], ['shuffle-', 'Shuffle'], ['wheel-', 'Wheel'], ['motion-', 'Motion'], ['dribble-drive-', 'Drive'], ['euro-', 'Euro'], ['secondary-', 'Go'], ['five-out', 'Five'], ['four-out', 'Four'], ['chicago', 'Chicago'], ['hammer', 'Hammer'], ['elevator', 'Doors'], ['ram-', 'Ram'], ['wedge', 'Wedge'], ['line-', 'Line'], ['zone-', 'Zone'], ['press-break-', 'Break'], ['sideline-', 'Side'], ['full-court-', 'Long']];
for (const p of PLAYS) { if (p.call) continue; const hit = CALLS.find(([pre]) => p.key.startsWith(pre)); if (hit) p.call = hit[1]; }

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
  if (!rs || (p.reads && p.reads.length)) continue;
  p.reads = rs.map((r) => ({ when: p.side === 'left' ? swapLR(r.when) : r.when, then: p.side === 'left' ? swapLR(r.then) : r.then, frame: Math.min(r.frame, p.frames.length - 1) }));
}
for (const k of Object.keys(READS)) if (!PLAYS.find((p) => p.key === k)) throw new Error('reads name unknown play ' + k);

/* ---------- validate and write ---------- */
const keys = new Set();
const out = [];
for (const p of PLAYS) {
  if (keys.has(p.key)) throw new Error('duplicate key ' + p.key);
  keys.add(p.key);
  const r = cleanPlay({ ...p, visible: true, signal: { call: p.call || '', photo: '' } });
  if (r.error) throw new Error(p.name + ': ' + r.error);
  const clean = r.play;
  // keep what the editor saves, plus the library key and side
  out.push({ key: p.key, side: p.side, name: clean.name, category: clean.category, court: clean.court, notes: clean.notes, tips: clean.tips, situations: clean.situations, reads: clean.reads, call: (clean.signal && clean.signal.call) || '', frames: clean.frames, steps: clean.frames.length - 1 });
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
