-- 기존 테이블에 새 컬럼 추가 (이미 테이블이 존재하는 경우)
-- 테이블이 새로 생성된 경우 20260310000001에서 이미 포함됨

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blood_supply_daily' AND column_name = 'daily_consumption'
  ) THEN
    ALTER TABLE blood_supply_daily ADD COLUMN daily_consumption integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blood_supply_daily' AND column_name = 'current_holdings'
  ) THEN
    ALTER TABLE blood_supply_daily ADD COLUMN current_holdings integer;
  END IF;
END $$;

-- 뷰 갱신 (새 컬럼 포함)
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
