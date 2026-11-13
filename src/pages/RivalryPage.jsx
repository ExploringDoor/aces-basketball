import { useState } from "react";
import { FadeIn, Spade } from "../shared";
import { chesterGames } from "../shared/rivalry";
import { titleStories } from "../shared/titleStories";
import StoryModal from "../shared/StoryModal";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";

export default function RivalryPage() {
  const [story, setStory] = useState(null);
  return (
    <section id="rivalry" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>RIVALS</div>
      <StoryModal story={story} onClose={() => setStory(null)} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> The Rivalry</div>
          <h2 className="section-title">Aces vs.<br /><span style={{ color: "var(--gold)" }}>Chester</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: SANS, fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 680, margin: "18px 0 0" }}>
            No opponent has stood between Lower Merion and a championship more often. Since 1995 the Aces and the Clippers have met {chesterGames.filter(g => !/Regular|Classic/.test(g.event)).length} times in the district and state playoffs, at Villanova, at the Palestra and in the state final. All three of the program's modern state titles, in 1996, 2006 and 2013, went through Chester. The Inquirer traced the rivalry back to a 1943 district title game and had the Aces ahead 10-9 in postseason meetings after the 2024 win.
          </p>
        </FadeIn>

        <div style={{ marginTop: 44, position: "relative" }}>
          {chesterGames.map((g, i) => {
            const st = g.storyId ? titleStories.find(t => t.id === g.storyId) : null;
            return (
              <FadeIn key={g.date + g.event} delay={Math.min(i, 6) * 0.03}>
                <div style={{
                  display: "flex", gap: "clamp(12px,3vw,22px)", alignItems: "stretch", marginBottom: 10,
                  background: g.big ? (g.w ? "linear-gradient(120deg, rgba(132,0,54,0.4), rgba(0,0,0,0.35))" : "rgba(255,255,255,0.035)") : "rgba(255,255,255,0.02)",
                  border: g.big && g.w ? "1px solid rgba(201,164,74,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "clamp(14px,2.5vw,18px) clamp(14px,3vw,22px)",
                }}>
                  <div style={{ textAlign: "center", minWidth: 92, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontFamily: OSW, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: g.w ? "var(--gold)" : "rgba(255,255,255,0.4)" }}>{g.w ? "Aces win" : "Chester wins"}</div>
                    <div style={{ fontFamily: OSW, fontWeight: 700, fontSize: "clamp(26px,5vw,34px)", lineHeight: 1.1, color: g.w ? "#fff" : "rgba(255,255,255,0.6)" }}>{g.lm}-{g.them}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontFamily: OSW, fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.25 }}>{g.event}</div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{g.date}{g.place ? ` · ${g.place}` : ""}</div>
                    {g.note && <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, marginTop: 7 }}>{g.note}</div>}
                    {st && <button onClick={() => setStory(st)} style={{ alignSelf: "flex-start", marginTop: 9, padding: 0, background: "none", border: "none", cursor: "pointer", fontFamily: OSW, fontSize: 11, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase" }}>Read the story ›</button>}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginTop: 24 }}>
          These are the meetings we can document, from the program's published schedules and newspaper game stories. Scores list Lower Merion first. Know of one we are missing? Send it through the Support page.
        </p>
      </div>
    </section>
  );
}
