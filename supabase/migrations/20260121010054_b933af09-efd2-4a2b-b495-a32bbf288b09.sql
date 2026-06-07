-- Add new fields for project details page
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS impact_phrase TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS schedule TEXT,
ADD COLUMN IF NOT EXISTS about_content TEXT,
ADD COLUMN IF NOT EXISTS how_it_works TEXT,
ADD COLUMN IF NOT EXISTS social_impact TEXT,
ADD COLUMN IF NOT EXISTS activities TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Add default values to existing project
UPDATE public.projects 
SET 
  impact_phrase = 'Transformando vidas através da cultura e do movimento',
  target_audience = 'Crianças e adolescentes de 6 a 17 anos',
  location = 'Sede da Fundação Tia Zélia - Comunidade local',
  objective = 'Promover inclusão social através da capoeira',
  schedule = 'Terças e Quintas, das 14h às 17h'
WHERE impact_phrase IS NULL;