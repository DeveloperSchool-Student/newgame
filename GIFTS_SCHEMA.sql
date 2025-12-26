-- Таблиця для подарунків між гравцями
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL REFERENCES profiles(telegram_id),
  receiver_id text NOT NULL REFERENCES profiles(telegram_id),
  item_id text NOT NULL,
  message text,
  status text DEFAULT 'pending', -- pending, accepted, rejected
  created_at timestamp DEFAULT now(),
  responded_at timestamp,
  CHECK (sender_id != receiver_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_created ON gifts(created_at DESC);

-- RLS політики
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their gifts"
  ON gifts FOR SELECT
  USING (
    sender_id = current_setting('app.telegram_id', true) OR
    receiver_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Users can send gifts"
  ON gifts FOR INSERT
  WITH CHECK (sender_id = current_setting('app.telegram_id', true));

CREATE POLICY "Receivers can update gift status"
  ON gifts FOR UPDATE
  USING (receiver_id = current_setting('app.telegram_id', true));

