-- Restore participant-owned application access for portal accommodation.
--
-- RLS hardening removed broad authenticated access to applications, but the
-- participant portal still needs a narrow owner path to:
--   * read the signed-in user's application,
--   * auto-create/link an application for a matching applicant record,
--   * update only that user's portal-owned accommodation fields.
--
-- This does not reopen applicants to participant mutation and does not grant
-- cross-user reads/updates.

BEGIN;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS applications_owner_select ON public.applications;
CREATE POLICY applications_owner_select
  ON public.applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS applications_owner_insert ON public.applications;
CREATE POLICY applications_owner_insert
  ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS applications_owner_update ON public.applications;
CREATE POLICY applications_owner_update
  ON public.applications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;
