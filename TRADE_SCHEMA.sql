-- Таблиця для активних обмінів між гравцями
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id text NOT NULL REFERENCES profiles(telegram_id),
  partner_id text NOT NULL REFERENCES profiles(telegram_id),
  status text DEFAULT 'pending', -- pending, accepted, cancelled, completed
  initiator_confirmed boolean DEFAULT false,
  partner_confirmed boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  expires_at timestamp DEFAULT (now() + interval '5 minutes'),
  completed_at timestamp,
  CHECK (initiator_id != partner_id)
);

-- Таблиця для предметів в обміні
CREATE TABLE IF NOT EXISTS trade_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  owner_id text NOT NULL REFERENCES profiles(telegram_id),
  item_id text NOT NULL,
  quantity integer DEFAULT 1,
  gold_amount integer DEFAULT 0,
  CHECK (quantity > 0 OR gold_amount > 0)
);

-- Таблиця для аукціонних лотів
CREATE TABLE IF NOT EXISTS auction_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL REFERENCES profiles(telegram_id),
  item_id text NOT NULL,
  quantity integer DEFAULT 1,
  starting_price integer NOT NULL,
  current_price integer NOT NULL,
  buyout_price integer,
  status text DEFAULT 'active', -- active, sold, cancelled, expired
  created_at timestamp DEFAULT now(),
  expires_at timestamp NOT NULL,
  ended_at timestamp,
  CHECK (quantity > 0),
  CHECK (starting_price > 0),
  CHECK (buyout_price IS NULL OR buyout_price > starting_price)
);

-- Таблиця для ставок на аукціоні
CREATE TABLE IF NOT EXISTS auction_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES auction_listings(id) ON DELETE CASCADE,
  bidder_id text NOT NULL REFERENCES profiles(telegram_id),
  bid_amount integer NOT NULL,
  created_at timestamp DEFAULT now(),
  CHECK (bid_amount > 0)
);

-- Індекси
CREATE INDEX IF NOT EXISTS idx_trades_initiator ON trades(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trades_partner ON trades(partner_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_expires ON trades(expires_at);
CREATE INDEX IF NOT EXISTS idx_trade_offers_trade ON trade_offers(trade_id);
CREATE INDEX IF NOT EXISTS idx_auction_listings_seller ON auction_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_auction_listings_status ON auction_listings(status);
CREATE INDEX IF NOT EXISTS idx_auction_listings_expires ON auction_listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_auction_bids_listing ON auction_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_id);

-- RLS політики для trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their trades"
  ON trades FOR SELECT
  USING (
    initiator_id = current_setting('app.telegram_id', true) OR
    partner_id = current_setting('app.telegram_id', true)
  );

CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (initiator_id = current_setting('app.telegram_id', true));

CREATE POLICY "Trade participants can update trades"
  ON trades FOR UPDATE
  USING (
    initiator_id = current_setting('app.telegram_id', true) OR
    partner_id = current_setting('app.telegram_id', true)
  );

-- RLS політики для trade_offers
ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trade offers"
  ON trade_offers FOR SELECT
  USING (
    trade_id IN (
      SELECT id FROM trades 
      WHERE initiator_id = current_setting('app.telegram_id', true) 
         OR partner_id = current_setting('app.telegram_id', true)
    )
  );

CREATE POLICY "Users can add their offers"
  ON trade_offers FOR INSERT
  WITH CHECK (owner_id = current_setting('app.telegram_id', true));

CREATE POLICY "Users can update their offers"
  ON trade_offers FOR UPDATE
  USING (owner_id = current_setting('app.telegram_id', true));

CREATE POLICY "Users can delete their offers"
  ON trade_offers FOR DELETE
  USING (owner_id = current_setting('app.telegram_id', true));

-- RLS політики для auction_listings
ALTER TABLE auction_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auction listings are viewable by everyone"
  ON auction_listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their listings"
  ON auction_listings FOR INSERT
  WITH CHECK (seller_id = current_setting('app.telegram_id', true));

CREATE POLICY "Sellers can update their listings"
  ON auction_listings FOR UPDATE
  USING (seller_id = current_setting('app.telegram_id', true));

-- RLS політики для auction_bids
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auction bids are viewable by everyone"
  ON auction_bids FOR SELECT
  USING (true);

CREATE POLICY "Users can create bids"
  ON auction_bids FOR INSERT
  WITH CHECK (bidder_id = current_setting('app.telegram_id', true));

-- Функція для автоматичного скасування прострочених обмінів
CREATE OR REPLACE FUNCTION expire_trades()
RETURNS void AS $$
BEGIN
  UPDATE trades
  SET status = 'cancelled'
  WHERE status = 'pending' AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Функція для автоматичного завершення прострочених аукціонів
CREATE OR REPLACE FUNCTION expire_auctions()
RETURNS void AS $$
BEGIN
  -- Завершуємо аукціони зі ставками
  UPDATE auction_listings
  SET 
    status = 'sold',
    ended_at = now()
  WHERE status = 'active' 
    AND expires_at <= now()
    AND id IN (SELECT DISTINCT listing_id FROM auction_bids);

  -- Скасовуємо аукціони без ставок
  UPDATE auction_listings
  SET 
    status = 'expired',
    ended_at = now()
  WHERE status = 'active' 
    AND expires_at <= now()
    AND id NOT IN (SELECT DISTINCT listing_id FROM auction_bids);
END;
$$ LANGUAGE plpgsql;

-- Функція для перевірки валідності ставки
CREATE OR REPLACE FUNCTION validate_bid()
RETURNS TRIGGER AS $$
DECLARE
  current_highest integer;
  listing_status text;
BEGIN
  -- Перевіряємо статус аукціону
  SELECT status, current_price INTO listing_status, current_highest
  FROM auction_listings
  WHERE id = NEW.listing_id;

  IF listing_status != 'active' THEN
    RAISE EXCEPTION 'Auction is not active';
  END IF;

  -- Перевіряємо, що ставка вища за поточну
  IF NEW.bid_amount <= current_highest THEN
    RAISE EXCEPTION 'Bid must be higher than current price';
  END IF;

  -- Оновлюємо поточну ціну аукціону
  UPDATE auction_listings
  SET current_price = NEW.bid_amount
  WHERE id = NEW.listing_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для валідації ставок
CREATE TRIGGER validate_bid_trigger
  BEFORE INSERT ON auction_bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid();

