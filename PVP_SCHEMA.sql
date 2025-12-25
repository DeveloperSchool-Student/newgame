-- Таблиця для PvP рейтингів
CREATE TABLE IF NOT EXISTS pvp_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL UNIQUE,
  rating integer DEFAULT 1000,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_pvp_ratings_telegram ON pvp_ratings(telegram_id);
CREATE INDEX IF NOT EXISTS idx_pvp_ratings_rating ON pvp_ratings(rating);

-- RLS політики
ALTER TABLE pvp_ratings ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати рейтинги
CREATE POLICY "PvP ratings are viewable by everyone"
  ON pvp_ratings FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої рейтинги
CREATE POLICY "Users can update own rating"
  ON pvp_ratings FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої рейтинги
CREATE POLICY "Users can insert own rating"
  ON pvp_ratings FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

