import jwt from "jsonwebtoken";

export const authRequired = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const sellerOnly = (req, res, next) => {
  if (req.user?.role !== "seller") return res.status(403).json({ error: "Seller role required" });
  next();
};