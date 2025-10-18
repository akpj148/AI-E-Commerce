import express from "express";
import { db } from "./memoryDB.js";
import { authRequired, sellerOnly } from "./middleware.js";
import crypto from "node:crypto";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(db.products);
});

router.get("/discounted", (req, res) => {
  res.json(db.products.filter((p) => p.discounted));
});

// Seller can create a product
router.post("/", authRequired, sellerOnly, (req, res) => {
  const { title, description, price, currency = "USD", image = "/placeholders/product.png", discounted = false, discountPercent = 0 } = req.body;
  if (!title || !price) return res.status(400).json({ error: "Missing title/price" });
  const product = {
    id: crypto.randomUUID(),
    title,
    description: description || "",
    price: Number(price),
    currency,
    image,
    sellerId: req.user.id,
    discounted: Boolean(discounted),
    discountPercent: Number(discountPercent) || 0
  };
  db.products.push(product);
  res.status(201).json(product);
});

export default router;


