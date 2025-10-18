import express from "express";
import { db } from "./memoryDB.js";
import { authRequired } from "./middleware.js";

const router = express.Router();

router.get("/me", authRequired, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { id, email, name, role, country, address, preferences } = user;
  res.json({ id, email, name, role, country, address, preferences });
});

router.put("/me", authRequired, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { name, country, address, preferences } = req.body;
  if (name !== undefined) user.name = name;
  if (country !== undefined) user.country = country;
  if (address !== undefined) user.address = address;
  if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };
  const { id, email, role } = user;
  res.json({ id, email, name: user.name, role, country: user.country, address: user.address, preferences: user.preferences });
});

export default router;
