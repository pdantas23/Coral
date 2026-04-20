import type { Lead } from "@shared/const";
import { MessageCircle } from "lucide-react";
import { useEffect } from "react";

const COLORS = {
  BG_ULTRA_DARK: "#0B0819",
  BG_DARK: "#1A1127",
  PURPLE: "#3D2880",
  TEAL: "#26C2B9",
  BORDER: "rgba(61, 40, 128, 0.25)",
  BORDER_LIGHT: "rgba(38, 194, 185, 0.15)",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.65)",
  TEXT_MUTED: "rgba(255, 255, 255, 0.35)",
};

const TAG_STYLES = {
  formatura:   { bg: `rgba(61, 40, 128, 0.20)`, text: "#A991F7", label: "Formatura" },
  corporativo: { bg: `rgba(38, 194, 185, 0.15)`, text: "#26C2B9", label: "Corporativo" },
  celebracao:  { bg: `rgba(191, 161, 111, 0.15)`, text: "rgb(191,161,111)", label: "Celebração" },
  outros:      { bg: `rgba(140, 140, 140, 0.12)`, text: "rgba(255,255,255,0.5)", label: "Outros" },
};

const ESTAGIO_COLORS = {
  novo: { bg: `rgba(38, 194, 185, 0.15)`, text: "#26C2B9" },
  em_contato: { bg: `rgba(169, 145, 247, 0.15)`, text: "#A991F7" },
  proposta_enviada: { bg: `rgba(191, 161, 111, 0.15)`, text: "rgb(191,161,111)" },
  fechado: { bg: `rgba(76, 175, 80, 0.15)`, text: "#4CAF50" },
  perdido: { bg: `rgba(244, 67, 54, 0.15)`, text: "#F44336" },
};

function cleanPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} às ${time}`;
}

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadModal({ lead, onClose }: LeadModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!lead) return null;

  const tipoStyle = TAG_STYLES[lead.tipo_evento as keyof typeof TAG_STYLES] || TAG_STYLES.outros;
  const estagioStyle = ESTAGIO_COLORS[lead.estagio as keyof typeof ESTAGIO_COLORS] || ESTAGIO_COLORS.novo;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.60)" }}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-md rounded-xl border overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-[70]"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderColor: COLORS.BORDER,
          boxShadow: `0 0 30px rgba(38, 194, 185, 0.20)`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 border-b"
          style={{ borderColor: COLORS.BORDER }}
        >
          <div className="flex-1">
            <p className="text-xs font-medium tracking-[0.3em] uppercase mb-1" style={{ color: COLORS.TEAL }}>
              Detalhes do Lead
            </p>
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: COLORS.PURPLE }}>
              {lead.nome}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

          {/* Email */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
              E-mail
            </p>
            <p style={{ color: COLORS.PURPLE }}>{lead.email}</p>
          </div>

          {/* Telefone com WhatsApp */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
              Telefone
            </p>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(lead.telefone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition hover:opacity-70"
                style={{ backgroundColor: "green", color: COLORS.TEXT_PRIMARY }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{lead.telefone}</span>
              </a>
            </div>
          </div>

          {/* Tipo de Evento */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
              Tipo de Evento
            </p>
            <span
              className="inline-block px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full"
              style={{ backgroundColor: COLORS.PURPLE, color: "white" }}
            >
              {tipoStyle.label}
            </span>
          </div>

          {/* Estágio */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
              Estágio Atual
            </p>
            <span
              className="inline-block px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full"
              style={{ backgroundColor: estagioStyle.bg, color: estagioStyle.text }}
            >
              {lead.estagio.replace(/_/g, " ")}
            </span>
          </div>

          {/* Data */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
              Data de Registro
            </p>
            <p style={{ color: COLORS.PURPLE, fontSize: "0.9rem" }}>
              {fmtDateTime(lead.criado_em)}
            </p>
          </div>

          {/* Mensagem */}
          {lead.mensagem && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
                Mensagem
              </p>
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: `${COLORS.PURPLE}10`,
                  borderColor: COLORS.BORDER_LIGHT,
                  color: "black",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {lead.mensagem}
              </div>
            </div>
          )}

          {/* Origem */}
          {lead.origem && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: COLORS.TEAL }}>
                Origem
              </p>
              <p
                style={{ color: COLORS.PURPLE, fontSize: "0.85rem", wordBreak: "break-all" }}
              >
                {lead.origem}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex gap-2"
          style={{ borderColor: COLORS.BORDER }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-center font-medium text-xs cursor-pointer"
            style={{ backgroundColor: COLORS.TEAL, color: COLORS.TEXT_PRIMARY, border: `1px solid ${COLORS.BORDER_LIGHT}` }}
          >
            Fechar
          </button>
          <a
            href={`https://wa.me/${cleanPhoneForWhatsApp(lead.telefone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-center font-medium text-xs"
            style={{ backgroundColor: "green", color: COLORS.TEXT_PRIMARY }}
          >
            Enviar WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
