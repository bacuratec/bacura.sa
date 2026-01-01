
-- Create status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  status_id INT REFERENCES lookup_values(id),
  old_status_id INT REFERENCES lookup_values(id),
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON status_history FOR SELECT USING (true);
CREATE POLICY "Authenticated insert access" ON status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
