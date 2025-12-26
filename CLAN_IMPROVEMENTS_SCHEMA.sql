-- Таблиця для ролей у кланах
CREATE TABLE IF NOT EXISTS clan_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  telegram_id text NOT NULL REFERENCES profiles(telegram_id),
  role text DEFAULT 'member', -- leader, officer, veteran, member, recruit
  assigned_at timestamp DEFAULT now(),
  assigned_by text REFERENCES profiles(telegram_id),
  UNIQUE(clan_id, telegram_id)
);

-- Таблиця для кланового складу
CREATE TABLE IF NOT EXISTS clan_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  quantity integer DEFAULT 1,
  donated_by text REFERENCES profiles(telegram_id),
  donated_at timestamp DEFAULT now(),
  CHECK (quantity > 0)
);

-- Таблиця для логу активностей клану
CREATE TABLE IF NOT EXISTS clan_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  actor_id text REFERENCES profiles(telegram_id),
  action_type text NOT NULL, -- join, leave, donate, promote, demote, war_start, war_end, upgrade
  details jsonb,
  created_at timestamp DEFAULT now()
);

-- Таблиця для оголошень клану
CREATE TABLE IF NOT EXISTS clan_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES profiles(telegram_id),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_clan_roles_clan ON clan_roles(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_roles_member ON clan_roles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_clan_roles_role ON clan_roles(role);
CREATE INDEX IF NOT EXISTS idx_clan_storage_clan ON clan_storage(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_storage_item ON clan_storage(item_id);
CREATE INDEX IF NOT EXISTS idx_clan_activity_clan ON clan_activity_log(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_activity_created ON clan_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clan_announcements_clan ON clan_announcements(clan_id);

-- RLS політики для clan_roles
ALTER TABLE clan_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan roles are viewable by clan members"
  ON clan_roles FOR SELECT
  USING (
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Clan leaders can manage roles"
  ON clan_roles FOR ALL
  USING (
    clan_id IN (
      SELECT id FROM clans WHERE leader_id = current_setting('app.telegram_id', true)
    )
  );

-- RLS політики для clan_storage
ALTER TABLE clan_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan storage is viewable by clan members"
  ON clan_storage FOR SELECT
  USING (
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Clan members can donate to storage"
  ON clan_storage FOR INSERT
  WITH CHECK (
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE telegram_id = current_setting('app.telegram_id', true)
    ) AND donated_by = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Leaders and officers can manage storage"
  ON clan_storage FOR ALL
  USING (
    clan_id IN (
      SELECT cr.clan_id FROM clan_roles cr
      WHERE cr.telegram_id = current_setting('app.telegram_id', true)
      AND cr.role IN ('leader', 'officer')
    )
  );

-- RLS політики для clan_activity_log
ALTER TABLE clan_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan activity is viewable by clan members"
  ON clan_activity_log FOR SELECT
  USING (
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "System can insert activity logs"
  ON clan_activity_log FOR INSERT
  WITH CHECK (true);

-- RLS політики для clan_announcements
ALTER TABLE clan_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clan announcements are viewable by clan members"
  ON clan_announcements FOR SELECT
  USING (
    clan_id IN (
      SELECT clan_id FROM clan_members WHERE telegram_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Leaders and officers can create announcements"
  ON clan_announcements FOR INSERT
  WITH CHECK (
    clan_id IN (
      SELECT cr.clan_id FROM clan_roles cr
      WHERE cr.telegram_id = current_setting('app.telegram_id', true)
      AND cr.role IN ('leader', 'officer')
    ) AND author_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Authors can update their announcements"
  ON clan_announcements FOR UPDATE
  USING (author_id = current_setting('app.telegram_id', true));

CREATE POLICY "Leaders can delete announcements"
  ON clan_announcements FOR DELETE
  USING (
    clan_id IN (
      SELECT id FROM clans WHERE leader_id = current_setting('app.telegram_id', true)
    )
  );

-- Функція для автоматичного логування активностей
CREATE OR REPLACE FUNCTION log_clan_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO clan_activity_log (clan_id, actor_id, action_type, details)
    VALUES (NEW.clan_id, NEW.telegram_id, 'join', jsonb_build_object('member_name', NEW.telegram_id));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO clan_activity_log (clan_id, actor_id, action_type, details)
    VALUES (OLD.clan_id, OLD.telegram_id, 'leave', jsonb_build_object('member_name', OLD.telegram_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для логування вступу/виходу з клану
CREATE TRIGGER clan_member_activity_trigger
  AFTER INSERT OR DELETE ON clan_members
  FOR EACH ROW
  EXECUTE FUNCTION log_clan_activity();

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_clan_announcement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного оновлення часу оголошень
CREATE TRIGGER update_clan_announcements_timestamp
  BEFORE UPDATE ON clan_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_clan_announcement_timestamp();

