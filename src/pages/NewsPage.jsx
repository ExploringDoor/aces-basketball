// pages/NewsPage.jsx
import { useState } from "react";
import { FadeIn, Spade, Icon, news } from "../shared";
import { titleStories } from "../shared/titleStories";
import StoryModal from "../shared/StoryModal";

const ordered = [...news].sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0));

// Aces Newsletter sign-up. Posts to /api/newsletter; the hidden "website" field is
// a honeypot that people never see and bots fill in.
const OSW = "'Oswald',sans-serif";
const SANS = "'Source Sans 3',sans-serif";
const field = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, color: "#fff", padding: "12px 14px", fontFamily: SANS, fontSize: 15, outline: "none" };
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState("idle"); // idle, busy, done, error
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErr("Enter the email address you check."); return; }
    setState("busy"); setErr("");
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "subscribe", email: email.trim(), name: name.trim(), hp }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "failed");
      setState("done");
    } catch (x) {
      setState("idle");
      setErr(x.message === "slow_down" ? "Too many tries. Give it a minute." : x.message === "not_configured" ? "Sign-ups open soon." : "Couldn't sign you up. Check your connection and try again.");
    }
  };
  return (
    <div style={{ marginTop: 44, borderRadius: 16, border: "1px solid rgba(201,164,74,0.25)", background: "linear-gradient(135deg, rgba(132,0,54,0.22), rgba(10,0,5,0.4))", padding: "28px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <img src="/LM_Logo.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
          <span style={{ fontFamily: OSW, fontSize: 10, letterSpacing: 3, color: "var(--gold)", textTransform: "uppercase" }}>Aces Newsletter</span>
        </div>
        <h3 style={{ fontFamily: OSW, fontWeight: 700, fontSize: "clamp(22px,2.6vw,28px)", lineHeight: 1.15, textTransform: "uppercase", margin: "0 0 10px" }}>The Aces family newsletter</h3>
        <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.7, margin: 0 }}>Results, upcoming games, a player of the game and program news, right in your inbox during the season. No spam, unsubscribe any time.</p>
      </div>
      {state === "done" ? (
        <div style={{ fontFamily: SANS, fontSize: 16, color: "#fff", lineHeight: 1.6 }}>
          <div style={{ fontFamily: OSW, fontSize: 20, textTransform: "uppercase", letterSpacing: 1, color: "var(--gold)", marginBottom: 6 }}>You are on the list</div>
          Look for the Aces Newsletter from Lower Merion Aces Basketball. If it lands in a promotions or spam folder, drag it to your inbox once and it will stay there.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <input style={field} type="email" autoComplete="email" value={email} placeholder="Email address" onChange={(e) => setEmail(e.target.value)} required />
          <input style={field} type="text" autoComplete="name" value={name} placeholder="Your name (optional)" maxLength={60} onChange={(e) => setName(e.target.value)} />
          <div style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
          </div>
          <button type="submit" disabled={state === "busy"} style={{ fontFamily: OSW, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", padding: "13px 18px", borderRadius: 9, cursor: "pointer", border: "none", color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", fontWeight: 600, opacity: state === "busy" ? 0.7 : 1 }}>{state === "busy" ? "Signing you up" : "Sign me up"}</button>
          {err && <div style={{ fontFamily: SANS, fontSize: 13, color: "#f87171" }}>{err}</div>}
        </form>
      )}
    </div>
  );
}

export default function NewsPage() {
  const [selected, setSelected] = useState(null);

  const featured = ordered.find(p => p.featured) || ordered[0];
  const rest = ordered.filter(p => p.id !== featured?.id);

  return (
    <section id="news" style={{ background: "linear-gradient(180deg, #0a0a0a, #0d000a)", padding: "120px 5% 100px", minHeight: "100vh" , position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>NEWS</div>
      {/* mini-hero photo band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/crowd.jpg')", backgroundSize: "cover", backgroundPosition: "center 28%", pointerEvents: "none" }} />

      <StoryModal story={selected} onClose={() => setSelected(null)} />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Aces Nation</div>
          <h2 className="section-title">News &amp;<br /><span style={{ color: "var(--gold)" }}>Recaps</span></h2>
          <div className="divider" />
        </FadeIn>

        <FadeIn delay={0.08}><NewsletterSignup /></FadeIn>

        {/* Featured */}
        {featured && (
          <FadeIn delay={0.12}>
            <div onClick={() => setSelected(featured)} style={{
              marginTop: 20, borderRadius: 16, overflow: "hidden", cursor: "pointer",
              border: "1px solid rgba(201,164,74,0.25)",
              display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              background: "rgba(255,255,255,0.02)", transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ minHeight: 240, backgroundImage: `linear-gradient(120deg, rgba(10,0,5,0.35), rgba(10,0,5,0.05)), url(${featured.image || "/Lower_Merion_ACES_Bball_vs_Penncrest_02-10-2025-327.jpg"})`, backgroundSize: "cover", backgroundPosition: "center 25%" }} />
              <div style={{ padding: "34px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(132,0,54,0.35)", border: "1px solid rgba(201,164,74,0.35)", fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>Featured · {featured.category}</span>
                  <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{featured.date}</span>
                </div>
                <h3 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: "clamp(22px,2.8vw,30px)", lineHeight: 1.15, textTransform: "uppercase", margin: "0 0 12px" }}>{featured.title}</h3>
                <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 18px" }}>{featured.excerpt}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, color: "var(--gold)", textTransform: "uppercase" }}>
                  Read Story <Icon name="news" size={15} color="var(--gold)" />
                </span>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Grid of the rest */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginTop: 20 }}>
          {rest.map((post, i) => (
            <FadeIn key={post.id} delay={i * 0.06}>
              <div onClick={() => setSelected(post)} style={{
                height: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(132,0,54,0.5)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
                {post.image && (
                  <div style={{ height: 150, backgroundImage: `linear-gradient(180deg,transparent,rgba(10,0,5,0.5)), url(${post.image})`, backgroundSize: "cover", backgroundPosition: "center 25%" }} />
                )}
                <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(132,0,54,0.25)", border: "1px solid rgba(132,0,54,0.4)", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1.5, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>{post.category}</span>
                    <span style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{post.date}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 19, lineHeight: 1.2, margin: "0 0 10px" }}>{post.title}</h3>
                  <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{post.excerpt}</p>
                  <span style={{ marginTop: "auto", paddingTop: 16, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1.5, color: "rgba(201,164,74,0.75)", textTransform: "uppercase" }}>Read Story →</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Title game stories: our own recaps, with the original reporting credited inside */}
        <FadeIn>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 4, color: "var(--gold)", textTransform: "uppercase", marginTop: 64, marginBottom: 8 }}>Championship Stories</h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 22px" }}>The nights the Aces won it all, from 2025 back to Kobe's first league title in 1995.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {titleStories.map((post, i) => (
            <FadeIn key={post.id} delay={Math.min(i, 6) * 0.04}>
              <button onClick={() => setSelected(post)} style={{
                width: "100%", height: "100%", padding: 0, textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(201,164,74,0.5)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
                {post.image && <img src={post.image} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", objectPosition: "center 30%", display: "block", background: "#000" }} />}
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(132,0,54,0.3)", border: "1px solid rgba(201,164,74,0.35)", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 1.5, color: "var(--gold)", textTransform: "uppercase" }}>{post.category}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{post.date}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 18, lineHeight: 1.25, margin: "0 0 10px" }}>{post.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
                  <span style={{ marginTop: "auto", paddingTop: 16, fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1.5, color: "rgba(201,164,74,0.8)", textTransform: "uppercase" }}>Read Story ›</span>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
