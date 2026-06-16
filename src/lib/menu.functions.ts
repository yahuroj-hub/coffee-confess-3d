import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  emoji: string | null;
  sort_order: number;
};

// Server-side client using the publishable (anon) key.
// SUPABASE_SERVICE_ROLE_KEY is not available on Lovable Cloud, so we rely
// on RLS policies instead. Created lazily inside handlers so process.env
// is read at call time.
function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
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
    const supabase = getServerSupabase();

    // Re-price server-side from DB to prevent tampering
    const ids = data.items.map((i) => i.id);
    const { data: rows, error: priceErr } = await supabase
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

    const { data: order, error } = await supabase
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

const paymentSchema = z.object({
  order_id: z.string().uuid(),
  upi_id: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, "Invalid UPI ID"),
  success: z.boolean(),
});

export const confirmMockPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => paymentSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getServerSupabase();
    const { error } = await supabase
      .from("orders")
      .update({
        status: data.success ? "paid" : "payment_failed",
        payment_method: "mock_upi",
        upi_id: data.upi_id,
        paid_at: data.success ? new Date().toISOString() : null,
      })
      .eq("id", data.order_id);
    if (error) throw new Error(error.message);
    return { ok: data.success };
  });
