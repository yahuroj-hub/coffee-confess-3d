GRANT INSERT, SELECT, UPDATE ON public.orders TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place an order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update their pending order" ON public.orders;
CREATE POLICY "Anyone can update their pending order"
  ON public.orders FOR UPDATE
  USING (status IN ('received', 'payment_failed'))
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read their order by id" ON public.orders;
CREATE POLICY "Anyone can read their order by id"
  ON public.orders FOR SELECT
  USING (true);