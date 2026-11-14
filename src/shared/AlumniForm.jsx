// Alumni sign up. Former players tell us what they are doing now and can join
// the alumni list. Posts to /api/contact (topic "Alumni update"), which emails
// aceshoops@gmail.com with Reply-To set to the sender.
import { useState } from "react";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const field = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontFamily: SANS, fontSize: 16, outline: "none" };
const label = { display: "block", fontFamily: OSW, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 6, textAlign: "left" };
const THIS_YEAR = new Date().getFullYear();

export default function AlumniForm({ id }) {
  const [f, setF] = useState({ name: "", classYear: "", email: "", phone: "", played: "", message: "", alumniList: true, hp: "" });
  const [state, setState] = useState("idle"); // idle, busy, done
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const y = Number(f.classYear);
    if (f.name.trim().length < 2) return setErr("Please add your name.");
    if (!(y >= 1925 && y <= THIS_YEAR + 4)) return setErr("Please add the year you graduated, like 2013.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return setErr("Please add an email address we can reach you at.");
    if (f.message.trim().length < 5) return setErr("Tell us a little about what you are up to now.");
    setState("busy"); setErr("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, topic: "Alumni update" }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "failed");
      setState("done");
    } catch (x) {
      setState("idle");
      setErr(x.message === "slow_down" ? "Too many messages. Give it a few minutes." : "That didn't go through. Check your connection and try again.");
    }
  };

  return (
    <div id={id} style={{ padding: "clamp(26px,5vw,40px)", borderRadius: 16, background: "linear-gradient(135deg, rgba(132,0,54,0.22), rgba(0,0,0,0.35))", border: "1px solid rgba(201,164,74,0.3)", textAlign: "center", scrollMarginTop: 90 }}>
      <div style={{ fontFamily: OSW, fontSize: 11, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>Once an Ace, always an Ace</div>
      <div style={{ fontFamily: OSW, fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, textTransform: "uppercase", margin: "6px 0 10px" }}>Alumni, Check In</div>
      <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 24px" }}>
        Played for the Aces? Tell us where life has taken you. We will add you to the site and invite you to the alumni game and reunions.
      </p>
      {state === "done" ? (
        <div role="status" style={{ fontFamily: SANS, fontSize: 16, color: "#fff", lineHeight: 1.7, padding: "10px 0" }}>
          <div style={{ fontFamily: OSW, fontSize: 22, textTransform: "uppercase", letterSpacing: 1, color: "var(--gold)", marginBottom: 6 }}>Thanks, {f.name.trim().split(" ")[0]}!</div>
          Good to hear from you. The Aces will be in touch at {f.email.trim()}.
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14, maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <label><span style={label}>Your name</span><input style={field} autoComplete="name" maxLength={80} value={f.name} onChange={set("name")} /></label>
            <label><span style={label}>Class of</span><input style={field} inputMode="numeric" placeholder="2013" maxLength={4} value={f.classYear} onChange={set("classYear")} /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <label><span style={label}>Email</span><input style={field} type="email" autoComplete="email" maxLength={160} value={f.email} onChange={set("email")} /></label>
            <label><span style={label}>Phone (optional)</span><input style={field} type="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={set("phone")} /></label>
          </div>
          <label><span style={label}>Where you played after Lower Merion (optional)</span><input style={field} maxLength={200} placeholder="College, pro, club, or none" value={f.played} onChange={set("played")} /></label>
          <label><span style={label}>What you are up to now</span><textarea style={{ ...field, minHeight: 110, resize: "vertical" }} maxLength={4000} value={f.message} onChange={set("message")} /></label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", fontFamily: SANS, fontSize: 14.5, color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>
            <input type="checkbox" checked={f.alumniList} onChange={set("alumniList")} style={{ width: 18, height: 18, accentColor: "#c9a44a" }} />
            Add me to the alumni list for the alumni game and reunions
          </label>
          <div style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} /></label>
          </div>
          {err && <div role="alert" style={{ fontFamily: SANS, fontSize: 14, color: "#f87171" }}>{err}</div>}
          <button type="submit" disabled={state === "busy"} style={{ justifySelf: "center", fontFamily: OSW, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", padding: "13px 40px", borderRadius: 8, cursor: "pointer", border: "none", color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", fontWeight: 600, opacity: state === "busy" ? 0.7 : 1 }}>
            {state === "busy" ? "Sending" : "Check In"}
          </button>
        </form>
      )}
    </div>
  );
}
