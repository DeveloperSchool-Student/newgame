-- Таблиця для партій (груп гравців)
CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id text NOT NULL REFERENCES profiles(telegram_id),
  name text,
  max_members integer DEFAULT 5,
  loot_distribution text DEFAULT 'equal', -- equal, leader, need_roll
  status text DEFAULT 'active', -- active, disbanded
  created_at timestamp DEFAULT now(),
  disbanded_at timestamp,
  CHECK (max_members >= 2 AND max_members <= 10)
);

-- Таблиця для учасників партії
CREATE TABLE IF NOT EXISTS party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  telegram_id text NOT NULL REFERENCES profiles(telegram_id),
  role text DEFAULT 'member', -- leader, member
  joined_at timestamp DEFAULT now(),
  UNIQUE(party_id, telegram_id)
);

-- Таблиця для запрошень до партії
CREATE TABLE IF NOT EXISTS party_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  inviter_id text NOT NULL REFERENCES profiles(telegram_id),
  invitee_id text NOT NULL REFERENCES profiles(telegram_id),
  status text DEFAULT 'pending', -- pending, accepted, declined, expired
  created_at timestamp DEFAULT now(),
  expires_at timestamp DEFAULT (now() + interval '5 minutes'),
  responded_at timestamp,
  CHECK (inviter_id != invitee_id)
);

-- Таблиця для групових квестів
CREATE TABLE IF NOT EXISTS group_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id text NOT NULL,
  name text NOT NULL,
  description text,
  min_members integer DEFAULT 2,
  max_members integer DEFAULT 5,
  difficulty text DEFAULT 'normal', -- easy, normal, hard, epic
  rewards jsonb, -- {exp: 1000, gold: 500, items: [...]}
  requirements jsonb, -- {min_level: 20, ...}
  created_at timestamp DEFAULT now()
);

-- Таблиця для прогресу групових квестів
CREATE TABLE IF NOT EXISTS group_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES group_quests(id),
  progress jsonb DEFAULT '{}', -- {objectives: {...}, completed: false}
  started_at timestamp DEFAULT now(),
  completed_at timestamp,
  UNIQUE(party_id, quest_id)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_parties_leader ON parties(leader_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);
CREATE INDEX IF NOT EXISTS idx_party_members_party ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_player ON party_members(telegram_id);
CREATE INDEX IF NOT EXISTS idx_party_invites_party ON party_invites(party_id);
CREATE INDEX IF NOT EXISTS idx_party_invites_invitee ON party_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_party_invites_status ON party_invites(status);
CREATE INDEX IF NOT EXISTS idx_group_quest_progress_party ON group_quest_progress(party_id);
CREATE INDEX IF NOT EXISTS idx_group_quest_progress_quest ON group_quest_progress(quest_id);

-- RLS політики для parties
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties are viewable by everyone"
  ON parties FOR SELECT
  USING (true);

CREATE POLICY "Users can create parties"
  ON parties FOR INSERT
  WITH CHECK (leader_id = current_setting('app.telegram_id', true));

CREATE POLICY "Leaders can update their parties"
  ON parties FOR UPDATE
  USING (leader_id = current_setting('app.telegram_id', true));

-- RLS політики для party_members
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members are viewable by everyone"
  ON party_members FOR SELECT
  USING (true);

CREATE POLICY "Leaders can add members"
  ON party_members FOR INSERT
  WITH CHECK (
    party_id IN (
      SELECT id FROM parties WHERE leader_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Leaders and members can leave"
  ON party_members FOR DELETE
  USING (
    telegram_id = current_setting('app.telegram_id', true) OR
    party_id IN (
      SELECT id FROM parties WHERE leader_id = current_setting('app.telegram_id', true)
    )
  );

-- RLS політики для party_invites
ALTER TABLE party_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invites"
  ON party_invites FOR SELECT
  USING (
    invitee_id = current_setting('app.telegram_id', true) OR
    inviter_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Party members can create invites"
  ON party_invites FOR INSERT
  WITH CHECK (
    party_id IN (
      SELECT party_id FROM party_members WHERE telegram_id = current_setting('app.telegram_id', true)
    ) AND inviter_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Invitees can update their invites"
  ON party_invites FOR UPDATE
  USING (invitee_id = current_setting('app.telegram_id', true));

-- RLS політики для group_quests
ALTER TABLE group_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group quests are viewable by everyone"
  ON group_quests FOR SELECT
  USING (true);

-- RLS політики для group_quest_progress
ALTER TABLE group_quest_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quest progress is viewable by party members"
  ON group_quest_progress FOR SELECT
  USING (
    party_id IN (
      SELECT party_id FROM party_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Party members can update quest progress"
  ON group_quest_progress FOR ALL
  USING (
    party_id IN (
      SELECT party_id FROM party_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

-- Функція для автоматичного додавання лідера до учасників
CREATE OR REPLACE FUNCTION add_leader_to_party()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO party_members (party_id, telegram_id, role)
  VALUES (NEW.id, NEW.leader_id, 'leader');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного додавання лідера
CREATE TRIGGER add_leader_trigger
  AFTER INSERT ON parties
  FOR EACH ROW
  EXECUTE FUNCTION add_leader_to_party();

-- Функція для перевірки максимальної кількості учасників
CREATE OR REPLACE FUNCTION check_party_size()
RETURNS TRIGGER AS $$
DECLARE
  current_size integer;
  max_size integer;
BEGIN
  SELECT COUNT(*), p.max_members INTO current_size, max_size
  FROM party_members pm
  JOIN parties p ON pm.party_id = p.id
  WHERE pm.party_id = NEW.party_id
  GROUP BY p.max_members;

  IF current_size >= max_size THEN
    RAISE EXCEPTION 'Party is full';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для перевірки розміру партії
CREATE TRIGGER check_party_size_trigger
  BEFORE INSERT ON party_members
  FOR EACH ROW
  EXECUTE FUNCTION check_party_size();

-- Функція для автоматичного прийняття запрошення
CREATE OR REPLACE FUNCTION accept_party_invite()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO party_members (party_id, telegram_id, role)
    VALUES (NEW.party_id, NEW.invitee_id, 'member')
    ON CONFLICT (party_id, telegram_id) DO NOTHING;
    
    NEW.responded_at = now();
  ELSIF NEW.status = 'declined' AND OLD.status = 'pending' THEN
    NEW.responded_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для прийняття запрошення
CREATE TRIGGER accept_party_invite_trigger
  BEFORE UPDATE ON party_invites
  FOR EACH ROW
  EXECUTE FUNCTION accept_party_invite();

-- Функція для автоматичного розпуску партії при виході лідера
CREATE OR REPLACE FUNCTION disband_party_on_leader_leave()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'leader' THEN
    UPDATE parties
    SET status = 'disbanded', disbanded_at = now()
    WHERE id = OLD.party_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Тригер для розпуску партії
CREATE TRIGGER disband_party_trigger
  BEFORE DELETE ON party_members
  FOR EACH ROW
  EXECUTE FUNCTION disband_party_on_leader_leave();

-- Функція для закінчення запрошень
CREATE OR REPLACE FUNCTION expire_party_invites()
RETURNS void AS $$
BEGIN
  UPDATE party_invites
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

