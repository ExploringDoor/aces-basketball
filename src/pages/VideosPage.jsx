// pages/VideosPage.jsx
import { FadeIn, SpadeIcon } from "../shared";

const videos = [
  { id: "12WUvT4kHs3ZhTdz8OmrqoDYdwKPvHwVs", title: "2022–2023 LM Season Highlights", season: "2022-23 Season" },
];

export default function VideosPage() {
  return (
    <section id="videos" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><SpadeIcon size={14} color="#840036" /> Film Room</div>
          <h2 className="section-title">Aces<br /><span style={{ color: "var(--gold)" }}>Videos</span></h2>
          <div className="divider" />
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, marginTop: 48 }}>
          {videos.map((video, idx) => (
            <FadeIn key={idx} delay={idx * 0.08}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                  <iframe
                    src={`https://drive.google.com/file/d/${video.id}/preview`}
                    title={video.title}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="autoplay"
                  />
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase", marginBottom: 6 }}>{video.season}</div>
                  <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 500, letterSpacing: 1, margin: 0 }}>{video.title}</h3>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
