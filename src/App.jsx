import { useState, useEffect, useRef } from "react";






const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
};

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const [ref, isVisible] = useInView();
  const transforms = { up: "translateY(60px)", down: "translateY(-60px)", left: "translateX(60px)", right: "translateX(-60px)", none: "none" };
  return (
    <div ref={ref} className={className} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "none" : transforms[direction],
      transition: `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>{children}</div>
  );
};

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
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

// ♠ Spade SVG icon
const SpadeIcon = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C12 2 4 10 4 14c0 2.5 1.8 4 4 4 1.5 0 2.7-.8 3.3-2-.3 2-1.3 4-3.3 5h8c-2-1-3-3-3.3-5C13.3 17.2 14.5 18 16 18c2.2 0 4-1.5 4-4C20 10 12 2 12 2z"/>
  </svg>
);

const championships = {
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
    "1930", "1933", "1937", "1940", "1941", "1942", "1943", "1944",
    "1976", "1978", "1996", "2006", "2012", "2013", "2021", "2022", "2024"
  ],
  league: [
    "1972", "1975", "1976", "1978", "1984", "1995", "1996", "1997", "1998",
    "2000", "2001", "2002", "2006", "2009", "2012", "2013", "2014",
    "2017", "2018", "2019", "2022", "2024", "2025"
  ],
};

const alumni = [
  { name: "Kobe Bryant", classYear: "'96", college: "Direct to NBA", pro: "Los Angeles Lakers — 5× Champion, MVP, 18× All-Star, Hall of Famer", highlight: true },
  { name: "Jim Brogan", classYear: "'78", college: "West Virginia Wesleyan", pro: "San Diego Clippers (NBA)" },
  { name: "B.J. Johnson", classYear: "'14", college: "Syracuse → La Salle (D-I)", pro: "Orlando Magic (NBA) / Brisbane Bullets (NBL) / Overseas" },
  { name: "Demetrius Lilley", classYear: "'22", college: "Penn State (D-I, Big Ten)", pro: "2× District 1 Champ, Central League MVP, 7th all-time scorer (1,301 pts)" },
  { name: "Sam Brown", classYear: "'23", college: "University of Pennsylvania (D-I, Ivy League)", pro: "1,000+ career pts, 3× District champ" },
  { name: "Jack Forrest", classYear: "'19", college: "Columbia → Saint Joseph's (D-I)", pro: "Central League MVP, 1,000+ pts" },
  { name: "John Mobley", classYear: "'24", college: "Fork Union Military Academy → Edinboro University (D-II)", pro: "1st Team All-League, 2nd Team All-Philadelphia, District 1 Champ" },
  { name: "Owen McCabe", classYear: "'24", college: "Penn State Behrend", pro: "All-Central League, District 1 Champion" },
  { name: "Carson Kasmer", classYear: "'25", college: "Gettysburg College", pro: "Central League MVP (2025), LM record 7 threes in a game" },
  { name: "Jaylen Shippen", classYear: "'22", college: "Clarion University (D-II)", pro: "Elite defender, 2× District 1 Champion" },
  { name: "Garrett Williamson", classYear: "'06", college: "Saint Joseph's (D-I)", pro: "London Lightning (NBL Canada) — 2× Champion, Finals MVP" },
  { name: "Ryan Brooks", classYear: "'06", college: "Temple University (D-I, All-Atlantic 10)", pro: "Professional career in Germany" },
  { name: "Aaric Murray", classYear: "'10", college: "La Salle University (D-I)", pro: "Professional career overseas (Europe & Asia)" },
  { name: "Al Bonniwell", classYear: "'30", college: "Dartmouth (NCAA 1st Team All-American, All-Ivy)", pro: "Akron Firestone Non-Skids (NBL)" },
  { name: "Alai Nuualiitia", classYear: "'98", college: "Brown University (D-I, 3× All-Ivy League)", pro: "Brown University Hall of Fame" },
  { name: "Kevin Lonesome", classYear: "'76", college: "Abilene Christian University (D-I)", pro: "HS coaching career — mentored Deron Williams" },
  { name: "Dan Capkin", classYear: "'05", college: "Gettysburg College (All-American, all-time leading scorer)", pro: "" },
  { name: "Brad Long", classYear: "'01", college: "Norfolk State University (D-I)", pro: "" },
  { name: "Sam Wright", classYear: "'23", college: "4-year varsity starter, 1,000+ career pts", pro: "2× District 1 Champ, Central League Champ. 'Top 5 shooter in the state' — Downer" },
  { name: "Gus Wright", classYear: "'25", college: "4-year varsity player", pro: "Central League Champion (2025), 101 career wins" },
  { name: "Sarah Lowe", classYear: "'02", college: "University of Florida (D-I)", pro: "All-time leading girls scorer (1,676 pts)", gender: "women" },
];

const centralLeagueTeams = [
  { name: "Lower Merion", mascot: "Aces", color: "#840036", initials: "LM", desc: "The flagship program of the Central League. 7 PIAA state titles (1933, '41, '42, '43, '96, '06, '13), 16 District 1 titles, 23 league championships and 1,600+ all-time wins. Home of Kobe Bryant and legendary coach Gregg Downer.", isSelf: true },
  { name: "Conestoga", mascot: "Pioneers", color: "#003366", initials: "CO", desc: "Founding Central League member (1967). Has emerged as a top contender in recent years, winning the Central League title in 2025-26 and earning the #1 seed in District 1 6A. A rising power in Chester County." },
  { name: "Garnet Valley", mascot: "Jaguars", color: "#8B0000", initials: "GV", desc: "Joined the Central League in 2008. Quickly became competitive with multiple league titles, District 1 championships, and a trip to the 2019 PIAA 6A state finals. A rising power in Delaware County." },
  { name: "Harriton", mascot: "Rams", color: "#1E4D2B", initials: "HN", desc: "A founding member that departed in 1969 and returned in 2008. Located in Lower Merion Township alongside LM, creating the crosstown rivalry. Competitive in league play with growing program success." },
  { name: "Haverford", mascot: "Fords", color: "#CC0000", initials: "HF", desc: "A founding Central League member and consistent competitor. The Fords have made multiple District 1 playoff runs and are a perennial factor in Central League standings with deep playoff pushes." },
  { name: "Marple Newtown", mascot: "Tigers", color: "#FF6600", initials: "MN", desc: "Founding member known for competitive teams across multiple eras. The Tigers have earned Central League titles and District 1 playoff appearances, maintaining a proud basketball tradition." },
  { name: "Penncrest", mascot: "Lions", color: "#003087", initials: "PC", desc: "Founding member from Media, PA. Strong recent seasons including a breakout 2025-26 campaign with District 1 playoff contention. The Lions compete fiercely in the Central League." },
  { name: "Radnor", mascot: "Raptors", color: "#006400", initials: "RD", desc: "Founding member and frequent contender. Won the Central League championship in 2022-23 behind All-Delco Player of the Year Jackson Hicke. Multiple District 1 playoff appearances." },
  { name: "Ridley", mascot: "Green Raiders", color: "#006633", initials: "RI", desc: "Joined the Central League in 1969, replacing Harriton. The Green Raiders bring a strong Delaware County basketball tradition with multiple league playoff appearances." },
  { name: "Springfield", mascot: "Cougars", color: "#0033A0", initials: "SP", desc: "Founding member from Springfield, Delaware County. The Cougars have produced competitive teams with Central League title contention and District 1 playoff runs." },
  { name: "Strath Haven", mascot: "Panthers", color: "#800020", initials: "SH", desc: "Joined in 1983. The Panthers from Wallingford have been a steady Central League competitor, with notable seasons including league playoff contention and District 1 appearances." },
  { name: "Upper Darby", mascot: "Royals", color: "#4B0082", initials: "UD", desc: "Founding member and the largest school in the league by enrollment. Strong recent years including standout players like Nadir Myers. State playoff appearances and a deep basketball tradition." },
];

// Bulldog SVG Logo
const BulldogLogo = ({ size = 80, color = "#840036" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill={color} stroke="#840036" strokeWidth="3"/>
    <ellipse cx="50" cy="52" rx="28" ry="24" fill="#fff" opacity="0.15"/>
    {/* Bulldog face simplified */}
    <path d="M30 40 C30 30 40 22 50 22 C60 22 70 30 70 40 L70 55 C70 68 60 75 50 75 C40 75 30 68 30 55 Z" fill="rgba(255,255,255,0.2)" stroke="#840036" strokeWidth="1.5"/>
    {/* Eyes */}
    <circle cx="40" cy="42" r="5" fill="#fff"/>
    <circle cx="60" cy="42" r="5" fill="#fff"/>
    <circle cx="41" cy="42" r="2.5" fill={color}/>
    <circle cx="61" cy="42" r="2.5" fill={color}/>
    {/* Nose */}
    <ellipse cx="50" cy="54" rx="7" ry="5" fill="rgba(255,255,255,0.3)" stroke="#840036" strokeWidth="1"/>
    <circle cx="47" cy="53" r="1.5" fill={color}/>
    <circle cx="53" cy="53" r="1.5" fill={color}/>
    {/* Mouth / Jowls */}
    <path d="M38 60 Q44 66 50 63 Q56 66 62 60" stroke="#840036" strokeWidth="1.5" fill="none"/>
    <path d="M43 58 Q50 62 57 58" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
    {/* Ears */}
    <path d="M28 35 C22 28 24 20 32 24 L33 36" fill="rgba(255,255,255,0.15)" stroke="#840036" strokeWidth="1"/>
    <path d="M72 35 C78 28 76 20 68 24 L67 36" fill="rgba(255,255,255,0.15)" stroke="#840036" strokeWidth="1"/>
    {/* Dog tag spade at bottom */}
    <path d="M50 78 L46 84 L48 84 L48 88 L52 88 L52 84 L54 84 Z" fill="#840036"/>
    <path d="M50 83 C50 83 48 85 48 86.5 C48 87.5 49 88 50 88 C51 88 52 87.5 52 86.5 C52 85 50 83 50 83Z" fill={color}/>
  </svg>
);

// LM Monogram
const LMMonogram = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <rect x="2" y="2" width="56" height="56" rx="4" stroke="#840036" strokeWidth="2" fill="rgba(107,29,58,0.3)"/>
    <text x="30" y="40" textAnchor="middle" fontFamily="'Oswald', sans-serif" fontSize="28" fontWeight="700" fill="#840036">LM</text>
  </svg>
);

const coachingStaff = [
  { name: "Gregg Downer", role: "Head Coach", since: "1990", bio: "3× PA Coach of the Year. 600+ career victories, 3 state championships, 17+ league titles, 70% winning percentage. Coached Kobe Bryant. Inductee in 3 PA sports halls of fame. Named 'Best Basketball Coach in Pennsylvania' by USA Today." },
  { name: "John Gallman", role: "Assistant Coach", since: "", bio: "Veteran assistant coach helping guide the Aces alongside Coach Downer." },
  { name: "Mike Lachs", role: "Assistant Coach", since: "", bio: "Dedicated assistant contributing to player development and game preparation." },
  { name: "Adam Miller", role: "Assistant Coach", since: "", bio: "Key staff member supporting the program's continued success." },
  { name: "Eric Montanari", role: "Assistant Coach", since: "", bio: "Instrumental in daily operations and development of Lower Merion's talent." },
  { name: "Matt Schwartz", role: "Assistant Coach", since: "", bio: "Bringing energy and expertise to the Aces coaching staff." },
  { name: "Kevin Grugan", role: "Top Assistant Coach", since: "", bio: "Widely regarded as one of the best assistant coaches in the state of Pennsylvania. Grugan is Coach Downer's right hand and a critical architect of the Aces' sustained success, bringing elite preparation and mentorship to the program." },
];

export default function AcesBasketball() {
  // Logo images (transparent PNGs)
  const BULLDOG = "data:image/png;base64,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";
  const LM_LOGO = "data:image/png;base64,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";
  const SPADE_MAROON = "data:image/png;base64,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";
  const ACE_SPADE = "data:image/png;base64,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";
  const SPADE_OUTLINE = "data:image/png;base64,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";

  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeChampTab, setActiveChampTab] = useState("state");
  const [lightbox, setLightbox] = useState(null);
  const [openGallery, setOpenGallery] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2025-26");

  const bannerTexts = [
    { title: "7× PIAA State Champions", sub: "The Pride of the Main Line" },
    { title: "Kobe Bryant's Alma Mater", sub: "Where Mamba Mentality Was Born" },
    { title: "600+ Wins Under Coach Downer", sub: "A Living Legend" },
    { title: "Est. 1911 • Ardmore, PA", sub: "Over a Century of Excellence" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % bannerTexts.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "history", label: "History" },
    { id: "thousand", label: "1000 Club" },
    { id: "schedule", label: "Schedule" },
    { id: "championships", label: "Championships" },
    { id: "league", label: "Central League" },
    { id: "alumni", label: "Alumni" },
    { id: "coaching", label: "Coaching Staff" },
    { id: "roster", label: "Roster" },
    { id: "records", label: "Record Book" },
    { id: "photos", label: "Photos" },
    { id: "videos", label: "Videos" },
    { id: "kobe", label: "Kobe" },
    { id: "social", label: "Follow Us" },
  ];

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#0a0a0a", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --maroon: #840036;
          --maroon-deep: #4A1228;
          --maroon-light: #8B2D4E;
          --gold: #840036;
          --gold-light: #E8D49B;
          --cream: #F5F0E8;
          --dark: #0a0a0a;
          --dark-card: #141414;
        }
        
        html { scroll-behavior: smooth; }
        
        .nav-fixed {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(10,10,10,0.92); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(107,29,58,0.3);
          transition: all 0.3s ease;
        }
        
        .nav-inner {
          max-width: 1400px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; height: 72px;
        }
        
        .nav-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .nav-brand-text { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: 3px; text-transform: uppercase; }
        .nav-brand-sub { font-family: 'Source Sans 3', sans-serif; font-size: 11px; letter-spacing: 4px; color: var(--gold); text-transform: uppercase; font-weight: 300; }
        
        .nav-links { display: flex; gap: 8px; align-items: center; }
        .nav-link {
          font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,0.7); background: none; border: none; cursor: pointer;
          padding: 8px 14px; border-radius: 4px; transition: all 0.3s;
          text-decoration: none; font-weight: 400;
        }
        .nav-link:hover, .nav-link.active { color: #fff; background: rgba(107,29,58,0.4); }
        
        .hamburger { display: none; background: none; border: none; color: #fff; font-size: 28px; cursor: pointer; }
        
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-links.open {
            display: flex; flex-direction: column; position: absolute; top: 72px; left: 0; right: 0;
            background: rgba(10,10,10,0.98); padding: 20px; gap: 4px;
            border-bottom: 1px solid rgba(107,29,58,0.3);
          }
          .hamburger { display: block; }
        }
        
        .hero {
          position: relative; height: 100vh; min-height: 700px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        
        .hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--maroon-deep) 0%, var(--dark) 50%, var(--maroon-deep) 100%);
        }
        
        .hero-pattern {
          position: absolute; inset: 0; opacity: 0.06;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(132,0,54,0.5) 35px, rgba(132,0,54,0.5) 36px);
        }
        
        .hero-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 800px; height: 800px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,29,58,0.4) 0%, transparent 70%);
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .hero-content { position: relative; z-index: 2; text-align: center; padding: 0 24px; }
        
        .hero-spade {
          display: inline-block; margin-bottom: 24px;
          animation: spade-float 3s ease-in-out infinite;
        }
        
        @keyframes spade-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        
        .hero-title {
          font-family: 'Oswald', sans-serif; font-weight: 700;
          font-size: clamp(60px, 12vw, 160px); line-height: 0.9;
          text-transform: uppercase; letter-spacing: -3px;
          margin-bottom: 8px;
        }
        
        .hero-title-accent { color: var(--gold); }
        
        .hero-subtitle {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(18px, 3vw, 32px); color: var(--gold-light);
          margin-bottom: 32px; font-weight: 400;
        }
        
        .hero-banner {
          min-height: 80px; position: relative; overflow: hidden;
        }
        
        .hero-banner-item {
          position: absolute; width: 100%; text-align: center;
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hero-banner-title {
          font-family: 'Oswald', sans-serif; font-size: clamp(20px, 3vw, 36px);
          font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #fff;
        }
        
        .hero-banner-sub {
          font-family: 'Source Sans 3', sans-serif; font-size: 14px;
          letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin-top: 4px;
        }
        
        .hero-scroll {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.4); font-family: 'Oswald', sans-serif;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          animation: scroll-bounce 2s ease-in-out infinite; cursor: pointer;
        }
        
        @keyframes scroll-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        
        .section { padding: 120px 24px; max-width: 1400px; margin: 0 auto; }
        .section-dark { background: var(--dark); }
        .section-maroon { background: linear-gradient(180deg, var(--maroon-deep) 0%, var(--dark) 100%); }
        
        .section-label {
          font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: 6px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 16px;
          display: flex; align-items: center; gap: 12px;
        }
        
        .section-label::after {
          content: ''; flex: 1; height: 1px; max-width: 80px;
          background: linear-gradient(90deg, var(--gold), transparent);
        }
        
        .section-title {
          font-family: 'Oswald', sans-serif; font-weight: 700;
          font-size: clamp(36px, 5vw, 64px); text-transform: uppercase;
          letter-spacing: -1px; line-height: 1; margin-bottom: 24px;
        }
        
        .section-text {
          font-family: 'Source Sans 3', sans-serif; font-size: 18px; line-height: 1.8;
          color: rgba(255,255,255,0.7); max-width: 800px;
        }
        
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2px; margin: 60px 0; background: rgba(107,29,58,0.2); border-radius: 12px; overflow: hidden;
        }
        
        .stat-card {
          background: var(--dark-card); padding: 40px 24px; text-align: center;
          transition: all 0.4s; cursor: default;
        }
        .stat-card:hover { background: rgba(107,29,58,0.15); }
        
        .stat-number {
          font-family: 'Oswald', sans-serif; font-size: 56px; font-weight: 700;
          color: var(--gold); line-height: 1;
        }
        
        .stat-label {
          font-family: 'Source Sans 3', sans-serif; font-size: 13px; letter-spacing: 3px;
          text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 8px;
        }
        
        .champ-tabs {
          display: flex; gap: 4px; margin-bottom: 40px; flex-wrap: wrap;
        }
        
        .champ-tab {
          font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 2px;
          text-transform: uppercase; padding: 12px 28px; border: 1px solid rgba(107,29,58,0.4);
          background: transparent; color: rgba(255,255,255,0.6); cursor: pointer;
          border-radius: 4px; transition: all 0.3s;
        }
        .champ-tab:hover { border-color: var(--maroon-light); color: #fff; }
        .champ-tab.active { background: var(--maroon); border-color: var(--maroon); color: #fff; }
        
        .champ-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;
        }
        
        .champ-card {
          background: var(--dark-card); border: 1px solid rgba(107,29,58,0.2);
          padding: 24px; border-radius: 8px; text-align: center;
          transition: all 0.4s; cursor: default;
        }
        .champ-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(107,29,58,0.3); }
        .champ-card.highlight { border-color: var(--gold); background: linear-gradient(135deg, var(--dark-card) 0%, rgba(107,29,58,0.15) 100%); }
        
        .champ-year {
          font-family: 'Oswald', sans-serif; font-size: 36px; font-weight: 700; color: var(--gold);
        }
        
        .champ-detail {
          font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: rgba(255,255,255,0.5);
          margin-top: 8px; line-height: 1.4;
        }
        
        .alumni-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-top: 40px;
        }
        
        @media (max-width: 600px) {
          .alumni-grid { grid-template-columns: 1fr; }
        }
        
        .alumni-card {
          background: var(--dark-card); border: 1px solid rgba(107,29,58,0.15);
          padding: 28px; border-radius: 8px; transition: all 0.4s;
          position: relative; overflow: hidden;
        }
        .alumni-card:hover { border-color: rgba(107,29,58,0.5); transform: translateY(-2px); }
        .alumni-card.featured {
          grid-column: 1 / -1; border-color: var(--gold);
          background: linear-gradient(135deg, var(--dark-card) 0%, rgba(107,29,58,0.2) 50%, var(--dark-card) 100%);
          padding: 40px;
        }
        .alumni-card.featured::before {
          content: '★ FEATURED ALUMNUS'; position: absolute; top: 12px; right: 16px;
          font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 3px;
          color: var(--gold); text-transform: uppercase;
        }
        
        .alumni-name {
          font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 600; color: #fff;
          display: flex; align-items: center; gap: 10px;
        }
        
        .alumni-class {
          font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: var(--gold);
          font-weight: 600;
        }
        
        .alumni-info {
          font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: rgba(255,255,255,0.6);
          margin-top: 12px; line-height: 1.6;
        }
        
        .alumni-tag {
          display: inline-block; font-family: 'Oswald', sans-serif; font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px;
          border-radius: 3px; margin-top: 12px; margin-right: 6px;
        }
        .tag-nba { background: rgba(132,0,54,0.2); color: var(--gold); border: 1px solid rgba(132,0,54,0.3); }
        .tag-college { background: rgba(107,29,58,0.2); color: var(--maroon-light); border: 1px solid rgba(107,29,58,0.3); }
        .tag-pro { background: rgba(100,200,100,0.1); color: #7dcc7d; border: 1px solid rgba(100,200,100,0.2); }
        
        .coach-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 40px;
        }
        
        @media (max-width: 600px) {
          .coach-grid { grid-template-columns: 1fr; }
        }
        
        .coach-card {
          background: var(--dark-card); border: 1px solid rgba(107,29,58,0.2);
          padding: 36px; border-radius: 8px; transition: all 0.4s;
        }
        .coach-card:hover { border-color: var(--maroon-light); }
        .coach-card:first-child { grid-column: 1 / -1; border-color: var(--gold); }
        
        .coach-name { font-family: 'Oswald', sans-serif; font-size: 28px; font-weight: 600; }
        .coach-role {
          font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: 3px;
          text-transform: uppercase; color: var(--gold); margin-top: 4px;
        }
        .coach-bio {
          font-family: 'Source Sans 3', sans-serif; font-size: 15px; color: rgba(255,255,255,0.6);
          margin-top: 16px; line-height: 1.7;
        }
        
        .kobe-section {
          position: relative; padding: 120px 24px;
          background: linear-gradient(135deg, var(--maroon-deep), #1a0a10 50%, var(--maroon-deep));
          overflow: hidden;
        }
        
        .kobe-section::before {
          content: '8 24'; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Oswald', sans-serif; font-size: clamp(150px, 25vw, 400px);
          font-weight: 700; color: rgba(107,29,58,0.08); letter-spacing: 40px;
          white-space: nowrap; pointer-events: none;
        }
        
        .kobe-content { position: relative; z-index: 2; max-width: 900px; margin: 0 auto; text-align: center; }
        
        .kobe-quote {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(24px, 4vw, 42px); line-height: 1.4;
          color: var(--cream); margin: 40px 0 20px;
        }
        
        .kobe-attribution {
          font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 4px;
          text-transform: uppercase; color: var(--gold);
        }
        
        .roster-note {
          background: var(--dark-card); border: 1px solid rgba(107,29,58,0.3);
          border-radius: 12px; padding: 40px; text-align: center; margin-top: 40px;
        }
        
        .roster-note a {
          color: var(--gold); text-decoration: none; border-bottom: 1px solid var(--gold);
          transition: all 0.3s;
        }
        .roster-note a:hover { color: var(--gold-light); }
        
        .social-section {
          text-align: center; padding: 120px 24px;
          background: linear-gradient(180deg, var(--dark) 0%, var(--maroon-deep) 100%);
        }
        
        .social-links { display: flex; gap: 20px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
        
        .social-btn {
          font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 2px;
          text-transform: uppercase; padding: 16px 36px; border-radius: 4px;
          border: 1px solid var(--maroon-light); background: transparent;
          color: #fff; cursor: pointer; transition: all 0.3s; text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .social-btn:hover { background: var(--maroon); border-color: var(--maroon); transform: translateY(-2px); }
        .social-btn.primary { background: var(--maroon); border-color: var(--maroon); }
        .social-btn.primary:hover { background: var(--maroon-light); }
        
        .ig-embed-wrapper {
          max-width: 540px; margin: 40px auto 0; border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(107,29,58,0.3); background: var(--dark-card); padding: 32px;
        }
        
        .footer {
          background: var(--maroon-deep); padding: 60px 24px; text-align: center;
          border-top: 1px solid rgba(132,0,54,0.2);
        }
        
        .footer-text {
          font-family: 'Source Sans 3', sans-serif; font-size: 13px;
          color: rgba(255,255,255,0.4); letter-spacing: 1px;
        }
        
        .league-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 40px;
        }
        @media (max-width: 600px) { .league-grid { grid-template-columns: 1fr; } }
        
        .league-card {
          background: var(--dark-card); border: 1px solid rgba(107,29,58,0.15);
          padding: 24px; border-radius: 8px; transition: all 0.4s; position: relative; overflow: hidden;
        }
        .league-card:hover { border-color: rgba(107,29,58,0.5); transform: translateY(-2px); }
        .league-card.self-card {
          grid-column: 1 / -1; border-color: var(--gold);
          background: linear-gradient(135deg, var(--dark-card) 0%, rgba(107,29,58,0.2) 50%, var(--dark-card) 100%);
        }
        
        .league-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .league-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; }
        .league-card-name { font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 600; }
        .league-card-mascot { font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: var(--gold); font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
        .league-card-desc { font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-top: 8px; }
        
        .divider {
          width: 60px; height: 2px; background: var(--gold); margin: 24px 0;
        }
        .divider-center { margin: 24px auto; }
        
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Film grain overlay */}
      <div className="grain" />

      {/* Navigation */}
      <nav className="nav-fixed">
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => scrollTo("home")}>
            <img src={LM_LOGO} alt="LM" style={{height:36,width:"auto",filter:"drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 16px rgba(132,0,54,0.3))"}} />
            <div>
              <div className="nav-brand-text">Aces Basketball</div>
              <div className="nav-brand-sub">Lower Merion</div>
            </div>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navItems.map(item => (
              <button key={item.id} className={`nav-link ${activeSection === item.id ? "active" : ""}`}
                onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-bg" />
        <div className="hero-pattern" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <div className="hero-spade"><img src={LM_LOGO} alt="LM" style={{height:110,width:"auto",filter:"drop-shadow(0 0 12px rgba(255,255,255,0.5)) drop-shadow(0 0 25px rgba(132,0,54,0.4)) drop-shadow(0 0 4px rgba(255,255,255,0.7))"}} /></div>
          </div>
          <h1 className="hero-title">
            LOWER<br />
            <span className="hero-title-accent">MERION</span>
          </h1>
          <p className="hero-subtitle">Aces Basketball — Ardmore, Pennsylvania</p>
          <div className="hero-banner">
            {bannerTexts.map((b, i) => (
              <div key={i} className="hero-banner-item" style={{
                opacity: activeBanner === i ? 1 : 0,
                transform: activeBanner === i ? "translateY(0)" : "translateY(20px)",
              }}>
                <div className="hero-banner-title">{b.title}</div>
                <div className="hero-banner-sub">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-scroll" onClick={() => scrollTo("history")}>
          <span>Scroll</span>
          <span style={{ fontSize: 20 }}>↓</span>
        </div>
      </section>

      {/* Stats Bar */}
      <div style={{ background: "var(--maroon-deep)", borderTop: "1px solid rgba(132,0,54,0.15)", borderBottom: "1px solid rgba(132,0,54,0.15)" }}>
        <div className="stats-grid" style={{ maxWidth: 1400, margin: "0 auto", borderRadius: 0 }}>
          <div className="stat-card">
            <div className="stat-number"><CountUp end={7} duration={1500} /></div>
            <div className="stat-label">State Championships</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp end={600} duration={2000} suffix="+" /></div>
            <div className="stat-label">Career Wins (Downer Era)</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp end={23} duration={1800} /></div>
            <div className="stat-label">Central League Titles</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp end={70} duration={2000} suffix="+" /></div>
            <div className="stat-label">College/Pro Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-number"><CountUp end={1600} duration={2500} suffix="+" /></div>
            <div className="stat-label">All-Time Program Wins</div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <section id="history" style={{ background: "var(--dark)" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Program History</div>
            <h2 className="section-title">A Legacy<br /><span style={{ color: "var(--gold)" }}>Like No Other</span></h2>
            <div className="divider" />
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="section-text">
              Lower Merion basketball is one of the most successful programs in Pennsylvania history, with roots stretching back to 1921. The Aces have amassed more than 1,660 victories, a 66.3% all-time winning percentage, and seven PIAA State Championships — the second-most of any program in the Commonwealth.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="section-text" style={{ marginTop: 24 }}>
              The foundation was built by legendary coach William "Andy" Anderson, who compiled a remarkable 346-55 record (.863) from 1927 to 1945, capturing four state titles — including three consecutive championships in 1941, '42, and '43, a first in PA history. His innovations helped shape the modern game and established Lower Merion as a powerhouse.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="section-text" style={{ marginTop: 24 }}>
              In 1990, a young Gregg Downer took the reins and ushered in a new era. Three years later, a freshman named Kobe Bryant arrived and the program exploded onto the national stage. The 1996 Aces rode a 30-game winning streak to the state title, finishing 31-3. Downer has since led the program to two more state championships (2006, 2013), surpassed Anderson's win record, and sent more than 70 players to college and professional basketball. Now in his 36th season with over 730 victories, Downer remains the standard for coaching excellence in Pennsylvania.
            </p>
          </FadeIn>

          {/* All-Time Stats Bar */}
          <FadeIn delay={0.5}>
            <div style={{
              marginTop: 56, display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 2, borderRadius: 16, overflow: "hidden"
            }}>
              {[
                { stat: "1,663", label: "All-Time Wins" },
                { stat: "104", label: "Seasons" },
                { stat: ".663", label: "Win Percentage" },
                { stat: "7", label: "State Championships" },
                { stat: "17", label: "District 1 Titles" },
                { stat: "23", label: "League Titles" },
              ].map((s, idx) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.03)", padding: "28px 16px", textAlign: "center"
                }}>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700,
                    color: "var(--gold)", lineHeight: 1
                  }}>{s.stat}</div>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2,
                    color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 8
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Coaching History */}
          <FadeIn delay={0.6}>
            <div style={{ marginTop: 64 }}>
              <h3 style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4,
                color: "var(--gold)", textTransform: "uppercase", textAlign: "center", marginBottom: 32
              }}>Coaching History</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {[
                  { name: "Gregg Downer", years: "1990–Present", record: "738-278", pct: ".726", titles: "3× State Champs ('96, '06, '13)", highlight: true },
                  { name: "William Anderson", years: "1927–1945", record: "346-55", pct: ".863", titles: "4× State Champs ('33, '41, '42, '43)" },
                  { name: "Bill Stephens", years: "1970–1979", record: "145-64", pct: ".694", titles: "4× League Champs, 2× District 1" },
                  { name: "Larry Davis", years: "1960–1970", record: "111-92", pct: ".547", titles: "Central League Champ ('68)" },
                  { name: "Michael Manning", years: "1979–1990", record: "100-142", pct: ".413", titles: "Central League Champ ('84)" },
                  { name: "Robert Ruoff", years: "1953–1958", record: "58-38", pct: ".604", titles: "" },
                  { name: "Jack Hinchey", years: "1947–1952", record: "48-54", pct: ".471", titles: "" },
                  { name: "O. Robinson", years: "1945–47, 52–53", record: "29-29", pct: ".500", titles: "Suburban League ('46)" },
                ].map((c, idx) => (
                  <div key={idx} style={{
                    background: c.highlight ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${c.highlight ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 12, padding: "20px 24px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: 1
                      }}>{c.name}</div>
                      <div style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700,
                        color: "var(--gold)"
                      }}>{c.record}</div>
                    </div>
                    <div style={{
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 12,
                      color: "rgba(255,255,255,0.4)", marginTop: 4
                    }}>
                      {c.years} · {c.pct} winning pct
                    </div>
                    {c.titles && <div style={{
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 12,
                      color: "rgba(255,255,255,0.55)", marginTop: 8
                    }}>
                      {c.titles}
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Kobe Tribute Section */}
      <section className="kobe-section">
        <div className="kobe-content">
          <FadeIn>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <SpadeIcon size={14} color="#840036" /> Forever an Ace
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Kobe Bean<br /><span style={{ color: "var(--gold)" }}>Bryant</span>
            </h2>
            <div className="divider divider-center" />
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="section-text" style={{ margin: "0 auto", textAlign: "center" }}>
              Class of 1996 · #33 · Southeastern PA's All-Time Leading Scorer (2,883 pts)
              <br />
              Naismith HS Player of the Year · Gatorade National Player of the Year · McDonald's All-American
              <br /><br />
              5× NBA Champion · NBA MVP · 18× NBA All-Star · Hall of Famer
              <br />
              Los Angeles Lakers #8 & #24
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="kobe-quote">
              "Everything negative — pressure, challenges — is all an opportunity for me to rise."
            </div>
            <div className="kobe-attribution">— Kobe Bryant, Lower Merion '96</div>
          </FadeIn>
          <FadeIn delay={0.5}>
            <p className="section-text" style={{ margin: "40px auto 0", textAlign: "center", fontSize: 15 }}>
              The Kobe Bryant Gymnasium at Lower Merion High School was dedicated in 2010, funded in part by Kobe's personal $400,000 donation. His #33 jersey is retired. Every season opens with 33 seconds of silence in his honor. Mamba Mentality lives on in every Ace who wears the Maroon & White.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* 1000 Point Club */}
      <section id="thousand" style={{ background: "linear-gradient(180deg, var(--dark) 0%, var(--maroon-deep) 50%, var(--dark) 100%)", padding: "100px 5% 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <SpadeIcon size={14} color="#840036" /> All-Time Greats
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              1,000 Point<br /><span style={{ color: "var(--gold)" }}>Club</span>
            </h2>
            <div className="divider divider-center" />
            <p className="section-text" style={{ textAlign: "center", margin: "20px auto 0", maxWidth: 600 }}>
              The elite scorers in Lower Merion boys basketball history who reached the 1,000 career point milestone.
            </p>
          </FadeIn>

          {/* Kobe Feature Card */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 48,
              background: "linear-gradient(135deg, rgba(132,0,54,0.4) 0%, rgba(0,0,0,0.6) 100%)",
              border: "2px solid var(--gold)",
              borderRadius: 16,
              padding: "32px 36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: -20, right: -10, fontSize: 160,
                fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "rgba(255,255,255,0.03)",
                lineHeight: 1, pointerEvents: "none"
              }}>33</div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                  color: "var(--gold)", textTransform: "uppercase", marginBottom: 6
                }}>
                  All-Time Leading Scorer · Class of 1996
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700,
                  lineHeight: 1.1
                }}>
                  Kobe Bryant
                </div>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)",
                  marginTop: 8
                }}>
                  Single Game High: 50 pts vs Marple Newtown (1996) · 50 pts vs Academy Park (1996)
                </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 64, fontWeight: 700,
                  color: "var(--gold)", lineHeight: 1
                }}>
                  2,883
                </div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 3,
                  color: "rgba(255,255,255,0.5)", textTransform: "uppercase"
                }}>
                  Career Points
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Leaderboard Table */}
          <FadeIn delay={0.3}>
            <div style={{ marginTop: 36, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr 100px 80px",
                padding: "14px 24px",
                background: "rgba(132,0,54,0.3)",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                letterSpacing: 3,
                color: "var(--gold)",
                textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.1)"
              }}>
                <span>#</span>
                <span>Player</span>
                <span style={{ textAlign: "right" }}>Points</span>
                <span style={{ textAlign: "right" }}>Class</span>
              </div>

              {/* Rows */}
              {[
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
              ].map((player, idx) => (
                <div key={idx} style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr 100px 80px",
                  padding: "16px 24px",
                  background: player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  alignItems: "center",
                  transition: "background 0.2s ease"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = player.highlight ? "rgba(132,0,54,0.15)" : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                >
                  <span style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: player.highlight ? 22 : 16,
                    fontWeight: player.highlight ? 700 : 400,
                    color: player.highlight ? "var(--gold)" : "rgba(255,255,255,0.4)"
                  }}>
                    {player.rank}
                  </span>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: player.highlight ? 20 : 16,
                    fontWeight: player.highlight ? 600 : 400,
                    letterSpacing: 1,
                    color: player.highlight ? "#fff" : "rgba(255,255,255,0.85)"
                  }}>
                    {player.name}
                    {player.highlight && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--gold)" }}>♠</span>}
                  </span>
                  <span style={{
                    textAlign: "right",
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: player.highlight ? 22 : 17,
                    fontWeight: player.highlight ? 700 : 500,
                    color: player.highlight ? "var(--gold)" : "#fff",
                    letterSpacing: 1
                  }}>
                    {player.points}
                  </span>
                  <span style={{
                    textAlign: "right",
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)"
                  }}>
                    {player.year}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Schedule & Results */}
      <section id="schedule" style={{ background: "var(--dark)", padding: "100px 5% 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <SpadeIcon size={14} color="#840036" /> 2025–26 Season
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Schedule &<br /><span style={{ color: "var(--gold)" }}>Results</span>
            </h2>
            <div className="divider divider-center" />
          </FadeIn>

          {/* Season Selector */}
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
              {["2025-26","2024-25","2023-24","2022-23","2021-22","2020-21","2019-20"].map(s => (
                <button key={s} onClick={() => setSelectedSeason(s)} style={{
                  padding: "8px 16px", borderRadius: 6, cursor: "pointer",
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1,
                  background: selectedSeason === s ? "var(--maroon)" : "rgba(255,255,255,0.05)",
                  border: selectedSeason === s ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
                  color: selectedSeason === s ? "var(--gold)" : "rgba(255,255,255,0.6)",
                  transition: "all 0.2s ease"
                }}>{s}</button>
              ))}
            </div>
          </FadeIn>

          {/* Record Display */}
          <FadeIn delay={0.2}>
            {(() => {
              const seasonData = {
                "2025-26": { wins: 15, losses: 9, confW: 10, confL: 6, confPlace: "5th", notes: "Central League", games: [
                  { date: "12/5", opp: "Coatesville", loc: "@", r: "L", lm: 62, them: 76 },
                  { date: "12/6", opp: "Downingtown West", loc: "vs", r: "W", lm: 75, them: 55 },
                  { date: "12/9", opp: "Garnet Valley", loc: "vs", r: "L", lm: 60, them: 69, conf: true },
                  { date: "12/11", opp: "Conestoga", loc: "@", r: "L", lm: 45, them: 50, conf: true },
                  { date: "12/16", opp: "Ridley", loc: "@", r: "W", lm: 61, them: 49, conf: true },
                  { date: "12/18", opp: "Haverford", loc: "@", r: "W", lm: 61, them: 48, conf: true },
                  { date: "12/23", opp: "Upper Darby", loc: "vs", r: "W", lm: 60, them: 52, conf: true },
                  { date: "12/29", opp: "St. Joseph's CA", loc: "vs", r: "W", lm: 62, them: 35, tag: "TOURNEY" },
                  { date: "12/30", opp: "State College", loc: "@", r: "W", lm: 59, them: 53, tag: "TOURNEY" },
                  { date: "1/3", opp: "Marple Newtown", loc: "vs", r: "W", lm: 55, them: 47, conf: true },
                  { date: "1/6", opp: "Strath Haven", loc: "@", r: "W", lm: 65, them: 36, conf: true },
                  { date: "1/8", opp: "Penncrest", loc: "vs", r: "L", lm: 45, them: 55, conf: true },
                  { date: "1/10", opp: "Northampton", loc: "@", r: "W", lm: 71, them: 45 },
                  { date: "1/13", opp: "Radnor", loc: "@", r: "W", lm: 69, them: 47, conf: true },
                  { date: "1/15", opp: "Harriton", loc: "vs", r: "W", lm: 71, them: 39, conf: true },
                  { date: "1/21", opp: "Springfield", loc: "@", r: "L", lm: 52, them: 53, conf: true },
                  { date: "1/23", opp: "Garnet Valley", loc: "@", r: "W", lm: 52, them: 43, conf: true },
                  { date: "1/24", opp: "Liberty", loc: "@", r: "W", lm: 55, them: 41 },
                  { date: "1/28", opp: "Conestoga", loc: "vs", r: "L", lm: 55, them: 61, conf: true },
                  { date: "1/29", opp: "Ridley", loc: "vs", r: "W", lm: 75, them: 45, conf: true },
                  { date: "1/31", opp: "Haverford", loc: "vs", r: "W", lm: 60, them: 47, conf: true },
                  { date: "2/3", opp: "Upper Darby", loc: "@", r: "L", lm: 45, them: 48, conf: true },
                  { date: "2/5", opp: "Garnet Valley", loc: "@", r: "L", lm: 46, them: 66, tag: "CAL PLAYOFF" },
                  { date: "2/13", opp: "Pennsbury", loc: "vs", r: "L", lm: 45, them: 51, tag: "D1 PLAYOFF" },
                ]},
                "2024-25": { wins: 22, losses: 8, confW: 14, confL: 2, confPlace: "1st", notes: "Central League Champions · PIAA 6A State Tournament R2 · Lost to Roman Catholic 63-74", highlight: "CAL Champs", games: [] },
                "2023-24": { wins: 28, losses: 2, confW: 16, confL: 0, confPlace: "1st", notes: "Central League Champions · District 1 Champions · PIAA 6A State Tournament R2", highlight: "District 1 Champs · 28-2", games: [] },
                "2022-23": { wins: 23, losses: 7, confW: 13, confL: 3, confPlace: "2nd", notes: "Central League Finalist · District 1 Champions · PIAA 6A State Quarterfinalist", highlight: "District 1 Champs", games: [] },
                "2021-22": { wins: 27, losses: 4, confW: 15, confL: 1, confPlace: "1st", notes: "Central League Champions · District 1 Champions · PIAA 6A State Runner-Up", highlight: "District 1 Champs · State Runner-Up", games: [] },
                "2020-21": { wins: 17, losses: 4, confW: 12, confL: 2, confPlace: "1st", notes: "Central League Co-Champions · District 1 Champions · COVID-shortened season", highlight: "District 1 Champs", games: [] },
                "2019-20": { wins: 21, losses: 5, confW: 13, confL: 3, confPlace: "2nd", notes: "District 1 Semifinalist · Season ended early due to COVID-19", highlight: "", games: [] },
              };
              const s = seasonData[selectedSeason];
              if (!s) return null;
              return (
                <div>
                  {/* Record header */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 32, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 44, fontWeight: 700 }}>
                        <span style={{ color: "var(--gold)" }}>{s.wins}</span>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>-</span>
                        <span>{s.losses}</span>
                      </div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>OVERALL</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 44, fontWeight: 700 }}>
                        <span style={{ color: "var(--gold)" }}>{s.confW}</span>
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>-</span>
                        <span>{s.confL}</span>
                      </div>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>CONFERENCE ({s.confPlace})</div>
                    </div>
                  </div>

                  {/* Season notes */}
                  <div style={{ textAlign: "center", marginTop: 16, fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                    {s.notes}
                  </div>
                  {s.highlight && (
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 2,
                        color: "var(--gold)", background: "rgba(132,0,54,0.3)",
                        padding: "4px 14px", borderRadius: 4, border: "1px solid rgba(201,164,74,0.3)"
                      }}>{s.highlight}</span>
                    </div>
                  )}

                  {/* Game-by-game table (only for 2025-26) */}
                  {s.games.length > 0 ? (
                    <div style={{ marginTop: 32, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "65px 1fr 50px 70px 70px",
                        padding: "12px 20px", background: "rgba(132,0,54,0.3)",
                        fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                        color: "var(--gold)", textTransform: "uppercase"
                      }}>
                        <span>Date</span><span>Opponent</span><span style={{ textAlign: "center" }}>W/L</span>
                        <span style={{ textAlign: "center" }}>LM</span><span style={{ textAlign: "center" }}>OPP</span>
                      </div>
                      {s.games.map((g, i) => (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "65px 1fr 50px 70px 70px",
                          padding: "13px 20px",
                          background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center",
                          transition: "background 0.2s ease"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.12)"}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                        >
                          <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{g.date}</span>
                          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 0.5 }}>
                            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginRight: 5 }}>{g.loc}</span>
                            {g.opp}
                            {g.conf && <span style={{ color: "var(--gold)", fontSize: 10, marginLeft: 6 }}>★</span>}
                            {g.tag && <span style={{ color: g.tag.includes("PLAYOFF") ? "#f87171" : "#4a9eff", fontSize: 9, marginLeft: 8, letterSpacing: 1, fontWeight: 600 }}>{g.tag}</span>}
                          </span>
                          <span style={{ textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, color: g.r === "W" ? "#4ade80" : "#f87171" }}>{g.r}</span>
                          <span style={{ textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: g.r === "W" ? 700 : 400, color: g.r === "W" ? "#fff" : "rgba(255,255,255,0.45)" }}>{g.lm}</span>
                          <span style={{ textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: g.r === "L" ? 700 : 400, color: g.r === "L" ? "#fff" : "rgba(255,255,255,0.45)" }}>{g.them}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: 32, padding: "40px 24px", textAlign: "center",
                      background: "rgba(255,255,255,0.02)", borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.4)" }}>
                        Full game-by-game results for this season coming soon.
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  {s.games.length > 0 && (
                    <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                      {[
                        { icon: "★", color: "var(--gold)", label: "Conference Game" },
                        { icon: "●", color: "#4a9eff", label: "Tournament" },
                        { icon: "●", color: "#f87171", label: "Playoff" },
                      ].map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Source Sans 3', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                          <span style={{ color: l.color, fontSize: 10 }}>{l.icon}</span> {l.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </FadeIn>
        </div>
      </section>

      {/* Championships */}
      <section id="championships" style={{ background: "var(--dark)" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Championship History</div>
            <h2 className="section-title">Banners<br /><span style={{ color: "var(--gold)" }}>& Titles</span></h2>
            <div className="divider" />
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="champ-tabs">
              {[
                { key: "state", label: "State Championships (7)" },
                { key: "district", label: "District 1 Titles (17)" },
                { key: "league", label: "Central League Titles (23)" },
              ].map(t => (
                <button key={t.key} className={`champ-tab ${activeChampTab === t.key ? "active" : ""}`}
                  onClick={() => setActiveChampTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </FadeIn>
          <div className="champ-grid">
            {activeChampTab === "state" && championships.state.map((c, i) => (
              <FadeIn key={c.year} delay={i * 0.08}>
                <div className={`champ-card ${c.year === "1996" ? "highlight" : ""}`}>
                  <div className="champ-year">{c.year}</div>
                  <div className="champ-detail">{c.details}</div>
                </div>
              </FadeIn>
            ))}
            {activeChampTab === "district" && championships.district.map((y, i) => (
              <FadeIn key={y} delay={i * 0.05}>
                <div className="champ-card">
                  <div className="champ-year">{y}</div>
                  <div className="champ-detail">District 1 Champions</div>
                </div>
              </FadeIn>
            ))}
            {activeChampTab === "league" && championships.league.map((y, i) => (
              <FadeIn key={y} delay={i * 0.03}>
                <div className="champ-card">
                  <div className="champ-year" style={{ fontSize: 28 }}>{y}</div>
                  <div className="champ-detail">Central League</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Central League */}
      <section id="league" style={{ background: "linear-gradient(180deg, var(--maroon-deep) 0%, var(--dark) 100%)" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Our Conference</div>
            <h2 className="section-title">The Central<br /><span style={{ color: "var(--gold)" }}>League</span></h2>
            <div className="divider" />
            <p className="section-text">
              The Central Athletic League is a premier high school sports conference in suburban Philadelphia, founded in 1967. Comprised of 12 schools primarily from Delaware, Chester, and Montgomery counties, the Central League is home to some of the best basketball programs in District 1. Lower Merion has dominated the league's basketball landscape, capturing 23 titles since the league's founding in 1967.
            </p>
          </FadeIn>
          <div className="league-grid">
            {centralLeagueTeams.map((team, i) => (
              <FadeIn key={team.name} delay={i * 0.06}>
                <div className={`league-card ${team.isSelf ? "self-card" : ""}`}>
                  <div className="league-card-header">
                    {team.isSelf ? (
                      <img src={BULLDOG} alt="Aces" style={{height:40,width:"auto",borderRadius:4}} />
                    ) : (
                      <div style={{
                        width:40,height:40,borderRadius:8,background:team.color,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontFamily:"'Oswald', sans-serif",fontSize:14,fontWeight:700,
                        color:"#fff",letterSpacing:1,flexShrink:0,
                        border:"2px solid rgba(255,255,255,0.15)"
                      }}>{team.initials}</div>
                    )}
                    <div>
                      <div className="league-card-name">{team.name}</div>
                      <div className="league-card-mascot">{team.mascot}</div>
                    </div>
                    {team.isSelf && <div style={{ marginLeft: "auto" }}><img src={SPADE_OUTLINE} alt="LM Spade" style={{height:44,width:"auto"}} /></div>}
                  </div>
                  <div className="league-card-desc">{team.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni */}
      <section id="alumni" style={{ background: "linear-gradient(180deg, var(--dark) 0%, var(--maroon-deep) 50%, var(--dark) 100%)" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Notable Alumni</div>
            <h2 className="section-title">College &<br /><span style={{ color: "var(--gold)" }}>Professional Players</span></h2>
            <div className="divider" />
            <p className="section-text">
              More than 70 Aces alumni have gone on to play at the college and professional levels — at Division I, II, III programs, in the NBA, and in professional leagues overseas.
            </p>
          </FadeIn>
          <div className="alumni-grid">
            {alumni.map((a, i) => (
              <FadeIn key={a.name} delay={i * 0.08}>
                <div className={`alumni-card ${a.highlight ? "featured" : ""}`}>
                  <div className="alumni-name">
                    {a.name} <span className="alumni-class">{a.classYear}</span>
                  </div>
                  <div className="alumni-info">
                    {a.college && <div><strong style={{ color: "rgba(255,255,255,0.8)" }}>College:</strong> {a.college}</div>}
                    {a.pro && <div style={{ marginTop: 4 }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Pro:</strong> {a.pro}</div>}
                  </div>
                  <div>
                    {a.pro?.includes("NBA") && <span className="alumni-tag tag-nba">NBA</span>}
                    {a.pro?.includes("overseas") || a.pro?.includes("NBL") || a.pro?.includes("Europe") ? <span className="alumni-tag tag-pro">Professional</span> : null}
                    {a.college && <span className="alumni-tag tag-college">College</span>}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Staff */}
      <section id="coaching" style={{ background: "var(--dark)" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Coaching Staff</div>
            <h2 className="section-title">Led By<br /><span style={{ color: "var(--gold)" }}>The Best</span></h2>
            <div className="divider" />
          </FadeIn>
          <div className="coach-grid">
            {coachingStaff.map((c, i) => (
              <FadeIn key={c.name} delay={i * 0.15}>
                <div className="coach-card">
                  <div className="coach-name">{c.name}</div>
                  <div className="coach-role">{c.role}{c.since ? ` · Since ${c.since}` : ""}</div>
                  <div className="coach-bio">{c.bio}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Roster */}
      <section id="roster" style={{ background: "linear-gradient(180deg, var(--dark), var(--maroon-deep))" }}>
        <div className="section">
          <FadeIn>
            <div className="section-label"><SpadeIcon size={14} color="#840036" /> Current Team</div>
            <h2 className="section-title">2025-26<br /><span style={{ color: "var(--gold)" }}>Roster</span></h2>
            <div className="divider" />
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="roster-note">
              <SpadeIcon size={40} color="#840036" />
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, marginTop: 20, letterSpacing: 2 }}>
                CURRENT ROSTER & SCHEDULE
              </h3>
              <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 16, lineHeight: 1.7 }}>
                View the full 2025-26 varsity roster, JV roster, schedule, scores, and stats on our official pages:
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <a href="https://www.maxpreps.com/pa/ardmore/lower-merion-aces/basketball/roster/" target="_blank" rel="noopener" className="social-btn primary">
                  MaxPreps Roster
                </a>
                <a href="http://www.aceshoops.com/team" target="_blank" rel="noopener" className="social-btn">
                  AcesHoops.com
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Record Book */}
      <section id="records" style={{ background: "linear-gradient(180deg, var(--maroon-deep) 0%, var(--dark) 50%, var(--maroon-deep) 100%)", padding: "100px 5% 80px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <SpadeIcon size={14} color="#840036" /> Stats & Records
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Record<br /><span style={{ color: "var(--gold)" }}>Book</span>
            </h2>
            <div className="divider divider-center" />
          </FadeIn>

          <FadeIn delay={0.15}>
            {(() => {
              const seasons = {
                "2025-26": {
                  record: "15-9", games: 24,
                  leaders: [
                    { name: "Kyle Parrish", number: "24", gp: 24, pts: 310, reb: 72, ast: 119, stl: 51, blk: 2, threes: 29, fgPct: "43.1", ftPct: "70.8", mins: 651 },
                    { name: "Israel Ingram", number: "5", gp: 24, pts: 286, reb: 83, ast: 33, stl: 33, blk: 7, threes: 54, fgPct: "37.3", ftPct: "60.3", mins: 626 },
                    { name: "William Yard", number: "13", gp: 24, pts: 168, reb: 86, ast: 40, stl: 28, blk: 10, threes: 36, fgPct: "52.5", ftPct: "66.7", mins: 540 },
                    { name: "Finn Pulsifer", number: "4", gp: 24, pts: 165, reb: 94, ast: 28, stl: 29, blk: 18, threes: 3, fgPct: "49.3", ftPct: "78.6", mins: 476 },
                    { name: "Bereket Darsenie", number: "1", gp: 24, pts: 140, reb: 40, ast: 27, stl: 17, blk: 2, threes: 35, fgPct: "40.7", ftPct: "50.0", mins: 390 },
                    { name: "Arjay Miller", number: "0", gp: 24, pts: 105, reb: 36, ast: 30, stl: 19, blk: 0, threes: 28, fgPct: "34.0", ftPct: "60.0", mins: 520 },
                    { name: "Nicholas Dragut", number: "35", gp: 16, pts: 72, reb: 46, ast: 18, stl: 4, blk: 7, threes: 2, fgPct: "68.9", ftPct: "66.7", mins: 191 },
                    { name: "Darius Mitchell", number: "2", gp: 21, pts: 59, reb: 31, ast: 10, stl: 11, blk: 0, threes: 6, fgPct: "50.0", ftPct: "65.0", mins: 204 },
                  ],
                },
                "2024-25": {
                  record: "22-7", games: 30,
                  leaders: [
                    { name: "Carson Kasmer", number: "14", gp: 30, pts: 530, reb: 93, ast: 60, stl: 47, blk: 0, threes: 60, fgPct: "48.6", ftPct: "85.7", mins: 902 },
                    { name: "Rashyne Patterson", number: "4", gp: 30, pts: 348, reb: 182, ast: 58, stl: 39, blk: 51, threes: 36, fgPct: "53.0", ftPct: "82.1", mins: 773 },
                    { name: "Sami Singletary", number: "—", gp: 30, pts: 321, reb: 115, ast: 59, stl: 40, blk: 4, threes: 32, fgPct: "44.8", ftPct: "67.9", mins: 757 },
                    { name: "Gus Wright", number: "11", gp: 30, pts: 301, reb: 107, ast: 82, stl: 66, blk: 1, threes: 42, fgPct: "43.7", ftPct: "66.3", mins: 854 },
                    { name: "LaMont Grier", number: "1", gp: 28, pts: 176, reb: 59, ast: 37, stl: 54, blk: 5, threes: 24, fgPct: "50.8", ftPct: "77.4", mins: 613 },
                    { name: "Kyle Parrish", number: "24", gp: 30, pts: 93, reb: 38, ast: 38, stl: 36, blk: 4, threes: 11, fgPct: "40.4", ftPct: "45.5", mins: 366 },
                    { name: "William Yard", number: "13", gp: 28, pts: 56, reb: 33, ast: 17, stl: 9, blk: 2, threes: 10, fgPct: "38.6", ftPct: "75.0", mins: 219 },
                    { name: "Chris Cook", number: "23", gp: 24, pts: 37, reb: 40, ast: 9, stl: 6, blk: 4, threes: 0, fgPct: "60.9", ftPct: "75.0", mins: 173 },
                  ],
                },
                "2023-24": {
                  record: "28-2", games: 30,
                  leaders: [
                    { name: "John Mobley", number: "4", gp: 30, pts: 437, reb: 180, ast: 84, stl: 68, blk: 27, threes: 38, fgPct: "45.8", ftPct: "67.5", mins: 831 },
                    { name: "Owen McCabe", number: "0", gp: 30, pts: 427, reb: 64, ast: 75, stl: 46, blk: 0, threes: 68, fgPct: "47.5", ftPct: "76.6", mins: 862 },
                    { name: "Adam Herrenkohl", number: "2", gp: 30, pts: 397, reb: 173, ast: 139, stl: 68, blk: 4, threes: 50, fgPct: "53.0", ftPct: "73.3", mins: 818 },
                    { name: "Carson Kasmer", number: "14", gp: 30, pts: 298, reb: 54, ast: 36, stl: 25, blk: 2, threes: 55, fgPct: "51.9", ftPct: "91.1", mins: 601 },
                    { name: "Jayden Robinson", number: "21", gp: 29, pts: 247, reb: 97, ast: 15, stl: 22, blk: 20, threes: 5, fgPct: "59.7", ftPct: "74.4", mins: 525 },
                    { name: "Justin Mebane", number: "10", gp: 29, pts: 122, reb: 76, ast: 23, stl: 12, blk: 13, threes: 0, fgPct: "55.8", ftPct: "76.2", mins: 440 },
                    { name: "Gus Wright", number: "11", gp: 29, pts: 79, reb: 38, ast: 23, stl: 22, blk: 0, threes: 16, fgPct: "39.7", ftPct: "56.5", mins: 426 },
                    { name: "Sami Singletary", number: "—", gp: 13, pts: 28, reb: 12, ast: 7, stl: 8, blk: 1, threes: 4, fgPct: "39.1", ftPct: "60.0", mins: 64 },
                    { name: "Cole Nocek", number: "30", gp: 18, pts: 30, reb: 22, ast: 6, stl: 3, blk: 0, threes: 1, fgPct: "50.0", ftPct: "56.3", mins: 127 },
                  ],
                },
                "2022-23": {
                  record: "24-6", games: 30,
                  leaders: [
                    { name: "Sam Brown", number: "11", gp: 30, pts: 530, reb: 128, ast: 80, stl: 34, blk: 10, threes: 80, fgPct: "43.6", ftPct: "85.0", mins: 834 },
                    { name: "Sam Wright", number: "24", gp: 29, pts: 381, reb: 104, ast: 59, stl: 43, blk: 6, threes: 45, fgPct: "41.0", ftPct: "83.2", mins: 773 },
                    { name: "John Mobley", number: "4", gp: 29, pts: 258, reb: 137, ast: 53, stl: 35, blk: 12, threes: 3, fgPct: "53.6", ftPct: "68.1", mins: 641 },
                    { name: "Justin Poles", number: "2", gp: 29, pts: 223, reb: 101, ast: 78, stl: 33, blk: 3, threes: 4, fgPct: "54.3", ftPct: "80.7", mins: 657 },
                    { name: "Jordan Meekins", number: "15", gp: 29, pts: 161, reb: 96, ast: 13, stl: 22, blk: 19, threes: 28, fgPct: "44.1", ftPct: "76.5", mins: 495 },
                    { name: "Teddy Pendergrass III", number: "1", gp: 29, pts: 151, reb: 39, ast: 29, stl: 16, blk: 5, threes: 23, fgPct: "44.2", ftPct: "73.3", mins: 455 },
                    { name: "Owen McCabe", number: "0", gp: 30, pts: 113, reb: 41, ast: 20, stl: 26, blk: 1, threes: 22, fgPct: "44.0", ftPct: "84.6", mins: 591 },
                    { name: "Carson Kasmer", number: "14", gp: 16, pts: 33, reb: 7, ast: 7, stl: 4, blk: 0, threes: 7, fgPct: "55.6", ftPct: "100", mins: 78 },
                  ],
                },
                "2021-22": {
                  record: "27-4", games: 30,
                  leaders: [
                    { name: "Demetrius Lilley", number: "14", gp: 26, pts: 465, reb: 325, ast: 17, stl: 21, blk: 25, threes: 18, fgPct: "56.2", ftPct: "61.5", mins: 703 },
                    { name: "Sam Brown", number: "11", gp: 22, pts: 359, reb: 73, ast: 40, stl: 21, blk: 3, threes: 63, fgPct: "44.7", ftPct: "76.7", mins: 620 },
                    { name: "Sam Wright", number: "24", gp: 29, pts: 237, reb: 85, ast: 51, stl: 30, blk: 7, threes: 46, fgPct: "35.8", ftPct: "72.5", mins: 756 },
                    { name: "Jaylen Shippen", number: "0", gp: 29, pts: 206, reb: 88, ast: 105, stl: 30, blk: 0, threes: 15, fgPct: "34.4", ftPct: "43.2", mins: 806 },
                    { name: "Justin Poles", number: "2", gp: 29, pts: 189, reb: 98, ast: 56, stl: 26, blk: 1, threes: 5, fgPct: "50.0", ftPct: "75.3", mins: 680 },
                    { name: "Peter Gribbin", number: "4", gp: 28, pts: 114, reb: 42, ast: 18, stl: 11, blk: 0, threes: 13, fgPct: "43.0", ftPct: "81.8", mins: 406 },
                    { name: "Henry Bard", number: "22", gp: 23, pts: 38, reb: 53, ast: 23, stl: 9, blk: 6, threes: 5, fgPct: "30.8", ftPct: "60.0", mins: 354 },
                    { name: "Teddy Pendergrass III", number: "1", gp: 19, pts: 33, reb: 14, ast: 8, stl: 9, blk: 0, threes: 3, fgPct: "47.8", ftPct: "72.7", mins: 139 },
                  ],
                },
                "2020-21": {
                  record: "13-5", games: 18,
                  leaders: [
                    { name: "Demetrius Lilley", number: "14", gp: 17, pts: 348, reb: 210, ast: 16, stl: 10, blk: 16, threes: 13, fgPct: "59.2", ftPct: "75.0", mins: 468 },
                    { name: "Sam Davison", number: "1", gp: 18, pts: 212, reb: 63, ast: 65, stl: 23, blk: 3, threes: 18, fgPct: "50.3", ftPct: "75.0", mins: 524 },
                    { name: "Sam Brown", number: "11", gp: 18, pts: 204, reb: 44, ast: 31, stl: 15, blk: 3, threes: 37, fgPct: "43.1", ftPct: "86.0", mins: 514 },
                    { name: "Jaylen Shippen", number: "0", gp: 18, pts: 124, reb: 42, ast: 53, stl: 18, blk: 1, threes: 12, fgPct: "39.1", ftPct: "56.5", mins: 425 },
                    { name: "Zack Wong", number: "21", gp: 18, pts: 113, reb: 65, ast: 36, stl: 17, blk: 11, threes: 15, fgPct: "48.9", ftPct: "62.5", mins: 387 },
                    { name: "Sam Wright", number: "24", gp: 18, pts: 61, reb: 22, ast: 15, stl: 5, blk: 0, threes: 17, fgPct: "38.8", ftPct: "85.7", mins: 217 },
                    { name: "Phil Cook", number: "5", gp: 17, pts: 35, reb: 40, ast: 6, stl: 6, blk: 1, threes: 1, fgPct: "37.8", ftPct: "50.0", mins: 126 },
                    { name: "Peter Gribbin", number: "4", gp: 15, pts: 25, reb: 9, ast: 9, stl: 3, blk: 0, threes: 5, fgPct: "38.5", ftPct: "—", mins: 103 },
                  ],
                },
                "2019-20": {
                  record: "20-8", games: 30,
                  leaders: [
                    { name: "Demetrius Lilley", number: "14", gp: 27, pts: 449, reb: 331, ast: 21, stl: 13, blk: 23, threes: 6, fgPct: "56.4", ftPct: "66.3", mins: 732 },
                    { name: "James Simples", number: "4", gp: 26, pts: 297, reb: 144, ast: 119, stl: 39, blk: 35, threes: 5, fgPct: "55.5", ftPct: "46.5", mins: 795 },
                    { name: "Sam Brown", number: "11", gp: 25, pts: 260, reb: 53, ast: 26, stl: 26, blk: 4, threes: 67, fgPct: "38.2", ftPct: "72.1", mins: 735 },
                    { name: "Jaylen Shippen", number: "0", gp: 29, pts: 154, reb: 64, ast: 67, stl: 31, blk: 0, threes: 20, fgPct: "35.8", ftPct: "53.7", mins: 721 },
                    { name: "Phil Cook", number: "5", gp: 28, pts: 115, reb: 97, ast: 15, stl: 12, blk: 4, threes: 6, fgPct: "45.7", ftPct: "67.6", mins: 401 },
                    { name: "Eli Rothman", number: "0", gp: 24, pts: 109, reb: 50, ast: 22, stl: 20, blk: 0, threes: 9, fgPct: "30.6", ftPct: "61.5", mins: 368 },
                    { name: "Peter Gribbin", number: "4", gp: 28, pts: 73, reb: 33, ast: 24, stl: 15, blk: 0, threes: 10, fgPct: "38.0", ftPct: "56.3", mins: 371 },
                    { name: "Lance Chestnut", number: "10", gp: 20, pts: 73, reb: 48, ast: 31, stl: 11, blk: 1, threes: 4, fgPct: "41.4", ftPct: "57.9", mins: 313 },
                  ],
                },
                "2018-19": {
                  record: "25-4", games: 29,
                  leaders: [
                    { name: "Steve Payne", number: "1", gp: 29, pts: 501, reb: 184, ast: 109, stl: 38, blk: 3, threes: 42, fgPct: "49.6", ftPct: "78.5", mins: 874 },
                    { name: "Jack Forrest", number: "2", gp: 19, pts: 369, reb: 117, ast: 35, stl: 16, blk: 11, threes: 66, fgPct: "46.8", ftPct: "76.5", mins: 533 },
                    { name: "Matt O'Connor", number: "12", gp: 29, pts: 213, reb: 52, ast: 36, stl: 5, blk: 6, threes: 61, fgPct: "39.4", ftPct: "75.9", mins: 689 },
                    { name: "Julian Hairston", number: "3", gp: 29, pts: 190, reb: 52, ast: 21, stl: 21, blk: 8, threes: 40, fgPct: "39.0", ftPct: "59.1", mins: 525 },
                    { name: "Theo Henry", number: "15", gp: 26, pts: 169, reb: 106, ast: 55, stl: 26, blk: 0, threes: 15, fgPct: "42.2", ftPct: "67.6", mins: 579 },
                    { name: "Darryl Taylor", number: "5", gp: 28, pts: 167, reb: 68, ast: 40, stl: 23, blk: 7, threes: 12, fgPct: "46.7", ftPct: "63.0", mins: 612 },
                    { name: "Josh Martin", number: "30", gp: 29, pts: 162, reb: 197, ast: 26, stl: 15, blk: 17, threes: 0, fgPct: "48.9", ftPct: "57.6", mins: 558 },
                    { name: "Sam Oshtry", number: "14", gp: 13, pts: 37, reb: 15, ast: 2, stl: 5, blk: 0, threes: 2, fgPct: "53.3", ftPct: "75.0", mins: 78 },
                  ],
                },
              };

              const [activeSeason, setActiveSeason] = useState("2025-26");
              const season = seasons[activeSeason];

              return (
                <div style={{ marginTop: 48 }}>
                  {/* Season Tabs */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
                    {Object.keys(seasons).map(key => (
                      <button key={key} onClick={() => setActiveSeason(key)} style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 1,
                        padding: "8px 18px", border: "1px solid",
                        borderColor: activeSeason === key ? "var(--maroon)" : "rgba(255,255,255,0.1)",
                        background: activeSeason === key ? "rgba(132,0,54,0.3)" : "rgba(255,255,255,0.02)",
                        color: activeSeason === key ? "#fff" : "rgba(255,255,255,0.5)",
                        borderRadius: 8, cursor: "pointer", textTransform: "uppercase",
                        transition: "all 0.3s ease"
                      }}>
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Season Record */}
                  <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 4,
                      color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8
                    }}>
                      Season Record
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700,
                      color: "var(--gold)"
                    }}>
                      {season.record}
                    </div>
                    <div style={{
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 13,
                      color: "rgba(255,255,255,0.4)", marginTop: 4
                    }}>
                      {season.games} Games Played
                    </div>
                  </div>

                  {/* Stat Leaders Grid */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 2, borderRadius: 12, overflow: "hidden", marginBottom: 36
                  }}>
                    {(() => {
                      const sorted = (key) => [...season.leaders].sort((a, b) => b[key] - a[key])[0];
                      return [
                        { label: "Points Leader", value: sorted("pts").pts, player: sorted("pts").name },
                        { label: "Rebounds Leader", value: sorted("reb").reb, player: sorted("reb").name },
                        { label: "Assists Leader", value: sorted("ast").ast, player: sorted("ast").name },
                        { label: "Steals Leader", value: sorted("stl").stl, player: sorted("stl").name },
                        { label: "Blocks Leader", value: sorted("blk").blk, player: sorted("blk").name },
                        { label: "3-Pointers", value: sorted("threes").threes, player: sorted("threes").name },
                      ].map((s, idx) => (
                        <div key={idx} style={{
                          background: "rgba(255,255,255,0.03)", padding: "24px 12px", textAlign: "center"
                        }}>
                          <div style={{
                            fontFamily: "'Oswald', sans-serif", fontSize: 30, fontWeight: 700,
                            color: "var(--gold)", lineHeight: 1
                          }}>{s.value}</div>
                          <div style={{
                            fontFamily: "'Source Sans 3', sans-serif", fontSize: 13,
                            color: "rgba(255,255,255,0.6)", marginTop: 6
                          }}>{s.player}</div>
                          <div style={{
                            fontFamily: "'Oswald', sans-serif", fontSize: 9, letterSpacing: 2,
                            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 6
                          }}>{s.label}</div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Stats Table */}
                  <div style={{
                    overflowX: "auto", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    <table style={{
                      width: "100%", borderCollapse: "collapse", minWidth: 700,
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 13
                    }}>
                      <thead>
                        <tr style={{ background: "rgba(132,0,54,0.25)" }}>
                          {["#", "Player", "GP", "PTS", "PPG", "REB", "RPG", "AST", "APG", "STL", "BLK", "3PM", "FG%", "FT%", "MIN"].map(h => (
                            <th key={h} style={{
                              padding: "12px 8px", textAlign: h === "Player" ? "left" : "center",
                              fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2,
                              color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
                              borderBottom: "1px solid rgba(255,255,255,0.08)", whiteSpace: "nowrap"
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {season.leaders.map((p, idx) => (
                          <tr key={idx} style={{
                            background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                            transition: "background 0.2s"
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(132,0,54,0.12)"}
                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                          >
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--gold)", fontFamily: "'Oswald', sans-serif", fontSize: 14 }}>{p.number}</td>
                            <td style={{ padding: "10px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{p.name}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{p.gp}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "#fff" }}>{p.pts}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{(p.pts / p.gp).toFixed(1)}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.reb}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{(p.reb / p.gp).toFixed(1)}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.ast}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{(p.ast / p.gp).toFixed(1)}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.stl}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.blk}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>{p.threes}</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{p.fgPct}%</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>{p.ftPct}%</td>
                            <td style={{ padding: "10px 8px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>{p.mins}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </FadeIn>
        </div>
      </section>

      {/* Photo Gallery */}
      <section id="photos" style={{ background: "linear-gradient(180deg, var(--maroon-deep), var(--dark))", padding: "100px 5% 80px" }}>
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}>
            <SpadeIcon size={14} color="#840036" /> Game Day
          </div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Photo<br /><span style={{ color: "var(--gold)" }}>Gallery</span>
          </h2>
          <div className="divider divider-center" />
        </FadeIn>

        {(() => {
          const galleries = [
            {
              title: "LM vs Conestoga",
              date: "January 28, 2026",
              coverId: "1Jk0yVNO5G48tm5JZdLAiTzglbpEGbfHM",
              ids: [
                "1Jk0yVNO5G48tm5JZdLAiTzglbpEGbfHM","19nHWLfxmN1Oasbt3PjCaBBOtbDkc4Qc2","1s8WJAe9PN2iKolWIc5BEGpG5Cnl8Q26L",
                "1eVEQIjksGWM2K4N3E1frUsPpE6YgF-hl","13lATB9I6Cv452ZAZBme9PuyMjYvGOJqY","1NNFvu0DN7NlmtZJPg0t9cfK1m-aY2KAQ",
                "1C58EBV8BsHc7qUyJ8zfVc9KWW8PW8bru","161RfOzf3GD8h-lQ4V56WmSKRvxH4l7SJ","1rvjpA_9BqjDZBHpsvH_hxaUWvSV7QbP_",
                "1opDl4s9BFxe7Qgbb2hDltU_dxOy2b0iC","1ZZydwVnwe8YqqwTTINCwddGhnmuGEbtv","1w2k2aHISet03QjrJgPLpNvOSH2fEn1Qz",
                "1FZaz0FGJkIltipxWDJFiAViwUHztsF_O","1j7DoHrduFDCZ_oJf1P6bZNbcocMnSsCZ","1GlUxcNptpfn8h7ePtST8QzXDTQSzF_Fl",
                "1kgr95Ov4ouj9NdwC3K_MShqVQp3TSN6U","18CXmRV9W6ZkJsyd62vyvwgdyAxLUtjwQ","1yF1oiDr6_T8UiS_L7T6vfzKYjf9wkRif",
                "1nMNA8gEPj9SI_XVGlCtlsueXJGzwntEo","1TIDUpFRrOru3XsLaX4TgllC9WC6XxMRJ","1F9XtweQenYsZvQUoUadDWev9QbAwyNI_",
                "1VU3ZuLiCS5zxsD4bx8wRJUlRiFyHz9Oq","1V1WAxwUf4Bc3CoFjR4URcoQxabuJfd1j","1c8HHIBzVhg7pfjaZw9f7T3iVI9oL_Z7R",
                "1PEK2jDDgWu7A_-izdiLilZ4xbpI06sNP","1uToiffl2xKwLEyQdt_MUm3TYE37Sxrav","1cVqgwMpCigd1mEpHLO8POHZT6kxFofVC",
                "1hLJECavHl-5-MX6Noa7JEfVTUN0D92eN","1IS5ZPrgrCaN_oLk5j4zUsAn4WtQCdW1u","1rtgFaUKM7APegvg46JdZzOsX-pDxEwB_",
                "1m9NgpznVL3qxObx0kibt4WMohzD6WRmo","1bTb0qexvTrHyXOmHgWaNRz_1UjAQtSQW","1OA8vIQN4fX6p5iSUbP8wIRWazjCmhjFe",
                "1wMDZfLhlrZQnTg0G7A38OTm5nv1M9kq-","10-xEjNdZJl8nN3rIgPGuGVELIH44UC6p","19Jvp51xS7omRH3eniIejnqiF0aplgU3I",
                "15xE6ZKsk6W0QMzR-NtB5N2DIOT1QrCu8","1kjerhMN7DkyXrSymHg98BgTHRQhXbd76","1hCzMZxqJDzFHJN9GuI6cZP1RJ8R_kM1F",
                "1vBeq_QPHf4yBmnAM7zVjEOyY5Xiby7UH","13Cx6ZP0wv6jAE4RcAZjSBqR6RycLq3Rw","1unYvZ7jB3IheOPwiX_pASss_NBHtYOYP",
                "1OChijwjFXGfWPP1wFgIt1lX1Vwqf91F8","1x8FOb-PyS2IBQHfCkbm0Y3aadFbgFhDU","1LNhThIpw-EqY92P2XP_PIpOnEEhxH4No",
                "1_Y0UrTfTup_QV8Ccr4YIDS4DcE6E1jC8","1KARyXO9P59n9NPmKufLXmp6ZnuK0IJvK","1he110z8wtBSJvA-536td7KffvMdRgRvU",
                "1Yv8YsQFOL9tmCMq6HHtusR4aziovAV7x","1rxUx0J7AHKkS-ZSsWeoUapF06YgtsveR"
              ]
            }
          ];
          const toUrl = (id) => `https://lh3.googleusercontent.com/d/${id}=s800`;
          return (
            <>
              {/* Game Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginTop: 40 }}>
                {galleries.map((gallery, gi) => (
                  <FadeIn key={gi} delay={0.2 + gi * 0.1}>
                    <div
                      onClick={() => setOpenGallery(openGallery === gi ? null : gi)}
                      style={{
                        position: "relative",
                        borderRadius: 12,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: openGallery === gi ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.1)",
                        transition: "all 0.3s ease",
                        background: "linear-gradient(135deg, rgba(132,0,54,0.3), rgba(0,0,0,0.8))",
                        minHeight: 180,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: 24,
                      }}
                      onMouseEnter={e => { if (openGallery !== gi) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                      onMouseLeave={e => { if (openGallery !== gi) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    >
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${toUrl(gallery.coverId)})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        opacity: 0.25, transition: "opacity 0.3s ease"
                      }} />
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                          fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                          color: "var(--gold)", textTransform: "uppercase", marginBottom: 8
                        }}>
                          {gallery.date}
                        </div>
                        <h3 style={{
                          fontFamily: "'Oswald', sans-serif", fontSize: 26, fontWeight: 600,
                          letterSpacing: 2, textTransform: "uppercase", margin: 0, lineHeight: 1.2
                        }}>
                          {gallery.title}
                        </h3>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12, marginTop: 10,
                          fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)"
                        }}>
                          <span>{gallery.ids.length} photos</span>
                          <span style={{ color: "var(--gold)", fontSize: 16 }}>
                            {openGallery === gi ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Expanded Gallery */}
              {openGallery !== null && (
                <div style={{ marginTop: 32, animation: "fadeIn 0.4s ease" }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 20, flexWrap: "wrap", gap: 12
                  }}>
                    <h3 style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 500,
                      letterSpacing: 2, textTransform: "uppercase", margin: 0
                    }}>
                      {galleries[openGallery].title}
                      <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300, marginLeft: 12, fontSize: 16 }}>
                        {galleries[openGallery].date}
                      </span>
                    </h3>
                    <button onClick={() => setOpenGallery(null)} style={{
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff", padding: "8px 20px", borderRadius: 6, cursor: "pointer",
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, letterSpacing: 1
                    }}>
                      Close ✕
                    </button>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 6,
                    borderRadius: 8,
                    overflow: "hidden"
                  }}>
                    {galleries[openGallery].ids.map((id, idx) => (
                      <div key={id} onClick={() => setLightbox({ galleryIndex: openGallery, photoIndex: idx })}
                        style={{
                          aspectRatio: "1", overflow: "hidden", cursor: "pointer",
                          position: "relative", background: "#1a1a1a"
                        }}>
                        <img
                          src={toUrl(id)}
                          alt={`${galleries[openGallery].title} photo ${idx + 1}`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
    
                          style={{
                            width: "100%", height: "100%", objectFit: "cover",
                            transition: "transform 0.4s ease, filter 0.4s ease",
                          }}
                          onMouseEnter={e => { e.target.style.transform = "scale(1.08)"; e.target.style.filter = "brightness(1.1)"; }}
                          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "brightness(1)"; }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lightbox */}
              {lightbox && (() => {
                const g = galleries[lightbox.galleryIndex];
                const id = g.ids[lightbox.photoIndex];
                const hasPrev = lightbox.photoIndex > 0;
                const hasNext = lightbox.photoIndex < g.ids.length - 1;
                return (
                  <div onClick={() => setLightbox(null)} style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.95)", zIndex: 10000,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "zoom-out"
                  }}>
                    <button onClick={() => setLightbox(null)} style={{
                      position: "absolute", top: 20, right: 20, background: "none", border: "none",
                      color: "#fff", fontSize: 32, cursor: "pointer", zIndex: 10001, fontFamily: "sans-serif",
                      width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>

                    {hasPrev && (
                      <button onClick={e => { e.stopPropagation(); setLightbox({...lightbox, photoIndex: lightbox.photoIndex - 1}); }}
                        style={{
                          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                          color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 10001, borderRadius: "50%",
                          width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                          backdropFilter: "blur(8px)"
                        }}>‹</button>
                    )}

                    <img
                      src={`https://lh3.googleusercontent.com/d/${id}=s1600`}
                      alt={`Photo ${lightbox.photoIndex + 1}`}
                      onClick={e => e.stopPropagation()}
                      referrerPolicy="no-referrer"

                      style={{
                        maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain",
                        borderRadius: 4, cursor: "default",
                        boxShadow: "0 0 80px rgba(0,0,0,0.8)"
                      }}
                    />

                    {hasNext && (
                      <button onClick={e => { e.stopPropagation(); setLightbox({...lightbox, photoIndex: lightbox.photoIndex + 1}); }}
                        style={{
                          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                          color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 10001, borderRadius: "50%",
                          width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                          backdropFilter: "blur(8px)"
                        }}>›</button>
                    )}

                    <div style={{
                      position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
                      fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)",
                      letterSpacing: 1
                    }}>
                      {lightbox.photoIndex + 1} / {g.ids.length}
                    </div>
                  </div>
                );
              })()}
            </>
          );
        })()}
      </section>

      {/* Videos */}
      <section id="videos" style={{ background: "var(--dark)", padding: "100px 5% 80px" }}>
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}>
            <SpadeIcon size={14} color="#840036" /> Film Room
          </div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Aces<br /><span style={{ color: "var(--gold)" }}>Videos</span>
          </h2>
          <div className="divider divider-center" />
        </FadeIn>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: 24,
          marginTop: 40,
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          {[
            { id: "12WUvT4kHs3ZhTdz8OmrqoDYdwKPvHwVs", title: "2022–2023 LM Season Highlights", season: "2022-23 Season" },
          ].map((video, idx) => (
            <FadeIn key={idx} delay={0.2 + idx * 0.1}>
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                overflow: "hidden",
                transition: "border-color 0.3s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden" }}>
                  <iframe
                    src={`https://drive.google.com/file/d/${video.id}/preview`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{
                      position: "absolute", top: 0, left: 0,
                      width: "100%", height: "100%", border: "none"
                    }}
                  />
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                    color: "var(--gold)", textTransform: "uppercase", marginBottom: 6
                  }}>
                    {video.season}
                  </div>
                  <h3 style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 500,
                    letterSpacing: 1, margin: 0
                  }}>
                    {video.title}
                  </h3>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Kobe Bryant Tribute */}
      <section id="kobe" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a12 15%, #0d0005 50%, #1a0a12 85%, #0a0a0a 100%)", padding: "120px 5% 100px", position: "relative", overflow: "hidden" }}>
        {/* Background 33 watermark */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontSize: "min(50vw, 500px)", fontFamily: "'Oswald', sans-serif", fontWeight: 900,
          color: "rgba(132,0,54,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none"
        }}>33</div>

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <SpadeIcon size={14} color="#840036" /> 1978 – 2020
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 6vw, 64px)", fontWeight: 700,
              textAlign: "center", lineHeight: 1.05, marginBottom: 8
            }}>
              Kobe Bean<br /><span style={{ color: "var(--gold)" }}>Bryant</span>
            </h2>
            <div style={{
              textAlign: "center", fontFamily: "'Oswald', sans-serif", fontSize: 14,
              letterSpacing: 4, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 12
            }}>
              Lower Merion '96 · #33 · The Black Mamba
            </div>
            <div className="divider divider-center" style={{ marginTop: 24 }} />
          </FadeIn>

          {/* Quote */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 48, textAlign: "center", padding: "0 20px"
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 2.5vw, 24px)",
                fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 700, margin: "0 auto"
              }}>
                "I didn't go to college, so this is my university. This is where all my memories lie."
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 3,
                color: "var(--gold)", marginTop: 16, textTransform: "uppercase"
              }}>
                — Kobe Bryant, Gymnasium Dedication · December 16, 2010
              </div>
            </div>
          </FadeIn>

          {/* Kobe Photos */}
          <FadeIn delay={0.25}>
            <div style={{
              marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20, maxWidth: 900, margin: "56px auto 0"
            }}>
              {[
                { id: "1FHihWDtAnEkF2DJYPpv_Y_cddj3wE5Bo", caption: "Kobe Bryant #33 — Lower Merion Aces", alt: "Kobe Bryant sitting on the court surrounded by basketballs in his Lower Merion #33 jersey" },
                { id: "1GUyWZIR0djugEyCFxhR0_sOgiVB3Cima", caption: "Kobe rises for a dunk at Lower Merion", alt: "Kobe Bryant dunking in a Lower Merion Aces game" },
                { id: "1o3si_FEEkoEXYsh0fnxjr4gFdG6P-bmf", caption: "The Mamba's high school days", alt: "Kobe Bryant during his time at Lower Merion High School" },
              ].map((photo, idx) => (
                <div key={idx} style={{
                  borderRadius: 12, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.3)"
                }}>
                  <img
                    src={`https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`}
                    alt={photo.alt}
                    loading="lazy"
                    style={{
                      width: "100%", height: 280, objectFit: "cover", display: "block",
                      filter: "saturate(0.85) contrast(1.05)"
                    }}
                  />
                  <div style={{
                    padding: "14px 18px",
                    fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                    color: "rgba(255,255,255,0.45)", textTransform: "uppercase"
                  }}>
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Career Timeline */}
          <FadeIn delay={0.3}>
            <div style={{ marginTop: 64 }}>
              <h3 style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4,
                color: "var(--gold)", textTransform: "uppercase", textAlign: "center", marginBottom: 32
              }}>
                The Lower Merion Years · 1992–1996
              </h3>

              {[
                { year: "Freshman · 1992-93", title: "The Arrival", text: "Kobe moved to Ardmore from Italy where his father Joe \"Jellybean\" Bryant had been playing professionally. He became the first freshman in decades to start for Lower Merion's varsity team. The Aces finished 4-20, but Coach Gregg Downer knew immediately he had something special." },
                { year: "Sophomore · 1993-94", title: "Building the Foundation", text: "With Kobe developing rapidly and playing all five positions, Lower Merion began its dramatic turnaround. The Aces posted a winning record as Bryant continued to hone his craft under Coach Downer's guidance." },
                { year: "Junior · 1994-95", title: "State Recognition", text: "Bryant exploded onto the state scene averaging 31.1 points, 10.4 rebounds, 5.2 assists, 3.8 blocks, and 2.3 steals per game. He was named Pennsylvania Player of the Year and earned Parade All-American honors. College powerhouses Duke, Michigan, UNC, and Villanova came calling." },
                { year: "Senior · 1995-96", title: "Championship Season", text: "In his final season, Kobe averaged 30.8 points, 12.0 rebounds, 6.5 assists, 4.0 steals, and 3.8 blocks. He led the Aces to a 31-3 record and Lower Merion's first PIAA State Championship since 1943, scoring 17 points in the title game. He finished with 2,883 career points — the most in Southeastern Pennsylvania history, surpassing Wilt Chamberlain." },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap"
                }}>
                  <div style={{ minWidth: 160 }}>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3,
                      color: "var(--gold)", textTransform: "uppercase", marginBottom: 4
                    }}>{item.year}</div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700
                    }}>{item.title}</div>
                  </div>
                  <div style={{
                    flex: 1, minWidth: 280,
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                    color: "rgba(255,255,255,0.65)", lineHeight: 1.8,
                    borderLeft: "2px solid rgba(132,0,54,0.4)", paddingLeft: 20
                  }}>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Senior Year Awards */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 48, background: "rgba(132,0,54,0.12)",
              border: "1px solid rgba(132,0,54,0.25)", borderRadius: 16, padding: "32px 36px"
            }}>
              <h3 style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4,
                color: "var(--gold)", textTransform: "uppercase", marginBottom: 24, textAlign: "center"
              }}>Senior Year Honors · 1996</h3>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16, textAlign: "center"
              }}>
                {[
                  "Naismith HS Player of the Year",
                  "Gatorade National Player of the Year",
                  "McDonald's All-American",
                  "Parade First Team All-American",
                  "USA Today All-USA First Team",
                  "PA Player of the Year (2×)",
                ].map((award, idx) => (
                  <div key={idx} style={{
                    fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                    color: "rgba(255,255,255,0.7)", padding: "12px 8px",
                    background: "rgba(0,0,0,0.3)", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <span style={{ color: "var(--gold)", marginRight: 6 }}>♠</span> {award}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Stats Card */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 48, display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 2, borderRadius: 16, overflow: "hidden"
            }}>
              {[
                { stat: "2,883", label: "Career Points" },
                { stat: "30.8", label: "PPG (Senior)" },
                { stat: "12.0", label: "RPG (Senior)" },
                { stat: "6.5", label: "APG (Senior)" },
                { stat: "31-3", label: "Senior Record" },
                { stat: "#33", label: "Retired Jersey" },
              ].map((s, idx) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.03)", padding: "28px 16px", textAlign: "center"
                }}>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 32, fontWeight: 700,
                    color: "var(--gold)", lineHeight: 1
                  }}>{s.stat}</div>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2,
                    color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginTop: 8
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* NBA Legacy + LM Connection */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32
            }}>
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "32px 28px"
              }}>
                <h3 style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4,
                  color: "var(--gold)", textTransform: "uppercase", marginBottom: 20
                }}>NBA Legacy</h3>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: "rgba(255,255,255,0.6)", lineHeight: 1.9
                }}>
                  {[
                    "5× NBA Champion (2000–02, 2009–10)",
                    "2× NBA Finals MVP (2009, 2010)",
                    "NBA MVP (2008)",
                    "18× NBA All-Star",
                    "2× NBA Scoring Champion",
                    "NBA All-Star Game MVP (4×)",
                    "33,643 Career Points",
                    "Hall of Fame Class of 2020",
                    "NBA 75th Anniversary Team",
                    "Academy Award Winner (2018)",
                  ].map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                      <span style={{ color: "var(--gold)", marginRight: 8, fontSize: 10 }}>▸</span>{item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "32px 28px"
              }}>
                <h3 style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4,
                  color: "var(--gold)", textTransform: "uppercase", marginBottom: 20
                }}>Lower Merion Connection</h3>
                <div style={{
                  fontFamily: "'Source Sans 3', sans-serif", fontSize: 14,
                  color: "rgba(255,255,255,0.6)", lineHeight: 1.9
                }}>
                  {[
                    "Kobe Bryant Gymnasium dedicated Dec. 16, 2010",
                    "Donated $411,000 to Lower Merion School District",
                    "#33 jersey retired and hangs over the gym door",
                    "Wore LM shorts under Lakers shorts every game",
                    "Jersey #33 retired by Lower Merion in 2002",
                    "33 seconds of silence opens every Aces season",
                    "Memorabilia display in the athletic atrium",
                    "Largest individual donation in LMSD history",
                    "Credited English teacher Jeanne Mastriano for sparking his love of writing",
                    "\"Aces Nation has lost its heartbeat\" — Coach Downer, Jan. 26, 2020",
                  ].map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                      <span style={{ color: "var(--gold)", marginRight: 8, fontSize: 10 }}>▸</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Memorial */}
          <FadeIn delay={0.2}>
            <div style={{
              marginTop: 64, textAlign: "center", padding: "48px 24px",
              background: "linear-gradient(135deg, rgba(132,0,54,0.15), rgba(0,0,0,0.4))",
              borderRadius: 16, border: "1px solid rgba(201,164,74,0.15)"
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
                marginBottom: 8
              }}>
                January 26, 2020
              </div>
              <div style={{
                fontFamily: "'Source Sans 3', sans-serif", fontSize: 15,
                color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto"
              }}>
                Kobe Bryant, his daughter Gianna, and seven others tragically lost their lives in a helicopter crash in Calabasas, California. The Lower Merion community gathered at the Bryant Gymnasium, placing flowers, jerseys, and basketballs at the doors of the gym that bears his name.
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: "italic",
                color: "var(--gold)", marginTop: 32, lineHeight: 1.6
              }}>
                Mamba Mentality Forever
              </div>
              <div style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 4,
                color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginTop: 16
              }}>
                Rest in Peace · Kobe & Gianna Bryant
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social / Follow */}
      <section id="social" className="social-section">
        <FadeIn>
          <div className="section-label" style={{ justifyContent: "center" }}>
            <SpadeIcon size={14} color="#840036" /> Connect
          </div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Follow<br /><span style={{ color: "var(--gold)" }}>Aces Nation</span>
          </h2>
          <div className="divider divider-center" />
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="ig-embed-wrapper">
            <img src={SPADE_OUTLINE} alt="Spade" style={{height:44,width:"auto",filter:"drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 18px rgba(132,0,54,0.3))"}} />
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, marginTop: 16, letterSpacing: 2 }}>
              @ACESBASKETBALL
            </h3>
            <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
              Follow us on Instagram for game highlights, behind-the-scenes content, recruiting updates, and Aces Nation community.
            </p>
            <a href="https://www.instagram.com/acesbasketball/" target="_blank" rel="noopener"
              className="social-btn primary" style={{ marginTop: 20, display: "inline-flex" }}>
              Follow on Instagram →
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="social-links" style={{ marginTop: 40 }}>
            <a href="https://www.instagram.com/acesbasketball/" target="_blank" rel="noopener" className="social-btn primary">
              Instagram
            </a>
            <a href="https://twitter.com/aceshoops" target="_blank" rel="noopener" className="social-btn">
              X / Twitter
            </a>
            <a href="http://www.aceshoops.com" target="_blank" rel="noopener" className="social-btn">
              AcesHoops.com
            </a>
            <a href="https://www.maxpreps.com/pa/ardmore/lower-merion-aces/basketball/" target="_blank" rel="noopener" className="social-btn">
              MaxPreps
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <img src={BULLDOG} alt="Aces Bulldog" style={{height:52,width:"auto"}} />
          <img src={SPADE_OUTLINE} alt="Ace of Spades" style={{height:40,width:"auto"}} />
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: 3, marginTop: 16 }}>
          LOWER MERION ACES BASKETBALL
        </div>
        <div style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
          245 E. Montgomery Avenue · Ardmore, PA 19003
        </div>
        <div className="divider divider-center" style={{ margin: "20px auto" }} />
        <div className="footer-text">
          7× PIAA State Champions · Est. 1911 · Home of the Kobe Bryant Gymnasium
        </div>
        <div className="footer-text" style={{ marginTop: 12, fontSize: 11 }}>
          © {new Date().getFullYear()} Lower Merion Aces Basketball. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
