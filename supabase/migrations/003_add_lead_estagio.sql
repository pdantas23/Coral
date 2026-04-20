-- Adiciona coluna de estágio dos leads para rastreamento de pipeline
-- Sincronizado com shared/const.ts → LEAD_ESTAGIO_VALUES

-- Criar tipo ENUM se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estagio_lead') THEN
    CREATE TYPE estagio_lead AS ENUM (
      'novo',
      'em_contato',
      'proposta_enviada',
      'fechado',
      'perdido'
    );
  END IF;
END$$;

-- Adicionar coluna à tabela leads_forma
ALTER TABLE leads_forma
ADD COLUMN IF NOT EXISTS estagio estagio_lead NOT NULL DEFAULT 'novo';

-- Adicionar índice para consultas por estágio
CREATE INDEX IF NOT EXISTS idx_leads_forma_estagio ON leads_forma (estagio);

-- Comentários
COMMENT ON COLUMN leads_forma.estagio IS 'Estágio do lead no pipeline de vendas: novo, em_contato, proposta_enviada, fechado, perdido';
