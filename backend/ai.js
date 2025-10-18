import express from "express";
import fetch from "node-fetch";
import { db } from "./memoryDB.js";

const router = express.Router();

const systemPrompt = `
You are TechGlobal Shop's AI assistant.
- The website is in early-stage beta; be supportive and transparent about that when it helps set expectations.
- Your job: explain tech products clearly and concisely, include the current price (with any discount), and recommend who each item is good for.
- If details are missing, say so briefly and suggest the user checks specs on the product page or contacts support later.
- Be polite, practical, and avoid overpromising. Keep answers helpful and short by default, with optional details if asked.
Output style guidelines:
- Prefer bullet points for product explanations.
- When discussing a product, include: What it is, Key features/specs (from context), Who it's for, Price (with discount if applicable).
`;

function finalPrice(p) {
  if (p.discounted) {
    return Number((p.price * (1 - (p.discountPercent || 0) / 100)).toFixed(2));
  }
  return Number(p.price.toFixed(2));
}

function formatProduct(p) {
  return `• ${p.title} — ${p.currency} ${finalPrice(p)}${p.discounted ? ` (−${p.discountPercent}% from ${p.currency} ${p.price.toFixed(2)})` : ""}
  About: ${p.description || "No description"}
  ID: ${p.id}`;
}

function selectCatalog({ productIds, query, limit = 12 }) {
  let products = db.products.slice();

  if (Array.isArray(productIds) && productIds.length) {
    const set = new Set(productIds);
    products = products.filter(p => set.has(p.id));
  } else if (typeof query === "string" && query.trim()) {
    const q = query.trim().toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  } else {
    // Default: prioritize discounted items, then others, capped
    products.sort((a, b) => {
      if (a.discounted && !b.discounted) return -1;
      if (!a.discounted && b.discounted) return 1;
      return a.title.localeCompare(b.title);
    });
  }

  return products.slice(0, limit);
}

/*
POST /api/ai/chat
Body:
{
  messages: [{role, content}...],
  model?: string,
  includeCatalog?: boolean,
  productIds?: [string],
  query?: string
}

Behavior:
- Always prepends a system prompt about TechGlobal and early-stage status.
- If includeCatalog is true (or productIds/query provided), attaches a compact "Catalog snapshot".
- Uses OpenAI if OPENAI_API_KEY is set; otherwise returns a safe echo.
*/
router.post("/chat", async (req, res) => {
  const { messages, model, includeCatalog = false, productIds, query } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages must be an array" });

  const apiKey = process.env.OPENAI_API_KEY || "";
  const useModel = model || process.env.AI_MODEL || "gpt-4o-mini";

  // Build catalog context if requested or if signals provided
  let catalogContext = "";
  if (includeCatalog || (productIds && productIds.length) || (query && query.trim())) {
    const selected = selectCatalog({ productIds, query });
    if (selected.length) {
      catalogContext =
        `Catalog snapshot (${selected.length} items):\n` +
        selected.map(formatProduct).join("\n");
    } else {
      catalogContext = "Catalog snapshot: No matching items found.";
    }
  }

  // Compose final messages to provider
  const incoming = messages.filter(m => m && typeof m.content === "string");
  const toSend = [
    { role: "system", content: systemPrompt.trim() },
    ...(catalogContext ? [{ role: "system", content: catalogContext }] : []),
    ...incoming
  ];

  // Fallback if no key provided
  if (!apiKey) {
    const reply = `AI placeholder (no API key). Model: "${useModel}".
Early-stage note: TechGlobal Shop is still in early beta, so some features are limited.
Your message(s): ${incoming.map(m => m.content).join(" | ")}
${catalogContext ? "\n" + catalogContext : ""}`;
    return res.json({ reply });
  }

  try {
    const oaiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: useModel,
        messages: toSend,
        temperature: 0.6
      })
    });

    const data = await oaiRes.json();
    if (!oaiRes.ok) {
      return res.status(502).json({ error: "AI provider error", details: data });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    return res.json({ reply, raw: data });
  } catch (e) {
    return res.status(500).json({ error: "AI provider error", details: String(e) });
  }
});

export default router;