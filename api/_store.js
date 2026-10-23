// ─────────────────────────────────────────────────────────────────────────
// Lower Merion Aces — Team Store catalog + order validation.
// AUTHORITATIVE source of products and prices (in CENTS). The browser sends only
// {id,color,size,qty}; the server looks up the real price here so a tampered cart
// can never undercharge. Mirrors _clinic.js (expectedCents guard).
// Keep PRODUCTS in sync with the `products` array in src/pages/StorePage.jsx.
// ─────────────────────────────────────────────────────────────────────────

export const STORE = {
  currency: 'USD',
  title: 'Aces Team Store',
  fulfillment: 'Pickup at a clinic or team event — we confirm the details by email or text.',
};

export const PRODUCTS = {
  tee:        { name: 'Aces Nation Tee',  cents: 2500, colors: ['Maroon', 'Black', 'Sport Gray', 'White'], sizes: ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL'] },
  hoodie:     { name: 'Aces Hoodie',      cents: 4500, colors: ['Maroon', 'Black', 'Sport Gray'],          sizes: ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL'] },
  longsleeve: { name: 'Shooting Shirt',   cents: 3200, colors: ['Maroon', 'Black'],                        sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  snapback:   { name: 'Bulldog Snapback', cents: 2800, colors: ['Maroon', 'Black'],                        sizes: ['One Size'] },
  beanie:     { name: 'Winter Beanie',    cents: 2200, colors: ['Maroon', 'Black'],                        sizes: ['One Size'] },
  shorts:     { name: 'Practice Shorts',  cents: 3000, colors: ['Maroon', 'Black'],                        sizes: ['S', 'M', 'L', 'XL'] },
};

const MAX_UNITS = 50; // a sane per-order cap that also bounds the work

export function clip(v, n) { return String(v == null ? '' : v).slice(0, n); }

// Validate [{id,color,size,qty}] against the catalog.
// Returns { ok:true, items, total_cents, unit_count } or { ok:false, error }.
export function normalizeOrder(body) {
  const b = body || {};
  if (String(b.company || b.hp || '').trim()) return { ok: false, error: 'spam' }; // honeypot
  const raw = Array.isArray(b.items) ? b.items : [];
  if (!raw.length) return { ok: false, error: 'empty_cart' };
  if (raw.length > MAX_UNITS) return { ok: false, error: 'too_many_items' };

  const items = [];
  let units = 0;
  for (const it of raw) {
    const p = PRODUCTS[String((it && it.id) || '')];
    if (!p) return { ok: false, error: 'bad_item' };
    const color = clip(it.color, 40);
    const size = clip(it.size, 20);
    if (!p.colors.includes(color)) return { ok: false, error: 'bad_color' };
    if (!p.sizes.includes(size)) return { ok: false, error: 'bad_size' };
    let qty = parseInt(it.qty, 10);
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    if (qty > 20) qty = 20;
    units += qty;
    if (units > MAX_UNITS) return { ok: false, error: 'too_many_items' };
    items.push({ id: String(it.id), name: p.name, color, size, qty, cents: p.cents, line_cents: p.cents * qty });
  }
  const total_cents = items.reduce((n, i) => n + i.line_cents, 0);
  if (total_cents <= 0) return { ok: false, error: 'nothing_to_charge' };
  return { ok: true, items, total_cents, unit_count: units, currency: 'USD' };
}

// Short human summary (Stripe statement / admin lists).
export function orderSummary(order) {
  const items = Array.isArray(order && order.items) ? order.items : [];
  const units = items.reduce((n, i) => n + (i.qty || 1), 0);
  return `${STORE.title} — ${units} item${units === 1 ? '' : 's'}`;
}
