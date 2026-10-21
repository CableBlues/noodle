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
-- 5. Supabase Realtime Authorization (Private Channels & Room Membership)
-- WICHTIG: Diese Policies im Supabase SQL-Editor ausführen ("in Supabase einspielen").
-- Voraussetzungen:
--   - Supabase Realtime aktiviert mit Authorization für private Channels
--   - Tabelle public.room_members zur Speicherung autorisierter Raum-Mitglieder
-- ==============================================================================

-- 5.1 Tabelle für Raum-Mitgliedschaften erstellen
CREATE TABLE IF NOT EXISTS public.room_members (
  room_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'member', etc.
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_user ON public.room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Richtlinien für Raum-Mitgliedschaften
DROP POLICY IF EXISTS "Members can view their room memberships" ON public.room_members;
CREATE POLICY "Members can view their room memberships"
  ON public.room_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join rooms" ON public.room_members;
CREATE POLICY "Users can join rooms"
  ON public.room_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5.2 Sicherheitsfunktion zur Prüfung der Raum-Mitgliedschaft anhand des Realtime-Topics
-- Extrahiert die Raum-ID aus 'room_<room_id>' und prüft, ob auth.uid() Mitglied ist.
CREATE OR REPLACE FUNCTION public.is_room_member(channel_topic TEXT, current_uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  extracted_room_id TEXT;
BEGIN
  IF channel_topic IS NULL OR current_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Prüfe, ob Topic dem Format 'room_<id>' entspricht
  IF channel_topic NOT LIKE 'room_%' THEN
    RETURN FALSE;
  END IF;

  extracted_room_id := substring(channel_topic FROM 6);

  -- Wenn keine Raum-ID nach dem Präfix existiert
  IF extracted_room_id = '' OR extracted_room_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.room_members
    WHERE room_id = extracted_room_id
      AND user_id = current_uid
  );
END;
$$;

-- 5.3 Realtime Message Policies für autorisierte Raum-Mitglieder
DROP POLICY IF EXISTS "Authenticated users can receive room messages" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send room messages" ON realtime.messages;
DROP POLICY IF EXISTS "Room members can receive room messages" ON realtime.messages;
DROP POLICY IF EXISTS "Room members can send room messages" ON realtime.messages;

-- SELECT-Policy: Nur autorisierte Mitglieder des Raumes dürfen Nachrichten empfangen
CREATE POLICY "Room members can receive room messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.is_room_member(topic, auth.uid()));

-- INSERT-Policy: Nur autorisierte Mitglieder des Raumes dürfen Nachrichten senden
CREATE POLICY "Room members can send room messages"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_room_member(topic, auth.uid()));

