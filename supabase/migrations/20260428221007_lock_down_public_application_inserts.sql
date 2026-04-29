-- lock_down_public_application_inserts
--
-- Public /apply submissions now go through the submit-application Edge Function,
-- and portal training selection goes through the select-training Edge Function.
-- Browser clients no longer need broad anon/public insert privileges on these
-- sensitive pipeline tables.

DROP POLICY IF EXISTS "Allow public application submit" ON public.applicants;
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications;
