// pages/HomePage.jsx
import { useState, useEffect } from "react";
import { FadeIn, CountUp, Spade } from "../shared";

const bannerTexts = [
  { title: "7× PIAA State Champions",      sub: "The Pride of the Main Line" },
  { title: "Kobe Bryant's Alma Mater",     sub: "Where Mamba Mentality Was Born" },
  { title: "600+ Wins Under Coach Downer", sub: "A Living Legend" },
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
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity:0.35, pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:16, overflow:"hidden" }}>
            <span style={{ ...wordStyle(true), color:"#fff", textShadow:"0 0 100px rgba(132,0,54,0.3)" }}>LOWER</span>
            <span style={{ ...wordStyle(false), color:"#840036", textShadow:"0 0 100px rgba(132,0,54,0.4)" }}>MERION</span>
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

      <section style={{ background:"#0a0005", padding:"44px 5% 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:4, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", marginBottom:20 }}>Explore the Program</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
            {[{id:"history",icon:"📜",label:"History"},{id:"thousand",icon:"🏀",label:"1,000 Club"},{id:"schedule",icon:"📅",label:"Schedule"},{id:"championships",icon:"🏆",label:"Championships"},{id:"league",icon:"🏫",label:"Central League"},{id:"alumni",icon:"🎓",label:"Alumni"},{id:"coaching",icon:"📋",label:"Staff"},{id:"records",icon:"📊",label:"Records"},{id:"photos",icon:"📸",label:"Photos"},{id:"videos",icon:"🎬",label:"Videos"},{id:"kobe",icon:"♠",label:"Kobe"},{id:"social",icon:"📱",label:"Follow Us"}].map(card => (
              <button key={card.id} onClick={() => goTo(card.id)} style={{ padding:"18px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, cursor:"pointer", color:"#fff", textAlign:"center", transition:"all 0.2s", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(132,0,54,0.18)"; e.currentTarget.style.borderColor="rgba(132,0,54,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
                <span style={{ fontSize:22 }}>{card.icon}</span>
                <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:1.5, textTransform:"uppercase" }}>{card.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
