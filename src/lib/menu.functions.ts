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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .select("id, name, description, price_cents, category, emoji, sort_order")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MenuItem[];
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Re-price server-side from DB to prevent tampering
    const ids = data.items.map((i) => i.id);
    const { data: rows, error: priceErr } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, price_cents, is_available")
      .in("id", ids);
    if (priceErr) throw new Error(priceErr.message);

    const priceMap = new Map(rows?.map((r) => [r.id, r]) ?? []);
    let total = 0;
    const verifiedItems = data.items.map((i) => {
      const row = priceMap.get(i.id);
      if (!row || !row.is_available) throw new Error(`Item unavailable: ${i.name}`);
      total += row.price_cents * i.quantity;
      return { id: row.id, name: row.name, price_cents: row.price_cents, quantity: i.quantity };
    });

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        confession: data.confession || null,
        items: verifiedItems,
        total_cents: total,
        status: "received",
      })
      .select("id, total_cents")
      .single();
    if (error) throw new Error(error.message);
    return { id: order.id, total_cents: order.total_cents };
  });
