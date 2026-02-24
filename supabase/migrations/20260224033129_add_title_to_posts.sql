/*
  # Add title column to posts table

  ## Changes
  - `posts` table: adds optional `title` text column
    - Used when a post is made from a Daily Check-in prompt
    - The prompt question is stored as the title
    - The user's response is stored in the existing `content` column
    - NULL when the post is a regular (non-check-in) post
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'title'
  ) THEN
    ALTER TABLE posts ADD COLUMN title text;
  END IF;
END $$;
