// "Get in touch" form. Posts to /api/contact, which emails aceshoops@gmail.com
// with Reply-To set to the sender. Used on the Support and Sponsors pages.
import { useState } from "react";

const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const TOPICS = ["Donating", "Volunteering", "Sponsorship", "General question"];
const field = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontFamily: SANS, fontSize: 15, outline: "none" };
const label = { display: "block", fontFamily: OSW, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 6, textAlign: "left" };

export default function ContactForm({ topic = "General question", title = "Get in Touch", blurb = "" }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", topic, message: "", hp: "" });
  const [state, setState] = useState("idle"); // idle, busy, done
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return setErr("Please add an email address we can reply to.");
    if (f.message.trim().length < 5) return setErr("Please write a short message.");
    setState("busy"); setErr("");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "failed");
      setState("done");
    } catch (x) {
      setState("idle");
      setErr(x.message === "slow_down" ? "Too many messages. Give it a few minutes." : "Your message didn't go through. Check your connection and try again.");
    }
  };

  return (
    <div style={{ padding: "clamp(26px,5vw,40px)", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,164,74,0.25)", textAlign: "center" }}>
      <div style={{ fontFamily: OSW, fontSize: 20, letterSpacing: 3, color: "var(--gold)", marginBottom: 10, textTransform: "uppercase" }}>{title}</div>
      {blurb && <p style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 24px" }}>{blurb}</p>}
      {state === "done" ? (
        <div role="status" style={{ fontFamily: SANS, fontSize: 16, color: "#fff", lineHeight: 1.7, padding: "10px 0" }}>
          <div style={{ fontFamily: OSW, fontSize: 22, textTransform: "uppercase", letterSpacing: 1, color: "var(--gold)", marginBottom: 6 }}>Thanks, {f.name.trim().split(" ")[0]}!</div>
          Your message is on its way to the Aces. We'll reply to {f.email.trim()}.
        </div>
      ) : (
        <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14, maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <label><span style={label}>Your name</span><input style={field} autoComplete="name" maxLength={80} value={f.name} onChange={set("name")} /></label>
            <label><span style={label}>Email</span><input style={field} type="email" autoComplete="email" maxLength={160} value={f.email} onChange={set("email")} /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            <label><span style={label}>Phone (optional)</span><input style={field} type="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={set("phone")} /></label>
            <label><span style={label}>This is about</span>
              <select style={{ ...field, appearance: "auto" }} value={f.topic} onChange={set("topic")}>
                {TOPICS.map((t) => <option key={t} value={t} style={{ color: "#000" }}>{t}</option>)}
              </select>
            </label>
          </div>
          <label><span style={label}>Message</span><textarea style={{ ...field, minHeight: 130, resize: "vertical" }} maxLength={4000} value={f.message} onChange={set("message")} /></label>
          <div style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} /></label>
          </div>
          {err && <div role="alert" style={{ fontFamily: SANS, fontSize: 14, color: "#f87171" }}>{err}</div>}
          <button type="submit" disabled={state === "busy"} style={{ justifySelf: "center", fontFamily: OSW, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", padding: "13px 40px", borderRadius: 8, cursor: "pointer", border: "none", color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", fontWeight: 600, opacity: state === "busy" ? 0.7 : 1 }}>
            {state === "busy" ? "Sending" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
