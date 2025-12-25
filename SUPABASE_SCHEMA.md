# Структура бази даних Supabase

## Таблиця: `profiles`

Профілі гравців з усіма їхніми даними.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `telegram_id` (text, UNIQUE, NOT NULL) - Telegram ID користувача
- `name` (text) - Ім'я гравця
- `avatar_url` (text) - URL аватара
- `level` (integer, DEFAULT 1) - Рівень гравця
- `experience` (integer, DEFAULT 0) - Поточний досвід
- `experience_to_next` (integer, DEFAULT 100) - Досвід до наступного рівня
- `health` (integer, DEFAULT 100) - Поточне здоров'я
- `max_health` (integer, DEFAULT 100) - Максимальне здоров'я
- `mana` (integer, DEFAULT 50) - Поточна мана
- `max_mana` (integer, DEFAULT 50) - Максимальна мана
- `gold` (integer, DEFAULT 100) - Золото
- `items` (jsonb, DEFAULT '[]') - Інвентар (масив предметів)
- `equipped_items` (jsonb, DEFAULT '{"weapon": null, "armor": null}') - Екіпіровані предмети
- `stats` (jsonb, DEFAULT '{"strength": 10, "agility": 8, "intelligence": 6, "defense": 5}') - Характеристики
- `kingdom` (text) - ID королівства
- `rank` (text, DEFAULT 'recruit') - Ранг гравця
- `clan_id` (uuid) - ID клану (FOREIGN KEY до clans)
- `referrer_id` (text) - Telegram ID реферера
- `vip_status` (boolean, DEFAULT false) - VIP статус
- `vip_expires_at` (timestamp) - Термін дії VIP
- `crystals` (integer, DEFAULT 0) - Кристали (преміум валюта)
- `bosses_killed` (integer, DEFAULT 0) - Кількість вбитих босів
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())
- `last_seen` (timestamp) - Останній час активності

### Індекси:

- `idx_profiles_telegram_id` на `telegram_id`
- `idx_profiles_kingdom` на `kingdom`
- `idx_profiles_clan_id` на `clan_id`

### RLS (Row Level Security):

```sql
-- Дозволити всім читати профілі
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати тільки свій профіль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));
```

---

## Таблиця: `clans`

Клани гравців.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `name` (text, NOT NULL, UNIQUE) - Назва клану
- `tag` (text, NOT NULL, UNIQUE) - Тег клану (3-4 символи)
- `leader_id` (text, NOT NULL) - Telegram ID лідера
- `level` (integer, DEFAULT 1) - Рівень клану
- `xp` (integer, DEFAULT 0) - Досвід клану
- `gold_bank` (integer, DEFAULT 0) - Золото в банку клану
- `description` (text) - Опис клану
- `upgrades` (jsonb, DEFAULT '[]') - Активні покращення клану
- `created_at` (timestamp, DEFAULT now())
- `updated_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_clans_tag` на `tag`
- `idx_clans_leader_id` на `leader_id`

### RLS:

```sql
-- Дозволити всім читати клани
CREATE POLICY "Clans are viewable by everyone"
  ON clans FOR SELECT
  USING (true);

-- Дозволити лідерам оновлювати свій клан
CREATE POLICY "Leaders can update own clan"
  ON clans FOR UPDATE
  USING (leader_id = current_setting('app.telegram_id', true));

-- Дозволити створювати клани
CREATE POLICY "Anyone can create clan"
  ON clans FOR INSERT
  WITH CHECK (true);
```

---

## Таблиця: `clan_applications`

Заявки на вступ до клану.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `clan_id` (uuid, NOT NULL) - ID клану
- `player_telegram_id` (text, NOT NULL) - Telegram ID гравця
- `status` (text, DEFAULT 'pending') - Статус заявки (pending, accepted, rejected)
- `created_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_clan_applications_clan` на `clan_id`
- `idx_clan_applications_player` на `player_telegram_id`

### RLS:

```sql
-- Дозволити всім читати заявки
CREATE POLICY "Applications are viewable by everyone"
  ON clan_applications FOR SELECT
  USING (true);

-- Дозволити лідерам оновлювати заявки
CREATE POLICY "Leaders can update applications"
  ON clan_applications FOR UPDATE
  USING (clan_id IN (
    SELECT id FROM clans WHERE leader_id = current_setting('app.telegram_id', true)
  ));
```

---

## Таблиця: `referrals`

Реферальна система.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `referrer_telegram_id` (text, NOT NULL) - Telegram ID реферера
- `referred_telegram_id` (text, NOT NULL, UNIQUE) - Telegram ID запрошеного
- `reward_claimed` (boolean, DEFAULT false) - Чи отримано нагороду
- `created_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_referrals_referrer` на `referrer_telegram_id`
- `idx_referrals_referred` на `referred_telegram_id`

### RLS:

```sql
-- Дозволити всім читати реферали
CREATE POLICY "Referrals are viewable by everyone"
  ON referrals FOR SELECT
  USING (true);

-- Дозволити вставляти реферали
CREATE POLICY "Anyone can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);
```

---

## Таблиця: `premium_purchases`

Покупки преміум товарів.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `telegram_id` (text, NOT NULL) - Telegram ID гравця
- `item_type` (text, NOT NULL) - Тип товару (vip, heal, skin)
- `item_id` (text) - ID товару (для скінів)
- `stars_amount` (integer, NOT NULL) - Кількість Telegram Stars
- `status` (text, DEFAULT 'pending') - Статус (pending, completed, failed)
- `created_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_premium_purchases_telegram` на `telegram_id`

---

## Таблиця: `server_settings`

Налаштування сервера (для адміністратора).

### Колонки:

- `key` (text, PRIMARY KEY) - Ключ налаштування
- `value` (jsonb, NOT NULL) - Значення (JSON)
- `updated_at` (timestamp, DEFAULT now())
- `updated_by` (text) - Telegram ID адміністратора

### Приклад даних:

```json
{
  "key": "xp_multiplier",
  "value": 2.0
}
```

---

## Таблиця: `global_announcements`

Глобальні анонси.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `message` (text, NOT NULL) - Текст анонсу
- `created_by` (text, NOT NULL) - Telegram ID адміністратора
- `created_at` (timestamp, DEFAULT now())
- `is_active` (boolean, DEFAULT true) - Чи активний анонс

---

## Таблиця: `provinces`

Провінції на карті та їх власність.

### Колонки:

- `id` (text, PRIMARY KEY) - ID провінції (capital, darkForest, forgottenMines)
- `name` (text, NOT NULL) - Назва провінції
- `owner_kingdom_id` (text) - ID королівства-власника
- `tax_rate` (numeric, DEFAULT 0.1) - Податкова ставка (0.0-1.0)
- `can_capture` (boolean, DEFAULT true) - Чи можна захопити
- `min_level_to_capture` (integer, DEFAULT 10) - Мінімальний рівень для захоплення
- `status` (text) - Статус провінції
- `updated_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_provinces_owner` на `owner_kingdom_id`

### RLS:

```sql
-- Дозволити всім читати провінції
CREATE POLICY "Provinces are viewable by everyone"
  ON provinces FOR SELECT
  USING (true);

-- Дозволити всім оновлювати провінції (для захоплення)
CREATE POLICY "Anyone can update provinces"
  ON provinces FOR UPDATE
  USING (true);
```

---

## Таблиця: `messages`

Повідомлення в чаті локацій.

### Колонки:

- `id` (uuid, PRIMARY KEY, DEFAULT gen_random_uuid())
- `sender_telegram_id` (text, NOT NULL) - Telegram ID відправника
- `sender_name` (text, NOT NULL) - Ім'я відправника
- `sender_level` (integer) - Рівень відправника
- `sender_rank` (text) - Ранг відправника
- `sender_kingdom` (text) - Королівство відправника
- `text` (text, NOT NULL) - Текст повідомлення
- `location_id` (text, NOT NULL) - ID локації
- `is_rp` (boolean, DEFAULT false) - Чи це RP-повідомлення (/me)
- `created_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_messages_location` на `location_id`
- `idx_messages_created_at` на `created_at`

### RLS:

```sql
-- Дозволити всім читати повідомлення
CREATE POLICY "Messages are viewable by everyone"
  ON messages FOR SELECT
  USING (true);

-- Дозволити всім вставляти повідомлення
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);
```

---

## Таблиця: `world_state`

Глобальний стан світу (HP босів, тощо).

### Колонки:

- `key` (text, PRIMARY KEY) - Ключ стану (наприклад, 'boss_hp')
- `value` (jsonb, NOT NULL) - Значення стану (JSON)
- `updated_at` (timestamp, DEFAULT now())

### Приклад даних:

```json
{
  "key": "boss_hp",
  "value": {
    "forgottenMines": 350,
    "darkForest": 500
  }
}
```

### RLS:

```sql
-- Дозволити всім читати стан світу
CREATE POLICY "World state is viewable by everyone"
  ON world_state FOR SELECT
  USING (true);

-- Дозволити всім оновлювати стан світу
CREATE POLICY "Anyone can update world state"
  ON world_state FOR UPDATE
  USING (true);
```

---

## Таблиця: `player_locations`

Поточна локація кожного гравця (для Presence list).

### Колонки:

- `telegram_id` (text, PRIMARY KEY) - Telegram ID гравця
- `location_id` (text, NOT NULL) - ID поточної локації
- `updated_at` (timestamp, DEFAULT now())

### Індекси:

- `idx_player_locations_location` на `location_id`

### RLS:

```sql
-- Дозволити всім читати локації гравців
CREATE POLICY "Player locations are viewable by everyone"
  ON player_locations FOR SELECT
  USING (true);

-- Дозволити користувачам оновлювати свою локацію
CREATE POLICY "Users can update own location"
  ON player_locations FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id', true));

-- Дозволити користувачам вставляти свою локацію
CREATE POLICY "Users can insert own location"
  ON player_locations FOR INSERT
  WITH CHECK (telegram_id = current_setting('app.telegram_id', true));
```

---

## Налаштування Realtime

Для роботи Realtime потрібно увімкнути його в Supabase Dashboard:

1. Перейдіть в Settings → API
2. Увімкніть Realtime для таблиць:
   - `provinces` (INSERT, UPDATE, DELETE)
   - `messages` (INSERT)
   - `world_state` (UPDATE)
   - `player_locations` (INSERT, UPDATE, DELETE)
   - `clans` (UPDATE)
   - `clan_applications` (INSERT, UPDATE)

---

## SQL для створення таблиць

```sql
-- Створення таблиці profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  experience_to_next integer DEFAULT 100,
  health integer DEFAULT 100,
  max_health integer DEFAULT 100,
  mana integer DEFAULT 50,
  max_mana integer DEFAULT 50,
  gold integer DEFAULT 100,
  items jsonb DEFAULT '[]',
  equipped_items jsonb DEFAULT '{"weapon": null, "armor": null}',
  stats jsonb DEFAULT '{"strength": 10, "agility": 8, "intelligence": 6, "defense": 5}',
  kingdom text,
  rank text DEFAULT 'recruit',
  clan_id uuid REFERENCES clans(id),
  referrer_id text,
  vip_status boolean DEFAULT false,
  vip_expires_at timestamp,
  crystals integer DEFAULT 0,
  bosses_killed integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  last_seen timestamp
);

-- Створення таблиці provinces
CREATE TABLE provinces (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner_kingdom_id text,
  tax_rate numeric DEFAULT 0.1,
  can_capture boolean DEFAULT true,
  min_level_to_capture integer DEFAULT 10,
  status text,
  updated_at timestamp DEFAULT now()
);

-- Створення таблиці messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_telegram_id text NOT NULL,
  sender_name text NOT NULL,
  sender_level integer,
  sender_rank text,
  sender_kingdom text,
  text text NOT NULL,
  location_id text NOT NULL,
  is_rp boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Створення таблиці world_state
CREATE TABLE world_state (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp DEFAULT now()
);

-- Створення таблиці player_locations
CREATE TABLE player_locations (
  telegram_id text PRIMARY KEY,
  location_id text NOT NULL,
  updated_at timestamp DEFAULT now()
);

-- Створення таблиці clans
CREATE TABLE clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  tag text NOT NULL UNIQUE,
  leader_id text NOT NULL,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  gold_bank integer DEFAULT 0,
  description text,
  upgrades jsonb DEFAULT '[]',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Створення таблиці clan_applications
CREATE TABLE clan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id uuid NOT NULL REFERENCES clans(id),
  player_telegram_id text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Створення таблиці referrals
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_telegram_id text NOT NULL,
  referred_telegram_id text NOT NULL UNIQUE,
  reward_claimed boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Створення таблиці premium_purchases
CREATE TABLE premium_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL,
  item_type text NOT NULL,
  item_id text,
  stars_amount integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Створення таблиці server_settings
CREATE TABLE server_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp DEFAULT now(),
  updated_by text
);

-- Створення таблиці global_announcements
CREATE TABLE global_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Додавання поля clan_id до profiles
ALTER TABLE profiles ADD COLUMN clan_id uuid REFERENCES clans(id);

-- Створення індексів
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX idx_profiles_kingdom ON profiles(kingdom);
CREATE INDEX idx_profiles_clan_id ON profiles(clan_id);
CREATE INDEX idx_clans_tag ON clans(tag);
CREATE INDEX idx_clans_leader_id ON clans(leader_id);
CREATE INDEX idx_clan_applications_clan ON clan_applications(clan_id);
CREATE INDEX idx_clan_applications_player ON clan_applications(player_telegram_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_telegram_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_telegram_id);
CREATE INDEX idx_premium_purchases_telegram ON premium_purchases(telegram_id);
CREATE INDEX idx_messages_location ON messages(location_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_player_locations_location ON player_locations(location_id);

-- Вставка початкових даних для провінцій
INSERT INTO provinces (id, name, owner_kingdom_id, tax_rate, can_capture, min_level_to_capture) VALUES
  ('capital', 'Столиця', 'northernAlliance', 0.1, false, NULL),
  ('darkForest', 'Темний ліс', 'forestBrotherhood', 0.15, true, 10),
  ('forgottenMines', 'Забуті шахти', 'desertHorde', 0.2, true, 15);
```

