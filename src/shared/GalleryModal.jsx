import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const PAGE = 60;

// A full game album on our own page. The photo list comes from
// /gallery-data/<slug>.json (built by a script from Tom Weishaar's public
// albums); the pictures themselves load from his SmugMug.
//   album: { title, date, url }  where url ends in the album slug
const slugOf = (album) => album.url.replace(/\/$/, "").split("/").pop();
const src = (base, [key, file, small, big, code], large) =>
  `${base}i-${key}/0/${large ? big : small}/${large ? code : "S"}/${file}-${large ? code : "S"}.jpg`;

export default function GalleryModal({ album, onClose }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [at, setAt] = useState(null); // index of the photo open full screen

  useEffect(() => {
    if (!album) return;
    setData(null); setFailed(false); setShown(PAGE); setAt(null);
    let live = true;
    fetch(`/gallery-data/${slugOf(album)}.json`).then(r => { if (!r.ok) throw new Error("missing"); return r.json(); })
      .then(d => { if (live) setData(d); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [album]);

  const total = data ? data.photos.length : 0;
  const step = useCallback((n) => setAt(i => (i == null ? i : Math.min(total - 1, Math.max(0, i + n)))), [total]);

  useEffect(() => {
    if (!album) return;
    const onKey = (e) => {
      if (e.key === "Escape") { if (at != null) setAt(null); else onClose(); }
      if (at != null && e.key === "ArrowRight") step(1);
      if (at != null && e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [album, at, onClose, step]);

  if (!album) return null;
  const navBtn = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 22, cursor: "pointer" };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={album.title} style={{ position: "fixed", inset: 0, zIndex: 100000, background: "#0a0006", overflowY: "auto", color: "#fff" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 14, padding: "12px clamp(12px,3vw,24px)", background: "rgba(10,0,6,0.94)", borderBottom: "1px solid rgba(201,164,74,0.25)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: OSW, fontSize: "clamp(16px,2.6vw,22px)", fontWeight: 600, lineHeight: 1.2 }}>{album.title}</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            {[album.date, total ? `${total} photos` : "", "Photos by Tom Weishaar"].filter(Boolean).join(" · ")}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" autoFocus style={{ flexShrink: 0, fontFamily: OSW, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#fff", background: "rgba(132,0,54,0.5)", border: "1px solid rgba(201,164,74,0.5)", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}>Close ✕</button>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px clamp(8px,2vw,20px) 60px" }}>
        {failed && <p style={{ fontFamily: SANS, color: "rgba(255,255,255,0.7)" }}>These photos could not be loaded right now. <a href={album.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>Open the album on Tom's site ›</a></p>}
        {!data && !failed && <p style={{ fontFamily: SANS, color: "rgba(255,255,255,0.5)" }}>Loading photos…</p>}
        {data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(46vw,220px),1fr))", gap: 6 }}>
              {data.photos.slice(0, shown).map((p, i) => (
                <button key={p[0]} onClick={() => setAt(i)} aria-label={`Open photo ${i + 1}`} style={{ padding: 0, border: "none", background: "#16000c", cursor: "zoom-in", aspectRatio: "3 / 2", overflow: "hidden", borderRadius: 4 }}>
                  <img src={src(data.base, p, false)} alt="" loading="lazy" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
            {shown < total && (
              <div style={{ textAlign: "center", marginTop: 22 }}>
                <button onClick={() => setShown(n => n + PAGE)} style={{ fontFamily: OSW, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#1a0010", background: "var(--gold)", border: "none", borderRadius: 8, padding: "13px 26px", cursor: "pointer" }}>Show more ({total - shown} left)</button>
              </div>
            )}
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 26 }}>
              Photos by Tom Weishaar. <a href={album.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", textDecoration: "none" }}>Download full size from his album ›</a>
            </p>
          </>
        )}
      </div>

      {data && at != null && (
        <div onClick={() => setAt(null)} style={{ position: "fixed", inset: 0, zIndex: 3, background: "rgba(0,0,0,0.97)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img key={data.photos[at][0]} src={src(data.base, data.photos[at], true)} alt="" referrerPolicy="no-referrer" onClick={e => e.stopPropagation()} style={{ maxWidth: "96vw", maxHeight: "90vh", objectFit: "contain", cursor: "default" }} />
          <button onClick={e => { e.stopPropagation(); setAt(null); }} aria-label="Close photo" style={{ ...navBtn, top: 34, right: 14 }}>✕</button>
          {at > 0 && <button onClick={e => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" style={{ ...navBtn, left: 10 }}>‹</button>}
          {at < total - 1 && <button onClick={e => { e.stopPropagation(); step(1); }} aria-label="Next photo" style={{ ...navBtn, right: 10 }}>›</button>}
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontFamily: OSW, fontSize: 13, letterSpacing: 1, color: "rgba(255,255,255,0.6)" }}>{at + 1} / {total} · Photo: Tom Weishaar</div>
        </div>
      )}
    </div>,
    document.body
  );
}
