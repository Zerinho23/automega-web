ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS internal_notes text NOT NULL DEFAULT '';
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS assigned_to text NOT NULL DEFAULT '';
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS follow_up_at timestamptz;
CREATE TABLE IF NOT EXISTS request_limits (key text PRIMARY KEY, count int NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS email_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), quote_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE, recipient text NOT NULL, kind text NOT NULL, status text NOT NULL DEFAULT 'pending', created_at timestamptz DEFAULT now(), UNIQUE(quote_id,kind));
