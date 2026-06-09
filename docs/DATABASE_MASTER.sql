/*
  ================================================================================
  DATABASE_MASTER.sql - SCRIPT MASTER UNIFICADO (FUNDAÇÃO TIA ZÉLIA)
  ================================================================================
  Este script unifica a base original com as migrações mais recentes de 
  configurações dinâmicas e linha do tempo histórica.
  ================================================================================
*/

-- ==========================================
-- 1. TIPOS, ENUMS E ESTRUTURAS BÁSICAS
-- ==========================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. CRIAÇÃO DE TABELAS REVISADAS
-- ==========================================

-- user_roles: Vincula um usuário do Auth a um cargo (role)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- profiles: Dados complementares do usuário sincronizados com o Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- site_settings: Informações globais (Endereço, Redes, Missão e Estatísticas)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    address TEXT DEFAULT 'Rua Pires Rebelo, 373, Piripiri, PI, Brasil',
    phone TEXT DEFAULT '(86) 9940-3966',
    contact_email TEXT DEFAULT 'francimary.melo@bol.com.br',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/fundacaotiazelia/?locale=pt_BR',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/ftz.pi/',
    mission TEXT DEFAULT 'Promover a inclusão social e o desenvolvimento integral de crianças, jovens e adultos através da cultura, educação e esporte.',
    vision TEXT DEFAULT 'Ser referência em transformação social, reconhecida pela excelência de nossos projetos e pelo impacto positivo na comunidade.',
    values TEXT DEFAULT 'Solidariedade, respeito, compromisso social, valorização da cultura brasileira e desenvolvimento da cidadania.',
    history_image TEXT,
    home_hero_image TEXT,
    home_mission_text TEXT DEFAULT 'A Fundação Tia Zélia é uma instituição sem fins lucrativos comprometida em promover a inclusão social, preservar a cultura brasileira e desenvolver cidadãos através do esporte e da educação. Acreditamos que cada vida transformada é uma vitória para toda a comunidade.',
    manual_stats_lives_transformed TEXT DEFAULT '5.000+',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT only_one_row CHECK (id = 'config')
);

-- blog_posts: Notícias, Eventos e Atividades da fundação
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    location TEXT DEFAULT 'Rua Pires Rebelo, 373, Piripiri–PI',
    post_type TEXT DEFAULT 'noticia',
    schedule_times TEXT,
    weekdays TEXT[],
    min_age INTEGER,
    max_age INTEGER,
    available_spots INTEGER,
    how_to_register TEXT,
    structured_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.blog_posts.post_type IS 'Types: atividade, evento, noticia, depoimento';

-- projects: Projetos sociais e culturais permanentes
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    cover_image TEXT,
    category TEXT DEFAULT 'social',
    is_active BOOLEAN DEFAULT true,
    impact_phrase TEXT,
    target_audience TEXT,
    location TEXT,
    objective TEXT,
    schedule TEXT,
    about_content TEXT,
    how_it_works TEXT,
    social_impact TEXT,
    activities TEXT,
    gallery_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- volunteers: Equipe e voluntários ativos da fundação
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    photo_url TEXT,
    contact TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- gallery_images: Fotos da galeria histórica e atual
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'geral',
    year INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- timeline_events: Linha do tempo e conquistas históricas
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Heart',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. FUNÇÕES DE SEGURANÇA E INFRAESTRUTURA
-- ==========================================

-- has_role: Verifica se um usuário possui determinado cargo
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
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

-- handle_new_user: Cria o perfil atrelado logo após a inscrição no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- update_updated_at_column: Modificador dinâmico de datas de alteração
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==========================================
-- 4. MAPEAMENTO DE TRIGGERS
-- ==========================================

-- Trigger de Registro de Usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers de Modificação de Conteúdo
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON public.volunteers;
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON public.volunteers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_events_updated_at ON public.timeline_events;
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) & POLÍTICAS
-- ==========================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Políticas: user_roles (Resolvido erro de Recursão Infinita)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (
  (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' 
  OR public.has_role(auth.uid(), 'admin')
);

-- Políticas: profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System or user can insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Políticas: blog_posts
CREATE POLICY "Published posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts" ON public.blog_posts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: projects
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: volunteers
CREATE POLICY "Volunteers are viewable by everyone" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Admins can manage volunteers" ON public.volunteers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: gallery_images
CREATE POLICY "Gallery images are viewable by everyone" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: site_settings
CREATE POLICY "Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: timeline_events
CREATE POLICY "Timeline events are viewable by everyone" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage timeline events" ON public.timeline_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 6. STORAGE (BUCKETS E REGRAS)
-- ==========================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Armazenamento: Bucket Media
CREATE POLICY "Media public access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins manage media" ON storage.objects FOR ALL USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Políticas de Armazenamento: Bucket Avatars
CREATE POLICY "Avatars public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users manage own avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins manage all avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 7. POPULAÇÃO INICIAL DE DADOS
-- ==========================================

-- Configuração Base Unificada
INSERT INTO public.site_settings (id) VALUES ('config') ON CONFLICT (id) DO NOTHING;

-- Voluntários sementes
INSERT INTO public.volunteers (name, role, is_active) VALUES
('Beatriz Lima', 'Voluntária', true),
('Pedro Costa', 'Coordenador', true)
ON CONFLICT DO NOTHING;

-- Linha do Tempo Histórica
INSERT INTO public.timeline_events (year, title, description, icon) VALUES
('2010', 'Fundação da Instituição', 'A Fundação Tia Zélia nasce do sonho de transformar vidas através da cultura e educação.', 'Heart'),
('2012', 'Primeira Roda de Capoeira', 'Início das atividades de capoeira, que se tornaria um dos projetos mais importantes da fundação.', 'Users'),
('2015', 'Reconhecimento Municipal', 'Fundação recebe reconhecimento oficial pelos serviços prestados à comunidade.', 'Award'),
('2018', 'Expansão dos Projetos', 'Ampliação das atividades com novas oficinas educativas e culturais.', 'Users'),
('2020', 'Adaptação à Pandemia', 'Implementação de atividades online e apoio emergencial às famílias durante a pandemia.', 'Heart'),
('2023', 'Nova Sede', 'Inauguração de nova sede com estrutura ampliada para atender mais pessoas.', 'Award'),
('2024', '5.000 Vidas Transformadas', 'Marco histórico: mais de 5 mil pessoas já foram beneficiadas pelos projetos da fundação.', 'Heart')
ON CONFLICT DO NOTHING;
