# Coral Acessórios

Plataforma de acessórios femininos premium com catálogo público e painel de gestão interno.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend:** Express 5 + Node.js (API REST)
- **Banco de dados / Auth / Storage:** Supabase
- **Roteamento:** Wouter
- **Tipografia:** Playfair Display + DM Sans

## Estrutura do projeto

```
coral-acessorios/
├── client/            # Frontend React (Vite)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── catalog/
│       │   ├── comercial/
│       │   └── marketing/
│       ├── lib/
│       └── pages/
├── server/            # Backend Express
│   ├── features/catalog/
│   ├── lib/
│   ├── middlewares/
│   ├── routes/
│   └── services/
├── shared/            # Tipos e constantes compartilhados
├── supabase/
│   └── migrations/    # SQL para configurar o banco
├── .env.example       # Template de variáveis de ambiente
├── package.json       # Dependências e scripts
└── vite.config.ts     # Configuração do Vite
```

## Pré-requisitos

- Node.js >= 18
- npm >= 9
- Conta no [Supabase](https://supabase.com) com projeto criado

## Setup

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
CORS_ORIGIN=http://localhost:3000
VITE_WHATSAPP_NUMBER=55XXXXXXXXXXX
```

> As chaves estão em: **Supabase Dashboard → Project Settings → API**

### 2. Configurar o banco de dados

No **Supabase Dashboard → SQL Editor**, execute o arquivo:

```
supabase/migrations/000_completo_coral.sql
```

Este arquivo cria todas as tabelas, políticas RLS, índices e dados de exemplo.

Depois, crie o bucket de storage:
- **Storage → New bucket**
- Nome: `products_coral`
- Marcar como **Public**

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend:  [http://localhost:3001](http://localhost:3001)

### 5. Build de produção

```bash
npm run build
npm start
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia frontend + backend em paralelo |
| `npm run dev:client` | Somente o Vite (frontend) |
| `npm run dev:server` | Somente o servidor Express |
| `npm run build` | Build do frontend para produção |
| `npm start` | Inicia o servidor em modo produção |
| `npm run check` | Verificação de tipos TypeScript |

## Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Home da marca |
| `/catalogo` | Público | Catálogo de produtos |
| `/login` | Público | Login interno |
| `/comercial` | `admin`, `comercial` | Gestão de produtos |
| `/marketing` | `admin`, `marketing` | Ferramentas de divulgação |

## Criar usuário admin

Após criar um usuário no Supabase Auth, execute no SQL Editor:

```sql
UPDATE public.profiles_coral
SET role = 'admin'
WHERE email = 'seu@email.com';
```
