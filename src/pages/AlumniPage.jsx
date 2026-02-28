// pages/AlumniPage.jsx
import { useState } from "react";
import { FadeIn, Spade, alumni } from "../shared";

const rosterData = {
  "2005-06": [
    { number:"", last:"Cohen",      first:"Oliver",  height:"6'1", pos:"G",   grad:"2010", college:"" },
    { number:"", last:"D'Angelo",   first:"Sal",     height:"5'8", pos:"G",   grad:"2010", college:"" },
    { number:"", last:"Escott",     first:"Kevin",   height:"6'1", pos:"G/F", grad:"2008", college:"" },
    { number:"", last:"Green",      first:"Galloway",height:"6'4", pos:"F",   grad:"2008", college:"" },
    { number:"", last:"Johnson",    first:"Carl",    height:"6'0", pos:"G",   grad:"2008", college:"" },
    { number:"", last:"Joseph",     first:"Mike",    height:"6'6", pos:"F",   grad:"2009", college:"" },
    { number:"", last:"Lucas",      first:"Ben",     height:"5'11",pos:"G",   grad:"2008", college:"" },
    { number:"", last:"Meehan",     first:"Steve",   height:"6'3", pos:"G",   grad:"2008", college:"" },
    { number:"", last:"Robbins",    first:"Greg",    height:"6'4", pos:"G/F", grad:"2009", college:"" },
    { number:"", last:"Seltzer",    first:"Alon",    height:"6'4", pos:"G",   grad:"2010", college:"" },
    { number:"", last:"Stahler",    first:"Eric",    height:"6'4", pos:"G",   grad:"2009", college:"" },
    { number:"", last:"Williamson", first:"Harley",  height:"6'5", pos:"F/G", grad:"2009", college:"" },
  ],
  "2006-07": [
    { number:"0",  last:"Ajirotutu",first:"Tobi",    height:"5'0", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Cohen",    first:"Oliver",  height:"6'1", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Escott",   first:"Kevin",   height:"6'1", pos:"G/F", grad:"2008", college:"" },
    { number:"",   last:"Foote",    first:"Conor",   height:"5'11",pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Green",    first:"Galloway",height:"6'4", pos:"F",   grad:"2008", college:"" },
    { number:"",   last:"Johnson",  first:"Carl",    height:"6'0", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Joseph",   first:"Mike",    height:"6'6", pos:"F",   grad:"2009", college:"" },
    { number:"",   last:"King",     first:"Andrew",  height:"6'4", pos:"F",   grad:"2008", college:"" },
    { number:"",   last:"Lucas",    first:"Ben",     height:"5'11",pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Meehan",   first:"Steve",   height:"6'3", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Robbins",  first:"Greg",    height:"6'4", pos:"G/F", grad:"2009", college:"" },
    { number:"",   last:"Seltzer",  first:"Alon",    height:"6'4", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Stahler",  first:"Eric",    height:"6'4", pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Staley",   first:"Aaron",   height:"6'5", pos:"F",   grad:"2010", college:"" },
    { number:"",   last:"Williamson",first:"Harley", height:"6'5", pos:"F/G", grad:"2009", college:"" },
  ],
  "2007-08": [
    { number:"0",  last:"Ajirotutu",first:"Tobi",    height:"5'0", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Cohen",    first:"Oliver",  height:"6'1", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"D'Angelo", first:"Sal",     height:"5'8", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Escott",   first:"Kevin",   height:"6'1", pos:"G/F", grad:"2008", college:"" },
    { number:"",   last:"Foote",    first:"Conor",   height:"5'11",pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Green",    first:"Galloway",height:"6'4", pos:"F",   grad:"2008", college:"" },
    { number:"",   last:"Johnson",  first:"Carl",    height:"6'0", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"King",     first:"Andrew",  height:"6'4", pos:"F",   grad:"2008", college:"" },
    { number:"",   last:"Lucas",    first:"Ben",     height:"5'11",pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Meehan",   first:"Steve",   height:"6'3", pos:"G",   grad:"2008", college:"" },
    { number:"",   last:"Robbins",  first:"Greg",    height:"6'4", pos:"G/F", grad:"2009", college:"" },
    { number:"",   last:"Roxton",   first:"Micheal", height:"5'10",pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Seltzer",  first:"Alon",    height:"6'4", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Stahler",  first:"Eric",    height:"6'4", pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Weldon",   first:"Vince",   height:"5'10",pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Williamson",first:"Harley", height:"6'5", pos:"F/G", grad:"2009", college:"" },
  ],
  "2008-09": [
    { number:"",   last:"Ancona-Cole",first:"David", height:"6'2", pos:"F",   grad:"2010", college:"" },
    { number:"",   last:"Bibbs",    first:"Nick",    height:"5'10",pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Foote",    first:"Conor",   height:"5'11",pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Hall",     first:"Marquise",height:"5'11",pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Hall",     first:"Darius",  height:"5'10",pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Hoffstein",first:"JJ",      height:"6'2", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Joseph",   first:"Mike",    height:"6'6", pos:"F",   grad:"2009", college:"" },
    { number:"",   last:"McKenna",  first:"Matt",    height:"5'9", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Moran",    first:"Joe",     height:"6'1", pos:"F",   grad:"2009", college:"" },
    { number:"",   last:"Robbins",  first:"Greg",    height:"6'4", pos:"G/F", grad:"2009", college:"" },
    { number:"",   last:"Seltzer",  first:"Alon",    height:"6'4", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Stahler",  first:"Eric",    height:"6'4", pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Staley",   first:"Aaron",   height:"6'5", pos:"F",   grad:"2010", college:"" },
    { number:"",   last:"Weldon",   first:"Vince",   height:"5'10",pos:"G",   grad:"2009", college:"" },
    { number:"",   last:"Williamson",first:"Harley", height:"6'5", pos:"F/G", grad:"2009", college:"" },
  ],
  "2009-10": [
    { number:"",   last:"Ancona-Cole",first:"David", height:"6'2", pos:"F",   grad:"2010", college:"" },
    { number:"",   last:"Buchwald",  first:"Mike",   height:"6'2", pos:"F",   grad:"2011", college:"" },
    { number:"",   last:"Capkin",   first:"Mike",    height:"6'0", pos:"G",   grad:"2011", college:"DeSales University (D3)" },
    { number:"",   last:"Chambers", first:"Luke",    height:"6'4", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Cohen",    first:"Oliver",  height:"6'1", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Eisenstaedt",first:"Colin", height:"6'0", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Foote",    first:"Conor",   height:"5'11",pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Green",    first:"Eric",    height:"6'2", pos:"F",   grad:"2011", college:"" },
    { number:"",   last:"Hall",     first:"Darius",  height:"5'10",pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Hoffstein",first:"JJ",      height:"6'2", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"McKenna",  first:"Matt",    height:"5'9", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Mentel",   first:"Guy",     height:"6'3", pos:"F",   grad:"2010", college:"" },
    { number:"",   last:"Peterson", first:"Dan",     height:"6'4", pos:"F",   grad:"2011", college:"" },
    { number:"15", last:"Robbins",  first:"Mike",    height:"6'2", pos:"G",   grad:"2012", college:"" },
    { number:"",   last:"Seltzer",  first:"Alon",    height:"6'4", pos:"G",   grad:"2010", college:"" },
    { number:"",   last:"Staley",   first:"Aaron",   height:"6'5", pos:"F",   grad:"2010", college:"" },
  ],
  "2010-11": [
    { number:"",   last:"Buchwald",  first:"Mike",   height:"6'2", pos:"F",   grad:"2011", college:"" },
    { number:"",   last:"Capkin",   first:"Mike",    height:"6'0", pos:"G",   grad:"2011", college:"DeSales University (D3)" },
    { number:"",   last:"Chambers", first:"Luke",    height:"6'4", pos:"G",   grad:"2011", college:"" },
    { number:"40", last:"Dalembert",first:"Yohanny", height:"6'8", pos:"F",   grad:"2013", college:"" },
    { number:"",   last:"Eisenstaedt",first:"Colin", height:"6'0", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Forrester",first:"Chris",   height:"5'11",pos:"G",   grad:"2012", college:"" },
    { number:"",   last:"Green",    first:"Eric",    height:"6'2", pos:"F",   grad:"2011", college:"" },
    { number:"",   last:"Hall",     first:"Darius",  height:"5'10",pos:"G",   grad:"2011", college:"" },
    { number:"34", last:"Hall",     first:"Raheem",  height:"6'2", pos:"G",   grad:"2013", college:"" },
    { number:"5",  last:"Johnson",  first:"BJ",      height:"6'7", pos:"G",   grad:"2013", college:"Syracuse → La Salle (D1)" },
    { number:"",   last:"Jones",    first:"CJ",      height:"6'0", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Krantz",   first:"Mark",    height:"5'10",pos:"G",   grad:"2011", college:"" },
    { number:"25", last:"McFadden", first:"Justin",  height:"6'4", pos:"F/G", grad:"2014", college:"" },
    { number:"",   last:"McKenna",  first:"Matt",    height:"5'9", pos:"G",   grad:"2011", college:"" },
    { number:"",   last:"Peterson", first:"Dan",     height:"6'4", pos:"F",   grad:"2011", college:"" },
    { number:"31", last:"Reynolds", first:"Darryl",  height:"6'6", pos:"F",   grad:"2012", college:"" },
    { number:"15", last:"Robbins",  first:"Mike",    height:"6'2", pos:"G",   grad:"2012", college:"" },
  ],
  "2011-12": [
    { number:"12", last:"Brown",    first:"Jule",    height:"6'6", pos:"G/F", grad:"2015", college:"" },
    { number:"4",  last:"Cotler",   first:"Doug",    height:"6'4", pos:"F",   grad:"2013", college:"" },
    { number:"40", last:"Dalembert",first:"Yohanny", height:"6'8", pos:"F",   grad:"2013", college:"" },
    { number:"34", last:"Hall",     first:"Raheem",  height:"6'2", pos:"G",   grad:"2013", college:"" },
    { number:"20", last:"Howland",  first:"Baird",   height:"6'5", pos:"G",   grad:"2013", college:"" },
    { number:"5",  last:"Johnson",  first:"BJ",      height:"6'7", pos:"G",   grad:"2013", college:"Syracuse → La Salle (D1)" },
    { number:"1",  last:"Johnson",  first:"JaQuan",  height:"6'0", pos:"G",   grad:"2014", college:"" },
    { number:"25", last:"McFadden", first:"Justin",  height:"6'4", pos:"F/G", grad:"2014", college:"" },
    { number:"31", last:"Reynolds", first:"Darryl",  height:"6'6", pos:"F",   grad:"2012", college:"" },
    { number:"15", last:"Robbins",  first:"Mike",    height:"6'2", pos:"G",   grad:"2012", college:"" },
    { number:"30", last:"Shapiro",  first:"Bryan",   height:"5'10",pos:"G",   grad:"2013", college:"" },
    { number:"11", last:"Sherman",  first:"Corey",   height:"6'1", pos:"G",   grad:"2015", college:"" },
    { number:"21", last:"Shiffraw", first:"Emery",   height:"5'10",pos:"G",   grad:"2013", college:"" },
    { number:"10", last:"Williamson",first:"Bryce",  height:"6'2", pos:"F",   grad:"2012", college:"" },
  ],
  "2012-13": [
    { number:"12", last:"Brown",    first:"Jule",    height:"6'6", pos:"G/F", grad:"2015", college:"" },
    { number:"4",  last:"Cotler",   first:"Doug",    height:"6'4", pos:"F",   grad:"2013", college:"" },
    { number:"40", last:"Dalembert",first:"Yohanny", height:"6'8", pos:"F",   grad:"2013", college:"" },
    { number:"34", last:"Hall",     first:"Raheem",  height:"6'2", pos:"G",   grad:"2013", college:"" },
    { number:"20", last:"Howland",  first:"Baird",   height:"6'5", pos:"G",   grad:"2013", college:"" },
    { number:"5",  last:"Johnson",  first:"BJ",      height:"6'7", pos:"G",   grad:"2013", college:"Syracuse → La Salle (D1)" },
    { number:"1",  last:"Johnson",  first:"JaQuan",  height:"6'0", pos:"G",   grad:"2014", college:"" },
    { number:"22", last:"Levy",     first:"Greg",    height:"5'11",pos:"G",   grad:"2013", college:"" },
    { number:"25", last:"McFadden", first:"Justin",  height:"6'4", pos:"F/G", grad:"2014", college:"" },
    { number:"3",  last:"Pendleton",first:"Steve",   height:"6'0", pos:"G",   grad:"2015", college:"" },
    { number:"30", last:"Shapiro",  first:"Bryan",   height:"5'10",pos:"G",   grad:"2013", college:"" },
    { number:"11", last:"Sherman",  first:"Corey",   height:"6'1", pos:"G",   grad:"2015", college:"" },
    { number:"21", last:"Shiffraw", first:"Emery",   height:"5'10",pos:"G",   grad:"2013", college:"" },
    { number:"3",  last:"Smith",    first:"Rasool",  height:"5'11",pos:"G",   grad:"2013", college:"" },
    { number:"32", last:"Wasson",   first:"Matt",    height:"6'2", pos:"G/F", grad:"2013", college:"" },
  ],
  "2013-14": [
    { number:"21", last:"Baer",     first:"David",   height:"6'2", pos:"F",   grad:"2014", college:"" },
    { number:"12", last:"Brown",    first:"Jule",    height:"6'6", pos:"G/F", grad:"2015", college:"" },
    { number:"2",  last:"Fennell",  first:"Noah",    height:"6'1", pos:"G",   grad:"2017", college:"" },
    { number:"0",  last:"Helton",   first:"KJ",      height:"5'11",pos:"G",   grad:"2016", college:"" },
    { number:"15", last:"Henry",    first:"Oliver",  height:"6'0", pos:"F",   grad:"2014", college:"" },
    { number:"21", last:"Horn",     first:"Jeremy",  height:"6'8", pos:"F",   grad:"2016", college:"" },
    { number:"1",  last:"Johnson",  first:"JaQuan",  height:"6'0", pos:"G",   grad:"2014", college:"" },
    { number:"3",  last:"Jones",    first:"Nick",    height:"5'11",pos:"G",   grad:"2015", college:"" },
    { number:"34", last:"Jones",    first:"Terrell", height:"6'4", pos:"G",   grad:"2017", college:"" },
    { number:"4",  last:"Levitt",   first:"Adrian",  height:"5'11",pos:"G",   grad:"2014", college:"" },
    { number:"25", last:"McFadden", first:"Justin",  height:"6'4", pos:"F/G", grad:"2014", college:"" },
    { number:"30", last:"McGregor", first:"Myles",   height:"6'0", pos:"G",   grad:"2016", college:"" },
    { number:"22", last:"Needle",   first:"Eli",     height:"6'2", pos:"F",   grad:"2016", college:"" },
    { number:"3",  last:"Pendleton",first:"Steve",   height:"6'0", pos:"G",   grad:"2015", college:"" },
    { number:"11", last:"Sherman",  first:"Corey",   height:"6'1", pos:"G",   grad:"2015", college:"" },
  ],
  "2014-15": [
    { number:"1",  last:"Barry",    first:"Asher",   height:"6'4", pos:"F/G", grad:"2015", college:"" },
    { number:"21", last:"Berg",     first:"Mike",    height:"6'1", pos:"F/G", grad:"2016", college:"" },
    { number:"12", last:"Brown",    first:"Jule",    height:"6'6", pos:"G/F", grad:"2015", college:"" },
    { number:"15", last:"Dunoff",   first:"Joel",    height:"5'11",pos:"G",   grad:"2015", college:"" },
    { number:"2",  last:"Fennell",  first:"Noah",    height:"6'1", pos:"G",   grad:"2017", college:"" },
    { number:"1",  last:"Harris",   first:"Dion",    height:"6'6", pos:"F",   grad:"2017", college:"" },
    { number:"0",  last:"Helton",   first:"KJ",      height:"5'11",pos:"G",   grad:"2016", college:"" },
    { number:"21", last:"Horn",     first:"Jeremy",  height:"6'8", pos:"F",   grad:"2016", college:"" },
    { number:"5",  last:"Horton",   first:"Amir",    height:"6'0", pos:"G",   grad:"2017", college:"" },
    { number:"34", last:"Jones",    first:"Terrell", height:"6'4", pos:"G",   grad:"2017", college:"" },
    { number:"11", last:"Magill",   first:"Zack",    height:"5'9", pos:"G",   grad:"2016", college:"" },
    { number:"22", last:"Needle",   first:"Eli",     height:"6'2", pos:"F",   grad:"2016", college:"" },
    { number:"3",  last:"Pendleton",first:"Steve",   height:"6'0", pos:"G",   grad:"2015", college:"" },
    { number:"11", last:"Sherman",  first:"Corey",   height:"6'1", pos:"G",   grad:"2015", college:"" },
  ],
  "2015-16": [
    { number:"14", last:"Davis",    first:"Deion",   height:"6'2", pos:"F",   grad:"2018", college:"" },
    { number:"2",  last:"Fennell",  first:"Noah",    height:"6'1", pos:"G",   grad:"2017", college:"" },
    { number:"2",  last:"Forrest",  first:"Jack",    height:"6'5", pos:"G",   grad:"2019", college:"Columbia → Saint Joseph's (D1)" },
    { number:"1",  last:"Harris",   first:"Dion",    height:"6'6", pos:"F",   grad:"2017", college:"" },
    { number:"0",  last:"Helton",   first:"KJ",      height:"5'11",pos:"G",   grad:"2016", college:"" },
    { number:"15", last:"Henry",    first:"Theo",    height:"6'0", pos:"G",   grad:"2019", college:"" },
    { number:"21", last:"Horn",     first:"Jeremy",  height:"6'8", pos:"F",   grad:"2016", college:"" },
    { number:"34", last:"Jones",    first:"Terrell", height:"6'4", pos:"G",   grad:"2017", college:"" },
    { number:"11", last:"Magill",   first:"Zack",    height:"5'9", pos:"G",   grad:"2016", college:"" },
    { number:"22", last:"Needle",   first:"Eli",     height:"6'2", pos:"F",   grad:"2016", college:"" },
    { number:"12", last:"O'Connor", first:"Matt",    height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"1",  last:"Payne",    first:"Steve",   height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"35", last:"Ryan",     first:"Sean",    height:"6'2", pos:"F",   grad:"2017", college:"" },
    { number:"5",  last:"Taylor",   first:"Darryl",  height:"5'11",pos:"G",   grad:"2019", college:"" },
    { number:"0",  last:"Walker-X", first:"Najja",   height:"5'11",pos:"G",   grad:"2017", college:"" },
  ],
  "2016-17": [
    { number:"20", last:"Bilal",    first:"Khadafy", height:"6'2", pos:"F",   grad:"2017", college:"" },
    { number:"14", last:"Davis",    first:"Deion",   height:"6'2", pos:"F",   grad:"2018", college:"" },
    { number:"2",  last:"Fennell",  first:"Noah",    height:"6'1", pos:"G",   grad:"2017", college:"" },
    { number:"2",  last:"Forrest",  first:"Jack",    height:"6'5", pos:"G",   grad:"2019", college:"Columbia → Saint Joseph's (D1)" },
    { number:"15", last:"Henry",    first:"Theo",    height:"6'0", pos:"G",   grad:"2019", college:"" },
    { number:"34", last:"Jones",    first:"Terrell", height:"6'4", pos:"G",   grad:"2017", college:"" },
    { number:"11", last:"Klevan",   first:"Harrison",height:"6'0", pos:"G",   grad:"2018", college:"" },
    { number:"30", last:"Martin",   first:"Joshua",  height:"6'5", pos:"F",   grad:"2019", college:"" },
    { number:"21", last:"Morgan",   first:"Isaiah",  height:"6'5", pos:"F",   grad:"2018", college:"" },
    { number:"12", last:"O'Connor", first:"Matt",    height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"1",  last:"Payne",    first:"Steve",   height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"10", last:"Robinson", first:"Jared",   height:"6'2", pos:"G",   grad:"2018", college:"" },
    { number:"35", last:"Ryan",     first:"Sean",    height:"6'2", pos:"F",   grad:"2017", college:"" },
    { number:"5",  last:"Taylor",   first:"Darryl",  height:"5'11",pos:"G",   grad:"2019", college:"" },
    { number:"0",  last:"Walker-X", first:"Najja",   height:"5'11",pos:"G",   grad:"2017", college:"" },
  ],
  "2017-18": [
    { number:"5",  last:"Cook",     first:"Phil",    height:"6'1", pos:"F",   grad:"2021", college:"" },
    { number:"15", last:"D'Alonzo", first:"Marek",   height:"6'0", pos:"G",   grad:"2018", college:"" },
    { number:"2",  last:"Forrest",  first:"Jack",    height:"6'5", pos:"G",   grad:"2019", college:"Columbia → Saint Joseph's (D1)" },
    { number:"3",  last:"Hairston", first:"Julian",  height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"15", last:"Henry",    first:"Theo",    height:"6'0", pos:"G",   grad:"2019", college:"" },
    { number:"20", last:"Jones",    first:"Shareef", height:"5'9", pos:"G",   grad:"2021", college:"" },
    { number:"11", last:"Klevan",   first:"Harrison",height:"6'0", pos:"G",   grad:"2018", college:"" },
    { number:"30", last:"Martin",   first:"Joshua",  height:"6'5", pos:"F",   grad:"2019", college:"" },
    { number:"21", last:"Morgan",   first:"Isaiah",  height:"6'5", pos:"F",   grad:"2018", college:"" },
    { number:"12", last:"O'Connor", first:"Matt",    height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"14", last:"Oshtry",   first:"Sam",     height:"6'1", pos:"G",   grad:"2019", college:"" },
    { number:"1",  last:"Payne",    first:"Steve",   height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"10", last:"Robinson", first:"Jared",   height:"6'2", pos:"G",   grad:"2018", college:"" },
    { number:"22", last:"Ryan",     first:"Garrett", height:"6'5", pos:"F",   grad:"2019", college:"" },
    { number:"35", last:"Slogoff",  first:"Zack",    height:"6'1", pos:"G",   grad:"2018", college:"" },
    { number:"5",  last:"Taylor",   first:"Darryl",  height:"5'11",pos:"G",   grad:"2019", college:"" },
  ],
  "2018-19": [
    { number:"5",  last:"Cook",     first:"Phil",    height:"6'1", pos:"F",   grad:"2021", college:"" },
    { number:"1",  last:"Davison",  first:"Sam",     height:"6'0", pos:"G",   grad:"2021", college:"" },
    { number:"2",  last:"Forrest",  first:"Jack",    height:"6'5", pos:"G",   grad:"2019", college:"Columbia → Saint Joseph's (D1)" },
    { number:"10", last:"Goodman",  first:"Jalen",   height:"6'0", pos:"G",   grad:"2019", college:"" },
    { number:"3",  last:"Hairston", first:"Julian",  height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"15", last:"Henry",    first:"Theo",    height:"6'0", pos:"G",   grad:"2019", college:"" },
    { number:"30", last:"Martin",   first:"Joshua",  height:"6'5", pos:"F",   grad:"2019", college:"" },
    { number:"34", last:"Needle",   first:"Seth",    height:"5'10",pos:"G",   grad:"2019", college:"" },
    { number:"12", last:"O'Connor", first:"Matt",    height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"14", last:"Oshtry",   first:"Sam",     height:"6'1", pos:"G",   grad:"2019", college:"" },
    { number:"1",  last:"Payne",    first:"Steve",   height:"6'2", pos:"G",   grad:"2019", college:"" },
    { number:"0",  last:"Rothman",  first:"Eli",     height:"6'0", pos:"G",   grad:"2020", college:"" },
    { number:"22", last:"Ryan",     first:"Garrett", height:"6'5", pos:"F",   grad:"2019", college:"" },
    { number:"0",  last:"Shippen",  first:"Jaylen",  height:"6'1", pos:"G",   grad:"2022", college:"Clarion University (D2)" },
    { number:"4",  last:"Simples",  first:"James",   height:"6'3", pos:"G",   grad:"2020", college:"" },
    { number:"5",  last:"Taylor",   first:"Darryl",  height:"5'11",pos:"G",   grad:"2019", college:"" },
  ],
  "2019-20": [
    { number:"22", last:"Bard",     first:"Henry",   height:"6'3", pos:"F",   grad:"2022", college:"" },
    { number:"11", last:"Brown",    first:"Sam",     height:"6'2", pos:"G",   grad:"2023", college:"UPenn → Davidson (D1)" },
    { number:"10", last:"Chestnut", first:"Lance",   height:"6'1", pos:"G",   grad:"2020", college:"" },
    { number:"5",  last:"Cook",     first:"Phil",    height:"6'1", pos:"F",   grad:"2021", college:"" },
    { number:"5",  last:"Coyne",    first:"Andrew",  height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"1",  last:"Davison",  first:"Sam",     height:"6'0", pos:"G",   grad:"2021", college:"" },
    { number:"4",  last:"Gribbin",  first:"Peter",   height:"6'2", pos:"G",   grad:"2022", college:"" },
    { number:"32", last:"Habersham",first:"Joe",     height:"6'4", pos:"F",   grad:"2020", college:"" },
    { number:"14", last:"Lilley",   first:"Demetrius",height:"6'9",pos:"F",   grad:"2022", college:"Penn State → Binghamton (D1)" },
    { number:"12", last:"McCabe",   first:"Connor",  height:"5'9", pos:"G",   grad:"2021", college:"" },
    { number:"15", last:"Newton",   first:"Lee",     height:"6'4", pos:"G/F", grad:"2020", college:"" },
    { number:"2",  last:"Poles",    first:"Justin",  height:"6'1", pos:"G",   grad:"2023", college:"Alvernia University (D3, Soccer)" },
    { number:"0",  last:"Rothman",  first:"Eli",     height:"6'0", pos:"G",   grad:"2020", college:"" },
    { number:"14", last:"Scott",    first:"Joey",    height:"6'0", pos:"G",   grad:"2021", college:"" },
    { number:"0",  last:"Shippen",  first:"Jaylen",  height:"6'1", pos:"G",   grad:"2022", college:"Clarion University (D2)" },
    { number:"4",  last:"Simples",  first:"James",   height:"6'3", pos:"G",   grad:"2020", college:"" },
    { number:"21", last:"Wong",     first:"Zack",    height:"6'3", pos:"F",   grad:"2021", college:"" },
    { number:"24", last:"Wright",   first:"Sam",     height:"6'1", pos:"G",   grad:"2023", college:"" },
  ],
  "2020-21": [
    { number:"22", last:"Bard",     first:"Henry",   height:"6'3", pos:"F",   grad:"2022", college:"" },
    { number:"11", last:"Brown",    first:"Sam",     height:"6'2", pos:"G",   grad:"2023", college:"UPenn → Davidson (D1)" },
    { number:"5",  last:"Cook",     first:"Phil",    height:"6'1", pos:"F",   grad:"2021", college:"" },
    { number:"5",  last:"Coyne",    first:"Andrew",  height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"1",  last:"Davison",  first:"Sam",     height:"6'0", pos:"G",   grad:"2021", college:"" },
    { number:"4",  last:"Gribbin",  first:"Peter",   height:"6'2", pos:"G",   grad:"2022", college:"" },
    { number:"14", last:"Lilley",   first:"Demetrius",height:"6'9",pos:"F",   grad:"2022", college:"Penn State → Binghamton (D1)" },
    { number:"12", last:"McCabe",   first:"Connor",  height:"5'9", pos:"G",   grad:"2021", college:"" },
    { number:"15", last:"Meekins",  first:"Jordan",  height:"6'2", pos:"G",   grad:"2023", college:"" },
    { number:"4",  last:"Morene",   first:"Jayden",  height:"6'2", pos:"F",   grad:"2021", college:"" },
    { number:"1",  last:"Pendergrass III",first:"Teddy",height:"6'0",pos:"G", grad:"2023", college:"" },
    { number:"2",  last:"Poles",    first:"Justin",  height:"6'1", pos:"G",   grad:"2023", college:"Alvernia University (D3, Soccer)" },
    { number:"0",  last:"Shippen",  first:"Jaylen",  height:"6'1", pos:"G",   grad:"2022", college:"Clarion University (D2)" },
    { number:"14", last:"Vaughan",  first:"Luke",    height:"6'1", pos:"G",   grad:"2022", college:"" },
    { number:"21", last:"Wong",     first:"Zack",    height:"6'3", pos:"F",   grad:"2021", college:"" },
    { number:"24", last:"Wright",   first:"Sam",     height:"6'1", pos:"G",   grad:"2023", college:"" },
  ],
  "2021-22": [
    { number:"22", last:"Bard",     first:"Henry",   height:"6'3", pos:"F",   grad:"2022", college:"" },
    { number:"11", last:"Brown",    first:"Sam",     height:"6'2", pos:"G",   grad:"2023", college:"UPenn → Davidson (D1)" },
    { number:"5",  last:"Coyne",    first:"Andrew",  height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"21", last:"Foster",   first:"Langston",height:"6'2", pos:"G",   grad:"2025", college:"" },
    { number:"4",  last:"Gribbin",  first:"Peter",   height:"6'2", pos:"G",   grad:"2022", college:"" },
    { number:"12", last:"Kasmer",   first:"Carson",  height:"5'9", pos:"G",   grad:"2025", college:"Gettysburg College (D3)" },
    { number:"14", last:"Lilley",   first:"Demetrius",height:"6'9",pos:"F",   grad:"2022", college:"Penn State → Binghamton (D1)" },
    { number:"23", last:"McCabe",   first:"Owen",    height:"5'9", pos:"G",   grad:"2023", college:"Penn State Behrend (D3)" },
    { number:"31", last:"Mebane",   first:"Justin",  height:"6'3", pos:"F",   grad:"2024", college:"" },
    { number:"15", last:"Meekins",  first:"Jordan",  height:"6'2", pos:"G",   grad:"2023", college:"" },
    { number:"10", last:"Mobley",   first:"John",    height:"6'1", pos:"G",   grad:"2024", college:"Fork Union → Edinboro (D2)" },
    { number:"32", last:"Newcomb",  first:"Jack",    height:"6'4", pos:"F",   grad:"2024", college:"" },
    { number:"1",  last:"Pendergrass III",first:"Teddy",height:"6'0",pos:"G", grad:"2023", college:"" },
    { number:"2",  last:"Poles",    first:"Justin",  height:"6'1", pos:"G",   grad:"2023", college:"Alvernia University (D3, Soccer)" },
    { number:"0",  last:"Shippen",  first:"Jaylen",  height:"6'1", pos:"G",   grad:"2022", college:"Clarion University (D2)" },
    { number:"24", last:"Wright",   first:"Sam",     height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"42", last:"Wright",   first:"Gus",     height:"5'9", pos:"G",   grad:"2025", college:"" },
  ],
  "2022-23": [
    { number:"11", last:"Brown",    first:"Sam",     height:"6'2", pos:"G",   grad:"2023", college:"UPenn → Davidson (D1)" },
    { number:"5",  last:"Coyne",    first:"Andrew",  height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"21", last:"Foster",   first:"Langston",height:"6'2", pos:"G",   grad:"2025", college:"" },
    { number:"12", last:"Kasmer",   first:"Carson",  height:"5'9", pos:"G",   grad:"2025", college:"Gettysburg College (D3)" },
    { number:"0",  last:"McCabe",   first:"Owen",    height:"5'9", pos:"G",   grad:"2023", college:"Penn State Behrend (D3)" },
    { number:"15", last:"Meekins",  first:"Jordan",  height:"6'2", pos:"G",   grad:"2023", college:"" },
    { number:"10", last:"Mobley",   first:"John",    height:"6'1", pos:"G",   grad:"2024", college:"Fork Union → Edinboro (D2)" },
    { number:"1",  last:"Pendergrass III",first:"Teddy",height:"6'0",pos:"G", grad:"2023", college:"" },
    { number:"2",  last:"Poles",    first:"Justin",  height:"6'1", pos:"G",   grad:"2023", college:"Alvernia University (D3, Soccer)" },
    { number:"24", last:"Wright",   first:"Sam",     height:"6'1", pos:"G",   grad:"2023", college:"" },
    { number:"42", last:"Wright",   first:"Gus",     height:"5'9", pos:"G",   grad:"2025", college:"" },
  ],
  "2023-24": [
    { number:"2",  last:"Herrenkohl",first:"Adam",   height:"6'2", pos:"G",   grad:"2024", college:"" },
    { number:"14", last:"Kasmer",   first:"Carson",  height:"5'9", pos:"G",   grad:"2025", college:"Gettysburg College (D3)" },
    { number:"21", last:"Foster",   first:"Langston",height:"6'2", pos:"G",   grad:"2025", college:"" },
    { number:"10", last:"Mebane",   first:"Justin",  height:"6'3", pos:"F",   grad:"2024", college:"" },
    { number:"0",  last:"McCabe",   first:"Owen",    height:"5'9", pos:"G",   grad:"2023", college:"Penn State Behrend (D3)" },
    { number:"4",  last:"Mobley",   first:"John",    height:"6'1", pos:"G",   grad:"2024", college:"Fork Union → Edinboro (D2)" },
    { number:"32", last:"Newcomb",  first:"Jack",    height:"6'4", pos:"F",   grad:"2024", college:"" },
    { number:"21", last:"Robinson", first:"Jayden",  height:"6'2", pos:"F",   grad:"2024", college:"" },
    { number:"",   last:"Singletary",first:"Sami",   height:"6'1", pos:"G",   grad:"2025", college:"Camden County College (JUCO)" },
    { number:"11", last:"Wright",   first:"Gus",     height:"5'9", pos:"G",   grad:"2025", college:"" },
  ],
  "2024-25": [
    { number:"23", last:"Cook",     first:"Chris",   height:"6'4", pos:"F",   grad:"2025", college:"" },
    { number:"21", last:"Foster",   first:"Langston",height:"6'2", pos:"G",   grad:"2025", college:"" },
    { number:"1",  last:"Grier",    first:"LaMont",  height:"6'0", pos:"G",   grad:"2026", college:"" },
    { number:"14", last:"Kasmer",   first:"Carson",  height:"5'9", pos:"G",   grad:"2025", college:"Gettysburg College (D3)" },
    { number:"24", last:"Parrish",  first:"Kyle",    height:"6'2", pos:"G",   grad:"2026", college:"" },
    { number:"4",  last:"Patterson",first:"Rashyne", height:"6'4", pos:"F",   grad:"2025", college:"" },
    { number:"",   last:"Singletary",first:"Sami",   height:"6'1", pos:"G",   grad:"2025", college:"Camden County College (JUCO)" },
    { number:"13", last:"Yard",     first:"William", height:"6'3", pos:"F",   grad:"2026", college:"" },
    { number:"11", last:"Wright",   first:"Gus",     height:"5'9", pos:"G",   grad:"2025", college:"" },
  ],
  "2025-26": [
    { number:"1",  last:"Darsenie", first:"Bereket", height:"6'0", pos:"G",   grad:"2026", college:"" },
    { number:"35", last:"Dragut",   first:"Nicholas",height:"6'5", pos:"F",   grad:"2026", college:"" },
    { number:"1",  last:"Grier",    first:"LaMont",  height:"6'0", pos:"G",   grad:"2026", college:"" },
    { number:"5",  last:"Ingram",   first:"Israel",  height:"6'2", pos:"G",   grad:"2026", college:"" },
    { number:"0",  last:"Miller",   first:"Arjay",   height:"6'0", pos:"G",   grad:"2026", college:"" },
    { number:"2",  last:"Mitchell", first:"Darius",  height:"6'2", pos:"G",   grad:"2026", college:"" },
    { number:"24", last:"Parrish",  first:"Kyle",    height:"6'2", pos:"G",   grad:"2026", college:"" },
    { number:"4",  last:"Pulsifer", first:"Finn",    height:"6'4", pos:"F",   grad:"2026", college:"" },
    { number:"13", last:"Yard",     first:"William", height:"6'3", pos:"F",   grad:"2026", college:"" },
  ],
};

const seasons = Object.keys(rosterData).sort((a, b) => b.localeCompare(a));

function SeasonAccordion({ season, players }) {
  const [open, setOpen] = useState(false);
  const collegePlayers = players.filter(p => p.college);

  return (
    <div style={{
      border: `1px solid ${open ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 10, overflow: "hidden", marginBottom: 8,
      transition: "border-color 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%",
        background: open ? "rgba(132,0,54,0.12)" : "rgba(255,255,255,0.02)",
        border: "none", cursor: "pointer", padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "background 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 17, letterSpacing: 2, color: open ? "#fff" : "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>
            {season}
          </span>
          <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            {players.length} players
          </span>
          {collegePlayers.length > 0 && (
            <span style={{ padding: "2px 10px", background: "rgba(201,164,74,0.12)", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 20, fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase" }}>
              {collegePlayers.length} College
            </span>
          )}
        </div>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16, transition: "transform 0.25s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 70px 60px 50px", padding: "7px 20px", background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {["#","Player","Pos","Ht","Grad"].map((h, i) => (
              <div key={i} style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {players.map((p, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 70px 60px 50px",
              padding: "9px 20px",
              background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              borderBottom: "1px solid rgba(255,255,255,0.025)",
              borderLeft: p.college ? "2px solid rgba(201,164,74,0.45)" : "2px solid transparent",
            }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>{p.number || "—"}</div>
              <div>
                <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: p.college ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.65)", fontWeight: p.college ? 600 : 400 }}>
                  {p.first} {p.last}
                </span>
                {p.college && (
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(201,164,74,0.85)", marginTop: 1 }}>
                    🎓 {p.college}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", alignSelf: "center" }}>{p.pos}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", alignSelf: "center" }}>{p.height}</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>'{p.grad.slice(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlumniPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Unique player count
  const allPlayers = new Map();
  Object.entries(rosterData).forEach(([, players]) => {
    players.forEach(p => {
      const key = `${p.first} ${p.last}`;
      if (!allPlayers.has(key)) allPlayers.set(key, p);
    });
  });
  const totalUnique = allPlayers.size;
  const totalCollege = [...allPlayers.values()].filter(p => p.college).length;

  const filteredSeasons = seasons.map(season => {
    let players = rosterData[season];
    if (filter === "college") players = players.filter(p => p.college);
    if (search) {
      const s = search.toLowerCase();
      players = players.filter(p =>
        `${p.first} ${p.last}`.toLowerCase().includes(s) ||
        p.college?.toLowerCase().includes(s)
      );
    }
    return { season, players };
  }).filter(({ players }) => players.length > 0);

  return (
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Program History</div>
          <h2 className="section-title">Aces<br /><span style={{ color: "var(--gold)" }}>All-Time Roster</span></h2>
          <div className="divider" />
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", gap: 10, marginTop: 36, flexWrap: "wrap" }}>
            {[
              { label: "Seasons on Record", value: seasons.length },
              { label: "Unique Players", value: `${totalUnique}+` },
              { label: "College Players", value: `${totalCollege}+` },
              { label: "Years Covered", value: "2005–2026" },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 130px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, color: "var(--gold)" }}>{s.value}</div>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Search + Filter */}
        <FadeIn delay={0.15}>
          <div style={{ display: "flex", gap: 10, marginTop: 24, marginBottom: 6, flexWrap: "wrap" }}>
            <input
              placeholder="Search player or college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: "1 1 240px", padding: "10px 14px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#fff", fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, outline: "none",
              }}
            />
            {["all", "college"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                background: filter === f ? "rgba(132,0,54,0.4)" : "rgba(255,255,255,0.03)",
                border: filter === f ? "1px solid rgba(201,164,74,0.5)" : "1px solid rgba(255,255,255,0.08)",
                color: filter === f ? "var(--gold)" : "rgba(255,255,255,0.45)",
                transition: "all 0.2s",
              }}>
                {f === "all" ? "All Players" : "College Only"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, marginTop: 10 }}>
            <div style={{ width: 3, height: 14, background: "rgba(201,164,74,0.5)", borderRadius: 2 }} />
            <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Gold bar indicates player went on to play college ball</span>
          </div>
        </FadeIn>

        {/* Accordions */}
        {filteredSeasons.map(({ season, players }) => (
          <SeasonAccordion key={season} season={season} players={players} />
        ))}

        {filteredSeasons.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontFamily: "'Source Sans 3',sans-serif" }}>
            No players found matching "{search}"
          </div>
        )}

        {/* Notable Alumni */}
        <FadeIn>
          <div style={{ marginTop: 72 }}>
            <div className="section-label" style={{ marginBottom: 8 }}><Spade size={14} color="#840036" /> Notable Alumni</div>
            <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 26, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              College & <span style={{ color: "var(--gold)" }}>Professional Players</span>
            </h3>
            <div className="divider" style={{ marginBottom: 28 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 10 }}>
              {alumni.map((a, i) => (
                <div key={i} style={{
                  background: a.highlight ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                  border: a.highlight ? "1px solid rgba(201,164,74,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>Class of {a.classYear}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {a.pro?.includes("NBA") && <span style={{ padding: "2px 7px", background: "rgba(30,120,200,0.2)", border: "1px solid rgba(30,120,200,0.4)", borderRadius: 12, fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1, color: "#4a9eff", textTransform: "uppercase" }}>NBA</span>}
                      {a.college && <span style={{ padding: "2px 7px", background: "rgba(201,164,74,0.12)", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 12, fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1, color: "var(--gold)", textTransform: "uppercase" }}>College</span>}
                    </div>
                  </div>
                  {a.college && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}><span style={{ color: "rgba(255,255,255,0.2)" }}>College: </span>{a.college}</div>}
                  {a.pro && <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}><span style={{ color: "rgba(255,255,255,0.2)" }}>Pro: </span>{a.pro}</div>}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
