-- ==============================================================================
-- Noodle Studio – Supabase Row Level Security (RLS) & Policies
-- Tabelle: public.flow_sync
-- ==============================================================================

-- 1. Tabelle erstellen (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.flow_sync (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index für performante Abfragen nach Aktualisierungszeitpunkt
CREATE INDEX IF NOT EXISTS idx_flow_sync_updated_at ON public.flow_sync(updated_at);

-- 2. Row Level Security aktivieren (Zwingend für Multi-Tenant-Isolation)
ALTER TABLE public.flow_sync ENABLE ROW LEVEL SECURITY;

-- 3. Vorhandene Policies für saubere Idempotenz löschen
DROP POLICY IF EXISTS "Users can read own flow_sync data" ON public.flow_sync;
DROP POLICY IF EXISTS "Users can insert own flow_sync data" ON public.flow_sync;
DROP POLICY IF EXISTS "Users can update own flow_sync data" ON public.flow_sync;
DROP POLICY IF EXISTS "Users can delete own flow_sync data" ON public.flow_sync;

-- 4. RLS-Policies: Benutzer dürfen nur exakt ihre eigenen Daten lesen und schreiben
-- SELECT-Policy: Nur Zeilen mit der eigenen authentifizierten auth.uid()
CREATE POLICY "Users can read own flow_sync data"
  ON public.flow_sync
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT-Policy: Neue Datensätze dürfen nur mit der eigenen auth.uid() angelegt werden
CREATE POLICY "Users can insert own flow_sync data"
  ON public.flow_sync
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE-Policy: Aktualisierungen nur für die eigene user_id
CREATE POLICY "Users can update own flow_sync data"
  ON public.flow_sync
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE-Policy: Löschen nur durch den Dateninhaber
CREATE POLICY "Users can delete own flow_sync data"
  ON public.flow_sync
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. Supabase Realtime Authorization (Private Channels)
-- Stellt sicher, dass Broadcast- und Presence-Nachrichten autorisiert sind
-- ==============================================================================
-- Erlaube authentifizierten Nutzern das Abonnieren von Realtime-Channels
-- (Supabase Realtime v2 autorisiert private Channels über die RLS / JWT)
