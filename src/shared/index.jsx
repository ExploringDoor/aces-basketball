// ============================================================
// shared/index.jsx
// Shared hooks, components, and data for Aces Basketball
// ============================================================

import { useState, useEffect, useRef } from "react";

// ─── Hooks ───────────────────────────────────────────────────
export const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    let done = false;
    const reveal = () => { if (!done) { done = true; setIsVisible(true); } };
    const el = ref.current;
    // Already on screen when this mounts (e.g. right after switching pages)?
    // Reveal immediately so content is NEVER stuck invisible on a fresh page.
    if (el) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      if (r.top < vh && r.bottom > 0) { reveal(); return; }
    }
    if (typeof IntersectionObserver === "undefined") { reveal(); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) reveal(); },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    if (el) observer.observe(el);
    // Failsafe: a reveal-on-scroll element can never stay hidden.
    const failsafe = setTimeout(reveal, 2500);
    return () => { observer.disconnect(); clearTimeout(failsafe); };
  }, []);
  return [ref, isVisible];
};

// ─── Components ──────────────────────────────────────────────
export const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const [ref, isVisible] = useInView();
  const transforms = {
    up: "translateY(60px)", down: "translateY(-60px)",
    left: "translateX(60px)", right: "translateX(-60px)", none: "none"
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : transforms[direction],
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export const CountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useInView();
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

export const Spade = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C12 2 3 9 3 14a4.5 4.5 0 0 0 7.5 3.35C10.1 18.8 9.5 20.5 8 21h8c-1.5-.5-2.1-2.2-2.5-3.65A4.5 4.5 0 0 0 21 14C21 9 12 2 12 2z" />
  </svg>
);

// Clean line-icon set (replaces emoji across the UI). Uses currentColor so
// the parent's `color` drives the stroke; pass a `name` from the keys below.
export const Icon = ({ name, size = 22, color = "currentColor", stroke = 1.6 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    history:    <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M8 8h8M8 11.5h8M8 15h5"/></>,
    basketball: <><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6c3.5 2.8 3.5 10 0 12.8M18.4 5.6c-3.5 2.8-3.5 10 0 12.8"/></>,
    calendar:   <><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9h17M8 3v3M16 3v3"/></>,
    trophy:     <><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 3M17 6h2.5a2.5 2.5 0 0 1-2.5 3"/><path d="M12 13v3M9 20h6M10 20l.5-4h3l.5 4"/></>,
    building:   <><path d="M4 20V6l7-3 7 3v14"/><path d="M4 20h16M9 9h.01M14 9h.01M9 13h.01M14 13h.01M10 20v-3h4v3"/></>,
    grad:       <><path d="M2 8.5 12 4l10 4.5-10 4.5z"/><path d="M6 10.5V15c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5M22 8.5V13"/></>,
    clipboard:  <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.2A1 1 0 0 1 10 3h4a1 1 0 0 1 1 1.2M8.5 11h7M8.5 15h5"/></>,
    chart:      <><path d="M4 20V4M4 20h16"/><path d="M7 17v-4M12 17V9M17 17v-6"/></>,
    camera:     <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.4-2.4h5.2L16 7"/><circle cx="12" cy="13.3" r="3.1"/></>,
    video:      <><rect x="3" y="6" width="12.5" height="12" rx="2"/><path d="M15.5 10l5.5-3v10l-5.5-3z"/></>,
    spade:      <path fill={color} stroke="none" d="M12 2C12 2 3 9 3 14a4.5 4.5 0 0 0 7.5 3.35C10.1 18.8 9.5 20.5 8 21h8c-1.5-.5-2.1-2.2-2.5-3.65A4.5 4.5 0 0 0 21 14C21 9 12 2 12 2z"/>,
    phone:      <><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/></>,
    star:       <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z"/>,
    news:       <><path d="M3.5 6.5h13v11a1.5 1.5 0 0 1-1.5 1.5H6a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M16.5 9H19a1 1 0 0 1 1 1v6.5A2.5 2.5 0 0 1 17.5 19M6.5 9.5h7M6.5 12.5h7M6.5 15.5h4"/></>,
    whistle:    <><circle cx="10" cy="14" r="6"/><path d="M10 8V5h6M14 11l6-4M4 14h2"/></>,
    heart:      <path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7-2.7C19 10.6 12 20 12 20z"/>,
    pin:        <><path d="M12 21s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10z"/><circle cx="12" cy="11" r="2.2"/></>,
    ticket:     <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M14 6v12"/></>,
    plane:      <path d="M21 4 3.5 10.2a.5.5 0 0 0 0 .95L9 13l2 5.5a.5.5 0 0 0 .93.05L14 14l4.5 3.2a.6.6 0 0 0 .94-.36L21 4zM21 4 9 13"/>,
    book:       <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14H6.5A1.5 1.5 0 0 0 5 18.5z"/><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19"/></>,
    users:      <><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M20.5 19a5.5 5.5 0 0 0-3.2-5"/></>,
    gift:       <><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C12 8.5 11 4 8.5 4a2 2 0 0 0 0 4.5zM12 8.5C12 8.5 13 4 15.5 4a2 2 0 0 1 0 4.5z"/></>,
    instagram:  <><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill={color} stroke="none"/></>,
  };
  return <svg {...common} aria-hidden="true" style={{ display:"block" }}>{paths[name] || paths.basketball}</svg>;
};

// Player/coach avatar: shows a photo if `photo` is set and loads, otherwise a
// sharp initials badge on a maroon gradient. Never renders an empty/broken box.
export const Avatar = ({ name = "", photo, size = 64, highlight = false, rounded = "50%" }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "LM";
  const showPhoto = photo && !failed;
  return (
    <div style={{
      width: size, height: size, borderRadius: rounded, flexShrink: 0, overflow: "hidden",
      border: `2px solid ${highlight ? "rgba(201,164,74,0.55)" : "rgba(132,0,54,0.5)"}`,
      background: showPhoto ? "#0a0005" : "linear-gradient(135deg, #8a0038, #360017)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: highlight ? "0 0 0 3px rgba(201,164,74,0.12)" : "none",
    }}>
      {showPhoto
        ? <img src={photo} alt={name} loading="lazy" onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%", display: "block" }} />
        : <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: Math.round(size * 0.36), color: highlight ? "var(--gold)" : "#fff", letterSpacing: 0.5 }}>{initials}</span>}
    </div>
  );
};

// Reusable profile modal shared by Alumni / 1,000 Club / Coaching / Hall of Fame.
// person: { name, photo, highlight, eyebrow, tags[], quote, stats, rows[{label,value}],
//           body, funFacts[], achievements[] }
export const PlayerModal = ({ person, onClose }) => {
  if (!person) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", cursor: "zoom-out" }}>
      <style>{`@keyframes pmIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border: `1px solid ${person.highlight ? "rgba(201,164,74,0.4)" : "rgba(132,0,54,0.4)"}`, borderRadius: 16, maxWidth: 600, width: "100%", padding: "36px 34px 40px", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default", animation: "pmIn 0.3s ease", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer", zIndex: 2 }}>✕</button>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 22, paddingRight: 30 }}>
          <Avatar name={person.name} photo={person.photo} size={96} highlight={person.highlight} rounded="14px" />
          <div style={{ minWidth: 0 }}>
            {person.eyebrow && <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 4 }}>{person.eyebrow}</div>}
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 26, fontWeight: 700, color: person.highlight ? "var(--gold)" : "#fff", lineHeight: 1.1 }}>{person.name}</div>
            {person.tags?.length > 0 && <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{person.tags.map((t, i) => <span key={i} style={{ padding: "2px 9px", background: "rgba(201,164,74,0.12)", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 12, fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1, color: "var(--gold)", textTransform: "uppercase" }}>{t}</span>)}</div>}
          </div>
        </div>
        {person.quote && <div style={{ borderLeft: "3px solid var(--gold)", paddingLeft: 16, marginBottom: 18, fontFamily: "'Playfair Display',serif", fontSize: 15, fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>"{person.quote}"</div>}
        {person.stats && <div style={{ background: "rgba(201,164,74,0.08)", border: "1px solid rgba(201,164,74,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}><div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase", marginBottom: 6 }}>Career Highlights</div><div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>{person.stats}</div></div>}
        {person.rows?.some(r => r.value) && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{person.rows.map((r, i) => r.value ? (<div key={i}><span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{r.label}</span><div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>{r.value}</div></div>) : null)}</div>}
        {person.body && <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginTop: (person.stats || person.rows?.some(r => r.value)) ? 16 : 0, marginBottom: 0 }}>{person.body}</p>}
        {person.funFacts?.length > 0 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 18, marginTop: 18 }}><div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>Did You Know</div>{person.funFacts.map((f, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}><span style={{ color: "var(--gold)", flexShrink: 0 }}>▸</span><span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{f}</span></div>)}</div>}
        {person.achievements?.length > 0 && <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 18, marginTop: 18 }}><div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 10 }}>Achievements</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{person.achievements.map((a, i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(132,0,54,0.15)", border: "1px solid rgba(132,0,54,0.3)", fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{a}</span>)}</div></div>}
      </div>
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────
export const championships = {
  state: [
    { year: "1933", details: "AAA State Champions" },
    { year: "1941", details: "AAA State Champions" },
    { year: "1942", details: "AAA State Champions" },
    { year: "1943", details: "AAA State Champions" },
    { year: "1996", details: "AAAA State Champions — Led by Kobe Bryant (31-3)" },
    { year: "2006", details: "AAAA State Champions — 60-58 vs. Schenley" },
    { year: "2013", details: "AAAA State Champions" },
  ],
  district: [
    "1930","1933","1937","1940","1941","1942","1943","1944",
    "1976","1978","1996","2006","2021","2022","2024"
  ],
  league: [
    "1972","1975","1976","1978","1984","1995","1996","1997","1998",
    "2000","2001","2002","2006","2009","2012","2013","2014","2017",
    "2018","2019","2022","2024","2025"
  ],
};

// ─── News & Recaps ───────────────────────────────────────────
// HOW TO ADD A POST: copy one object below, put the NEWEST at the TOP.
//  · date      → shown on the card (any format you like)
//  · sortKey   → YYYYMMDD number, only used to order posts (bigger = newer)
//  · category  → small label chip (e.g. "Recap", "Championship", "News")
//  · excerpt   → one-line teaser shown on cards + the home page
//  · image     → optional; a path in /public or a full image URL
//  · body      → array of paragraphs (the full story)
//  · featured  → set true on ONE post to headline it
export const news = [
  {
    id: "2025-central-league-champions",
    date: "2024-25 Season",
    sortKey: 20250215,
    category: "Championship",
    title: "Aces Capture 2025 Central League Title",
    excerpt: "Lower Merion claims its 23rd Central League championship, the most of any program in league history.",
    image: "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg",
    featured: true,
    body: [
      "Lower Merion added another banner to the rafters in 2025, capturing the program's 23rd Central League championship — the most of any school since the conference was founded in 1967.",
      "The title extended a run of sustained success under longtime head coach Gregg Downer, whose teams have defined the top of the Central League for more than three decades.",
      "The Aces will look to keep the tradition going when the new season tips off. Full game recaps will be posted here throughout the year.",
    ],
  },
  {
    id: "kobe-bryant-gymnasium",
    date: "December 16, 2010",
    sortKey: 20101216,
    category: "Program History",
    title: "The House That Kobe Built: Bryant Gymnasium Dedicated",
    excerpt: "Lower Merion dedicates its gymnasium to its most famous alumnus, his No. 33 hanging above the doors.",
    featured: false,
    body: [
      "On December 16, 2010, Lower Merion dedicated the Kobe Bryant Gymnasium, honoring the alumnus who put Aces basketball on the national map.",
      "\"I didn't go to college, so this is my university,\" Bryant said at the dedication. \"This is where all my memories lie.\"",
      "Bryant's retired No. 33 hangs above the gym doors, a permanent reminder to every Ace who walks onto the floor of the standard this program plays to.",
    ],
  },
  {
    id: "welcome-aces-nation",
    date: "Program",
    sortKey: 20240901,
    category: "About the Program",
    title: "Welcome to Aces Nation",
    excerpt: "Seven state titles, 1,600-plus wins, and more than a century of Main Line basketball. This is Lower Merion.",
    featured: false,
    body: [
      "Lower Merion basketball is one of the most decorated programs in Pennsylvania history: seven PIAA state championships, seventeen District 1 titles, and more than 1,600 all-time victories.",
      "From the Anderson dynasty of the 1940s to the Kobe Bryant era to today's teams under Coach Gregg Downer, the standard has never changed: compete for championships, and represent the Main Line the right way.",
      "Check back here all season for game recaps, milestones, and the latest from Aces Nation.",
    ],
  },
];

export const alumni = [
  { name: "Kobe Bryant", classYear: "'96", college: "Direct to NBA", pro: "Los Angeles Lakers — 5× Champion, MVP, 18× All-Star, Hall of Famer", highlight: true,
    photo: "/players/kobe-bryant.jpg",
    stats: "2,883 career points (Southeastern PA record) · 30.8 PPG as a senior · led LM to the 1996 PIAA state title at 31-3",
    funFacts: [
      "Named Naismith and Gatorade National High School Player of the Year as a senior in 1996.",
      "Wore his Lower Merion practice shorts under his Lakers uniform for every NBA game.",
      "The Aces' home gym was renamed the Kobe Bryant Gymnasium in his honor in 2010.",
    ] },
  { name: "Jim Brogan", classYear: "'78", college: "West Virginia Wesleyan", pro: "San Diego Clippers (NBA)",
    stats: "Reached the NBA with the San Diego Clippers (1981 to 1983), appearing in 121 games.",
    funFacts: [
      "Born in Ardmore, PA, the home of Lower Merion High School.",
      "Became a pro shooting and skills trainer who has worked with athletes including Drew Brees and Cole Hamels.",
    ] },
  { name: "B.J. Johnson", classYear: "'14", college: "Syracuse → La Salle (D-I)", pro: "Orlando Magic (NBA) / overseas", photo: "/players/bj-johnson.jpg",
    stats: "1,070 points at La Salle. As a senior averaged 20.8 points and 8.3 rebounds and made 2nd Team All-Atlantic 10.",
    funFacts: [
      "Signed with the Orlando Magic in 2018 and played for their G League affiliate, the Lakeland Magic.",
      "Posted 22 points and 11 rebounds in Lower Merion's 2013 PIAA state title win over Chester.",
    ] },
  { name: "Demetrius Lilley", classYear: "'22", college: "Penn State → Binghamton (D-I)", pro: "2× District 1 6A Champion", photo: "/players/demetrius-lilley.jpg",
    stats: "Played 25 games over two seasons at Penn State (2.8 pts, 2.7 reb as a sophomore) before transferring to Binghamton.",
    funFacts: [
      "Lower Merion's all-time leading rebounder, and led the Aces to back-to-back District 1 6A championships.",
      "Reported to be the first Lower Merion player to average a double-double in three straight seasons since Kobe Bryant.",
    ] },
  { name: "Sam Brown", classYear: "'23", college: "Penn → Davidson (D-I)", pro: "Ivy League standout", photo: "/players/sam-brown.jpg",
    stats: "Three-time Ivy League Rookie of the Week at Penn as a freshman (2023-24) before transferring to Davidson.",
    funFacts: [
      "Son of former Philadelphia 76ers head coach Brett Brown.",
      "A four-year standout and one of the region's best shooters who grew up attending games at the Palestra.",
    ] },
  { name: "Jack Forrest", classYear: "'19", college: "Columbia → Saint Joseph's → Bucknell (D-I)", pro: "Central League MVP", photo: "/players/jack-forrest.jpg",
    stats: "1,216 career college points. As a Bucknell senior started all 33 games at 16.0 points and 5.2 rebounds and was Patriot League Scholar-Athlete of the Year.",
    funFacts: [
      "Won three Central League titles at Lower Merion, scored over 1,000 points, and was league MVP as a senior.",
      "Earned Ivy League Rookie of the Week at Columbia after a 23-point game against Cornell.",
    ] },
  { name: "John Mobley", classYear: "'24", college: "Fork Union → Edinboro (D-II)", pro: "District 1 Champion", photo: "/players/john-mobley.jpg",
    funFacts: [
      "A two-sport athlete in basketball and football who helped the Aces win a Central League championship.",
      "Took a postgraduate year at Fork Union Military Academy before joining Edinboro.",
    ] },
  { name: "Owen McCabe", classYear: "'24", college: "Penn State Behrend (D-III)", pro: "All-Central League",
    funFacts: [
      "An All-Central League guard and two-time Central League champion, and a two-sport athlete at Lower Merion.",
      "Missed his first college season (2024-25) at Penn State Behrend due to injury.",
    ] },
  { name: "Carson Kasmer", classYear: "'25", college: "Gettysburg College (D-III)", pro: "Central League MVP (2025)", photo: "/players/carson-kasmer.jpg",
    funFacts: [
      "Led Lower Merion in scoring at 20.4 points per game as a senior, a two-time District 1 champ and three-time Central League champ.",
      "Ties for the most career wins in Lower Merion history and holds the school record with seven threes in a game.",
    ] },
  { name: "Jaylen Shippen", classYear: "'22", college: "Clarion University (D-II)", pro: "2× District 1 Champion", photo: "/players/jaylen-shippen.jpg",
    stats: "Junior guard at Clarion University.",
    funFacts: [
      "Helped Lower Merion win back-to-back District 1 6A titles and led the team with 60 steals as a senior.",
      "Part of Central League championship teams in both 2019 and 2022.",
    ] },
  { name: "Garrett Williamson", classYear: "'06", college: "Saint Joseph's (D-I)", pro: "London Lightning (NBL Canada)",
    stats: "Two-time Atlantic 10 All-Defensive Team; career-best 12.1 points per game as a senior, All-Big 5 Second Team.",
    funFacts: [
      "Played on Saint Joseph's 2008 NCAA Tournament team and was one of the Hawks' best-ever defenders.",
      "Named NBL Canada Player of the Year with the London Lightning, averaging over 18 points per game in 2013-14.",
    ] },
  { name: "Ryan Brooks", classYear: "'06", college: "Temple University (D-I)", pro: "Pro career in France & Germany", photo: "/players/ryan-brooks.jpg",
    stats: "1,225 career points at Temple; led the Owls in scoring as a senior at 14.3 points per game.",
    funFacts: [
      "First-team All-State as a senior, helped win the 2006 PIAA state title, and finished third on Lower Merion's all-time scoring list.",
      "Played professionally overseas, including with JDA Dijon in France and clubs in Germany.",
    ] },
  { name: "Al Bonniwell", classYear: "'30", college: "Dartmouth (NCAA 1st Team All-American, All-Ivy)", pro: "Akron Firestone Non-Skids (NBL)" },
  { name: "Alai Nuualiitia", classYear: "'98", college: "Brown University (D-I)", pro: "Brown Athletic Hall of Fame",
    stats: "Three-time All-Ivy (first team as a senior); started all 110 career games; 1,344 points rank 8th in Brown history.",
    funFacts: [
      "1998 Central League MVP at Lower Merion, averaging over 20 points and 10 rebounds per game.",
      "Never missed a game at Brown, starting all 110 straight, and was inducted into the Brown Athletic Hall of Fame in 2018.",
    ] },
  { name: "Kevin Lonesome", classYear: "'76", college: "Abilene Christian University (D-I)", pro: "HS coaching career — mentored Deron Williams" },
  { name: "Dan Capkin", classYear: "'05", college: "Gettysburg College (D-III)", pro: "D-III & Academic All-American",
    stats: "A four-year starter at Gettysburg who became a Division III All-American and an ESPN Academic All-American.",
    funFacts: [
      "Led Lower Merion to the 2005 PIAA state finals despite a foot injury and finished with 1,072 career points.",
      "Earned both All-American and Academic All-American recognition at Gettysburg.",
    ] },
  { name: "Brad Long", classYear: "'01", college: "Norfolk State University (D-I)", pro: "" },
  { name: "Sam Wright", classYear: "'23", college: "4-year varsity starter, 1,000+ career pts", pro: "2× District 1 Champ, Central League Champ. 'Top 5 shooter in the state' — Downer" },
  { name: "Gus Wright", classYear: "'25", college: "4-year varsity player", pro: "Central League Champion (2025), 101 career wins" },
  { name: "Sarah Lowe", classYear: "'02", college: "University of Florida (D-I)", pro: "2020 SEC Legend", gender: "women", photo: "/players/sarah-lowe.jpg",
    stats: "739 career points and 176 steals at Florida; three-time team captain, only the second Gator ever named captain three times.",
    funFacts: [
      "Lower Merion's all-time leading girls basketball scorer with 1,676 career points.",
      "Earned an NCAA Postgraduate Scholarship and was honored as a 2020 SEC Legend.",
    ] },
];

// Look up a player's self-hosted photo by name (single source of truth = alumni).
export const photoFor = (name) => (alumni.find(x => x.name === name)?.photo) || null;
// Look up a player's full alumni profile by name (for cross-page detail modals).
export const alumniByName = (name) => alumni.find(x => x.name === name) || null;

// ─── Instagram ────────────────────────────────────────────────
// The grid below is a visual highlight reel that links to the profile.
// To make it a LIVE auto-updating post feed, see the note in SocialPage.
export const instagram = {
  handle: "acesbasketball",
  url: "https://www.instagram.com/acesbasketball/",
  name: "Lower Merion Aces Basketball",
  posts: "894",
  followers: "6.3K",
};
export const instagramPosts = [
  "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg",
  "/coaches/gregg-downer.jpg",
  "/players/kobe-action.jpg",
  "/players/demetrius-lilley.jpg",
  "/players/sam-brown.jpg",
  "/players/carson-kasmer.jpg",
  "/players/jaylen-shippen.jpg",
  "/players/ryan-brooks.jpg",
];

export const centralLeagueTeams = [
  { name: "Lower Merion", mascot: "Aces", color: "#840036", initials: "LM", desc: "The flagship program of the Central League. 7 PIAA state titles (1933, '41, '42, '43, '96, '06, '13), 16 District 1 titles, 23 league championships and 1,600+ all-time wins. Home of Kobe Bryant and legendary coach Gregg Downer.", isSelf: true },
  { name: "Conestoga", mascot: "Pioneers", color: "#003366", initials: "CO", desc: "Founding Central League member (1967). Has emerged as a top contender in recent years, winning the Central League title in 2025-26 and earning the #1 seed in District 1 6A. A rising power in Chester County." },
  { name: "Garnet Valley", mascot: "Jaguars", color: "#8B0000", initials: "GV", desc: "Joined the Central League in 2008. Quickly became competitive, capturing the 2021 Central League title along with District 1 success and a trip to the 2019 PIAA 6A state finals. A rising power in Delaware County." },
  { name: "Harriton", mascot: "Rams", color: "#1E4D2B", initials: "HN", desc: "A founding member that departed in 1969 and returned in 2008. Located in Lower Merion Township alongside LM, creating the crosstown rivalry. Competitive in league play with growing program success." },
  { name: "Haverford", mascot: "Fords", color: "#CC0000", initials: "HF", desc: "A founding Central League member and consistent competitor. The Fords have made multiple District 1 playoff runs and are a perennial factor in Central League standings with deep playoff pushes." },
  { name: "Marple Newtown", mascot: "Tigers", color: "#FF6600", initials: "MN", desc: "Founding member known for competitive teams across multiple eras. The Tigers have long been a factor in Central League play, with District 1 playoff appearances and a proud basketball tradition." },
  { name: "Penncrest", mascot: "Lions", color: "#003087", initials: "PC", desc: "Founding member from Media, PA. Strong recent seasons including a breakout 2025-26 campaign with District 1 playoff contention. The Lions compete fiercely in the Central League." },
  { name: "Radnor", mascot: "Raptors", color: "#006400", initials: "RD", desc: "Founding member and frequent contender. Won the Central League championship in 2022-23 behind All-Delco Player of the Year Jackson Hicke. Multiple District 1 playoff appearances." },
  { name: "Ridley", mascot: "Green Raiders", color: "#006633", initials: "RI", desc: "Joined the Central League in 1969, replacing Harriton. The Green Raiders bring a strong Delaware County basketball tradition with multiple league playoff appearances." },
  { name: "Springfield", mascot: "Cougars", color: "#0033A0", initials: "SP", desc: "Founding member from Springfield, Delaware County. The Cougars have produced competitive teams with Central League title contention and District 1 playoff runs." },
  { name: "Strath Haven", mascot: "Panthers", color: "#800020", initials: "SH", desc: "Joined in 1983. The Panthers from Wallingford have been a steady Central League competitor, with notable seasons including league playoff contention and District 1 appearances." },
  { name: "Upper Darby", mascot: "Royals", color: "#4B0082", initials: "UD", desc: "Founding member and the largest school in the league by enrollment. Strong recent years including standout players like Nadir Myers. State playoff appearances and a deep basketball tradition." },
];

// ─── Central League Champions (source: Beyond the Arc) ───────
// Year = season-ending year. Multiple teams = co-champions.
export const centralLeagueChampions = [
  { year: 2026, teams: ["Conestoga"] },
  { year: 2025, teams: ["Lower Merion"] },
  { year: 2024, teams: ["Lower Merion"] },
  { year: 2023, teams: ["Radnor"] },
  { year: 2022, teams: ["Lower Merion"] },
  { year: 2021, teams: ["Garnet Valley"] },
  { year: 2020, teams: ["Haverford"] },
  { year: 2019, teams: ["Lower Merion"] },
  { year: 2018, teams: ["Lower Merion"] },
  { year: 2017, teams: ["Lower Merion"] },
  { year: 2016, teams: ["Ridley"] },
  { year: 2015, teams: ["Ridley"] },
  { year: 2014, teams: ["Lower Merion"] },
  { year: 2013, teams: ["Lower Merion"] },
  { year: 2012, teams: ["Lower Merion"] },
  { year: 2011, teams: ["Upper Darby"] },
  { year: 2010, teams: ["Penncrest"] },
  { year: 2009, teams: ["Lower Merion"] },
  { year: 2008, teams: ["Ridley", "Conestoga"] },
  { year: 2007, teams: ["Upper Darby"] },
  { year: 2006, teams: ["Lower Merion", "Springfield"] },
  { year: 2005, teams: ["Ridley"] },
  { year: 2004, teams: ["Ridley"] },
  { year: 2003, teams: ["Strath Haven"] },
  { year: 2002, teams: ["Lower Merion"] },
  { year: 2001, teams: ["Lower Merion"] },
  { year: 2000, teams: ["Lower Merion"] },
  { year: 1999, teams: ["Penncrest"] },
  { year: 1998, teams: ["Lower Merion", "Conestoga"] },
  { year: 1997, teams: ["Lower Merion", "Conestoga"] },
  { year: 1996, teams: ["Lower Merion"] },
  { year: 1995, teams: ["Lower Merion"] },
  { year: 1994, teams: ["Ridley"] },
  { year: 1993, teams: ["Ridley"] },
  { year: 1992, teams: ["Ridley"] },
  { year: 1991, teams: ["Ridley"] },
  { year: 1990, teams: ["Ridley", "Strath Haven"] },
  { year: 1989, teams: ["Ridley"] },
  { year: 1988, teams: ["Conestoga", "Springfield"] },
  { year: 1987, teams: ["Ridley"] },
  { year: 1986, teams: ["Conestoga"] },
  { year: 1985, teams: ["Strath Haven"] },
  { year: 1984, teams: ["Lower Merion"] },
  { year: 1983, teams: ["Penncrest"] },
  { year: 1982, teams: ["Springfield"] },
  { year: 1981, teams: ["Springfield"] },
  { year: 1980, teams: ["Penncrest"] },
  { year: 1979, teams: ["Upper Darby"] },
  { year: 1978, teams: ["Lower Merion"] },
  { year: 1977, teams: ["Conestoga"] },
  { year: 1976, teams: ["Lower Merion"] },
  { year: 1975, teams: ["Lower Merion"] },
  { year: 1974, teams: ["Springfield"] },
  { year: 1973, teams: ["Upper Darby"] },
  { year: 1972, teams: ["Lower Merion"] },
  { year: 1971, teams: ["Ridley"] },
  { year: 1970, teams: ["Haverford"] },
  { year: 1969, teams: ["Penncrest"] },
  { year: 1968, teams: ["Penncrest"] },
];

export const coachingStaff = [
  { name: "Gregg Downer", role: "Head Coach", since: "1990", photo: "/coaches/gregg-downer.jpg", bio: "3× PA Coach of the Year. 700+ career victories, 3 state championships (1996, 2006, 2013), 17+ league titles, roughly a 70% winning percentage. Coached Kobe Bryant. Inductee in 3 PA sports halls of fame. Named 'Best Basketball Coach in Pennsylvania' by USA Today.",
    funFacts: [
      "Coached Kobe Bryant, who credited Downer with shaping his development as a player and a person.",
      "More than 70 of his players have gone on to play basketball at the college or professional level.",
      "Reached 700 career wins in a 2025 victory at Haverford, all at Lower Merion across 35-plus seasons.",
    ] },
  { name: "Kevin Grugan", role: "Top Assistant Coach", since: "", bio: "Widely regarded as one of the best assistant coaches in the state of Pennsylvania. Grugan is Coach Downer's right hand and a critical architect of the Aces' sustained success." },
  { name: "John Gallman", role: "Assistant Coach", since: "", bio: "Veteran assistant coach helping guide the Aces alongside Coach Downer." },
  { name: "Mike Lachs", role: "Assistant Coach", since: "", bio: "Dedicated assistant contributing to player development and game preparation." },
  { name: "Adam Miller", role: "Assistant Coach", since: "", bio: "Key staff member supporting the program's continued success." },
  { name: "Eric Montanari", role: "Assistant Coach", since: "", bio: "Instrumental in daily operations and development of Lower Merion's talent." },
  { name: "Matt Schwartz", role: "Assistant Coach", since: "", bio: "Bringing energy and expertise to the Aces coaching staff." },
];

export const thousandPointClub = [
  { rank: 1, name: "Kobe Bryant", points: "2,883", year: "1996", highlight: true },
  { rank: 2, name: "Greg Robbins", points: "1,619", year: "2009" },
  { rank: 3, name: "Steve Payne", points: "1,480", year: "2019" },
  { rank: 4, name: "Garrett Williamson", points: "1,349", year: "2006" },
  { rank: 5, name: "Sam Brown", points: "1,325", year: "2023" },
  { rank: 6, name: "Ryan Brooks", points: "1,319", year: "2006" },
  { rank: 7, name: "Jared Lewis", points: "1,306", year: "2003" },
  { rank: 8, name: "Demetrius Lilley", points: "1,301", year: "2022" },
  { rank: 9, name: "B.J. Johnson", points: "1,241", year: "2013" },
  { rank: 10, name: "Jack Forrest", points: "1,209", year: "2019" },
  { rank: 11, name: "Mike Venafra", points: "1,146", year: "2000" },
  { rank: 12, name: "Dan Capkin", points: "1,072", year: "2005" },
  { rank: 13, name: "Alex Goodman", points: "1,021", year: "1991" },
  { rank: 14, name: "Mitch McDaniel", points: "1,017", year: "1963" },
];

export const seasonData = {
  "2025-26": {
    wins: 15, losses: 9, confW: 10, confL: 6, confPlace: "5th", notes: "Central League",
    games: [
      { date: "12/5",  opp: "Coatesville",      loc: "@",  r: "L", lm: 62, them: 76 },
      { date: "12/6",  opp: "Downingtown West",  loc: "vs", r: "W", lm: 75, them: 55 },
      { date: "12/9",  opp: "Garnet Valley",     loc: "vs", r: "L", lm: 60, them: 69, conf: true },
      { date: "12/11", opp: "Conestoga",         loc: "@",  r: "L", lm: 45, them: 50, conf: true },
      { date: "12/16", opp: "Ridley",            loc: "@",  r: "W", lm: 61, them: 49, conf: true },
      { date: "12/18", opp: "Haverford",         loc: "@",  r: "W", lm: 61, them: 48, conf: true },
      { date: "12/23", opp: "Upper Darby",       loc: "vs", r: "W", lm: 60, them: 52, conf: true },
      { date: "12/29", opp: "St. Joseph's CA",   loc: "vs", r: "W", lm: 62, them: 35, tag: "TOURNEY" },
      { date: "12/30", opp: "State College",     loc: "@",  r: "W", lm: 59, them: 53, tag: "TOURNEY" },
      { date: "1/3",   opp: "Marple Newtown",    loc: "vs", r: "W", lm: 55, them: 47, conf: true },
      { date: "1/6",   opp: "Strath Haven",      loc: "@",  r: "W", lm: 65, them: 36, conf: true },
      { date: "1/8",   opp: "Penncrest",         loc: "vs", r: "L", lm: 45, them: 55, conf: true },
      { date: "1/10",  opp: "Northampton",       loc: "@",  r: "W", lm: 71, them: 45 },
      { date: "1/13",  opp: "Radnor",            loc: "@",  r: "W", lm: 69, them: 47, conf: true },
      { date: "1/15",  opp: "Harriton",          loc: "vs", r: "W", lm: 71, them: 39, conf: true },
      { date: "1/21",  opp: "Springfield",       loc: "@",  r: "L", lm: 52, them: 53, conf: true },
      { date: "1/23",  opp: "Garnet Valley",     loc: "@",  r: "W", lm: 52, them: 43, conf: true },
      { date: "1/24",  opp: "Liberty",           loc: "@",  r: "W", lm: 55, them: 41 },
      { date: "1/28",  opp: "Conestoga",         loc: "vs", r: "L", lm: 55, them: 61, conf: true },
      { date: "1/29",  opp: "Ridley",            loc: "vs", r: "W", lm: 75, them: 45, conf: true },
      { date: "1/31",  opp: "Haverford",         loc: "vs", r: "W", lm: 60, them: 47, conf: true },
      { date: "2/3",   opp: "Upper Darby",       loc: "@",  r: "L", lm: 45, them: 48, conf: true },
      { date: "2/5",   opp: "Garnet Valley",     loc: "@",  r: "L", lm: 46, them: 66, tag: "CAL PLAYOFF" },
      { date: "2/13",  opp: "Pennsbury",         loc: "vs", r: "L", lm: 45, them: 51, tag: "D1 PLAYOFF" },
    ],
  },
  "2024-25": { wins: 22, losses: 8, confW: 14, confL: 2, confPlace: "1st", notes: "Central League Champions · PIAA 6A State Tournament R2 · Lost to Roman Catholic 63-74", highlight: "CAL Champs", games: [] },
  "2023-24": { wins: 28, losses: 2, confW: 16, confL: 0, confPlace: "1st", notes: "Central League Champions · District 1 Champions · PIAA 6A State Tournament R2", highlight: "District 1 Champs · 28-2", games: [] },
  "2022-23": { wins: 23, losses: 7, confW: 13, confL: 3, confPlace: "2nd", notes: "Central League Finalist · District 1 Champions · PIAA 6A State Quarterfinalist", highlight: "District 1 Champs", games: [] },
  "2021-22": { wins: 27, losses: 4, confW: 15, confL: 1, confPlace: "1st", notes: "Central League Champions · District 1 Champions · PIAA 6A State Runner-Up", highlight: "District 1 Champs · State Runner-Up", games: [] },
  "2020-21": { wins: 17, losses: 4, confW: 12, confL: 2, confPlace: "1st", notes: "Central League Co-Champions · District 1 Champions · COVID-shortened season", highlight: "District 1 Champs", games: [] },
  "2019-20": { wins: 21, losses: 5, confW: 13, confL: 3, confPlace: "2nd", notes: "District 1 Semifinalist · Season ended early due to COVID-19", highlight: "", games: [] },
};

export const recordBookSeasons = {
  "2025-26": { record: "15-9", games: 24, leaders: [
    { name: "Kyle Parrish",     number: "24", gp: 24, pts: 310, reb: 72,  ast: 119, stl: 51, blk: 2,  threes: 29, fgPct: "43.1", ftPct: "70.8", mins: 651 },
    { name: "Israel Ingram",    number: "5",  gp: 24, pts: 286, reb: 83,  ast: 33,  stl: 33, blk: 7,  threes: 54, fgPct: "37.3", ftPct: "60.3", mins: 626 },
    { name: "William Yard",     number: "13", gp: 24, pts: 168, reb: 86,  ast: 40,  stl: 28, blk: 10, threes: 36, fgPct: "52.5", ftPct: "66.7", mins: 540 },
    { name: "Finn Pulsifer",    number: "4",  gp: 24, pts: 165, reb: 94,  ast: 28,  stl: 29, blk: 18, threes: 3,  fgPct: "49.3", ftPct: "78.6", mins: 476 },
    { name: "Bereket Darsenie", number: "1",  gp: 24, pts: 140, reb: 40,  ast: 27,  stl: 17, blk: 2,  threes: 35, fgPct: "40.7", ftPct: "50.0", mins: 390 },
    { name: "Arjay Miller",     number: "0",  gp: 24, pts: 105, reb: 36,  ast: 30,  stl: 19, blk: 0,  threes: 28, fgPct: "34.0", ftPct: "60.0", mins: 520 },
    { name: "Nicholas Dragut",  number: "35", gp: 16, pts: 72,  reb: 46,  ast: 18,  stl: 4,  blk: 7,  threes: 2,  fgPct: "68.9", ftPct: "66.7", mins: 191 },
    { name: "Darius Mitchell",  number: "2",  gp: 21, pts: 59,  reb: 31,  ast: 10,  stl: 11, blk: 0,  threes: 6,  fgPct: "50.0", ftPct: "65.0", mins: 204 },
  ]},
  "2024-25": { record: "22-7", games: 30, leaders: [
    { name: "Carson Kasmer",    number: "14", gp: 30, pts: 530, reb: 93,  ast: 60,  stl: 47, blk: 0,  threes: 60, fgPct: "48.6", ftPct: "85.7", mins: 902 },
    { name: "Rashyne Patterson", number: "4", gp: 30, pts: 348, reb: 182, ast: 58,  stl: 39, blk: 51, threes: 36, fgPct: "53.0", ftPct: "82.1", mins: 773 },
    { name: "Sami Singletary",  number: "—", gp: 30, pts: 321, reb: 115, ast: 59,  stl: 40, blk: 4,  threes: 32, fgPct: "44.8", ftPct: "67.9", mins: 757 },
    { name: "Gus Wright",       number: "11", gp: 30, pts: 301, reb: 107, ast: 82,  stl: 66, blk: 1,  threes: 42, fgPct: "43.7", ftPct: "66.3", mins: 854 },
    { name: "LaMont Grier",     number: "1",  gp: 28, pts: 176, reb: 59,  ast: 37,  stl: 54, blk: 5,  threes: 24, fgPct: "50.8", ftPct: "77.4", mins: 613 },
    { name: "Kyle Parrish",     number: "24", gp: 30, pts: 93,  reb: 38,  ast: 38,  stl: 36, blk: 4,  threes: 11, fgPct: "40.4", ftPct: "45.5", mins: 366 },
    { name: "William Yard",     number: "13", gp: 28, pts: 56,  reb: 33,  ast: 17,  stl: 9,  blk: 2,  threes: 10, fgPct: "38.6", ftPct: "75.0", mins: 219 },
    { name: "Chris Cook",       number: "23", gp: 24, pts: 37,  reb: 40,  ast: 9,   stl: 6,  blk: 4,  threes: 0,  fgPct: "60.9", ftPct: "75.0", mins: 173 },
  ]},
  "2023-24": { record: "28-2", games: 30, leaders: [
    { name: "John Mobley",      number: "4",  gp: 30, pts: 437, reb: 180, ast: 84,  stl: 68, blk: 27, threes: 38, fgPct: "45.8", ftPct: "67.5", mins: 831 },
    { name: "Owen McCabe",      number: "0",  gp: 30, pts: 427, reb: 64,  ast: 75,  stl: 46, blk: 0,  threes: 68, fgPct: "47.5", ftPct: "76.6", mins: 862 },
    { name: "Adam Herrenkohl",  number: "2",  gp: 30, pts: 397, reb: 173, ast: 139, stl: 68, blk: 4,  threes: 50, fgPct: "53.0", ftPct: "73.3", mins: 818 },
    { name: "Carson Kasmer",    number: "14", gp: 30, pts: 298, reb: 54,  ast: 36,  stl: 25, blk: 2,  threes: 55, fgPct: "51.9", ftPct: "91.1", mins: 601 },
    { name: "Jayden Robinson",  number: "21", gp: 29, pts: 247, reb: 97,  ast: 15,  stl: 22, blk: 20, threes: 5,  fgPct: "59.7", ftPct: "74.4", mins: 525 },
    { name: "Justin Mebane",    number: "10", gp: 29, pts: 122, reb: 76,  ast: 23,  stl: 12, blk: 13, threes: 0,  fgPct: "55.8", ftPct: "76.2", mins: 440 },
    { name: "Gus Wright",       number: "11", gp: 29, pts: 79,  reb: 38,  ast: 23,  stl: 22, blk: 0,  threes: 16, fgPct: "39.7", ftPct: "56.5", mins: 426 },
    { name: "Sami Singletary",  number: "—", gp: 13, pts: 28,  reb: 12,  ast: 7,   stl: 8,  blk: 1,  threes: 4,  fgPct: "39.1", ftPct: "60.0", mins: 64 },
  ]},
  "2022-23": { record: "24-6", games: 30, leaders: [
    { name: "Sam Brown",           number: "11", gp: 30, pts: 530, reb: 128, ast: 80, stl: 34, blk: 10, threes: 80, fgPct: "43.6", ftPct: "85.0", mins: 834 },
    { name: "Sam Wright",          number: "24", gp: 29, pts: 381, reb: 104, ast: 59, stl: 43, blk: 6,  threes: 45, fgPct: "41.0", ftPct: "83.2", mins: 773 },
    { name: "John Mobley",         number: "4",  gp: 29, pts: 258, reb: 137, ast: 53, stl: 35, blk: 12, threes: 3,  fgPct: "53.6", ftPct: "68.1", mins: 641 },
    { name: "Justin Poles",        number: "2",  gp: 29, pts: 223, reb: 101, ast: 78, stl: 33, blk: 3,  threes: 4,  fgPct: "54.3", ftPct: "80.7", mins: 657 },
    { name: "Jordan Meekins",      number: "15", gp: 29, pts: 161, reb: 96,  ast: 13, stl: 22, blk: 19, threes: 28, fgPct: "44.1", ftPct: "76.5", mins: 495 },
    { name: "Teddy Pendergrass III", number: "1", gp: 29, pts: 151, reb: 39, ast: 29, stl: 16, blk: 5,  threes: 23, fgPct: "44.2", ftPct: "73.3", mins: 455 },
    { name: "Owen McCabe",         number: "0",  gp: 30, pts: 113, reb: 41,  ast: 20, stl: 26, blk: 1,  threes: 22, fgPct: "44.0", ftPct: "84.6", mins: 591 },
    { name: "Carson Kasmer",       number: "14", gp: 16, pts: 33,  reb: 7,   ast: 7,  stl: 4,  blk: 0,  threes: 7,  fgPct: "55.6", ftPct: "100",  mins: 78 },
  ]},
  "2021-22": { record: "27-4", games: 30, leaders: [
    { name: "Demetrius Lilley", number: "14", gp: 26, pts: 465, reb: 325, ast: 17, stl: 21, blk: 25, threes: 18, fgPct: "56.2", ftPct: "61.5", mins: 703 },
    { name: "Sam Brown",        number: "11", gp: 22, pts: 359, reb: 73,  ast: 40, stl: 21, blk: 3,  threes: 63, fgPct: "44.7", ftPct: "76.7", mins: 620 },
    { name: "Sam Wright",       number: "24", gp: 29, pts: 237, reb: 85,  ast: 51, stl: 30, blk: 7,  threes: 46, fgPct: "35.8", ftPct: "72.5", mins: 756 },
    { name: "Jaylen Shippen",   number: "0",  gp: 29, pts: 206, reb: 88,  ast: 105,stl: 30, blk: 0,  threes: 15, fgPct: "34.4", ftPct: "43.2", mins: 806 },
    { name: "Justin Poles",     number: "2",  gp: 29, pts: 189, reb: 98,  ast: 56, stl: 26, blk: 1,  threes: 5,  fgPct: "50.0", ftPct: "75.3", mins: 680 },
    { name: "Peter Gribbin",    number: "4",  gp: 28, pts: 114, reb: 42,  ast: 18, stl: 11, blk: 0,  threes: 13, fgPct: "43.0", ftPct: "81.8", mins: 406 },
    { name: "Henry Bard",       number: "22", gp: 23, pts: 38,  reb: 53,  ast: 23, stl: 9,  blk: 6,  threes: 5,  fgPct: "30.8", ftPct: "60.0", mins: 354 },
    { name: "Teddy Pendergrass III", number: "1", gp: 19, pts: 33, reb: 14, ast: 8, stl: 9, blk: 0,  threes: 3,  fgPct: "47.8", ftPct: "72.7", mins: 139 },
  ]},
  "2020-21": { record: "13-5", games: 18, leaders: [
    { name: "Demetrius Lilley", number: "14", gp: 17, pts: 348, reb: 210, ast: 16, stl: 10, blk: 16, threes: 13, fgPct: "59.2", ftPct: "75.0", mins: 468 },
    { name: "Sam Davison",      number: "1",  gp: 18, pts: 212, reb: 63,  ast: 65, stl: 23, blk: 3,  threes: 18, fgPct: "50.3", ftPct: "75.0", mins: 524 },
    { name: "Sam Brown",        number: "11", gp: 18, pts: 204, reb: 44,  ast: 31, stl: 15, blk: 3,  threes: 37, fgPct: "43.1", ftPct: "86.0", mins: 514 },
    { name: "Jaylen Shippen",   number: "0",  gp: 18, pts: 124, reb: 42,  ast: 53, stl: 18, blk: 1,  threes: 12, fgPct: "39.1", ftPct: "56.5", mins: 425 },
    { name: "Zack Wong",        number: "21", gp: 18, pts: 113, reb: 65,  ast: 36, stl: 17, blk: 11, threes: 15, fgPct: "48.9", ftPct: "62.5", mins: 387 },
    { name: "Sam Wright",       number: "24", gp: 18, pts: 61,  reb: 22,  ast: 15, stl: 5,  blk: 0,  threes: 17, fgPct: "38.8", ftPct: "85.7", mins: 217 },
    { name: "Phil Cook",        number: "5",  gp: 17, pts: 35,  reb: 40,  ast: 6,  stl: 6,  blk: 1,  threes: 1,  fgPct: "37.8", ftPct: "50.0", mins: 126 },
    { name: "Peter Gribbin",    number: "4",  gp: 15, pts: 25,  reb: 9,   ast: 9,  stl: 3,  blk: 0,  threes: 5,  fgPct: "38.5", ftPct: "—",    mins: 103 },
  ]},
  "2019-20": { record: "20-8", games: 30, leaders: [
    { name: "Demetrius Lilley", number: "14", gp: 27, pts: 449, reb: 331, ast: 21, stl: 13, blk: 23, threes: 6,  fgPct: "56.4", ftPct: "66.3", mins: 732 },
    { name: "James Simples",    number: "4",  gp: 26, pts: 297, reb: 144, ast: 119,stl: 39, blk: 35, threes: 5,  fgPct: "55.5", ftPct: "46.5", mins: 795 },
    { name: "Sam Brown",        number: "11", gp: 25, pts: 260, reb: 53,  ast: 26, stl: 26, blk: 4,  threes: 67, fgPct: "38.2", ftPct: "72.1", mins: 735 },
    { name: "Jaylen Shippen",   number: "0",  gp: 29, pts: 154, reb: 64,  ast: 67, stl: 31, blk: 0,  threes: 20, fgPct: "35.8", ftPct: "53.7", mins: 721 },
    { name: "Phil Cook",        number: "5",  gp: 28, pts: 115, reb: 97,  ast: 15, stl: 12, blk: 4,  threes: 6,  fgPct: "45.7", ftPct: "67.6", mins: 401 },
    { name: "Eli Rothman",      number: "0",  gp: 24, pts: 109, reb: 50,  ast: 22, stl: 20, blk: 0,  threes: 9,  fgPct: "30.6", ftPct: "61.5", mins: 368 },
    { name: "Peter Gribbin",    number: "4",  gp: 28, pts: 73,  reb: 33,  ast: 24, stl: 15, blk: 0,  threes: 10, fgPct: "38.0", ftPct: "56.3", mins: 371 },
    { name: "Lance Chestnut",   number: "10", gp: 20, pts: 73,  reb: 48,  ast: 31, stl: 11, blk: 1,  threes: 4,  fgPct: "41.4", ftPct: "57.9", mins: 313 },
  ]},
  "2018-19": { record: "25-4", games: 29, leaders: [
    { name: "Steve Payne",      number: "1",  gp: 29, pts: 501, reb: 184, ast: 109,stl: 38, blk: 3,  threes: 42, fgPct: "49.6", ftPct: "78.5", mins: 874 },
    { name: "Jack Forrest",     number: "2",  gp: 19, pts: 369, reb: 117, ast: 35, stl: 16, blk: 11, threes: 66, fgPct: "46.8", ftPct: "76.5", mins: 533 },
    { name: "Matt O'Connor",    number: "12", gp: 29, pts: 213, reb: 52,  ast: 36, stl: 5,  blk: 6,  threes: 61, fgPct: "39.4", ftPct: "75.9", mins: 689 },
    { name: "Julian Hairston",  number: "3",  gp: 29, pts: 190, reb: 52,  ast: 21, stl: 21, blk: 8,  threes: 40, fgPct: "39.0", ftPct: "59.1", mins: 525 },
    { name: "Theo Henry",       number: "15", gp: 26, pts: 169, reb: 106, ast: 55, stl: 26, blk: 0,  threes: 15, fgPct: "42.2", ftPct: "67.6", mins: 579 },
    { name: "Darryl Taylor",    number: "5",  gp: 28, pts: 167, reb: 68,  ast: 40, stl: 23, blk: 7,  threes: 12, fgPct: "46.7", ftPct: "63.0", mins: 612 },
    { name: "Josh Martin",      number: "30", gp: 29, pts: 162, reb: 197, ast: 26, stl: 15, blk: 17, threes: 0,  fgPct: "48.9", ftPct: "57.6", mins: 558 },
    { name: "Sam Oshtry",       number: "14", gp: 13, pts: 37,  reb: 15,  ast: 2,  stl: 5,  blk: 0,  threes: 2,  fgPct: "53.3", ftPct: "75.0", mins: 78 },
  ]},
};

// ─── Hall of Fame Data ────────────────────────────────────────
export const hallOfFame = [
  {
    name: "William H. 'Andy' Anderson",
    type: "coach",
    era: "1927–1945",
    title: "Head Coach",
    summary: "Led the Aces to four state titles, 12 District I titles, seven state finals appearances and set a school record for victories (346). His state playoff record of 59-8 (.880) is the best in PIAA history. Pioneered basketball rule changes including elimination of a jump ball after each score, the ten-second backcourt violation, and the three-second lane violation.",
    achievements: ["4× State Champion", "12× District I Title", "346 Career Wins", "59-8 State Playoff Record (.880)", "PIAA's Best Playoff Win % in History"],
    quote: "The other team can't score without the ball.",
    college: "Lafayette College — Head Coach & AD",
  },
  {
    name: "Al Bonniwell",
    type: "player",
    era: "'30",
    title: "Class of 1930",
    summary: "Leading scorer for Lower Merion's first state finalist and first district title team in 1930. Named NCAA First Team All-American and First Team All-Ivy League at Dartmouth College. Became Lower Merion's first professional basketball player when drafted by the NBL's Akron Firestone Non-Skids in 1937. Played with four brothers — the 'Bonniwell Boys' — a family team that won 17 consecutive games. A career Army officer who retired a full Colonel in 1967.",
    achievements: ["LM's First Pro Basketball Player", "1st Team NCAA All-American (Dartmouth)", "1st Team All-Ivy League", "NBL — Akron Firestone Non-Skids", "Retired U.S. Army Colonel"],
    college: "Dartmouth College",
  },
  {
    name: "Ira Rich",
    type: "player",
    era: "'40",
    title: "Class of 1940",
    summary: "Named First Team All-State in 1940 for a Lower Merion team that reached the Eastern Finals. He was 2nd Team All-State in 1939 when he helped lead the team to the State finals. He was the first African-American named PIAA First Team All-State. A legendary rebounder, Rich led the Maroon & White in scoring during two playoff campaigns.",
    achievements: ["1st Team All-State (1940)", "2nd Team All-State (1939)", "First African-American PIAA 1st Team All-State", "2× State Playoff Scoring Leader"],
    college: "",
  },
  {
    name: "Charles 'Dutch' Sivertsen",
    type: "player",
    era: "'41",
    title: "Class of 1941",
    summary: "A rare three-year star and captain of the 1941 state championship team. Earned first team All-State honors in his senior season and gained legendary status by notching 20 points in the 1941 title game against Duquesne. As a sophomore in 1939, scored a team-high 15 points in the Eastern Final. His clutch play and leadership set the tone for younger teammates who won consecutive titles in '42 and '43. Known for his hook shot, which he shot equally well with both hands.",
    achievements: ["State Champion (1941)", "1st Team All-State", "20 pts in 1941 State Final", "3-Year Varsity Star & Captain"],
    college: "",
  },
  {
    name: "Harry Middleton",
    type: "player",
    era: "'42",
    title: "Class of 1942",
    summary: "Key member of two state championship teams (1941, 1942) and a first team All-State selection and team captain in his senior season. A gifted ball-handler and shooter best known for his defensive prowess — he regularly drew the task of guarding the opponent's best player. In the 1941 title game, he held PA Player of the Year Chink Crossin to just three second-half points. Returned as honorary parade marshal for the 1996 and 2006 state title celebrations.",
    achievements: ["2× State Champion (1941, 1942)", "1st Team All-State", "Team Captain", "Honorary Parade Marshal — 1996 & 2006"],
    college: "Cornell University",
  },
  {
    name: "Greer Heindel",
    type: "player",
    era: "'43",
    title: "Class of 1943",
    summary: "The only player in Pennsylvania history to start on three consecutive state championship teams. During his career, the Aces went 69-3, the best three-year mark in team history. In the 1943 title game against Sharon, he led the Aces with nine points in a 29-28 thriller to help secure the program's first and only undefeated season (22-0). A first team All-State selection and team captain, he graduated as the school's all-time leading scorer.",
    achievements: ["3× State Champion (1941–43) — Only player in PA history", "69-3 career record", "1st Team All-State & Team Captain", "PA's Only 3× Consecutive State Champion Starter", "Program's first undefeated season (22-0)"],
    college: "University of Pennsylvania",
  },
  {
    name: "Mitch McDaniel",
    type: "player",
    era: "'63",
    title: "Class of 1963",
    summary: "Finished his career as the Aces' all-time leading scorer with 1,017 points, becoming the first Aces player to reach the 1,000-point plateau — a record that stood for nearly 30 years. During his senior season, averaged nearly 25 points per game and tallied a school-record 44 points against Norristown. A senior captain and two-time all-league selection.",
    achievements: ["First Aces Player to Score 1,000 Points", "School Record 44 pts vs. Norristown", "~25 PPG Senior Season", "2× All-League", "Senior Captain"],
    college: "Kutztown University",
  },
  {
    name: "Michael Holland",
    type: "player",
    era: "'67",
    title: "Class of 1967",
    summary: "An Aces captain and vaunted floor general, Holland was a two-time All-Suburban League selection. Went on to star at West Chester. As a head coach, he developed future Villanova coach Jay Wright. Named Bucks County Courier Times Coach of the Year, PA Athletic Conference Coach of the Year, and Small College Basketball Association Coach of the Year. Became the 1st Principal at Council Rock High School South in 2001.",
    achievements: ["2× All-Suburban League", "West Chester Hall of Fame (1991)", "Coached Jay Wright (Villanova)", "Multiple Coach of the Year Awards", "1st Principal, Council Rock South"],
    college: "West Chester University",
  },
  {
    name: "William 'Billy' Holland",
    type: "player",
    era: "'69",
    title: "Class of 1969",
    summary: "Helped lead the Aces to their first Central League title during a Cinderella 1967-68 campaign. A three-year star and senior captain noted for his deft jump shot and all-around floor game. Received an invitation to play in the Dapper Dan Roundball Classic — the equivalent of today's McDonald's All-American game. Led the development of the Ardmore Avenue Community Center.",
    achievements: ["Central League Champion", "Dapper Dan Roundball Classic Invitee", "1st Team All-League & All-Main Line", "Community Leader — Ardmore Avenue Center"],
    college: "Lincoln University — All-NAIA",
  },
  {
    name: "Gerald Mills",
    type: "player",
    era: "'74",
    title: "Class of 1974",
    summary: "The only returning player for the 1973-74 Aces, Mills led an unexpected run as senior captain, MVP, first team All-League, leading scorer and rebounder. Coach Bill Stephens called him 'another coach on the floor.' The Aces compiled a 27-7 league record during his two varsity campaigns. Went on to a Hall of Fame career at Cheyney University, where he was a member of the famed 1978 Division II National Championship team coached by John Chaney.",
    achievements: ["Senior Captain & League MVP", "1st Team All-League", "27-7 League Record", "Cheyney University Hall of Fame", "1978 Div. II National Champion (John Chaney)"],
    college: "Cheyney University",
  },
  {
    name: "Gregg Long",
    type: "player",
    era: "'75",
    title: "Class of 1975",
    summary: "Led the '75 Aces to the Central League Title and was voted League MVP. As one of only two returning varsity players and the sole senior starter, he provided critical leadership in a supposed rebuilding year. Led the Aces to their first state playoff win in 30 years. In six PIAA playoff games, Long scored 20+ points per game. Season averages of 18 points and 12 rebounds per game led the league in both categories.",
    achievements: ["Central League Champion & MVP", "1st Team All-League (Unanimous)", "18 PPG / 12 RPG — Led League in Both", "First State Playoff Win in 30 Years", "State Elite Eight"],
    college: "Norfolk State University",
  },
  {
    name: "Jim Brogan, Sam Brown & Kevin Lonesome",
    type: "player",
    era: "'76",
    title: "Class of 1976",
    summary: "The All-League trio propelled the Aces to their first District championship and first 20-win season in more than 30 years, winning 22 consecutive games including a Palestra thriller against Plymouth-Whitemarsh. Brogan (15 PPG) became LM's first NBA player with the San Diego Clippers. Brown starred at Cornell football and founded Xiatel Communications. Lonesome coached NBA star Deron Williams in Texas.",
    achievements: ["District 1 Champions", "22-Game Win Streak", "3× 1st Team All-League", "Jim Brogan — LM's First NBA Player (San Diego Clippers)", "Kevin Lonesome — Coached NBA Star Deron Williams"],
    college: "Brogan: West Virginia Wesleyan / Brown: Cornell / Lonesome: Abilene Christian",
  },
  {
    name: "Wendell Holland",
    type: "player",
    era: "'79",
    title: "Class of 1979",
    summary: "Helped fuel the resurgence of the program as a local power. The Aces went a combined 41-7 in league play during Holland's tenure — best since the mid-'40s. His teams strung together the first three consecutive winning seasons in 15 years, including a first-ever Central League title. Senior captain, leading scorer, and area All-Star. A distinguished alumnus of LMHS and Rutgers Law School, he became a Retired Judge.",
    achievements: ["41-7 League Record Over Career", "Central League Champion", "Senior Captain & Leading Scorer", "Area All-Star", "Retired Judge — Rutgers Law School"],
    college: "Fordham University — Recruited by Digger Phelps",
  },
  {
    name: "Mike Venafra",
    type: "player",
    era: "'01",
    title: "Class of 2001",
    summary: "Tallied 1,146 points in two sparkling seasons for the Aces, leading the program to back-to-back league championships and state playoff appearances in 2000 and 2001. His two-year varsity record of 46-15 (34-2 league) is one of the best in program history. Named Central League MVP in 2001. Went on to score 1,354 career points at DeSales University and was a regional Division III All-American.",
    achievements: ["Central League MVP (2001)", "1,146 Career Points", "46-15 Varsity Record (34-2 League)", "2× Central League Champion", "D-III Regional All-American (DeSales)"],
    college: "DeSales University — 1,354 pts, D-III All-American",
  },
  {
    name: "Sarah Lowe",
    type: "player",
    era: "'02",
    title: "Class of 2002",
    summary: "Lower Merion's all-time leading girls scorer with 1,676 points (2nd overall). A four-time First Team All-Central League honoree, she led the Aces girls to their first-ever league title in 2002. Named McDonald's All American Finalist and USA Today Player to Watch. At the University of Florida, she was named 2006 Woody Hayes National Scholar Athlete of the Year, Arthur Ashe Female Sports Scholar of the Year, and was a Fulbright Scholar and 2-time Rhodes Scholarship Finalist.",
    achievements: ["LM All-Time Girls Scoring Leader (1,676 pts)", "First Girls Central League Title (2002)", "4× 1st Team All-Central League", "Fulbright Scholar", "2× Rhodes Scholarship Finalist", "UF Hall of Fame (2006)"],
    college: "University of Florida",
  },
  {
    name: "Kobe Bryant",
    type: "player",
    era: "'96",
    title: "Class of 1996",
    summary: "During his senior season, piloted the Aces to a program-best 31-3 record including 27 straight wins, a Central League title, District I title, and state title. Averaged 30.8 points, 12 rebounds, 6.5 assists, 4 steals and 3.9 blocks per game. Named Gatorade, USA Today, and Parade Magazine National High School Player of the Year. All-time scoring leader in Southeastern Pennsylvania history with 2,883 points. Selected 13th overall in the 1996 NBA Draft. Five-time NBA Champion, league MVP, 18-time All-Star, and Olympic Gold Medalist.",
    achievements: ["31-3 Senior Season Record", "30.8 PPG / 12 RPG / 6.5 APG", "Gatorade, USA Today & Parade NHSOY", "2,883 Points — SE PA All-Time Record", "5× NBA Champion", "NBA MVP (2008)", "18× NBA All-Star", "Olympic Gold Medalist (2008)"],
    highlight: true,
    college: "Los Angeles Lakers — 13th Pick, 1996 NBA Draft",
  },
  {
    name: "Gregg Downer",
    type: "coach",
    era: "1990–Present",
    title: "Head Coach",
    summary: "The school's all-time wins leader, surpassing legendary coach Andy Anderson's total of 346 games in 2008. Has led the Aces to three PA State Championships, five State Finals, two District 1 championships, 15 Central League titles, 18 state playoff appearances, 11 District 1 Final Four appearances, and 17 twenty-win seasons. Named Pennsylvania Coach of the Year in 2006 and 2013 by the Associated Press. More than 40 of his players have gone on to play at Division I, II, III and professional levels, including NBA MVP Kobe Bryant.",
    achievements: ["3× PIAA State Champion", "5× State Finals", "15× Central League Title", "600+ Career Wins", "2× PA Coach of the Year (AP)", "Coached Kobe Bryant", "40+ Players to College/Pro Basketball"],
    highlight: true,
    college: "",
  },
];
