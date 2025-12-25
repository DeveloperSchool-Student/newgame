-- Таблиця для воєн між кланами
CREATE TABLE IF NOT EXISTS clan_wars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  defender_clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  status text DEFAULT 'active', -- active, finished, cancelled
  attacker_score integer DEFAULT 0,
  defender_score integer DEFAULT 0,
  started_at timestamp DEFAULT now(),
  ends_at timestamp NOT NULL,
  ended_at timestamp,
  winner_clan_id uuid REFERENCES clans(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CHECK (attacker_clan_id != defender_clan_id)
);

-- Таблиця для учасників воєн
CREATE TABLE IF NOT EXISTS clan_war_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid NOT NULL REFERENCES clan_wars(id) ON DELETE CASCADE,
  telegram_id text NOT NULL REFERENCES profiles(telegram_id),
  battles_won integer DEFAULT 0,
  battles_lost integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  UNIQUE(war_id, telegram_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_clan_wars_attacker ON clan_wars(attacker_clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_wars_defender ON clan_wars(defender_clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_wars_status ON clan_wars(status);
CREATE INDEX IF NOT EXISTS idx_clan_war_participants_war ON clan_war_participants(war_id);
CREATE INDEX IF NOT EXISTS idx_clan_war_participants_player ON clan_war_participants(telegram_id);

-- RLS політики
ALTER TABLE clan_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_war_participants ENABLE ROW LEVEL SECURITY;

-- Дозволити всім читати війни
CREATE POLICY "Clan wars are viewable by everyone"
  ON clan_wars FOR SELECT
  USING (true);

-- Дозволити лідерам кланів оголошувати війни
CREATE POLICY "Clan leaders can declare wars"
  ON clan_wars FOR INSERT
  WITH CHECK (
    attacker_clan_id IN (
      SELECT id FROM clans WHERE leader_id = current_setting('app.telegram_id', true)
    )
  );

-- Дозволити всім читати учасників
CREATE POLICY "War participants are viewable by everyone"
  ON clan_war_participants FOR SELECT
  USING (true);

-- Дозволити гравцям додавати себе до участі
CREATE POLICY "Players can participate in wars"
  ON clan_war_participants FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));

-- Функція для автоматичного завершення воєн
CREATE OR REPLACE FUNCTION check_clan_wars_expiration()
RETURNS void AS $$
BEGIN
  UPDATE clan_wars
  SET 
    status = 'finished',
    ended_at = now(),
    winner_clan_id = CASE
      WHEN attacker_score > defender_score THEN attacker_clan_id
      WHEN defender_score > attacker_score THEN defender_clan_id
      ELSE NULL
    END
  WHERE status = 'active' AND ends_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичної перевірки (можна запускати через cron)
-- Або викликати вручну через SELECT check_clan_wars_expiration();

