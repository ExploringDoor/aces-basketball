// pages/HomePage.jsx
import { useState, useEffect } from "react";
import { FadeIn, CountUp, Spade, Icon, news, schedule, homeVenue, teamLogos } from "../shared";

const latestNews = [...news].sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0));
const nextGame = schedule[0]?.games[0];

const GameBadge = ({ team, size = 46 }) => {
  const logo = teamLogos[team];
  return logo
    ? <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", border: "2px solid rgba(201,164,74,0.4)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src={logo} alt={team} style={{ width: "88%", height: "88%", objectFit: "contain" }} /></div>
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(132,0,54,0.3)", border: "2px solid rgba(132,0,54,0.5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Oswald',sans-serif", fontSize: Math.round(size * 0.4), fontWeight: 700, color: "#fff" }}>{team[0]}</div>;
};

const bannerTexts = [
  { title: "7× PIAA State Champions",      sub: "The Pride of the Main Line" },
  { title: "Kobe Bryant's Alma Mater",     sub: "Where Mamba Mentality Was Born" },
  { title: "700+ Wins Under Coach Downer", sub: "A Living Legend" },
  { title: "Est. 1911 · Ardmore, PA",      sub: "Over a Century of Excellence" },
];

export default function HomePage({ goTo }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % bannerTexts.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const wordStyle = (fromLeft) => ({
    fontFamily: "'Anton', sans-serif",
    fontSize: "clamp(60px, 13vw, 140px)",
    fontWeight: 400,
    letterSpacing: "1px",
    lineHeight: 1,
    whiteSpace: "nowrap",
    opacity: heroIn ? 1 : 0,
    transform: heroIn ? "translateX(0)" : `translateX(${fromLeft ? "-100vw" : "100vw"})`,
    transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
  });

  return (
    <>
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", position:"relative", overflow:"hidden", background:"radial-gradient(ellipse at 50% 40%, #2a0018 0%, #0a0005 65%)", textAlign:"center", padding:"0 5%" }}>
        {/* Real gym photo: slow fade-in + slow ken-burns zoom */}
        <div className="hero-photo" style={{ position:"absolute", inset:0, backgroundImage:"url('/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg')", backgroundSize:"cover", backgroundPosition:"center 26%", opacity:0, filter:"contrast(1.06) saturate(1.05)", animation:"heroFadeIn 2.8s ease-out both, heroKen 22s ease-out both", pointerEvents:"none" }} />
        {/* Soft scrim behind the wordmark; photo stays visible around the edges */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 68% 52% at 50% 47%, rgba(8,0,4,0.74) 0%, rgba(8,0,4,0.34) 44%, transparent 72%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(8,0,4,0.5) 0%, transparent 24%, transparent 74%, rgba(8,0,4,0.62) 100%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity:0.35, pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Bulldog */}
          <div style={{ opacity:heroIn?1:0, transform:heroIn?"translateY(0)":"translateY(-30px)", transition:"opacity 0.7s ease 0.1s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s", marginBottom:8 }}>
            <img src="/Bulldog.png" alt="Aces Bulldog" style={{ height:"clamp(120px,20vw,220px)", width:"auto", filter:"drop-shadow(0 0 30px rgba(132,0,54,0.5))", display:"block", margin:"0 auto" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:16, overflow:"hidden" }}>
            <span style={{ ...wordStyle(true), color:"#fff", textShadow:"0 3px 26px rgba(0,0,0,0.75), 0 0 90px rgba(132,0,54,0.35)" }}>LOWER</span>
            <span style={{ ...wordStyle(false), color:"#9e0040", textShadow:"0 3px 26px rgba(0,0,0,0.6), 0 0 90px rgba(132,0,54,0.5)" }}>MERION</span>
          </div>
          <div style={{ width:heroIn?"200px":"0px", height:"2px", background:"linear-gradient(90deg,transparent,#c9a44a,transparent)", margin:"20px auto 16px", transition:"width 0.7s ease 0.8s" }} />
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:"clamp(11px,1.6vw,15px)", letterSpacing:7, color:"var(--gold)", textTransform:"uppercase", opacity:heroIn?1:0, transform:heroIn?"translateY(0)":"translateY(16px)", transition:"opacity 0.6s ease 1s, transform 0.6s ease 1s" }}>
            Aces Basketball · Ardmore, Pennsylvania
          </div>
          <div style={{ marginTop:36, minHeight:80, opacity:heroIn?1:0, transition:"opacity 0.6s ease 1.2s" }}>
            {bannerTexts.map((b,i) => (
              <div key={i} style={{ display:i===activeBanner?"block":"none" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.6vw,28px)", color:"#fff" }}>{b.title}</div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.44)", marginTop:6 }}>{b.sub}</div>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:18 }}>
              {bannerTexts.map((_,i) => <div key={i} onClick={() => setActiveBanner(i)} style={{ width:6, height:6, borderRadius:"50%", background:i===activeBanner?"var(--gold)":"rgba(255,255,255,0.2)", cursor:"pointer", transition:"background 0.3s" }} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Next game */}
      {nextGame && (
        <section style={{ background:"linear-gradient(180deg,#0a0005,#0d0008)", borderTop:"1px solid rgba(132,0,54,0.25)", padding:"26px 5%" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <div style={{ minWidth:110 }}>
                <div style={{ display:"inline-block", padding:"3px 11px", borderRadius:20, background:"var(--maroon)", fontFamily:"'Oswald',sans-serif", fontSize:9, letterSpacing:2, fontWeight:700, color:"#fff", textTransform:"uppercase", marginBottom:8 }}>Next Game</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:1.5, color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>{nextGame.date} · {nextGame.time}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <GameBadge team="Lower Merion" />
                <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, color:"rgba(255,255,255,0.4)" }}>{nextGame.home?"vs":"@"}</span>
                <GameBadge team={nextGame.opp} />
                <div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:"clamp(18px,2.4vw,24px)", fontWeight:700, textTransform:"uppercase", lineHeight:1.1 }}>{nextGame.home?"vs ":"@ "}{nextGame.opp}</div>
                  <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{nextGame.home?homeVenue:"Away"}</div>
                </div>
              </div>
            </div>
            <button onClick={()=>goTo("schedule")} style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, textTransform:"uppercase", color:"var(--gold)", background:"transparent", border:"1px solid rgba(201,164,74,0.4)", borderRadius:8, padding:"11px 22px", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,164,74,0.1)"; e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent"; e.currentTarget.style.transform="translateY(0)";}}>
              Full Schedule →
            </button>
          </div>
        </section>
      )}

      <section style={{ background:"#0d0008", padding:"44px 5%", borderTop:"1px solid rgba(132,0,54,0.25)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:36, textAlign:"center" }}>
          {[{end:7,suffix:"×",label:"State Championships"},{end:738,suffix:"+",label:"Downer Wins"},{end:23,suffix:"",label:"League Titles"},{end:70,suffix:"+",label:"College / Pro"},{end:1663,suffix:"+",label:"All-Time Wins"}].map((s,i) => (
            <FadeIn key={i} delay={i*0.08}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:"clamp(32px,4vw,48px)", fontWeight:700, color:"var(--gold)", lineHeight:1 }}><CountUp end={s.end} suffix={s.suffix} /></div>
              <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.34)", textTransform:"uppercase", marginTop:7 }}>{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Program identity band */}
      <section style={{ background:"linear-gradient(180deg,#0a0005,#0d0008)", padding:"64px 5%", borderTop:"1px solid rgba(132,0,54,0.18)", overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:48, alignItems:"center" }}>
          <FadeIn direction="right">
            <div style={{ position:"relative", borderRadius:14, overflow:"hidden", border:"1px solid rgba(201,164,74,0.22)", boxShadow:"0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(132,0,54,0.25)" }}>
              <img src="/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg" alt="Lower Merion Aces in action" style={{ width:"100%", display:"block", aspectRatio:"4/3", objectFit:"cover", objectPosition:"center 25%" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 55%,rgba(10,0,5,0.85))" }} />
              <div style={{ position:"absolute", left:18, bottom:16, fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:2.5, color:"var(--gold)", textTransform:"uppercase" }}>Aces vs. Penncrest · Ardmore, PA</div>
            </div>
          </FadeIn>
          <FadeIn direction="left" delay={0.1}>
            <div>
              <div className="section-label">Since 1911 <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(201,164,74,0.5),transparent)" }} /></div>
              <h2 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:700, fontSize:"clamp(30px,4.4vw,50px)", lineHeight:1.04, textTransform:"uppercase", margin:"0 0 18px" }}>
                More Than a Program.<br /><span style={{ color:"var(--maroon)" }}>A Tradition.</span>
              </h2>
              <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:16, lineHeight:1.7, color:"rgba(255,255,255,0.6)", maxWidth:460, margin:"0 0 28px" }}>
                For over a century, Lower Merion basketball has defined excellence on the Main Line. Seven PIAA state titles, the gym that shaped Kobe Bryant, and more than three decades of Coach Gregg Downer on the sideline. This is Aces basketball.
              </p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[{id:"history",label:"Our History",solid:true},{id:"championships",label:"Championships",solid:false}].map(b => (
                  <button key={b.id} onClick={() => goTo(b.id)} style={{
                    fontFamily:"'Oswald',sans-serif", fontSize:12.5, letterSpacing:2, textTransform:"uppercase",
                    padding:"13px 26px", borderRadius:8, cursor:"pointer",
                    color: b.solid ? "#fff" : "var(--gold)",
                    background: b.solid ? "var(--maroon)" : "transparent",
                    border: b.solid ? "1px solid var(--maroon)" : "1px solid rgba(201,164,74,0.4)",
                    transition:"all 0.22s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow= b.solid ? "0 8px 26px rgba(132,0,54,0.5)" : "0 8px 26px rgba(201,164,74,0.18)"; if(!b.solid){e.currentTarget.style.background="rgba(201,164,74,0.1)";} }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; if(!b.solid){e.currentTarget.style.background="transparent";} }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Latest from Aces Nation */}
      <section style={{ background:"#0d0008", padding:"60px 5%", borderTop:"1px solid rgba(132,0,54,0.18)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
            <div>
              <div className="section-label">Latest <span style={{ flex:1, minWidth:40, height:1, background:"linear-gradient(90deg,rgba(201,164,74,0.5),transparent)" }} /></div>
              <h2 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:700, fontSize:"clamp(26px,3.6vw,40px)", textTransform:"uppercase", margin:0, lineHeight:1 }}>From Aces Nation</h2>
            </div>
            <button onClick={() => goTo("news")} style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:2, textTransform:"uppercase", color:"var(--gold)", background:"transparent", border:"1px solid rgba(201,164,74,0.4)", borderRadius:8, padding:"11px 22px", cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(201,164,74,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.transform="translateY(0)"; }}>
              View All News →
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {latestNews.slice(0,3).map((post, i) => (
              <FadeIn key={post.id} delay={i*0.08}>
                <div onClick={() => goTo("news")} style={{
                  height:"100%", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:14, overflow:"hidden", cursor:"pointer", display:"flex", flexDirection:"column",
                  transition:"all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor="rgba(132,0,54,0.5)"; e.currentTarget.style.boxShadow="0 14px 36px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ height:140, backgroundImage:`linear-gradient(180deg,transparent,rgba(10,0,5,0.55)), url(${post.image || "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg"})`, backgroundSize:"cover", backgroundPosition:"center 25%" }} />
                  <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ padding:"3px 10px", borderRadius:20, background:"rgba(132,0,54,0.25)", border:"1px solid rgba(132,0,54,0.4)", fontFamily:"'Oswald',sans-serif", fontSize:9, letterSpacing:1.5, color:"rgba(255,255,255,0.65)", textTransform:"uppercase" }}>{post.category}</span>
                      <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.35)" }}>{post.date}</span>
                    </div>
                    <h3 style={{ fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:17, lineHeight:1.2, margin:"0 0 8px" }}>{post.title}</h3>
                    <p style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.6, margin:0 }}>{post.excerpt}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:"#0a0005", padding:"44px 5% 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:4, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:20 }}>Explore the Program</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
            {[{id:"history",icon:"history",label:"History"},{id:"thousand",icon:"basketball",label:"1,000 Club"},{id:"schedule",icon:"calendar",label:"Schedule"},{id:"championships",icon:"trophy",label:"Championships"},{id:"league",icon:"building",label:"Central League"},{id:"alumni",icon:"grad",label:"Alumni"},{id:"coaching",icon:"clipboard",label:"Staff"},{id:"records",icon:"chart",label:"Records"},{id:"photos",icon:"camera",label:"Photos"},{id:"videos",icon:"video",label:"Videos"},{id:"kobe",icon:"spade",label:"Kobe"},{id:"social",icon:"phone",label:"Follow Us"}].map(card => (
              <button key={card.id} onClick={() => goTo(card.id)} style={{ padding:"20px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, cursor:"pointer", color:"#fff", textAlign:"center", transition:"all 0.2s", display:"flex", flexDirection:"column", alignItems:"center", gap:11 }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(132,0,54,0.18)"; e.currentTarget.style.borderColor="rgba(132,0,54,0.4)"; e.currentTarget.style.transform="translateY(-2px)"; const ic=e.currentTarget.querySelector('.explore-ic'); if(ic) ic.style.color="var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(0)"; const ic=e.currentTarget.querySelector('.explore-ic'); if(ic) ic.style.color="rgba(255,255,255,0.75)"; }}>
                <span className="explore-ic" style={{ color:"rgba(255,255,255,0.75)", transition:"color 0.2s" }}><Icon name={card.icon} size={26} stroke={1.5} /></span>
                <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:1.5, textTransform:"uppercase" }}>{card.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
