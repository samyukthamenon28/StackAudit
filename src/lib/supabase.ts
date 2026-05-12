import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side client (anon key)
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

// Server-side client (service role key, bypasses RLS)
export function getServiceClient() {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || supabaseAnonKey || 'placeholder');
}

// SQL to create tables (run once in Supabase dashboard):
/*
CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  input JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  total_current_spend NUMERIC NOT NULL,
  total_projected_spend NUMERIC NOT NULL,
  total_monthly_savings NUMERIC NOT NULL,
  total_annual_savings NUMERIC NOT NULL,
  ai_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id TEXT REFERENCES audits(id),
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX idx_leads_audit_id ON leads(audit_id);
*/
