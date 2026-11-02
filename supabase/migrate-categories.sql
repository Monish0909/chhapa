-- Run once in Supabase SQL editor: replaces "kids" with "boy" / "girl".
-- 1. Drop the old category CHECK constraint (whatever it is named)
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.products'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE public.products DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

-- 2. Move existing "kids" products to "girl" (re-categorise boys' items in Admin > Edit)
UPDATE public.products SET category = 'girl' WHERE lower(category) = 'kids';

-- 3. Add the new constraint
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check CHECK (category IN ('women', 'boy', 'girl', 'accessories'));
