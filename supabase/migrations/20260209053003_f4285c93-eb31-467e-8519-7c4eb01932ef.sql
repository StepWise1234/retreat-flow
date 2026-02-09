
-- Fix overly permissive RLS policies on messages table
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.messages;

CREATE POLICY "Admins can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Fix overly permissive RLS policies on conversations table
DROP POLICY IF EXISTS "Authenticated users can read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can delete conversations" ON public.conversations;

CREATE POLICY "Admins can read conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete conversations"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Fix overly permissive RLS policies on message_templates table
DROP POLICY IF EXISTS "Authenticated users can read templates" ON public.message_templates;
DROP POLICY IF EXISTS "Authenticated users can insert templates" ON public.message_templates;
DROP POLICY IF EXISTS "Authenticated users can update templates" ON public.message_templates;
DROP POLICY IF EXISTS "Authenticated users can delete templates" ON public.message_templates;

CREATE POLICY "Admins can read templates"
  ON public.message_templates FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert templates"
  ON public.message_templates FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates"
  ON public.message_templates FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
  ON public.message_templates FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Fix overly permissive RLS policies on integration_logs table
DROP POLICY IF EXISTS "Authenticated users can read integration_logs" ON public.integration_logs;
DROP POLICY IF EXISTS "Authenticated users can insert integration_logs" ON public.integration_logs;

CREATE POLICY "Admins can read integration_logs"
  ON public.integration_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert integration_logs"
  ON public.integration_logs FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));
