// ─── TITLE GAME STORIES ─────────────────────────────────────────────────────
// Our own write-ups of Aces championship wins, newest first. Every fact here
// comes from the stories credited in `sources`; we do not copy their text.
// To add one: copy a block, write it in your own words, and credit where the
// facts came from.
//  · kind/year → which title (state | district | league) and the year it was won
//  · image     → team photo for the card and the story
//  · sources   → shown at the bottom of the story as "Reporting from"
const CL = (y) => `/central-league/${y - 1}-${y}.jpg`;
const WB = "https://web.archive.org/web/";

export const titleStories = [
  {
    id: "title-2025-league", kind: "league", year: 2025, sortKey: 20250210,
    date: "February 2025", category: "2025 Central League",
    title: "Aces Beat Penncrest for the 2025 Central League Title",
    excerpt: "Lower Merion 63, Penncrest 55. A team that started 0-2 in the league finished it holding the trophy.",
    image: CL(2025),
    body: [
      "Lower Merion beat Penncrest 63-55 in the Central League tournament final to win another league championship.",
      "It did not look like a title season in December. The Aces had graduated most of the group that won the league and District 1 a year earlier, and they dropped their first two league games, at Garnet Valley and at home to Conestoga, to sit at 2-3 overall.",
      "The low point came on January 11, a double overtime loss to a Penncrest team that was still unbeaten. Lower Merion did not lose again on the way to the final, beating Springfield in the semifinal to earn the rematch.",
      "This time the Aces controlled it. The final margin was eight, and the game was not as close as the score suggests.",
    ],
    sources: [
      { outlet: "This Is Lower Merion and Narberth", headline: "Lower Merion Wins Another Central League Hoop Title", date: "February 12, 2025", url: "https://thisislowermerion.com/?p=63123" },
    ],
  },
  {
    id: "title-2024-district", kind: "district", year: 2024, sortKey: 20240302,
    date: "March 2, 2024", category: "2024 District 1",
    title: "Mobley Leads Aces Past Garnet Valley for the District 1 Crown",
    excerpt: "Lower Merion 57, Garnet Valley 49 at the Liacouras Center. The program's third District 1 6A title in four years.",
    image: "/titles/district-2023-2024.jpg",
    body: [
      "Top seeded Lower Merion beat Central League rival Garnet Valley 57-49 at Temple's Liacouras Center to win the District 1 Class 6A championship, its third in four years. The win moved the Aces to 27-1.",
      "Garnet Valley scored the first basket of the night and then missed its last eight shots of the opening quarter. Lower Merion led 11-3 after one and never trailed again.",
      "John Mobley had 17 points and 10 rebounds. With the lead cut to six late in the third quarter, he buried a three at the buzzer to make it 49-39. Carson Kasmer came off the bench for 11 points and went 4 for 4 at the line in the fourth quarter, Owen McCabe scored 10, and Justin Mebane added 8 points and 3 blocks.",
      "Garnet Valley got within five with 30.7 seconds left, but free throws from Kasmer and Mobley closed it out. The Aces held the Jaguars to 17 of 56 shooting.",
      "It was the 18th District 1 title in program history, in Gregg Downer's 33rd season as head coach.",
    ],
    sources: [
      { outlet: "Delco Times", headline: "District 1 Class 6A Boys Basketball: Mobley finds the range to make Lower Merion champion", author: "Matt Smith", date: "March 2, 2024", url: "https://www.delcotimes.com/2024/03/02/district-1-class-6a-boys-basketball-mobley-finds-the-range-to-make-lower-merion-champion/" },
      { outlet: "The Philadelphia Inquirer", headline: "District 1 6A finals: Perkiomen Valley girls defend title; Lower Merion boys grab third crown in four years", author: "Josh Verlin and Owen McCue", date: "March 2, 2024", url: "https://www.inquirer.com/high-school-sports/perk-valley-girls-basketball-lower-merion-boys-district-title-20240302.html" },
    ],
  },
  {
    id: "title-2024-league", kind: "league", year: 2024, sortKey: 20240215,
    date: "February 2024", category: "2024 Central League",
    title: "A 20-4 Third Quarter Brings the Trophy Back to Bryant Gym",
    excerpt: "Lower Merion 68, Radnor 54. The Aces scored the first 17 points of the second half to take the Central League title back.",
    image: CL(2024),
    body: [
      "Lower Merion beat Radnor 68-54 at Marple Newtown to win the Central League championship. It was the third straight year the two met in the final, and Radnor came in as the defending champion.",
      "Radnor led by 10 in the first quarter. The game turned after halftime, when the Aces scored the first 17 points of the third quarter and won the period 20-4 to lead 47-30.",
      "Senior Adam Herrenkohl led the way with 16 points. Owen McCabe and Carson Kasmer had 14 each, and Jayden Robinson scored 13 while working the front of the press for steals and layups.",
      "The win was Lower Merion's 14th in a row and put the Aces at 23-1.",
    ],
    sources: [
      { outlet: "Main Line Media News", headline: "Lower Merion dunks Radnor for Central League boys basketball title", author: "Bob Grotz", date: "February 16, 2024", url: "https://www.mainlinemedianews.com/2024/02/16/lower-merion-dunks-radnor-for-central-league-boys-basketball-title/" },
    ],
  },
  {
    id: "title-2022-district", kind: "district", year: 2022, sortKey: 20220305,
    date: "March 5, 2022", category: "2022 District 1",
    title: "Back to Back: Aces Hold Off Norristown at Temple",
    excerpt: "Lower Merion 68, Norristown 57. Demetrius Lilley scored 24 as the Aces repeated as District 1 champions.",
    image: "/titles/district-2021-2022.jpg",
    body: [
      "Lower Merion beat Norristown 68-57 at the Liacouras Center to win a second straight District 1 Class 6A championship. The 2021 title had been won in front of a limited crowd. This one came on the big stage at Temple.",
      "The Aces jumped out 17-2 and led by 17 early in the second quarter. Norristown kept coming, cut it to 32-25 by halftime and tied the game at 39 late in the third.",
      "Lower Merion answered right away. Justin Poles scored on a drive, Demetrius Lilley converted a putback and the foul, and Poles scored again to make it 45-41 heading to the fourth.",
      "When Norristown got back within five with 2:20 to play, Lilley hit a three from the corner off a pass from Sam Wright and then dunked twice to finish it.",
      "Lilley scored 24. Jaylen Shippen had 13, Wright 12, Poles 10 and Sam Brown 9.",
    ],
    sources: [
      { outlet: "PA Prep Live", headline: "Lower Merion shows championship poise against Norristown to repeat as District 1 champion", author: "Andrew Robinson", date: "March 5, 2022", url: WB + "2022/https://papreplive.com/2022/03/05/lower-merion-shows-championship-poise-against-norristown-to-repeat-as-district-1-champion/" },
    ],
  },
  {
    id: "title-2022-league", kind: "league", year: 2022, sortKey: 20220214,
    date: "February 2022", category: "2022 Central League",
    title: "Lilley Takes Over Late as Aces Win the Central League",
    excerpt: "Lower Merion 59, Radnor 49 at Ridley. Demetrius Lilley scored 10 of his 20 in the fourth quarter.",
    image: CL(2022),
    body: [
      "Lower Merion beat Radnor 59-49 at Ridley High School to win the Central League championship, the first of the three goals the team had set for itself.",
      "Jaylen Shippen scored 9 of his 12 points in the first quarter as the Aces went up 17-8. Radnor stayed close and trailed by only three going into the fourth.",
      "Then Demetrius Lilley took over. The 6-9 senior, who had missed the first four games of the season with a back problem, scored 10 of his game high 20 in the final quarter, including two dunks. Lower Merion won the fourth 23-16 and led by double digits with about two minutes left.",
      "Sam Brown also scored 12.",
    ],
    sources: [
      { outlet: "City of Basketball Love", headline: "With Lilley at full strength, Lower Merion boys win Central League championship", author: "Ty Daubert", date: "February 15, 2022", url: "https://www.cityofbasketballlove.com/news_article/show/1209657" },
    ],
  },
  {
    id: "title-2021-district", kind: "district", year: 2021, sortKey: 20210319,
    date: "March 19, 2021", category: "2021 District 1",
    title: "First District Title Since 1996, Won at Home",
    excerpt: "Lower Merion 62, Abington 41 in Kobe Bryant Gymnasium. Demetrius Lilley scored 31.",
    image: "/titles/district-2020-2021.jpg",
    body: [
      "Lower Merion beat Abington 62-41 in Kobe Bryant Gymnasium to win the District 1 Class 6A championship, the program's first district title since Kobe Bryant's 1996 team. Abington had won the title in 2017, 2018 and 2019.",
      "The game was decided early. A 13-0 run made it 19-4 after one quarter, and the Aces led 39-17 at halftime after making 15 of 20 shots, 10 of them assisted.",
      "Junior center Demetrius Lilley scored 31 points and made all four of his threes. Senior point guard Sam Davison and sophomore Sam Brown did most of the rest. The three of them combined for 59 of the team's 62 points.",
      "The lead reached 30 in the third quarter, which put a running clock on the fourth.",
      "Lower Merion won four games in the district tournament, including a 59-50 win over top seeded Cheltenham, and moved on to the state semifinals. Gregg Downer, who coached the 1996 team, was on the bench for this one too.",
    ],
    sources: [
      { outlet: "PA Prep Live", headline: "Lower Merion wins first district title since Kobe Bryant era", author: "Bruce Adams", date: "March 19, 2021", url: WB + "20250722051737/https://papreplive.com/2021/03/19/lower-merion-wins-first-district-title-since-kobe-bryant-era/" },
    ],
  },
  {
    id: "title-2019-league", kind: "league", year: 2019, sortKey: 20190213,
    date: "February 13, 2019", category: "2019 Central League",
    title: "Three in a Row: Aces Run Away From Penncrest",
    excerpt: "Lower Merion 63, Penncrest 31 at Harriton. A third straight Central League title and the sixth in eight years.",
    image: CL(2019),
    body: [
      "Lower Merion beat Penncrest 63-31 at Harriton to win a third straight Central League championship, its sixth in eight years.",
      "The Aces scored the first 10 points, led 17-2 late in the first quarter and were in front from start to finish. Switching in and out of a 2-3 zone, they held Penncrest to a single made three.",
      "Jack Forrest led all scorers with 17 points. Steve Payne had 12 points and 7 assists, and Josh Martin had 10 points and 12 rebounds.",
    ],
    sources: [
      { outlet: "Central League", headline: "Lower Merion completes three-peat in style at Penncrest's expense", date: "February 14, 2019", url: "https://centralleague.digitalsports.com/2019/02/14/lower-merion-completes-three-peat-in-style-at-penncrests-expense/" },
    ],
  },
  {
    id: "title-2018-league", kind: "league", year: 2018, sortKey: 20180213,
    date: "February 2018", category: "2018 Central League",
    title: "Payne's Layup With 2.6 Seconds Left Wins It",
    excerpt: "Lower Merion 48, Penncrest 46 at Harriton. A second straight Central League title, decided on the last possession.",
    image: CL(2018),
    body: [
      "Lower Merion beat Penncrest 48-46 at Harriton to win a second straight Central League championship.",
      "With the score tied at 46 in the closing seconds, Steve Payne took a handoff from Darryl Taylor at the top of the key, drove and banked in a running layup with 2.6 seconds left. The Aces then defended Penncrest's final play.",
      "Payne finished with a team high 18 points, 8 rebounds and 4 assists. Harrison Klevan scored 13 and hit two threes in the second half. Josh Martin grabbed 10 rebounds, Taylor went 6 for 7 at the line, and Jack Forrest blocked two shots in the fourth quarter.",
      "The team's themes all season were \"Next Man Up\" and \"We over me\", after injuries and illness hit early in the year.",
    ],
    sources: [
      { outlet: "PA Prep Live", headline: "'Next Man Up' mentality gives Lower Merion 2nd consecutive Central League title", author: "Eddie Levin", date: "February 16, 2018", url: WB + "20250621145725/https://papreplive.com/2018/02/16/next-man-up-mentality-gives-lower-merion-2nd-consecutive-central-league-title/" },
    ],
  },
  {
    id: "title-2017-league", kind: "league", year: 2017, sortKey: 20170214,
    date: "February 14, 2017", category: "2017 Central League",
    title: "A Perfect Third Quarter Buries Strath Haven",
    excerpt: "Lower Merion 82, Strath Haven 60. The Aces made all 12 of their shots in the third quarter.",
    image: CL(2017),
    body: [
      "Lower Merion beat Strath Haven 82-60 at Marple Newtown to win the Central League championship, its first since 2014.",
      "Strath Haven led 9-3 early, and the Aces were up 30-22 at halftime. Then they did not miss. Lower Merion went 12 for 12 from the floor in the third quarter to stretch the lead to 61-39.",
      "Steve Payne scored 26 points, 15 of them in that third quarter. Jack Forrest had 18 points with five threes, 5 steals and 4 assists, Darryl Taylor scored 14, and Terrell Jones had 12 points and 10 rebounds. Payne, Forrest and Taylor were all sophomores. The team shot 31 of 47 for the night.",
      "During the national anthem the players wore black shirts that read \"I am a Muslim. I am a refugee. I am an immigrant. I am an American. I am an Ace.\" Senior Najja Walker-X led the effort.",
    ],
    sources: [
      { outlet: "City of Basketball Love", headline: "Lower Merion makes statement in Central League championship game", author: "Josh Verlin", date: "February 14, 2017", url: "https://www.cityofbasketballlove.com/news_article/show/757853" },
      { outlet: "Central League", headline: "Unified Lower Merion makes statement in capturing crown", date: "February 15, 2017", url: "https://centralleague.digitalsports.com/2017/02/15/unified-lower-merion-makes-statement-in-capturing-crown/" },
    ],
  },
  {
    id: "title-2014-league", kind: "league", year: 2014, sortKey: 20140211,
    date: "February 11, 2014", category: "2014 Central League",
    title: "Three Straight: Aces Top Conestoga and Cut Down the Net",
    excerpt: "Lower Merion 64, Conestoga 55 at Harriton. A third straight Central League playoff title for a team that lost 10 seniors.",
    image: CL(2014),
    body: [
      "Top seeded Lower Merion beat Conestoga 64-55 at Harriton to win a third straight Central League playoff title. The Aces had graduated 10 seniors from the state championship team and started the season 1-3. This was their 15th win in 16 games.",
      "Conestoga scored the first six points and led 19-13 after one quarter. Lower Merion won the second quarter 16-6 to go up 29-25 at the half and never trailed again.",
      "Conestoga got back within two in the fourth quarter. Corey Sherman answered with two threes to start an 8-0 run that made it 52-42. He finished with 16 points. Jule Brown capped the night with a steal and a dunk in the final two minutes.",
      "The players and coaches cut down the net afterward. The win left the Aces 17-6 overall and 16-2 in the league.",
    ],
    sources: [
      { outlet: "Delco Hoops", headline: "Lower Merion shoots downs Conestoga in Central League final", author: "Eddie Levin", date: "February 12, 2014", url: "https://delcohoops.com/lower-merion-shoots-downs-conestoga-in-central-league-final/" },
      { outlet: "Lower Merion Athletics", headline: "THREE-PEAT! Aces beat Conestoga 64-55 for third straight Central League championship", author: "J.J. Daigneault '16", date: "February 12, 2014", url: "https://lmaces.digitalsports.com/2014/02/12/three-peat-aces-beat-conestoga-64-55-for-third-straight-central-league-championship/" },
    ],
  },
  {
    id: "title-2013-state", kind: "state", year: 2013, sortKey: 20130323,
    date: "March 23, 2013", category: "2013 State Champions",
    title: "State Champions: Aces End Chester's Reign in Hershey",
    excerpt: "Lower Merion 63, Chester 47 at the Giant Center. The seventh state title in program history.",
    image: "/titles/state-2012-2013.jpg",
    body: [
      "Lower Merion beat Chester 63-47 at the Giant Center in Hershey to win the PIAA Class AAAA championship. It was the seventh state title in program history and the first since 2006, and it finished a 30-3 season that tied the best record the program has had.",
      "Chester was the two time defending champion. The Clippers had beaten the Aces 59-33 in the 2012 state final and had beaten them again in the District 1 championship a few weeks earlier.",
      "Chester led 14-12 after one quarter. Its last lead came with 3:10 left in the half, when a three from Baird Howland off the bench started a 10-0 run that sent Lower Merion to the locker room up 28-20. Howland hit another three in the third quarter to push the lead to ten, and the Aces won the fourth quarter 20-11.",
      "B.J. Johnson led everyone with 22 points and 11 rebounds. Raheem Hall scored 12. Yohanny Dalembert had 10 points and 7 rebounds, with 8 of those points coming in the fourth quarter. Justin McFadden added 5 points and 9 rebounds.",
      "Lower Merion shot 48 percent and held Chester to 31 percent, including 1 of 13 on threes.",
    ],
    sources: [
      { outlet: "Trib HSSN", headline: "Lower Merion Ends Chester's Reign As PIAA Quad-A Champs", author: "Bruce Markey", date: "March 24, 2013", url: "https://tribhssn.triblive.com/lower-merion-ends-chesters-reign-as-piaa-quad-a-champs/" },
      { outlet: "Patch", headline: "Aces Win State Basketball Title Against Rival Chester", author: "Amanda Mahnke", date: "March 25, 2013", url: "https://patch.com/pennsylvania/ardmore/aces-win-state-basketball-championship-against-rival-chester" },
    ],
  },
  {
    id: "title-2013-league", kind: "league", year: 2013, sortKey: 20130211,
    date: "February 11, 2013", category: "2013 Central League",
    title: "Aces Beat Ridley for a Second Straight League Title",
    excerpt: "Lower Merion 57, Ridley 50 at Marple Newtown. The 42nd straight Central League win.",
    image: CL(2013),
    body: [
      "Lower Merion beat Ridley 57-50 at Marple Newtown to win a second straight Central League championship. It was the Aces' 42nd consecutive win against Central League opponents.",
      "B.J. Johnson scored 14 points, and Yohanny Dalembert and Raheem Hall each had 10. Six weeks later the same group won the state title in Hershey.",
    ],
    sources: [
      { outlet: "The Philadelphia Inquirer", headline: "Pa. Boys: Lower Merion defeats Ridley, 57-50", author: "Tim McManus", date: "February 13, 2013", url: WB + "20131114110446/http://articles.philly.com/2013-02-13/sports/37060980_1_yohanny-dalembert-raheem-hall-lower-merion" },
    ],
  },
  {
    id: "title-2012-league", kind: "league", year: 2012, sortKey: 20120211,
    date: "February 11, 2012", category: "2012 Central League",
    title: "A 40-6 Run Takes the Crown From Upper Darby",
    excerpt: "Lower Merion 71, Upper Darby 31 at Penncrest. The Aces finished the league season 17-0.",
    image: CL(2012),
    body: [
      "Lower Merion beat defending champion Upper Darby 71-31 at Penncrest to win the Central League championship.",
      "Upper Darby led 17-11 after the first quarter. Over the next two quarters the Aces outscored the Royals 40-6.",
      "The win made Lower Merion 21-2 overall and a perfect 17-0 in the league.",
    ],
    sources: [
      { outlet: "Delco Hoops", headline: "Lower Merion Wins Central Crown", date: "February 12, 2012", url: "https://delcohoops.blogspot.com/2012/02/lower-merion-wins-central-crown.html" },
    ],
  },
  {
    id: "title-2009-league", kind: "league", year: 2009, sortKey: 20090207,
    date: "February 2009", category: "2009 Central League",
    title: "Aces Hand Conestoga Its First Loss to Win the League Tournament",
    excerpt: "Lower Merion 46, Conestoga 41 in the first Central League tournament championship game.",
    image: CL(2009),
    body: [
      "Lower Merion beat previously undefeated Conestoga 46-41 to win the first Central League tournament championship.",
      "The Aces led 36-23 after three quarters, holding Conestoga to two points in the third, and then held on through an 18 point fourth quarter by the Pioneers.",
      "Alon Seltzer scored 18 points. Harley Williamson had 11, Greg Robbins 8, Matt McKenna 5 and Oliver Cohen 4.",
      "The season had started 1-3. The title game was part of a 17 game winning streak that carried Lower Merion to 22-4 and the district quarterfinals.",
    ],
    sources: [
      { outlet: "MaxPreps", headline: "Pennsylvania: Lower Merion a Threat Again", author: "Joseph Santoliquito", date: "February 19, 2009", url: "https://www.maxpreps.com/news/6LOP9DxJzE2dCpIbeI1L7Q/pennsylvania-lower-merion-a-threat-again.htm" },
      { outlet: "The Philadelphia Inquirer", headline: "Pennsylvania Scoreboard", date: "February 8, 2009", url: "https://www.inquirer.com/philly/sports/high_school/20090208_Pennsylvania_Scoreboard.html" },
    ],
  },
  {
    id: "title-2006-state", kind: "state", year: 2006, sortKey: 20060325,
    date: "March 25, 2006", category: "2006 State Champions",
    title: "State Champions: Three Blocks in the Final Minute Beat Schenley",
    excerpt: "Lower Merion 60, Schenley 58 at the Giant Center. The Aces came back from down 9-0 and down eight late in the third.",
    image: CL(2006),
    body: [
      "Lower Merion beat Schenley 60-58 at the Giant Center in Hershey to win the PIAA Class AAAA championship, the second state title under Gregg Downer. The Aces finished 28-6. Schenley came in 30-2.",
      "Schenley scored the first nine points. Downer called timeout and switched to a triangle and two, and Lower Merion answered with an 18-4 run. The Aces still trailed 26-22 at the half and 41-33 late in the third quarter before a 17-2 run put them up 50-43 with six minutes to play.",
      "Schenley took its last lead at 58-57 with 1:12 left. Ryan Brooks made two free throws to put Lower Merion back in front.",
      "The defense finished it. In the final minute Greg Robbins and Garrett Williamson each blocked a shot by Schenley's D.J. Kennedy, and Robbins, a freshman, blocked Kennedy again as time ran out.",
      "Brooks scored a game high 22 points. Robbins had 13, and Williamson blocked 5 shots. Brooks and Williamson had lost the state final to Chester a year earlier.",
      "Two details from the night tie it to 1996. Downer changed from loafers into sneakers at halftime, as he had ten years before, and Kobe Bryant called the team bus before the game.",
    ],
    sources: [
      { outlet: "The Philadelphia Inquirer", headline: "Lower Merion storms back to win the crown", author: "Jeff McLane", date: "March 26, 2006", url: WB + "20151222074257/http://articles.philly.com/2006-03-26/sports/25415014_1_eric-barefield-merion-coach-gregg-downer-garrett-williamson" },
      { outlet: "The Philadelphia Inquirer", headline: "At crunch time, Aces swatted away foe", author: "Rob Parent", date: "March 26, 2006", url: WB + "20151222073931/http://articles.philly.com/2006-03-26/sports/25414352_1_gregg-downer-lower-merion-greg-robbins" },
    ],
  },
  {
    id: "title-1996-state", kind: "state", year: 1996, sortKey: 19960323,
    date: "March 23, 1996", category: "1996 State Champions",
    title: "State Champions: Kobe and the Aces Finish the Job in Hershey",
    excerpt: "Lower Merion 48, Erie Cathedral Prep 43 at HersheyPark Arena. The program's first state title since 1943.",
    image: CL(1996),
    body: [
      "Lower Merion beat Erie Cathedral Prep 48-43 at HersheyPark Arena to win the PIAA Class AAAA championship, the program's first state title since 1943. A crowd of 8,242 watched, including three busloads of Lower Merion fans.",
      "Cathedral Prep slowed the game down and sent two and three defenders at Kobe Bryant every time he touched the ball. He did not score in the first quarter, and the Aces trailed 13-5 and then 21-15 at halftime.",
      "The third quarter changed everything. Lower Merion opened the half with an 11-0 run for its first lead and won the quarter 22-10, with Emory Dabney hitting two threes.",
      "Bryant finished with 17 points, 9 rebounds and 3 assists. Jermaine Griffin had 10 points and 8 rebounds and made 5 of 6 shots after halftime. Omar Hatcher, starting in place of the injured Dan Pangrazio, had 6 points, including the layup off a Bryant pass that made it 47-43 in the final minute. Brendan Pettit scored 5.",
      "The season had started 4-3. After a loss at the Beach Ball Classic in Myrtle Beach, Gregg Downer called a team meeting in the hotel about putting the team ahead of yourself. The Aces did not lose again, winning 27 straight, including the Central League, the District 1 title and an overtime win over Chester in the Eastern final.",
      "Bryant played the semifinal and the final with a broken nose. He ended his career with 2,883 points, the Southeastern Pennsylvania record. The next day there was a parade through Ardmore.",
      "In December 2023 the 1996 team was inducted into the Lower Merion Basketball Hall of Fame in Kobe Bryant Gymnasium.",
    ],
    sources: [
      { outlet: "Philadelphia Daily News", headline: "Bryant Show Ends With State Crown", author: "Ted Silary", date: "March 25, 1996", url: WB + "20151018090109/http://articles.philly.com/1996-03-25/sports/25636140_1_bryant-show-kobe-bryant-gregg-downer" },
      { outlet: "The Philadelphia Inquirer", headline: "Pangrazio's Heart Was On Court, But Injury Kept Him On Sideline", author: "Brian Miller", date: "March 25, 1996", url: WB + "20151018090337/http://articles.philly.com/1996-03-25/sports/25635419_1_lower-merion-leg-omar-hatcher" },
      { outlet: "The Philadelphia Inquirer", headline: "For L. Merion, Road To The Top Had Humble Start", author: "Chris Morkides", date: "March 25, 1996", url: WB + "20151018115505/http://articles.philly.com/1996-03-25/sports/25638777_1_gregg-downer-lower-merion-familiar-foe" },
      { outlet: "The Philadelphia Inquirer", headline: "L. Merion Parade Celebrates Team's Title", author: "Anthony Beckman", date: "March 25, 1996", url: WB + "20151018112201/http://articles.philly.com/1996-03-25/news/25635835_1_aces-orange-and-black-clad-fans-sweater" },
      { outlet: "The Philadelphia Inquirer", headline: "Lower Merion's 1996 state champion team inducted into school's Hall of Fame during Kobe Bryant Classic", author: "Owen McCue", date: "December 9, 2023", url: "https://www.inquirer.com/high-school-sports/lower-merion-state-champion-inducted-hall-of-fame-kobe-bryant-classic-20231209.html" },
    ],
  },
  {
    id: "title-1996-district", kind: "district", year: 1996, sortKey: 19960301,
    date: "March 1, 1996", category: "1996 District 1",
    title: "Revenge at Villanova: Aces Beat Chester for the District Title",
    excerpt: "Lower Merion 60, Chester 53 in front of a sellout crowd. The first district title since 1978.",
    image: CL(1996),
    body: [
      "Lower Merion beat top seeded Chester 60-53 at Villanova to win the District 1 Class AAAA championship, its first district title since 1978. A sellout crowd of 6,500 filled the Pavilion.",
      "A year earlier Chester had beaten the Aces by 27 in the same game. Lower Merion warmed up in maroon shirts with the number 27 on the back.",
      "Chester led 29-22 at halftime and 31-22 early in the third quarter. Kobe Bryant and Jermaine Griffin then scored six points each in a 14-1 run that put the Aces in front 36-32.",
      "Chester's pressure forced nine turnovers in the fourth quarter and cut the lead to 48-47 with about three minutes left. Bryant closed it out at the foul line, making ten free throws down the stretch.",
      "Bryant scored more than 30 points and added 11 rebounds, 9 blocks and 6 assists. Griffin scored 18. The win made Lower Merion 26-3.",
    ],
    sources: [
      { outlet: "The Philadelphia Inquirer", headline: "Bryant Leads L. Merion To District Title", author: "Chris Morkides", date: "March 2, 1996", url: WB + "20160103084114/http://articles.philly.com/1996-03-02/sports/25635699_1_merion-coach-gregg-downer-lower-merion-chester" },
      { outlet: "Philadelphia Daily News", headline: "Bryant Fuels LM's Revenge Victory", author: "Ted Silary", date: "March 2, 1996", url: WB + "20160103075344/http://articles.philly.com/1996-03-02/sports/25636144_1_chester-kobe-bryant-jermaine-griffin" },
    ],
  },
  {
    id: "title-1995-league", kind: "league", year: 1995, sortKey: 19950206,
    date: "February 6, 1995", category: "1995 Central League",
    title: "Kobe Scores 42 as Aces Clinch First League Title in 17 Years",
    excerpt: "Lower Merion 76, Ridley 70 in Ardmore. The first Central League title since 1977-78.",
    image: CL(1995),
    body: [
      "Lower Merion beat Ridley 76-70 in Ardmore to clinch the Central League championship with two league games still to play. It was the program's first league title since 1977-78, and it came against the six time defending champion.",
      "Kobe Bryant, a junior, scored a career high 42 points.",
      "The Aces led 41-36 at the half. Ridley scored 11 straight in the third quarter and led 51-46 going into the fourth.",
      "Bryant and Jermaine Griffin combined for 25 points in the fourth quarter. Griffin, who scored 12 of his 14 in the period, put Lower Merion ahead for good at 61-59 on a rebound basket with 4:19 left, and a 6-0 run stretched it to 71-62.",
      "The win made the Aces 20-1 overall and 16-0 in the league.",
    ],
    sources: [
      { outlet: "The Philadelphia Inquirer", headline: "Lower Merion Drops Ridley To Clinch Central", author: "Chris Morkides", date: "February 7, 1995", url: WB + "20160416052038/http://articles.philly.com/1995-02-07/news/25704756_1_green-raiders-gregg-downer-ridley" },
    ],
  },
];
