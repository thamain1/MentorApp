/*
  # Add image_urls to posts table

  ## Changes
  - Adds `image_urls` column to `posts` table as a text array, defaulting to empty array
  - This stores public URLs of images uploaded to Supabase Storage for each post
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE posts ADD COLUMN image_urls text[] DEFAULT '{}';
  END IF;
END $$;
