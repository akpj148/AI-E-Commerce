// Simple in-memory data store for demo purposes.
// Replace with a real database (e.g., Postgres, MySQL, MongoDB) in production.
export const db = {
  users: [], // {id, email, passwordHash, name, role:'buyer'|'seller', country, address, preferences:{}}
  products: [
    {
      id: "p1",
      title: "UltraTech Laptop X1",
      description: "Powerful laptop for developers and gamers.",
      price: 1299.99,
      currency: "USD",
      image: "/placeholders/laptop.png",
      sellerId: "seed-seller-1",
      discounted: true,
      discountPercent: 10
    },
    {
      id: "p2",
      title: "Noise-Cancelling Headphones",
      description: "Immersive sound for work and play.",
      price: 199.99,
      currency: "USD",
      image: "/placeholders/headphones.png",
      sellerId: "seed-seller-1",
      discounted: false
    },
    {
      id: "p3",
      title: "RGB KEYBOARD ULTRA v1209”",
      description: "Crisp visuals, perfect for creators.",
      price: 349.0,
      currency: "USD",
      image: "/placeholders/keyboard.png",
      sellerId: "seed-seller-2",
      discounted: true,
      discountPercent: 15
    },
    {
      id: "p4",
      title: "LED Laptop v129 i6”",
      description: "Laptop with rtg2923 and util i6, perfect for work and editing with long lasting battery",
      price: 1200.0,
      currency: "USD",
      image: "/placeholders/laptop5.png",
      sellerId: "seed-seller-3",
      discounted: true,
      discountPercent: 10
    }
  ],
  orders: [] // {id, userId, items:[{productId, qty, priceAtPurchase}], total, payment:{method, fee, cardLast4?}, tracking:{status, history:[], eta, address}}
};
