import { useAuth } from "@/features/auth/useAuth";
import { useCallback, useEffect, useState } from "react";
import type { Lead, TipoEvento, LeadEstagio } from "@shared/const";
import { LEAD_ESTAGIO_LABELS, LEAD_ESTAGIO_VALUES, TIPO_EVENTO_VALUES } from "@shared/const";
import { ChevronDown, Search, X } from "lucide-react";

// ─── Design System Forma Eventos ──────────────────────────────────────────────
const COLORS = {
  BG_ULTRA_DARK: "#0B0819",
  BG_DARK: "#1A1127",
  PURPLE: "#3D2880",
  TEAL: "#26C2B9",
  GOLD: "rgb(191, 161, 111)",
  BORDER: "rgba(61, 40, 128, 0.25)",
  BORDER_LIGHT: "rgba(38, 194, 185, 0.15)",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.65)",
  TEXT_MUTED: "rgba(255, 255, 255, 0.35)",
};

// ─── Tag colors per tipo_evento ──────────────────────────────────────────────
const TAG_STYLES: Record<TipoEvento, { bg: string; text: string; label: string }> = {
  formatura:   { bg: `rgba(61, 40, 128, 0.20)`, text: "#A991F7", label: "Formatura" },
  corporativo: { bg: `rgba(38, 194, 185, 0.15)`, text: "#26C2B9", label: "Corporativo" },
  celebracao:  { bg: `rgba(191, 161, 111, 0.15)`, text: "rgb(191,161,111)", label: "Celebração" },
  outros:      { bg: `rgba(140, 140, 140, 0.12)`, text: "rgba(255,255,255,0.5)", label: "Outros" },
};

const ESTAGIO_COLORS: Record<LeadEstagio, { bg: string; text: string }> = {
  novo: { bg: `rgba(38, 194, 185, 0.15)`, text: "#26C2B9" },
  em_contato: { bg: `rgba(169, 145, 247, 0.15)`, text: "#A991F7" },
  proposta_enviada: { bg: `rgba(191, 161, 111, 0.15)`, text: "rgb(191,161,111)" },
  fechado: { bg: `rgba(76, 175, 80, 0.15)`, text: "#4CAF50" },
  perdido: { bg: `rgba(244, 67, 54, 0.15)`, text: "#F44336" },
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

// ─── Estado para Editores Inline ──────────────────────────────────────────────
function EstagioSelect({ 
  value, 
  onChange 
}: { 
  value: LeadEstagio; 
  onChange: (v: LeadEstagio) => void 
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-full transition-all"
        style={{
          backgroundColor: ESTAGIO_COLORS[value].bg,
          color: ESTAGIO_COLORS[value].text,
          border: `1px solid rgba(38, 194, 185, 0.25)`,
        }}
      >
        {LEAD_ESTAGIO_LABELS[value]}
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 w-full rounded-lg shadow-lg z-50 overflow-hidden"
          style={{ backgroundColor: COLORS.BG_DARK, border: `1px solid ${COLORS.BORDER}` }}
        >
          {LEAD_ESTAGIO_VALUES.map(estagio => (
            <button
              key={estagio}
              onClick={() => {
                onChange(estagio);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors hover:opacity-80"
              style={{
                backgroundColor: value === estagio ? `rgba(38, 194, 185, 0.20)` : "transparent",
                color: ESTAGIO_COLORS[estagio].text,
                borderBottom: `1px solid ${COLORS.BORDER}`,
              }}
            >
              {LEAD_ESTAGIO_LABELS[estagio]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comercial() {
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

  // ── Edição Inline ─────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingEstagio, setEditingEstagio] = useState<LeadEstagio | null>(null);

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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch {
      setError("Erro ao carregar leads.");
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterEstagio, filterDateStart, filterDateEnd]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Filtrar por busca global ──────────────────────────────────────────────
  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const leadsToday = filteredLeads.filter(l => l.criado_em.slice(0, 10) === today).length;
  const leadsFechados = filteredLeads.filter(l => l.estagio === "fechado").length;
  const leadsPerdidos = filteredLeads.filter(l => l.estagio === "perdido").length;

  const stats = [
    { label: "Leads hoje", value: leadsToday.toString() },
    { label: "Total de leads", value: filteredLeads.length.toString() },
    { label: "Fechados", value: leadsFechados.toString() },
    { label: "Perdidos", value: leadsPerdidos.toString() },
  ];

  const handleEstagioChange = async (leadId: number, newEstagio: LeadEstagio) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estagio: newEstagio }),
      });
      if (!res.ok) throw new Error();
      
      setLeads(leads.map(l => l.id === leadId ? { ...l, estagio: newEstagio } : l));
      setEditingId(null);
      setEditingEstagio(null);
    } catch {
      setError("Erro ao atualizar estágio.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.BG_ULTRA_DARK, color: COLORS.TEXT_PRIMARY }}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 backdrop-blur-sm"
        style={{ backgroundColor: `${COLORS.BG_DARK}dd`, borderBottom: `1px solid ${COLORS.BORDER}` }}
      >
        <div>
          <p className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: COLORS.TEAL }}>
            Forma Eventos
          </p>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: COLORS.TEXT_PRIMARY }}>
            Gestão de Leads
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-light" style={{ color: COLORS.TEXT_SECONDARY }}>
            {profile?.email}
          </span>
          <button onClick={logout}
            className="text-xs font-medium px-4 py-2 transition hover:opacity-80 cursor-pointer rounded-full"
            style={{ backgroundColor: `${COLORS.TEAL}20`, border: `1px solid ${COLORS.BORDER_LIGHT}`, color: COLORS.TEAL }}>
            Sair
          </button>
        </div>
      </header>

      {/* ── CONTEÚDO ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">

        {/* ── STATS CARDS COM GLOW ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="p-5 flex flex-col gap-1 rounded-lg transition-all hover:shadow-lg cursor-default"
              style={{
                backgroundColor: `${COLORS.PURPLE}15`,
                border: `1px solid ${COLORS.BORDER}`,
                boxShadow: `0 0 20px ${COLORS.TEAL}00`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.TEAL}33`;
                e.currentTarget.style.borderColor = COLORS.BORDER_LIGHT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.TEAL}00`;
                e.currentTarget.style.borderColor = COLORS.BORDER;
              }}
            >
              <p className="text-xs font-light" style={{ color: COLORS.TEXT_SECONDARY }}>
                {label}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "'Poppins', sans-serif", color: COLORS.TEAL }}
              >
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* ── TABELA DE LEADS ──────────────────────────────────────────────── */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: `${COLORS.PURPLE}10`, border: `1px solid ${COLORS.BORDER}` }}
        >

          {/* ── BARRA DE FILTROS AVANÇADOS ───────────────────────────────── */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
              Filtros Avançados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* Busca Global */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: COLORS.TEXT_MUTED }} />
                <input
                  type="text"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[12px] rounded-lg outline-none transition-colors"
                  style={{
                    backgroundColor: `${COLORS.PURPLE}20`,
                    border: `1px solid ${COLORS.BORDER}`,
                    color: COLORS.TEXT_PRIMARY,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.TEAL;
                    e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.TEAL}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Tipo de Evento */}
              <div className="relative">
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value as TipoEvento | "todos")}
                  className="w-full px-3 py-2 text-[12px] rounded-lg outline-none transition-colors appearance-none"
                  style={{
                    backgroundColor: `${COLORS.PURPLE}20`,
                    border: `1px solid ${COLORS.BORDER}`,
                    color: COLORS.TEXT_PRIMARY,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(COLORS.TEXT_MUTED)}' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    paddingRight: "28px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.TEAL;
                    e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.TEAL}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="todos">Todos os eventos</option>
                  <option value="formatura">Formatura</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="celebracao">Celebração</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Estágio do Lead */}
              <div className="relative">
                <select
                  value={filterEstagio}
                  onChange={(e) => setFilterEstagio(e.target.value as LeadEstagio | "todos")}
                  className="w-full px-3 py-2 text-[12px] rounded-lg outline-none transition-colors appearance-none"
                  style={{
                    backgroundColor: `${COLORS.PURPLE}20`,
                    border: `1px solid ${COLORS.BORDER}`,
                    color: COLORS.TEXT_PRIMARY,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(COLORS.TEXT_MUTED)}' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    paddingRight: "28px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.TEAL;
                    e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.TEAL}33`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.BORDER;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="todos">Todos os estágios</option>
                  <option value="novo">Novo</option>
                  <option value="em_contato">Em Contato</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="fechado">Fechado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>

              {/* Data Início */}
              <input
                type="date"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                className="w-full px-3 py-2 text-[12px] rounded-lg outline-none transition-colors"
                style={{
                  backgroundColor: `${COLORS.PURPLE}20`,
                  border: `1px solid ${COLORS.BORDER}`,
                  color: COLORS.TEXT_PRIMARY,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.TEAL;
                  e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.TEAL}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.BORDER;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Data Fim */}
              <input
                type="date"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                className="w-full px-3 py-2 text-[12px] rounded-lg outline-none transition-colors"
                style={{
                  backgroundColor: `${COLORS.PURPLE}20`,
                  border: `1px solid ${COLORS.BORDER}`,
                  color: COLORS.TEXT_PRIMARY,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.TEAL;
                  e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.TEAL}33`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.BORDER;
                  e.currentTarget.style.boxShadow = "none";
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
                  <tr style={{ borderBottom: `1px solid ${COLORS.BORDER}` }}>
                    {["Nome", "E-mail", "Telefone", "Tipo", "Estágio", "Data", ""].map(h => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: COLORS.TEXT_MUTED }}
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
                      className="group"
                      style={{
                        borderBottom: `1px solid ${COLORS.BORDER}`,
                        backgroundColor: editingId === lead.id ? `${COLORS.TEAL}10` : "transparent",
                      }}
                    >
                      <td className="py-3.5 px-3 font-medium text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                        {lead.nome}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light" style={{ color: COLORS.TEXT_SECONDARY }}>
                        {lead.email}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light whitespace-nowrap" style={{ color: COLORS.TEXT_SECONDARY }}>
                        {lead.telefone}
                      </td>
                      <td className="py-3.5 px-3">
                        <EventTag tipo={lead.tipo_evento} />
                      </td>
                      <td className="py-3.5 px-3 w-40">
                        {editingId === lead.id ? (
                          <EstagioSelect
                            value={editingEstagio || lead.estagio}
                            onChange={(v) => setEditingEstagio(v)}
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(lead.id);
                              setEditingEstagio(lead.estagio);
                            }}
                            className="w-full text-left cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <EstagioTag estagio={lead.estagio} />
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-light whitespace-nowrap" style={{ color: COLORS.TEXT_MUTED }}>
                        <span>{fmtDate(lead.criado_em)}</span>
                        <span className="ml-2 opacity-60">{fmtTime(lead.criado_em)}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        {editingId === lead.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (editingEstagio && editingEstagio !== lead.estagio) {
                                  handleEstagioChange(lead.id, editingEstagio);
                                } else {
                                  setEditingId(null);
                                }
                              }}
                              className="text-[10px] font-medium px-2 py-1 rounded transition hover:opacity-80"
                              style={{ backgroundColor: `${COLORS.TEAL}30`, color: COLORS.TEAL }}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-[10px] font-medium px-2 py-1 rounded transition hover:opacity-80"
                              style={{ backgroundColor: `rgba(244,67,54,0.20)`, color: "#F44336" }}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
