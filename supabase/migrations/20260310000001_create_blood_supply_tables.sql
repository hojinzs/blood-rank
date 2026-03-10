-- 혈액 보유 현황 일별 스냅샷
CREATE TABLE IF NOT EXISTS blood_supply_daily (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  date              date         NOT NULL,
  scraped_at        timestamptz  NOT NULL,
  blood_type        text         NOT NULL CHECK (blood_type IN ('A','B','O','AB')),
  days              numeric(4,1) NOT NULL,
  daily_consumption integer,
  current_holdings  integer,
  rank              smallint     NOT NULL CHECK (rank BETWEEN 1 AND 4),
  status            text         NOT NULL CHECK (status IN ('good','ok','warning','critical')),
  created_at        timestamptz  DEFAULT now(),

  UNIQUE (date, blood_type)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blood_supply_daily_date ON blood_supply_daily (date DESC);
CREATE INDEX IF NOT EXISTS idx_blood_supply_daily_blood_type ON blood_supply_daily (blood_type);

-- 최신 데이터 + 전일 대비 변화 뷰
CREATE OR REPLACE VIEW blood_supply_latest AS
SELECT
  t.blood_type,
  t.date,
  t.days,
  t.daily_consumption,
  t.current_holdings,
  t.rank,
  t.status,
  t.scraped_at,
  t.days - y.days   AS days_delta,
  t.rank - y.rank   AS rank_delta
FROM blood_supply_daily t
LEFT JOIN blood_supply_daily y
  ON y.blood_type = t.blood_type
  AND y.date = t.date - INTERVAL '1 day'
WHERE t.date = (SELECT MAX(date) FROM blood_supply_daily);

-- RLS 정책
ALTER TABLE blood_supply_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON blood_supply_daily
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert/update" ON blood_supply_daily
  FOR ALL USING (auth.role() = 'service_role');
