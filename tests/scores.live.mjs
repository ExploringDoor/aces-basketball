// Live check of /api/scores against the real Blob store, in an isolated test
// prefix (never touches the site's scores). Run:
//   node --env-file=.env.local tests/scores.live.mjs
process.env.SCORES_PREFIX = `test/live-${Date.now()}-`;
process.env.SCORES_PASSCODE = "local-test-only";
process.env.SCORES_DEBUG = "1";
const { default: handler } = await import("../api/scores.js");
const { list, del } = await import("@vercel/blob");
const call = async (method, body, key) => {
  const res = { code: 200, body: null, headers: {} };
  const r = { status: (c) => { res.code = c; return r; }, json: (j) => { res.body = j; return r; }, setHeader: (k, v) => { res.headers[k] = v; } };
  await handler({ method, headers: key ? { "x-scores-key": key } : {}, body }, r);
  return res;
};
let fail = 0; const ok = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) fail++; };
const K = "local-test-only", ISO = "2026-12-04T19:00:00-05:00";
ok((await call("GET")).body.updated === null, "empty store reads as no scores");
ok((await call("POST", { action: "set", iso: ISO, us: 60, them: 55 })).code === 401, "no passcode is refused");
ok((await call("POST", { action: "set", iso: ISO, us: 60, them: 55 }, "nope")).code === 401, "wrong passcode is refused");
ok((await call("POST", { action: "check" }, K)).code === 200, "right passcode unlocks");
ok((await call("POST", { action: "set", iso: ISO, us: 60, them: 60 }, K)).body.error === "tie_not_allowed", "a tie is rejected");
ok((await call("POST", { action: "set", iso: ISO, us: "abc", them: 5 }, K)).body.error === "bad_score", "a bad number is rejected");
const s1 = await call("POST", { action: "set", iso: ISO, us: 61, them: 55 }, K);
ok(s1.code === 200 && s1.body.games[ISO].us === 61, "score saves");
await new Promise((r) => setTimeout(r, 3000));
ok((await call("GET")).body.games[ISO].them === 55, "and reads back");
await call("POST", { action: "set", iso: "2026-12-08T19:00:00-05:00", us: 70, them: 72 }, K);
await new Promise((r) => setTimeout(r, 3000));
const g2 = (await call("GET")).body;
ok(Object.keys(g2.games).length === 2 && g2.games[ISO].us === 61, "a second score keeps the first");
const st = await call("POST", { action: "standings", rows: { Conestoga: { confW: 2, confL: 0, w: 3, l: 1 } } }, K);
ok(st.code === 200 && st.body.standings.Conestoga.w === 3 && st.body.games[ISO], "standings save and keep scores");
const cl = await call("POST", { action: "clear", iso: ISO }, K);
ok(cl.code === 200 && cl.body.games && cl.body.games[ISO] === undefined, `clear removes a score (${cl.code})`);
await new Promise((r) => setTimeout(r, 3000));
ok((await call("GET")).body.games[ISO] === undefined, "and the clear reads back");
// two saves at the same moment: neither score may be lost
const par = await Promise.all([
  call("POST", { action: "set", iso: "2026-12-10T19:00:00-05:00", us: 50, them: 40 }, K),
  call("POST", { action: "set", iso: "2026-12-15T18:00:00-05:00", us: 66, them: 61 }, K),
  call("POST", { action: "set", iso: "2026-12-17T17:15:00-05:00", us: 58, them: 49 }, K),
]);
console.log("    parallel codes", par.map((x) => x.code));
await new Promise((r) => setTimeout(r, 4000));
const both = (await call("GET")).body.games;
ok(both["2026-12-10T19:00:00-05:00"] && both["2026-12-15T18:00:00-05:00"] && both["2026-12-17T17:15:00-05:00"] && both["2026-12-08T19:00:00-05:00"], "three simultaneous saves all survive");
await new Promise((r) => setTimeout(r, 4000)); // listing lags behind puts
const blobs = (await list({ prefix: process.env.SCORES_PREFIX })).blobs;
ok(blobs.length >= 7, `every save kept as its own file (${blobs.length})`);
await del(blobs.map((b) => b.url));
ok((await list({ prefix: process.env.SCORES_PREFIX })).blobs.length === 0, "test data cleaned up");
console.log(fail ? `\n${fail} failed` : "\nall passed");
process.exit(fail ? 1 : 0);
