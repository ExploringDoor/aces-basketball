// pages/StorePage.jsx
import { useState } from "react";
import { FadeIn, Spade, Icon } from "../shared";

// EDIT: products, prices, and colors. Orders email to aceshoops@gmail.com;
// swap `submitOrder` for a real checkout (Stripe / print-on-demand) later.
const COLORS = {
  Maroon: "#6e002d",
  Black: "#1c1c1f",
  "Sport Gray": "#b9b9bd",
  White: "#f1f0ec",
};
const products = [
  { id: "tee", name: "Aces Nation Tee", price: 25, colors: ["Maroon", "Black", "Sport Gray", "White"], sizes: ["YS", "YM", "YL", "S", "M", "L", "XL", "2XL"] },
  { id: "hoodie", name: "Aces Hoodie", price: 45, colors: ["Maroon", "Black", "Sport Gray"], sizes: ["YS", "YM", "YL", "S", "M", "L", "XL", "2XL"], featured: true },
  { id: "longsleeve", name: "Shooting Shirt", price: 32, colors: ["Maroon", "Black"], sizes: ["S", "M", "L", "XL", "2XL"] },
  { id: "snapback", name: "Bulldog Snapback", price: 28, colors: ["Maroon", "Black"], sizes: ["One Size"] },
  { id: "beanie", name: "Winter Beanie", price: 22, colors: ["Maroon", "Black"], sizes: ["One Size"] },
  { id: "shorts", name: "Practice Shorts", price: 30, colors: ["Maroon", "Black"], sizes: ["S", "M", "L", "XL"] },
];

const textOn = (colorName) => (colorName === "Sport Gray" || colorName === "White") ? "#2a0011" : "#fff";

export default function StorePage() {
  const [picks, setPicks] = useState({});   // productId -> {color, size}
  const [cart, setCart] = useState([]);     // {name, color, size, price}
  const [reviewing, setReviewing] = useState(false);

  const pick = (id, key, val) => setPicks(p => ({ ...p, [id]: { ...p[id], [key]: val } }));
  const getPick = (prod) => ({ color: picks[prod.id]?.color || prod.colors[0], size: picks[prod.id]?.size || prod.sizes[0] });
  const addToCart = (prod) => {
    const { color, size } = getPick(prod);
    setCart(c => [...c, { name: prod.name, color, size, price: prod.price }]);
  };
  const total = cart.reduce((n, i) => n + i.price, 0);

  const submitOrder = () => {
    const lines = cart.map((i, n) => `${n + 1}. ${i.name} — ${i.color}, ${i.size} — $${i.price}`).join("%0D%0A");
    const body = `Aces Team Store Order%0D%0A%0D%0A${lines}%0D%0A%0D%0ATotal: $${total}%0D%0A%0D%0AName:%0D%0APhone:%0D%0APickup or delivery notes:`;
    window.location.href = `mailto:aceshoops@gmail.com?subject=${encodeURIComponent("Team Store Order ($" + total + ")")}&body=${body}`;
  };

  return (
    <section id="store" style={{ background: "#0a0005", padding: "120px 5% 140px", minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div className="ghost-word" style={{ top: 110, transform: "none", left: "auto", right: "-2%" }}>THE SHOP</div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380, zIndex: -1, backgroundImage: "linear-gradient(180deg, rgba(74,0,30,0.42) 0%, rgba(10,0,5,0.72) 52%, rgba(10,0,5,1) 96%), url('/ig/seniors.jpg')", backgroundSize: "cover", backgroundPosition: "center 22%", pointerEvents: "none" }} />

      {/* Review order modal */}
      {reviewing && (
        <div onClick={() => setReviewing(false)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto", cursor: "zoom-out" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(135deg,rgba(26,0,14,0.99),rgba(10,0,5,0.99))", border: "1px solid rgba(201,164,74,0.35)", borderRadius: 16, maxWidth: 520, width: "100%", padding: "32px", cursor: "default", position: "relative" }}>
            <button onClick={() => setReviewing(false)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "50%", width: 34, height: 34, fontSize: 16, cursor: "pointer" }}>✕</button>
            <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 700, textTransform: "uppercase", margin: "0 0 18px" }}>Your Order</h3>
            {cart.map((i, n) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS[i.color], border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{i.name} · {i.color} · {i.size}</span>
                <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, color: "var(--gold)" }}>${i.price}</span>
                <button onClick={() => setCart(c => c.filter((_, x) => x !== n))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 15 }}>✕</button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 4px", fontFamily: "'Oswald',sans-serif", fontSize: 18 }}>
              <span style={{ textTransform: "uppercase", letterSpacing: 2 }}>Total</span>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>${total}</span>
            </div>
            <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "10px 0 20px" }}>
              Submitting opens an email to the program with your order. We confirm sizing, payment, and pickup by reply. Every purchase supports the Aces booster fund.
            </p>
            <button onClick={submitOrder} disabled={cart.length === 0} style={{ width: "100%", fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", padding: "15px", borderRadius: 10, cursor: "pointer", color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", border: "none", opacity: cart.length ? 1 : 0.4 }}>
              Send Order
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div className="section-label"><Spade size={14} color="#840036" /> Rep the Aces</div>
          <h2 className="section-title">Team<br /><span style={{ color: "var(--gold)" }}>Store</span></h2>
          <div className="divider" />
          <p style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 20, lineHeight: 1.8, maxWidth: 640 }}>
            Official Aces spirit wear for players, families, and fans. Pick your gear, send the order, and we handle the rest. Every purchase supports the program.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16, marginTop: 44 }}>
          {products.map((prod, i) => {
            const { color, size } = getPick(prod);
            return (
              <FadeIn key={prod.id} delay={i * 0.06} className="h100">
                <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: prod.featured ? "1px solid rgba(201,164,74,0.35)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.45)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Garment print preview */}
                  <div style={{ height: 190, background: `linear-gradient(160deg, ${COLORS[color]}, ${COLORS[color]}dd)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s ease", position: "relative" }}>
                    {prod.featured && <div style={{ position: "absolute", top: 12, left: 12, padding: "3px 12px", borderRadius: 20, background: "rgba(201,164,74,0.95)", color: "#1a0010", fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>Fan Favorite</div>}
                    <img src="/Bulldog.png" alt="" style={{ height: 84, width: "auto", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))" }} />
                    <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 4, color: textOn(color), textTransform: "uppercase" }}>Aces Nation</div>
                  </div>

                  <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <h3 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 19, fontWeight: 600, textTransform: "uppercase", margin: 0 }}>{prod.name}</h3>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>${prod.price}</span>
                    </div>

                    {/* Colors */}
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      {prod.colors.map(c => (
                        <button key={c} title={c} onClick={() => pick(prod.id, "color", c)} style={{ width: 22, height: 22, borderRadius: "50%", cursor: "pointer", background: COLORS[c], border: c === color ? "2px solid var(--gold)" : "2px solid rgba(255,255,255,0.25)", boxShadow: c === color ? "0 0 0 2px rgba(201,164,74,0.25)" : "none" }} />
                      ))}
                      <span style={{ marginLeft: 4, alignSelf: "center", fontFamily: "'Source Sans 3',sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{color}</span>
                    </div>

                    {/* Sizes */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, marginBottom: 18 }}>
                      {prod.sizes.map(s => (
                        <button key={s} onClick={() => pick(prod.id, "size", s)} style={{ padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: 1, background: s === size ? "rgba(132,0,54,0.45)" : "rgba(255,255,255,0.04)", border: s === size ? "1px solid rgba(201,164,74,0.5)" : "1px solid rgba(255,255,255,0.1)", color: s === size ? "var(--gold)" : "rgba(255,255,255,0.55)" }}>{s}</button>
                      ))}
                    </div>

                    <button onClick={() => addToCart(prod)} style={{ marginTop: "auto", width: "100%", fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", padding: "12px", borderRadius: 8, cursor: "pointer", color: "#fff", background: "var(--maroon)", border: "1px solid var(--maroon)", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(132,0,54,0.5)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
                      Add to Order
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 10, fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          <span style={{ color: "rgba(201,164,74,0.8)" }}><Icon name="heart" size={16} /></span>
          Every purchase supports the Lower Merion Basketball booster fund.
        </div>
      </div>

      {/* Floating cart bar */}
      {cart.length > 0 && (
        <div style={{ position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)", zIndex: 2500, display: "flex", alignItems: "center", gap: 16, background: "rgba(8,0,4,0.97)", border: "1px solid rgba(201,164,74,0.45)", borderRadius: 40, padding: "10px 12px 10px 22px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: 1.5, color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {cart.length} {cart.length === 1 ? "item" : "items"} · <span style={{ color: "var(--gold)", fontWeight: 700 }}>${total}</span>
          </span>
          <button onClick={() => setReviewing(true)} style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", padding: "11px 24px", borderRadius: 24, cursor: "pointer", color: "#1a0010", background: "linear-gradient(135deg, #c9a44a, #b3873a)", border: "none", whiteSpace: "nowrap" }}>
            Review & Order
          </button>
        </div>
      )}
    </section>
  );
}
