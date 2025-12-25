-- Таблиця для реакцій на повідомлення
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_telegram_id text NOT NULL,
  emoji text NOT NULL,
  created_at timestamp DEFAULT now(),
  UNIQUE(message_id, user_telegram_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_telegram_id);

-- RLS політики
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати реакції
CREATE POLICY "Message reactions are viewable by everyone"
  ON message_reactions FOR SELECT
  USING (true);

-- Дозволити користувачам додавати свої реакції
CREATE POLICY "Users can insert own reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам видаляти свої реакції
CREATE POLICY "Users can delete own reactions"
  ON message_reactions FOR DELETE
  USING (user_telegram_id = current_setting('app.telegram_id', true));

