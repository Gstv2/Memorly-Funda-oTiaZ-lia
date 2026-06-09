# Fundação Tia Zélia - Documentação de Funcionalidades e Fluxos

## 📋 Índice
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura](#arquitetura)
3. [Páginas Públicas](#páginas-públicas)
4. [Área Administrativa](#área-administrativa)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Banco de Dados](#banco-de-dados)
7. [Fluxos de Sequência](#fluxos-de-sequência)

---

## 1. Visão Geral do Sistema

O site da Fundação Tia Zélia é uma aplicação web institucional desenvolvida em React com as seguintes características:
- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **Roteamento**: React Router DOM
- **Estado**: TanStack React Query

### Informações de Contato
- **Endereço**: Rua Pires Rebelo, 373, Piripiri, PI
- **Telefone**: (86) 9940-3966
- **Email**: francimary.melo@bol.com.br
- **Instagram**: https://www.instagram.com/ftz.pi/
- **Facebook**: https://www.facebook.com/fundacaotiazelia/

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Páginas   │  │ Componentes │  │       Hooks         │  │
│  │   Públicas  │  │     UI      │  │  (useAuth, etc.)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 Área Administrativa                      ││
│  │  Dashboard │ Posts │ Galeria │ Projetos │ Voluntários   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (BACKEND)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │   Auth   │  │ Database │  │ Storage  │  │Edge Functions│  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Páginas Públicas

### 3.1 Página Inicial (/)
**Arquivo**: `src/pages/Home.tsx`

**Funcionalidades**:
- Banner hero dinâmico (configurável no Admin)
- Estatísticas automáticas (Contagem de voluntários e projetos ativos)
- Contador manual de vidas transformadas (configurável no Admin)
- Texto de missão dinâmico
- Cards de eventos/notícias/projetos em destaque
- Posts recentes do blog
- Chamadas para ação (CTA)

---

### 3.2 História (/historia)
**Arquivo**: `src/pages/Historia.tsx`

**Funcionalidades**:
- Apresentação da história da fundação com imagem dinâmica
- Blocos dinâmicos de Missão, Visão e Valores
- Linha do tempo dinâmica carregada do banco de dados
- Informações sobre a fundadora (Tia Zélia)

---

### 3.3 Projetos (/projetos)
**Arquivo**: `src/pages/Projetos.tsx`

**Funcionalidades**:
- Listagem de projetos da fundação
- Filtro por categorias (social, cultural, esportiva)
- Cards clicáveis que levam aos detalhes

**Dados do Banco**: Tabela `projects`

---

### 3.4 Detalhe do Projeto (/projetos/:slug)
**Arquivo**: `src/pages/ProjetoDetalhe.tsx`

**Funcionalidades**:
- Exibição completa do projeto
- Imagem de capa
- Descrição detalhada
- Informações sobre público-alvo, localização, horários
- Galeria de imagens do projeto
- Impacto social

**Parâmetro**: `slug` (identificador único do projeto)

---

### 3.5 Galeria (/galeria)
**Arquivo**: `src/pages/Galeria.tsx`

**Funcionalidades**:
- Grid de imagens organizadas
- Filtro por categoria
- Filtro por ano
- Visualização em modal/lightbox

**Dados do Banco**: Tabela `gallery_images`

---

### 3.6 Blog (/blog)
**Arquivo**: `src/pages/Blog.tsx`

**Funcionalidades**:
- Listagem de posts publicados
- Cards com imagem, título, resumo
- Filtro por tipo de post (atividade, evento, notícia, depoimento)
- Ordenação por data

**Dados do Banco**: Tabela `blog_posts` (where published = true)

---

### 3.7 Detalhe do Blog (/blog/:slug)
**Arquivo**: `src/pages/BlogDetalhe.tsx`

**Funcionalidades**:
- Exibição completa do post
- Imagem de capa
- Conteúdo estruturado
- Informações de atividade (se aplicável):
  - Dias da semana
  - Horários
  - Faixa etária
  - Vagas disponíveis
  - Local
  - Como se inscrever

**Parâmetro**: `slug` (identificador único do post)

---

### 3.8 Contato (/contato)
**Arquivo**: `src/pages/Contato.tsx`

**Funcionalidades**:
- Formulário de contato (nome, email, assunto, mensagem)
- Envio de email via Edge Function
- Exibição de informações de contato
- Links para redes sociais
- Informações de localização

**Edge Function**: `send-contact-email`

---

## 4. Área Administrativa

### 4.1 Autenticação (/auth)
**Arquivo**: `src/pages/Auth.tsx`

**Funcionalidades**:
- Login com email/senha
- Cadastro de novo usuário
- Recuperação de senha

---

### 4.2 Dashboard (/admin)
**Arquivo**: `src/pages/admin/Dashboard.tsx`

**Funcionalidades**:
- Visão geral com estatísticas
- Contador de posts do blog
- Contador de imagens na galeria
- Contador de projetos ativos
- Ações rápidas para criar novo conteúdo

---

### 4.3 Gestão de Posts (/admin/posts)
**Arquivos**: 
- `src/pages/admin/PostsList.tsx`
- `src/pages/admin/PostForm.tsx`

**Funcionalidades**:
- Listagem de todos os posts (publicados e rascunhos)
- Criar novo post
- Editar post existente
- Excluir post
- Publicar/despublicar post

**Campos do formulário**:
- Tipo de post (atividade, evento, notícia, depoimento)
- Título
- Slug (gerado automaticamente)
- Resumo
- Conteúdo (editor estruturado)
- Imagem de capa
- Campos específicos para atividades:
  - Dias da semana
  - Horários
  - Faixa etária (min/max)
  - Vagas disponíveis
  - Local
  - Como se inscrever

---

### 4.4 Gestão de Galeria (/admin/galeria)
**Arquivos**:
- `src/pages/admin/GalleryList.tsx`
- `src/pages/admin/GalleryForm.tsx`

**Funcionalidades**:
- Listagem de imagens
- Upload de nova imagem
- Editar metadados da imagem
- Excluir imagem

**Campos do formulário**:
- Título
- Descrição
- Categoria
- Ano
- URL da imagem

---

### 4.5 Gestão de Projetos (/admin/projetos)
**Arquivos**:
- `src/pages/admin/ProjectsList.tsx`
- `src/pages/admin/ProjectForm.tsx`

**Funcionalidades**:
- Listagem de projetos
- Criar novo projeto
- Editar projeto existente
- Excluir projeto
- Ativar/desativar projeto

**Campos do formulário**:
- Título
- Slug
- Descrição
- Conteúdo detalhado
- Categoria
- Imagem de capa
- Objetivo
- Público-alvo
- Localização
- Horários
- Atividades
- Como funciona
- Impacto social
- Frase de impacto
- Galeria de imagens

---

### 4.6 Gestão de Voluntários (/admin/voluntarios)
**Arquivos**:
- `src/pages/admin/VolunteersList.tsx`
- `src/pages/admin/VolunteerForm.tsx`

**Funcionalidades**:
- Listagem de voluntários
- Cadastrar novo voluntário
- Editar voluntário
- Excluir voluntário
- Ativar/desativar voluntário

**Campos do formulário**:
- Nome
- Função/Cargo
- Foto
- Contato
- Status (ativo/inativo)

---

### 4.7 Configurações Globais (/admin/configuracoes)
**Arquivo**: `src/pages/admin/Settings.tsx`

**Funcionalidades**:
- Gerenciamento centralizado de dados institucionais através de abas.
- **Aba Geral**: Endereço, telefone, e-mail e redes sociais.
- **Aba Institucional**: Edição de Missão, Visão e Valores.
- **Aba Páginas**: Upload de imagens Hero (Home e História) e contador de vidas.
- **Aba Linha do Tempo**: Gerenciador (CRUD) de eventos históricos.

**Tabelas**: `site_settings`, `timeline_events`

---

## 5. Autenticação e Autorização

### 5.1 Hook de Autenticação
**Arquivo**: `src/hooks/useAuth.tsx`

**Funcionalidades**:
- Gerenciamento de sessão do usuário
- Login (signIn)
- Cadastro (signUp)
- Logout (signOut)
- Verificação de papel de administrador (isAdmin)

### 5.2 Proteção de Rotas
**Arquivo**: `src/components/admin/ProtectedRoute.tsx`

**Funcionalidades**:
- Verificação de autenticação
- Verificação de papel de administrador
- Redirecionamento para login se não autenticado
- Exibição de mensagem de acesso negado se não autorizado

### 5.3 Papéis de Usuário
**Tabela**: `user_roles`

**Papéis disponíveis**:
- `admin`: Acesso total à área administrativa
- `user`: Usuário comum (sem acesso admin)

---

## 6. Banco de Dados

### 6.1 Tabelas

#### profiles
```
- id: UUID (PK, referência auth.users)
- email: TEXT
- full_name: TEXT
- avatar_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### user_roles
```
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- role: ENUM ('admin', 'user')
- created_at: TIMESTAMP
```

#### blog_posts
```
- id: UUID (PK)
- title: TEXT
- slug: TEXT (UNIQUE)
- excerpt: TEXT
- content: TEXT
- cover_image: TEXT
- author_id: UUID (FK → profiles)
- published: BOOLEAN
- published_at: TIMESTAMP
- post_type: TEXT ('atividade', 'evento', 'noticia', 'depoimento')
- structured_content: JSONB
- weekdays: TEXT[]
- schedule_times: TEXT
- min_age: INTEGER
- max_age: INTEGER
- available_spots: INTEGER
- location: TEXT
- how_to_register: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### projects
```
- id: UUID (PK)
- title: TEXT
- slug: TEXT (UNIQUE)
- description: TEXT
- content: TEXT
- cover_image: TEXT
- category: TEXT ('social', 'cultural', 'esportiva')
- is_active: BOOLEAN
- objective: TEXT
- target_audience: TEXT
- location: TEXT
- schedule: TEXT
- activities: TEXT
- how_it_works: TEXT
- about_content: TEXT
- social_impact: TEXT
- impact_phrase: TEXT
- gallery_images: TEXT[]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### gallery_images
```
- id: UUID (PK)
- title: TEXT
- description: TEXT
- image_url: TEXT
- category: TEXT
- year: INTEGER
- uploaded_by: UUID (FK → profiles)
- created_at: TIMESTAMP
```

#### volunteers
```
- id: UUID (PK)
- name: TEXT
- role: TEXT
- photo_url: TEXT
- contact: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### site_settings
```
- id: TEXT (PK, default 'config')
- address: TEXT
- phone: TEXT
- contact_email: TEXT
- facebook_url: TEXT
- instagram_url: TEXT
- mission: TEXT (Missão institucional)
- vision: TEXT (Visão institucional)
- values: TEXT (Valores institucionais)
- history_image: TEXT (URL da imagem da página História)
- home_hero_image: TEXT (URL da imagem hero da Home)
- home_mission_text: TEXT (Texto de missão da Home)
- manual_stats_lives_transformed: TEXT (Contador manual de vidas)
- updated_at: TIMESTAMP
```

#### timeline_events
```
- id: UUID (PK)
- year: TEXT
- title: TEXT
- description: TEXT
- icon: TEXT (Heart, Users, Award, Calendar)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 6.2 Políticas RLS (Row Level Security)

Todas as tabelas possuem RLS habilitado:

**Leitura pública**: 
- `projects`, `gallery_images`, `volunteers`, `profiles`, `site_settings`, `timeline_events`
- `blog_posts` (apenas published = true)

**Leitura admin**:
- Todos os `blog_posts` (incluindo rascunhos)

**Escrita (INSERT, UPDATE, DELETE)**:
- Apenas usuários com role = 'admin' (verificado via função `has_role`)

### 6.3 Storage (Armazenamento)

O sistema utiliza o Supabase Storage para gerenciar arquivos de mídia:

- **Bucket `media`**: 
  - Armazena imagens de posts, projetos, galeria e configurações.
  - Estrutura de pastas: `/blog`, `/projects`, `/gallery`, `/settings`, `/volunteers`.
  - Acesso: Leitura pública, escrita apenas para Admins.

- **Bucket `avatars`**:
  - Armazena fotos de perfil dos usuários.
  - Estrutura: `{user_id}/nome-da-imagem.jpg`.
  - Acesso: Leitura pública, usuário pode gerenciar apenas sua própria pasta.

---

## 7. Fluxos de Sequência

### 7.1 Fluxo: Visitante Navega pelo Site

```
VISITANTE                    FRONTEND                    SUPABASE
    │                            │                           │
    │──── Acessa URL ───────────>│                           │
    │                            │                           │
    │                            │──── Query dados ─────────>│
    │                            │                           │
    │                            │<─── Retorna dados ────────│
    │                            │                           │
    │<─── Renderiza página ──────│                           │
    │                            │                           │
```

### 7.2 Fluxo: Visitante Visualiza Projetos

```
VISITANTE                    FRONTEND                    SUPABASE
    │                            │                           │
    │──── Acessa /projetos ─────>│                           │
    │                            │                           │
    │                            │── SELECT * FROM projects ─>│
    │                            │   WHERE is_active = true   │
    │                            │                           │
    │                            │<─── Lista de projetos ────│
    │                            │                           │
    │<─── Exibe cards ───────────│                           │
    │                            │                           │
    │──── Clica em projeto ─────>│                           │
    │                            │                           │
    │                            │── SELECT * FROM projects ─>│
    │                            │   WHERE slug = :slug       │
    │                            │                           │
    │                            │<─── Dados do projeto ─────│
    │                            │                           │
    │<─── Exibe detalhe ─────────│                           │
    │                            │                           │
```

### 7.3 Fluxo: Visitante Envia Mensagem de Contato

```
VISITANTE                    FRONTEND              EDGE FUNCTION           EMAIL
    │                            │                       │                   │
    │── Preenche formulário ────>│                       │                   │
    │                            │                       │                   │
    │── Clica "Enviar" ─────────>│                       │                   │
    │                            │                       │                   │
    │                            │── POST /send-contact ─>│                   │
    │                            │   {nome, email, msg}   │                   │
    │                            │                       │                   │
    │                            │                       │── Envia email ───>│
    │                            │                       │                   │
    │                            │                       │<── Confirmação ───│
    │                            │                       │                   │
    │                            │<── Sucesso ───────────│                   │
    │                            │                       │                   │
    │<── Toast "Enviado!" ───────│                       │                   │
    │                            │                       │                   │
```

### 7.4 Fluxo: Administrador Faz Login

```
ADMIN                        FRONTEND                    SUPABASE AUTH
    │                            │                            │
    │──── Acessa /auth ─────────>│                            │
    │                            │                            │
    │<─── Exibe formulário ──────│                            │
    │                            │                            │
    │──── Email + Senha ────────>│                            │
    │                            │                            │
    │                            │── signInWithPassword ─────>│
    │                            │                            │
    │                            │<─── Session + User ────────│
    │                            │                            │
    │                            │── SELECT FROM user_roles ──>│
    │                            │   WHERE user_id = :id       │
    │                            │                            │
    │                            │<─── role = 'admin' ────────│
    │                            │                            │
    │<─── Redireciona /admin ────│                            │
    │                            │                            │
```

### 7.5 Fluxo: Administrador Cria Post

```
ADMIN                        FRONTEND                    SUPABASE
    │                            │                           │
    │── Acessa /admin/posts/novo>│                           │
    │                            │                           │
    │<── Exibe formulário ───────│                           │
    │                            │                           │
    │── Preenche campos ────────>│                           │
    │── Seleciona tipo ─────────>│                           │
    │── Upload imagem ──────────>│                           │
    │                            │                           │
    │                            │── Upload to Storage ──────>│
    │                            │                           │
    │                            │<── URL da imagem ─────────│
    │                            │                           │
    │── Clica "Salvar" ─────────>│                           │
    │                            │                           │
    │                            │── INSERT INTO blog_posts ─>│
    │                            │                           │
    │                            │<── Confirmação ───────────│
    │                            │                           │
    │<── Toast + Redirect ───────│                           │
    │                            │                           │
```

### 7.6 Fluxo: Administrador Edita Projeto

```
ADMIN                        FRONTEND                    SUPABASE
    │                            │                           │
    │── Acessa /admin/projetos ─>│                           │
    │                            │                           │
    │                            │── SELECT * FROM projects ─>│
    │                            │                           │
    │                            │<── Lista projetos ────────│
    │                            │                           │
    │<── Exibe lista ────────────│                           │
    │                            │                           │
    │── Clica "Editar" ─────────>│                           │
    │                            │                           │
    │                            │── SELECT WHERE id = :id ──>│
    │                            │                           │
    │                            │<── Dados do projeto ──────│
    │                            │                           │
    │<── Formulário preenchido ──│                           │
    │                            │                           │
    │── Altera campos ──────────>│                           │
    │── Clica "Salvar" ─────────>│                           │
    │                            │                           │
    │                            │── UPDATE projects ────────>│
    │                            │   WHERE id = :id           │
    │                            │                           │
    │                            │<── Confirmação ───────────│
    │                            │                           │
    │<── Toast "Atualizado!" ────│                           │
    │                            │                           │
```

### 7.7 Fluxo: Administrador Exclui Item

```
ADMIN                        FRONTEND                    SUPABASE
    │                            │                           │
    │── Clica "Excluir" ────────>│                           │
    │                            │                           │
    │<── Modal confirmação ──────│                           │
    │                            │                           │
    │── Confirma exclusão ──────>│                           │
    │                            │                           │
    │                            │── DELETE FROM tabela ────>│
    │                            │   WHERE id = :id           │
    │                            │                           │
    │                            │<── Confirmação ───────────│
    │                            │                           │
    │<── Toast + Atualiza lista ─│                           │
    │                            │                           │
```

### 7.8 Fluxo: Verificação de Autorização

```
USUÁRIO                      PROTECTED ROUTE              useAuth HOOK
    │                            │                            │
    │── Acessa /admin/* ────────>│                            │
    │                            │                            │
    │                            │── Verifica loading ───────>│
    │                            │                            │
    │                            │<── loading = true ─────────│
    │                            │                            │
    │<── Exibe spinner ──────────│                            │
    │                            │                            │
    │                            │<── loading = false ────────│
    │                            │                            │
    │                            │── Verifica user ──────────>│
    │                            │                            │
    │          [SE user = null]  │                            │
    │<── Redirect /auth ─────────│                            │
    │                            │                            │
    │          [SE user existe]  │                            │
    │                            │── Verifica isAdmin ───────>│
    │                            │                            │
    │          [SE isAdmin = false]                           │
    │<── Exibe "Acesso Negado" ──│                            │
    │                            │                            │
    │          [SE isAdmin = true]                            │
    │<── Renderiza children ─────│                            │
    │                            │                            │
```

---

## 8. Componentes Principais

### 8.1 Layout Público
- `Navbar`: Navegação principal do site
- `Footer`: Rodapé com links rápidos, contato e redes sociais

### 8.2 Layout Administrativo
- `AdminLayout`: Sidebar + área de conteúdo
- `ProtectedRoute`: HOC para proteção de rotas

### 8.3 Componentes de UI (shadcn/ui)
- Button, Card, Input, Textarea
- Dialog, AlertDialog
- Select, Checkbox, RadioGroup
- Table, Tabs
- Toast, Sonner

### 8.4 Componentes Customizados
- `BlogCard`: Card para exibição de posts
- `ProjectCard`: Card para exibição de projetos
- `PostTypeSelector`: Seletor de tipo de post
- `ActivityFields`: Campos específicos para atividades
- `StructuredContentEditor`: Editor de conteúdo estruturado

---

## 9. Edge Functions

### send-contact-email
**Caminho**: `supabase/functions/send-contact-email/index.ts`

**Propósito**: Enviar email quando visitante preenche formulário de contato

**Payload**:
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

---

## 10. Rotas da Aplicação

### Públicas
| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Home | Página inicial |
| `/historia` | Historia | História da fundação |
| `/projetos` | Projetos | Lista de projetos |
| `/projetos/:slug` | ProjetoDetalhe | Detalhe do projeto |
| `/galeria` | Galeria | Galeria de imagens |
| `/blog` | Blog | Lista de posts |
| `/blog/:slug` | BlogDetalhe | Detalhe do post |
| `/contato` | Contato | Página de contato |
| `/auth` | Auth | Login/Cadastro |

### Administrativas (Protegidas)
| Rota | Componente | Descrição |
|------|------------|-----------|
| `/admin` | Dashboard | Painel principal |
| `/admin/posts` | PostsList | Lista de posts |
| `/admin/posts/novo` | PostForm | Criar post |
| `/admin/posts/:id` | PostForm | Editar post |
| `/admin/galeria` | GalleryList | Lista de imagens |
| `/admin/galeria/novo` | GalleryForm | Upload imagem |
| `/admin/galeria/:id` | GalleryForm | Editar imagem |
| `/admin/projetos` | ProjectsList | Lista de projetos |
| `/admin/projetos/novo` | ProjectForm | Criar projeto |
| `/admin/projetos/:id` | ProjectForm | Editar projeto |
| `/admin/voluntarios` | VolunteersList | Lista voluntários |
| `/admin/voluntarios/novo` | VolunteerForm | Cadastrar voluntário |
| `/admin/voluntarios/:id` | VolunteerForm | Editar voluntário |

---

## 11. Casos de Uso

### UC01 - Visualizar Informações Públicas
**Ator**: Visitante
**Pré-condição**: Nenhuma
**Fluxo Principal**:
1. Visitante acessa o site
2. Navega pelas páginas públicas
3. Visualiza informações sobre a fundação

### UC02 - Enviar Mensagem de Contato
**Ator**: Visitante
**Pré-condição**: Nenhuma
**Fluxo Principal**:
1. Visitante acessa página de contato
2. Preenche formulário
3. Clica em enviar
4. Sistema envia email para fundação

### UC03 - Fazer Login
**Ator**: Administrador
**Pré-condição**: Ter conta cadastrada
**Fluxo Principal**:
1. Acessa /auth
2. Informa email e senha
3. Sistema valida credenciais
4. Redireciona para /admin

### UC04 - Gerenciar Posts do Blog
**Ator**: Administrador
**Pré-condição**: Estar autenticado como admin
**Fluxo Principal**:
1. Acessa /admin/posts
2. Visualiza lista de posts
3. Pode criar, editar ou excluir posts

### UC05 - Gerenciar Galeria
**Ator**: Administrador
**Pré-condição**: Estar autenticado como admin
**Fluxo Principal**:
1. Acessa /admin/galeria
2. Visualiza lista de imagens
3. Pode fazer upload, editar ou excluir imagens

### UC06 - Gerenciar Projetos
**Ator**: Administrador
**Pré-condição**: Estar autenticado como admin
**Fluxo Principal**:
1. Acessa /admin/projetos
2. Visualiza lista de projetos
3. Pode criar, editar ou excluir projetos

### UC07 - Gerenciar Voluntários
**Ator**: Administrador
**Pré-condição**: Estar autenticado como admin
**Fluxo Principal**:
1. Acessa /admin/voluntarios
2. Visualiza lista de voluntários
3. Pode cadastrar, editar ou excluir voluntários

---

## 12. Padrões de Desenvolvimento

Para manter a consistência do projeto, siga estes padrões:

### 12.1 Componentes de UI
- Utilize os componentes do **shadcn/ui** localizados em `src/components/ui`.
- Não modifique os componentes base; se precisar de uma variação, utilize as props do `class-variance-authority` (cva).

### 12.2 Consumo de Dados
- Utilize o **TanStack Query (useQuery/useMutation)** para todas as chamadas ao Supabase.
- Evite `useEffect` para carregar dados sempre que possível.
- Centralize as queries no componente de página ou crie hooks customizados se a lógica for complexa.

### 12.3 Estilização
- Utilize apenas **Tailwind CSS**.
- Siga as cores definidas no `tailwind.config.ts` (primary, secondary, accent, warm).
- Utilize o utilitário `cn()` para concatenação condicional de classes.

### 12.4 Tipagem
- Não utilize `any`.
- Utilize os tipos gerados automaticamente em `src/integrations/supabase/types.ts`.
- Se criar interfaces manuais, mantenha-as no topo do arquivo do componente ou em um arquivo `.types.ts` separado.

### 12.5 Formulários
- Utilize **React Hook Form** integrado com **Zod** para validação.
- Padronize as mensagens de erro utilizando os componentes de UI do shadcn.

---

*Documento atualizado em: Junho 2026*
*Versão: 1.1 (Atualizado com Configurações Globais e Timeline)*
