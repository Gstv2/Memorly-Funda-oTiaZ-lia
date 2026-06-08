/*
  ================================================================================
  DATABASE_MASTER.sql - SCRIPT COMPLETO PARA FUNDAÇÃO TIA ZÉLIA
  ================================================================================
  Este script contém toda a estrutura do banco de dados necessária para rodar
  a aplicação do zero ou migrar para um novo projeto Supabase.

  CONTEÚDO:
  - Tipos (Enums): Define cargos (admin/user).
  - Tabelas: Profiles, Roles, Blog, Projetos, Voluntários, Galeria e Configurações.
  - Funções: Lógica de segurança (has_role) e automação (handle_new_user).
  - Triggers: Atualização automática de datas (updated_at) e criação de perfis.
  - RLS (Row Level Security): Políticas de acesso por nível de usuário.
  - Storage: Buckets 'media' e 'avatars' com suas respectivas permissões.
  ================================================================================
*/

-- 1. TIPOS E ENUMS
-- Define as funções permitidas no sistema (Admin tem acesso total, User é o padrão)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS

-- user_roles: Vincula um usuário do Auth a um cargo (role)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- profiles: Dados complementares do usuário (nome, foto) sincronizados com o Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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

-- site_settings: Informações globais (Endereço, Tel, Redes Sociais) controladas pelo Admin
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    address TEXT DEFAULT 'Rua Pires Rebelo, 373, Piripiri, PI, Brasil',
    phone TEXT DEFAULT '(86) 9940-3966',
    contact_email TEXT DEFAULT 'francimary.melo@bol.com.br',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/fundacaotiazelia/?locale=pt_BR',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/ftz.pi/',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT only_one_row CHECK (id = 'config')
);

-- Inserir configuração padrão inicial (ID fixo como 'config')
INSERT INTO public.site_settings (id) VALUES ('config') ON CONFLICT (id) DO NOTHING;

-- 3. FUNÇÕES E SEGURANÇA (SECURITY DEFINER)

-- has_role: Verifica se um usuário possui determinado cargo (usado em políticas RLS)
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

-- handle_new_user: Cria automaticamente um perfil na tabela 'profiles' quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- update_updated_at_column: Atualiza o campo 'updated_at' sempre que uma linha é alterada
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. TRIGGERS

-- Trigger para disparar criação de perfil após cadastro no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para atualização automática de timestamps em diversas tabelas
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

-- 5. ROW LEVEL SECURITY (RLS)
-- Ativa a segurança por linha para garantir que usuários só acessem o que têm permissão

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: user_roles (Visualizar próprio cargo / Admin gerencia tudo)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: profiles (Público vê perfis / Usuário edita apenas o seu)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas: blog_posts (Público vê publicados / Admin gerencia tudo)
CREATE POLICY "Published posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can view all posts" ON public.blog_posts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: projects (Público vê todos / Admin gerencia tudo)
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: volunteers (Público vê todos / Admin gerencia tudo)
CREATE POLICY "Volunteers are viewable by everyone" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Admins can manage volunteers" ON public.volunteers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: gallery_images (Público vê todos / Admin gerencia tudo)
CREATE POLICY "Gallery images are viewable by everyone" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas: site_settings (Público vê todos / Admin gerencia tudo)
CREATE POLICY "Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. STORAGE (BUCKETS E POLÍTICAS)

-- Criar buckets para armazenamento de imagens (Media para blog/galeria, Avatars para usuários)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: Bucket Media (Público vê / Admin gerencia)
CREATE POLICY "Media public access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins manage media" ON storage.objects FOR ALL USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- Políticas de Storage: Bucket Avatars (Público vê / Usuário gerencia sua pasta / Admin total)
CREATE POLICY "Avatars public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users manage own avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins manage all avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

-- 7. DADOS INICIAIS (OPCIONAL)
-- Exemplos de voluntários iniciais para popular o site
INSERT INTO public.volunteers (name, role, is_active) VALUES
('Beatriz Lima', 'Voluntária', true),
('Pedro Costa', 'Coordenador', true);
