-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 001_forma_schema
-- Projeto:   Forma Eventos
-- Autor:     Forma Engenharia
-- Data:      2026-04-16
--
-- NOMES FIXADOS VIA shared/const.ts:
--   DB_TABLES.PROFILES  = 'profiles_forma'
--   DB_TABLES.LEADS     = 'leads_forma'
--
-- INSTRUÇÃO DE AMBIENTE:
--   Os nomes abaixo são os exatos valores lidos de DB_TABLES no código.
--   Não altere sem sincronizar shared/const.ts e server/services/authService.ts.
--
-- REGRA DE USUÁRIOS:
--   NÃO há trigger automático em auth.users.
--   Cada membro da equipe deve ser inserido MANUALMENTE em profiles_forma
--   após o cadastro no Supabase Auth Dashboard.
--   Exemplo de inserção manual ao final deste arquivo.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ENUM DE ROLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Sincronizado com:
--   server/services/authService.ts → AppRole
--   client/src/features/auth/authTypes.ts → AppRole
-- Roles: 'comercial' (acesso ao /dashboard) | 'marketing' (acesso ao /marketing)
-- Sem role 'admin' — controle de acesso é por role específica.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('comercial', 'marketing');
  END IF;
END
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. TABELA: profiles_forma   (DB_TABLES.PROFILES)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Relação direta com auth.users via id (UUID).
-- Inserção: MANUAL, sem trigger.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles_forma (
  id         UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT          NOT NULL,
  role       app_role      NOT NULL DEFAULT 'comercial',
  nome       TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles_forma IS 'Perfis de usuários internos da Forma Eventos. Inserção manual obrigatória após cadastro no Auth.';
COMMENT ON COLUMN profiles_forma.id    IS 'UUID idêntico ao auth.users.id — chave de sincronização.';
COMMENT ON COLUMN profiles_forma.role  IS 'Papel do usuário: comercial | marketing.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABELA: leads_forma   (DB_TABLES.LEADS)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Recebida via POST /api/leads (server/routes/leadsRoutes.ts)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads_forma (
  id          BIGSERIAL     PRIMARY KEY,
  nome        TEXT          NOT NULL,
  email       TEXT          NOT NULL,
  telefone    TEXT          NOT NULL,
  tipo_evento TEXT          NOT NULL,
  mensagem    TEXT,
  origem      TEXT,                       -- Referer HTTP capturado pelo servidor
  criado_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  leads_forma IS 'Captações recebidas pelo formulário /eventos-exclusivos.';
COMMENT ON COLUMN leads_forma.origem IS 'URL de origem (req.headers.referer) — rastreia qual página gerou o lead.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ÍNDICES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Consultas frequentes no dashboard Comercial
CREATE INDEX IF NOT EXISTS idx_leads_forma_criado_em   ON leads_forma (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_leads_forma_email       ON leads_forma (email);
CREATE INDEX IF NOT EXISTS idx_leads_forma_tipo_evento ON leads_forma (tipo_evento);

-- Lookup de perfil por email (login e painel)
CREATE INDEX IF NOT EXISTS idx_profiles_forma_email    ON profiles_forma (email);
CREATE INDEX IF NOT EXISTS idx_profiles_forma_role     ON profiles_forma (role);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── profiles_forma ────────────────────────────────────────────────────────────
ALTER TABLE profiles_forma ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas o próprio perfil
CREATE POLICY "profiles_forma: leitura própria"
  ON profiles_forma FOR SELECT
  USING (auth.uid() = id);

-- Apenas service_role pode inserir/atualizar/deletar (inserção manual via Supabase Dashboard)
-- Nenhuma policy de INSERT/UPDATE/DELETE para authenticated — bloqueia app-level writes
-- (O servidor usa service_role key, que bypassa RLS automaticamente)

-- ── leads_forma ───────────────────────────────────────────────────────────────
ALTER TABLE leads_forma ENABLE ROW LEVEL SECURITY;

-- Qualquer requisição autenticada (server usa service_role — bypassa RLS)
-- Client anon key: sem acesso de leitura — leads são confidenciais
-- Sem policy de SELECT para anon/authenticated → tabela bloqueada para o frontend

-- Inserção via service_role key no servidor (bypass automático de RLS)
-- Não é necessária policy de INSERT para anonymous pois o servidor intermedia.


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. FUNÇÃO updated_at AUTOMÁTICO
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_forma_updated_at ON profiles_forma;
CREATE TRIGGER trg_profiles_forma_updated_at
  BEFORE UPDATE ON profiles_forma
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. GRANT DE ACESSO (service_role já tem permissão total por default)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Garante que authenticated pode ler seu próprio perfil (via RLS acima)
GRANT SELECT ON profiles_forma TO authenticated;

-- anon não acessa nenhuma tabela sensível
REVOKE ALL ON leads_forma    FROM anon;
REVOKE ALL ON profiles_forma FROM anon;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. INSERÇÃO MANUAL DE USUÁRIOS (template — NÃO executar automaticamente)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- PASSO 1: Crie o usuário no Supabase Auth Dashboard (Authentication → Users)
--          ou via supabase.auth.admin.createUser() com a service_role key.
--
-- PASSO 2: Copie o UUID gerado e execute o INSERT abaixo manualmente:
--
-- INSERT INTO profiles_forma (id, email, role, nome)
-- VALUES (
--   '<UUID-DO-SUPABASE-AUTH>',     -- colar o UUID do Auth Dashboard
--   'usuario@formaventos.com.br',
--   'comercial',                   -- 'comercial' | 'marketing'
--   'Nome Completo'
-- );
--
-- NÃO há trigger. NÃO há inserção automática.
-- O role é atribuído de forma deliberada e auditável.
-- ─────────────────────────────────────────────────────────────────────────────
