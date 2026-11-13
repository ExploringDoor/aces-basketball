// ─── ACES vs CHESTER ────────────────────────────────────────────────────────
// Every meeting we can verify, newest first. Scores are Lower Merion first.
// Sources: the program's published schedules (2005-06 on) and newspaper game stories.
//  · w → true when the Aces won   · big → a final or a game that decided a title
//  · storyId → links to one of our title stories
export const chesterGames = [
  { date: "February 27, 2024", event: "District 1 semifinal", place: "Kobe Bryant Gymnasium", lm: 54, them: 48, w: true, big: true,
    note: "Tied at 47 with under two minutes left. A steal and late free throws send the Aces to the final, which they win four days later. John Mobley scores 17." },
  { date: "February 2020",     event: "District 1 quarterfinal", place: "at Chester", lm: 46, them: 54, w: false },
  { date: "February 22, 2019", event: "District 1 quarterfinal", lm: 67, them: 59, w: true,
    note: "Jack Forrest scores 31 with seven threes." },
  { date: "December 27, 2018", event: "Kobe Bryant Classic", lm: 59, them: 55, w: true },
  { date: "December 9, 2017",  event: "Regular season", lm: 57, them: 52, w: true },
  { date: "March 23, 2013",    event: "PIAA state final", place: "Giant Center, Hershey", lm: 63, them: 47, w: true, big: true, storyId: "title-2013-state",
    note: "The Aces end three straight losses to Chester and its two year run as state champion. B.J. Johnson has 22 points and 11 rebounds." },
  { date: "March 1, 2013",     event: "District 1 final", place: "Villanova", lm: 46, them: 60, w: false, big: true,
    note: "Three weeks later the Aces got the rematch that mattered." },
  { date: "March 24, 2012",    event: "PIAA state final", place: "Bryce Jordan Center, Penn State", lm: 33, them: 59, w: false, big: true,
    note: "Chester finishes 32-0. The loss the 2013 Aces spent a year answering." },
  { date: "March 2, 2012",     event: "District 1 final", place: "Villanova", lm: 53, them: 61, w: false, big: true },
  { date: "December 27, 2006", event: "Regular season", lm: 49, them: 48, w: true, note: "Overtime." },
  { date: "March 22, 2006",    event: "PIAA state semifinal", place: "The Palestra", lm: 70, them: 65, w: true, big: true, storyId: "title-2006-state",
    note: "Down 50-39 with 7:35 left, the Aces press and score 33 points in the fourth quarter. Ryan Brooks has 26 points and 18 rebounds, Garrett Williamson 22. Three days later they are state champions." },
  { date: "March 3, 2006",     event: "District 1 final", place: "Villanova", lm: 80, them: 83, w: false, big: true,
    note: "Overtime. Chester wins it on a three at the buzzer. Brooks scores 27, Williamson 21." },
  { date: "December 27, 2005", event: "Regular season", place: "Widener University", lm: 52, them: 53, w: false },
  { date: "March 19, 2005",    event: "PIAA state final", place: "Hershey", lm: 61, them: 74, w: false, big: true,
    note: "The Aces reached the final as a No. 12 district seed, the lowest seed ever to get there. Ryan Brooks has 21 points and 10 rebounds." },
  { date: "March 20, 1996",    event: "PIAA state semifinal", place: "The Palestra", lm: 77, them: 69, w: true, big: true, storyId: "title-1996-state",
    note: "Overtime. Kobe Bryant scores 39, with 12 in the fourth quarter and 8 in overtime, and the Aces go on to win the state title." },
  { date: "March 1, 1996",     event: "District 1 final", place: "Villanova", lm: 60, them: 53, w: true, big: true, storyId: "title-1996-district",
    note: "The Aces warm up in shirts with 27 on the back, the margin of the year before, then win their first district title since 1978." },
  { date: "March 3, 1995",     event: "District 1 final", place: "Villanova", lm: 50, them: 77, w: false, big: true,
    note: "A 27 point loss that Kobe Bryant and the Aces carried into the next season." },
];
