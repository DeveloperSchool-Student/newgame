-- Таблиця для особистих повідомлень між гравцями
CREATE TABLE IF NOT EXISTS private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL REFERENCES profiles(telegram_id),
  receiver_id text NOT NULL REFERENCES profiles(telegram_id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created ON private_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_private_messages_unread ON private_messages(receiver_id, is_read) WHERE is_read = false;

-- RLS політики
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- Дозволити користувачам читати свої повідомлення
CREATE POLICY "Users can read own messages"
  ON private_messages FOR SELECT
  USING (
    sender_id = current_setting('app.telegram_id', true) OR
    receiver_id = current_setting('app.telegram_id', true)
  );

-- Дозволити користувачам відправляти повідомлення
CREATE POLICY "Users can send messages"
  ON private_messages FOR INSERT
  WITH CHECK (sender_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам оновлювати свої отримані повідомлення (позначати як прочитані)
CREATE POLICY "Users can update received messages"
  ON private_messages FOR UPDATE
  USING (receiver_id = current_setting('app.telegram_id', true));

