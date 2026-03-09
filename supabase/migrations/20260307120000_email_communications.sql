-- Email Communications Tables
-- For the Communications page in stepwise-admin

-- Email Templates (reusable templates for manual sending)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to email_templates"
  ON public.email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Email Settings (branding, signature, etc.)
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to email_settings"
  ON public.email_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO public.email_settings (setting_key, setting_value) VALUES
('from_name', 'StepWise'),
('from_email', 'hello@stepwise.education'),
('logo_url', 'https://stepwise.education/logo.svg'),
('brand_color', '#8B5CF6'),
('signature_html', '<p>Warmly,<br><strong>The StepWise Team</strong><br><a href="https://stepwise.education">stepwise.education</a></p>')
ON CONFLICT (setting_key) DO NOTHING;

-- Sent Emails Log (history of sent emails)
CREATE TABLE IF NOT EXISTS public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  recipient_type TEXT NOT NULL, -- 'individual', 'training', 'pipeline_stage', 'event'
  recipient_filter JSONB DEFAULT '{}',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  recipient_emails TEXT[] DEFAULT '{}',
  sent_by TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' -- 'sent', 'failed', 'partial'
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to sent_emails"
  ON public.sent_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
