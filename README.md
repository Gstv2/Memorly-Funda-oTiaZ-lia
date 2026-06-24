# Fundação Tia Zélia - Portal Institucional

Este é o repositório do portal institucional da Fundação Tia Zélia, uma aplicação web moderna para gestão de projetos sociais, culturais e educativos.

---

## � Tecnologias

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend/BaaS**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Estado/Queries**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 📦 Configuração do Ambiente

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

### Instalação
1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_do_supabase
   VITE_SUPABASE_PROJECT_ID=id_supabase
   ```

### Execução
```bash
npm run dev
```

### Mantendo o Supabase Ativo
Para evitar que o banco de dados gratuito do Supabase entre em modo hibernação, configuramos um **Cron Job no Vercel**:
- O arquivo `vercel.json` define uma tarefa que acessa `/api/health` a cada 6 horas
- A função Edge em `api/health.ts` faz uma consulta leve ao banco de dados para manter a conexão ativa

---

## 📂 Estrutura do Projeto

- `src/components`: Componentes reutilizáveis (UI e Negócio).
- `src/hooks`: Hooks customizados (Autenticação, Mobile detection, etc).
- `src/integrations/supabase`: Configuração do cliente Supabase e tipos gerados.
- `src/pages`: Páginas da aplicação (Públicas e Administrativas).
- `src/lib`: Utilitários e configurações de bibliotecas.
- `supabase/migrations`: Scripts SQL de evolução do banco de dados.

---

## 🛠️ Guia para Desenvolvedores

### Banco de Dados
O projeto utiliza o Supabase. Toda a estrutura está versionada em `supabase/migrations`. Para novos ambientes, execute o script [DATABASE_MASTER.sql](file:///c:/Users/nerys/Documents/Repositorios/ADS/Projectos/Memorly/Memorly-Funda-oTiaZ-lia/supabase/migrations/DATABASE_MASTER.sql).

### Gerenciamento de Tipos
Sempre que houver mudanças no banco de dados, atualize os tipos do TypeScript:
```bash
npx supabase gen types typescript --project-id seu_id_do_projeto > src/integrations/supabase/types.ts
```

### Documentação Técnica Detalhada
Para entender fluxos de sequência, políticas RLS e casos de uso, consulte:
- [FUNCIONALIDADES_E_FLUXOS.md](file:///c:/Users/nerys/Documents/Repositorios/ADS/Projectos/Memorly/Memorly-Funda-oTiaZ-lia/docs/FUNCIONALIDADES_E_FLUXOS.md)

### Manual do Usuário
Para entender como o usuário final opera o sistema, consulte:
- [MANUAL_DO_USUARIO.md](file:///c:/Users/nerys/Documents/Repositorios/ADS/Projectos/Memorly/Memorly-Funda-oTiaZ-lia/MANUAL_DO_USUARIO.md)

---

## 📝 Padrões de Código

- **Componentes**: Utilize componentes do `shadcn/ui` localizados em `src/components/ui`.
- **Estilização**: Priorize classes utilitárias do Tailwind CSS.
- **Acesso a Dados**: Utilize o `supabase` client através do TanStack Query para cache e estado global de dados.
- **Segurança**: Nunca exponha chaves de serviço no frontend. Utilize políticas RLS no banco para proteção.

## Deploy

O projeto está configurado para ser implantado na Vercel ou plataformas similares. Certifique-se de configurar as variáveis de ambiente necessárias (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.) nas configurações da plataforma de deploy.

em caso você novo desenvolvedor queira subir na vercel também você conectará o seu github e na parte de configurações irá subir o arquivo .env e não precisa colocar nenhum comando para build e ou output setting.
