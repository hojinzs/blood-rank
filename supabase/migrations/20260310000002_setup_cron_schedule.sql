-- pg_cron + pg_net 활성화 (Supabase 대시보드에서 Extensions 활성화 필요)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 매일 22:00 UTC (07:00 KST) 스크래핑 Edge Function 호출
-- 주의: <SUPABASE_URL>과 <SERVICE_ROLE_KEY>를 실제 값으로 교체하거나
--       Supabase Vault/DB settings를 사용하세요
SELECT cron.schedule(
  'scrape-blood-data-daily',
  '0 22 * * *',
  $$
  SELECT net.http_get(
    url := 'https://lcighamceobknokhxrsb.supabase.co/functions/v1/scrape-blood-data',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    )
  );
  $$
);
