-- Migration to update site_settings and add timeline_events

-- 1. Update site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS mission TEXT DEFAULT 'Promover a inclusão social e o desenvolvimento integral de crianças, jovens e adultos através da cultura, educação e esporte.',
ADD COLUMN IF NOT EXISTS vision TEXT DEFAULT 'Ser referência em transformação social, reconhecida pela excelência de nossos projetos e pelo impacto positivo na comunidade.',
ADD COLUMN IF NOT EXISTS values TEXT DEFAULT 'Solidariedade, respeito, compromisso social, valorização da cultura brasileira e desenvolvimento da cidadania.',
ADD COLUMN IF NOT EXISTS history_image TEXT,
ADD COLUMN IF NOT EXISTS home_hero_image TEXT,
ADD COLUMN IF NOT EXISTS home_mission_text TEXT DEFAULT 'A Fundação Tia Zélia é uma instituição sem fins lucrativos comprometida em promover a inclusão social, preservar a cultura brasileira e desenvolver cidadãos através do esporte e da educação. Acreditamos que cada vida transformada é uma vitória para toda a comunidade.',
ADD COLUMN IF NOT EXISTS manual_stats_lives_transformed TEXT DEFAULT '5.000+';

-- 2. Create timeline_events table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Heart',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Add RLS for timeline_events
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Timeline events are viewable by everyone" ON public.timeline_events FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage timeline events" ON public.timeline_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add update trigger for timeline_events
DROP TRIGGER IF EXISTS update_timeline_events_updated_at ON public.timeline_events;
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Insert initial timeline data
INSERT INTO public.timeline_events (year, title, description, icon) VALUES
('2010', 'Fundação da Instituição', 'A Fundação Tia Zélia nasce do sonho de transformar vidas através da cultura e educação.', 'Heart'),
('2012', 'Primeira Roda de Capoeira', 'Início das atividades de capoeira, que se tornaria um dos projetos mais importantes da fundação.', 'Users'),
('2015', 'Reconhecimento Municipal', 'Fundação recebe reconhecimento oficial pelos serviços prestados à comunidade.', 'Award'),
('2018', 'Expansão dos Projetos', 'Ampliação das atividades com novas oficinas educativas e culturais.', 'Users'),
('2020', 'Adaptação à Pandemia', 'Implementação de atividades online e apoio emergencial às famílias durante a pandemia.', 'Heart'),
('2023', 'Nova Sede', 'Inauguração de nova sede com estrutura ampliada para atender mais pessoas.', 'Award'),
('2024', '5.000 Vidas Transformadas', 'Marco histórico: mais de 5 mil pessoas já foram beneficiadas pelos projetos da fundação.', 'Heart')
ON CONFLICT DO NOTHING;
