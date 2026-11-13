// ─── GAME GALLERIES BY TOM WEISHAAR ─────────────────────────────────────────
// Links out to Tom Weishaar's public Lower Merion basketball albums. We link to
// his galleries (where prints can be ordered); we do not copy his photos here.
// To add one: copy a line. `slug` is the last part of the album's web address.
//  · tag → small gold label   · storyId → adds a link to this album inside that title story
const BASE = "https://tomweishaar.smugmug.com/Public-PRINTS/Lower-Merion-Sports/";
export const tomHome = "https://tomweishaar.smugmug.com/Public-PRINTS/Lower-Merion-Sports";
export const tomContact = { name: "Tom Weishaar", email: "tom@OneMoreShot.com", phone: "610-909-2000" };

const g = (season, title, date, slug, extra = {}) => ({ season, title, date, url: BASE + slug, ...extra });

export const tomGalleries = [
  g("2024-25", "Central League Final vs. Penncrest", "February 10, 2025", "Lower-Merion-ACES-Basketball-vs-Penncrest-02102025", { storyId: "title-2025-league", tag: "Champions" }),
  g("2023-24", "Team Celebration", "April 7, 2024", "ACES-Basketball-Celebration-April-7-2024"),
  g("2023-24", "District 1 Champions vs. Garnet Valley", "March 2, 2024", "Lower-Merion-ACES-District-Champions-03022024", { storyId: "title-2024-district", tag: "Champions" }),
  g("2023-24", "District 1 Semifinal vs. Chester", "February 27, 2024", "Lower-Merion-ACES-vs-Chester-02272024"),
  g("2023-24", "Central League Final vs. Radnor", "February 15, 2024", "ACES-boys-basketball-vs-Radnor-02152024", { storyId: "title-2024-league", tag: "Champions" }),
  g("2021-22", "State Playoffs vs. Roman Catholic", "March 19, 2022", "Lower-Merion-BASKETBALL-vs-Roman-03192022"),
  g("2021-22", "District 1 Champions vs. Norristown", "March 5, 2022", "Lower-Merion-ACES-DISTRICT-1-CHAMPIONS-03052022", { storyId: "title-2022-district", tag: "Champions" }),
  g("2021-22", "Central League Final vs. Radnor", "February 14, 2022", "Lower-Merion-ACES-Basketball-vs-Radnor-02142022", { storyId: "title-2022-league", tag: "Champions" }),
  g("2020-21", "District 1 Final vs. Abington", "March 19, 2021", "Lower-Merion-ACES-vs-Abington-DISTRICT-1-FINALS-03192021", { storyId: "title-2021-district", tag: "Champions" }),
  g("2019-20", "State Qualifier vs. CB East", "February 18, 2020", "Lower-Merion-ACES-vs-CB-East-State-Qualifiers-02182020"),
  g("2018-19", "Awards Banquet", "2019", "Lower-Merion-Boys-Basketball-2019-Awards-Banquet"),
  g("2018-19", "Aces Brothers", "2019", "Lower-Merion-Aces-BROTHERS-2019"),
  g("2018-19", "District 1 Quarterfinal vs. Chester", "February 22, 2019", "Lower-Merion-Boys-Basketball-vs-Chester-02222019"),
  g("2018-19", "District 1 Playoffs vs. Conestoga", "February 19, 2019", "Lower-Merion-vs-Conestoga-Districts-02192019"),
  g("2018-19", "Central League Final vs. Penncrest", "February 13, 2019", "Lower-Merion-Boys-Basketball-vs-Penncrest-CENTRAL-LEAGUE", { storyId: "title-2019-league", tag: "Champions" }),
  g("2018-19", "vs. Haverford", "January 25, 2019", "Lower-Merion-BASKETBALL-vs-Haverford-01252019"),
  g("2018-19", "vs. Haverford, second album", "January 25, 2019", "Lower-Merion-Boys-basketball-vs-Haverford-01252019"),
  g("2018-19", "JV and Varsity vs. Marple Newtown", "January 11, 2019", "Lower-Merion-Boys-JV-Varsity-BASKETBALL-vs-Marple-Newtown"),
  g("2018-19", "JV and Varsity vs. Ridley", "January 4, 2019", "Lower-Merion-Boys-Basketball-vs-Ridley-01042019"),
  g("2018-19", "vs. Conestoga, JV too", "December 21, 2018", "Lower-Merion-ACES-Boys-Basketball-vs-Conestoga-JV-Too"),
  g("2018-19", "vs. Haverford", "December 11, 2018", "Lower-Merion-ACES-vs-Haverford-High-School-12112018"),
  g("2018-19", "Maroon Madness", "November 30, 2018", "Lower-Merion-MAROON-MADNESS-11302018"),
  g("2018-19", "Maroon Madness, second album", "November 30, 2018", "Lower-Merion-HS-MAROON-MADNESS-11302018"),
  g("2017-18", "Alumni Game", "June 10, 2018", "Lower-Merion-ACES-2018-Alumni-Game-06-10-2018"),
  g("2017-18", "vs. Neshaminy", "", "Lower-Merion-Boys-Basketball-vs-Neshaminy"),
  g("2017-18", "vs. Abington at the Liacouras Center", "", "Lower-Merion-Basketball-vs-Abington-at-The-Liacouras-Center"),
  g("2017-18", "District 1 Playoffs vs. Pennridge", "February 23, 2018", "Lower-Merion-BASKETBALL-vs-Pennridge-02-23-2018"),
  g("2017-18", "District 1 Playoffs vs. Conestoga", "February 20, 2018", "Lower-Merion-ACES-vs-Conestoga-02-20-2018"),
  g("2017-18", "vs. Penncrest", "", "Lower-Merion-Basketball-vs-Penncrest"),
  g("2017-18", "vs. Conestoga", "February 2, 2018", "Lower-Merion-Boys-Basketball-vs-Conestoga-Feb-022018"),
  g("2017-18", "vs. Allentown", "January 7, 2018", "Lower-Merion-Boys-Basketball-vs-Allentown-January-7-2018"),
  g("2017-18", "vs. Chester", "", "Lower-Merion-HS-Boys-BASKETBALL-vs-Chester-HS"),
];
