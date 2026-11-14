// pages/AlumniPage.jsx
import { useState } from "react";
import AlumniForm from "../shared/AlumniForm";
import { allTimeRoster } from "../shared/allTimeRoster";
import { FadeIn, Spade, Icon, Avatar, photoFor, alumniByName, alumni } from "../shared";

const rosterData = allTimeRoster;

const seasons = Object.keys(rosterData).sort((a, b) => b.localeCompare(a));

function SeasonAccordion({ season, players, onPlayerClick }) {
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
            <div key={i} onClick={() => p.college && onPlayerClick && onPlayerClick(p)} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 70px 60px 50px",
              padding: "9px 20px",
              background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              borderBottom: "1px solid rgba(255,255,255,0.025)",
              borderLeft: p.college ? "2px solid rgba(201,164,74,0.45)" : "2px solid transparent",
              cursor: p.college ? "pointer" : "default", transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (p.college) e.currentTarget.style.background = "rgba(132,0,54,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"; }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>{p.number || "—"}</div>
              <div>
                <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: p.college ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.65)", fontWeight: p.college ? 600 : 400 }}>
                  {p.first} {p.last}{p.college && <span style={{ color: "rgba(201,164,74,0.6)", marginLeft: 6, fontSize: 12 }}>›</span>}
                </span>
                {p.college && (
                  <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(201,164,74,0.85)", marginTop: 2, display:"flex", alignItems:"center", gap:5 }}>
                    <Icon name="grad" size={12} color="rgba(201,164,74,0.85)" stroke={1.7} /> {p.college}
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
  const [selected, setSelected] = useState(null);

  // Open a profile for a roster player (rich if they're a notable alum, else basic).
  const openPlayer = (p) => {
    const name = `${p.first} ${p.last}`;
    const known = alumniByName(name);
    if (known) { setSelected(known); return; }
    setSelected({
      name,
      classYear: p.grad ? `'${String(p.grad).slice(2)}` : "",
      college: p.college || "",
      photo: photoFor(name),
    });
  };

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
    <section style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none" }}>ALUMNI</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/seniors.jpg')", backgroundSize: "cover", backgroundPosition: "center 19%", pointerEvents: "none" }} />

      {/* Player profile modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.92)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px", overflowY:"auto", cursor:"zoom-out" }}>
          <style>{`@keyframes alumIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div onClick={e=>e.stopPropagation()} style={{ background:"linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border:`1px solid ${selected.highlight?"rgba(201,164,74,0.4)":"rgba(132,0,54,0.4)"}`, borderRadius:16, maxWidth:600, width:"100%", padding:"36px 34px 40px", boxShadow:"0 40px 90px rgba(0,0,0,0.7)", cursor:"default", animation:"alumIn 0.3s ease", position:"relative" }}>
            <button onClick={()=>setSelected(null)} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", borderRadius:"50%", width:34, height:34, fontSize:16, cursor:"pointer" }}>✕</button>
            <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:24, paddingRight:30 }}>
              <Avatar name={selected.name} photo={selected.photo} size={96} highlight={selected.highlight} rounded="14px" />
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:11, letterSpacing:3, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:4 }}>Class of {selected.classYear}</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26, fontWeight:700, color: selected.highlight?"var(--gold)":"#fff", lineHeight:1.1 }}>{selected.name}</div>
                <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                  {selected.pro?.includes("NBA") && <span style={{ padding:"2px 9px", background:"rgba(30,120,200,0.2)", border:"1px solid rgba(30,120,200,0.4)", borderRadius:12, fontFamily:"'Oswald',sans-serif", fontSize:9, letterSpacing:1, color:"#4a9eff", textTransform:"uppercase" }}>NBA</span>}
                  {selected.college && <span style={{ padding:"2px 9px", background:"rgba(201,164,74,0.12)", border:"1px solid rgba(201,164,74,0.3)", borderRadius:12, fontFamily:"'Oswald',sans-serif", fontSize:9, letterSpacing:1, color:"var(--gold)", textTransform:"uppercase" }}>College Player</span>}
                </div>
              </div>
            </div>
            {selected.stats && (
              <div style={{ background:"rgba(201,164,74,0.08)", border:"1px solid rgba(201,164,74,0.2)", borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color:"var(--gold)", textTransform:"uppercase", marginBottom:6 }}>Career Highlights</div>
                <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13.5, color:"rgba(255,255,255,0.78)", lineHeight:1.6 }}>{selected.stats}</div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {selected.college && (
                <div><span style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>College</span><div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.72)", marginTop:3 }}>{selected.college}</div></div>
              )}
              {selected.pro && (
                <div><span style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>Pro / Career</span><div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:14, color:"rgba(255,255,255,0.72)", marginTop:3 }}>{selected.pro}</div></div>
              )}
            </div>
            {selected.funFacts?.length > 0 && (
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:18, marginTop:18 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:10, letterSpacing:2, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:10 }}>Did You Know</div>
                {selected.funFacts.map((f,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                    <span style={{ color:"var(--gold)", flexShrink:0 }}>▸</span>
                    <span style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:13.5, color:"rgba(255,255,255,0.65)", lineHeight:1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
            <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Gold bar marks a college player &mdash; click any to view their profile</span>
          </div>
        </FadeIn>

        {/* Accordions */}
        {filteredSeasons.map(({ season, players }) => (
          <SeasonAccordion key={season} season={season} players={players} onPlayerClick={openPlayer} />
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
            <div className="divider" style={{ marginBottom: 8 }} />
            <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:24 }}>Click any player for their full profile, stats, and story.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {alumni.map((a, i) => (
                <div key={i} onClick={() => setSelected(a)} style={{
                  display:"flex", alignItems:"center", gap:14,
                  background: a.highlight ? "rgba(132,0,54,0.15)" : "rgba(255,255,255,0.02)",
                  border: a.highlight ? "1px solid rgba(201,164,74,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "14px 16px", cursor:"pointer", transition:"all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor = a.highlight ? "rgba(201,164,74,0.6)" : "rgba(132,0,54,0.5)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.borderColor = a.highlight ? "rgba(201,164,74,0.3)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow="none"; }}>
                  <Avatar name={a.name} photo={a.photo} size={54} highlight={a.highlight} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
                    <div style={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>Class of {a.classYear}</div>
                    <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap" }}>
                      {a.pro?.includes("NBA") && <span style={{ padding:"1px 7px", background:"rgba(30,120,200,0.2)", border:"1px solid rgba(30,120,200,0.4)", borderRadius:12, fontFamily:"'Oswald',sans-serif", fontSize:8.5, letterSpacing:1, color:"#4a9eff", textTransform:"uppercase" }}>NBA</span>}
                      {a.college && <span style={{ padding:"1px 7px", background:"rgba(201,164,74,0.12)", border:"1px solid rgba(201,164,74,0.3)", borderRadius:12, fontFamily:"'Oswald',sans-serif", fontSize:8.5, letterSpacing:1, color:"var(--gold)", textTransform:"uppercase" }}>College</span>}
                    </div>
                  </div>
                  <span style={{ color:"rgba(255,255,255,0.25)", fontSize:18, flexShrink:0 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <div style={{ marginTop: 64 }}><AlumniForm id="alumni-checkin" /></div>
      </div>
    </section>
  );
}
