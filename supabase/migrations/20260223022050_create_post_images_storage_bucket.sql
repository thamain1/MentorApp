/*
  # Create post-images storage bucket

  ## Summary
  Creates a public storage bucket for community post images.

  ## Storage
  - Bucket: `post-images` (public)

  ## Security
  - Authenticated users can upload images to their own folder
  - Anyone can view/download images (public bucket)
  - Only the uploader can delete their own images
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
