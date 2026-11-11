# How other apps draw plays, research pull 2026-11-10

**Report: How the best basketball play editors handle drawing (web research, Nov 2026)**

Note on coverage: Reddit blocks automated access, so forum sentiment comes from App Store reviews, vendor help centers and coach blogs. Several products you named do not exist as basketball editors: "PlayMaker X" is football only (the browser tool playmaker.click is the basketball one), "HoopsKing", "XOs Digital" and "Playbook Writer" returned nothing, "Hoop Tactics" resolves to HoopTactiX (a session planner with no editor docs). Hudl's basketball answer is FastDraw; Hudl Playbook (football, $199/yr) is static cards with auto-saved formation templates and no animation found (hudl.com).

**1. Interaction models that exist**

a) Frame-based, tool-then-drag lines (FastDraw, Just Play, TacticalPad, Jes-Soft). The play is a list of frames. In Just Play you pick a line button (straight, curve, multi-point), hover the player's center, click-hold-drag to the end point; the line snaps to the player outline, endpoints stay adjustable, curves get green control handles. Pressing Next animates the drawn lines AND creates the next frame with players already moved to their line endpoints (justplayss.zendesk). FastDraw Web is the same model driven by hotkeys: Shift+arrow for next/prev frame, "b" gives the selected player the ball, "a" opens the animation menu, Space plays, Esc cancels FastPlace (fmshelp.fastmodelsports). Feels precise and fast on desktop; on touch it is a lot of mode switching.

b) Drag the token, the path becomes the arrow (Basketball Play Designer iPad, HoopCoach, Pocket Coach, Hoops Geek partially). In Basketball Play Designer (4.2 stars, 337 ratings) dragging a player draws a cut or dribble, tapping a teammate creates a pass, tapping the floor passes to a spot, tapping the rim shoots (apps.apple). HoopCoach: Quick-Add a set (5-Out, Horns, Box) that "snaps into natural floor positions", press Add Movement, drag players/ball/defenders to their next spots, each movement becomes a renamable tab (hoopcoach.org). Feels like moving magnets; least learning curve.

c) Semantic actions dropped on players, auto-animated (The Hoops Geek, 4.9 stars, 1.1K ratings). You drag actions (cut, screen, dribble, pass, handoff, shot) onto players, "everything snaps into place", each phase animates automatically, with per-phase notes, synchronized actions, optional actions, timing-based movements (apps.apple, help.thehoopsgeek). Coaches call it "easy to use and intuitive" and like "show different phases of a play" (mwm.ai).

d) Gesture recognition / predictive line type (FastDraw iPad "Predictive Drawing": app picks the action type as you draw, long-press the line to change it; FastDraw desktop "FastMotion": stylus trace becomes a clean S-curve; Luceo Sports "predictive drawing & animation", timings auto-generated but editable, and edits mid-play auto-recompute the animation) (support.fastmodelsports, hudl.com blog, apps.apple Luceo).

e) Record mode: hit record, move tokens live, stop (Basketball Playboard, Coach Tactic Board animation builder, old Basketball Playmaker). Quick for whiteboard-style demos but reviewers report players "shifted off the court during recording" (Pocket Coach) and "a jumbled mess of lines" on longer plays (Basketball Playmaker).

f) Waypoint routes with timing semantics (PlayArt Pro, Director of Cones, Just Play multi-point). Just Play's rule: every segment of a multi-point line finishes at the same time, so segment count IS the timing control; a short first segment makes a player wait for a screen (justplayss.zendesk tips). Director of Cones: tap a player, tap cells to draw the run, set pace walk/jog/sprint, a pass links passer to receiver and the receiver is auto-timed to meet the ball (coaching-animator.vercel.app). PlayArt Pro has a Lock Routes toggle so moving a waypoint drags all downstream waypoints (docs.playartpro).

g) Typed notation that renders (SchemaTex: `pass 1 2`, `cut 1 rim`, `screen A B`, actions ordered, renders SVG with coaching line conventions) (schematex.js.org). Good for AI generation; not a coach-facing editor.

h) 3D playback with inferred ordering (VDM Basketball Coach: draw on 2D board, 3D runs "screen is set, then the player who uses it moves, then the pass") (producthunt).

i) Voice/AI: no real voice-to-play product exists. What ships is voice narration recorded over the animation (PlayBook Coach Tactic Board one-tap record play + voice; HoopCoach, Hoops Geek, Elite Hoops audio). Text-to-diagram exists only for flag football (Playwrist) and as a ChatGPT app; BasketballGAN is research (sketch to simulation).

**2. Small things coaches love**

- Formation presets that snap (HoopCoach, Basketball Play Designer, CourtDraw 50 presets incl. Horns, 5-Out, 2-3 zone, Hudl saves a template of every card).
- Lines snap to players / player outline (FastDraw iPad listing, Just Play); 45-degree snapping with Shift to force and Ctrl to disable (CoachThem); grid shown only while dragging (Coach Tactic Board).
- One-click flip/mirror: Hoops Geek reviewer singles out "the ability to flip the direction of a play with one click"; FastDraw mirrors a single frame from the frame menu or a whole play from the library.
- Auto-chaining: Just Play only requires the first line to touch the player; later lines placed near the endpoint are auto-joined, and a second pass line near a receiver auto-transfers the ball.
- Auto-animate from what you drew, no separate animation step (Hoops Geek, Elite Hoops, CoachCanvas per hoopmentality).
- Per-phase notes that highlight during playback (Hoops Geek, Elite Hoops, Basketball Board Play Maker).
- Ball sticks to the player it is dropped on (Basketball Board Play Maker); "b" key to give ball (FastDraw).
- Import phases from another play (Hoops Geek), Movement Links so an action's end point carries into the next frame (Elite Hoops).
- Editable anchors on lines: double-click to edit, drag blue anchor to add, double-click grey to delete (CoachThem).
- "Draw first" playback where arrows draw in before players move, plus speed slider (Pocket Coach); speed control praised by Hoops Geek reviewers.
- Hotkeys for everything (FastDraw); undo/redo depth 50 (Basketball Board Play Maker).
- Share as a link that opens with no login, mp4/PDF export (Hoops Geek, playmaker.click).

**3. Complaints**

- Frames falling apart: "One frame will crash in the middle of a series and the whole series is then uneditable" (FastDraw iPad, 2025); "switching between frames is harder than it should be" (FastDraw, 2018, apprview).
- Edits don't propagate: Just Play documents that editing a previous frame does not update the next frame; you fix both.
- Can't fix one path: Coach Tactic Board, "you can only clear the board or undo your last mark", erasing one arrow erases everything after it; Basketball Playmaker, "no erase or step back".
- Record mode drift and one-player-at-a-time movement (Pocket Coach, Basketball Playmaker).
- Branching plays are weak: "I wish you could do more with plays that have different options" (Hoops Geek).
- Defenders don't move with the offense unless animated by hand (Hoops Geek help).
- Timing has no direct control; Just Play makes you fake it with segment counts and DHO recipes.
- Learning curve and desktop bias on FastDraw/FastBreak (hoopmentality); "not very user friendly" (TacticalPad); fingers inaccurate on phones; too-small free tiers.
- Generic drawing apps (TacticalPad, Coach Board) give ink, not semantics, so nothing animates correctly.

**4. Ranked improvements for a tablet/desktop web editor**

1. Make the drag the arrow: dragging a token in a step records its path and renders the cut/dribble line automatically, as Basketball Play Designer and HoopCoach do, removing the separate "pick move type" step.
2. Infer move type from gesture and context: straight drag = cut, wavy or ball-holder drag = dribble, drag ending on a teammate = screen, tap a teammate while holding ball = pass, tap rim = shot; FastDraw Predictive Drawing and Basketball Play Designer prove coaches accept this with a long-press override.
3. Auto-create the next step from the current paths (Just Play's Next button): the end points become the new positions, so coaches never place tokens twice.
4. Editable path handles after the fact (CoachThem anchors, Just Play green control points, PlayArt waypoints) so a bad curve is a drag, not a redo.
5. Per-step undo/redo and per-element delete, never "clear board" (the single most repeated App Store complaint).
6. Formation presets plus one-click mirror of a step or the whole play (Hoops Geek, FastDraw, CourtDraw).
7. Onion-skin ghost of the previous step while editing (Director of Cones ghost mode, Just Play's auto-moved players) so steps stay in sync.
8. Simple timing primitives: "wait for" and "arrive with" (Director of Cones receiver timing, Luceo auto timings, Hoops Geek synchronized actions) instead of equal-duration frames.
9. Keyboard parity on desktop: number keys to add players, B for ball, Shift+arrows for steps, Space to play (FastDraw's hotkey table).
10. Ball as an attribute of a player, not a free token (Basketball Board Play Maker, FastDraw "b").
11. Optional/branch actions and movable defenders as first-class toggles (the gap Hoops Geek reviewers name).
12. Playback polish: draw-arrows-first mode, speed slider, per-step notes that highlight during playback, link share without login (Pocket Coach, Hoops Geek, Elite Hoops).

**5. Free / open source worth a look**

- SchemaTex, text notation to SVG playbook renderer with basketball cut/pass/screen/dribble conventions and a React canvas editor; AGPL-3.0, commercial license available (github.com/SchemaTex/SchemaTex).
- MilosLord/playmaker, React + SVG basketball play designer with auto-animating engine, FIBA half court, scrub/step/speed controls; surfaced in search but the repo URL returned 404 on fetch, so verify it still exists and its license.
- fralonra/basketball-court, MIT, NBA/FIBA/NCAA/WNBA court as SVG string or element (github.com/fralonra/basketball-court).
- ryonomail/basketball-playboard, Swift iPad strategy board with record-to-MP4, no license file.
- chalktalk (PyPI), Python SVG play renderer, football-leaning.
- General canvases: Excalidraw (MIT), react-konva, GSAP for path animation, react-svgpathplayer (MIT); tldraw is non-commercial licensed.

**URLs**
- https://fmshelp.fastmodelsports.com/support/solutions/articles/9000228792-tips-and-tricks-hotkeys-
- https://support.fastmodelsports.com/support/solutions/articles/9000223886-extra-drawing-features
- https://support.fastmodelsports.com/support/solutions/articles/9000232500-predictive-drawing
- https://www.hudl.com/blog/basketball-coaching-software
- https://apps.apple.com/app/id1575630066 (FastDraw for iPad reviews)
- https://apps.apple.com/us/app/-/id663466699 (FastDraw Basketball Pro reviews)
- http://www.apprview.com/sports/fastdraw-basketball/
- https://justplayss.zendesk.com/hc/en-us/articles/221266608-Line-Drawing-for-Basketball-Diagrams
- https://justplayss.zendesk.com/hc/en-us/articles/115002438893-Tips-for-Advanced-Diagram-Drawing
- https://justplayss.zendesk.com/hc/en-us/articles/221618488-Diagramming-multiple-movements-passes-June-23-2016
- https://apps.apple.com/app/id6477780680 (Hoops Geek)
- https://mwm.ai/apps/the-hoops-geek-play-designer/6477780680
- https://help.thehoopsgeek.com
- https://www.thehoopsgeek.com/?p=23366
- http://www.coachthem.com/blogs/blog/1527878-sketchpad-drill-drawing-features
- http://www.coachthem.com/blogs/blog/1526824-feature-line-tool-update-introducing-click-mode
- http://www.coachthem.com/blogs/blog/1526859-feature-line-snapping
- https://docs.playartpro.com/understanding-movement/
- https://apps.apple.com/au/app/id6443711183 (Elite Hoops)
- https://elitehoopsapp.com/
- https://www.hoopcoach.org/?p=6362
- https://www.hoopcoach.org/playbook/hoopcoach-landing-page.html
- https://apps.apple.com/us/app/-/id1407281336 (Basketball Play Designer 3D)
- https://www.producthunt.com/p/vdm-basketball-coach/vdm-basketball-coach
- https://apps.apple.com/app/id1523319759 (Luceo Sports)
- https://ryonomail.github.io/basketball-playboard/support.html
- https://apps.apple.com/app/id861249866 (Coach Tactic Board)
- https://apps.apple.com/app/id391318075 (Basketball Playmaker)
- https://apps.apple.com/us/app/id1205184189 (Pocket Coach)
- https://apps.apple.com/app/id6761409275 (Basketball Board Play Maker)
- https://apps.apple.com/us/app/id971115765 (TacticalPad)
- https://www.tacticalpad.com
- https://apps.apple.com/np/app/playbook-coach-tactic-board/id1603572641
- https://www.jes-soft.com/playbook/
- https://coaching-animator.vercel.app/help/how-to
- https://www.producthunt.com/p/courtdraw/p-formation-presets-are-live-on-courtdraw-p
- https://playmaker.click/compare/playmaker-vs-fastdraw
- https://www.hudl.com/products/playtools
- https://hoopmentality.com/blogs/basketball/basketball-play-calling-apps
- https://joinstriveon.com/blog/basketball-coaching-software
- https://schematex.js.org/docs/playbook
- https://github.com/SchemaTex/SchemaTex
- https://github.com/MilosLord/playmaker
- https://github.com/fralonra/basketball-court
- https://github.com/ryonomail/basketball-playboard
- https://pypi.org/project/chalktalk
- https://arxiv.org/pdf/1909.07088 (BasketballGAN)