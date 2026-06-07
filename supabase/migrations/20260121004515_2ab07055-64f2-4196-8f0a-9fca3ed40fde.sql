-- Criar tabela de voluntários
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  contact TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Volunteers are viewable by everyone"
ON public.volunteers
FOR SELECT
USING (true);

CREATE POLICY "Admins can create volunteers"
ON public.volunteers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update volunteers"
ON public.volunteers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete volunteers"
ON public.volunteers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_volunteers_updated_at
BEFORE UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.volunteers (name, role, contact, is_active) VALUES
('Maria Santos', 'Educadora', 'maria.santos@email.com', true),
('João Silva', 'Instrutor de Capoeira', 'joao.silva@email.com', true),
('Ana Oliveira', 'Assistente Social', 'ana.oliveira@email.com', true),
('Pedro Costa', 'Coordenador', 'pedro.costa@email.com', false),
('Lucia Ferreira', 'Professora', 'lucia.ferreira@email.com', true),
('Carlos Souza', 'Instrutor Esportivo', 'carlos.souza@email.com', false),
('Beatriz Lima', 'Voluntária', 'beatriz.lima@email.com', true),
('Roberto Alves', 'Artesão', 'roberto.alves@email.com', false);