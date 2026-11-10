/* Aces Team Playbook: court drawing + play animation, shared by the player viewer and the
   coach's drawing board. Plain script, exposes window.PBCourt.

   A play is a list of frames. frames[0] is the setup; frames[i] is where everyone is after
   action i. Action i is animated from frames[i-1] to frames[i]. Units are tenths of a foot,
   high school court: half court 500 x 420, full court 500 x 840, basket at the top. */
(function () {
  var M = 50;                                   // out of bounds margin drawn around the court
  var C = { mrn: '#840036', ink: '#1b1b22', def: '#1d3b72', opp: '#33333d', gold: '#c9a44a', floor: '#f3e4c4', floor2: '#e9d6ae', edge: '#d8c094', ball: '#e8712a' };
  var OFF = ['O1', 'O2', 'O3', 'O4', 'O5'], DEF = ['X1', 'X2', 'X3', 'X4', 'X5'], ALL = OFF.concat(DEF);
  var R = 17;                                   // token radius

  function dims(court) { var h = court === 'full' ? 840 : 420; return { w: 500, h: h, m: M, vb: (-M) + ' ' + (-M) + ' ' + (500 + 2 * M) + ' ' + (h + 2 * M) }; }
  function rims(court) { return court === 'full' ? [[250, 52.5], [250, 787.5]] : [[250, 52.5]]; }
  function nearestRim(court, p) { var rs = rims(court); if (!p) return rs[0]; return rs.reduce(function (b, r) { return dist(r, p) < dist(b, p) ? r : b; }); }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function f1(n) { return Math.round(n * 10) / 10; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function isDef(id) { return id.charAt(0) === 'X'; }

  /* ── court ───────────────────────────────────────────────────────────── */
  function halfLines() {
    var s = '';
    s += '<rect x="190" y="0" width="120" height="190" fill="' + C.mrn + '" fill-opacity=".13"/>';
    s += '<g fill="none" stroke="' + C.mrn + '" stroke-width="2.6" stroke-linecap="round">';
    s += '<rect x="190" y="0" width="120" height="190"/>';
    s += '<path d="M190 190 A60 60 0 0 0 310 190"/>';
    s += '<path d="M190 190 A60 60 0 0 1 310 190" stroke-dasharray="9 8"/>';
    s += '<path d="M52.5 0 L52.5 52.5 A197.5 197.5 0 0 0 447.5 52.5 L447.5 0"/>';
    [70, 110, 140, 170].forEach(function (y, i) { var w = i ? 8 : 10; s += '<path d="M190 ' + y + ' h-' + w + ' M310 ' + y + ' h' + w + '"/>'; });
    s += '</g>';
    s += '<path d="M220 40 H280" stroke="' + C.ink + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M250 40 V45" stroke="' + C.ink + '" stroke-width="2"/>';
    s += '<circle cx="250" cy="52.5" r="7.5" fill="none" stroke="' + C.ball + '" stroke-width="2.6"/>';
    return s;
  }
  function courtSVG(court) {
    var d = dims(court), s = '';
    s += '<rect x="' + (-M) + '" y="' + (-M) + '" width="' + (d.w + 2 * M) + '" height="' + (d.h + 2 * M) + '" fill="' + C.edge + '"/>';
    s += '<rect x="0" y="0" width="500" height="' + d.h + '" fill="' + C.floor + '"/>';
    for (var x = 25; x < 500; x += 25) s += '<path d="M' + x + ' 0 V' + d.h + '" stroke="' + C.floor2 + '" stroke-width="1"/>';
    s += halfLines();
    if (court === 'full') {
      s += '<g transform="translate(0 840) scale(1 -1)">' + halfLines() + '</g>';
      s += '<g fill="none" stroke="' + C.mrn + '" stroke-width="2.6"><path d="M0 420 H500"/><circle cx="250" cy="420" r="60"/></g>';
      s += '<circle cx="250" cy="420" r="20" fill="' + C.mrn + '" fill-opacity=".15"/>';
    } else {
      s += '<path d="M190 420 A60 60 0 0 1 310 420" fill="' + C.mrn + '" fill-opacity=".1" stroke="' + C.mrn + '" stroke-width="2.6"/>';
    }
    s += '<rect x="0" y="0" width="500" height="' + d.h + '" fill="none" stroke="' + C.mrn + '" stroke-width="3"/>';
    return s;
  }

  /* ── play geometry ───────────────────────────────────────────────────── */
  function frame(play, i) { return (play.frames && play.frames[i]) || { pos: {}, moves: {}, ball: '' }; }
  // Everything that happens in action i (frames[i-1] → frames[i]).
  function action(play, i) {
    var A = frame(play, i - 1), B = frame(play, i), moves = [];
    ALL.forEach(function (id) {
      var a = A.pos[id], b = B.pos[id];
      if (!a || !b || dist(a, b) < 3) return;
      var mv = (B.moves && B.moves[id]) || {};
      moves.push({ id: id, a: a, b: b, c: mv.c || lerp(a, b, 0.5), curved: !!mv.c, t: mv.t || 'cut' });
    });
    var from = A.ball || '', to = B.ball || '', ball = null;
    if (from !== to) {
      if (from && from !== 'rim' && to && to !== 'rim') ball = { kind: 'pass', from: from, to: to };
      else if (from && from !== 'rim' && to === 'rim') ball = { kind: 'shot', from: from };
      else if (from === 'rim' && to) ball = { kind: 'rebound', to: to };
    }
    var both = !!(ball && moves.length), pf = !!B.passFirst;
    return {
      moves: moves, ball: ball, passFirst: pf,
      win: both ? (pf ? { ball: [0, 0.4], moves: [0.3, 1] } : { moves: [0, 0.66], ball: [0.6, 1] }) : { ball: [0, 1], moves: [0, 1] }
    };
  }
  function duration(play, i) { var a = action(play, i); return (a.ball && a.moves.length ? 2100 : 1500); }
  function bez(m, t) { var u = 1 - t; return [u * u * m.a[0] + 2 * u * t * m.c[0] + t * t * m.b[0], u * u * m.a[1] + 2 * u * t * m.c[1] + t * t * m.b[1]]; }
  // Where every token and the ball are at time t (0..1) of action i.
  function stateAt(play, i, t) {
    var A = frame(play, i - 1), B = frame(play, i), act = action(play, i), pos = {};
    var tm = ease(clamp01((t - act.win.moves[0]) / (act.win.moves[1] - act.win.moves[0])));
    ALL.forEach(function (id) { if (A.pos[id] && B.pos[id]) pos[id] = A.pos[id]; else if (B.pos[id] && t >= 1) pos[id] = B.pos[id]; else if (A.pos[id] && t < 1) pos[id] = A.pos[id]; });
    act.moves.forEach(function (m) { pos[m.id] = bez(m, tm); });
    var ball = null, scale = 1, court = play.court;
    var tb = clamp01((t - act.win.ball[0]) / (act.win.ball[1] - act.win.ball[0]));
    var held = function (id) { if (id === 'rim') return nearestRim(court, pos[A.ball] || null); return pos[id] ? [pos[id][0] + 13, pos[id][1] - 13] : null; };
    if (!act.ball) ball = held(B.ball || A.ball);
    else if (tb <= 0) ball = act.ball.kind === 'rebound' ? nearestRim(court, pos[act.ball.to]) : held(act.ball.from);
    else if (tb >= 1) ball = act.ball.kind === 'shot' ? nearestRim(court, pos[act.ball.from]) : held(act.ball.to);
    else {
      var e = ease(tb);
      if (act.ball.kind === 'pass') ball = lerp(held(act.ball.from), held(act.ball.to), e);
      else if (act.ball.kind === 'shot') { ball = lerp(held(act.ball.from), nearestRim(court, pos[act.ball.from]), e); scale = 1 + Math.sin(Math.PI * e) * 0.9; }
      else ball = lerp(nearestRim(court, pos[act.ball.to]), held(act.ball.to), e);
    }
    return { pos: pos, ball: ball, scale: scale };
  }
  function stillState(play, i) {   // tokens at frame i, ball with its holder
    var F = frame(play, i), pos = {};
    ALL.forEach(function (id) { if (F.pos[id]) pos[id] = F.pos[id]; });
    var ball = null;
    if (F.ball === 'rim') { var prev = frame(play, i - 1); ball = nearestRim(play.court, prev.pos[prev.ball] || null); }
    else if (F.ball && pos[F.ball]) ball = [pos[F.ball][0] + 13, pos[F.ball][1] - 13];
    return { pos: pos, ball: ball, scale: 1 };
  }

  /* ── drawing ─────────────────────────────────────────────────────────── */
  function head(tip, from, color, size) {
    var dx = tip[0] - from[0], dy = tip[1] - from[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, s = size || 13;
    var bx = tip[0] - ux * s, by = tip[1] - uy * s;
    return '<path d="M' + f1(tip[0]) + ' ' + f1(tip[1]) + ' L' + f1(bx - uy * s * 0.55) + ' ' + f1(by + ux * s * 0.55) + ' L' + f1(bx + uy * s * 0.55) + ' ' + f1(by - ux * s * 0.55) + 'Z" fill="' + color + '"/>';
  }
  function curvePts(m, n) { var out = []; for (var k = 0; k <= n; k++) out.push(bez(m, k / n)); return out; }
  function trimStart(m) {   // start the line at the token's edge, not its center
    var pts = curvePts(m, 80), k = 0; while (k < pts.length - 2 && dist(pts[k], m.a) < R + 3) k++; return pts.slice(k);
  }
  function trimEnd(pts, d) {  // stop the line short of the tip so it doesn't poke through the arrowhead
    var end = pts[pts.length - 1], k = pts.length - 1;
    while (k > 0 && dist(pts[k], end) < d) k--;
    return pts.slice(0, k + 1);
  }
  function moveSVG(m, scout) {
    var color = isDef(m.id) ? (scout ? C.mrn : C.def) : (scout ? C.opp : C.ink), w = isDef(m.id) ? 2.6 : 3, pts = trimStart(m), s = '';
    if (pts.length < 3) return '';
    var end = pts[pts.length - 1], pre = pts[pts.length - 3];
    var line = function (P) { return 'M' + P.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L'); };
    if (m.t === 'dribble') {
      var zz = [pts[0]], acc = 0, side = 1, total = 0, run = 0;
      for (var k = 1; k < pts.length; k++) total += dist(pts[k], pts[k - 1]);
      for (k = 1; k < pts.length; k++) {
        var d = dist(pts[k], pts[k - 1]); run += d; acc += d;
        if (acc >= 13 && run < total - 24) {
          acc = 0; var dx = pts[k][0] - pts[k - 1][0], dy = pts[k][1] - pts[k - 1][1], L = Math.hypot(dx, dy) || 1;
          zz.push([pts[k][0] - dy / L * 7 * side, pts[k][1] + dx / L * 7 * side]); side = -side;
        }
      }
      zz.push(trimEnd(pts, 8).pop());
      s += '<path d="' + line(zz) + '" fill="none" stroke="' + color + '" stroke-width="' + (w - 0.4) + '" stroke-linejoin="round" stroke-linecap="round"/>';
      s += head(end, pre, color);
    } else if (m.t === 'screen') {
      s += '<path d="' + line(pts) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"/>';
      var dx2 = end[0] - pre[0], dy2 = end[1] - pre[1], L2 = Math.hypot(dx2, dy2) || 1, nx = -dy2 / L2 * 14, ny = dx2 / L2 * 14;
      s += '<path d="M' + f1(end[0] + nx) + ' ' + f1(end[1] + ny) + ' L' + f1(end[0] - nx) + ' ' + f1(end[1] - ny) + '" stroke="' + color + '" stroke-width="' + (w + 1.4) + '" stroke-linecap="round"/>';
    } else {
      var body = trimEnd(pts, 8);
      s += '<path d="' + line(body) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s += head(end, pre, color);
    }
    return s;
  }
  function ballLineSVG(play, i, act) {
    var b = act.ball; if (!b) return '';
    var A = frame(play, i - 1), B = frame(play, i);
    var at = act.passFirst || !act.moves.length ? A.pos : B.pos;   // where people are when the ball moves
    var p1, p2, color = C.ink;
    if (b.kind === 'pass') { p1 = at[b.from] || A.pos[b.from]; p2 = at[b.to] || B.pos[b.to]; }
    else if (b.kind === 'shot') { p1 = at[b.from] || A.pos[b.from]; p2 = nearestRim(play.court, p1); color = C.ball; }
    else { p2 = B.pos[b.to]; p1 = nearestRim(play.court, p2); color = C.ball; }
    if (!p1 || !p2 || dist(p1, p2) < 2 * R + 6) return '';
    var dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    var s1 = [p1[0] + ux * (R + 4), p1[1] + uy * (R + 4)], e1 = b.kind === 'shot' ? [p2[0] - ux * 10, p2[1] - uy * 10] : [p2[0] - ux * (R + 5), p2[1] - uy * (R + 5)];
    var eLine = [e1[0] - ux * 6, e1[1] - uy * 6];
    return '<path d="M' + f1(s1[0]) + ' ' + f1(s1[1]) + ' L' + f1(eLine[0]) + ' ' + f1(eLine[1]) + '" stroke="' + color + '" stroke-width="2.8" stroke-dasharray="9 7" stroke-linecap="round" fill="none"/>' + head(e1, s1, color);
  }
  function arrowsSVG(play, i, opts) {
    if (i < 1 || !play.frames || i >= play.frames.length) return '';
    var act = action(play, i), s = '', scout = play.kind === 'scout';
    act.moves.forEach(function (m) { s += moveSVG(m, scout); });
    s += ballLineSVG(play, i, act);
    return s;
  }
  function shortName(n) { var p = String(n || '').trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1].charAt(0) + '.' : p[0] || ''; }
  // o.scout: the numbered circles are the OTHER team (grey) and the X's are us (maroon).
  // o.name: who plays this spot, written under the token. o.me: this is the viewer's spot.
  function tokenSVG(id, p, o) {
    o = o || {};
    var n = id.charAt(1), x = f1(p[0]), y = f1(p[1]), def = isDef(id);
    var circ = o.scout ? C.opp : C.mrn, xcol = o.scout ? C.mrn : C.def;
    var s = '<g class="tk" data-id="' + id + '" transform="translate(' + x + ' ' + y + ')"' + (o.ghost ? ' opacity=".3"' : '') + '>';
    if (o.me) s += '<circle r="' + (R + 6) + '" fill="none" stroke="' + C.gold + '" stroke-width="4"/>';
    if (o.selected) s += '<circle r="' + (R + 7) + '" fill="none" stroke="' + C.gold + '" stroke-width="3.5" stroke-dasharray="6 4"/>';
    if (o.hit) s += '<circle r="' + (R + 12) + '" fill="transparent"/>';
    if (def) {
      s += '<circle r="' + (R - 1) + '" fill="#fff" stroke="' + xcol + '" stroke-width="2.4"/>';
      s += '<path d="M-7 -7 L5 5 M5 -7 L-7 5" stroke="' + xcol + '" stroke-width="3.2" stroke-linecap="round"/>';
      s += '<text x="8.5" y="12.5" font-family="Oswald,Arial,sans-serif" font-weight="700" font-size="10" fill="' + xcol + '" text-anchor="middle">' + n + '</text>';
    } else {
      s += '<circle r="' + R + '" fill="' + circ + '" stroke="#fff" stroke-width="2.5"/>';
      s += '<text y="6.5" font-family="Oswald,Arial,sans-serif" font-weight="700" font-size="18" fill="#fff" text-anchor="middle">' + n + '</text>';
    }
    if (o.name) s += '<text y="' + (R + 18) + '" font-family="Oswald,Arial,sans-serif" font-weight="700" font-size="15" fill="' + (o.me ? C.mrn : C.ink) + '" text-anchor="middle" stroke="#fff" stroke-width="4" paint-order="stroke" pointer-events="none">' + esc(o.me ? 'YOU' : shortName(o.name)) + '</text>';
    return s + '</g>';
  }
  function ballSVG(p, scale) {
    if (!p) return '';
    var k = scale || 1;
    return '<g transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ') scale(' + f1(k * 10) / 10 + ')" pointer-events="none"><circle r="8" fill="' + C.ball + '" stroke="#7a3510" stroke-width="1.3"/><path d="M-8 0 H8 M0 -8 V8 M-5.6 -5.6 Q0 0 -5.6 5.6 M5.6 -5.6 Q0 0 5.6 5.6" stroke="#7a3510" stroke-width=".9" fill="none"/></g>';
  }
  function tokensSVG(st, o) {
    o = o || {};
    var s = '', names = o.names || {};
    DEF.concat(OFF).forEach(function (id) { if (st.pos[id]) s += tokenSVG(id, st.pos[id], { selected: o.selected === id, hit: o.hit, scout: o.scout, name: names[id], me: o.me === id }); });
    return s + ballSVG(st.ball, st.scale);
  }
  // Display options for a play: lineup names, the viewer's own spot, and whether it is scouted.
  function viewOpts(play, meId) {
    var names = {}, me = '';
    Object.keys(play.lineup || {}).forEach(function (tok) { var v = play.lineup[tok]; if (v && v.name) { names[tok] = v.name; if (meId && v.id === meId) me = tok; } });
    return { names: names, me: me, scout: play.kind === 'scout' };
  }
  function ghostsSVG(play, i) {
    if (i < 1) return '';
    var A = frame(play, i - 1), B = frame(play, i), s = '', scout = play.kind === 'scout';
    ALL.forEach(function (id) { if (A.pos[id] && (!B.pos[id] || dist(A.pos[id], B.pos[id]) >= 3)) s += tokenSVG(id, A.pos[id], { ghost: true, scout: scout }); });
    return s;
  }
  // Name + time tiled across the court, on top of everything. A photo of the screen carries it.
  function watermark(uid, lines, court) {
    if (!lines || !lines.length) return '';
    var d = dims(court), t = lines.map(esc), pw = Math.max(330, Math.max.apply(null, lines.map(function (l) { return String(l).length; })) * 10.5 + 70);
    var s = '<defs><pattern id="wm' + uid + '" patternUnits="userSpaceOnUse" width="' + pw + '" height="140" patternTransform="rotate(-27)">';
    s += '<text x="6" y="36" font-family="Oswald,Arial,sans-serif" font-size="17" font-weight="600" letter-spacing="1" fill="' + C.mrn + '" fill-opacity=".2">' + t[0] + '</text>';
    if (t[1]) s += '<text x="' + Math.round(pw * 0.18) + '" y="106" font-family="Oswald,Arial,sans-serif" font-size="14" letter-spacing="1" fill="' + C.ink + '" fill-opacity=".16">' + t[1] + '</text>';
    s += '</pattern></defs><rect x="' + (-M) + '" y="' + (-M) + '" width="' + (d.w + 2 * M) + '" height="' + (d.h + 2 * M) + '" fill="url(#wm' + uid + ')" pointer-events="none"/>';
    return s;
  }
  // A whole static diagram: positions at frame i with the arrows of the NEXT action.
  var uidN = 0;
  function diagram(play, i, o) {
    o = o || {};
    var d = dims(play.court), uid = 'd' + (++uidN), n = (play.frames || []).length, vo = viewOpts(play, o.meId);
    if (o.noNames) vo.names = {};
    return '<svg viewBox="' + d.vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(play.name || 'Play') + '" style="display:block;width:100%;height:auto">' +
      courtSVG(play.court) + '<g>' + (i + 1 < n ? arrowsSVG(play, i + 1) : '') + '</g><g>' + tokensSVG(stillState(play, i), vo) + '</g>' + watermark(uid, o.watermark, play.court) + '</svg>';
  }

  /* ── situations (keep in step with api/_playbook.js) ── */
  var SITUATIONS = [
    { key: 'blob', label: 'Baseline out of bounds', group: 'Inbounds' }, { key: 'slob', label: 'Sideline out of bounds', group: 'Inbounds' },
    { key: 'press_break', label: 'Press break', group: 'Inbounds' }, { key: 'full_court_short', label: 'Full court, short clock', group: 'Inbounds' }, { key: 'ato', label: 'After a timeout', group: 'Inbounds' },
    { key: 'need3', label: 'Need a 3', group: 'Score and clock' }, { key: 'need2', label: 'Need a 2', group: 'Score and clock' }, { key: 'last_shot', label: 'Last shot, tied', group: 'Score and clock' },
    { key: 'run_clock', label: 'Up late, run the clock', group: 'Score and clock' }, { key: 'ft_miss', label: 'Free throw, need the miss', group: 'Score and clock' },
    { key: 'vs_zone', label: 'Against a zone', group: 'Against' }, { key: 'vs_press', label: 'Against a press', group: 'Against' }, { key: 'vs_switch', label: 'When they switch', group: 'Against' }, { key: 'tip', label: 'Jump ball', group: 'Against' }
  ];
  var ENDGAME_LEAVES = [
    { key: 'ball_down3', side: 'ball', label: 'Down 3' }, { key: 'ball_down2', side: 'ball', label: 'Down 2' }, { key: 'ball_down1', side: 'ball', label: 'Down 1' },
    { key: 'ball_tied', side: 'ball', label: 'Tied' }, { key: 'ball_up12', side: 'ball', label: 'Up 1 or 2' }, { key: 'ball_up3', side: 'ball', label: 'Up 3 or more' },
    { key: 'def_down', side: 'def', label: 'We are down, need a stop' }, { key: 'def_tied', side: 'def', label: 'Tied' }, { key: 'def_up12', side: 'def', label: 'Up 1 or 2' }, { key: 'def_up3', side: 'def', label: 'Up 3' },
    { key: 'inb_blob2', side: 'inb', label: 'Baseline, need a 2' }, { key: 'inb_blob3', side: 'inb', label: 'Baseline, need a 3' }, { key: 'inb_slob', side: 'inb', label: 'Sideline' }, { key: 'inb_full', side: 'inb', label: 'Full court, under 5 seconds' }
  ];

  /* ── season goals (keep in step with api/_playbook.js GOAL_METRICS / goalValue) ── */
  var GOAL_METRICS = {
    wins: { label: 'Wins', dir: 'over', fmt: 'int' }, ppg: { label: 'Points per game', dir: 'over', fmt: 'dec' }, allowed: { label: 'Points allowed per game', dir: 'under', fmt: 'dec' },
    ftp: { label: 'Free throw %', dir: 'over', fmt: 'pct' }, fgp: { label: 'Field goal %', dir: 'over', fmt: 'pct' }, tpp: { label: 'Three point %', dir: 'over', fmt: 'pct' },
    to: { label: 'Turnovers per game', dir: 'under', fmt: 'dec' }, ast: { label: 'Assists per game', dir: 'over', fmt: 'dec' }, reb: { label: 'Rebounds per game', dir: 'over', fmt: 'dec' },
    oreb: { label: 'Offensive rebounds per game', dir: 'over', fmt: 'dec' }, stl: { label: 'Steals per game', dir: 'over', fmt: 'dec' }, ato: { label: 'Assist to turnover ratio', dir: 'over', fmt: 'dec' }
  };
  function goalValue(metric, games) {
    var gs = (games || []).filter(function (g) { return (g.kind || 'game') === 'game'; }), gp = gs.length;
    if (!gp) return null;
    var t = { ftm: 0, fta: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, to: 0, ast: 0, reb: 0, oreb: 0, stl: 0 };
    gs.forEach(function (g) { (g.lines || []).forEach(function (l) { Object.keys(t).forEach(function (k) { t[k] += Number(l[k]) || 0; }); }); });
    var per = function (k) { return Math.round(t[k] / gp * 10) / 10; }, pct = function (m, a) { return a ? Math.round(m / a * 1000) / 10 : null; };
    switch (metric) {
      case 'wins': return gs.filter(function (g) { return (g.us || 0) > (g.them || 0); }).length;
      case 'ppg': return Math.round(gs.reduce(function (a, g) { return a + (g.us || 0); }, 0) / gp * 10) / 10;
      case 'allowed': return Math.round(gs.reduce(function (a, g) { return a + (g.them || 0); }, 0) / gp * 10) / 10;
      case 'ftp': return pct(t.ftm, t.fta); case 'fgp': return pct(t.fgm, t.fga); case 'tpp': return pct(t.tpm, t.tpa);
      case 'ato': return t.to ? Math.round(t.ast / t.to * 100) / 100 : null;
      default: return per(metric);
    }
  }
  // 0..100 how far along a goal is; "under" goals count down from double the target
  function goalPct(goal, value) {
    var m = GOAL_METRICS[goal.metric]; if (value == null || !m) return 0;
    if (m.dir === 'under') return Math.max(0, Math.min(100, Math.round((2 * goal.target - value) / goal.target * 100)));
    return Math.max(0, Math.min(100, Math.round(value / goal.target * 100)));
  }
  function goalMet(goal, value) { var m = GOAL_METRICS[goal.metric]; if (value == null || !m) return false; return m.dir === 'under' ? value <= goal.target : value >= goal.target; }
  function goalFmt(goal, value) { var m = GOAL_METRICS[goal.metric]; if (value == null) return '–'; return m.fmt === 'pct' ? value + '%' : m.fmt === 'int' ? String(value) : (Math.round(value * 10) / 10).toString(); }

  /* ── animated player ─────────────────────────────────────────────────── */
  // new PBCourt.Player(svgEl, play, {watermark:[line1,line2], onChange(at, playing)})
  // at = the frame being shown; play() animates through every remaining action.
  function Player(svg, play, o) {
    this.svg = svg; this.o = o || {}; this.speed = 1; this.load(play);
  }
  Player.prototype.load = function (play) {
    this.stop(true);
    this.play = play; this.at = 0; this.vo = viewOpts(play, this.o.meId);
    var d = dims(play.court), uid = 'p' + (++uidN);
    this.svg.setAttribute('viewBox', d.vb);
    this.svg.innerHTML = courtSVG(play.court) + '<g class="pb-arrows"></g><g class="pb-tokens"></g>' + watermark(uid, this.o.watermark, play.court);
    this.gA = this.svg.querySelector('.pb-arrows'); this.gT = this.svg.querySelector('.pb-tokens');
    this.draw();
  };
  Player.prototype.n = function () { return (this.play.frames || []).length; };
  Player.prototype.draw = function () {
    this.gA.innerHTML = this.at + 1 < this.n() ? arrowsSVG(this.play, this.at + 1) : '';
    this.gA.style.opacity = 1;
    this.gT.innerHTML = tokensSVG(stillState(this.play, this.at), this.vo);
    this.emit();
  };
  Player.prototype.emit = function () { if (this.o.onChange) this.o.onChange(this.at, !!this.raf, this.t || 0); };
  Player.prototype.go = function (i) { this.stop(true); this.at = Math.max(0, Math.min(this.n() - 1, i)); this.draw(); };
  Player.prototype.stop = function (silent) { if (this.raf) cancelAnimationFrame(this.raf); if (this.pauseT) clearTimeout(this.pauseT); this.raf = 0; this.pauseT = 0; this.t = 0; if (!silent && this.gA) this.draw(); };
  // Animate one action (at → at+1). cb runs when it lands.
  Player.prototype.step = function (cb) {
    var self = this, i = this.at + 1;
    if (i >= this.n()) { this.stop(); return; }
    var dur = duration(this.play, i) / this.speed, t0 = 0;
    var arrows = arrowsSVG(this.play, i);
    function tick(ts) {
      if (!t0) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur);
      self.t = t;
      self.gA.innerHTML = arrows; self.gA.style.opacity = String(1 - 0.65 * Math.min(1, t * 1.6));
      self.gT.innerHTML = tokensSVG(stateAt(self.play, i, t), self.vo);
      if (t < 1) { self.raf = requestAnimationFrame(tick); self.emitT(t); return; }
      self.raf = 0; self.at = i; self.t = 0; self.draw();
      if (cb) cb();
    }
    this.raf = requestAnimationFrame(tick); this.emit();
  };
  Player.prototype.emitT = function (t) { if (this.o.onProgress) this.o.onProgress(this.at, t); };
  Player.prototype.playAll = function () {
    var self = this;
    if (this.at >= this.n() - 1) this.at = 0, this.draw();
    this.playing = true;
    var next = function () {
      if (!self.playing) return;
      if (self.at >= self.n() - 1) { self.playing = false; self.emit(); return; }
      self.step(function () { if (!self.playing) return; self.pauseT = setTimeout(next, 650 / self.speed); self.emit(); });
    };
    next();
  };
  Player.prototype.pause = function () { this.playing = false; this.stop(); };
  Player.prototype.isPlaying = function () { return !!this.playing; };


  /* ── starting spots and sample plays ─────────────────────────────────── */
  function manD(o) { var d = {}; OFF.forEach(function (id, k) { if (o[id]) d[DEF[k]] = lerp(o[id], [250, 52.5], 0.2).map(Math.round); }); return d; }
  var SETS = {
    'Five out': { O1: [250, 335], O2: [430, 240], O3: [70, 240], O4: [462, 55], O5: [38, 55] },
    'Four out, one in': { O1: [250, 335], O2: [430, 235], O3: [70, 235], O4: [40, 60], O5: [320, 110] },
    'Horns': { O1: [250, 335], O4: [180, 200], O5: [320, 200], O2: [462, 55], O3: [38, 55] },
    'Box': { O1: [250, 335], O2: [320, 190], O3: [180, 190], O4: [180, 95], O5: [320, 95] },
    '1-4 high': { O1: [250, 335], O2: [445, 195], O3: [55, 195], O4: [180, 195], O5: [320, 195] },
    'Stack': { O1: [250, 335], O2: [330, 210], O3: [330, 160], O4: [330, 110], O5: [170, 95] },
    'Baseline out (box)': { O3: [300, -25], O1: [180, 190], O2: [320, 190], O4: [180, 90], O5: [320, 90] },
    'Sideline out': { O3: [-25, 250], O1: [250, 330], O2: [110, 140], O4: [230, 230], O5: [320, 110] }
  };
  var FULL_SETS = {
    'Press break (4 across)': { O4: [300, 865], O1: [330, 700], O2: [110, 640], O3: [390, 520], O5: [250, 420] },
    'Full court, man to man': { O1: [250, 700], O2: [420, 560], O3: [80, 560], O4: [330, 420], O5: [170, 380] }
  };
  var DEF_SETS = {
    'Man to man': null,
    '2-3 zone': { X1: [200, 260], X2: [300, 260], X3: [100, 130], X4: [400, 130], X5: [250, 90] },
    '1-3-1 zone': { X1: [250, 300], X2: [110, 200], X3: [390, 200], X4: [250, 185], X5: [250, 75] },
    '3-2 zone': { X1: [250, 290], X2: [120, 230], X3: [380, 230], X4: [170, 100], X5: [330, 100] },
    'Box and one': { X1: [250, 290], X2: [190, 210], X3: [310, 210], X4: [180, 95], X5: [320, 95] }
  };
  function F(pos, ball, note, moves, passFirst) { return { pos: pos, ball: ball || '', note: note || '', moves: moves || {}, passFirst: !!passFirst }; }
  function after(prev, ch) { var p = {}; for (var k in prev) p[k] = prev[k]; for (k in ch) p[k] = ch[k]; return p; }
  function samples() {
    var h0 = SETS['Horns'], h1 = h0, h2 = after(h1, { O5: [300, 282], O1: [425, 262] }), h3 = after(h2, { O5: [295, 95] });
    var b0 = SETS['Baseline out (box)'], b1 = after(b0, { O4: [180, 165], O5: [320, 165], O1: [65, 40], O2: [262, 72] });
    var z0 = { O1: [250, 330], O2: [430, 240], O3: [70, 240], O4: [440, 60], O5: [240, 160], X1: [200, 262], X2: [300, 262], X3: [100, 130], X4: [400, 130], X5: [250, 92] };
    var z1 = after(z0, { X2: [392, 222], X1: [262, 248], X5: [290, 100], X3: [150, 112] });
    var z2 = after(z1, { X4: [425, 88], X5: [330, 72], X3: [215, 92], X2: [408, 178], X1: [250, 212] });
    var p0 = FULL_SETS['Press break (4 across)'], p1 = after(p0, { O1: [392, 772] }), p2 = after(p1, { O5: [250, 565], O4: [230, 790] });
    var p3 = after(p2, { O2: [110, 330], O3: [392, 250] }), p4 = after(p3, { O2: [180, 125], O3: [305, 78] });
    return [
      { id: 'demo1', name: 'Horns Flare', category: 'Offense', court: 'half', notes: 'Our go to set against man. Run it out of a timeout or when we need a three.', tips: ['1: fade, don\'t drift. Get your feet set behind the line before the catch.', '5: set the screen on the defender\'s top shoulder, then dive hard.', '4: look at 5 first, then skip it to 1. Don\'t pre-decide.', 'If they switch the flare, 5 has the small guy on his back. Throw it in.'], lineup: { O1: { id: 'demo_me', name: 'Demo Player' }, O2: { id: 'd2', name: 'Chris Lee' }, O3: { id: 'd3', name: 'Marcus Hall' }, O4: { id: 'd4', name: 'Jaden Price' }, O5: { id: 'd5', name: 'Sam Oduya' } }, frames: [
        F(h0, 'O1', 'Horns. 4 and 5 at the elbows, 2 and 3 spaced to the corners.'),
        F(h1, 'O4', '1 hits 4 at the elbow.'),
        F(h2, 'O4', '5 sets the flare screen. 1 fades to the wing.', { O5: { t: 'screen' }, O1: { t: 'cut', c: [372, 345] } }),
        F(h3, 'O1', '4 skips it to 1. 5 dives to the rim.', { O5: { t: 'cut' } }, true),
        F(h3, 'rim', 'Catch and shoot. If they switch, 5 is open on the dive.')] },
      { id: 'demo2', name: 'Box Up', category: 'Baseline out', court: 'half', notes: 'Under our basket. 3 inbounds.', frames: [
        F(b0, 'O3', 'Box set. 3 takes it out on the ball side.'),
        F(b1, 'O3', '4 and 5 screen up. 1 pops to the corner, 2 curls to the rim.', { O4: { t: 'screen' }, O5: { t: 'screen' }, O1: { t: 'cut', c: [90, 150] }, O2: { t: 'cut', c: [350, 125] } }),
        F(b1, 'O2', 'First look: 2 at the rim.'),
        F(b1, 'rim', 'Lay it in.')] },
      { id: 'demo3', name: '2-3 Zone Slides', category: 'Defense', court: 'half', notes: 'Every player moves on every pass. Talk.', frames: [
        F(z0, 'O1', 'Base 2-3. Hands up, 1 and 2 split the top.'),
        F(z1, 'O2', 'Ball to the wing. 2 takes the ball, 1 drops to the elbow, everyone shifts a step.'),
        F(z2, 'O4', 'Ball to the corner. 4 runs out, 5 fronts the block, 3 fills the middle.')] },
      { id: 'demo5', name: 'Radnor: Flex', kind: 'scout', opponent: 'Radnor', category: 'Offense', court: 'half', notes: 'Their main half court set. They run it every trip against man. Switch the baseline screen, do not chase.', lineup: { X1: { id: 'demo_me', name: 'Demo Player' }, X2: { id: 'd2', name: 'Chris Lee' } }, frames: [
        F(z0, 'O1', 'Their 1 brings it up. 5 ducks to the block, 4 at the wing.'),
        F(after(z0, { O3: [330, 70], O5: [150, 95], X3: [300, 95], X5: [170, 120] }), 'O1', '3 cuts baseline off the 5 screen (the flex cut). We switch it.', { O5: { t: 'screen' }, O3: { t: 'cut', c: [230, 60] } }),
        F(after(z0, { O3: [330, 70], O5: [150, 95], X3: [300, 95], X5: [170, 120], O1: [430, 230] }), 'O4', '1 swings it to 4 and the whole thing flips.')] },
      { id: 'demo4', name: 'Press Break', category: 'Press break', court: 'full', notes: 'Against any full court press. Never dribble into the corner trap.', frames: [
        F(p0, 'O4', '4 takes it out. Everyone else in a line, 1 closest.'),
        F(p1, 'O1', '1 flashes to the ball side corner and catches.', null),
        F(p2, 'O5', '5 flashes to the middle. 4 steps in as the safety.', null),
        F(p3, 'O2', '2 and 3 run the sidelines. 5 turns and hits 2 ahead.', null),
        F(p4, 'O2', 'Attack. 2 drives, 3 runs the far lane.', { O2: { t: 'dribble' } }),
        F(p4, 'O3', '2 on 1: hit 3 for the layup.'),
        F(p4, 'rim', 'Score.')] }
    ];
  }

  window.PBCourt = {
    C: C, R: R, OFF: OFF, DEF: DEF, ALL: ALL, dims: dims, courtSVG: courtSVG, action: action, stateAt: stateAt, stillState: stillState,
    arrowsSVG: arrowsSVG, tokensSVG: tokensSVG, viewOpts: viewOpts, shortName: shortName, tokenSVG: tokenSVG, ballSVG: ballSVG, ghostsSVG: ghostsSVG, watermark: watermark,
    SITUATIONS: SITUATIONS, ENDGAME_LEAVES: ENDGAME_LEAVES, GOAL_METRICS: GOAL_METRICS, goalValue: goalValue, goalPct: goalPct, goalMet: goalMet, goalFmt: goalFmt, SETS: SETS, FULL_SETS: FULL_SETS, DEF_SETS: DEF_SETS, manD: manD, samples: samples, diagram: diagram, duration: duration, nearestRim: nearestRim, dist: dist, lerp: lerp, esc: esc, Player: Player
  };
})();
