-- Pipeline Email Automation Settings
-- Allows toggling automated emails for each pipeline stage

CREATE TABLE IF NOT EXISTS public.pipeline_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_stage TEXT NOT NULL UNIQUE, -- e.g., 'applied', 'interview', 'approved', 'enrolled', 'completed'
  email_subject TEXT NOT NULL,
  email_body_html TEXT NOT NULL,
  email_body_text TEXT, -- Plain text fallback
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  delay_hours INTEGER DEFAULT 0, -- Hours to wait before sending (0 = immediate)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_email_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write (admin only in practice via app logic)
CREATE POLICY "Allow all access to pipeline_email_templates"
  ON public.pipeline_email_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default templates (all disabled by default)
INSERT INTO public.pipeline_email_templates (pipeline_stage, email_subject, email_body_html, email_body_text, is_enabled) VALUES
('applied', 'Thank you for applying to StepWise',
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <img src="https://stepwise.education/logo.svg" alt="StepWise" style="height: 40px; margin-bottom: 24px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Thank you for applying!</h1>
  <p style="color: #4a4a4a; line-height: 1.6;">Hi {{first_name}},</p>
  <p style="color: #4a4a4a; line-height: 1.6;">We have received your application for the StepWise training. We will review your application and get back to you soon.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Warm regards,<br>The StepWise Team</p>
</body>
</html>',
'Thank you for applying!

Hi {{first_name}},

We have received your application for the StepWise training. We will review your application and get back to you soon.

Warm regards,
The StepWise Team',
false),

('interview', 'Your StepWise Interview',
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <img src="https://stepwise.education/logo.svg" alt="StepWise" style="height: 40px; margin-bottom: 24px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Time to schedule your interview</h1>
  <p style="color: #4a4a4a; line-height: 1.6;">Hi {{first_name}},</p>
  <p style="color: #4a4a4a; line-height: 1.6;">We loved your application! The next step is to schedule a brief interview so we can get to know you better.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Please use the link in your portal to schedule a time that works for you.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Warm regards,<br>The StepWise Team</p>
</body>
</html>',
'Time to schedule your interview

Hi {{first_name}},

We loved your application! The next step is to schedule a brief interview so we can get to know you better.

Please use the link in your portal to schedule a time that works for you.

Warm regards,
The StepWise Team',
false),

('approved', 'You''re approved for StepWise!',
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <img src="https://stepwise.education/logo.svg" alt="StepWise" style="height: 40px; margin-bottom: 24px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Congratulations! You''re approved!</h1>
  <p style="color: #4a4a4a; line-height: 1.6;">Hi {{first_name}},</p>
  <p style="color: #4a4a4a; line-height: 1.6;">We are thrilled to let you know that you have been approved for the StepWise training program!</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Please log in to your portal to complete your enrollment and choose your accommodation.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Warm regards,<br>The StepWise Team</p>
</body>
</html>',
'Congratulations! You''re approved!

Hi {{first_name}},

We are thrilled to let you know that you have been approved for the StepWise training program!

Please log in to your portal to complete your enrollment and choose your accommodation.

Warm regards,
The StepWise Team',
false),

('enrolled', 'Welcome to StepWise!',
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <img src="https://stepwise.education/logo.svg" alt="StepWise" style="height: 40px; margin-bottom: 24px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Welcome to StepWise!</h1>
  <p style="color: #4a4a4a; line-height: 1.6;">Hi {{first_name}},</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Your enrollment is complete! We are so excited to have you join us.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Your training begins on {{training_date}}. You can access your pre-training course materials in your portal.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Warm regards,<br>The StepWise Team</p>
</body>
</html>',
'Welcome to StepWise!

Hi {{first_name}},

Your enrollment is complete! We are so excited to have you join us.

Your training begins on {{training_date}}. You can access your pre-training course materials in your portal.

Warm regards,
The StepWise Team',
false),

('completed', 'Congratulations on completing your training!',
'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <img src="https://stepwise.education/logo.svg" alt="StepWise" style="height: 40px; margin-bottom: 24px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Congratulations!</h1>
  <p style="color: #4a4a4a; line-height: 1.6;">Hi {{first_name}},</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Congratulations on completing your StepWise training! We are so proud of the work you did.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Stay connected with us for advanced trainings and community events.</p>
  <p style="color: #4a4a4a; line-height: 1.6;">Warm regards,<br>The StepWise Team</p>
</body>
</html>',
'Congratulations!

Hi {{first_name}},

Congratulations on completing your StepWise training! We are so proud of the work you did.

Stay connected with us for advanced trainings and community events.

Warm regards,
The StepWise Team',
false);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pipeline_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pipeline_email_templates_updated_at
  BEFORE UPDATE ON public.pipeline_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_email_templates_updated_at();
