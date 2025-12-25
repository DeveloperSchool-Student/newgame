-- Таблиця для досягнень гравців
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL,
  achievement_id text NOT NULL,
  progress integer DEFAULT 0,
  status text DEFAULT 'active', -- active, completed, claimed
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(telegram_id, achievement_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_player_achievements_telegram ON player_achievements(telegram_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_status ON player_achievements(status);
CREATE INDEX IF NOT EXISTS idx_player_achievements_id ON player_achievements(achievement_id);

-- RLS політики
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати досягнення
CREATE POLICY "Player achievements are viewable by everyone"
  ON player_achievements FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої досягнення
CREATE POLICY "Users can update own achievements"
  ON player_achievements FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої досягнення
CREATE POLICY "Users can insert own achievements"
  ON player_achievements FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

