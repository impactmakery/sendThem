-- WhatsApp Broadcast SaaS — Initial Schema
-- Run this in Supabase SQL Editor

-- Users table (syncs with Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- matches auth.users.id
  email VARCHAR(255) NOT NULL UNIQUE,
  credit_balance INTEGER NOT NULL DEFAULT 0,
  tos_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(80) NOT NULL,
  notes VARCHAR(500),
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  meta_template_id VARCHAR(255),
  meta_template_name VARCHAR(255),
  template_body TEXT,
  template_status VARCHAR(30),
  variable_mapping JSONB,
  rejection_reason TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  valid_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  send_started_at TIMESTAMPTZ,
  send_completed_at TIMESTAMPTZ,
  compliance_declared_at TIMESTAMPTZ,
  file_path VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recipients
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  original_phone VARCHAR(50),
  variables JSONB,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  validation_error VARCHAR(255),
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  was_auto_corrected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipients_campaign_valid
  ON recipients(campaign_id) WHERE is_valid = TRUE AND is_duplicate = FALSE;

-- Message logs
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  recipient_id UUID NOT NULL REFERENCES recipients(id),
  meta_message_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  failure_reason TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_logs_campaign ON message_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_meta_id ON message_logs(meta_message_id);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  campaign_id UUID,
  payment_id UUID,
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(user_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  pack_name VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL,
  amount_ils INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invoice_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user row when someone signs up via Supabase Auth
-- Grants 50 free credits on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credit_balance)
  VALUES (NEW.id, NEW.email, 50);

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'signup_bonus', 50, 50, 'Welcome bonus — 50 free credits');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
