import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  emoji: string | null;
  sort_order: number;
};

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("@/lib/db.server");
  const stmt = db.prepare(`
    SELECT id, name, description, price_cents, category, emoji, sort_order
    FROM menu_items
    WHERE is_available = 1
    ORDER BY sort_order ASC
  `);
  const rows = stmt.all() as any[];
  return (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price_cents: Number(row.price_cents),
    category: row.category,
    emoji: row.emoji,
    sort_order: Number(row.sort_order),
  })) as MenuItem[];
});

const orderItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  price_cents: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(20),
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(1).max(80),
  customer_email: z.string().trim().email().max(160),
  confession: z.string().trim().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1).max(40),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { db } = await import("@/lib/db.server");
    const { randomUUID } = await import("node:crypto");

    // Re-price server-side from DB to prevent tampering
    const ids = data.items.map((i) => i.id);
    const placeholders = ids.map(() => "?").join(",");
    const priceStmt = db.prepare(`
      SELECT id, name, price_cents, is_available
      FROM menu_items
      WHERE id IN (${placeholders})
    `);
    const rows = priceStmt.all(...ids) as any[];

    const priceMap = new Map(rows.map((r) => [r.id, r]));
    let total = 0;
    const verifiedItems = data.items.map((i) => {
      const row = priceMap.get(i.id);
      if (!row || Number(row.is_available) !== 1) throw new Error(`Item unavailable: ${i.name}`);
      total += Number(row.price_cents) * i.quantity;
      return { id: row.id, name: row.name, price_cents: Number(row.price_cents), quantity: i.quantity };
    });

    const orderId = randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, items, total_cents, confession, status)
      VALUES (?, ?, ?, ?, ?, ?, 'received')
    `);
    insertStmt.run(
      orderId,
      data.customer_name,
      data.customer_email,
      JSON.stringify(verifiedItems),
      total,
      data.confession || null
    );

    return { id: orderId, total_cents: total };
  });

const paymentSchema = z.object({
  order_id: z.string().uuid(),
  upi_id: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, "Invalid UPI ID"),
  success: z.boolean(),
});

export const confirmMockPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => paymentSchema.parse(input))
  .handler(async ({ data }) => {
    const { db } = await import("@/lib/db.server");
    const updateStmt = db.prepare(`
      UPDATE orders
      SET status = ?, payment_method = 'mock_upi', upi_id = ?, paid_at = ?
      WHERE id = ?
    `);

    const status = data.success ? "paid" : "payment_failed";
    const paidAt = data.success ? new Date().toISOString() : null;

    updateStmt.run(status, data.upi_id, paidAt, data.order_id);
    return { ok: data.success };
  });
