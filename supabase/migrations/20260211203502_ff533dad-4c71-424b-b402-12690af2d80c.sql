
-- Create retreats table for public-facing application selections
CREATE TABLE public.retreats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  cohort_size_target INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'Draft',
  show_on_application BOOLEAN NOT NULL DEFAULT false,
  capacity_override BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- Public read policy: anyone can see retreats marked for application that are Open
CREATE POLICY "Public can view application-eligible retreats"
ON public.retreats
FOR SELECT
USING (show_on_application = true AND status = 'Open');

-- Admin full access
CREATE POLICY "Admins can read all retreats"
ON public.retreats
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert retreats"
ON public.retreats
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update retreats"
ON public.retreats
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete retreats"
ON public.retreats
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_retreats_updated_at
BEFORE UPDATE ON public.retreats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
