-- Таблиця для сезонів
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'active', -- active, finished
  start_date timestamp DEFAULT now(),
  end_date timestamp NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Таблиця для бойових пропусків
CREATE TABLE IF NOT EXISTS battle_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL REFERENCES profiles(telegram_id),
  season_id uuid NOT NULL REFERENCES seasons(id),
  current_level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  claimed_levels integer[] DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(telegram_id, season_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_battle_passes_telegram ON battle_passes(telegram_id);
CREATE INDEX IF NOT EXISTS idx_battle_passes_season ON battle_passes(season_id);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- RLS політики
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_passes ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати сезони
CREATE POLICY "Seasons are viewable by everyone"
  ON seasons FOR SELECT
  USING (true);

-- Дозволити всім читати бойові пропуски
CREATE POLICY "Battle passes are viewable by everyone"
  ON battle_passes FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свої пропуски
CREATE POLICY "Users can update own battle pass"
  ON battle_passes FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свої пропуски
CREATE POLICY "Users can insert own battle pass"
  ON battle_passes FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

