// ─── LeadCapturaSection — Editorial Neutral Lead Capture ─────────────────────
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import FadeInWhenVisible from "./FadeInWhenVisible";

// ─── Palette: neutral editorial ──────────────────────────────────────────────
const SAND       = "#E8E3DC";
const CARD_BG    = "#FDFCFA";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#8A8279";
const GOLD       = "#B49A5E";
const GOLD_FOCUS = "#C5A059";
const BORDER     = "#D9D4CC";
const INPUT_BG   = "#F6F4F0";
const ERROR_TEXT = "#B07A3B";

// ─── Tipo de evento options ──────────────────────────────────────────────────
const TIPO_OPTIONS = [
  { value: "formatura",   label: "Formatura" },
  { value: "corporativo", label: "Corporativo" },
  { value: "celebracao",  label: "Celebração Privada" },
  { value: "outros",      label: "Outros" },
] as const;

// ─── WhatsApp mask ───────────────────────────────────────────────────────────
function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <=  2) return d.length ? `(${d}` : "";
  if (d.length <=  6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
type FormState = {
  nome:     string;
  email:    string;
  whatsapp: string;
  tipo:     string;
  mensagem: string;
};

const EMPTY: FormState = { nome: "", email: "", whatsapp: "", tipo: "", mensagem: "" };

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const e: Errors = {};
  if (!form.nome.trim()) e.nome = "Informe seu nome.";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Informe um e-mail válido.";
  if (form.whatsapp.replace(/\D/g, "").length < 10)
    e.whatsapp = "WhatsApp incompleto.";
  if (!form.tipo) e.tipo = "Selecione o tipo de evento.";
  return e;
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
  optional,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={htmlFor}
          className="font-inter font-medium uppercase tracking-[0.18em]"
          style={{ fontSize: "10px", color: MUTED }}
        >
          {label}
        </label>
        {optional && (
          <span className="font-inter italic" style={{ fontSize: "9px", color: `${MUTED}70` }}>
            opcional
          </span>
        )}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-inter"
            style={{ fontSize: "10px", color: ERROR_TEXT, letterSpacing: "0.03em" }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────
function Dropdown({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = TIPO_OPTIONS.find(o => o.value === value);

  // Close on outside click
  const handleBlurCapture = () => {
    setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) {
        setOpen(false);
        onBlur();
      }
    }, 150);
  };

  return (
    <div ref={ref} className="relative" onBlur={handleBlurCapture}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between text-left transition-all duration-200 outline-none"
        style={{
          backgroundColor: INPUT_BG,
          border: `1px solid ${error ? ERROR_TEXT : open ? GOLD_FOCUS : BORDER}`,
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "13px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          color: selected ? CHARCOAL : "#B0A898",
          boxShadow: open ? `0 0 0 2px ${GOLD_FOCUS}30` : "none",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label ?? "Selecione uma opção"}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          <path d="M4 6L8 10L12 6" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-50 w-full mt-1.5 overflow-hidden"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: "10px",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {TIPO_OPTIONS.map(opt => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                className="cursor-pointer transition-colors duration-150"
                style={{
                  padding: "11px 16px",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: value === opt.value ? 500 : 300,
                  color: value === opt.value ? CHARCOAL : MUTED,
                  backgroundColor: value === opt.value ? `${GOLD}10` : "transparent",
                }}
                onMouseEnter={e => {
                  (e.currentTarget.style.backgroundColor = `${GOLD}12`);
                }}
                onMouseLeave={e => {
                  (e.currentTarget.style.backgroundColor = value === opt.value ? `${GOLD}10` : "transparent");
                }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input style helper ──────────────────────────────────────────────────────
function inputStyle(hasError: boolean, isFocused: boolean) {
  return {
    backgroundColor: INPUT_BG,
    border: `1px solid ${hasError ? ERROR_TEXT : isFocused ? GOLD_FOCUS : BORDER}`,
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300 as const,
    color: CHARCOAL,
    outline: "none",
    boxShadow: isFocused ? `0 0 0 2px ${GOLD_FOCUS}30` : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LeadCapturaSection() {
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [focused, setFocused] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  function setField(key: keyof FormState, value: string) {
    const next = key === "whatsapp" ? maskPhone(value) : value;
    setForm(prev => ({ ...prev, [key]: next }));
    if (touched[key]) {
      const fresh = validate({ ...form, [key]: next });
      setErrors(prev => ({ ...prev, [key]: fresh[key] }));
    }
  }

  function handleBlur(key: keyof FormState) {
    setTouched(prev => ({ ...prev, [key]: true }));
    setFocused(prev => ({ ...prev, [key]: false }));
    const fresh = validate(form);
    setErrors(prev => ({ ...prev, [key]: fresh[key] }));
  }

  function handleFocus(key: keyof FormState) {
    setFocused(prev => ({ ...prev, [key]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      (Object.keys(form) as (keyof FormState)[]).map(k => [k, true])
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome:     form.nome,
          email:    form.email,
          telefone: form.whatsapp,
          tipo:     form.tipo,
          mensagem: form.mensagem || null,
        }),
      });
      if (!res.ok) throw new Error();
      setForm(EMPTY);
      setTouched({});
      setErrors({});
      setFocused({});
      setSuccess(true);
    } catch {
      setApiErr("Algo deu errado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="consultoria"
      className="relative py-24 sm:py-32 px-6 sm:px-8"
      style={{ backgroundColor: SAND }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(180,154,94,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <FadeInWhenVisible y={24} duration={1} className="mb-10 text-center">
          <h2
            className="font-serif leading-[1.08] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: CHARCOAL }}
          >
            Solicite uma{" "}
            <span style={{ color: GOLD }}>Consultoria</span>
          </h2>

          <div
            className="mx-auto mb-4"
            style={{ width: "2rem", height: "1px", backgroundColor: GOLD, opacity: 0.4 }}
          />

          <p
            className="font-inter font-light mx-auto leading-relaxed"
            style={{ fontSize: "13px", color: MUTED, maxWidth: "26rem" }}
          >
            Preencha o formulário para receber um atendimento personalizado da nossa equipe.
          </p>
        </FadeInWhenVisible>

        {/* ── Card ────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 text-center py-16 px-8"
              style={{
                backgroundColor: CARD_BG,
                borderRadius: "16px",
                boxShadow: "0 4px 24px -2px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
                border: `1px solid ${BORDER}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ border: `1.5px solid ${GOLD}50`, backgroundColor: `${GOLD}08` }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M5 11.5L9.5 16L17 7" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3
                  className="font-serif leading-tight mb-2"
                  style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)", color: CHARCOAL }}
                >
                  Solicitação recebida.
                </h3>
                <p className="font-inter font-light" style={{ fontSize: "13px", color: MUTED }}>
                  Nossa equipe entrará em contato em breve.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-6 p-8 sm:p-10"
              style={{
                backgroundColor: CARD_BG,
                borderRadius: "16px",
                boxShadow: "0 4px 24px -2px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
                border: `1px solid ${BORDER}`,
              }}
            >
              {/* Nome */}
              <Field label="Nome Completo" error={errors.nome} htmlFor="lead-nome">
                <input
                  id="lead-nome"
                  type="text"
                  value={form.nome}
                  onChange={e => setField("nome", e.target.value)}
                  onFocus={() => handleFocus("nome")}
                  onBlur={() => handleBlur("nome")}
                  placeholder="Como gostaria de ser chamado"
                  className="w-full placeholder-[#B8B0A4]"
                  style={inputStyle(!!errors.nome, !!focused.nome)}
                />
              </Field>

              {/* Email + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="E-mail" error={errors.email} htmlFor="lead-email">
                  <input
                    id="lead-email"
                    type="email"
                    value={form.email}
                    onChange={e => setField("email", e.target.value)}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    placeholder="seu@email.com"
                    className="w-full placeholder-[#B8B0A4]"
                    style={inputStyle(!!errors.email, !!focused.email)}
                  />
                </Field>

                <Field label="WhatsApp" error={errors.whatsapp} htmlFor="lead-whatsapp">
                  <input
                    id="lead-whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => setField("whatsapp", e.target.value)}
                    onFocus={() => handleFocus("whatsapp")}
                    onBlur={() => handleBlur("whatsapp")}
                    placeholder="(00) 00000-0000"
                    className="w-full placeholder-[#B8B0A4]"
                    style={inputStyle(!!errors.whatsapp, !!focused.whatsapp)}
                  />
                </Field>
              </div>

              {/* Tipo de Evento */}
              <Field label="Tipo de Evento" error={errors.tipo}>
                <Dropdown
                  value={form.tipo}
                  onChange={v => setField("tipo", v)}
                  onBlur={() => handleBlur("tipo")}
                  error={errors.tipo}
                />
              </Field>

              {/* Mensagem */}
              <Field label="Mensagem" optional htmlFor="lead-mensagem">
                <textarea
                  id="lead-mensagem"
                  value={form.mensagem}
                  onChange={e => setField("mensagem", e.target.value)}
                  onFocus={() => handleFocus("mensagem")}
                  onBlur={() => handleBlur("mensagem")}
                  placeholder="Conte-nos sobre o evento que você imagina..."
                  rows={3}
                  className="w-full resize-none placeholder-[#B8B0A4] leading-relaxed"
                  style={inputStyle(false, !!focused.mensagem)}
                />
              </Field>

              {/* API Error */}
              <AnimatePresence>
                {apiErr && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-inter text-center"
                    style={{ fontSize: "12px", color: ERROR_TEXT }}
                  >
                    {apiErr}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  height: "54px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {/* Base layer */}
                <span className="absolute inset-0" style={{ backgroundColor: CHARCOAL }} />

                {/* Hover fill */}
                <span
                  className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ backgroundColor: GOLD }}
                />

                {/* Label */}
                <span
                  className="relative z-10 font-inter font-semibold uppercase tracking-[0.20em] transition-colors duration-400 group-hover:text-[#1A1A1A]"
                  style={{ fontSize: "11px", color: "#FFFFFF" }}
                >
                  {loading ? "Enviando..." : "Solicitar Consultoria"}
                </span>
              </button>

              <p
                className="font-inter font-light text-center"
                style={{ fontSize: "10px", color: `${MUTED}90`, letterSpacing: "0.04em" }}
              >
                Seus dados são tratados com total discrição.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
