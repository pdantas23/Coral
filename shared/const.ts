// ─── Autenticação ────────────────────────────────────────────────────────────
export const AUTH_COOKIE_ACCESS  = "access_token";
export const AUTH_COOKIE_REFRESH = "refresh_token";

// ─── Tabelas ─────────────────────────────────────────────────────────────────
export const DB_TABLES = {
  PROFILES: "profiles_forma",
  LEADS:    "leads_forma",
} as const;

// ─── Tipos de evento (sincronizado com dropdown do formulário + CHECK do banco)
export const TIPO_EVENTO_VALUES = ["formatura", "corporativo", "celebracao", "outros"] as const;
export type TipoEvento = (typeof TIPO_EVENTO_VALUES)[number];

// ─── Estágios de lead (sincronizado com ENUM estagio_lead no banco)
export const LEAD_ESTAGIO_VALUES = ["novo", "em_contato", "proposta_enviada", "fechado", "perdido"] as const;
export type LeadEstagio = (typeof LEAD_ESTAGIO_VALUES)[number];

export const LEAD_ESTAGIO_LABELS: Record<LeadEstagio, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  proposta_enviada: "Proposta Enviada",
  fechado: "Fechado",
  perdido: "Perdido",
};

// ─── Lead (shape retornada pelo GET /api/leads) ──────────────────────────────
export type Lead = {
  id:          number;
  nome:        string;
  email:       string;
  telefone:    string;
  tipo_evento: TipoEvento;
  estagio:     LeadEstagio;
  mensagem:    string | null;
  origem:      string | null;
  criado_em:   string;
};
