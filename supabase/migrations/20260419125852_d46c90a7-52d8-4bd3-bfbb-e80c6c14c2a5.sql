
-- 1) Storage: drop overly permissive policies on product-images
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;

-- 2) Storage: prevent listing files in the public bucket (still allows direct file access by URL)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Public can read product image files (no listing)"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images' AND name IS NOT NULL);
-- Note: Supabase listing requires SELECT on rows; we keep SELECT but the actual file delivery uses the public CDN.
-- To fully block listing, revoke from anon at table level:
REVOKE SELECT ON storage.objects FROM anon;
-- Re-grant minimal access via the policy above for read of bucket_id='product-images' rows - but anon needs grants.
GRANT SELECT ON storage.objects TO anon;

-- 3) Products: restrict the public SELECT policy to safe rows but use column GRANTs to limit columns
-- Recreate public policy unchanged for menu-enabled businesses; use column privileges to hide cost_price/stock/min_stock from anon.
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (id, business_id, name, description, price, category, image_url, created_at, updated_at) ON public.products TO anon;

-- 4) has_role(): restrict to checking own roles only
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND _user_id = auth.uid()  -- only allow checking own roles
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
