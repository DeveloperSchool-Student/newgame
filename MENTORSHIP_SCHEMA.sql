-- Таблиця для зв'язків ментор-учень
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id text NOT NULL REFERENCES profiles(telegram_id),
  student_id text NOT NULL REFERENCES profiles(telegram_id),
  status text DEFAULT 'active', -- active, completed, cancelled
  mentor_points integer DEFAULT 0,
  student_progress integer DEFAULT 0, -- відсоток прогресу до рівня 20
  started_at timestamp DEFAULT now(),
  completed_at timestamp,
  CHECK (mentor_id != student_id),
  UNIQUE(student_id)
);

-- Таблиця для винагород за наставництво
CREATE TABLE IF NOT EXISTS mentor_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id text NOT NULL,
  name text NOT NULL,
  description text,
  cost_points integer NOT NULL,
  reward_type text NOT NULL, -- item, gold, title, cosmetic
  reward_data jsonb,
  CHECK (cost_points > 0)
);

-- Таблиця для історії отриманих винагород
CREATE TABLE IF NOT EXISTS mentor_reward_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id text NOT NULL REFERENCES profiles(telegram_id),
  reward_id uuid NOT NULL REFERENCES mentor_rewards(id),
  claimed_at timestamp DEFAULT now()
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_student ON mentorships(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
CREATE INDEX IF NOT EXISTS idx_mentor_reward_claims_mentor ON mentor_reward_claims(mentor_id);

-- RLS політики для mentorships
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentorships"
  ON mentorships FOR SELECT
  USING (
    mentor_id = current_setting('app.telegram_id', true) OR
    student_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Mentors can create mentorships"
  ON mentorships FOR INSERT
  WITH CHECK (mentor_id = current_setting('app.telegram_id', true));

CREATE POLICY "Participants can update mentorships"
  ON mentorships FOR UPDATE
  USING (
    mentor_id = current_setting('app.telegram_id', true) OR
    student_id = current_setting('app.telegram_id', true)
  );

-- RLS політики для mentor_rewards
ALTER TABLE mentor_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor rewards are viewable by everyone"
  ON mentor_rewards FOR SELECT
  USING (true);

-- RLS політики для mentor_reward_claims
ALTER TABLE mentor_reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reward claims"
  ON mentor_reward_claims FOR SELECT
  USING (mentor_id = current_setting('app.telegram_id', true));

CREATE POLICY "Users can claim rewards"
  ON mentor_reward_claims FOR INSERT
  WITH CHECK (mentor_id = current_setting('app.telegram_id', true));

-- Функція для автоматичного завершення наставництва
CREATE OR REPLACE FUNCTION complete_mentorship_on_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level >= 20 AND OLD.level < 20 THEN
    UPDATE mentorships
    SET 
      status = 'completed',
      completed_at = now(),
      mentor_points = mentor_points + 100
    WHERE student_id = NEW.telegram_id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для автоматичного завершення
CREATE TRIGGER complete_mentorship_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.level >= 20 AND OLD.level < 20)
  EXECUTE FUNCTION complete_mentorship_on_level();

-- Додаємо початкові винагороди
INSERT INTO mentor_rewards (reward_id, name, description, cost_points, reward_type, reward_data) VALUES
  ('mentor_title_1', 'Титул "Наставник"', 'Отримайте титул Наставник', 50, 'title', '{"title": "Наставник"}'),
  ('mentor_gold_500', '500 золота', 'Отримайте 500 золота', 30, 'gold', '{"amount": 500}'),
  ('mentor_gold_1000', '1000 золота', 'Отримайте 1000 золота', 50, 'gold', '{"amount": 1000}'),
  ('mentor_title_2', 'Титул "Майстер-наставник"', 'Отримайте титул Майстер-наставник', 150, 'title', '{"title": "Майстер-наставник"}'),
  ('mentor_cosmetic_1', 'Аура наставника', 'Спеціальна аура для наставників', 200, 'cosmetic', '{"type": "aura", "id": "mentor_aura"}')
ON CONFLICT DO NOTHING;

