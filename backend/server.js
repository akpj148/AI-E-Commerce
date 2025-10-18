import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import productRoutes from "./products.js";
import orderRoutes from "./orders.js";
import aiRoutes from "./ai.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Static placeholder images served from backend (for demo)
// In production, use a CDN/object storage.
app.use("/placeholders", express.static(new URL("./placeholders", import.meta.url).pathname, { index: false }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

//Note: Add a folder backend/placeholders with simple placeholder PNGs named laptop.png, headphones.png, monitor.png, product.png. Any small images will do.