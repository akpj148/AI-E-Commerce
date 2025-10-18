import express from "express";
import jwt from "jsonwebtoken";
import { db } from "./memoryDB.js";
import crypto from "node:crypto";

const router = express.Router();

const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

router.post("/register", (req, res) => {
  const { email, password, name, role = "buyer", country = "", address = "" } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
  if (!["buyer", "seller"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  if (db.users.find((u) => u.email === email)) return res.status(409).json({ error: "Email already in use" });

  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash: hash(password),
    name,
    role,
    country,
    address,
    preferences: { currency: "USD", darkMode: false }
  };
  db.users.push(user);
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email, name, role, country, address, preferences: user.preferences } });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email && u.passwordHash === hash(password));
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, country: user.country, address: user.address, preferences: user.preferences } });
});

export default router;