// ─── HEAD TO HEAD ───────────────────────────────────────────────────────────
// The Aces' record against every Central League team, worked out from the game
// results on this site: the program's published schedules (2005-06 to 2019-20)
// and this site's 2025-26 results. Seasons in between are not in the data yet,
// so the page says which seasons it covers.
import { seasonGames } from "./seasons";
import { seasonData, centralLeagueTeams } from "./index.jsx";

// Old schedules spell schools several ways ("Radnor Senior HS", "Springfield (Delco)").
export const normTeam = (s) => String(s || "")
  .replace(/\s*\((delco)\)|\s+delco$/i, "")
  .replace(/\s+(senior\s+)?(hs|high( scho?o?l)?)$/i, "")
  .trim();

const PLAYOFF = /central league|district|state|playoff|final|semi|quarter/i;
const TAG_NOTE = { "CAL PLAYOFF": "Central League playoffs", "D1 PLAYOFF": "District 1 playoffs" };

const all = [];
Object.entries(seasonGames).forEach(([season, games]) => games.forEach(([m, d, y, opp, note, lm, them, r]) => {
  if (lm == null || !r) return;
  all.push({ season, m, d, y, opp: normTeam(opp), note: note || "", lm, them, w: r === "W" });
}));
Object.entries(seasonData).forEach(([season, s]) => (s.games || []).forEach(g => {
  if (g.lm == null) return;
  const [m, d] = g.date.split("/").map(Number);
  const y = Number(season.slice(0, 4)) + (m >= 7 ? 0 : 1);
  all.push({ season, m, d, y, opp: normTeam(g.opp), note: TAG_NOTE[g.tag] || "", lm: g.lm, them: g.them, w: g.r === "W" });
}));

const key = (g) => g.y * 10000 + g.m * 100 + g.d;
export const h2hSeasons = [...new Set(all.map(g => g.season))].sort();

function summarize(name) {
  const games = all.filter(g => g.opp === name).sort((a, b) => key(b) - key(a));
  const wins = games.filter(g => g.w).length;
  const playoffs = games.filter(g => PLAYOFF.test(g.note));
  // Longest run of Aces wins. A run never jumps a stretch of seasons we have no results for.
  let best = 0, run = 0, prevYear = null;
  [...games].reverse().forEach(g => {
    const y = Number(g.season.slice(0, 4));
    if (prevYear != null && y - prevYear > 1) run = 0;
    run = g.w ? run + 1 : 0; best = Math.max(best, run); prevYear = y;
  });
  const first = games[0];
  const bigWin = games.filter(g => g.w).sort((a, b) => (b.lm - b.them) - (a.lm - a.them))[0] || null;
  return {
    name, games, wins, losses: games.length - wins,
    playoffWins: playoffs.filter(g => g.w).length, playoffLosses: playoffs.filter(g => !g.w).length,
    bestStreak: best, bigWin, last: first || null,
  };
}

export const headToHead = centralLeagueTeams
  .filter(t => t.name !== "Lower Merion")
  .map(t => ({ ...summarize(t.name), team: t }))
  .filter(t => t.games.length)
  .sort((a, b) => b.games.length - a.games.length);
