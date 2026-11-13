import { useEffect } from "react";
import { createPortal } from "react-dom";

const SANS = "'Source Sans 3',sans-serif";
const OSW = "'Oswald',sans-serif";

// Full-screen story reader. Portaled to <body> so a page section's
// `isolation` can never trap it under the site menu.
// story: { title, category, date, image, body: [], sources: [] }
export default function StoryModal({ story, onClose }) {
  useEffect(() => {
    if (!story) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [story, onClose]);
  if (!story) return null;
  return createPortal(
    <div onClick={onClose} role="dialog" aria-modal="true" aria-label={story.title} style={{
      position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.92)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "clamp(12px,4vw,40px) clamp(10px,3vw,20px)", overflowY: "auto", cursor: "zoom-out",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))",
        border: "1px solid rgba(201,164,74,0.28)", borderRadius: 16,
        maxWidth: 760, width: "100%", overflow: "hidden", color: "#fff",
        boxShadow: "0 40px 90px rgba(0,0,0,0.7)", cursor: "default", position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" autoFocus style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff", borderRadius: "50%", width: 38, height: 38, fontSize: 16, cursor: "pointer",
        }}>✕</button>
        {story.image && <img src={story.image} alt="" style={{ width: "100%", maxHeight: "62vh", objectFit: "contain", display: "block", background: "#000" }} />}
        <div style={{ padding: "clamp(22px,4vw,32px) clamp(20px,4vw,36px) clamp(28px,4vw,40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            {story.category && <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(132,0,54,0.35)", border: "1px solid rgba(201,164,74,0.35)", fontFamily: OSW, fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>{story.category}</span>}
            {story.date && <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>{story.date}</span>}
          </div>
          <h2 style={{ fontFamily: OSW, fontWeight: 700, fontSize: "clamp(22px,3.4vw,34px)", lineHeight: 1.15, textTransform: "uppercase", margin: "0 0 20px" }}>{story.title}</h2>
          {(story.body || []).map((para, i) => (
            <p key={i} style={{ fontFamily: SANS, fontSize: 15.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.85, margin: "0 0 16px" }}>{para}</p>
          ))}
          {story.sources && story.sources.length > 0 && (
            <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontFamily: OSW, fontSize: 11, letterSpacing: 2.5, color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>Reporting from</div>
              {story.sources.map(src => (
                <a key={src.url} href={src.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", padding: "8px 0", fontFamily: SANS, fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{src.outlet}</span>{src.author ? `, ${src.author}` : ""}{src.date ? `, ${src.date}` : ""}
                  <span style={{ display: "block", color: "rgba(201,164,74,0.85)" }}>{src.headline} ›</span>
                </a>
              ))}
              <p style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "10px 0 0" }}>This recap was written by Aces Basketball from the reporting credited above. Tap a story to read the original.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
