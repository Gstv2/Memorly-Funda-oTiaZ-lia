-- Add location field to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN location text DEFAULT 'Rua Pires Rebelo, 373, Piripiri–PI';