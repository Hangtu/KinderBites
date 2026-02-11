-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lonchi-products',
  'lonchi-products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lonchi-products');

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lonchi-products');
