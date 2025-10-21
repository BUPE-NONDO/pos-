-- Migration: create app_settings table for storing install-specific settings and trial info
-- Run this in your Supabase project's SQL editor or include in migration pipeline

CREATE TABLE IF NOT EXISTS public.app_settings (
  install_id TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.app_settings;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
