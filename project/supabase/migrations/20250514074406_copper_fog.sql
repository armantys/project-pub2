/*
  # Create predictions table

  1. New Tables
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `label` (text)
      - `confidence` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on predictions table
    - Add policies for authenticated users to:
      - Read their own predictions
      - Create new predictions
*/

CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text NOT NULL,
  label text NOT NULL,
  confidence numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);