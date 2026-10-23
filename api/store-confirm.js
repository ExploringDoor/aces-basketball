// Vercel Serverless Function — /api/store-confirm?oid=<id>
// The store-success page polls this after the customer returns from Stripe.
// Belt-and-suspenders with the webhook: if the order is still pending, verify with
// Stripe here and finalize it. Returns a receipt summary (no sensitive internals).

import { fbConfigured, fsGet } from './_firestore.js';
import { verifyStoreOrder, finalizeStoreOrderPaid } from './_finalize.js';

function safeId(id) { return /^[A-Za-z0-9_-]{1,128}$/.test(String(id || '')); }

function receipt(o, oid) {
  return {
    status: o.status,
    oid,
    date: o.paid_at || o.created || '',
    items: (o.items || []).map((i) => ({ name: i.name, color: i.color, size: i.size, qty: i.qty || 1, line_cents: i.line_cents })),
    amount_cents: o.amount_cents,
    card_last4: o.card_last4 || '',
    paid_via: o.paid_via || '',
    customer_email: o.customer_email || '',
    fulfillment: o.fulfillment || '',
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const oid = String((req.query && req.query.oid) || '').trim();
  if (!safeId(oid)) return res.status(400).json({ error: 'bad_oid' });
  if (!fbConfigured()) return res.status(503).json({ error: 'not_configured' });

  let order = await fsGet(`orders/${oid}`);
  if (!order) return res.status(404).json({ error: 'not_found' });

  if (order.status === 'paid') return res.status(200).json(Object.assign({ ok: true }, receipt(order, oid)));
  if (['canceled', 'refunded', 'error'].includes(order.status)) {
    return res.status(200).json(Object.assign({ ok: false }, receipt(order, oid)));
  }

  // Still pending — try to finalize now (the webhook is the primary path; this is backup).
  try {
    const v = await verifyStoreOrder(order);
    if (v.paid) {
      const merged = await finalizeStoreOrderPaid(oid, order, v.patch);
      return res.status(200).json(Object.assign({ ok: true }, receipt(merged, oid)));
    }
  } catch (e) { /* inconclusive — report still pending */ }

  return res.status(200).json({ ok: false, status: 'pending', oid });
}
