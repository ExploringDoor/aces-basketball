import { useState, useRef } from "react";
import { Spade } from "./shared";

// Pages
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

// ── Page map ──────────────────────────────────────────────
const PAGES = {
  home:          null,
  history:       HistoryPage,
  thousand:      ThousandClubPage,
  schedule:      SchedulePage,
  championships: ChampionshipsPage,
  league:        CentralLeaguePage,
  alumni:        AlumniPage,
  coaching:      CoachingPage,
  roster:        RosterPage,
  records:       RecordBookPage,
  photos:        PhotosPage,
  videos:        VideosPage,
  kobe:          KobePage,
  social:        SocialPage,
};

// ── Nav structure ─────────────────────────────────────────
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

// ── Dropdown component ────────────────────────────────────
const DropdownMenu = ({ item, page, goTo }) => {
  const [open, setOpen] = useState(false);
  const isActive = item.children.some(c => c.id === page);
  return (
    <div style={{ position:"relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button style={{
        background:"none", border:"none",
        borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
        color: isActive ? "var(--gold)" : open ? "#fff" : "rgba(255,255,255,0.52)",
        fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:1.5,
        padding:"6px 10px", textTransform:"uppercase", transition:"all 0.2s",
        whiteSpace:"nowrap", cursor:"pointer", display:"flex", alignItems:"center", gap:5,
      }}>
        {item.label}
        <span style={{ fontSize:8, opacity:0.6, marginTop:1 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)",
          background:"rgba(10,0,5,0.98)", border:"1px solid rgba(132,0,54,0.4)",
          borderRadius:8, padding:"6px 0", minWidth:170,
          boxShadow:"0 12px 40px rgba(0,0,0,0.6)", zIndex:2000,
        }}>
          {item.children.map(child => (
            <button key={child.id} onClick={() => goTo(child.id)} style={{
              display:"block", width:"100%",
              background: page===child.id ? "rgba(132,0,54,0.25)" : "none",
              border:"none",
              color: page===child.id ? "var(--gold)" : "rgba(255,255,255,0.72)",
              padding:"10px 18px", textAlign:"left",
              fontFamily:"'Oswald',sans-serif", fontSize:12, letterSpacing:1.5,
              textTransform:"uppercase", cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
            }}
              onMouseEnter={e => { if (page!==child.id) { e.currentTarget.style.background="rgba(132,0,54,0.15)"; e.currentTarget.style.color="#fff"; }}}
              onMouseLeave={e => { if (page!==child.id) { e.currentTarget.style.background="none"; e.currentTarget.style.color="rgba(255,255,255,0.72)"; }}}>
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef                = useRef(null);

  const goTo = (id) => {
    setPage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PageComponent = PAGES[page];

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
      `}</style>

      {/* ── Navigation ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        background:"rgba(10,0,5,0.97)", backdropFilter:"blur(14px)",
        borderBottom:"1px solid rgba(132,0,54,0.3)",
        height:58, display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 4%",
      }}>
        {/* Logo */}
        <button onClick={() => goTo("home")} style={{ background:"none", border:"none", color:"#fff", display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
          <Spade size={18} color="#840036" />
          <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:700, letterSpacing:3 }}>ACES</span>
          <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:10, color:"rgba(255,255,255,0.36)", letterSpacing:2 }}>LOWER MERION</span>
        </button>

        {/* Desktop nav */}
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          {NAV.map((item, i) =>
            item.children
              ? <DropdownMenu key={i} item={item} page={page} goTo={goTo} />
              : <button key={item.id} onClick={() => goTo(item.id)} style={{
                  background:"none", border:"none",
                  borderBottom: page===item.id ? "2px solid var(--gold)" : "2px solid transparent",
                  color: page===item.id ? "var(--gold)" : "rgba(255,255,255,0.52)",
                  fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:1.5,
                  padding:"6px 10px", textTransform:"uppercase", transition:"all 0.2s",
                  whiteSpace:"nowrap", cursor:"pointer",
                }}
                  onMouseEnter={e => { if (page!==item.id) e.currentTarget.style.color="#fff"; }}
                  onMouseLeave={e => { if (page!==item.id) e.currentTarget.style.color="rgba(255,255,255,0.52)"; }}>
                  {item.label}
                </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background:"none", border:"none", color:"#fff", fontSize:22, paddingLeft:10, cursor:"pointer" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:"fixed", top:58, left:0, right:0, zIndex:999, background:"rgba(10,0,5,0.98)", borderBottom:"1px solid rgba(132,0,54,0.3)", padding:"8px 0", maxHeight:"80vh", overflowY:"auto" }}>
          {NAV.map((item, i) =>
            item.children
              ? <div key={i}>
                  <div style={{ padding:"10px 5% 4px", fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:3, color:"var(--gold)", textTransform:"uppercase" }}>{item.label}</div>
                  {item.children.map(child => (
                    <button key={child.id} onClick={() => goTo(child.id)} style={{ display:"block", width:"100%", background: page===child.id?"rgba(132,0,54,0.2)":"none", border:"none", color: page===child.id?"var(--gold)":"rgba(255,255,255,0.65)", padding:"11px 8%", textAlign:"left", fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
                      {child.label}
                    </button>
                  ))}
                </div>
              : <button key={item.id} onClick={() => goTo(item.id)} style={{ display:"block", width:"100%", background: page===item.id?"rgba(132,0,54,0.2)":"none", border:"none", color: page===item.id?"var(--gold)":"rgba(255,255,255,0.7)", padding:"13px 5%", textAlign:"left", fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:2, textTransform:"uppercase", cursor:"pointer" }}>
                  {item.label}
                </button>
          )}
        </div>
      )}

      {/* ── Page content ── */}
      <div ref={contentRef} style={{ paddingTop:58, minHeight:"100vh", background:"#0a0005" }}>
        {page === "home"
          ? <HomePage goTo={goTo} />
          : PageComponent && <PageComponent />
        }

        {/* Footer */}
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
