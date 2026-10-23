// Vercel Serverless Function — /api/store-checkout
// GET  → readiness probe: { ready, provider, fulfillment }
// POST → validate the cart against the authoritative catalog, save a PENDING order
//        to Firestore, create a Stripe hosted Checkout Session, and return { url, oid }.
//
// Stripe-only (the program runs on Stripe). Stripe collects the customer's email +
// phone at checkout; we store those on the order when the payment is finalized.
//
// Env (Vercel project settings — never in code):
//   PAYMENT_PROVIDER = "stripe", STRIPE_SECRET_KEY
//   Firestore: FIREBASE_PROJECT_ID, FIREBASE_API_KEY, FB_ADMIN_EMAIL, FB_ADMIN_PASSWORD
//   Optional: SITE_URL for redirect links

import { fbConfigured, fbAdminConfigured, fsCreate, fsPatch, fsPatchVerified } from './_firestore.js';
import { normalizeOrder, STORE } from './_store.js';

const PROVIDER = (process.env.PAYMENT_PROVIDER || '').toLowerCase();
function ready() {
  return PROVIDER === 'stripe' && !!process.env.STRIPE_SECRET_KEY && fbConfigured() && fbAdminConfigured();
}
function baseUrl(req) {
  if (process.env.SITE_URL) return String(process.env.SITE_URL).replace(/\/+$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

async function createStripeCheckout({ oid, order, base }) {
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  // A stale tab re-opened days later can't turn into a second charge.
  params.set('expires_at', String(Math.floor(Date.now() / 1000) + 60 * 60));
  params.set('success_url', `${base}/store-success.html?oid=${oid}`);
  params.set('cancel_url', `${base}/`);
  params.set('client_reference_id', oid);
  params.set('metadata[kind]', 'store_order');
  params.set('metadata[oid]', oid);
  params.set('payment_intent_data[metadata][kind]', 'store_order');
  params.set('payment_intent_data[metadata][oid]', oid);
  params.set('phone_number_collection[enabled]', 'true');
  order.items.forEach((it, i) => {
    params.set(`line_items[${i}][quantity]`, String(it.qty || 1));
    params.set(`line_items[${i}][price_data][currency]`, 'usd');
    params.set(`line_items[${i}][price_data][unit_amount]`, String(it.cents));
    params.set(`line_items[${i}][price_data][product_data][name]`, `${it.name} (${it.color}, ${it.size})`.slice(0, 240));
  });

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const d = await r.json();
  if (!r.ok || !d.url) throw new Error('stripe: ' + ((d.error && d.error.message) || ('http ' + r.status)));
  return { url: d.url, patch: { stripe_session_id: d.id, stripe_payment_intent: d.payment_intent || '' } };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ready: ready(), provider: PROVIDER || null, fulfillment: STORE.fulfillment });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // Authoritative validation + pricing — never trust the browser's prices.
  const norm = normalizeOrder(req.body || {});
  if (!norm.ok) return res.status(400).json({ error: norm.error });
  if (!ready()) return res.status(503).json({ error: 'not_configured' });

  const now = new Date().toISOString();
  const ip = String(req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0] || '').trim().slice(0, 60);

  // 1) Persist a PENDING order so we have a record even if the customer abandons checkout.
  const created = await fsCreate('orders', {
    kind: 'store_order',
    status: 'pending',
    payment_provider: PROVIDER,
    items: norm.items,
    unit_count: norm.unit_count,
    amount_cents: norm.total_cents,
    amount_refunded_cents: 0,
    currency: 'USD',
    fulfillment: STORE.fulfillment,
    created: now,
    order_ip: ip,
  });
  const oid = created && created.name ? String(created.name).split('/').pop() : null;
  if (!oid) return res.status(500).json({ error: 'save_failed' });

  // 2) Create the hosted Stripe checkout; persist the session id (the ONLY key that
  //    matches a real payment back to this order) with a verified write BEFORE handing
  //    out the URL, and fail closed if it can't be stored.
  try {
    const base = baseUrl(req);
    const out = await createStripeCheckout({ oid, order: norm, base });
    const w = await fsPatchVerified(`orders/${oid}`, Object.assign({ checkout_url: out.url }, out.patch || {}));
    if (!w.ok) {
      await fsPatch(`orders/${oid}`, { status: 'error', error_detail: 'link_persist_failed' });
      return res.status(503).json({ error: 'checkout_unavailable' });
    }
    return res.status(200).json({ url: out.url, oid });
  } catch (e) {
    await fsPatch(`orders/${oid}`, { status: 'error', error_detail: String(e.message || e).slice(0, 300) });
    return res.status(502).json({ error: 'checkout_failed' });
  }
}
