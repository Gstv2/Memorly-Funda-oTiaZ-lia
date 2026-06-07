-- Add post type and activity-specific fields to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN post_type text DEFAULT 'noticia',
ADD COLUMN schedule_times text,
ADD COLUMN weekdays text[],
ADD COLUMN min_age integer,
ADD COLUMN max_age integer,
ADD COLUMN available_spots integer,
ADD COLUMN how_to_register text,
ADD COLUMN structured_content jsonb;

-- Add comment to explain post_type values
COMMENT ON COLUMN public.blog_posts.post_type IS 'Types: atividade, evento, noticia, depoimento';