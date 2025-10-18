import express from "express";
import { db } from "./memoryDB.js";
import { authRequired } from "./middleware.js";
import crypto from "node:crypto";

const router = express.Router();

// Helper to compute cash fee for international handling
const computeCashFee = (subtotal) => {
  // Example: 3% cross-border handling + flat $2.50
  const percent = 0.03 * subtotal;
  const flat = 2.5;
  return Number((percent + flat).toFixed(2));
};

// Create order
router.post("/", authRequired, (req, res) => {
  const { items, payment, shippingAddress } = req.body;
  // items: [{productId, qty}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Empty items" });
  if (!payment || !payment.method) return res.status(400).json({ error: "Missing payment method" });

  // Lookup products and compute totals
  let subtotal = 0;
  const normalized = items.map((i) => {
    const product = db.products.find((p) => p.id === i.productId);
    if (!product) throw new Error("Invalid product");
    const priceAtPurchase = product.discounted ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2)) : product.price;
    subtotal += priceAtPurchase * (i.qty || 1);
    return { productId: product.id, qty: i.qty || 1, priceAtPurchase };
  });

  // Cash fee is auto-added on the server to avoid tampering
  let fee = 0;
  let cardLast4;
  if (payment.method === "cash") {
    fee = computeCashFee(subtotal);
  } else if (payment.method === "card") {
    // Optional card info. Only save last4 for UX.
    if (payment.cardNumber) {
      cardLast4 = String(payment.cardNumber).slice(-4);
    }
  } else {
    return res.status(400).json({ error: "Unsupported payment method" });
  }

  const total = Number((subtotal + fee).toFixed(2));

  const order = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    items: normalized,
    subtotal: Number(subtotal.toFixed(2)),
    total,
    payment: { method: payment.method, fee, cardLast4 },
    shippingAddress: shippingAddress || "Not provided",
    createdAt: new Date().toISOString(),
    tracking: {
      status: "Processing",
      history: [{ ts: new Date().toISOString(), status: "Order received" }],
      // Fake ETA 6 days
      eta: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
      address: shippingAddress || "Unknown"
    }
  };

  db.orders.push(order);
  res.status(201).json(order);
});

// Get my orders
router.get("/mine", authRequired, (req, res) => {
  const orders = db.orders.filter((o) => o.userId === req.user.id);
  res.json(orders);
});

// Tracking by order id
router.get("/:id/tracking", authRequired, (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order.tracking);
});

export default router;