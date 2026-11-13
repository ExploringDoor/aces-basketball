// ─── THIS DAY IN ACES HISTORY ───────────────────────────────────────────────
// Dated moments for the home page card. Title games come straight from
// titleStories (only the ones with an exact game date); add other moments below.
//  · m/d/y → month, day, year   · text → one line   · storyId → opens that story
import { titleStories } from "./titleStories";
import { seasonGames } from "./seasons";

// Stories whose `sortKey` day is confirmed by the reporting (not estimated).
const INEXACT = new Set(["title-2018-league", "title-2009-league"]);

const fromStories = titleStories.filter(s => !INEXACT.has(s.id)).map(s => {
  const k = String(s.sortKey);
  return { m: Number(k.slice(4, 6)), d: Number(k.slice(6, 8)), y: Number(k.slice(0, 4)), text: s.excerpt, label: s.category, storyId: s.id };
});

const moments = [
  { m: 12, d: 16, y: 2010, label: "Bryant Gymnasium", text: "Lower Merion dedicates its gym to Kobe Bryant, his No. 33 hanging above the doors." },
  { m: 12, d: 9,  y: 2023, label: "Hall of Fame", text: "The 1996 state championship team is inducted into the Lower Merion Basketball Hall of Fame." },
];

// Playoff wins and wins over Chester from the published game results (2005-06 on).
const storyDays = new Set(fromStories.map(e => `${e.y}-${e.m}-${e.d}`));
const fromGames = Object.entries(seasonGames).flatMap(([season, games]) => games
  .filter(([m, d, y, opp, note, lm, , r]) => r === "W" && lm != null && (/State|District|Central League|Classic/.test(note) || /^Chester/.test(opp)) && !storyDays.has(`${y}-${m}-${d}`))
  .map(([m, d, y, opp, note, lm, them]) => ({ m, d, y, label: `${season} season`, text: `Aces ${lm}, ${opp} ${them}${note ? ` in the ${note.replace(/^State Playoffs/, "state playoffs").replace(/^State /, "state ")}` : ""}.` })));

export const acesHistory = [...fromStories, ...moments, ...fromGames];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const historyDate = (e) => `${MONTHS[e.m - 1]} ${e.d}, ${e.y}`;

// Returns { today: [...] } when something happened on this date, otherwise
// { next: [...] } with the soonest anniversary still to come this year (wrapping into next).
export function historyFor(now = new Date()) {
  const m = now.getMonth() + 1, d = now.getDate();
  const today = acesHistory.filter(e => e.m === m && e.d === d).sort((a, b) => b.y - a.y);
  if (today.length) return { today };
  const key = (e) => { const k = e.m * 100 + e.d; return k > m * 100 + d ? k : k + 1300; };
  const sorted = [...acesHistory].sort((a, b) => key(a) - key(b) || b.y - a.y);
  const first = sorted[0];
  return { next: sorted.filter(e => e.m === first.m && e.d === first.d) };
}
