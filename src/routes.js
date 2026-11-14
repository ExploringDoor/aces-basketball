// ─── SITE ADDRESSES ─────────────────────────────────────────────────────────
// Every in-app page and its real web address (aceshoops.com/<id>), with the
// title and description Google and link previews show for it.
//
// Plain JavaScript on purpose: scripts/prerender.mjs imports this file at
// build time to write one HTML file per page (so each address has its own
// title and preview) plus sitemap.xml and robots.txt.
//
//  · private: true → coach or admin tool. Kept out of Google, the sitemap and
//    both analytics tools.
//  · hidden: true  → a public page that isn't ready for Google yet (no menu
//    link, placeholder content). Kept out of Google and the sitemap, still
//    counted in analytics. Remove the flag when the page is ready.
//  · Adding a page? Add it here AND to PAGES in src/App.jsx. The build stops
//    with an error if the two lists disagree.

export const SITE_ORIGIN = "https://www.aceshoops.com";
export const SITE_NAME = "Lower Merion Aces Basketball";
export const DEFAULT_DESCRIPTION = "Official home of Lower Merion Aces Basketball: 7 time PIAA State Champions and Kobe Bryant's alma mater. Schedule, roster, history, alumni, photos and more.";

export const routes = {
  home:          { title: "Lower Merion Aces Basketball", description: DEFAULT_DESCRIPTION },
  news:          { title: "News & Recaps", description: "Aces game recaps, program news and the stories of every Lower Merion championship, plus the Aces Newsletter sign up." },
  clinics:       { title: "Aces Clinics", description: "Lower Merion Aces youth basketball clinics: dates, details and sign ups." },
  store:         { title: "Team Store", description: "Lower Merion Aces Basketball team store." },
  standings:     { title: "Central League Standings", description: "Current Central League boys basketball standings, updated through the season." },
  history:       { title: "Program History", description: "More than a century of Lower Merion basketball: all-time records, the coaches, and the eras that built the Aces." },
  thousand:      { title: "1,000 Point Club", description: "Every Lower Merion Ace to score 1,000 career points, led by Kobe Bryant's 2,883." },
  schedule:      { title: "Schedule", description: "The Lower Merion Aces varsity schedule with times, places and results." },
  story:         { title: "Story of the Season", description: "The story of each Aces season, told in chapters." },
  championships: { title: "Championships", description: "Every Lower Merion title: 7 PIAA State, 18 District 1, 24 Central League and 16 Suburban League championships." },
  banners:       { title: "The Rafters", description: "Every championship banner in Lower Merion basketball history. Tap a banner for the team and the story." },
  rivalry:       { title: "Aces vs. Chester", description: "The Lower Merion vs. Chester rivalry: every playoff meeting since 1995, from Villanova to Hershey." },
  headtohead:    { title: "Head to Head", description: "The Aces' record against every Central League team, with every game, the biggest wins and the longest streaks." },
  seasons:       { title: "Every Season", description: "Every Lower Merion Aces team since 1921-22: records, titles, rosters, results and photos." },
  nextlevel:     { title: "Aces at the Next Level", description: "Lower Merion Aces who went on to play in college and the pros, with a map of every school." },
  numbers:       { title: "Who Wore It", description: "Every jersey number in Lower Merion basketball and the Aces who wore it." },
  league:        { title: "Central League", description: "The Central League: every member school and every champion since 1967-68." },
  alumni:        { title: "Alumni", description: "Lower Merion Aces alumni and the all-time varsity roster." },
  coaching:      { title: "Coaching Staff", description: "The Lower Merion Aces Basketball coaching staff, led by head coach Gregg Downer." },
  roster:        { title: "Roster", description: "The current Lower Merion Aces varsity roster.", hidden: true }, // placeholder names until the real roster is in
  records:       { title: "Record Book", description: "Lower Merion basketball season stat leaders and all-time program records." },
  photos:        { title: "Photo Gallery", description: "Thousands of Lower Merion Aces basketball photos, game by game and season by season." },
  videos:        { title: "Videos", description: "Lower Merion Aces Basketball videos." },
  kobe:          { title: "Kobe Bryant at Lower Merion", description: "Kobe Bryant's Lower Merion years: the 1996 state championship, 2,883 points and the gym that bears his name." },
  social:        { title: "Follow Us", description: "Follow Lower Merion Aces Basketball on social media." },
  hof:           { title: "Hall of Fame", description: "The Lower Merion Basketball Hall of Fame." },
  support:       { title: "Support the Aces", description: "Support Lower Merion Aces Basketball: donate, volunteer or get in touch." },
  youth:         { title: "Youth Programs", description: "Lower Merion youth basketball programs.", hidden: true }, // Programs menu is turned off
  academics:     { title: "Academics", description: "Lower Merion Aces in the classroom.", hidden: true },  // Programs menu is turned off
  sponsors:      { title: "Sponsors", description: "The businesses and families who support Lower Merion Aces Basketball, and how to become a sponsor." },
  flyers:        { title: "Flyer Studio", description: "Aces game day flyers.", private: true },
  scores:        { title: "Post Scores", description: "Coach tool.", private: true },
  scouting:      { title: "Scouting", description: "Coach tool.", private: true },
  practice:      { title: "Practice Plans", description: "Coach tool.", private: true },
  newsletter:    { title: "Newsletter Admin", description: "Admin tool.", private: true },
};

// Own-property checks, so an address like /constructor is just "not found".
export const isRoute = (id) => typeof id === "string" && Object.prototype.hasOwnProperty.call(routes, id);
export const isPrivate = (id) => isRoute(id) && !!routes[id].private;
export const isHidden = (id) => isRoute(id) && !!routes[id].hidden;

// "home" lives at "/", every other page at "/<id>".
export const pathFor = (id) => (id === "home" ? "/" : `/${id}`);

// "/News/" -> "news", "/clinics.html" -> "clinics", "/" -> "home". Unknown addresses come back as-is so the
// app can show its "page not found" view.
export const idFromPath = (pathname) => {
  const s = String(pathname || "/").replace(/\/index\.html$/i, "").replace(/\.html$/i, "").replace(/^\/+|\/+$/g, "").toLowerCase();
  return s === "" ? "home" : s;
};

export const fullTitle = (id) => {
  if (!isRoute(id) || id === "home") return SITE_NAME;
  const r = routes[id];
  return `${r.title} | ${SITE_NAME}`;
};
