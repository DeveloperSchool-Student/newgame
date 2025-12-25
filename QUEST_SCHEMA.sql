-- Таблиця для квестів гравців
CREATE TABLE IF NOT EXISTS player_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL,
  quest_id text NOT NULL,
  quest_type text NOT NULL,
  progress integer DEFAULT 0,
  status text DEFAULT 'active', -- active, completed, claimed
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_player_quests_telegram ON player_quests(telegram_id);
CREATE INDEX IF NOT EXISTS idx_player_quests_status ON player_quests(status);
CREATE INDEX IF NOT EXISTS idx_player_quests_type ON player_quests(quest_type);

-- RLS політики
ALTER TABLE player_quests ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати квести
CREATE POLICY "Player quests are viewable by everyone"
  ON player_quests FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої квести
CREATE POLICY "Users can update own quests"
  ON player_quests FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої квести
CREATE POLICY "Users can insert own quests"
  ON player_quests FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

