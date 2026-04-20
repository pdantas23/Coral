-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 002_leads_tipo_check
-- Projeto:   Forma Eventos
-- Data:      2026-04-18
--
-- Adiciona CHECK constraint ao campo tipo_evento da tabela leads_forma
-- para garantir que apenas valores válidos sejam aceitos.
-- Valores: formatura, corporativo, celebracao, outros
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE leads_forma
  ADD CONSTRAINT chk_leads_tipo_evento
  CHECK (tipo_evento IN ('formatura', 'corporativo', 'celebracao', 'outros'));

-- Permite que authenticated (dashboard) leia leads via service_role proxy
-- O middleware requireAuth garante que apenas comercial/marketing acessam
CREATE POLICY "leads_forma: leitura autenticada"
  ON leads_forma FOR SELECT TO authenticated
  USING (true);

GRANT SELECT ON leads_forma TO authenticated;
