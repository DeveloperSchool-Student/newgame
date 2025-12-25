-- Таблиця для навичок гравців
CREATE TABLE IF NOT EXISTS player_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL,
  skill_id text NOT NULL,
  level integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(telegram_id, skill_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_player_skills_telegram ON player_skills(telegram_id);
CREATE INDEX IF NOT EXISTS idx_player_skills_id ON player_skills(skill_id);

-- RLS політики
ALTER TABLE player_skills ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати навички
CREATE POLICY "Player skills are viewable by everyone"
  ON player_skills FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої навички
CREATE POLICY "Users can update own skills"
  ON player_skills FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої навички
CREATE POLICY "Users can insert own skills"
  ON player_skills FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

