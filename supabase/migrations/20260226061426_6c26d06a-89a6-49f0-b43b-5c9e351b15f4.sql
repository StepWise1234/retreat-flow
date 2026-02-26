
-- Add pdf_path column to course_videos
ALTER TABLE public.course_videos ADD COLUMN pdf_path text DEFAULT NULL;

-- Create storage bucket for course PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('course-pdfs', 'course-pdfs', true);

-- Allow authenticated users to read course PDFs
CREATE POLICY "Authenticated users can read course PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-pdfs' AND auth.role() = 'authenticated');

-- Allow admins to upload/manage course PDFs
CREATE POLICY "Admins can manage course PDFs"
ON storage.objects FOR ALL
USING (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'course-pdfs' AND public.has_role(auth.uid(), 'admin'));
