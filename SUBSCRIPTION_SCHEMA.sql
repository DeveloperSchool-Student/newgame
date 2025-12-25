-- Таблиця для підписок
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL REFERENCES profiles(telegram_id),
  plan_id text NOT NULL, -- 'monthly', 'premium'
  status text DEFAULT 'active', -- active, expired, cancelled
  expires_at timestamp NOT NULL,
  last_daily_reward timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_subscriptions_telegram ON subscriptions(telegram_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);

-- RLS політики
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати підписки
CREATE POLICY "Subscriptions are viewable by everyone"
  ON subscriptions FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої підписки
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої підписки
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

-- Функція для автоматичного оновлення прострочених підписок
CREATE OR REPLACE FUNCTION check_subscriptions_expiration()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active' AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

