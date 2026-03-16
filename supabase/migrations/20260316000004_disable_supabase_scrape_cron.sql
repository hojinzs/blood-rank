DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) THEN
    EXECUTE $sql$
      SELECT cron.unschedule(jobid)
      FROM cron.job
      WHERE jobname = 'scrape-blood-data-daily'
    $sql$;
  END IF;
END
$$;
