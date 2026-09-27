-- ==============================================================================
-- CHHAPA E-COMMERCE DATABASE SCHEMA FOR SUPABASE
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('women', 'kids', 'accessories')),
  images TEXT[] NOT NULL DEFAULT '{}',
  size_chart JSONB DEFAULT '[]'::jsonb,
  ships_in_days INTEGER DEFAULT 7,
  sold BOOLEAN DEFAULT false,
  fabric_care TEXT,
  details TEXT,
  shipping_returns TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Products
-- Allow anyone (including anonymous visitors) to read products
CREATE POLICY "Allow public read access to products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow full insert/update/delete for products (can be tightened with admin auth)
CREATE POLICY "Allow public insert to products"
  ON public.products
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to products"
  ON public.products
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to products"
  ON public.products
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. RLS Policies for Orders
-- Allow customers to submit orders
CREATE POLICY "Allow public insert to orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading orders (for checkout status / admin portal)
CREATE POLICY "Allow public select on orders"
  ON public.orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow updating orders (e.g. admin status changes)
CREATE POLICY "Allow public update on orders"
  ON public.orders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 6. Create Customer Addresses Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Home',
  recipient_name TEXT,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own addresses
CREATE POLICY "Users can view their own addresses"
  ON public.customer_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON public.customer_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.customer_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.customer_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

