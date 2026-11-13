import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { FadeIn, Spade, championships, seasonData, titlePhoto, titleName } from "../shared";
import { seasonTable, seasonRosters, seasonGames } from "../shared/seasons";
import { titleStories } from "../shared/titleStories";
import StoryModal from "../shared/StoryModal";
import GalleryModal from "../shared/GalleryModal";
import { tomGalleries } from "../shared/tomGalleries";
import { tomCovers } from "../shared/tomCovers";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const endYear = (season) => Number(season.slice(0, 4)) + 1;
const won = (kind, y) => (kind === "state" ? championships.state.map(c => Number(c.year)) : championships[kind].map(Number)).includes(y);

// One list of every season, newest first: this site's recent seasons, then the published history table.
function buildSeasons() {
  const fromTable = seasonTable.map(([season, record, league, district, state, coach]) => ({ season, record, league, district, state, coach }));
  const have = new Set(fromTable.map(s => s.season));
  const recent = Object.entries(seasonData)
    .filter(([season]) => !have.has(season))
    .map(([season, d]) => ({ season, record: `${d.wins}-${d.losses}`, league: `${d.confW}-${d.confL}`, district: "", state: "", coach: "Gregg Downer" }));
  const all = [...recent, ...fromTable];
  // seasons we only have game results for
  Object.keys(seasonGames).forEach(season => { if (!all.some(s => s.season === season)) all.push({ season, record: "", league: "", district: "", state: "", coach: "Gregg Downer" }); });
  return all.sort((a, b) => endYear(b.season) - endYear(a.season)).map(s => {
    const y = endYear(s.season);
    const titles = ["state", "district", "league"].filter(k => won(k, y));
    return { ...s, y, titles, roster: seasonRosters[y] || null, games: seasonGames[s.season] || null, stories: titleStories.filter(t => t.year === y), photo: titles.map(k => titlePhoto(k, y)).find(Boolean) || null };
  });
}

const chipStyle = (kind) => ({
  display: "inline-block", padding: "3px 9px", borderRadius: 20, fontFamily: OSW, fontSize: 9.5, letterSpacing: 1.2, textTransform: "uppercase", whiteSpace: "nowrap",
  background: kind === "state" ? "var(--gold)" : kind === "district" ? "rgba(201,164,74,0.16)" : "rgba(132,0,54,0.35)",
  color: kind === "state" ? "#1a0010" : kind === "district" ? "var(--gold)" : "#fff",
  border: kind === "league" ? "1px solid rgba(132,0,54,0.7)" : "1px solid rgba(201,164,74,0.55)",
});
const chipLabel = { state: "State", district: "District 1", league: "League" };

function TeamCard({ s, onClose, onStory }) {
  const [album, setAlbum] = useState(null);
  const albums = tomGalleries.filter(t => t.season === s.season);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !album) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, album]);
  const facts = [
    ["Overall", s.record], ["League", s.league], ["District 1 playoffs", s.district], ["State playoffs", s.state], ["Head coach", s.coach],
  ].filter(([, v]) => v);
  return createPortal(
    <>
    <GalleryModal album={album} onClose={() => setAlbum(null)} />
    <div onClick={onClose} role="dialog" aria-modal="true" aria-label={`${s.season} Aces`} style={{
      position: "fixed", inset: 0, zIndex: 99990, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "clamp(12px,4vw,40px) clamp(10px,3vw,20px)", overflowY: "auto", cursor: "zoom-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border: "1px solid rgba(201,164,74,0.28)", borderRadius: 16,
        maxWidth: 820, width: "100%", overflow: "hidden", color: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default", position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" autoFocus style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer" }}>✕</button>
        {s.photo && <img src={s.photo} alt={`${s.season} Lower Merion team`} style={{ width: "100%", maxHeight: "56vh", objectFit: "contain", display: "block", background: "#000" }} />}
        <div style={{ padding: "clamp(22px,4vw,32px) clamp(18px,4vw,34px) clamp(28px,4vw,38px)" }}>
          <div style={{ fontFamily: OSW, fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>Lower Merion Aces</div>
          <h2 style={{ fontFamily: OSW, fontWeight: 700, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, margin: "4px 0 12px" }}>{s.season}{s.record && <span style={{ color: "var(--gold)", marginLeft: 14 }}>{s.record}</span>}</h2>
          {s.titles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {s.titles.map(k => <span key={k} style={{ ...chipStyle(k), fontSize: 11, padding: "5px 12px" }}>{titleName[k]}</span>)}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            {facts.map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontFamily: OSW, fontSize: 9.5, letterSpacing: 1.5, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontFamily: OSW, fontSize: 18, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {s.stories.length > 0 && (
            <div style={{ marginTop: 22 }}>
              {s.stories.map(st => (
                <button key={st.id} onClick={() => onStory(st)} style={{ display: "block", width: "100%", textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", background: "linear-gradient(120deg, rgba(132,0,54,0.3), rgba(0,0,0,0.3))", border: "1px solid rgba(201,164,74,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ fontFamily: OSW, fontSize: 9.5, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase" }}>{st.category} · Read the story ›</div>
                  <div style={{ fontFamily: OSW, fontSize: 16, fontWeight: 600, marginTop: 3, lineHeight: 1.25 }}>{st.title}</div>
                </button>
              ))}
            </div>
          )}

          {albums.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: OSW, fontSize: 12, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", margin: "0 0 10px" }}>Photo albums</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
                {albums.map(t => {
                  const c = tomCovers[t.url.split("/").pop()];
                  return (
                    <button key={t.url} onClick={() => setAlbum(t)} style={{ padding: 0, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                      {c && <img src={c[1]} alt="" loading="lazy" referrerPolicy="no-referrer" style={{ width: "100%", aspectRatio: "3 / 2", objectFit: "cover", display: "block" }} />}
                      <div style={{ padding: "8px 10px 10px" }}>
                        <div style={{ fontFamily: OSW, fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{t.title}</div>
                        <div style={{ fontFamily: SANS, fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{c ? `${c[0]} photos` : t.date}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {s.roster && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: OSW, fontSize: 12, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", margin: "0 0 10px" }}>Roster</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "4px 14px" }}>
                {s.roster.map(([n, name, ht, pos, cls]) => (
                  <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: SANS, fontSize: 14 }}>
                    <span style={{ fontFamily: OSW, color: "var(--gold)", width: 24, textAlign: "right", flexShrink: 0 }}>{n}</span>
                    <span style={{ color: "#fff", flex: 1, minWidth: 0 }}>{name}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, whiteSpace: "nowrap" }}>{[pos, cls ? `'${String(cls).slice(-2)}` : ""].filter(Boolean).join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.games && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: OSW, fontSize: 12, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", margin: "0 0 10px" }}>Game by game</h3>
              {s.games.map(([m, d, y, opp, note, lm, them, r], i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: SANS, fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.45)", width: 52, flexShrink: 0, fontSize: 12.5 }}>{MON[m - 1]} {d}</span>
                  <span style={{ flex: 1, minWidth: 0, color: "#fff" }}>{opp}{note && <span style={{ color: "rgba(201,164,74,0.85)", fontSize: 12.5 }}> · {note}</span>}</span>
                  <span style={{ fontFamily: OSW, whiteSpace: "nowrap", color: r === "W" ? "#fff" : "rgba(255,255,255,0.5)" }}>
                    {r && <span style={{ color: r === "W" ? "var(--gold)" : "rgba(255,255,255,0.4)", marginRight: 8 }}>{r}</span>}
                    {lm != null ? `${lm}-${them}` : "score not listed"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!s.roster && !s.games && s.stories.length === 0 && albums.length === 0 && (
            <p style={{ fontFamily: SANS, fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "20px 0 0" }}>That is everything on record for this team so far. Have a roster, photo or program from this season? Send it through the Support page and we will add it.</p>
          )}
        </div>
      </div>
    </div>
    </>,
    document.body
  );
}

export default function SeasonsPage() {
  const seasons = useMemo(buildSeasons, []);
  const [open, setOpen] = useState(null);
  const [story, setStory] = useState(null);

  const decades = [];
  seasons.forEach(s => {
    const d = Math.floor(s.y / 10) * 10;
    let g = decades.find(x => x.d === d);
    if (!g) { g = { d, list: [] }; decades.push(g); }
    g.list.push(s);
  });

  return (
    <section id="seasons" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>SEASONS</div>
      {open && !story && <TeamCard s={open} onClose={() => setOpen(null)} onStory={setStory} />}
      <StoryModal story={story} onClose={() => setStory(null)} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Since 1921</div>
          <h2 className="section-title">Every<br /><span style={{ color: "var(--gold)" }}>Season</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 660, margin: "18px 0 0" }}>
            {seasons.length} Aces teams, newest first. Tap any season for that team's page: record, titles, and the roster, results and stories where we have them.
          </p>
        </FadeIn>

        {decades.map(g => (
          <div key={g.d} style={{ marginTop: 44 }}>
            <FadeIn><h3 style={{ fontFamily: OSW, fontSize: 14, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", margin: "0 0 12px" }}>{g.d}s</h3></FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 8 }}>
              {g.list.map(s => {
                const champ = s.titles.includes("state");
                return (
                  <button key={s.season} onClick={() => setOpen(s)} style={{
                    textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", width: "100%",
                    background: champ ? "linear-gradient(120deg, rgba(132,0,54,0.4), rgba(0,0,0,0.35))" : "rgba(255,255,255,0.03)",
                    border: champ ? "1px solid rgba(201,164,74,0.55)" : s.titles.length ? "1px solid rgba(201,164,74,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "12px 14px", transition: "transform 0.15s ease, border-color 0.15s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: OSW, fontSize: 18, fontWeight: 600, color: "#fff" }}>{s.season}</span>
                      <span style={{ fontFamily: OSW, fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>{s.record}</span>
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.coach}{s.league ? ` · ${s.league} league` : ""}</div>
                    {s.titles.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                        {s.titles.map(k => <span key={k} style={chipStyle(k)}>{chipLabel[k]}</span>)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 36 }}>
          Records through 2017-18 are from the program's own published history. The 1923-24 and 1924-25 seasons are not on record.
        </p>
      </div>
    </section>
  );
}
