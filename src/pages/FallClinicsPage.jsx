// pages/FallClinicsPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Icon } from "../shared";

// EDIT THESE with your real clinics. `id` must stay unique.
const clinics = [
  {
    id: "little-aces",
    name: "Little Aces",
    level: "Introductory",
    grades: "Grades K–2",
    dates: "Saturdays · Oct 4 – Nov 15",
    time: "10:00 – 11:00 AM",
    location: "Kobe Bryant Gymnasium",
    price: "$120",
    blurb: "A fun, high-energy intro to basketball. Fundamentals, games, and a whole lot of smiles for our youngest Aces.",
  },
  {
    id: "skills-academy",
    name: "Fall Skills Academy",
    level: "Skill Development",
    grades: "Grades 3–8",
    dates: "Sundays · Oct 5 – Nov 16",
    time: "9:00 – 10:30 AM",
    location: "Kobe Bryant Gymnasium",
    price: "$150",
    blurb: "Ball-handling, shooting mechanics, footwork, and finishing, taught by Aces coaches and players. Every rep with a purpose.",
    featured: true,
  },
  {
    id: "elite-guard",
    name: "Elite Guard Clinic",
    level: "Advanced",
    grades: "Grades 9–12",
    dates: "Wednesdays · Oct 8 – Nov 19",
    time: "6:00 – 8:00 PM",
    location: "Kobe Bryant Gymnasium",
    price: "$200",
    blurb: "High-level guard development for varsity-track players: pick-and-roll reads, shot creation, and game-speed decision making.",
  },
];

export default function FallClinicsPage() {
  const [form, setForm] = useState({ clinic: "", player: "", grade: "", parent: "", email: "", phone: "", notes: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const register = (clinicName) => {
    setForm((f) => ({ ...f, clinic: clinicName }));
    document.getElementById("clinic-register")?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = (e) => {
    e.preventDefault();
    const body =
      `Fall Clinic Registration%0D%0A%0D%0A` +
      `Clinic: ${form.clinic || "(not selected)"}%0D%0A` +
      `Player: ${form.player}%0D%0A` +
      `Grade: ${form.grade}%0D%0A` +
      `Parent/Guardian: ${form.parent}%0D%0A` +
      `Email: ${form.email}%0D%0A` +
      `Phone: ${form.phone}%0D%0A` +
      `Notes: ${form.notes}`;
    window.location.href = `mailto:aceshoops@gmail.com?subject=${encodeURIComponent("Fall Clinic Registration — " + (form.clinic || "Aces"))}&body=${body}`;
  };

  const field = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, outline: "none" };
  const label = { fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 6, display: "block" };

  return (
    <section id="clinics" style={{ background: "#0a0005", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>TRAIN</div>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Train With the Aces</div>
          <h2 className="section-title">Fall<br /><span style={{ color: "var(--gold)" }}>Clinics</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 680 }}>
            Train in the Kobe Bryant Gymnasium with Lower Merion coaches and players. Our fall clinics build fundamentals, confidence, and a love for the game. Spots are limited, register early.
          </p>
        </FadeIn>

        {/* Clinic cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 44 }}>
          {clinics.map((c, i) => (
            <FadeIn key={c.id} delay={i * 0.08}>
              <div style={{
                height: "100%", display: "flex", flexDirection: "column",
                background: c.featured ? "linear-gradient(135deg, rgba(132,0,54,0.22), rgba(0,0,0,0.5))" : "rgba(255,255,255,0.02)",
                border: c.featured ? "1px solid rgba(201,164,74,0.35)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "26px 24px",
              }}>
                {c.featured && <div style={{ alignSelf: "flex-start", padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.9)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Most Popular</div>}
                <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>{c.level}</div>
                <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 26, fontWeight: 700, textTransform: "uppercase", margin: "4px 0 4px" }}>{c.name}</h3>
                <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{c.grades}</div>
                <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 18px" }}>{c.blurb}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                  {[["calendar", c.dates], ["basketball", c.time], ["pin", c.location]].map(([ic, txt], j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "rgba(201,164,74,0.8)", flexShrink: 0 }}><Icon name={ic} size={16} /></span>
                      <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{txt}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 6 }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 30, fontWeight: 700, color: "var(--gold)" }}>{c.price}</div>
                  <button onClick={() => register(c.name)} style={{
                    fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
                    padding: "12px 22px", borderRadius: 8, cursor: "pointer", color: "#fff",
                    background: "var(--maroon)", border: "1px solid var(--maroon)", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(132,0,54,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                    Register
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Registration form */}
        <FadeIn>
          <div id="clinic-register" style={{ marginTop: 64, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,164,74,0.22)", borderRadius: 16, padding: "clamp(28px, 5vw, 44px)", scrollMarginTop: 100 }}>
            <div className="section-label" style={{ marginBottom: 8 }}><Spade size={14} color="#840036" /> Sign Up</div>
            <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px" }}>Register for a Clinic</h3>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 26px", maxWidth: 560, lineHeight: 1.7 }}>
              Fill this out and we'll confirm your spot and payment details by email. Questions? Reach us at aceshoops@gmail.com.
            </p>
            <form onSubmit={submit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div>
                  <label style={label}>Clinic</label>
                  <select value={form.clinic} onChange={set("clinic")} required style={{ ...field, appearance: "auto" }}>
                    <option value="" style={{ color: "#000" }}>Select a clinic…</option>
                    {clinics.map(c => <option key={c.id} value={c.name} style={{ color: "#000" }}>{c.name} ({c.grades})</option>)}
                  </select>
                </div>
                <div><label style={label}>Player Name</label><input value={form.player} onChange={set("player")} required style={field} /></div>
                <div><label style={label}>Player Grade</label><input value={form.grade} onChange={set("grade")} required style={field} /></div>
                <div><label style={label}>Parent / Guardian</label><input value={form.parent} onChange={set("parent")} required style={field} /></div>
                <div><label style={label}>Email</label><input type="email" value={form.email} onChange={set("email")} required style={field} /></div>
                <div><label style={label}>Phone</label><input value={form.phone} onChange={set("phone")} style={field} /></div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={label}>Anything we should know? (optional)</label>
                <textarea value={form.notes} onChange={set("notes")} rows={3} style={{ ...field, resize: "vertical" }} />
              </div>
              <button type="submit" style={{
                marginTop: 24, fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                padding: "14px 34px", borderRadius: 8, cursor: "pointer", color: "var(--gold)",
                background: "rgba(132,0,54,0.4)", border: "1px solid rgba(201,164,74,0.4)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(132,0,54,0.6)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(132,0,54,0.4)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.4)"; }}>
                Submit Registration
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
