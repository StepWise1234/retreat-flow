
-- ═══ Enums ═══
CREATE TYPE public.message_channel AS ENUM ('Email', 'Signal', 'SMS');
CREATE TYPE public.message_status AS ENUM ('Draft', 'Queued', 'Sent', 'Delivered', 'Failed');

-- ═══ Email Settings (singleton config for Proton Mail Bridge) ═══
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type TEXT NOT NULL DEFAULT 'ProtonBridgeSMTP',
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 1025,
  smtp_username TEXT,
  smtp_password TEXT,
  from_name TEXT,
  from_email TEXT,
  reply_to_email TEXT,
  enable_inbound_sync BOOLEAN NOT NULL DEFAULT false,
  last_tested_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to email_settings" ON public.email_settings FOR ALL USING (true) WITH CHECK (true);

-- ═══ Signal Settings (singleton config for Signal Bridge) ═══
CREATE TABLE public.signal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type TEXT NOT NULL DEFAULT 'SignalBridge',
  signal_sender_id TEXT,
  signal_api_base_url TEXT,
  signal_api_token TEXT,
  enable_delivery_receipts BOOLEAN NOT NULL DEFAULT false,
  last_tested_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.signal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to signal_settings" ON public.signal_settings FOR ALL USING (true) WITH CHECK (true);

-- ═══ Messages (all outbound messages across channels) ═══
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  retreat_id TEXT NOT NULL,
  channel public.message_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  to_address TEXT NOT NULL,
  from_address TEXT,
  template_id TEXT,
  provider_message_id TEXT,
  status public.message_status NOT NULL DEFAULT 'Draft',
  error_message TEXT,
  idempotency_key TEXT UNIQUE,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- ═══ Message Templates (database-backed, per channel) ═══
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stage TEXT,
  channel public.message_channel NOT NULL DEFAULT 'Email',
  subject TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to message_templates" ON public.message_templates FOR ALL USING (true) WITH CHECK (true);

-- ═══ Integration Logs (audit trail for all provider calls) ═══
CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  correlation_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to integration_logs" ON public.integration_logs FOR ALL USING (true) WITH CHECK (true);

-- ═══ Updated_at triggers ═══
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signal_settings_updated_at
  BEFORE UPDATE ON public.signal_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ Indexes ═══
CREATE INDEX idx_messages_registration ON public.messages(registration_id);
CREATE INDEX idx_messages_participant ON public.messages(participant_id);
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_channel ON public.messages(channel);
CREATE INDEX idx_integration_logs_provider ON public.integration_logs(provider);
CREATE INDEX idx_integration_logs_correlation ON public.integration_logs(correlation_id);
CREATE INDEX idx_message_templates_channel ON public.message_templates(channel);
CREATE INDEX idx_message_templates_stage ON public.message_templates(stage);

-- ═══ Seed email settings (singleton) ═══
INSERT INTO public.email_settings (provider_type, from_name, from_email, smtp_host, smtp_port)
VALUES ('ProtonBridgeSMTP', 'Flight School Ops', 'ops@flightschool.example', '127.0.0.1', 1025);

-- ═══ Seed signal settings (singleton) ═══
INSERT INTO public.signal_settings (provider_type, signal_sender_id, signal_api_base_url)
VALUES ('SignalBridge', '+1234567890', 'http://localhost:8080');

-- ═══ Seed message templates ═══
INSERT INTO public.message_templates (name, stage, channel, subject, body) VALUES
  ('Welcome Email', 'Leads', 'Email', 'Welcome to {{retreatName}}!', 'Hi {{fullName}},\n\nThank you for your interest in {{retreatName}}. We''re excited to have you begin the journey!\n\nNext step: Schedule your Chemistry Call.\n\nWarmly,\nFlight School Team'),
  ('Chemistry Call Reminder', 'Chemistry Call', 'Email', 'Your Chemistry Call is coming up', 'Hi {{fullName}},\n\nJust a reminder that your Chemistry Call for {{retreatName}} is scheduled soon. Please check your calendar.\n\nBest,\nFlight School Team'),
  ('Payment Reminder', 'Payment', 'Email', 'Payment due for {{retreatName}}', 'Hi {{fullName}},\n\nYour spot in {{retreatName}} is confirmed! Please complete your payment at your earliest convenience.\n\nPayment link: {{paymentLink}}\n\nThank you!'),
  ('Signal Welcome', 'Leads', 'Signal', NULL, 'Hey {{fullName}}! 👋 Welcome to {{retreatName}}. Ready to schedule your Chemistry Call? Let us know!'),
  ('Signal Nudge', 'Chemistry Call', 'Signal', NULL, 'Hi {{fullName}}, friendly reminder to schedule your Chemistry Call for {{retreatName}}. We''d love to connect! 🗓️'),
  ('Signal Payment Reminder', 'Payment', 'Signal', NULL, '{{fullName}}, your spot in {{retreatName}} is almost secured! Just need your payment to lock it in. 💫');

-- ═══ Seed demo messages ═══
INSERT INTO public.messages (registration_id, participant_id, retreat_id, channel, subject, body, to_address, from_address, status, sent_at) VALUES
  ('reg-1', 'p-1', 'retreat-1', 'Email', 'Welcome to Flight School Retreat', 'Hi there, welcome!', 'alex@example.com', 'ops@flightschool.example', 'Sent', now() - interval '3 days'),
  ('reg-2', 'p-2', 'retreat-1', 'Email', 'Payment Reminder', 'Please complete payment.', 'jordan@example.com', 'ops@flightschool.example', 'Failed', NULL),
  ('reg-3', 'p-3', 'retreat-1', 'Email', 'Chemistry Call Scheduled', 'Your call is confirmed.', 'sam@example.com', 'ops@flightschool.example', 'Draft', NULL),
  ('reg-1', 'p-1', 'retreat-1', 'Signal', NULL, 'Hey! Welcome to the retreat 👋', '+15551234567', '+1234567890', 'Delivered', now() - interval '2 days'),
  ('reg-2', 'p-2', 'retreat-1', 'Signal', NULL, 'Reminder: schedule your Chemistry Call!', '+15559876543', '+1234567890', 'Failed', NULL),
  ('reg-4', 'p-4', 'retreat-1', 'Signal', NULL, 'Your payment is due soon 💫', '+15551112222', '+1234567890', 'Queued', NULL);

-- ═══ Seed integration logs ═══
INSERT INTO public.integration_logs (provider, action, status, error, correlation_id) VALUES
  ('ProtonBridgeSMTP', 'send_email', 'success', NULL, 'corr-001'),
  ('ProtonBridgeSMTP', 'send_email', 'error', 'SMTP connection refused: Bridge not running', 'corr-002'),
  ('SignalBridge', 'send_message', 'success', NULL, 'corr-003'),
  ('SignalBridge', 'send_message', 'error', 'Signal API timeout after 30s', 'corr-004'),
  ('ProtonBridgeSMTP', 'test_connection', 'success', NULL, 'corr-005');
