import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import process from "node:process";

// Initialize SQLite database stored in the project root folder
const dbPath = path.join(process.cwd(), "local.db");
export const db = new DatabaseSync(dbPath);

// Create tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    category TEXT NOT NULL,
    emoji TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_available INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    items TEXT NOT NULL, -- JSON string
    total_cents INTEGER NOT NULL,
    confession TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    payment_method TEXT,
    upi_id TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default menu items if the table is empty
const checkMenuStmt = db.prepare("SELECT COUNT(*) as count FROM menu_items");
const menuCount = (checkMenuStmt.get() as { count: number }).count;

if (menuCount === 0) {
  const insertMenuStmt = db.prepare(`
    INSERT INTO menu_items (id, name, description, price_cents, category, emoji, sort_order, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const initialItems = [
    {
      id: "70a6c2fa-6821-4f36-8a5e-2f5480436d93",
      name: "Slow-Drip Filter",
      description: "Single-origin beans, hand-poured over ice or hot. Clean, bright, and patient.",
      price_cents: 450,
      category: "drinks",
      emoji: "☕",
      sort_order: 1,
    },
    {
      id: "7c3bcbe0-5a3d-4c3e-908a-6b8de0ee88ef",
      name: "Brown Sugar Latte",
      description: "Double espresso, slow-cooked dark brown sugar syrup, creamy oat milk.",
      price_cents: 550,
      category: "drinks",
      emoji: "🥛",
      sort_order: 2,
    },
    {
      id: "5b5c92c5-5de8-48b8-b80c-a4962e245a90",
      name: "Short Macchiato",
      description: "A bold double shot of espresso stained with a dollop of warm milk foam.",
      price_cents: 350,
      category: "drinks",
      emoji: "⚡",
      sort_order: 3,
    },
    {
      id: "e44c688c-7cb0-4fde-ba46-0bde23630f9a",
      name: "Cardamom Bun",
      description: "Freshly baked Swedish-style bun, spiced with crushed cardamom and pearl sugar.",
      price_cents: 450,
      category: "baked",
      emoji: "🥨",
      sort_order: 4,
    },
    {
      id: "fa320ce8-095a-4712-ba2e-4b2a95c89ad0",
      name: "Almond Croissant",
      description: "Flaky twice-baked croissant filled with rich frangipane and topped with sliced almonds.",
      price_cents: 500,
      category: "baked",
      emoji: "🥐",
      sort_order: 5,
    },
    {
      id: "c6a28de4-325b-4395-8853-29406085a6cf",
      name: "Dark Chocolate Cookie",
      description: "Thick, soft-baked cookie with 70% dark chocolate chunks and Maldon sea salt.",
      price_cents: 300,
      category: "baked",
      emoji: "🍪",
      sort_order: 6,
    },
  ];

  for (const item of initialItems) {
    insertMenuStmt.run(
      item.id,
      item.name,
      item.description,
      item.price_cents,
      item.category,
      item.emoji,
      item.sort_order
    );
  }
  console.log("[SQLite DB] Initialized and seeded menu items successfully.");
}
