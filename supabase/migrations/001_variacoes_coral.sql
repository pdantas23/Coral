-- =====================================================================
-- 001_variacoes_coral.sql
-- Variações de produto da Coral + campos de marca/coleção/slug/código.
--
-- Escopo: SOMENTE tabelas *_coral. Não cria nem altera função
-- compartilhada (public.set_updated_at() já existe e já é usada por
-- produtos_coral; aqui só é referenciada num trigger novo).
--
-- Idempotente: pode rodar mais de uma vez sem erro e sem duplicar nada.
-- Padrão de RLS e grants copiado do que está hoje no banco para
-- produtos_coral / produtos_imagens_coral (consultado via pg-meta em
-- 26/10/2026):
--   * RLS ligado;
--   * <tabela>_all_service: ALL para service_role;
--   * leitura pública (roles public);
--   * escrita para quem tem profiles_coral.role = 'comercial';
--   * grants padrão do Supabase (anon/authenticated/service_role).
-- =====================================================================

BEGIN;

-- ─── 1. produtos_coral: campos novos ─────────────────────────────────
ALTER TABLE public.produtos_coral ADD COLUMN IF NOT EXISTS marca             text;
ALTER TABLE public.produtos_coral ADD COLUMN IF NOT EXISTS colecao           text;
ALTER TABLE public.produtos_coral ADD COLUMN IF NOT EXISTS slug              text;
ALTER TABLE public.produtos_coral ADD COLUMN IF NOT EXISTS codigo_fornecedor text;

CREATE UNIQUE INDEX IF NOT EXISTS produtos_coral_slug_key
  ON public.produtos_coral (slug);

CREATE INDEX IF NOT EXISTS produtos_coral_codigo_fornecedor_idx
  ON public.produtos_coral (codigo_fornecedor);

-- ─── 2. produtos_variacoes_coral ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.produtos_variacoes_coral (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id        uuid        NOT NULL
                                REFERENCES public.produtos_coral(id) ON DELETE CASCADE,
  nome              text        NOT NULL CHECK (char_length(btrim(nome)) > 0),
  descricao         text,                       -- NULL = usa a do produto
  preco             numeric     CHECK (preco IS NULL OR preco >= 0), -- NULL = usa o do produto
  codigo_fornecedor text,
  ordem             integer     NOT NULL DEFAULT 0 CHECK (ordem >= 0),
  ativo             boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS produtos_variacoes_coral_produto_idx
  ON public.produtos_variacoes_coral (produto_id, ordem);

-- Mesmo código de fornecedor não se repete dentro do mesmo produto
-- (é a chave que o script de importação usa para não duplicar).
CREATE UNIQUE INDEX IF NOT EXISTS produtos_variacoes_coral_produto_codigo_key
  ON public.produtos_variacoes_coral (produto_id, codigo_fornecedor)
  WHERE codigo_fornecedor IS NOT NULL;

DROP TRIGGER IF EXISTS produtos_variacoes_coral_updated_at ON public.produtos_variacoes_coral;
CREATE TRIGGER produtos_variacoes_coral_updated_at
  BEFORE UPDATE ON public.produtos_variacoes_coral
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ─── 3. Imagens por variação: coluna em produtos_imagens_coral ───────
-- variacao_id NULL  = imagem do produto (comportamento de hoje);
-- variacao_id <id>  = imagem daquela variação.
ALTER TABLE public.produtos_imagens_coral
  ADD COLUMN IF NOT EXISTS variacao_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'produtos_imagens_coral_variacao_id_fkey'
      AND conrelid = 'public.produtos_imagens_coral'::regclass
  ) THEN
    ALTER TABLE public.produtos_imagens_coral
      ADD CONSTRAINT produtos_imagens_coral_variacao_id_fkey
      FOREIGN KEY (variacao_id)
      REFERENCES public.produtos_variacoes_coral(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS produtos_imagens_coral_variacao_idx
  ON public.produtos_imagens_coral (variacao_id, ordem);

-- ─── 4. RLS de produtos_variacoes_coral (mesmo padrão de produtos_coral) ─
ALTER TABLE public.produtos_variacoes_coral ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prod_vars_coral_all_service" ON public.produtos_variacoes_coral;
CREATE POLICY "prod_vars_coral_all_service"
  ON public.produtos_variacoes_coral
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "prod_vars_coral_select_public" ON public.produtos_variacoes_coral;
CREATE POLICY "prod_vars_coral_select_public"
  ON public.produtos_variacoes_coral
  FOR SELECT
  USING (ativo = true);

DROP POLICY IF EXISTS "prod_vars_coral_all_comercial" ON public.produtos_variacoes_coral;
CREATE POLICY "prod_vars_coral_all_comercial"
  ON public.produtos_variacoes_coral
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles_coral p
            WHERE p.id = auth.uid() AND p.role = 'comercial')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles_coral p
            WHERE p.id = auth.uid() AND p.role = 'comercial')
  );

-- ─── 5. Grants (iguais aos de produtos_coral hoje; a proteção é a RLS) ─
GRANT ALL ON TABLE public.produtos_variacoes_coral TO anon, authenticated, service_role;

COMMIT;

-- ─── Conferência (só leitura, rodar depois) ──────────────────────────
-- SELECT column_name FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='produtos_coral'
--    AND column_name IN ('marca','colecao','slug','codigo_fornecedor');
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE tablename = 'produtos_variacoes_coral';
-- SELECT conname FROM pg_constraint
--  WHERE conname = 'produtos_imagens_coral_variacao_id_fkey';
