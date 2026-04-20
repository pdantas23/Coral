// ─── /marketing — Dashboard Marketing (READ-ONLY, estrutura idêntica a Comercial) ─────
import DropdownCustom from "@/components/ui/DropdownCustom";
import LeadModal from "@/components/ui/LeadModal";
import { useAuth } from "@/features/auth/useAuth";
import type { Lead, LeadEstagio, TipoEvento } from "@shared/const";
import { LEAD_ESTAGIO_LABELS, LEAD_ESTAGIO_VALUES, TIPO_EVENTO_VALUES } from "@shared/const";
import { Eye, MessageCircle, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ─── Design System Forma Eventos — Teal Ação, Purple Identidade ──────────
const COLORS = {
  BG: "#FFFFFF",                    // Fundo branco
  TEAL: "#26C2B9",                  // Cor de ação/hover/destaque
  PURPLE: "#6019D2",                // Cor de texto/títulos
  TEXT_PRIMARY: "#1F2937",          // Cinza escuro para texto
  TEXT_SECONDARY: "rgba(31, 41, 55, 0.70)",
  TEXT_MUTED: "rgba(31, 41, 55, 0.50)",
  BORDER_LIGHT: "#E5E7EB",          // Cinza claro para bordas
  SHADOW: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
};

// ─── Tag colors per tipo_evento ──────────────────────────────────────────────
const TAG_STYLES: Record<TipoEvento, { bg: string; text: string; label: string }> = {
  formatura:   { bg: `rgba(96, 25, 210, 0.08)`, text: "#6019D2", label: "Formatura" },
  corporativo: { bg: `rgba(38, 194, 185, 0.08)`, text: "#26C2B9", label: "Corporativo" },
  celebracao:  { bg: `rgba(217, 119, 6, 0.08)`, text: "#D97706", label: "Celebração" },
  outros:      { bg: `rgba(107, 114, 128, 0.08)`, text: "#6B7280", label: "Outros" },
};

const ESTAGIO_COLORS: Record<LeadEstagio, { bg: string; text: string }> = {
  novo: { bg: `rgba(38, 194, 185, 0.08)`, text: "#26C2B9" },
  em_contato: { bg: `rgba(96, 25, 210, 0.08)`, text: "#6019D2" },
  proposta_enviada: { bg: `rgba(217, 119, 6, 0.08)`, text: "#D97706" },
  fechado: { bg: `rgba(34, 197, 94, 0.08)`, text: "#22C55E" },
  perdido: { bg: `rgba(239, 68, 68, 0.08)`, text: "#EF4444" },
};

function EventTag({ tipo }: { tipo: TipoEvento }) {
  const s = TAG_STYLES[tipo];
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function EstagioTag({ estagio }: { estagio: LeadEstagio }) {
  const s = ESTAGIO_COLORS[estagio];
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {LEAD_ESTAGIO_LABELS[estagio]}
    </span>
  );
}

// ─── Date formatter ──────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Clean phone number for WhatsApp ─────────────────────────────────────────
function cleanPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
}

export default function Marketing() {
  const { profile, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filtros Avançados ─────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<TipoEvento | "todos">("todos");
  const [filterEstagio, setFilterEstagio] = useState<LeadEstagio | "todos">("todos");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterTipo !== "todos") params.append("tipo", filterTipo);
      if (filterEstagio !== "todos") params.append("estagio", filterEstagio);
      if (filterDateStart) params.append("data_inicio", filterDateStart);
      if (filterDateEnd) params.append("data_fim", filterDateEnd);

      const url = `/api/leads${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else {
          setError("Erro ao buscar leads.");
        }
        setLeads([]);
        return;
      }

      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch (err) {
      console.error("Erro ao buscar leads:", err);
      setError("Erro ao buscar leads.");
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterEstagio, filterDateStart, filterDateEnd]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Filtrar por busca global ──────────────────────────────────────────────
  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const leadsToday = filteredLeads.filter(l => l.criado_em.slice(0, 10) === today).length;
  const leadsNovos = filteredLeads.filter(l => l.estagio === "novo").length;
  const leadsEmContato = filteredLeads.filter(l => l.estagio === "em_contato").length;
  const leadsFechados = filteredLeads.filter(l => l.estagio === "fechado").length;
  const leadsPerdidos = filteredLeads.filter(l => l.estagio === "perdido").length;

  const stats = [
    { label: "Leads Totais", value: filteredLeads.length.toString(), color: COLORS.TEAL },
    { label: "Leads Hoje", value: leadsToday.toString(), color: COLORS.TEAL },
    { label: "Novos", value: leadsNovos.toString(), color: "#26C2B9" },
    { label: "Em Contato", value: leadsEmContato.toString(), color: "#A991F7" },
    { label: "Fechados", value: leadsFechados.toString(), color: "#4CAF50" },
    { label: "Perdidos", value: leadsPerdidos.toString(), color: "#F44336" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.BG, color: COLORS.TEXT_PRIMARY }}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header
        className="flex flex-row items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: COLORS.BG, borderColor: COLORS.BORDER_LIGHT }}
      >
        <div>
        </div>

        <div className="text-center">
          <img 
            src="/icon.png" 
            alt="Logo Forma Eventos" 
            className="w-40 h-10 object-contain" 
          />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={logout}
            className="text-xs font-medium px-4 py-2 transition hover:opacity-80 cursor-pointer rounded"
            style={{ backgroundColor: COLORS.TEAL, color: "#FFFFFF", border: "none" }}>
            Sair
          </button>
        </div>
      </header>

      {/* ── CONTEÚDO ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="pt-8 pb-6 border-b border-slate-100 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#3D2880]">
            Painel de Marketing
          </h1>
          <p className="text-slate-500 text-lg">
            Gerencie e analise a performance dos seus leads em tempo real.
          </p>
        </div>

        {/* ── STATS CARDS (Métricas de Funil) ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map(({ label, value, color }) => (
            <div
              key={label}
              className="p-5 flex flex-col gap-2 rounded text-center transition-all cursor-default"
              style={{
                backgroundColor: COLORS.BG,
                border: `1px solid ${COLORS.BORDER_LIGHT}`,
                boxShadow: COLORS.SHADOW,
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COLORS.TEXT_MUTED }}>
                {label}
              </p>
              <p
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'Poppins', sans-serif", color }}
              >
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* ── TABELA DE LEADS ──────────────────────────────────────────────── */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: COLORS.BG, border: `1px solid ${COLORS.BORDER_LIGHT}`, boxShadow: COLORS.SHADOW }}
        >

          {/* ── BARRA DE FILTROS AVANÇADOS ───────────────────────────────── */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4" style={{ color: COLORS.PURPLE }}>
              Filtros Avançados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">

              {/* Busca Global */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLORS.TEXT_MUTED }} />
                <input
                  type="text"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[12px] rounded outline-none transition-colors"
                  style={{
                    backgroundColor: COLORS.BG,
                    border: `1px solid ${COLORS.BORDER_LIGHT}`,
                    color: COLORS.TEXT_PRIMARY,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.TEAL;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.BORDER_LIGHT;
                  }}
                />
              </div>

              {/* Tipo de Evento */}
              <DropdownCustom
                value={filterTipo}
                onChange={(v) => setFilterTipo(v as TipoEvento | "todos")}
                options={[
                  { value: "todos", label: "Todos" },
                  ...TIPO_EVENTO_VALUES.map(tipo => ({
                    value: tipo,
                    label: TAG_STYLES[tipo].label,
                    color: { bg: TAG_STYLES[tipo].bg, text: TAG_STYLES[tipo].text },
                  })),
                ]}
                placeholder="Tipo de evento"
              />

              {/* Estágio do Lead (READ-ONLY para marketing) */}
              <DropdownCustom
                value={filterEstagio}
                onChange={(v) => setFilterEstagio(v as LeadEstagio | "todos")}
                options={[
                  { value: "todos", label: "Todos" },
                  ...LEAD_ESTAGIO_VALUES.map(estagio => ({
                    value: estagio,
                    label: LEAD_ESTAGIO_LABELS[estagio],
                    color: { bg: ESTAGIO_COLORS[estagio].bg, text: ESTAGIO_COLORS[estagio].text },
                  })),
                ]}
                placeholder="Estágio do lead"
              />

              {/* Data Início */}
              <input
                type="date"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                className="w-full px-3 py-2 text-[12px] rounded outline-none transition-colors"
                style={{
                  backgroundColor: COLORS.BG,
                  border: `1px solid ${COLORS.BORDER_LIGHT}`,
                  color: COLORS.TEXT_PRIMARY,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.TEAL;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.BORDER_LIGHT;
                }}
              />

              {/* Data Fim */}
              <input
                type="date"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                className="w-full px-3 py-2 text-[12px] rounded outline-none transition-colors"
                style={{
                  backgroundColor: COLORS.BG,
                  border: `1px solid ${COLORS.BORDER_LIGHT}`,
                  color: COLORS.TEXT_PRIMARY,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.TEAL;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.BORDER_LIGHT;
                }}
              />
            </div>

            {/* Botão Limpar Filtros */}
            {(searchTerm || filterTipo !== "todos" || filterEstagio !== "todos" || filterDateStart || filterDateEnd) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterTipo("todos");
                  setFilterEstagio("todos");
                  setFilterDateStart("");
                  setFilterDateEnd("");
                }}
                className="mt-3 text-xs font-medium px-3 py-1.5 rounded-full transition hover:opacity-80 flex items-center gap-2"
                style={{ backgroundColor: `${COLORS.TEAL}20`, color: COLORS.TEAL, border: `1px solid ${COLORS.BORDER_LIGHT}` }}
              >
                <X className="h-3 w-3" />
                Limpar filtros
              </button>
            )}
          </div>

          {/* ── HEADER TABELA ────────────────────────────────────────────── */}
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              Leads ({filteredLeads.length})
            </h2>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-center py-8" style={{ color: COLORS.TEAL }}>
              {error}
            </p>
          )}

          {/* Loading */}
          {loading && !error && (
            <p className="text-sm text-center py-12 font-light" style={{ color: COLORS.TEXT_MUTED }}>
              Carregando...
            </p>
          )}

          {/* Empty */}
          {!loading && !error && filteredLeads.length === 0 && (
            <p className="text-sm text-center py-12 font-light" style={{ color: COLORS.TEXT_MUTED }}>
              Nenhum lead encontrado com os filtros aplicados.
            </p>
          )}

          {/* Table */}
          {!loading && !error && filteredLeads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.BORDER_LIGHT}` }}>
                    {["Nome", "E-mail", "Telefone", "Tipo", "Estágio", "Data", ""].map(h => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: COLORS.PURPLE }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: `1px solid ${COLORS.BORDER_LIGHT}`,
                      }}
                    >
                      <td className="py-3.5 px-3 font-medium text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                        {lead.nome}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light" style={{ color: COLORS.TEXT_SECONDARY }}>
                        {lead.email}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light whitespace-nowrap" style={{ color: COLORS.TEXT_SECONDARY }}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${cleanPhoneForWhatsApp(lead.telefone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:opacity-70 p-1 rounded"
                            style={{ color: COLORS.TEAL }}
                            title="Enviar mensagem via WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                          <span>{lead.telefone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <EventTag tipo={lead.tipo_evento} />
                      </td>
                      <td className="py-3.5 px-3">
                        <EstagioTag estagio={lead.estagio} />
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light whitespace-nowrap" style={{ color: COLORS.TEXT_MUTED }}>
                        {fmtDate(lead.criado_em)}
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded transition hover:opacity-70"
                          style={{ backgroundColor: `${COLORS.TEAL}15`, color: COLORS.TEAL }}
                          title="Visualizar detalhes do lead"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes do Lead */}
      <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
