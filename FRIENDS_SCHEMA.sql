-- Таблиця для дружніх зв'язків між гравцями
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES profiles(telegram_id),
  friend_id text NOT NULL REFERENCES profiles(telegram_id),
  status text DEFAULT 'pending', -- pending, accepted, blocked
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CHECK (user_id != friend_id),
  UNIQUE(user_id, friend_id)
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_both_users ON friendships(user_id, friend_id);

-- RLS політики
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Дозволити читати всі дружні зв'язки, де користувач є учасником
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (
    user_id = current_setting('app.telegram_id', true) OR
    friend_id = current_setting('app.telegram_id', true)
  );

-- Дозволити користувачам створювати запити на дружбу
CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (user_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам оновлювати статус дружби
CREATE POLICY "Users can update friendship status"
  ON friendships FOR UPDATE
  USING (
    user_id = current_setting('app.telegram_id', true) OR
    friend_id = current_setting('app.telegram_id', true)
  );

-- Дозволити користувачам видаляти дружбу
CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  USING (
    user_id = current_setting('app.telegram_id', true) OR
    friend_id = current_setting('app.telegram_id', true)
  );

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_friendship_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення часу
CREATE TRIGGER update_friendships_timestamp
  BEFORE UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_friendship_timestamp();

