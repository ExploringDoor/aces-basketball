import { useState, useRef, useEffect } from "react";
import { Spade } from "./shared";

import HomePage          from "./pages/HomePage";
import HistoryPage       from "./pages/HistoryPage";
import ThousandClubPage  from "./pages/ThousandClubPage";
import SchedulePage      from "./pages/SchedulePage";
import ChampionshipsPage from "./pages/ChampionshipsPage";
import CentralLeaguePage from "./pages/CentralLeaguePage";
import AlumniPage        from "./pages/AlumniPage";
import CoachingPage      from "./pages/CoachingPage";
import RosterPage        from "./pages/RosterPage";
import RecordBookPage    from "./pages/RecordBookPage";
import PhotosPage        from "./pages/PhotosPage";
import VideosPage        from "./pages/VideosPage";
import KobePage          from "./pages/KobePage";
import SocialPage        from "./pages/SocialPage";

const PAGES = {
  home: null, history: HistoryPage, thousand: ThousandClubPage,
  schedule: SchedulePage, championships: ChampionshipsPage,
  league: CentralLeaguePage, alumni: AlumniPage, coaching: CoachingPage,
  roster: RosterPage, records: RecordBookPage, photos: PhotosPage,
  videos: VideosPage, kobe: KobePage, social: SocialPage,
};

const NAV = [
  { id:"home", label:"Home" },
  { label:"Season", children:[
    { id:"schedule", label:"Schedule" },
    { id:"records",  label:"Record Book" },
  ]},
  { label:"History", children:[
    { id:"history",       label:"Program History" },
    { id:"championships", label:"Championships" },
    { id:"league",        label:"Central League" },
  ]},
  { label:"People", children:[
    { id:"thousand", label:"1,000 Club" },
    { id:"alumni",   label:"Alumni" },
    { id:"coaching", label:"Coaching Staff" },
  ]},
  { label:"More", children:[
    { id:"kobe",   label:"Kobe" },
    { id:"photos", label:"Photos" },
    { id:"videos", label:"Videos" },
    { id:"social", label:"Follow Us" },
  ]},
];

function spawnParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 40;
    p.style.cssText = `position:fixed;border-radius:50%;pointer-events:none;z-index:9999;left:${x}px;top:${y}px;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;background:${Math.random()>0.5?'#c9a44a':'rgba(220,80,80,0.9)'};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist-10}px;animation:navburst 0.6s ease-out ${Math.random()*0.08}s forwards`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

// ── Dropdown ──────────────────────────────────────────────
const Dropdown = ({ item, page, goTo, onTabHover, onTabLeave, btnRef }) => {
  const [open, setOpen] = useState(false);
  const isActive = item.children.some(c => c.id === page);

  return (
    <div style={{ position:"relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button
        ref={btnRef}
        onMouseEnter={() => onTabHover && onTabHover()}
        onMouseLeave={() => onTabLeave && onTabLeave()}
        style={{
          position:"relative", background:"none", border:"none",
          color: isActive ? "var(--gold)" : "rgba(255,255,255,0.32)",
          fontFamily:"'Oswald',sans-serif", fontSize:12,
          letterSpacing: isActive ? "2.8px" : "2px",
          padding:"0 24px", height:82, textTransform:"uppercase", cursor:"pointer",
          display:"flex", alignItems:"center", gap:6,
          transition:"color 0.25s, letter-spacing 0.25s",
          textShadow: isActive ? "0 0 18px rgba(201,164,74,0.7)" : "none",
          overflow:"hidden",
        }}>
        {/* Red sweep bg */}
        <span style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 50% 50%,rgba(200,0,60,0.8) 0%,rgba(132,0,54,0.5) 40%,transparent 70%)",
          opacity: open || isActive ? 1 : 0,
          transform: open || isActive ? "translateY(0)" : "translateY(100%)",
          transition:"opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents:"none",
        }} />
        <span style={{ position:"relative", zIndex:1, transition:"letter-spacing 0.25s, transform 0.25s", letterSpacing: open || isActive ? "2.8px" : "2px", transform: open || isActive ? "translateY(-1px)" : "none" }}>
          {item.label}
        </span>
        <span style={{ position:"relative", zIndex:1, fontSize:7, opacity: open ? 1 : 0.4, transform: open ? "rotate(180deg)" : "none", transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s" }}>▼</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:"absolute", top:"100%", left:"50%",
          transform:"translateX(-50%)",
          paddingTop:6,
          zIndex:2000, minWidth:180,
        }}>
          {/* Invisible bridge fills the gap so hover stays active */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:6 }} />
          <div style={{
            background:"rgba(8,0,4,0.97)", border:"1px solid rgba(132,0,54,0.5)",
            borderRadius:10, padding:"8px 0",
            boxShadow:"0 16px 50px rgba(0,0,0,0.7), 0 0 30px rgba(132,0,54,0.15)",
          }}>
          <div style={{ position:"absolute", top:1, left:"50%", width:10, height:10, background:"rgba(8,0,4,0.97)", borderLeft:"1px solid rgba(132,0,54,0.5)", borderTop:"1px solid rgba(132,0,54,0.5)", transform:"translateX(-50%) rotate(45deg)" }} />
          {item.children.map(child => (
            <button key={child.id} onClick={() => goTo(child.id)} style={{
              display:"block", width:"100%", background:"none", border:"none",
              color: page===child.id ? "var(--gold)" : "rgba(255,255,255,0.6)",
              fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:"1.5px",
              padding:"10px 20px", textAlign:"left", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.18s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.color="var(--gold)"; e.currentTarget.style.paddingLeft="26px"; e.currentTarget.style.background="rgba(132,0,54,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.color=page===child.id?"var(--gold)":"rgba(255,255,255,0.6)"; e.currentTarget.style.paddingLeft="20px"; e.currentTarget.style.background="none"; }}>
              {child.label}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const tabsRef = useRef(null);
  const gliderRef = useRef(null);
  // Store refs for each nav button
  const btnRefs = useRef({});

  const goTo = (id) => {
    setPage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PageComponent = PAGES[page];

  const moveGlider = (el, instant) => {
    if (!el || !gliderRef.current || !tabsRef.current) return;
    const cr = tabsRef.current.getBoundingClientRect();
    const tr = el.getBoundingClientRect();
    const left = tr.left - cr.left;
    const width = tr.width;
    if (instant) {
      gliderRef.current.style.transition = "none";
      gliderRef.current.style.left = left + "px";
      gliderRef.current.style.width = width + "px";
      requestAnimationFrame(() => {
        if (gliderRef.current) gliderRef.current.style.transition = "";
      });
    } else {
      gliderRef.current.style.left = left + "px";
      gliderRef.current.style.width = width + "px";
    }
  };

  const getActiveKey = (p) => {
    for (const item of NAV) {
      if (item.id === p) return item.id;
      if (item.children && item.children.some(c => c.id === p)) return item.label;
    }
    return "home";
  };

  const snapToActive = () => {
    const key = getActiveKey(page);
    const activeBtn = btnRefs.current[key];
    if (activeBtn) moveGlider(activeBtn);
  };

  useEffect(() => {
    setTimeout(() => {
      const key = getActiveKey(page);
      const activeBtn = btnRefs.current[key];
      if (activeBtn) moveGlider(activeBtn, true);
    }, 50);
  }, [page]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Oswald:wght@400;500;600;700;900&family=Source+Sans+3:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --maroon: #840036; --gold: #c9a44a; }
        body { background: #0a0005; color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0005; }
        ::-webkit-scrollbar-thumb { background: var(--maroon); border-radius: 3px; }
        table { border-collapse: collapse; }
        a, button { cursor: pointer; }
        @keyframes navburst {
          0% { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0); }
        }
        @keyframes navscan {
          0% { left:-60%; } 100% { left:160%; }
        }
        .desktop-nav { display: flex !important; align-items: center; }
        .hamburger { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>

      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        display:"flex", alignItems:"center", height:82, padding:"0 40px",
        background:"rgba(8,0,4,0.99)",
        borderBottom:"1px solid rgba(132,0,54,0.4)",
        boxShadow:"0 4px 40px rgba(0,0,0,0.5)",
      }}>
        {/* Scan line */}
        <div style={{ position:"absolute", top:0, left:"-60%", width:"50%", height:1, background:"linear-gradient(90deg,transparent,rgba(201,164,74,0.4),transparent)", animation:"navscan 5s ease-in-out infinite", pointerEvents:"none" }} />

        {/* Logo */}
        <button onClick={() => goTo("home")} style={{ background:"none", border:"none", display:"flex", alignItems:"center", gap:10, marginRight:32, flexShrink:0 }}>
          <img src="/LM_Logo.png" alt="LM" style={{ height:70, width:"auto", filter:"drop-shadow(0 0 6px rgba(132,0,54,0.6))", transition:"filter 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.filter="drop-shadow(0 0 12px rgba(132,0,54,0.9))"}
            onMouseLeave={e => e.currentTarget.style.filter="drop-shadow(0 0 6px rgba(132,0,54,0.6))"} />
          <div style={{ textAlign:"left" }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, fontWeight:700, letterSpacing:5, color:"#fff", lineHeight:1 }}>ACES</div>
            <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, letterSpacing:3, color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>Lower Merion</div>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="desktop-nav" ref={tabsRef}
          style={{ position:"relative" }}
          onMouseLeave={snapToActive}>

          {/* Glider */}
          <div ref={gliderRef} style={{
            position:"absolute", bottom:-1, height:3, borderRadius:"3px 3px 0 0",
            background:"linear-gradient(90deg,transparent,var(--gold),transparent)",
            boxShadow:"0 0 10px rgba(201,164,74,1),0 0 25px rgba(201,164,74,0.8),0 0 50px rgba(201,164,74,0.5)",
            transition:"left 0.25s cubic-bezier(0.34,1.2,0.64,1), width 0.25s cubic-bezier(0.34,1.2,0.64,1)",
            pointerEvents:"none", left:0, width:0,
          }} />

          {NAV.map((item, i) => {
            const isActive = item.id ? page === item.id : item.children?.some(c => c.id === page);

            if (item.children) {
              return (
                <Dropdown key={i} item={item} page={page} goTo={goTo}
                  btnRef={el => { if (el) btnRefs.current[item.label] = el; }}
                  onTabHover={() => moveGlider(btnRefs.current[item.label])}
                  onTabLeave={snapToActive}
                />
              );
            }

            return (
              <button key={item.id}
                ref={el => { if (el) btnRefs.current[item.id] = el; }}
                onClick={(e) => {
                  goTo(item.id);
                  const r = e.currentTarget.getBoundingClientRect();
                  spawnParticles(r.left + r.width / 2, r.bottom);
                }}
                onMouseEnter={(e) => moveGlider(e.currentTarget)}
                onMouseLeave={snapToActive}
                style={{
                  position:"relative", background:"none", border:"none",
                  color: isActive ? "var(--gold)" : "rgba(255,255,255,0.32)",
                  fontFamily:"'Oswald',sans-serif", fontSize:12,
                  letterSpacing: isActive ? "2.8px" : "2px",
                  padding:"0 24px", height:82, textTransform:"uppercase", cursor:"pointer",
                  transition:"color 0.25s, letter-spacing 0.25s",
                  textShadow: isActive ? "0 0 18px rgba(201,164,74,0.7)" : "none",
                  overflow:"hidden",
                }}>
                <span style={{
                  position:"absolute", inset:0,
                  background:"radial-gradient(ellipse at 50% 50%,rgba(200,0,60,0.8) 0%,rgba(132,0,54,0.5) 40%,transparent 70%)",
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateY(0)" : "translateY(100%)",
                  transition:"opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents:"none",
                }} />
                <span style={{ position:"relative", zIndex:1 }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer", padding:"0 4px", marginLeft:"auto" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:"fixed", top:82, left:0, right:0, zIndex:999, background:"rgba(8,0,4,0.98)", borderBottom:"1px solid rgba(132,0,54,0.3)", padding:"8px 0", maxHeight:"80vh", overflowY:"auto" }}>
          {NAV.map((item, i) =>
            item.children
              ? <div key={i}>
                  <div style={{ padding:"10px 5% 4px", fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:3, color:"var(--gold)", textTransform:"uppercase" }}>{item.label}</div>
                  {item.children.map(child => (
                    <button key={child.id} onClick={() => goTo(child.id)} style={{ display:"block", width:"100%", background:page===child.id?"rgba(132,0,54,0.2)":"none", border:"none", color:page===child.id?"var(--gold)":"rgba(255,255,255,0.65)", padding:"12px 8%", textAlign:"left", fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
                      {child.label}
                    </button>
                  ))}
                </div>
              : <button key={item.id} onClick={() => goTo(item.id)} style={{ display:"block", width:"100%", background:page===item.id?"rgba(132,0,54,0.2)":"none", border:"none", color:page===item.id?"var(--gold)":"rgba(255,255,255,0.7)", padding:"13px 5%", textAlign:"left", fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
                  {item.label}
                </button>
          )}
        </div>
      )}

      {/* Page content */}
      <div style={{ paddingTop:82, minHeight:"100vh", background:"#0a0005" }}>
        {page === "home" ? <HomePage goTo={goTo} /> : PageComponent && <PageComponent />}
        <footer style={{ background:"#050003", borderTop:"1px solid rgba(132,0,54,0.28)", padding:"44px 6%", textAlign:"center", marginTop:40 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, letterSpacing:4 }}>LOWER MERION ACES BASKETBALL</div>
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.32)", marginTop:7 }}>245 E. Montgomery Avenue · Ardmore, PA 19003</div>
          <div style={{ width:48, height:1, background:"rgba(132,0,54,0.38)", margin:"16px auto" }} />
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.24)" }}>7× PIAA State Champions · Est. 1911 · Home of the Kobe Bryant Gymnasium</div>
          <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"rgba(255,255,255,0.16)", marginTop:9 }}>© {new Date().getFullYear()} Lower Merion Aces Basketball</div>
        </footer>
      </div>
    </>
  );
}
