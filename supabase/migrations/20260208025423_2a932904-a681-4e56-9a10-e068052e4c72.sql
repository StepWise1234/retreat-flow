
-- 1. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read user_roles (via security definer function to avoid recursion)
CREATE POLICY "Authenticated users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Auto-assign admin role on signup (since this is an admin-only app)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Drop all permissive RLS policies
DROP POLICY IF EXISTS "Allow all access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow all access to email_settings" ON public.email_settings;
DROP POLICY IF EXISTS "Allow all access to integration_logs" ON public.integration_logs;
DROP POLICY IF EXISTS "Allow all access to message_templates" ON public.message_templates;
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all access to signal_settings" ON public.signal_settings;

-- 5. Create proper RLS policies for each table

-- conversations: authenticated users only
CREATE POLICY "Authenticated users can read conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete conversations"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (true);

-- messages: authenticated users only
CREATE POLICY "Authenticated users can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (true);

-- message_templates: read for authenticated, write for authenticated
CREATE POLICY "Authenticated users can read templates"
  ON public.message_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert templates"
  ON public.message_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON public.message_templates FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete templates"
  ON public.message_templates FOR DELETE
  TO authenticated
  USING (true);

-- email_settings: admin only (contains SMTP credentials)
CREATE POLICY "Admins can read email_settings"
  ON public.email_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email_settings"
  ON public.email_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update email_settings"
  ON public.email_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete email_settings"
  ON public.email_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- signal_settings: admin only (contains API tokens)
CREATE POLICY "Admins can read signal_settings"
  ON public.signal_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert signal_settings"
  ON public.signal_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update signal_settings"
  ON public.signal_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete signal_settings"
  ON public.signal_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- integration_logs: authenticated users only
CREATE POLICY "Authenticated users can read integration_logs"
  ON public.integration_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert integration_logs"
  ON public.integration_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Assign admin role to any existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
