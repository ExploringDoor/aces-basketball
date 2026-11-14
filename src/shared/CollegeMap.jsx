import { useEffect, useRef, useState, useMemo } from "react";
import { nextLevel } from "./nextLevel";
import { schoolSpots } from "./schoolSpots";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

// school -> players who played there (a player who transferred shows at each school)
function bySchool() {
  const map = {};
  nextLevel.forEach(p => p.college.split(",").map(s => s.trim()).forEach(s => {
    if (!schoolSpots[s]) return;
    (map[s] = map[s] || []).push(p);
  }));
  return Object.entries(map).map(([school, players]) => ({ school, players, spot: schoolSpots[school] }))
    .sort((a, b) => b.players.length - a.players.length || a.school.localeCompare(b.school));
}

export default function CollegeMap() {
  const schools = useMemo(bySchool, []);
  const box = useRef(null);
  const api = useRef(null);
  const [failed, setFailed] = useState(false);
  const missing = nextLevel.flatMap(p => p.college.split(",").map(s => s.trim())).filter(s => s && !schoolSpots[s] && !/NBA/.test(s));

  useEffect(() => {
    let map, dead = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (dead || !box.current) return;
        map = L.map(box.current, { scrollWheelZoom: false, attributionControl: true });
        // Free OpenStreetMap tiles, darkened with a CSS filter to match the site.
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18, className: "aces-dark-tiles",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        const markers = {};
        schools.forEach(({ school, players, spot }) => {
          const n = players.length;
          const size = 26 + Math.min(n, 5) * 5;
          const icon = L.divIcon({
            className: "aces-pin",
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#840036;border:2px solid #c9a44a;color:#fff;display:flex;align-items:center;justify-content:center;font:700 ${n > 1 ? 14 : 12}px Oswald,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.6)">${n}</div>`,
            iconSize: [size, size], iconAnchor: [size / 2, size / 2],
          });
          const html = `<div style="font-family:'Source Sans 3',sans-serif;min-width:180px"><div style="font:600 16px Oswald,sans-serif;color:#840036">${esc(school)}</div><div style="font-size:12px;color:#777;margin-bottom:6px">${esc(spot[2])}</div>${players.map(p => `<div style="font-size:14px;padding:2px 0"><b>${esc(p.name)}</b> ${esc(p.cls || "")}</div>`).join("")}</div>`;
          markers[school] = L.marker([spot[0], spot[1]], { icon, title: school, alt: `${school}, ${n} ${n === 1 ? "Ace" : "Aces"}` }).addTo(map).bindPopup(html);
        });
        const east = schools.filter(s => s.spot[1] > -90).map(s => [s.spot[0], s.spot[1]]);
        const all = schools.map(s => [s.spot[0], s.spot[1]]);
        map.fitBounds(east, { padding: [30, 30] });
        api.current = {
          showAll: () => map.fitBounds(all, { padding: [30, 30] }),
          showEast: () => map.fitBounds(east, { padding: [30, 30] }),
          open: (school) => { const m = markers[school]; if (!m) return; map.setView(m.getLatLng(), Math.max(map.getZoom(), 8)); m.openPopup(); },
        };
      } catch { if (!dead) setFailed(true); }
    })();
    return () => { dead = true; if (map) map.remove(); };
  }, [schools]);

  const btn = { fontFamily: OSW, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#fff", background: "rgba(132,0,54,0.4)", border: "1px solid rgba(201,164,74,0.45)", borderRadius: 8, padding: "8px 12px", cursor: "pointer" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h3 style={{ fontFamily: OSW, fontSize: 14, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", margin: 0 }}>Where Aces Played</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => api.current?.showEast()}>East Coast</button>
          <button style={btn} onClick={() => api.current?.showAll()}>Whole country</button>
        </div>
      </div>
      <style>{`.aces-dark-tiles{filter:invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.6)} .leaflet-container{background:#1a1a1a}`}</style>
      {failed ? (
        <p style={{ fontFamily: SANS, color: "rgba(255,255,255,0.6)" }}>The map could not load. The schools are listed below.</p>
      ) : (
        <div ref={box} role="region" aria-label="Map of colleges where Aces played" style={{ height: "clamp(340px,55vh,520px)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,164,74,0.3)", background: "#111" }} />
      )}
      <div style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "10px 0 12px" }}>{schools.length} schools. Tap a pin or a school to see who played there.</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {schools.map(s => (
          <button key={s.school} onClick={() => { api.current?.open(s.school); }} style={{
            fontFamily: SANS, fontSize: 13.5, color: "#fff", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "6px 12px", cursor: "pointer",
          }}>{s.school} <span style={{ color: "var(--gold)", fontFamily: OSW }}>{s.players.length}</span></button>
        ))}
      </div>
      {missing.length > 0 && <div style={{ display: "none" }} data-missing={missing.join("|")} />}
    </div>
  );
}
